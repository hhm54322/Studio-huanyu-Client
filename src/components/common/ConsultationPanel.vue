<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { ArrowRight, CheckCircle2, MessageCircle, Phone, X } from 'lucide-vue-next'
import { createConsultation, getSubmissionErrorMessage } from '@/services/patientSubmissions'

const open = ref(false)
const submitted = ref(false)
const name = ref('')
const contact = ref('')
const concern = ref('')
const submitting = ref(false)
const submitError = ref('')
const panel = ref<HTMLElement | null>(null)
const successButton = ref<HTMLButtonElement | null>(null)
let requestId = ''
let returnFocus: HTMLElement | null = null
let previousOverflow = '', previousScrollBehavior = '', openingScroll = 0

const newRequestId = () => crypto.randomUUID()

function openPanel() {
  if (open.value) return
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  previousScrollBehavior = document.documentElement.style.scrollBehavior
  openingScroll = window.scrollY
  document.documentElement.style.scrollBehavior = 'auto'
  window.scrollTo({ top: openingScroll, behavior: 'instant' })
  open.value = true
  submitted.value = false
  submitting.value = false
  submitError.value = ''
  requestId = newRequestId()
  document.body.style.overflow = 'hidden'
  nextTick(() => document.querySelector<HTMLInputElement>('#consult-name')?.focus({ preventScroll: true }))
}

function closePanel() {
  open.value = false
  document.body.style.overflow = previousOverflow
  nextTick(() => {
    returnFocus?.focus({ preventScroll: true })
    if (window.scrollY !== openingScroll) window.scrollTo({ top: openingScroll, behavior: 'instant' })
    document.documentElement.style.scrollBehavior = previousScrollBehavior
  })
}

async function submit() {
  if (!name.value.trim() || !contact.value.trim()) return
  if (submitting.value) return
  submitting.value = true
  submitError.value = ''
  try {
    await createConsultation({ requestId, name: name.value, contact: contact.value, concern: concern.value })
    submitted.value = true
    name.value = ''
    contact.value = ''
    concern.value = ''
    requestId = newRequestId()
    await nextTick()
    successButton.value?.focus()
  } catch (error) {
    submitError.value = getSubmissionErrorMessage(error, '提交失败，请检查网络后重试。')
  } finally {
    submitting.value = false
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) closePanel()
  if (event.key !== 'Tab' || !open.value || !panel.value) return
  const focusable = Array.from(panel.value.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
  if (!focusable.length) return
  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

onMounted(() => {
  window.addEventListener('open-consultation', openPanel)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('open-consultation', openPanel)
  window.removeEventListener('keydown', onKeydown)
  if (open.value) {
    document.body.style.overflow = previousOverflow
    document.documentElement.style.scrollBehavior = previousScrollBehavior
  }
})
</script>

<template>
  <button class="consult-float" type="button" aria-label="免费咨询" @click="openPanel">
    <MessageCircle class="h-5 w-5" />
    <span>问阿宁</span>
  </button>

  <Teleport to="body">
    <Transition name="consult">
      <div v-if="open" class="consult-overlay" role="dialog" aria-modal="true" aria-labelledby="consult-title" @click.self="closePanel">
        <section ref="panel" class="consult-panel">
          <button class="consult-close" type="button" aria-label="关闭" @click="closePanel"><X class="h-5 w-5" /></button>
          <template v-if="!submitted">
            <span class="hy-kicker">FREE CONSULTATION</span>
            <h2 id="consult-title">把情况告诉阿宁</h2>
            <p>医疗顾问将在收到信息后尽快联系您，协助整理病历、匹配医院与专家。</p>
            <form class="consult-form" @submit.prevent="submit">
              <label><span>怎么称呼您</span><input id="consult-name" v-model="name" required placeholder="请输入姓名" /></label>
              <label><span>联系方式</span><input v-model="contact" required placeholder="手机号 / WhatsApp / 微信" /></label>
              <label><span>希望咨询的问题</span><textarea v-model="concern" rows="4" placeholder="可简要描述疾病、治疗需求或预算" /></label>
              <p v-if="submitError" class="consult-error" role="alert">{{ submitError }}</p>
              <button class="hy-button-primary" type="submit" :disabled="submitting">{{ submitting ? '提交中…' : '提交咨询' }} <ArrowRight class="h-4 w-4" /></button>
            </form>
            <div class="consult-hotline"><Phone class="h-4 w-4" /> 服务时间：北京时间 09:00-21:00</div>
          </template>
          <div v-else class="consult-success">
            <CheckCircle2 class="h-12 w-12" />
            <h2 id="consult-title">信息已收到</h2>
            <p>医疗顾问会通过您留下的方式尽快联系。</p>
            <button ref="successButton" class="hy-button-secondary" type="button" @click="closePanel">完成</button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.consult-float { position: fixed; right: 22px; bottom: max(22px, env(safe-area-inset-bottom)); z-index: 45; display: flex; height: 52px; align-items: center; gap: 8px; border: 0; border-radius: 26px; padding: 0 20px; background: var(--hy-orange); color: #fff; font-size: 14px; font-weight: 750; box-shadow: 0 14px 34px rgba(10, 52, 82, .2), 0 8px 22px rgba(255, 138, 52, .3); cursor: pointer; transition: transform .25s ease, box-shadow .25s ease; }
.consult-float:hover { transform: translateY(-3px); box-shadow: 0 18px 38px rgba(10, 52, 82, .24), 0 10px 26px rgba(255, 138, 52, .35); }
.consult-overlay { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: flex-end; background: rgba(4, 28, 46, .48); backdrop-filter: blur(6px); }
.consult-panel { position: relative; width: min(100%, 500px); min-height:0; height:100%; max-height:100dvh; overflow-y: auto; padding: 70px 52px 44px; background: #fff; box-shadow: -20px 0 60px rgba(5, 38, 63, .18); }
.consult-close { position: absolute; top: 24px; right: 24px; display: grid; width: 40px; height: 40px; place-items: center; border: 1px solid var(--hy-line); border-radius: 50%; background: #fff; color: var(--hy-navy); cursor: pointer; }
.consult-panel h2 { margin: 16px 0 10px; color: var(--hy-navy-deep); font-size: 34px; line-height: 1.25; font-weight: 760; }
.consult-panel > p, .consult-success p { margin: 0; color: var(--hy-muted); line-height: 1.8; }
.consult-form { display: grid; gap: 19px; margin-top: 34px; }
.consult-form label { display: grid; gap: 8px; color: var(--hy-ink); font-size: 13px; font-weight: 700; }
.consult-form input, .consult-form textarea { width: 100%; border: 1px solid var(--hy-line); border-radius: 6px; padding: 13px 14px; outline: 0; background: #f9fcfd; color: var(--hy-ink); font-size: 14px; font-weight: 400; transition: border-color .2s ease, box-shadow .2s ease; }
.consult-form input:focus, .consult-form textarea:focus { border-color: var(--hy-blue); box-shadow: 0 0 0 3px rgba(22, 133, 195, .1); }
.consult-form textarea { resize: vertical; }
.consult-hotline { display: flex; align-items: center; gap: 8px; margin-top: 22px; color: var(--hy-muted); font-size: 12px; }
.consult-error { margin: -5px 0 0; color: #b42318; font-size: 12px; line-height: 1.5; }
.consult-form button:disabled { cursor: wait; opacity: .68; }
.consult-success { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #27a776; }
.consult-success .hy-button-secondary { margin-top: 26px; }
.consult-enter-active, .consult-leave-active { transition: opacity .3s ease; }
.consult-enter-active .consult-panel, .consult-leave-active .consult-panel { transition: transform .38s cubic-bezier(.22, 1, .36, 1); }
.consult-enter-from, .consult-leave-to { opacity: 0; }
.consult-enter-from .consult-panel, .consult-leave-to .consult-panel { transform: translateX(100%); }
@media (max-width: 640px) { .consult-float { right: 14px; bottom: max(14px, env(safe-area-inset-bottom)); width: 48px; height: 48px; justify-content: center; padding: 0; } .consult-float span { display: none; } .consult-panel { min-height:0; height:100%; max-height:100dvh; padding: 68px 24px 32px; } .consult-panel h2 { font-size: 29px; } .consult-form input,.consult-form textarea { font-size:16px; } }
@media (max-width:900px) { .consult-form input,.consult-form textarea { font-size:16px; } }
</style>
