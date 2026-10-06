# 퍼스널 스타일리스트

본인 사진과 키, 몸무게를 입력하면 OpenAI API로 AI 스타일 컨설팅 보고서를 받을 수 있는 서비스입니다.
React + TypeScript(Vite) 프론트엔드와 Cloudflare Pages Functions 백엔드로 구성되어 있습니다.

## 구조

- `src/` — React 프론트엔드 (사진/키/몸무게 입력, 보고서 표시)
- `functions/api/consult.ts` — Cloudflare Pages Function. `/api/consult`로 POST하면
  OpenAI(`gpt-4o-mini`, Vision)를 호출해 스타일 컨설팅 보고서를 생성해서 돌려줍니다.

## 환경 변수 (필수)

이 프로젝트는 서버(Function)에서 OpenAI API를 호출하므로 **OPENAI_API_KEY**가 필요합니다. 프론트엔드에는 절대 노출되지 않습니다.

### Cloudflare Pages 대시보드에서 설정

1. Cloudflare 대시보드 → 해당 Pages 프로젝트 → **Settings → Environment variables**
2. **Production**(및 필요시 Preview)에 `OPENAI_API_KEY` 추가, 값은 OpenAI API 키
3. 저장 후 재배포(또는 다음 push 시 자동 적용)

### 로컬 개발에서 설정

프로젝트 루트에 `.dev.vars` 파일을 만들고(이 파일은 `.gitignore`에 포함되어 커밋되지 않습니다):

```
OPENAI_API_KEY=sk-...
```

Functions까지 포함해서 로컬에서 테스트하려면 Wrangler로 실행하세요:

```bash
npm run build
npx wrangler pages dev dist
```

(프론트엔드만 빠르게 개발할 때는 그냥 `npm run dev`를 쓰면 되지만, 이때는 `/api/consult` 호출이
동작하지 않습니다 — Vite dev 서버는 Pages Functions를 실행하지 않습니다.)

## 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 배포

`main` 브랜치에 push되면:

- **GitHub Actions**(`.github/workflows/deploy.yml`)가 빌드 후 GitHub Pages에 배포합니다.
  (단, GitHub Pages는 정적 호스팅만 지원하므로 `/api/consult`는 동작하지 않습니다.)
- **Cloudflare Pages**가 GitHub 연동을 통해 자동으로 빌드/배포하며, Pages Functions(`functions/`)도
  함께 배포되어 `/api/consult`가 정상 동작합니다. AI 컨설팅 기능을 쓰려면 **Cloudflare Pages 배포 주소**로
  접속해야 합니다.

- GitHub Pages: https://umaibong-crypto.github.io/product-builder-practice/
- Cloudflare Pages: Cloudflare 대시보드에서 확인한 `*.pages.dev` 주소(또는 연결한 커스텀 도메인)
