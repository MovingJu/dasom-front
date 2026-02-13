# DASOM Frontend

**"다솜은 사랑입니다!"**
경희대학교 컴퓨터공학부 학술동아리 **다솜(DASOM)** 공식 웹사이트 프론트엔드입니다.  

## 기술 스택
- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- next-themes (라이트/다크)
- ESLint + Prettier

## 시작하기
### 요구사항
- Node.js 20+
- npm

### 설치 및 실행
```bash
npm install
npm run dev
```
기본 실행 주소: `http://localhost:3000`

### 기타 명령어
```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
npm run lint    # 린트
```

## 현재 페이지 구성
- `/` 홈
- `/about` 소개
- `/contact` 문의
- `/blog` 블로그 그리드
- `/blog-details` 블로그 상세
- `/blog-sidebar` 블로그 사이드바
- `/signin` 로그인
- `/signup` 회원가입
- `/error` 에러

홈(`src/app/page.tsx`) 주요 섹션 순서:
1. Hero
2. Features
3. Video
4. Brands
5. About Section One
6. About Section Two
7. Testimonials
8. Blog
9. Contact

## 디자인 가이드
`src/styles/index.css`의 주요 컬러 토큰:
- `--color-primary: #EC4899` (메인 분홍)
- `--color-dark: #2F1D30`
- `--color-bg-color-dark: #281723`
- `--color-gray-dark: #2E1E2A`

작업 원칙:
- 신규 강조색은 기본적으로 `primary` 사용
- 파란 템플릿 잔여 요소는 분홍 톤으로 순차 교체
- 라이트/다크 모두 텍스트 대비를 확인

## 현재 상태 메모
현재 코드에는 다솜 커스텀과 템플릿 기본 요소가 혼재되어 있습니다.

이미 반영된 요소:
- Hero 문구/메타 일부 다솜화
- About 섹션의 다솜 설명 및 위치 정보
- 임원진 소개 섹션 텍스트 일부 반영

## 디렉터리 개요
```text
src/
  app/           # 라우트 페이지
  components/    # 섹션/공용 컴포넌트
  styles/        # 전역 스타일 및 테마 토큰
public/          # 이미지/정적 리소스
```

