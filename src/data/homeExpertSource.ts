import type { HomeSourceNodeData } from '@/components/common/HomeSourceNode.vue'

export type ExpertSource = {
  name: string; frame: string; overlay: string; panel: string; width: number; height: number
  title: string; close: string; tabs: { id: string; text: string }[]; scrollContainers: string[]
  root: HomeSourceNodeData
}
const files = [
  () => import('virtual:huanyu-home-expert/xu-yu'),
  () => import('virtual:huanyu-home-expert/zhou-li-li'),
  () => import('virtual:huanyu-home-expert/liu-guang-yu'),
  () => import('virtual:huanyu-home-expert/chen-ji-wu'),
]
const loaded = new Map<number, Record<string, ExpertSource>>()
const pending = new Map<number, Promise<void>>()
export function loadHomeExpert(expert: number): Promise<void> {
  if (loaded.has(expert)) return Promise.resolve()
  const active = pending.get(expert)
  if (active) return active
  const request = files[expert]!().then(source => { loaded.set(expert, source.default as Record<string, ExpertSource>) })
    .finally(() => pending.delete(expert))
  pending.set(expert, request)
  return request
}
export function homeExpertRecords(expert: number): Record<string, ExpertSource> {
  const records = loaded.get(expert)
  if (!records) throw new Error(`Expert source was not prepared before opening: ${expert}`)
  return records
}
