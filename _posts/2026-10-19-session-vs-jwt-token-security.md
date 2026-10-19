---
title: "세션 vs JWT 인증: 토큰 탈취와 안전한 로그인 설계"
date: 2026-10-19 00:01:00 +0900
categories: [Backend, Security]
tags: [Session, JWT, Authentication, XSS, CSRF, Refresh-Token, Security]
---

로그인을 구현할 때 세션과 JWT를 자주 비교합니다. 하지만 “JWT라서 안전하다”, “세션은 확장이 어렵다”는 문장만으로 방식을 결정하기는 어렵습니다. **인증 정보를 어떻게 검증하고, 어디에 보관하며, 유출되었을 때 어떻게 끊을 것인가**를 함께 살펴봐야 합니다.

이 글은 2026년 10월 19일 기준 OWASP·IETF·MDN 자료를 참고한 개념 정리입니다. 실제 서비스의 성능 측정이나 침해 사고 경험을 주장하는 글은 아닙니다.

## 세션과 JWT는 정확히 무엇을 비교하는가?

서버 세션 방식에서는 서버가 로그인 상태를 보관하고 클라이언트에는 그 상태를 찾을 수 있는 식별자를 전달합니다. JWT(JSON Web Token)는 클레임을 담는 **토큰 형식**입니다. 흔히 말하는 JWT 인증은 서명된 토큰의 내용을 서버가 검증하는 구성을 뜻합니다.

따라서 세션과 JWT가 완전히 배타적인 것은 아닙니다. JWT를 사용하면서도 서버에서 세션·갱신 상태를 관리할 수 있습니다. 쿠키 역시 세션만의 기술이 아닙니다. JWT도 쿠키에 담을 수 있고, 액세스 토큰이 항상 JWT인 것도 아닙니다.

이 글에서는 **서버 저장소를 조회하는 세션 식별자 방식**과 **서명된 JWT 액세스 토큰을 로컬 검증하는 방식**을 대표 구성으로 비교합니다. [OWASP 세션 관리](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [JWT 보안 권고 RFC 8725](https://www.rfc-editor.org/rfc/rfc8725.html)

## 요청은 어떻게 처리될까?

### 서버 세션 방식

<figure class="article-diagram">
<figcaption>구조 및 흐름 1</figcaption>
<ol>
<li>로그인 성공</li>
<li>서버: 사용자·세션 상태 저장</li>
<li>브라우저: 쿠키에 세션 식별자 보관</li>
<li>다음 요청: 쿠키 전송</li>
<li>서버: 세션 조회 → 요청 처리</li>
</ol>
</figure>


로그아웃이나 강제 종료 시에는 서버의 세션을 무효화합니다. 서버가 여러 대라면 Redis 같은 공유 저장소를 사용하는 구성이 가능합니다. 확장성은 세션의 존재 자체보다 저장소 가용성·조회 비용·만료 설계 등에 영향을 받습니다.

### JWT 액세스 토큰 방식

<figure class="article-diagram">
<figcaption>구조 및 흐름 2</figcaption>
<ol>
<li>로그인 성공</li>
<li>인증 서버: 서명된 JWT 발급</li>
<li>클라이언트: API 요청에 토큰 전달</li>
<li>API: 서명·필수 클레임 검증</li>
<li>권한 확인 → 요청 처리</li>
</ol>
</figure>


인증 서버의 개인 키로 서명하고 API 서버가 공개 키로 검증하는 구성을 사용할 수 있습니다. 토큰마다 로그인 저장소를 조회하지 않아도 되는 장점이 있지만, 키 배포와 교체는 필요합니다.

**서명은 암호화와 다릅니다.** 일반적인 서명 JWT의 페이로드는 읽을 수 있으므로 비밀번호나 비밀 키를 넣으면 안 됩니다. JWT에 암호화 형식도 있지만, JWT라는 이름만으로 기밀성이 보장되지는 않습니다. [OWASP JWT 안내](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)

## 세션과 JWT 비교표

| 기준 | 서버 세션 식별자 | 로컬 검증 JWT 액세스 토큰 |
| --- | --- | --- |
| 로그인 상태 | 주로 서버 저장소에 보관 | 토큰 클레임으로 전달, 추가 상태 관리도 가능 |
| 요청 검증 | 세션 조회 | 서명·발급자·대상·만료 등 검증 |
| 강제 로그아웃 | 세션 무효화로 반영 | 만료 전 차단에는 추가 장치 필요 |
| 권한 변경 | 서버 상태를 갱신해 반영 가능 | 기존 토큰 클레임이 만료까지 남을 수 있음 |
| 여러 서버 | 공유 저장소 등의 운영 필요 | 검증 키와 검증 정책의 일관성 필요 |
| 클라이언트 보관 | 브라우저에서는 보통 쿠키 | 쿠키·메모리 등 별도로 설계 |
| 탈취 시 위험 | 식별자 재사용으로 사용자 사칭 | bearer 토큰 재사용으로 사용자 사칭 |

이 표는 대표 구성의 차이입니다. 매 요청 차단 목록이나 사용자 상태를 조회하는 JWT 시스템은 그 조회 비용도 갖습니다. 반대로 서버 세션도 캐시와 공유 저장소로 확장할 수 있습니다. 어느 쪽이 항상 더 빠르다고 단정할 수는 없습니다.

## 토큰을 훔치면 서명을 몰라도 사용할 수 있을까?

많은 인증 정보는 **소지한 사람이 사용할 수 있는 bearer 자격 증명**입니다. 공격자가 유효한 JWT 원문을 훔쳤다면, 토큰을 수정하거나 새로 서명할 필요 없이 그대로 재전송할 수 있습니다. 세션 쿠키도 비슷합니다.

즉, 변조 방지와 탈취 방지는 서로 다른 문제입니다. 주요 유출 경로를 나누어 보는 것이 도움이 됩니다.

| 경로 | 문제 | 대응 방향 |
| --- | --- | --- |
| XSS | 페이지에서 실행된 악성 스크립트가 읽을 수 있는 토큰 유출 | XSS 예방, 자바스크립트에 노출되는 자격 증명 최소화 |
| URL·로그 | 쿼리 문자열, 분석 도구, 요청 로그에 토큰 노출 | URL 전달 금지, 인증 헤더·쿠키 마스킹 |
| 전송 구간 | 평문 HTTP 등으로 인증 정보 노출 | HTTPS와 적절한 쿠키 속성 |
| 기기·확장 프로그램 침해 | 브라우저나 단말 수준에서 인증 정보 유출 | 세션 종료·재인증·이상 사용 탐지 |

TLS는 전송 구간을 보호하지만 저장소·로그·감염된 기기까지 보호하지는 않습니다. [OWASP JWT 안내](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html), [쿠키 탈취 대응](https://cheatsheetseries.owasp.org/cheatsheets/Cookie_Theft_Mitigation_Cheat_Sheet.html)

## 어디에 저장해야 할까?

### localStorage·sessionStorage

둘 다 같은 출처에서 실행되는 자바스크립트가 접근할 수 있습니다. `sessionStorage`의 수명이 더 짧다고 XSS 문제가 해결되지는 않습니다. 브라우저 인증 정보를 이 저장소에 보관하는 구성은 피하는 방향으로 설계합니다.

### HttpOnly 쿠키

`HttpOnly`는 자바스크립트가 쿠키 값을 직접 읽지 못하게 합니다. 다만 **XSS가 발생한 페이지에서 사용자의 권한으로 요청을 보내는 행위까지 막지는 못합니다.** 쿠키는 자동 전송되므로 CSRF 대응도 따로 필요합니다.

### 메모리와 BFF

메모리는 영구 저장을 줄이지만, 같은 페이지에서 실행되는 악성 코드에 대한 완전한 격리 경계는 아닙니다. BFF(Backend for Frontend)는 백엔드가 API 토큰을 보관하고 브라우저에는 세션 쿠키를 제공하는 구성입니다. 브라우저의 토큰 노출을 줄일 수 있지만 BFF 자체의 인증·권한·CSRF 처리가 중요합니다. [OWASP 세션 관리](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 쿠키 속성만으로 충분할까?

다음은 HTTPS 환경에서 사용할 수 있는 세션 쿠키 헤더 예시입니다.

```http
Set-Cookie: __Host-session=<opaque-random-session-id>; Path=/; Secure; HttpOnly; SameSite=Lax
```

- `Secure`: 보안 연결로 쿠키를 전송합니다.
- `HttpOnly`: 스크립트의 직접적인 쿠키 값 접근을 제한합니다.
- `SameSite=Lax`: 일부 교차 사이트 요청에서 쿠키 전송을 제한합니다. 모든 CSRF 상황을 막는 설정은 아닙니다.
- `__Host-`: 지원 브라우저에서 `Secure`, `Path=/`, `Domain` 미지정을 요구해 쿠키 범위를 제한합니다.

교차 사이트 사용을 위해 `SameSite=None`을 선택하면 `Secure`가 필요하며, 쿠키 전송을 허용하는 만큼 CSRF 설계를 더 주의해야 합니다. 외부 로그인 등 실제 흐름에 맞춰 속성을 선택합니다. [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)

CSRF는 반드시 토큰을 훔치는 공격은 아닙니다. 브라우저가 자격 증명을 자동으로 붙인다는 점을 이용해 원치 않는 요청을 보내게 할 수 있습니다. 상태 변경 요청에는 프레임워크의 CSRF 방어, CSRF 토큰, Origin 검증 등을 구성하고 GET으로 상태를 바꾸지 않습니다. CORS 설정만으로 CSRF를 해결했다고 판단하지 않습니다. [OWASP CSRF 예방](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

XSS는 출력 문맥에 맞는 인코딩, 안전한 DOM API, 필요한 HTML 정화로 예방합니다. CSP는 보조 방어로 사용하며, 입력 필터 하나나 HttpOnly만으로 해결했다고 보지 않습니다. [OWASP XSS 예방](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## 액세스 토큰과 리프레시 토큰을 나누는 이유

액세스 토큰의 유효 기간을 제한하면 탈취된 토큰이 사용될 수 있는 시간을 줄일 수 있습니다. 리프레시 토큰은 새 액세스 토큰 발급에 사용하므로 더 엄격하게 보관하고 폐기할 수 있어야 합니다. 둘 다 JWT여야 하는 것은 아닙니다.

리프레시 토큰 회전(rotation)은 갱신할 때 새 토큰을 발급하고 이전 토큰을 무효화하는 방식입니다.

<figure class="article-diagram">
<figcaption>구조 및 흐름 3</figcaption>
<ol>
<li>리프레시 R1 사용</li>
<li>R1 무효화 + R2 발급</li>
<li>사용된 R1이 다시 제출됨</li>
<li>재사용 탐지 → 연결된 갱신 권한 폐기·재인증</li>
</ol>
</figure>


재사용은 탈취 가능성을 알려주지만 어느 쪽이 공격자인지 자동으로 식별해 주지는 않습니다. 서버는 토큰 간 관계와 사용 상태를 관리해야 하며, 동시에 들어온 갱신 요청이 둘 다 성공하지 않도록 원자적 처리가 필요합니다. 정상적인 중복 요청·재시도도 고려해야 합니다.

OAuth의 공개 클라이언트에 리프레시 토큰을 발급한다면 RFC 9700은 sender-constrained 토큰 또는 회전을 요구합니다. 회전도 액세스 토큰의 즉시 폐기를 자동으로 수행하지는 않습니다. [RFC 9700 §4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14)

## 로그아웃과 탈취 발견 후의 처리

브라우저에서 토큰을 지우는 것만으로는 이미 복사된 토큰을 끊을 수 없습니다. 로그아웃 API는 해당 세션이나 갱신 권한을 서버에서도 무효화해야 합니다.

기존 JWT 액세스 토큰까지 즉시 차단해야 한다면 만료 시점까지 유지하는 `jti` 차단 목록, 사용자·세션 버전 확인, 서버 상태 조회 등의 방식을 검토합니다. 이 경우 저장소와 조회가 추가됩니다. 비밀번호 변경과 계정 정지 시 어떤 로그인들을 종료할지도 정책으로 정해야 합니다.

DPoP나 mTLS처럼 토큰을 클라이언트 키에 묶는 방법은 토큰 문자열만 훔친 공격자의 재사용을 줄이는 데 도움이 됩니다. 그러나 키까지 탈취되거나 실행 환경이 장악된 경우까지 해결하지는 못합니다. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html), [OWASP REST 보안](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)

## JWT 검증에서 놓치기 쉬운 부분

JWT 디코딩 성공은 인증 성공이 아닙니다. 검증 라이브러리를 사용해 서버가 허용한 알고리즘과 키로 서명을 검증하고, 서비스의 토큰 계약에 따라 다음을 확인합니다.

- 예상한 발급자 `iss`와 API 대상 `aud`인지
- 요구되는 만료 `exp`가 존재하고 유효한지, `nbf`가 있다면 사용 가능한 시각인지
- 다른 용도의 토큰을 잘못 받아들이지 않는지
- 사용자 상태와 요청한 자원에 대한 권한이 적절한지

토큰 헤더가 지정한 알고리즘이나 키 URL을 무조건 신뢰하면 안 됩니다. 서명된 역할 정보도 오래되었을 수 있으며, 인증 후에는 요청별 권한 검사가 필요합니다. [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725.html)

## 서비스에서는 무엇을 선택할까?

직접 운영하는 웹사이트라면 서버 세션과 안전한 쿠키 구성이 관리하기 쉬운 출발점이 될 수 있습니다. 브라우저와 여러 API를 연결한다면 BFF도 검토할 수 있습니다. 여러 서비스가 독립적으로 검증해야 하는 요구가 있다면 JWT가 유용할 수 있습니다.

선택할 때는 서버 개수보다 **강제 로그아웃의 즉시성, 권한 변경 반영, 클라이언트 종류, 토큰 보관 위치, 운영 복잡도**를 먼저 확인합니다. 어느 방식을 선택하더라도 탈취 예방과 유출 이후의 무효화는 함께 설계해야 합니다.

## 참고 자료

- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP JWT](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [RFC 8725 — JWT Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725.html)
- [RFC 9700 — OAuth 2.0 Security BCP](https://www.rfc-editor.org/rfc/rfc9700.html)
- [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
