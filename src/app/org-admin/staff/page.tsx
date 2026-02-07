'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { StatCard, Card, CardHeader, CardBody, Button, Input, Select, Chip, Modal, Alert, EmptyState } from '@/components/ui'
import { roleColors, roleLabels } from '@/lib/utils'
import { Trash2, Mail } from 'lucide-react'

interface StaffMember {
  email: string
  name: string
  role: string
  status: 'active' | 'pending'
  invitedAt?: string
}

export default function StaffPage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      // Mock data for demo - replace with real API call
      setStaff([
        { email: user?.email || '', name: 'You', role: 'owner', status: 'active' },
        { email: 'dr.smith@org.com', name: 'Dr. Smith', role: 'doctor', status: 'active' },
        { email: 'nurse.jones@org.com', name: 'Nurse Jones', role: 'nurse', status: 'active' },
        { email: 'reception@org.com', name: 'Front Desk', role: 'staff', status: 'pending' },
      ])
    } catch (err) {
      console.error('Failed to load staff:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)
    setError('')
    setSuccess('')

    try {
      // In production, call the API
      // await apiCall('/staff', { method: 'POST', body: JSON.stringify({ email: inviteEmail, role: inviteRole }) })
      
      // Mock success
      setStaff([...staff, {
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        role: inviteRole,
        status: 'pending',
      }])
      
      setSuccess(`Invitation sent to ${inviteEmail}!`)
      setInviteEmail('')
      setInviteRole('')
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = (email: string) => {
    if (!confirm(`Remove ${email} from your organization?`)) return
    setStaff(staff.filter(s => s.email !== email))
    setSuccess(`${email} has been removed`)
  }

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    admins: staff.filter(s => s.role === 'admin' || s.role === 'owner').length,
    doctors: staff.filter(s => s.role === 'doctor').length,
    nurses: staff.filter(s => s.role === 'nurse').length,
    other: staff.filter(s => s.role === 'staff').length,
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg p-6 mb-6">
        <h1 className="font-display text-2xl font-bold">👥 Staff Management</h1>
        <p className="opacity-90">Add and manage your organization's staff</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="🏢" value={stats.admins} label="Admins" iconBg="bg-blue-100" />
        <StatCard icon="🩺" value={stats.doctors} label="Doctors" iconBg="bg-primary-light" />
        <StatCard icon="👨‍⚕️" value={stats.nurses} label="Nurses" iconBg="bg-cyan-100" />
        <StatCard icon="📋" value={stats.other} label="Other Staff" iconBg="bg-amber-100" />
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* Invite Form */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Invite New Staff</h3>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-3">
            <Input
              type="email"
              placeholder="colleague@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-[2] min-w-[200px]"
            />
            <Select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              required
              className="flex-1 min-w-[150px]"
              options={[
                { value: '', label: 'Select Role...' },
                { value: 'admin', label: 'Admin' },
                { value: 'doctor', label: 'Doctor' },
                { value: 'nurse', label: 'Nurse' },
                { value: 'staff', label: 'Staff' },
              ]}
            />
            <Button
              type="submit"
              isLoading={isInviting}
              disabled={!inviteEmail || !inviteRole}
              style={{ background: '#2563EB' }}
            >
              <Mail className="w-4 h-4" /> Send Invite
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h3 className="font-semibold">Current Staff</h3>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48"
          />
        </CardHeader>
        <CardBody className="p-0">
          {filteredStaff.length === 0 ? (
            <EmptyState
              icon="👥"
              title="No staff members"
              description="Invite your team to get started"
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredStaff.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center gap-4 p-4 hover:bg-primary-light/50 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: roleColors[member.role] || '#666' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-semibold">{member.name}</div>
                    <div className="text-sm text-text-3">
                      {member.email} •{' '}
                      <span
                        className="font-medium"
                        style={{ color: roleColors[member.role] }}
                      >
                        {roleLabels[member.role] || member.role}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  {member.status === 'pending' ? (
                    <Chip variant="warn">Pending</Chip>
                  ) : (
                    <Chip variant="ok">Active</Chip>
                  )}

                  {/* Actions */}
                  {member.email !== user?.email && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.email)}
                      className="text-status-bad hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
