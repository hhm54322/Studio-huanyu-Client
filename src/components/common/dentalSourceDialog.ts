import { defineAsyncComponent, type Component } from 'vue'

const dialogs = new Map<string, Component>()
export function dentalSourceDialog(tab = 0, institution = false): Component {
  const key = institution ? 'institution' : String(tab)
  let dialog = dialogs.get(key)
  if (!dialog) {
    dialog = defineAsyncComponent(async () => {
      const [component] = await Promise.all([
        import('./DentalDoctorSourceDialog.vue'),
        import('@/data/dentalFigmaDetails').then(source => source.loadDentalDetail(tab, institution)),
      ])
      return component.default
    })
    dialogs.set(key, dialog)
  }
  return dialog
}
