<template>
  <div
    class="container-fluid p-0 d-flex min-vh-100"
    style="background-color: var(--color-surface)"
  >
    <div style="width: 280px">
      <SideBar />
    </div>

    <main class="flex-grow-1 p-4 overflow-auto">
      <div class="mb-2">
        <ProgressBar />
      </div>
      <div class="bg-white rounded-4 shadow-sm p-4">
        <CalendarMain />
      </div>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import CalendarMain from '@/components/calendar/CalendarMain.vue';
</script>
