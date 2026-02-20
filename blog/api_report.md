---
title: Api 명세 관련 공지
date: 3000-04-25
tags: 공지1
authorName: 이동주
authorDesignation: 사이트제작
---

# API 명세 공지

프런트엔드에 필요한 api 내용을 서술합니다. 

백엔드에선 최소한 해당 기능을 포함해주시기 바랍니다.

# DASOM Mock API Spec

기준 브랜치: `feature/login`
기준 날짜: 2026-02-19

## 개요
현재는 백엔드가 없어 Next.js Route Handler로 Mock 인증 API를 제공합니다.
사용자 데이터 소스는 `src/mock/users.csv` 입니다.

세션은 `dasom_session` 쿠키(HttpOnly, Lax, 1일)로 관리됩니다.

---

## 1) 로그인
- Method: `POST`
- Path: `/api/auth/login`
- Auth: 불필요
- Content-Type: `application/json`

### Request Body
```json
{
  "email": "admin@dasom.dev",
  "password": "dasom123!"
}
```

### Success `200`
```json
{
  "ok": true,
  "user": {
    "id": "1",
    "email": "admin@dasom.dev",
    "name": "다솜관리자",
    "role": "admin"
  }
}
```

### Error
- `400`: 이메일/비밀번호 누락
- `401`: 이메일 없음, 비밀번호 불일치, 비활성 계정

---

## 2) 내 세션 조회
- Method: `GET`
- Path: `/api/auth/me`
- Auth: `dasom_session` 쿠키 필요

### Success `200`
```json
{
  "ok": true,
  "user": {
    "id": "1",
    "email": "admin@dasom.dev",
    "name": "다솜관리자",
    "role": "admin"
  }
}
```

### Not Logged In `200`
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

동작: `dasom_session` 쿠키 만료 처리

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

제약:
- `email`은 반드시 `@khu.ac.kr` 로 끝나야 함
- `studentId`는 반드시 10자리 숫자여야 함
- `studentId`가 `2026`으로 시작하면 가입 불가(신입생 미지원)
- 이미 존재하는 이메일은 가입 불가
- `name/studentId/email/password`에 `,` 혹은 줄바꿈 문자는 허용하지 않음(CSV 안정성)

### Success `201`
```json
{
  "ok": true,
  "user": {
    "id": "4",
    "email": "hong@khu.ac.kr",
    "name": "홍길동",
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

동작:
- `date`는 서버의 현재 날짜(YYYY-MM-DD)로 자동 저장
- `authorName`, `authorDesignation`은 로그인 세션 사용자 정보로 자동 저장

### Success `200`
```json
{
  "ok": true,
  "slug": "2026-1학기-공지",
  "fileName": "2026-1학기-공지.md",
  "path": "blog/2026-1학기-공지.md",
  "detailUrl": "/blog/2026-1학기-공지"
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

제약:
- 허용 형식: `image/png`, `image/jpeg`, `image/webp`, `image/gif`
- 최대 크기: 5MB

### Success `200`
```json
{
  "ok": true,
  "fileName": "20260219-223501-a1b2c3d4.png",
  "url": "/uploads/blog/20260219-223501-a1b2c3d4.png"
}
```

### Error
- `400`: 파일 누락/형식 오류/용량 초과
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
- `500`: 서버 환경변수 누락 (`CONTACT_TO_EMAIL`, `RESEND_API_KEY`)
- `502`: 외부 메일 전송 API 실패

### 환경변수
- `CONTACT_TO_EMAIL`: 문의 수신 이메일 주소
- `CONTACT_FROM_EMAIL`: 발신자 표기 (선택, 기본값 `DASOM Contact <onboarding@resend.dev>`)
- `RESEND_API_KEY`: Resend API 키

---

## 8) 족보 글 생성 (로그인 필요)
- Method: `POST`
- Path: `/api/zokbo/create`
- Auth: `dasom_session` 쿠키 필요
- Content-Type: `application/json`

### Request Body
```json
{
  "title": "운영체제 중간고사 핵심 정리",
  "tags": ["운영체제", "알고리즘"],
  "content": "# 본문\n\n마크다운 내용",
  "attachments": [
    {
      "name": "oop-points.txt",
      "url": "/zokbo/20260220160510-oop-points-a1b2c3d4.txt"
    }
  ]
}
```

제약:
- `title`, `content` 필수
- `tags`는 1개 이상 필수
- `tags`는 **기존 족보에 이미 존재하는 태그 중에서만** 선택 가능
- `attachments`는 1개 이상 필수
- `attachments.url`은 `/zokbo/*`만 허용
- 서버에서 첨부파일 실존 여부를 검증

동작:
- `date`는 서버 현재 날짜(YYYY-MM-DD)로 자동 저장
- `authorName`, `authorDesignation`은 로그인 세션 사용자 정보로 자동 저장
- 저장 시 본문 하단에 `## 첨부파일` 목록이 자동 추가됨(없을 때)

### Success `200`
```json
{
  "ok": true,
  "slug": "운영체제-중간고사-핵심-정리",
  "fileName": "운영체제-중간고사-핵심-정리.md",
  "path": "zokbo/운영체제-중간고사-핵심-정리.md",
  "detailUrl": "/zokbo/운영체제-중간고사-핵심-정리",
  "attachments": [
    {
      "name": "oop-points.txt",
      "url": "/zokbo/20260220160510-oop-points-a1b2c3d4.txt"
    }
  ]
}
```

### Error
- `400`: 제목/본문 누락, 태그 누락, 첨부파일 누락, 허용되지 않은 태그/경로, 파일 없음
- `401`: 로그인 세션 없음

---

## 9) 족보 파일 업로드 (로그인 필요)
- Method: `POST`
- Path: `/api/zokbo/upload`
- Auth: `dasom_session` 쿠키 필요
- Content-Type: `multipart/form-data`

### Request Body (form-data)
- `files`: 파일 1개 이상 (다중 업로드 가능)

제약:
- 파일 **개수 제한 없음**
- 파일 형식 제한 없음 (pdf, csv, zip, txt 등)
- 파일당 최대 1GB

### Success `200`
```json
{
  "ok": true,
  "files": [
    {
      "originalName": "oop-points.txt",
      "fileName": "20260220160510-oop-points-a1b2c3d4.txt",
      "url": "/zokbo/20260220160510-oop-points-a1b2c3d4.txt",
      "size": 198,
      "mimeType": "text/plain"
    }
  ]
}
```

### Error
- `400`: 파일 누락, 파일 크기 초과
- `401`: 로그인 세션 없음
- `413`: 업로드 본문 크기 제한 초과(프록시/게이트웨이 제한)

운영 환경 참고:
- Nginx 사용 시 `client_max_body_size`를 1GB 이상으로 설정해야 대용량 업로드 가능
- Next.js는 `next.config.js`의 `experimental.proxyClientMaxBodySize`를 1GB로 설정

---

## Mock 계정 (src/mock/users.csv)
1. `admin@dasom.dev / dasom123!` (active)

> 이후 서비스 단계에서 mock 계정 삭제 바랍니다.
