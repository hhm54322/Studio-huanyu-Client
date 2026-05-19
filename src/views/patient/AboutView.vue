<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Eye,
  Cpu,
  HeartPulse,
  Heart,
  Shield,
  Scale,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
} from 'lucide-vue-next'

const { t } = useI18n()

const values = [
  {
    icon: Eye,
    title: '全程透明可视',
    desc: '实时就医看板让每一步进展清晰可见；逐条费用清单杜绝隐形消费；家属同步权限让关心您的人随时掌握动态。',
    color: 'bg-orange-100 text-[#C05621]',
  },
  {
    icon: Cpu,
    title: 'AI精准匹配 × 专家人工复核',
    desc: '智能算法基于病情、预算、偏好进行医院与专家匹配；副主任医师及以上专家进行二次人工复核，确保推荐精准可靠。',
    color: 'bg-amber-100 text-[#DD6B20]',
  },
  {
    icon: HeartPulse,
    title: '全周期术后管理',
    desc: '月度随访不间断；跨境云病房让您回国后仍能与中国主治团队保持连接；个人康复档案终身留存，方便复诊与转诊。',
    color: 'bg-orange-100 text-[#ED8936]',
  },
  {
    icon: Heart,
    title: '零门槛决策体验',
    desc: '免费预评估报告让您在付费前充分了解方案；无压力决策，不绑定、不推销，一切由您自主选择。',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    icon: Shield,
    title: '合规保障 × 应急响应',
    desc: '病历翻译准确率98.5%，确保沟通零误差；异常预警系统实时监控治疗进程；合规审查保障所有合作医院资质正规。',
    color: 'bg-red-100 text-red-600',
  },
]

const comparison = [
  { item: '医院选择透明度', us: '真实数据 + 患者评价公开', them: '有限推荐，信息不透明' },
  { item: '费用预估精度', us: '精准到千位，逐条明细', them: '粗略估算，隐性收费常见' },
  { item: '专家对接方式', us: '锁定具体专家，预留VIP号源', them: '仅承诺科室，无法指定医生' },
  { item: '病历翻译质量', us: '医学级翻译，准确率98.5%', them: '普通翻译，医学术语易错' },
  { item: '术后随访', us: '跨境云病房 + 月度随访', them: '回国即结束，无后续支持' },
  { item: '应急响应', us: '7×24小时多语言医学顾问', them: '仅工作时间，非医学背景客服' },
  { item: '价格体系', us: '套餐透明，无捆绑消费', them: '层层加价，中间费用高昂' },
  { item: '合规资质', us: '合作医院全部JCI或三甲认证', them: '资质参差不齐，存在风险' },
]

const team = [
  {
    name: '医学顾问团队',
    role: '副主任医师及以上',
    desc: '来自北京协和、上海瑞金等顶尖医院，负责病历审核与方案把关。',
    icon: Users,
  },
  {
    name: '就医管家团队',
    role: '全程陪诊服务',
    desc: '熟悉国际患者就医流程，协助挂号、翻译、手续代办与住院协调。',
    icon: Users,
  },
  {
    name: '客服支持团队',
    role: '7×24小时多语言',
    desc: '中英双语医学客服，随时响应患者及家属疑问，紧急事件快速上报。',
    icon: Globe,
  },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="design-hero design-hero--about">
      <picture class="design-hero__media" aria-hidden="true">
        <source
          media="(max-width: 767px)"
          srcset="/images/page-banners/about-mobile.jpg"
          type="image/jpeg"
          width="750"
          height="444"
        />
        <source
          media="(max-width: 767px)"
          srcset="/images/page-banners/about-mobile.png"
          width="750"
          height="444"
        />
        <source
          srcset="/images/page-banners/about-pc.jpg"
          type="image/jpeg"
          width="2880"
          height="664"
        />
        <img
          src="/images/page-banners/about-pc.png"
          alt=""
          class="block w-full"
          width="2880"
          height="664"
          fetchpriority="high"
        />
      </picture>
      <div class="design-hero__copy design-hero__copy--about">
        <h1 class="design-hero__title">{{ t('about.title') }}</h1>
        <p class="design-hero__pill">{{ t('about.subtitle') }}</p>
      </div>
    </section>

    <!-- Values -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('about.values') }}</h2>
        <p class="mt-3 text-gray-600">我们坚守的服务准则，也是您选择我们的理由</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="v in values"
          :key="v.title"
          class="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div :class="['h-12 w-12 rounded-xl flex items-center justify-center mb-4', v.color]">
            <component :is="v.icon" class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ v.title }}</h3>
          <p class="text-gray-600 text-sm leading-relaxed">{{ v.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Comparison -->
    <section class="bg-orange-50/50 py-16 border-y border-orange-100">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">{{ t('about.compareTitle') }}</h2>
          <p class="mt-3 text-gray-600">透明的对比，让您看清差异</p>
        </div>
        <div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gradient-to-r from-[#C05621] to-[#DD6B20] text-white">
              <tr>
                <th class="px-3 py-3 text-left font-semibold w-[25%]">对比维度</th>
                <th class="px-3 py-3 text-left font-semibold">{{ t('about.huanyu') }}</th>
                <th class="px-3 py-3 text-left font-semibold text-orange-100">{{ t('about.traditional') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="row in comparison" :key="row.item">
                <td class="px-3 py-3 font-medium text-gray-900">{{ row.item }}</td>
                <td class="px-3 py-3 text-gray-700">
                  <div class="flex items-center gap-1.5">
                    <CheckCircle2 class="h-4 w-4 text-green-500 shrink-0" />{{ row.us }}
                  </div>
                </td>
                <td class="px-3 py-3 text-gray-500">
                  <div class="flex items-center gap-1.5">
                    <XCircle class="h-4 w-4 text-gray-300 shrink-0" />{{ row.them }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Commitment -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 p-10 md:p-14 text-white text-center">
        <Scale class="h-10 w-10 text-[#ED8936] mx-auto mb-4" />
        <h2 class="text-2xl md:text-3xl font-bold mb-4">{{ t('about.promise') }}</h2>
        <p class="text-gray-300 max-w-3xl mx-auto leading-relaxed">
          {{ t('about.promiseText') }}
        </p>
      </div>
    </section>

    <!-- Team -->
    <section class="bg-white py-16 border-y border-orange-100">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900">{{ t('about.team') }}</h2>
          <p class="mt-3 text-gray-600">多学科背景，只为给您最专业的支持</p>
        </div>
        <div class="grid md:grid-cols-3 gap-6">
          <div
            v-for="member in team"
            :key="member.name"
            class="rounded-2xl border border-gray-200 bg-white p-8 text-center hover:shadow-md transition-shadow"
          >
            <div class="h-14 w-14 rounded-full bg-gradient-to-br from-[#C05621] to-[#ED8936] flex items-center justify-center text-white mx-auto mb-4">
              <component :is="member.icon" class="h-7 w-7" />
            </div>
            <h3 class="text-lg font-bold text-gray-900">{{ member.name }}</h3>
            <div class="text-sm text-[#DD6B20] font-medium mt-1">{{ member.role }}</div>
            <p class="text-sm text-gray-600 mt-3 leading-relaxed">{{ member.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900">{{ t('about.contact') }}</h2>
        <p class="mt-3 text-gray-600">{{ t('about.contactDesc') }}</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div class="rounded-2xl border border-orange-100 bg-orange-50/50 p-6 text-center">
          <Mail class="h-6 w-6 text-[#DD6B20] mx-auto mb-3" />
          <div class="text-sm text-gray-500 mb-1">电子邮件</div>
          <div class="font-semibold text-gray-900">contact@huanyuyunyi.com</div>
        </div>
        <div class="rounded-2xl border border-orange-100 bg-orange-50/50 p-6 text-center">
          <Phone class="h-6 w-6 text-[#DD6B20] mx-auto mb-3" />
          <div class="text-sm text-gray-500 mb-1">服务热线</div>
          <div class="font-semibold text-gray-900">+86 400-888-XXXX</div>
        </div>
        <div class="rounded-2xl border border-orange-100 bg-orange-50/50 p-6 text-center">
          <MapPin class="h-6 w-6 text-[#DD6B20] mx-auto mb-3" />
          <div class="text-sm text-gray-500 mb-1">办公地址</div>
          <div class="font-semibold text-gray-900">中国 &middot; 北京 / 上海</div>
        </div>
      </div>

      <div class="mt-10 text-center">
        <router-link
          to="/report"
          class="inline-flex items-center gap-2 rounded-xl bg-[#DD6B20] px-8 py-4 text-white font-bold shadow hover:bg-[#C05621] transition-colors"
        >
          {{ t('cta.btn') }}
          <ArrowRight class="h-5 w-5" />
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.design-hero {
  position: relative;
  overflow: hidden;
  background: #fff;
}

.design-hero__media,
.design-hero__media img {
  display: block;
  width: 100%;
}

.design-hero__copy {
  position: absolute;
  z-index: 1;
  left: clamp(96px, 7.64vw, 220px);
}

.design-hero__copy--about {
  top: 29%;
}

.design-hero__title {
  margin: 0;
  color: #e2661b;
  font-size: clamp(42px, 3.33vw, 96px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0;
}

.design-hero__pill {
  display: inline-flex;
  align-items: center;
  margin-top: clamp(20px, 1.45vw, 42px);
  min-height: clamp(42px, 2.6vw, 75px);
  border-radius: 999px;
  background: linear-gradient(90deg, #e96d22 0%, #f7b66c 100%);
  padding: 0 clamp(28px, 2.28vw, 66px);
  color: #fff;
  font-size: clamp(16px, 1.25vw, 36px);
  font-weight: 700;
  line-height: 1.15;
  white-space: nowrap;
}

@media (max-width: 767px) {
  .design-hero__copy {
    left: 4vw;
  }

  .design-hero__copy--about {
    top: 34.5%;
  }

  .design-hero__title {
    font-size: 28px;
    line-height: 1.12;
  }

  .design-hero__pill {
    margin-top: 18px;
    min-height: 28px;
    padding: 0 16px;
    font-size: 14px;
    line-height: 1;
  }
}
</style>
