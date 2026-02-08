/**
 * MediConnect Pro - API Client
 * 
 * Single source of truth for all API endpoints and field mappings.
 * Maps between backend (Lambda/PostgreSQL) field names and frontend field names.
 * 
 * Backend returns: doctorId, doctorName, appointmentDate, etc.
 * Frontend uses:   id, providerName, dateTime, etc.
 * 
 * This file handles the translation so pages never deal with field mismatches.
 */

import { apiCall, providerApiCall } from './auth-context'

// ============================================================
// TYPES - Frontend interfaces (what pages use)
// ============================================================

export interface Doctor {
  id: string
  name: string
  specialty: string
  organization: string
  location: string
  rating: number
  reviewCount: number
  availability: string
  acceptingNew: boolean
  image: string
  bio: string
  languages: string[]
  education: string
  nextAvailable: string
  available: boolean
  consultationFee: string
}

export interface Appointment {
  id: string
  providerName: string
  specialty: string
  dateTime: string
  type: 'in-person' | 'video'
  status: 'confirmed' | 'pending' | 'completed' | 'scheduled' | 'cancelled'
  location: string
  reason: string
  meetingLink: string
  paymentStatus: string
  paymentAmount: string
  organization?: string
  notes?: string
}

export interface MedicalRecord {
  id: string
  type: string
  title: string
  provider: string
  date: string
  status: string
  organization?: string
  category?: string
  value?: string
  unit?: string
  referenceRange?: string
  interpretation?: string
  details?: string
  attachments?: { name: string; type: string }[]
}

export interface Message {
  id: string
  appointmentId: string
  senderType: string
  content: string
  timestamp: string
  read: boolean
}

// ============================================================
// MAPPERS - Convert API response → Frontend format
// ============================================================

function mapDoctor(d: any): Doctor {
  return {
    id: d.doctorId || d.doctor_id || d.id || '',
    name: d.name || ('Dr. ' + (d.first_name || '') + ' ' + (d.last_name || '')).trim(),
    specialty: d.specialty || '',
    organization: d.organization || '',
    location: d.location || '',
    rating: parseFloat(d.rating) || 0,
    reviewCount: d.reviews || d.reviewCount || d.review_count || 0,
    availability: d.availability || 'Available',
    acceptingNew: d.acceptingNew !== false && d.accepting_new !== false,
    image: d.profile_image || d.image || '',
    bio: d.bio || '',
    languages: typeof d.languages === 'string'
      ? d.languages.split(',').map((l: string) => l.trim())
      : (d.languages || []),
    education: d.education || '',
    nextAvailable: d.nextAvailable || d.next_available || '',
    available: d.is_active !== false,
    consultationFee: d.consultationFee || d.consultation_fee || '0',
  }
}

function mapAppointment(a: any): Appointment {
  const dateStr = a.appointmentDate || a.appointment_date || ''
  const timeStr = a.appointmentTime || a.appointment_time || '00:00:00'
  const dateOnly = typeof dateStr === 'string'
    ? dateStr.split('T')[0]
    : dateStr instanceof Date
      ? dateStr.toISOString().split('T')[0]
      : String(dateStr).split('T')[0]

  const consultType = a.consultationType || a.consultation_type || 'in-person'

  return {
    id: a.appointmentId || a.appointment_id || a.id || '',
    providerName: a.doctorName || a.doctor_name || a.providerName || 'Unknown Provider',
    specialty: a.doctorSpecialty || a.doctor_specialty || a.specialty || '',
    dateTime: dateOnly ? `${dateOnly}T${timeStr}` : '',
    type: (consultType === 'telehealth' || consultType === 'video') ? 'video' : 'in-person',
    status: (a.status || 'pending') as Appointment['status'],
    location: a.location || '',
    reason: a.reason || a.reason_for_visit || '',
    meetingLink: a.meetingLink || a.meeting_link || '',
    paymentStatus: a.paymentStatus || a.payment_status || '',
    paymentAmount: a.paymentAmount || a.payment_amount || '',
  }
}

function mapRecord(r: any): MedicalRecord {
  return {
    id: r.record_id || r.id || '',
    type: r.record_type || r.type || 'Document',
    title: r.title || r.record_type || 'Untitled',
    provider: r.provider_name || r.provider || 'Unknown',
    date: r.record_date || r.date || '',
    status: r.status || 'final',
  }
}

function mapMessage(m: any): Message {
  return {
    id: m.message_id || m.id || '',
    appointmentId: m.appointment_id || m.appointmentId || '',
    senderType: m.sender_type || m.senderType || '',
    content: m.content || m.message || '',
    timestamp: m.created_at || m.timestamp || '',
    read: m.is_read || m.read || false,
  }
}

// ============================================================
// API FUNCTIONS - What pages import and call
// ============================================================

/** Fetch all doctors */
export async function getDoctors(): Promise<Doctor[]> {
  const data = await apiCall('/doctors')
  return (data?.doctors || []).map(mapDoctor)
}

/** Fetch appointments for a patient */
export async function getAppointments(patientId: string): Promise<{
  appointments: Appointment[]
  categorized: { upcoming: Appointment[]; past: Appointment[]; cancelled: Appointment[] }
}> {
  const data = await apiCall(`/appointments/${patientId}`)
  const appointments = (data?.appointments || []).map(mapAppointment)
  const categorized = data?.categorized || { upcoming: [], past: [], cancelled: [] }
  return {
    appointments,
    categorized: {
      upcoming: (categorized.upcoming || []).map(mapAppointment),
      past: (categorized.past || []).map(mapAppointment),
      cancelled: (categorized.cancelled || []).map(mapAppointment),
    },
  }
}

/** Book a new appointment */
export async function bookAppointment(params: {
  patientId: string
  doctorId: string
  date: string
  time: string
  type: 'in-person' | 'video'
  reason?: string
  patientEmail?: string
  patientName?: string
}): Promise<{ success: boolean; appointment?: Appointment; message?: string }> {
  const data = await apiCall('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      patientId: params.patientId,
      doctorId: params.doctorId,
      appointmentDate: params.date,
      appointmentTime: params.time,
      consultationType: params.type === 'video' ? 'telehealth' : params.type,
      reason: params.reason,
      patientEmail: params.patientEmail,
      patientName: params.patientName,
    }),
  })
  return {
    success: data?.success || false,
    appointment: data?.appointment ? mapAppointment(data.appointment) : undefined,
    message: data?.message,
  }
}

/** Cancel an appointment */
export async function cancelAppointment(appointmentId: string): Promise<{ success: boolean }> {
  const data = await apiCall(`/appointments/update/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify({ action: 'cancel' }),
  })
  return { success: data?.success || false }
}

/** Reschedule an appointment */
export async function rescheduleAppointment(
  appointmentId: string,
  date: string,
  time: string
): Promise<{ success: boolean }> {
  const data = await apiCall(`/appointments/update/${appointmentId}`, {
    method: 'PUT',
    body: JSON.stringify({
      action: 'reschedule',
      appointmentDate: date,
      appointmentTime: time,
    }),
  })
  return { success: data?.success || false }
}

/** Fetch medical records for a patient */
export async function getMedicalRecords(patientId: string): Promise<MedicalRecord[]> {
  const data = await apiCall(`/medical-records/${patientId}`)
  return (data?.records || []).map(mapRecord)
}

/** Fetch messages */
export async function getMessages(patientId: string): Promise<Message[]> {
  const data = await apiCall(`/messages/${patientId}`)
  return (data?.messages || []).map(mapMessage)
}

/** Send a message */
export async function sendMessage(params: {
  appointmentId: string
  content: string
  senderType: string
}): Promise<{ success: boolean }> {
  const data = await apiCall('/messages', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: params.appointmentId,
      message: params.content,
      senderType: params.senderType,
    }),
  })
  return { success: data?.success || false }
}

/** Fetch consents */
export async function getConsents(): Promise<any[]> {
  const data = await apiCall('/consents')
  return data?.consents || []
}
