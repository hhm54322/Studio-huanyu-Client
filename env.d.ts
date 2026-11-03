/// <reference types="vite/client" />

declare module 'virtual:huanyu-home-expert/*' {
  const records: Record<string, unknown>
  export default records
}

declare module 'virtual:huanyu-home-entry' {
  const sources: {
    desktop: import('./src/components/common/HomeSourceNode.vue').HomeSourceNodeData[]
    mobile: import('./src/components/common/HomeSourceNode.vue').HomeSourceNodeData[]
    bodyHeight: number
  }
  export default sources
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
