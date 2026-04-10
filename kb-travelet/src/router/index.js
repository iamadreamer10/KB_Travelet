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
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/pages/OnboardingView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/main',
    name: 'step-region', // 메인 대시보드
    component: () => import('@/pages/MainDashboard.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const isOnboarded = localStorage.getItem('onboarded') === 'true';

  // 1. 로그인 안 된 유저가 보호된 페이지 접근 시 -> 로그인창으로
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'landing' });
  }
  // 2. 로그인 된 유저가 로그인창('/') 접근 시
  else if (to.name === 'landing' && isAuthenticated) {
    // 온보딩 여부에 따라 온보딩 혹은 메인으로 토스
    isOnboarded ? next({ name: 'step-region' }) : next({ name: 'onboarding' });
  }
  // 3. 온보딩 안 한 유저가 메인('/main') 접근 시 -> 온보딩으로 강제 이동
  else if (to.name === 'step-region' && isAuthenticated && !isOnboarded) {
    next({ name: 'onboarding' });
  } else {
    next();
  }
});

export default router;
