<template>
  <div class="onboarding-transition-shell">
    <router-view v-slot="{ Component }">
      <Transition :name="transitionName" mode="out-in">
        <component
          v-if="isReady"
          :is="Component"
          :key="route.path"
          @next="nextStep"
          @prev="prevStep"
        />
        <div v-else class="loading-screen">
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </Transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTravelStore } from '@/stores/travel';

const router = useRouter();
const route = useRoute();
const travelStore = useTravelStore();

// --- 상태 관리 ---
const isReady = ref(false);
const transitionName = ref('step-forward');

// 순서 정의
const steps = [
  { key: 'region', routeName: 'step-region' },
  { key: 'schedule', routeName: 'step-schedule' },
  { key: 'income', routeName: 'step-income' },
  { key: 'option', routeName: 'step-option' },
];

// 현재 몇 번째 단계인지 계산 (0, 1, 2, 3)
const currentStepIndex = computed(() => {
  const index = steps.findIndex((step) => step.routeName === route.name);
  return index >= 0 ? index : 0;
});

/**
 * 🚩 트랜지션 방향 결정 (Watch)
 */
watch(
  () => route.name,
  (newName, oldName) => {
    if (!oldName) return;

    const newIdx = steps.findIndex((s) => s.routeName === newName);
    const oldIdx = steps.findIndex((s) => s.routeName === oldName);

    if (newIdx !== -1 && oldIdx !== -1) {
      transitionName.value = newIdx > oldIdx ? 'step-forward' : 'step-backward';
    }
  },
);

/**
 * 다음 단계로 이동 (Router push 활용)
 */
const nextStep = () => {
  const nextIdx = currentStepIndex.value + 1;

  if (nextIdx < steps.length) {
    // 다음 스텝으로 라우팅 이동
    router.push({ name: steps[nextIdx].routeName });
  } else {
    // 🚩 마지막 스텝 완료 시 처리
    localStorage.setItem('onboarded', 'true');
    alert('모든 설정 완료! 메인으로 이동합니다.');
    router.push({ name: 'main-dashboard' }); // 메인 대시보드 이름 확인
  }
};

/**
 * 이전 단계로 이동
 */
const prevStep = () => {
  const prevIdx = currentStepIndex.value - 1;
  if (prevIdx >= 0) {
    router.push({ name: steps[prevIdx].routeName });
  }
};

/**
 * 초기 데이터 로드 및 온보딩 체크
 */
onMounted(async () => {
  try {
    const profile = await travelStore.loadProfile();

    if (profile?.checkedIn) {
      localStorage.setItem('onboarded', 'true');
      router.replace('/main');
      return;
    }
  } catch (error) {
    console.error('초기 데이터 로드 실패:', error);
  } finally {
    isReady.value = true;
  }
});
</script>

<style scoped>
.onboarding-transition-shell {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background-color: #fff;
}

.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 트랜지션 스타일 */
.step-forward-enter-active,
.step-forward-leave-active,
.step-backward-enter-active,
.step-backward-leave-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.step-forward-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.step-forward-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.step-backward-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.step-backward-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
