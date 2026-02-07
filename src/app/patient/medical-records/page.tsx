'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, Filter, Download, FileText, FlaskConical, Image, Pill, Stethoscope, Activity } from 'lucide-react'

interface MedicalRecord {
  id: string
  type: 'lab' | 'imaging' | 'visit' | 'prescription' | 'immunization' | 'procedure'
  title: string
  provider: string
  organization: string
  date: string
  status: 'final' | 'preliminary' | 'amended'
  category?: string
  value?: string
  unit?: string
  referenceRange?: string
  interpretation?: 'normal' | 'abnormal' | 'critical'
  details?: string
  attachments?: { name: string; type: string }[]
}

export default function RecordsPage() {
  const { isAuthenticated } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const recordTypes = [
    { value: 'all', label: 'All Records', icon: '📋' },
    { value: 'lab', label: 'Lab Results', icon: '🔬' },
    { value: 'imaging', label: 'Imaging', icon: '📷' },
    { value: 'visit', label: 'Visit Notes', icon: '📝' },
    { value: 'prescription', label: 'Prescriptions', icon: '💊' },
    { value: 'immunization', label: 'Immunizations', icon: '💉' },
    { value: 'procedure', label: 'Procedures', icon: '🏥' },
  ]

  const mockRecords: MedicalRecord[] = [
    { id: '1', type: 'lab', title: 'Complete Blood Count (CBC)', provider: 'Dr. Sarah Chen', organization: 'BioTech Labs', date: '2026-02-01', status: 'final', category: 'Hematology', value: 'See details', interpretation: 'normal', details: 'All values within normal range. WBC: 7.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42%, Platelets: 250,000' },
    { id: '2', type: 'lab', title: 'Lipid Panel', provider: 'Dr. Sarah Chen', organization: 'BioTech Labs', date: '2026-02-01', status: 'final', category: 'Chemistry', value: 'Total Cholesterol: 195', unit: 'mg/dL', referenceRange: '<200', interpretation: 'normal', details: 'Total Cholesterol: 195 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL, Triglycerides: 150 mg/dL' },
    { id: '3', type: 'lab', title: 'HbA1c', provider: 'Dr. Sarah Chen', organization: 'BioTech Labs', date: '2026-02-01', status: 'final', category: 'Chemistry', value: '5.4', unit: '%', referenceRange: '<5.7', interpretation: 'normal', details: 'HbA1c: 5.4% - Within normal range, no indication of diabetes' },
    { id: '4', type: 'imaging', title: 'Chest X-Ray', provider: 'Dr. Michael Roberts', organization: 'City Medical Center', date: '2026-01-28', status: 'final', category: 'Radiology', interpretation: 'normal', details: 'PA and lateral views of the chest demonstrate clear lungs without infiltrates, effusions, or pneumothorax. Heart size is normal. No acute cardiopulmonary abnormality.', attachments: [{ name: 'chest_xray_pa.jpg', type: 'image' }, { name: 'chest_xray_lat.jpg', type: 'image' }] },
    { id: '5', type: 'visit', title: 'Annual Physical Exam', provider: 'Dr. Sarah Chen', organization: 'City Medical Center', date: '2026-01-15', status: 'final', category: 'Preventive Care', details: 'Patient presents for annual physical examination. Vitals: BP 118/76, HR 72, Temp 98.6°F, Weight 165 lbs. General appearance: Well-developed, well-nourished, in no acute distress. All systems reviewed and within normal limits. Recommended: Continue current exercise routine, schedule colonoscopy screening.' },
    { id: '6', type: 'prescription', title: 'Lisinopril 10mg', provider: 'Dr. Sarah Chen', organization: 'City Medical Center', date: '2026-01-15', status: 'final', category: 'Cardiovascular', details: 'Lisinopril 10mg tablet. Take 1 tablet by mouth once daily. Quantity: 90. Refills: 3. For blood pressure management.' },
    { id: '7', type: 'prescription', title: 'Vitamin D3 2000 IU', provider: 'Dr. Sarah Chen', organization: 'City Medical Center', date: '2026-01-15', status: 'final', category: 'Supplement', details: 'Vitamin D3 2000 IU capsule. Take 1 capsule by mouth once daily. Quantity: 90. Refills: 5. For vitamin D deficiency.' },
    { id: '8', type: 'immunization', title: 'Influenza Vaccine', provider: 'Nurse Johnson', organization: 'City Medical Center', date: '2025-10-15', status: 'final', category: 'Immunization', details: 'Influenza vaccine (Fluzone Quadrivalent). Administered intramuscularly in left deltoid. Lot #: FZ2025-1234. No adverse reactions noted.' },
    { id: '9', type: 'immunization', title: 'COVID-19 Booster', provider: 'Nurse Johnson', organization: 'City Medical Center', date: '2025-09-20', status: 'final', category: 'Immunization', details: 'COVID-19 mRNA vaccine booster (Pfizer-BioNTech). Administered intramuscularly in left deltoid. Lot #: PF2025-5678. No adverse reactions noted.' },
    { id: '10', type: 'procedure', title: 'Skin Biopsy', provider: 'Dr. Emily Watson', organization: 'Skin Care Clinic', date: '2025-08-10', status: 'final', category: 'Dermatology', details: 'Punch biopsy of suspicious lesion on left forearm. 4mm punch used. Specimen sent to pathology. Results: Benign seborrheic keratosis. No further treatment needed.' },
    { id: '11', type: 'lab', title: 'Thyroid Panel', provider: 'Dr. Sarah Chen', organization: 'BioTech Labs', date: '2025-07-20', status: 'final', category: 'Endocrinology', value: 'TSH: 2.5', unit: 'mIU/L', referenceRange: '0.4-4.0', interpretation: 'normal', details: 'TSH: 2.5 mIU/L (normal), Free T4: 1.2 ng/dL (normal), Free T3: 3.1 pg/mL (normal)' },
    { id: '12', type: 'imaging', title: 'Echocardiogram', provider: 'Dr. Michael Roberts', organization: 'Heart Health Institute', date: '2025-06-15', status: 'final', category: 'Cardiology', interpretation: 'normal', details: 'Transthoracic echocardiogram demonstrates normal left ventricular size and function with estimated ejection fraction of 60-65%. No significant valvular abnormalities. Normal right ventricular size and function.' },
  ]

  useEffect(() => {
    loadRecords()
  }, [])

  useEffect(() => {
    filterRecords()
  }, [searchQuery, selectedType, records])

  const loadRecords = async () => {
    try {
      const data = await apiCall(`/medical-records?patientId=${user?.sub}`).catch(() => null)
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
        r.title.toLowerCase().includes(query) ||
        r.provider.toLowerCase().includes(query) ||
        r.organization.toLowerCase().includes(query) ||
        r.category?.toLowerCase().includes(query)
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(r => r.type === selectedType)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredRecords(filtered)
  }

  const openDetail = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setShowDetailModal(true)
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      lab: <FlaskConical className="w-5 h-5" />,
      imaging: <Image className="w-5 h-5" />,
      visit: <FileText className="w-5 h-5" />,
      prescription: <Pill className="w-5 h-5" />,
      immunization: <Activity className="w-5 h-5" />,
      procedure: <Stethoscope className="w-5 h-5" />,
    }
    return icons[type] || <FileText className="w-5 h-5" />
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      lab: 'bg-blue-100 text-blue-600',
      imaging: 'bg-purple-100 text-purple-600',
      visit: 'bg-green-100 text-green-600',
      prescription: 'bg-orange-100 text-orange-600',
      immunization: 'bg-pink-100 text-pink-600',
      procedure: 'bg-red-100 text-red-600',
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  const getInterpretationColor = (interpretation?: string) => {
    switch (interpretation) {
      case 'normal': return 'ok'
      case 'abnormal': return 'warn'
      case 'critical': return 'error'
      default: return 'info'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <Loading text="Loading your medical records..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Medical Records</h1>
          <p className="text-gray-500">View and manage your health records</p>
        </div>
        <Button variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {recordTypes.slice(1).map((type) => {
          const count = records.filter(r => r.type === type.value).length
          return (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all ${
                selectedType === type.value ? 'ring-2 ring-[#0A6E6E]' : ''
              }`}
              onClick={() => setSelectedType(selectedType === type.value ? 'all' : type.value)}
            >
              <CardBody className="text-center py-3">
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs text-gray-500">{type.label}</div>
              </CardBody>
            </Card>
          )
        })}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search records by name, provider, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
            >
              {recordTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold">{filteredRecords.length}</span> records found
        </p>
        {selectedType !== 'all' && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedType('all')}>
            Clear Filter
          </Button>
        )}
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No records found"
          description={searchQuery ? 'Try adjusting your search' : 'Your medical records will appear here'}
        />
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <Card
              key={record.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openDetail(record)}
            >
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(record.type)}`}>
                    {getTypeIcon(record.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        <p className="text-sm text-gray-500">{record.provider} • {record.organization}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.interpretation && (
                          <Chip variant={getInterpretationColor(record.interpretation)}>
                            {record.interpretation}
                          </Chip>
                        )}
                        <Chip variant="info">{record.status}</Chip>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{formatDate(record.date)}</span>
                      {record.category && (
                        <span className="text-gray-400">• {record.category}</span>
                      )}
                      {record.value && (
                        <span className="font-medium text-[#0A6E6E]">
                          {record.value} {record.unit}
                        </span>
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
        title={selectedRecord?.title || 'Record Details'}
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${getTypeColor(selectedRecord.type)}`}>
                {getTypeIcon(selectedRecord.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedRecord.title}</h3>
                <p className="text-sm text-gray-500">{selectedRecord.provider}</p>
                <p className="text-sm text-gray-500">{selectedRecord.organization}</p>
              </div>
              {selectedRecord.interpretation && (
                <Chip variant={getInterpretationColor(selectedRecord.interpretation)} className="text-sm">
                  {selectedRecord.interpretation}
                </Chip>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Date</div>
                <div className="font-medium">{formatDate(selectedRecord.date)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <Chip variant="info">{selectedRecord.status}</Chip>
              </div>
              {selectedRecord.category && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="font-medium">{selectedRecord.category}</div>
                </div>
              )}
              {selectedRecord.value && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Value</div>
                  <div className="font-medium text-[#0A6E6E]">
                    {selectedRecord.value} {selectedRecord.unit}
                    {selectedRecord.referenceRange && (
                      <span className="text-gray-400 text-sm ml-2">
                        (ref: {selectedRecord.referenceRange})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            {selectedRecord.details && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Details</div>
                <div className="p-4 bg-gray-50 rounded-xl text-sm whitespace-pre-wrap">
                  {selectedRecord.details}
                </div>
              </div>
            )}

            {/* Attachments */}
            {selectedRecord.attachments && selectedRecord.attachments.length > 0 && (
              <div>
                <div className="text-sm text-gray-500 mb-2">Attachments</div>
                <div className="space-y-2">
                  {selectedRecord.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="flex-1 text-sm">{attachment.name}</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
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
                Share with Provider
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
