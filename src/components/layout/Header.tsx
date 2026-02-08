'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Menu, X, LogOut, Settings } from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
}

const patientNav: NavItem[] = [
  { label: 'Dashboard', href: '/patient' },
  { label: 'Find Doctors', href: '/patient/doctors' },
  { label: 'Appointments', href: '/patient/appointments' },
  { label: 'Records', href: '/patient/medical-records' },
  { label: 'Consents', href: '/patient/consents' },
]

const providerNav: NavItem[] = [
  { label: 'Dashboard', href: '/provider' },
  { label: 'Patients', href: '/provider/patients' },
  { label: 'Records', href: '/provider/medical-records' },
  { label: 'Sharing', href: '/provider/sharing' },
  { label: 'Appointments', href: '/provider/appointments' },
]

const orgAdminNav: NavItem[] = [
  { label: 'Dashboard', href: '/org-admin' },
  { label: 'Staff', href: '/org-admin/staff' },
  { label: 'SSO', href: '/org-admin/sso' },
  { label: 'Settings', href: '/org-admin/settings' },
]

export function Header() {
  const { user, userRole, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case 'orgowner':
      case 'orgadmin':
        return orgAdminNav
      case 'provider':
        return providerNav
      default:
        return patientNav
    }
  }

  const getRoleBadge = () => {
    switch (userRole) {
      case 'orgowner':
        return { label: '👑 Org Owner', className: 'bg-purple-100 text-purple-700' }
      case 'orgadmin':
        return { label: '🏢 Org Admin', className: 'bg-blue-100 text-blue-700' }
      case 'provider':
        return { label: '🩺 Provider', className: 'bg-primary-light text-primary' }
      default:
        return { label: '👤 Patient', className: 'bg-green-100 text-green-700' }
    }
  }

  const navItems = getNavItems()
  const roleBadge = getRoleBadge()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-display font-bold text-xl text-primary-deep">
              MediConnect <span className="text-primary-glow">Pro</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-tab"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/patient/settings" className="nav-tab" title="Settings">
              <Settings style={{ width: '18px', height: '18px' }} />
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Role Badge */}
            <span className={cn('role-badge hidden sm:inline-flex', roleBadge.className)}>
              {roleBadge.label}
            </span>

            {/* Settings */}
            <Link
              href="/patient/settings"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#f3f4f6' }}
              title="Settings"
            >
              <Settings style={{ width: '20px', height: '20px', color: '#0A6E6E' }} />
            </Link>
            {/* User Menu */}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-2 hidden lg:inline">
                  {user.email}
                </span>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg hover:bg-surface-2 text-text-3 hover:text-text-1 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-surface-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-text-2 hover:bg-primary-light hover:text-primary rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
