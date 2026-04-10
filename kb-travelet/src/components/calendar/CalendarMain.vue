<template>
  <div class="calendar-container">
    <div
      class="align-items-center mb-4 gap-3"
      style="display: grid; width: 100%"
      :style="{
        gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
      }"
    >
      <div class="d-none d-lg-block"></div>

      <div
        class="d-flex align-items-center justify-content-center order-1 order-lg-2"
      >
        <button
          @click="prevMonth"
          class="btn btn-sm btn-outline-primary border-2 rounded-circle p-0"
          style="width: 28px; height: 28px"
        >
          <i class="fas fa-chevron-left fa-xs"></i>
        </button>
        <div class="text-center px-4">
          <h6 class="text-secondary mb-0 small">{{ currentYear }}년</h6>
          <h4 class="fw-bold mb-0">{{ currentMonth }}월</h4>
        </div>
        <button
          @click="nextMonth"
          class="btn btn-sm btn-outline-primary border-2 rounded-circle p-0"
          style="width: 28px; height: 28px"
        >
          <i class="fas fa-chevron-right fa-xs"></i>
        </button>
      </div>

      <div class="text-center px-4">
        <h6 class="text-secondary mb-0">{{ currentYear }}년</h6>
        <h4 class="fw-bold mb-0">{{ currentMonth }}월</h4>
      </div>
      <div class="d-flex gap-2 justify-content-end">
        <div
          class="p-2 px-3 bg-white rounded-3 text-end border-top border-primary border-4 shadow-sm"
          style="min-width: 120px"
        >
          <div class="text-muted extra-small fw-bold">수익</div>
          <div class="fw-bold text-primary" style="font-size: 0.9rem">
            + 2,678,123원
          </div>
        </div>

        <div
          class="p-2 px-3 bg-white rounded-3 text-end border-top border-danger border-4 shadow-sm"
          style="min-width: 120px"
        >
          <div class="text-muted extra-small fw-bold">지출</div>
          <div class="fw-bold text-danger" style="font-size: 0.9rem">
            - 1,678,000원
          </div>
        </div>

        <div
          class="p-2 px-3 rounded-3 text-end shadow-sm d-flex flex-column justify-content-center"
          style="background-color: var(--color-primary); min-width: 140px"
        >
          <div class="text-white extra-small fw-bold">총 잔액</div>
          <div
            class="fw-bold"
            style="color: var(--color-surface); font-size: 1rem"
          >
            + 1,000,123원
          </div>
        </div>
      </div>
    </div>

    <div class="row g-0 text-center mb-2">
      <div
        v-for="day in days"
        :key="day"
        class="col fw-bold py-2 small"
        :class="{ 'text-danger': day === '일', 'text-primary': day === '토' }"
      >
        {{ day }}
      </div>
    </div>

    <div class="row g-2">
      <div
        v-for="(dayObj, index) in calendarDates"
        :key="index"
        class="col-1-7"
      >
        <CalendarDayBar
          v-if="dayObj.date"
          :calendar-date="dayObj"
          :daily-summary="dailySummary"
          :key="dayObj.date"
          @selectDate="handleClickDate"
        />
        <div v-else class="h-100 p-2 opacity-25"></div>
      </div>
    </div>
  </div>
  <TransactionModal
    v-if="selectedDate"
    :date="selectedDate"
    @close="selectedDate = null"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import CalendarDayBar from './CalendarDayBar.vue';
import TransactionModal from '../modal/TransactionModal.vue';
import { useAccountStore } from '@/stores/account';
import { useProfileStore } from '@/stores/profile';
const { myTravelGoal } = useProfileStore();

const store = useAccountStore();
const monthlySummary = computed(() => {
  const summary = {
    income: 0,
    expense: 0,
  };

  // 비교할 문자열 만들기 (예: "2026-04")
  // 월이 10보다 작을 때 앞에 0을 붙여줘야 데이터 포맷("04")과 일치합니다.
  const yearMonthPrefix = `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`;

  store.transactions.forEach((t) => {
    // 해당 년/월로 시작하는 데이터만 합산
    if (t.date.startsWith(yearMonthPrefix)) {
      if (t.type === 'income') {
        summary.income += t.amount;
      } else {
        summary.expense += t.amount;
      }
    }
  });

  return summary;
});

const days = ['일', '월', '화', '수', '목', '금', '토'];
const today = new Date();
const currentYear = ref(today.getFullYear());
const currentMonth = ref(today.getMonth() + 1);

const calendarDates = computed(() => {
  const year = currentYear.value;
  const month = currentMonth.value;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const lastDate = new Date(year, month, 0).getDate();

  const result = [];

  // 1일 앞은 그냥 '비어있는 객체'를 넣어서 자리만 차지하게 함
  for (let i = 0; i < firstDay; i++) {
    result.push({ year, month, date: null });
  }

  // 실제 날짜만 채움
  for (let d = 1; d <= lastDate; d++) {
    result.push({ year, month, date: d });
  }

  return result;
});

// 이전 달로 이동
const prevMonth = () => {
  if (currentMonth.value === 1) {
    currentYear.value--;
    currentMonth.value = 12;
  } else {
    currentMonth.value--;
  }
};

// 다음 달로 이동
const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentYear.value++;
    currentMonth.value = 1;
  } else {
    currentMonth.value++;
  }
};

/* ---------------------------------------------------------
캘린더와 모달 연결
*/
const selectedDate = ref(null);

const handleClickDate = (date) => {
  selectedDate.value = date;
};

/*
-------------------------------------------------------------
달력 날짜에 그날 하루의 총수입 총지출 표시로직
*/
const dailySummary = computed(() => {
  const result = {};

  store.transactions.forEach((t) => {
    if (!result[t.date]) {
      result[t.date] = {
        income: 0,
        expense: 0,
      };
    }

    if (t.type === 'income') {
      result[t.date].income += t.amount;
    } else {
      result[t.date].expense += t.amount;
    }
  });

  return result;
});
</script>

<style scoped>
/* 7열 그리드를 위한 커스텀 스타일 */
.col-1-7 {
  flex: 0 0 14.285%;
  max-width: 14.285%;
}
</style>

<style scoped>
/* 1. 상단 컨테이너 레이아웃 */
.header-container {
  display: flex;
  flex-direction: column; /* 기본은 세로 쌓기 (모바일) */
  align-items: center;
  width: 100%;
}

@media (min-width: 992px) {
  .header-container {
    flex-direction: row; /* PC에서는 가로로 */
    justify-content: space-between;
  }
  .date-controller {
    order: 2; /* 날짜를 가운데로 */
    flex: 1;
  }
  .summary-container {
    order: 3;
  }
  /* 밸런스를 위해 왼쪽 빈 공간 확보 */
  .header-container::before {
    content: '';
    flex: 1;
    order: 1;
  }
}

/* 2. 요약 카드 반응형 사이즈 */
.summary-container {
  width: 100%;
  overflow-x: auto; /* 모바일에서 자리가 좁으면 옆으로 스크롤 가능하게 */
  padding-bottom: 5px;
  justify-content: center;
}

.summary-card {
  flex: 1; /* 자식들이 공평하게 나눠가짐 */
  min-width: 90px;
  max-width: 130px;
  padding: 8px;
  background: white;
  border-radius: 12px;
  text-align: right;
  border-top: 4px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.total-card {
  background-color: var(--color-primary);
  border-top: none;
}

.amount {
  font-weight: bold;
  font-size: 0.8rem; /* 모바일 기본 크기 */
}

@media (min-width: 768px) {
  .amount {
    font-size: 0.95rem;
  }
  .summary-card {
    min-width: 110px;
  }
}

/* 3. 캘린더 날짜 텍스트 크기 */
.col-1-7 {
  flex: 0 0 14.285%;
  max-width: 14.285%;
}

.nav-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: transparent;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiny-label {
  font-size: 0.65rem;
}

.summary-box {
  padding: 8px 12px;
  background: white;
  border-radius: 12px;
  text-align: right;
  min-width: 100px; /* 너무 작아지지 않게 */
  border-top: 4px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  flex: 1; /* 좁을 때 공평하게 나눠갖기 */
  max-width: 130px;
}

.total-bg {
  background-color: var(--color-primary);
  border-top: none;
}

.label {
  font-size: 0.65rem;
  font-weight: bold;
  color: #6c757d;
}
.price {
  font-size: 0.85rem;
  font-weight: bold;
}

/* 7열 그리드는 이미 잘 짜셔서 그대로 두셔도 됩니다! */
.col-1-7 {
  flex: 0 0 14.285%;
  max-width: 14.285%;
}
</style>
