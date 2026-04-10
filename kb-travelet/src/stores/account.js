import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import { useAuthStore } from './auth';

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

  // 거래 목록 저장
  const transactions = ref([]);

  const addTransaction = async (tx) => {
    const userId = localStorage.getItem('userId');
    try {
      const newTx = {
        ...tx,
        id: tx.id ?? Date.now(),
        userId: userId,
      };

      const res = await axios.post('http://localhost:3000/transactions', newTx);

      transactions.value.push(res.data);
    } catch (err) {
      console.error('거래 추가 실패: ', err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/transactions/${id}`);
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (err) {
      console.error('삭제 실패: ', err);
    }
  };

  const updateTransaction = async (updated) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/transactions/${updated.id}`,
        updated,
      );

      const idx = transactions.value.findIndex((t) => t.id === updated.id);
      if (idx !== -1) {
        transactions.value[idx] = res.data;
      }
    } catch (err) {
      console.error('수정 실패: ', err);
    }
  };

  const getTransactionByDate = (date) => {
    return transactions.value.filter((t) => t.date === date);
  };

  // 초기 데이터 불러오기
  const fetchTransactions = async () => {
    const userId = localStorage.getItem('userId');

    if (!userId) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/transactions?userId=${userId}`,
      );

      transactions.value = res.data;
    } catch (err) {
      console.error('거래 불러오기 실패: ', err);
    }
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    getTransactionByDate,
    fetchTransactions,
  };
});
