<script setup lang="ts">
import {ref,watch} from 'vue'
import {ChevronDown,ChevronUp,ClipboardList,FileText,Paperclip,ShieldCheck} from 'lucide-vue-next'
import type {InputSource} from './api'
const props=defineProps<{source:InputSource;caseId:string;open:boolean;canCurate:boolean}>()
const emit=defineEmits<{toggle:[];curate:[index:number]}>()
const tab=ref<'input'|'uploads'>('input'),expanded=ref(new Set<number>()),pages=ref<Record<number,number>>({})
watch(()=>props.caseId,()=>{expanded.value=new Set();pages.value={}})
function toggle(index:number){const next=new Set(expanded.value);next.has(index)?next.delete(index):next.add(index);expanded.value=next}
const apiBase=String(import.meta.env.VITE_EXPERT_API_BASE||'').replace(/\/$/,'')
const previewUrl=(index:number)=>`${apiBase}/api/expert/cases/${props.caseId}/files/${index}/pages/${pages.value[index]||1}`
const size=(bytes:number)=>bytes>1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.ceil(bytes/1024)} KB`
</script>
<template>
 <section class="records-panel" aria-label="用户提交资料">
  <button class="records-toggle" :aria-expanded="open" aria-controls="records-content" @click="emit('toggle')"><ClipboardList :size="22"/><span><strong>用户提交资料</strong><small>原始填写信息与病历资料，和生成报告分开查看</small></span><span class="record-count">{{source.uploads.length}} 份资料</span><component :is="open?ChevronUp:ChevronDown" :size="18"/></button>
  <div v-if="open" id="records-content">
   <p class="records-notice"><ShieldCheck :size="16"/>{{source.sourceNote}} 身份已脱敏，医学内容保留。</p>
   <div class="records-tabs" role="tablist" aria-label="用户资料分类"><button role="tab" :aria-selected="tab==='input'" :class="{'wb-selected':tab==='input'}" class="wb-button" @click="tab='input'">原始填写内容</button><button role="tab" :aria-selected="tab==='uploads'" :class="{'wb-selected':tab==='uploads'}" class="wb-button" @click="tab='uploads'"><Paperclip :size="15"/>上传资料（{{source.uploads.length}}）</button></div>
   <div v-if="tab==='input'" role="tabpanel"><section v-for="group in source.groups" :key="group.title" class="records-group"><h3>{{group.title}}</h3><dl><div v-for="field in group.fields" :key="field.key" :class="{'records-wide':field.value.length>40}"><dt>{{field.label}}<small v-if="field.status==='redacted'">已脱敏</small></dt><dd :class="{'records-empty':field.status==='empty'}">{{field.status==='empty'?'未填写':field.value}}</dd></div></dl></section></div>
   <div v-else role="tabpanel">
    <p v-if="!source.uploads.length" class="records-notice">该报告的原始提交未上传资料。</p>
    <article v-for="file in source.uploads" :key="file.index" class="record-file">
     <button class="record-file-toggle" :aria-expanded="expanded.has(file.index)" @click="toggle(file.index)"><FileText :size="21"/><span><strong>{{file.name}} · {{file.reportType||'医学资料'}}</strong><small>{{size(file.size)}} · {{file.dates.join('、')||'检查日期待确认'}}</small></span><small>{{file.previewStatus==='approved'?'已脱敏':'待脱敏确认'}}</small><component :is="expanded.has(file.index)?ChevronUp:ChevronDown" :size="17"/></button>
     <div v-if="expanded.has(file.index)" class="record-file-body">
      <div v-if="file.previewStatus==='approved'" class="record-original"><h4>病历原件（已脱敏）</h4><div v-if="file.pageCount>1" class="records-pagination"><button class="wb-button" :disabled="(pages[file.index]||1)<=1" @click="pages[file.index]=(pages[file.index]||1)-1">上一页</button><span>{{pages[file.index]||1}} / {{file.pageCount}}</span><button class="wb-button" :disabled="(pages[file.index]||1)>=file.pageCount" @click="pages[file.index]=(pages[file.index]||1)+1">下一页</button></div><a :href="previewUrl(file.index)" target="_blank" rel="noopener noreferrer" class="record-enlarge">新窗口查看大图</a><img :key="previewUrl(file.index)" :src="previewUrl(file.index)" :alt="`${file.name} 脱敏原件，第 ${pages[file.index]||1} 页`"/><details v-if="file.text"><summary>展开脱敏文本</summary><pre>{{file.text}}</pre></details></div>
      <p v-else class="records-warning">原件尚未完成脱敏确认，暂不展示，避免泄露身份。以下自动解析摘要不能代替原件核实。<button v-if="canCurate" class="wb-button" @click="emit('curate',file.index)">准备脱敏预览</button></p>
      <h4>自动解析摘要（待专家核实）</h4><p class="record-summary">{{file.summary||'未获得可用解析'}}</p>
      <section v-if="file.indicators.length"><h4>识别指标</h4><dl class="record-indicators"><div v-for="(item,i) in file.indicators" :key="i"><dt>{{item.name}}：{{item.value}}</dt><dd>{{item.evidence}}</dd></div></dl></section>
      <p class="records-empty">解析器：{{file.parser||'暂无'}}。请以脱敏原件为依据，不把自动识别当作最终诊断。</p>
     </div>
    </article>
   </div>
  </div>
 </section>
</template>
