import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Eye, EyeOff, Lock, Mail, User, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'
import toast from 'react-hot-toast'

const step1Schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
})

type Step1Form = z.infer<typeof step1Schema>

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
  { value: 'customer', label: 'Individual / Family', description: 'Manage personal insurance policies and claims', icon: '👤' },
  { value: 'agent', label: 'Insurance Agent', description: 'Manage customer policies and assist with claims', icon: '💼' },
  { value: 'admin', label: 'Platform Admin', description: 'Full access to manage the entire platform', icon: '⚙️' },
]

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { signUp, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
  })

  const handleStep1 = async () => {
    const valid = await trigger(['full_name', 'email', 'password', 'confirm_password'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: Step1Form) => {
    const { error } = await signUp(data.email, data.password, data.full_name, selectedRole)
    if (error) {
      toast.error(error)
    } else {
      setStep(3)
      toast.success('Account created successfully! 🎉')
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left visual panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.4) 0%, transparent 50%)'
        }} />
        <div className="relative z-10 text-white max-w-md">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <span className="font-display font-bold text-2xl">InsureAI</span>
            </div>
            <h2 className="text-4xl font-display font-black mb-4 leading-tight">
              Join India's Smartest<br />Insurance Platform
            </h2>
            <p className="text-white/70 mb-8 leading-relaxed">
              Free to join. No hidden charges. Get AI-powered insurance guidance instantly.
            </p>

            {/* Progress steps display */}
            <div className="space-y-4">
              {['Create your account', 'Choose your role', 'Start protecting what matters'].map((s, i) => (
                <div key={s} className={`flex items-center gap-3 transition-all duration-300 ${step > i ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${step > i ? 'bg-green-400 text-white' : 'bg-white/20 text-white'}`}>
                    {step > i ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-white/80 text-sm">{s}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-10 right-10 w-40 h-40 rounded-full border border-white/10"
        />
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">InsureAI</span>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map(s => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'bg-primary' : 'bg-muted'}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Account details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-display font-bold mb-2">Create your account</h1>
                  <p className="text-muted-foreground">Join InsureAI for free today</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input {...register('full_name')} placeholder="Priya Sharma" className="input-premium pl-10" />
                    </div>
                    {errors.full_name && <p className="text-danger-500 text-xs mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input {...register('email')} type="email" placeholder="you@example.com" className="input-premium pl-10" />
                    </div>
                    {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className="input-premium pl-10 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input {...register('confirm_password')} type={showConfirm ? 'text' : 'password'} placeholder="Re-enter password" className="input-premium pl-10 pr-10" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirm_password && <p className="text-danger-500 text-xs mt-1">{errors.confirm_password.message}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={handleStep1}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Role selection */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <h1 className="text-3xl font-display font-bold mb-2">Choose your role</h1>
                  <p className="text-muted-foreground">This determines your access level and features</p>
                </div>

                <div className="space-y-3 mb-8">
                  {roles.map(role => (
                    <button
                      key={role.value}
                      onClick={() => setSelectedRole(role.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedRole === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-3xl">{role.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{role.label}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedRole === role.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {selectedRole === role.value && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By creating an account, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-success-100 dark:bg-success-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-10 h-10 text-success-600 dark:text-success-400" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold mb-2">Account Created! 🎉</h2>
                <p className="text-muted-foreground mb-2">
                  Welcome to InsureAI, {getValues('full_name').split(' ')[0]}!
                </p>
                <p className="text-sm text-muted-foreground mb-8">
                  Check your email to verify your account, then sign in to get started.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-brand-600 to-trust-600 text-white font-semibold rounded-xl hover:shadow-glow-blue transition-all mx-auto"
                >
                  Sign In Now <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
