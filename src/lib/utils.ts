import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const orgTypeLabels: Record<string, string> = {
  hospital: '🏥 Hospital',
  lab: '🔬 Laboratory',
  urgent_care: '🚑 Urgent Care',
  doctor_office: '👨‍⚕️ Doctor Office',
  nursing_home: '🏠 Nursing Home',
  pharmacy: '💊 Pharmacy',
}

export const roleColors: Record<string, string> = {
  owner: '#7C3AED',
  admin: '#2563EB',
  doctor: '#0A6E6E',
  nurse: '#0891B2',
  staff: '#D97706',
}

export const roleLabels: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  doctor: 'Doctor',
  nurse: 'Nurse',
  staff: 'Staff',
}
