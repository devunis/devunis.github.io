---
title: "RESTful API 설계 베스트 프랙티스 10가지"
date: 2026-01-02 09:00:00 +0900
categories: [Backend, API]
tags: [REST-API, API-Design, Best-Practices, Backend]
---

좋은 API 설계는 백엔드 개발의 핵심입니다. 실전 경험을 바탕으로 한 RESTful API 설계 가이드를 제공합니다.

---

## 1️⃣ 명확한 URL 네이밍

```
✅ GET  /users          - 사용자 목록
✅ GET  /users/123      - 특정 사용자
✅ POST /users          - 사용자 생성
✅ PUT  /users/123      - 사용자 수정
✅ DELETE /users/123    - 사용자 삭제

❌ GET /getUserList
❌ POST /createUser
❌ GET /users/delete/123
```

---

## 2️⃣ HTTP 메서드 올바른 사용

| 메서드 | 용도 | 멱등성 |
|--------|------|--------|
| GET | 조회 | O |
| POST | 생성 | X |
| PUT | 전체 수정 | O |
| PATCH | 부분 수정 | X |
| DELETE | 삭제 | O |

---

## 3️⃣ 적절한 상태 코드

```python
# 성공
200 OK - 조회 성공
201 Created - 생성 성공
204 No Content - 삭제 성공

# 클라이언트 에러
400 Bad Request - 잘못된 요청
401 Unauthorized - 인증 필요
403 Forbidden - 권한 없음
404 Not Found - 리소스 없음

# 서버 에러
500 Internal Server Error
503 Service Unavailable
```

---

## 4️⃣ 버저닝

```
# URL 버저닝 (추천)
/api/v1/users
/api/v2/users

# Header 버저닝
Accept: application/vnd.myapi.v1+json
```

---

## 5️⃣ 페이지네이션

```python
GET /users?page=1&per_page=20

{
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 100,
        "total_pages": 5
    }
}
```

---

## 6️⃣ 필터링 및 정렬

```
GET /users?status=active&sort=-created_at
GET /posts?category=tech&author=123
```

---

## 7️⃣ 일관된 에러 응답

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "입력값이 올바르지 않습니다",
        "details": [
            {
                "field": "email",
                "message": "이메일 형식이 아닙니다"
            }
        ]
    }
}
```

---

## 8️⃣ HATEOAS (선택)

```json
{
    "id": 123,
    "name": "John",
    "_links": {
        "self": "/users/123",
        "posts": "/users/123/posts",
        "friends": "/users/123/friends"
    }
}
```

---

## 9️⃣ API 문서화

- Swagger/OpenAPI
- Postman Collections
- API Blueprint

---

## 🔟 보안 고려사항

- ✅ HTTPS 사용
- ✅ API 키 / JWT 인증
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ CORS 설정

---

📚 **참고 자료**:
- [REST API Tutorial](https://restfulapi.net/)
