import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, useEffect } from 'react'
import { X } from 'lucide-react'

// ============================================================
// BUTTON
// ============================================================
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-[#0A6E6E] to-[#054848] text-white hover:shadow-lg hover:-translate-y-0.5',
    secondary: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#0A6E6E] hover:text-[#0A6E6E]',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================
// CARD
// ============================================================
interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

// ============================================================
// STAT CARD
// ============================================================
interface StatCardProps {
  icon: string
  value: number | string
  label: string
  iconBg?: string
}

export function StatCard({ icon, value, label, iconBg = 'bg-[rgba(14,234,202,0.10)]' }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// ============================================================
// INPUT
// ============================================================
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// ============================================================
// CHIP / BADGE
// ============================================================
interface ChipProps {
  children: ReactNode
  variant?: 'ok' | 'warn' | 'error' | 'info'
  className?: string
}

export function Chip({ children, variant = 'info', className = '' }: ChipProps) {
  const variants = {
    ok: 'bg-green-100 text-green-800',
    warn: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// ============================================================
// LOADING
// ============================================================
interface LoadingProps {
  text?: string
}

export function Loading({ text = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-[#0A6E6E] border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-500">{text}</p>
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================
interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ============================================================
// ALERT
// ============================================================
interface AlertProps {
  children: ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  className?: string
}

export function Alert({ children, variant = 'info', className = '' }: AlertProps) {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  }

  return (
    <div className={`p-4 rounded-xl border ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

// ============================================================
// MODAL
// ============================================================
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-xl transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Body */}
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// AVATAR
// ============================================================
interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  return (
    <div 
      className={`rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold ${sizes[size]} ${className}`}
    >
      {initials}
    </div>
  )
}

// ============================================================
// TABS
// ============================================================
interface TabsProps {
  tabs: { value: string; label: string }[]
  activeTab: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 bg-gray-100 p-1 rounded-xl w-fit ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === tab.value
              ? 'bg-white shadow text-[#0A6E6E]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
