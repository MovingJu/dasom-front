---
title: Api 명세 관련 공지
date: 3000-04-25
tags: 공지
authorName: 이동주
authorDesignation: 사이트제작
---

# API 명세 공지

프런트엔드 기준 최신 Mock API 명세입니다.
백엔드 연동 시 최소한 아래 동작/응답 형태를 맞춰 주세요.

# DASOM Mock API Spec

기준 브랜치: `feature/blog`
기준 날짜: 2026-02-20

## 개요
- 현재는 Next.js Route Handler 기반 Mock API를 사용합니다.
- 세션은 `dasom_session` 쿠키(HttpOnly, Lax, Max-Age 1일)로 관리합니다.
- 사용자 데이터 소스: `public/mock/users.csv`
- 블로그 글 저장 경로: `uploads/blog-posts`
- 블로그 이미지 저장 경로: `public/uploads/blog`

---

## 1) 로그인
- Method: `POST`
- Path: `/api/auth/login`
- Auth: 불필요
- Content-Type: `application/json`

### Request Body
```json
{
  "email": "admin@khu.ac.kr",
  "password": "dasomDASOM"
}
```

### Success `200`
```json
{
  "ok": true,
  "user": {
    "id": "1",
    "email": "admin@khu.ac.kr",
    "name": "다솜관리자",
    "studentId": "2025000001",
    "role": "admin"
  }
}
```

### Error
- `400`: 이메일/비밀번호 누락
- `401`: 등록되지 않은 이메일, 비밀번호 불일치, 비활성 계정

### 비고
- 성공 시 `dasom_session` 쿠키를 설정합니다.

---

## 2) 내 세션 조회
- Method: `GET`
- Path: `/api/auth/me`
- Auth: 선택

### 로그인 상태 Success `200`
```json
{
  "ok": true,
  "user": {
    "id": "1",
    "email": "admin@khu.ac.kr",
    "name": "다솜관리자",
    "studentId": "2025000001",
    "role": "admin"
  }
}
```

### 비로그인 상태 `200`
```json
{
  "ok": false,
  "user": null
}
```

---

## 3) 로그아웃
- Method: `POST`
- Path: `/api/auth/logout`
- Auth: 선택

### Success `200`
```json
{
  "ok": true
}
```

### 비고
- `dasom_session` 쿠키를 만료(`maxAge: 0`) 처리합니다.

---

## 4) 회원가입
- Method: `POST`
- Path: `/api/auth/signup`
- Auth: 불필요
- Content-Type: `application/json`

### Request Body
```json
{
  "name": "홍길동",
  "studentId": "2025001234",
  "email": "hong@khu.ac.kr",
  "password": "pass1234"
}
```

### Validation
- `name/studentId/email/password` 필수
- `email`은 `@khu.ac.kr` 도메인만 허용
- `studentId`는 10자리 숫자
- `studentId`가 `2026`으로 시작하면 가입 불가
- CSV 안전성 때문에 입력값에 `,`, 줄바꿈 문자 불가
- 중복 이메일 가입 불가

### Success `201`
```json
{
  "ok": true,
  "user": {
    "id": "4",
    "email": "hong@khu.ac.kr",
    "name": "홍길동",
    "studentId": "2025001234",
    "role": "member"
  },
  "message": "회원가입이 완료되었습니다. 로그인해 주세요."
}
```

### Error `400`
```json
{
  "ok": false,
  "error": "학번은 10자리 숫자로 입력해 주세요."
}
```

---

## 5) 블로그 글 생성 (로그인 필요)
- Method: `POST`
- Path: `/api/blog/create`
- Auth: `dasom_session` 쿠키 필요
- Content-Type: `application/json`

### Request Body
```json
{
  "title": "2026 1학기 공지",
  "tags": "공지,스터디",
  "content": "# 본문\n\n마크다운 내용"
}
```

### 동작
- 제목(`title`) 필수, 본문(`content`) 필수
- `tags`는 문자열로 저장
- `date`는 서버 현재 날짜(YYYY-MM-DD)
- `authorName`, `authorDesignation`은 세션 유저 정보 기반으로 frontmatter에 기록
- 파일은 `uploads/blog-posts/{slug}.md`에 저장
- slug 충돌 시 `-2`, `-3` suffix로 유니크 보장

### Success `200`
```json
{
  "ok": true,
  "slug": "2026-1-공지",
  "fileName": "2026-1-공지.md",
  "path": "uploads/blog-posts/2026-1-공지.md",
  "detailUrl": "/blog/2026-1-공지"
}
```

### Error
- `400`: 제목/본문 누락
- `401`: 로그인 세션 없음

---

## 6) 블로그 이미지 업로드 (로그인 필요)
- Method: `POST`
- Path: `/api/blog/upload`
- Auth: `dasom_session` 쿠키 필요
- Content-Type: `multipart/form-data`

### Request Body (form-data)
- `file`: 이미지 파일 1개

### Validation
- 허용 MIME: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- 최대 크기: 5MB

### Success `200`
```json
{
  "ok": true,
  "fileName": "20260220-180001-a1b2c3d4.png",
  "url": "/uploads/blog/20260220-180001-a1b2c3d4.png"
}
```

### Error
- `400`: 파일 누락, 형식 오류, 용량 초과
- `401`: 로그인 세션 없음

---

## 7) 문의 메일 전송
- Method: `POST`
- Path: `/api/contact`
- Auth: 불필요
- Content-Type: `application/json`

### Request Body
```json
{
  "name": "홍길동",
  "email": "hong@khu.ac.kr",
  "message": "문의 내용입니다."
}
```

### Success `200`
```json
{
  "ok": true
}
```

### Error
- `400`: 필수값 누락, 이메일 형식 오류
- `500`: 서버 환경변수 누락
- `502`: Resend API 전송 실패

### 환경변수
- `CONTACT_TO_EMAIL`: 문의 수신 이메일
- `CONTACT_FROM_EMAIL`: 발신자 표기(선택, 기본값 `DASOM Contact <onboarding@resend.dev>`)
- `RESEND_API_KEY`: Resend API 키

---

## Mock 계정 (`public/mock/users.csv`)
1. `admin@khu.ac.kr / dasomDASOM` (active, admin)

> 서비스 전환 시 mock 계정/CSV 저장 방식은 DB 기반으로 교체 권장
