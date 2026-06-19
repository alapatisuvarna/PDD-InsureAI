import { useEffect, useState } from 'react'
import { Plus, Building2, Star, Edit, Trash2 } from 'lucide-react'
import { providerService } from '@/services'
import type { InsuranceProvider } from '@/types'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminProviders() {
  const [providers, setProviders] = useState<InsuranceProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', claim_settlement_ratio: 95, established_year: 2000, headquarters: '', website: '' })

  useEffect(() => { loadProviders() }, [])

  const loadProviders = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('insurance_providers').select('*').order('name')
    setProviders(data || [])
    setIsLoading(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await providerService.create({ ...form, is_active: true })
    if (error) toast.error('Failed to create provider')
    else { toast.success('Provider added!'); setShowForm(false); loadProviders() }
  }

  const toggleActive = async (provider: InsuranceProvider) => {
    const { error } = await providerService.update(provider.id, { is_active: !provider.is_active })
    if (!error) loadProviders()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">Provider Management</h1>
          <p className="section-subheading">Manage insurance providers on the platform</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all">
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card-premium p-6">
          <h2 className="font-display font-semibold mb-4">Add New Provider</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Provider Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="ICICI Lombard" className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Claim Settlement Ratio (%)</label>
              <input type="number" value={form.claim_settlement_ratio} onChange={e => setForm({...form, claim_settlement_ratio: Number(e.target.value)})} className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Headquarters</label>
              <input value={form.headquarters} onChange={e => setForm({...form, headquarters: e.target.value})} placeholder="Mumbai" className="input-premium" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Website</label>
              <input value={form.website} onChange={e => setForm({...form, website: e.target.value})} placeholder="https://example.com" className="input-premium" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="input-premium resize-none" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:shadow-glow-blue transition-all text-sm">Add Provider</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-border rounded-xl text-sm hover:bg-accent">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Providers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length:6}).map((_,i) => <div key={i} className="h-40 skeleton-shimmer rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(provider => (
            <div key={provider.id} className="card-premium p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white font-bold text-sm">
                  {provider.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(provider)} className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${provider.is_active ? 'badge-active' : 'bg-gray-100 text-gray-600'}`}>
                    {provider.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{provider.name}</h3>
              {provider.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{provider.description}</p>}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {provider.claim_settlement_ratio && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {provider.claim_settlement_ratio}% CSR
                  </span>
                )}
                {provider.headquarters && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {provider.headquarters}
                  </span>
                )}
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <div className="col-span-3 card-premium p-12 text-center">
              <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No providers added yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
