import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { AppSide } from '@/stores/app'

export function useAppSide() {
  const route = useRoute()

  const side = computed<AppSide>(() => {
    return route.path.startsWith('/hospital') ? 'hospital' : 'patient'
  })

  const isPatient = computed(() => side.value === 'patient')
  const isHospital = computed(() => side.value === 'hospital')

  return { side, isPatient, isHospital }
}
