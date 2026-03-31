# sofia-frontend

version: `26f.04.01`

Sofia 2026 시스템의 프론트엔드 코드입니다. React + TypeScript + Vite 기반으로 동작합니다.

## 개발 서버 실행

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 구동됩니다. API 요청은 `vite.config.ts`의 proxy 설정을 통해 백엔드 서버로 전달됩니다.

## 빌드 및 검사

```bash
npm run lint    # ESLint 검사
npm run build   # 타입체크 + 프로덕션 빌드
```

## CI/CD

- **CI**: main 브랜치에 PR이 열리면 lint 및 build 검사를 실행합니다.
- **CD**: main 브랜치에 push되면 빌드 후 GitHub Release를 생성하고 Cloudflare R2에 배포합니다.
