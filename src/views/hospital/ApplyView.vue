<script setup lang="ts">
import { ref } from 'vue'
import {
  CheckCircle,
  ClipboardCheck,
  UserCheck,
  FileSignature,
  GraduationCap,
  Rocket,
  ChevronDown,
  Building2,
  Star,
  Award,
} from 'lucide-vue-next'
import {
  applyProcessSteps,
  applyRequirements,
  deptOptions,
  applyFaqs,
} from '@/data/hospitalB'

const iconMap: Record<string, any> = {
  ClipboardCheck,
  UserCheck,
  FileSignature,
  GraduationCap,
  Rocket,
}

const form = ref({
  hospitalName: '',
  level: '',
  city: '',
  depts: [] as string[],
  contact: '',
  phone: '',
  email: '',
  bio: '',
})

const openFaq = ref<number | null>(0)

const toggleDept = (dept: string) => {
  const idx = form.value.depts.indexOf(dept)
  if (idx > -1) {
    form.value.depts.splice(idx, 1)
  } else {
    form.value.depts.push(dept)
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold mb-4">申请成为寰宇云医合作医院</h1>
        <p class="text-white/70 max-w-2xl mx-auto">加入286+家已成功国际化的合作医院，开启全球患者服务</p>
      </div>
    </section>

    <!-- Requirements + Form -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-3 gap-8 items-start">
          <!-- Left sidebar -->
          <div class="lg:col-span-1">
            <h2 class="text-2xl font-bold text-[#1A365D] mb-6">入驻条件</h2>
            <div class="bg-[#F7FAFC] rounded-2xl p-6 border border-gray-100">
              <p class="text-sm text-gray-500 mb-5">符合以下条件即可申请入驻</p>
              <ul class="space-y-4">
                <li
                  v-for="(r, i) in applyRequirements"
                  :key="i"
                  class="flex items-start gap-3"
                >
                  <CheckCircle class="w-5 h-5 text-[#319795] shrink-0 mt-0.5" />
                  <span class="text-sm text-gray-700">{{ r }}</span>
                </li>
              </ul>
              <div class="mt-6 pt-5 border-t border-gray-200">
                <div class="flex items-center gap-2 text-sm text-[#D69E2E]">
                  <Star class="w-4 h-4 fill-[#D69E2E]" />
                  <span class="font-medium">JCI认证或三甲医院优先审核</span>
                </div>
              </div>
            </div>

            <!-- Process Steps -->
            <h2 class="text-2xl font-bold text-[#1A365D] mt-10 mb-6">入驻流程</h2>
            <div class="space-y-4">
              <div
                v-for="(step, i) in applyProcessSteps"
                :key="i"
                class="flex items-start gap-4"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A365D] to-[#319795] flex items-center justify-center shrink-0 shadow-md">
                  <component :is="iconMap[step.icon]" class="w-5 h-5 text-white" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-[#D69E2E]">Step {{ i + 1 }}</span>
                    <h3 class="font-semibold text-[#1A365D] text-sm">{{ step.title }}</h3>
                  </div>
                  <p class="text-xs text-gray-500 mt-0.5">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Application Form -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
              <div class="flex items-center gap-3 mb-8">
                <div class="w-12 h-12 rounded-xl bg-[#1A365D]/10 flex items-center justify-center">
                  <Building2 class="w-6 h-6 text-[#1A365D]" />
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-[#1A365D]">填写申请表</h2>
                  <p class="text-sm text-gray-400">带 * 为必填项</p>
                </div>
              </div>

              <div class="space-y-5">
                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1 block">医院名称 *</label>
                    <input
                      v-model="form.hospitalName"
                      placeholder="请输入医院全称"
                      class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1 block">医院等级</label>
                    <select
                      v-model="form.level"
                      class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                    >
                      <option value="">请选择</option>
                      <option value="三甲">三级甲等</option>
                      <option value="三乙">三级乙等</option>
                      <option value="二甲">二级甲等</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700 mb-1 block">所在城市 *</label>
                  <input
                    v-model="form.city"
                    placeholder="如：北京市、上海市"
                    class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700 mb-2 block">重点科室（可多选）</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="dept in deptOptions"
                      :key="dept"
                      :class="[
                        'px-3 py-1.5 rounded-full text-sm transition-colors',
                        form.depts.includes(dept)
                          ? 'bg-[#319795] text-white'
                          : 'bg-[#F7FAFC] text-gray-600 border border-gray-200 hover:border-[#319795]',
                      ]"
                      @click="toggleDept(dept)"
                    >
                      {{ dept }}
                    </button>
                  </div>
                </div>

                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1 block">联系人姓名 *</label>
                    <input
                      v-model="form.contact"
                      placeholder="请输入联系人姓名"
                      class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                    />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700 mb-1 block">联系电话 *</label>
                    <input
                      v-model="form.phone"
                      placeholder="请输入手机号"
                      class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                    />
                  </div>
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700 mb-1 block">电子邮箱 *</label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
                  />
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700 mb-1 block">医院简介</label>
                  <textarea
                    v-model="form.bio"
                    rows="4"
                    class="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#319795]"
                    placeholder="请简要介绍医院的特色科室、优势项目、国际医疗接待能力等"
                  />
                </div>

                <button class="w-full bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold py-3 rounded-lg text-lg transition flex items-center justify-center gap-2">
                  <Award class="w-5 h-5" /> 提交入驻申请
                </button>

                <p class="text-xs text-gray-400 text-center">
                  提交即表示同意
                  <span class="text-[#319795] cursor-pointer">《服务协议》</span>和
                  <span class="text-[#319795] cursor-pointer">《隐私政策》</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-10">常见问题</h2>
        <div class="space-y-3">
          <div
            v-for="(faq, i) in applyFaqs"
            :key="i"
            class="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            <button
              class="w-full flex items-center justify-between p-5 text-left hover:bg-[#F7FAFC] transition-colors"
              @click="openFaq = openFaq === i ? null : i"
            >
              <span class="font-medium text-[#1A365D] text-sm">{{ faq.q }}</span>
              <ChevronDown :class="['w-5 h-5 text-gray-400 transition-transform', openFaq === i ? 'rotate-180' : '']" />
            </button>
            <div v-if="openFaq === i" class="px-5 pb-5 text-sm text-gray-500 leading-relaxed">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 bg-gradient-to-br from-[#1A365D] to-[#319795] text-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">准备好开启国际化了吗？</h2>
        <p class="text-white/70 mb-8">286+家医院已通过寰宇云医成功触达全球市场</p>
        <router-link
          to="/hospital/solutions"
          class="inline-block bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold px-10 py-3 rounded-lg transition"
        >
          了解解决方案
        </router-link>
      </div>
    </section>
  </div>
</template>
