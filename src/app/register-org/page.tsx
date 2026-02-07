'use client'

import dynamic from 'next/dynamic'
import { Loading } from '@/components/ui'

const RegisterOrgContent = dynamic(
  () => import('./RegisterOrgContent'),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center"><Loading /></div>
  }
)

export default function RegisterOrgPage() {
  return <RegisterOrgContent />
}
