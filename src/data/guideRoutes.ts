// Public, shareable article URLs; query parameters remain available for language and attribution.
export const guideKeys: string[] = ['assessment', 'companions', 'medication-entry', 'muslim', 'steps-flow', 'visa']
export const guidePath = (key: string) => `/guides/${key}`
