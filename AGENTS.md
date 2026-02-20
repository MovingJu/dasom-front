# DASOM Frontend Agent Guide

## 1) 프로젝트 정체성
- 프로젝트명: DASOM Frontend
- 목적: 경희대학교 컴퓨터공학부 학술동아리 **다솜** 공식 웹사이트 운영
- 핵심 메시지: `다솜은 사랑입니다!`
- 브랜드/비주얼 컨셉: **분홍색(Pink) 중심**, 밝고 친근하지만 학술동아리답게 신뢰감 있는 톤

## 2) 현재 기술 스택
- Framework: Next.js 16 (`app/` router)
- Language: TypeScript + React 19
- Styling: Tailwind CSS v4 + 커스텀 CSS 변수 (`src/styles/index.css`)
- Theme: `next-themes` (라이트/다크 지원)
- Lint/Format: ESLint, Prettier
- Runtime: Node.js 20+

실행 명령:
- 개발: `npm run dev`
- 빌드: `npm run build`
- 실행: `npm run start`
- 린트: `npm run lint`

## 3) 디자인 시스템(중요)
`src/styles/index.css` 기준 핵심 토큰:
- Primary: `#EC4899` (분홍)
- Dark Base: `#2F1D30`
- Dark Background: `#281723`
- Gray Dark: `#2E1E2A`
- Light Background: `#FCFCFC` (layout body)

에이전트 작업 원칙:
- 신규 UI/버튼/강조색은 기본적으로 `primary` 계열을 사용
- 파란 계열 템플릿 색상(`#4A6CF7`)이 남아 있는 SVG/장식은 점진적으로 핑크 톤으로 치환
- 라이트/다크 모두에서 대비(텍스트 가독성) 확인

## 4) 라우트 및 페이지 상태
현재 라우트:
- `/` : 홈
- `/about` : 소개
- `/contact` : 문의
- `/blog` : 블로그 그리드
- `/blog-details` : 블로그 상세(템플릿 기본 콘텐츠 중심)
- `/blog-sidebar` : 블로그 사이드바 페이지(템플릿 기본)
- `/signin` : 로그인(템플릿 기본)
- `/signup` : 회원가입(템플릿 기본)
- `/error` : 에러 페이지(템플릿 기본)

메타데이터 현황:
- 홈/블로그는 다솜 텍스트 반영됨
- 일부 페이지는 `Free Next.js Template...` 문구가 남아 있음
- 향후 모든 페이지 metadata를 다솜 브랜딩으로 통일 필요

## 5) 홈 페이지 구성 (`src/app/page.tsx`)
렌더 순서:
1. `Hero`
2. `Features`
3. `Video`
4. `Brands`
5. `AboutSectionOne`
6. `AboutSectionTwo`
7. `Testimonials`
8. `Blog`
9. `Contact`

주요 커스텀 반영 상태:
- Hero 문구: `다솜은 사랑입니다!`, `컴퓨터공학과 학술동아리 DASOM 공식 홈페이지`
- About Section 1: 다솜 의미 설명 + 동아리 성격 리스트
- About Section 2: 동아리 주소/동방 위치/안내 + 구글맵
- Testimonials: 2026 임원진 소개 텍스트로 부분 커스텀

## 6) 템플릿 잔여 요소(우선 정리 대상)
아래는 아직 템플릿 기본 값이 많이 남아 있는 영역:
- Header 메뉴(영문 메뉴/Pages 구조)
- Blog 데이터(`src/components/Blog/blogData.tsx`)의 더미 콘텐츠
- Brands 로고/외부 링크(템플릿 서비스 링크)
- Footer 로고 경로/문구/링크(일부 실제 파일 경로와 불일치 가능)
- Signin/Signup/Error/Blog details/sidebar 전체 카피
- 여러 SVG 장식의 파란색 gradient

운영상 중요:
- Footer 이미지 경로가 현재 리포지토리의 실제 로고 파일과 맞지 않을 수 있어 런타임 확인 필요

## 7) 콘텐츠 톤 가이드
다솜 사이트 문구는 다음 기준을 유지:
- 한국어 우선, 필요 시 영문 병기
- 친근하지만 동아리 소개/모집/활동 안내 목적에 맞게 명확하게 작성
- 과도한 템플릿식 SaaS 문구, 무관한 상업 링크 제거
- 임원/동아리 소개 문구는 외부 공개 기준으로 적절성 검토 후 게시

## 8) 에이전트 작업 체크리스트
새 작업 시 아래를 우선 확인:
1. 변경 파일이 `primary pink` 컨셉을 유지하는가
2. 템플릿 잔여 텍스트/링크가 추가되거나 복구되지 않았는가
3. 페이지 metadata가 다솜 정체성을 반영하는가
4. 라이트/다크 모드 둘 다 레이아웃이 깨지지 않는가
5. 이미지/업로드 경로가 실제 `public/` 또는 `uploads/` 파일과 일치하는가
6. API가 추가/변경되면 `uploads/blog-posts/api_report.md`에 요청/응답/에러/제약사항 명세를 반드시 업데이트했는가

## 9) 권장 개선 우선순위
1. Header/Footer 전면 다솜화(메뉴, 링크, 로고, 카피)
2. Blog/Brands 데이터를 실제 동아리 활동/협업 정보로 교체
3. Signin/Signup/Error/Blog 상세 템플릿 카피 제거
4. 전 페이지 metadata/OG 정보 통일
5. 파란 계열 SVG 장식을 분홍 톤으로 일괄 정리

## 10) 한 줄 요약
이 프로젝트는 Next.js 기반 다솜 공식 웹사이트이며, **분홍색 중심 브랜딩**과 **동아리 실제 콘텐츠로의 템플릿 정리**가 핵심 유지보수 목표다.
