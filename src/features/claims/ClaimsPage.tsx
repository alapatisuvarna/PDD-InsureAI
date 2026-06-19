import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Search, Filter, FileText, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { claimService } from '@/services'
import { formatCurrency, formatDate, getClaimStatusColor } from '@/lib/utils'
import { SkeletonTable } from '@/components/common/Skeleton'
import type { Claim, ClaimStatus } from '@/types'

const statusSteps: ClaimStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'settled']

const statusLabels: Record<ClaimStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  settled: 'Settled',
}

export default function ClaimsPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (profile?.user_id) loadClaims()
  }, [profile])

  const loadClaims = async () => {
    setIsLoading(true)
    const { data } = await claimService.getAll(profile!.user_id)
    setClaims(data || [])
    setIsLoading(false)
  }

  const filtered = claims
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => !search || c.claim_number.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">Claims</h1>
          <p className="section-subheading">Track and manage your insurance claims</p>
        </div>
        <button
          onClick={() => navigate('/claims/create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          File Claim
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.entries(statusLabels) as [ClaimStatus, string][]).map(([status, label]) => {
          const count = claims.filter(c => c.status === status).length
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                statusFilter === status ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 card-premium'
              }`}
            >
              <div className="text-xl font-bold text-foreground">{count}</div>
              <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${getClaimStatusColor(status)}`}>{label}</div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="card-premium p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by claim number or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-premium pl-9"
          />
        </div>
      </div>

      {/* Claims List */}
      {isLoading ? (
        <SkeletonTable rows={4} />
      ) : filtered.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-display font-semibold text-lg mb-2">
            {claims.length === 0 ? 'No claims filed yet' : 'No matching claims'}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {claims.length === 0 ? 'File your first claim to get started' : 'Try adjusting your filters'}
          </p>
          {claims.length === 0 && (
            <button
              onClick={() => navigate('/claims/create')}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-glow-blue transition-all"
            >
              File a Claim
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim, i) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/claims/${claim.id}`)}
              className="card-premium p-5 cursor-pointer hover:shadow-card-hover group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{claim.claim_number}</h3>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getClaimStatusColor(claim.status)}`}>
                      {statusLabels[claim.status]}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{claim.description}</p>
                  {/* Progress bar */}
                  {claim.status !== 'rejected' && (
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, idx) => {
                        const currentIdx = statusSteps.indexOf(claim.status as ClaimStatus)
                        const isCompleted = idx <= currentIdx
                        return (
                          <div key={step} className="flex items-center gap-1">
                            <div className={`h-1.5 w-8 rounded-full transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                          </div>
                        )
                      })}
                      <span className="text-xs text-muted-foreground ml-1">{statusLabels[claim.status]}</span>
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-foreground">{formatCurrency(claim.claim_amount)}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(claim.created_at)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
