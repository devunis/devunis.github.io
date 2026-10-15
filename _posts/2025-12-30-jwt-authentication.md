---
title: "JWT 인증 설계: Access·Refresh Token과 검증 경계"
date: 2025-12-30 09:00:00 +0900
categories: [Backend, Security]
tags: [JWT, OAuth2, FastAPI, Authentication, Security]
last_modified_at: 2026-10-15 14:50:00 +0900
---

JWT는 클레임을 전달하는 토큰 형식입니다. OAuth 2.0은 권한 위임 프레임워크이고, JWT와 같은 개념이 아닙니다. 이 글은 인증 설계의 핵심을 설명하며 완성된 인증 서버 구현을 제공하지 않습니다.

## 🔐 서명과 암호화 구분

일반적인 서명 JWT의 Header·Payload는 인코딩된 데이터이며 그 자체로 비밀이 아닙니다. 비밀번호·민감 정보를 넣지 않습니다. 서명 검증과 만료·발급자·대상·토큰 용도 등 정책 검증을 수행해야 합니다.

## 📊 Access와 Refresh

| 구분 | 역할 | 확인할 정책 |
| --- | --- | --- |
| Access Token | API 접근 | 만료, 대상, 권한·범위 |
| Refresh Token | 새 접근 토큰 발급 | 회전·재사용 탐지·폐기·세션 연결 |

Refresh Token이 반드시 JWT일 필요는 없습니다. 저장 위치와 수명은 앱 구조·위험에 따라 정하며, 특정 기간을 모든 서비스의 정답으로 쓰지 않습니다.

## 🚧 토큰 혼용 방지

서명 키가 같고 sub·exp만 검사하면 refresh token이 API 접근에 사용되거나 access token이 갱신에 사용되는 오류가 생길 수 있습니다. 용도 클레임·audience·별도 검증 함수 등으로 각 경계를 명시합니다.

```text
로그인 검증 → 접근 토큰 + 갱신 토큰 발급
API 요청 → 접근 토큰 정책 검증 → 사용자·객체 권한 확인
갱신 요청 → 갱신 토큰 정책·세션 상태 검증 → 회전·이전 토큰 폐기
```

이 그림은 설계 흐름이며 토큰을 발급하는 코드 전체가 아닙니다. 이전 글의 불완전한 발급·갱신 예제는 제거했습니다.

## 🛡️ 검증할 실패 조건

- 잘못된 서명·허용하지 않은 알고리즘.
- 만료·잘못된 발급자·대상·토큰 종류.
- 비활성 사용자·폐기된 세션·권한 없는 객체.
- 갱신 토큰 재사용·도난 시 세션 종료.
- 응답·로그에 토큰·비밀번호 해시 노출.

HttpOnly는 스크립트의 쿠키 읽기를 제한하지만 CSRF 같은 모든 위험을 없애지 않습니다. Secure·SameSite, CSRF 방어, HTTPS를 앱 구조에 맞게 구성합니다. CORS는 인증·인가 대체가 아닙니다.

## ✅ 구현 출발점

유지보수되는 암호·토큰 라이브러리를 쓰고 알고리즘과 필수 클레임을 명시합니다. 비밀번호는 적절한 해시로 저장합니다. 공식 튜토리얼도 실제 운영의 세션·폐기·권한 정책과 연결해 검증해야 합니다.

📚 [FastAPI JWT 공식 예제](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/) · [JWT 명세 RFC 7519](https://www.rfc-editor.org/rfc/rfc7519) · [JWT 권장사항 RFC 8725](https://www.rfc-editor.org/rfc/rfc8725)
