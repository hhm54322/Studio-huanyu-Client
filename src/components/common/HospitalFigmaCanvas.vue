<script setup lang="ts">
import { computed } from 'vue'
import HomeSourceNode, { type HomeSourceNodeData, type HomeSourceAction } from './HomeSourceNode.vue'
import { sourceAtOrigin } from '@/data/hospitalFigmaSource'
const props=defineProps<{
  node:HomeSourceNodeData; width:number; phone?:boolean; fluid?:boolean; height?:number
  actions?:Record<string,HomeSourceAction>; styles?:Record<string,string>; texts?:Record<string,string>
  attributes?:Record<string,Record<string,string|number|boolean>>; hidden?:string[]; label?:string
}>()
const emit=defineEmits<{activate:[action:string,event:MouseEvent]}>()
const root=computed(()=>sourceAtOrigin(props.node))
const scale=computed(()=>props.phone?1:Math.min(1,props.width/(props.node.width || 1440)))
const baselineNodes=computed(()=>{
  const result:string[]=[]
  const visit=(node:HomeSourceNodeData)=>{if(node.textLines)result.push(node.id);node.children.forEach(visit)}
  visit(props.node)
  return result
})
</script>
<template>
  <section class="hospital-source-canvas" :class="{'is-phone':phone,'is-fluid':fluid}" :aria-label="label" :style="!fluid?{height:`${(height??node.height)*scale}px`}:undefined">
    <div class="hospital-source-canvas__inner" :style="phone?undefined:{width:`${node.width}px`,height:`${height??node.height}px`,transform:`translateX(-50%) scale(${scale})`}">
      <HomeSourceNode :node="root" root :fluid="fluid" :actions="actions" :styles="styles" :texts="texts" :attributes="attributes" :hidden="hidden" :baseline-nodes="baselineNodes" :preserve-text-lines="width===375" @activate="(action,event)=>emit('activate',action,event)">
        <template #after="data"><slot name="after" v-bind="data" /></template>
        <template #radar="data"><slot name="radar" v-bind="data" /></template>
      </HomeSourceNode>
    </div>
  </section>
</template>
<style scoped>
@import url('/fonts/home-source-fonts.css');
.hospital-source-canvas { position:relative; width:100%; }
.hospital-source-canvas__inner { position:absolute; top:0; left:50%; transform-origin:top center; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.is-phone .hospital-source-canvas__inner { position:relative; left:0; width:100%; }
.is-phone :deep(.home-source-node--root) { width:100%!important; }
.hospital-source-canvas :deep(button:focus-visible),.hospital-source-canvas :deep(a:focus-visible) { outline:2px solid #2563eb; outline-offset:3px; }
</style>
