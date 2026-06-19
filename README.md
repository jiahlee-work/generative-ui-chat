# Generative UI Chat

Next.js App Router 기반 채팅 앱입니다. [OpenUI Chat](https://www.openui.com/)과 Gemini를 사용합니다.

## 실행 방법

의존성을 설치합니다.

```bash
pnpm install
```

`.env.local` 파일을 생성합니다.

```bash
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

개발 서버를 실행합니다.

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다. `3000` 포트가 이미 사용 중이면 Next.js가 대체 로컬 URL을 출력합니다.

## 아키텍처

`src/` 아래의 코드는 변경 이유에 따라 세 개의 layer로 나눕니다. 화면 변경,
사용자 흐름 변경, 외부 연동 변경을 분리하면 코드 위치와 책임이 명확해지고
수정 영향 범위를 줄일 수 있습니다.

```text
src/
├── presentation/    # 화면 표시와 사용자 입력
├── application/     # 사용자 흐름과 상태 관리
├── infrastructure/  # API, DB, 브라우저 API, 외부 서비스 연동
└── shared/          # 계층에 종속되지 않는 공통 코드
```

의존 흐름은 위에서 아래로만 흐릅니다.

```text
Presentation
  ↓
Application
  ↓
Infrastructure
  ↓
API / DB / Browser API / External services
```

### Presentation Layer

`src/presentation`은 사용자에게 무엇을 보여주고, 어떤 입력을 받을지 담당합니다.
React 컴포넌트, 화면 구성, 스타일, 표시 문구, DOM/layout 계산, 컴포넌트 전용
렌더링 helper가 여기에 속합니다.

### Application Layer

`src/application`은 사용자가 수행하려는 작업의 흐름과 상태 관리를 담당합니다.
hook, reducer, selector, submit/cancel/retry/reset 흐름, UI 없이도 설명 가능한
정책과 데이터 변환이 여기에 속합니다.

### Infrastructure Layer

`src/infrastructure`는 외부 시스템과 기술적으로 연결하는 실제 구현을 담당합니다.
API 클라이언트, IndexedDB, FileReader, Blob URL, 네트워크 DTO, 외부 SDK 연동이
여기에 속합니다.

## 스크립트

- `pnpm generate:prompt`: OpenUI 컴포넌트 라이브러리에서 `src/generated/system-prompt.txt`를 생성합니다.
- `pnpm dev`: OpenUI 프롬프트를 생성한 뒤 Next.js 개발 서버를 실행합니다.
- `pnpm build`: OpenUI 프롬프트를 생성한 뒤 Next.js production build를 실행합니다.
- `pnpm lint`: Biome lint를 실행합니다.
- `pnpm test`: Vitest를 watch mode로 실행합니다.
- `pnpm test:run`: Vitest를 한 번 실행합니다.
