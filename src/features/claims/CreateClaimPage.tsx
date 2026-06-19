import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, FileText, Bot } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { policyService, claimService } from '@/services'
import { aiService } from '@/services/aiService'
import type { Policy } from '@/types'
import toast from 'react-hot-toast'

const claimSchema = z.object({
  policy_id: z.string().min(1, 'Please select a policy'),
  claim_type: z.string().min(1, 'Claim type is required'),
  description: z.string().min(20, 'Please describe the incident in at least 20 characters'),
  claim_amount: z.number().min(1, 'Claim amount must be greater than 0'),
  incident_date: z.string().min(1, 'Incident date is required'),
})

type ClaimForm = z.infer<typeof claimSchema>

const claimTypes = {
  health: ['Hospitalization', 'Day Care', 'OPD', 'Ambulance', 'Maternity', 'Critical Illness'],
  life: ['Death Claim', 'Maturity Claim', 'Survival Benefit'],
  vehicle: ['Accident', 'Theft', 'Natural Calamity', 'Third-party', 'Fire'],
  travel: ['Medical Emergency', 'Trip Cancellation', 'Baggage Loss', 'Flight Delay'],
  property: ['Fire', 'Flood', 'Burglary', 'Natural Disaster'],
  business: ['Business Interruption', 'Public Liability', 'Employee Injury'],
}

export default function CreateClaimPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiGuidance, setAiGuidance] = useState('')
  const [isLoadingGuidance, setIsLoadingGuidance] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
  })

  const watchedPolicyId = watch('policy_id')
  const watchedClaimType = watch('claim_type')
  const watchedDescription = watch('description')

  useEffect(() => {
    if (profile?.user_id) {
      policyService.getAll(profile.user_id).then(({ data }) => {
        if (data) setPolicies(data.filter(p => p.status === 'active'))
      })
    }
  }, [profile])

  useEffect(() => {
    if (watchedPolicyId) {
      const policy = policies.find(p => p.id === watchedPolicyId)
      setSelectedPolicy(policy || null)
    }
  }, [watchedPolicyId, policies])

  const getAIGuidance = async () => {
    if (!watchedClaimType || !selectedPolicy) return
    setIsLoadingGuidance(true)
    try {
      const guidance = await aiService.getClaimGuidance(
        watchedClaimType,
        selectedPolicy.policy_type,
        watchedDescription || 'General claim'
      )
      setAiGuidance(guidance)
    } catch {
      toast.error('Could not load AI guidance')
    } finally {
      setIsLoadingGuidance(false)
    }
  }

  const onSubmit = async (data: ClaimForm) => {
    if (!profile?.user_id) return
    setIsSubmitting(true)
    const { data: claim, error } = await claimService.create({
      ...data,
      user_id: profile.user_id,
      status: 'draft',
    })
    if (error) {
      toast.error('Failed to create claim: ' + error.message)
    } else {
      toast.success('Claim created! Submit it when ready.')
      navigate(`/claims/${claim?.id}`)
    }
    setIsSubmitting(false)
  }

  const availableTypes = selectedPolicy ? claimTypes[selectedPolicy.policy_type] || [] : []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <button onClick={() => navigate('/claims')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </button>
        <h1 className="section-heading">File a Claim</h1>
        <p className="section-subheading">Start your insurance claim process</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
          {/* Policy selection */}
          <div className="card-premium p-5">
            <h2 className="font-display font-semibold mb-4">Select Policy</h2>
            <select {...register('policy_id')} className="input-premium">
              <option value="">Choose your policy</option>
              {policies.map(p => (
                <option key={p.id} value={p.id}>
                  {p.policy_name} — {p.provider?.name} (#{p.policy_number})
                </option>
              ))}
            </select>
            {errors.policy_id && <p className="text-danger-500 text-xs mt-1">{errors.policy_id.message}</p>}
            {policies.length === 0 && <p className="text-sm text-muted-foreground mt-2">No active policies found. <a href="/policies/add" className="text-primary">Add a policy first.</a></p>}
          </div>

          {/* Claim details */}
          <div className="card-premium p-5 space-y-4">
            <h2 className="font-display font-semibold">Claim Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Claim Type *</label>
              <select {...register('claim_type')} className="input-premium" disabled={!selectedPolicy}>
                <option value="">Select claim type</option>
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.claim_type && <p className="text-danger-500 text-xs mt-1">{errors.claim_type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Claim Amount (₹) *</label>
              <input {...register('claim_amount', { valueAsNumber: true })} type="number" placeholder="Enter amount" className="input-premium" />
              {errors.claim_amount && <p className="text-danger-500 text-xs mt-1">{errors.claim_amount.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Incident Date *</label>
              <input {...register('incident_date')} type="date" max={new Date().toISOString().split('T')[0]} className="input-premium" />
              {errors.incident_date && <p className="text-danger-500 text-xs mt-1">{errors.incident_date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Description *</label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Describe what happened in detail..."
                className="input-premium resize-none"
              />
              {errors.description && <p className="text-danger-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {watchedClaimType && selectedPolicy && (
              <button
                type="button"
                onClick={getAIGuidance}
                disabled={isLoadingGuidance}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Bot className="w-4 h-4" />
                {isLoadingGuidance ? 'Getting AI guidance...' : 'Get AI claim guidance'}
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/claims')} className="px-6 py-3 border border-border rounded-xl text-sm hover:bg-accent">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
              Create Claim
            </button>
          </div>
        </form>

        {/* AI Guidance sidebar */}
        <div className="space-y-4">
          <div className="card-premium p-4 sticky top-6">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">AI Claim Guide</h3>
            </div>
            {aiGuidance ? (
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{aiGuidance}</p>
            ) : (
              <div className="text-center py-6">
                <Bot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Select a policy and claim type to get AI guidance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
