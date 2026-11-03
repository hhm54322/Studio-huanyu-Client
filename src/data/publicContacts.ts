// User-confirmed public customer-service contacts. Keep all patient entry
// points in sync without modifying the immutable Figma handoff files.
export const sourceContactEmail = 'contact@huanyuyunyi.com'
const email = 'gh20260826@qq.com'
const defaultWhatsApp = 'https://api.whatsapp.com/message/Y42GUI2UUXBVB1?autoload=1&app_absent=0'

function whatsAppUrl(value: string): string | undefined {
  const input = value.trim()
  if (/^\+?[1-9]\d{6,14}$/.test(input)) return `https://wa.me/${input.replace('+', '')}`
  try {
    const url = new URL(input)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return
    if (url.hostname === 'wa.me' && /^\/[1-9]\d{6,14}\/?$/.test(url.pathname)) return url.href
    if (url.hostname === 'api.whatsapp.com' && /^\/message\/[A-Za-z0-9]+\/?$/.test(url.pathname)) return url.href
  } catch { /* Ignore invalid release overrides; retain the confirmed account. */ }
}

export const publicContacts = Object.freeze({
  email,
  emailHref: `mailto:${email}`,
  whatsappHref: whatsAppUrl(import.meta.env.VITE_WHATSAPP_CONTACT || '') || defaultWhatsApp,
})

export function publicContactText(sourceText: string): string | undefined {
  return sourceText === sourceContactEmail ? publicContacts.email : undefined
}
