import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/LandingView.vue'),
    meta: { title: '시작하기' },
  },
  {
    path: '/onboarding',
    component: () => import('@/pages/OnboardingView.vue'),
    children: [
      {
        path: '',
        redirect: { name: 'step-region' },
      },
      {
        path: 'region',
        name: 'step-region',
        component: () => import('@/components/onboarding/StepRegion.vue'),
        meta: { step: 1 },
      },
      {
        path: 'schedule',
        name: 'step-schedule',
        component: () => import('@/components/onboarding/StepSchedule.vue'),
        meta: { step: 2 },
      },
      {
        path: 'income',
        name: 'step-income',
        component: () => import('@/components/onboarding/StepIncome.vue'),
        meta: { step: 3 },
      },
      {
        path: 'option',
        name: 'step-option',
        component: () => import('@/components/onboarding/StepOption.vue'),
        meta: { step: 4 },
      },
    ],
  },
  {
    path: '/main',
    name: 'main-dashboard',
    component: () => import('@/pages/MainDashboard.vue'),
    meta: { title: '대시보드' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfileView.vue'),
    meta: { title: '설정' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;
