# Sofia Frontend 리팩토링 계획 DAG

## 발견된 문제점 요약

### 🔴 Critical (즉시 수정 필요)
1. **API 클라이언트 중복**: `fetchApi`와 `fetchApiWithoutBody`의 중복 로직
2. **타입 중복 정의**: `SortDirection`이 `types/api.ts`와 `api/tasks.ts`에서 중복
3. **상수 중복 정의**: `PHASE_ORDER`, `TASK_TYPE_LABELS` 등 3~5개 파일에서 중복

### 🟡 Major (주요 개선 필요)
4. **페이지 패턴 중복**: 페이지네이션, 필터링, 정렬 로직이 3~5개 페이지에서 중복
5. **커스텀 훅 부재**: 데이터 fetching, 상태 관리 로직이 분산됨
6. **컴포넌트 내부 정의**: LoadingScreen, MiniDotDiagram이 컴포넌트 내부에 정의됨
7. **CSS 값 중복**: 색상, transition, border-radius 등이 여러 파일에서 중복

### 🟢 Minor (개선 권장)
8. **import 경로 불일치**: `@/types/api` vs `../types/api`
9. **index.ts 누락**: common, auth 디렉토리에 index.ts 없음
10. **설정 부족**: config.ts에 타입 정의, 검증 로직 없음
11. **AuthContext 개선 필요**: 비동기 처리, localStorage 접근 방식

---

## 수정 계획 DAG

```
┌─────────────────────────────────────────────────────────────────┐
│                     Phase 0: 기초 작업                           │
│                   (의존성 없음, 선행 필요)                         │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  T1: 상수 파일 통합 (src/constants/index.ts)                     │
│  - PHASE_ORDER, PHASE_INFO 통합                                  │
│  - TASK_TYPE_LABELS 통합                                         │
│  - STATUS_LABELS 통합                                            │
│  파일: Header.tsx, PhaseIndicator.tsx, RecentTasks.tsx,         │
│        TasksPage.tsx, SettingsPage.tsx                           │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  T2: 타입 정비 (src/types/api.ts)                                │
│  - SortDirection 중복 제거 (api/tasks.ts에서 제거)               │
│  - AuthUser 타입을 AuthCheckResponse와 일치시키기                │
│  - TaskSummaryResponse에 completedAt 필드 추가                   │
│  - Pageable 타입 OpenAPI 스펙과 일치시키기                        │
│  - nullable/optional 처리 일관화                                  │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  T3: 설정 파일 확장 (src/config.ts)                              │
│  - API_BASE_URL 추가                                             │
│  - AUTH_TOKEN_PREFIX 추가                                        │
│  - 타입 정의 추가                                                 │
│  - 환경 변수 검증 로직 추가                                       │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ T4: API       │    │ T5: CSS 변수    │    │ T6: 공통        │
│ 클라이언트    │    │ 통합            │    │ 컴포넌트 분리   │
│ 단순화        │    │                 │    │                 │
│               │    │ src/index.css:  │    │ - LoadingScreen │
│ - fetchApi    │    │ - 색상 변수     │    │   분리          │
│   통합        │    │ - transition    │    │ - PageHeader    │
│ - 쿼리 빌더   │    │ - border-radius │    │   분리          │
│   추가        │    │ - shadow 변수   │    │ - EmptyState    │
│ - 경로 상수화 │    │                 │    │   분리          │
└───────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  T7: 공통 커스텀 훅 구현 (src/hooks/)                            │
│  - usePaginatedData: 페이지네이션 + 데이터 fetching              │
│  - useTableFilters: 필터링 상태 관리                             │
│  - useTableSorting: 정렬 상태 관리                               │
│  - useApiState: 로딩/에러 상태 관리                              │
│  - useModalState: 모달 상태 관리                                 │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  T8: index.ts 파일 추가                                          │
│  - src/components/common/index.ts                                │
│  - src/components/auth/index.ts                                  │
│  - src/hooks/index.ts                                            │
└─────────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ T9: 페이지    │    │ T10: AuthContext│    │ T11: import     │
│ 컴포넌트      │    │ 개선            │    │ 경로 통일       │
│ 리팩토링      │    │                 │    │                 │
│               │    │ - 비동기 처리   │    │ - 모든 파일에서 │
│ - UsersPage   │    │   개선          │    │   @/ alias      │
│ - TasksPage   │    │ - localStorage  │    │   사용으로 통일 │
│ - Registrat-  │    │   접근 개선     │    │ - import type   │
│   ionsPage    │    │ - 중복 로직     │    │   사용 검증     │
│ - GlossaryPag │    │   제거          │    │                 │
│ - SettingsPag │    │                 │    │                 │
└───────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  T12: 최종 검증                                                  │
│  - npm run build 실행                                            │
│  - 사용하지 않는 import 제거                                     │
│  - TypeScript 오류 해결                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 상세 작업 내용

### T1: 상수 파일 통합
**생성 파일**: `src/constants/index.ts`

**통합할 상수**:
| 상수명 | 현재 위치 | 사용처 |
|--------|-----------|--------|
| `PHASE_ORDER` | Header.tsx:6, PhaseIndicator.tsx:4 | Header, PhaseIndicator |
| `PHASE_LABELS/PHASE_INFO` | Header.tsx, PhaseIndicator.tsx | Header, PhaseIndicator |
| `TASK_TYPE_LABELS` | TasksPage.tsx:43, SettingsPage.tsx:29, RecentTasks.tsx:9 | 3개 파일 |
| `STATUS_LABELS` | TasksPage.tsx, RecentTasks.tsx | 2개 파일 |

**수정 파일**:
- `src/components/layout/Header.tsx`
- `src/components/dashboard/PhaseIndicator.tsx`
- `src/components/dashboard/RecentTasks.tsx`
- `src/pages/TasksPage.tsx`
- `src/pages/SettingsPage.tsx`

---

### T2: 타입 정비
**수정 파일**: `src/types/api.ts`

**작업 내용**:
1. `SortDirection` export 확인 후 `src/api/tasks.ts`에서 제거
2. `AuthUser` 필드명 수정:
   - `id` → `userId`
   - `studentNumber` → `userStudentNumber`
   - `studentName` → `userStudentName`
3. `TaskSummaryResponse`에 `completedAt?: string` 추가
4. `Pageable` 타입 수정 (OpenAPI 스펙 준수)
5. nullable/optional 처리 통일 (`| null` vs `?:`)

---

### T3: 설정 파일 확장
**수정 파일**: `src/config.ts`

**추가 내용**:
```typescript
interface Config {
  apiBaseUrl: string;
  authTokenPrefix: string;
  apiTimeout: number;
}

export const config: Config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
  authTokenPrefix: 'user',
  apiTimeout: 30000,
};
```

---

### T4: API 클라이언트 단순화
**수정 파일**: `src/api/client.ts`

**작업 내용**:
1. `fetchApi`와 `fetchApiWithoutBody` 통합
   - `returnType: 'json' | 'void'` 파라미터 추가
2. `buildQueryString` 유틸리티 함수 추가
3. API 경로 상수화 (선택적)

**영향 받는 파일**:
- `src/api/registration.ts`
- `src/api/tasks.ts`
- `src/api/users.ts`
- `src/api/glossary.ts`
- `src/api/phase.ts`

---

### T5: CSS 변수 통합
**수정 파일**: `src/index.css`

**통합할 값**:
```css
:root {
  /* Colors - 중복 제거 */
  --color-warning-bg: #FEF3C7;
  --color-surface-secondary: #F3F4F6;
  --color-border-default: #E5E7EB;

  /* Transitions */
  --transition-default: all 0.2s ease;

  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

**수정 파일**:
- `src/components/common/Badge.module.css`
- `src/components/common/PageError.module.css`
- `src/components/common/Pagination.module.css`
- `src/components/common/Modal.module.css`

---

### T6: 공통 컴포넌트 분리
**생성 파일**:
- `src/components/common/LoadingScreen.tsx`
- `src/components/common/LoadingScreen.module.css`
- `src/components/common/PageHeader.tsx`
- `src/components/common/PageHeader.module.css`
- `src/components/common/EmptyState.tsx`

**수정 파일**:
- `src/components/auth/ProtectedRoute.tsx` (LoadingScreen 분리)

---

### T7: 공통 커스텀 훅 구현
**생성 파일**:
- `src/hooks/usePaginatedData.ts`
- `src/hooks/useTableFilters.ts`
- `src/hooks/useTableSorting.ts`
- `src/hooks/useApiState.ts`
- `src/hooks/useModalState.ts`

**usePaginatedData 예시**:
```typescript
interface UsePaginatedDataOptions<T, F> {
  fetchFn: (page: number, size: number, filters?: F) => Promise<PageResponse<T>>;
  initialSize?: number;
}

interface UsePaginatedDataReturn<T, F> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  refresh: () => void;
  setFilters: (filters: F) => void;
}
```

---

### T8: index.ts 파일 추가
**생성 파일**:
- `src/components/common/index.ts`
- `src/components/auth/index.ts`
- `src/hooks/index.ts`

---

### T9: 페이지 컴포넌트 리팩토링
**수정 파일**:
- `src/pages/UsersPage.tsx`
- `src/pages/TasksPage.tsx`
- `src/pages/RegistrationsPage.tsx`
- `src/pages/GlossaryPage.tsx`
- `src/pages/SettingsPage.tsx`

**적용 사항**:
- T7의 커스텀 훅 사용
- T6의 공통 컴포넌트 사용
- T1의 통합 상수 사용

---

### T10: AuthContext 개선
**수정 파일**: `src/contexts/AuthContext.tsx`

**작업 내용**:
1. 비동기 초기화 개선 (useEffect 내 즉시 실행 패턴 개선)
2. localStorage 접근 SSR-safe하게 변경
3. 중복 localStorage 조작 제거

---

### T11: import 경로 통일
**수정 파일**: 모든 `.ts`, `.tsx` 파일

**작업 내용**:
- 상대 경로 → `@/` alias로 통일
- `import type` 사용 일관화

---

### T12: 최종 검증
**실행 명령**:
```bash
npm run build --silent
```

**검증 항목**:
- TypeScript 컴파일 오류 없음
- 사용하지 않는 import 제거됨
- ESLint 오류 없음

---

## 의존성 매트릭스

| Task | 선행 작업 |
|------|-----------|
| T1 | 없음 |
| T2 | 없음 |
| T3 | 없음 |
| T4 | T2, T3 |
| T5 | 없음 |
| T6 | 없음 |
| T7 | T1, T2, T4 |
| T8 | T6, T7 |
| T9 | T1, T6, T7, T8 |
| T10 | T3 |
| T11 | T1, T2, T4, T6, T7, T9 |
| T12 | T1~T11 모두 |

---

## 예상 파일 변경 수

| 카테고리 | 생성 | 수정 | 삭제 |
|----------|------|------|------|
| 상수 | 1 | 5 | 0 |
| 타입 | 0 | 1 | 0 |
| 설정 | 0 | 1 | 0 |
| API | 0 | 6 | 0 |
| CSS | 0 | 1 | 0 |
| 컴포넌트 | 5 | 1 | 0 |
| 훅 | 5 | 1 | 0 |
| 페이지 | 0 | 5 | 0 |
| 컨텍스트 | 0 | 1 | 0 |
| index.ts | 3 | 0 | 0 |
| **총계** | **14** | **22** | **0** |
