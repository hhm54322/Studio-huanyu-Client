import { resolveContactTopic } from '@/data/contactTopics'
import { resolveLocale } from '@/i18n/languages'
import { contactCountry, readAttribution, type WhatsAppContext } from '@/utils/whatsappContact'

const visitorKey = 'huanyu.contact-visitor.v1'
const sessionKey = 'huanyu.contact-session.v1'
const queueKey = 'huanyu.contact-events.v1'
const day = 86400_000
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const entry = /^(?:floating|footer-shared|footer-report|footer-\d+-\d+|m06-whatsapp|m08-whatsapp|m08-direct)$/
let memoryVisitor: { id: string; expires: number } | undefined
let memorySession: string | undefined
export type ContactClickEvent = WhatsAppContext & {
  schemaVersion: 1; event: 'whatsapp_click'; eventId: string; visitorId: string; sessionId: string; occurredAt: string
}
export interface ContactAnalyticsOptions {
  endpoint: string
  storage?: Storage
  sessionStorage?: Storage
  now?: () => number
  randomUUID?: () => string
  send?: (endpoint: string, payload: string) => Promise<{ ok: boolean; status: number }>
  later?: (callback: () => void, milliseconds: number) => ReturnType<typeof setTimeout>
}

/** Best-effort transport: no awaits or navigation interception in the click path. */
export function createContactAnalytics(options: ContactAnalyticsOptions) {
  const now = options.now || Date.now
  const randomUUID = options.randomUUID || (() => crypto.randomUUID())
  const later = options.later || setTimeout
  const send = options.send || (async (endpoint, body) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      return await fetch(endpoint, {
        method: 'POST', body, keepalive: true, mode: 'cors', credentials: 'omit', signal: controller.signal,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, referrerPolicy: 'no-referrer',
      })
    } finally { clearTimeout(timeout) }
  })
  const read = (storage: Storage | undefined, key: string): unknown => {
    try { return JSON.parse(storage?.getItem(key) || 'null') } catch { return null }
  }
  const write = (storage: Storage | undefined, key: string, value: unknown) => {
    try { storage?.setItem(key, JSON.stringify(value)) } catch { /* Tracking never prevents contact. */ }
  }
  const savedVisitor = read(options.storage, visitorKey) as { id?: string; expires?: number } | null
  const currentVisitor = savedVisitor?.id && uuid.test(savedVisitor.id) && Number(savedVisitor.expires) > now()
    ? { id: savedVisitor.id, expires: Number(savedVisitor.expires) }
    : memoryVisitor && memoryVisitor.expires > now() ? memoryVisitor : { id: randomUUID(), expires: now() + 180 * day }
  const visitor = currentVisitor.id
  memoryVisitor = currentVisitor
  // Fixed lifetime; routine clicks do not extend the identifier indefinitely.
  write(options.storage, visitorKey, currentVisitor)
  const savedSession = read(options.sessionStorage, sessionKey)
  const session = typeof savedSession === 'string' && uuid.test(savedSession) ? savedSession : memorySession || randomUUID()
  memorySession = session
  write(options.sessionStorage, sessionKey, session)

  function restore(value: unknown): ContactClickEvent | undefined {
    if (!value || typeof value !== 'object') return
    const candidate = value as Partial<ContactClickEvent>
    if (candidate.schemaVersion !== 1 || candidate.event !== 'whatsapp_click'
      || !uuid.test(candidate.eventId || '') || !uuid.test(candidate.visitorId || '') || !uuid.test(candidate.sessionId || '')) return
    const time = Date.parse(candidate.occurredAt || '')
    const locale = resolveLocale(candidate.locale), topic = resolveContactTopic(candidate.topic)
    if (!Number.isFinite(time) || now() - time > day || time > now() + 5 * 60_000 || !locale || !topic
      || typeof candidate.page !== 'string' || !/^patient-[a-z-]{1,50}$/.test(candidate.page) || !entry.test(candidate.entry || '')) return
    // Rebuild the allowlist instead of trusting data read from browser storage.
    return {
      schemaVersion: 1, event: 'whatsapp_click', eventId: candidate.eventId!, visitorId: candidate.visitorId!, sessionId: candidate.sessionId!,
      occurredAt: candidate.occurredAt!, locale, topic, page: candidate.page, entry: candidate.entry!,
      ...(contactCountry(candidate.country) ? { country: contactCountry(candidate.country) } : {}),
      attribution: readAttribution(candidate.attribution || {}) || {},
    }
  }
  const saved = read(options.sessionStorage, queueKey)
  let queue = (Array.isArray(saved) ? saved : []).slice(-20).map(restore).filter((value): value is ContactClickEvent => Boolean(value))
  const persist = () => write(options.sessionStorage, queueKey, queue)
  let active = false, stopped = false, failures = 0
  let retry: ReturnType<typeof setTimeout> | undefined
  async function flush() {
    if (active || stopped) return
    active = true
    try {
      while (queue.length && !stopped) {
        const event = queue[0]!
        if (now() - Date.parse(event.occurredAt) > day) { queue.shift(); persist(); continue }
        const response = await send(options.endpoint, JSON.stringify(event)).catch(() => undefined)
        // A freshly mounted shell may already own the persisted queue.
        if (stopped) break
        if (response?.ok || response && [400, 403, 404, 413, 415, 422].includes(response.status)) {
          queue = queue.filter(item => item.eventId !== event.eventId); persist(); failures = 0
        } else {
          if (!stopped) retry = later(() => { retry = undefined; void flush() }, response?.status === 429 ? 60_000 : Math.min(60_000, 1000 * 2 ** Math.min(failures++, 6)))
          break
        }
      }
    } finally { active = false }
  }
  const track = (context: WhatsAppContext) => {
    if (stopped) return
    const event = restore({ ...context, schemaVersion: 1, event: 'whatsapp_click', eventId: randomUUID(), visitorId: visitor, sessionId: session, occurredAt: new Date(now()).toISOString() })
    if (!event) return
    queue = [...queue.slice(-19), event]; persist()
    if (retry) { clearTimeout(retry); retry = undefined }
    void flush()
  }
  persist()
  return {
    track, flush,
    stop: () => { stopped = true; if (retry) clearTimeout(retry) },
  }
}
