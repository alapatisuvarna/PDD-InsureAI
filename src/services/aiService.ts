import { groqClient, GROQ_MODEL, INSURANCE_SYSTEM_PROMPT } from '@/lib/groq'
import type { ChatMessage, RecommendationInput, RiskAssessment, ComparisonItem } from '@/types'

export const aiService = {
  async chat(messages: ChatMessage[], userMessage: string): Promise<string> {
    const formattedMessages = [
      { role: 'system' as const, content: INSURANCE_SYSTEM_PROMPT },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user' as const, content: userMessage },
    ]

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1024,
    })

    return response.choices[0]?.message?.content || 'Sorry, I could not process your request.'
  },

  async generateRecommendations(input: RecommendationInput): Promise<string> {
    const prompt = `Based on the following customer profile, provide detailed insurance recommendations:

Customer Profile:
- Age: ${input.age}
- Gender: ${input.gender}
- Occupation: ${input.occupation}
- Annual Income: ₹${input.annual_income.toLocaleString('en-IN')}
- Family Size: ${input.family_size} members
- Existing Insurance: ${input.existing_insurance.join(', ') || 'None'}
- Health Conditions: ${input.health_conditions.join(', ') || 'None'}
- Vehicle: ${input.vehicle_details || 'None'}
- Risk Factors: ${input.risk_factors.join(', ') || 'None'}
- Insurance Goals: ${input.insurance_goals.join(', ')}

Please provide:
1. Top 3-5 recommended insurance products with specific providers (Indian market)
2. Recommended coverage amounts for each
3. Estimated premium ranges
4. Coverage gaps identified
5. Priority order for purchasing
6. Key features to look for
7. Tax benefits available

Format as a structured JSON response with:
{
  "recommendations": [
    {
      "rank": 1,
      "type": "health/life/vehicle/travel",
      "provider": "Provider Name",
      "product": "Product Name",
      "coverage": 5000000,
      "premium_range": "5000-8000 per year",
      "match_score": 95,
      "reasons": ["reason1", "reason2"],
      "features": ["feature1", "feature2"],
      "tax_benefit": "Section 80D"
    }
  ],
  "coverage_gaps": ["gap1", "gap2"],
  "priority_note": "explanation",
  "risk_assessment": "brief risk profile"
}`

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSURANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    })

    return response.choices[0]?.message?.content || '{}'
  },

  async analyzeRisk(profileData: {
    age: number
    gender: string
    occupation: string
    income: number
    health_conditions: string[]
    lifestyle: string[]
    driving_history: string
    financial_goals: string[]
  }): Promise<string> {
    const prompt = `Analyze the insurance risk profile for this customer and provide a detailed risk assessment:

Customer Data:
- Age: ${profileData.age}
- Gender: ${profileData.gender}
- Occupation: ${profileData.occupation}
- Annual Income: ₹${profileData.income.toLocaleString('en-IN')}
- Health Conditions: ${profileData.health_conditions.join(', ') || 'None'}
- Lifestyle Factors: ${profileData.lifestyle.join(', ')}
- Driving History: ${profileData.driving_history}
- Financial Goals: ${profileData.financial_goals.join(', ')}

Provide a comprehensive risk analysis in JSON format:
{
  "overall_score": 65,
  "risk_category": "moderate",
  "health_score": 70,
  "driving_score": 80,
  "financial_score": 55,
  "lifestyle_score": 60,
  "factors": [
    {"category": "health", "factor": "description", "impact": "positive/negative/neutral", "score": 10}
  ],
  "recommendations": ["rec1", "rec2"],
  "summary": "brief overall assessment"
}`

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSURANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 1500,
    })

    return response.choices[0]?.message?.content || '{}'
  },

  async comparePolices(policies: ComparisonItem[]): Promise<string> {
    const prompt = `Compare these insurance policies and provide an objective analysis:

${policies.map((p, i) => `
Policy ${i + 1}: ${p.provider_name} - ${p.product_name}
- Premium: ₹${p.premium_amount.toLocaleString('en-IN')}/year
- Coverage: ₹${p.coverage_amount.toLocaleString('en-IN')}
- Claim Settlement: ${p.claim_settlement_ratio}%
- Waiting Period: ${p.waiting_period || 0} days
- Deductible: ₹${p.deductible || 0}
- Key Benefits: ${p.benefits.join(', ')}
- Exclusions: ${p.exclusions.join(', ')}
`).join('\n')}

Provide:
1. Best value pick with reasoning
2. Pros and cons of each
3. Who each policy is best suited for
4. Key differentiators
5. Final recommendation

Keep analysis practical and India-market focused.`

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSURANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 1500,
    })

    return response.choices[0]?.message?.content || ''
  },

  async summarizePolicy(policyText: string): Promise<string> {
    const prompt = `Summarize this insurance policy document in simple, easy-to-understand language:

${policyText}

Provide:
1. What is covered (bullet points)
2. What is NOT covered (exclusions)
3. How to file a claim
4. Key dates and deadlines
5. Important conditions
6. Simple language summary (2-3 sentences)

Format clearly with sections.`

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSURANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    })

    return response.choices[0]?.message?.content || ''
  },

  async getClaimGuidance(claimType: string, policyType: string, situation: string): Promise<string> {
    const prompt = `Guide this customer through filing an insurance claim:

Claim Type: ${claimType}
Policy Type: ${policyType}
Situation: ${situation}

Provide step-by-step guidance including:
1. Immediate steps to take
2. Documents required
3. How to file the claim
4. Timeline expectations
5. Do's and Don'ts
6. Tips to avoid claim rejection

Be specific and practical for the Indian insurance market.`

    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: INSURANCE_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    })

    return response.choices[0]?.message?.content || ''
  },
}
