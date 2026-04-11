import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '@/pages/LandingView.vue';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
    meta: { requiresAuth: false },
  },
  {
    path: '/check-in',
    name: 'onboarding',
    component: () => import('@/pages/OnboardingView.vue'),
    meta: { requiresAuth: true },
    redirect: { name: 'step-region' },
    children: [
      {
        path: 'region',
        name: 'step-region',
        component: () => import('@/components/onboarding/StepRegion.vue'),
      },
      // 🚩 에러 해결: 누락된 온보딩 단계들을 모두 등록합니다.
      {
        path: 'schedule',
        name: 'step-schedule', // OnboardingView.vue에서 찾는 이름과 일치해야 함
        component: () => import('@/components/onboarding/StepSchedule.vue'),
      },
      {
        path: 'income',
        name: 'step-income',
        component: () => import('@/components/onboarding/StepIncome.vue'),
      },
      {
        path: 'fixed-expense',
        name: 'step-fixed-expense',
        component: () => import('@/components/onboarding/StepFixedExpense.vue'),
        meta: { step: 4 },
      },
      {
        path: 'fixed-expense',
        name: 'step-fixed-expense',
        component: () => import('@/components/onboarding/StepFixedExpense.vue'),
        meta: { step: 4 },
      },
      {
        path: 'option',
        name: 'step-option',
        component: () => import('@/components/onboarding/StepOption.vue'),
        meta: { step: 5 },
      },
    ],
  },
  {
    path: '/main',
    name: 'main-dashboard',
    component: () => import('@/pages/MainDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfileView.vue'),
    meta: { title: '설정' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

/**
 * 네비게이션 가드
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isOnboarded = localStorage.getItem('onboarded') === 'true';

  // 1. 인증 체크: 로그인 안 된 유저가 보호된 페이지 접근 시
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'landing' });
  }

  // 2. 로그인 된 유저가 로그인창('/') 접근 시 -> 상태에 따라 리다이렉트
  if (to.name === 'landing' && isAuthenticated) {
    return isOnboarded
      ? next({ name: 'main-dashboard' })
      : next({ name: 'step-region' });
  }

  // 3. 온보딩 체크: 로그인 했으나 온보딩 안 한 유저가 메인('/main') 접근 시
  if (to.name === 'main-dashboard' && isAuthenticated && !isOnboarded) {
    return next({ name: 'step-region' });
  }

  next();
});

export default router;
