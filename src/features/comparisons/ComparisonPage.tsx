import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Plus, X, CheckCircle, XCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { aiService } from '@/services/aiService'
import { formatCurrency } from '@/lib/utils'
import type { ComparisonItem } from '@/types'
import toast from 'react-hot-toast'

const samplePolicies: ComparisonItem[] = [
  {
    provider_name: 'Star Health',
    product_name: 'Star Comprehensive',
    premium_amount: 18500,
    coverage_amount: 5000000,
    claim_settlement_ratio: 99.06,
    waiting_period: 30,
    deductible: 0,
    benefits: ['Cashless hospitalization', 'Day care procedures', 'AYUSH treatments', 'Maternity cover', 'Annual health checkup', 'Ambulance cover'],
    exclusions: ['Pre-existing diseases (2yr waiting)', 'Cosmetic surgery', 'Self-inflicted injuries'],
    riders: ['Critical illness', 'Personal accident', 'OPD cover'],
    rating: 4.8,
  },
  {
    provider_name: 'HDFC ERGO',
    product_name: 'Optima Secure',
    premium_amount: 21000,
    coverage_amount: 5000000,
    claim_settlement_ratio: 98.05,
    waiting_period: 30,
    deductible: 5000,
    benefits: ['Restore benefit', 'Multiplier benefit', 'Cashless hospitalization', 'Global cover', 'No claim bonus'],
    exclusions: ['Pre-existing diseases (3yr waiting)', 'Non-allopathic treatment', 'War injuries'],
    riders: ['Super restore', 'Critical illness'],
    rating: 4.6,
  },
  {
    provider_name: 'ICICI Lombard',
    product_name: 'Complete Health Insurance',
    premium_amount: 16800,
    coverage_amount: 5000000,
    claim_settlement_ratio: 97.80,
    waiting_period: 30,
    deductible: 0,
    benefits: ['Unlimited restoration', 'Worldwide emergency', 'Mental healthcare', 'OPD consultations', 'Domiciliary hospitalization'],
    exclusions: ['Pre-existing (2yr waiting)', 'Adventure sports injuries', 'Plastic surgery'],
    riders: ['Top-up coverage', 'Personal accident', 'Critical illness'],
    rating: 4.5,
  },
]

const allFeatures = [
  'Cashless hospitalization',
  'Day care procedures',
  'AYUSH treatments',
  'Maternity cover',
  'Annual health checkup',
  'Ambulance cover',
  'Restore benefit',
  'Global cover',
  'OPD cover',
  'Domiciliary hospitalization',
  'Unlimited restoration',
  'Mental healthcare',
]

export default function ComparisonPage() {
  const [selected, setSelected] = useState<number[]>([0, 1])
  const [aiSummary, setAiSummary] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const selectedPolicies = selected.map(i => samplePolicies[i])

  const getAISummary = async () => {
    if (selectedPolicies.length < 2) {
      toast.error('Select at least 2 policies to compare')
      return
    }
    setIsAnalyzing(true)
    try {
      const summary = await aiService.comparePolices(selectedPolicies)
      setAiSummary(summary)
    } catch {
      toast.error('Failed to generate AI comparison')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const togglePolicy = (idx: number) => {
    if (selected.includes(idx)) {
      if (selected.length <= 2) return
      setSelected(selected.filter(i => i !== idx))
    } else {
      if (selected.length >= 4) {
        toast.error('Maximum 4 policies can be compared')
        return
      }
      setSelected([...selected, idx])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-heading">Policy Comparison</h1>
        <p className="section-subheading">Compare policies side-by-side to make informed decisions</p>
      </div>

      {/* Policy selector */}
      <div className="card-premium p-4">
        <p className="text-sm font-medium mb-3">Select policies to compare (2-4)</p>
        <div className="flex flex-wrap gap-2">
          {samplePolicies.map((p, i) => (
            <button
              key={i}
              onClick={() => togglePolicy(i)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                selected.includes(i)
                  ? 'border-primary bg-primary/5 text-primary font-medium'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className={`w-4 h-4 rounded-full ${selected.includes(i) ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                {selected.includes(i) && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              {p.provider_name} — {p.product_name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedPolicies.length >= 2 && (
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground w-40">Feature</th>
                  {selectedPolicies.map((p, i) => (
                    <th key={i} className="p-4 text-center min-w-48">
                      <div className="font-display font-semibold text-foreground">{p.provider_name}</div>
                      <div className="text-xs text-muted-foreground">{p.product_name}</div>
                      {i === 0 && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-full">
                          ⭐ Best Value
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Key metrics */}
                {[
                  { label: 'Annual Premium', key: 'premium_amount', format: (v: number) => formatCurrency(v) },
                  { label: 'Coverage Amount', key: 'coverage_amount', format: (v: number) => formatCurrency(v) },
                  { label: 'Claim Settlement', key: 'claim_settlement_ratio', format: (v: number) => `${v}%` },
                  { label: 'Waiting Period', key: 'waiting_period', format: (v: number) => `${v} days` },
                  { label: 'Deductible', key: 'deductible', format: (v: number) => v === 0 ? 'None' : formatCurrency(v) },
                  { label: 'Rating', key: 'rating', format: (v: number) => `${v}/5 ⭐` },
                ].map(row => (
                  <tr key={row.key} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-sm text-muted-foreground font-medium">{row.label}</td>
                    {selectedPolicies.map((p, i) => (
                      <td key={i} className="p-4 text-center text-sm font-semibold text-foreground">
                        {row.format((p as any)[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Features */}
                <tr className="bg-muted/20">
                  <td colSpan={selectedPolicies.length + 1} className="p-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Features & Coverage
                  </td>
                </tr>
                {allFeatures.map(feature => (
                  <tr key={feature} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-3 px-4 text-sm text-muted-foreground">{feature}</td>
                    {selectedPolicies.map((p, i) => (
                      <td key={i} className="p-3 text-center">
                        {p.benefits.some(b => b.toLowerCase().includes(feature.toLowerCase())) ? (
                          <CheckCircle className="w-5 h-5 text-success-500 mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Riders */}
                <tr className="bg-muted/20">
                  <td colSpan={selectedPolicies.length + 1} className="p-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Available Riders
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="p-3 px-4 text-sm text-muted-foreground">Riders</td>
                  {selectedPolicies.map((p, i) => (
                    <td key={i} className="p-3 text-center">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {p.riders.map(r => (
                          <span key={r} className="text-xs badge-info">{r}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Comparison Button */}
      <button
        onClick={getAISummary}
        disabled={isAnalyzing || selectedPolicies.length < 2}
        className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
      >
        <Sparkles className="w-5 h-5" />
        {isAnalyzing ? 'AI is analyzing...' : 'Get AI Comparison Summary'}
      </button>

      {/* AI Summary */}
      {aiSummary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-premium p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="font-display font-semibold">AI Analysis</h3>
          </div>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{aiSummary}</p>
        </motion.div>
      )}
    </div>
  )
}
