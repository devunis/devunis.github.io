---
title: "IPC·RPC·gRPC·JSON-RPC 비교: 프로세스 통신에서 원격 호출까지"
date: 2026-10-20 00:01:00 +0900
categories: [Backend, Network]
tags: [IPC, RPC, gRPC, JSON-RPC, Protobuf, MCP]
---

프로세스끼리 데이터를 주고받는 IPC, 다른 곳의 함수를 부르는 RPC, 그리고 gRPC와 JSON-RPC. 이름이 비슷하지만 **서로 다른 범위의 개념**입니다. 이 차이를 먼저 구분하면 “어떤 방식이 더 좋은가?”라는 질문도 구체적으로 바뀝니다.

이 글은 2026년 10월 20일 확인한 공식 문서와 명세를 바탕으로 정리했습니다. 예제는 개념 설명용이며 서비스 성능을 측정한 결과는 아닙니다.

## 네 가지 용어의 관계

| 용어 | 무엇인가? | 핵심 질문 |
| --- | --- | --- |
| IPC | 프로세스 간 통신이라는 넓은 개념 | 프로세스들이 어떻게 정보를 교환할까? |
| RPC | 다른 실행 주체의 작업을 호출·응답으로 표현하는 방식 | 저쪽의 작업을 함수 호출처럼 요청할까? |
| gRPC | 서비스 계약·코드 생성·전송 등을 제공하는 RPC 프레임워크 | 여러 언어의 서비스를 어떤 계약으로 연결할까? |
| JSON-RPC | JSON 기반의 RPC 메시지 규약 | 호출·결과·오류를 어떤 JSON 형태로 주고받을까? |

IPC를 모든 통신의 최상위 분류로 쓰는 넓은 설명도 있고, 운영체제 문맥에서 **같은 호스트의 로컬 통신**을 가리키는 설명도 있습니다. 이 글에서는 로컬 IPC와 네트워크 RPC를 구분하되, RPC도 로컬에서 동작할 수 있다는 점을 함께 봅니다.

<figure class="article-diagram diagram-alternatives">
<figcaption>통신 수단과 호출 규약은 서로 다른 축</figcaption>
<ol>
<li>통신 수단: 파이프 · 공유 메모리 · Unix 도메인 소켓 · 네트워크 소켓</li>
<li>상호작용: 호출과 응답 · 이벤트 전달 · 공유 데이터 접근</li>
<li>RPC의 구체적 선택: gRPC · JSON-RPC 등</li>
</ol>
</figure>

## IPC: 다른 프로세스와 정보를 교환한다

프로세스의 메모리 공간은 일반적으로 분리되어 있습니다. 한 프로세스의 변수를 다른 프로세스가 그대로 읽는 대신 운영체제가 제공하는 통신 수단을 사용합니다.

| 수단 | 특징 | 고려할 점 |
| --- | --- | --- |
| 파이프 | 바이트 흐름 전달, 셸 파이프 등이 대표적 | 메시지 경계·버퍼·종료 처리 |
| 메시지 큐 | 메시지 단위 교환 | 큐 용량·처리 순서·대기 정책 |
| 공유 메모리 | 여러 프로세스가 공유 영역 접근 | 동기화·수명·경쟁 상태 |
| Unix 도메인 소켓 | 같은 머신의 프로세스 사이 소켓 통신 | 접근 권한·소켓 수명·메시지 구성 |
| 시그널 | 프로세스에 사건을 알리는 알림 | 대량 데이터 전달에는 부적합 |

Unix 도메인 소켓은 스트림·데이터그램 등의 형태를 지원합니다. 파일 경로를 주소로 쓰더라도 일반 파일에 데이터를 쓰고 상대가 읽는 방식과는 다릅니다. [Linux unix(7)](https://man7.org/linux/man-pages/man7/unix.7.html)

공유 메모리가 모든 상황에서 가장 빠른 것도 아닙니다. 데이터 복사뿐 아니라 동기화·경합·메시지 크기·구현 비용을 함께 측정해야 합니다.

## RPC: 저쪽의 작업을 호출한다

RPC(Remote Procedure Call)는 호출할 작업과 인자를 보내고 결과나 오류를 받는 모델입니다. ONC RPC를 정의한 [RFC 5531](https://www.rfc-editor.org/rfc/rfc5531.html)은 구체적인 RPC 프로토콜의 한 예이며, 모든 RPC가 이 프로토콜을 사용하는 것은 아닙니다.

<figure class="article-diagram">
<figcaption>호출은 간단해 보여도 경계를 건넌다</figcaption>
<ol>
<li>호출자: GetUser(userId) 요청</li>
<li>클라이언트: 요청 데이터를 직렬화하고 전송</li>
<li>서버: 역직렬화·검증 후 작업 실행</li>
<li>서버: 결과 또는 오류를 직렬화해 반환</li>
<li>호출자: 결과를 받거나 타임아웃·실패 처리</li>
</ol>
</figure>

로컬 함수처럼 보이는 API라도 네트워크 호출에는 지연, 연결 단절, 부분 실패가 있습니다. 응답을 받지 못했다고 서버가 실행하지 않은 것은 아닙니다. 결제가 끝난 뒤 응답만 유실되었을 수도 있습니다. 재시도를 설계할 때는 **중복 실행과 멱등성**을 고려해야 합니다.

## gRPC: 계약을 정의하고 코드를 생성한다

gRPC는 보통 Protocol Buffers(Protobuf)로 메시지와 서비스를 정의하고 클라이언트·서버 코드를 생성합니다. Protocol Buffers는 데이터 표현·직렬화 기술이며, gRPC 자체와 동일하지 않습니다. gRPC는 기본적으로 이를 사용하지만 다른 직렬화 방식도 사용할 수 있습니다. [gRPC 소개](https://grpc.io/docs/what-is-grpc/introduction/)

예를 들어 사용자 조회 계약을 다음처럼 작성할 수 있습니다.

```protobuf
syntax = "proto3";
package account;

service ProfileService {
  rpc GetProfile (ProfileRequest) returns (ProfileReply);
}

message ProfileRequest {
  string profile_id = 1;
}

message ProfileReply {
  string profile_id = 1;
  string display_name = 2;
}
```

이것은 계약 예시입니다. 실제 실행에는 코드 생성 도구, 서버 구현, 실행·연결 설정 등이 필요합니다. 메시지 필드 번호도 계약의 일부이므로 변경 시 호환성을 관리해야 합니다.

### 요청·응답 하나만 주고받는 것은 아니다

| 호출 형태 | 데이터 흐름 | 예시 |
| --- | --- | --- |
| Unary | 요청 1개 → 응답 1개 | 사용자 조회 |
| Server streaming | 요청 1개 → 여러 응답 | 처리 진행 상황 전달 |
| Client streaming | 여러 요청 → 응답 1개 | 데이터 묶음을 전송하고 결과 수신 |
| Bidirectional streaming | 양쪽이 스트림으로 메시지 전달 | 지속적인 양방향 상호작용 |

gRPC의 일반적인 전송은 HTTP/2를 기반으로 합니다. 스트리밍, 메타데이터, 상태 코드, 취소 등의 기능을 제공하지만 실제 지원 범위와 API는 언어·구현에 따라 확인해야 합니다. [gRPC 핵심 개념](https://grpc.io/docs/what-is-grpc/core-concepts/)

브라우저에서는 일반 서버용 gRPC 클라이언트를 그대로 쓰는 것과 조건이 다릅니다. gRPC-Web 같은 구성을 검토하며 프록시와 지원되는 스트리밍 범위도 확인합니다. 공식 웹 예제는 Envoy로 브라우저 요청을 백엔드에 전달합니다. [gRPC-Web 안내](https://grpc.io/docs/platforms/web/basics/)

## JSON-RPC: 호출 규약을 JSON으로 표현한다

JSON-RPC는 최근에 생긴 기술이 아닙니다. 2.0 명세에는 2010년 원본과 2013년 갱신 날짜가 기재되어 있습니다. 핵심은 `method`·`params`로 작업을 요청하고 `id`로 응답을 연결하는 것입니다. HTTP에 묶이지 않는 규약입니다. [JSON-RPC 2.0 명세](https://www.jsonrpc.org/specification)

다음은 이 글에서 만든 요청 예시입니다.

```json
{
  "jsonrpc": "2.0",
  "method": "profile.get",
  "params": { "profileId": "p-27" },
  "id": "call-8"
}
```

성공 응답입니다.

```json
{
  "jsonrpc": "2.0",
  "result": { "profileId": "p-27", "displayName": "Jungyun" },
  "id": "call-8"
}
```

실패 응답은 `result` 대신 `error`를 사용합니다. 둘을 함께 넣지 않습니다.

```json
{
  "jsonrpc": "2.0",
  "error": { "code": -32601, "message": "Unknown profile method" },
  "id": "call-8"
}
```

`id`가 없는 알림(notification)에는 JSON-RPC 응답을 보내지 않습니다. 배치 응답은 요청 순서와 다를 수 있으므로 `id`로 연결합니다. 배치 지원이나 전송 방식은 상위 프로토콜의 제약도 확인해야 합니다.

**JSON으로 된 HTTP API라고 모두 JSON-RPC는 아닙니다.** 위 메시지 규칙을 따라야 하며, JSON-RPC 자체가 애플리케이션별 입력 스키마·인증·권한을 모두 정의하지도 않습니다.

## 요즘 JSON-RPC가 다시 보이는 이유: MCP와 LSP

AI 도구 연결에서 접하는 MCP는 JSON-RPC 메시지를 기반으로 상호작용을 정의합니다. 하지만 MCP에는 초기화·기능 협상·도구와 리소스 등의 추가 규칙이 있습니다. 임의의 JSON-RPC 서버가 곧 MCP 서버가 되는 것은 아닙니다. [MCP 기본 구조 명세](https://modelcontextprotocol.io/specification/2025-11-25/basic)

에디터와 언어 서버를 연결하는 LSP(Language Server Protocol) 역시 JSON-RPC를 사용합니다. 언어 서버가 별도 프로세스로 실행되는 구성은 **로컬 프로세스 통신과 RPC 메시지 규약을 함께 사용하는 예**입니다. [VS Code 언어 서버 가이드](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)

이런 생태계를 통해 이름을 자주 접할 수 있지만, 이를 근거 없이 시장 점유율이나 성능 우위로 해석하지는 않습니다.

## gRPC와 JSON-RPC 비교

| 기준 | gRPC의 대표 구성 | JSON-RPC 2.0 |
| --- | --- | --- |
| 성격 | RPC 프레임워크·생태계 | RPC 메시지 규약 |
| 데이터 | 기본적으로 Protobuf | JSON |
| 계약·코드 생성 | 서비스 정의와 생성 도구 제공 | 별도 스키마·도구를 조합할 수 있음 |
| 전송 | 일반적으로 HTTP/2 | 특정 전송에 종속되지 않음 |
| 스트리밍 | 네 가지 호출 형태 제공 | 기본 명세에 gRPC식 스트리밍 모델 없음 |
| 읽고 확인하기 | 도구를 활용하는 바이너리 메시지 | 텍스트로 확인하기 쉬운 메시지 |
| 운영 고려 | HTTP/2·프록시·계약 호환성 | 스키마·메시지 경계·인증 등을 추가 설계 |

어느 쪽이 무조건 빠르다는 결론은 낼 수 없습니다. 메시지 크기, 직렬화 비용, 네트워크, 연결 재사용, 서버 처리와 도구 지원을 함께 비교해야 합니다.

## REST와는 어떤 차이가 있을까?

REST는 자원과 표현, 통일된 인터페이스 등을 중심으로 하는 아키텍처 스타일이고, RPC는 작업 호출을 중심으로 이해할 수 있습니다. 같은 조회를 단순화하면 자원 중심 HTTP API는 `GET /profiles/p-27`, RPC는 `GetProfile(profileId)`처럼 표현할 수 있습니다.

RPC도 HTTP로 전달할 수 있으므로 “REST는 HTTP, RPC는 별도 네트워크”라는 구분은 맞지 않습니다. 메서드 이름과 URL 모양만으로 REST의 모든 제약을 충족하는지도 결정할 수 없습니다.

## 도입 전에 확인할 운영 문제

- **기한과 취소:** 무한 대기를 피하고 호출별 기한을 설정합니다. gRPC는 기본적으로 기한을 설정하지 않으므로 클라이언트에서 적절히 구성해야 합니다. 취소 후 서버 작업의 정리도 고려합니다. [gRPC Deadlines](https://grpc.io/docs/guides/deadlines/)
- **재시도:** 타임아웃은 미실행 증거가 아닙니다. 주문·결제 같은 작업에는 중복 방지 키와 저장소 처리 정책이 필요할 수 있습니다.
- **경계와 권한:** 원격 메서드가 존재한다는 사실은 호출 권한을 뜻하지 않습니다. 메서드·입력·대상 자원의 권한을 확인합니다.
- **메시지 한계:** 입력 크기·배치 개수·동시 요청·스트림 버퍼를 제한합니다. 느린 소비자를 어떻게 다룰지도 정합니다.
- **관찰 가능성:** 호출 이름·상태·지연·추적 정보를 남기되 인증 정보와 민감한 인자는 로그에서 보호합니다.

같은 머신의 두 프로세스를 연결한다면 먼저 로컬 IPC 수단을 살펴볼 수 있습니다. 여러 언어의 서비스가 명확한 계약과 스트리밍을 필요로 한다면 gRPC가 후보가 됩니다. JSON 메시지 기반 호출이나 MCP·LSP 연동이 목적이라면 JSON-RPC와 해당 상위 명세를 함께 확인합니다. **통신 범위, 상호작용, 계약, 전송을 각각 결정하는 것**이 출발점입니다.

## 관련 글·참고 자료

- [주소창에서 서버까지: OSI 7계층]({% post_url 2026-10-19-osi-seven-layers-web-request %})
- [스킬·MCP·툴·커넥터 개념 정리]({% post_url 2026-10-15-skills-mcp-tools-connectors %})
- [Linux unix(7)](https://man7.org/linux/man-pages/man7/unix.7.html)
- [RFC 5531 — ONC RPC](https://www.rfc-editor.org/rfc/rfc5531.html)
- [gRPC 공식 문서](https://grpc.io/docs/what-is-grpc/core-concepts/)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
