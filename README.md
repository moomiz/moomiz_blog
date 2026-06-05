# Moomiz Tech Log

AI 협업형 풀스택 기술 블로그 — **Supabase(Postgres)** 에 글·초안·조회수를 저장하고, 관리자에서 CRUD + AI 편집을 수행합니다.

## Tech Stack

| 영역 | 기술 |
|------|------|
| Framework | Next.js 15 (App Router) |
| Database | **Supabase (Postgres)** |
| Auth | Supabase Auth (관리자) |
| Content | MDX 본문 + DB 저장 |
| Comments | Giscus |
| Styling | Tailwind CSS v4 |

## Quick Start

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. **Authentication → Users**에서 관리자 계정 생성 (Email + Password)

### 2. 환경 변수

```bash
cp .env.example .env.local
```

`.env.local`에 URL, Anon Key, Service Role Key 입력 (Settings → API).

### 3. 기존 MDX 글 DB로 이전

```bash
npm install
npm run db:seed
```

### 4. 실행

```bash
npm run dev
```

- 블로그: http://localhost:3000
- 관리자: http://localhost:3000/admin/login → 글 목록 / 작성 / 발행

## 아키텍처

```
방문자 → Next.js (SSR/ISR) → Supabase (posts, view_count)
관리자 → Supabase Auth → /admin/posts → API → posts 테이블
```

### `posts` 테이블

| 컬럼 | 설명 |
|------|------|
| slug | URL 식별자 |
| title, description, content | 글 메타·본문 (MDX) |
| category, tags | 분류 |
| status | `draft` \| `published` |
| featured | 메인 Hero 노출 |
| view_count | 조회수 |

RLS: 익명은 **발행 글만 읽기**, 로그인 사용자는 **전체 CRUD**.

## Supabase 없이 로컬만

환경 변수가 없으면 `content/posts/*.mdx` 파일 모드로 동작합니다 (관리자 CRUD는 비활성).

## Scripts

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run db:seed` | MDX → Supabase upsert |

## Deploy

Vercel + Supabase 조합 권장. Vercel에 동일한 env 변수를 등록하세요.
