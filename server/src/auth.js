import crypto from 'node:crypto';

export const MOCK_USERS = Object.freeze({
  ADMIN: {
    id: 'user-admin-01',
    fullName: 'Prof. Aisha Rahman',
    firstName: 'Aisha',
    lastName: 'Rahman',
    email: 'admin@college.edu',
    role: 'ADMIN',
    department: 'Academic Affairs',
    designation: 'Academic Affairs Administrator',
  },
  HOD: {
    id: 'user-hod-01',
    fullName: 'Dr. Henri Brooks',
    firstName: 'Henri',
    lastName: 'Brooks',
    email: 'hod.cs@college.edu',
    role: 'HOD',
    department: 'Computer Science',
    designation: 'Head of Department',
  },
  FACULTY: {
    id: 'user-faculty-01',
    fullName: 'Dr. Omar Hassan',
    firstName: 'Omar',
    lastName: 'Hassan',
    email: 'faculty.eng@college.edu',
    role: 'FACULTY',
    department: 'Engineering',
    designation: 'Senior Lecturer',
  },
});

const TOKEN_STORE = new Map();

export function getMockUserByRole(role) {
  const normalized = String(role || '').toUpperCase();
  return MOCK_USERS[normalized] ?? null;
}

export function createMockToken(user) {
  const token = crypto.randomBytes(24).toString('hex');
  TOKEN_STORE.set(token, user);
  return token;
}

export function getUserFromToken(token) {
  return TOKEN_STORE.get(token) ?? null;
}

export function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' },
    });
  }

  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Token is invalid or expired' },
    });
  }

  req.user = user;
  return next();
}

export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `This action requires one of the roles: ${allowedRoles.join(', ')}`,
        },
      });
    }

    return next();
  };
}
