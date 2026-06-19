import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Shield, Bot, Sparkles, BarChart3, FileText, Bell, ArrowRight,
  CheckCircle, Star, ChevronRight, Phone, Mail, MapPin, GitCompare,
  TrendingUp, Lock, Zap, Award, Users, IndianRupee, Clock,
  LayoutDashboard, User
} from 'lucide-react'

const stats = [
  { value: '50L+', label: 'Policies Protected', icon: Shield },
  { value: '₹2,500Cr+', label: 'Claims Settled', icon: IndianRupee },
  { value: '99.2%', label: 'Claim Settlement', icon: Award },
  { value: '4.9★', label: 'Customer Rating', icon: Star },
]

const features = [
  {
    icon: Bot,
    title: 'AI Insurance Assistant',
    description: 'Get instant answers about any insurance query. Our AI understands Indian insurance products and IRDAI regulations deeply.',
    gradient: 'from-blue-500 to-cyan-500',
    badge: 'Powered by Groq',
  },
  {
    icon: Sparkles,
    title: 'Smart Recommendations',
    description: 'Tell us about yourself and get personalized insurance recommendations with coverage gap analysis and premium estimates.',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'Personalized',
  },
  {
    icon: GitCompare,
    title: 'Policy Comparison',
    description: 'Compare policies from ICICI Lombard, HDFC ERGO, Star Health, Bajaj Allianz and 20+ top providers side-by-side.',
    gradient: 'from-orange-500 to-red-500',
    badge: '20+ Providers',
  },
  {
    icon: FileText,
    title: 'Claims Management',
    description: 'Track your claims in real-time. Get AI-guided assistance through every step of the claims process.',
    gradient: 'from-green-500 to-emerald-500',
    badge: 'Real-time',
  },
  {
    icon: BarChart3,
    title: 'Risk Analysis Engine',
    description: 'Understand your risk profile across health, driving, financial, and lifestyle factors with visual analytics.',
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'AI Powered',
  },
  {
    icon: Bell,
    title: 'Premium Reminders',
    description: 'Never miss a premium payment. Get smart reminders 30, 15, 7, and 1 day before your policy expires.',
    gradient: 'from-yellow-500 to-orange-500',
    badge: 'Automated',
  },
]

const providers = [
  'ICICI Lombard', 'HDFC ERGO', 'Star Health', 'Bajaj Allianz',
  'SBI General', 'New India Assurance', 'Tata AIG', 'Max Life',
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bengaluru',
    rating: 5,
    text: 'InsureAI helped me find the perfect health insurance for my family. The AI comparison tool saved me ₹18,000 per year!',
    avatar: 'PS',
  },
  {
    name: 'Rajesh Kumar',
    role: 'Business Owner, Mumbai',
    rating: 5,
    text: 'The claim tracking feature is incredible. My car insurance claim was settled in 4 days. Best insurance platform in India!',
    avatar: 'RK',
  },
  {
    name: 'Anita Patel',
    role: 'Doctor, Ahmedabad',
    rating: 5,
    text: 'As a doctor, I appreciate how accurately the AI explains medical insurance terms. The risk analysis was eye-opening.',
    avatar: 'AP',
  },
]

const policyTypes = [
  { name: 'Health Insurance', icon: '🏥', desc: 'Cashless hospitalisation', color: 'bg-green-50 dark:bg-green-950/30' },
  { name: 'Life Insurance', icon: '❤️', desc: 'Family financial security', color: 'bg-red-50 dark:bg-red-950/30' },
  { name: 'Vehicle Insurance', icon: '🚗', desc: 'Third-party & comprehensive', color: 'bg-blue-50 dark:bg-blue-950/30' },
  { name: 'Travel Insurance', icon: '✈️', desc: 'Trip cancellation & medical', color: 'bg-purple-50 dark:bg-purple-950/30' },
  { name: 'Home Insurance', icon: '🏠', desc: 'Property & contents cover', color: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { name: 'Business Insurance', icon: '💼', desc: 'SME & corporate cover', color: 'bg-indigo-50 dark:bg-indigo-950/30' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ===== NAVBAR ===== */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center shadow-glow-blue">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl gradient-text">InsureAI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#providers" className="hover:text-foreground transition-colors">Providers</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-xl hover:bg-accent"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-trust-600 px-5 py-2 rounded-xl hover:shadow-glow-blue transition-all hover:scale-105"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 hero-gradient opacity-95" />
        <div className="absolute inset-0">
          {/* Animated orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-400/15 rounded-full blur-3xl"
          />
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>India's Most Intelligent Insurance Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white leading-tight tracking-tight mb-6">
              Insurance Made{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400">
                Intelligent
              </span>
              <br />
              <span className="text-white/90">with AI</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/75 max-w-3xl mx-auto leading-relaxed mb-8">
              Compare 500+ policies from 20+ top Indian insurers. Get AI-powered recommendations, 
              track claims in real-time, and never miss a premium with smart reminders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 text-base"
              >
                Start Free — No Credit Card
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-base"
              >
                <Shield className="w-5 h-5" />
                Sign In to Dashboard
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
              {['IRDAI Compliant', 'ISO 27001 Certified', '256-bit Encryption', '24/7 AI Support'].map(item => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-16 relative"
          >
            <div className="glass rounded-3xl border border-white/20 p-1 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-slate-900/80 rounded-2xl overflow-hidden">
                {/* Mock dashboard UI */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="flex-1 mx-4 h-5 bg-white/10 rounded-lg flex items-center px-3">
                    <span className="text-white/40 text-xs">app.insureai.in/dashboard</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  {[
                    { label: 'Active Policies', value: '4', color: 'text-blue-400', icon: '🛡️' },
                    { label: 'Total Coverage', value: '₹1.2Cr', color: 'text-green-400', icon: '💰' },
                    { label: 'Risk Score', value: '42/100', color: 'text-yellow-400', icon: '📊' },
                    { label: 'Claims', value: '2 Active', color: 'text-purple-400', icon: '📋' },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-3">
                      <div className="text-xl mb-1">{stat.icon}</div>
                      <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-white/40 text-xs">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                  <div className="col-span-2 bg-white/5 rounded-xl p-3 h-24 flex items-center justify-center">
                    <div className="w-full h-12 flex items-end gap-1">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 65].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-white/50 text-xs mb-2">AI Chat</div>
                    <div className="bg-blue-500/30 rounded-lg p-2 text-xs text-blue-300 mb-1">What's the best health policy?</div>
                    <div className="bg-white/10 rounded-lg p-2 text-xs text-white/60">I recommend Star Health Comprehensive...</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 bg-background border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3 mx-auto">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-display font-black gradient-text">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POLICY TYPES SECTION ===== */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              All Insurance, <span className="gradient-text">One Platform</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From health to travel, we cover every aspect of your insurance needs with AI-powered recommendations.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {policyTypes.map((type, i) => (
              <motion.div
                key={type.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`${type.color} border border-border/50 rounded-2xl p-4 text-center cursor-pointer transition-all hover:shadow-card-hover`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="text-sm font-semibold text-foreground">{type.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Everything You Need to <span className="gradient-text">Stay Protected</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              World-class AI meets India's insurance market. Built for individuals, families, and businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="card-premium p-6 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{feature.badge}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROVIDERS SECTION ===== */}
      <section id="providers" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Trusted by India's <span className="gradient-text">Top Insurers</span>
          </h2>
          <p className="text-muted-foreground mb-12">All IRDAI-regulated providers. Compare and buy with confidence.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {providers.map((provider, i) => (
              <motion.div
                key={provider}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="card-premium p-4 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white font-bold text-sm mx-auto mb-2">
                    {provider.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <p className="text-sm font-medium text-foreground">{provider}</p>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Get Protected in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-brand-300 via-trust-400 to-brand-300" />
            {[
              { step: '01', title: 'Create Your Profile', desc: 'Sign up and tell us about yourself, your family, and your insurance needs in 2 minutes.', icon: User },
              { step: '02', title: 'Get AI Recommendations', desc: 'Our AI analyzes 500+ policies and recommends the best options with personalized coverage amounts.', icon: Sparkles },
              { step: '03', title: 'Manage Everything', desc: 'Track all your policies, claims, and premiums from one beautiful dashboard.', icon: LayoutDashboard },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-trust-500 text-white mb-6 shadow-glow-blue">
                  <item.icon className="w-9 h-9" />
                </div>
                <div className="absolute top-0 right-1/4 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <h3 className="font-display font-bold text-lg mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">
              Loved by <span className="gradient-text">Millions of Indians</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-premium p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground/80 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-trust-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECURITY SECTION ===== */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card-gradient p-10 rounded-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-4">Bank-Grade Security</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Your data is protected with 256-bit AES encryption, JWT authentication, Row-Level Security, 
              and complete audit logging — the same standards used by leading Indian banks.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: '256-bit Encryption', icon: Lock },
                { label: 'IRDAI Compliant', icon: Award },
                { label: 'ISO 27001', icon: CheckCircle },
                { label: 'Audit Logged', icon: FileText },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50">
                  <item.icon className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-95" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)'
        }} />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-6">🛡️</div>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white mb-4">
              Start Protecting What Matters
            </h2>
            <p className="text-white/75 text-lg mb-8">
              Join 50 lakh+ Indians who use InsureAI for smarter insurance decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            </div>
            <p className="text-white/50 text-sm mt-4">No credit card required • Free forever for basic plan</p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-white/60 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-white">InsureAI</span>
              </div>
              <p className="text-sm leading-relaxed">India's most intelligent AI-powered insurance platform. Protect smarter, live better.</p>
            </div>
            {[
              { title: 'Product', links: ['Dashboard', 'AI Assistant', 'Policy Compare', 'Risk Analysis', 'Claims'] },
              { title: 'Insurance', links: ['Health', 'Life', 'Vehicle', 'Travel', 'Property'] },
              { title: 'Company', links: ['About', 'Careers', 'Privacy Policy', 'Terms of Service', 'IRDAI License'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2025 InsureAI Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> 1800-123-4567</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> support@insureai.in</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Mumbai, India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

