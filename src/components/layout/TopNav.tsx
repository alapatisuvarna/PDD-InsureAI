import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Bell, Search, Menu, Settings, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cn, getInitials } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function TopNav() {
  const { profile, signOut } = useAuthStore()
  const { theme, toggleTheme, setSidebarMobileOpen } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const getPageTitle = () => {
    const path = window.location.pathname
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/policies': 'My Policies',
      '/claims': 'Claims',
      '/ai-assistant': 'AI Assistant',
      '/recommendations': 'AI Recommendations',
      '/compare': 'Policy Comparison',
      '/risk-analysis': 'Risk Analysis',
      '/notifications': 'Notifications',
      '/profile': 'My Profile',
      '/admin': 'Admin Overview',
      '/admin/users': 'User Management',
      '/admin/providers': 'Provider Management',
      '/admin/claims': 'Claims Management',
      '/admin/reports': 'Reports & Analytics',
      '/agent': 'Agent Overview',
      '/agent/customers': 'My Customers',
    }
    return titles[path] || 'InsureAI'
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast('Search coming soon! Use AI Assistant for intelligent search.', { icon: '🔍' })
    }
  }

  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarMobileOpen(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="hidden sm:block font-display font-semibold text-foreground">
        {getPageTitle()}
      </h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search policies, claims..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} /> : <Moon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        >
          <Bell style={{ width: 18, height: 18 }} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-accent transition-colors',
              profileOpen && 'bg-accent'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white text-xs font-bold">
              {getInitials(profile?.full_name || 'U')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-none">{profile?.full_name?.split(' ')[0] || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize mt-0.5">{profile?.role || 'customer'}</p>
            </div>
            <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-2xl shadow-lg overflow-hidden animate-scale-in z-50">
              {/* Profile header */}
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <p className="font-medium text-sm">{profile?.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary capitalize">
                  {profile?.role}
                </span>
              </div>
              
              {/* Menu items */}
              <div className="p-1">
                <button
                  onClick={() => { navigate('/profile'); setProfileOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors text-left"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  My Profile
                </button>
                <button
                  onClick={() => { navigate('/notifications'); setProfileOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors text-left"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto text-xs bg-danger-500 text-white rounded-full px-1.5 py-0.5">{unreadCount}</span>
                  )}
                </button>
                {profile?.role === 'admin' && (
                  <button
                    onClick={() => { navigate('/admin'); setProfileOpen(false) }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-accent transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Admin Panel
                  </button>
                )}
              </div>
              
              <div className="p-1 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-danger-50 dark:hover:bg-danger-500/10 text-danger-600 dark:text-danger-400 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
