'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, Plus, FileText, Calendar, MessageSquare, Phone } from 'lucide-react'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  lastVisit: string
  nextAppointment?: string
  status: 'active' | 'new' | 'inactive'
  conditions: string[]
  allergies: string[]
  medications: string[]
}

export default function PatientsPage() {
  const { isAuthenticated } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const mockPatients: Patient[] = [
    { id: '1', name: 'Jane Doe', email: 'jane.doe@email.com', phone: '(555) 123-4567', dateOfBirth: '1985-03-15', gender: 'Female', lastVisit: '2026-02-01', nextAppointment: '2026-02-10', status: 'active', conditions: ['Hypertension', 'Type 2 Diabetes'], allergies: ['Penicillin'], medications: ['Lisinopril 10mg', 'Metformin 500mg'] },
    { id: '2', name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 234-5678', dateOfBirth: '1978-07-22', gender: 'Male', lastVisit: '2026-01-28', nextAppointment: '2026-02-12', status: 'active', conditions: ['Asthma'], allergies: ['Sulfa drugs'], medications: ['Albuterol inhaler'] },
    { id: '3', name: 'Robert Chen', email: 'robert.chen@email.com', phone: '(555) 345-6789', dateOfBirth: '1990-11-08', gender: 'Male', lastVisit: '2026-01-25', status: 'active', conditions: [], allergies: [], medications: ['Vitamin D3'] },
    { id: '4', name: 'Maria Garcia', email: 'maria.garcia@email.com', phone: '(555) 456-7890', dateOfBirth: '1995-05-30', gender: 'Female', lastVisit: '2026-02-05', nextAppointment: '2026-02-07', status: 'new', conditions: [], allergies: ['Latex'], medications: [] },
    { id: '5', name: 'David Wilson', email: 'david.wilson@email.com', phone: '(555) 567-8901', dateOfBirth: '1968-09-12', gender: 'Male', lastVisit: '2026-01-20', status: 'active', conditions: ['Coronary Artery Disease', 'Hyperlipidemia'], allergies: [], medications: ['Aspirin 81mg', 'Atorvastatin 40mg', 'Metoprolol 50mg'] },
    { id: '6', name: 'Sarah Johnson', email: 'sarah.johnson@email.com', phone: '(555) 678-9012', dateOfBirth: '1982-12-03', gender: 'Female', lastVisit: '2025-11-15', status: 'inactive', conditions: ['Anxiety'], allergies: ['Codeine'], medications: [] },
    { id: '7', name: 'Michael Brown', email: 'michael.brown@email.com', phone: '(555) 789-0123', dateOfBirth: '1975-04-18', gender: 'Male', lastVisit: '2026-02-06', nextAppointment: '2026-02-07', status: 'active', conditions: ['GERD', 'Obesity'], allergies: [], medications: ['Omeprazole 20mg'] },
    { id: '8', name: 'Emily Davis', email: 'emily.davis@email.com', phone: '(555) 890-1234', dateOfBirth: '1998-08-25', gender: 'Female', lastVisit: '2026-01-30', status: 'new', conditions: [], allergies: ['Peanuts'], medications: ['Birth control'] },
  ]

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    filterPatients()
  }, [searchQuery, statusFilter, patients])

  const loadPatients = async () => {
    try {
      const data = await apiCall('/provider/patients').catch(() => null)
      setPatients(data?.patients || mockPatients)
    } catch (error) {
      setPatients(mockPatients)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPatients = () => {
    let filtered = [...patients]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.email.toLowerCase().includes(query) ||
        p.phone.includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    setFilteredPatients(filtered)
  }

  const openDetail = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowDetailModal(true)
  }

  const getStatusColor = (status: string): 'ok' | 'info' | 'warn' => {
    switch (status) {
      case 'active': return 'ok'
      case 'new': return 'info'
      case 'inactive': return 'warn'
      default: return 'info'
    }
  }

  const calculateAge = (dob: string) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return <Loading text="Loading patients..." />
  }

  const activeCount = patients.filter(p => p.status === 'active').length
  const newCount = patients.filter(p => p.status === 'new').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Patients</h1>
          <p className="text-gray-500">Manage your patient panel</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-[#0A6E6E]">{patients.length}</div>
            <div className="text-sm text-gray-500">Total Patients</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-gray-500">Active</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600">{newCount}</div>
            <div className="text-sm text-gray-500">New Patients</div>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="new">New</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold">{filteredPatients.length}</span> patients found
        </p>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No patients found"
          description={searchQuery ? 'Try adjusting your search' : 'Add patients to get started'}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age/Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Visit</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Next Apt</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openDetail(patient)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            {patient.conditions.length > 0 && (
                              <div className="text-xs text-gray-500">{patient.conditions[0]}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {calculateAge(patient.dateOfBirth)} / {patient.gender.charAt(0)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{patient.phone}</div>
                        <div className="text-xs text-gray-500">{patient.email}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDate(patient.lastVisit)}</td>
                      <td className="px-4 py-3 text-sm">
                        {patient.nextAppointment ? (
                          <span className="text-[#0A6E6E] font-medium">{formatDate(patient.nextAppointment)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Chip variant={getStatusColor(patient.status)}>{patient.status}</Chip>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); }}>
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Patient Details"
        size="lg"
      >
        {selectedPatient && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-xl">
                {selectedPatient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl">{selectedPatient.name}</h3>
                <p className="text-gray-500">
                  {calculateAge(selectedPatient.dateOfBirth)} years old • {selectedPatient.gender}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Chip variant={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Chip>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Email</div>
                <div className="font-medium">{selectedPatient.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone</div>
                <div className="font-medium">{selectedPatient.phone}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Date of Birth</div>
                <div className="font-medium">{formatDate(selectedPatient.dateOfBirth)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Visit</div>
                <div className="font-medium">{formatDate(selectedPatient.lastVisit)}</div>
              </div>
            </div>

            {/* Medical Info */}
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Conditions</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.conditions.length > 0 ? (
                    selectedPatient.conditions.map((condition, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                        {condition}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No known conditions</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Allergies</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.allergies.length > 0 ? (
                    selectedPatient.allergies.map((allergy, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                        ⚠️ {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No known allergies</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Current Medications</div>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.medications.length > 0 ? (
                    selectedPatient.medications.map((med, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        💊 {med}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No current medications</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="secondary" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                View Full Records
              </Button>
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
