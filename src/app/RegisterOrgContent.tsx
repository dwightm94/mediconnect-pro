'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Input, Card, CardBody, Alert } from '@/components/ui'

const orgTypeLabels: Record<string, string> = {
  hospital: '🏥 Hospital',
  lab: '🔬 Laboratory',
  urgent_care: '🚑 Urgent Care',
  doctor_office: '👨‍⚕️ Doctor Office',
  nursing_home: '🏠 Nursing Home',
  pharmacy: '💊 Pharmacy',
}

const orgTypes = [
  { value: 'hospital', icon: '🏥', label: 'Hospital' },
  { value: 'lab', icon: '🔬', label: 'Laboratory' },
  { value: 'urgent_care', icon: '🚑', label: 'Urgent Care' },
  { value: 'doctor_office', icon: '👨‍⚕️', label: 'Doctor Office' },
  { value: 'nursing_home', icon: '🏠', label: 'Nursing Home' },
  { value: 'pharmacy', icon: '💊', label: 'Pharmacy' },
]

export default function RegisterOrgContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    npi: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F7FA]">
        <Card className="max-w-md w-full">
          <CardBody className="p-8 text-center">
            <p className="text-gray-500">Please sign in first</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type })
    setStep(2)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      await apiCall('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          adminEmail: user?.email,
        }),
      })
      router.push('/org-admin?registered=true')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F7FA]">
      <Card className="max-w-xl w-full">
        <CardBody className="p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-bold text-2xl text-[#054848]">
              MediConnect <span className="text-[#0EEACA]">Pro</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Register Your Organization</h1>
          <p className="text-gray-500 text-center mb-6">Join the health information exchange</p>

          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s < step ? 'bg-green-500' : s === step ? 'bg-[#0A6E6E]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && <Alert variant="error" className="mb-6">{error}</Alert>}

          {step === 1 && (
            <div>
              <h2 className="font-semibold mb-4">What type of organization?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orgTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all hover:border-[#0A6E6E] ${
                      formData.type === type.value ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-6" onClick={() => router.push('/')}>
                Cancel
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold mb-4">Organization Details</h2>
              
              <Input
                label="Organization Name *"
                placeholder="e.g., City General Hospital"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              
              <Input
                label="NPI Number (10 digits) *"
                placeholder="1234567890"
                maxLength={10}
                value={formData.npi}
                onChange={(e) => setFormData({ ...formData, npi: e.target.value.replace(/\D/g, '') })}
                required
              />
              
              <Input
                label="Address"
                placeholder="123 Medical Center Dr"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  placeholder="New York"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <Input
                  label="State"
                  placeholder="NY"
                  maxLength={2}
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                />
                <Input
                  label="ZIP"
                  placeholder="10001"
                  maxLength={5}
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button
                  className="flex-1"
                  disabled={!formData.name || formData.npi.length !== 10}
                  onClick={() => setStep(3)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <span className="text-5xl">✅</span>
                <h2 className="font-semibold text-xl mt-4">Ready to Register!</h2>
              </div>

              <div className="bg-gray-100 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <strong>{orgTypeLabels[formData.type]}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Name:</span>
                  <strong>{formData.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">NPI:</span>
                  <strong>{formData.npi}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Admin:</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>

              <Alert variant="success" className="mb-6">
                <strong>🎉 You will become the Organization Owner</strong>
              </Alert>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit} isLoading={isSubmitting}>
                  🚀 Complete Registration
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
