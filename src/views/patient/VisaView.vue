<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Globe,
  FileText,
  Stethoscope,
  Clock,
  CheckCircle,
  Plane,
  Shield,
  HeartPulse,
  CreditCard,
  AlertCircle,
  Users,
  Star,
  ChevronDown,
  ArrowRight,
} from 'lucide-vue-next'
import { visaFreeData, materials, timelineSteps, urgentServices, faqData } from '@/data/visa'

const { t } = useI18n()
const openFaq = ref<number | null>(0)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? null : index
}

// Icon mapping for materials
const iconMap: Record<string, any> = {
  FileText,
  CreditCard,
  Stethoscope,
  Plane,
  Shield,
  HeartPulse,
}

// Icon mapping for timeline
const timelineIconMap: Record<string, any> = {
  FileText,
  Stethoscope,
  Clock,
  CheckCircle,
  Plane,
}

/** M签证与L签证区别 */
const mVisaDiffs = [
  'M签证专为医疗目的设计，入境目的明确',
  '可多次延期，配合治疗周期',
  '医院可出具邀请函支持申请',
  '签证审核通过率更高',
  '允许家属持S2签证陪同',
]
</script>

<template>
  <div style="background-color: #FFFAF5; min-height: 100vh">
    <!-- Hero Section -->
    <section class="visa-hero">
      <picture class="visa-hero__media" aria-hidden="true">
        <source
          media="(max-width: 767px)"
          srcset="/images/page-banners/visa-mobile.jpg"
          type="image/jpeg"
          width="750"
          height="444"
        />
        <source
          media="(max-width: 767px)"
          srcset="/images/page-banners/visa-mobile.png"
          width="750"
          height="444"
        />
        <source
          srcset="/images/page-banners/visa-pc.jpg"
          type="image/jpeg"
          width="2880"
          height="706"
        />
        <img
          src="/images/page-banners/visa-pc.png"
          alt=""
          class="block w-full"
          width="2880"
          height="706"
          fetchpriority="high"
        />
      </picture>
      <div class="visa-hero__copy">
        <div class="visa-hero__tag">
          <Globe class="visa-hero__tag-icon" />
          <span>全球医疗签证服务</span>
        </div>
        <h1 class="visa-hero__title">签证办理流程</h1>
        <p class="visa-hero__desc">
          寰宇云医协助您快速获得中国医疗签证，从邀请函到签证获批，全程无忧
        </p>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <!-- 1. 免签国家/地区 -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <Globe style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">免签国家/地区</h2>
            <p class="text-sm text-gray-500 mt-1">以下国家/地区公民可免签入境中国，无需办理医疗签证</p>
          </div>
        </div>

        <div class="space-y-8">
          <div v-for="region in visaFreeData" :key="region.region">
            <h3
              class="text-lg font-semibold mb-4 px-3 py-1 inline-block rounded-lg"
              style="background-color: #FFF5EB; color: #C05621"
            >
              {{ region.region }}
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div
                v-for="country in region.countries"
                :key="country.name"
                class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <span class="text-3xl mb-2">{{ country.flag }}</span>
                <span class="text-sm font-medium text-gray-800 leading-tight">{{ country.name }}</span>
                <span
                  class="text-xs mt-1 font-medium px-2 py-0.5 rounded-full"
                  style="background-color: #FFF5EB; color: #C05621"
                >
                  免签 {{ country.days }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. 医疗签证类型 -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <FileText style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">医疗签证类型（M签证）</h2>
            <p class="text-sm text-gray-500 mt-1">专为国际患者设计的中国医疗签证</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="p-3 rounded-lg shrink-0" style="background-color: #FFF5EB">
                  <Stethoscope style="color: #C05621" class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-lg">M字签证（医疗签证）</h3>
                  <p class="text-gray-600 mt-1">专为需要在中国接受治疗的国际患者设计的签证类型</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="rounded-xl p-4" style="background-color: #FFFAF5">
                  <p class="text-xs text-gray-500 mb-1">有效期</p>
                  <p class="font-semibold text-gray-900">30天 - 180天</p>
                  <p class="text-xs text-gray-500">单次/多次入境可选</p>
                </div>
                <div class="rounded-xl p-4" style="background-color: #FFFAF5">
                  <p class="text-xs text-gray-500 mb-1">停留期限</p>
                  <p class="font-semibold text-gray-900">最长180天</p>
                  <p class="text-xs text-gray-500">可申请延期</p>
                </div>
              </div>

              <div class="rounded-xl p-4 border-l-4" style="border-left-color: #C05621; background-color: #FFFAF5">
                <p class="text-sm text-gray-700">
                  <span class="font-semibold">适用人群：</span>
                  需在中国接受治疗的国际患者
                </p>
              </div>
            </div>

            <div class="rounded-xl p-6" style="background-color: #FFFAF5">
              <h4 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle style="color: #C05621" class="w-5 h-5" />
                与普通旅游签证L的区别
              </h4>
              <ul class="space-y-3">
                <li v-for="(item, i) in mVisaDiffs" :key="i" class="flex items-start gap-3 text-sm">
                  <CheckCircle style="color: #C05621" class="w-4 h-4 mt-0.5 shrink-0" />
                  <span class="text-gray-700">{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 所需材料清单 -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <FileText style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">所需材料清单</h2>
            <p class="text-sm text-gray-500 mt-1">准备以下材料，寰宇云医将协助您完成申请</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="(item, index) in materials"
            :key="index"
            class="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-start gap-4"
          >
            <div class="p-2.5 rounded-lg shrink-0" style="background-color: #FFF5EB">
              <component :is="iconMap[item.icon]" style="color: #C05621" class="w-5 h-5" />
            </div>
            <div class="flex items-center gap-2">
              <span
                class="text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                style="background-color: #C05621"
              >
                {{ index + 1 }}
              </span>
              <span class="text-sm text-gray-700 leading-relaxed">{{ item.text }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6 rounded-xl p-4 flex items-center gap-3" style="background-color: #FFF5EB">
          <Star style="color: #C05621" class="w-5 h-5 shrink-0" />
          <p class="text-sm" style="color: #C05621">
            <span class="font-semibold">提示：</span>
            寰宇云医提供材料预审服务，确保您的申请一次通过。如有缺失材料，我们将协助补充。
          </p>
        </div>
      </section>

      <!-- 4. 办理步骤时间线 -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <Clock style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">办理步骤</h2>
            <p class="text-sm text-gray-500 mt-1">从提交资料到出发就医，全程仅需6步</p>
          </div>
        </div>

        <!-- Desktop Horizontal Timeline -->
        <div class="hidden md:block">
          <div class="relative">
            <div class="flex items-start justify-between relative">
              <!-- Connector Line -->
              <div
                class="absolute top-8 left-0 right-0 h-1 rounded-full"
                style="background-color: #FFF5EB; margin: 0 3rem"
              >
                <div class="h-full rounded-full w-full" style="background-color: #C05621" />
              </div>

              <div
                v-for="step in timelineSteps"
                :key="step.step"
                class="relative flex flex-col items-center text-center z-10"
                style="width: 16.666%"
              >
                <div
                  class="w-16 h-16 rounded-full flex items-center justify-center border-4 bg-white shadow-md"
                  style="border-color: #C05621"
                >
                  <component :is="timelineIconMap[step.icon]" style="color: #C05621" class="w-6 h-6" />
                </div>
                <div class="mt-4 px-2">
                  <p class="text-xs font-bold uppercase tracking-wider mb-1" style="color: #C05621">
                    Step {{ step.step }}
                  </p>
                  <h4 class="font-semibold text-gray-900 text-sm">{{ step.title }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ step.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Vertical Timeline -->
        <div class="md:hidden space-y-0">
          <div v-for="(step, index) in timelineSteps" :key="step.step" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center border-4 bg-white shadow-md shrink-0"
                style="border-color: #C05621"
              >
                <component :is="timelineIconMap[step.icon]" style="color: #C05621" class="w-5 h-5" />
              </div>
              <div
                v-if="index !== timelineSteps.length - 1"
                class="w-1 flex-1 min-h-[3rem]"
                style="background-color: #FFF5EB"
              />
            </div>
            <div class="pb-8 pt-1">
              <p class="text-xs font-bold uppercase tracking-wider mb-1" style="color: #C05621">
                Step {{ step.step }}
              </p>
              <h4 class="font-semibold text-gray-900">{{ step.title }}</h4>
              <p class="text-sm text-gray-500 mt-1">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 加急服务 -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <Plane style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">加急服务</h2>
            <p class="text-sm text-gray-500 mt-1">多种办理速度可选，满足您的紧急需求</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            v-for="(service, index) in urgentServices"
            :key="index"
            :class="[
              'relative rounded-2xl p-6 shadow-sm transition-all hover:shadow-md',
              service.highlight
                ? 'border-2 border-[#C05621]'
                : 'border border-gray-100 bg-white',
            ]"
            :style="service.highlight ? { backgroundColor: '#FFFAF5' } : {}"
          >
            <div
              v-if="service.highlight"
              class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
              style="background-color: #C05621"
            >
              推荐
            </div>
            <h3 class="text-xl font-bold text-gray-900 text-center">{{ service.title }}</h3>
            <p class="text-center mt-2">
              <span class="text-2xl font-bold" style="color: #C05621">{{ service.price }}</span>
            </p>
            <div class="mt-4 text-center py-2 rounded-lg" style="background-color: #FFF5EB">
              <Clock style="color: #C05621" class="w-4 h-4 inline mr-1" />
              <span class="text-sm font-semibold" style="color: #C05621">{{ service.time }}</span>
            </div>
            <ul class="mt-5 space-y-3">
              <li v-for="(feature, i) in service.features" :key="i" class="flex items-center gap-2 text-sm">
                <CheckCircle style="color: #C05621" class="w-4 h-4 shrink-0" />
                <span class="text-gray-600">{{ feature }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="mt-6 rounded-xl p-5 flex items-start gap-4 bg-white border shadow-sm">
          <div class="p-2 rounded-lg shrink-0" style="background-color: #FFF5EB">
            <Star style="color: #C05621" class="w-5 h-5" />
          </div>
          <div>
            <h4 class="font-semibold text-gray-900">寰宇云医VIP通道</h4>
            <p class="text-sm text-gray-600 mt-1">
              与多家使领馆建立合作关系，享有优先处理权。无论选择哪种办理方式，VIP客户均可享受优先审核、专人跟进、实时进度推送等增值服务。
            </p>
          </div>
        </div>
      </section>

      <!-- 6. FAQ -->
      <section>
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 rounded-xl" style="background-color: #FFF5EB">
            <Users style="color: #C05621" class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-gray-900">常见问题</h2>
            <p class="text-sm text-gray-500 mt-1">关于医疗签证的常见疑问解答</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div
            v-for="(faq, index) in faqData"
            :key="index"
            :class="index !== faqData.length - 1 ? 'border-b border-gray-100' : ''"
          >
            <button
              class="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors"
              @click="toggleFaq(index)"
            >
              <div class="flex items-center gap-3">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style="background-color: #C05621"
                >
                  Q
                </span>
                <span class="font-semibold text-gray-900 text-sm sm:text-base">{{ faq.question }}</span>
              </div>
              <ChevronDown
                :class="['w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200', openFaq === index ? 'rotate-180' : '']"
              />
            </button>
            <div
              :class="['overflow-hidden transition-all duration-300', openFaq === index ? 'max-h-96' : 'max-h-0']"
            >
              <div class="px-5 sm:px-6 pb-5 sm:pb-6 pl-16 sm:pl-[4.5rem]">
                <div class="rounded-xl p-4 text-sm text-gray-700 leading-relaxed" style="background-color: #FFFAF5">
                  <span class="font-bold mr-2" style="color: #C05621">A:</span>
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="text-center">
        <div class="rounded-2xl p-8 sm:p-12" style="background-color: #C05621">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">
            准备好开始您的医疗之旅了吗？
          </h2>
          <p class="text-white/80 mb-8 max-w-2xl mx-auto">
            寰宇云医专业签证团队随时为您服务，48小时内出具医疗邀请函，全程协助签证办理
          </p>
          <router-link
            to="/report"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-transform hover:scale-105 active:scale-95 bg-white"
            style="color: #C05621"
          >
            立即咨询签证顾问
            <ArrowRight class="w-5 h-5" />
          </router-link>
          <p class="text-white/60 text-sm mt-4">
            免费咨询电话：400-XXX-XXXX | 工作时间：周一至周日 9:00-21:00
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.visa-hero {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.visa-hero__media,
.visa-hero__media img {
  display: block;
  width: 100%;
}

.visa-hero__copy {
  position: absolute;
  z-index: 1;
  top: 26%;
  left: clamp(96px, 7.64vw, 220px);
  max-width: 900px;
}

.visa-hero__tag {
  display: inline-flex;
  align-items: center;
  gap: clamp(8px, 0.56vw, 16px);
  min-height: clamp(36px, 2.64vw, 76px);
  border-radius: 999px;
  background: linear-gradient(90deg, #e66a1c 0%, #f8b86e 100%);
  padding: 0 clamp(22px, 1.74vw, 50px);
  color: #fff;
  font-size: clamp(15px, 1.11vw, 32px);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.visa-hero__tag-icon {
  width: clamp(18px, 1.18vw, 34px);
  height: clamp(18px, 1.18vw, 34px);
}

.visa-hero__title {
  margin: clamp(32px, 2.43vw, 70px) 0 0;
  color: #e2661b;
  font-size: clamp(48px, 3.75vw, 108px);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: 0;
}

.visa-hero__desc {
  margin: clamp(34px, 2.43vw, 70px) 0 0;
  max-width: 1250px;
  color: #4f4a46;
  font-size: clamp(18px, 1.32vw, 38px);
  font-weight: 600;
  line-height: 1.55;
  letter-spacing: 0;
}

@media (max-width: 767px) {
  .visa-hero__copy {
    top: 20%;
    left: 4.27vw;
    max-width: 48%;
  }

  .visa-hero__tag {
    min-height: 28px;
    gap: 5px;
    padding: 0 16px;
    font-size: 12px;
  }

  .visa-hero__tag-icon {
    width: 14px;
    height: 14px;
  }

  .visa-hero__title {
    margin-top: 30px;
    font-size: 28px;
    line-height: 1.05;
  }

  .visa-hero__desc {
    margin-top: 16px;
    max-width: 100%;
    color: #4b4540;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.65;
  }
}
</style>
