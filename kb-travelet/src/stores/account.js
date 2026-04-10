import { ref } from 'vue';
import { defineStore } from 'pinia';

/*
거래(Account) Store
- 사용자의 수입/지출 데이터를 관리하는 store
 */

export const useAccountStore = defineStore('account', () => {
  /*
    거래 목록 상태
    @type {Array}
   
    거래 데이터 구조:
    {
      id: number,                     // 거래 고유 id
      userId: string,                 // 사용자 id (추후 로그인 연동)
      date: string,                   // 날짜 (YYYY-MM-DD)
      type: 'income' | 'expense',    // 수입 / 지출
      category: string,               // 카테고리 (식비, 쇼핑 등)
      amount: number,                 // 금액
      memo: string                    // 메모
    }
   */

  const transactions = ref([]);

  const addTransaction = (tx) => {
    transactions.value.push({
      ...tx,
      id: tx.id ?? Date.now(),
      userId: tx.userId ?? 'user1',
    });
  };

  const deleteTransaction = (id) => {
    transactions.value = transactions.value.filter((t) => t.id !== id);
  };

  const updateTransaction = (updated) => {
    const idx = transactions.value.findIndex((t) => t.id === updated.id); // 수정할 거래의 위치(id) 찾기
    if (idx !== -1) {
      transactions.value[idx] = {
        ...transactions.value[idx],
        ...updated,
      };
    } else {
      console.warn('수정할 거래를 찾을 수 없습니다.');
    }
  };

  const getTransactionByDate = (date) => {
    return transactions.value.filter((t) => t.date === date);
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionByDate,
  };
});
