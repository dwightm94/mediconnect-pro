'use client'

import { useAuth } from '@/lib/auth-context'
import { StatCard, Card, CardHeader, CardBody, Button, Chip } from '@/components/ui'
import Link from 'next/link'
import { Users, FileText, Share2, Calendar } from 'lucide-react'

export default function ProviderDashboard() {
  const { user } = useAuth()

  const todayAppointments = [
    { id: 1, patient: 'John Smith', time: '9:00 AM', type: 'Follow-up', status: 'confirmed' },
    { id: 2, patient: 'Mary Johnson', time: '10:30 AM', type: 'Video Call', status: 'confirmed' },
    { id: 3, patient: 'Robert Davis', time: '2:00 PM', type: 'New Patient', status: 'pending' },
  ]

  const pendingRequests = [
    { id: 1, from: 'City General Hospital', type: 'Records Request', patient: 'Jane Doe', time: '2 hours ago' },
    { id: 2, from: 'Metro Lab', type: 'Lab Results', patient: 'John Smith', time: '5 hours ago' },
  ]

  const recentActivity = [
    { icon: '📋', title: 'Records accessed for John Smith', time: '10 min ago', bg: 'bg-blue-100' },
    { icon: '✅', title: 'Sharing request approved', time: '1 hour ago', bg: 'bg-green-100' },
    { icon: '📥', title: 'New lab results received', time: '3 hours ago', bg: 'bg-purple-100' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-primary to-primary-deep text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Provider Dashboard</h1>
            <p className="opacity-90">{user?.orgName || 'Healthcare Provider Portal'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm opacity-90">Appointments Today</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="👥" value={156} label="Active Patients" iconBg="bg-blue-100" />
        <StatCard icon="📅" value={12} label="Today's Appointments" iconBg="bg-primary-light" />
        <StatCard icon="🔔" value={5} label="Pending Requests" iconBg="bg-amber-100" />
        <StatCard icon="📤" value={23} label="Shared Records" iconBg="bg-green-100" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold">Today's Appointments</h3>
            <Link href="/provider/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-primary-light/50">
                  <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center font-bold text-primary">
                    {apt.patient.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{apt.patient}</div>
                    <div className="text-sm text-text-3">{apt.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{apt.time}</div>
                    <Chip variant={apt.status === 'confirmed' ? 'ok' : 'warn'}>{apt.status}</Chip>
                  </div>
                  <Button size="sm">Start</Button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Quick Actions</h3></CardHeader>
          <CardBody className="space-y-3">
            <Link href="/provider/patients"><Button variant="secondary" className="w-full justify-start gap-2"><Users className="w-4 h-4" /> View Patients</Button></Link>
            <Link href="/provider/records"><Button variant="secondary" className="w-full justify-start gap-2"><FileText className="w-4 h-4" /> Medical Records</Button></Link>
            <Link href="/provider/sharing"><Button variant="secondary" className="w-full justify-start gap-2"><Share2 className="w-4 h-4" /> Sharing Requests</Button></Link>
            <Link href="/provider/appointments"><Button variant="secondary" className="w-full justify-start gap-2"><Calendar className="w-4 h-4" /> Appointments</Button></Link>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Pending Requests</h3>
              <Chip variant="warn">{pendingRequests.length} new</Chip>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">📥</div>
                <div className="flex-1">
                  <div className="font-semibold">{req.from}</div>
                  <div className="text-sm text-text-3">{req.type} for {req.patient}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="text-status-bad">Deny</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="font-semibold">Recent Activity</h3></CardHeader>
          <CardBody className="space-y-4">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${a.bg} flex items-center justify-center`}>{a.icon}</div>
                <div>
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-text-3">{a.time}</div>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
