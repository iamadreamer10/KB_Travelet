<template>
  <div v-if="store.transactions.length === 0">
    거래 내역이 없습니다.
  </div>

  <ul v-else>
    <li v-for="t in store.transactions" :key="t.id">
        {{ t.category }} - 
    </li>
  </ul>
</template>

<script setup>
import { useAccountStore } from '@/stores/account';

const store = useAccountStore();
</script>

<style scoped></style>
