---
title: "동기·비동기와 블로킹·논블로킹: 헷갈리는 두 기준 구분하기"
date: 2026-10-20 00:03:00 +0900
categories: [Backend, Concurrency]
tags: [Sync, Async, Blocking, Nonblocking, Event-Loop, Python]
---

“비동기로 호출했으니 스레드는 막히지 않겠지?” async 함수 안에 동기 I/O가 들어 있다면 그렇지 않을 수 있습니다. **작업 완료를 다루는 방식과 실행 주체가 기다리는 방식**을 나누어 봐야 합니다.

용어의 세부 의미는 운영체제·언어·API마다 다릅니다. 이 글에서는 2026년 10월 20일 확인한 문서를 바탕으로, 블로킹 여부는 호출한 스레드의 관점에서, 동기·비동기는 작업 완료를 관찰하는 인터페이스의 관점에서 설명합니다.

## 두 가지 질문부터 하자

| 기준 | 질문 | 구분 |
| --- | --- | --- |
| 블로킹 여부 | 이 호출이 준비·완료를 기다리는 동안 스레드를 붙잡는가? | 블로킹 / 논블로킹 |
| 완료 처리 | 호출 반환과 완료 결과가 어떻게 연결되는가? | 동기 / 비동기 |

동기 API에서는 반환값·오류로 그 호출의 결과를 확인하는 경우가 일반적입니다. 비동기 API에서는 작업을 시작·예약하고 나중에 Future·콜백·이벤트 등으로 완료를 확인할 수 있습니다.

다만 “동기는 항상 블로킹, 비동기는 항상 논블로킹”이라는 공식은 피하는 것이 좋습니다. Future를 받은 뒤 즉시 블로킹 대기를 할 수도 있고, 논블로킹 읽기를 반복해 결과를 확인할 수도 있습니다.

## 무엇이 기다리는지 명확히 구분한다

<figure class="article-diagram diagram-alternatives">
<figcaption>작업의 대기와 스레드의 대기는 다르다</figcaption>
<ol><li>블로킹 호출: 스레드가 I/O를 기다림 → 반환 후 다음 작업</li><li>협력적 비동기: 태스크가 기다림 → 이벤트 루프가 다른 준비된 태스크 실행</li><li>논블로킹 소켓: 준비되지 않았다면 즉시 반환 → 준비 알림 후 다시 읽기</li></ol>
</figure>

논블로킹 `read`가 “아직 데이터가 없다”는 결과로 반환하는 것은 전체 읽기 작업의 완료와 다릅니다. 준비 상태 알림을 받는 epoll도 그 자체가 모든 데이터를 읽어 주는 완료 통지는 아닙니다. 특히 edge-triggered 사용에는 논블로킹 처리와 재읽기 규칙이 중요합니다. [Linux epoll(7)](https://man7.org/linux/man-pages/man7/epoll.7.html)

반면 POSIX AIO는 비동기 작업 제출과 상태·결과 확인 API를 제공합니다. 커널·라이브러리 구현까지 동일하다고 가정할 수는 없습니다. [Linux aio(7)](https://man7.org/linux/man-pages/man7/aio.7.html)

## async라는 문법이 모든 내부 호출을 바꾸지는 않는다

Python에서 다음 함수는 async로 선언되어 있지만 `time.sleep`은 호출한 스레드를 멈추게 합니다.

```python
import time

async def blocks_event_loop():
    # 의도적으로 보여주는 나쁜 예: 이벤트 루프 스레드가 대기한다.
    time.sleep(0.05)
```

이벤트 루프 스레드가 막히면 그 루프 위의 다른 태스크도 진행하기 어렵습니다. Node.js의 동기 파일 API 역시 이벤트 루프 관점에서 블로킹 동작을 합니다. 비동기 작업이 모두 새 스레드에서 처리된다는 설명도 정확하지 않습니다. [Node.js 블로킹·논블로킹 설명](https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking)

Python에서는 대기 중 양보하는 API를 사용하거나, 적절한 동기 I/O를 `asyncio.to_thread` 같은 수단으로 루프 밖에 보낼 수 있습니다. 스레드 풀의 자원 한계와 취소 후 작업 지속 가능성도 고려해야 합니다.

## await를 연속해서 쓰면 순차 실행이다

다음은 네트워크 대신 짧은 대기를 사용하는 실행 모형입니다. 외부 서버를 호출하지 않으며 고정된 속도 향상을 주장하지 않습니다. Python 3.9 이상에서 실행할 수 있습니다.

```python
import asyncio

async def load(label):
    print("시작", label)
    await asyncio.sleep(0.02)
    print("완료", label)
    return label

async def main():
    # A의 완료를 기다린 후 B를 시작한다.
    sequential = [await load("A"), await load("B")]

    # 독립된 작업을 함께 스케줄링한다.
    concurrent = await asyncio.gather(load("C"), load("D"))

    assert sequential == ["A", "B"]
    assert concurrent == ["C", "D"]

if __name__ == "__main__":
    asyncio.run(main())
```

첫 부분은 A가 끝나야 B가 시작됩니다. 두 번째 부분은 C·D가 함께 스케줄링되어 대기 구간을 겹칠 수 있습니다. 이것이 CPU 명령을 두 코어에서 동시에 계산한다는 뜻은 아닙니다. `await`는 현재 코루틴을 일시 중단할 수 있는 지점이며, 대상이 이미 완료되었다면 실제로 대기하지 않을 수도 있습니다. [Python 코루틴·태스크](https://docs.python.org/3/library/asyncio-task.html)

## 동시성과 병렬성도 나누어 보자

| 개념 | 초점 | 예 |
| --- | --- | --- |
| 동시성 | 여러 작업의 진행을 겹쳐 관리 | 한 이벤트 루프가 I/O 대기 사이에 태스크 전환 |
| 병렬성 | 같은 시점에 실제 연산 수행 | 여러 코어·프로세스가 계산 수행 |

비동기는 I/O 대기 시간 활용에 도움이 될 수 있지만 계산량 자체를 줄여 주지는 않습니다. 오래 걸리는 계산은 실행 환경에 맞춰 프로세스·작업 큐·별도 연산 서비스 등을 검토할 수 있습니다.

## 실제 설계에서는 확인할 것이 더 있다

- **의존성:** B가 A의 결과를 필요로 하면 무조건 동시에 실행할 수 없습니다.
- **동시 실행 한도:** 무제한 생성 대신 연결 풀·세마포어·큐로 자원을 제한합니다.
- **오류와 취소:** 한 작업 실패 시 다른 작업을 어떻게 정리할지 확인합니다.
- **대기 위치:** 이벤트 루프인지, 요청 스레드인지, 작업 풀인지 구분합니다.
- **관찰:** 처리량·지연·루프 지연·자원 사용을 함께 측정합니다.

호출부의 `async` 한 단어보다 **내부 API가 실제로 어디에서 기다리고 언제 결과를 전달하는지**를 확인하는 것이 중요합니다.

## 함께 읽기

- [Python async/await 실행 예제]({% post_url 2025-12-29-python-async-await %})
- [멱등성과 재시도]({% post_url 2026-10-20-idempotency-retries %})
- [폴링·SSE·WebSocket 비교]({% post_url 2026-10-20-polling-sse-websocket %})
