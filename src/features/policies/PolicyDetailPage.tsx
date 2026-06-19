import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Download, Upload, Edit, Trash2, RefreshCw, FileText,
  Calendar, IndianRupee, Shield, AlertCircle, CheckCircle, Clock
} from 'lucide-react'
import { policyService } from '@/services'
import { formatCurrency, formatDate, getDaysUntil, getPolicyTypeIcon } from '@/lib/utils'
import { Skeleton } from '@/components/common/Skeleton'
import type { Policy } from '@/types'
import toast from 'react-hot-toast'

export default function PolicyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (id) loadPolicy()
  }, [id])

  const loadPolicy = async () => {
    setIsLoading(true)
    const { data, error } = await policyService.getById(id!)
    if (error || !data) {
      toast.error('Policy not found')
      navigate('/policies')
    } else {
      setPolicy(data)
    }
    setIsLoading(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !policy) return
    setUploading(true)
    const { error } = await policyService.uploadDocument(policy.id, file)
    if (error) {
      toast.error('Failed to upload document')
    } else {
      toast.success('Document uploaded!')
      loadPolicy()
    }
    setUploading(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!policy) return null

  const daysLeft = getDaysUntil(policy.end_date)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/policies')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Policies
        </button>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-xl hover:bg-accent cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload Doc'}
            <input type="file" className="hidden" accept=".pdf,.jpg,.png,.jpeg" onChange={handleFileUpload} disabled={uploading} />
          </label>
          <button className="flex items-center gap-2 px-3 py-2 text-sm bg-warning-500 text-white rounded-xl hover:bg-warning-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Renew
          </button>
        </div>
      </div>

      {/* Policy Header */}
      <div className="card-gradient p-6 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="text-4xl">{getPolicyTypeIcon(policy.policy_type)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-display font-bold text-foreground">{policy.policy_name}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                policy.status === 'active' ? 'badge-active' : 'badge-rejected'
              }`}>
                {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{policy.provider?.name} • #{policy.policy_number}</p>
            {daysLeft <= 30 && daysLeft > 0 && (
              <div className="flex items-center gap-2 mt-3 text-warning-600 dark:text-warning-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                Policy expires in {daysLeft} days — Consider renewing soon
              </div>
            )}
          </div>
          {/* Provider CSR badge */}
          {policy.provider?.claim_settlement_ratio && (
            <div className="text-center bg-success-50 dark:bg-success-500/10 px-4 py-2 rounded-xl">
              <div className="text-lg font-bold text-success-600 dark:text-success-400">{policy.provider.claim_settlement_ratio}%</div>
              <div className="text-xs text-success-600/70 dark:text-success-400/70">Claim Settlement</div>
            </div>
          )}
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Coverage Amount', value: formatCurrency(policy.coverage_amount), icon: Shield, color: 'text-brand-600' },
          { label: 'Annual Premium', value: formatCurrency(policy.premium_amount), icon: IndianRupee, color: 'text-success-600' },
          { label: 'Start Date', value: formatDate(policy.start_date), icon: Calendar, color: 'text-purple-600' },
          { label: 'End Date', value: formatDate(policy.end_date), icon: Clock, color: daysLeft <= 30 ? 'text-warning-600' : 'text-muted-foreground' },
        ].map(item => (
          <div key={item.label} className="card-premium p-4">
            <item.icon className={`w-5 h-5 ${item.color} mb-2`} />
            <div className="text-sm font-semibold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefits */}
        {policy.benefits && policy.benefits.length > 0 && (
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              What's Covered
            </h3>
            <ul className="space-y-2">
              {policy.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exclusions */}
        {policy.exclusions && policy.exclusions.length > 0 && (
          <div className="card-premium p-5">
            <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-danger-500" />
              Not Covered
            </h3>
            <ul className="space-y-2">
              {policy.exclusions.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-danger-500 mt-2 flex-shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Details */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold mb-3">Policy Details</h3>
          <div className="space-y-3">
            {[
              { label: 'Deductible', value: policy.deductible ? formatCurrency(policy.deductible) : 'Nil' },
              { label: 'Waiting Period', value: policy.waiting_period ? `${policy.waiting_period} days` : 'None' },
              { label: 'Policy Type', value: policy.policy_type.charAt(0).toUpperCase() + policy.policy_type.slice(1) + ' Insurance' },
            ].map(d => (
              <div key={d.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium text-foreground">{d.value}</span>
              </div>
            ))}
            {policy.riders && policy.riders.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Riders</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {policy.riders.map(r => (
                    <span key={r} className="badge-info">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Documents */}
        <div className="card-premium p-5">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents ({policy.documents?.length || 0})
          </h3>
          {policy.documents && policy.documents.length > 0 ? (
            <div className="space-y-2">
              {policy.documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <FileText className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1 truncate">{doc.file_name}</span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
              <label className="mt-2 text-xs text-primary cursor-pointer hover:underline">
                Upload document
                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
