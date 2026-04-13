<template>
  <div class="modal">
    <div class="modal-content">
      <button class="close" @click="$emit('close')" aria-label="닫기">
        <i class="fas fa-xmark" aria-hidden="true"></i>
      </button>

      <h2 class="title">{{ formattedDate }}</h2>

      <div class="summary">
        <div class="card income">
          <div class="label">수입</div>
          <div class="value">+{{ totalIncome.toLocaleString() }}원</div>
        </div>

        <div class="card expense">
          <div class="label">지출</div>
          <div class="value">-{{ totalExpense.toLocaleString() }}원</div>
        </div>

        <div class="card balance">
          <div class="label">잔액</div>
          <div class="value">{{ balance.toLocaleString() }}원</div>
        </div>
      </div>

      <button class="add-btn" @click="showForm = !showForm">
        + 거래 추가
      </button>

      <div v-if="showForm" class="form-card">
        <div class="form-title">
          {{ editingId ? '거래 수정' : '거래 추가' }}
          <span class="close-mini" @click="showForm = false">닫기</span>
        </div>

        <div class="row">
          <div class="col">
            <label>유형</label>
            <select v-model="type" class="input">
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
          </div>

          <div class="col" v-if="type === 'expense'">
            <label>카테고리</label>
            <select v-model="category" class="input">
              <option value="식비/카페">식비/카페</option>
              <option value="교통">교통</option>
              <option value="쇼핑">쇼핑</option>
              <option value="문화생활">문화생활</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        <div class="col-full">
          <label>금액 (원)</label>
          <input
            v-model="amount"
            type="number"
            class="input"
            placeholder="금액을 입력해 주세요"
            @keydown="blockInvalidKeys"
            @input="sanitizeAmount"
          />
        </div>

        <div class="col-full">
          <label>메모</label>
          <input v-model="memo" class="input" placeholder="메모를 입력해 주세요" />
        </div>

        <div class="form-actions">
          <button class="submit" @click="add">
            {{ editingId ? '수정하기' : '추가하기' }}
          </button>
          <button class="cancel" @click="showForm = false">취소</button>
        </div>
      </div>

      <h3 class="second-title">거래 내역</h3>

      <div v-if="filtered.length === 0" class="empty">
        거래 내역이 없습니다.
      </div>

      <div v-else>
        <div v-for="t in filtered" :key="t.id" class="item">
          <div>
            <span
              class="badge"
              :class="t.type === 'income' ? 'income-badge' : 'expense-badge'"
            >
              {{ t.type === 'income' ? '수입' : t.category }}
            </span>
            <div class="memo">{{ t.memo || '메모 없음' }}</div>
          </div>

          <div class="right">
            <span :class="t.type === 'income' ? 'income-text' : 'expense-text'">
              {{ t.type === 'income' ? '+' : '-' }}{{ t.amount.toLocaleString() }}원
            </span>
            <button class="icon-btn" @click="editTransaction(t)">
              <i class="fa-solid fa-pen"></i>
            </button>

            <button class="icon-btn delete" @click="handleDelete(t.id)">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAccountStore } from '@/stores/account';

const props = defineProps({
  date: String,
});

const store = useAccountStore();

const formattedDate = computed(() => {
  const d = new Date(props.date);
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${week[d.getDay()]})`;
});

const showForm = ref(false);
const type = ref('expense');
const category = ref('식비/카페');
const amount = ref('');
const memo = ref('');
const editingId = ref(null);

const filtered = computed(() =>
  store.transactions.filter((t) => t.date === props.date),
);

const totalIncome = computed(() =>
  filtered.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0),
);

const totalExpense = computed(() =>
  filtered.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0),
);

const balance = computed(() => totalIncome.value - totalExpense.value);

const add = async () => {
  if (!amount.value) return;

  if (editingId.value) {
    await store.updateTransaction({
      id: editingId.value,
      date: props.date,
      type: type.value,
      category: type.value === 'income' ? '수입' : category.value,
      amount: Number(amount.value),
      memo: memo.value,
    });

    editingId.value = null;
  } else {
    await store.addTransaction({
      date: props.date,
      type: type.value,
      category: type.value === 'income' ? '수입' : category.value,
      amount: Number(amount.value),
      memo: memo.value,
    });
  }

  await store.fetchTransactions();

  amount.value = '';
  memo.value = '';
  category.value = '식비/카페';
  type.value = 'expense';
  showForm.value = false;
};

const editTransaction = (t) => {
  type.value = t.type;
  category.value = t.type === 'income' ? '식비/카페' : t.category;
  amount.value = t.amount;
  memo.value = t.memo;
  editingId.value = t.id;
  showForm.value = true;
};

const handleDelete = (id) => {
  const ok = confirm('정말로 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');

  if (ok) {
    store.deleteTransaction(id);
  }
};

const blockInvalidKeys = (event) => {
  if (['-', '+', 'e', 'E', '.'].includes(event.key)) {
    event.preventDefault();
  }
};

const sanitizeAmount = () => {
  amount.value = String(amount.value).replace(/[^\d]/g, '');
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(5, 23, 102, 0.34);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 16px;
  padding: 24px;
  position: relative;
  scroll-behavior: smooth;
}

.modal-content::-webkit-scrollbar {
  width: 6px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.close {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(7, 102, 255, 0.12);
  border-radius: 999px;
  background: #fff;
  color: var(--color-primary-deep);
  font-size: 18px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(7, 102, 255, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.close:hover {
  transform: translateY(-1px);
  background: #f8fbff;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.14);
}

.title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}

.summary {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.card {
  flex: 1;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
}

.label {
  font-size: 13px;
  margin-bottom: 5px;
}

.value {
  font-weight: bold;
}

.income {
  background: #e6f4ea;
  color: green;
}

.expense {
  background: #fde8e8;
  color: red;
}

.balance {
  background: #e8f0fe;
  color: #2563eb;
}

.add-btn {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  border: none;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.submit {
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
}

.cancel {
  flex: 1;
  background: #eee;
  border: none;
  border-radius: 8px;
}

.item {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #eee;
}

.memo {
  font-size: 13px;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.income-text {
  color: green;
  font-weight: bold;
}

.expense-text {
  color: red;
  font-weight: bold;
}

.empty {
  text-align: center;
  color: gray;
  margin-top: 20px;
}

.form-card {
  background: #f8fafc;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 20px;
}

.form-title {
  font-weight: bold;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
}

.close-mini {
  cursor: pointer;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.submit {
  flex: 1;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
}

.cancel {
  flex: 1;
  background: #eee;
  border: none;
  border-radius: 8px;
  padding: 10px;
}

.row {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.col-full {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.input {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  outline: none;
  transition: 0.2s;
}

.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.income-badge {
  background: #e6f4ea;
  color: #16a34a;
}

.expense-badge {
  background: #fde8e8;
  color: #dc2626;
}

.icon-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 6px;
  font-size: 14px;
  color: #555;
  transition: 0.2s;
}

.icon-btn:hover {
  color: #2563eb;
  transform: scale(1.1);
}

.icon-btn.delete:hover {
  color: #dc2626;
}

.second-title {
  margin-top: 10px;
  color: var(--color-primary-deep);
  font-size: clamp(1.65rem, 1.8vw, 2.05rem);
  font-weight: 800;
  line-height: 1.12;
}
</style>
