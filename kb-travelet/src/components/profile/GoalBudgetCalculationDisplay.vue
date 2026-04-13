<template>
  <div class="budget-calculation-section">
    <div v-if="budget.financeWarningMessage.value" class="alert alert-warning">
      <i class="fas fa-exclamation-triangle me-2"></i>
      {{ budget.financeWarningMessage.value }}
    </div>

    <div v-if="!budget.resultStatus.value.isReady" class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>
      {{ budget.resultStatus.value.message }}
    </div>

    <div v-else class="card border-0 shadow-sm">
      <div class="card-body p-4">
        <h6 class="mb-3 fw-bold">
          <i class="fas fa-chart-line me-2 text-warning"></i>여행 목표 정보
        </h6>

        <div class="row g-3">
          <div class="col-12">
            <div class="result-item">
              <div class="result-label">여행 일정</div>
              <div class="result-value">
                {{ budget.nightlyDays.value }}박 {{ budget.travelDays.value }}일
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">
                예상 확보 자금
                <span class="extra-small text-muted">
                  (하루 {{ budget.formatKRW(budget.dailySavingsForTravel.value) }}
                  저축 기준 / 출발까지 {{ budget.daysUntilDeparture.value }}일)
                </span>
              </div>
              <div class="result-value text-success">
                {{ budget.formatKRW(budget.projectedFunds.value) }}
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="result-item">
              <div class="result-label">{{ budget.gapLabel.value }}</div>
              <div
                class="result-value fw-bold"
                :class="
                  budget.resultStatus.value.status === 'sufficient'
                    ? 'text-success'
                    : 'text-danger'
                "
              >
                {{ budget.formatKRW(Math.abs(budget.budgetGap.value)) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  budget: { type: Object, required: true },
});
</script>

<style scoped>
.budget-calculation-section {
  margin-top: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
}

.result-item {
  height: 100%;
  padding: 0.85rem;
  background-color: #f9f9f9;
  border-radius: 0.75rem;
  border-left: 3px solid #e9ecef;
}

.result-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.result-value {
  font-size: 1.2rem;
  font-weight: 700;
}

.extra-small {
  font-size: 0.75rem;
}

.alert {
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
}
</style>
