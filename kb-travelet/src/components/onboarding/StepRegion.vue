<template>
  <div class="onboarding-page-bg">
    <div
      class="step-region-stage"
      :class="{ 'panel-open': subStep === 'city' }"
    >
      <div class="onboarding-card shadow-lg">
        <div class="progress-container p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="step-text">STEP 1/5</span>
            <span class="step-label">목적지 선택</span>
          </div>
          <div class="progress-track position-relative">
            <div
              class="progress-bar-inner progress-animate"
              style="--progress-start: 0%; --progress-end: 20%; width: 20%"
            ></div>
            <span
              class="progress-plane progress-plane-animate"
              style="--progress-start: 0%; --progress-end: 20%"
            >
              <i class="fas fa-plane" aria-hidden="true"></i>
            </span>
          </div>
        </div>

        <div class="main-content-wrapper p-4 p-md-5">
          <div class="map-copy mb-2">
            <span class="copy-kicker">Destination</span>
            <h2 class="section-title mb-2">어디로 떠나볼까요?</h2>
            <p class="section-description mb-0">
              대륙을 선택하면 추천 국가를 알려드립니다.
            </p>
          </div>

          <div class="position-relative rounded-4 overflow-hidden map-canvas">
            <img
              src="@/assets/images/checkin_worldmap.svg"
              alt="세계 지도"
              class="map-base-img"
            />
            <div
              class="w-100 h-100 position-absolute top-0 start-0 continent-buttons-layer"
            >
              <button
                v-for="continent in continents"
                :key="continent.id"
                type="button"
                class="btn continent-btn shadow-sm fw-bold rounded-pill position-absolute"
                :class="{
                  'active-continent': selectedContinent === continent.name,
                }"
                :style="continent.position"
                @click="selectContinent(continent.name)"
              >
                <span class="btn-text">{{ continent.name }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Transition name="country-panel">
        <div v-if="subStep === 'city'" class="country-panel-stack">
          <aside class="country-panel-card shadow-lg">
            <div
              class="country-panel-header d-flex justify-content-between align-items-center mb-4"
            >
              <div>
                <h3 class="h5 fw-bold mb-0 section-subtitle">
                  {{ selectedContinent }}
                </h3>
                <small class="text-muted">추천 국가 리스트</small>
              </div>
              <button
                type="button"
                @click="resetContinent"
                class="btn-close-custom"
              >
                <i class="fas fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <div class="selected-country-banner mb-4">
              <p class="selected-country-caption mb-1">선택한 국가</p>
              <p class="selected-country-highlight mb-0">
                {{ selectedCountrySummary }}
              </p>
            </div>

            <div class="country-grid-scroll">
              <div class="row g-3">
                <div
                  v-for="country in visibleCountries"
                  :key="country.code"
                  class="col-12"
                >
                  <button
                    type="button"
                    class="btn city-select-card w-100 text-start d-flex align-items-center p-3"
                    :class="{
                      'selected-country-card':
                        selectedCountry?.code === country.code,
                    }"
                    @click="selectCountry(country)"
                  >
                    <div
                      class="icon-section d-flex align-items-center justify-content-center rounded-circle me-3"
                    >
                      <i
                        class="fas fa-location-dot location-icon"
                        aria-hidden="true"
                      ></i>
                    </div>
                    <div class="text-section flex-grow-1">
                      <div
                        class="d-flex align-items-center justify-content-between"
                      >
                        <strong class="country-name text-main">{{
                          country.name
                        }}</strong>
                        <i
                          class="fas fa-chevron-right arrow-icon"
                          aria-hidden="true"
                        ></i>
                      </div>
                      <p class="airport-info text-muted mb-0">
                        {{ country.code }}
                      </p>
                    </div>
                  </button>
                </div>
                <div
                  v-if="
                    filteredCountries.length > initialVisibleCount &&
                    !showAllCountries
                  "
                  class="col-12"
                >
                  <button
                    type="button"
                    class="btn more-country-card w-100 text-center p-3"
                    @click="showAllCountries = true"
                  >
                    더보기
                  </button>
                </div>
              </div>
            </div>

            <div v-if="selectedCountry" class="confirm-action-wrap mt-4">
              <button
                type="button"
                class="btn confirm-country-btn w-100"
                @click="confirmDestination"
              >
                확인
              </button>
            </div>
          </aside>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useTravelStore } from '@/stores/travel';

const emit = defineEmits(['next']);
const travelStore = useTravelStore();

const subStep = ref(travelStore.selectedContinent ? 'city' : 'continent');
const selectedContinent = ref(travelStore.selectedContinent || '');
const selectedCountry = ref(travelStore.selectedCountry || null);
const showAllCountries = ref(false);
const initialVisibleCount = 3;

const continents = [
  {
    id: 'namerica',
    name: '아메리카',
    sourceName: 'Americas',
    position: 'top: 30%; left: 15%;',
  },
  {
    id: 'europe',
    name: '유럽',
    sourceName: 'Europe',
    position: 'top: 25%; left: 48%;',
  },
  {
    id: 'africa',
    name: '아프리카',
    sourceName: 'Africa',
    position: 'top: 60%; left: 50%;',
  },
  {
    id: 'asia',
    name: '아시아',
    sourceName: 'Asia',
    position: 'top: 30%; left: 73%;',
  },
  {
    id: 'oceania',
    name: '오세아니아',
    sourceName: 'Oceania',
    position: 'top: 74%; left: 75%;',
  },
];

const selectedContinentSourceName = computed(() => {
  // 화면에 보이는 대륙명과 API 응답 키를 연결한다.
  return (
    continents.find((continent) => continent.name === selectedContinent.value)
      ?.sourceName ?? ''
  );
});

const filteredCountries = computed(() => {
  const countries =
    travelStore.continents?.[selectedContinentSourceName.value] ?? [];

  return [...countries].sort((a, b) =>
    String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'ko-KR'),
  );
});

const visibleCountries = computed(() => {
  if (showAllCountries.value) {
    return filteredCountries.value;
  }

  return filteredCountries.value.slice(0, initialVisibleCount);
});

const selectedCountrySummary = computed(() => {
  if (!selectedCountry.value) {
    return '아직 선택된 국가가 없습니다.';
  }

  return `${selectedCountry.value.name} (${selectedContinent.value})`;
});

const selectContinent = async (name) => {
  // 대륙을 고르면 국가 리스트 패널이 열리도록 전환한다.
  if (Object.keys(travelStore.continents).length === 0) {
    await travelStore.fetchContinents();
  }

  selectedContinent.value = name;
  selectedCountry.value = null;
  showAllCountries.value = false;
  subStep.value = 'city';
};

const resetContinent = () => {
  selectedContinent.value = '';
  selectedCountry.value = null;
  showAllCountries.value = false;
  subStep.value = 'continent';
};

const selectCountry = (country) => {
  selectedCountry.value = country;
};

const confirmDestination = async () => {
  if (!selectedCountry.value) {
    return;
  }

  try {
    // 선택한 목적지는 서버에 저장한 뒤 다음 단계로 넘어간다.
    await travelStore.saveDestination({
      continent: selectedContinent.value,
      country: selectedCountry.value,
    });
    emit('next');
  } catch (error) {
    console.error('여행지 정보 저장 실패:', error);
    alert('여행지 정보를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
};

onMounted(() => {
  travelStore.fetchContinents();
});
</script>

<style scoped>
.onboarding-page-bg {
  min-height: 100dvh;
  background-color: #0766ff;
  padding: 24px 20px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-region-stage {
  --destination-stage-height: min(720px, calc(100dvh - 48px));

  width: 100%;
  min-height: var(--destination-stage-height);
  max-width: 1240px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 10px;
  transition: gap 0.38s cubic-bezier(0.22, 0.8, 0.2, 1);
}

.step-region-stage.panel-open {
  justify-content: center;
}

.onboarding-card {
  width: min(100%, 780px);
  flex: 0 0 780px;
  height: var(--destination-stage-height);
  min-height: var(--destination-stage-height);
  background: #fff;
  border-radius: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  overflow: hidden;
  transform: translateX(0);
  transition: transform 0.38s cubic-bezier(0.22, 0.8, 0.2, 1);
}

.panel-open .onboarding-card {
  transform: translateX(0);
}

.progress-container {
  background-color: var(--color-primary-soft);
  border-top-left-radius: 2rem;
  border-top-right-radius: 2rem;
}

.step-text {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 0.1rem;
}

.step-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary-deep);
}

.progress-track {
  position: relative;
  height: 4px;
  background: rgba(2, 8, 23, 0.08);
  border-radius: 999px;
  overflow: visible;
  margin-top: 6px;
}

.progress-bar-inner {
  position: relative;
  height: 100%;
  background: var(--color-primary);
  border-radius: inherit;
}

.progress-animate {
  animation: progressFill 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.progress-plane {
  position: absolute;
  top: 0;
  left: var(--progress-end);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  color: #0766ff;
  font-size: 1.4rem;
  line-height: 1;
  background: linear-gradient(180deg, #ffffff 0%, #eaf2ff 100%);
  border: 2px solid rgba(7, 102, 255, 0.18);
  border-radius: 999px;
  box-shadow:
    0 10px 20px rgba(7, 102, 255, 0.2),
    0 2px 6px rgba(5, 23, 102, 0.14);
  transform: translate(-50%, -50%);
  transform-origin: center;
  pointer-events: none;
  z-index: 2;
}

.progress-plane i {
  filter: drop-shadow(0 1px 2px rgba(5, 23, 102, 0.16));
}

.progress-plane-animate {
  animation: planeFly 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.main-content-wrapper {
  padding-bottom: 28px;
}

.section-title,
.section-subtitle {
  color: var(--color-primary-deep);
}

.map-copy {
  max-width: 540px;
}

.copy-kicker {
  display: inline-flex;
  margin-bottom: 10px;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  font-size: clamp(1.85rem, 2vw, 2.3rem);
  font-weight: 800;
  line-height: 1.12;
}

.section-description {
  color: #64748b;
  max-width: 500px;
  font-size: 0.98rem;
  line-height: 1.65;
}

.map-canvas {
  min-height: 430px;
  background-color: #f8fbfd;
  margin-bottom: 8px;
}

.map-base-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  top: 0;
  left: 0;
}

.continent-buttons-layer {
  z-index: 5;
}

.continent-btn {
  min-width: 92px;
  padding: 0.5rem 1rem;
  background: #fff;
  color: var(--color-primary-deep);
  border: 1px solid var(--color-primary-soft);
  font-size: 0.85rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 5;
}

.continent-btn:hover {
  background: #fff;
  color: var(--color-primary-deep);
  transform: translateY(-3px);
  box-shadow: 0 10px 18px rgba(2, 8, 23, 0.12) !important;
}

.btn-text {
  display: block;
  width: 100%;
  text-align: center;
}

.active-continent {
  background: var(--color-primary) !important;
  color: #fff !important;
  transform: scale(1.08);
  box-shadow: 0 8px 16px rgba(7, 102, 255, 0.2) !important;
}

.country-panel-stack {
  flex: 0 0 420px;
  width: 420px;
  height: var(--destination-stage-height);
  display: flex;
  flex-direction: column;
  align-self: stretch;
  transition: transform 0.38s cubic-bezier(0.22, 0.8, 0.2, 1);
}

.country-panel-card {
  width: 100%;
  height: var(--destination-stage-height);
  min-height: var(--destination-stage-height);
  max-height: var(--destination-stage-height);
  display: flex;
  flex-direction: column;
  background: #fcfdfe;
  border-radius: 2rem;
  padding: 24px 24px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.16) !important;
  overflow: hidden;
}

.country-panel-header {
  padding-right: 6px;
  flex-shrink: 0;
}

.selected-country-banner {
  padding: 16px 18px;
  border-radius: 1.25rem;
  background: rgba(5, 23, 102, 0.06);
  flex-shrink: 0;
}

.selected-country-caption {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}

.selected-country-highlight {
  color: var(--color-primary-deep);
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.35;
}

.country-grid-scroll {
  flex: 1;
  min-height: 0;
  max-height: 100%;
  overflow-y: auto;
  padding: 4px 22px 10px 6px;
  overscroll-behavior: contain;
}

.country-grid-scroll::-webkit-scrollbar {
  width: 4px;
}

.country-grid-scroll::-webkit-scrollbar-thumb {
  background: var(--color-primary-soft);
  border-radius: 10px;
}

.city-select-card {
  background: #fff;
  border: 1px solid var(--color-primary-soft);
  border-radius: 1.25rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
}

.city-select-card:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  transform: translateX(3px);
  box-shadow: 0 5px 15px rgba(7, 102, 255, 0.1);
}

.selected-country-card {
  border-color: var(--color-primary) !important;
  background: var(--color-primary-soft) !important;
  box-shadow: 0 6px 18px rgba(7, 102, 255, 0.14) !important;
  margin: 2px 0;
}

.more-country-card {
  background: var(--color-primary-deep);
  border: 1px solid var(--color-primary-deep);
  border-radius: 1.25rem;
  color: #fff;
  font-weight: 700;
  transition: all 0.25s ease;
}

.confirm-action-wrap {
  flex-shrink: 0;
}

.confirm-country-btn {
  min-height: 50px;
  border: 0;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(7, 102, 255, 0.16);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.confirm-country-btn:hover {
  transform: translateY(-2px);
  background: #055ae3;
  color: #ffffff;
  box-shadow: 0 16px 30px rgba(7, 102, 255, 0.24);
}

.confirm-country-btn:disabled {
  background: #bcd7ff;
  color: rgba(255, 255, 255, 0.92);
  box-shadow: none;
  cursor: not-allowed;
}

.more-country-card:focus,
.more-country-card:focus-visible,
.city-select-card:focus,
.city-select-card:focus-visible,
.continent-btn:focus,
.continent-btn:focus-visible,
.btn-close-custom:focus,
.btn-close-custom:focus-visible {
  outline: none;
  box-shadow: none;
}

.icon-section {
  width: 48px;
  height: 48px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
}

.location-icon {
  font-size: 1rem;
}

.country-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-main);
}

.airport-info {
  font-size: 0.8rem;
  font-weight: 500;
}

.arrow-icon {
  font-size: 0.95rem;
  color: var(--color-primary-deep);
}

.btn-close-custom {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  background: #eef4ff;
  color: var(--color-primary-deep);
  transition:
    background-color 0.2s ease,
    transform 0.2s ease;
}

.btn-close-custom:hover {
  background: #dbe9ff;
  transform: scale(1.05);
}

.country-panel-enter-active,
.country-panel-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.42s cubic-bezier(0.22, 0.8, 0.2, 1);
}

.country-panel-enter-from,
.country-panel-leave-to {
  opacity: 0;
  transform: translateY(28px) scale(0.985);
}

@keyframes progressFill {
  from {
    width: var(--progress-start);
  }
  to {
    width: var(--progress-end);
  }
}

@keyframes planeFly {
  from {
    left: var(--progress-start);
    transform: translate(-50%, -60%);
  }
  to {
    left: var(--progress-end);
    transform: translate(-50%, -60%);
  }
}

@media (max-width: 991px) {
  .step-region-stage,
  .step-region-stage.panel-open {
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    min-height: auto;
  }

  .onboarding-card {
    width: 100%;
    flex-basis: auto;
    height: auto;
    min-height: auto;
    transform: none;
  }

  .country-panel-card {
    width: 100%;
    flex-basis: auto;
    height: auto;
    min-height: auto;
    max-height: none;
  }

  .country-panel-stack {
    width: 100%;
    height: auto;
    flex-basis: auto;
  }

  .map-canvas {
    min-height: 340px;
  }
}
</style>
