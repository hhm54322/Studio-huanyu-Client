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
    <section class="steps-hero">
      <picture class="steps-hero__media" aria-hidden="true">
        <source
          media="(max-width: 767px)"
          srcset="/images/page-banners/steps-mobile.jpg"
          type="image/jpeg"
          width="750"
          height="444"
        />
        <img
          src="/images/page-banners/steps-pc.jpg"
          alt=""
          class="block w-full"
          width="2880"
          height="666"
          fetchpriority="high"
        />
      </picture>
      <div class="steps-hero__copy">
        <p class="steps-hero__tag">Complete Medical Journey to China</p>
        <h1 class="steps-hero__title">来华就医全流程</h1>
        <p class="steps-hero__desc">从首次咨询到康复回国，寰宇云医陪伴您的每一步</p>
      </div>
    </section>

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
      <section class="mt-20 md:mt-32">
        <div class="journey-cta">
          <picture class="journey-cta__media">
            <source
              media="(max-width: 767px)"
              srcset="/images/page-banners/journey-mobile.jpg"
              type="image/jpeg"
              width="694"
              height="538"
            />
            <img
              src="/images/page-banners/journey-pc.jpg"
              alt=""
              width="2240"
              height="608"
            />
          </picture>
          <div class="journey-cta__content">
            <h2 class="journey-cta__title">
              准备好开始您的健康之旅了吗？
            </h2>
            <p class="journey-cta__desc">
              我们的医疗顾问团队将在24小时内与您取得联系，为您提供免费的初筛评估
            </p>
            <router-link to="/report" class="journey-cta__button">
              开始您的就医之旅
              <ArrowRight class="w-5 h-5" />
            </router-link>
            <div class="journey-cta__meta">
              <span class="journey-cta__meta-item">
                <Calendar class="w-4 h-4 md:w-5 md:h-5" />
                24小时响应
              </span>
              <span class="journey-cta__meta-item">
                <Globe class="w-4 h-4 md:w-5 md:h-5" />
                多语言支持
              </span>
              <span class="journey-cta__meta-item">
                <Building2 class="w-4 h-4 md:w-5 md:h-5" />
                100+合作医院
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.steps-hero {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.steps-hero__media,
.steps-hero__media img {
  display: block;
  width: 100%;
}

.steps-hero__copy {
  position: absolute;
  z-index: 1;
  top: 23.8%;
  left: clamp(96px, 7.64vw, 220px);
  max-width: 980px;
}

.steps-hero__tag {
  display: inline-flex;
  align-items: center;
  min-height: clamp(36px, 2.6vw, 75px);
  border-radius: 999px;
  background: linear-gradient(90deg, #e66a1c 0%, #f8b86e 100%);
  padding: 0 clamp(26px, 1.84vw, 53px);
  color: #fff;
  font-size: clamp(16px, 1.25vw, 36px);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.steps-hero__title {
  margin: clamp(46px, 3.33vw, 96px) 0 0;
  color: #e2661b;
  font-size: clamp(50px, 3.75vw, 108px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0;
}

.steps-hero__desc {
  margin: clamp(36px, 2.43vw, 70px) 0 0;
  color: #4f4a46;
  font-size: clamp(18px, 1.32vw, 38px);
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: 0;
}

@media (max-width: 767px) {
  .steps-hero__copy {
    top: 24.5%;
    left: 4.27vw;
    max-width: 53%;
  }

  .steps-hero__tag {
    min-height: 28px;
    padding: 0 16px;
    font-size: 12px;
  }

  .steps-hero__title {
    margin-top: 30px;
    font-size: 28px;
    line-height: 1.05;
  }

  .steps-hero__desc {
    margin-top: 17px;
    max-width: 90%;
    color: #4b4540;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.55;
  }
}

.journey-cta {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  aspect-ratio: 694 / 538;
  min-height: 282px;
  box-shadow: 0 24px 52px rgba(221, 107, 32, 0.16);
}

.journey-cta__media,
.journey-cta__media img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.journey-cta__media img {
  object-fit: cover;
}

.journey-cta__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 28px;
  text-align: center;
  color: #fff;
}

.journey-cta__title {
  font-size: 21px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0;
}

.journey-cta__desc {
  margin-top: 18px;
  max-width: 18rem;
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.92);
}

.journey-cta__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 22px;
  min-height: 48px;
  border-radius: 999px;
  background: #fff;
  padding: 0 32px;
  color: #dd4f1c;
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(123, 52, 30, 0.14);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.journey-cta__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 36px rgba(123, 52, 30, 0.2);
}

.journey-cta__meta {
  display: flex;
  width: 100%;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px 12px;
  margin-top: 22px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 12px;
  line-height: 1;
}

.journey-cta__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .journey-cta {
    border-radius: 18px;
    aspect-ratio: 2240 / 608;
    min-height: 0;
  }

  .journey-cta__content {
    padding: 56px 48px 50px;
  }

  .journey-cta__title {
    font-size: 32px;
  }

  .journey-cta__desc {
    margin-top: 22px;
    max-width: 760px;
    font-size: 17px;
  }

  .journey-cta__button {
    margin-top: 40px;
    min-height: 62px;
    padding: 0 54px;
    font-size: 20px;
  }

  .journey-cta__meta {
    flex-wrap: nowrap;
    gap: 38px;
    margin-top: 36px;
    font-size: 16px;
  }

  .journey-cta__meta-item {
    gap: 8px;
  }
}
</style>
