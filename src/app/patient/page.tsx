'use client'

import { useAuth } from '@/lib/auth-context'
import { StatCard, Card, CardHeader, CardBody, Button, Chip } from '@/components/ui'
import Link from 'next/link'
import { Calendar, FileText, Users, Video } from 'lucide-react'

export default function PatientDashboard() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()

  // Show sign in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-display font-bold mb-2">Welcome to MediConnect</h1>
        <p className="text-text-2 mb-6">
          Sign in to access your health records, book appointments, and connect with your care team.
        </p>
        <Button onClick={signInWithGoogle} className="inline-flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          </svg>
          Sign in with Google
        </Button>
      </div>
    )
  }

  // Mock data
  const upcomingAppointments = [
    { id: 1, doctor: 'Dr. Sarah Johnson', specialty: 'Primary Care', date: '2026-02-10', time: '10:00 AM', type: 'video' },
    { id: 2, doctor: 'Dr. Michael Chen', specialty: 'Cardiology', date: '2026-02-15', time: '2:30 PM', type: 'in-person' },
  ]

  const recentRecords = [
    { id: 1, title: 'Blood Test Results', date: '2026-01-28', provider: 'City Lab' },
    { id: 2, title: 'Annual Physical', date: '2026-01-15', provider: 'Dr. Johnson' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary-glow text-white rounded-lg p-6 mb-6">
        <h1 className="font-display text-2xl font-bold">
          Welcome back, {user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="opacity-90">Here's your health dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="📅" value={2} label="Upcoming Visits" iconBg="bg-blue-100" />
        <StatCard icon="📋" value={12} label="Health Records" iconBg="bg-primary-light" />
        <StatCard icon="💊" value={3} label="Active Prescriptions" iconBg="bg-purple-100" />
        <StatCard icon="✅" value={5} label="Active Consents" iconBg="bg-green-100" />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold">Upcoming Appointments</h3>
            <Link href="/patient/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="flex items-center gap-4 p-3 bg-surface-2 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center">
                  {apt.type === 'video' ? <Video className="w-5 h-5 text-primary" /> : <Calendar className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{apt.doctor}</div>
                  <div className="text-sm text-text-3">{apt.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{apt.date}</div>
                  <div className="text-xs text-text-3">{apt.time}</div>
                </div>
              </div>
            ))}
            <Link href="/patient/doctors">
              <Button variant="secondary" className="w-full">
                <Calendar className="w-4 h-4" /> Book New Appointment
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Recent Records */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold">Recent Health Records</h3>
            <Link href="/patient/records">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center gap-4 p-3 bg-surface-2 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{record.title}</div>
                  <div className="text-sm text-text-3">{record.provider}</div>
                </div>
                <div className="text-sm text-text-3">{record.date}</div>
              </div>
            ))}
            <Link href="/patient/records">
              <Button variant="secondary" className="w-full">
                <FileText className="w-4 h-4" /> View All Records
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Quick Actions</h3>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-3">
            <Link href="/patient/doctors">
              <Button variant="secondary" className="w-full flex-col h-20 gap-1">
                <Users className="w-5 h-5" />
                <span className="text-xs">Find Doctor</span>
              </Button>
            </Link>
            <Link href="/patient/appointments">
              <Button variant="secondary" className="w-full flex-col h-20 gap-1">
                <Video className="w-5 h-5" />
                <span className="text-xs">Video Visit</span>
              </Button>
            </Link>
            <Link href="/patient/records">
              <Button variant="secondary" className="w-full flex-col h-20 gap-1">
                <FileText className="w-5 h-5" />
                <span className="text-xs">My Records</span>
              </Button>
            </Link>
            <Link href="/patient/consents">
              <Button variant="secondary" className="w-full flex-col h-20 gap-1">
                <span className="text-lg">🔒</span>
                <span className="text-xs">Consents</span>
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Health Tips */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Health Tips</h3>
          </CardHeader>
          <CardBody>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <div className="font-semibold text-green-800">Stay Hydrated</div>
                  <p className="text-sm text-green-700">
                    Drink at least 8 glasses of water daily to maintain optimal health.
                  </p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
