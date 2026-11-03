// Inlined before the entry script so this also works if an entry dependency
// fails to download. Only the public desktop pages opt into this recovery.
function installPatientLoadRecovery(version, routes) {
  const route = location.pathname.replace(/\/$/, '') || '/'
  if (!matchMedia('(min-width: 701px)').matches || !routes.includes(route)) return
  let scheduled = false
  let interacted = false
  for (const type of ['pointerdown', 'keydown', 'input', 'submit']) {
    window.addEventListener(type, () => { interacted = true }, { capture: true, once: true })
  }
  function recover() {
    if (scheduled) return true
    if (interacted || document.querySelector('#app main, #app form, #app dialog')) return false
    try {
      const key = `huanyu:boot-retry:${version}:${route}`
      const now = Date.now()
      if (now - Number(sessionStorage.getItem(key) || 0) < 60000) return false
      sessionStorage.setItem(key, String(now))
    } catch { return false } // No persistent guard means no automatic reload.
    scheduled = true
    setTimeout(() => { if (!interacted) location.reload() }, 350)
    return true
  }
  window.addEventListener('error', event => {
    const target = event.target
    const asset = target instanceof HTMLScriptElement ? target.src
      : target instanceof HTMLLinkElement && ['modulepreload', 'stylesheet'].includes(target.rel) ? target.href : ''
    if (!asset) return
    const url = new URL(asset, location.href)
    if (url.origin === location.origin && /^\/assets\/.*\.(js|css)$/.test(url.pathname)) recover()
  }, true)
  window.addEventListener('vite:preloadError', event => {
    if (recover()) event.preventDefault()
  })
}
