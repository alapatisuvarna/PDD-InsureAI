import { supabase } from '@/lib/supabase'
import type { Policy, PolicyDocument } from '@/types'

export const policyService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        provider:insurance_providers(*),
        documents:policy_documents(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('policies')
      .select(`
        *,
        provider:insurance_providers(*),
        documents:policy_documents(*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async create(policy: Partial<Policy>) {
    const { data, error } = await supabase
      .from('policies')
      .insert(policy)
      .select()
      .single()
    
    return { data, error }
  },

  async update(id: string, updates: Partial<Policy>) {
    const { data, error } = await supabase
      .from('policies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('policies')
      .delete()
      .eq('id', id)
    
    return { error }
  },

  async uploadDocument(policyId: string, file: File) {
    const fileName = `${policyId}/${Date.now()}-${file.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('policy-documents')
      .upload(fileName, file)
    
    if (uploadError) return { data: null, error: uploadError }
    
    const { data: urlData } = supabase.storage
      .from('policy-documents')
      .getPublicUrl(fileName)
    
    const { data, error } = await supabase
      .from('policy_documents')
      .insert({
        policy_id: policyId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single()
    
    return { data, error }
  },

  async getUpcomingRenewals(userId: string, days = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)
    
    const { data, error } = await supabase
      .from('policies')
      .select('*, provider:insurance_providers(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .lte('end_date', futureDate.toISOString())
      .gte('end_date', new Date().toISOString())
      .order('end_date', { ascending: true })
    
    return { data, error }
  },
}

export const claimService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        policy:policies(*, provider:insurance_providers(*)),
        documents:claim_documents(*),
        timeline:claim_timeline(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('claims')
      .select(`
        *,
        policy:policies(*, provider:insurance_providers(*)),
        documents:claim_documents(*),
        timeline:claim_timeline(*)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async create(claim: Partial<import('@/types').Claim>) {
    const claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}`
    const { data, error } = await supabase
      .from('claims')
      .insert({ ...claim, claim_number: claimNumber, status: 'draft' })
      .select()
      .single()
    
    return { data, error }
  },

  async updateStatus(id: string, status: import('@/types').ClaimStatus, message: string) {
    const { data, error } = await supabase
      .from('claims')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (!error) {
      await supabase.from('claim_timeline').insert({
        claim_id: id,
        status,
        message,
      })
    }
    
    return { data, error }
  },

  async uploadDocument(claimId: string, file: File) {
    const fileName = `${claimId}/${Date.now()}-${file.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('claim-documents')
      .upload(fileName, file)
    
    if (uploadError) return { data: null, error: uploadError }
    
    const { data: urlData } = supabase.storage
      .from('claim-documents')
      .getPublicUrl(fileName)
    
    const { data, error } = await supabase
      .from('claim_documents')
      .insert({
        claim_id: claimId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single()
    
    return { data, error }
  },
}

export const providerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('insurance_providers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('insurance_providers')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async create(provider: Partial<import('@/types').InsuranceProvider>) {
    const { data, error } = await supabase
      .from('insurance_providers')
      .insert(provider)
      .select()
      .single()
    
    return { data, error }
  },

  async update(id: string, updates: Partial<import('@/types').InsuranceProvider>) {
    const { data, error } = await supabase
      .from('insurance_providers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },
}

export const notificationService = {
  async create(notification: Partial<import('@/types').Notification>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()
    
    return { data, error }
  },

  async createPremiumReminder(userId: string, policy: Policy, daysLeft: number) {
    return notificationService.create({
      user_id: userId,
      title: `Premium Due Reminder`,
      message: `Your ${policy.policy_name} premium of ₹${policy.premium_amount.toLocaleString('en-IN')} is due in ${daysLeft} days.`,
      type: 'reminder',
      is_read: false,
      related_id: policy.id,
      related_type: 'policy',
    })
  },
}

export const dashboardService = {
  async getStats(userId: string) {
    const [policiesRes, claimsRes, notificationsRes] = await Promise.all([
      supabase.from('policies').select('*').eq('user_id', userId),
      supabase.from('claims').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false),
    ])
    
    const policies = policiesRes.data || []
    const claims = claimsRes.data || []
    const notifications = notificationsRes.data || []
    
    const activePolicies = policies.filter(p => p.status === 'active')
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const upcomingRenewals = activePolicies.filter(p => {
      const endDate = new Date(p.end_date)
      return endDate >= now && endDate <= thirtyDaysFromNow
    })
    
    const activeClaims = claims.filter(c => 
      ['submitted', 'under_review'].includes(c.status)
    )
    
    const totalCoverage = activePolicies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0)
    const totalPremium = activePolicies.reduce((sum, p) => sum + (p.premium_amount || 0), 0)
    
    return {
      active_policies: activePolicies.length,
      total_coverage: totalCoverage,
      upcoming_renewals: upcomingRenewals.length,
      active_claims: activeClaims.length,
      total_premium_paid: totalPremium,
      risk_score: 42,
      notifications_count: notifications.length,
    }
  },
}
