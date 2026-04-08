<template>
  <div
    class="d-flex vh-100 overflow-hidden"
    style="background-color: var(--color-surface)"
  >
    <div style="width: 280px; flex-shrink: 0"><SideBar /></div>

    <main class="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
      <div
        class="w-100 sticky-top flex-shrink-0"
        style="z-index: 1020; background-color: var(--color-primary-soft)"
      >
        <ProgressBar />
      </div>
      <div class="flex-grow-1 overflow-auto p-4">
        <h4 class="mb-4 fw-bold">설정</h4>

        <div class="settings-content">
          <ProfileSection class="mb-4" />
          <TravelGoalSection class="mb-4" />
          <FinishGoalSection />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import ProfileSection from '@/components/profile/ProfileSection.vue';
import TravelGoalSection from '@/components/profile/TravelGoalSection.vue';
import FinishGoalSection from '@/components/profile/FinishGoalSection.vue';
</script>

<style scoped>
.bg-surface {
  background-color: var(--color-surface);
}
/* 스크롤바 디자인을 깔끔하게 하고 싶다면 */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
