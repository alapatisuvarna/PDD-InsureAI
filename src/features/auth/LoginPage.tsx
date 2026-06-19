import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    const { error } = await signIn(data.email, data.password)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    }
  }

  // Demo accounts
  const demoAccounts = [
    { label: 'Customer Demo', email: 'customer@demo.com', role: 'customer' },
    { label: 'Admin Demo', email: 'admin@demo.com', role: 'admin' },
    { label: 'Agent Demo', email: 'agent@demo.com', role: 'agent' },
  ]

  const loginAsDemo = async (email: string) => {
    const { error } = await signIn(email, 'Demo@12345')
    if (error) {
      toast.error('Demo account not set up. Please register first.')
    } else {
      toast.success('Welcome to InsureAI!')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - visual */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 50%)'
        }} />
        {/* Floating cards */}
        <div className="relative z-10 text-white max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="font-display font-bold text-2xl">InsureAI</span>
            </div>
            <h2 className="text-4xl font-display font-black mb-4 leading-tight">
              Your Smart Insurance<br />Command Center
            </h2>
            <p className="text-white/70 mb-10 leading-relaxed">
              Manage all your policies, track claims, and get AI-powered insurance advice — all in one place.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {[
                'AI chatbot for instant insurance answers',
                'Compare 500+ policies from top insurers',
                'Real-time claim tracking & guidance',
                'Smart premium reminders',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[
                { val: '50L+', label: 'Users' },
                { val: '99.2%', label: 'Uptime' },
                { val: '₹0', label: 'Hidden fees' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
                  <div className="text-xl font-bold">{stat.val}</div>
                  <div className="text-white/60 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Animated circles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 right-10 w-32 h-32 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-10 left-10 w-48 h-48 rounded-full border border-white/5"
        />
      </div>

      {/* Right panel - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">InsureAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your InsureAI account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className="input-premium pl-10"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-premium pl-10 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue hover:scale-[1.02] active:scale-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or try a demo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo accounts */}
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.role}
                onClick={() => loginAsDemo(acc.email)}
                disabled={isLoading}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-xs font-medium text-muted-foreground hover:text-primary disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {acc.label}
              </button>
            ))}
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
