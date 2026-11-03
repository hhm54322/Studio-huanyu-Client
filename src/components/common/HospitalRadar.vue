<script setup lang="ts">
import { useSiteCopy } from '@/i18n/siteCopy'
const { tx, locale } = useSiteCopy()

import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { init, use, graphic, type EChartsType } from 'echarts/core'
import { GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import desktop from '../../../docs/figma-source/hospitals/section-desktop-4/chart-spec-2026-10-20.json'
import mobile from '../../../docs/figma-source/hospitals/section-mobile-4/chart-spec-2026-10-20.json'
use([GraphicComponent,CanvasRenderer])
const props=defineProps<{phone:boolean}>()
const canvas=ref<HTMLElement|null>(null)
let chart:EChartsType|undefined
let observer:ResizeObserver|undefined
let frame=0,revision=0,disposed=false,lastSize=''
const graphics=new Map<string,ReturnType<typeof makeGraphics>>()
function makeGraphics(phone:boolean){
  const spec=phone?mobile.radar:desktop.radar
  const shapes=spec.paths.flatMap(node=>node.paths.map((path,index)=>{
    const shape=graphic.makePath(path.d,{},null!)
    const bounds=shape.getBoundingRect()
    const type=`hospital-vector-${node.nodeId.replace(':','-')}-${index}`
    graphic.registerShape(type,graphic.extendPath(path.d,{}))
    return {type,id:`${node.nodeId}-${index}`,x:node.x-bounds.x,y:node.y-bounds.y,silent:true,style:{fill:path.fill==='none'?null:path.fill,fillOpacity:path.fillOpacity,stroke:path.stroke==='none'?null:path.stroke,lineWidth:path.strokeWidth,lineJoin:'round'}}
  }))
  const texts=spec.texts.map(text=>{
    const translated=tx(text.text),changed=translated!==text.text
    const x=changed?Math.max(0,Math.min(text.x,spec.width-56)):text.x
    return {type:'text',id:text.nodeId,x,y:text.y,silent:true,style:{text:translated,fontFamily:text.fontFamily,fontSize:text.fontSize,fontWeight:400,fill:text.fill,lineHeight:text.lineHeight,verticalAlign:'top',...(changed?{width:Math.max(56,Math.min(100,spec.width-x)),overflow:'break' as const}:{})}}
  })
  return [...shapes,...texts]
}
async function draw(){
  frame=0
  const run=++revision
  await nextTick();await document.fonts.ready
  if(disposed||run!==revision||!canvas.value?.isConnected)return
  const size=`${locale.value}:${props.phone}:${canvas.value.clientWidth}:${canvas.value.clientHeight}`
  if(size===lastSize)return
  lastSize=size
  if(chart)chart.resize()
  else chart=init(canvas.value,undefined,{renderer:'canvas',devicePixelRatio:window.devicePixelRatio})
  const spec=props.phone?mobile.radar:desktop.radar
  // Geometry comes from each selected Figma vector's Dev Mode path. ECharts
  // owns the Canvas primitives; no exported chart SVG is embedded in the page.
  const key=`${locale.value}:${props.phone}`
  let children=graphics.get(key)
  if(!children){children=makeGraphics(props.phone);graphics.set(key,children)}
  chart.setOption({animation:false,graphic:[{type:'group',left:0,top:0,bounding:'raw',scaleX:canvas.value.clientWidth/spec.width,scaleY:canvas.value.clientHeight/spec.height,children}]},{notMerge:true})
}
function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(()=>void draw())}
onMounted(()=>{schedule();observer=new ResizeObserver(schedule);if(canvas.value)observer.observe(canvas.value)})
watch(()=>props.phone,schedule)
watch(locale,()=>{graphics.clear();schedule()})
onBeforeUnmount(()=>{disposed=true;revision++;if(frame)cancelAnimationFrame(frame);observer?.disconnect();chart?.dispose()})
</script>
<template><div ref="canvas" class="hospital-radar" role="img" :aria-label="tx('医院综合实力：医疗技术、患者评价、专家团队、国际服务、设备水平')" /></template>
<style scoped>.hospital-radar{width:100%;height:100%;}</style>
