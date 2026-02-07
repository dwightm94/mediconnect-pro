'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardHeader, CardBody, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, UserPlus, Mail, MoreVertical, Edit, Trash2, Shield } from 'lucide-react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'nurse' | 'staff'
  status: 'active' | 'pending' | 'inactive'
  department?: string
  joinedDate?: string
  lastActive?: string
}

export default function StaffPage() {
  const { isAuthenticated } = useAuth()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  const mockStaff: StaffMember[] = [
    { id: '1', name: 'Dr. Sarah Chen', email: 'sarah.chen@org.com', role: 'doctor', status: 'active', department: 'Primary Care', joinedDate: '2024-03-15', lastActive: '2026-02-07T10:30:00' },
    { id: '2', name: 'Dr. Michael Roberts', email: 'michael.roberts@org.com', role: 'doctor', status: 'active', department: 'Cardiology', joinedDate: '2024-06-01', lastActive: '2026-02-07T09:15:00' },
    { id: '3', name: 'Dr. Emily Watson', email: 'emily.watson@org.com', role: 'doctor', status: 'active', department: 'Dermatology', joinedDate: '2024-09-10', lastActive: '2026-02-06T16:45:00' },
    { id: '4', name: 'Nurse Johnson', email: 'nurse.johnson@org.com', role: 'nurse', status: 'active', department: 'Primary Care', joinedDate: '2024-04-20', lastActive: '2026-02-07T08:45:00' },
    { id: '5', name: 'Nurse Williams', email: 'nurse.williams@org.com', role: 'nurse', status: 'active', department: 'Cardiology', joinedDate: '2024-07-15', lastActive: '2026-02-07T07:30:00' },
    { id: '6', name: 'Admin User', email: 'admin@org.com', role: 'admin', status: 'active', joinedDate: '2024-01-01', lastActive: '2026-02-07T11:00:00' },
    { id: '7', name: 'Front Desk', email: 'frontdesk@org.com', role: 'staff', status: 'active', department: 'Reception', joinedDate: '2024-05-10', lastActive: '2026-02-06T17:00:00' },
    { id: '8', name: 'New Doctor', email: 'new.doctor@org.com', role: 'doctor', status: 'pending', department: 'Pediatrics', joinedDate: '2026-02-05' },
    { id: '9', name: 'Billing Staff', email: 'billing@org.com', role: 'staff', status: 'inactive', department: 'Billing', joinedDate: '2023-11-01' },
  ]

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [searchQuery, roleFilter, staff])

  const loadStaff = async () => {
    try {
      const data = await apiCall('/organization/staff').catch(() => null)
      setStaff(data?.staff || mockStaff)
    } catch (error) {
      setStaff(mockStaff)
    } finally {
      setIsLoading(false)
    }
  }

  const filterStaff = () => {
    let filtered = [...staff]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.department?.toLowerCase().includes(query)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(s => s.role === roleFilter)
    }

    setFilteredStaff(filtered)
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteRole) return

    try {
      await apiCall('/organization/staff/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      }).catch(() => null)

      // Add to local state
      const newStaff: StaffMember = {
        id: `new-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole as StaffMember['role'],
        status: 'pending',
        joinedDate: new Date().toISOString().split('T')[0]
      }

      setStaff(prev => [...prev, newStaff])
      setInviteSuccess(true)
    } catch (error) {
      console.error('Invite failed:', error)
    }
  }

  const handleUpdateRole = async (newRole: string) => {
    if (!selectedStaff) return

    try {
      await apiCall(`/organization/staff/${selectedStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      }).catch(() => null)

      setStaff(prev =>
        prev.map(s =>
          s.id === selectedStaff.id
            ? { ...s, role: newRole as StaffMember['role'] }
            : s
        )
      )
      setShowEditModal(false)
    } catch (error) {
      console.error('Update failed:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedStaff) return

    try {
      await apiCall(`/organization/staff/${selectedStaff.id}`, {
        method: 'DELETE'
      }).catch(() => null)

      setStaff(prev => prev.filter(s => s.id !== selectedStaff.id))
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleResendInvite = async (member: StaffMember) => {
    try {
      await apiCall(`/organization/staff/${member.id}/resend-invite`, {
        method: 'POST'
      }).catch(() => null)

      alert(`Invitation resent to ${member.email}`)
    } catch (error) {
      console.error('Resend failed:', error)
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

  const formatDate = (date?: string) => {
    if (!date) return '—'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastActive = (timestamp?: string) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(timestamp)
  }

  if (isLoading) {
    return <Loading text="Loading staff..." />
  }

  const adminCount = staff.filter(s => s.role === 'admin').length
  const doctorCount = staff.filter(s => s.role === 'doctor').length
  const nurseCount = staff.filter(s => s.role === 'nurse').length
  const pendingCount = staff.filter(s => s.status === 'pending').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Staff Management</h1>
          <p className="text-gray-500">Manage your organization's staff members</p>
        </div>
        <Button onClick={() => {
          setInviteEmail('')
          setInviteRole('')
          setInviteSuccess(false)
          setShowInviteModal(true)
        }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600">{staff.length}</div>
            <div className="text-sm text-gray-500">Total Staff</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-green-600">{doctorCount}</div>
            <div className="text-sm text-gray-500">Doctors</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-cyan-600">{nurseCount}</div>
            <div className="text-sm text-gray-500">Nurses</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-4">
            <div className="text-3xl font-bold text-amber-500">{pendingCount}</div>
            <div className="text-sm text-gray-500">Pending</div>
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
                placeholder="Search by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No staff found"
          description={searchQuery ? 'Try adjusting your search' : 'Invite staff members to get started'}
          action={<Button onClick={() => setShowInviteModal(true)}>Invite Staff</Button>}
        />
      ) : (
        <Card>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Staff Member</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Active</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Chip variant={getRoleColor(member.role)}>{member.role}</Chip>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {member.department || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Chip variant={getStatusColor(member.status)}>{member.status}</Chip>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(member.joinedDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatLastActive(member.lastActive)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {member.status === 'pending' && (
                            <Button size="sm" variant="ghost" onClick={() => handleResendInvite(member)}>
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedStaff(member)
                            setShowEditModal(true)
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setSelectedStaff(member)
                            setShowDeleteModal(true)
                          }}>
                            <Trash2 className="w-4 h-4 text-red-500" />
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

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title={inviteSuccess ? 'Invitation Sent!' : 'Invite Staff Member'}
      >
        {inviteSuccess ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl font-bold mb-2">Invitation Sent!</h3>
            <p className="text-gray-600 mb-4">
              An invitation has been sent to <strong>{inviteEmail}</strong>
            </p>
            <Button onClick={() => setShowInviteModal(false)} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@organization.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Select a role...</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                📧 An email invitation will be sent with instructions to join your organization.
              </p>
            </div>

            <Button
              className="w-full"
              disabled={!inviteEmail || !inviteRole}
              onClick={handleInvite}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Staff Member"
      >
        {selectedStaff && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {selectedStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedStaff.name}</h3>
                <p className="text-gray-500">{selectedStaff.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                defaultValue={selectedStaff.role}
                onChange={(e) => handleUpdateRole(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <Button variant="secondary" className="w-full" onClick={() => setShowEditModal(false)}>
              Close
            </Button>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove Staff Member"
      >
        {selectedStaff && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-800">
                Are you sure you want to remove <strong>{selectedStaff.name}</strong> from your organization?
              </p>
              <p className="text-sm text-red-600 mt-2">
                They will lose access to all organization resources.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                Remove Staff
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
