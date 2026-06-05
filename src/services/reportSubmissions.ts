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

export type ParsedFileSummary = {
  file: string
  status: string
  summary: string
}

export type ReportLayoutMetric = {
  label: string
  value: string
  detail?: string
  tone?: string
}

export type ReportLayoutCard = {
  title: string
  subtitle?: string
  value?: string
  description?: string
  detail?: string
  tag?: string
  tone?: string
}

export type ReportLayoutTable = {
  columns: string[]
  rows: Array<{
    cells: string[]
    highlight?: boolean
  }>
}

export type ReportLayoutTimelineItem = {
  time: string
  title: string
  description?: string
  items?: string[]
}

export type ReportLayoutBlock = {
  type: 'summary' | 'cards' | 'table' | 'timeline' | 'list' | 'cost' | 'notice'
  title: string
  titleEn?: string
  description?: string
  tone?: string
  metrics?: ReportLayoutMetric[]
  cards?: ReportLayoutCard[]
  table?: ReportLayoutTable
  timeline?: ReportLayoutTimelineItem[]
  items?: string[]
}

export type ReportLayoutSection = {
  key: string
  label: string
  labelEn?: string
  icon?: string
  summary?: string
  blocks: ReportLayoutBlock[]
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
  layoutSections?: ReportLayoutSection[]
  disclaimer: string
  generatedBy: 'llm' | 'rules'
}

export type ReportSubmissionResponse = {
  success: true
  submissionId: string
  submissionNo: string
  status: string
  createdAt: string
  basicInfo?: ReportSubmissionPayload['basicInfo']
  selectedRegions?: string[]
  report: GeneratedReport
}

export type ProfessionalReportPayload = {
  locale: string
  patient: {
    fullName: string
    gender: string
    dateOfBirth?: string
    nationality?: string
    phone: string
    email?: string
    city?: string
    preferredLanguage?: string
  }
  medical: {
    visitPurpose: string
    diagnosis?: string
    stage?: string
    chiefComplaint: string
    pathologySummary?: string
    imagingSummary?: string
    geneticSummary?: string
    treatmentHistory?: string
    medicationHistory?: string
    comorbidities?: string
    allergyHistory?: string
  }
  preferences: {
    selectedRegions: string[]
    budgetRange?: string
    insuranceType?: string
    desiredCity?: string
    urgency?: 'routine' | 'priority' | 'urgent'
  }
}

export type ProfessionalReport = {
  id: string
  date: string
  title: string
  subtitle: string
  patientSnapshot: {
    patient: string
    profile: string
    primaryNeed: string
    diagnosisStatus: string
    dataCompleteness: number
    uploadedFiles: string[]
    parsedFiles: Array<{
      file: string
      status: string
      summary: string
    }>
  }
  executiveSummary: string[]
  diagnosticConclusion: {
    finalImpression: string
    severityInterpretation: string
    indicatorInterpretations: Array<{
      indicator: string
      value: string
      interpretation: string
    }>
    evidenceBasis: string[]
  }
  clinicalAssessment: {
    workingDiagnosis: string
    severity: string
    keyFindings: string[]
    redFlags: string[]
    missingMaterials: string[]
    decisionQuestions: string[]
  }
  treatmentPathway: {
    goal: string
    phases: Array<{
      phase: string
      timeline: string
      actions: string[]
      output: string
    }>
  }
  prognosisComparison: {
    positioning: string
    metrics: Array<{
      metric: string
      currentRisk: string
      chinaReference: string
      note: string
    }>
    conclusion: string
  }
  technologyAdvantages: Array<{
    technology: string
    value: string
    applicability: string
  }>
  costBreakdown: {
    currencyNote: string
    medical: ProfessionalCostCategory
    services: ProfessionalCostCategory
    living: ProfessionalCostCategory
    grandTotal: string
    volatilityNote: string
  }
  countryComparison: Array<{
    flag: string
    country: string
    cost: string
    waitTime: string
    strengths: string
    limitations: string
    fitScore: number
    recommended?: boolean
  }>
  hospitalRecommendations: Array<{
    city: string
    hospital: string
    department: string
    whyFit: string
    preparation: string
    matchScore: number
  }>
  itinerary: Array<{
    dayRange: string
    stage: string
    tasks: string[]
  }>
  servicePlan: Array<{
    service: string
    value: string
  }>
  paymentAndInsurance: string[]
  risksAndDisclaimers: string[]
  nextSteps: string[]
  tabs?: ReportLayoutSection[]
  qualityFlags: string[]
  generatedBy: 'llm' | 'rules'
}

export type ProfessionalCostCategory = {
  title: string
  total: string
  items: Array<{
    item: string
    cost: string
    note: string
  }>
}

export type ProfessionalReportSubmissionResponse = {
  success: true
  submissionId: string
  submissionNo: string
  status: string
  createdAt: string
  report: ProfessionalReport
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 240000,
})

export const createReportSubmission = async (payload: ReportSubmissionPayload, files: File[] = []) => {
  if (files.length) {
    const formData = new FormData()
    formData.append('payload', JSON.stringify(payload))
    files.forEach((file) => {
      formData.append('files', file)
    })

    const response = await api.post<ReportSubmissionResponse>(
      '/report-submissions',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data
  }

  const response = await api.post<ReportSubmissionResponse>('/report-submissions', payload)
  return response.data
}

export const getReportSubmission = async (submissionNo: string) => {
  const response = await api.get<ReportSubmissionResponse>(`/report-submissions/${encodeURIComponent(submissionNo)}`)
  return response.data
}

export const createProfessionalReportSubmission = async (
  payload: ProfessionalReportPayload,
  files: File[],
) => {
  const formData = new FormData()
  formData.append('payload', JSON.stringify(payload))
  files.forEach((file) => {
    formData.append('files', file)
  })

  const response = await api.post<ProfessionalReportSubmissionResponse>(
    '/professional-report-submissions',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export const getProfessionalReportSubmission = async (submissionNo: string) => {
  const response = await api.get<ProfessionalReportSubmissionResponse>(
    `/professional-report-submissions/${encodeURIComponent(submissionNo)}`,
  )
  return response.data
}
