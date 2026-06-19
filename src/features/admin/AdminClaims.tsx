import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { claimService } from '@/services'
import { formatCurrency, formatDate, getClaimStatusColor } from '@/lib/utils'
import { SkeletonTable } from '@/components/common/Skeleton'
import type { Claim, ClaimStatus } from '@/types'
import toast from 'react-hot-toast'

const statusLabels: Record<ClaimStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Rejected', settled: 'Settled',
}

export default function AdminClaims() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all')

  useEffect(() => { loadClaims() }, [])

  const loadClaims = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('claims')
      .select('*, policy:policies(policy_name, policy_type, provider:insurance_providers(name))')
      .order('created_at', { ascending: false })
    setClaims(data || [])
    setIsLoading(false)
  }

  const updateStatus = async (id: string, status: ClaimStatus) => {
    const messages: Record<ClaimStatus, string> = {
      submitted: 'Claim received', under_review: 'Claim is being reviewed',
      approved: 'Claim approved by admin', rejected: 'Claim rejected by admin',
      settled: 'Claim amount settled', draft: 'Moved to draft',
    }
    const { error } = await claimService.updateStatus(id, status, messages[status])
    if (error) toast.error('Failed to update status')
    else { toast.success('Status updated!'); loadClaims() }
  }

  const filtered = claims
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c => !search || c.claim_number.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">Claims Management</h1>
        <p className="section-subheading">Review and process insurance claims</p>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(Object.entries(statusLabels) as [ClaimStatus, string][]).map(([status, label]) => {
          const count = claims.filter(c => c.status === status).length
          return (
            <button key={status} onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`p-3 rounded-xl text-center border-2 transition-all card-premium ${statusFilter === status ? 'border-primary' : 'border-transparent'}`}>
              <div className="text-lg font-bold">{count}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getClaimStatusColor(status)}`}>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="card-premium p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by claim number..." value={search} onChange={e => setSearch(e.target.value)} className="input-premium pl-9" />
        </div>
      </div>

      {isLoading ? <SkeletonTable rows={5} /> : (
        <div className="card-premium overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase">Claim No.</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Policy</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Date</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(claim => (
                <tr key={claim.id} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="p-4 text-sm font-mono font-medium">{claim.claim_number}</td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{(claim.policy as Record<string, string>)?.policy_name || 'N/A'}</td>
                  <td className="p-4 text-sm font-semibold">{formatCurrency(claim.claim_amount)}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getClaimStatusColor(claim.status)}`}>
                      {statusLabels[claim.status]}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground hidden md:table-cell">{formatDate(claim.created_at)}</td>
                  <td className="p-4">
                    <select
                      value={claim.status}
                      onChange={e => updateStatus(claim.id, e.target.value as ClaimStatus)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background"
                    >
                      {(Object.keys(statusLabels) as ClaimStatus[]).map(s => (
                        <option key={s} value={s}>{statusLabels[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No claims found</div>}
        </div>
      )}
    </div>
  )
}
