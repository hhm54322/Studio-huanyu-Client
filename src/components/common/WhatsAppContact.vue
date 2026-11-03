<script setup lang="ts">
// Keep the real customer-service account in release configuration. The old
// 400 number in the footer and the reference site's number are not accounts.
function contactUrl(value: string): string | undefined {
  const input = value.trim()
  if (!input) return
  if (/^\+?[1-9]\d{6,14}$/.test(input)) return `https://wa.me/${input.replace('+', '')}`
  try {
    const url = new URL(input)
    if (url.origin !== 'https://wa.me' || url.username || url.password || !/^\/[1-9]\d{6,14}\/?$/.test(url.pathname)) return
    return url.href
  } catch { return }
}
const href = contactUrl(import.meta.env.VITE_WHATSAPP_CONTACT || '')
</script>

<template>
  <Teleport to="body">
    <component :is="href?'a':'button'" class="whatsapp-contact" :href="href" :type="href?undefined:'button'" :disabled="!href" :title="href?'通过 WhatsApp 联系寰宇医疗客服':'WhatsApp 咨询即将开放'" target="_blank" rel="noopener noreferrer" aria-label="通过 WhatsApp 联系寰宇医疗客服">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.52 3.45A11.82 11.82 0 0 0 12.1 0C5.54 0 .2 5.34.2 11.9c0 2.1.55 4.14 1.6 5.95L.1 24l6.3-1.65a11.87 11.87 0 0 0 5.7 1.45h.01C18.67 23.8 24 18.46 24 11.9c0-3.18-1.24-6.17-3.48-8.45ZM12.1 21.8a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.52-5.28C2.22 6.45 6.65 2.02 12.1 2.02a9.8 9.8 0 0 1 7 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.9 9.88Zm5.43-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.48.71.3 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" /></svg>
      <span>WhatsApp 咨询</span>
    </component>
  </Teleport>
</template>

<style scoped>
.whatsapp-contact { position:fixed; right:24px; bottom:80px; z-index:55; display:inline-flex; align-items:center; justify-content:center; gap:8px; min-width:158px; height:44px; padding:0 16px; border:0; border-radius:999px; background:#168a44; color:#fff; box-shadow:0 4px 16px rgb(0 0 0 / 12%); text-decoration:none; font-family:inherit; font-size:14px; font-weight:600; line-height:20px; cursor:pointer; }
.whatsapp-contact svg { width:22px; height:22px; flex:none; }
.whatsapp-contact:hover { background:#117837; }
.whatsapp-contact:focus-visible { outline:3px solid #1e3a5f; outline-offset:3px; }
@media (max-width:700px) { .whatsapp-contact { display:none; } }
</style>
