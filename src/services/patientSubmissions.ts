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

export const createConsultation = async (payload: {
  requestId: string
  name: string
  contact: string
  concern: string
}) => {
  const response = await api.post<SubmissionResponse>('/consultations', payload)
  return response.data
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
