import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
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
          component: () => import('@/views/patient/CostView.vue'),
          meta: { title: '费用对比' },
        },
        {
          path: 'hospitals',
          name: 'patient-hospitals',
          component: () => import('@/views/patient/HospitalView.vue'),
          meta: { title: '中国医院' },
        },
        {
          path: 'report',
          name: 'patient-report',
          component: () => import('@/views/patient/ReportView.vue'),
          meta: { title: '报告体验' },
        },
        {
          path: 'cases',
          name: 'patient-cases',
          component: () => import('@/views/patient/CaseView.vue'),
          meta: { title: '患者案例' },
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

// 动态页面标题
router.beforeEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - 寰宇云医` : '寰宇云医'
})

export default router
