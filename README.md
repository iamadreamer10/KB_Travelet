# 🧳 Travelet

> 여행 예산을 똑똑하게 관리하는 캘린더 기반 가계부 서비스

---

## 📌 프로젝트 소개

Travelet은 여행 전 예산 계획부터 여행 중 지출 관리까지 한 번에 할 수 있는  
캘린더 기반 가계부 웹 서비스입니다.

사용자는 날짜별로 수입/지출을 기록하고,  
하루 예산 대비 소비 상태를 시각적으로 확인할 수 있습니다.

---

## ✨ 주요 기능

### 📅 캘린더 기반 가계부
- 날짜별 수입 / 지출 기록  
- 하루 단위 총 수입 / 지출 자동 집계  
- 캘린더에 요약 정보 표시  

### 💰 예산 관리 시스템
- 여행 기간 및 자산 기반 예산 계산  
- 하루 사용 가능 금액 자동 산출  
- 예산 초과 시 색상(빨간 바)으로 시각화  

### 🧾 거래 관리 (CRUD)
- 거래 추가 / 수정 / 삭제  
- 수정 시 기존 데이터 자동 채움  
- 삭제 시 확인 모달 제공  

### 🎯 UX 개선 기능
- 숫자 입력 제한 (음수 / 문자 입력 방지)  
- 기본 카테고리 자동 설정  
- 입력 오류 자동 보정  
- 모달 내부 스크롤 처리  

---

## 🛠️ 기술 스택

- **Frontend** : Vue 3 (Composition API)  
- **State Management** : Pinia  
- **API** : Axios, json-server  
- **Styling** : CSS, Bootstrap  
- **Version Control** : Git, GitHub  

---

## 📂 프로젝트 구조

```bash
src
├── components
│   ├── calendar
│   │   └── CalendarDayBar.vue
│   │   └── CalendarMain.vue
│   ├── common
│   │   ├── ProgressBar.vue
│   │   └── SideBar.vue
│   ├── form
│   │   ├── LoginForm.vue
│   │   ├── SignupForm.vue
│   │   ├── ProfileForm.vue
│   │   ├── TransactionForm.vue
│   │   └── TravelGoalForm.vue
│   ├── modal
│   │   └── TransactionModal.vue
│   ├── onboarding
│   │   ├── StepIncome.vue
│   │   ├── StepFixedExpense.vue
│   │   ├── StepOption.vue
│   │   ├── StepRegion.vue
│   │   └── StepSchedule.vue
│   └── profile
│       ├── ProfileSection.vue
│       ├── TravelGoalSection.vue
│       ├── TravelGoalDisplay.vue
│       ├── BudgetCalculationDisplay.vue
│       ├── GoalBudgetCalculationDisplay.vue
│       └── FinishGoalSection.vue
│
├── composables
│   ├── useBudgetCalculation.js
│   └── useGoalBudgetCalculation.js
│
├── pages
│   ├── LandingView.vue
│   ├── MainDashboard.vue
│   ├── OnboardingView.vue
│   └── ProfileView.vue
│
├── router
│   └── index.js
│
├── stores
│   ├── auth.js
│   ├── account.js
│   ├── profile.js
│   └── travel.js
│
├── App.vue
└── main.js
```

---

## 🔥 핵심 구현 포인트

### ✅ 날짜별 데이터 집계
- transaction 데이터를 기반으로 날짜별 수입 / 지출 계산  
- 캘린더에 실시간 반영  

### ✅ 예산 초과 시 시각화
- 하루 예산 vs 실제 지출 비교  
- 초과 시 빨간색 바 표시  

### ✅ 상태 관리 구조 설계
- Pinia를 활용한 전역 상태 관리  
- 데이터 흐름 구조화  

### ✅ 사용자 입력 제어
- 숫자 외 입력 차단  
- 음수 입력 방지  
- 잘못된 입력 자동 보정  

---

## 🚀 실행 방법

```bash
npm install
npm run dev
```

---

## 📎 향후 개선 방향

- JWT 기반 인증 고도화  
- 서버 API 및 DB 분리  
- 모바일 반응형 UI 개선  
- 지출 분석 리포트 기능 추가  

---

## 💯 한 줄 소개

> 캘린더 기반 가계부에서 예산 관리와 시각화를 구현한 여행 관리 서비스
