'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, StatCard, Chip, Loading, EmptyState } from '@/components/ui'
import { Users, Calendar, FileText, Share2, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  name: string
  lastVisit: string
  nextAppointment?: string
  status: 'active' | 'new' | 'follow-up'
}

interface Appointment {
  id: string
  patientName: string
  time: string
  type: 'in-person' | 'video'
  reason: string
  status: 'confirmed' | 'checked-in' | 'in-progress' | 'completed'
}

interface SharingRequest {
  id: string
  requestingOrg: string
  patientName: string
  dataTypes: string[]
  requestDate: string
  status: 'pending' | 'approved' | 'denied'
}

export default function ProviderDashboard() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [sharingRequests, setSharingRequests] = useState<SharingRequest[]>([])
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0, pendingRequests: 0, records: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      // Mock data
      const mockPatients: Patient[] = [
        { id: '1', name: 'Jane Doe', lastVisit: '2026-02-01', nextAppointment: '2026-02-10', status: 'active' },
        { id: '2', name: 'John Smith', lastVisit: '2026-01-28', nextAppointment: '2026-02-12', status: 'follow-up' },
        { id: '3', name: 'Robert Chen', lastVisit: '2026-01-25', status: 'active' },
        { id: '4', name: 'Maria Garcia', lastVisit: '2026-02-05', nextAppointment: '2026-02-07', status: 'new' },
        { id: '5', name: 'David Wilson', lastVisit: '2026-01-20', status: 'active' },
      ]

      const mockAppointments: Appointment[] = [
        { id: '1', patientName: 'Maria Garcia', time: '09:00 AM', type: 'in-person', reason: 'New Patient Visit', status: 'confirmed' },
        { id: '2', patientName: 'Jane Doe', time: '10:30 AM', type: 'video', reason: 'Follow-up Consultation', status: 'confirmed' },
        { id: '3', patientName: 'Michael Brown', time: '11:30 AM', type: 'in-person', reason: 'Annual Physical', status: 'checked-in' },
        { id: '4', patientName: 'Sarah Johnson', time: '02:00 PM', type: 'video', reason: 'Lab Results Review', status: 'confirmed' },
        { id: '5', patientName: 'John Smith', time: '03:30 PM', type: 'in-person', reason: 'Prescription Renewal', status: 'confirmed' },
      ]

      const mockSharingRequests: SharingRequest[] = [
        { id: '1', requestingOrg: 'City General Hospital', patientName: 'Jane Doe', dataTypes: ['lab_results', 'medications'], requestDate: '2026-02-06', status: 'pending' },
        { id: '2', requestingOrg: 'Metro Urgent Care', patientName: 'John Smith', dataTypes: ['visit_notes', 'allergies'], requestDate: '2026-02-05', status: 'pending' },
        { id: '3', requestingOrg: 'BioTech Labs', patientName: 'Robert Chen', dataTypes: ['lab_results'], requestDate: '2026-02-04', status: 'pending' },
      ]

      setPatients(mockPatients)
      setTodayAppointments(mockAppointments)
      setSharingRequests(mockSharingRequests)
      setStats({
        patients: mockPatients.length,
        todayAppts: mockAppointments.length,
        pendingRequests: mockSharingRequests.filter(r => r.status === 'pending').length,
        records: 156
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string): 'ok' | 'warn' | 'info' | 'error' => {
    switch (status) {
      case 'confirmed': return 'ok'
      case 'checked-in': return 'info'
      case 'in-progress': return 'warn'
      case 'completed': return 'ok'
      case 'new': return 'info'
      case 'follow-up': return 'warn'
      default: return 'info'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">👨‍⚕️</div>
        <h1 className="text-2xl font-bold mb-2">Provider Portal</h1>
        <p className="text-gray-500 mb-6">Sign in to access your provider dashboard</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    )
  }

  if (isLoading) {
    return <Loading text="Loading provider dashboard..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#0A6E6E] to-[#054848] text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Good morning, Dr. {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="opacity-90">You have {stats.todayAppts} appointments scheduled for today</p>
          </div>
          <div className="hidden md:block text-right">
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
            <div className="text-sm opacity-90">Pending Requests</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" value={stats.patients} label="My Patients" iconBg="bg-blue-100" />
        <StatCard icon="📅" value={stats.todayAppts} label="Today's Appointments" iconBg="bg-[rgba(14,234,202,0.10)]" />
        <StatCard icon="📨" value={stats.pendingRequests} label="Pending Requests" iconBg="bg-amber-100" />
        <StatCard icon="📋" value={stats.records} label="Patient Records" iconBg="bg-purple-100" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/provider/patients">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Users className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">My Patients</span>
              </Button>
            </Link>
            <Link href="/provider/appointments">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Calendar className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">Appointments</span>
              </Button>
            </Link>
            <Link href="/provider/sharing">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Share2 className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">Data Requests</span>
              </Button>
            </Link>
            <Link href="/provider/medical-records">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <FileText className="w-6 h-6 text-[#0A6E6E]" />
                <span className="text-sm">External Records</span>
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Today's Schedule</h3>
            <Link href="/provider/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {todayAppointments.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No appointments today"
                description="Your schedule is clear"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {todayAppointments.map((apt) => (
                  <div key={apt.id} className="p-4 hover:bg-[rgba(14,234,202,0.05)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-center">
                        <div className="text-sm font-bold text-[#0A6E6E]">{apt.time}</div>
                        <div className="text-xs text-gray-500">{apt.type === 'video' ? '📹' : '🏥'}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{apt.patientName}</div>
                        <div className="text-sm text-gray-500">{apt.reason}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip variant={getStatusColor(apt.status)}>{apt.status}</Chip>
                        {apt.type === 'video' && apt.status === 'confirmed' && (
                          <Button size="sm">Start</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Pending Data Requests */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Data Sharing Requests</h3>
              {stats.pendingRequests > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                  {stats.pendingRequests} pending
                </span>
              )}
            </div>
            <Link href="/provider/sharing">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {sharingRequests.filter(r => r.status === 'pending').length === 0 ? (
              <EmptyState
                icon="✅"
                title="No pending requests"
                description="All data requests have been processed"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {sharingRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="p-4 hover:bg-[rgba(14,234,202,0.05)] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{request.requestingOrg}</div>
                        <div className="text-sm text-gray-500">
                          Requesting: {request.patientName}'s records
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {request.dataTypes.map((type) => (
                            <span key={type} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              {type.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">Deny</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Patients */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Recent Patients</h3>
          <Link href="/provider/patients">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Visit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Next Appointment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white text-sm font-bold">
                          {patient.name.charAt(0)}
                        </div>
                        <span className="font-medium">{patient.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.lastVisit}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{patient.nextAppointment || '—'}</td>
                    <td className="px-4 py-3">
                      <Chip variant={getStatusColor(patient.status)}>{patient.status}</Chip>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost">View Records</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
