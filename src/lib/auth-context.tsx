'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// API Configuration
export const API_ENDPOINT = 'https://7725x8ga2j.execute-api.us-east-1.amazonaws.com/prod'
export const COGNITO_DOMAIN = 'us-east-1368hbdtts.auth.us-east-1.amazoncognito.com'
export const CLIENT_ID = '5baqndp6i2rgi8rjkb3bsgjin8'
export const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : ''

// Types
export type UserRole = 'patient' | 'provider' | 'orgadmin' | 'orgowner'

export interface User {
  email: string
  sub: string
  groups: string[]
  orgId?: string
  orgName?: string
  orgRole?: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole | null
  signInWithGoogle: () => void
  signOut: () => void
  hasGroup: (group: string) => boolean
  isOrgOwner: () => boolean
  isOrgAdmin: () => boolean
  isProvider: () => boolean
  isPatient: () => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for token in URL (OAuth callback)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash.includes('id_token')) {
        handleOAuthCallback(hash)
      } else {
        // Check for existing session
        loadStoredSession()
      }
    }
  }, [])

  const handleOAuthCallback = (hash: string) => {
    try {
      const params = new URLSearchParams(hash.substring(1))
      const idToken = params.get('id_token')
      const accessToken = params.get('access_token')

      if (idToken) {
        const payload = JSON.parse(atob(idToken.split('.')[1]))
        const userData: User = {
          email: payload.email,
          sub: payload.sub,
          groups: payload['cognito:groups'] || [],
          orgId: payload['custom:orgId'],
          orgName: payload['custom:orgName'],
          orgRole: payload['custom:orgRole'],
        }

        setUser(userData)
        sessionStorage.setItem('user', JSON.stringify(userData))
        sessionStorage.setItem('idToken', idToken)
        sessionStorage.setItem('accessToken', accessToken || '')

        // Clean URL
        window.history.replaceState(null, '', window.location.pathname)
      }
    } catch (e) {
      console.error('Token parse error:', e)
    }
    setIsLoading(false)
  }

  const loadStoredSession = () => {
    try {
      const storedUser = sessionStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (e) {
      console.error('Session load error:', e)
    }
    setIsLoading(false)
  }

  const signInWithGoogle = () => {
    const authUrl = `https://${COGNITO_DOMAIN}/oauth2/authorize?` +
      `client_id=${CLIENT_ID}` +
      `&response_type=token` +
      `&scope=email+openid+profile` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&identity_provider=Google`
    
    window.location.href = authUrl
  }

  const signOut = () => {
    sessionStorage.clear()
    setUser(null)
    
    const logoutUrl = `https://${COGNITO_DOMAIN}/logout?` +
      `client_id=${CLIENT_ID}` +
      `&logout_uri=${encodeURIComponent(REDIRECT_URI)}`
    
    window.location.href = logoutUrl
  }

  const hasGroup = (group: string) => user?.groups?.includes(group) || false
  const isOrgOwner = () => hasGroup('OrgOwners')
  const isOrgAdmin = () => hasGroup('OrgAdmins') || isOrgOwner()
  const isProvider = () => hasGroup('Providers') || isOrgAdmin()
  const isPatient = () => hasGroup('Patients') || !user?.groups?.length

  const getUserRole = (): UserRole | null => {
    if (!user) return null
    if (isOrgOwner()) return 'orgowner'
    if (isOrgAdmin()) return 'orgadmin'
    if (isProvider()) return 'provider'
    return 'patient'
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      userRole: getUserRole(),
      signInWithGoogle,
      signOut,
      hasGroup,
      isOrgOwner,
      isOrgAdmin,
      isProvider,
      isPatient,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// API helper
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem('idToken')
  
  const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || error.error || 'Request failed')
  }

  return response.json()
}
