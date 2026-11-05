import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 60000,
})

export type SubmissionResponse = {
  success: true
  submissionId: string
  submissionNo?: string
  status: string
  createdAt: string
}

export type ConsultationPayload = {
  schemaVersion: 2
  requestId: string
  name: string
  contact: string
  country: string
  topic: string
  reportStatus?: string
  budget?: string
  timeWindow?: string
  locale: string
  mode: 'quick' | 'guided'
  handoffReason: string
  sourceContext: string
  concern?: string
}

export const createConsultation = async (payload: ConsultationPayload) => {
  const response = await api.post<SubmissionResponse>('/consultations', payload)
  return response.data
}

/** Patient-facing consultation errors are translated locally; never display raw server/internal text. */
export const getConsultationErrorKey = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) return 'conversion.flow.rateLimitError'
    if (error.response?.status === 409) return 'conversion.flow.conflictError'
    if (error.response?.status === 400) return 'conversion.flow.validationError'
  }
  return 'conversion.flow.submitError'
}

export const createDentalAssessment = async (
  payload: { requestId: string; projectId: string; budget: string; visitTime: string; notes: string },
  files: File[],
) => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => formData.append(key, value))
  files.forEach((file) => formData.append('files', file))
  const response = await api.post<SubmissionResponse>('/dental-assessments', formData)
  return response.data
}

export const getSubmissionErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback
  const message = error.response?.data && typeof error.response.data === 'object'
    ? (error.response.data as { message?: unknown }).message
    : undefined
  return typeof message === 'string' && message.trim() ? message : fallback
}
