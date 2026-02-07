'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, Filter, Download, ExternalLink, Building2, FileText, FlaskConical, Image } from 'lucide-react'

interface ExternalRecord {
  id: string
  sourceOrg: string
  sourceOrgType: string
  patientName: string
  patientId: string
  resourceType: 'Observation' | 'DiagnosticReport' | 'MedicationRequest' | 'Condition' | 'Procedure' | 'Immunization'
  code: string
  value?: string
  effectiveDate: string
  receivedDate: string
  status: 'final' | 'preliminary' | 'amended'
  details?: string
}

export default function ExternalRecordsPage() {
  const { isAuthenticated } = useAuth()
  const [records, setRecords] = useState<ExternalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<ExternalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<ExternalRecord | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const mockRecords: ExternalRecord[] = [
    { id: '1', sourceOrg: 'City General Hospital', sourceOrgType: 'hospital', patientName: 'Jane Doe', patientId: 'p1', resourceType: 'DiagnosticReport', code: 'Chest X-Ray', effectiveDate: '2026-02-05', receivedDate: '2026-02-06', status: 'final', details: 'PA and lateral views of the chest. No acute cardiopulmonary abnormality.' },
    { id: '2', sourceOrg: 'BioTech Labs', sourceOrgType: 'lab', patientName: 'Jane Doe', patientId: 'p1', resourceType: 'Observation', code: 'Complete Blood Count', value: 'Within normal limits', effectiveDate: '2026-02-01', receivedDate: '2026-02-02', status: 'final', details: 'WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Platelets: 250,000' },
    { id: '3', sourceOrg: 'Metro Urgent Care', sourceOrgType: 'urgent_care', patientName: 'John Smith', patientId: 'p2', resourceType: 'Observation', code: 'Rapid Strep Test', value: 'Negative', effectiveDate: '2026-01-28', receivedDate: '2026-01-28', status: 'final' },
    { id: '4', sourceOrg: 'City General Hospital', sourceOrgType: 'hospital', patientName: 'John Smith', patientId: 'p2', resourceType: 'Procedure', code: 'ECG', effectiveDate: '2026-01-25', receivedDate: '2026-01-26', status: 'final', details: 'Normal sinus rhythm. No ST changes.' },
    { id: '5', sourceOrg: 'BioTech Labs', sourceOrgType: 'lab', patientName: 'Robert Chen', patientId: 'p3', resourceType: 'Observation', code: 'Lipid Panel', value: 'Total Cholesterol: 210 mg/dL', effectiveDate: '2026-01-20', receivedDate: '2026-01-21', status: 'final', details: 'Total Cholesterol: 210, LDL: 130, HDL: 45, Triglycerides: 175. LDL slightly elevated.' },
    { id: '6', sourceOrg: 'Heart Health Institute', sourceOrgType: 'hospital', patientName: 'David Wilson', patientId: 'p5', resourceType: 'DiagnosticReport', code: 'Echocardiogram', effectiveDate: '2026-01-15', receivedDate: '2026-01-16', status: 'final', details: 'Normal LV size and function. EF 60%. No valvular abnormalities.' },
    { id: '7', sourceOrg: 'Downtown Pharmacy', sourceOrgType: 'pharmacy', patientName: 'David Wilson', patientId: 'p5', resourceType: 'MedicationRequest', code: 'Lisinopril 10mg', effectiveDate: '2026-01-15', receivedDate: '2026-01-15', status: 'final', details: 'Dispensed 90-day supply' },
    { id: '8', sourceOrg: 'City General Hospital', sourceOrgType: 'hospital', patientName: 'Maria Garcia', patientId: 'p4', resourceType: 'Immunization', code: 'Influenza Vaccine', effectiveDate: '2025-10-15', receivedDate: '2025-10-16', status: 'final', details: 'Fluzone Quadrivalent, Lot #FZ2025-1234' },
    { id: '9', sourceOrg: 'BioTech Labs', sourceOrgType: 'lab', patientName: 'Michael Brown', patientId: 'p7', resourceType: 'Observation', code: 'HbA1c', value: '6.2%', effectiveDate: '2026-02-01', receivedDate: '2026-02-02', status: 'final', details: 'HbA1c: 6.2% - Prediabetes range. Recommend lifestyle modifications.' },
    { id: '10', sourceOrg: 'Skin Care Clinic', sourceOrgType: 'doctor_office', patientName: 'Emily Davis', patientId: 'p9', resourceType: 'Procedure', code: 'Skin Biopsy', effectiveDate: '2026-01-10', receivedDate: '2026-01-15', status: 'final', details: 'Punch biopsy left forearm. Pathology: Benign seborrheic keratosis.' },
  ]

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchQuery, typeFilter, sourceFilter, records])

  const loadRecords = async () => {
    try {
      const data = await apiCall('/provider/external-records').catch(() => null)
      setRecords(data?.records || mockRecords)
    } catch (error) {
      setRecords(mockRecords)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRecords = () => {
    let filtered = [...records]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.patientName.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.sourceOrg.toLowerCase().includes(query)
      )
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.resourceType === typeFilter)
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(r => r.sourceOrg === sourceFilter)
    }

    // Sort by received date (newest first)
    filtered.sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())

    setFilteredRecords(filtered)
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      Observation: <FlaskConical className="w-5 h-5" />,
      DiagnosticReport: <Image className="w-5 h-5" />,
      MedicationRequest: <FileText className="w-5 h-5" />,
      Condition: <FileText className="w-5 h-5" />,
      Procedure: <FileText className="w-5 h-5" />,
      Immunization: <FileText className="w-5 h-5" />,
    }
    return icons[type] || <FileText className="w-5 h-5" />
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Observation: 'bg-blue-100 text-blue-600',
      DiagnosticReport: 'bg-purple-100 text-purple-600',
      MedicationRequest: 'bg-green-100 text-green-600',
      Condition: 'bg-red-100 text-red-600',
      Procedure: 'bg-amber-100 text-amber-600',
      Immunization: 'bg-pink-100 text-pink-600',
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  const getOrgIcon = (type: string) => {
    const icons: Record<string, string> = {
      hospital: '🏥',
      lab: '🔬',
      urgent_care: '🚑',
      pharmacy: '💊',
      doctor_office: '👨‍⚕️',
    }
    return icons[type] || '🏢'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const openDetail = (record: ExternalRecord) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const uniqueSources = [...new Set(records.map(r => r.sourceOrg))]
  const resourceTypes = ['Observation', 'DiagnosticReport', 'MedicationRequest', 'Procedure', 'Immunization', 'Condition']

  if (isLoading) {
    return <Loading text="Loading external records..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">External Records</h1>
          <p className="text-gray-500">View records shared from other organizations</p>
        </div>
        <div className="flex items-center gap-2">
          <Chip variant="info">{records.length} records from {uniqueSources.length} organizations</Chip>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-[#0A6E6E]">{records.length}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600">
              {records.filter(r => r.resourceType === 'Observation').length}
            </div>
            <div className="text-sm text-gray-500">Lab Results</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-purple-600">
              {records.filter(r => r.resourceType === 'DiagnosticReport').length}
            </div>
            <div className="text-sm text-gray-500">Imaging</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">{uniqueSources.length}</div>
            <div className="text-sm text-gray-500">Sources</div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient, code, or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
            >
              <option value="all">All Types</option>
              {resourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon="🌐"
          title="No external records found"
          description="Records shared from other organizations will appear here"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(record)}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(record.resourceType)}`}>
                    {getTypeIcon(record.resourceType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{record.code}</h3>
                        <p className="text-sm text-[#0A6E6E]">{record.patientName}</p>
                      </div>
                      <Chip variant="info">{record.resourceType}</Chip>
                    </div>

                    {record.value && (
                      <p className="text-sm font-medium text-gray-700 mt-2">{record.value}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {getOrgIcon(record.sourceOrgType)} {record.sourceOrg}
                      </span>
                      <span>•</span>
                      <span>{formatDate(record.effectiveDate)}</span>
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
        title="Record Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getTypeColor(selectedRecord.resourceType)}`}>
                {getTypeIcon(selectedRecord.resourceType)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedRecord.code}</h3>
                <p className="text-gray-500">{selectedRecord.resourceType}</p>
                <Chip variant="ok" className="mt-1">{selectedRecord.status}</Chip>
              </div>
            </div>

            {/* Patient Info */}
            <div className="p-4 bg-[rgba(14,234,202,0.10)] rounded-xl">
              <div className="text-sm text-gray-500 mb-1">Patient</div>
              <div className="font-semibold">{selectedRecord.patientName}</div>
              <div className="text-sm text-gray-500">ID: {selectedRecord.patientId}</div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Source Organization</div>
                <div className="font-medium flex items-center gap-2">
                  <span>{getOrgIcon(selectedRecord.sourceOrgType)}</span>
                  {selectedRecord.sourceOrg}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Effective Date</div>
                <div className="font-medium">{formatDate(selectedRecord.effectiveDate)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Received Date</div>
                <div className="font-medium">{formatDate(selectedRecord.receivedDate)}</div>
              </div>
              {selectedRecord.value && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Value</div>
                  <div className="font-medium text-[#0A6E6E]">{selectedRecord.value}</div>
                </div>
              )}
            </div>

            {/* Full Details */}
            {selectedRecord.details && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Details</div>
                <div className="p-4 bg-gray-50 rounded-xl text-sm whitespace-pre-wrap">
                  {selectedRecord.details}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="secondary" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                View at Source
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
