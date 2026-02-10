'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`Authorization denied: ${searchParams.get('error_description') || error}`)
        return
      }

      if (!code || !state) {
        setStatus('error')
        setMessage('Missing authorization code or state parameter')
        return
      }

      try {
        // Decode state to get provider info
        const stateData = JSON.parse(atob(state))

        // Retrieve PKCE code_verifier from sessionStorage
        const codeVerifier = sessionStorage.getItem('pkce_code_verifier')
        const tokenUrl = sessionStorage.getItem('fhir_token_url') || stateData.tokenUrl
        const fhirBaseUrl = sessionStorage.getItem('fhir_base_url') || stateData.fhirBaseUrl

        // Exchange code for tokens via our Lambda backend
        // The Lambda handles the actual token exchange with the EHR's token endpoint
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://3kxwuprwp8.execute-api.us-east-1.amazonaws.com/prod'
        const response = await fetch(`${API_BASE}/fhir/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            state: stateData,
            redirectUri: `${window.location.origin}/patient/health-sources/callback`,
            patientId: user?.sub,
            codeVerifier,       // PKCE code_verifier for token exchange
            tokenUrl,           // The org-specific token endpoint
            fhirBaseUrl,        // The org-specific FHIR base URL
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.message || 'Token exchange failed')
        }

        const result = await response.json()

        // Clean up sessionStorage
        sessionStorage.removeItem('pkce_code_verifier')
        sessionStorage.removeItem('fhir_token_url')
        sessionStorage.removeItem('fhir_base_url')

        setStatus('success')
        setMessage(`Successfully connected to ${stateData.orgName || 'your health portal'}!`)

        // Redirect back to health sources after 2 seconds
        setTimeout(() => {
          router.push('/patient/health-sources')
        }, 2000)
      } catch (err: any) {
        setStatus('error')
        setMessage(err.message || 'Failed to complete the connection. Please try again.')
      }
    }

    if (user) {
      handleCallback()
    }
  }, [user, searchParams, router])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <div>
            <Loader2 className="w-12 h-12 text-[#0A6E6E] animate-spin mx-auto" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">Connecting to your health portal...</h2>
            <p className="text-sm text-gray-500 mt-2">
              Exchanging authorization tokens securely...
            </p>
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
            <button
              onClick={() => router.push('/patient/health-sources')}
              className="mt-4 px-6 py-2.5 bg-[#0A6E6E] text-white rounded-xl font-medium hover:bg-[#054848] transition-colors"
            >
              Back to Health Sources
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FHIRCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0A6E6E] animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
