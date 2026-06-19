export type UserRole = 'customer' | 'agent' | 'admin'
export type PolicyType = 'health' | 'life' | 'vehicle' | 'travel' | 'property' | 'business'
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending'
export type ClaimStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'settled'
export type NotificationType = 'reminder' | 'alert' | 'info' | 'success' | 'warning'
export type RiskCategory = 'low' | 'moderate' | 'high' | 'critical'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  occupation?: string
  annual_income?: number
  address?: Address
  nominee?: Nominee
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected'
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Address {
  street?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface Nominee {
  name: string
  relationship: string
  date_of_birth?: string
  percentage?: number
}

export interface InsuranceProvider {
  id: string
  name: string
  logo_url?: string
  description?: string
  claim_settlement_ratio?: number
  solvency_ratio?: number
  established_year?: number
  headquarters?: string
  customer_support?: string
  website?: string
  is_active: boolean
  created_at: string
}

export interface Policy {
  id: string
  user_id: string
  provider_id: string
  provider?: InsuranceProvider
  policy_number: string
  policy_type: PolicyType
  policy_name: string
  description?: string
  premium_amount: number
  coverage_amount: number
  start_date: string
  end_date: string
  status: PolicyStatus
  deductible?: number
  waiting_period?: number
  riders?: string[]
  benefits?: string[]
  exclusions?: string[]
  documents?: PolicyDocument[]
  created_at: string
  updated_at: string
}

export interface PolicyDocument {
  id: string
  policy_id: string
  file_name: string
  file_url: string
  file_size?: number
  file_type?: string
  uploaded_at: string
}

export interface Claim {
  id: string
  user_id: string
  policy_id: string
  policy?: Policy
  claim_number: string
  claim_type: string
  description: string
  claim_amount: number
  settled_amount?: number
  status: ClaimStatus
  incident_date: string
  submitted_date?: string
  documents?: ClaimDocument[]
  timeline?: ClaimTimeline[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface ClaimDocument {
  id: string
  claim_id: string
  file_name: string
  file_url: string
  file_size?: number
  file_type?: string
  uploaded_at: string
}

export interface ClaimTimeline {
  id: string
  claim_id: string
  status: ClaimStatus
  message: string
  created_at: string
  created_by?: string
}

export interface PremiumPayment {
  id: string
  policy_id: string
  policy?: Policy
  amount: number
  payment_date: string
  payment_method?: string
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed'
  receipt_url?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  action_url?: string
  related_id?: string
  related_type?: 'policy' | 'claim' | 'payment' | 'recommendation'
  created_at: string
}

export interface RiskAssessment {
  id: string
  user_id: string
  health_score: number
  driving_score: number
  financial_score: number
  lifestyle_score: number
  overall_score: number
  risk_category: RiskCategory
  factors: RiskFactor[]
  recommendations: string[]
  created_at: string
}

export interface RiskFactor {
  category: string
  factor: string
  impact: 'positive' | 'negative' | 'neutral'
  score: number
}

export interface Recommendation {
  id: string
  user_id: string
  assessment_id?: string
  policy_type: PolicyType
  provider_name: string
  product_name: string
  recommended_coverage: number
  estimated_premium: number
  match_score: number
  reasons: string[]
  features: string[]
  ai_summary?: string
  is_saved: boolean
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
}

export interface PolicyComparison {
  policies: ComparisonItem[]
  ai_summary?: string
  best_value_id?: string
}

export interface ComparisonItem {
  provider_name: string
  product_name: string
  premium_amount: number
  coverage_amount: number
  claim_settlement_ratio: number
  waiting_period?: number
  deductible?: number
  benefits: string[]
  exclusions: string[]
  riders: string[]
  rating?: number
}

export interface DashboardStats {
  active_policies: number
  total_coverage: number
  upcoming_renewals: number
  active_claims: number
  total_premium_paid: number
  risk_score: number
  notifications_count: number
}

export interface RecommendationInput {
  age: number
  gender: 'male' | 'female' | 'other'
  occupation: string
  annual_income: number
  family_size: number
  existing_insurance: string[]
  health_conditions: string[]
  vehicle_details?: string
  risk_factors: string[]
  insurance_goals: string[]
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  created_at: string
}

// Database types (simplified — Supabase generates these but we define them manually)
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      insurance_providers: { Row: InsuranceProvider; Insert: Partial<InsuranceProvider>; Update: Partial<InsuranceProvider> }
      policies: { Row: Policy; Insert: Partial<Policy>; Update: Partial<Policy> }
      policy_documents: { Row: PolicyDocument; Insert: Partial<PolicyDocument>; Update: Partial<PolicyDocument> }
      claims: { Row: Claim; Insert: Partial<Claim>; Update: Partial<Claim> }
      claim_documents: { Row: ClaimDocument; Insert: Partial<ClaimDocument>; Update: Partial<ClaimDocument> }
      claim_timeline: { Row: ClaimTimeline; Insert: Partial<ClaimTimeline>; Update: Partial<ClaimTimeline> }
      premium_payments: { Row: PremiumPayment; Insert: Partial<PremiumPayment>; Update: Partial<PremiumPayment> }
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> }
      risk_assessments: { Row: RiskAssessment; Insert: Partial<RiskAssessment>; Update: Partial<RiskAssessment> }
      recommendations: { Row: Recommendation; Insert: Partial<Recommendation>; Update: Partial<Recommendation> }
      chat_sessions: { Row: ChatSession; Insert: Partial<ChatSession>; Update: Partial<ChatSession> }
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
