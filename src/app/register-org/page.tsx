'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Input, Card, CardBody, Alert } from '@/components/ui'
import { orgTypeLabels } from '@/lib/utils'

const orgTypes = [
  { value: 'hospital', icon: '🏥', label: 'Hospital' },
  { value: 'lab', icon: '🔬', label: 'Laboratory' },
  { value: 'urgent_care', icon: '🚑', label: 'Urgent Care' },
  { value: 'doctor_office', icon: '👨‍⚕️', label: 'Doctor Office' },
  { value: 'nursing_home', icon: '🏠', label: 'Nursing Home' },
  { value: 'pharmacy', icon: '💊', label: 'Pharmacy' },
]

export default function RegisterOrgPage() {
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
    router.push('/')
    return null
  }

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type })
    setStep(2)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const result = await apiCall('/organizations', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          adminEmail: user?.email,
        }),
      })

      // Success - redirect to org admin dashboard
      router.push('/org-admin?registered=true')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-0">
      <Card className="max-w-xl w-full">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-display font-bold text-2xl text-primary-deep">
              MediConnect <span className="text-primary-glow">Pro</span>
            </span>
          </div>

          <h1 className="text-2xl font-display font-bold text-center mb-2">
            Register Your Organization
          </h1>
          <p className="text-text-2 text-center mb-6">
            Join the health information exchange network
          </p>

          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s < step ? 'bg-status-ok' : s === step ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Step 1: Select Type */}
          {step === 1 && (
            <div>
              <h2 className="font-semibold mb-4">What type of organization?</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orgTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleTypeSelect(type.value)}
                    className={`p-4 rounded-lg border-2 text-center transition-all hover:border-primary hover:bg-primary-light ${
                      formData.type === type.value ? 'border-primary bg-primary-light' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{type.icon}</span>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="w-full mt-6"
                onClick={() => router.push('/')}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Step 2: Organization Details */}
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
              
              <Input
                label="Phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>
                  Back
                </Button>
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

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <span className="text-5xl">✅</span>
                <h2 className="font-semibold text-xl mt-4">Ready to Register!</h2>
                <p className="text-text-3">Review your organization details</p>
              </div>

              <div className="bg-surface-2 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between">
                  <span className="text-text-3">Type:</span>
                  <strong>{orgTypeLabels[formData.type]}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Name:</span>
                  <strong>{formData.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">NPI:</span>
                  <strong>{formData.npi}</strong>
                </div>
                {formData.address && (
                  <div className="flex justify-between">
                    <span className="text-text-3">Address:</span>
                    <span>{formData.address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-3">Admin:</span>
                  <strong>{user?.email}</strong>
                </div>
              </div>

              <Alert variant="success" className="mb-6">
                <strong>🎉 You'll become the Organization Owner</strong>
                <p className="text-sm mt-1">You can add staff, configure SSO, and manage your organization.</p>
              </Alert>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                >
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
