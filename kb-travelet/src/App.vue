<script setup></script>

<template>
  <div :class="appContainerClasses">
    <main :class="mainContainerClasses">
      <RouterView />
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

const route = useRoute();

const isOnboardingRoute = computed(
  () =>
    route.path.startsWith('/onboarding') || route.path.startsWith('/check-in'),
);
const appContainerClasses = computed(() => [
  'app-container',
  'min-h-screen',
  'bg-slate-50',
  'flex',
  'flex-col',
  'mx-auto',
  'relative',
  isOnboardingRoute.value
    ? 'onboarding-shell'
    : 'max-w-md shadow-2xl overflow-hidden',
]);
const mainContainerClasses = computed(() => [
  'flex-1',
  isOnboardingRoute.value ? 'onboarding-main' : 'overflow-y-auto',
]);

const isLoading = computed(() => false);
</script>

<style>
.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
.overflow-y-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-container {
  height: 100vh;
  border-left: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}

.onboarding-shell {
  width: 100%;
  max-width: none;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: none;
  border-left: 0;
  border-right: 0;
}

.onboarding-main {
  width: 100%;
  min-height: 100dvh;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>
