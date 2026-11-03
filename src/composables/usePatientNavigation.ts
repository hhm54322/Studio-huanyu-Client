import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export const patientNavigationItems = [
  { label: '首页', path: '/' },
  { label: '为什么选择中国', path: '/why-china' },
  { label: '信任与常见问题', path: '/trust' },
  { label: '医疗服务', group: 'services' },
  { label: '牙科', path: '/dental' },
  { label: '中国医院', group: 'hospitals' },
  { label: '患者案例', path: '/cases' },
  { label: '保险指南', path: '/insurance' },
  { label: '关于我们', path: '/about' },
] as const

export const patientNavigationGroups = {
  services: [
    { label: '健康体检', path: '' },
    { label: '专科诊疗', path: '/diseases-technologies' },
    { label: '中医康养', path: '' },
    { label: '细胞治疗', path: '' },
  ],
  hospitals: [
    { label: '中国医院', path: '/hospitals' },
    { label: '中国医生', path: '/doctors' },
  ],
} as const
export type PatientNavigationGroup = keyof typeof patientNavigationGroups
const storageKey = 'huanyu.patient-navigation.v1'
function readSelection(): Partial<Record<PatientNavigationGroup, string>> {
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || '{}')
    return Object.fromEntries(Object.entries(patientNavigationGroups).flatMap(([key, items]) =>
      items.some(item => item.path && item.path === saved[key]) ? [[key, saved[key]]] : []))
  } catch { return {} }
}
// One shared selection survives route-owned source headers being remounted.
// It contains public navigation paths only, separate from any patient data.
const selectedPaths = ref(readSelection())
export function usePatientNavigation() {
  const route = useRoute()
  watch(() => route.path, path => {
    for (const [group, items] of Object.entries(patientNavigationGroups)) {
      if (!items.some(item => item.path === path) || selectedPaths.value[group as PatientNavigationGroup] === path) continue
      selectedPaths.value = { ...selectedPaths.value, [group]: path }
      try { sessionStorage.setItem(storageKey, JSON.stringify(selectedPaths.value)) } catch { /* Browsing remains usable with storage disabled. */ }
    }
  }, { immediate: true })
  const groupLabel = (group: PatientNavigationGroup) => patientNavigationGroups[group].find(item => item.path && item.path === selectedPaths.value[group])?.label
    || (group === 'services' ? '医疗服务' : '中国医院')
  const groupActive = (group: PatientNavigationGroup) => patientNavigationGroups[group].some(item => item.path && route.path === item.path)
  return { groupLabel, groupActive }
}
