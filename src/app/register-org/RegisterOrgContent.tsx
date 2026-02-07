'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button, Card, CardBody } from '@/components/ui'

interface OrgFormData {
  orgName: string
  orgType: string
  npi: string
  address: string
  city: string
  state: string
  zip: string
  adminName: string
  adminEmail: string
  adminPhone: string
}

export default function RegisterOrgContent() {
  const router = useRouter()
  const { isAuthenticated, signInWithGoogle } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<OrgFormData>({
    orgName: '',
    orgType: '',
    npi: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
  })

  const orgTypes = [
    { value: 'hospital', label: '🏥 Hospital', desc: 'Full-service medical facility' },
    { value: 'lab', label: '🔬 Laboratory', desc: 'Diagnostic and testing services' },
    { value: 'urgent_care', label: '🚑 Urgent Care', desc: 'Walk-in medical care' },
    { value: 'doctor_office', label: '👨‍⚕️ Doctor Office', desc: 'Private practice or clinic' },
    { value: 'nursing_home', label: '🏠 Nursing Home', desc: 'Long-term care facility' },
    { value: 'pharmacy', label: '💊 Pharmacy', desc: 'Medication dispensing' },
  ]

  const updateField = (field: keyof OrgFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      router.push('/org-admin')
    } catch (error) {
      console.error('Registration failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep1 = formData.orgName && formData.orgType
  const canProceedStep2 = formData.npi && formData.address && formData.city && formData.state && formData.zip
  const canSubmit = formData.adminName && formData.adminEmail

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#054848] to-[#0A6E6E] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="text-2xl font-bold text-white">
              MediConnect<span className="text-[#0EEACA]">Pro</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Organization</h1>
          <p className="text-white/80">Join the healthcare network in minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-[#0EEACA] text-[#054848]' : 'bg-white/20 text-white/60'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 mx-1 rounded ${step > s ? 'bg-[#0EEACA]' : 'bg-white/20'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-2xl">
          <CardBody className="p-8">
            {/* Step 1: Organization Type */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold mb-1">Organization Details</h2>
                  <p className="text-gray-500">Tell us about your healthcare organization</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    value={formData.orgName}
                    onChange={(e) => updateField('orgName', e.target.value)}
                    placeholder="e.g., City General Hospital"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Organization Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {orgTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => updateField('orgType', type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.orgType === type.value
                            ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                        <div className="font-medium text-sm">{type.label.split(' ').slice(1).join(' ')}</div>
                        <div className="text-xs text-gray-500">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  disabled={!canProceedStep1}
                  onClick={() => setStep(2)}
                >
                  Continue →
                </Button>
              </div>
            )}

            {/* Step 2: Organization Info */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold mb-1">Organization Information</h2>
                  <p className="text-gray-500">Provide your organization's details</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NPI Number *
                  </label>
                  <input
                    type="text"
                    value={formData.npi}
                    onChange={(e) => updateField('npi', e.target.value)}
                    placeholder="10-digit NPI"
                    maxLength={10}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">National Provider Identifier</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Medical Center Dr"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="New York"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="NY"
                      maxLength={2}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP *</label>
                    <input
                      type="text"
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      placeholder="10001"
                      maxLength={5}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button className="flex-1" disabled={!canProceedStep2} onClick={() => setStep(3)}>
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Admin Account */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-xl font-bold mb-1">Administrator Account</h2>
                  <p className="text-gray-500">Set up the primary admin for your organization</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => updateField('adminName', e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => updateField('adminEmail', e.target.value)}
                    placeholder="admin@yourorg.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.adminPhone}
                    onChange={(e) => updateField('adminPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
                  />
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    📧 A verification email will be sent to confirm your organization registration.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                  <Button className="flex-1" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                    {isSubmitting ? '⏳ Submitting...' : '🚀 Complete Registration'}
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          Already registered? <a href="/org-admin" className="text-[#0EEACA] hover:underline">Sign in here</a>
        </p>
      </div>
    </div>
  )
}
