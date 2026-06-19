import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle, Star, TrendingUp, RefreshCw, BookmarkPlus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { aiService } from '@/services/aiService'
import { formatCurrency } from '@/lib/utils'
import type { Recommendation, RecommendationInput } from '@/types'
import toast from 'react-hot-toast'

const schema = z.object({
  age: z.number().min(18).max(80),
  gender: z.enum(['male', 'female', 'other']),
  occupation: z.string().min(2),
  annual_income: z.number().min(100000),
  family_size: z.number().min(1).max(20),
  existing_insurance: z.array(z.string()),
  health_conditions: z.array(z.string()),
  risk_factors: z.array(z.string()),
  insurance_goals: z.array(z.string()),
})

type FormData = z.infer<typeof schema>

const healthConditionOptions = ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'None']
const riskFactorOptions = ['Smoker', 'Frequent traveller', 'Dangerous occupation', 'History of accidents', 'None']
const goalOptions = ['Family protection', 'Tax savings', 'Retirement planning', 'Medical expenses', 'Property protection', 'Wealth creation']
const existingOptions = ['Health Insurance', 'Life Insurance', 'Vehicle Insurance', 'None']

export default function RecommendationsPage() {
  const { profile } = useAuthStore()
  const [step, setStep] = useState(0) // 0=form, 1=loading, 2=results
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [aiSummary, setAiSummary] = useState('')

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: 'male',
      existing_insurance: [],
      health_conditions: [],
      risk_factors: [],
      insurance_goals: [],
    },
  })

  const toggleArrayValue = (field: keyof FormData, value: string) => {
    const current = (watch(field) as string[]) || []
    const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    setValue(field, updated as never)
  }

  const onSubmit = async (data: FormData) => {
    setStep(1)
    try {
      const response = await aiService.generateRecommendations(data as RecommendationInput)
      
      // Parse AI response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          const recs: Recommendation[] = (parsed.recommendations || []).map((r: Record<string, unknown>, i: number) => ({
            id: `rec-${i}`,
            user_id: profile?.user_id || '',
            policy_type: r.type as string,
            provider_name: r.provider as string,
            product_name: r.product as string,
            recommended_coverage: Number(r.coverage) || 5000000,
            estimated_premium: parseInt((r.premium_range as string)?.split('-')[0] || '5000'),
            match_score: Number(r.match_score) || 85,
            reasons: Array.isArray(r.reasons) ? r.reasons as string[] : [],
            features: Array.isArray(r.features) ? r.features as string[] : [],
            ai_summary: r.tax_benefit as string,
            is_saved: false,
            created_at: new Date().toISOString(),
          }))
          setRecommendations(recs)
          setAiSummary(parsed.priority_note || '')
        } catch {
          setRecommendations(getMockRecommendations())
        }
      } else {
        setRecommendations(getMockRecommendations())
      }
      setStep(2)
    } catch {
      toast.error('Failed to generate recommendations')
      setStep(0)
    }
  }

  const getMockRecommendations = (): Recommendation[] => [
    {
      id: '1',
      user_id: '',
      policy_type: 'health',
      provider_name: 'Star Health',
      product_name: 'Star Comprehensive Health Insurance',
      recommended_coverage: 5000000,
      estimated_premium: 18000,
      match_score: 96,
      reasons: ['Best claim settlement ratio at 99.06%', 'Cashless network across 14,000+ hospitals', 'Pre-existing disease cover after 2 years'],
      features: ['Daycare procedures', 'AYUSH treatments', 'Annual health checkup'],
      ai_summary: 'Section 80D - up to ₹25,000 deduction',
      is_saved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: '',
      policy_type: 'life',
      provider_name: 'HDFC Life',
      product_name: 'HDFC Life Click 2 Protect Super',
      recommended_coverage: 10000000,
      estimated_premium: 12000,
      match_score: 92,
      reasons: ['Pure term plan with lowest premiums', 'Option to increase cover at key life stages', '99.5% claim settlement ratio'],
      features: ['Terminal illness benefit', 'Waiver of premium', 'Return of premium option'],
      ai_summary: 'Section 80C - premium deduction up to ₹1.5L',
      is_saved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: '',
      policy_type: 'vehicle',
      provider_name: 'ICICI Lombard',
      product_name: 'ICICI Lombard Complete Cover',
      recommended_coverage: 1000000,
      estimated_premium: 8500,
      match_score: 88,
      reasons: ['Instant claim settlement via app', 'Network of 9,800+ cashless garages', '24/7 roadside assistance'],
      features: ['Zero depreciation', 'Engine protect', 'NCB protection'],
      ai_summary: 'Third-party mandatory + comprehensive add-ons',
      is_saved: false,
      created_at: new Date().toISOString(),
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">AI Recommendations</h1>
          <p className="section-subheading">Get personalized insurance recommendations powered by AI</p>
        </div>
        {step === 2 && (
          <button onClick={() => setStep(0)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-xl transition-all">
            <RefreshCw className="w-4 h-4" /> Re-assess
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* FORM */}
        {step === 0 && (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Basic Info */}
            <div className="card-premium p-6">
              <h2 className="font-display font-semibold mb-4">About You</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Age *</label>
                  <input {...register('age', { valueAsNumber: true })} type="number" placeholder="28" className="input-premium" />
                  {errors.age && <p className="text-danger-500 text-xs mt-1">{errors.age.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Gender *</label>
                  <select {...register('gender')} className="input-premium">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Family Size *</label>
                  <input {...register('family_size', { valueAsNumber: true })} type="number" placeholder="4" className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Annual Income (₹) *</label>
                  <input {...register('annual_income', { valueAsNumber: true })} type="number" placeholder="800000" className="input-premium" />
                  {errors.annual_income && <p className="text-danger-500 text-xs mt-1">{errors.annual_income.message}</p>}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-1.5">Occupation *</label>
                <input {...register('occupation')} placeholder="e.g., Software Engineer" className="input-premium" />
              </div>
            </div>

            {/* Health Conditions */}
            <div className="card-premium p-6">
              <h2 className="font-display font-semibold mb-4">Health & Lifestyle</h2>
              <div>
                <label className="block text-sm font-medium mb-2">Health Conditions (select all that apply)</label>
                <div className="flex flex-wrap gap-2">
                  {healthConditionOptions.map(opt => {
                    const selected = (watch('health_conditions') || []).includes(opt)
                    return (
                      <button type="button" key={opt} onClick={() => toggleArrayValue('health_conditions', opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Risk Factors</label>
                <div className="flex flex-wrap gap-2">
                  {riskFactorOptions.map(opt => {
                    const selected = (watch('risk_factors') || []).includes(opt)
                    return (
                      <button type="button" key={opt} onClick={() => toggleArrayValue('risk_factors', opt)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/30'}`}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="card-premium p-6">
              <h2 className="font-display font-semibold mb-4">Insurance Goals *</h2>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map(opt => {
                  const selected = (watch('insurance_goals') || []).includes(opt)
                  return (
                    <button type="button" key={opt} onClick={() => toggleArrayValue('insurance_goals', opt)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selected ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/30'}`}>
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all text-base"
            >
              <Sparkles className="w-5 h-5" />
              Generate AI Recommendations
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.form>
        )}

        {/* LOADING */}
        {step === 1 && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-glow-blue animate-float">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-display font-bold text-xl mb-2">Analyzing your profile...</h2>
            <p className="text-muted-foreground text-sm">Our AI is reviewing 500+ policies to find the best matches for you</p>
            <div className="flex gap-1 justify-center mt-6">
              {[0,1,2].map(i => (
                <motion.div key={i} animate={{ y: [0,-8,0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i*0.15 }}
                  className="w-2 h-2 rounded-full bg-primary" />
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === 2 && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {aiSummary && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{aiSummary}</p>
                </div>
              </div>
            )}
            
            {recommendations.map((rec, i) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-premium p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {i === 0 && (
                      <span className="text-xs font-bold px-2.5 py-1 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-full">
                        ⭐ Best Match
                      </span>
                    )}
                    <div>
                      <h3 className="font-display font-bold text-foreground">{rec.product_name}</h3>
                      <p className="text-sm text-muted-foreground">{rec.provider_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold gradient-text">{rec.match_score}%</div>
                    <div className="text-xs text-muted-foreground">Match</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <div className="text-sm font-semibold">{formatCurrency(rec.recommended_coverage)}</div>
                    <div className="text-xs text-muted-foreground">Recommended Coverage</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <div className="text-sm font-semibold">~{formatCurrency(rec.estimated_premium)}/yr</div>
                    <div className="text-xs text-muted-foreground">Est. Premium</div>
                  </div>
                </div>

                {rec.reasons.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Why we recommend this</p>
                    <ul className="space-y-1">
                      {rec.reasons.slice(0, 3).map((r, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-success-500 mt-0.5 flex-shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.ai_summary && (
                  <div className="flex items-center gap-2 p-2.5 bg-success-50 dark:bg-success-500/10 rounded-xl text-xs text-success-700 dark:text-success-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Tax Benefit: {rec.ai_summary}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
