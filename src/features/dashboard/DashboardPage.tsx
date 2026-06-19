import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, FileText, TrendingUp, Bell, ArrowRight, AlertTriangle,
  Plus, Bot, Sparkles, BarChart3, CheckCircle, Clock, IndianRupee,
  RefreshCw, Calendar
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { dashboardService, policyService } from '@/services'
import { formatCurrency, formatDate, getDaysUntil, isExpiringSoon, getClaimStatusColor, getPolicyTypeIcon } from '@/lib/utils'
import { SkeletonDashboard } from '@/components/common/Skeleton'
import type { DashboardStats, Policy } from '@/types'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const premiumData = [
  { month: 'Jul', premium: 8500 },
  { month: 'Aug', premium: 12000 },
  { month: 'Sep', premium: 8500 },
  { month: 'Oct', premium: 15000 },
  { month: 'Nov', premium: 8500 },
  { month: 'Dec', premium: 8500 },
  { month: 'Jan', premium: 21000 },
]

const coverageData = [
  { name: 'Health', value: 35, color: '#22c55e' },
  { name: 'Life', value: 45, color: '#3b82f6' },
  { name: 'Vehicle', value: 15, color: '#f59e0b' },
  { name: 'Travel', value: 5, color: '#8b5cf6' },
]

function StatCard({ title, value, subtitle, icon: Icon, color, trend, onClick }: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  color: string
  trend?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      onClick={onClick}
      className={`card-premium p-5 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon style={{ width: 20, height: 20 }} className="text-white" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-display font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground mb-0.5">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [upcomingRenewals, setUpcomingRenewals] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile?.user_id) {
      loadDashboard()
    }
  }, [profile])

  const loadDashboard = async () => {
    setIsLoading(true)
    const [statsRes, renewalsRes] = await Promise.all([
      dashboardService.getStats(profile!.user_id),
      policyService.getUpcomingRenewals(profile!.user_id),
    ])
    setStats(statsRes)
    setUpcomingRenewals(renewalsRes.data || [])
    setIsLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) return <SkeletonDashboard />

  const statCards = [
    {
      title: 'Active Policies',
      value: stats?.active_policies || 0,
      subtitle: 'All protected',
      icon: Shield,
      color: 'bg-gradient-to-br from-brand-500 to-brand-600',
      trend: '↑ 2 new',
      onClick: () => navigate('/policies'),
    },
    {
      title: 'Total Coverage',
      value: formatCurrency(stats?.total_coverage || 0),
      subtitle: 'Sum assured',
      icon: IndianRupee,
      color: 'bg-gradient-to-br from-success-500 to-success-600',
      trend: 'Protected',
      onClick: () => navigate('/policies'),
    },
    {
      title: 'Active Claims',
      value: stats?.active_claims || 0,
      subtitle: 'Under processing',
      icon: FileText,
      color: 'bg-gradient-to-br from-warning-500 to-orange-500',
      onClick: () => navigate('/claims'),
    },
    {
      title: 'Risk Score',
      value: `${stats?.risk_score || 42}/100`,
      subtitle: 'Moderate risk',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-purple-500 to-indigo-500',
      onClick: () => navigate('/risk-analysis'),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your insurance overview for today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboard}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => navigate('/policies/add')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Policy
          </button>
        </div>
      </div>

      {/* Alerts */}
      {upcomingRenewals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warning-50 dark:bg-warning-500/10 border border-warning-200 dark:border-warning-500/30 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-warning-800 dark:text-warning-300">
              {upcomingRenewals.length} policy renewal{upcomingRenewals.length > 1 ? 's' : ''} coming up
            </p>
            <p className="text-xs text-warning-700 dark:text-warning-400 mt-0.5">
              {upcomingRenewals[0].policy_name} expires in {getDaysUntil(upcomingRenewals[0].end_date)} days
            </p>
          </div>
          <button onClick={() => navigate('/policies')} className="text-xs font-semibold text-warning-700 dark:text-warning-300 hover:underline">
            View all →
          </button>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts + Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Premium Chart */}
        <div className="lg:col-span-2 card-premium p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-semibold text-foreground">Premium Overview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Monthly premium payments</p>
            </div>
            <span className="text-xs text-muted-foreground">Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={premiumData}>
              <defs>
                <linearGradient id="premGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }}
                formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Premium']}
              />
              <Area type="monotone" dataKey="premium" stroke="#3b82f6" strokeWidth={2.5} fill="url(#premGrad)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Coverage Distribution */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold text-foreground mb-1">Coverage Split</h2>
          <p className="text-xs text-muted-foreground mb-4">By insurance type</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={coverageData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value">
                {coverageData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${v}%`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {coverageData.map(item => (
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

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals */}
        <div className="card-premium p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-foreground">Upcoming Renewals</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Next 30 days</p>
            </div>
            <button onClick={() => navigate('/policies')} className="text-xs text-primary font-medium hover:underline">View all</button>
          </div>
          {upcomingRenewals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-success-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No renewals in the next 30 days</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingRenewals.slice(0, 4).map(policy => {
                const daysLeft = getDaysUntil(policy.end_date)
                return (
                  <div
                    key={policy.id}
                    onClick={() => navigate(`/policies/${policy.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="text-2xl">{getPolicyTypeIcon(policy.policy_type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{policy.policy_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(policy.end_date)}</p>
                    </div>
                    <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      daysLeft <= 7 ? 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400' :
                      daysLeft <= 15 ? 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400' :
                      'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400'
                    }`}>
                      {daysLeft}d left
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Bot, label: 'AI Assistant', desc: 'Ask insurance questions', path: '/ai-assistant', color: 'from-blue-500 to-cyan-500' },
              { icon: Sparkles, label: 'Get Recommendations', desc: 'AI policy suggestions', path: '/recommendations', color: 'from-purple-500 to-pink-500' },
              { icon: Plus, label: 'Add Policy', desc: 'Track a new policy', path: '/policies/add', color: 'from-green-500 to-emerald-500' },
              { icon: FileText, label: 'File a Claim', desc: 'Start claim process', path: '/claims/create', color: 'from-orange-500 to-red-500' },
              { icon: BarChart3, label: 'Risk Analysis', desc: 'Check your risk score', path: '/risk-analysis', color: 'from-indigo-500 to-blue-500' },
              { icon: Calendar, label: 'Compare Policies', desc: 'Side-by-side compare', path: '/compare', color: 'from-yellow-500 to-orange-500' },
            ].map(action => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all text-left"
              >
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}>
                  <action.icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{action.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
