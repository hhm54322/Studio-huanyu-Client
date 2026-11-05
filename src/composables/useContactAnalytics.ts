import { onBeforeUnmount, onMounted } from 'vue'
import { publicContacts } from '@/data/publicContacts'
import { resolveContactTopic } from '@/data/contactTopics'
import { contactCountry } from '@/utils/whatsappContact'
import type { WhatsAppContext } from '@/utils/whatsappContact'
import { createContactAnalytics } from '@/utils/contactAnalytics'

/** One delegated listener covers all source-rendered, fixed and footer links. */
export function useContactAnalytics(metadata: (entry: string) => WhatsAppContext) {
  let tracker: ReturnType<typeof createContactAnalytics> | undefined
  const flush = () => { void tracker?.flush() }
  const click = (event: MouseEvent) => {
    if (!event.isTrusted || event.defaultPrevented || event.type === 'click' && event.button !== 0 || event.type === 'auxclick' && event.button !== 1) return
    const target = event.target instanceof Element ? event.target : undefined
    const anchor = target?.closest<HTMLAnchorElement>('a[data-contact-entry]')
    if (!anchor) return
    try {
      const expected = new URL(publicContacts.whatsappHref), actual = new URL(anchor.href)
      if (actual.origin !== expected.origin || actual.pathname !== expected.pathname) return
      const context = metadata(anchor.dataset.contactEntry || '')
      tracker?.track({ ...context, topic: resolveContactTopic(anchor.dataset.contactTopic) || context.topic,
        country: contactCountry(anchor.dataset.contactCountry) || context.country })
    } catch { /* An optional statistic must never break a valid contact link. */ }
  }
  onMounted(() => {
    if (import.meta.env.VITE_CONTACT_ANALYTICS_ENABLED === 'false') return
    try {
      let storage: Storage | undefined, session: Storage | undefined
      try { storage = window.localStorage } catch { /* Optional. */ }
      try { session = window.sessionStorage } catch { /* Optional. */ }
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '')
      tracker = createContactAnalytics({ endpoint: `${apiBase}/analytics/events`, storage, sessionStorage: session })
      document.addEventListener('click', click)
      document.addEventListener('auxclick', click)
      window.addEventListener('online', flush)
      window.addEventListener('pageshow', flush)
      flush()
    } catch { /* Cryptography/storage failure leaves all contact actions usable. */ }
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', click)
    document.removeEventListener('auxclick', click)
    window.removeEventListener('online', flush)
    window.removeEventListener('pageshow', flush)
    tracker?.stop()
  })
}
