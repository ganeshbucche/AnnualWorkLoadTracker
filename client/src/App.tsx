import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleCheckBig,
  Clock3,
  Download,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type Role = 'admin' | 'hod' | 'faculty'
type View = 'overview' | 'faculty' | 'departments' | 'workload' | 'reports'
type WorkloadStatus = 'Approved' | 'In Review' | 'Submitted' | 'Draft'

type WorkloadRow = {
  id: number
  faculty: string
  department: string
  type: string
  hours: number
  status: WorkloadStatus
  target: number
}

const navItems: Array<{ label: string; icon: typeof LayoutDashboard; view: View }> = [
  { label: 'Overview', icon: LayoutDashboard, view: 'overview' },
  { label: 'Faculty', icon: Users, view: 'faculty' },
  { label: 'Departments', icon: Building2, view: 'departments' },
  { label: 'Workload', icon: BookOpen, view: 'workload' },
  { label: 'Reports', icon: FileText, view: 'reports' },
]

const initialRows: WorkloadRow[] = [
  { id: 1, faculty: 'Dr. Aisha Rahman', department: 'Computer Science', type: 'Teaching', hours: 184, status: 'Approved', target: 180 },
  { id: 2, faculty: 'Prof. Daniel Kim', department: 'Engineering', type: 'Research', hours: 168, status: 'In Review', target: 170 },
  { id: 3, faculty: 'Dr. Nisha Patel', department: 'Business', type: 'Administrative', hours: 156, status: 'Submitted', target: 160 },
  { id: 4, faculty: 'Prof. Samuel Okafor', department: 'Sciences', type: 'Practical / Lab', hours: 192, status: 'Approved', target: 175 },
  { id: 5, faculty: 'Dr. Elena Petrova', department: 'Arts', type: 'Evaluation', hours: 144, status: 'Draft', target: 150 },
  { id: 6, faculty: 'Dr. Omar Hassan', department: 'Engineering', type: 'Teaching', hours: 176, status: 'Approved', target: 170 },
]

const departmentLoad = [
  { name: 'Computer Science', value: 1520 },
  { name: 'Engineering', value: 1365 },
  { name: 'Business', value: 1180 },
  { name: 'Arts', value: 980 },
  { name: 'Sciences', value: 1100 },
  { name: 'Law', value: 760 },
]

const monthlyTrend = [
  { month: 'Jan', value: 120 },
  { month: 'Feb', value: 150 },
  { month: 'Mar', value: 180 },
  { month: 'Apr', value: 165 },
  { month: 'May', value: 210 },
  { month: 'Jun', value: 185 },
  { month: 'Jul', value: 225 },
  { month: 'Aug', value: 240 },
  { month: 'Sep', value: 210 },
  { month: 'Oct', value: 260 },
  { month: 'Nov', value: 230 },
  { month: 'Dec', value: 245 },
]

const notifications = [
  { title: 'Faculty submissions due', detail: '12 records pending in Engineering', time: '20 min ago' },
  { title: 'HOD approvals', detail: '3 department reviews require attention', time: '1 hr ago' },
  { title: 'Annual audit complete', detail: 'Q4 workload review is finalized', time: '2 hrs ago' },
]

const roleConfig = {
  admin: { label: 'Admin', name: 'Prof. Aisha Rahman', department: 'Academic Affairs' },
  hod: { label: 'HOD', name: 'Dr. Henri Brooks', department: 'Computer Science' },
  faculty: { label: 'Faculty', name: 'Dr. Omar Hassan', department: 'Engineering' },
} as const

const statusTone: Record<WorkloadStatus, string> = {
  Approved: 'bg-emerald-100 text-emerald-700',
  'In Review': 'bg-amber-100 text-amber-700',
  Submitted: 'bg-sky-100 text-sky-700',
  Draft: 'bg-slate-200 text-slate-700',
}

function StatCard({
  title,
  value,
  change,
  direction,
  tone,
}: {
  title: string
  value: string
  change: string
  direction: 'up' | 'down'
  tone: 'blue' | 'green' | 'amber' | 'red'
}) {
  const toneClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
          {direction === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>
      </div>
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  )
}

function App() {
  const [selectedRole, setSelectedRole] = useState<Role>('admin')
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [activeView, setActiveView] = useState<View>('overview')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | WorkloadStatus>('All')
  const [rows, setRows] = useState<WorkloadRow[]>(initialRows)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    faculty: '',
    department: 'Computer Science',
    type: 'Teaching',
    hours: '160',
    status: 'Draft' as WorkloadStatus,
    target: '170',
  })

  const visibleRows = useMemo(
    () =>
      rows.filter((row) => {
        const matchesText = `${row.faculty} ${row.department} ${row.type}`.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'All' || row.status === statusFilter
        return matchesText && matchesStatus
      }),
    [rows, search, statusFilter],
  )

  const stats = useMemo(
    () => [
      { title: 'Total Faculty', value: `${visibleRows.length + 476}`, change: '+12.4%', direction: 'up' as const, tone: 'blue' as const },
      {
        title: 'Annual Workload',
        value: `${rows.reduce((sum, row) => sum + row.hours, 0)} hrs`,
        change: '+8.2%',
        direction: 'up' as const,
        tone: 'green' as const,
      },
      {
        title: 'Average Load',
        value: `${(rows.reduce((sum, row) => sum + row.hours, 0) / rows.length).toFixed(1)} hrs`,
        change: '-1.8%',
        direction: 'down' as const,
        tone: 'amber' as const,
      },
      {
        title: 'Pending Entries',
        value: `${rows.filter((row) => row.status !== 'Approved').length}`,
        change: '+6',
        direction: 'up' as const,
        tone: 'red' as const,
      },
    ],
    [rows, visibleRows.length],
  )

  const handleAddWorkload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const hoursValue = Number(formData.hours)
    const targetValue = Number(formData.target)
    if (!formData.faculty.trim() || !Number.isFinite(hoursValue) || !Number.isFinite(targetValue)) {
      return
    }

    const newRow: WorkloadRow = {
      id: Date.now(),
      faculty: formData.faculty,
      department: formData.department,
      type: formData.type,
      hours: hoursValue,
      status: formData.status,
      target: targetValue,
    }

    setRows((current) => [newRow, ...current])
    setShowForm(false)
    setFormData({
      faculty: '',
      department: 'Computer Science',
      type: 'Teaching',
      hours: '160',
      status: 'Draft',
      target: '170',
    })
  }

  const roleInfo = roleConfig[selectedRole]

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/80">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">AW</div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">AWL</div>
              <div className="text-xl font-bold text-slate-900">Annual Workload</div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Access the college workload dashboard by role.</p>
          </div>

          <div className="space-y-3">
            {(['admin', 'hod', 'faculty'] as Role[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  setSelectedRole(role)
                  setIsAuthenticated(true)
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">{roleConfig[role].label}</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{roleConfig[role].name}</div>
                </div>
                <ShieldCheck className="text-blue-600" size={18} />
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-800">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles size={16} />
              Secure access for Admin, HOD and Faculty roles
            </div>
            <div className="mt-1 text-blue-700">This prototype uses local role simulation for the UI flow.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col justify-between bg-slate-950 p-5 text-slate-200 lg:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">AW</div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">College</div>
                <div className="text-lg font-bold text-white">Annual Workload</div>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map(({ label, icon: Icon, view }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={[
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                    activeView === view ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  ].join(' ')}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {roleInfo.name
                  .split(' ')
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{roleInfo.name}</div>
                <div className="text-xs text-slate-400">{roleInfo.label} • {roleInfo.department}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 xl:p-8">
          <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">Academic year 2026–27</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Annual Workload Management</h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search records"
                  placeholder="Search faculty or department"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-56"
                />
              </div>

              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <Filter size={16} />
                Filters
              </button>

              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">
                <Download size={16} />
                Export
              </button>
            </div>
          </header>

          {activeView === 'overview' && (
            <>
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </div>

              <div className="mb-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Workload trend</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">Monthly workload distribution</h2>
                    </div>
                    <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                      <CalendarDays size={16} />
                      2026–27
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrend}>
                        <defs>
                          <linearGradient id="workloadFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }} />
                        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#workloadFill)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Department load</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">By department</h2>
                    </div>
                    <BriefcaseBusiness className="text-blue-600" size={20} />
                  </div>

                  <div className="space-y-4">
                    {departmentLoad.map((item) => (
                      <div key={item.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="text-slate-500">{item.value} hrs</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500" style={{ width: `${(item.value / 1520) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Faculty records</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">Annual workload overview</h2>
                    </div>
                    <button type="button" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">View all</button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Faculty</th>
                            <th className="px-4 py-3 font-semibold">Department</th>
                            <th className="px-4 py-3 font-semibold">Type</th>
                            <th className="px-4 py-3 font-semibold">Hours</th>
                            <th className="px-4 py-3 font-semibold">Status</th>
                            <th className="px-4 py-3 font-semibold">Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleRows.map((row) => (
                            <tr key={row.id} className="border-t border-slate-200 bg-white">
                              <td className="px-4 py-3 font-medium text-slate-800">{row.faculty}</td>
                              <td className="px-4 py-3 text-slate-600">{row.department}</td>
                              <td className="px-4 py-3 text-slate-600">{row.type}</td>
                              <td className="px-4 py-3 font-medium text-slate-800">{row.hours}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[row.status]}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-600">{row.target}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Activity</p>
                      <h2 className="mt-2 text-xl font-bold text-slate-900">Recent updates</h2>
                    </div>
                    <Bell className="text-slate-500" size={18} />
                  </div>

                  <div className="space-y-4">
                    {notifications.map((item) => (
                      <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-slate-800">{item.title}</div>
                            <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                          </div>
                          <CircleCheckBig size={18} className="mt-0.5 text-emerald-600" />
                        </div>
                        <div className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">{item.time}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Completion</div>
                        <div className="mt-1 text-2xl font-bold">87.4%</div>
                      </div>
                      <div className="rounded-full bg-emerald-500/15 p-2 text-emerald-300">
                        <Clock3 size={18} />
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full w-[87.4%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeView === 'faculty' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Faculty directory</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">Faculty and staff workload status</h2>
                </div>
                <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Plus size={16} />
                  Add workload
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {['All', 'Approved', 'In Review', 'Submitted', 'Draft'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStatusFilter(item as 'All' | WorkloadStatus)}
                    className={[
                      'rounded-xl border px-3 py-2 text-sm font-medium transition',
                      statusFilter === item ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleRows.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-slate-800">{row.faculty}</div>
                        <div className="mt-1 text-sm text-slate-500">{row.department}</div>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${statusTone[row.status]}`}>{row.status}</span>
                    </div>

                    <div className="mt-4 rounded-xl bg-white p-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500">Type</span>
                        <span className="font-medium text-slate-800">{row.type}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-slate-500">Annual hours</span>
                        <span className="font-medium text-slate-800">{row.hours}</span>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-slate-500">Target</span>
                        <span className="font-medium text-slate-800">{row.target}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'departments' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Department summary</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Department-wise annual workload</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {departmentLoad.map((department) => (
                  <div key={department.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-slate-800">{department.name}</div>
                      <Building2 className="text-blue-600" size={18} />
                    </div>
                    <div className="mt-4 text-3xl font-bold text-slate-900">{department.value}</div>
                    <div className="mt-2 text-sm text-slate-500">Annual workload hours</div>
                    <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${(department.value / 1520) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeView === 'workload' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Workload manager</p>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">Entry and review workspace</h2>
                </div>
                <button type="button" onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Plus size={16} />
                  New entry
                </button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Faculty</th>
                      <th className="px-4 py-3 font-semibold">Department</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Hours</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row) => (
                      <tr key={row.id} className="border-t border-slate-200 bg-white">
                        <td className="px-4 py-3 font-medium text-slate-800">{row.faculty}</td>
                        <td className="px-4 py-3 text-slate-600">{row.department}</td>
                        <td className="px-4 py-3 text-slate-600">{row.type}</td>
                        <td className="px-4 py-3 text-slate-800">{row.hours}</td>
                        <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[row.status]}`}>{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeView === 'reports' && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Reports</p>
              <h2 className="mt-2 text-xl font-bold text-slate-900">Institutional report center</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { label: 'Annual report', value: 'PDF generated', tone: 'blue' },
                  { label: 'Department summary', value: 'Excel ready', tone: 'green' },
                  { label: 'Pending workload', value: 'CSV export', tone: 'amber' },
                ].map((report) => (
                  <div key={report.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-slate-800">{report.label}</div>
                      <FileText className={report.tone === 'blue' ? 'text-blue-600' : report.tone === 'green' ? 'text-emerald-600' : 'text-amber-600'} size={18} />
                    </div>
                    <div className="mt-4 text-sm text-slate-500">{report.value}</div>
                    <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                      <Download size={15} />
                      Export
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Add workload</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">New workload entry</h3>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">Close</button>
            </div>

            <form className="space-y-4" onSubmit={handleAddWorkload}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-700">
                  <span>Faculty name</span>
                  <input value={formData.faculty} onChange={(event) => setFormData((current) => ({ ...current, faculty: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none ring-0 focus:border-blue-300" placeholder="Enter faculty name" />
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Department</span>
                  <select value={formData.department} onChange={(event) => setFormData((current) => ({ ...current, department: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-300">
                    <option>Computer Science</option>
                    <option>Engineering</option>
                    <option>Business</option>
                    <option>Sciences</option>
                    <option>Arts</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Activity type</span>
                  <select value={formData.type} onChange={(event) => setFormData((current) => ({ ...current, type: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-300">
                    <option>Teaching</option>
                    <option>Practical / Lab</option>
                    <option>Research</option>
                    <option>Administrative</option>
                    <option>Evaluation</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Hours</span>
                  <input type="number" value={formData.hours} onChange={(event) => setFormData((current) => ({ ...current, hours: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-300" />
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Status</span>
                  <select value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as WorkloadStatus }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-300">
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="In Review">In Review</option>
                    <option value="Approved">Approved</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-700">
                  <span>Target</span>
                  <input type="number" value={formData.target} onChange={(event) => setFormData((current) => ({ ...current, target: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-blue-300" />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Check size={15} />
                  Save workload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
