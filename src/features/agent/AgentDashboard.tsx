import { Briefcase, Users, TrendingUp, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const performanceData = [
  { month: 'Jan', policies: 12, claims: 4 },
  { month: 'Feb', policies: 18, claims: 6 },
  { month: 'Mar', policies: 15, claims: 8 },
  { month: 'Apr', policies: 22, claims: 5 },
  { month: 'May', policies: 28, claims: 9 },
  { month: 'Jun', policies: 35, claims: 11 },
]

export default function AgentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">Agent Overview</h1>
        <p className="section-subheading">Your performance and customer metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Assigned Customers', value: '24', icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Policies Managed', value: '87', icon: Briefcase, color: 'from-green-500 to-emerald-500' },
          { label: 'Claims Assisted', value: '12', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
          { label: 'Performance Score', value: '92%', icon: Award, color: 'from-purple-500 to-indigo-500' },
        ].map((card, i) => (
          <div key={card.label} className="card-premium p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-display font-bold">{card.value}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="card-premium p-6">
        <h2 className="font-display font-semibold mb-4">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="policies" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Policies" />
            <Bar dataKey="claims" fill="#22c55e" radius={[4, 4, 0, 0]} name="Claims Assisted" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
