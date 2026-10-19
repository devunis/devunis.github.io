---
title: "주소창에서 서버까지: OSI 7계층으로 이해하는 웹 요청"
date: 2026-10-19 00:02:00 +0900
categories: [Backend, Network]
tags: [OSI, TCP-IP, DNS, TCP, TLS, HTTP, Network]
---

브라우저에 주소를 입력하면 서버의 화면이 나타납니다. 그 사이에는 이름 조회, 연결, 암호화, 데이터 전달, 응답 처리가 있습니다. **OSI 7계층은 이 과정을 역할별로 나누어 생각하는 도구**입니다.

계층 이름만 외우기보다 `https://example.com/`을 여는 과정을 따라가 보겠습니다. 먼저 HTTP/1.1·HTTP/2의 일반적인 TCP 기반 HTTPS 연결을 설명하고, HTTP/3의 차이도 살펴봅니다. 실제 특정 서비스의 패킷을 측정한 기록은 아닙니다.

## OSI는 인터넷이 반드시 그대로 구현하는 설계도가 아니다

OSI(Open Systems Interconnection)는 통신 기능을 일곱 계층으로 구분하는 참조 모델입니다. 각 계층은 아래 계층의 서비스를 활용해 위 계층에 기능을 제공합니다. 표준의 기본 모델은 [ITU-T X.200](https://www.itu.int/rec/T-REC-X.200-199407-I/en)에 정의되어 있습니다.

실제 인터넷 프로토콜은 보통 TCP/IP 구조로 설명합니다. OSI와 TCP/IP를 일대일로 끼워 맞추기보다, **지금 이야기하는 기능이 무엇인지**를 이해하는 편이 유용합니다.

| OSI 계층 | 핵심 역할 | 이해를 위한 예 |
| --- | --- | --- |
| 7. 응용(Application) | 응용 프로그램에 필요한 통신 규약 | HTTP, DNS |
| 6. 표현(Presentation) | 데이터 표현과 변환 | 인코딩·직렬화·암호화 같은 기능 |
| 5. 세션(Session) | 통신 대화의 조직·동기화 | 대화 제어·체크포인트 같은 기능 |
| 4. 전송(Transport) | 종단 간 데이터 전송 | TCP, UDP |
| 3. 네트워크(Network) | 서로 다른 네트워크 사이의 전달 | IP, 라우팅 |
| 2. 데이터 링크(Data Link) | 인접한 링크에서 프레임 전달 | Ethernet, Wi-Fi의 링크 기능 |
| 1. 물리(Physical) | 신호로 비트 전달 | 전기·광·무선 신호 |

표의 기능 예시는 실제 프로토콜을 유일한 한 계층에 고정한다는 뜻은 아닙니다. 예를 들어 Wi-Fi는 물리와 데이터 링크 기능을 모두 포함합니다.

## TCP/IP에서는 어떻게 묶을까?

TCP/IP는 응용·전송·인터넷·링크의 네 계층으로 흔히 설명합니다. 링크를 데이터 링크와 물리로 나눠 다섯 계층으로 가르치는 자료도 있습니다.

| TCP/IP의 구분 | OSI와 대략 대응하는 범위 |
| --- | --- |
| 응용 | 응용·표현·세션에 해당하는 기능 |
| 전송 | 전송 |
| 인터넷 | 네트워크 |
| 링크 | 데이터 링크·물리 |

TCP/IP 설명에서는 표현·세션 기능을 별도 계층으로 분리하지 않는 경우가 많습니다. 인터넷 호스트의 계층 구조는 [RFC 1122 §1.1.3](https://www.rfc-editor.org/rfc/rfc1122.html#section-1.1.3)에서 확인할 수 있습니다.

## 1. 주소를 해석하고 DNS로 목적지를 찾는다

`https://example.com/`에서 `https`는 스킴, `example.com`은 호스트 이름, `/`는 경로입니다. HTTPS의 기본 포트는 443입니다.

브라우저는 연결할 주소가 필요합니다. DNS는 이름에 관한 정보를 조회하는 체계이며, A·AAAA 레코드는 각각 IPv4·IPv6 주소를 제공합니다. 이때 얻는 주소는 원본 애플리케이션 서버가 아니라 CDN이나 프록시의 주소일 수도 있습니다.

캐시에 유효한 결과가 있으면 조회 일부를 생략할 수 있습니다. 캐시가 없다면 재귀 리졸버가 필요한 이름 서버를 찾아 조회합니다. 브라우저가 항상 루트부터 모든 서버를 직접 방문하는 구조는 아닙니다. [DNS 개념 RFC 1034](https://www.rfc-editor.org/rfc/rfc1034)

DNS는 응용 계층 프로토콜입니다. UDP·TCP 또는 암호화된 전송 방식을 이용할 수 있습니다. **IP 주소를 알려준다고 DNS 자체가 네트워크 계층인 것은 아닙니다.** DNS 요청도 하위 계층을 이용해 전달됩니다.

## 2. TCP로 연결하고 TLS로 보호한다

TCP 기반 HTTPS에서는 새 TCP 연결을 만들 때 일반적으로 다음 과정을 거칩니다.

<figure class="article-diagram sequence-diagram">
<figcaption>TCP 연결의 세 번의 메시지</figcaption>
<div class="sequence-actors"><span>클라이언트</span><span>서버</span></div>
<ol>
<li><span class="message-name">SYN</span><span class="message-detail">연결 요청</span></li>
<li class="message-return"><span class="message-name">SYN + ACK</span><span class="message-detail">요청 확인 + 연결 요청</span></li>
<li><span class="message-name">ACK</span><span class="message-detail">확인 응답</span></li>
</ol>
<p class="diagram-note">화살표는 메시지의 전달 방향을 나타냅니다.</p>
</figure>


TCP는 순서가 있는 신뢰성 있는 바이트 스트림을 제공합니다. 손실에 대한 재전송, 흐름 제어, 혼잡 제어 등이 여기에 포함됩니다. 다만 연결이 영원히 성공한다거나, 요청이 애플리케이션에서 처리되었다는 사실까지 보장하지는 않습니다. TCP ACK는 주문 저장 완료 확인서가 아닙니다. [TCP RFC 9293](https://www.rfc-editor.org/rfc/rfc9293.html)

이후 TLS 협상으로 서버 인증과 통신 보호에 필요한 키 설정 등을 수행합니다. 브라우저는 인증서의 신뢰 관계와 호스트 이름 등을 검증합니다. 연결 재사용·세션 재개에 따라 과정은 달라지며, TLS의 왕복 횟수를 모든 버전에 동일하게 적용해서는 안 됩니다. [TLS 1.3 RFC 8446](https://www.rfc-editor.org/rfc/rfc8446)

TLS를 표현 계층과 연결해 설명할 수는 있지만, “TLS는 언제나 OSI 6계층에만 존재한다”라고 외우면 실제 구성을 놓치기 쉽습니다. TCP 기반 HTTPS에서는 HTTP와 TCP 사이의 보호 기능으로 이해하면 됩니다.

## 3. HTTP 요청이 하위 계층에 실려 이동한다

설명을 위해 HTTP/1.1 형태로 표현하면 요청은 다음과 같습니다. HTTP/2·3의 실제 전송 형식은 이 텍스트와 다릅니다.

```http
GET / HTTP/1.1
Host: example.com
```

TCP 기반 HTTPS에서 데이터가 싸이는 모습을 단순화하면 다음과 같습니다.

<figure class="article-diagram layer-diagram">
<figcaption>요청이 전송 신호가 되기까지</figcaption>
<ol>
<li>HTTP 요청</li>
<li>TLS 레코드: 암호화·보호</li>
<li>TCP 세그먼트: 바이트 스트림 전달</li>
<li>IP 패킷: 네트워크 전달</li>
<li>링크 프레임: 현재 링크 전달</li>
<li>물리 신호</li>
</ol>
</figure>


이를 **캡슐화**라고 합니다. 받는 쪽은 각 프로토콜의 정보를 처리하며 위쪽 기능으로 데이터를 전달합니다.

HTTP 요청 하나, TLS 레코드 하나, TCP 세그먼트 하나가 반드시 일대일 대응하는 것은 아닙니다. 하나의 요청이 여러 세그먼트로 나뉠 수 있고, TCP에서 애플리케이션 메시지의 경계가 그대로 보존되는 것도 아닙니다.

서버가 다른 네트워크에 있다면 내 장치는 보통 다음 홉인 기본 게이트웨이로 프레임을 보냅니다. IPv4의 ARP나 IPv6의 Neighbor Discovery는 같은 링크의 다음 홉을 찾는 데 관여합니다. 멀리 있는 서버의 MAC 주소를 인터넷 끝까지 그대로 들고 가는 구조가 아닙니다.

## 4. 스위치·라우터·로드밸런서를 지난다

장비 이름과 계층을 연결하면 흐름을 이해하기 쉽지만, 실제 장비는 여러 기능을 수행할 수 있습니다.

| 구성 요소 | 주로 살펴보는 정보 | 역할 |
| --- | --- | --- |
| L2 스위치 | MAC 주소와 VLAN 등 | 링크 영역에서 프레임 전달 |
| 라우터 | 목적지 IP와 라우팅 정보 | 다음 네트워크로 패킷 전달 |
| L4 로드밸런서 | 주소·포트·연결 정보 등 | 전송 흐름 단위의 분산 |
| L7 프록시·로드밸런서 | HTTP 호스트·경로·헤더 등 | 응용 요청 기준의 라우팅 |

라우터가 패킷을 다른 링크로 전달할 때 링크 캡슐화도 바뀝니다. L7 프록시는 클라이언트 연결을 받아 별도의 서버 연결로 요청을 전달할 수 있습니다. TLS를 프록시에서 종료한다면 프록시 이후 구간을 어떻게 보호할지도 별도로 설계해야 합니다.

“로드밸런서가 있으니 L4”처럼 장비 이름만으로 기능을 단정하지 않는 것이 좋습니다.

## 5. 응답을 받은 뒤에는 브라우저의 일이 남는다

서버나 중간 캐시는 HTTP 상태·헤더·본문을 반환합니다. HTML을 받았다고 화면 구성이 모두 끝나는 것은 아닙니다. 브라우저는 문서를 해석하고 CSS·이미지·스크립트 같은 자원을 요청하며 레이아웃과 그리기를 수행합니다.

따라서 화면이 느린 원인은 연결 지연일 수도, 서버 처리일 수도, 큰 이미지나 자바스크립트 실행일 수도 있습니다. **네트워크 응답 시간과 화면 렌더링 시간을 나누어 관찰**해야 합니다. [MDN 브라우저 동작 설명](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)

## HTTP/3에서는 TCP가 빠진다

지금까지의 TCP 연결 설명을 모든 HTTPS에 적용하면 안 됩니다. HTTP/3는 QUIC를 사용하고, QUIC는 UDP 위에서 동작하며 TLS 1.3을 통합합니다.

<figure class="article-diagram protocol-diagram">
<figcaption>HTTP 버전별 전송 구조</figcaption>
<div class="protocol-columns">
<div><h4>HTTP/1.1 · HTTP/2</h4><p class="protocol-context">일반적인 HTTPS 구성</p><ol><li>HTTP</li><li>TLS</li><li>TCP</li><li>IP</li></ol></div>
<div><h4>HTTP/3</h4><p class="protocol-context">QUIC에 TLS 1.3 통합</p><ol><li>HTTP</li><li>QUIC</li><li>UDP</li><li>IP</li></ol></div>
</div>
</figure>


UDP를 쓴다고 HTTP/3가 신뢰성 없는 웹 요청이 되는 것은 아닙니다. QUIC가 신뢰성 있는 스트림과 혼잡 제어 등 필요한 기능을 제공합니다. OSI의 기능 구분과 실제 프로토콜 경계를 동일하게 볼 수 없다는 좋은 예입니다. [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)

## 장애를 볼 때는 어디부터 확인할까?

계층은 장애의 범위를 좁히는 질문 목록으로 쓸 수 있습니다. 다만 **증상 하나로 특정 계층의 고장이라고 확정하면 안 됩니다.**

| 증상 | 우선 확인할 지점 | 바로 단정하면 안 되는 것 |
| --- | --- | --- |
| 이름을 찾지 못함 | DNS 응답, 캐시, 리졸버 설정 | 웹 서버가 반드시 꺼졌다는 결론 |
| 연결 시간 초과 | 주소·경로·방화벽·포트·서버 상태 | TCP 코드만의 문제라는 결론 |
| 인증서 오류 | 호스트 이름, 만료, 신뢰 체인, 기기 시각 | HTTP 핸들러의 오류라는 결론 |
| 502 Bad Gateway | 프록시와 업스트림 사이의 통신·응답 | 라우터가 고장 났다는 결론 |
| 504 Gateway Timeout | 프록시가 기다린 업스트림의 지연·연결 | 원본 서버의 CPU만 문제라는 결론 |
| 200인데 화면이 이상함 | 응답 내용, 추가 자원, 콘솔, 렌더링 | 네트워크 전체가 정상이라는 결론 |

502는 게이트웨이·프록시가 요청 처리 중 업스트림에서 유효하지 않은 응답을 받은 상황, 504는 필요한 응답을 제때 받지 못한 상황을 나타냅니다. 정확한 원인은 해당 구성의 로그·지표로 확인해야 합니다. [HTTP 상태 코드 RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.6)

## OSI의 세션 계층은 로그인 세션일까?

이전 글에서 다룬 서버 로그인 세션은 보통 응용 프로그램이 관리하는 인증 상태입니다. 이름에 세션이 들어간다고 자동으로 OSI 5계층에 해당하지 않습니다.

[세션 vs JWT 인증 글]({% post_url 2026-10-19-session-vs-jwt-token-security %})에서 다룬 쿠키·토큰은 HTTP를 이용하는 로그인 설계와 연결됩니다. 계층 이름과 라이브러리·서비스 용어가 같은 단어를 쓴다고 동일한 개념은 아닙니다.

OSI를 배울 때 중요한 질문은 “이 기술은 몇 계층인가?”에 머물지 않습니다. **지금 필요한 기능은 무엇이고, 어느 구간까지 성공했으며, 다음에 무엇을 확인할 것인가?**라는 질문으로 이어질 때 개발과 운영에 도움이 됩니다.

## 참고 자료

- [ITU-T X.200 — OSI 기본 참조 모델](https://www.itu.int/rec/T-REC-X.200-199407-I/en)
- [RFC 1122 — 인터넷 호스트의 통신 계층](https://www.rfc-editor.org/rfc/rfc1122.html)
- [RFC 1034 — DNS 개념](https://www.rfc-editor.org/rfc/rfc1034)
- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [RFC 9110 — HTTP 의미와 상태 코드](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9114 — HTTP/3](https://www.rfc-editor.org/rfc/rfc9114)
- [MDN — 브라우저는 어떻게 동작하는가](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)
