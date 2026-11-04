/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface Window {
  __huanyuPatientLoad?: { ready(): void; failed(target?: string): void; entryStylesReady(): Promise<unknown> }
  __huanyuShowRecovery?: (message?: string) => void
  __huanyuRemoveBoot?: () => void
}

declare module 'virtual:huanyu-patient-copy' {
  const loaders: Record<string, () => Promise<Record<string, string>>>
  export default loaders
}
