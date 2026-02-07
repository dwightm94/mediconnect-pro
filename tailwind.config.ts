import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A6E6E',
          deep: '#054848',
          glow: '#0EEACA',
          light: 'rgba(14,234,202,0.10)',
        },
        surface: {
          0: '#F5F7FA',
          1: '#FFFFFF',
          2: '#EEF1F6',
          3: '#DEE3EB',
        },
        text: {
          1: '#0F1A2A',
          2: '#4A5568',
          3: '#94A3B8',
        },
        role: {
          hospital: '#2563EB',
          lab: '#7C3AED',
          urgent: '#DC2626',
          doctor: '#0A6E6E',
          nursing: '#D97706',
          pharmacy: '#0891B2',
        },
        status: {
          ok: '#059669',
          bad: '#DC2626',
          warn: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
        lg: '22px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(15,26,42,.05)',
        DEFAULT: '0 4px 20px rgba(15,26,42,.07)',
        lg: '0 16px 48px rgba(15,26,42,.10)',
      },
    },
  },
  plugins: [],
}
export default config
