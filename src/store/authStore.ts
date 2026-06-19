import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string, role?: UserRole) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      session: null,
      isLoading: true,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),

      initialize: async () => {
        try {
          set({ isLoading: true })
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            set({ user: session.user, session })
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single()
            
            if (profile) set({ profile })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
        } finally {
          set({ isLoading: false, isInitialized: true })
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true })
          const { data, error } = await supabase.auth.signInWithPassword({ email, password })
          
          if (error) return { error: error.message }
          
          if (data.user) {
            set({ user: data.user, session: data.session })
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single()
            
            if (profile) set({ profile })
          }
          
          return { error: null }
        } catch {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signUp: async (email, password, fullName, role = 'customer') => {
        try {
          set({ isLoading: true })
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName, role },
            },
          })
          
          if (error) return { error: error.message }
          
          if (data.user) {
            // Profile is created by DB trigger, just fetch it
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single()
            
            if (profile) set({ profile })
            
            set({ user: data.user, session: data.session })
          }
          
          return { error: null }
        } catch {
          return { error: 'An unexpected error occurred' }
        } finally {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null, profile: null, session: null })
      },

      refreshProfile: async () => {
        const { user } = get()
        if (!user) return
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        
        if (profile) set({ profile })
      },

      updateProfile: async (updates) => {
        const { user } = get()
        if (!user) return { error: 'Not authenticated' }
        
        const { data, error } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .select()
          .single()
        
        if (error) return { error: error.message }
        if (data) set({ profile: data })
        
        return { error: null }
      },
    }),
    {
      name: 'insureai-auth',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    }
  )
)
