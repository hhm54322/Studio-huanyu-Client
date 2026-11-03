import { defineAsyncComponent, type Component } from 'vue'
import { loadHomeExpert } from '@/data/homeExpertSource'

const dialogs = new Map<number, Component>()
export function homeExpertDialog(expert: number): Component {
  let dialog = dialogs.get(expert)
  if (!dialog) {
    dialog = defineAsyncComponent(async () => {
      const [component] = await Promise.all([import('./HomeExpertDialog.vue'), loadHomeExpert(expert)])
      return component.default
    })
    dialogs.set(expert, dialog)
  }
  return dialog
}
