'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, cancelAppointment, type Appointment } from '@/lib/api'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Calendar, Clock, MapPin, Video, Phone, X, MessageSquare } from 'lucide-react'
import Link from 'next/link'

// Appointment type imported from @/lib/api
export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const mockAppointments: Appointment[] = [
    { id: '1', providerName: 'Dr. Sarah Chen', providerSpecialty: 'Primary Care', organization: 'City Medical Center', dateTime: '2026-02-10T09:00:00', type: 'in-person', status: 'confirmed', location: '123 Medical Center Dr, New York, NY', reason: 'Annual Physical', notes: 'Please bring your insurance card and arrive 15 minutes early.' },
    { id: '2', providerName: 'Dr. Michael Roberts', providerSpecialty: 'Cardiology', organization: 'Heart Health Institute', dateTime: '2026-02-12T14:30:00', type: 'video', status: 'confirmed', reason: 'Follow-up Consultation', notes: 'Video link will be sent 10 minutes before appointment.' },
    { id: '3', providerName: 'Dr. Emily Watson', providerSpecialty: 'Dermatology', organization: 'Skin Care Clinic', dateTime: '2026-02-15T11:00:00', type: 'in-person', status: 'pending', location: '456 Downtown Clinic, Brooklyn, NY', reason: 'Skin Check' },
    { id: '4', providerName: 'Dr. James Wilson', providerSpecialty: 'Orthopedics', organization: 'Sports Medicine Center', dateTime: '2026-01-20T10:00:00', type: 'in-person', status: 'completed', location: '789 Sports Med Blvd, Manhattan, NY', reason: 'Knee Pain Evaluation' },
    { id: '5', providerName: 'Dr. Lisa Park', providerSpecialty: 'Pediatrics', organization: 'Children\'s Wellness Center', dateTime: '2026-01-15T15:00:00', type: 'video', status: 'completed', reason: 'Sick Visit - Cold Symptoms' },
    { id: '6', providerName: 'Dr. David Kim', providerSpecialty: 'Neurology', organization: 'Brain & Spine Institute', dateTime: '2026-01-10T09:30:00', type: 'in-person', status: 'cancelled', location: '321 Neuro Center, New York, NY', reason: 'Headache Consultation' },
  ]

  useEffect(() => {
    loadAppointments()
  }, [])

  useEffect(() => {
    filterAppointments()
  }, [filter, appointments])

  const loadAppointments = async () => {
    try {
      const result = await getAppointments(user?.sub || '').catch(() => null)
      setAppointments(result?.appointments?.length ? result.appointments : mockAppointments)
    } catch (error) {
      setAppointments(mockAppointments)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    const now = new Date()
    let filtered = [...appointments]

    if (filter === 'upcoming') {
      filtered = filtered.filter(apt => 
        new Date(apt.dateTime) >= now && apt.status !== 'cancelled' && apt.status !== 'completed'
      )
    } else if (filter === 'past') {
      filtered = filtered.filter(apt => 
        new Date(apt.dateTime) < now || apt.status === 'completed' || apt.status === 'cancelled'
      )
    }

    // Sort by date
    filtered.sort((a, b) => {
      if (filter === 'past') {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      }
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    })

    setFilteredAppointments(filtered)
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' })
    }
  }

  const openDetail = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowDetailModal(true)
  }

  const openCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowCancelModal(true)
  }

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    try {
      await cancelAppointment(selectedAppointment.id).catch(() => null)

      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === selectedAppointment.id 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        )
      )
      setShowCancelModal(false)
    } catch (error) {
      console.error('Cancel failed:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'ok'
      case 'pending': return 'warn'
      case 'completed': return 'info'
      case 'cancelled': return 'error'
      default: return 'info'
    }
  }

  const isUpcoming = (dateTime: string) => {
    return new Date(dateTime) >= new Date()
  }

  if (isLoading) {
    return <Loading text="Loading appointments..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Appointments</h1>
          <p className="text-gray-500">Manage your upcoming and past appointments</p>
        </div>
        <Link href="/patient/doctors">
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {(['upcoming', 'past', 'all'] as const).map((f) => (
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
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-[#0A6E6E]">
              {appointments.filter(a => isUpcoming(a.dateTime) && a.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-500">Confirmed</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-amber-500">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-500">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardBody>
        </Card>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title={filter === 'upcoming' ? 'No upcoming appointments' : 'No appointments found'}
          description={filter === 'upcoming' ? 'Book a visit with a doctor to get started' : 'Your appointments will appear here'}
          action={
            filter === 'upcoming' ? (
              <Link href="/patient/doctors">
                <Button>Find Doctors</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const { date, time, shortDate, dayOfWeek } = formatDateTime(appointment.dateTime)
            const upcoming = isUpcoming(appointment.dateTime) && appointment.status !== 'cancelled'

            return (
              <Card 
                key={appointment.id} 
                className={`overflow-hidden ${appointment.status === 'cancelled' ? 'opacity-60' : ''}`}
              >
                <CardBody className="p-0">
                  <div className="flex">
                    {/* Date Block */}
                    <div className={`w-24 flex-shrink-0 flex flex-col items-center justify-center p-4 ${
                      upcoming ? 'bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <div className="text-sm font-medium">{dayOfWeek}</div>
                      <div className="text-3xl font-bold">{shortDate.split(' ')[1]}</div>
                      <div className="text-sm">{shortDate.split(' ')[0]}</div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-lg">{appointment.providerName}</h3>
                          <p className="text-[#0A6E6E]">{appointment.providerSpecialty}</p>
                          <p className="text-sm text-gray-500">{appointment.organization}</p>
                        </div>
                        <Chip variant={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Chip>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {time}
                        </span>
                        {appointment.type === 'video' ? (
                          <span className="flex items-center gap-1 text-blue-600">
                            <Video className="w-4 h-4" />
                            Video Visit
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {appointment.location?.split(',')[0] || 'In-Person'}
                          </span>
                        )}
                        {appointment.reason && (
                          <span className="text-gray-500">• {appointment.reason}</span>
                        )}
                      </div>

                      {/* Actions */}
                      {upcoming && appointment.status !== 'cancelled' && (
                        <div className="flex items-center gap-2 mt-4">
                          {appointment.type === 'video' && appointment.status === 'confirmed' && (
                            <Button size="sm">
                              <Video className="w-4 h-4 mr-1" />
                              Join Video Call
                            </Button>
                          )}
                          <Button size="sm" variant="secondary" onClick={() => openDetail(appointment)}>
                            View Details
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openCancel(appointment)}>
                            <X className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'completed' && (
                        <div className="flex items-center gap-2 mt-4">
                          <Button size="sm" variant="secondary" onClick={() => openDetail(appointment)}>
                            View Summary
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message Doctor
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-xl">
                {selectedAppointment.providerName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedAppointment.providerName}</h3>
                <p className="text-[#0A6E6E]">{selectedAppointment.providerSpecialty}</p>
                <p className="text-sm text-gray-500">{selectedAppointment.organization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Date & Time</div>
                <div className="font-medium">{formatDateTime(selectedAppointment.dateTime).date}</div>
                <div className="text-[#0A6E6E]">{formatDateTime(selectedAppointment.dateTime).time}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Type</div>
                <div className="flex items-center gap-2">
                  {selectedAppointment.type === 'video' ? (
                    <>
                      <Video className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Video Visit</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">In-Person</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedAppointment.location && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="font-medium">{selectedAppointment.location}</div>
              </div>
            )}

            {selectedAppointment.reason && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Reason for Visit</div>
                <div className="font-medium">{selectedAppointment.reason}</div>
              </div>
            )}

            {selectedAppointment.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">📝 Notes</div>
                <div className="text-sm text-blue-700">{selectedAppointment.notes}</div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {isUpcoming(selectedAppointment.dateTime) && selectedAppointment.status === 'confirmed' && (
                <>
                  {selectedAppointment.type === 'video' && (
                    <Button className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Join Video Call
                    </Button>
                  )}
                  <Button variant="secondary" className="flex-1" onClick={() => {
                    setShowDetailModal(false)
                    openCancel(selectedAppointment)
                  }}>
                    Cancel Appointment
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-800">
                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.providerName}</strong>?
              </p>
              <p className="text-sm text-red-600 mt-2">
                {formatDateTime(selectedAppointment.dateTime).date} at {formatDateTime(selectedAppointment.dateTime).time}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCancelModal(false)}>
                Keep Appointment
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleCancelAppointment}>
                Yes, Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
