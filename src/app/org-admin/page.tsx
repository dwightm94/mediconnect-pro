'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { StatCard, Card, CardHeader, CardBody, Button, Alert } from '@/components/ui'
import { orgTypeLabels } from '@/lib/utils'
import Link from 'next/link'
import { Users, Settings, Link as LinkIcon, Activity } from 'lucide-react'

export default function OrgAdminDashboard() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const [stats, setStats] = useState({
    staffCount: 3,
    providerCount: 2,
    patientCount: 150,
    connectionCount: 5,
  })

  const [recentActivity] = useState([
    { icon: '✓', title: `${user?.email} signed in`, time: 'Just now', bg: 'bg-green-100' },
    { icon: '👤', title: 'New staff member added', time: 'Yesterday', bg: 'bg-blue-100' },
    { icon: '📋', title: 'Records shared with partner', time: '2 days ago', bg: 'bg-primary-light' },
  ])

  return (
    <div className="animate-fade-in">
      {/* Success alert for new registrations */}
      {justRegistered && (
        <Alert variant="success" className="mb-6">
          <strong>🎉 Congratulations!</strong> Your organization has been registered. You are now the Organization Owner.
        </Alert>
      )}

      {/* Org Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-6 mb-6">
        <h1 className="font-display text-2xl font-bold">
          {user?.orgName || 'Your Organization'}
        </h1>
        <p className="opacity-90">
          {orgTypeLabels[user?.orgRole || ''] || 'Organization Dashboard'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon="👥"
          value={stats.staffCount}
          label="Staff Members"
          iconBg="bg-blue-100"
        />
        <StatCard
          icon="🩺"
          value={stats.providerCount}
          label="Providers"
          iconBg="bg-primary-light"
        />
        <StatCard
          icon="📋"
          value={stats.patientCount}
          label="Patients"
          iconBg="bg-cyan-100"
        />
        <StatCard
          icon="🔗"
          value={stats.connectionCount}
          label="Connections"
          iconBg="bg-green-100"
        />
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
            <h3 className="font-semibold">Quick Actions</h3>
            <p className="text-sm opacity-90">Manage your organization</p>
          </CardHeader>
          <CardBody className="space-y-3">
            <Link href="/org-admin/staff">
              <Button className="w-full justify-start gap-3" style={{ background: '#2563EB' }}>
                <Users className="w-5 h-5" /> Manage Staff
              </Button>
            </Link>
            <Link href="/org-admin/sso">
              <Button className="w-full justify-start gap-3" style={{ background: '#2563EB' }}>
                <LinkIcon className="w-5 h-5" /> SSO Configuration
              </Button>
            </Link>
            <Link href="/org-admin/settings">
              <Button className="w-full justify-start gap-3" style={{ background: '#2563EB' }}>
                <Settings className="w-5 h-5" /> Organization Settings
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-t-lg">
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="text-sm opacity-90">Your organization's activity</p>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${activity.bg} flex items-center justify-center`}>
                    {activity.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-text-3">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
