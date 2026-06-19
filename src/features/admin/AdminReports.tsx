import { TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const monthlyData = [
  { month: 'Jul', revenue: 285000, claims: 45, users: 120 },
  { month: 'Aug', revenue: 342000, claims: 62, users: 185 },
  { month: 'Sep', revenue: 410000, claims: 78, users: 240 },
  { month: 'Oct', revenue: 525000, claims: 95, users: 310 },
  { month: 'Nov', revenue: 680000, claims: 112, users: 425 },
  { month: 'Dec', revenue: 840000, claims: 135, users: 580 },
]

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">Reports & Analytics</h1>
        <p className="section-subheading">Platform-wide performance metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '₹28.4L', change: '+22%', positive: true },
          { label: 'Active Users', value: '1,247', change: '+18%', positive: true },
          { label: 'Claim Ratio', value: '42.3%', change: '-3%', positive: true },
          { label: 'Net Promoter', value: '72', change: '+5', positive: true },
        ].map(kpi => (
          <div key={kpi.label} className="card-premium p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{kpi.label}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kpi.positive ? 'text-success-600 bg-success-50 dark:bg-success-500/10' : 'text-danger-600 bg-danger-50'}`}>
                {kpi.change}
              </span>
            </div>
            <div className="text-2xl font-display font-bold">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Users & Claims Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Users" />
              <Bar dataKey="claims" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Claims" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
