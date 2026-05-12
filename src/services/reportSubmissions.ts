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

export type ReportSubmissionResponse = {
  success: true
  submissionId: string
  submissionNo: string
  status: string
  createdAt: string
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
})

export const createReportSubmission = async (payload: ReportSubmissionPayload) => {
  const response = await api.post<ReportSubmissionResponse>('/report-submissions', payload)
  return response.data
}
