import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Shield } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { policyService, providerService } from '@/services'
import type { InsuranceProvider, PolicyType } from '@/types'
import toast from 'react-hot-toast'

const policySchema = z.object({
  policy_name: z.string().min(3, 'Policy name must be at least 3 characters'),
  policy_number: z.string().min(3, 'Policy number is required'),
  policy_type: z.enum(['health', 'life', 'vehicle', 'travel', 'property', 'business']),
  provider_id: z.string().min(1, 'Please select a provider'),
  premium_amount: z.number().min(1, 'Premium must be greater than 0'),
  coverage_amount: z.number().min(1, 'Coverage must be greater than 0'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  deductible: z.number().optional(),
  waiting_period: z.number().optional(),
  description: z.string().optional(),
})

type PolicyForm = z.infer<typeof policySchema>

const policyTypes: { value: PolicyType; label: string; icon: string }[] = [
  { value: 'health', label: 'Health Insurance', icon: '🏥' },
  { value: 'life', label: 'Life Insurance', icon: '❤️' },
  { value: 'vehicle', label: 'Vehicle Insurance', icon: '🚗' },
  { value: 'travel', label: 'Travel Insurance', icon: '✈️' },
  { value: 'property', label: 'Property Insurance', icon: '🏠' },
  { value: 'business', label: 'Business Insurance', icon: '💼' },
]

export default function AddPolicyPage() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState<PolicyType>('health')

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PolicyForm>({
    resolver: zodResolver(policySchema),
    defaultValues: { policy_type: 'health' },
  })

  useEffect(() => {
    providerService.getAll().then(({ data }) => {
      if (data) setProviders(data)
    })
  }, [])

  const onSubmit = async (data: PolicyForm) => {
    if (!profile?.user_id) return
    setIsSubmitting(true)
    const { error } = await policyService.create({
      ...data,
      user_id: profile.user_id,
      status: 'active',
    })
    if (error) {
      toast.error('Failed to add policy: ' + error.message)
    } else {
      toast.success('Policy added successfully! 🎉')
      navigate('/policies')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/policies')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Policies
        </button>
        <h1 className="section-heading">Add New Policy</h1>
        <p className="section-subheading">Track a new insurance policy in your portfolio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Policy Type Selection */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Policy Type</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {policyTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => { setSelectedType(type.value); setValue('policy_type', type.value) }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  selectedType === type.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Policy Details */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Policy Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Policy Name *</label>
              <input {...register('policy_name')} placeholder="e.g., Family Health Floater" className="input-premium" />
              {errors.policy_name && <p className="text-danger-500 text-xs mt-1">{errors.policy_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Policy Number *</label>
              <input {...register('policy_number')} placeholder="e.g., POL-2024-001234" className="input-premium" />
              {errors.policy_number && <p className="text-danger-500 text-xs mt-1">{errors.policy_number.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Insurance Provider *</label>
              <select {...register('provider_id')} className="input-premium">
                <option value="">Select Provider</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.provider_id && <p className="text-danger-500 text-xs mt-1">{errors.provider_id.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <input {...register('description')} placeholder="Brief description" className="input-premium" />
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Financial Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Annual Premium (₹) *</label>
              <input {...register('premium_amount', { valueAsNumber: true })} type="number" placeholder="e.g., 15000" className="input-premium" />
              {errors.premium_amount && <p className="text-danger-500 text-xs mt-1">{errors.premium_amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Coverage Amount (₹) *</label>
              <input {...register('coverage_amount', { valueAsNumber: true })} type="number" placeholder="e.g., 5000000" className="input-premium" />
              {errors.coverage_amount && <p className="text-danger-500 text-xs mt-1">{errors.coverage_amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Deductible (₹)</label>
              <input {...register('deductible', { valueAsNumber: true })} type="number" placeholder="e.g., 5000" className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Waiting Period (days)</label>
              <input {...register('waiting_period', { valueAsNumber: true })} type="number" placeholder="e.g., 30" className="input-premium" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Policy Period</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date *</label>
              <input {...register('start_date')} type="date" className="input-premium" />
              {errors.start_date && <p className="text-danger-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date *</label>
              <input {...register('end_date')} type="date" className="input-premium" />
              {errors.end_date && <p className="text-danger-500 text-xs mt-1">{errors.end_date.message}</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/policies')}
            className="px-6 py-3 border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Add Policy
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
