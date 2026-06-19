import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (userId) => {
    set({ isLoading: true })
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) {
      set({
        notifications: data,
        unreadCount: data.filter(n => !n.is_read).length,
      })
    }
    set({ isLoading: false })
  },

  markAsRead: async (id) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
    
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))
  },

  markAllAsRead: async (userId) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }))
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  removeNotification: (id) => {
    const { notifications } = get()
    const notification = notifications.find(n => n.id === id)
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
      unreadCount: notification && !notification.is_read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount,
    }))
  },
}))
