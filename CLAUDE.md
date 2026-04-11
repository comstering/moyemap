# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `yarn dev` — start dev server (localhost:3000)
- `yarn build` — production build
- `yarn lint` — run ESLint (eslint-config-next with core-web-vitals + typescript)

## Tech Stack

- **Framework:** Next.js 16 with App Router (`src/app/`), React 19, TypeScript
- **React Compiler:** enabled via `reactCompiler: true` in next.config.ts
- **Styling:** Tailwind CSS v4 (uses `@import "tailwindcss"` syntax)
- **Icons:** lucide-react
- **Map:** Naver Cloud Map API (script 로드 방식)
- **Package manager:** Yarn
- **Path Alias:** `@/*` → `./src/*`

## UI Conventions

- Dark theme (slate-900/950 backgrounds, indigo-500/600 accent)
- Korean UI labels — 모든 사용자 대면 텍스트는 한국어
- Currency: ₩ (Korean Won), `toLocaleString()` 포맷

---

## PRD (Product Requirements Document)

### 서비스 목적

전국 소셜 모임, 게스트하우스 파티, 혼술바 정보를 네이버 지도 기반으로 한눈에 파악하고, 위치와 가격을 직관적으로 비교할 수 있는 정보 제공성 웹 서비스.

### 타겟 고객

- **Primary:** 2030 1인 가구 및 직장인 (새로운 만남/네트워킹)
- **Secondary:** 국내 여행객 (게스트하우스 파티, 현지 혼술바)

### MVP 목표

- **가설:** 서울의 2030 유저들은 흩어진 소셜 파티/혼술바 정보를 지도로 보고 가격 비교 후 예약할 것이다.
- **초기 타겟 지역:** 서울 주요 상권 (홍대/연남, 강남, 이태원, 성수)
- **Out of scope:** 회원가입/로그인, 자체 결제, 호스트 백오피스, 리뷰/평점

### MVP 핵심 기능

#### 1. 지도 기반 탐색 (Naver Cloud Map API)
- 초기 로드: 위치 권한 요청, 거부 시 서울 중심 기본 좌표
- 카테고리별 마커 핀 컬러/아이콘 구분 (혼술바, 소셜파티, 게하파티 등)
- 마커 클릭 시 간략 정보 툴팁 (이름, 가격, 일시)
- 지도 드래그 후 '이 지역 검색' 버튼

#### 2. 리스트 뷰 및 가격 비교
- PC: 사이드바 / 모바일: 바텀 시트
- 카드 UI: 메인 이미지, 모임명, 날짜, 참가비(강조)
- 지도 마커와 리스트 동기화

#### 3. 간편 필터링
- 카테고리: 소셜파티 / 혼술바 / 네트워킹
- 일정: 오늘 / 내일 / 이번 주말
- 가격대: 3만 원 미만 / 3~5만 원 / 5만 원 이상

#### 4. 상세 페이지 및 아웃링크
- 이미지 슬라이더, 텍스트 정보 (운영시간, 제공내역, 분위기)
- CTA 버튼: [예약하기/문의하기] → 외부 플랫폼 아웃링크

### 유저 플로우

1. 랜딩 → 서울 중심 지도 + 오늘/이번 주말 모임 마커
2. 탐색 → 지도 이동 or 퀵 버튼(홍대, 이태원 등)으로 지역 이동 + 필터
3. 비교 → 바텀 시트/사이드바에서 참가비 비교
4. 전환 → 상세 페이지 → [예약하기] 아웃링크

### 성공 지표

- DAU / MAU
- 평균 체류 시간 (지도 탐색 활성도)
- CTA 클릭률 (Out-link CTR) — 비즈니스 모델 핵심

### 시스템 아키텍처

- **Frontend:** Next.js App Router, React 19, TypeScript
- **Backend (추후):** Spring Boot, Kotlin
- **Database (추후):** PostgreSQL + PostGIS, Redis
- **Infra (추후):** AWS, Terraform, GitHub Actions CI/CD
