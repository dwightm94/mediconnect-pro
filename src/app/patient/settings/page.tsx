'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { checkPatient, updatePatient } from '@/lib/api'
import { Button, Card, CardHeader, CardBody, Loading } from '@/components/ui'
import { User, Shield, Heart, Save, Check } from 'lucide-react'

interface PatientProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  preferredLanguage: string
  preferredPharmacy: string
  insuranceProvider: string
  insuranceId: string
  allergies: string
  primaryCareProvider: string
}

export default function SettingsPage() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [profile, setProfile] = useState<PatientProfile>({
    firstName: '', lastName: '', email: '', phone: '',
    dateOfBirth: '', gender: '', address: '',
    emergencyContactName: '', emergencyContactPhone: '',
    preferredLanguage: 'English', preferredPharmacy: '',
    insuranceProvider: '', insuranceId: '',
    allergies: '', primaryCareProvider: ''
  })

  useEffect(() => {
    if (isAuthenticated) loadProfile()
    else setIsLoading(false)
  }, [isAuthenticated])

  const loadProfile = async () => {
    try {
      const result = await checkPatient(user?.sub || '').catch(() => ({ exists: false, patient: null }))
      if (result.exists && result.patient) {
        const p = result.patient
        setProfile({
          firstName: p.first_name || '',
          lastName: p.last_name || '',
          email: p.email || user?.email || '',
          phone: p.phone || '',
          dateOfBirth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
          gender: p.gender || '',
          address: p.address || '',
          emergencyContactName: p.emergency_contact_name || '',
          emergencyContactPhone: p.emergency_contact_phone || '',
          preferredLanguage: p.preferred_language || 'English',
          preferredPharmacy: p.preferred_pharmacy || '',
          insuranceProvider: p.insurance_provider || '',
          insuranceId: p.insurance_id || '',
          allergies: p.allergies || '',
          primaryCareProvider: p.primary_care_provider || ''
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await updatePatient(user?.sub || '', profile)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (field: keyof PatientProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">⚙️</div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500 mb-6">Sign in to manage your settings</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    )
  }

  if (isLoading) return <Loading />

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'healthcare', label: 'Healthcare', icon: Heart },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ]

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-[#0A6E6E] text-[#0A6E6E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>Personal Information</CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={profile.firstName} onChange={e => updateField('firstName', e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={profile.lastName} onChange={e => updateField('lastName', e.target.value)} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={profile.email} disabled className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-500" />
                  <p className="text-xs text-gray-400 mt-1">Managed by Google</p>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="tel" value={profile.phone} onChange={e => updateField('phone', e.target.value)} placeholder="(555) 123-4567" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" value={profile.dateOfBirth} onChange={e => updateField('dateOfBirth', e.target.value)} max={new Date().toISOString().split('T')[0]} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => updateField('gender', 'male')} className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${profile.gender === 'male' ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)] text-[#0A6E6E]' : 'border-gray-200 hover:border-gray-300'}`}>Male</button>
                    <button onClick={() => updateField('gender', 'female')} className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${profile.gender === 'female' ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)] text-[#0A6E6E]' : 'border-gray-200 hover:border-gray-300'}`}>Female</button>
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" value={profile.address} onChange={e => updateField('address', e.target.value)} placeholder="123 Main St, City, State ZIP" className={inputClass} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Emergency Contact</CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input type="text" value={profile.emergencyContactName} onChange={e => updateField('emergencyContactName', e.target.value)} placeholder="Jane Doe" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input type="tel" value={profile.emergencyContactPhone} onChange={e => updateField('emergencyContactPhone', e.target.value)} placeholder="(555) 987-6543" className={inputClass} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Preferences</CardHeader>
            <CardBody>
              <div>
                <label className={labelClass}>Preferred Language</label>
                <select value={profile.preferredLanguage} onChange={e => updateField('preferredLanguage', e.target.value)} className={inputClass}>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Mandarin">Mandarin</option>
                  <option value="Korean">Korean</option>
                  <option value="Arabic">Arabic</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Portuguese">Portuguese</option>
                </select>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'healthcare' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>Insurance Information</CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Insurance Provider</label>
                  <input type="text" value={profile.insuranceProvider} onChange={e => updateField('insuranceProvider', e.target.value)} placeholder="Blue Cross Blue Shield" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Insurance ID / Member Number</label>
                  <input type="text" value={profile.insuranceId} onChange={e => updateField('insuranceId', e.target.value)} placeholder="ABC123456789" className={inputClass} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Medical Preferences</CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className={labelClass}>Primary Care Provider</label>
                <input type="text" value={profile.primaryCareProvider} onChange={e => updateField('primaryCareProvider', e.target.value)} placeholder="Dr. Sarah Chen" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Preferred Pharmacy</label>
                <input type="text" value={profile.preferredPharmacy} onChange={e => updateField('preferredPharmacy', e.target.value)} placeholder="CVS Pharmacy - 123 Main St" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Known Allergies</label>
                <textarea value={profile.allergies} onChange={e => updateField('allergies', e.target.value)} placeholder="List any known allergies (medications, foods, environmental)..." rows={3} className={inputClass + " resize-none"} />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>Account Security</CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">Google Sign-In</div>
                  <div className="text-sm text-gray-500">Your account is secured through Google OAuth</div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Managed through your Google account settings</div>
                </div>
                <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-[#0A6E6E] text-sm font-medium hover:underline">Manage</a>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>Your Data</CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium">Download My Data</div>
                  <div className="text-sm text-gray-500">Get a copy of all your health records and account data</div>
                </div>
                <Button variant="secondary" className="text-sm">Request Download</Button>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <div>
                  <div className="font-medium text-red-700">Delete My Account</div>
                  <div className="text-sm text-red-500">Permanently remove your account and all associated data</div>
                </div>
                <Button variant="secondary" className="text-sm text-red-600 border-red-200 hover:bg-red-50">Delete Account</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>HIPAA Notice</CardHeader>
            <CardBody>
              <p className="text-sm text-gray-600 leading-relaxed">
                MediConnect Pro is committed to protecting your health information in accordance with the Health Insurance
                Portability and Accountability Act (HIPAA). Your medical records, personal information, and communications
                are encrypted and stored securely. We never share your data with third parties without your explicit consent.
              </p>
            </CardBody>
          </Card>
        </div>
      )}

      {activeTab !== 'privacy' && (
        <div className="sticky bottom-6 flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 shadow-lg">
            {saveSuccess ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : isSaving ? (
              'Saving...'
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
