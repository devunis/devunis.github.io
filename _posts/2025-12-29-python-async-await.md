---
title: "Python async/await: I/O 동시성과 응답 속도 최적화"
date: 2025-12-29 09:00:00 +0900
categories: [Backend, Python]
tags: [Python, Async, Asyncio, Concurrency, Performance]
last_modified_at: 2026-10-15 14:50:00 +0900
---

async/await는 대기하는 I/O 작업 사이에 다른 작업이 진행되도록 구성하는 문법입니다. CPU 계산을 자동으로 병렬 실행하거나 모든 요청을 일정 배수로 빠르게 만드는 기능은 아닙니다.

## 🔄 실행 가능한 대기 모형

아래는 네트워크 대신 sleep을 사용하는 모형입니다. 출력되는 시간은 실제 실행 환경에서 측정하며 서비스의 성능 수치가 아닙니다.

```python
import asyncio
import time

async def fetch(index):
    await asyncio.sleep(0.02)
    return index

async def main():
    start = time.perf_counter()
    sequential = []
    for index in range(3):
        sequential.append(await fetch(index))
    sequential_time = time.perf_counter() - start

    start = time.perf_counter()
    concurrent = await asyncio.gather(*(fetch(i) for i in range(3)))
    concurrent_time = time.perf_counter() - start
    assert sequential == concurrent == [0, 1, 2]
    print("순차 실행:", sequential_time)
    print("동시 실행:", concurrent_time)

if __name__ == "__main__":
    asyncio.run(main())
```

## 🎯 gather와 TaskGroup

gather는 결과를 입력 awaitable의 순서로 모읍니다. 기본 설정에서 한 작업의 예외가 전달되어도 다른 작업이 모두 자동 취소된다고 가정하면 안 됩니다. Python 3.11 이상의 TaskGroup은 구조화된 작업 그룹과 실패 시 취소 동작을 제공하므로 요구에 맞게 선택합니다.

## ⚡ 실제 응답 속도에 적용

독립적인 외부 요청은 동시 실행을 검토할 수 있습니다. 앞 단계 결과를 입력으로 쓰는 요청은 순서를 유지합니다. Semaphore 등으로 동시 요청 수를 제한하고, 연결 풀·타임아웃·재시도·서비스 요청 한도를 함께 관리합니다.

같은 계산을 캐싱할 때는 개인정보·권한·만료·키 충돌을 검토합니다. async 함수에 일반 동기 캐시 데코레이터를 그대로 붙여 코루틴 객체를 재사용하면 문제가 생길 수 있습니다.

## 🧱 블로킹 작업 주의

async 함수 안에서 time.sleep이나 동기 HTTP 함수를 호출하면 이벤트 루프를 막을 수 있습니다. 동기 I/O의 스레드 실행을 검토할 수 있지만 CPU 작업은 별도 프로세스·작업 큐·모델 서버 등의 구성이 필요할 수 있습니다.

## 🧪 측정하기

순차·동시 실행을 같은 입력으로 비교하고 결과 동일성, 오류·취소·자원 정리를 확인합니다. 평균·P95 지연과 전체 처리량을 구분합니다. 가짜 API 주소를 호출한 예제에 고정된 실행 시간을 결과로 붙이지 않습니다.

📚 [Python 코루틴·태스크](https://docs.python.org/3/library/asyncio-task.html)
