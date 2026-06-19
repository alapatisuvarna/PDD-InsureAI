import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Shield, FileText, TrendingUp, IndianRupee, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import { SkeletonDashboard } from '@/components/common/Skeleton'

const growthData = [
  { month: 'Jan', users: 120, policies: 45, claims: 12 },
  { month: 'Feb', users: 185, policies: 72, claims: 18 },
  { month: 'Mar', users: 240, policies: 95, claims: 22 },
  { month: 'Apr', users: 310, policies: 130, claims: 28 },
  { month: 'May', users: 425, policies: 180, claims: 35 },
  { month: 'Jun', users: 580, policies: 245, claims: 42 },
]

const claimDistribution = [
  { name: 'Approved', value: 45, color: '#22c55e' },
  { name: 'Under Review', value: 30, color: '#f59e0b' },
  { name: 'Rejected', value: 15, color: '#ef4444' },
  { name: 'Draft', value: 10, color: '#6b7280' },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0, total_policies: 0, total_claims: 0, total_providers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { loadStats() }, [])

  const loadStats = async () => {
    setIsLoading(true)
    const [usersRes, policiesRes, claimsRes, providersRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('policies').select('id', { count: 'exact' }),
      supabase.from('claims').select('id', { count: 'exact' }),
      supabase.from('insurance_providers').select('id', { count: 'exact' }),
    ])
    setStats({
      total_users: usersRes.count || 0,
      total_policies: policiesRes.count || 0,
      total_claims: claimsRes.count || 0,
      total_providers: providersRes.count || 0,
    })
    setIsLoading(false)
  }

  if (isLoading) return <SkeletonDashboard />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">Admin Overview</h1>
        <p className="section-subheading">Platform analytics and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total_users, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active Policies', value: stats.total_policies, icon: Shield, color: 'from-green-500 to-emerald-500' },
          { label: 'Total Claims', value: stats.total_claims, icon: FileText, color: 'from-orange-500 to-red-500' },
          { label: 'Providers', value: stats.total_providers, icon: Activity, color: 'from-purple-500 to-indigo-500' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium p-5"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-display font-bold">{card.value.toLocaleString('en-IN')}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart */}
        <div className="lg:col-span-2 card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Platform Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="policiesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} fill="url(#usersGrad)" name="Users" />
              <Area type="monotone" dataKey="policies" stroke="#22c55e" strokeWidth={2} fill="url(#policiesGrad)" name="Policies" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Claim Distribution */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Claims by Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={claimDistribution} innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {claimDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {claimDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="card-premium p-6">
        <h2 className="font-display font-semibold mb-4">Monthly Claims Volume</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="claims" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Claims" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
