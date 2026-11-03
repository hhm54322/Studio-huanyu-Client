// Register after the first load; this must never compete with the initial hero.
function installPublicPatientCache(routes) {
  const currentUrl = new URL(location.href)
  if (currentUrl.searchParams.has('__huanyu_update')) {
    currentUrl.searchParams.delete('__huanyu_update')
    history.replaceState(history.state, '', currentUrl)
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return
  const path = location.pathname.replace(/\/$/, '') || '/'
  if (!routes.includes(path)) return
  let registration
  let lastCheck = 0
  const update = () => {
    if (!registration || document.visibilityState !== 'visible' || Date.now() - lastCheck < 60000) return
    lastCheck = Date.now()
    registration.update().catch(() => {})
  }
  const register = () => {
    navigator.serviceWorker.register('/patient-cache-sw.js', { scope: '/', updateViaCache: 'none' })
      .then(value => { registration = value; lastCheck = Date.now() })
      .catch(() => {}) // HTTP caching still works if browser storage is disabled.
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
  }
  const idle = () => 'requestIdleCallback' in window
    ? window.requestIdleCallback(register, { timeout: 3000 }) : setTimeout(register, 0)
  if (document.readyState === 'complete') idle()
  else window.addEventListener('load', idle, { once: true })
}
