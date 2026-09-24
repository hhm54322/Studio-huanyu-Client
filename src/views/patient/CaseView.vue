<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ArrowRight, Check, RotateCcw, Search, Sparkles } from 'lucide-vue-next'
import CountUpNumber from '@/components/common/CountUpNumber.vue'

interface StoryCase {
  id: number
  name: string
  region: string
  specialty: string
  treatment: string
  duration: number
  title: string
  background: string
  path: string
  timing: string
  image: string
  objectPosition: string
  recommended?: boolean
}

const storyCases: StoryCase[] = [
  {
    id: 1,
    name: 'Maria S.',
    region: '东南亚',
    specialty: '消化内科',
    treatment: '多学科诊疗',
    duration: 7,
    title: '消化系统疑难疾病',
    background: '40+岁，女性，反复腹痛伴消化异常，在当地多次就诊未明确诊断',
    path: '远程会诊 - 到院检查 - MDT讨论 - 制定方案',
    timing: '咨询到首诊：约 7 天 · 广州',
    image: '/images/figma/case-avatar-maria.png',
    objectPosition: '50% 50%',
  },
  {
    id: 2,
    name: 'James T.',
    region: '南亚',
    specialty: '脊柱外科',
    treatment: '手术治疗',
    duration: 14,
    title: '脊柱复杂病变',
    background: '50+岁，男性，颈椎病变面临神经压迫风险，多地评估手术风险较高',
    path: '国际转诊 - 影像评估 - 手术方案 - 术后康复',
    timing: '咨询到手术：约 14 天 · 广州',
    image: '/images/figma/case-avatar-james.png',
    objectPosition: '50% 50%',
    recommended: true,
  },
]

const filterOptions = {
  specialty: ['消化内科', '脊柱外科'],
  region: ['东南亚', '南亚'],
  treatment: ['多学科诊疗', '手术治疗'],
  duration: ['7天内', '8-14天'],
}

const draftFilters = reactive({ specialty: '', region: '', treatment: '', duration: '' })
const activeFilters = reactive({ specialty: '', region: '', treatment: '', duration: '' })
const matchOpen = ref(false)
const matchApplied = ref(false)
const closeButton = ref<HTMLButtonElement | null>(null)
const matcherDialog = ref<HTMLElement | null>(null)
let matcherTrigger: HTMLElement | null = null
const matcher = reactive({ focus: '', age: '', timing: '' })

const filteredCases = computed(() => storyCases.filter((item) => {
  if (activeFilters.specialty && item.specialty !== activeFilters.specialty) return false
  if (activeFilters.region && item.region !== activeFilters.region) return false
  if (activeFilters.treatment && item.treatment !== activeFilters.treatment) return false
  if (activeFilters.duration === '7天内' && item.duration > 7) return false
  if (activeFilters.duration === '8-14天' && (item.duration < 8 || item.duration > 14)) return false
  return true
}))

const canMatch = computed(() => Boolean(matcher.focus))

function applyFilters() {
  Object.assign(activeFilters, draftFilters)
  matchApplied.value = false
}

function resetFilters() {
  Object.assign(draftFilters, { specialty: '', region: '', treatment: '', duration: '' })
  Object.assign(activeFilters, draftFilters)
  matchApplied.value = false
}

function openMatcher() {
  matcherTrigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  matchOpen.value = true
}

function closeMatcher() {
  matchOpen.value = false
  nextTick(() => matcherTrigger?.focus())
}

async function submitMatch() {
  if (!canMatch.value) return

  resetFilters()
  if (matcher.focus === '消化系统') draftFilters.specialty = '消化内科'
  if (matcher.focus === '骨科') draftFilters.specialty = '脊柱外科'
  Object.assign(activeFilters, draftFilters)
  matchApplied.value = true
  closeMatcher()

  await nextTick()
  document.querySelector('#case-results')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    block: 'start',
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && matchOpen.value) { closeMatcher(); return }
  if (event.key !== 'Tab' || !matchOpen.value || !matcherDialog.value) return
  const focusable = Array.from(matcherDialog.value.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'))
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}

watch(matchOpen, async (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) {
    window.addEventListener('keydown', handleKeydown)
    await nextTick()
    closeButton.value?.focus()
  } else {
    window.removeEventListener('keydown', handleKeydown)
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="case-page">
    <section class="case-hero">
      <div class="case-hero__shape" aria-hidden="true" />
      <div class="hy-container case-hero__content" data-reveal>
        <span class="hy-kicker">PATIENT STORIES</span>
        <h1>患者真实就医经历</h1>
        <p>按科室、来源地区、治疗类型筛选了解国际患者从咨询到康复的完整路径</p>
        <button class="case-match-button" type="button" @click="openMatcher">
          <Sparkles class="h-5 w-5" />
          开始智能匹配
          <ArrowRight class="h-4 w-4" />
        </button>
      </div>
    </section>

    <section id="case-results" class="case-directory hy-section">
      <div class="hy-container">
        <form class="case-filters" aria-label="患者案例筛选" @submit.prevent="applyFilters">
          <label>
            <span>科室/病种</span>
            <select v-model="draftFilters.specialty">
              <option value="">全部科室/病种</option>
              <option v-for="item in filterOptions.specialty" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            <span>来源地区</span>
            <select v-model="draftFilters.region">
              <option value="">全部来源地区</option>
              <option v-for="item in filterOptions.region" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            <span>治疗类型</span>
            <select v-model="draftFilters.treatment">
              <option value="">全部治疗类型</option>
              <option v-for="item in filterOptions.treatment" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <label>
            <span>就诊时长</span>
            <select v-model="draftFilters.duration">
              <option value="">全部就诊时长</option>
              <option v-for="item in filterOptions.duration" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
          <button class="case-filter-submit" type="submit"><Search class="h-4 w-4" />筛选</button>
          <button class="case-filter-reset" type="button" @click="resetFilters"><RotateCcw class="h-4 w-4" />重置</button>
        </form>

        <Transition name="match-note">
          <div v-if="matchApplied" class="case-match-note" role="status">
            <Check class="h-5 w-5" />
            <span>已根据“{{ matcher.focus }}”{{ matcher.age ? `、${matcher.age}岁` : '' }}{{ matcher.timing ? `、${matcher.timing}` : '' }}为你优先展示相似案例。</span>
            <button type="button" @click="openMatcher">重新匹配</button>
          </div>
        </Transition>

        <div v-if="filteredCases.length" class="case-grid">
          <article
            v-for="(item, index) in filteredCases"
            :key="item.id"
            data-reveal
            :style="{ '--reveal-delay': `${index * 90}ms` }"
          >
            <header>
              <div class="case-avatar">
                <img :src="item.image" :alt="`${item.name} 匿名患者头像`" :style="{ objectPosition: item.objectPosition }" />
              </div>
              <div>
                <h2>{{ item.name }}</h2>
                <p>{{ item.region }} · {{ item.specialty }} · {{ item.treatment }}</p>
              </div>
              <span v-if="item.recommended">为您推荐</span>
            </header>
            <div class="case-card__body">
              <h3>{{ item.title }}</h3>
              <dl>
                <div><dt>患者背景：</dt><dd>{{ item.background }}</dd></div>
                <div><dt>诊疗路径：</dt><dd>{{ item.path }}</dd></div>
                <div><dt>{{ item.timing.split('：')[0] }}：</dt><dd>{{ item.timing.split('：')[1] }}</dd></div>
              </dl>
            </div>
          </article>
        </div>

        <div v-else class="case-empty">
          <Search class="h-7 w-7" />
          <h2>暂未找到完全匹配的案例</h2>
          <p>调整筛选条件，或使用智能匹配获取更接近的参考路径。</p>
          <button type="button" @click="resetFilters">查看全部案例</button>
        </div>
      </div>
    </section>

    <section class="case-summary" aria-label="服务数据">
      <div class="hy-container">
        <div><CountUpNumber value="500+" /><span>已协助国际患者完成咨询</span></div>
        <div><CountUpNumber value="30+" /><span>覆盖国家和地区来源</span></div>
        <div><CountUpNumber value="2-14" /><span>工作日预约响应参考</span></div>
        <div><CountUpNumber value="100%" /><span>费用就诊前书面预估</span></div>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="matcher">
        <div v-if="matchOpen" class="matcher-backdrop" @mousedown.self="closeMatcher">
          <section ref="matcherDialog" class="matcher-dialog" role="dialog" aria-modal="true" aria-labelledby="matcher-title">
            <header>
              <div>
                <h2 id="matcher-title">智能匹配</h2>
              </div>
              <button ref="closeButton" type="button" aria-label="关闭智能匹配" @click="closeMatcher"><img src="/images/figma/smart-match-close.svg" alt="" /></button>
            </header>

            <div class="matcher-dialog__body">
              <fieldset>
                  <legend><b>1</b><span>您主要关注哪类健康问题?<em>*</em></span></legend>
                <p>选择大类即可，无需填写具体病情</p>
                <div class="matcher-options matcher-options--wide">
                  <button
                    v-for="item in ['肿瘤科', '心血管', '骨科', '生殖医学', '消化系统', '体检筛查', '牙科', '其他']"
                    :key="item"
                    type="button"
                    :class="{ active: matcher.focus === item }"
                    @click="matcher.focus = item"
                  >{{ item }}</button>
                </div>
              </fieldset>

              <fieldset>
                <legend><b>2</b><span>方便分享一下年龄吗？</span></legend>
                <p>仅用于匹配相似案例，不作为健康判断依据</p>
                <div class="matcher-options">
                  <button
                    v-for="item in ['18-30', '31-45', '46-60', '60+']"
                    :key="item"
                    type="button"
                    :class="{ active: matcher.age === item }"
                    @click="matcher.age = item"
                  >{{ item }}</button>
                </div>
              </fieldset>

              <fieldset>
                  <legend><b>3</b><span>您计划在哪个时间段就医?</span></legend>
                <p>选择您方便就诊的时段，便于我们提前为您安排与准备</p>
                <div class="matcher-options">
                  <button
                    v-for="item in ['1个月内', '1-3个月', '3-6个月', '暂未确定']"
                    :key="item"
                    type="button"
                    :class="{ active: matcher.timing === item }"
                    @click="matcher.timing = item"
                  >{{ item }}</button>
                </div>
              </fieldset>
            </div>

            <footer>
              <button type="button" :disabled="!canMatch" @click="submitMatch">
                为我推荐相似病例 <img src="/images/figma/smart-match-arrow.svg" alt="" />
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.case-page { margin-top: -72px; }
.case-hero { position: relative; min-height: 600px; overflow: hidden; background: #edf7fb; }
.case-hero::before { position:absolute; inset:0; background:linear-gradient(90deg,rgba(239,248,252,.98) 0%,rgba(239,248,252,.86) 45%,rgba(239,248,252,.1) 73%),url('/images/patient-case.jpg') 82% 35%/52% auto no-repeat; content:''; }
.case-hero__shape { position: absolute; top: 0; right: -1px; width: 34%; height: 100%; border-left:1px solid rgba(54,120,239,.07); background: rgba(229,242,248,.14); clip-path: polygon(58% 0, 100% 0, 100% 100%, 0 100%); }
.case-hero__content { position: relative; z-index: 1; padding-top: 185px; padding-bottom: 80px; }
.case-hero h1 { max-width: 700px; margin: 17px 0 18px; color: #173565; font-size: 48px; line-height: 1.22; font-weight: 760; }
.case-hero p { max-width: 600px; margin: 0; color: #667987; font-size: 14px; line-height: 1.8; }
.case-match-button { display: inline-flex; min-height: 46px; align-items: center; gap: 9px; margin-top: 30px; border: 0; border-radius: 7px; padding: 0 21px; background: #173565; color: #fff; box-shadow: 0 10px 22px rgba(23, 53, 101, .16); font-size: 12px; font-weight: 700; cursor: pointer; transition: transform .28s cubic-bezier(.22, 1, .36, 1), background .2s ease, box-shadow .28s ease; }
.case-match-button svg:last-child { margin-left: 4px; transition: transform .25s ease; }
.case-match-button:hover { background: #214879; box-shadow: 0 17px 34px rgba(23, 53, 101, .24); transform: translateY(-3px); }
.case-match-button:hover svg:last-child { transform: translateX(4px); }

.case-directory { scroll-margin-top: 88px; background: #fff; }
.case-filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) auto auto; gap: 14px; align-items: end; }
.case-filters label { min-width: 0; }
.case-filters label > span { display: block; margin-bottom: 7px; color: #8293a1; font-size: 11px; font-weight: 700; }
.case-filters select { width: 100%; height: 50px; border: 1px solid #dce4e9; border-radius: 7px; padding: 0 40px 0 16px; outline: 0; background: #fff; color: #516676; font-size: 13px; cursor: pointer; transition: border-color .2s ease, box-shadow .2s ease; }
.case-filters select:focus { border-color: var(--hy-blue); box-shadow: 0 0 0 3px rgba(22, 133, 195, .1); }
.case-filter-submit, .case-filter-reset { display: inline-flex; height: 50px; align-items: center; justify-content: center; gap: 7px; border-radius: 7px; padding: 0 18px; font-size: 13px; font-weight: 700; cursor: pointer; transition: transform .2s ease, background .2s ease, color .2s ease; }
.case-filter-submit { border: 1px solid #e56e1b; background: #e56e1b; color: #fff; }
.case-filter-submit:hover { background: #d96111; transform: translateY(-2px); }
.case-filter-reset { border: 0; background: transparent; color: #657b8a; }
.case-filter-reset:hover { color: var(--hy-blue); }
.case-match-note { display: flex; align-items: center; gap: 10px; margin-top: 28px; border: 1px solid #cfe6f1; border-radius: 7px; padding: 13px 16px; background: #f2f9fc; color: #36576c; font-size: 13px; }
.case-match-note > svg { flex: none; color: #24a475; }
.case-match-note button { margin-left: auto; border: 0; background: transparent; color: var(--hy-blue); font-weight: 700; cursor: pointer; }
.match-note-enter-active, .match-note-leave-active { transition: opacity .25s ease, transform .35s cubic-bezier(.22, 1, .36, 1); }
.match-note-enter-from, .match-note-leave-to { opacity: 0; transform: translateY(-8px); }

.case-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; margin-top: 48px; }
.case-grid article { overflow: hidden; border: 1px solid #e7ecef; border-radius: 8px; background: #f5f6f7; transition: transform .35s cubic-bezier(.22, 1, .36, 1), box-shadow .35s ease, border-color .25s ease; }
.case-grid article:hover { border-color: #d2e3eb; box-shadow: 0 20px 48px rgba(16, 53, 76, .11); transform: translateY(-6px); }
.case-grid header { display: flex; align-items: center; gap: 13px; padding: 24px 26px 0; }
.case-avatar { width: 58px; height: 58px; flex: none; overflow: hidden; border: 3px solid #fff; border-radius: 50%; box-shadow: 0 5px 16px rgba(19, 57, 80, .12); }
.case-avatar img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.9); }
.case-grid header h2 { margin: 0; color: #213b54; font-size: 17px; }
.case-grid header p { margin: 3px 0 0; color: #8a9aa5; font-size: 11px; }
.case-grid header > span { margin-left: auto; border-radius: 20px; padding: 5px 10px; background: #dff3eb; color: #16865f; font-size: 10px; font-weight: 800; }
.case-card__body { padding: 27px 26px 30px; }
.case-card__body h3 { margin: 0 0 20px; color: #173653; font-size: 23px; line-height: 1.35; }
.case-card__body dl { display: grid; gap: 10px; margin: 0; }
.case-card__body dl > div { display: flex; align-items: baseline; color: #526675; font-size: 12px; line-height: 1.75; }
.case-card__body dt { flex: none; color: #253e53; font-weight: 750; }
.case-card__body dd { margin: 0; }
.case-empty { display: grid; min-height: 320px; margin-top: 48px; place-items: center; align-content: center; border: 1px dashed #cedde5; border-radius: 8px; background: #f8fbfc; color: #8093a1; text-align: center; }
.case-empty h2 { margin: 14px 0 3px; color: #26455d; font-size: 20px; }
.case-empty p { margin: 0 0 16px; font-size: 13px; }
.case-empty button { border: 0; background: transparent; color: var(--hy-blue); font-weight: 750; cursor: pointer; }

.case-summary { padding: 66px 0; background: #173565; color: #fff; }
.case-summary > div { display: grid; grid-template-columns: repeat(4, 1fr); }
.case-summary div > div { padding: 0 30px; border-left: 1px solid rgba(255, 255, 255, .13); text-align: center; }
.case-summary div > div:first-child { border-left: 0; }
.case-summary strong { display: block; color: #38d9ef; font-size: 48px; line-height: 1.1; }
.case-summary span { display: block; margin-top: 12px; color: rgba(255, 255, 255, .7); font-size: 12px; }

.matcher-backdrop { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; overflow-y: auto; padding: 28px; background: rgba(4, 22, 36, .64); backdrop-filter: blur(5px); }
.matcher-dialog { width: min(920px, 100%); max-height: calc(100vh - 56px); overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 32px 100px rgba(2, 20, 33, .3); }
.matcher-dialog > header { display: flex; align-items: flex-start; justify-content: space-between; padding: 28px 34px 17px; }
.matcher-dialog > header span { display: flex; align-items: center; gap: 7px; color: var(--hy-blue); font-size: 10px; font-weight: 800; }
.matcher-dialog > header h2 { margin: 5px 0 0; color: #173653; font-size: 31px; }
.matcher-dialog > header > button { display: grid; width: 38px; height: 38px; place-items: center; border: 0; border-radius: 50%; background: #f2f6f8; color: #587083; cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
.matcher-dialog > header > button:hover { background: #e6f2f7; color: var(--hy-blue); transform: rotate(5deg); }
.matcher-dialog__body { max-height: calc(100vh - 260px); overflow-y: auto; padding: 8px 34px 24px; }
.matcher-dialog fieldset { margin: 0; border: 0; padding: 21px 0 4px; }
.matcher-dialog fieldset + fieldset { margin-top: 8px; border-top: 1px solid #edf1f3; }
.matcher-dialog legend { display: flex; align-items: center; gap: 10px; padding: 0; color: #203b55; font-size: 20px; font-weight: 750; }
.matcher-dialog legend b { display: grid; width: 24px; height: 24px; flex: none; place-items: center; border-radius: 50%; background: #e56e1b; color: #fff; font-size: 11px; }
.matcher-dialog legend em { margin-left: 3px; color: #c63232; font-style: normal; }
.matcher-dialog fieldset > p { margin: 6px 0 14px 34px; color: #8999a4; font-size: 11px; }
.matcher-options { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-left: 34px; }
.matcher-options--wide { grid-template-columns: repeat(5, minmax(0, 1fr)); }
.matcher-options button { position: relative; display: flex; min-height: 48px; align-items: center; justify-content: center; gap: 6px; border: 1px solid #e1e7eb; border-radius: 7px; background: #f8f9fa; color: #455b6b; font-size: 13px; cursor: pointer; transition: border-color .2s ease, background .2s ease, color .2s ease, transform .2s ease; }
.matcher-options button svg { width: 0; opacity: 0; transition: width .2s ease, opacity .2s ease; }
.matcher-options button:hover { border-color: #b8d9e8; background: #f2f9fc; color: var(--hy-blue); transform: translateY(-1px); }
.matcher-options button.active { border-color: var(--hy-blue); background: #eaf6fb; color: #136f9e; font-weight: 750; }
.matcher-options button.active svg { width: 16px; opacity: 1; }
.matcher-dialog > footer { display: flex; align-items: center; justify-content: space-between; gap: 24px; border-top: 1px solid #e8eef1; padding: 20px 34px; background: #fafcfd; }
.matcher-dialog > footer p { margin: 0; color: #8b9aa4; font-size: 10px; }
.matcher-dialog > footer button { display: inline-flex; min-height: 50px; flex: none; align-items: center; gap: 9px; border: 0; border-radius: 7px; padding: 0 22px; background: #e56e1b; color: #fff; font-size: 13px; font-weight: 750; cursor: pointer; transition: background .2s ease, transform .2s ease, opacity .2s ease; }
.matcher-dialog > footer button:hover:not(:disabled) { background: #d76010; transform: translateY(-2px); }
.matcher-dialog > footer button:disabled { cursor: not-allowed; opacity: .42; }
.matcher-enter-active, .matcher-leave-active { transition: opacity .28s ease; }
.matcher-enter-active .matcher-dialog, .matcher-leave-active .matcher-dialog { transition: transform .42s cubic-bezier(.22, 1, .36, 1), opacity .28s ease; }
.matcher-enter-from, .matcher-leave-to { opacity: 0; }
.matcher-enter-from .matcher-dialog { opacity: 0; transform: translateY(26px) scale(.98); }
.matcher-leave-to .matcher-dialog { opacity: 0; transform: translateY(12px) scale(.99); }

@media (max-width: 1080px) {
  .case-filters { grid-template-columns: repeat(2, minmax(0, 1fr)) auto auto; }
  .case-hero h1 { font-size: 54px; }
}

@media (max-width: 760px) {
  .case-page { margin-top: -64px; }
  .case-hero { min-height: 540px; }
  .case-hero__shape { width: 58%; opacity: .72; }
  .case-hero__content { padding-top: 150px; padding-bottom: 62px; }
  .case-hero h1 { margin-top: 14px; font-size: 42px; }
  .case-hero p { font-size: 15px; }
  .case-match-button { min-height: 54px; margin-top: 26px; }
  .case-directory { padding-block: 68px; }
  .case-filters { grid-template-columns: 1fr 1fr; }
  .case-filter-submit, .case-filter-reset { width: 100%; }
  .case-grid { grid-template-columns: 1fr; margin-top: 34px; }
  .case-summary > div { grid-template-columns: repeat(2, 1fr); gap: 40px 0; }
  .case-summary div > div:nth-child(3) { border-left: 0; }
  .case-summary strong { font-size: 39px; }
  .matcher-backdrop { align-items: end; padding: 12px; }
  .matcher-dialog { max-height: calc(100vh - 24px); border-radius: 8px 8px 0 0; }
  .matcher-dialog > header { padding: 23px 21px 13px; }
  .matcher-dialog > header h2 { font-size: 27px; }
  .matcher-dialog__body { max-height: calc(100vh - 244px); padding: 4px 21px 20px; }
  .matcher-dialog legend { align-items: flex-start; font-size: 17px; }
  .matcher-dialog fieldset > p { margin-left: 34px; }
  .matcher-options, .matcher-options--wide { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-left: 0; }
  .matcher-dialog > footer { align-items: stretch; flex-direction: column; gap: 11px; padding: 16px 21px 20px; }
  .matcher-dialog > footer button { justify-content: center; }
}

@media (max-width: 480px) {
  .case-hero h1 { font-size: 36px; }
  .case-filters { grid-template-columns: 1fr; }
  .case-filters label > span { margin-bottom: 5px; }
  .case-grid header { position: relative; align-items: flex-start; padding: 21px 20px 0; }
  .case-grid header > span { position: absolute; top: 21px; right: 20px; }
  .case-card__body { padding: 25px 20px; }
  .case-card__body h3 { font-size: 21px; }
  .case-card__body dl > div { display: block; }
  .case-match-note { align-items: flex-start; flex-wrap: wrap; }
  .case-match-note button { margin-left: 30px; }
}

@media (prefers-reduced-motion: reduce) {
  .case-match-button, .case-grid article, .matcher-dialog, .matcher-options button { transition-duration: .01ms !important; }
}

/* Figma state 190:5550: centered 896 x 754 matcher at the authored desktop viewport. */
.matcher-backdrop {
  padding: 40px;
  background: rgba(0, 0, 0, .5);
  backdrop-filter: blur(4px);
}
.matcher-dialog {
  width: 896px;
  height: 754px;
  max-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  border-radius: 24px;
}
.matcher-dialog > header {
  position: relative;
  height: 64px;
  flex: none;
  justify-content: flex-start;
  padding: 32px 32px 0;
}
.matcher-dialog > header h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 32px;
  line-height: 32px;
  font-weight: 600;
  letter-spacing: .4px;
  text-align: left;
}
.matcher-dialog > header > button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  padding: 8px;
  backdrop-filter: blur(8px);
  border-radius: 9999px;
  background: transparent;
  color: #173653;
}
.matcher-dialog > header > button:hover {
  background: transparent;
  color: var(--hy-blue);
  transform: none;
}
.matcher-dialog__body {
  height: 558px;
  max-height: none;
  flex: none;
  overflow: visible;
  padding: 32px 32px 0;
}
.matcher-dialog fieldset {
  padding: 0;
}
.matcher-dialog fieldset + fieldset {
  margin-top: 32px;
  border-top: 0;
}
.matcher-dialog legend {
  gap: 9px;
  color: #203b55;
  font-size: 24px;
  line-height: 24px;
}
.matcher-dialog fieldset > p {
  margin: 12px 0 0 32px;
  color: #6b7280;
  font-size: 14px;
  line-height: 22px;
}
.matcher-options,
.matcher-options--wide {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-top: 24px;
  margin-left: 32px;
}
.matcher-options--wide {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  row-gap: 24px;
}
.matcher-options button {
  height: 48px;
  min-height: 48px;
  border: 0;
  border-radius: 14px;
  outline: 2px solid #f3f4f6;
  outline-offset: -2px;
  background: #f9fafb;
  color: #4b5563;
  font-size: 16px;
}
.matcher-options button.active {
  outline-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}
.matcher-options button:hover {
  transform: none;
}
.matcher-dialog > footer {
  height: 132px;
  flex: none;
  justify-content: center;
  border-top: 0;
  padding: 48px 32px 36px;
  background: #fff;
}
.matcher-dialog > footer button {
  width: auto;
  height: 48px;
  min-height: 48px;
  justify-content: center;
  border-radius: 14px;
  padding: 16px 24px;
  background: #dd6b20;
  font-size: 16px;
}
.matcher-dialog > footer button:disabled {
  opacity: 1;
}
.matcher-dialog > footer button img,
.matcher-dialog > header > button img {
  width: 20px;
  height: 20px;
  flex: none;
}

@media (max-width: 650px) {
  .matcher-backdrop { padding: 12px; }
  .matcher-dialog {
    width: 100%;
    height: auto;
    max-height: calc(100vh - 24px);
    border-radius: 24px 24px 0 0;
  }
  .matcher-dialog > header { padding: 23px 21px 13px; }
  .matcher-dialog > header h2 { font-size: 27px; }
  .matcher-dialog__body {
    height: auto;
    max-height: calc(100vh - 205px);
    flex: 1;
    overflow-y: auto;
    padding: 4px 21px 20px;
  }
  .matcher-dialog legend { font-size: 17px; line-height: 24px; }
  .matcher-dialog fieldset > p { margin: 6px 0 14px 34px; font-size: 11px; line-height: 1.5; }
  .matcher-options,
  .matcher-options--wide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-left: 0;
  }
  .matcher-dialog fieldset { padding-bottom: 21px; }
  .matcher-dialog fieldset legend,
  .matcher-dialog fieldset > p,
  .matcher-dialog fieldset .matcher-options { top: 0; }
  .matcher-options button { min-height: 48px; border-radius: 7px; font-size: 13px; }
  .matcher-dialog > footer { height: auto; align-items: stretch; flex-direction: column; gap: 11px; padding: 16px 21px 20px; }
  .matcher-dialog > footer button { width: 100%; min-height: 50px; border-radius: 7px; font-size: 13px; }
}

/* Figma node 190:5300 exact desktop geometry. */
.case-page {
  margin-top: -64px;
}
.case-page :deep(.hy-container) {
  width: min(1216px, calc(100% - 64px));
}
.case-hero {
  position: relative;
  height: 460px;
  min-height: 0;
  overflow: hidden;
  padding-top: 64px;
  background: #eef7fc;
}
.case-hero::before {
  position: absolute;
  inset: 64px 0 0;
  background: url('/images/figma/case-hero-background.png') center / cover no-repeat;
  content: '';
}
.case-hero__shape {
  display: none;
}
.case-hero__content {
  position: absolute;
  inset: 64px 0 0;
  width: 100% !important;
  height: 396px;
  padding: 0;
  overflow: visible;
  clip-path: none;
  pointer-events: none;
  white-space: normal;
}
.case-hero__content > :not(.case-match-button) {
  visibility: hidden;
}
.case-hero__content .case-match-button {
  position: absolute;
  top: 239px;
  left: max(112px, calc((100% - 1216px) / 2));
  width: 196px;
  height: 62px;
  min-height: 0;
  margin: 0;
  opacity: 0;
  pointer-events: auto;
}

.case-directory {
  height: 622px;
  padding: 96px 0;
  background: #fff;
}
.case-filters {
  grid-template-columns: repeat(4, minmax(0, 216px)) auto auto;
  gap: 16px;
  align-items: center;
}
.case-filters label > span {
  display: none;
}
.case-filters select,
.case-filter-submit,
.case-filter-reset {
  height: 42px;
}
.case-filters select {
  border-radius: 10px;
  padding: 0 38px 0 16px;
  color: #9aa9b7;
  font-size: 16px;
}
.case-filter-submit {
  min-width: 100px;
  border-radius: 15px;
  padding: 0 18px;
  font-size: 16px;
}
.case-filter-reset {
  min-width: 104px;
  border: 1px solid #dce4e9;
  border-radius: 15px;
  padding: 0 16px;
  color: #8795a3;
  font-size: 16px;
}
.case-grid {
  grid-template-columns: repeat(2, 389px);
  gap: 24px;
  margin-top: 46px;
}
.case-grid article {
  height: 332px;
  border: 0;
  border-radius: 24px;
  box-shadow: none;
}
.case-grid header {
  padding: 23px 24px 0;
}
.case-avatar {
  width: 58px;
  height: 58px;
}
.case-avatar img {
  transform: scale(1);
}
.case-grid header h2 {
  font-size: 18px;
}
.case-grid header p {
  font-size: 14px;
}
.case-grid header > span {
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
}
.case-card__body {
  padding: 38px 24px 24px;
}
.case-card__body h3 {
  margin-bottom: 21px;
  font-size: 24px;
}
.case-card__body dl {
  gap: 7px;
}
.case-card__body dl > div {
  font-size: 14px;
  line-height: 1.55;
}

.case-summary {
  height: 284px;
  padding: 96px 0;
  background: #1e3a5f url('/images/figma/case-summary-background.png') center / cover no-repeat;
}
.case-summary > .hy-container {
  width: 1px !important;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

@media (max-width: 900px) {
  .case-filters {
    grid-template-columns: repeat(2, minmax(0, 1fr)) auto auto;
  }
  .case-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .case-page :deep(.hy-container) {
    width: calc(100% - 32px);
  }
  .case-hero {
    height: 620px;
    padding-top: 64px;
  }
  .case-hero::before {
    inset: 64px 0 0;
    background:
      linear-gradient(180deg, rgba(238, 247, 252, 0.05), #eef7fc 74%),
      url('/images/figma/case-hero-background.png') 72% center / cover no-repeat;
  }
  .case-hero__content {
    position: relative;
    inset: auto;
    display: flex;
    width: calc(100% - 32px) !important;
    height: 556px;
    flex-direction: column;
    justify-content: flex-end;
    overflow: visible;
    padding-bottom: 54px;
    pointer-events: auto;
  }
  .case-hero__content > :not(.case-match-button) {
    visibility: visible;
  }
  .case-hero__content .case-match-button {
    position: static;
    width: auto;
    height: auto;
    min-height: 54px;
    margin-top: 26px;
    opacity: 1;
  }
  .case-directory {
    height: auto;
    padding: 64px 0;
  }
  .case-filters,
  .case-grid {
    grid-template-columns: 1fr;
  }
  .case-grid article {
    height: 332px;
  }
  .case-summary {
    height: auto;
    padding: 64px 0;
    background: #1e3a5f;
  }
  .case-summary > .hy-container {
    width: calc(100% - 32px) !important;
    height: auto;
    overflow: visible;
    clip-path: none;
  }
}
</style>
