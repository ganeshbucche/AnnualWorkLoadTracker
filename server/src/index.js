import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { createMockToken, getMockUserByRole, requireAuth, requireRoles } from './auth.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const workloadQuerySchema = z.object({
  status: z.string().optional(),
  department: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

const dashboardAdmin = {
  totalFaculty: 482,
  totalAnnualWorkload: 18460,
  averageWorkload: 38.3,
  pendingEntries: 29,
  completedEntries: 412,
  departments: [
    { name: 'Computer Science', workload: 1520, faculty: 94 },
    { name: 'Engineering', workload: 1365, faculty: 82 },
    { name: 'Business', workload: 1180, faculty: 63 },
    { name: 'Sciences', workload: 1100, faculty: 60 },
    { name: 'Arts', workload: 980, faculty: 42 },
  ],
};

const workloadRecords = [
  {
    id: 'wr_101',
    facultyName: 'Dr. Aisha Rahman',
    department: 'Computer Science',
    category: 'Teaching',
    hours: 184,
    status: 'Approved',
    target: 180,
    academicYear: '2026-27',
  },
  {
    id: 'wr_102',
    facultyName: 'Prof. Daniel Kim',
    department: 'Engineering',
    category: 'Research',
    hours: 168,
    status: 'In Review',
    target: 170,
    academicYear: '2026-27',
  },
  {
    id: 'wr_103',
    facultyName: 'Dr. Nisha Patel',
    department: 'Business',
    category: 'Administrative',
    hours: 156,
    status: 'Submitted',
    target: 160,
    academicYear: '2026-27',
  },
  {
    id: 'wr_104',
    facultyName: 'Prof. Samuel Okafor',
    department: 'Sciences',
    category: 'Practical / Lab',
    hours: 192,
    status: 'Approved',
    target: 175,
    academicYear: '2026-27',
  },
  {
    id: 'wr_105',
    facultyName: 'Dr. Elena Petrova',
    department: 'Arts',
    category: 'Evaluation',
    hours: 144,
    status: 'Draft',
    target: 150,
    academicYear: '2026-27',
  },
];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'awl-server', timestamp: new Date().toISOString() });
});

app.post('/api/auth/mock-login', (req, res) => {
  const schema = z.object({
    role: z.enum(['ADMIN', 'HOD', 'FACULTY']),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ROLE',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      },
    });
  }

  const user = getMockUserByRole(parsed.data.role);
  if (!user) {
    return res.status(404).json({
      error: { code: 'USER_NOT_FOUND', message: 'No mock user found for provided role' },
    });
  }

  const token = createMockToken(user);

  return res.json({
    token,
    user: { ...user },
    expiresIn: '8h',
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/dashboard/admin', requireAuth, requireRoles('ADMIN', 'HOD'), (_req, res) => {
  res.json(dashboardAdmin);
});

app.get('/api/workloads', requireAuth, (req, res) => {
  try {
    const parsed = workloadQuerySchema.parse(req.query);
    const search = parsed.q?.trim().toLowerCase() ?? '';

    let filtered = workloadRecords.filter((record) => {
      if (req.user.role === 'FACULTY' && record.facultyName !== req.user.fullName) {
        return false;
      }
      if (req.user.role === 'HOD' && record.department !== req.user.department) {
        return false;
      }
      if (parsed.department && record.department !== parsed.department) return false;
      if (parsed.status && record.status !== parsed.status) return false;
      if (search) {
        const haystack = `${record.facultyName} ${record.department} ${record.category}`.toLowerCase();
        return haystack.includes(search);
      }
      return true;
    });

    const start = (parsed.page - 1) * parsed.pageSize;
    const paginated = filtered.slice(start, start + parsed.pageSize);

    res.json({
      items: paginated,
      meta: {
        page: parsed.page,
        pageSize: parsed.pageSize,
        total: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / parsed.pageSize)),
      },
    });
  } catch (error) {
    res.status(400).json({
      error: {
        code: 'INVALID_QUERY',
        message: error instanceof Error ? error.message : 'Query validation failed',
      },
    });
  }
});

app.post('/api/workloads', requireAuth, requireRoles('ADMIN', 'HOD', 'FACULTY'), (req, res) => {
  const schema = z.object({
    facultyName: z.string().min(2),
    department: z.string().min(2),
    category: z.string().min(2),
    hours: z.number().min(0),
    status: z.enum(['Draft', 'Submitted', 'In Review', 'Approved']).default('Draft'),
    target: z.number().min(0),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'INVALID_WORKLOAD',
        message: parsed.error.issues.map((issue) => issue.message).join(', '),
      },
    });
  }

  const created = { id: `wr_${Date.now()}`, ...parsed.data, academicYear: '2026-27' };
  workloadRecords.unshift(created);

  return res.status(201).json({ message: 'Workload created', item: created, actor: req.user });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: {
      code: 'SERVER_ERROR',
      message: 'Unexpected server error',
    },
  });
});

app.listen(port, () => {
  console.log(`AWL server is running on http://localhost:${port}`);
});
