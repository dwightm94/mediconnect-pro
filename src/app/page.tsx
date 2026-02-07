'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Loading } from '@/components/ui'
import Link from 'next/link'

export default function HomePage() {
  const { user, isLoading, isAuthenticated, signInWithGoogle, userRole, isOrgOwner, isOrgAdmin } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && userRole) {
      // Auto-redirect based on role if they have one
      if (selectedRole === 'patient') {
        router.push('/patient')
      } else if (selectedRole === 'provider') {
        router.push('/provider')
      } else if (selectedRole === 'orgadmin' && (isOrgOwner() || isOrgAdmin())) {
        router.push('/org-admin')
      }
    }
  }, [isAuthenticated, userRole, selectedRole, router, isOrgOwner, isOrgAdmin])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading text="Loading MediConnect..." />
      </div>
    )
  }

  const handleContinue = () => {
    if (selectedRole === 'patient') {
      router.push('/patient')
    } else if (selectedRole === 'provider') {
      router.push('/provider')
    } else if (selectedRole === 'orgadmin') {
      router.push('/org-admin')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-0 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute w-[800px] h-[800px] top-[-200px] right-[-200px] bg-gradient-radial from-primary-glow/10 to-transparent rounded-full pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bottom-[-150px] left-[-150px] bg-gradient-radial from-primary/5 to-transparent rounded-full pointer-events-none" />

      {/* Main card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 max-w-lg w-full relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="font-display font-bold text-2xl text-primary-deep">
            MediConnect <span className="text-primary-glow">Pro</span>
          </span>
        </div>

        {/* Status badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light border border-primary-glow/20 rounded-full text-sm font-semibold text-primary">
            <span className="w-2 h-2 bg-status-ok rounded-full animate-pulse" />
            Secure Health Information Exchange
          </span>
        </div>

        <h1 className="text-2xl font-display font-bold text-center mb-2">Welcome</h1>
        <p className="text-text-2 text-center mb-6">
          Select your role to access the unified health information exchange
        </p>

        {/* Role selection */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelectedRole('patient')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedRole === 'patient'
                ? 'border-primary bg-primary-light'
                : 'border-gray-200 hover:border-primary/50 hover:bg-primary-light/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">👤</span>
              <div>
                <div className="font-semibold">I'm a Patient</div>
                <div className="text-sm text-text-3">View records, book visits, video calls & message your care team</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('provider')}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedRole === 'provider'
                ? 'border-primary bg-primary-light'
                : 'border-gray-200 hover:border-primary/50 hover:bg-primary-light/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🩺</span>
              <div>
                <div className="font-semibold">I'm a Provider</div>
                <div className="text-sm text-text-3">Hospital, lab, urgent care, doctor office, or nursing home</div>
              </div>
            </div>
          </button>

          {/* Org Admin option - only for org admins/owners */}
          {isAuthenticated && (isOrgOwner() || isOrgAdmin()) && (
            <button
              onClick={() => setSelectedRole('orgadmin')}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === 'orgadmin'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-blue-200 bg-blue-50/50 hover:border-blue-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏢</span>
                <div>
                  <div className="font-semibold">Organization Admin</div>
                  <div className="text-sm text-text-3">Manage your organization's staff, settings, and SSO</div>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Continue button */}
        {isAuthenticated ? (
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            className="w-full"
          >
            Continue
          </Button>
        ) : (
          <>
            <Button
              onClick={signInWithGoogle}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </>
        )}

        {/* Register org link - only for authenticated providers without org */}
        {isAuthenticated && !user?.orgId && selectedRole === 'provider' && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-text-3 text-center mb-3">New to MediConnect?</p>
            <Link href="/register-org">
              <Button variant="secondary" className="w-full">
                🏥 Register Your Organization
              </Button>
            </Link>
          </div>
        )}

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-text-3">
          <span>🔒 256-bit Encryption</span>
          <span>☁️ AWS Cloud</span>
          <span>⚡ 99.9% Uptime</span>
        </div>
      </div>
    </div>
  )
}
