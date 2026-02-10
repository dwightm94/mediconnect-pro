'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  Link2, Unlink, RefreshCw, Shield, CheckCircle2, AlertCircle, Clock, Plus,
  Activity, Pill, FileText, Syringe, Heart, ExternalLink, Info, Search,
  Building2, MapPin, ChevronLeft, X, Loader2
} from 'lucide-react'

// ─── Epic Production Config ──────────────────────────────────────────────────
const EPIC_PROD_CLIENT_ID = 'f09904cf-3580-4e62-809e-2e748e3ea345'
const EPIC_SCOPES = 'launch/patient patient/Patient.read patient/Observation.read patient/Condition.read patient/AllergyIntolerance.read patient/MedicationRequest.read patient/Immunization.read patient/Encounter.read openid fhirUser'

// ─── Epic Production Endpoints (curated from open.epic.com/MyApps/Endpoints) ─
// In production: download weekly from User-access Brands Bundle and re-host
const EPIC_ORGS = [
  { id: 'epic-1', name: 'Mayo Clinic', state: 'MN', city: 'Rochester', fhirBaseUrl: 'https://epicproxy.et0502.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['mayo'] },
  { id: 'epic-2', name: 'Cleveland Clinic', state: 'OH', city: 'Cleveland', fhirBaseUrl: 'https://epicproxy.et0961.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['cleveland clinic', 'ccf'] },
  { id: 'epic-3', name: 'Johns Hopkins Medicine', state: 'MD', city: 'Baltimore', fhirBaseUrl: 'https://epicproxy.et0945.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['johns hopkins', 'hopkins'] },
  { id: 'epic-4', name: 'Duke Health', state: 'NC', city: 'Durham', fhirBaseUrl: 'https://health-apis.duke.edu/FHIR/patient/R4', aliases: ['duke'] },
  { id: 'epic-5', name: 'NYU Langone Health', state: 'NY', city: 'New York', fhirBaseUrl: 'https://epicproxy.et1089.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['nyu', 'langone'] },
  { id: 'epic-6', name: 'Mass General Brigham', state: 'MA', city: 'Boston', fhirBaseUrl: 'https://ws-interconnect-fhir.partners.org/Interconnect-FHIR-MU-PRD/api/FHIR/R4', aliases: ['mass general', 'brigham', 'mgh'] },
  { id: 'epic-7', name: 'UCLA Health', state: 'CA', city: 'Los Angeles', fhirBaseUrl: 'https://epicproxy.et0988.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['ucla'] },
  { id: 'epic-8', name: 'UCSF Health', state: 'CA', city: 'San Francisco', fhirBaseUrl: 'https://unified-api.ucsf.edu/clinical/apex/api/FHIR/R4', aliases: ['ucsf'] },
  { id: 'epic-9', name: 'Stanford Health Care', state: 'CA', city: 'Stanford', fhirBaseUrl: 'https://epicproxy.et0874.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['stanford'] },
  { id: 'epic-10', name: 'Mount Sinai Health System', state: 'NY', city: 'New York', fhirBaseUrl: 'https://epicproxy.et1028.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['mount sinai', 'sinai'] },
  { id: 'epic-11', name: 'Penn Medicine', state: 'PA', city: 'Philadelphia', fhirBaseUrl: 'https://ssproxy.pennhealth.com/PRD-FHIR/api/FHIR/R4', aliases: ['penn', 'upenn'] },
  { id: 'epic-12', name: 'Cedars-Sinai', state: 'CA', city: 'Los Angeles', fhirBaseUrl: 'https://epicproxy.et1038.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['cedars'] },
  { id: 'epic-13', name: 'Northwestern Medicine', state: 'IL', city: 'Chicago', fhirBaseUrl: 'https://epicproxy.et1057.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['northwestern'] },
  { id: 'epic-14', name: 'Kaiser Permanente', state: 'CA', city: 'Oakland', fhirBaseUrl: 'https://epicproxy.et1116.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['kaiser', 'kp'] },
  { id: 'epic-15', name: 'Intermountain Health', state: 'UT', city: 'Salt Lake City', fhirBaseUrl: 'https://epicproxy.et0871.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['intermountain'] },
  { id: 'epic-16', name: 'UNC Health', state: 'NC', city: 'Chapel Hill', fhirBaseUrl: 'https://epicproxy.et0893.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['unc'] },
  { id: 'epic-17', name: 'Emory Healthcare', state: 'GA', city: 'Atlanta', fhirBaseUrl: 'https://epicproxy.et0990.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['emory'] },
  { id: 'epic-18', name: 'Vanderbilt University Medical Center', state: 'TN', city: 'Nashville', fhirBaseUrl: 'https://epicproxy.et0846.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['vanderbilt', 'vumc'] },
  { id: 'epic-19', name: 'UW Medicine', state: 'WA', city: 'Seattle', fhirBaseUrl: 'https://epicproxy.et0930.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['uw medicine'] },
  { id: 'epic-20', name: 'UChicago Medicine', state: 'IL', city: 'Chicago', fhirBaseUrl: 'https://epicproxy.et0830.epichosted.com/FHIRProxy/api/FHIR/R4', aliases: ['uchicago'] },
]

