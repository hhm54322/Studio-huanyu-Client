<script setup lang="ts">
import { ref } from 'vue'
import {
  Code,
  Shield,
  Server,
  Lock,
  FileJson,
  Globe,
  Cpu,
  CheckCircle,
  Copy,
} from 'lucide-vue-next'
import {
  apiFeatures,
  endpoints,
  requestExample,
  responseExample,
  techArchPoints,
} from '@/data/hospitalB'

const iconMap: Record<string, any> = {
  Server,
  Cpu,
  FileJson,
  Globe,
  Shield,
}

const copied = ref(false)

const copyCode = (code: string) => {
  navigator.clipboard.writeText(code)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

const methodClass = (method: string) => {
  if (method === 'GET') return 'bg-blue-100 text-blue-700'
  if (method === 'POST') return 'bg-emerald-100 text-emerald-700'
  return 'bg-amber-100 text-amber-700'
}
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">无缝接入你的医院信息系统</h1>
        <p class="text-white/70 max-w-2xl mx-auto">通过标准化API，将寰宇云医平台与你的HIS/EMR系统深度对接</p>
      </div>
    </section>

    <!-- Architecture -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="rounded-2xl shadow-xl w-full h-48 md:h-80 bg-gradient-to-br from-[#1A365D]/10 to-[#319795]/10 flex items-center justify-center">
            <Code class="h-20 w-20 text-[#319795]/40" />
          </div>
          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-[#1A365D]">技术架构</h2>
            <p class="text-gray-500 leading-relaxed">
              寰宇云医开放平台提供RESTful API接口，支持JSON数据格式。通过OAuth 2.0认证机制，确保数据安全传输。API中间件层负责协议转换和数据标准化，实现与各类HIS/EMR系统的无缝对接。
            </p>
            <div class="space-y-3">
              <div
                v-for="(item, i) in techArchPoints"
                :key="i"
                class="flex items-center gap-3"
              >
                <CheckCircle class="w-5 h-5 text-[#319795] shrink-0" />
                <span class="text-sm text-gray-700">{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- API Features -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-4">API功能列表</h2>
        <p class="text-center text-gray-500 mb-14">覆盖国际患者全流程管理的核心接口</p>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(f, i) in apiFeatures"
            :key="i"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="w-12 h-12 rounded-xl bg-[#1A365D]/10 flex items-center justify-center mb-4">
              <component :is="iconMap[f.icon]" class="w-6 h-6 text-[#1A365D]" />
            </div>
            <h3 class="font-semibold text-[#1A365D] mb-2">{{ f.title }}</h3>
            <p class="text-sm text-gray-500">{{ f.desc }}</p>
          </div>
          <!-- More APIs card -->
          <div class="bg-gradient-to-br from-[#1A365D] to-[#319795] rounded-2xl p-6 text-white flex flex-col justify-center text-center">
            <Code class="w-8 h-8 mx-auto mb-3 text-[#D69E2E]" />
            <h3 class="font-semibold mb-2">更多接口</h3>
            <p class="text-sm text-white/70 mb-4">查看完整的API文档</p>
            <button class="bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold py-2 rounded-lg transition">
              查看文档
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- API Endpoints -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-10">API端点</h2>
        <div class="bg-[#F7FAFC] rounded-2xl overflow-hidden overflow-x-auto border border-gray-100">
          <table class="w-full text-sm" style="min-width: 520px">
            <thead>
              <tr class="bg-[#1A365D] text-white">
                <th class="text-left py-3 px-4 font-semibold whitespace-nowrap">方法</th>
                <th class="text-left py-3 px-4 font-semibold whitespace-nowrap">端点</th>
                <th class="text-left py-3 px-4 font-semibold whitespace-nowrap">说明</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(ep, i) in endpoints"
                :key="i"
                :class="i % 2 === 0 ? 'bg-white' : 'bg-[#F7FAFC]'"
              >
                <td class="py-3 px-4">
                  <span :class="['inline-block px-2 py-0.5 rounded text-xs font-bold', methodClass(ep.method)]">
                    {{ ep.method }}
                  </span>
                </td>
                <td class="py-3 px-4 font-mono text-xs text-[#1A365D]">{{ ep.path }}</td>
                <td class="py-3 px-4 text-gray-600">{{ ep.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Code Examples -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-10">代码示例</h2>

        <!-- Request -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-[#1A365D] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500" /> 请求示例
            </h3>
            <button
              class="flex items-center gap-1 text-xs text-gray-500 hover:text-[#319795] transition-colors"
              @click="copyCode(requestExample)"
            >
              <CheckCircle v-if="copied" class="w-4 h-4" />
              <Copy v-else class="w-4 h-4" />
              {{ copied ? '已复制' : '复制' }}
            </button>
          </div>
          <pre class="bg-[#1A365D] text-white p-4 md:p-6 rounded-xl overflow-x-auto text-xs md:text-sm leading-relaxed"><code>{{ requestExample }}</code></pre>
        </div>

        <!-- Response -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-[#1A365D] flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-[#D69E2E]" /> 响应示例
            </h3>
          </div>
          <pre class="bg-[#1A365D] text-white p-4 md:p-6 rounded-xl overflow-x-auto text-xs md:text-sm leading-relaxed"><code>{{ responseExample }}</code></pre>
        </div>
      </div>
    </section>

    <!-- Security -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-14">安全认证</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-8 bg-[#F7FAFC] rounded-2xl border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-[#1A365D]/10 flex items-center justify-center mx-auto mb-5">
              <Lock class="w-8 h-8 text-[#1A365D]" />
            </div>
            <h3 class="font-semibold text-[#1A365D] mb-2">OAuth 2.0</h3>
            <p class="text-sm text-gray-500">行业标准的身份验证协议，支持授权码模式、客户端凭证模式</p>
          </div>
          <div class="text-center p-8 bg-[#F7FAFC] rounded-2xl border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Shield class="w-8 h-8 text-emerald-600" />
            </div>
            <h3 class="font-semibold text-[#1A365D] mb-2">AES-256加密</h3>
            <p class="text-sm text-gray-500">传输层TLS 1.3加密，存储数据采用AES-256标准加密保护</p>
          </div>
          <div class="text-center p-8 bg-[#F7FAFC] rounded-2xl border border-gray-100">
            <div class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
              <FileJson class="w-8 h-8 text-amber-600" />
            </div>
            <h3 class="font-semibold text-[#1A365D] mb-2">IP白名单</h3>
            <p class="text-sm text-gray-500">支持IP白名单限制，请求签名验证，防止未授权访问</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Developer Portal CTA -->
    <section class="py-20 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">开始对接</h2>
        <p class="text-white/70 mb-8">获取API密钥，访问开发者文档和沙箱环境</p>
        <div class="flex flex-wrap justify-center gap-4">
          <button class="bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold px-8 py-3 rounded-lg transition">
            申请API密钥
          </button>
          <button class="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-lg transition">
            访问开发者文档
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
