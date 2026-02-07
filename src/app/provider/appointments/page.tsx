'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Calendar, Clock, Video, MapPin, User, FileText, CheckCircle, XCircle } from 'lucide-react'

interface Appointment {
  id: string
  patientName: string
  patientId: string
  dateTime: string
  type: 'in-person' | 'video'
  status: 'scheduled' | 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
  reason: string
  notes?: string
  duration: number
}

export default function ProviderAppointmentsPage() {
  const { isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const mockAppointments: Appointment[] = [
    { id: '1', patientName: 'Maria Garcia', patientId: 'p4', dateTime: '2026-02-07T09:00:00', type: 'in-person', status: 'checked-in', reason: 'New Patient Visit', duration: 60, notes: 'First time patient, needs comprehensive evaluation' },
    { id: '2', patientName: 'Jane Doe', patientId: 'p1', dateTime: '2026-02-07T10:30:00', type: 'video', status: 'confirmed', reason: 'Follow-up Consultation', duration: 30 },
    { id: '3', patientName: 'Michael Brown', patientId: 'p7', dateTime: '2026-02-07T11:30:00', type: 'in-person', status: 'scheduled', reason: 'Annual Physical', duration: 45 },
    { id: '4', patientName: 'Sarah Johnson', patientId: 'p8', dateTime: '2026-02-07T14:00:00', type: 'video', status: 'confirmed', reason: 'Lab Results Review', duration: 20 },
    { id: '5', patientName: 'John Smith', patientId: 'p2', dateTime: '2026-02-07T15:30:00', type: 'in-person', status: 'confirmed', reason: 'Prescription Renewal', duration: 15 },
    { id: '6', patientName: 'Robert Chen', patientId: 'p3', dateTime: '2026-02-07T16:30:00', type: 'in-person', status: 'scheduled', reason: 'Sick Visit', duration: 30 },
    { id: '7', patientName: 'Emily Davis', patientId: 'p9', dateTime: '2026-02-08T09:00:00', type: 'in-person', status: 'confirmed', reason: 'Vaccination', duration: 15 },
    { id: '8', patientName: 'David Wilson', patientId: 'p5', dateTime: '2026-02-08T10:00:00', type: 'video', status: 'confirmed', reason: 'Cardiology Follow-up', duration: 30 },
    { id: '9', patientName: 'Lisa Park', patientId: 'p10', dateTime: '2026-02-06T14:00:00', type: 'in-person', status: 'completed', reason: 'Post-op Check', duration: 30 },
    { id: '10', patientName: 'James Wilson', patientId: 'p11', dateTime: '2026-02-06T15:00:00', type: 'video', status: 'no-show', reason: 'Consultation', duration: 30 },
  ]

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [selectedDate, statusFilter, appointments])

  const loadAppointments = async () => {
    try {
      const data = await apiCall('/provider/appointments').catch(() => null)
      setAppointments(data?.appointments || mockAppointments)
    } catch (error) {
      setAppointments(mockAppointments)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let filtered = [...appointments]

    // Filter by date
    filtered = filtered.filter(apt => apt.dateTime.startsWith(selectedDate))

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter)
    }

    // Sort by time
    filtered.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

    setFilteredAppointments(filtered)
  }

  const updateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      await apiCall(`/provider/appointments/${appointmentId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      }).catch(() => null)

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      )
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const getStatusColor = (status: string): 'ok' | 'warn' | 'info' | 'error' => {
    switch (status) {
      case 'completed': return 'ok'
      case 'confirmed':
      case 'checked-in': return 'info'
      case 'in-progress': return 'warn'
      case 'scheduled': return 'info'
      case 'cancelled':
      case 'no-show': return 'error'
      default: return 'info'
    }
  }

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getDateOptions = () => {
    const dates = []
    for (let i = -2; i <= 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : i === -1 ? 'Yesterday' : 
        date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      dates.push({ date: dateStr, label })
    }
    return dates
  }

  const openDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  if (isLoading) {
    return <Loading text="Loading appointments..." />
  }

  const todayStats = {
    total: appointments.filter(a => a.dateTime.startsWith(selectedDate)).length,
    confirmed: appointments.filter(a => a.dateTime.startsWith(selectedDate) && a.status === 'confirmed').length,
    checkedIn: appointments.filter(a => a.dateTime.startsWith(selectedDate) && a.status === 'checked-in').length,
    completed: appointments.filter(a => a.dateTime.startsWith(selectedDate) && a.status === 'completed').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Appointments</h1>
          <p className="text-gray-500">Manage your patient appointments</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {getDateOptions().map((option) => (
          <button
            key={option.date}
            onClick={() => setSelectedDate(option.date)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              selectedDate === option.date
                ? 'bg-[#0A6E6E] text-white'
                : 'bg-white border-2 border-gray-200 hover:border-[#0A6E6E]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-3">
            <div className="text-2xl font-bold text-[#0A6E6E]">{todayStats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-3">
            <div className="text-2xl font-bold text-blue-600">{todayStats.confirmed}</div>
            <div className="text-xs text-gray-500">Confirmed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-3">
            <div className="text-2xl font-bold text-amber-500">{todayStats.checkedIn}</div>
            <div className="text-xs text-gray-500">Checked In</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-3">
            <div className="text-2xl font-bold text-green-600">{todayStats.completed}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </CardBody>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {['all', 'scheduled', 'confirmed', 'checked-in', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              statusFilter === status
                ? 'bg-white shadow text-[#0A6E6E]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments"
          description={`No appointments scheduled for ${selectedDate === new Date().toISOString().split('T')[0] ? 'today' : 'this day'}`}
        />
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="overflow-hidden">
              <CardBody className="p-0">
                <div className="flex">
                  {/* Time Block */}
                  <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 ${
                    appointment.status === 'checked-in' ? 'bg-amber-500 text-white' :
                    appointment.status === 'in-progress' ? 'bg-blue-500 text-white' :
                    appointment.status === 'completed' ? 'bg-green-500 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <div className="text-lg font-bold">{formatTime(appointment.dateTime)}</div>
                    <div className="text-xs opacity-80">{appointment.duration} min</div>
                    {appointment.type === 'video' && <span className="text-xs mt-1">📹</span>}
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{appointment.patientName}</h3>
                        <p className="text-gray-600">{appointment.reason}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <Chip variant={getStatusColor(appointment.status)}>
                            {appointment.status.replace('-', ' ')}
                          </Chip>
                          {appointment.type === 'video' ? (
                            <span className="text-sm text-blue-600 flex items-center gap-1">
                              <Video className="w-4 h-4" /> Video Visit
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-4 h-4" /> In-Person
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {appointment.status === 'confirmed' && (
                          <Button size="sm" onClick={() => updateStatus(appointment.id, 'checked-in')}>
                            Check In
                          </Button>
                        )}
                        {appointment.status === 'checked-in' && (
                          <Button size="sm" onClick={() => updateStatus(appointment.id, 'in-progress')}>
                            Start Visit
                          </Button>
                        )}
                        {appointment.status === 'in-progress' && (
                          <Button size="sm" onClick={() => updateStatus(appointment.id, 'completed')}>
                            Complete
                          </Button>
                        )}
                        {appointment.type === 'video' && ['confirmed', 'checked-in'].includes(appointment.status) && (
                          <Button size="sm" variant="secondary">
                            <Video className="w-4 h-4 mr-1" /> Join
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => openDetail(appointment)}>
                          Details
                        </Button>
                      </div>
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
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-xl">
                {selectedAppointment.patientName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedAppointment.patientName}</h3>
                <p className="text-gray-500">{selectedAppointment.reason}</p>
                <Chip variant={getStatusColor(selectedAppointment.status)} className="mt-1">
                  {selectedAppointment.status.replace('-', ' ')}
                </Chip>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                <div className="font-medium">
                  {new Date(selectedAppointment.dateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-[#0A6E6E]">{formatTime(selectedAppointment.dateTime)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Duration</div>
                <div className="font-medium">{selectedAppointment.duration} minutes</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Type</div>
                <div className="font-medium flex items-center gap-2">
                  {selectedAppointment.type === 'video' ? (
                    <><Video className="w-4 h-4 text-blue-500" /> Video Visit</>
                  ) : (
                    <><MapPin className="w-4 h-4" /> In-Person</>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Patient ID</div>
                <div className="font-medium">{selectedAppointment.patientId}</div>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Notes</div>
                <div className="p-3 bg-gray-50 rounded-lg">{selectedAppointment.notes}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="secondary">
                <FileText className="w-4 h-4 mr-2" />
                View Patient Records
              </Button>
              {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled' && (
                <Button variant="danger" onClick={() => {
                  updateStatus(selectedAppointment.id, 'cancelled')
                  setShowDetailModal(false)
                }}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Appointment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
