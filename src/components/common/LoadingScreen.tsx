import { Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center shadow-glow-blue"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        <div className="text-center">
          <h2 className="font-display font-bold text-xl gradient-text">InsureAI</h2>
          <p className="text-muted-foreground text-sm mt-1">Loading your insurance platform...</p>
        </div>
        {/* Loading bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-trust-500 rounded-full"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </div>
  )
}
