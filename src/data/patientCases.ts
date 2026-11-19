/** Patient cases copied from Figma frames 4342:1210 and 4342:407–850.
 * Original source and the few documented copy corrections are recorded in
 * docs/figma-page-specs/cases.md. */
import content from './patientCasesContent.json'
import sourceMap from './patientCasesSourceMap.json'

export interface DesignNode {
  id: string
  type: string
  name?: string
  text?: string
  children: DesignNode[]
}
export interface CaseText { nodeId:string; text:string }
export interface PatientCaseSection { nodeId:string; heading:CaseText; content:DesignNode[] }
export interface PatientCase {
  id:number
  frameId:string
  cardId:string
  name:CaseText
  specialty:CaseText
  headline:CaseText
  cardFields:CaseText[]
  detailTitle:CaseText
  detailSummary:CaseText
  sections:PatientCaseSection[]
  photos:string[]
}
export const patientCases = content.cases as PatientCase[]
export const homePatientStories = content.home as CaseText[][]

export interface PatientCaseSectionSource {
  heading: string
  list: string
  number: string
  numberText: string
  line: string | null
}
export interface PatientCaseDetailSource {
  root: string
  backdrop: string
  dialog: string
  close: string
  closeIcon: string
  closePath: string
  headingGroup: string
  heading: string
  headingText: string
  columns: string
  left: string
  photo: string
  photoPaint: string
  dots: string | null
  dotButtons: string[]
  summaryOuter: string
  summaryBox: string
  summaryInner: string
  summaryHeading: string
  summaryCopy: string
  right: string
  background: string
  timeline: string
  timelineHead: string
  timelineHeading: string
  timelineHeadingText: string
  sourceHeading?: string
  sourceText?: string
  steps: string
  sections: Record<string, PatientCaseSectionSource>
}
export const patientCaseDetailSource = sourceMap as Record<string, PatientCaseDetailSource>
