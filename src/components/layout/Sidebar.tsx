import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Shield, FileText, Bot, Sparkles, GitCompare,
  BarChart3, Bell, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Users, Building2, ClipboardList, TrendingUp, Briefcase, X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useNotificationStore } from '@/store/notificationStore'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const customerNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Shield, label: 'My Policies', path: '/policies' },
  { icon: FileText, label: 'Claims', path: '/claims' },
  { icon: Sparkles, label: 'Recommendations', path: '/recommendations' },
  { icon: GitCompare, label: 'Compare Policies', path: '/compare' },
  { icon: BarChart3, label: 'Risk Analysis', path: '/risk-analysis' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const adminNav = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Building2, label: 'Providers', path: '/admin/providers' },
  { icon: ClipboardList, label: 'Claims', path: '/admin/claims' },
  { icon: TrendingUp, label: 'Reports', path: '/admin/reports' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
]

const agentNav = [
  { icon: Briefcase, label: 'Agent Overview', path: '/agent' },
  { icon: Users, label: 'My Customers', path: '/agent/customers' },
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: User, label: 'Profile', path: '/profile' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuthStore()
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setSidebarMobileOpen } = useUIStore()
  const { unreadCount } = useNotificationStore()
  const navigate = useNavigate()

  const navItems = profile?.role === 'admin' ? adminNav 
    : profile?.role === 'agent' ? agentNav 
    : customerNav

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-border/50',
        sidebarCollapsed ? 'justify-center px-2' : ''
      )}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center shadow-glow-blue">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-display font-bold text-lg gradient-text">InsureAI</span>
              <p className="text-[10px] text-muted-foreground -mt-0.5 font-medium uppercase tracking-wider">
                {profile?.role === 'admin' ? 'Admin Portal' : profile?.role === 'agent' ? 'Agent Portal' : 'Smart Protection'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto no-scrollbar space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin' || item.path === '/agent'}
            onClick={() => setSidebarMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow-blue'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('w-4.5 h-4.5 flex-shrink-0', sidebarCollapsed ? '' : '')} style={{ width: 18, height: 18 }} />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Notification badge */}
                {item.path === '/notifications' && unreadCount > 0 && (
                  <span className={cn(
                    'flex items-center justify-center text-[10px] font-bold rounded-full bg-danger-500 text-white min-w-[18px] h-[18px] px-1',
                    sidebarCollapsed ? 'absolute -top-1 -right-1' : ''
                  )}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs font-medium text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile + Sign Out */}
      <div className="border-t border-border/50 p-3 space-y-1">
        {/* Profile */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          sidebarCollapsed ? 'justify-center' : ''
        )}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {getInitials(profile?.full_name || 'U')}
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                <p className="text-xs text-muted-foreground capitalize">{profile?.role || 'customer'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all duration-200 group',
            sidebarCollapsed ? 'justify-center' : ''
          )}
        >
          <LogOut style={{ width: 18, height: 18 }} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
          {sidebarCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover border border-border rounded-lg text-xs font-medium text-popover-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
              Sign Out
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-md items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full bg-card border-r border-border/50 shadow-sm z-30 overflow-hidden relative"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border/50 shadow-2xl z-50 lg:hidden"
            >
              <button
                onClick={() => setSidebarMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
