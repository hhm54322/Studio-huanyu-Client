import { computed, ref } from 'vue'

type VersionPayload = {
  version?: string
  builtAt?: string
}

const currentVersion = __APP_VERSION__
const latestVersion = ref(currentVersion)
const updateAvailable = ref(false)
const checking = ref(false)
let lastCheckedAt = 0

const versionUrl = () => `/version.json?t=${Date.now()}`

export const useAppVersion = () => {
  const checkForUpdate = async (options: { force?: boolean } = {}) => {
    const now = Date.now()
    if (!options.force && now - lastCheckedAt < 60_000) return updateAvailable.value
    if (checking.value) return updateAvailable.value

    checking.value = true
    lastCheckedAt = now

    try {
      const response = await fetch(versionUrl(), {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (!response.ok) return updateAvailable.value

      const payload = await response.json() as VersionPayload
      const serverVersion = typeof payload.version === 'string' ? payload.version.trim() : ''
      if (serverVersion && serverVersion !== currentVersion) {
        latestVersion.value = serverVersion
        updateAvailable.value = true
      }
    } catch {
      // Version checks should never interrupt report generation or browsing.
    } finally {
      checking.value = false
    }

    return updateAvailable.value
  }

  const refreshApp = () => {
    // An explicit update must bypass an older worker's cached shell even if
    // the replacement worker has not finished installing yet. Keep the rest
    // of the current URL; the bootstrap removes this one-use marker.
    if (navigator.serviceWorker?.controller?.scriptURL.endsWith('/patient-cache-sw.js')) {
      const url = new URL(window.location.href)
      url.searchParams.set('__huanyu_update', latestVersion.value)
      window.location.replace(url.href)
      return
    }
    window.location.reload()
  }

  return {
    currentVersion,
    latestVersion: computed(() => latestVersion.value),
    updateAvailable: computed(() => updateAvailable.value),
    checking: computed(() => checking.value),
    checkForUpdate,
    refreshApp,
  }
}
