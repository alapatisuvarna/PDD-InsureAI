import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, CheckCheck, Shield, FileText, Sparkles, AlertTriangle, Info, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification, NotificationType } from '@/types'

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  reminder: { icon: Clock, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-500/10' },
  alert: { icon: AlertTriangle, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10' },
  info: { icon: Info, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-500/10' },
  success: { icon: CheckCheck, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
  warning: { icon: AlertTriangle, color: 'text-warning-500', bg: 'bg-warning-50 dark:bg-warning-500/10' },
}

export default function NotificationsPage() {
  const { profile } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (profile?.user_id) fetchNotifications(profile.user_id)
  }, [profile])

  const filtered = notifications.filter(n => filter === 'all' || !n.is_read)

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) markAsRead(n.id)
    if (n.action_url) navigate(n.action_url)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-heading">Notifications</h1>
          <p className="section-subheading">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => profile?.user_id && markAllAsRead(profile.user_id)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filtered.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-display font-semibold mb-2">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filter === 'unread' ? 'You have no unread notifications' : "We'll notify you about important updates"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const config = typeConfig[notif.type]
            const Icon = config.icon
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => handleNotificationClick(notif)}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-card-hover ${
                  !notif.is_read
                    ? 'bg-card border-primary/20 hover:border-primary/40'
                    : 'bg-card border-border/50 hover:border-border'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${!notif.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </p>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{formatRelativeTime(notif.created_at)}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
