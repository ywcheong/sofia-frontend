## 작업 지침

- 작업을 완료한 뒤에는 `npm run build --silent`로 문법 오류를 검사할 것
- 지침 추가 시 이유나 예시 없이 규칙만 작성할 것

## TypeScript 규칙

- 타입(type alias, interface)은 `import type` 구문으로 가져올 것
- 사용하지 않는 import와 변수는 제거할 것

## 컴포넌트 규칙

- 모달 구현 시 `createPortal` 직접 사용 대신 `react-modal` 라이브러리 사용할 것
- 배지 표기 시 `@/components/common/Badge` 컴포넌트 사용할 것

## 백엔드 규칙

- 백엔드 API는 `docs/openapi.json`에 명세되어 있으며, 이 문서와 구현이 충돌할 경우 이 문서 기준으로 구현을 수정해야 함.