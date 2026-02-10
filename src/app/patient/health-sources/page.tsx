'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  Link2, Unlink, RefreshCw, Shield, CheckCircle2, AlertCircle, Clock, Plus,
  Activity, Pill, FileText, Syringe, Heart, ExternalLink, Info, Search,
  Building2, MapPin, ChevronLeft, X, Loader2
} from 'lucide-react'

// ─── Epic Production Config ──────────────────────────────────────────────────
const EPIC_PROD_CLIENT_ID = 'f09904cf-3580-4e62-809e-2e748e3ea345'
const EPIC_SCOPES = 'launch/patient patient/Patient.read patient/Observation.read patient/Condition.read patient/AllergyIntolerance.read patient/MedicationRequest.read patient/Immunization.read patient/Encounter.read openid fhirUser'

// ─── Epic Production Endpoints (curated from open.epic.com/MyApps/Endpoints) ─
// In production: download weekly from User-access Brands Bundle and re-host
const EPIC_ORGS = [
  { id: 'epic-1', name: 'Mayo Clinic', state: 'MN', city: 'Rochester', fhirBaseUrl: 'https://epicproxy.et0502.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['mayo'] },
  { id: 'epic-2', name: 'Cleveland Clinic', state: 'OH', city: 'Cleveland', fhirBaseUrl: 'https://epicproxy.et0961.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['cleveland clinic', 'ccf'] },
  { id: 'epic-3', name: 'Johns Hopkins Medicine', state: 'MD', city: 'Baltimore', fhirBaseUrl: 'https://epicproxy.et0945.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['johns hopkins', 'hopkins'] },
  { id: 'epic-4', name: 'Duke Health', state: 'NC', city: 'Durham', fhirBaseUrl: 'https://health-apis.duke.edu/FHIR/patient/R4', aliases: ['duke'] },
  { id: 'epic-5', name: 'NYU Langone Health', state: 'NY', city: 'New York', fhirBaseUrl: 'https://epicproxy.et1089.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['nyu', 'langone'] },
  { id: 'epic-6', name: 'Mass General Brigham', state: 'MA', city: 'Boston', fhirBaseUrl: 'https://ws-interconnect-fhir.partners.org/Interconnect-FHIR-MU-PRD/api/FHIR/R4', aliases: ['mass general', 'brigham', 'mgh'] },
  { id: 'epic-7', name: 'UCLA Health', state: 'CA', city: 'Los Angeles', fhirBaseUrl: 'https://epicproxy.et0988.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['ucla'] },
  { id: 'epic-8', name: 'UCSF Health', state: 'CA', city: 'San Francisco', fhirBaseUrl: 'https://unified-api.ucsf.edu/clinical/apex/api/FHIR/R4', aliases: ['ucsf'] },
  { id: 'epic-9', name: 'Stanford Health Care', state: 'CA', city: 'Stanford', fhirBaseUrl: 'https://epicproxy.et0874.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['stanford'] },
  { id: 'epic-10', name: 'Mount Sinai Health System', state: 'NY', city: 'New York', fhirBaseUrl: 'https://epicproxy.et1028.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['mount sinai', 'sinai'] },
  { id: 'epic-11', name: 'Penn Medicine', state: 'PA', city: 'Philadelphia', fhirBaseUrl: 'https://ssproxy.pennhealth.com/PRD-FHIR/api/FHIR/R4', aliases: ['penn', 'upenn'] },
  { id: 'epic-12', name: 'Cedars-Sinai', state: 'CA', city: 'Los Angeles', fhirBaseUrl: 'https://epicproxy.et1038.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['cedars'] },
  { id: 'epic-13', name: 'Northwestern Medicine', state: 'IL', city: 'Chicago', fhirBaseUrl: 'https://epicproxy.et1057.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['northwestern'] },
  { id: 'epic-14', name: 'Kaiser Permanente', state: 'CA', city: 'Oakland', fhirBaseUrl: 'https://epicproxy.et1116.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['kaiser', 'kp'] },
  { id: 'epic-15', name: 'Intermountain Health', state: 'UT', city: 'Salt Lake City', fhirBaseUrl: 'https://epicproxy.et0871.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['intermountain'] },
  { id: 'epic-16', name: 'UNC Health', state: 'NC', city: 'Chapel Hill', fhirBaseUrl: 'https://epicproxy.et0893.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['unc'] },
  { id: 'epic-17', name: 'Emory Healthcare', state: 'GA', city: 'Atlanta', fhirBaseUrl: 'https://epicproxy.et0990.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['emory'] },
  { id: 'epic-18', name: 'Vanderbilt University Medical Center', state: 'TN', city: 'Nashville', fhirBaseUrl: 'https://epicproxy.et0846.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['vanderbilt', 'vumc'] },
  { id: 'epic-19', name: 'UW Medicine', state: 'WA', city: 'Seattle', fhirBaseUrl: 'https://epicproxy.et0930.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['uw medicine'] },
  { id: 'epic-20', name: 'UChicago Medicine', state: 'IL', city: 'Chicago', fhirBaseUrl: 'https://epicproxy.et0830.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['uchicago'] },
]

const OTHER_EHRS = [
  { id: 'cerner', name: 'Oracle Health (Cerner)', description: 'Used by VA Healthcare, Adventist Health, and 300+ organizations', logo: '🔴', color: '#C4262E', bgColor: 'rgba(196,38,46,0.08)', sandbox: true, dataTypes: ['Labs', 'Medications', 'Conditions', 'Allergies', 'Immunizations'] },
  { id: 'meditech', name: 'MEDITECH', description: 'Used by 2,300+ hospitals worldwide', logo: '🟢', color: '#00843D', bgColor: 'rgba(0,132,61,0.08)', comingSoon: true, dataTypes: ['Labs', 'Medications', 'Conditions', 'Allergies'] },
  { id: 'nextgen', name: 'NextGen Healthcare', description: 'Used by 100,000+ providers', logo: '🔵', color: '#0066CC', bgColor: 'rgba(0,102,204,0.08)', comingSoon: true, dataTypes: ['Labs', 'Medications', 'Conditions'] },
]

const DATA_ICONS: Record<string, any> = { Labs: Activity, Medications: Pill, Conditions: Heart, Allergies: AlertCircle, Immunizations: Syringe, Visits: FileText }
const EPIC_DATA_TYPES = ['Labs', 'Medications', 'Conditions', 'Allergies', 'Immunizations', 'Visits']

interface Connection {
  connectionId: string; provider: string; providerName: string; status: 'active' | 'expired' | 'error'
  lastSynced: string; patientFhirId: string; recordCount: number; facilityName?: string
}

// ─── PKCE Helpers ────────────────────────────────────────────────────────────
function generateCodeVerifier(): string {
  const arr = new Uint8Array(32); crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function generateCodeChallenge(v: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export default function HealthSourcesPage() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [view, setView] = useState<'main' | 'picker'>('main')
  const [search, setSearch] = useState('')
  const [selOrg, setSelOrg] = useState<typeof EPIC_ORGS[0] | null>(null)
  const [discovering, setDiscovering] = useState(false)
  const [discError, setDiscError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'https://3kxwuprwp8.execute-api.us-east-1.amazonaws.com/prod'

  const filteredOrgs = EPIC_ORGS.filter(o => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return o.name.toLowerCase().includes(q) || o.city.toLowerCase().includes(q) || o.state.toLowerCase().includes(q) || o.aliases.some(a => a.includes(q))
  })

  useEffect(() => {
    if (view === 'picker') setTimeout(() => searchRef.current?.focus(), 100)
  }, [view])

  // Load existing connections
  useEffect(() => {
    if (!user?.sub) return
    fetch(`${API}/fhir/connections?patientId=${user.sub}`).then(r => r.ok ? r.json() : null).then(d => {
      if (d?.connections) setConnections(d.connections)
    }).catch(() => {})
  }, [user, API])

  // ─── SMART on FHIR Discovery → OAuth Redirect ─────────────────────────────
  const handleEpicConnect = useCallback(async (org: typeof EPIC_ORGS[0]) => {
    setSelOrg(org); setDiscovering(true); setDiscError(null)
    try {
      // Discover OAuth endpoints via Lambda (avoids CORS on Epic endpoints)
      const res = await fetch(`${API}/fhir/discover`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fhirBaseUrl: org.fhirBaseUrl })
      })
      let authorizeUrl: string, tokenUrl: string
      if (res.ok) {
        const ep = await res.json(); authorizeUrl = ep.authorizeUrl; tokenUrl = ep.tokenUrl
      } else {
        // Fallback: direct .well-known
        const wk = await fetch(`${org.fhirBaseUrl}/.well-known/smart-configuration`, { headers: { Accept: 'application/json' } })
        if (!wk.ok) throw new Error('Could not discover OAuth endpoints')
        const cfg = await wk.json(); authorizeUrl = cfg.authorization_endpoint; tokenUrl = cfg.token_endpoint
      }
      if (!authorizeUrl || !tokenUrl) throw new Error('OAuth endpoints not found for this health system')

      // PKCE
      const codeVerifier = generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
      sessionStorage.setItem('pkce_code_verifier', codeVerifier)
      sessionStorage.setItem('fhir_token_url', tokenUrl)
      sessionStorage.setItem('fhir_base_url', org.fhirBaseUrl)

      // State
      const state = btoa(JSON.stringify({
        patientId: user?.sub, provider: 'epic', orgId: org.id, orgName: org.name,
        fhirBaseUrl: org.fhirBaseUrl, tokenUrl, timestamp: Date.now(),
      }))

      const params = new URLSearchParams({
        response_type: 'code', client_id: EPIC_PROD_CLIENT_ID,
        redirect_uri: `${window.location.origin}/patient/health-sources/callback`,
        scope: EPIC_SCOPES, state, aud: org.fhirBaseUrl,
        code_challenge: codeChallenge, code_challenge_method: 'S256',
      })

      // Redirect to health system's MyChart login
      window.location.href = `${authorizeUrl}?${params.toString()}`
    } catch (err: any) {
      setDiscError(err.message || 'Failed to connect'); setDiscovering(false)
    }
  }, [user, API])

  const handleSync = async (connId: string, provider: string) => {
    setSyncing(provider)
    try {
      const r = await fetch(`${API}/fhir/sync`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionId: connId, patientId: user?.sub }) })
      if (r.ok) { const d = await r.json(); setConnections(p => p.map(c => c.connectionId === connId ? { ...c, lastSynced: new Date().toISOString(), recordCount: d.recordCount || c.recordCount } : c)) }
    } catch {} finally { setSyncing(null) }
  }

  const handleDisconnect = async (connId: string) => {
    try { await fetch(`${API}/fhir/connections/${connId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patientId: user?.sub }) }) } catch {}
    setConnections(p => p.filter(c => c.connectionId !== connId)); setConfirmDisconnect(null)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'active') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5" />Connected</span>
    if (status === 'expired') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700"><AlertCircle className="w-3.5 h-3.5" />Token Expired</span>
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700"><AlertCircle className="w-3.5 h-3.5" />Error</span>
  }

  const DataTag = ({ dt }: { dt: string }) => { const Icon = DATA_ICONS[dt] || FileText; return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-md"><Icon className="w-3 h-3" />{dt}</span> }

  // ═══════════════════════════════════════════════════════════════════════════
  // ORGANIZATION PICKER
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'picker') return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => { setView('main'); setSearch(''); setDiscError(null) }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connect Epic MyChart</h1>
          <p className="text-gray-500 mt-0.5">Find your health system to sign in with MyChart</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by hospital name, city, or state..."
          className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0A6E6E]/30 focus:border-[#0A6E6E] transition-all text-[15px]" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 text-gray-400"><X className="w-4 h-4" /></button>}
      </div>

      {discError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="text-sm text-red-600 mt-1">{discError}</p>
            <p className="text-xs text-red-400 mt-2">Try a different health system or try again later.</p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-gray-400 px-1">{filteredOrgs.length} health system{filteredOrgs.length !== 1 ? 's' : ''} found</p>
        {filteredOrgs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No health systems found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filteredOrgs.map(org => {
              const loading = discovering && selOrg?.id === org.id
              return (
                <button key={org.id} onClick={() => handleEpicConnect(org)} disabled={discovering}
                  className={`w-full bg-white rounded-xl border p-4 flex items-center gap-4 text-left transition-all ${loading ? 'border-[#0A6E6E] bg-[#0A6E6E]/5' : 'border-gray-200 hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5'} disabled:opacity-60 disabled:cursor-wait`}>
                  <div className="w-11 h-11 rounded-lg bg-red-50 flex items-center justify-center text-xl flex-shrink-0">🏥</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{org.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5"><MapPin className="w-3.5 h-3.5" />{org.city}, {org.state}</p>
                  </div>
                  <div className="flex-shrink-0">{loading ? <Loader2 className="w-5 h-5 text-[#0A6E6E] animate-spin" /> : <ExternalLink className="w-4 h-4 text-gray-400" />}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Don&apos;t see your health system? Over 800 health systems use Epic and we&apos;re adding more from Epic&apos;s endpoint directory.
            Check if your provider uses MyChart at <a href="https://mychart.org" target="_blank" rel="noopener noreferrer" className="text-[#0A6E6E] underline">mychart.org</a>.
          </p>
        </div>
      </div>
    </div>
  )

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Health Sources</h1>
        <p className="text-gray-500 mt-1">Connect your patient portals to see all your health data in one place</p>
      </div>

      {/* How it Works */}
      <div className="bg-gradient-to-r from-[#054848] to-[#0A6E6E] rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6" /></div>
          <div>
            <h2 className="text-lg font-semibold mb-2">How it works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/90">
              <div className="flex items-start gap-2"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span><span>Choose your health system and sign in with <strong>your MyChart credentials</strong></span></div>
              <div className="flex items-start gap-2"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span><span>Approve <strong>read-only access</strong> — we never modify your records</span></div>
              <div className="flex items-start gap-2"><span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span><span>Your labs, meds, and records appear in your <strong>unified dashboard</strong></span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Portals */}
      {connections.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-[#0A6E6E]" />Connected Portals ({connections.length})</h2>
          <div className="space-y-3">
            {connections.map(conn => (
              <div key={conn.connectionId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl">🏥</div>
                    <div>
                      <div className="flex items-center gap-3"><h3 className="font-semibold text-gray-900">{conn.providerName}</h3><StatusBadge status={conn.status} /></div>
                      {conn.facilityName && <p className="text-sm text-gray-500 mt-0.5">{conn.facilityName}</p>}
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Last synced: {new Date(conn.lastSynced).toLocaleString()}</span>
                        {conn.recordCount > 0 && <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{conn.recordCount} records</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSync(conn.connectionId, conn.provider)} disabled={syncing === conn.provider} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#0A6E6E] transition-colors disabled:opacity-50" title="Sync now">
                      <RefreshCw className={`w-4 h-4 ${syncing === conn.provider ? 'animate-spin' : ''}`} />
                    </button>
                    <button onClick={() => setConfirmDisconnect(conn.connectionId)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Disconnect"><Unlink className="w-4 h-4" /></button>
                  </div>
                </div>
                {confirmDisconnect === conn.connectionId && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-700 mb-3">Disconnect from {conn.providerName}? Your synced data will be removed.</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDisconnect(conn.connectionId)} className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Disconnect</button>
                      <button onClick={() => setConfirmDisconnect(null)} className="px-3 py-1.5 text-xs font-medium bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Portals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-[#0A6E6E]" />{connections.length > 0 ? 'Connect Another Portal' : 'Available Portals'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Epic Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl flex-shrink-0">🏥</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Epic MyChart</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">Production</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Used by Mayo Clinic, Johns Hopkins, Cleveland Clinic, and 250+ health systems</p>
                <div className="flex flex-wrap gap-1.5 mt-3">{EPIC_DATA_TYPES.map(dt => <DataTag key={dt} dt={dt} />)}</div>
                <button onClick={() => setView('picker')} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #E8173A, #E8173Add)' }}>
                  <Building2 className="w-4 h-4" />Find Your Health System
                </button>
              </div>
            </div>
          </div>

          {/* Other EHRs */}
          {OTHER_EHRS.map(ehr => (
            <div key={ehr.id} className={`bg-white rounded-xl border border-gray-200 p-5 transition-all ${ehr.comingSoon ? 'opacity-60' : 'hover:shadow-md hover:border-gray-300 cursor-pointer'}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: ehr.bgColor }}>{ehr.logo}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{ehr.name}</h3>
                    {ehr.comingSoon && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">Coming Soon</span>}
                    {!ehr.comingSoon && ehr.sandbox && <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">Sandbox</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{ehr.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">{ehr.dataTypes.map(dt => <DataTag key={dt} dt={dt} />)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What data can we pull */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-[#0A6E6E]" />What data can we pull?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Activity, label: 'Lab Results', desc: 'Blood work, urinalysis, metabolic panels, lipid panels' },
            { icon: Pill, label: 'Medications', desc: 'Current prescriptions, dosages, and refill dates' },
            { icon: Heart, label: 'Conditions', desc: 'Active diagnoses, chronic conditions, problem list' },
            { icon: AlertCircle, label: 'Allergies', desc: 'Drug allergies, food allergies, environmental reactions' },
            { icon: Syringe, label: 'Immunizations', desc: 'Vaccine records, boosters, COVID-19 vaccinations' },
            { icon: FileText, label: 'Visit History', desc: 'Past appointments, discharge summaries, clinical notes' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[rgba(14,234,202,0.12)] flex items-center justify-center flex-shrink-0"><item.icon className="w-4 h-4 text-[#0A6E6E]" /></div>
              <div><h3 className="font-medium text-gray-900 text-sm">{item.label}</h3><p className="text-xs text-gray-500 mt-0.5">{item.desc}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#0A6E6E] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-1">Powered by SMART on FHIR®</p>
            <p>MediConnect Pro uses the SMART on FHIR standard — the same technology mandated by the 21st Century Cures Act for secure health data exchange. We request <strong>read-only access</strong> to your records. We never store your portal passwords and you can disconnect at any time.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
