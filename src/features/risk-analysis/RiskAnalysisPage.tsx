import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { BarChart3, Sparkles, ArrowRight, RefreshCw } from 'lucide-react'
import { aiService } from '@/services/aiService'
import { getRiskColor, getRiskLabel, getRiskBgColor } from '@/lib/utils'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'
import toast from 'react-hot-toast'

interface RiskForm {
  age: number
  gender: string
  occupation: string
  income: number
  smoker: boolean
  frequent_traveller: boolean
  chronic_conditions: boolean
  alcohol: boolean
  exercise: string
  driving_years: number
  accidents: number
}

interface ParsedRisk {
  overall_score: number
  risk_category: string
  health_score: number
  driving_score: number
  financial_score: number
  lifestyle_score: number
  factors: { category: string; factor: string; impact: string; score: number }[]
  recommendations: string[]
  summary: string
}

export default function RiskAnalysisPage() {
  const [riskData, setRiskData] = useState<ParsedRisk | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { register, handleSubmit } = useForm<RiskForm>({
    defaultValues: { exercise: 'moderate', driving_years: 5, accidents: 0 }
  })

  const onSubmit = async (data: RiskForm) => {
    setIsAnalyzing(true)
    try {
      const response = await aiService.analyzeRisk({
        age: Number(data.age),
        gender: data.gender,
        occupation: data.occupation,
        income: Number(data.income),
        health_conditions: [
          ...(data.smoker ? ['Smoker'] : []),
          ...(data.chronic_conditions ? ['Chronic conditions'] : []),
        ],
        lifestyle: [
          `Exercise: ${data.exercise}`,
          ...(data.frequent_traveller ? ['Frequent traveller'] : []),
          ...(data.alcohol ? ['Alcohol consumption'] : []),
        ],
        driving_history: `${data.driving_years} years experience, ${data.accidents} accidents`,
        financial_goals: ['Wealth protection', 'Retirement planning'],
      })

      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setRiskData(parsed)
      } else {
        // Mock data if parsing fails
        setRiskData({
          overall_score: 42,
          risk_category: 'moderate',
          health_score: 35,
          driving_score: 78,
          financial_score: 60,
          lifestyle_score: 55,
          factors: [
            { category: 'health', factor: 'No chronic conditions', impact: 'positive', score: 15 },
            { category: 'driving', factor: 'Clean driving record', impact: 'positive', score: 20 },
            { category: 'financial', factor: 'Stable income', impact: 'positive', score: 10 },
            { category: 'lifestyle', factor: 'Regular exercise', impact: 'positive', score: 8 },
          ],
          recommendations: [
            'Consider a comprehensive health insurance policy',
            'Your driving risk is low — you qualify for NCB discounts',
            'Add a critical illness rider to your existing policies',
          ],
          summary: 'Your overall risk profile is moderate. Focus on building comprehensive health coverage.',
        })
      }
    } catch {
      toast.error('Failed to analyze risk')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const radarData = riskData ? [
    { subject: 'Health', score: 100 - riskData.health_score },
    { subject: 'Driving', score: 100 - riskData.driving_score },
    { subject: 'Financial', score: 100 - riskData.financial_score },
    { subject: 'Lifestyle', score: 100 - riskData.lifestyle_score },
  ] : []

  const categoryData = riskData ? [
    { name: 'Health', score: riskData.health_score, fill: '#ef4444' },
    { name: 'Driving', score: riskData.driving_score, fill: '#f59e0b' },
    { name: 'Financial', score: riskData.financial_score, fill: '#3b82f6' },
    { name: 'Lifestyle', score: riskData.lifestyle_score, fill: '#8b5cf6' },
  ] : []

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="section-heading">Risk Analysis</h1>
        <p className="section-subheading">AI-powered assessment of your insurance risk profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="card-premium p-6">
            <h2 className="font-display font-semibold mb-4">Your Profile</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Age</label>
                  <input {...register('age', { valueAsNumber: true })} type="number" placeholder="28" className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select {...register('gender')} className="input-premium">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Occupation</label>
                <input {...register('occupation')} placeholder="Software Engineer" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Annual Income (₹)</label>
                <input {...register('income', { valueAsNumber: true })} type="number" placeholder="800000" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Exercise Level</label>
                <select {...register('exercise')} className="input-premium">
                  <option value="none">No exercise</option>
                  <option value="light">Light (1-2x/week)</option>
                  <option value="moderate">Moderate (3-4x/week)</option>
                  <option value="intense">Intense (daily)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Driving Experience</label>
                  <input {...register('driving_years', { valueAsNumber: true })} type="number" placeholder="5" className="input-premium" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Past Accidents</label>
                  <input {...register('accidents', { valueAsNumber: true })} type="number" placeholder="0" className="input-premium" />
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'smoker', label: 'I smoke' },
                  { key: 'alcohol', label: 'Regular alcohol consumption' },
                  { key: 'frequent_traveller', label: 'Frequent traveller' },
                  { key: 'chronic_conditions', label: 'Have chronic health conditions' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                    <input {...register(item.key as keyof RiskForm)} type="checkbox" className="w-4 h-4 rounded accent-primary" />
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><BarChart3 className="w-4 h-4" /> Analyze Risk Profile <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!riskData ? (
            <div className="card-premium p-16 text-center h-full flex flex-col items-center justify-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Fill in your profile to see your risk analysis</p>
            </div>
          ) : (
            <>
              {/* Overall Score */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card-premium p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">Overall Risk Score</p>
                <div className={`text-6xl font-display font-black mb-2 ${getRiskColor(riskData.overall_score)}`}>
                  {riskData.overall_score}
                </div>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${getRiskBgColor(riskData.overall_score)} ${getRiskColor(riskData.overall_score)}`}>
                  {getRiskLabel(riskData.overall_score)} Risk
                </div>
                <p className="text-sm text-muted-foreground mt-3">{riskData.summary}</p>
              </motion.div>

              {/* Radar Chart */}
              <div className="card-premium p-5">
                <h3 className="font-semibold mb-3 text-sm">Risk Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.7 }} />
                    <Radar name="Safety" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Category bars */}
              <div className="card-premium p-5">
                <h3 className="font-semibold mb-3 text-sm">Category Scores</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: any) => [`${v}/100`, 'Score']} />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {categoryData.map((entry, index) => (
                        <rect key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              {riskData.recommendations.length > 0 && (
                <div className="card-premium p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">AI Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {riskData.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
