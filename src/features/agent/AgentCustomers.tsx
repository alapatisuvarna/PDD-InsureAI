import { useState } from 'react'
import { Search, Users, Shield, FileText, Phone, Mail } from 'lucide-react'
import { getInitials } from '@/lib/utils'

const mockCustomers = [
  { id: '1', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 98765 43210', policies: 3, claims: 1, status: 'active' },
  { id: '2', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 87654 32109', policies: 2, claims: 0, status: 'active' },
  { id: '3', name: 'Anita Patel', email: 'anita@example.com', phone: '+91 76543 21098', policies: 4, claims: 2, status: 'active' },
  { id: '4', name: 'Suresh Mehta', email: 'suresh@example.com', phone: '+91 65432 10987', policies: 1, claims: 1, status: 'inactive' },
]

export default function AgentCustomers() {
  const [search, setSearch] = useState('')
  const filtered = mockCustomers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search)
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">My Customers</h1>
        <p className="section-subheading">{mockCustomers.length} customers assigned to you</p>
      </div>

      <div className="card-premium p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="input-premium pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(customer => (
          <div key={customer.id} className="card-premium p-5 hover:shadow-card-hover transition-all cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white font-bold">
                {getInitials(customer.name)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{customer.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${customer.status === 'active' ? 'badge-active' : 'bg-gray-100 text-gray-600'}`}>
                    {customer.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="flex items-center gap-1 text-brand-600"><Shield className="w-3 h-3" />{customer.policies} policies</span>
                  <span className="flex items-center gap-1 text-warning-600"><FileText className="w-3 h-3" />{customer.claims} claims</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">View Policies</button>
              <button className="flex-1 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">View Claims</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
