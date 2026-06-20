import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopNav from './TopNav'
import AIAssistantWidget from '@/features/ai-assistant/AIAssistantWidget'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'

export default function AppShell() {
  const { sidebarCollapsed } = useUIStore()

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar />
      <div className={cn(
        'flex flex-col flex-1 overflow-hidden transition-all duration-300',
        sidebarCollapsed ? 'ml-0 lg:ml-16' : 'ml-0 lg:ml-64'
      )}>
        <TopNav />
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-in pb-24">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Global AI Assistant Chat Widget */}
      <AIAssistantWidget />
    </div>
  )
}
