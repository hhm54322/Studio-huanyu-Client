<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HomeSourceNode from './HomeSourceNode.vue'
import TrustArticleDialog from './TrustArticleDialog.vue'
import { sourceAtOrigin } from '@/data/hospitalFigmaSource'
import { trustSource, trustTravel, trustAftercare, trustAssuranceState, trustNode, trustNodes, trustDescendants, trustArticles, trustAssurances, trustFaqRows, trustActions, type TrustArticleKey } from '@/data/trustFigmaSource'
const width = ref(innerWidth)
// Keep reading state in the route owner, so a responsive branch switch does
// not discard cards and FAQ answers the visitor has already opened.
const expanded = defineModel<Set<number>>('expandedAssurances', { required: true })
const expandedFaq = defineModel<Set<number>>('expandedFaq', { required: true })
const article = ref<TrustArticleKey | null>(null), languageOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const toolkitOffset = ref(0)
let stickyFrame = 0
let trigger: HTMLElement | null = null
const scale = computed(() => Math.min(1, width.value / 1440))
const extraHeight = trustTravel.height + trustAftercare.height
const answerHeight = trustNode('143:2605').height
const faqDelta = computed(() => (expandedFaq.value.size - 1) * answerHeight)
const pageHeight = computed(() => trustSource.height + extraHeight + faqDelta.value)
const assuranceNodes = new Map(trustDescendants(trustAssuranceState).map(n => [n.id, n]))
const assuranceDetails = [
  ['143:2552', '143:2544'],
  ['143:3644', '143:2559'],
  ['143:3658', '143:2570'],
  ['143:3672', '143:2581'],
] as const
const baselineNodes = [...trustNodes.values(), ...assuranceNodes.values()].filter(n => n.textLines).map(n => n.id)
const texts = { '143:2669': '一药一码，全链路可追溯', '1582:2019': '预约专家面诊 $200起' }
const faqCopy = ['', '根据疾病类型和治疗方向，优先匹配主任医师、教授、学科带头人及多学科会诊团队，专家信息可在预约前核验。', '合作医院执行国家医疗质量和院感规范，部分机构通过 JCI 等国际体系认证，具体标准会随医院推荐一并说明。', '平台会按病情核对药物可及性、设备条件和适应证，涉及具体用药与治疗方案时，以执业医生评估为准。']
const attributes = computed(() => {
  const result: Record<string, Record<string, string | number | boolean>> = {}
  trustArticles.forEach(([id,key,title,heading]) => { result[id] = { role:'button', tabindex:0, 'aria-label':`阅读全文：${title}`, 'aria-haspopup':'dialog', 'data-trust-article':key }; result[heading] = {role:'heading','aria-level':3} })
  trustAssurances.forEach((id,i) => { result[id] = {'aria-expanded':expanded.value.has(i),'data-trust-assurance':i} })
  ;['143:2598','143:2611','143:2619','143:2627'].forEach((id,i) => { result[id] = {'aria-expanded':expandedFaq.value.has(i),'aria-controls':`trust-answer-${i}`} })
  result['143:2605']={id:'trust-answer-0'}
  return result
})
const styles = computed(() => {
  const result: Record<string,string>={}
  result['204:5638']=`transform:translateY(${toolkitOffset.value}px);`
  trustAssurances.forEach((id,i) => {
    const expandedHeight = i === 1 ? 350 : 374
    result[id]=`height:${expanded.value.has(i)?expandedHeight:262}px;overflow:hidden;`
  })
  assuranceDetails.forEach(([id], i) => { result[id]=`visibility:${expanded.value.has(i)?'visible':'hidden'};` })
  let top=67
  trustFaqRows.forEach((id,i) => { const height=78+(expandedFaq.value.has(i)?answerHeight:0); result[id]=`top:${top}px;height:${height}px;`; top+=height })
  result['143:2605']=`height:${expandedFaq.value.has(0)?answerHeight:0}px;overflow:hidden;`
  // The exported SVG already contains the selected node's 180-degree matrix.
  // Apply that transform once, retaining the copied 2.08px vertical inset.
  ;['143:2602','143:2615','143:2623','143:2631'].forEach(id=>{result[id]='left:0;top:2.08px;transform:none;'})
  ;['143:2601','143:2614','143:2622','143:2630'].forEach((id,i) => {result[id]=`transform:rotate(${expandedFaq.value.has(i)===(i===0)?0:180}deg);`})
  return result
})
const pageTree = computed(() => {
  const node=structuredClone(trustSource),nodes=new Map(trustDescendants(node).map(n=>[n.id,n]))
  // Add the three authored expanded subtrees (including exact text lines and
  // Dev Mode styles), rather than rebuilding their copy and geometry by hand.
  assuranceDetails.slice(1).forEach(([id, parent]) => {
    nodes.get(parent)!.children.push(structuredClone(assuranceNodes.get(id)!))
  })
  for(const id of ['143:2528','143:2529','143:2530']){const n=nodes.get(id)!;n.height+=extraHeight+faqDelta.value;n.css+=`;height:${n.height}px;`}
  const faq=nodes.get('143:2589')!;faq.height+=faqDelta.value;faq.css+=`;height:${faq.height}px;`
  for(const id of ['143:2638','204:5636','1582:2002','143:2937']){const n=nodes.get(id)!;n.y+=faqDelta.value;if(['1582:2002','143:2937'].includes(id))n.y+=extraHeight;n.css+=`;top:${n.y}px;`}
  const toolkit=nodes.get('204:5636')!;toolkit.height+=extraHeight;toolkit.css+=`;height:${toolkit.height}px;overflow:visible;`
  const first=nodes.get('204:5637')!,fixed=nodes.get('204:5638')!
  first.children=first.children.filter(n=>n.id!==fixed.id)
  fixed.css+=';position:absolute;left:112px;top:273px;height:204px;z-index:1;'
  nodes.get('204:5639')!.css+=';top:0;'
  toolkit.children.unshift(fixed)
  for(const [source,offset,left] of [[trustTravel,754,'204:5815'],[trustAftercare,2029,'204:6015']] as const){
    const stage=structuredClone(source);stage.css+=`;position:absolute;left:0;top:${offset}px;`
    trustDescendants(stage).find(n=>n.id===left)!.visible=false;toolkit.children.push(stage)
  }
  nodes.get('484:1463')!.visible=false
  return sourceAtOrigin(node)
})
function activate(value:string){
  if(value==='consultation')window.dispatchEvent(new CustomEvent('open-consultation'))
  else if(value==='language')languageOpen.value=!languageOpen.value
  else if(value.startsWith('assurance:')){const i=Number(value.split(':')[1]),next=new Set(expanded.value);next.has(i)?next.delete(i):next.add(i);expanded.value=next}
  else if(value.startsWith('faq:')){const i=Number(value.split(':')[1]),next=new Set(expandedFaq.value);next.has(i)?next.delete(i):next.add(i);expandedFaq.value=next}
}
function openArticle(event:MouseEvent|KeyboardEvent){
  const el=(event.target as HTMLElement).closest<HTMLElement>('[data-trust-article]')
  if(!el || event instanceof KeyboardEvent && !['Enter',' '].includes(event.key))return
  event.preventDefault();trigger=el;el.focus({preventScroll:true});article.value=el.dataset.trustArticle as TrustArticleKey
}
async function closeArticle(){article.value=null;await nextTick();trigger?.focus({preventScroll:true})}
function updateToolkitSticky(){
  stickyFrame=0
  const toolkit=root.value?.querySelector<HTMLElement>('[data-figma-node="204:5636"]')
  if(!toolkit)return
  // Use the copied 273px resting position and 96px bottom section padding.
  // A source canvas is scaled below 1440px; native CSS sticky would then use
  // unscaled viewport coordinates and let the title scroll out of view.
  const offset=165-toolkit.getBoundingClientRect().top/scale.value-273
  toolkitOffset.value=Math.min(Math.max(0,offset),754+extraHeight-96-204-273)
}
function scheduleSticky(){if(!stickyFrame)stickyFrame=requestAnimationFrame(updateToolkitSticky)}
function resize(){width.value=innerWidth;languageOpen.value=false;void nextTick(updateToolkitSticky)}
watch(faqDelta,()=>void nextTick(updateToolkitSticky))
function outside(e:MouseEvent){if(!(e.target as HTMLElement).closest('.trust-source-languages,[data-figma-node="484:1496"]'))languageOpen.value=false}
let observer:IntersectionObserver|undefined
const animations=new Set<Animation>()
onMounted(()=>{
  addEventListener('resize',resize,{passive:true});addEventListener('scroll',scheduleSticky,{passive:true});document.addEventListener('click',outside);updateToolkitSticky()
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer?.unobserve(entry.target);const animation=entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,easing:'cubic-bezier(.22,1,.36,1)'});animations.add(animation);animation.finished.catch(()=>{}).finally(()=>animations.delete(animation))}),{threshold:.05})
  trustArticles.forEach(([id])=>{const el=root.value?.querySelector(`[data-figma-node="${id}"]`);if(el)observer?.observe(el)})
})
onBeforeUnmount(()=>{removeEventListener('resize',resize);removeEventListener('scroll',scheduleSticky);if(stickyFrame)cancelAnimationFrame(stickyFrame);document.removeEventListener('click',outside);observer?.disconnect();animations.forEach(a=>a.cancel())})
</script>
<template>
  <div ref="root" class="trust-desktop-source" :style="{height:`${pageHeight*scale}px`}" @click="openArticle" @keydown="openArticle">
    <div class="trust-desktop-source__canvas" :style="{transform:`translateX(-50%) scale(${scale})`}">
      <HomeSourceNode :node="pageTree" root :actions="trustActions" :attributes="attributes" :texts="texts" :styles="styles" :baseline-nodes="baselineNodes" @activate="activate">
        <template #after="{node}">
          <div v-if="trustFaqRows.includes(node.id)&&trustFaqRows.indexOf(node.id)>0" :id="`trust-answer-${trustFaqRows.indexOf(node.id)}`" class="trust-source-faq-answer" :style="{height:expandedFaq.has(trustFaqRows.indexOf(node.id))?`${answerHeight}px`:'0px'}" :aria-hidden="!expandedFaq.has(trustFaqRows.indexOf(node.id))"><div class="trust-source-faq-copy">{{ faqCopy[trustFaqRows.indexOf(node.id)] }}</div></div>
        </template>
      </HomeSourceNode>
    </div>
    <header class="trust-desktop-source__header">
      <div :style="{transform:`translateX(-50%) scale(${scale})`}"><HomeSourceNode :node="sourceAtOrigin(trustNode('484:1463'))" root :actions="trustActions" :baseline-nodes="baselineNodes" @activate="activate" /></div>
      <div v-if="languageOpen" class="trust-source-languages"><button type="button" @click="languageOpen=false">中文</button></div>
    </header>
    <TrustArticleDialog v-if="article" :key="article" :article="article" @close="closeArticle" />
  </div>
</template>
<style scoped>
@import url('/fonts/home-source-fonts.css');
.trust-desktop-source{position:relative;overflow-anchor:none;font-family:'PingFang SC',sans-serif;-webkit-font-smoothing:antialiased}
.trust-desktop-source__canvas,.trust-desktop-source__header>div:first-child{position:absolute;top:0;left:50%;width:1440px;transform-origin:top center}
.trust-desktop-source__header{position:fixed;inset:0 0 auto;z-index:60;height:64px;pointer-events:none}
.trust-desktop-source__header :deep(a),.trust-desktop-source__header :deep(button){pointer-events:auto}
.trust-desktop-source :deep([data-trust-article]){cursor:pointer}
.trust-desktop-source :deep([data-trust-article]:focus-visible),.trust-desktop-source :deep(button:focus-visible),.trust-desktop-source :deep(a:focus-visible){outline:2px solid #2563eb;outline-offset:3px}
.trust-source-faq-answer{position:absolute;left:0;top:77px;width:802.66669px;overflow:hidden;transition:height .38s cubic-bezier(.22,1,.36,1)}
.trust-source-faq-copy{width:100%;color:#4b5563;font-size:16px;line-height:24px;padding-bottom:23.04px}
.trust-source-languages{position:absolute;top:56px;right:max(16px,calc((100vw - 1216px)/2));border-radius:12px;background:white;box-shadow:0 12px 24px #0002;padding:12px;pointer-events:auto}
.trust-desktop-source :deep([data-trust-assurance]){transition:height .38s cubic-bezier(.22,1,.36,1)}
.trust-desktop-source :deep([data-figma-node="143:2605"]),.trust-desktop-source :deep([data-figma-node="143:2597"]),.trust-desktop-source :deep([data-figma-node="143:2610"]),.trust-desktop-source :deep([data-figma-node="143:2618"]),.trust-desktop-source :deep([data-figma-node="143:2626"]){transition:height .38s cubic-bezier(.22,1,.36,1),top .38s cubic-bezier(.22,1,.36,1)}
.trust-desktop-source :deep([data-figma-node="143:2638"]),.trust-desktop-source :deep([data-figma-node="204:5636"]),.trust-desktop-source :deep([data-figma-node="1582:2002"]),.trust-desktop-source :deep([data-figma-node="143:2937"]){transition:top .38s cubic-bezier(.22,1,.36,1)}
@media(prefers-reduced-motion:reduce){.trust-desktop-source :deep(*){transition:none!important}}
</style>
