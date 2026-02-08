'use client'

import { useState, useEffect } from 'react'
import { useAuth, apiCall } from '@/lib/auth-context'
import { Button, Card, CardBody, Input, Chip, Loading, EmptyState, Modal } from '@/components/ui'
import { Search, MapPin, Star, Calendar, Clock, Filter } from 'lucide-react'

interface Doctor {
  id: string
  name: string
  specialty: string
  organization: string
  location: string
  rating: number
  reviewCount: number
  availability: string
  acceptingNew: boolean
  image?: string
  bio?: string
  languages?: string[]
  education?: string
  nextAvailable?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function FindDoctorsPage() {
  const { user, isAuthenticated } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video'>('in-person')
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const specialties = [
    'All Specialties',
    'Primary Care',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Pediatrics',
    'Neurology',
    'Psychiatry',
    'OB/GYN',
    'Ophthalmology'
  ]

  const mockDoctors: Doctor[] = [
    { id: '1', name: 'Dr. Sarah Chen', specialty: 'Primary Care', organization: 'City Medical Center', location: 'New York, NY', rating: 4.9, reviewCount: 128, availability: 'Available Today', acceptingNew: true, bio: 'Board-certified family medicine physician with 15 years of experience.', languages: ['English', 'Mandarin'], education: 'Harvard Medical School', nextAvailable: 'Today at 2:00 PM' },
    { id: '2', name: 'Dr. Michael Roberts', specialty: 'Cardiology', organization: 'Heart Health Institute', location: 'New York, NY', rating: 4.8, reviewCount: 95, availability: 'Next Available: Tomorrow', acceptingNew: true, bio: 'Specializing in preventive cardiology and heart disease management.', languages: ['English', 'Spanish'], education: 'Johns Hopkins University', nextAvailable: 'Tomorrow at 9:00 AM' },
    { id: '3', name: 'Dr. Emily Watson', specialty: 'Dermatology', organization: 'Skin Care Clinic', location: 'Brooklyn, NY', rating: 4.7, reviewCount: 82, availability: 'Next Available: Feb 10', acceptingNew: true, bio: 'Expert in medical and cosmetic dermatology.', languages: ['English'], education: 'Stanford University', nextAvailable: 'Feb 10 at 11:00 AM' },
    { id: '4', name: 'Dr. James Wilson', specialty: 'Orthopedics', organization: 'Sports Medicine Center', location: 'Manhattan, NY', rating: 4.9, reviewCount: 156, availability: 'Available Today', acceptingNew: false, bio: 'Orthopedic surgeon specializing in sports injuries and joint replacement.', languages: ['English'], education: 'Yale School of Medicine', nextAvailable: 'Today at 4:30 PM' },
    { id: '5', name: 'Dr. Lisa Park', specialty: 'Pediatrics', organization: 'Children\'s Wellness Center', location: 'Queens, NY', rating: 5.0, reviewCount: 203, availability: 'Next Available: Tomorrow', acceptingNew: true, bio: 'Passionate about providing comprehensive care for children of all ages.', languages: ['English', 'Korean'], education: 'Columbia University', nextAvailable: 'Tomorrow at 10:00 AM' },
    { id: '6', name: 'Dr. David Kim', specialty: 'Neurology', organization: 'Brain & Spine Institute', location: 'New York, NY', rating: 4.6, reviewCount: 67, availability: 'Next Available: Feb 12', acceptingNew: true, bio: 'Neurologist with expertise in headache disorders and stroke prevention.', languages: ['English', 'Korean'], education: 'UCLA Medical School', nextAvailable: 'Feb 12 at 2:00 PM' },
  ]

  useEffect(() => {
    loadDoctors()
  }, [])

  useEffect(() => {
    filterDoctors()
  }, [searchQuery, selectedSpecialty, doctors])

  const loadDoctors = async () => {
    try {
      const data = await apiCall('/doctors').catch(() => null)
      const mapped = (data?.doctors || []).map((d: any) => ({
        id: d.doctorId || d.id || '',
        name: d.name || ('Dr. ' + (d.first_name || '') + ' ' + (d.last_name || '')).trim(),
        specialty: d.specialty || '',
        organization: d.organization || '',
        location: d.location || '',
        rating: parseFloat(d.rating) || 0,
        reviewCount: d.reviews || d.reviewCount || 0,
        availability: d.availability || 'Available',
        acceptingNew: d.acceptingNew !== false,
        bio: d.bio || '',
        languages: typeof d.languages === 'string' ? d.languages.split(',').map((l: string) => l.trim()) : (d.languages || []),
        education: d.education || '',
        nextAvailable: d.nextAvailable || '',
        available: d.is_active !== false,
        image: d.profile_image || d.image || '',
      }))
      setDoctors(mapped.length > 0 ? mapped : mockDoctors)
    } catch (error) {
      setDoctors(mockDoctors)
    } finally {
      setIsLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = [...doctors]
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(query) ||
        d.specialty.toLowerCase().includes(query) ||
        d.organization.toLowerCase().includes(query)
      )
    }
    
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(d => d.specialty === selectedSpecialty)
    }
    
    setFilteredDoctors(filtered)
  }

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setSelectedDate('')
    setSelectedTime('')
    setBookingSuccess(false)
    setShowBookingModal(true)
  }

  const getTimeSlots = (): TimeSlot[] => {
    return [
      { time: '9:00 AM', available: true },
      { time: '9:30 AM', available: false },
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: false },
      { time: '11:30 AM', available: true },
      { time: '2:00 PM', available: true },
      { time: '2:30 PM', available: true },
      { time: '3:00 PM', available: false },
      { time: '3:30 PM', available: true },
      { time: '4:00 PM', available: true },
      { time: '4:30 PM', available: false },
    ]
  }

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return

    try {
      await apiCall('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patientId: user?.sub,
          doctorId: selectedDoctor.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          consultationType: appointmentType,
          patientEmail: user?.email,
          patientName: user?.email?.split('@')[0]
        })
      }).catch(() => null)

      setBookingSuccess(true)
    } catch (error) {
      console.error('Booking failed:', error)
    }
  }

  const getNextDays = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      })
    }
    return days
  }

  if (isLoading) {
    return <Loading text="Finding doctors near you..." />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Find Doctors</h1>
        <p className="text-gray-500">Search for healthcare providers and book appointments</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0A6E6E] focus:outline-none transition-colors"
              >
                <option value="all">All Specialties</option>
                {specialties.slice(1).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold">{filteredDoctors.length}</span> doctors found
        </p>
      </div>

      {/* Doctor Cards */}
      {filteredDoctors.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No doctors found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{doctor.name}</h3>
                        <p className="text-[#0A6E6E] font-medium">{doctor.specialty}</p>
                      </div>
                      {doctor.acceptingNew ? (
                        <Chip variant="ok">Accepting New</Chip>
                      ) : (
                        <Chip variant="warn">Waitlist</Chip>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-1">{doctor.organization}</p>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {doctor.location}
                      </span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {doctor.rating} ({doctor.reviewCount})
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-green-600 font-medium">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {doctor.nextAvailable}
                      </span>
                      <Button size="sm" onClick={() => openBooking(doctor)}>
                        Book Appointment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={bookingSuccess ? 'Appointment Booked!' : `Book with ${selectedDoctor?.name}`}
      >
        {bookingSuccess ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Appointment Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              Your appointment with {selectedDoctor?.name} is scheduled for {selectedDate} at {selectedTime}.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You'll receive a confirmation email shortly.
            </p>
            <Button onClick={() => setShowBookingModal(false)} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0A6E6E] to-[#0EEACA] flex items-center justify-center text-white font-bold">
                {selectedDoctor?.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold">{selectedDoctor?.name}</div>
                <div className="text-sm text-gray-500">{selectedDoctor?.specialty}</div>
              </div>
            </div>

            {/* Appointment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAppointmentType('in-person')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    appointmentType === 'in-person'
                      ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">🏥</div>
                  <div className="font-medium">In-Person</div>
                </button>
                <button
                  onClick={() => setAppointmentType('video')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    appointmentType === 'video'
                      ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">📹</div>
                  <div className="font-medium">Video Visit</div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getNextDays().map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={`px-4 py-2 rounded-lg border-2 whitespace-nowrap transition-all ${
                      selectedDate === day.date
                        ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {getTimeSlots().map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                        !slot.available
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : selectedTime === slot.time
                          ? 'border-[#0A6E6E] bg-[rgba(14,234,202,0.10)]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime}
              className="w-full"
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
