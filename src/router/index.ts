import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
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
          component: () => import('@/views/patient/DentalView.vue'),
          meta: { title: '牙科服务' },
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

// 动态页面标题
router.beforeEach((to) => {
  if (pendingDesignRoutes.has(to.path)) return false
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - 寰宇云医` : '寰宇云医'
})

export default router
