import { defineAsyncComponent, type Component } from 'vue'
import { loadTrustArticle } from '@/data/trustArticleSource'
import type { TrustArticleKey } from '@/data/trustFigmaSource'

const dialogs = new Map<TrustArticleKey, Component>()
export function trustArticleDialog(article: TrustArticleKey): Component {
  let dialog = dialogs.get(article)
  if (!dialog) {
    dialog = defineAsyncComponent(async () => {
      // Mount only after the requested article is ready: the native dialog's
      // existing focus, scroll lock and entry animation run on complete content.
      const [component] = await Promise.all([import('./TrustArticleDialog.vue'), loadTrustArticle(article)])
      return component.default
    })
    dialogs.set(article, dialog)
  }
  return dialog
}
