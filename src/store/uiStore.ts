import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  searchQuery: string
  searchOpen: boolean
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleTheme: () => void
  toggleSidebar: () => void
  setSidebarMobileOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setSearchOpen: (open: boolean) => void
  applyTheme: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      searchQuery: '',
      searchOpen: false,

      setTheme: (theme) => {
        set({ theme })
        get().applyTheme()
      },

      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        get().applyTheme()
      },

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarMobileOpen: (sidebarMobileOpen) => set({ sidebarMobileOpen }),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      setSearchOpen: (searchOpen) => set({ searchOpen }),

      applyTheme: () => {
        const { theme } = get()
        const root = document.documentElement
        if (theme === 'dark') {
          root.classList.add('dark')
        } else if (theme === 'light') {
          root.classList.remove('dark')
        } else {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          isDark ? root.classList.add('dark') : root.classList.remove('dark')
        }
      },
    }),
    {
      name: 'insureai-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)
