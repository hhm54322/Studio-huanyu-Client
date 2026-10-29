<script setup lang="ts">
import {computed,onMounted,ref,watch} from 'vue'
import {api} from './api'
type Rect={x:number;y:number;width:number;height:number}
const props=defineProps<{caseId:string;index:number}>(),emit=defineEmits<{close:[];published:[]}>()
const apiBase=String(import.meta.env.VITE_EXPERT_API_BASE||'').replace(/\/$/,'')
const meta=ref<{sourceHash:string;revision:number;pageCount:number;suggestedText:string}>(),page=ref(1),masks=ref<Record<number,Rect[]>>({}),confirmed=ref(new Set<number>()),error=ref(''),busy=ref(false),attest=ref(false),text=ref(''),surface=ref<HTMLElement>(),start=ref<{x:number;y:number}>(),end=ref<{x:number;y:number}>()
const imageReady=ref(false),imageError=ref('')
watch(page,()=>{imageReady.value=false;imageError.value='';start.value=undefined;end.value=undefined})
const url=computed(()=>`${apiBase}/api/expert/curation/${props.caseId}/files/${props.index}/pages/${page.value}`)
const ready=computed(()=>meta.value&&confirmed.value.size===meta.value.pageCount&&attest.value)
onMounted(async()=>{try{meta.value=await api(`/curation/${props.caseId}/files/${props.index}`);text.value=meta.value!.suggestedText}catch(e){error.value=(e as Error).message}})
function point(e:PointerEvent){const rect=surface.value!.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height))}}
function down(e:PointerEvent){if(busy.value||!imageReady.value)return;start.value=point(e);end.value=start.value;surface.value!.setPointerCapture(e.pointerId)}
function move(e:PointerEvent){if(start.value)end.value=point(e)}
const selection=computed(()=>!start.value||!end.value?null:{x:Math.min(start.value.x,end.value.x),y:Math.min(start.value.y,end.value.y),width:Math.abs(start.value.x-end.value.x),height:Math.abs(start.value.y-end.value.y)})
function up(){const r=selection.value;if(r&&r.width>.002&&r.height>.002){masks.value[page.value]=[...(masks.value[page.value]||[]),r];confirmed.value.delete(page.value);confirmed.value=new Set(confirmed.value)}start.value=undefined;end.value=undefined}
const style=(r:Rect)=>({left:`${r.x*100}%`,top:`${r.y*100}%`,width:`${r.width*100}%`,height:`${r.height*100}%`})
function confirm(){if(!imageReady.value||busy.value)return;confirmed.value=new Set([...confirmed.value,page.value]);if(meta.value&&page.value<meta.value.pageCount)page.value++}
function undo(){masks.value[page.value]?.pop();confirmed.value.delete(page.value);confirmed.value=new Set(confirmed.value)}
async function publish(){if(!ready.value||!meta.value)return;busy.value=true;error.value='';try{await api(`/curation/${props.caseId}/files/${props.index}`,'POST',{revision:meta.value.revision,sourceHash:meta.value.sourceHash,attest:true,pages:Array.from({length:meta.value.pageCount},(_,i)=>({page:i+1,masks:masks.value[i+1]||[]})),redactedText:text.value});emit('published')}catch(e){error.value=(e as Error).message}finally{busy.value=false}}
</script>
<template>
 <div class="redaction-backdrop" role="dialog" aria-modal="true" aria-labelledby="redaction-title">
  <section class="redaction-dialog"><header><div><h2 id="redaction-title">资料脱敏确认</h2><small>仅管理员/资料处理人员可见原件，不属于医学知识确认。</small></div><button class="wb-button" :disabled="busy" @click="emit('close')">关闭</button></header>
   <p class="records-warning">原件含身份信息。请拖动框选姓名、生日、证件/病案号、联系方式、详细地址、条码/二维码等；保留医学指标与检查日期。逐页检查后发布不可逆遮盖的副本。</p>
   <p v-if="error" class="workbench-error" role="alert">{{error}}</p>
   <template v-if="meta"><div class="redaction-controls"><button class="wb-button" :disabled="page<=1||busy" @click="page--">上一页</button><span>第 {{page}} / {{meta.pageCount}} 页 · 已确认 {{confirmed.size}} 页</span><button class="wb-button" :disabled="page>=meta.pageCount||busy" @click="page++">下一页</button><button class="wb-button" :disabled="busy" @click="undo">撤销最后遮盖</button><button class="wb-button wb-primary" :disabled="!imageReady||busy" @click="confirm">确认当前页</button></div>
   <p v-if="imageError" class="workbench-error" role="alert">{{imageError}}</p><p v-else-if="!imageReady" role="status">正在加载原件，加载完成后才可确认此页。</p>
   <div ref="surface" class="redaction-surface" @pointerdown.prevent="down" @pointermove="move" @pointerup="up" @pointercancel="up"><img :key="url" :src="url" alt="待脱敏病历原件，仅资料处理人员可见" draggable="false" @load="imageReady=true" @error="imageReady=false;imageError='原件加载失败，请重新打开资料；此页不能确认。'"/><div v-for="(r,i) in masks[page]||[]" :key="i" class="redaction-mask" :style="style(r)"/><div v-if="selection" class="redaction-selection" :style="style(selection)"/></div>
   <label class="wb-label" for="redacted-ocr">脱敏文本（请检查 OCR 遗漏的身份信息；医学内容不要删改）</label><textarea id="redacted-ocr" v-model="text" class="wb-field" rows="8"/>
   <label class="attestation"><input v-model="attest" type="checkbox"/>我已逐页确认全部身份信息及条码/二维码已遮盖，且医学内容可用于审阅。</label><button class="wb-button wb-primary" :disabled="!ready||busy" @click="publish">{{busy?'生成脱敏副本…':'发布脱敏预览'}}</button>
   </template>
  </section>
 </div>
</template>
