<template>
  <div class="modal">
    <div class="modal-content">
      <!-- 닫기 -->
      <button class="close" @click="$emit('close')">✕</button>

      <!-- 날짜 -->
      <h2 class="title">{{ formattedDate }}</h2>

      <!-- 요약 카드 -->
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

      <!-- 거래 추가 버튼 -->
      <button class="add-btn" @click="showForm = !showForm">+ 거래 추가</button>

      <!-- form -->
      <div v-if="showForm" class="form-card">
        <div class="form-title">
          새 거래
          <span class="close-mini" @click="showForm = false">✕</span>
        </div>

        <div class="row">
          <!-- 유형 -->
          <div class="col">
            <label>유형</label>
            <select v-model="type" class="input">
              <option value="expense">지출</option>
              <option value="income">수입</option>
            </select>
          </div>

          <!-- 카테고리 (지출일 때만) -->
          <div class="col" v-if="type === 'expense'">
            <label>카테고리</label>
            <select v-model="category" class="input">
              <option value="식비/카페">식비/카페</option>
              <option value="교통">교통</option>
              <option value="쇼핑">쇼핑</option>
              <option value="고정지출">고정지출</option>
              <option value="기타">기타</option>
            </select>
          </div>
        </div>

        <!-- 금액 + 메모 -->
        <div class="col-full">
          <label>금액 (원)</label>
          <input v-model="amount" type="number" class="input" />
        </div>

        <div class="col-full">
          <label>메모</label>
          <input v-model="memo" class="input" />
        </div>

        <div class="form-actions">
          <button class="submit" @click="add">추가</button>
          <button class="cancel" @click="showForm = false">취소</button>
        </div>
      </div>

      <!-- 거래 내역 -->
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
            <div class="memo">{{ t.memo }}</div>
          </div>

          <div class="right">
            <span :class="t.type === 'income' ? 'income-text' : 'expense-text'">
              {{ t.type === 'income' ? '+' : '-'
              }}{{ t.amount.toLocaleString() }}원
            </span>
            <button @click="editTransaction(t)">✏️</button>
            <button @click="store.deleteTransaction(t.id)">🗑</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAccountStore } from '@/stores/account';

const props = defineProps({
  // props: 부모에서 날짜 전달받음
  date: String,
});

const store = useAccountStore(); // store 연결

// 날짜 포맷
const formattedDate = computed(() => {
  console.log(props.date);
  const d = new Date(props.date);
  const week = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${week[d.getDay()]})`;
});

// 입력 상태
const showForm = ref(false);
const type = ref('expense');
const category = ref('식비/카페');
const amount = ref('');
const memo = ref('');

// 거래 추가
const add = async () => {
  if (!amount.value) return;

  if (editingId.value) {
    // 수정
    await store.updateTransaction({
      id: editingId.value,
      date: props.date,
      type: type.value,
      category: category.value,
      amount: Number(amount.value),
      memo: memo.value,
    });

    editingId.value = null;
  } else {
    // 추가
    await store.addTransaction({
      date: props.date,
      type: type.value,
      category: category.value,
      amount: Number(amount.value),
      memo: memo.value,
    });
  }

  // DB 기준으로 다시 불러오기
  await store.fetchTransactions();

  // 입력 초기화
  amount.value = '';
  memo.value = '';
  category.value = '';
  type.value = 'expense';

  showForm.value = false;
};

// 날짜 기준 필터링
const filtered = computed(() =>
  store.transactions.filter((t) => t.date === props.date),
);

// 수입 합계
const totalIncome = computed(() =>
  filtered.value
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0),
);

// 지출 합계
const totalExpense = computed(() =>
  filtered.value
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0),
);

// 잔액
const balance = computed(() => totalIncome.value - totalExpense.value);

// 거래내역에서 편집 아이콘
const editingId = ref(null);

// 내역 수정 함수
const editTransaction = (t) => {
  type.value = t.type;
  category.value = t.category;
  amount.value = t.amount;
  memo.value = t.memo;

  editingId.value = t.id;
  showForm.value = true;
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  width: 520px;
  background: white;
  border-radius: 16px;
  padding: 24px;
  position: relative;
}

/* 닫기 */
.close {
  position: absolute;
  right: 16px;
  top: 16px;
  border: none;
  background: none;
  font-size: 18px;
  cursor: pointer;
}

/* 제목 */
.title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 요약 */
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

/* 버튼 */
.add-btn {
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: white;
  border-radius: 10px;
  border: none;
  margin-bottom: 20px;
}

/* 폼 */
.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
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

/* 리스트 */
.section-title {
  font-weight: bold;
  margin-top: 10px;
}

.item {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  background: #f9fafb;
}

.category {
  background: #fde2e2;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form label {
  font-size: 13px;
  color: #555;
}

.form input,
.form select {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
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
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
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
</style>
