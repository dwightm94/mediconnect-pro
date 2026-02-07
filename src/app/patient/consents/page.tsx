'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Shield, Plus, Building2, Clock, CheckCircle, XCircle, AlertTriangle, Eye, Trash2 } from 'lucide-react'

interface Consent {
  id: string
  organizationName: string
  organizationType: 'hospital' | 'lab' | 'doctor_office' | 'pharmacy' | 'insurance' | 'urgent_care'
  purpose: string
  dataTypes: string[]
  status: 'active' | 'pending' | 'expired' | 'revoked'
  grantedDate?: string
  expirationDate?: string
  lastAccessed?: string
  accessCount?: number
}

interface Organization {
  id: string
  name: string
  type: string
  location: string
}

export default function ConsentsPage() {
  const { isAuthenticated } = useAuth()
  const [consents, setConsents] = useState<Consent[]>([])
  const [filteredConsents, setFilteredConsents] = useState<Consent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'revoked'>('all')
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showGrantModal, setShowGrantModal] = useState(false)
  const [searchOrg, setSearchOrg] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([])
  const [expirationDays, setExpirationDays] = useState('365')

  const dataTypeOptions = [
    { value: 'demographics', label: 'Demographics', icon: '👤', description: 'Name, DOB, contact info' },
    { value: 'lab_results', label: 'Lab Results', icon: '🔬', description: 'Blood work, urinalysis, etc.' },
    { value: 'imaging', label: 'Imaging', icon: '📷', description: 'X-rays, MRIs, CT scans' },
    { value: 'medications', label: 'Medications', icon: '💊', description: 'Current and past prescriptions' },
    { value: 'visit_notes', label: 'Visit Notes', icon: '📝', description: 'Doctor visit summaries' },
    { value: 'immunizations', label: 'Immunizations', icon: '💉', description: 'Vaccination records' },
    { value: 'allergies', label: 'Allergies', icon: '⚠️', description: 'Known allergies' },
    { value: 'conditions', label: 'Conditions', icon: '🩺', description: 'Diagnoses and conditions' },
  ]

  const mockOrganizations: Organization[] = [
    { id: 'o1', name: 'City General Hospital', type: 'hospital', location: 'New York, NY' },
    { id: 'o2', name: 'BioTech Labs', type: 'lab', location: 'New York, NY' },
    { id: 'o3', name: 'Metro Urgent Care', type: 'urgent_care', location: 'Brooklyn, NY' },
    { id: 'o4', name: 'HealthFirst Pharmacy', type: 'pharmacy', location: 'Manhattan, NY' },
    { id: 'o5', name: 'Downtown Medical Group', type: 'doctor_office', location: 'New York, NY' },
    { id: 'o6', name: 'Heart Health Institute', type: 'hospital', location: 'New York, NY' },
  ]

  const mockConsents: Consent[] = [
    { id: '1', organizationName: 'City General Hospital', organizationType: 'hospital', purpose: 'Ongoing Treatment', dataTypes: ['demographics', 'lab_results', 'medications', 'visit_notes', 'allergies', 'conditions'], status: 'active', grantedDate: '2025-06-15', expirationDate: '2026-06-15', lastAccessed: '2026-02-01', accessCount: 12 },
    { id: '2', organizationName: 'BioTech Labs', organizationType: 'lab', purpose: 'Laboratory Services', dataTypes: ['demographics', 'lab_results'], status: 'active', grantedDate: '2025-08-20', expirationDate: '2026-08-20', lastAccessed: '2026-02-01', accessCount: 5 },
    { id: '3', organizationName: 'Heart Health Institute', organizationType: 'hospital', purpose: 'Cardiology Consultation', dataTypes: ['demographics', 'lab_results', 'imaging', 'medications', 'conditions'], status: 'active', grantedDate: '2025-11-10', expirationDate: '2026-11-10', lastAccessed: '2026-01-28', accessCount: 3 },
    { id: '4', organizationName: 'Metro Urgent Care', organizationType: 'urgent_care', purpose: 'Emergency Access', dataTypes: ['demographics', 'medications', 'allergies', 'conditions'], status: 'pending', grantedDate: '2026-02-05' },
    { id: '5', organizationName: 'Old Family Practice', organizationType: 'doctor_office', purpose: 'Primary Care', dataTypes: ['demographics', 'lab_results', 'medications', 'visit_notes'], status: 'revoked', grantedDate: '2024-01-15', expirationDate: '2025-01-15' },
    { id: '6', organizationName: 'Previous Insurance Co', organizationType: 'insurance', purpose: 'Insurance Claims', dataTypes: ['demographics', 'visit_notes'], status: 'expired', grantedDate: '2024-06-01', expirationDate: '2025-06-01' },
  ]

  useEffect(() => {
    loadConsents()
  }, [])

  useEffect(() => {
    filterConsents()
  }, [filter, consents])

  const loadConsents = async () => {
    try {
      const data = await apiCall('/consents').catch(() => null)
      setConsents(data?.consents || mockConsents)
    } catch (error) {
      setConsents(mockConsents)
    } finally {
      setIsLoading(false)
    }
  }

  const filterConsents = () => {
    let filtered = [...consents]
    
    if (filter !== 'all') {
      filtered = filtered.filter(c => c.status === filter)
    }

    // Sort: active first, then pending, then others
    const statusOrder = { active: 0, pending: 1, expired: 2, revoked: 3 }
    filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

    setFilteredConsents(filtered)
  }

  const getOrgIcon = (type: string) => {
    const icons: Record<string, string> = {
      hospital: '🏥',
      lab: '🔬',
      doctor_office: '👨‍⚕️',
      pharmacy: '💊',
      insurance: '📋',
      urgent_care: '🚑',
    }
    return icons[type] || '🏢'
  }

  const getStatusColor = (status: string): 'ok' | 'warn' | 'error' | 'info' => {
    switch (status) {
      case 'active': return 'ok'
      case 'pending': return 'warn'
      case 'revoked': return 'error'
      case 'expired': return 'info'
      default: return 'info'
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const openDetail = (consent: Consent) => {
    setSelectedConsent(consent)
    setShowDetailModal(true)
  }

  const openRevoke = (consent: Consent) => {
    setSelectedConsent(consent)
    setShowRevokeModal(true)
  }

  const handleRevoke = async () => {
    if (!selectedConsent) return

    try {
      await apiCall(`/consents/${selectedConsent.id}`, {
        method: 'DELETE'
      }).catch(() => null)

      setConsents(prev =>
        prev.map(c =>
          c.id === selectedConsent.id
            ? { ...c, status: 'revoked' as const }
            : c
        )
      )
      setShowRevokeModal(false)
      setShowDetailModal(false)
    } catch (error) {
      console.error('Revoke failed:', error)
    }
  }

  const handleApprove = async (consent: Consent) => {
    try {
      await apiCall(`/consents/${consent.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'active' })
      }).catch(() => null)

      setConsents(prev =>
        prev.map(c =>
          c.id === consent.id
            ? { ...c, status: 'active' as const, grantedDate: new Date().toISOString().split('T')[0] }
            : c
        )
      )
    } catch (error) {
      console.error('Approve failed:', error)
    }
  }

  const handleDeny = async (consent: Consent) => {
    try {
      await apiCall(`/consents/${consent.id}`, {
        method: 'DELETE'
      }).catch(() => null)

      setConsents(prev => prev.filter(c => c.id !== consent.id))
    } catch (error) {
      console.error('Deny failed:', error)
    }
  }

  const handleGrantConsent = async () => {
    if (!selectedOrg || selectedDataTypes.length === 0) return

    try {
      const newConsent: Consent = {
        id: `new-${Date.now()}`,
        organizationName: selectedOrg.name,
        organizationType: selectedOrg.type as Consent['organizationType'],
        purpose: 'Data Access',
        dataTypes: selectedDataTypes,
        status: 'active',
        grantedDate: new Date().toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        accessCount: 0
      }

      await apiCall('/consents', {
        method: 'POST',
        body: JSON.stringify(newConsent)
      }).catch(() => null)

      setConsents(prev => [...prev, newConsent])
      setShowGrantModal(false)
      setSelectedOrg(null)
      setSelectedDataTypes([])
      setSearchOrg('')
    } catch (error) {
      console.error('Grant failed:', error)
    }
  }

  const toggleDataType = (value: string) => {
    setSelectedDataTypes(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const filteredOrgs = mockOrganizations.filter(o =>
    o.name.toLowerCase().includes(searchOrg.toLowerCase())
  )

  if (isLoading) {
    return <Loading text="Loading your consents..." />
  }

  const activeCount = consents.filter(c => c.status === 'active').length
  const pendingCount = consents.filter(c => c.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Data Consents</h1>
          <p className="text-gray-500">Control who can access your health information</p>
        </div>
        <Button onClick={() => setShowGrantModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Grant New Consent
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-[#0A6E6E] to-[#0EEACA] text-white rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Your Data, Your Control</h3>
            <p className="text-sm opacity-90">
              You decide which healthcare organizations can access your records. 
              You can revoke access at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-gray-500">Active Consents</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending Requests</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-[#0A6E6E]">
              {consents.reduce((sum, c) => sum + (c.accessCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-500">Total Accesses</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-gray-600">
              {consents.filter(c => c.status === 'revoked').length}
            </div>
            <div className="text-sm text-gray-500">Revoked</div>
          </CardBody>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['all', 'active', 'pending', 'revoked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === f
                ? 'bg-white shadow text-[#0A6E6E]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Consents List */}
      {filteredConsents.length === 0 ? (
        <EmptyState
          icon="🔒"
          title="No consents found"
          description={filter === 'all' ? 'Grant consent to healthcare providers to share your data' : `No ${filter} consents`}
          action={
            filter === 'all' ? (
              <Button onClick={() => setShowGrantModal(true)}>Grant Consent</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredConsents.map((consent) => (
            <Card 
              key={consent.id} 
              className={`overflow-hidden ${consent.status === 'revoked' || consent.status === 'expired' ? 'opacity-60' : ''}`}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-2xl">
                    {getOrgIcon(consent.organizationType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{consent.organizationName}</h3>
                        <p className="text-sm text-gray-500">{consent.purpose}</p>
                      </div>
                      <Chip variant={getStatusColor(consent.status)}>
                        {consent.status}
                      </Chip>
                    </div>

                    {/* Data Types */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {consent.dataTypes.slice(0, 4).map((type) => {
                        const option = dataTypeOptions.find(o => o.value === type)
                        return (
                          <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {option?.icon} {option?.label || type}
                          </span>
                        )
                      })}
                      {consent.dataTypes.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{consent.dataTypes.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {consent.grantedDate && (
                        <span>Granted: {formatDate(consent.grantedDate)}</span>
                      )}
                      {consent.expirationDate && consent.status === 'active' && (
                        <span>Expires: {formatDate(consent.expirationDate)}</span>
                      )}
                      {consent.accessCount !== undefined && consent.status === 'active' && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {consent.accessCount} accesses
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {consent.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => handleApprove(consent)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeny(consent)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                        </>
                      )}
                      {consent.status === 'active' && (
                        <>
                          <Button size="sm" variant="secondary" onClick={() => openDetail(consent)}>
                            View Details
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openRevoke(consent)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Revoke
                          </Button>
                        </>
                      )}
                      {(consent.status === 'revoked' || consent.status === 'expired') && (
                        <Button size="sm" variant="secondary" onClick={() => openDetail(consent)}>
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Consent Details"
      >
        {selectedConsent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-3xl">
                {getOrgIcon(selectedConsent.organizationType)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedConsent.organizationName}</h3>
                <p className="text-sm text-gray-500">{selectedConsent.purpose}</p>
                <Chip variant={getStatusColor(selectedConsent.status)} className="mt-1">
                  {selectedConsent.status}
                </Chip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Granted Date</div>
                <div className="font-medium">{formatDate(selectedConsent.grantedDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Expiration Date</div>
                <div className="font-medium">{formatDate(selectedConsent.expirationDate)}</div>
              </div>
              {selectedConsent.lastAccessed && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Last Accessed</div>
                  <div className="font-medium">{formatDate(selectedConsent.lastAccessed)}</div>
                </div>
              )}
              {selectedConsent.accessCount !== undefined && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total Accesses</div>
                  <div className="font-medium">{selectedConsent.accessCount}</div>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Authorized Data Types</div>
              <div className="grid grid-cols-2 gap-2">
                {selectedConsent.dataTypes.map((type) => {
                  const option = dataTypeOptions.find(o => o.value === type)
                  return (
                    <div key={type} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <span className="text-lg">{option?.icon}</span>
                      <span className="text-sm font-medium text-green-800">{option?.label || type}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {selectedConsent.status === 'active' && (
              <Button variant="danger" className="w-full" onClick={() => {
                setShowDetailModal(false)
                openRevoke(selectedConsent)
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Revoke Access
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Revoke Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Consent"
      >
        {selectedConsent && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-800">
                Are you sure you want to revoke <strong>{selectedConsent.organizationName}</strong>'s access to your health data?
              </p>
              <p className="text-sm text-red-600 mt-2">
                They will no longer be able to view your records.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowRevokeModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleRevoke}>
                Yes, Revoke Access
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Grant Consent Modal */}
      <Modal
        isOpen={showGrantModal}
        onClose={() => {
          setShowGrantModal(false)
          setSelectedOrg(null)
          setSelectedDataTypes([])
          setSearchOrg('')
        }}
        title="Grant New Consent"
      >
        <div className="space-y-4">
          {!selectedOrg ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Organization
                </label>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none"
                />
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-[#0A6E6E] cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-xl">
                      {getOrgIcon(org.type)}
                    </div>
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-xl">
                  {getOrgIcon(selectedOrg.type)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{selectedOrg.name}</div>
                  <div className="text-sm text-gray-500">{selectedOrg.location}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrg(null)}>
                  Change
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Data to Share
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dataTypeOptions.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => toggleDataType(option.value)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDataTypes.includes(option.value)
                          ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{option.icon}</span>
                      <div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consent Duration
                </label>
                <select
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none"
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">6 months</option>
                  <option value="365">1 year</option>
                </select>
              </div>

              <Button
                className="w-full"
                disabled={selectedDataTypes.length === 0}
                onClick={handleGrantConsent}
              >
                <Shield className="w-4 h-4 mr-2" />
                Grant Consent
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
