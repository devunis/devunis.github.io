---
title: "Python 비동기 프로그래밍: async/await 완벽 가이드"
date: 2025-12-29 09:00:00 +0900
categories: [Backend, Python]
tags: [Python, Async, Asyncio, Concurrency, Performance]
---

Python의 비동기 프로그래밍은 I/O 바운드 작업의 성능을 극적으로 향상시킵니다. 
이번 글에서는 async/await의 기초부터 실전 활용까지 완벽히 다룹니다.

---

## 🔄 동기 vs 비동기

### 동기 프로그래밍 (Synchronous)

```python
import time

def fetch_data(n):
    print(f"데이터 {n} 가져오기 시작")
    time.sleep(2)  # API 호출 시뮬레이션
    print(f"데이터 {n} 완료")
    return f"data_{n}"

# 순차 실행
start = time.time()
fetch_data(1)  # 2초 대기
fetch_data(2)  # 2초 대기
fetch_data(3)  # 2초 대기
print(f"총 시간: {time.time() - start:.2f}초")
# 출력: 총 시간: 6.00초
```

### 비동기 프로그래밍 (Asynchronous)

```python
import asyncio

async def fetch_data_async(n):
    print(f"데이터 {n} 가져오기 시작")
    await asyncio.sleep(2)
    print(f"데이터 {n} 완료")
    return f"data_{n}"

async def main():
    start = time.time()
    # 동시 실행
    results = await asyncio.gather(
        fetch_data_async(1),
        fetch_data_async(2),
        fetch_data_async(3)
    )
    print(f"총 시간: {time.time() - start:.2f}초")
    # 출력: 총 시간: 2.00초 (3배 빠름!)

asyncio.run(main())
```

---

## 🎯 asyncio 기초 개념

### Event Loop

```python
import asyncio

# 이벤트 루프 직접 사용
loop = asyncio.get_event_loop()
result = loop.run_until_complete(fetch_data_async(1))
loop.close()

# 또는 간단하게 (Python 3.7+)
asyncio.run(fetch_data_async(1))
```

### Coroutine

```python
async def my_coroutine():
    return "Hello"

# 코루틴 객체 생성
coro = my_coroutine()
print(type(coro))  # <class 'coroutine'>

# 실행
result = asyncio.run(coro)
```

---

## �� async/await 문법

### async def: 코루틴 함수 정의

```python
async def hello():
    return "world"

# 일반 함수와 차이
def sync_hello():
    return "world"

print(hello())       # <coroutine object>
print(sync_hello())  # "world"
```

### await: 비동기 작업 대기

```python
async def task1():
    await asyncio.sleep(1)
    return "Task 1"

async def task2():
    result = await task1()  # task1 완료 대기
    return f"{result} + Task 2"

asyncio.run(task2())
```

---

## 🚀 실전 활용 패턴

### 1. 병렬 HTTP 요청

```python
import aiohttp
import asyncio

async def fetch_url(session, url):
    async with session.get(url) as response:
        return await response.text()

async def fetch_all(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_url(session, url) for url in urls]
        results = await asyncio.gather(*tasks)
        return results

# 사용
urls = [
    "https://api.example.com/1",
    "https://api.example.com/2",
    "https://api.example.com/3"
]
results = asyncio.run(fetch_all(urls))
```

### 2. 비동기 DB 쿼리

```python
from databases import Database

database = Database("postgresql://...")

async def get_users():
    query = "SELECT * FROM users WHERE active = :active"
    users = await database.fetch_all(query, values={"active": True})
    return users

async def get_posts():
    query = "SELECT * FROM posts LIMIT 10"
    posts = await database.fetch_all(query)
    return posts

async def aggregate_data():
    # 병렬 DB 쿼리
    users, posts = await asyncio.gather(
        get_users(),
        get_posts()
    )
    return {"users": users, "posts": posts}
```

### 3. 프로듀서-컨슈머 패턴

```python
async def producer(queue):
    for i in range(5):
        await asyncio.sleep(1)
        await queue.put(i)
        print(f"Produced: {i}")

async def consumer(queue):
    while True:
        item = await queue.get()
        print(f"Consumed: {item}")
        await asyncio.sleep(2)
        queue.task_done()

async def main():
    queue = asyncio.Queue()
    
    # 프로듀서 1개, 컨슈머 2개
    await asyncio.gather(
        producer(queue),
        consumer(queue),
        consumer(queue)
    )

asyncio.run(main())
```

---

## 🔒 동시성 제어

### Semaphore: 동시 실행 수 제한

```python
async def limited_task(semaphore, n):
    async with semaphore:
        print(f"Task {n} 시작")
        await asyncio.sleep(1)
        print(f"Task {n} 완료")

async def main():
    # 최대 3개만 동시 실행
    semaphore = asyncio.Semaphore(3)
    
    tasks = [
        limited_task(semaphore, i) 
        for i in range(10)
    ]
    await asyncio.gather(*tasks)

asyncio.run(main())
```

### Lock: 상호 배제

```python
lock = asyncio.Lock()
shared_resource = 0

async def increment():
    global shared_resource
    async with lock:
        temp = shared_resource
        await asyncio.sleep(0.1)
        shared_resource = temp + 1

async def main():
    await asyncio.gather(*[increment() for _ in range(10)])
    print(shared_resource)  # 10 (안전!)

asyncio.run(main())
```

---

## ⚠️ 에러 핸들링

### try-except

```python
async def risky_task():
    try:
        await asyncio.sleep(1)
        raise ValueError("에러 발생!")
    except ValueError as e:
        print(f"에러 처리: {e}")
        return None

asyncio.run(risky_task())
```

### asyncio.gather 에러 처리

```python
async def task_with_error():
    await asyncio.sleep(1)
    raise ValueError("Task error")

async def safe_task():
    await asyncio.sleep(1)
    return "success"

async def main():
    results = await asyncio.gather(
        task_with_error(),
        safe_task(),
        return_exceptions=True  # 예외를 결과로 반환
    )
    
    for result in results:
        if isinstance(result, Exception):
            print(f"에러: {result}")
        else:
            print(f"성공: {result}")

asyncio.run(main())
```

---

## 🎯 FastAPI에서의 활용

```python
from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/aggregate")
async def aggregate():
    async with httpx.AsyncClient() as client:
        user_response, post_response = await asyncio.gather(
            client.get("https://api.example.com/users"),
            client.get("https://api.example.com/posts")
        )
    
    return {
        "users": user_response.json(),
        "posts": post_response.json()
    }
```

---

## 📊 성능 비교

### 실험: 10개 API 호출

```python
# 동기 (순차)
def sync_fetch_all():
    for i in range(10):
        requests.get(f"https://api.example.com/{i}")
# 시간: 10초

# 비동기 (병렬)
async def async_fetch_all():
    async with aiohttp.ClientSession() as session:
        tasks = [
            session.get(f"https://api.example.com/{i}")
            for i in range(10)
        ]
        await asyncio.gather(*tasks)
# 시간: 1초 (10배 빠름!)
```

---

## ⚠️ 주의사항

### 1. CPU-bound 작업에는 부적합

```python
# ❌ 나쁜 예
async def cpu_intensive():
    # CPU 작업은 비동기 효과 없음
    result = sum(i**2 for i in range(10**7))
    return result

# ✅ 좋은 예: ProcessPoolExecutor 사용
from concurrent.futures import ProcessPoolExecutor

def cpu_intensive():
    return sum(i**2 for i in range(10**7))

async def main():
    with ProcessPoolExecutor() as executor:
        result = await loop.run_in_executor(
            executor, 
            cpu_intensive
        )
```

### 2. 블로킹 함수 주의

```python
# ❌ 블로킹 함수 직접 호출
async def bad_example():
    time.sleep(1)  # 이벤트 루프 블로킹!

# ✅ asyncio.sleep 사용
async def good_example():
    await asyncio.sleep(1)
```

---

## 📝 정리

### 비동기를 사용해야 할 때
- ✅ 많은 I/O 작업 (API, DB, 파일)
- ✅ 웹 스크래핑
- ✅ 실시간 데이터 처리

### 비동기를 피해야 할 때
- ❌ CPU 집약적 작업
- ❌ 간단한 스크립트
- ❌ 동기 라이브러리만 사용 가능할 때

비동기 프로그래밍은 올바르게 사용하면 Python 애플리케이션의 성능을 크게 향상시킬 수 있습니다! ⚡

---

📚 **참고 자료**:
- [Python asyncio 공식 문서](https://docs.python.org/3/library/asyncio.html)
