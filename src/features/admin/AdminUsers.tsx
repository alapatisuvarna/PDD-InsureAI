import { useEffect, useState } from 'react'
import { Search, UserCheck, UserX, Mail, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, getInitials } from '@/lib/utils'
import { SkeletonTable } from '@/components/common/Skeleton'
import type { Profile, UserRole } from '@/types'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setIsLoading(false)
  }

  const updateRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('user_id', userId)
    if (error) toast.error('Failed to update role')
    else { toast.success('Role updated!'); loadUsers() }
  }

  const filtered = users
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-heading">User Management</h1>
        <p className="section-subheading">{users.length} total users on the platform</p>
      </div>

      {/* Filters */}
      <div className="card-premium p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-premium pl-9" />
        </div>
        <div className="flex gap-2">
          {(['all', 'customer', 'agent', 'admin'] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all capitalize ${roleFilter === r ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <SkeletonTable rows={6} /> : (
        <div className="card-premium overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Email</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">KYC</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(user.full_name || 'U')}
                      </div>
                      <span className="text-sm font-medium">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground hidden sm:table-cell">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={e => updateRole(user.user_id, e.target.value as UserRole)}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-background"
                    >
                      <option value="customer">Customer</option>
                      <option value="agent">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      user.kyc_status === 'verified' ? 'badge-active' : 'badge-pending'
                    }`}>{user.kyc_status}</span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground hidden lg:table-cell">{formatDate(user.created_at)}</td>
                  <td className="p-4">
                    <button className="text-xs text-primary hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  )
}
