---
title: "FastAPI REST API: 입력 검증·응답 모델·비동기 처리"
date: 2025-12-27 09:00:00 +0900
categories: [Backend, API]
tags: [FastAPI, Python, REST-API, Backend, Performance]
last_modified_at: 2026-10-15 14:50:00 +0900
---

FastAPI는 Python 타입 선언과 Pydantic을 활용해 입력 검증과 API 스키마를 구성하는 프레임워크입니다. 프레임워크 이름만으로 다른 언어·프레임워크보다 특정 배수만큼 빠르다고 단정하지 않습니다.

## 💻 최소 API 예제

FastAPI·Pydantic 2 계열을 설치한 환경의 main.py 예제입니다. 메모리 저장소는 재시작 시 사라지고 프로세스끼리 공유되지 않으므로 구조 설명용입니다.

```python
from itertools import count
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI()
users = {}
ids = count(1)

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)

class UserRead(BaseModel):
    id: int
    name: str

@app.post("/users", response_model=UserRead, status_code=201)
def create_user(body: UserCreate):
    user = {"id": next(ids), "name": body.name}
    users[user["id"]] = user
    return user

@app.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int):
    if user_id not in users:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    return users[user_id]
```

실행은 `uvicorn main:app`으로 시작할 수 있습니다. 인증·DB·마이그레이션·페이지네이션을 갖춘 운영 서비스 전체 예제는 아닙니다.

## 🔄 동기와 비동기 선택

await를 지원하는 I/O를 사용하는 경로는 async def로 작성할 수 있습니다. 블로킹 I/O나 CPU 집약 작업을 그대로 넣으면 이벤트 루프를 막을 수 있습니다. 일반 def 경로·의존성의 스레드풀 실행과 직접 호출하는 보조 함수의 동작도 구분합니다.

비동기가 모델 추론 자체를 자동 가속하지는 않습니다. DB 연결 풀, 외부 요청 제한, 타임아웃·취소·재시도도 구성해야 합니다.

## 🧪 확인할 것

입력 누락·길이 제한, 존재하지 않는 리소스, 응답 모델과 상태 코드를 검사합니다. 응답에는 비밀번호 해시 같은 내부 정보를 포함하지 않습니다. 데이터 저장에는 DB 세션과 트랜잭션 경계를 명시합니다.

## ⚡ 응답 속도 최적화

검색·DB·외부 모델 호출·직렬화 시간을 나눠 측정합니다. 같은 조건에서 평균·P95·처리량·오류율을 기록하고 병목에 맞춰 쿼리·캐싱·동시성 등을 조정합니다. 이 글에는 실행 근거가 없는 RPS 비교표나 SenPick의 FastAPI 성과를 제시하지 않습니다.

📚 [FastAPI 공식 문서](https://fastapi.tiangolo.com/) · [비동기 설명](https://fastapi.tiangolo.com/async/)
