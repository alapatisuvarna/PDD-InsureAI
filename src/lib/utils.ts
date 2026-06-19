import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO, isAfter, isBefore, addDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM yyyy, hh:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getDaysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isExpired(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isBefore(d, new Date())
}

export function isExpiringSoon(date: string | Date, days = 30): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const threshold = addDays(now, days)
  return isAfter(d, now) && isBefore(d, threshold)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-danger-500'
  if (score >= 60) return 'text-warning-500'
  if (score >= 40) return 'text-brand-500'
  return 'text-success-500'
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Moderate'
  return 'Low'
}

export function getRiskBgColor(score: number): string {
  if (score >= 80) return 'bg-danger-100 dark:bg-danger-500/20'
  if (score >= 60) return 'bg-warning-100 dark:bg-warning-500/20'
  if (score >= 40) return 'bg-brand-100 dark:bg-brand-500/20'
  return 'bg-success-100 dark:bg-success-500/20'
}

export function getClaimStatusColor(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    submitted: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400',
    under_review: 'bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400',
    approved: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400',
    rejected: 'bg-danger-100 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400',
    settled: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  }
  return map[status] || map.draft
}

export function getPolicyTypeIcon(type: string): string {
  const map: Record<string, string> = {
    health: '🏥',
    life: '❤️',
    vehicle: '🚗',
    travel: '✈️',
    property: '🏠',
    business: '💼',
  }
  return map[type] || '📋'
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
