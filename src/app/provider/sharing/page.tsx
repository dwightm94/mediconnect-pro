'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, CheckCircle, XCircle, Clock, Building2, FileText, AlertTriangle } from 'lucide-react'

interface SharingRequest {
  id: string
  requestingOrg: string
  requestingOrgType: string
  patientId: string
  patientName: string
  dataTypes: string[]
  purpose: string
  urgency: 'routine' | 'urgent' | 'emergency'
  requestDate: string
  expirationDate?: string
  status: 'pending' | 'approved' | 'denied'
  notes?: string
}

export default function SharingRequestsPage() {
  const { isAuthenticated } = useAuth()
  const [requests, setRequests] = useState<SharingRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SharingRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<SharingRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showDenyModal, setShowDenyModal] = useState(false)
  const [denyReason, setDenyReason] = useState('')

  const dataTypeLabels: Record<string, { label: string; icon: string }> = {
    demographics: { label: 'Demographics', icon: '👤' },
    lab_results: { label: 'Lab Results', icon: '🔬' },
    imaging: { label: 'Imaging', icon: '📷' },
    medications: { label: 'Medications', icon: '💊' },
    visit_notes: { label: 'Visit Notes', icon: '📝' },
    immunizations: { label: 'Immunizations', icon: '💉' },
    allergies: { label: 'Allergies', icon: '⚠️' },
    conditions: { label: 'Conditions', icon: '🩺' },
  }

  const mockRequests: SharingRequest[] = [
    { id: '1', requestingOrg: 'City General Hospital', requestingOrgType: 'hospital', patientId: 'p1', patientName: 'Jane Doe', dataTypes: ['lab_results', 'medications', 'allergies'], purpose: 'Emergency department visit - patient presenting with chest pain', urgency: 'emergency', requestDate: '2026-02-07T08:30:00', status: 'pending' },
    { id: '2', requestingOrg: 'Metro Urgent Care', requestingOrgType: 'urgent_care', patientId: 'p2', patientName: 'John Smith', dataTypes: ['visit_notes', 'allergies', 'medications'], purpose: 'Urgent care visit for respiratory symptoms', urgency: 'urgent', requestDate: '2026-02-06T14:20:00', status: 'pending' },
    { id: '3', requestingOrg: 'BioTech Labs', requestingOrgType: 'lab', patientId: 'p3', patientName: 'Robert Chen', dataTypes: ['lab_results'], purpose: 'Reference lab requesting previous results for comparison', urgency: 'routine', requestDate: '2026-02-05T09:00:00', status: 'pending' },
    { id: '4', requestingOrg: 'Heart Health Institute', requestingOrgType: 'hospital', patientId: 'p5', patientName: 'David Wilson', dataTypes: ['lab_results', 'imaging', 'medications', 'conditions'], purpose: 'Cardiology consultation referral', urgency: 'routine', requestDate: '2026-02-04T11:30:00', status: 'pending' },
    { id: '5', requestingOrg: 'Downtown Medical Group', requestingOrgType: 'doctor_office', patientId: 'p1', patientName: 'Jane Doe', dataTypes: ['demographics', 'immunizations'], purpose: 'New patient registration - transferring care', urgency: 'routine', requestDate: '2026-02-03T16:00:00', status: 'approved', expirationDate: '2026-03-03' },
    { id: '6', requestingOrg: 'Unknown Clinic', requestingOrgType: 'doctor_office', patientId: 'p4', patientName: 'Maria Garcia', dataTypes: ['lab_results', 'visit_notes', 'medications'], purpose: 'General health information request', urgency: 'routine', requestDate: '2026-02-01T10:00:00', status: 'denied', notes: 'Patient has not consented to share with this organization' },
    { id: '7', requestingOrg: 'City General Hospital', requestingOrgType: 'hospital', patientId: 'p7', patientName: 'Michael Brown', dataTypes: ['allergies', 'medications', 'conditions'], purpose: 'Pre-operative assessment for scheduled surgery', urgency: 'urgent', requestDate: '2026-02-06T09:15:00', status: 'approved', expirationDate: '2026-02-20' },
  ]

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [filter, searchQuery, requests])

  const loadRequests = async () => {
    try {
      const data = await apiCall('/provider/sharing-requests').catch(() => null)
      setRequests(data?.requests || mockRequests)
    } catch (error) {
      setRequests(mockRequests)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = [...requests]

    if (filter !== 'all') {
      filtered = filtered.filter(r => r.status === filter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.patientName.toLowerCase().includes(query) ||
        r.requestingOrg.toLowerCase().includes(query)
      )
    }

    // Sort by urgency and date
    const urgencyOrder = { emergency: 0, urgent: 1, routine: 2 }
    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1
      if (b.status === 'pending' && a.status !== 'pending') return 1
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    })

    setFilteredRequests(filtered)
  }

  const openDetail = (request: SharingRequest) => {
    setSelectedRequest(request)
    setShowDetailModal(true)
  }

  const openApprove = (request: SharingRequest) => {
    setSelectedRequest(request)
    setShowApproveModal(true)
  }

  const openDeny = (request: SharingRequest) => {
    setSelectedRequest(request)
    setDenyReason('')
    setShowDenyModal(true)
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      await apiCall(`/provider/sharing-requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' })
      }).catch(() => null)

      setRequests(prev =>
        prev.map(r =>
          r.id === selectedRequest.id
            ? { ...r, status: 'approved' as const, expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            : r
        )
      )
      setShowApproveModal(false)
      setShowDetailModal(false)
    } catch (error) {
      console.error('Approve failed:', error)
    }
  }

  const handleDeny = async () => {
    if (!selectedRequest) return

    try {
      await apiCall(`/provider/sharing-requests/${selectedRequest.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'deny', reason: denyReason })
      }).catch(() => null)

      setRequests(prev =>
        prev.map(r =>
          r.id === selectedRequest.id
            ? { ...r, status: 'denied' as const, notes: denyReason }
            : r
        )
      )
      setShowDenyModal(false)
      setShowDetailModal(false)
    } catch (error) {
      console.error('Deny failed:', error)
    }
  }

  const getUrgencyColor = (urgency: string): 'error' | 'warn' | 'info' => {
    switch (urgency) {
      case 'emergency': return 'error'
      case 'urgent': return 'warn'
      default: return 'info'
    }
  }

  const getStatusColor = (status: string): 'ok' | 'warn' | 'error' | 'info' => {
    switch (status) {
      case 'approved': return 'ok'
      case 'pending': return 'warn'
      case 'denied': return 'error'
      default: return 'info'
    }
  }

  const getOrgIcon = (type: string) => {
    const icons: Record<string, string> = {
      hospital: '🏥',
      lab: '🔬',
      doctor_office: '👨‍⚕️',
      urgent_care: '🚑',
      pharmacy: '💊',
    }
    return icons[type] || '🏢'
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return <Loading text="Loading sharing requests..." />
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const emergencyCount = requests.filter(r => r.status === 'pending' && r.urgency === 'emergency').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Data Sharing Requests</h1>
          <p className="text-gray-500">Review and manage incoming data requests</p>
        </div>
        {emergencyCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">{emergencyCount} emergency request{emergencyCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-red-500">{emergencyCount}</div>
            <div className="text-sm text-gray-500">Emergency</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-500">Approved</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-gray-500">
              {requests.filter(r => r.status === 'denied').length}
            </div>
            <div className="text-sm text-gray-500">Denied</div>
          </CardBody>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
          {(['pending', 'approved', 'denied', 'all'] as const).map((f) => (
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

        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon="📨"
          title="No requests found"
          description={filter === 'pending' ? 'No pending requests at this time' : 'No requests match your filters'}
        />
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className={`overflow-hidden ${request.urgency === 'emergency' && request.status === 'pending' ? 'ring-2 ring-red-500' : ''}`}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-2xl flex-shrink-0">
                    {getOrgIcon(request.requestingOrgType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{request.requestingOrg}</h3>
                        <p className="text-[#0A6E6E]">Patient: {request.patientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <Chip variant={getUrgencyColor(request.urgency)}>
                            {request.urgency === 'emergency' ? '🚨 ' : ''}{request.urgency}
                          </Chip>
                        )}
                        <Chip variant={getStatusColor(request.status)}>{request.status}</Chip>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{request.purpose}</p>

                    {/* Data Types */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {request.dataTypes.map((type) => (
                        <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {dataTypeLabels[type]?.icon} {dataTypeLabels[type]?.label || type}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDateTime(request.requestDate)}
                      </span>

                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openDeny(request)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Deny
                          </Button>
                          <Button size="sm" onClick={() => openApprove(request)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => openDetail(request)}>
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
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-3xl">
                {getOrgIcon(selectedRequest.requestingOrgType)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedRequest.requestingOrg}</h3>
                <p className="text-gray-500">Requesting patient: {selectedRequest.patientName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Chip variant={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</Chip>
                  {selectedRequest.status === 'pending' && (
                    <Chip variant={getUrgencyColor(selectedRequest.urgency)}>{selectedRequest.urgency}</Chip>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Purpose</div>
              <div className="p-3 bg-gray-50 rounded-lg">{selectedRequest.purpose}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Requested Data</div>
              <div className="grid grid-cols-2 gap-2">
                {selectedRequest.dataTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <span className="text-lg">{dataTypeLabels[type]?.icon}</span>
                    <span className="text-sm font-medium text-blue-800">{dataTypeLabels[type]?.label || type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Request Date</div>
                <div className="font-medium">{formatDateTime(selectedRequest.requestDate)}</div>
              </div>
              {selectedRequest.expirationDate && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Expires</div>
                  <div className="font-medium">{selectedRequest.expirationDate}</div>
                </div>
              )}
            </div>

            {selectedRequest.notes && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Notes</div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                  {selectedRequest.notes}
                </div>
              </div>
            )}

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => {
                  setShowDetailModal(false)
                  openDeny(selectedRequest)
                }}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny Request
                </Button>
                <Button className="flex-1" onClick={() => {
                  setShowDetailModal(false)
                  openApprove(selectedRequest)
                }}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Request
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-800">
                Approve <strong>{selectedRequest.requestingOrg}</strong>'s request to access <strong>{selectedRequest.patientName}</strong>'s data?
              </p>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-2">Data to be shared:</div>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.dataTypes.map((type) => (
                  <span key={type} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {dataTypeLabels[type]?.icon} {dataTypeLabels[type]?.label || type}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ This will allow the requesting organization to access the specified patient data for 30 days.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowApproveModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleApprove}>
                Approve Access
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Deny Modal */}
      <Modal
        isOpen={showDenyModal}
        onClose={() => setShowDenyModal(false)}
        title="Deny Request"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">❌</div>
              <p className="text-red-800">
                Deny <strong>{selectedRequest.requestingOrg}</strong>'s request for <strong>{selectedRequest.patientName}</strong>'s data?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for denial (optional)
              </label>
              <textarea
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter reason for denying this request..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDenyModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDeny}>
                Deny Request
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
