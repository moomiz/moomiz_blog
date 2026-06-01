# Moomiz Tech Log

`blog_specification.md` 기획서를 바탕으로 구현한 **AI 협업형 풀스택 기술 블로그**입니다.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4 + 경량 UI 컴포넌트
- **Content:** MDX (`next-mdx-remote`) + `gray-matter`
- **Comments:** Giscus (GitHub Discussions)
- **Metrics:** 파일 기반 조회수 API (`.data/views.json`)

## Getting Started

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## Environment Variables

`.env.example`을 참고해 `.env.local`을 생성하세요.

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | AI 가독성 최적화 (선택, 없으면 mock 모드) |
| `NEXT_PUBLIC_GISCUS_*` | Giscus 댓글 설정 |

## Project Structure

```
app/                 # App Router pages & API routes
components/          # UI, MDX, admin components
content/posts/       # MDX blog posts
lib/                 # posts, views utilities
```

## Features

- 메인: Sidebar 프로필, Hero Post, Category Chips, 인기 글
- 상세: TOC(sticky), Reading Progress, 조회수, Giscus
- MDX: `<Prompt>`, `<Response>` 협업 UI 컴포넌트
- 관리자(`/admin`): AI Streaming 최적화 + Diff View + Apply

## Adding a Post

`content/posts/your-slug.mdx` 파일을 추가하고 frontmatter를 작성합니다.

```mdx
---
title: "글 제목"
description: "2줄 요약"
date: "2026-06-01"
category: "Frontend"
tags: ["React", "Next.js"]
featured: false
---
```

## Deploy

Vercel 등 Node.js 호스팅에 배포 가능합니다. 조회수 store는 `.data/` 디렉터리에 저장되므로, 프로덕션에서는 Supabase/Upstash로 교체하는 것을 권장합니다.
