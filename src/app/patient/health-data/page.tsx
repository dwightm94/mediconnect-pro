'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { 
  Activity, Pill, Heart, AlertCircle, Syringe, FileText, Clock,
  TrendingUp, TrendingDown, Minus, Filter, ChevronDown, Building2, Calendar
} from 'lucide-react'
import Link from 'next/link'

type HealthTab = 'overview' | 'labs' | 'medications' | 'conditions' | 'allergies' | 'immunizations' | 'timeline'

// ── MOCK DATA ──
// This simulates what we'd get back from FHIR APIs after normalization
// Each record has a "source" field showing which portal it came from
// In production: fetched from our fhir_health_data DynamoDB table

const labs = [
  {
    id: 'lab_epic_001', source: 'epic', sourceName: 'Mayo Clinic via Epic MyChart',
    date: '2026-02-01', title: 'Complete Blood Count (CBC)', status: 'final', category: 'laboratory',
    components: [
      { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '12.0-16.0', status: 'normal' },
      { name: 'White Blood Cells', value: '7.8', unit: 'K/uL', range: '4.5-11.0', status: 'normal' },
      { name: 'Platelets', value: '245', unit: 'K/uL', range: '150-400', status: 'normal' },
      { name: 'Red Blood Cells', value: '4.9', unit: 'M/uL', range: '4.5-5.5', status: 'normal' },
    ],
  },
  {
    id: 'lab_epic_002', source: 'epic', sourceName: 'Mayo Clinic via Epic MyChart',
    date: '2026-02-01', title: 'Comprehensive Metabolic Panel', status: 'final', category: 'laboratory',
    components: [
      { name: 'Glucose', value: '102', unit: 'mg/dL', range: '70-100', status: 'high' },
      { name: 'BUN', value: '18', unit: 'mg/dL', range: '7-20', status: 'normal' },
      { name: 'Creatinine', value: '0.9', unit: 'mg/dL', range: '0.7-1.3', status: 'normal' },
      { name: 'Sodium', value: '140', unit: 'mmol/L', range: '136-145', status: 'normal' },
      { name: 'Potassium', value: '4.1', unit: 'mmol/L', range: '3.5-5.0', status: 'normal' },
    ],
  },
  {
    id: 'lab_cerner_001', source: 'cerner', sourceName: 'VA Hospital via Oracle Health',
    date: '2026-01-15', title: 'Lipid Panel', status: 'final', category: 'laboratory',
    components: [
      { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '<200', status: 'high' },
      { name: 'LDL', value: '130', unit: 'mg/dL', range: '<100', status: 'high' },
      { name: 'HDL', value: '55', unit: 'mg/dL', range: '>40', status: 'normal' },
      { name: 'Triglycerides', value: '145', unit: 'mg/dL', range: '<150', status: 'normal' },
    ],
  },
]

const medications = [
  { id: 'med_epic_001', source: 'epic', sourceName: 'Mayo Clinic via Epic MyChart', title: 'Lisinopril 10mg', dosage: '10mg tablet, once daily', status: 'active', prescriber: 'Dr. Sarah Chen', startDate: '2025-06-15', refillDate: '2026-02-28' },
  { id: 'med_epic_002', source: 'epic', sourceName: 'Mayo Clinic via Epic MyChart', title: 'Metformin 500mg', dosage: '500mg tablet, twice daily with meals', status: 'active', prescriber: 'Dr. Sarah Chen', startDate: '2025-08-20', refillDate: '2026-03-15' },
  { id: 'med_cerner_001', source: 'cerner', sourceName: 'VA Hospital via Oracle Health', title: 'Atorvastatin 20mg', dosage: '20mg tablet, once daily at bedtime', status: 'active', prescriber: 'Dr. Michael Ross', startDate: '2025-01-10', refillDate: '2026-02-10' },
]

const conditions = [
  { id: 'cond_001', source: 'epic', sourceName: 'Mayo Clinic', title: 'Essential Hypertension', status: 'active', onset: '2024-03-15', category: 'Cardiovascular' },
  { id: 'cond_002', source: 'epic', sourceName: 'Mayo Clinic', title: 'Type 2 Diabetes Mellitus', status: 'active', onset: '2025-08-20', category: 'Endocrine' },
  { id: 'cond_003', source: 'cerner', sourceName: 'VA Hospital', title: 'Hyperlipidemia', status: 'active', onset: '2025-01-10', category: 'Cardiovascular' },
]

const allergies = [
  { id: 'allergy_001', source: 'epic', sourceName: 'Mayo Clinic', title: 'Penicillin', reaction: 'Rash, Hives', severity: 'moderate', type: 'medication' },
  { id: 'allergy_002', source: 'epic', sourceName: 'Mayo Clinic', title: 'Sulfa Drugs', reaction: 'Anaphylaxis', severity: 'severe', type: 'medication' },
  { id: 'allergy_003', source: 'cerner', sourceName: 'VA Hospital', title: 'Shellfish', reaction: 'Swelling', severity: 'mild', type: 'food' },
]

const immunizations = [
  { id: 'imm_001', source: 'epic', sourceName: 'Mayo Clinic', title: 'COVID-19 Vaccine (Pfizer)', date: '2025-10-15', status: 'completed', dose: 'Booster #3' },
  { id: 'imm_002', source: 'epic', sourceName: 'Mayo Clinic', title: 'Influenza Vaccine 2025-26', date: '2025-09-20', status: 'completed', dose: 'Annual' },
  { id: 'imm_003', source: 'cerner', sourceName: 'VA Hospital', title: 'Tdap', date: '2024-06-10', status: 'completed', dose: 'Booster' },
  { id: 'imm_004', source: 'epic', sourceName: 'Mayo Clinic', title: 'Hepatitis B', date: '2023-03-01', status: 'completed', dose: 'Series Complete' },
]

// Color mapping for each EHR source — used in source badges
const SOURCE_COLORS: Record<string, string> = {
  epic: '#E8173A', cerner: '#C4262E', meditech: '#00843D', nextgen: '#0066CC',
}

const API_BASE = 'https://3kxwuprwp8.execute-api.us-east-1.amazonaws.com/prod'

// Normalize FHIR Observation → our lab format
function normalizeLabs(observations: any[], source: string, sourceName: string) {
  return observations.map((obs: any, i: number) => ({
    id: obs.id || `lab_${source}_${i}`,
    source,
    sourceName,
    date: obs.effectiveDateTime || obs.issued || '',
    title: obs.code?.text || obs.code?.coding?.[0]?.display || 'Lab Result',
    status: obs.status || 'final',
    category: 'laboratory',
    components: obs.component
      ? obs.component.map((c: any) => ({
          name: c.code?.text || c.code?.coding?.[0]?.display || '',
          value: c.valueQuantity?.value?.toString() || c.valueString || '',
          unit: c.valueQuantity?.unit || '',
          range: c.referenceRange?.[0]?.text || '',
          status: 'normal',
        }))
      : [{
          name: obs.code?.text || obs.code?.coding?.[0]?.display || '',
          value: obs.valueQuantity?.value?.toString() || obs.valueString || '',
          unit: obs.valueQuantity?.unit || '',
          range: obs.referenceRange?.[0]?.text || '',
          status: 'normal',
        }],
  }))
}

function normalizeMeds(meds: any[], source: string, sourceName: string) {
  return meds.map((m: any, i: number) => ({
    id: m.id || `med_${source}_${i}`,
    source,
    sourceName,
    title: m.medicationCodeableConcept?.text || m.medicationReference?.display || 'Medication',
    dosage: m.dosageInstruction?.[0]?.text || '',
    status: m.status || 'active',
    startDate: m.authoredOn || '',
  }))
}

function normalizeConditions(conditions: any[], source: string, sourceName: string) {
  return conditions.map((c: any, i: number) => ({
    id: c.id || `cond_${source}_${i}`,
    source,
    sourceName,
    title: c.code?.text || c.code?.coding?.[0]?.display || 'Condition',
    status: c.clinicalStatus?.coding?.[0]?.code || 'active',
    onset: c.onsetDateTime || c.recordedDate || '',
    category: c.category?.[0]?.coding?.[0]?.display || 'Problem',
  }))
}

function normalizeAllergies(allergies: any[], source: string, sourceName: string) {
  return allergies.map((a: any, i: number) => ({
    id: a.id || `allergy_${source}_${i}`,
    source,
    sourceName,
    title: a.code?.text || a.code?.coding?.[0]?.display || 'Allergy',
    severity: a.reaction?.[0]?.severity || 'moderate',
    reaction: a.reaction?.[0]?.manifestation?.[0]?.text || a.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || '',
    category: a.category?.[0] || 'medication',
  }))
}

function normalizeImmunizations(immunizations: any[], source: string, sourceName: string) {
  return immunizations.map((im: any, i: number) => ({
    id: im.id || `imm_${source}_${i}`,
    source,
    sourceName,
    title: im.vaccineCode?.text || im.vaccineCode?.coding?.[0]?.display || 'Immunization',
    date: im.occurrenceDateTime || '',
    status: im.status || 'completed',
    dose: im.protocolApplied?.[0]?.doseNumberString || '',
  }))
}

export default function UnifiedHealthPage() {
  const [activeTab, setActiveTab] = useState<HealthTab>('overview')
  const [expandedLab, setExpandedLab] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [labs, setLabs] = useState(labs)
  const [medications, setMedications] = useState(medications)
  const [conditions, setConditions] = useState(conditions)
  const [allergies, setAllergies] = useState(allergies)
  const [immunizations, setImmunizations] = useState(immunizations)
  const [dataSource, setDataSource] = useState<'mock' | 'live'>('mock')
  const [isLoading, setIsLoading] = useState(false)

  // Try to fetch real FHIR data from connected portals
  useEffect(() => {
    const fetchHealthData = async () => {
      const patientId = localStorage.getItem('patientId') || 'patient_default'
      setIsLoading(true)
      try {
        const res = await fetch(`${API_BASE}/fhir/health-data?patientId=${patientId}`)
        const json = await res.json()
        if (json.data && Object.keys(json.data).length > 0) {
          let allLabs: any[] = [], allMeds: any[] = [], allConds: any[] = [], allAllergies: any[] = [], allImms: any[] = []
          for (const [provider, info] of Object.entries(json.data) as any[]) {
            if (info.error) continue
            const src = provider
            const srcName = info.providerName || provider
            const r = info.resources || {}
            if (r.Observation) allLabs.push(...normalizeLabs(r.Observation, src, srcName))
            if (r.MedicationRequest) allMeds.push(...normalizeMeds(r.MedicationRequest, src, srcName))
            if (r.Condition) allConds.push(...normalizeConditions(r.Condition, src, srcName))
            if (r.AllergyIntolerance) allAllergies.push(...normalizeAllergies(r.AllergyIntolerance, src, srcName))
            if (r.Immunization) allImms.push(...normalizeImmunizations(r.Immunization, src, srcName))
          }
          if (allLabs.length || allMeds.length || allConds.length || allAllergies.length || allImms.length) {
            setLabs(allLabs.length ? allLabs : labs)
            setMedications(allMeds.length ? allMeds : medications)
            setConditions(allConds.length ? allConds : conditions)
            setAllergies(allAllergies.length ? allAllergies : allergies)
            setImmunizations(allImms.length ? allImms : immunizations)
            setDataSource('live')
          }
        }
      } catch (err) {
        console.log('Using mock data (no connections or API error)')
      } finally {
        setIsLoading(false)
      }
    }
    fetchHealthData()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'labs', label: 'Labs', icon: Activity, count: labs.length },
    { id: 'medications', label: 'Meds', icon: Pill, count: medications.length },
    { id: 'conditions', label: 'Conditions', icon: Heart, count: conditions.length },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle, count: allergies.length },
    { id: 'immunizations', label: 'Vaccines', icon: Syringe, count: immunizations.length },
    { id: 'timeline', label: 'Timeline', icon: Clock },
  ]

  // Helper: shows up/down/normal arrow based on lab result
  const getStatusIcon = (status: string) => {
    if (status === 'high') return <TrendingUp className="w-4 h-4 text-red-500" />
    if (status === 'low') return <TrendingDown className="w-4 h-4 text-blue-500" />
    return <Minus className="w-4 h-4 text-green-500" />
  }

  // Helper: colored badge showing which hospital/portal the data came from
  const getSourceBadge = (source: string, sourceName: string) => (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: (SOURCE_COLORS[source] || '#666') + '12', color: SOURCE_COLORS[source] || '#666' }}>
      <Building2 className="w-3 h-3" />{sourceName}
    </span>
  )

  return (
    <div className="space-y-6">
      {/* Header with link to connect more portals */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Health Data</h1>
          <p className="text-gray-500 mt-1">Unified view from all connected portals</p>
        </div>
        <Link href="/patient/health-sources" className="px-4 py-2 bg-[#0A6E6E] text-white rounded-xl text-sm font-medium hover:bg-[#054848] transition-colors">
          + Connect Portal
        </Link>
      </div>

      {/* Source filter — let patients filter by which portal */}
      <div className="flex items-center gap-2 text-sm">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'epic', 'cerner'].map(f => (
          <button key={f} onClick={() => setSourceFilter(f)}
            className={'px-3 py-1 rounded-full transition-colors ' + (sourceFilter === f
              ? (f === 'all' ? 'bg-[#0A6E6E] text-white' : f === 'epic' ? 'bg-[#E8173A] text-white' : 'bg-[#C4262E] text-white')
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
            {f === 'all' ? 'All Sources' : f === 'epic' ? 'Epic MyChart' : 'Oracle Health'}
          </button>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as HealthTab)}
              className={'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ' +
                (activeTab === tab.id ? 'border-[#0A6E6E] text-[#0A6E6E]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}>
              <tab.icon className="w-4 h-4" />{tab.label}
              {tab.count !== undefined && (
                <span className={'px-1.5 py-0.5 rounded-full text-xs ' + (activeTab === tab.id ? 'bg-[rgba(14,234,202,0.15)] text-[#0A6E6E]' : 'bg-gray-100 text-gray-500')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ── OVERVIEW TAB ── Summary cards + recent data */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Lab Results', count: labs.length, icon: Activity, color: '#0A6E6E' },
              { label: 'Active Meds', count: medications.length, icon: Pill, color: '#7C3AED' },
              { label: 'Conditions', count: conditions.length, icon: Heart, color: '#DC2626' },
              { label: 'Allergies', count: allergies.length, icon: AlertCircle, color: '#F59E0B' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: card.color + '12' }}>
                    <card.icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{card.count}</div>
                    <div className="text-xs text-gray-500">{card.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Lab Results</h3>
            <div className="space-y-3">
              {labs.map((lab) => (
                <div key={lab.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-[#0A6E6E]" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{lab.title}</div>
                      <div className="text-xs text-gray-500">{lab.date}</div>
                    </div>
                  </div>
                  {getSourceBadge(lab.source, lab.sourceName.split(' via ')[0])}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Active Medications</h3>
            <div className="space-y-3">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Pill className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{med.title}</div>
                      <div className="text-xs text-gray-500">{med.dosage}</div>
                    </div>
                  </div>
                  {getSourceBadge(med.source, med.sourceName.split(' via ')[0])}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── LABS TAB ── Expandable lab panels with individual results */}
      {activeTab === 'labs' && (
        <div className="space-y-4">
          {labs.map((lab) => (
            <div key={lab.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setExpandedLab(expandedLab === lab.id ? null : lab.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(14,234,202,0.12)] flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#0A6E6E]" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{lab.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{lab.date}</span>
                      {getSourceBadge(lab.source, lab.sourceName.split(' via ')[0])}
                    </div>
                  </div>
                </div>
                <ChevronDown className={'w-5 h-5 text-gray-400 transition-transform ' + (expandedLab === lab.id ? 'rotate-180' : '')} />
              </button>
              {expandedLab === lab.id && (
                <div className="border-t border-gray-100 p-5">
                  <div className="text-xs text-gray-500 mb-3">{lab.sourceName}</div>
                  <div className="space-y-2">
                    {lab.components.map((comp, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(comp.status)}
                          <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={'font-bold ' + (comp.status === 'high' ? 'text-red-600' : comp.status === 'low' ? 'text-blue-600' : 'text-gray-900')}>
                            {comp.value} {comp.unit}
                          </span>
                          <span className="text-gray-400 text-xs w-24 text-right">Ref: {comp.range}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MEDICATIONS TAB ── */}
      {activeTab === 'medications' && (
        <div className="space-y-3">
          {medications.map((med) => (
            <div key={med.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{med.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{med.dosage}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Prescribed by {med.prescriber}</span>
                      <span>Since {med.startDate}</span>
                      <span>Refill by {med.refillDate}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{med.status}</span>
                  {getSourceBadge(med.source, med.sourceName.split(' via ')[0])}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CONDITIONS TAB ── */}
      {activeTab === 'conditions' && (
        <div className="space-y-3">
          {conditions.map((cond) => (
            <div key={cond.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><Heart className="w-5 h-5 text-red-500" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{cond.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{cond.category}</span><span>Since {cond.onset}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full">{cond.status}</span>
                  {getSourceBadge(cond.source, cond.sourceName)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ALLERGIES TAB ── */}
      {activeTab === 'allergies' && (
        <div className="space-y-3">
          {allergies.map((a) => (
            <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={'w-10 h-10 rounded-lg flex items-center justify-center ' + (a.severity === 'severe' ? 'bg-red-50' : a.severity === 'moderate' ? 'bg-amber-50' : 'bg-yellow-50')}>
                    <AlertCircle className={'w-5 h-5 ' + (a.severity === 'severe' ? 'text-red-500' : a.severity === 'moderate' ? 'text-amber-500' : 'text-yellow-500')} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Reaction: {a.reaction}</span>
                      <span className={'px-2 py-0.5 rounded-full font-medium ' + (a.severity === 'severe' ? 'bg-red-100 text-red-700' : a.severity === 'moderate' ? 'bg-amber-100 text-amber-700' : 'bg-yellow-100 text-yellow-700')}>{a.severity}</span>
                    </div>
                  </div>
                </div>
                {getSourceBadge(a.source, a.sourceName)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── IMMUNIZATIONS TAB ── */}
      {activeTab === 'immunizations' && (
        <div className="space-y-3">
          {immunizations.map((imm) => (
            <div key={imm.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center"><Syringe className="w-5 h-5 text-blue-500" /></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{imm.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{imm.date}</span>
                      <span>{imm.dose}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{imm.status}</span>
                  {getSourceBadge(imm.source, imm.sourceName)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TIMELINE TAB ── All data sorted chronologically */}
      {activeTab === 'timeline' && (
        <div className="space-y-0">
          {[
            ...labs.map(l => ({ ...l, type: 'lab', date: l.date, Icon: Activity, iconColor: '#0A6E6E', iconBg: 'rgba(14,234,202,0.12)' })),
            ...medications.map(m => ({ ...m, type: 'medication', date: m.startDate, Icon: Pill, iconColor: '#7C3AED', iconBg: '#F3E8FF' })),
            ...immunizations.map(i => ({ ...i, type: 'immunization', date: i.date, Icon: Syringe, iconColor: '#3B82F6', iconBg: '#EFF6FF' })),
            ...conditions.map(c => ({ ...c, type: 'condition', date: c.onset, Icon: Heart, iconColor: '#DC2626', iconBg: '#FEF2F2' })),
          ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((item, index, arr) => (
            <div key={item.type + '_' + item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
                  <item.Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                </div>
                {index < arr.length - 1 && <div className="w-0.5 h-full bg-gray-200 min-h-[24px]" />}
              </div>
              <div className="pb-6 flex-1">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">{item.date}</div>
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 capitalize">{item.type}</div>
                    </div>
                    {getSourceBadge(item.source, (item.sourceName || '').split(' via ')[0] || item.sourceName)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
