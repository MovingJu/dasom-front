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
  "email": "hong@khu.ac.kr",
  "password": "pass1234"
}
```

제약:
- `email`은 반드시 `@khu.ac.kr` 로 끝나야 함
- 이미 존재하는 이메일은 가입 불가
- `name/email/password`에 `,` 혹은 줄바꿈 문자는 허용하지 않음(CSV 안정성)

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
  "error": "회원가입은 @khu.ac.kr 이메일만 가능합니다."
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
  "excerpt": "요약",
  "date": "2026-02-19",
  "tags": "공지,스터디",
  "authorName": "다솜 운영진",
  "authorDesignation": "홍보팀",
  "authorImage": "/images/blog/author-default.png",
  "coverImage": "/images/blog/blog-01.jpg",
  "content": "# 본문\n\n마크다운 내용"
}
```

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

## Mock 계정 (src/mock/users.csv)
1. `admin@dasom.dev / dasom123!` (active)
2. `member@dasom.dev / member123!` (active)
3. `inactive@dasom.dev / inactive123!` (inactive)
