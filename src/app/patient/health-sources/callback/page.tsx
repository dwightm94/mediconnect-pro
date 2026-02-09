'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const API_BASE = 'https://3kxwuprwp8.execute-api.us-east-1.amazonaws.com/prod'

export default function OAuthCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [message, setMessage] = useState('Connecting to your health portal...')
  const [details, setDetails] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage('Authorization was denied')
      setDetails(searchParams.get('error_description') || error)
      return
    }

    if (!code || !stateParam) {
      setStatus('error')
      setMessage('Missing authorization code')
      setDetails('The health portal did not return the expected data.')
      return
    }

    // Decode state to get provider info
    let state: { provider: string; timestamp: number }
    try {
      state = JSON.parse(atob(stateParam))
    } catch {
      setStatus('error')
      setMessage('Invalid callback state')
      return
    }

    // Get patient ID from localStorage or session
    const patientId = localStorage.getItem('patientId') || 'patient_default'

    // Exchange the auth code for tokens via our Lambda
    const exchangeCode = async () => {
      try {
        setMessage(`Exchanging authorization with ${state.provider === 'epic' ? 'Epic MyChart' : state.provider}...`)

        const response = await fetch(`${API_BASE}/fhir/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            provider: state.provider,
            patientId,
          }),
        })

        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setMessage('Successfully connected!')
          setDetails(`Connected to ${data.provider === 'epic' ? 'Epic MyChart' : data.provider}. Patient FHIR ID: ${data.patientFhirId || 'obtained'}`)
          
          // Redirect back to health sources after 2 seconds
          setTimeout(() => {
            router.push('/patient/health-sources')
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Connection failed')
          setDetails(data.error || JSON.stringify(data.details || {}))
        }
      } catch (err) {
        setStatus('error')
        setMessage('Network error')
        setDetails(err instanceof Error ? err.message : 'Failed to connect to server')
      }
    }

    exchangeCode()
  }, [searchParams, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '48px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        {status === 'processing' && (
          <>
            <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 24px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{message}</h2>
            <p style={{ color: '#64748b' }}>Please wait while we securely connect your account...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ width: '48px', height: '48px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ color: 'white', fontSize: '24px' }}>✓</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#10b981', marginBottom: '8px' }}>{message}</h2>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>{details}</p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Redirecting to your health sources...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ width: '48px', height: '48px', background: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ color: 'white', fontSize: '24px' }}>✗</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>{message}</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px', wordBreak: 'break-word' }}>{details}</p>
            <button
              onClick={() => router.push('/patient/health-sources')}
              style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
            >
              Back to Health Sources
            </button>
          </>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
