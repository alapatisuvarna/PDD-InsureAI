import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { supabase } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import LoadingScreen from '@/components/common/LoadingScreen'

// Lazy load all pages
const LandingPage = lazy(() => import('@/features/auth/LandingPage'))
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const PoliciesPage = lazy(() => import('@/features/policies/PoliciesPage'))
const PolicyDetailPage = lazy(() => import('@/features/policies/PolicyDetailPage'))
const AddPolicyPage = lazy(() => import('@/features/policies/AddPolicyPage'))
const ClaimsPage = lazy(() => import('@/features/claims/ClaimsPage'))
const ClaimDetailPage = lazy(() => import('@/features/claims/ClaimDetailPage'))
const CreateClaimPage = lazy(() => import('@/features/claims/CreateClaimPage'))
const RecommendationsPage = lazy(() => import('@/features/recommendations/RecommendationsPage'))
const ComparisonPage = lazy(() => import('@/features/comparisons/ComparisonPage'))
const RiskAnalysisPage = lazy(() => import('@/features/risk-analysis/RiskAnalysisPage'))
const NotificationsPage = lazy(() => import('@/features/notifications/NotificationsPage'))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'))
const AdminDashboard = lazy(() => import('@/features/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('@/features/admin/AdminUsers'))
const AdminProviders = lazy(() => import('@/features/admin/AdminProviders'))
const AdminClaims = lazy(() => import('@/features/admin/AdminClaims'))
const AdminReports = lazy(() => import('@/features/admin/AdminReports'))
const AgentDashboard = lazy(() => import('@/features/agent/AgentDashboard'))
const AgentCustomers = lazy(() => import('@/features/agent/AgentCustomers'))

function ProtectedRoute({ children, allowedRoles }: { 
  children: React.ReactNode
  allowedRoles?: string[] 
}) {
  const { user, profile, isLoading } = useAuthStore()
  
  if (isLoading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore()
  if (isLoading) return <LoadingScreen />
  if (user) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { initialize } = useAuthStore()
  const { applyTheme } = useUIStore()

  useEffect(() => {
    applyTheme()
    initialize()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const store = useAuthStore.getState()
        if (event === 'SIGNED_OUT') {
          store.setUser(null)
          store.setProfile(null)
          store.setSession(null)
        } else if (session?.user) {
          store.setUser(session.user)
          store.setSession(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          },
        }}
      />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected customer/agent/admin routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Policies */}
            <Route path="policies" element={<PoliciesPage />} />
            <Route path="policies/add" element={<AddPolicyPage />} />
            <Route path="policies/:id" element={<PolicyDetailPage />} />
            
            {/* Claims */}
            <Route path="claims" element={<ClaimsPage />} />
            <Route path="claims/create" element={<CreateClaimPage />} />
            <Route path="claims/:id" element={<ClaimDetailPage />} />
            
            {/* AI Features */}
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="compare" element={<ComparisonPage />} />
            <Route path="risk-analysis" element={<RiskAnalysisPage />} />
            
            {/* Profile & Notifications */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="admin/providers" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminProviders />
              </ProtectedRoute>
            } />
            <Route path="admin/claims" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClaims />
              </ProtectedRoute>
            } />
            <Route path="admin/reports" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReports />
              </ProtectedRoute>
            } />

            {/* Agent routes */}
            <Route path="agent" element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <AgentDashboard />
              </ProtectedRoute>
            } />
            <Route path="agent/customers" element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <AgentCustomers />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
