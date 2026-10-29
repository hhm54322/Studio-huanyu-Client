<script setup lang="ts">
import { computed } from 'vue'
import HomeSourceNode, { type HomeSourceNodeData, type HomeSourceAction } from './HomeSourceNode.vue'
import { dentalDescendants } from '@/data/dentalFigmaSource'
const props = defineProps<{
  node: HomeSourceNodeData; width: number; height?: number
  actions?: Record<string, HomeSourceAction>; styles?: Record<string, string>; texts?: Record<string, string>
  attributes?: Record<string, Record<string, string | number | boolean>>; flowRoots?: string[]; hidden?: string[]
}>()
const emit = defineEmits<{ activate: [action: string, event: MouseEvent] }>()
const scale = computed(() => Math.min(1, props.width / props.node.width))
const root = computed(() => ({ ...props.node, css: props.node.css + ';position:relative;left:0;top:0;' }))
const baselines = computed(() => dentalDescendants(props.node).filter(node => node.textLines).map(node => node.id))
</script>
<template>
  <div class="dental-source-canvas" :style="{ height: `${(height ?? node.height) * scale}px` }">
    <div class="dental-source-canvas__inner" :style="{ width: `${node.width}px`, height: `${height ?? node.height}px`, transform: `translateX(-50%) scale(${scale})` }">
      <HomeSourceNode :node="root" root :actions="actions" :styles="styles" :texts="texts" :attributes="attributes" :hidden="hidden" :flow-roots="flowRoots" :baseline-nodes="baselines" preserve-text-lines @activate="(action, event) => emit('activate', action, event)">
        <template #after="data"><slot name="after" v-bind="data" /></template>
      </HomeSourceNode>
    </div>
  </div>
</template>
<style scoped>
@import url('/fonts/home-source-fonts.css');
.dental-source-canvas { position:relative; width:100%; }
.dental-source-canvas__inner { position:absolute; top:0; left:50%; transform-origin:top center; font-family:'PingFang SC',sans-serif; -webkit-font-smoothing:antialiased; }
.dental-source-canvas :deep(button:focus-visible), .dental-source-canvas :deep(a:focus-visible), .dental-source-canvas :deep(input:focus-visible), .dental-source-canvas :deep(select:focus-visible), .dental-source-canvas :deep(textarea:focus-visible) { outline:2px solid #2563eb; outline-offset:3px; }
</style>
