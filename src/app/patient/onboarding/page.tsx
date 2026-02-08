'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { registerPatient } from '@/lib/api'
import { Button, Card, CardBody } from '@/components/ui'
import { useRouter } from 'next/navigation'

export default function PatientOnboarding() {
  const { user, isAuthenticated, signInWithGoogle } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: user?.email || '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-2xl font-bold mb-2">Welcome to MediConnect</h1>
        <p className="text-gray-500 mb-6">Sign in to get started</p>
        <Button onClick={signInWithGoogle}>Sign in with Google</Button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await registerPatient({
        patientId: user?.sub || '',
        email: user?.email || formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: '',
      })
      router.push('/patient')
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏥</div>
        <h1 className="text-2xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-gray-500">We need a few details to set up your patient account</p>
      </div>

      <Card>
        <CardBody className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || formData.email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400 mt-1">From your Google account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  formData.gender === 'male'
                    ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)] text-[#0A6E6E]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  formData.gender === 'female'
                    ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)] text-[#0A6E6E]'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender}
            className="w-full"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Your information is protected under HIPAA guidelines
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
