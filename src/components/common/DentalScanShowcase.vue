<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteCopy } from '@/i18n/siteCopy'

type Project = { id:string; title:string; price:string; duration:string }
type Tooth = { side:number; index:number; w:number; h:number; type:string; cx:number; top:number; rotate:number; projectId:string; path:string; hot:boolean }
const props = defineProps<{ projects:Project[] }>()
const emit = defineEmits<{ height:[height:number] }>()
const { t, locale } = useI18n()
const { tx } = useSiteCopy()
const specs = [
  {w:40,h:76,type:'flat',projectId:'whitening'}, {w:34,h:64,type:'flat',projectId:'veneer'},
  {w:30,h:69,type:'point',projectId:'aligner'}, {w:33,h:50,type:'molar',projectId:'periodontal'},
  {w:34,h:48,type:'molar',projectId:'root-canal'}, {w:41,h:46,type:'molar',projectId:'crown'},
  {w:39,h:44,type:'molar',projectId:'implant'},
]
const hot = [[1,6],[-1,1],[1,0],[-1,5]]
function pathFor(w:number,h:number,type:string) {
  if(type==='point') return `M ${-w/2+5} 0 Q ${-w/2} 0 ${-w/2} 7 L ${-w/2+3} ${h*.52} Q ${-w/2+5} ${h*.78} 0 ${h} Q ${w/2-5} ${h*.78} ${w/2-3} ${h*.52} L ${w/2} 7 Q ${w/2} 0 ${w/2-5} 0 Z`
  if(type==='molar') return `M ${-w/2+6} 3 Q ${-w/2} 3 ${-w/2} 10 L ${-w/2+1} ${h-9} Q ${-w/2+1} ${h-1} ${-w/2+9} ${h-1} L ${w/2-9} ${h-1} Q ${w/2-1} ${h-1} ${w/2-1} ${h-9} L ${w/2} 10 Q ${w/2} 3 ${w/2-6} 3 Q ${w*.22} -4 ${w*.13} 2.5 Q 0 -4 ${-w*.13} 2.5 Q ${-w*.22} -4 ${-w/2+6} 3 Z`
  return `M ${-w/2+6} 0 Q ${-w/2} 0 ${-w/2} 7 L ${-w/2+1} ${h-15} Q ${-w/2+1} ${h-3} ${-w/2+9} ${h-2} L ${w/2-9} ${h-2} Q ${w/2-1} ${h-3} ${w/2-1} ${h-15} L ${w/2} 7 Q ${w/2} 0 ${w/2-6} 0 Z`
}
const teeth:Tooth[] = [-1,1].flatMap(side=>{ let x=0; return specs.map((s,index)=>{const cx=320+side*(x+s.w/2),d=Math.abs(cx-320)/300; x+=s.w+5;return {...s,side,index,cx,top:250-104*Math.pow(d,1.65),rotate:side*Math.pow(d,1.5)*15,path:pathFor(s.w,s.h,s.type),hot:hot.some(h=>h[0]===side&&h[1]===index)} }) })
const gumPath = (()=>{ const pts=teeth.map(t=>({x:t.cx,y:t.top-14})).sort((a,b)=>a.x-b.x); const first=pts[0]!,last=pts[pts.length-1]!; const all=[{x:first.x-26,y:first.y},...pts,{x:last.x+26,y:last.y}]; let d=`M ${all[0]!.x} ${all[0]!.y}`; for(let i=1;i<all.length;i++){const a=all[i-1]!,b=all[i]!;d+=` Q ${a.x} ${a.y} ${(a.x+b.x)/2} ${(a.y+b.y)/2}`}return `${d} L ${last.x+26} ${last.y}` })()
const root = ref<HTMLElement>(), card = ref<HTMLElement>(), viewport = ref<HTMLElement>(), tip = ref<HTMLElement>()
const current = shallowRef<Tooth|null>(null), white = ref(false), visible = ref(false), reduced = ref(false), beam = ref(-80)
const lastShown = shallowRef<Tooth|null>(null)
const tipLeft = ref(0), tipTop = ref(0), tilt = ref('')
const activeProject = computed(()=>lastShown.value && props.projects.find(p=>p.id===lastShown.value!.projectId))
const scanPercent = computed(()=>Math.round(Math.max(0,Math.min(1,(beam.value+80)/800))*100))
const particles = Array.from({length:12},(_,i)=>({left:`${7+(i*41)%86}%`,top:`${56+(i*23)%37}%`,size:`${4+(i*13)%7}px`,duration:`${5+(i*17)%6}s`,delay:`-${(i*7)%6}s`}))
const sparks = [[44,52],[50,46],[56,54],[47,63],[53,62],[50,30]]
let frame=0,last=0,cycle:ReturnType<typeof setInterval>|undefined,hide:ReturnType<typeof setTimeout>|undefined,observer:IntersectionObserver|undefined,cardObserver:ResizeObserver|undefined,motion:MediaQueryList|undefined,lastUser=0,hotIndex=0
let pointerTooth:Tooth|null=null, focusedTooth:Tooth|null=null
async function select(tooth:Tooth,user=false) {
  clearTimeout(hide); current.value=tooth; lastShown.value=tooth
  if(user) lastUser=Date.now()
  await nextTick()
  positionTip(tooth)
}
function positionTip(tooth:Tooth) {
  if(!viewport.value || !tip.value || current.value!==tooth)return
  const width=viewport.value.clientWidth, height=viewport.value.clientHeight, half=tip.value.offsetWidth/2+4
  // The SVG uses xMidYMid meet: on wide desktop cards its drawing occupies
  // only the centered portion of the viewport, not the full viewport width.
  const scale=Math.min(width/640,height/520)
  const offsetX=(width-640*scale)/2, offsetY=(height-520*scale)/2
  tipLeft.value=Math.max(half+6,Math.min(width-half-6,offsetX+tooth.cx*scale))
  // Longer translations wrap onto additional lines. Position from the actual
  // tooltip height so its arrow stays above the selected tooth in every locale.
  tipTop.value=Math.max(10,offsetY+(tooth.top+tooth.h*.35)*scale-tip.value.offsetHeight-6)
}
watch(locale, async () => { await nextTick(); if(current.value) positionTip(current.value) })
function deselect(tooth:Tooth) { if(current.value===tooth)current.value=null }
function enter(tooth:Tooth) { pointerTooth=tooth; void select(tooth,true) }
function leave(tooth:Tooth) {
  if(pointerTooth===tooth)pointerTooth=null
  if(current.value!==tooth)return
  if(focusedTooth)void select(focusedTooth)
  else deselect(tooth)
}
function focus(tooth:Tooth, event:FocusEvent) {
  if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return
  focusedTooth=tooth; void select(tooth,true)
}
function blur(tooth:Tooth) {
  if(focusedTooth===tooth)focusedTooth=null
  if(current.value!==tooth)return
  if(pointerTooth)void select(pointerTooth)
  else deselect(tooth)
}
function tick(now:number){if(!visible.value||reduced.value){frame=0;return}if(!last)last=now;beam.value+=Math.min(.05,(now-last)/1000)*215;last=now;if(beam.value>720)beam.value=-80;frame=requestAnimationFrame(tick)}
function sync() {
  if(frame)cancelAnimationFrame(frame);if(cycle)clearInterval(cycle);clearTimeout(hide);frame=0;last=0
  if(!visible.value||reduced.value){
    if(!pointerTooth&&!focusedTooth)current.value=null
    if(reduced.value)beam.value=720
    return
  }
  frame=requestAnimationFrame(tick)
  cycle=setInterval(()=>{if(pointerTooth||focusedTooth||Date.now()-lastUser<6000)return;const h=hot[hotIndex++%hot.length]!;const tooth=teeth.find(x=>x.side===h[0]&&x.index===h[1]);if(tooth){void select(tooth);hide=setTimeout(()=>{if(current.value===tooth&&pointerTooth!==tooth&&focusedTooth!==tooth)deselect(tooth)},2600)}},3400)
}
function onMotion(){reduced.value=Boolean(motion?.matches);sync()}
function toggleWhite(){white.value=!white.value;if(white.value&&!reduced.value)beam.value=-80}
function move(event:MouseEvent){if(reduced.value||!root.value)return;const r=root.value.getBoundingClientRect();tilt.value=`rotateY(${((event.clientX-r.left)/r.width-.5)*4}deg) rotateX(${(-((event.clientY-r.top)/r.height-.5))*3}deg)`}
onMounted(()=>{motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',onMotion);reduced.value=motion.matches;observer=new IntersectionObserver(entries=>{visible.value=Boolean(entries[0]?.isIntersecting);sync()},{threshold:.05});if(root.value)observer.observe(root.value);cardObserver=new ResizeObserver(()=>{if(card.value)emit('height',96+card.value.offsetHeight)});if(card.value)cardObserver.observe(card.value)})
onBeforeUnmount(()=>{observer?.disconnect();cardObserver?.disconnect();motion?.removeEventListener('change',onMotion);if(frame)cancelAnimationFrame(frame);if(cycle)clearInterval(cycle);clearTimeout(hide)})
</script>

<template>
  <section class="dental-scan" :aria-label="t('dentalScan.label')">
    <div ref="root" class="scan-stage" @mousemove="move" @mouseleave="tilt=''">
    <div ref="card" class="scan-card" :class="{ white }" :style="{ transform:tilt }">
      <div ref="viewport" class="scan-viewport">
        <div class="scan-grid" />
        <div class="scan-corner tl"/><div class="scan-corner tr"/><div class="scan-corner bl"/><div class="scan-corner br"/>
        <div class="scan-label"><span class="scan-pulse"/>{{ t('dentalScan.label') }}<span class="scan-progress">SCAN {{ scanPercent }}%</span></div>
        <svg class="scan-arch" viewBox="0 0 640 520" preserveAspectRatio="xMidYMid meet" role="group" :aria-label="t('dentalScan.choose')">
          <defs>
            <linearGradient id="dental-scan-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8ED4F2" stop-opacity="0"/><stop offset=".5" stop-color="#8ED4F2" stop-opacity=".85"/><stop offset="1" stop-color="#8ED4F2" stop-opacity="0"/></linearGradient>
            <linearGradient id="dental-scan-gum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D3C9"/><stop offset="1" stop-color="#EFC3B8"/></linearGradient>
            <path v-for="tooth in teeth" :id="`dental-tooth-${tooth.side}-${tooth.index}`" :key="`${tooth.side}-${tooth.index}`" :d="tooth.path"/>
            <clipPath id="dental-scan-clip"><use v-for="tooth in teeth" :key="`${tooth.side}-${tooth.index}`" :href="`#dental-tooth-${tooth.side}-${tooth.index}`" :transform="`translate(${tooth.cx} ${tooth.top}) rotate(${tooth.rotate})`"/></clipPath>
          </defs>
          <g fill="none" stroke-linecap="round"><path :d="gumPath" stroke="#F8E3DC" stroke-width="26" opacity=".55"/><path :d="gumPath" stroke="url(#dental-scan-gum)" stroke-width="13"/><path :d="gumPath" stroke="#E5B1A4" stroke-width="2.5" opacity=".8"/></g>
          <g v-for="tooth in teeth" :key="`${tooth.side}-${tooth.index}`" :transform="`translate(${tooth.cx} ${tooth.top}) rotate(${tooth.rotate})`">
            <g class="scan-tooth-group" :class="{ selected:current===tooth, lit: !reduced && Math.abs(beam+32-tooth.cx)<34 }" role="img" tabindex="0" :aria-label="tx(props.projects.find(p=>p.id===tooth.projectId)?.title || '')" @mouseenter="enter(tooth)" @mouseleave="leave(tooth)" @pointerdown.prevent @focus="focus(tooth, $event)" @blur="blur(tooth)">
              <use :href="`#dental-tooth-${tooth.side}-${tooth.index}`" class="scan-tooth"/><ellipse :cx="-tooth.w*.18" :cy="tooth.h*.3" :rx="tooth.w*.16" :ry="tooth.h*.28" class="scan-glint"/>
              <template v-if="tooth.hot"><circle cx="0" cy="-9" r="5" class="scan-marker"><template v-if="!reduced"><animate attributeName="r" values="5;14;5" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="2.4s" repeatCount="indefinite"/></template></circle><circle cx="0" cy="-9" r="2.6" class="scan-marker-dot"/></template>
            </g>
          </g>
          <g v-if="!reduced" clip-path="url(#dental-scan-clip)"><rect :x="beam" y="0" width="64" height="520" fill="url(#dental-scan-beam)"/></g><rect v-if="!reduced" :x="beam+31" y="0" width="2" height="520" fill="#8ED4F2" opacity=".55"/>
        </svg>
        <div v-if="!reduced" class="scan-faint" :style="{left:`${beam/640*100}%`}"/>
        <div ref="tip" class="scan-tip" :class="{ show:current }" :style="{left:`${tipLeft}px`,top:`${tipTop}px`}" aria-live="polite"><template v-if="lastShown && activeProject"><b>{{ tx(activeProject.title) }}<span class="scan-price">{{ tx(activeProject.price) }}</span></b><span>{{ t(`dentalScan.description.${lastShown.projectId}`) }}</span><br/><span class="scan-duration">{{ t('dentalScan.duration') }} {{ tx(activeProject.duration) }}</span></template></div>
        <div aria-hidden="true"><div v-for="(pos,index) in sparks" :key="index" class="scan-spark" :style="{left:`${pos[0]}%`,top:`${pos[1]}%`,animationDelay:`${index*.3}s`}"/></div>
        <div aria-hidden="true"><div v-for="(dot,index) in particles" :key="index" class="scan-particle" :style="{left:dot.left,top:dot.top,width:dot.size,height:dot.size,animationDuration:dot.duration,animationDelay:dot.delay}"/></div>
      </div>
      <div class="scan-dock"><div class="scan-dock-info"><template v-if="current && activeProject"><b>{{ tx(activeProject.title) }}</b> · {{ t(`dentalScan.description.${current.projectId}`) }} · <span>{{ tx(activeProject.price) }}</span> · {{ t('dentalScan.duration') }} {{ tx(activeProject.duration) }}</template><template v-else>{{ t('dentalScan.hint') }}</template></div><button type="button" class="scan-white-button" :class="{on:white}" role="switch" :aria-checked="white" @click="toggleWhite"><span class="scan-switch"/><span>{{ white ? t('dentalScan.whitenOn') : t('dentalScan.whiten') }}</span></button></div>
    </div>
    </div>
  </section>
</template>

<style scoped>
.dental-scan{padding:0 112px;box-sizing:border-box;isolation:isolate;font-family:'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;color:#12232e;line-height:1.6}
.dental-scan::before{content:'';position:absolute;top:0;bottom:0;left:50%;width:max(100%,100vw);transform:translateX(-50%);background:linear-gradient(180deg,#f2f9fc,#fff);z-index:-1;pointer-events:none}
.scan-stage{position:relative;padding:96px 0 0;perspective:1200px}
.scan-card{position:relative;background:#fff;border:1px solid #dde8f0;border-radius:26px;box-shadow:0 30px 80px -30px rgba(10,53,86,.35);padding:22px 22px 14px;transition:transform .18s ease-out;will-change:transform;box-sizing:border-box}
.scan-viewport{position:relative;height:560px;border-radius:14px;background:linear-gradient(165deg,#f7fcff 0%,#ebf5fa 55%,#e2f0f8 100%);overflow:hidden;border:1px solid #dceaf3;box-sizing:border-box}
.scan-grid{position:absolute;inset:0;background-image:radial-gradient(circle,#c9deea 1px,transparent 1px);background-size:22px 22px;opacity:.5}.scan-corner{position:absolute;width:18px;height:18px;border-color:#1b8fc4;border-style:solid;border-width:0;z-index:5;box-sizing:border-box}.scan-corner.tl{top:12px;left:12px;border-top-width:2px;border-left-width:2px}.scan-corner.tr{top:12px;right:12px;border-top-width:2px;border-right-width:2px}.scan-corner.bl{bottom:12px;left:12px;border-bottom-width:2px;border-left-width:2px}.scan-corner.br{bottom:12px;right:12px;border-bottom-width:2px;border-right-width:2px}
.scan-label{position:absolute;top:14px;left:40px;font-size:10.5px;letter-spacing:2px;color:#0b6e99;font-weight:700;display:flex;align-items:center;gap:8px;z-index:5}.scan-pulse{width:7px;height:7px;border-radius:50%;background:#1b8fc4;animation:scan-pulse 1.6s infinite}.scan-progress{margin-left:14px;font-size:10.5px;letter-spacing:1.6px;color:#8fb2c6;font-weight:700;font-variant-numeric:tabular-nums;white-space:nowrap}@keyframes scan-pulse{0%,100%{box-shadow:0 0 0 0 rgba(27,143,196,.5)}50%{box-shadow:0 0 0 6px rgba(27,143,196,0)}}
.scan-arch{position:absolute;inset:0;width:100%;height:100%}.scan-faint{position:absolute;top:0;bottom:0;width:70px;background:linear-gradient(90deg,transparent,rgba(140,210,240,.14),transparent);pointer-events:none;z-index:3}.scan-tooth{fill:#fbf1de;stroke:#dcc9a4;stroke-width:1.6;transition:fill .45s,stroke .45s}.scan-tooth-group{cursor:pointer;transition:transform .28s cubic-bezier(.34,1.56,.64,1);transform-box:fill-box;transform-origin:center}.scan-tooth-group:hover{transform:scale(1.09)}.scan-tooth-group.lit .scan-tooth,.scan-tooth-group.selected .scan-tooth{fill:#fff;stroke:#58b7e2;filter:drop-shadow(0 0 7px rgba(95,192,232,.85))}.scan-glint{fill:#fff;opacity:.5;pointer-events:none;transition:opacity .4s}.scan-tooth-group.lit .scan-glint,.scan-tooth-group.selected .scan-glint,.white .scan-glint{opacity:.9}.white .scan-tooth{fill:#fff;stroke:#cfe6f2;filter:drop-shadow(0 0 5px rgba(140,210,240,.5))}.scan-marker{fill:none;stroke:#1b8fc4;stroke-width:1.6;pointer-events:none}.scan-marker-dot{fill:#1b8fc4;pointer-events:none}.scan-tooth-group:focus-visible{outline:none}.scan-tooth-group:focus-visible .scan-tooth{stroke:#0876ac;stroke-width:3}
.scan-tooth-group:focus{outline:none}
.scan-tip{position:absolute;z-index:8;background:#0a3556;color:#fff;border-radius:10px;padding:10px 14px 11px;font-size:12px;box-shadow:0 14px 34px -12px rgba(10,53,86,.55);opacity:0;transform:translate(-50%,6px);transition:opacity .22s,transform .22s;pointer-events:none;min-width:172px;max-width:240px;box-sizing:border-box;overflow-wrap:anywhere}.scan-tip.show{opacity:1;transform:translate(-50%,0)}.scan-tip::after{content:'';position:absolute;left:50%;bottom:-5px;width:10px;height:10px;background:#0a3556;transform:translateX(-50%) rotate(45deg)}.scan-tip b{display:block;font-size:13.5px;margin-bottom:2px}.scan-tip .scan-price{color:#8fd4f2;font-weight:700;margin-left:6px}.scan-tip span{color:rgba(255,255,255,.65);font-size:11px}.scan-tip .scan-duration{display:inline-block;margin-top:5px;background:rgba(95,192,232,.18);border:1px solid rgba(95,192,232,.4);border-radius:4px;padding:1px 7px;color:#9fdcf5;font-size:10.5px}
.scan-spark{position:absolute;color:#7fcff2;font-size:0;pointer-events:none;z-index:6;opacity:0}.scan-spark::before{content:'✦';font-size:15px;text-shadow:0 0 8px rgba(127,207,242,.9)}.white .scan-spark{animation:scan-twinkle 1.8s ease-in-out infinite}@keyframes scan-twinkle{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(25deg)}}.scan-particle{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(95,192,232,.85),rgba(95,192,232,0) 70%);pointer-events:none;animation:scan-float linear infinite}@keyframes scan-float{0%{transform:translateY(0);opacity:0}12%,88%{opacity:.9}100%{transform:translateY(-46px);opacity:0}}
.scan-dock{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 144px 0 4px}.scan-dock-info{font-size:12.5px;color:#63798a;min-height:20px;transition:.2s;overflow-wrap:anywhere}.scan-dock-info b{color:#0a3556}.scan-dock-info span{color:#0b6e99;font-weight:700}.scan-white-button{display:flex;align-items:center;gap:8px;border:1.5px solid #dde8f0;background:#fff;border-radius:20px;padding:6px 14px 6px 8px;font-size:12px;font-weight:600;color:#0a3556;cursor:pointer;transition:.25s;flex:none;font-family:Arial,sans-serif;line-height:normal}.scan-switch{width:26px;height:15px;border-radius:8px;background:#d8e4ec;position:relative;transition:.25s}.scan-switch::after{content:'';position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:.25s;box-shadow:0 1px 3px rgba(0,0,0,.25)}.scan-white-button.on{border-color:#1b8fc4;color:#0b6e99}.scan-white-button.on .scan-switch{background:#1b8fc4}.scan-white-button.on .scan-switch::after{left:13px}.scan-white-button:focus-visible{outline:2px solid #238cc5;outline-offset:3px}
@media(prefers-reduced-motion:reduce){.scan-card,.scan-tooth-group,.scan-tooth,.scan-glint,.scan-tip,.scan-white-button,.scan-switch,.scan-switch::after{transition:none}.scan-pulse,.scan-particle,.white .scan-spark{animation:none}}
</style>
