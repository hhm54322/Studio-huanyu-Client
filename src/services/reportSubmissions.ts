import axios from 'axios'

export type ReportSubmissionPayload = {
  locale: string
  basicInfo: {
    fullName: string
    gender: string
    dateOfBirth: string
    nationality: string
    idType?: string
    idNumber?: string
    phone?: string
    email: string
    city: string
    preferredLanguage: string
    visitPurpose: string
    chiefComplaint: string
  }
  selectedRegions: string[]
}

export type GeneratedReport = {
  id: string
  date: string
  subtitle: string
  disease: string
  treatment: string
  need: string
  countries: Array<{
    flag: string
    name: string
    fee: string
    wait: string
    tech: string
    service: string
    visa: string
    follow: string
    recommended?: boolean
  }>
  score: number
  advantages: Array<{ label: string; value: string }>
  concerns: Array<{ concern: string; solution: string }>
  hospitals: Array<{ city: string; name: string; reason: string }>
  plan: {
    direction: string
    duration: string
    totalCost: string
    breakdown: Array<{ item: string; cost: string }>
  }
  packages: Array<{
    name: string
    price: string
    icon: string
    highlight: boolean
    features: string[]
  }>
  highlights: string[]
  disclaimer: string
  generatedBy: 'llm' | 'rules'
}

export type ReportSubmissionResponse = {
  success: true
  submissionId: string
  submissionNo: string
  status: string
  createdAt: string
  report: GeneratedReport
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 120000,
})

export const createReportSubmission = async (payload: ReportSubmissionPayload) => {
  const response = await api.post<ReportSubmissionResponse>('/report-submissions', payload)
  return response.data
}
