import { createRouter, createWebHistory } from 'vue-router';

// 페이지별 타이틀을 설정하기 위한 유틸리티 (선택 사항)
const DEFAULT_TITLE = 'Travelet';

const routes = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@/pages/LandingView.vue'),
    meta: { title: '시작하기', requiresAuth: false },
  },
  {
    path: '/check-in',
    name: 'onboarding',
    component: () => import('@/pages/OnboardingView.vue'),
    meta: { requiresAuth: true }, // 로그인 필요
    children: [
      {
        path: '',
        redirect: { name: 'step-region' },
      },
      {
        path: 'region',
        name: 'step-region',
        component: () => import('@/components/onboarding/StepRegion.vue'),
        meta: { title: '지역 선택', step: 1 },
      },
      {
        path: 'schedule',
        name: 'step-schedule',
        component: () => import('@/components/onboarding/StepSchedule.vue'),
        meta: { title: '일정 설정', step: 2 },
      },
      {
        path: 'income',
        name: 'step-income',
        component: () => import('@/components/onboarding/StepIncome.vue'),
        meta: { title: '수입 입력', step: 3 },
      },
      {
        path: 'fixed-expense',
        name: 'step-fixed-expense',
        component: () => import('@/components/onboarding/StepFixedExpense.vue'),
        meta: { title: '고정 지출', step: 4 },
      },
      {
        path: 'option',
        name: 'step-option',
        component: () => import('@/components/onboarding/StepOption.vue'),
        meta: { title: '추가 옵션', step: 5 },
      },
    ],
  },
  {
    path: '/main',
    name: 'main-dashboard',
    component: () => import('@/pages/MainDashboard.vue'),
    meta: { title: '대시보드', requiresAuth: true }, // 로그인 필요
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/pages/ProfileView.vue'),
    meta: { title: '설정', requiresAuth: true }, // 로그인 필요
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

/**
 * 🚩 네비게이션 가드: 인증 및 온보딩 체크
 */
router.beforeEach((to, from, next) => {
  // 브라우저 탭 타이틀 변경
  document.title = to.meta.title
    ? `${to.meta.title} - Travelet`
    : DEFAULT_TITLE;

  const token = localStorage.getItem('token');
  const isOnboarded = localStorage.getItem('onboarded') === 'true';

  // 1. 로그인이 필요한 페이지인데 토큰이 없는 경우 -> 랜딩으로
  if (to.meta.requiresAuth && !token) {
    return next({ name: 'landing' });
  }

  // 2. 이미 로그인했는데 랜딩('/') 페이지로 가려는 경우 -> 메인이나 온보딩으로 가로채기
  if (to.name === 'landing' && token) {
    return isOnboarded
      ? next({ name: 'main-dashboard' })
      : next({ name: 'step-region' });
  }

  // 3. 로그인은 했으나 온보딩을 안 했는데 메인으로 가려는 경우 -> 온보딩으로
  if (to.name === 'main-dashboard' && token && !isOnboarded) {
    return next({ name: 'step-region' });
  }

  next();
});

export default router;
