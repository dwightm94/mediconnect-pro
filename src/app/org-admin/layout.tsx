'use client'

import { Header } from '@/components/layout/Header'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loading } from '@/components/ui'

export default function OrgAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, isOrgAdmin, isOrgOwner } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (!isOrgAdmin() && !isOrgOwner()))) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isOrgAdmin, isOrgOwner, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!isAuthenticated || (!isOrgAdmin() && !isOrgOwner())) {
    return null
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  )
}
