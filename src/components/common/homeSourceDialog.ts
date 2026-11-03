import { defineAsyncComponent, type Component } from 'vue'
import { loadHomeDialogSources } from '@/data/homeFigmaDialogSource'

const dialogs = new Map<string, Component>()
export function homeSourceDialog(panel: string): Component {
  let dialog = dialogs.get(panel)
  if (!dialog) {
    dialog = defineAsyncComponent(async () => {
      const [component] = await Promise.all([import('./HomeSourceDialog.vue'), loadHomeDialogSources(panel)])
      return component.default
    })
    dialogs.set(panel, dialog)
  }
  return dialog
}
