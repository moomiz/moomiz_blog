# Cobot AMR UI — 완성 브리프 & Playground User 프롬프트

에디터 **AI 초안 생성** 또는 OpenAI Playground에 그대로 붙여 넣어 사용하세요.

- 템플릿: **제품 회고 (바이브 코딩)**
- System 프롬프트: `docs/product-retro-prompt-guide.md` 또는 이전 대화의 Playground System 블록

---

## 1. 에디터 브리프 (복사용)

```
- 제품명: Cobot Type AMR 조작 UI (L사 공정용)
- 한 줄 소개: 공정 현장에서 Cobot AMR을 웹으로 조작·모니터링하고, ROS 데이터를 실시간으로 다루는 UI
- 만든 기간·역할: 2024.09 ~ 2025.03, Frontend 100% (FE 1명, Robot SW Developer 4명과 협업)
- 기술 스택: React 18, Next.js 14.2 (App Router), TypeScript 5.7, Tailwind CSS 3.4, shadcn/ui 2.1, roslib 1.4, ROS2 Humble, rosbridge, Nginx

- 핵심 기능:
  - Cobot Type AMR 조작·상태 모니터링 UI
  - roslib 기반 ROS 직접 통신 (connect / publish / subscribe / service)
  - Next.js Route Handlers로 로컬 파일·디렉토리 읽기/수정
  - 500MB 이상 대용량 로그 파일 청크 스트리밍 조회

- 가장 어려웠던 점:
  - 프로젝트 중반 백엔드 개발자 퇴사로 API 서버 연동 공백 발생
  - 웹에서 ROS 실시간 통신 안정화 (연결 끊김, UI 상태와 실제 로봇 상태 불일치)
  - 프론트(3000)와 WebSocket 서버 포트 분리로 인한 CORS 이슈
  - 짧은 개발 기간 + 요구사항 변경에 대응 가능한 구조 필요

- 왜 이렇게 만들었는지 (Why):
  - 고객사 일정이 짧고 UI 완성도 요구가 높아, 재사용·변경 대응이 쉬운 FSD(Feature-Sliced Design) 채택
  - 기본 AMR 외 다른 장비 추가·변경 가능하도록 기능 단위로 로직과 UI 분리
  - ROS 측에서 이미 정제된 데이터를 실시간 제공 → 별도 백엔드 경유는 지연·복잡성만 늘린다고 판단, roslib 직접 연동 선택
  - App Router Route Handlers로 로컬 파일을 서버에서 안전하게 읽도록 설계
  - Tailwind + shadcn/ui로 모듈화·커스터마이징·개발 속도 확보
  - Nginx로 프론트와 WebSocket 프록시 통합, CORS 해결

- 바이브 코딩으로 한 일:
  - AI(Cursor)에 맡긴 것:
    - shadcn/ui 기반 반복 패널·폼·카드 레이아웃 초안
    - FSD entities/features/widgets 폴더 구조 스캐폴딩
    - useRosConnection, useRosSubscribe 등 커스텀 훅 인터페이스·이름·뼈대 코드
    - Tailwind 유틸 조합으로 비슷한 UI 블록 빠르게 생성
  - 직접 검토·작성한 것:
    - roslib 토픽·메시지 타입 매핑 및 실제 subscribe/publish/service 로직
    - 백엔드 없이 ROS 직접 연동해도 되는지 구조 판단 및 팀 설득
    - Nginx WebSocket 프록시 설정 및 CORS 이슈 해결
    - Route Handlers + .env 기반 로봇별 파일 경로 관리
    - 500MB+ 로그 ReadableStream 청크 단위 로딩 구현
    - AI가 제안한 Pages Router·과도한 추상화는 거절하고 App Router + FSD로 통일

- 잘 됐던 점:
  - FSD + shadcn 모듈화로 요구사항 변경 시 화면 단위 수정이 비교적 빨랐음
  - 백엔드 공백 상황에서도 ROS 직접 연동으로 일정 유지
  - 대용량 로그 스트리밍으로 현장 디버깅에 실사용 가능

- 아쉬운 점:
  - 현장 터치·해상도 다양한 디스플레이에 대한 UX 검증이 부족했음
  - ROS 통신 장애 시 사용자에게 보여줄 복구 UX(재연결, 상태 표시)를 더 일찍 설계하지 못함
  - E2E·통신 레이어 테스트가 수동 검증에 의존

- 다음에 다르게 할 것:
  - ROS 연동을 adapter 레이어로 처음부터 분리해 장비·토픽 변경에 대비
  - 연결 복구·오프라인 상태 UI를 MVP 단계부터 포함
  - 바이브 코딩 시 "아키텍처 제약(FSD, App Router, 직접 ROS)"을 프롬프트 맨 앞에 고정
```

---

## 2. Playground User 메시지 (복사용)

아래 전체를 User에 붙여 넣습니다.

```
## 사용자 브리프
- 제품명: Cobot Type AMR 조작 UI (L사 공정용)
- 한 줄 소개: 공정 현장에서 Cobot AMR을 웹으로 조작·모니터링하고, ROS 데이터를 실시간으로 다루는 UI
- 만든 기간·역할: 2024.09 ~ 2025.03, Frontend 100% (FE 1명, Robot SW Developer 4명과 협업)
- 기술 스택: React 18, Next.js 14.2 (App Router), TypeScript 5.7, Tailwind CSS 3.4, shadcn/ui 2.1, roslib 1.4, ROS2 Humble, rosbridge, Nginx

- 핵심 기능:
  - Cobot Type AMR 조작·상태 모니터링 UI
  - roslib 기반 ROS 직접 통신 (connect / publish / subscribe / service)
  - Next.js Route Handlers로 로컬 파일·디렉토리 읽기/수정
  - 500MB 이상 대용량 로그 파일 청크 스트리밍 조회

- 가장 어려웠던 점:
  - 프로젝트 중반 백엔드 개발자 퇴사로 API 서버 연동 공백 발생
  - 웹에서 ROS 실시간 통신 안정화 (연결 끊김, UI 상태와 실제 로봇 상태 불일치)
  - 프론트와 WebSocket 서버 포트 분리로 인한 CORS 이슈
  - 짧은 개발 기간 + 요구사항 변경에 대응 가능한 구조 필요

- 왜 이렇게 만들었는지 (Why):
  - FSD로 장비 추가·변경에 유연하게 대응
  - ROS 정제 데이터를 직접 수신해 백엔드 경유 지연·복잡성 제거
  - Route Handlers로 로컬 파일 안전 접근, Nginx로 프록시·CORS 해결
  - Tailwind + shadcn으로 모듈화·개발 속도 확보

- 바이브 코딩으로 한 일:
  - AI(Cursor)에 맡긴 것: shadcn UI 초안, FSD 폴더 스캐폴딩, ROS 커스텀 훅 뼈대, 반복 Tailwind 블록
  - 직접 검토·작성한 것: roslib 토픽/메시지 매핑, 직접 연동 구조 결정, Nginx 설정, 500MB 로그 스트리밍, .env 경로 설계, AI의 Pages Router 제안 거절

- 잘 됐던 점: FSD+shadcn으로 변경 대응 빠름, 백엔드 공백에도 일정 유지, 대용량 로그 현장 활용
- 아쉬운 점: 터치/다양한 디스플레이 UX, 통신 장애 시 복구 UX, 자동화 테스트 부족
- 다음에 다르게: ROS adapter 분리, 복구 UX를 MVP부터, 프롬프트에 아키텍처 제약 선행

## 작성 가이드 (브리프에 없는 항목은 [작성 예정]으로 두지 말고 생략하거나 짧게 언급)
- 제품명·한 줄 소개가 브리프에 없으면 제목 힌트에서 추론합니다.
- 바이브 코딩 섹션은 반드시 <Prompt>와 <Response>를 포함합니다.
- 로봇 조작 UI, 테라에듀 등 **제품 맥락**이 드러나게 씁니다.

## 제목 힌트
백엔드 공백 속 ROS 직접 연동 — Cobot AMR UI를 FSD와 바이브 코딩으로 만든 회고

## 카테고리
Frontend
```

---

## 3. Playground 설정

| 항목 | 값 |
|------|-----|
| Model | gpt-4o-mini |
| Temperature | 0.6 |
| System | 제품 회고 System 프롬프트 (product-retro) |

---

## 4. 생성 후 손볼 곳

AI 초안 나온 뒤 아래는 **본인이 직접 확인·수정**하는 것이 좋습니다.

- `<Prompt>` / `<Response>` 안 문구를 실제 Cursor에 넣었던 말로 교체
- 수치(500MB, 기간, 인원) 사실 확인
- L사 등 **비식별** 필요 시 고객명 처리
- 코드 스니펫이 있으면 실제 프로젝트 코드로 교체
