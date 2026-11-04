// Executed before entry scripts. No API/private data is read or cached here.
// A single guard is shared by entry, route and language failures. Live pages
// are never refreshed automatically, including in-progress patient forms.
function installPatientLoadRecovery(version, routes) {
  const initialPath = location.pathname.replace(/\/$/, '') || '/'
  const publicPage = routes.includes(initialPath) || /^\/dental\/doctors\/[^/]+$/.test(initialPath)
  if (!publicPage) return
  let ready = false
  let scheduled = false
  let interacted = false
  let notice
  let loadingTimer
  let slowTimer
  const failedStyles = new WeakSet()
  let targetPath = location.pathname + location.search + location.hash
  const strings = {
    zh: ['正在加载…', '页面加载时间较长，请检查网络。', '页面资源加载失败，请重试。', '重新加载', '关闭'],
    en: ['Loading…', 'Loading is taking longer than expected. Check your connection.', 'Page resources could not be loaded. Please try again.', 'Reload', 'Dismiss'],
    id: ['Memuat…', 'Pemuatan lebih lama dari biasanya. Periksa koneksi Anda.', 'Sumber daya halaman gagal dimuat. Silakan coba lagi.', 'Muat ulang', 'Tutup'],
    ms: ['Memuatkan…', 'Pemuatan mengambil masa lebih lama. Semak sambungan anda.', 'Sumber halaman gagal dimuatkan. Sila cuba lagi.', 'Muat semula', 'Tutup'],
    pt: ['A carregar…', 'O carregamento está a demorar. Verifique a ligação.', 'Não foi possível carregar a página. Tente novamente.', 'Recarregar', 'Fechar'],
  }
  function copy() {
    let language = new URLSearchParams(location.search).get('lang')
    try { language ||= localStorage.getItem('locale') } catch { /* Storage is optional. */ }
    const code = String(document.documentElement.dataset.patientLocale || language || 'zh').toLowerCase().split(/[-_]/)[0]
    return strings[code] || strings.zh
  }
  function show(error = false) {
    if (!document.body) { document.addEventListener('DOMContentLoaded', () => show(error), { once: true }); return }
    if (!error && ready) return
    if (!error && notice?.dataset.state === 'error') return
    const boot = document.getElementById('huanyu-boot')
    if (boot) {
      if (error) window.__huanyuShowRecovery?.(copy()[2])
      return
    }
    const words = copy()
    if (!notice) {
      notice = document.createElement('div')
      notice.id = 'huanyu-load-status'
      notice.setAttribute('role', 'status')
      notice.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:2147483646;max-width:calc(100vw - 48px);box-sizing:border-box;padding:12px 20px;border:1px solid #DBDEE6;border-radius:8px;background:#fff;color:#1E3A5F;font:14px/1.6 Arial,sans-serif;box-shadow:0 4px 16px #1e3a5f1a;text-align:center'
      document.body.appendChild(notice)
    }
    notice.replaceChildren()
    notice.dataset.state = error ? 'error' : 'loading'
    const label = document.createElement('span')
    label.textContent = words[error ? 2 : 0]
    notice.appendChild(label)
    if (error) {
      const button = document.createElement('button')
      button.type = 'button'; button.textContent = words[3]
      button.style.cssText = 'margin-inline-start:12px;padding:4px 10px;cursor:pointer;color:#1E3A5F;background:white;border:1px solid #DBDEE6;border-radius:4px;font:inherit'
      // This action is explicit. Nothing reloads after the user starts work.
      button.onclick = () => location.assign(targetPath)
      notice.appendChild(button)
      if (ready) {
        const close = document.createElement('button')
        close.type = 'button'; close.textContent = words[4]
        close.style.cssText = button.style.cssText
        close.onclick = () => { notice.remove(); notice = undefined }
        notice.appendChild(close)
      }
    }
  }
  function recover() {
    if (scheduled) return true
    if (ready || interacted || initialPath === '/report' || !matchMedia('(min-width: 701px)').matches || document.querySelector('#app main, #app form, #app dialog')) return false
    try {
      // One automatic retry per release and tab, with no timer expiry or URL
      // dependence. Entry and router errors cannot combine into a retry loop.
      const key = `huanyu:load-retry:${version}`
      if (sessionStorage.getItem(key)) return false
      sessionStorage.setItem(key, '1')
    } catch { return false }
    scheduled = true
    setTimeout(() => {
      scheduled = false
      if (ready) return
      if (interacted) { show(true); return }
      const url = new URL(targetPath, location.origin)
      url.searchParams.set('__huanyu_update', version)
      location.replace(url.pathname + url.search + url.hash)
    }, 350)
    return true
  }
  window.__huanyuPatientLoad = {
    entryStylesReady() {
      const styles = [...document.querySelectorAll('link[rel="stylesheet"], link[rel="preload"][as="style"]')]
      return Promise.all(styles.map(link => {
        const url = new URL(link.href, location.origin)
        if (url.origin !== location.origin || !url.pathname.startsWith('/assets/')) return Promise.resolve()
        if (failedStyles.has(link)) return Promise.reject(new Error('Entry stylesheet resource failed'))
        if (link.dataset.huanyuStyleState === 'error') return Promise.reject(new Error('Entry stylesheet resource failed'))
        if (link.sheet || link.dataset.huanyuStyleState === 'loaded') return Promise.resolve()
        return new Promise((resolve, reject) => {
          link.addEventListener('load', () => resolve(undefined), { once: true })
          link.addEventListener('error', () => reject(new Error('Entry stylesheet resource failed')), { once: true })
        })
      }))
    },
    ready() {
      ready = true
      scheduled = false
      targetPath = location.pathname + location.search + location.hash
      clearTimeout(loadingTimer); clearTimeout(slowTimer)
      notice?.remove(); notice = undefined
    },
    failed(target) {
      if (target) {
        const url = new URL(target, location.origin)
        if (url.origin !== location.origin) return
        url.searchParams.delete('__huanyu_update')
        targetPath = url.pathname + url.search + url.hash
      }
      if (!recover()) {
        show(true)
      }
    },
  }
  for (const type of ['pointerdown', 'keydown', 'input', 'submit']) {
    window.addEventListener(type, () => { interacted = true }, { capture: true, once: true })
  }
  loadingTimer = setTimeout(() => show(), 1200)
  slowTimer = setTimeout(() => {
    if (ready) return
    if (document.getElementById('huanyu-boot')?.dataset.state === 'error') return
    show(true)
    if (document.getElementById('huanyu-boot')) window.__huanyuShowRecovery?.(copy()[1])
    const label = notice?.querySelector('span')
    if (label) label.textContent = copy()[1]
  }, 8000)
  window.addEventListener('error', event => {
    if (ready) return
    const target = event.target
    // Module preloads are speculative; fatal imports are reported by the
    // router/bootstrap. Route CSS is required by the first-paint barrier.
    const asset = target instanceof HTMLScriptElement ? target.src
      : target instanceof HTMLLinkElement && (target.rel === 'stylesheet' || target.rel === 'preload' && target.as === 'style') ? target.href : ''
    if (!asset) return
    const url = new URL(asset, location.href)
    if (url.origin === location.origin && /^\/assets\/.*\.(js|css)$/.test(url.pathname)) {
      if (target instanceof HTMLLinkElement && (target.rel === 'stylesheet' || target.rel === 'preload' && target.as === 'style')) failedStyles.add(target)
      window.__huanyuPatientLoad.failed()
    }
  }, true)
}
