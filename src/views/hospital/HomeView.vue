<script setup lang="ts">
import { ref } from 'vue'
import {
  ArrowRight,
  Check,
  X,
  TrendingUp,
  Users,
  DollarSign,
  Pill,
  Brain,
  BarChart3,
  Calendar,
  MessageSquare,
  Receipt,
  ClipboardCheck,
  UserCheck,
  Settings,
  Rocket,
  ArrowRightCircle,
  Building2,
  Star,
  Phone,
  ChevronRight,
} from 'lucide-vue-next'
import {
  heroStats,
  painPoints,
  solutions,
  coreSolutions,
  dashboardFeatures,
  processSteps,
  successCases,
} from '@/data/hospitalB'

const iconMap: Record<string, any> = {
  Users,
  TrendingUp,
  DollarSign,
  Pill,
  Brain,
  BarChart3,
  Calendar,
  MessageSquare,
  Receipt,
  ClipboardCheck,
  UserCheck,
  Settings,
  Rocket,
}

const form = ref({ name: '', contact: '', phone: '', dept: '' })
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section
      class="relative min-h-screen flex items-center overflow-hidden"
      style="background: linear-gradient(135deg, #1A365D 0%, #1A365D 40%, #319795 100%)"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-white space-y-6">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              零门槛触达<br />全球市场
            </h1>
            <p class="text-lg sm:text-xl text-white/80 leading-relaxed max-w-lg">
              坐在办公室里接收精准匹配的国际患者询盘，把你的过剩产能变成国际收入
            </p>
            <div class="flex flex-wrap gap-4 pt-4">
              <router-link
                to="/hospital/apply"
                class="bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold px-8 py-3 rounded-lg transition"
              >
                申请入驻
              </router-link>
              <router-link
                to="/hospital/solutions"
                class="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-lg transition"
              >
                了解详情
              </router-link>
            </div>
          </div>
          <div class="relative">
            <div class="rounded-2xl shadow-2xl w-full h-80 bg-gradient-to-br from-[#319795]/30 to-[#1A365D]/30 flex items-center justify-center">
              <Building2 class="h-24 w-24 text-white/30" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(s, i) in heroStats"
            :key="i"
            class="text-center p-6 rounded-xl bg-[#F7FAFC] border border-gray-100"
          >
            <component :is="iconMap[s.icon]" class="w-8 h-8 mx-auto mb-3 text-[#319795]" />
            <div class="text-3xl font-bold text-[#1A365D]">{{ s.value }}</div>
            <div class="text-sm text-gray-500 mt-1">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pain Point vs Solution -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-14">
          传统模式 <span class="text-[#319795]">vs</span> 寰宇云医模式
        </h2>
        <div class="grid md:grid-cols-3 gap-8 items-start">
          <!-- Pain points -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
            <h3 class="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
              <X class="w-5 h-5" /> 传统模式
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(p, i) in painPoints"
                :key="i"
                class="flex items-start gap-2 text-gray-600 text-sm"
              >
                <X class="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                {{ p }}
              </li>
            </ul>
          </div>

          <!-- Arrow -->
          <div class="hidden md:flex items-center justify-center py-10">
            <ArrowRight class="w-12 h-12 text-[#319795]" />
          </div>

          <!-- Solutions -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
            <h3 class="text-lg font-semibold text-emerald-600 mb-4 flex items-center gap-2">
              <Check class="w-5 h-5" /> 寰宇云医模式
            </h3>
            <ul class="space-y-3">
              <li
                v-for="(s, i) in solutions"
                :key="i"
                class="flex items-start gap-2 text-gray-600 text-sm"
              >
                <Check class="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {{ s }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Solutions -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-4">核心解决方案</h2>
        <p class="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
          为医院量身打造的全方位国际化患者获取与管理工具
        </p>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(item, i) in coreSolutions"
            :key="i"
            class="rounded-2xl p-8 bg-[#F7FAFC] border border-gray-100 hover:shadow-lg transition-shadow"
          >
            <div :class="['w-14 h-14 rounded-xl flex items-center justify-center mb-5', item.bg]">
              <component :is="iconMap[item.icon]" :class="['w-7 h-7', item.color]" />
            </div>
            <h3 class="text-xl font-semibold text-[#1A365D] mb-3">{{ item.title }}</h3>
            <p class="text-gray-500 leading-relaxed text-sm">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Dashboard Demo -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="rounded-2xl shadow-xl w-full h-80 bg-gradient-to-br from-[#1A365D]/10 to-[#319795]/10 flex items-center justify-center">
            <BarChart3 class="h-20 w-20 text-[#319795]/40" />
          </div>
          <div class="space-y-6">
            <h2 class="text-3xl font-bold text-[#1A365D]">一站式管理后台</h2>
            <p class="text-gray-500 leading-relaxed">
              从患者首次咨询到治疗完成，全流程可视化管理。实时掌握国际患者动态，智能分析助力决策。
            </p>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(f, i) in dashboardFeatures"
                :key="i"
                class="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100"
              >
                <component :is="iconMap[f.icon]" class="w-5 h-5 text-[#319795]" />
                <span class="text-sm font-medium text-[#1A365D]">{{ f.text }}</span>
              </div>
            </div>
            <router-link
              to="/hospital/solutions"
              class="inline-flex items-center gap-2 bg-[#319795] hover:bg-[#267c7b] text-white px-6 py-3 rounded-lg transition"
            >
              了解更多功能 <ArrowRight class="w-4 h-4" />
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Process Steps -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-4">入驻流程</h2>
        <p class="text-center text-gray-500 mb-14">简单四步，开启国际化患者服务</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            v-for="(step, i) in processSteps"
            :key="i"
            class="relative text-center"
          >
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#1A365D] to-[#319795] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <component :is="iconMap[step.icon]" class="w-7 h-7 text-white" />
            </div>
            <div class="text-2xl font-bold text-[#D69E2E] mb-1">0{{ i + 1 }}</div>
            <h3 class="font-semibold text-[#1A365D] mb-1">{{ step.title }}</h3>
            <p class="text-sm text-gray-500">{{ step.desc }}</p>
            <div
              v-if="i < processSteps.length - 1"
              class="hidden lg:block absolute top-8 left-[60%] w-[80%]"
            >
              <ArrowRightCircle class="w-6 h-6 text-[#319795]/40" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Success Cases -->
    <section class="py-20 bg-[#F7FAFC]">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center text-[#1A365D] mb-14">成功案例</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="(c, i) in successCases"
            :key="i"
            class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-[#1A365D]/10 flex items-center justify-center">
                <Building2 class="w-5 h-5 text-[#1A365D]" />
              </div>
              <div>
                <h3 class="font-semibold text-[#1A365D] text-sm">{{ c.name }}</h3>
                <p class="text-xs text-gray-400">{{ c.dept }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-emerald-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-emerald-600">{{ c.growth }}</div>
                <div class="text-xs text-gray-500">患者增长</div>
              </div>
              <div class="bg-amber-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-amber-600">{{ c.revenue }}</div>
                <div class="text-xs text-gray-500">新增收入</div>
              </div>
            </div>
            <p class="text-sm text-gray-500 italic">"{{ c.quote }}"</p>
            <div class="flex items-center gap-1 mt-3">
              <Star v-for="s in 5" :key="s" class="w-4 h-4 fill-[#D69E2E] text-[#D69E2E]" />
            </div>
          </div>
        </div>
        <div class="text-center mt-8">
          <router-link
            to="/hospital/cases"
            class="inline-flex items-center gap-1 border border-[#319795] text-[#319795] hover:bg-[#319795]/10 px-6 py-2.5 rounded-lg transition"
          >
            查看更多案例 <ChevronRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA / Application Form -->
    <section class="py-20" style="background: linear-gradient(135deg, #1A365D 0%, #319795 100%)">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-white mb-3">立即申请入驻</h2>
          <p class="text-white/70">填写信息，我们的国际合作顾问将在24小时内与您联系</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-xl">
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">医院名称</label>
              <input
                v-model="form.name"
                placeholder="请输入医院全称"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">联系人</label>
              <input
                v-model="form.contact"
                placeholder="请输入联系人姓名"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">联系电话</label>
              <input
                v-model="form.phone"
                placeholder="请输入手机号"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 mb-1 block">重点科室</label>
              <input
                v-model="form.dept"
                placeholder="如：肿瘤科、心血管科"
                class="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#319795]"
              />
            </div>
          </div>
          <button class="w-full mt-6 bg-[#D69E2E] hover:bg-[#B7791F] text-[#1A365D] font-bold py-3 rounded-lg transition">
            提交申请
          </button>
          <p class="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
            <Phone class="w-3 h-3" /> 也可拨打 400-888-6688 直接咨询
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
