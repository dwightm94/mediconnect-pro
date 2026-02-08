'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAppointments, getMedicalRecords, checkPatient, type Appointment, type MedicalRecord } from '@/lib/api'
import { Button, Card, CardHeader, CardBody, StatCard, Chip, Loading, EmptyState } from '@/components/ui'
import { Calendar, FileText, Users, Video, MessageSquare, Shield, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Types imported from @/lib/api

export default function PatientDashboard() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [stats, setStats] = useState({ appointments: 0, records: 0, prescriptions: 0, consents: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [patientName, setPatientName] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      // Check if patient profile exists, redirect to onboarding if not
      const profileCheck = await checkPatient(user?.sub || '').catch(() => ({ exists: false }))
      if (!profileCheck.exists) {
        router.push('/patient/onboarding')
        return
      }
      if (profileCheck.patient) {
        setPatientName(`${profileCheck.patient.first_name} ${profileCheck.patient.last_name}`.trim())
      }
      const [apptResult, recordResult] = await Promise.all([
        getAppointments(user?.sub || '').catch(() => null),
        getMedicalRecords(user?.sub || '').catch(() => null)
      ])

      const mockAppointments: Appointment[] = [
        { id: '1', providerName: 'Dr. Sarah Chen', specialty: 'Primary Care', dateTime: '2026-02-10T09:00:00', type: 'in-person', status: 'confirmed', location: 'City Medical Center', reason: '', meetingLink: '', paymentStatus: '', paymentAmount: '' },
        { id: '2', providerName: 'Dr. Michael Roberts', specialty: 'Cardiology', dateTime: '2026-02-12T14:30:00', type: 'video', status: 'confirmed', location: '', reason: '', meetingLink: '', paymentStatus: '', paymentAmount: '' },
        { id: '3', providerName: 'Dr. Emily Watson', specialty: 'Dermatology', dateTime: '2026-02-15T11:00:00', type: 'in-person', status: 'pending', location: 'Downtown Clinic', reason: '', meetingLink: '', paymentStatus: '', paymentAmount: '' },
      ]

      const mockRecords: MedicalRecord[] = [
        { id: '1', type: 'Lab Result', title: 'Complete Blood Count', provider: 'BioTech Labs', date: '2026-02-01', status: 'final' },
        { id: '2', type: 'Imaging', title: 'Chest X-Ray', provider: 'City Medical Center', date: '2026-01-28', status: 'final' },
        { id: '3', type: 'Visit Note', title: 'Annual Physical', provider: 'Dr. Sarah Chen', date: '2026-01-15', status: 'final' },
      ]

      const realAppts = apptResult?.appointments || []
      const realRecords = recordResult || []

      setAppointments(realAppts.length > 0 ? realAppts : mockAppointments)
      setRecords(realRecords.length > 0 ? realRecords : mockRecords)
      setStats({
        appointments: realAppts.length || 3,
        records: realRecords.length || 12,
        prescriptions: 3,
        consents: 5
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold mb-2">Welcome to MediConnect</h1>
        <p className="text-gray-500 mb-6">Sign in to access your health records and appointments</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    )
  }

  if (isLoading) {
    return <Loading text="Loading your dashboard..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#0A6E6E] to-[#0EEACA] text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {patientName || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="opacity-90">Here's your health dashboard for today</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-3xl font-bold">{stats.appointments}</div>
            <div className="text-sm opacity-90">Upcoming Appointments</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" value={stats.appointments} label="Upcoming Visits" iconBg="bg-blue-100" />
        <StatCard icon="📋" value={stats.records} label="Health Records" iconBg="bg-[rgba(14,234,202,0.10)]" />
        <StatCard icon="💊" value={stats.prescriptions} label="Prescriptions" iconBg="bg-purple-100" />
        <StatCard icon="✅" value={stats.consents} label="Active Consents" iconBg="bg-green-100" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/patient/doctors">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Users className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">Find Doctors</span>
              </Button>
            </Link>
            <Link href="/patient/appointments">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Video className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">Video Visit</span>
              </Button>
            </Link>
            <Link href="/patient/medical-records">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <FileText className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">My Records</span>
              </Button>
            </Link>
            <Link href="/patient/consents">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Shield className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">Consents</span>
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Upcoming Appointments</h3>
            <Link href="/patient/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {appointments.length === 0 ? (
              <EmptyState 
                icon="📅" 
                title="No upcoming appointments" 
                description="Book a visit with a doctor"
                action={<Link href="/patient/doctors"><Button size="sm">Find Doctors</Button></Link>}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {appointments.slice(0, 3).map((apt) => {
                  const { date, time } = formatDateTime(apt.dateTime)
                  return (
                    <div key={apt.id} className="p-4 hover:bg-[rgba(14,234,202,0.05)] transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-lg">
                          {apt.providerName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">{apt.providerName}</div>
                          <div className="text-sm text-gray-500">{apt.specialty}</div>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock className="w-4 h-4" />
                              {date} at {time}
                            </span>
                            {apt.type === 'video' ? (
                              <Chip variant="info">📹 Video</Chip>
                            ) : (
                              <Chip variant="ok">🏥 In-Person</Chip>
                            )}
                          </div>
                          {apt.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                              <MapPin className="w-3 h-3" />
                              {apt.location}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Chip variant={apt.status === 'confirmed' ? 'ok' : 'warn'}>
                            {apt.status}
                          </Chip>
                          {apt.type === 'video' && apt.status === 'confirmed' && (
                            <Button size="sm">Join</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Records</h3>
            <Link href="/patient/medical-records">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {records.length === 0 ? (
              <EmptyState 
                icon="📋" 
                title="No records yet" 
                description="Your medical records will appear here"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {records.slice(0, 4).map((record) => {
                  const icons: { [key: string]: string } = {
                    'Lab Result': '🔬',
                    'Imaging': '📷',
                    'Visit Note': '📝',
                    'Prescription': '💊'
                  }
                  return (
                    <div key={record.id} className="p-4 hover:bg-[rgba(14,234,202,0.05)] transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[rgba(14,234,202,0.10)] flex items-center justify-center text-xl">
                          {icons[record.type] || '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{record.title}</div>
                          <div className="text-sm text-gray-500">{record.provider}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">{record.date}</div>
                          <Chip variant="ok">{record.status}</Chip>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Health Tips */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">💡 Health Tips</h3>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💧</span>
                <div>
                  <div className="font-semibold text-green-800">Stay Hydrated</div>
                  <p className="text-sm text-green-700">Drink at least 8 glasses of water daily.</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏃</span>
                <div>
                  <div className="font-semibold text-blue-800">Stay Active</div>
                  <p className="text-sm text-blue-700">Aim for 30 minutes of exercise daily.</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">😴</span>
                <div>
                  <div className="font-semibold text-purple-800">Sleep Well</div>
                  <p className="text-sm text-purple-700">Get 7-9 hours of quality sleep.</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
