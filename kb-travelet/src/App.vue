<script setup></script>

<template>
  <div
    class="app-container min-h-screen bg-slate-50 flex flex-col mx-auto max-w-md shadow-2xl overflow-hidden relative"
  >
    <main class="flex-1 overflow-y-auto">
      <RouterView/>
    </main>

    <div
      v-if="isLoading"
      class="absolute inset-0 bg-white/60 flex items-center justify-center z-50"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-4 border-[#0766ff] border-t-transparent"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

const route = useRoute();


// 테스트용 로딩 상태 (실제로는 스토어에서 관리)
const isLoading = computed(() => true);
</script>

<style>
/* 전역 스타일: 대한항공 테마 적용 */
:root {
  --primary-color: #0766ff;
}

/* 스크롤바 숨기기 (모바일 앱 느낌) */
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 페이지 전환 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 전체 앱 컨테이너 폰트 및 기본 설정 */
.app-container {
  height: 100vh;
  border-left: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}
</style>
