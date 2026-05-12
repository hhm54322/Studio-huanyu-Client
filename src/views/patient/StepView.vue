<script setup lang="ts">
import {
  Video,
  Calendar,
  FileText,
  Globe,
  Plane,
  Stethoscope,
  Heart,
  Building2,
  Clock,
  Banknote,
  ArrowRight,
  CheckCircle2,
} from 'lucide-vue-next'
import { stepsData } from '@/data/steps'

const iconMap: Record<string, any> = {
  Video,
  FileText,
  Plane,
  Stethoscope,
  Heart,
  Banknote,
  Globe,
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 text-white">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20" />
        <div class="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/20" />
        <div class="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div class="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <h1 class="text-3xl md:text-5xl font-bold mb-4 tracking-tight">来华就医全流程</h1>
        <p class="text-lg md:text-xl text-orange-100 font-medium">
          Complete Medical Journey to China
        </p>
        <div class="mt-6 flex items-center justify-center gap-2 text-orange-100 text-sm md:text-base">
          <span class="inline-block w-8 h-0.5 bg-orange-300 rounded" />
          从首次咨询到康复回国，寰宇云医陪伴您的每一步
          <span class="inline-block w-8 h-0.5 bg-orange-300 rounded" />
        </div>
      </div>
    </div>

    <!-- Timeline Section -->
    <div class="max-w-6xl mx-auto px-4 py-16 md:py-24">
      <div class="relative">
        <!-- Center line - hidden on mobile, shown on md+ -->
        <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-300 -translate-x-1/2" />
        <!-- Vertical line for mobile -->
        <div class="md:hidden absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-300" />

        <div class="space-y-12 md:space-y-24">
          <div v-for="(step, index) in stepsData" :key="step.number" class="relative">
            <!-- Desktop: alternating layout -->
            <div class="hidden md:flex items-center">
              <!-- Left side -->
              <div :class="['flex-1', index % 2 === 1 ? 'opacity-0 pointer-events-none' : '']">
                <div v-if="index % 2 === 0" class="pr-12">
                  <!-- Step Content Card -->
                  <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-orange-100/50 border border-orange-100 hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 flex-shrink-0">
                        <component :is="iconMap[step.icon]" class="w-7 h-7 text-white" :stroke-width="1.5" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-2xl md:text-3xl font-black text-orange-600">{{ step.number }}</span>
                          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ step.title }}</h3>
                        </div>
                        <p class="text-xs md:text-sm text-orange-500 font-medium">{{ step.subtitle }}</p>
                      </div>
                    </div>
                    <p class="text-gray-600 text-sm md:text-base leading-relaxed mb-5">{{ step.content }}</p>
                    <div class="flex flex-wrap gap-2 mb-5">
                      <span
                        v-for="action in step.actions"
                        :key="action"
                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs md:text-sm font-medium rounded-full border border-orange-100"
                      >
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        {{ action }}
                      </span>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Clock class="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span><span class="font-medium text-gray-900">时间：</span>{{ step.time }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote class="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span><span class="font-medium text-gray-900">费用：</span>{{ step.cost }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Center dot -->
              <div class="relative z-10">
                <div class="w-5 h-5 rounded-full bg-orange-500 border-4 border-white shadow-lg" />
              </div>

              <!-- Right side -->
              <div :class="['flex-1', index % 2 === 0 ? 'opacity-0 pointer-events-none' : '']">
                <div v-if="index % 2 === 1" class="pl-12">
                  <!-- Step Content Card (same as above) -->
                  <div class="bg-white rounded-2xl p-6 md:p-8 shadow-lg shadow-orange-100/50 border border-orange-100 hover:shadow-xl hover:shadow-orange-200/50 transition-all duration-300 hover:-translate-y-1">
                    <div class="flex items-center gap-4 mb-4">
                      <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 flex-shrink-0">
                        <component :is="iconMap[step.icon]" class="w-7 h-7 text-white" :stroke-width="1.5" />
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-2xl md:text-3xl font-black text-orange-600">{{ step.number }}</span>
                          <h3 class="text-lg md:text-xl font-bold text-gray-900">{{ step.title }}</h3>
                        </div>
                        <p class="text-xs md:text-sm text-orange-500 font-medium">{{ step.subtitle }}</p>
                      </div>
                    </div>
                    <p class="text-gray-600 text-sm md:text-base leading-relaxed mb-5">{{ step.content }}</p>
                    <div class="flex flex-wrap gap-2 mb-5">
                      <span
                        v-for="action in step.actions"
                        :key="action"
                        class="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs md:text-sm font-medium rounded-full border border-orange-100"
                      >
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        {{ action }}
                      </span>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Clock class="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span><span class="font-medium text-gray-900">时间：</span>{{ step.time }}</span>
                      </div>
                      <div class="flex items-center gap-2 text-sm text-gray-600">
                        <Banknote class="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span><span class="font-medium text-gray-900">费用：</span>{{ step.cost }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mobile: vertical stack -->
            <div class="md:hidden pl-16">
              <div class="absolute left-5 top-8 w-4 h-4 rounded-full bg-orange-500 border-4 border-white shadow-md" />
              <div class="bg-white rounded-2xl p-6 shadow-lg shadow-orange-100/50 border border-orange-100">
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-200 flex-shrink-0">
                    <component :is="iconMap[step.icon]" class="w-7 h-7 text-white" :stroke-width="1.5" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-2xl font-black text-orange-600">{{ step.number }}</span>
                      <h3 class="text-lg font-bold text-gray-900">{{ step.title }}</h3>
                    </div>
                    <p class="text-xs text-orange-500 font-medium">{{ step.subtitle }}</p>
                  </div>
                </div>
                <p class="text-gray-600 text-sm leading-relaxed mb-5">{{ step.content }}</p>
                <div class="flex flex-wrap gap-2 mb-5">
                  <span
                    v-for="action in step.actions"
                    :key="action"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5" />
                    {{ action }}
                  </span>
                </div>
                <div class="flex flex-col gap-3 pt-4 border-t border-gray-100">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <Clock class="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span><span class="font-medium text-gray-900">时间：</span>{{ step.time }}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <Banknote class="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <span><span class="font-medium text-gray-900">费用：</span>{{ step.cost }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="mt-20 md:mt-32 text-center">
        <div class="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 md:p-12 shadow-xl shadow-orange-200">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-3">
            准备好开始您的健康之旅了吗？
          </h2>
          <p class="text-orange-100 mb-8 text-sm md:text-base">
            我们的医疗顾问团队将在24小时内与您取得联系，为您提供免费的初筛评估
          </p>
          <router-link
            to="/report"
            class="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-base md:text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            开始您的就医之旅
            <ArrowRight class="w-5 h-5" />
          </router-link>
          <div class="mt-6 flex items-center justify-center gap-6 text-orange-100 text-xs md:text-sm">
            <span class="flex items-center gap-1">
              <Calendar class="w-4 h-4" />
              24小时响应
            </span>
            <span class="flex items-center gap-1">
              <Globe class="w-4 h-4" />
              多语言支持
            </span>
            <span class="flex items-center gap-1">
              <Building2 class="w-4 h-4" />
              100+合作医院
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
