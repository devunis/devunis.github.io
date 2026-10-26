---
title: "폴링·SSE·WebSocket 비교: 채팅과 AI 스트리밍에는 무엇을 쓸까?"
date: 2026-10-20 00:04:00 +0900
categories: [Backend, Network]
tags: [Polling, SSE, WebSocket, Streaming, HTTP, AI]
---

택배 상태 확인, 처리 진행률, 채팅, AI의 답변 표시. 모두 화면을 갱신하지만 같은 통신 방식이 필요한 것은 아닙니다. **얼마나 자주 바뀌는지, 어느 방향으로 보내는지, 끊긴 뒤 무엇을 복구해야 하는지**가 선택 기준입니다.

2026년 10월 20일 확인한 표준·MDN 자료를 바탕으로 폴링·SSE·WebSocket을 비교합니다. 아래 예제는 기존 서버가 있다고 가정한 클라이언트 코드이며 완성된 서비스 구현은 아닙니다.

## 먼저 세 방식의 흐름을 비교하자

<figure class="article-diagram diagram-alternatives">
<figcaption>누가 먼저 보내고, 연결을 어떻게 사용하는가</figcaption>
<ol><li>폴링: 클라이언트가 조회 → 응답 → 잠시 후 다시 조회</li><li>SSE: 클라이언트가 스트림 연결 → 서버가 이벤트를 이어서 전달</li><li>WebSocket: 연결 성립 → 클라이언트와 서버가 각각 메시지 전달</li></ol>
</figure>

| 기준 | 주기적 폴링 | SSE | WebSocket |
| --- | --- | --- | --- |
| 기본 형태 | 반복하는 HTTP 요청·응답 | HTTP 응답의 이벤트 스트림 | 지속 연결의 메시지 교환 |
| 주된 방향 | 조회 요청 후 응답 | 연결 후 서버 → 클라이언트 | 양방향 |
| 데이터 표현 | API 계약에 따라 결정 | UTF-8 텍스트 이벤트 | 텍스트·바이너리 |
| 재연결 | 애플리케이션에서 재조회 | EventSource가 재연결 지원 | 애플리케이션에서 재연결 설계 |
| 대표 용도 | 낮은 빈도의 상태 확인 | 알림·진행률·텍스트 스트림 | 빈번한 양방향 상호작용 |

표는 일반적인 브라우저 구성을 설명합니다. SSE도 클라이언트가 HTTP 요청을 보내 연결하며, 별도 HTTP API로 데이터를 보낼 수 있습니다. 서버 방향이라는 설명은 클라이언트가 어떤 데이터도 전송할 수 없다는 뜻이 아닙니다.

## 폴링: 단순한 반복 조회

새 이벤트가 있는지 정해진 간격으로 확인합니다. 변경이 드물고 허용 지연이 있다면 단순하고 관리하기 쉬운 선택일 수 있습니다. 하지만 변화가 없어도 요청은 발생합니다.

예를 들어 연결된 화면이 N개이고 간격이 T초라면, 모두 켜져 있다는 단순 가정에서 주기적 조회량은 대략 N/T회/초입니다. 이는 실제 서버 성능의 측정값이 아니라 요청량을 생각하기 위한 계산입니다.

```javascript
let stopped = false;
let timer;
const controller = new AbortController();

async function poll() {
  try {
    const response = await fetch("/api/job-status", {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log(await response.json());
  } catch (error) {
    if (error.name !== "AbortError") console.error(error);
  } finally {
    if (!stopped) timer = setTimeout(poll, 5000);
  }
}

function stopPolling() {
  stopped = true;
  clearTimeout(timer);
  controller.abort();
}

poll();
```

이 예시는 응답이 끝난 뒤 다음 조회를 예약해 요청이 겹치는 것을 피합니다. 실서비스에서는 요청 타임아웃, 실패 시 backoff, 화면 비활성·작업 완료 시 중단도 필요합니다. 예시의 5초는 보편적인 권장값이 아닙니다.

롱 폴링은 서버가 이벤트나 제한 시간까지 응답을 보류하고, 응답 후 클라이언트가 다시 요청하는 변형입니다. 단순 주기적 폴링과 SSE 사이를 무조건 일렬로 우열 비교할 수는 없습니다.

## SSE: HTTP로 이어 받는 이벤트

SSE(Server-Sent Events)는 `text/event-stream` 응답으로 이벤트를 전달합니다. 브라우저의 `EventSource`가 연결과 재연결을 다룹니다. 다음은 이벤트 본문의 예이며, 끝의 빈 줄이 메시지를 구분합니다.

```text
id: evt-7
event: progress
data: {"percent": 40}

```

클라이언트는 이름이 있는 이벤트를 구독할 수 있습니다.

```javascript
const events = new EventSource("/api/job-events");

events.addEventListener("progress", event => {
  const progress = JSON.parse(event.data);
  console.log(progress.percent);
});

events.onerror = () => {
  console.log("연결 상태 확인 필요");
};

// 더 이상 필요하지 않을 때 호출한다.
function stopEvents() {
  events.close();
}
```

`id`와 재연결 시의 `Last-Event-ID`는 복구 지점을 전달하는 데 활용할 수 있습니다. 하지만 서버가 기록·재생을 구현하지 않으면 누락 이벤트를 자동으로 복구해 주지는 않습니다. [WHATWG SSE 표준](https://html.spec.whatwg.org/multipage/server-sent-events.html)

프록시 버퍼링 때문에 서버가 보낸 조각이 화면에 늦게 도착할 수도 있습니다. 유휴 연결 제한·하트비트·서버의 전송 flush를 점검합니다. 기본 EventSource는 임의의 Authorization 헤더를 지정하는 옵션이 없으므로 쿠키 인증이나 fetch 기반 스트림 등 요구에 맞는 구성을 검토합니다. 인증 토큰을 URL에 넣는 우회는 로그 유출 위험이 있습니다. [MDN SSE 사용법](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)

## AI 스트리밍이면 무조건 EventSource일까?

아닙니다. 사용자 질문을 POST로 보내고 그 응답을 fetch의 스트림으로 읽는 구성도 가능합니다. 응답은 SSE 형식일 수도 있고 다른 청크 규약일 수도 있습니다.

**스트리밍은 데이터가 점진적으로 도착하는 동작이고, SSE는 그 데이터를 구분하는 특정 규약**입니다. 한 번의 네트워크 읽기가 정확히 한 이벤트에 해당하지 않으므로 부분 메시지를 버퍼에 모아 파싱해야 합니다. 서버의 토큰 생성, 프록시 전달, 브라우저 렌더링 지연도 구분합니다.

## WebSocket: 양쪽이 메시지를 보낸다

WebSocket은 연결 후 클라이언트와 서버가 독립적으로 메시지를 보낼 수 있습니다. 웹에서는 보안 연결인 `wss://`를 사용합니다. 기본 프로토콜의 핸드셰이크·프레임은 [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455.html)에 정의되어 있습니다.

```javascript
const url = new URL("/chat", location.href);
url.protocol = location.protocol === "https:" ? "wss:" : "ws:";
const socket = new WebSocket(url);

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "join", roomId: "room-3" }));
});
socket.addEventListener("message", event => {
  console.log(event.data);
});
```

이 예시는 접속과 메시지 송수신만 보여줍니다. 재연결, 구독 복구, 인증 갱신, 오류 처리와 서버 구현은 별도입니다. JSON 객체는 직접 직렬화한 것이며 WebSocket이 모든 메시지를 JSON으로 강제하지는 않습니다.

표준 브라우저 WebSocket API는 수신 속도를 자동 조절하는 backpressure 기능을 제공하지 않습니다. 느린 소비자에게 메시지가 쌓이지 않도록 큐·버퍼 한도와 전송 정책을 정해야 합니다. [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## 무엇을 선택하면 좋을까?

| 서비스 요구 | 먼저 검토할 후보 | 이유 |
| --- | --- | --- |
| 수십 초 단위로 갱신해도 되는 상태 | 폴링 | 연결·복구 흐름을 단순하게 구성 가능 |
| 서버의 진행 상황을 계속 표시 | SSE 또는 fetch 스트림 | 서버가 생성한 결과를 점진적으로 전달 |
| 채팅·공동 작업처럼 양방향 메시지가 빈번 | WebSocket | 지속적인 양방향 전송에 적합 |
| 사용자 입력은 드물고 서버 알림이 많음 | HTTP 전송 + SSE | 입력 API와 알림 채널을 분리 가능 |

이 표는 출발점이지 정답표는 아닙니다. 채팅도 HTTP 전송과 SSE 수신으로 구현할 수 있습니다. 반대로 WebSocket을 열었다고 읽음 처리나 영구 보관까지 구현되는 것은 아닙니다.

어떤 방식이든 연결이 끊긴 뒤의 구간을 설계해야 합니다. 메시지 ID·커서·중복 제거·권한 확인·재구독, 그리고 서버 재시작이나 여러 서버 사이의 전달을 생각해야 합니다. TCP가 현재 연결에서 순서를 보장하는 것과 재연결 이후의 애플리케이션 이력 복구는 다른 문제입니다.

## 함께 읽기

- [멱등성과 재시도]({% post_url 2026-10-20-idempotency-retries %})
- [동기·비동기와 블로킹·논블로킹]({% post_url 2026-10-20-sync-async-blocking-nonblocking %})
- [주소창에서 서버까지: OSI 7계층]({% post_url 2026-10-19-osi-seven-layers-web-request %})
