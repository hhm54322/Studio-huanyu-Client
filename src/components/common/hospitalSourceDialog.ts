import { defineAsyncComponent, type Component } from 'vue'
import { loadHospitalDetail } from '@/data/hospitalFigmaDetails'

const dialogs = new Map<boolean, Component>()
export function hospitalSourceDialog(name: string): Component {
  const yaoying = name === '上海曜影医院'
  let dialog = dialogs.get(yaoying)
  if (!dialog) {
    dialog = defineAsyncComponent(async () => {
      const [component] = await Promise.all([import('./HospitalSourceDialog.vue'), loadHospitalDetail(name)])
      return component.default
    })
    dialogs.set(yaoying, dialog)
  }
  return dialog
}
