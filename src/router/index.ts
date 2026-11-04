import { createRouter, createWebHistory } from 'vue-router'
import { watch } from 'vue'
import i18n from '@/i18n'
import { translateSiteCopy } from '@/i18n/siteCopy'
import { patientCopyScope } from '@/i18n/patientCopyScopes'
import { resolveLocale, savedLocale } from '@/i18n/languages'
import { useAppStore } from '@/stores/app'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.name === 'patient-dental-doctor' && from.name === to.name && to.params.slug === from.params.slug) return false
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    // ─── 患者端路由 ───
    {
      path: '/',
      component: () => import('@/components/layout/PatientLayout.vue'),
      children: [
        {
          path: '',
          name: 'patient-home',
          component: () => import('@/views/patient/HomeView.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'cost',
          name: 'patient-cost',
          redirect: { path: '/why-china', hash: '#cost-comparison' },
          meta: { title: '费用对比' },
        },
        {
          path: 'cost-generated',
          name: 'patient-cost-generated',
          redirect: { path: '/why-china', hash: '#cost-comparison' },
          meta: { title: '费用对比生成基线' },
        },
        {
          path: 'why-china',
          name: 'patient-why-china',
          component: () => import('@/views/patient/WhyChinaView.vue'),
          meta: { title: '为什么选择中国' },
        },
        {
          path: 'trust',
          name: 'patient-trust',
          component: () => import('@/views/patient/TrustView.vue'),
          meta: { title: '信任与常见问题' },
        },
        {
          path: 'insurance',
          name: 'patient-insurance',
          component: () => import('@/views/patient/InsuranceView.vue'),
          meta: { title: '保险指南' },
        },
        {
          path: 'hospitals',
          name: 'patient-hospitals',
          component: () => import('@/views/patient/HospitalView.vue'),
          meta: { title: '中国医院' },
        },
        {
          path: 'doctors',
          name: 'patient-doctors',
          component: () => import('@/views/patient/PhysicianView.vue'),
          meta: { title: '中国医生' },
        },
        {
          path: 'report',
          name: 'patient-report',
          component: () => import('@/views/patient/ReportView.vue'),
          meta: { title: '报告体验' },
        },
        {
          path: 'professional-report',
          name: 'patient-professional-report',
          component: () => import('@/views/patient/ProfessionalReportView.vue'),
          meta: { title: '专业报告' },
        },
        {
          path: 'cases',
          name: 'patient-cases',
          component: () => import('@/views/patient/CaseView.vue'),
          meta: { title: '患者案例' },
        },
        {
          path: 'dental',
          name: 'patient-dental',
          beforeEnter: async to => {
            const { getDentalFlowSession } = await import('@/data/dentalFlowSession')
            const step = to.query.step === '3' ? 3 : to.query.step === '2' ? 2 : getDentalFlowSession()?.step || 1
            if (step !== 1) await import('@/data/dentalFigmaDetails').then(source => source.loadDentalStep(step))
          },
          component: () => import('@/views/patient/DentalView.vue'),
          meta: { title: '牙科服务' },
        },
        {
          path: 'dental/doctors/:slug',
          name: 'patient-dental-doctor',
          beforeEnter: async to => {
            if (window.innerWidth <= 700) return { path:'/dental', query:{ step:'2' } }
            const { dentalPhysicians } = await import('@/data/dentalPhysicianData')
            if (!dentalPhysicians.some(doctor => doctor.slug === to.params.slug)) return { path:'/dental', query:{ step:'2' } }
            const source = await import('@/data/dentalDoctorPageSource')
            await source.loadDentalDoctorPage(source.parseDentalDoctorTab(to.query.tab))
          },
          component: () => import('@/views/patient/DentalDoctorView.vue'),
          meta: { title: '牙科医生详情' },
        },
        {
          path: 'diseases-technologies',
          name: 'patient-diseases-technologies',
          component: () => import('@/views/patient/DiseaseTechnologyView.vue'),
          meta: { title: '疾病类型' },
        },
        {
          path: 'equipment',
          name: 'patient-equipment',
          component: () => import('@/views/patient/EquipmentView.vue'),
          meta: { title: '设备详情' },
        },
        {
          path: 'visa',
          name: 'patient-visa',
          component: () => import('@/views/patient/VisaView.vue'),
          meta: { title: '签证办理' },
        },
        {
          path: 'steps',
          name: 'patient-steps',
          component: () => import('@/views/patient/StepView.vue'),
          meta: { title: '就医步骤' },
        },
        {
          path: 'steps/toolkit-detail',
          name: 'patient-toolkit-detail',
          beforeEnter: async to => {
            if (typeof to.query.article !== 'string') return
            const { loadToolkitArticle } = await import('@/data/contentFigmaSource')
            await loadToolkitArticle(to.query.article)
          },
          component: () => import('@/views/patient/ToolkitDetailView.vue'),
          meta: { title: '病历翻译与整理工具' },
        },
        {
          path: 'about',
          name: 'patient-about',
          component: () => import('@/views/patient/AboutView.vue'),
          meta: { title: '关于我们' },
        },
      ],
    },
    // ─── 医院端路由 ───
    {
      path: '/hospital',
      component: () => import('@/components/layout/HospitalLayout.vue'),
      children: [
        {
          path: '',
          name: 'hospital-home',
          component: () => import('@/views/hospital/HomeView.vue'),
          meta: { title: '医院端首页', side: 'hospital' },
        },
        {
          path: 'solutions',
          name: 'hospital-solutions',
          component: () => import('@/views/hospital/SolutionView.vue'),
          meta: { title: '解决方案', side: 'hospital' },
        },
        {
          path: 'cases',
          name: 'hospital-cases',
          component: () => import('@/views/hospital/CaseStudyView.vue'),
          meta: { title: '案例研究', side: 'hospital' },
        },
        {
          path: 'api',
          name: 'hospital-api',
          component: () => import('@/views/hospital/ApiView.vue'),
          meta: { title: 'API对接', side: 'hospital' },
        },
        {
          path: 'apply',
          name: 'hospital-apply',
          component: () => import('@/views/hospital/ApplyView.vue'),
          meta: { title: '申请入驻', side: 'hospital' },
        },
      ],
    },
  ],
})

// These destinations have no authored patient-facing Figma frame yet. Keep the
// implementation available for later work, but prevent production navigation
// from entering an unapproved design surface.
const pendingDesignRoutes = new Set(['/equipment', '/visa', '/professional-report'])

router.onError((error, to) => {
  const message = String(error instanceof Error ? error.message : error)
  if (!/(?:dynamically imported module|Importing a module script failed|ChunkLoadError|Unable to preload CSS|Failed to fetch module|Patient language resource failed)/i.test(message)) return
  if (to.meta.side === 'hospital' || to.path.startsWith('/hospital')) return
  // The inlined coordinator owns the sole retry budget and checks whether the
  // first page is still untouched. SPA failures retain the current page.
  window.__huanyuPatientLoad?.failed(to.fullPath)
})

router.afterEach((_to, _from, failure) => {
  if (!failure && document.documentElement.dataset.huanyuAppReady === 'true') window.__huanyuPatientLoad?.ready()
})

// Resolve the complete target-page copy before committing navigation. A slow
// or failed pack never exposes untranslated UI or overwrites a newer choice.
router.beforeEach(async (to) => {
  if (pendingDesignRoutes.has(to.path)) return false
  if (to.meta.side !== 'hospital') {
    const language = resolveLocale(to.query.lang) || resolveLocale(i18n.global.locale.value) || savedLocale()
    if (!await useAppStore().setLocale(language, patientCopyScope(to.path))) {
      throw new Error('Patient language resource failed')
    }
  }
  const title = to.meta.title as string | undefined
  document.title = title ? `${to.meta.side==='hospital'?title:translateSiteCopy(title)} - ${to.meta.side==='hospital'?'寰宇云医':translateSiteCopy('寰宇云医')}` : translateSiteCopy('寰宇云医')
})
watch(i18n.global.locale,()=>{
  const route=router.currentRoute.value
  if(route.meta.side==='hospital')return
  const title=route.meta.title as string|undefined
  document.title=title?`${translateSiteCopy(title)} - ${translateSiteCopy('寰宇云医')}`:translateSiteCopy('寰宇云医')
})

export default router
