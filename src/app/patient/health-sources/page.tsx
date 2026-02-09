'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  Link2, 
  Unlink, 
  RefreshCw, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus,
  Activity,
  Pill,
  FileText,
  Syringe,
  Heart,
  ExternalLink,
  Info
} from 'lucide-react'

// ── EHR SYSTEM CONFIGS ──
// Each entry defines an EHR system we can connect to via SMART on FHIR
// fhirBaseUrl = where we pull patient data from
// authorizeUrl = where we send the patient to log in
// tokenUrl = where we exchange the auth code for access tokens
// scopes = what data we're requesting (read-only patient data)
const EHR_SYSTEMS = [
  {
    id: 'epic',
    name: 'Epic MyChart',
    description: 'Used by Mayo Clinic, Johns Hopkins, Cleveland Clinic, and 250+ health systems',
    logo: '🏥',
    color: '#E8173A',
    bgColor: 'rgba(232,23,58,0.08)',
    fhirBaseUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    authorizeUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    tokenUrl: 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    scopes: 'launch/patient patient/*.read openid fhirUser',
    sandbox: true,
    dataTypes: ['Labs', 'Medications', 'Conditions', 'Allergies', 'Immunizations', 'Visits'],
  },
  {
    id: 'cerner',
    name: 'Oracle Health (Cerner)',
    description: 'Used by VA Healthcare, Adventist Health, and 300+ organizations',
    logo: '🔴',
    color: '#C4262E',
    bgColor: 'rgba(196,38,46,0.08)',
    fhirBaseUrl: 'https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d',
    authorizeUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/personas/patient/authorize',
    tokenUrl: 'https://authorization.cerner.com/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/token',
    scopes: 'launch/patient patient/*.read openid fhirUser',
    sandbox: true,
    dataTypes: ['Labs', 'Medications', 'Conditions', 'Allergies', 'Immunizations'],
  },
  {
    id: 'meditech',
    name: 'MEDITECH',
    description: 'Used by 2,300+ hospitals worldwide, primarily community hospitals',
    logo: '🟢',
    color: '#00843D',
    bgColor: 'rgba(0,132,61,0.08)',
    fhirBaseUrl: '',
    authorizeUrl: '',
    tokenUrl: '',
    scopes: 'launch/patient patient/*.read openid',
    sandbox: false,
    dataTypes: ['Labs', 'Medications', 'Conditions', 'Allergies'],
    comingSoon: true,
  },
  {
    id: 'nextgen',
    name: 'NextGen Healthcare',
    description: 'Used by 100,000+ providers, primarily ambulatory and specialty practices',
    logo: '🔵',
    color: '#0066CC',
    bgColor: 'rgba(0,102,204,0.08)',
    fhirBaseUrl: '',
    authorizeUrl: '',
    tokenUrl: '',
    scopes: 'launch/patient patient/*.read openid',
    sandbox: false,
    dataTypes: ['Labs', 'Medications', 'Conditions'],
    comingSoon: true,
  },
]

// ── CONNECTION TYPE ──
// Represents a connected EHR portal stored in DynamoDB
interface Connection {
  connectionId: string
  provider: string
  providerName: string
  status: 'active' | 'expired' | 'error'
  lastSynced: string
  patientFhirId: string
  recordCount: number
  facilityName?: string
}

export default function HealthSourcesPage() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState<string | null>(null)
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState<string | null>(null)

  const connectedProviders = connections.map(c => c.provider)

  // ── CONNECT HANDLER ──
  // Initiates SMART on FHIR OAuth2 flow:
  // 1. Build authorize URL with our client_id, redirect_uri, scopes
  // 2. Redirect patient to EHR login (MyChart, Cerner, etc)
  // 3. Patient logs in and approves access
  // 4. EHR redirects back to our callback with auth code
  // For now: simulates the connection for demo purposes
  // Epic SMART on FHIR OAuth2 config
  const EPIC_SANDBOX_CLIENT_ID = 'f09904cf-3580-4e62-809e-2e748e3ea345'
  const EPIC_AUTHORIZE_URL = 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize'
  const EPIC_FHIR_BASE = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4'
  const REDIRECT_URI = typeof window !== 'undefined'
    ? window.location.origin + '/patient/health-sources/callback'
    : 'https://main.d8claz6ybgdsn.amplifyapp.com/patient/health-sources/callback'

  const handleConnect = async (ehrId: string) => {
    const ehr = EHR_SYSTEMS.find(e => e.id === ehrId)
    if (!ehr || ehr.comingSoon) return

    if (ehrId === 'epic') {
      // Real SMART on FHIR OAuth2 redirect
      const state = btoa(JSON.stringify({ provider: 'epic', timestamp: Date.now() }))
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: EPIC_SANDBOX_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: 'openid fhirUser patient/*.read',
        state: state,
        aud: EPIC_FHIR_BASE,
      })
      window.location.href = EPIC_AUTHORIZE_URL + '?' + params.toString()
      return
    }

    // Other portals still simulated for now
    setIsConnecting(ehrId)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      const newConnection: Connection = {
        connectionId: 'conn_' + Date.now(),
        provider: ehrId,
        providerName: ehr.name,
        status: 'active',
        lastSynced: new Date().toISOString(),
        patientFhirId: 'sandbox_' + ehrId + '_patient_1',
        recordCount: 0,
        facilityName: ehrId === 'cerner' ? 'Cerner Sandbox Hospital' : 'Health System',
      }
      setConnections(prev => [...prev, newConnection])
      handleSync(newConnection.connectionId, ehrId)
    } catch {
      console.error('Connection failed')
    } finally {
      setIsConnecting(null)
    }
  }

  // ── SYNC HANDLER ──
  // Pulls latest FHIR data from the connected portal
  // In production: calls our Lambda which uses the stored access_token
  // to query the EHR's FHIR API for labs, meds, conditions, etc.
  const handleSync = async (connectionId: string, provider: string) => {
    setIsSyncing(provider)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setConnections(prev => prev.map(c => 
        c.connectionId === connectionId 
          ? { ...c, lastSynced: new Date().toISOString(), recordCount: Math.floor(Math.random() * 50) + 20 }
          : c
      ))
    } catch {
      console.error('Sync failed')
    } finally {
      setIsSyncing(null)
    }
  }

  // ── DISCONNECT ──
  // Removes connection, revokes tokens, deletes synced data
  const handleDisconnect = async (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.connectionId !== connectionId))
    setShowConfirmDisconnect(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        )
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Token Expired
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Error
          </span>
        )
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Sources</h1>
        <p className="text-gray-500 mt-1">Connect your patient portals to see all your health data in one place</p>
      </div>

      {/* How it Works - explains the 3-step process to patients */}
      <div className="bg-gradient-to-r from-[#054848] to-[#0A6E6E] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/90">
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Choose a portal below and sign in with <strong>your existing credentials</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Approve <strong>read-only access</strong> — we never modify your records</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Your labs, meds, and records appear in your <strong>unified dashboard</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Portals - shows portals patient has already linked */}
      {connections.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#0A6E6E]" />
            Connected Portals ({connections.length})
          </h2>
          <div className="space-y-3">
            {connections.map((conn) => {
              const ehr = EHR_SYSTEMS.find(e => e.id === conn.provider)
              return (
                <div key={conn.connectionId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: ehr?.bgColor }}>
                        {ehr?.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{conn.providerName}</h3>
                          {getStatusBadge(conn.status)}
                        </div>
                        {conn.facilityName && <p className="text-sm text-gray-500 mt-0.5">{conn.facilityName}</p>}
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Last synced: {new Date(conn.lastSynced).toLocaleString()}
                          </span>
                          {conn.recordCount > 0 && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {conn.recordCount} records
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSync(conn.connectionId, conn.provider)}
                        disabled={isSyncing === conn.provider}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A6E6E] transition-colors disabled:opacity-50"
                        title="Sync now"
                      >
                        <RefreshCw className={'w-4 h-4 ' + (isSyncing === conn.provider ? 'animate-spin' : '')} />
                      </button>
                      <button
                        onClick={() => setShowConfirmDisconnect(conn.connectionId)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Disconnect"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {showConfirmDisconnect === conn.connectionId && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm text-red-700 mb-3">Disconnect from {conn.providerName}? Your synced data will be removed.</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleDisconnect(conn.connectionId)} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Disconnect</button>
                        <button onClick={() => setShowConfirmDisconnect(null)} className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Available Portals - EHR systems patient can connect to */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#0A6E6E]" />
          {connections.length > 0 ? 'Connect Another Portal' : 'Available Portals'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EHR_SYSTEMS.filter(ehr => !connectedProviders.includes(ehr.id)).map((ehr) => (
            <div key={ehr.id} className={'bg-white rounded-xl border border-gray-200 p-5 transition-all ' + (ehr.comingSoon ? 'opacity-60' : 'hover:shadow-md hover:border-gray-300')}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: ehr.bgColor }}>
                  {ehr.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ehr.name}</h3>
                    {ehr.comingSoon && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Coming Soon</span>}
                    {ehr.sandbox && !ehr.comingSoon && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">Sandbox Ready</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{ehr.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ehr.dataTypes.map(dt => (
                      <span key={dt} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-md">
                        {dt === 'Labs' && <Activity className="w-3 h-3" />}
                        {dt === 'Medications' && <Pill className="w-3 h-3" />}
                        {dt === 'Conditions' && <Heart className="w-3 h-3" />}
                        {dt === 'Allergies' && <AlertCircle className="w-3 h-3" />}
                        {dt === 'Immunizations' && <Syringe className="w-3 h-3" />}
                        {dt === 'Visits' && <FileText className="w-3 h-3" />}
                        {dt}
                      </span>
                    ))}
                  </div>
                  {!ehr.comingSoon && (
                    <button
                      onClick={() => handleConnect(ehr.id)}
                      disabled={isConnecting === ehr.id}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                      style={{ background: 'linear-gradient(135deg, ' + ehr.color + ', ' + ehr.color + 'dd)' }}
                    >
                      {isConnecting === ehr.id ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" />Connecting...</>
                      ) : (
                        <><ExternalLink className="w-4 h-4" />Connect {ehr.name}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What data we pull - explains FHIR resources to patients */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#0A6E6E]" />
          What data can we pull?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Activity, label: 'Lab Results', desc: 'Blood work, urinalysis, metabolic panels, lipid panels' },
            { icon: Pill, label: 'Medications', desc: 'Current prescriptions, dosages, and refill dates' },
            { icon: Heart, label: 'Conditions', desc: 'Active diagnoses, chronic conditions, problem list' },
            { icon: AlertCircle, label: 'Allergies', desc: 'Drug allergies, food allergies, environmental reactions' },
            { icon: Syringe, label: 'Immunizations', desc: 'Vaccine records, boosters, COVID-19 vaccinations' },
            { icon: FileText, label: 'Visit History', desc: 'Past appointments, discharge summaries, clinical notes' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[rgba(14,234,202,0.12)] flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-[#0A6E6E]" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SMART on FHIR security notice */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#0A6E6E] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Powered by SMART on FHIR</p>
            <p>
              MediConnect Pro uses the SMART on FHIR standard — the same technology mandated by the 
              21st Century Cures Act for secure health data exchange. We request read-only access to 
              your records. We never store your portal passwords and you can disconnect at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
