'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, StatCard, Chip, Loading, EmptyState } from '@/components/ui'
import { Users, Building2, Shield, Settings, Activity, TrendingUp, UserPlus, Key } from 'lucide-react'
import Link from 'next/link'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'nurse' | 'staff'
  status: 'active' | 'pending' | 'inactive'
  lastActive?: string
}

interface ActivityLog {
  id: string
  action: string
  user: string
  timestamp: string
  details?: string
}

export default function OrgAdminDashboard() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()
  const [orgName, setOrgName] = useState('Your Organization')
  const [orgType, setOrgType] = useState('Healthcare Provider')
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState({ staff: 0, providers: 0, patients: 0, connections: 0 })
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
      // Try to load from API, fall back to mock
      const orgData = await apiCall('/organization').catch(() => null)
      
      if (orgData) {
        setOrgName(orgData.name || 'Your Organization')
        setOrgType(orgData.type || 'Healthcare Provider')
      }

      const mockStaff: StaffMember[] = [
        { id: '1', name: 'Dr. Sarah Chen', email: 'sarah.chen@org.com', role: 'doctor', status: 'active', lastActive: '2026-02-07T10:30:00' },
        { id: '2', name: 'Dr. Michael Roberts', email: 'michael.roberts@org.com', role: 'doctor', status: 'active', lastActive: '2026-02-07T09:15:00' },
        { id: '3', name: 'Nurse Johnson', email: 'nurse.johnson@org.com', role: 'nurse', status: 'active', lastActive: '2026-02-07T08:45:00' },
        { id: '4', name: 'Admin User', email: 'admin@org.com', role: 'admin', status: 'active', lastActive: '2026-02-07T11:00:00' },
        { id: '5', name: 'New Doctor', email: 'new.doctor@org.com', role: 'doctor', status: 'pending' },
        { id: '6', name: 'Front Desk', email: 'frontdesk@org.com', role: 'staff', status: 'active', lastActive: '2026-02-06T17:00:00' },
      ]

      const mockActivities: ActivityLog[] = [
        { id: '1', action: 'Staff Login', user: 'Dr. Sarah Chen', timestamp: '2026-02-07T10:30:00', details: 'Logged in from 192.168.1.100' },
        { id: '2', action: 'Patient Record Accessed', user: 'Dr. Michael Roberts', timestamp: '2026-02-07T09:45:00', details: 'Accessed record for Jane Doe' },
        { id: '3', action: 'Data Sharing Approved', user: 'Admin User', timestamp: '2026-02-07T09:30:00', details: 'Approved request from City General Hospital' },
        { id: '4', action: 'New Staff Invited', user: 'Admin User', timestamp: '2026-02-07T09:00:00', details: 'Sent invitation to new.doctor@org.com' },
        { id: '5', action: 'Staff Login', user: 'Nurse Johnson', timestamp: '2026-02-07T08:45:00', details: 'Logged in from mobile app' },
        { id: '6', action: 'Settings Updated', user: 'Admin User', timestamp: '2026-02-06T16:30:00', details: 'Updated organization contact info' },
      ]

      setStaff(mockStaff)
      setActivities(mockActivities)
      setStats({
        staff: mockStaff.length,
        providers: mockStaff.filter(s => s.role === 'doctor').length,
        patients: 1250,
        connections: 8
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: string): 'ok' | 'info' | 'warn' | 'error' => {
    switch (role) {
      case 'admin': return 'error'
      case 'doctor': return 'ok'
      case 'nurse': return 'info'
      default: return 'warn'
    }
  }

  const getStatusColor = (status: string): 'ok' | 'warn' | 'error' => {
    switch (status) {
      case 'active': return 'ok'
      case 'pending': return 'warn'
      default: return 'error'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">🏢</div>
        <h1 className="text-2xl font-bold mb-2">Organization Admin Portal</h1>
        <p className="text-gray-500 mb-6">Sign in to manage your organization</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    )
  }

  if (isLoading) {
    return <Loading text="Loading organization dashboard..." />
  }

  const pendingStaff = staff.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-6 h-6" />
              <span className="text-blue-100 text-sm font-medium uppercase tracking-wide">Organization Admin</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">{orgName}</h1>
            <p className="opacity-90">{orgType}</p>
          </div>
          <div className="hidden md:block text-right">
            {pendingStaff > 0 && (
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-2xl font-bold">{pendingStaff}</div>
                <div className="text-sm opacity-90">Pending Invites</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="👥" value={stats.staff} label="Staff Members" iconBg="bg-blue-100" />
        <StatCard icon="🩺" value={stats.providers} label="Providers" iconBg="bg-green-100" />
        <StatCard icon="📋" value={stats.patients.toLocaleString()} label="Patients" iconBg="bg-purple-100" />
        <StatCard icon="🔗" value={stats.connections} label="Connections" iconBg="bg-amber-100" />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/org-admin/staff">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Manage Staff</span>
              </Button>
            </Link>
            <Link href="/org-admin/sso">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Key className="w-6 h-6 text-blue-600" />
                <span className="text-sm">SSO Config</span>
              </Button>
            </Link>
            <Link href="/org-admin/audit">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Audit Logs</span>
              </Button>
            </Link>
            <Link href="/org-admin/settings">
              <Button variant="secondary" className="w-full flex-col h-24 gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                <span className="text-sm">Settings</span>
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Staff Overview */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Staff Members</h3>
            <Link href="/org-admin/staff">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {staff.length === 0 ? (
              <EmptyState
                icon="👥"
                title="No staff members"
                description="Invite staff to your organization"
                action={<Link href="/org-admin/staff"><Button size="sm">Invite Staff</Button></Link>}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {staff.slice(0, 5).map((member) => (
                  <div key={member.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                        {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{member.name}</span>
                          <Chip variant={getRoleColor(member.role)}>{member.role}</Chip>
                        </div>
                        <div className="text-sm text-gray-500 truncate">{member.email}</div>
                      </div>
                      <div className="text-right">
                        <Chip variant={getStatusColor(member.status)}>{member.status}</Chip>
                        {member.lastActive && (
                          <div className="text-xs text-gray-400 mt-1">{formatTime(member.lastActive)}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Recent Activity</h3>
            <Link href="/org-admin/audit">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {activities.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No recent activity"
                description="Activity will appear here"
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {activities.slice(0, 6).map((activity) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{activity.action}</div>
                        <div className="text-sm text-gray-500">{activity.user}</div>
                        {activity.details && (
                          <div className="text-xs text-gray-400 mt-1">{activity.details}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-lg">🔗 Network Connections</h3>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { name: 'City General Hospital', type: '🏥 Hospital', status: 'connected' },
              { name: 'BioTech Labs', type: '🔬 Laboratory', status: 'connected' },
              { name: 'Metro Urgent Care', type: '🚑 Urgent Care', status: 'connected' },
              { name: 'HealthFirst Pharmacy', type: '💊 Pharmacy', status: 'pending' },
            ].map((connection, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{connection.type}</span>
                  <Chip variant={connection.status === 'connected' ? 'ok' : 'warn'}>
                    {connection.status}
                  </Chip>
                </div>
                <div className="font-medium">{connection.name}</div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
