<template>
  <div
    class="d-flex vh-100 overflow-hidden"
    style="background-color: var(--color-surface)"
  >
    <div style="width: 280px; flex-shrink: 0"><SideBar /></div>

    <main class="flex-grow-1 overflow-auto">
      <div class="w-100" style="background-color: var(--color-primary-soft)">
        <ProgressBar />
      </div>

      <div class="p-4">
        <div class="bg-white rounded-4 shadow-sm py-2 px-4">
          <CalendarMain />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import SideBar from '@/components/common/SideBar.vue';
import ProgressBar from '@/components/common/ProgressBar.vue';
import CalendarMain from '@/components/calendar/CalendarMain.vue';
import { onMounted } from 'vue';
import { useAccountStore } from '@/stores/account';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
const profile = useProfileStore();

const store = useAccountStore();
const auth = useAuthStore();

onMounted(() => {
  const userId = localStorage.getItem('userId');

  if (userId) {
    store.fetchTransactions();
    profile.fetchTravelGoal();
  }
});

console.log('user:', auth.user);
</script>
