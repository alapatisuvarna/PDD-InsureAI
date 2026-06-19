import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, RotateCcw, Sparkles, Copy, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { aiService } from '@/services/aiService'
import { supabase } from '@/lib/supabase'
import { formatRelativeTime } from '@/lib/utils'
import type { ChatMessage } from '@/types'
import toast from 'react-hot-toast'

const suggestions = [
  'Term vs whole life insurance?',
  'How to file a claim?',
  'Section 80D tax benefits',
]

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  const copyContent = () => {
    navigator.clipboard.writeText(message.content)
    toast.success('Copied to clipboard')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
        isUser
          ? 'bg-gradient-to-br from-brand-500 to-trust-500 text-white text-[10px] font-bold'
          : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
      }`}>
        {isUser ? 'U' : <Bot className="w-3 h-3" />}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}>
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[9px] text-muted-foreground">{formatRelativeTime(message.timestamp)}</span>
          {!isUser && (
            <button
              onClick={copyContent}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="chat-bubble-ai py-1.5 px-3">
        <div className="flex gap-1 items-center h-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AIAssistantWidget() {
  const { profile } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hello ${profile?.full_name?.split(' ')[0] || 'there'}! 👋 I'm your InsureAI assistant.\n\nHow can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [sessionId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, isOpen])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isTyping) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const response = await aiService.chat(messages, content.trim())
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, aiMessage])

      if (profile?.user_id) {
        await supabase.from('chat_sessions').upsert({
          id: sessionId,
          user_id: profile.user_id,
          title: messages[1]?.content?.slice(0, 50) || content.slice(0, 50),
          messages: [...messages, userMessage, aiMessage],
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      toast.error('Failed to get response. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Hello again! How can I help you with your insurance questions today?`,
      timestamp: new Date().toISOString(),
    }])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-[350px] h-[500px] max-h-[calc(100vh-100px)] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-accent/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-glow-blue">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground">AI Assistant</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
                    Powered by Groq AI
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                  title="New Chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-background">
              {messages.length <= 1 && (
                <div className="mb-4">
                  <p className="text-[10px] text-muted-foreground mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-muted-foreground text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50 bg-card">
              <div className="flex items-end gap-2 bg-accent/50 rounded-xl p-1.5 border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground min-h-[32px] max-h-24 p-1.5"
                  style={{ lineHeight: '1.4' }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-trust-500 flex items-center justify-center text-white hover:shadow-glow-blue transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-0.5 mr-0.5"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-glow-blue hover:scale-105 transition-transform duration-200 z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  )
}
