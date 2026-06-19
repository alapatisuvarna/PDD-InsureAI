import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, CheckCircle, Clock, XCircle, Send } from 'lucide-react'
import { claimService } from '@/services'
import { formatCurrency, formatDate, formatDateTime, getClaimStatusColor } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'
import type { Claim, ClaimStatus } from '@/types'
import toast from 'react-hot-toast'

const statusOrder: ClaimStatus[] = ['draft', 'submitted', 'under_review', 'approved', 'settled']
const statusLabels: Record<ClaimStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
  approved: 'Approved', rejected: 'Rejected', settled: 'Settled',
}

export default function ClaimDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) loadClaim()
  }, [id])

  const loadClaim = async () => {
    setIsLoading(true)
    const { data } = await claimService.getById(id!)
    setClaim(data)
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (!claim) return
    setIsSubmitting(true)
    const { error } = await claimService.updateStatus(claim.id, 'submitted', 'Claim submitted by customer')
    if (error) {
      toast.error('Failed to submit claim')
    } else {
      toast.success('Claim submitted successfully!')
      loadClaim()
    }
    setIsSubmitting(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !claim) return
    const { error } = await claimService.uploadDocument(claim.id, file)
    if (error) toast.error('Upload failed')
    else { toast.success('Document uploaded!'); loadClaim() }
  }

  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
  if (!claim) return null

  const currentStepIdx = statusOrder.indexOf(claim.status as ClaimStatus)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/claims')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </button>
        {claim.status === 'draft' && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all"
          >
            <Send className="w-4 h-4" />
            Submit Claim
          </button>
        )}
      </div>

      {/* Claim Header */}
      <div className="card-gradient p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-display font-bold">{claim.claim_number}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getClaimStatusColor(claim.status)}`}>
                {statusLabels[claim.status]}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">{claim.policy?.policy_name} • {claim.policy?.provider?.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display font-bold gradient-text">{formatCurrency(claim.claim_amount)}</div>
            {claim.settled_amount && <div className="text-sm text-success-600">Settled: {formatCurrency(claim.settled_amount)}</div>}
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      {claim.status !== 'rejected' && (
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Claim Progress</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(currentStepIdx / (statusOrder.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {statusOrder.map((status, idx) => {
                const isCompleted = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                return (
                  <div key={status} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs font-medium text-center ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {statusLabels[status]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Claim Info */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold mb-3">Claim Information</h3>
          <div className="space-y-3">
            {[
              { label: 'Claim Type', value: claim.claim_type },
              { label: 'Incident Date', value: formatDate(claim.incident_date) },
              { label: 'Filed On', value: claim.submitted_date ? formatDate(claim.submitted_date) : 'Not submitted' },
              { label: 'Description', value: claim.description },
            ].map(d => (
              <div key={d.label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{d.label}</span>
                <span className="text-sm text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="card-premium p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold">Documents ({claim.documents?.length || 0})</h3>
            <label className="flex items-center gap-1.5 text-xs text-primary cursor-pointer hover:underline">
              <Upload className="w-3.5 h-3.5" />
              Upload
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
          {claim.documents && claim.documents.length > 0 ? (
            <div className="space-y-2">
              {claim.documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-muted/50">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-600">{doc.file_type?.includes('pdf') ? 'PDF' : 'IMG'}</span>
                  </div>
                  <span className="text-xs text-foreground flex-1 truncate">{doc.file_name}</span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">View</a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-xs text-muted-foreground">No documents uploaded</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      {claim.timeline && claim.timeline.length > 0 && (
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {[...claim.timeline].reverse().map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getClaimStatusColor(event.status)}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(event.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
