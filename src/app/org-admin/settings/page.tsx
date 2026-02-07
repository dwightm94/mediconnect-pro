'use client'

import { useState } from 'react'
import { Button, Card, CardHeader, CardBody, Chip, Modal, Alert } from '@/components/ui'
import { Building2, Mail, Phone, MapPin, Globe, Shield, Bell, Trash2, Save } from 'lucide-react'

export default function OrgSettingsPage() {
  // Organization Info
  const [orgName, setOrgName] = useState('City Medical Center')
  const [orgType, setOrgType] = useState('hospital')
  const [npi, setNpi] = useState('1234567890')
  const [address, setAddress] = useState('123 Medical Center Dr')
  const [cityStateZip, setCityStateZip] = useState('New York, NY 10001')
  const [phone, setPhone] = useState('(555) 123-4567')
  const [email, setEmail] = useState('contact@citymedical.com')
  const [website, setWebsite] = useState('https://citymedical.com')

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [sharingAlerts, setSharingAlerts] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [weeklyReports, setWeeklyReports] = useState(false)

  // Data Retention
  const [retentionPeriod, setRetentionPeriod] = useState('7')

  // Modals
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const orgTypes = [
    { value: 'hospital', label: '🏥 Hospital' },
    { value: 'lab', label: '🔬 Laboratory' },
    { value: 'urgent_care', label: '🚑 Urgent Care' },
    { value: 'doctor_office', label: '👨‍⚕️ Doctor Office' },
    { value: 'nursing_home', label: '🏠 Nursing Home' },
    { value: 'pharmacy', label: '💊 Pharmacy' },
  ]

  const handleSave = () => {
    // In real app, this would call the API
    setShowSaveSuccess(true)
    setTimeout(() => setShowSaveSuccess(false), 3000)
  }

  const handleDeleteOrg = () => {
    if (deleteConfirmText === orgName) {
      // In real app, this would delete the organization
      alert('Organization deleted. Redirecting...')
      setShowDeleteModal(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Organization Settings</h1>
          <p className="text-gray-500">Manage your organization's profile and preferences</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Success Alert */}
      {showSaveSuccess && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span>Settings saved successfully!</span>
          </div>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Organization Information</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Type
              </label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                {orgTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NPI Number
              </label>
              <input
                type="text"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                maxLength={10}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">10-digit National Provider Identifier</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors mb-2"
              />
              <input
                type="text"
                value={cityStateZip}
                onChange={(e) => setCityStateZip(e.target.value)}
                placeholder="City, State ZIP"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </CardBody>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Contact Information</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Website
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-3">Organization ID</h4>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm font-mono">
                  org_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                </code>
                <Button variant="secondary" size="sm">Copy</Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use this ID when configuring integrations
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Notification Settings</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive important updates via email</div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">Data Sharing Alerts</div>
                <div className="text-sm text-gray-500">Get notified of new sharing requests</div>
              </div>
              <input
                type="checkbox"
                checked={sharingAlerts}
                onChange={(e) => setSharingAlerts(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">Security Alerts</div>
                <div className="text-sm text-gray-500">Failed logins and suspicious activity</div>
              </div>
              <input
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <div>
                <div className="font-medium">Weekly Summary Reports</div>
                <div className="text-sm text-gray-500">Receive weekly activity summaries</div>
              </div>
              <input
                type="checkbox"
                checked={weeklyReports}
                onChange={(e) => setWeeklyReports(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          </CardBody>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-lg">Data & Privacy</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention Period
              </label>
              <select
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="6">6 years (HIPAA minimum)</option>
                <option value="7">7 years</option>
                <option value="10">10 years</option>
                <option value="permanent">Permanent</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                HIPAA requires a minimum of 6 years for medical records
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">HIPAA Compliance</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your organization is configured to meet HIPAA compliance requirements. 
                    All data is encrypted at rest and in transit.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xl">🔒</span>
                  <span className="font-medium text-green-800">BAA Status</span>
                </div>
                <Chip variant="ok">Active</Chip>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Business Associate Agreement signed on January 15, 2025
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader className="border-b border-red-100">
          <div className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            <h3 className="font-bold text-lg">Danger Zone</h3>
          </div>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div>
              <h4 className="font-medium text-red-800">Delete Organization</h4>
              <p className="text-sm text-red-600">
                Permanently delete your organization and all associated data. This action cannot be undone.
              </p>
            </div>
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Organization
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteConfirmText('')
        }}
        title="Delete Organization"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-red-800 font-medium">
              This action is permanent and cannot be undone!
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-gray-600">This will permanently delete:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>All organization settings and configurations</li>
              <li>All staff accounts and access permissions</li>
              <li>All patient data and medical records</li>
              <li>All audit logs and activity history</li>
              <li>All network connections and sharing agreements</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <strong>{orgName}</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type organization name..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteConfirmText('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirmText !== orgName}
              onClick={handleDeleteOrg}
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
