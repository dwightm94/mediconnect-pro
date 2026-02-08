'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Loading } from '@/components/ui'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function FHIRCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      // EHR sends back ?code=xxx&state=yyy (success) or ?error=xxx (denied)
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage('Authorization denied: ' + (searchParams.get('error_description') || error))
        return
      }

      if (!code || !state) {
        setStatus('error')
        setMessage('Missing authorization code or state parameter')
        return
      }

      try {
        // Decode state to get provider info (epic/cerner/etc)
        const stateData = JSON.parse(atob(state))
        
        // Send code to our Lambda to exchange for tokens
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3kxwuprwp8.execute-api.us-east-1.amazonaws.com/prod'
        const response = await fetch(API_BASE + '/fhir/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            state: stateData,
            redirectUri: window.location.origin + '/patient/health-sources/callback',
            patientId: user?.sub,
          }),
        })

        if (!response.ok) throw new Error('Token exchange failed')

        setStatus('success')
        setMessage('Successfully connected to ' + (stateData.provider === 'epic' ? 'Epic MyChart' : 'your health portal') + '!')
        setTimeout(() => router.push('/patient/health-sources'), 2000)
      } catch {
        setStatus('error')
        setMessage('Failed to complete the connection. Please try again.')
      }
    }

    if (user) handleCallback()
  }, [user, searchParams, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <div>
            <Loading text="Connecting to your health portal..." />
            <p className="text-sm text-gray-500 mt-4">Exchanging authorization tokens securely...</p>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connected!</h2>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-400">Redirecting to your health sources...</p>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button onClick={() => router.push('/patient/health-sources')}
              className="mt-4 px-6 py-2.5 bg-[#0A6E6E] text-white rounded-xl font-medium hover:bg-[#054848] transition-colors">
              Back to Health Sources
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
