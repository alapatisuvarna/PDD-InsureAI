import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, Shield, Calendar, IndianRupee, MoreVertical, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { policyService } from '@/services'
import { formatCurrency, formatDate, getDaysUntil, isExpiringSoon, getPolicyTypeIcon } from '@/lib/utils'
import { SkeletonTable } from '@/components/common/Skeleton'
import type { Policy, PolicyType, PolicyStatus } from '@/types'

const policyTypeFilters: { value: 'all' | PolicyType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'health', label: '🏥 Health' },
  { value: 'life', label: '❤️ Life' },
  { value: 'vehicle', label: '🚗 Vehicle' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'property', label: '🏠 Property' },
]

const statusColors: Record<PolicyStatus, string> = {
  active: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400',
  expired: 'bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pending: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
}

export default function PoliciesPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [filtered, setFiltered] = useState<Policy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | PolicyType>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | PolicyStatus>('all')

  useEffect(() => {
    if (profile?.user_id) loadPolicies()
  }, [profile])

  useEffect(() => {
    let result = policies
    if (search) result = result.filter(p => 
      p.policy_name.toLowerCase().includes(search.toLowerCase()) ||
      p.policy_number.toLowerCase().includes(search.toLowerCase()) ||
      p.provider?.name?.toLowerCase().includes(search.toLowerCase())
    )
    if (typeFilter !== 'all') result = result.filter(p => p.policy_type === typeFilter)
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter)
    setFiltered(result)
  }, [policies, search, typeFilter, statusFilter])

  const loadPolicies = async () => {
    setIsLoading(true)
    const { data } = await policyService.getAll(profile!.user_id)
    setPolicies(data || [])
    setFiltered(data || [])
    setIsLoading(false)
  }

  const totalCoverage = policies.filter(p => p.status === 'active').reduce((s, p) => s + p.coverage_amount, 0)
  const totalPremium = policies.filter(p => p.status === 'active').reduce((s, p) => s + p.premium_amount, 0)
  const activePolicies = policies.filter(p => p.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">My Policies</h1>
          <p className="section-subheading">Manage and track all your insurance policies</p>
        </div>
        <button
          onClick={() => navigate('/policies/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Policies', value: activePolicies, icon: Shield, color: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10' },
          { label: 'Total Coverage', value: formatCurrency(totalCoverage), icon: IndianRupee, color: 'text-success-600 bg-success-50 dark:bg-success-500/10' },
          { label: 'Annual Premium', value: formatCurrency(totalPremium), icon: Calendar, color: 'text-warning-600 bg-warning-50 dark:bg-warning-500/10' },
        ].map(card => (
          <div key={card.label} className="card-premium p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-display font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-premium p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, number, or provider..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-premium pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as 'all' | PolicyStatus)}
            className="input-premium w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {/* Type tabs */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {policyTypeFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                typeFilter === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Policy List */}
      {isLoading ? (
        <SkeletonTable rows={5} />
      ) : filtered.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h3 className="font-display font-semibold text-lg mb-2">
            {policies.length === 0 ? 'No policies yet' : 'No results found'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {policies.length === 0
              ? 'Add your first policy to start tracking your insurance coverage'
              : 'Try adjusting your search or filters'}
          </p>
          {policies.length === 0 && (
            <button
              onClick={() => navigate('/policies/add')}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-glow-blue transition-all"
            >
              Add Your First Policy
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((policy, i) => {
            const daysLeft = getDaysUntil(policy.end_date)
            const expiringSoon = isExpiringSoon(policy.end_date, 30)
            
            return (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/policies/${policy.id}`)}
                className="card-premium p-4 sm:p-5 hover:shadow-card-hover cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="text-2xl sm:text-3xl flex-shrink-0">
                    {getPolicyTypeIcon(policy.policy_type)}
                  </div>
                  
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-foreground truncate">{policy.policy_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${statusColors[policy.status]}`}>
                        {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                      </span>
                      {expiringSoon && policy.status === 'active' && (
                        <span className="flex items-center gap-1 text-xs text-warning-600 dark:text-warning-400 flex-shrink-0">
                          <AlertCircle className="w-3 h-3" />
                          Expiring
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{policy.provider?.name || 'Unknown Provider'}</span>
                      <span>•</span>
                      <span>#{policy.policy_number}</span>
                      <span>•</span>
                      <span className="capitalize">{policy.policy_type} Insurance</span>
                    </div>
                  </div>
                  
                  {/* Coverage & Premium */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <div className="text-sm font-semibold text-foreground">{formatCurrency(policy.coverage_amount)}</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  
                  <div className="hidden md:flex flex-col items-end gap-1">
                    <div className="text-sm font-semibold text-foreground">{formatCurrency(policy.premium_amount)}/yr</div>
                    <div className="text-xs text-muted-foreground">Premium</div>
                  </div>
                  
                  {/* Expiry */}
                  <div className="flex flex-col items-end gap-1">
                    <div className={`text-xs font-semibold ${
                      daysLeft < 0 ? 'text-danger-600' :
                      daysLeft <= 7 ? 'text-danger-500' :
                      daysLeft <= 30 ? 'text-warning-500' :
                      'text-muted-foreground'
                    }`}>
                      {daysLeft < 0 ? 'Expired' : `${daysLeft}d`}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{formatDate(policy.end_date)}</div>
                  </div>
                  
                  <div className="w-6 h-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
