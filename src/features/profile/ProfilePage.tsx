import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { User, MapPin, Shield, Lock, Camera, CheckCircle } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { formatDate, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const profileSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  occupation: z.string().optional(),
  annual_income: z.number().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const tabs = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'address', label: 'Address', icon: MapPin },
  { id: 'nominee', label: 'Nominee', icon: Shield },
  { id: 'security', label: 'Security', icon: Lock },
]

export default function ProfilePage() {
  const { profile, updateProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState('personal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      date_of_birth: profile?.date_of_birth || '',
      gender: profile?.gender || 'male',
      occupation: profile?.occupation || '',
      annual_income: profile?.annual_income || undefined,
    },
  })

  const onSubmit = async (data: ProfileForm) => {
    setIsSubmitting(true)
    const { error } = await updateProfile(data)
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully!')
    }
    setIsSubmitting(false)
  }

  const kycSteps = [
    { label: 'Email Verified', done: !!profile?.email },
    { label: 'Phone Added', done: !!profile?.phone },
    { label: 'KYC Documents', done: profile?.kyc_status === 'verified' },
    { label: 'Nominee Added', done: !!profile?.nominee },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Header */}
      <div className="card-gradient p-6 rounded-2xl">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white text-2xl font-bold shadow-glow-blue">
              {getInitials(profile?.full_name || 'U')}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">{profile?.full_name}</h1>
            <p className="text-muted-foreground text-sm">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge-active capitalize">{profile?.role}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                profile?.kyc_status === 'verified' 
                  ? 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400'
                  : 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400'
              }`}>
                KYC: {profile?.kyc_status?.charAt(0).toUpperCase() + (profile?.kyc_status?.slice(1) || '')}
              </span>
            </div>
          </div>
          <div className="ml-auto hidden sm:block">
            <p className="text-xs text-muted-foreground">Member since</p>
            <p className="text-sm font-medium">{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</p>
          </div>
        </div>

        {/* KYC Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Profile Completion</p>
            <p className="text-sm text-muted-foreground">{kycSteps.filter(s => s.done).length}/{kycSteps.length}</p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-trust-500 rounded-full transition-all duration-500"
              style={{ width: `${(kycSteps.filter(s => s.done).length / kycSteps.length) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3">
            {kycSteps.map(step => (
              <div key={step.label} className="flex items-center gap-1.5 text-xs">
                <CheckCircle className={`w-3.5 h-3.5 ${step.done ? 'text-success-500' : 'text-muted-foreground/30'}`} />
                <span className={step.done ? 'text-foreground' : 'text-muted-foreground/50'}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
        {activeTab === 'personal' && (
          <form onSubmit={handleSubmit(onSubmit)} className="card-premium p-6 space-y-4">
            <h2 className="font-display font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input {...register('full_name')} className="input-premium" />
                {errors.full_name && <p className="text-danger-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <input {...register('phone')} placeholder="+91 98765 43210" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input {...register('date_of_birth')} type="date" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Gender</label>
                <select {...register('gender')} className="input-premium">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Occupation</label>
                <input {...register('occupation')} placeholder="e.g., Engineer" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Annual Income (₹)</label>
                <input {...register('annual_income', { valueAsNumber: true })} type="number" className="input-premium" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all disabled:opacity-50"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Save Changes
            </button>
          </form>
        )}

        {activeTab === 'security' && (
          <div className="card-premium p-6 space-y-6">
            <h2 className="font-display font-semibold">Security Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="font-medium text-sm">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed: Never</p>
                </div>
                <button className="text-sm text-primary hover:underline">Change Password</button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
                <span className="text-xs text-warning-600 bg-warning-50 dark:bg-warning-500/10 px-2.5 py-1 rounded-full font-medium">
                  Not enabled
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <div>
                  <p className="font-medium text-sm">Email Address</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <span className="badge-active">Verified</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'address' && (
          <div className="card-premium p-6">
            <h2 className="font-display font-semibold mb-4">Address Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Street Address', 'City', 'State', 'PIN Code'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1.5">{field}</label>
                  <input placeholder={`Enter ${field.toLowerCase()}`} className="input-premium" />
                </div>
              ))}
            </div>
            <button className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all">
              Save Address
            </button>
          </div>
        )}

        {activeTab === 'nominee' && (
          <div className="card-premium p-6">
            <h2 className="font-display font-semibold mb-4">Nominee Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Nominee Name</label>
                <input placeholder="Full name" className="input-premium" defaultValue={profile?.nominee?.name || ''} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Relationship</label>
                <select className="input-premium" defaultValue={profile?.nominee?.relationship || ''}>
                  <option value="">Select relationship</option>
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input type="date" className="input-premium" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Share Percentage</label>
                <input type="number" placeholder="100" max="100" className="input-premium" />
              </div>
            </div>
            <button className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:shadow-glow-blue transition-all">
              Save Nominee
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
