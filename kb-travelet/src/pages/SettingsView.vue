<template>
  <div
    class="container-fluid p-0 d-flex min-vh-100"
    style="background-color: var(--color-surface)"
  >
    <div style="width: 280px; flex-shrink: 0"><SideBar /></div>

    <main class="flex-grow-1 p-4 overflow-auto">
      <div class="mb-2">
        <ProgressBar />
      </div>
      <div class="bg-white rounded-4 shadow-sm p-4">
        <h3>Setting 화면</h3>
      </div>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
</script>
