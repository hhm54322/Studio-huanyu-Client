<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from './api'
import zh from '../src/i18n/locales/zh.json'

type Item = { id: string; name: string; contact: string; country: string; topic: string; report_status: string; budget: string; time_window: string; locale: string; flow_mode: string; handoff_reason: string; source_context: string; concern: string; status: string; created_at: string; updated_at: string }
const emit = defineEmits<{ unauthenticated: [] }>()
const items = ref<Item[]>([]), total = ref(0), page = ref(1), status = ref('submitted'), search = ref(''), busy = ref(false), error = ref('')
const choices: Record<string, string> = { submitted: '待处理', in_progress: '处理中', waiting_user: '待用户回复', handoff: '专业人员接管', resolved: '已解决', closed: '已关闭' }
const selected = ref<Record<string, string>>({})
const text = zh.conversion.flow
const topics = zh.conversion.topics as Record<string, string>
const label = (value: string, values: Record<string, string>) => values[value] || value || '未填写'
const country = (value: string) => { if (value === 'OTHER') return '其他国家/地区'; try { return value ? new Intl.DisplayNames(['zh'], { type: 'region' }).of(value) || value : '未填写' } catch { return value } }
const date = (value: string) => new Date(value).toLocaleString('zh-CN')
const whatsapp = (value: string) => /^\+[1-9]\d{6,14}$/.test(value) ? `https://wa.me/${value.slice(1)}` : undefined
async function run(task: () => Promise<void>) {
  if (busy.value) return
  busy.value = true; error.value = ''
  try { await task() } catch (e) { error.value = e instanceof Error ? e.message : '操作失败。'; if (e instanceof ApiError && e.status === 401) emit('unauthenticated') }
  finally { busy.value = false }
}
async function load() {
  const query = new URLSearchParams({ page: String(page.value), status: status.value, search: search.value })
  const data = await api<{ items: Item[]; total: number }>(`/consultations?${query}`)
  items.value = data.items; total.value = data.total
  selected.value = Object.fromEntries(data.items.map(item => [item.id, item.status]))
}
function apply() { page.value = 1; void run(load) }
function changePage(change: number) { page.value += change; void run(load) }
function save(item: Item) { void run(async () => { await api(`/consultations/${item.id}/status`, 'POST', { status: selected.value[item.id] }); await load() }) }
onMounted(() => void run(load))
</script>

<template>
  <main class="case-list consultation-queue">
    <div class="case-list-heading"><h1>咨询接管</h1><p>四项留资与站内向导提交统一接收；点击 WhatsApp 不代表用户已发消息或人工已回复。</p></div>
    <form class="case-filters" @submit.prevent="apply">
      <label>状态<select v-model="status" class="wb-field" :disabled="busy"><option value="all">全部</option><option v-for="(name, value) in choices" :key="value" :value="value">{{ name }}</option></select></label>
      <label>搜索<input v-model="search" class="wb-field" maxlength="80" placeholder="姓名、号码或咨询编号" /></label>
      <button class="wb-button" :disabled="busy">搜索 / 刷新</button><span>共 {{ total }} 条</span>
    </form>
    <p v-if="error" class="workbench-error" role="alert">{{ error }}</p>
    <p v-if="busy" role="status">正在加载…</p>
    <p v-else-if="!items.length" class="empty-list">当前没有符合条件的咨询。</p>
    <article v-for="item in items" :key="item.id" class="consultation-item">
      <header><h2>{{ item.name }}</h2><span>{{ choices[item.status] || item.status }}</span><strong v-if="item.handoff_reason !== 'general'">优先人工：{{ label(item.handoff_reason, text.intent) }}</strong></header>
      <p>{{ item.contact }} · {{ country(item.country) }} · {{ topics[item.topic] || item.topic || '旧版咨询' }}</p>
      <p class="consultation-meta">{{ date(item.created_at) }} · 语言 {{ item.locale }} · {{ item.flow_mode === 'guided' ? '站内向导' : '快速咨询' }}</p>
      <dl><dt>报告</dt><dd>{{ label(item.report_status, text.reportOptions) }}</dd><dt>预算（USD）</dt><dd>{{ label(item.budget, text.budgetOptions) }}</dd><dt>时间</dt><dd>{{ label(item.time_window, text.timeOptions) }}</dd><dt>咨询编号</dt><dd>{{ item.id }}</dd></dl>
      <details v-if="item.concern || item.source_context"><summary>原始咨询与来源</summary><p v-if="item.concern" class="consultation-note">{{ item.concern }}</p><p>{{ item.source_context }}</p></details>
      <div class="consultation-operations">
        <a v-if="whatsapp(item.contact)" class="wb-button" :href="whatsapp(item.contact)" target="_blank" rel="noopener noreferrer">打开用户 WhatsApp</a>
        <label>处理状态<select v-model="selected[item.id]" class="wb-field" :disabled="busy"><option v-for="(name, value) in choices" :key="value" :value="value">{{ name }}</option></select></label>
        <button class="wb-button wb-primary" :disabled="busy || selected[item.id] === item.status" @click="save(item)">保存状态</button>
      </div>
    </article>
    <div class="records-pagination"><button class="wb-button" :disabled="busy || page <= 1" @click="changePage(-1)">上一页</button><span>第 {{ page }} 页</span><button class="wb-button" :disabled="busy || page * 30 >= total" @click="changePage(1)">下一页</button></div>
  </main>
</template>

<style scoped>
.consultation-item { margin: 18px 0; border: 1px solid #dce5ed; border-radius: 12px; padding: 22px; background: #fff; overflow-wrap: anywhere; }
.consultation-item header, .consultation-operations { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.consultation-item h2 { margin: 0; font-size: 20px; }.consultation-item header strong { color: #9c4d07; font-size: 13px; }
.consultation-meta { color: #64748b; font-size: 13px; }.consultation-item dl { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 8px; font-size: 14px; }.consultation-item dd { margin: 0; }.consultation-item dt { color: #64748b; }
.consultation-item details { margin: 18px 0; font-size: 13px; }.consultation-note { white-space: pre-wrap; }.consultation-operations { margin-top: 18px; }.consultation-operations label { display: flex; gap: 8px; align-items: center; font-size: 13px; }.consultation-operations select { width: auto; }
.case-filters label { display: grid; gap: 5px; font-size: 13px; }
</style>
