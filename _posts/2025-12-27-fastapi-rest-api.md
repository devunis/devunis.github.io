---
title: "FastAPI로 고성능 REST API 만들기: 실전 가이드"
date: 2025-12-27 09:00:00 +0900
categories: [Backend, API]
tags: [FastAPI, Python, REST-API, Backend, Performance]
---

FastAPI는 Python 백엔드 개발의 새로운 표준으로 자리잡고 있습니다. 
이번 글에서는 FastAPI로 고성능 REST API를 구축하는 실전 가이드를 제공합니다.

---

## ⚡ FastAPI 특징 및 장점

### 왜 FastAPI인가?

**성능**:
- ⚡ **Node.js, Go 수준**의 높은 성능
- 🔄 **비동기 처리** 네이티브 지원
- 📊 벤치마크: Django보다 3-4배 빠름

**개발 생산성**:
- 🎯 **자동 문서화** (Swagger/ReDoc)
- ✅ **타입 힌트 기반 검증**
- 🛡️ **Pydantic 통합**

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    return {"item": item, "status": "created"}

# 자동으로:
# - OpenAPI 스키마 생성
# - 요청 검증
# - 타입 체크
# - API 문서 (/docs)
```

---

## 🏗️ 프로젝트 구조 설계

### 추천 구조

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 앱 진입점
│   ├── config.py            # 설정
│   ├── dependencies.py      # 의존성 주입
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── endpoints/
│   │       │   ├── users.py
│   │       │   └── items.py
│   │       └── deps.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── security.py
│   │   └── config.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── user.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── user.py
│   │
│   └── services/
│       ├── __init__.py
│       └── user.py
│
├── tests/
├── requirements.txt
└── .env
```

### main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## 🎯 Pydantic 모델 활용

### 스키마 정의

```python
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: str = Field(..., example="user@example.com")
    username: str = Field(..., min_length=3, max_length=50)
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    
    @validator("password")
    def validate_password(cls, v):
        if not any(char.isdigit() for char in v):
            raise ValueError("비밀번호는 최소 1개의 숫자를 포함해야 합니다")
        return v

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True  # ORM 객체를 Pydantic으로 변환

class UserUpdate(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    is_active: Optional[bool] = None
```

### CRUD 엔드포인트

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    """사용자 생성"""
    # 중복 체크
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=400,
            detail="이미 등록된 이메일입니다"
        )
    
    # 사용자 생성
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """사용자 조회"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """사용자 수정"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    # 부분 업데이트
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """사용자 삭제"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    db.delete(db_user)
    db.commit()
    return None
```

---

## 💉 의존성 주입 (Dependency Injection)

### 데이터베이스 세션

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    """DB 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 인증 의존성

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """현재 로그인 사용자"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 실패",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

# 사용
@router.get("/users/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    return current_user
```

---

## 🚀 비동기 처리 최적화

### 비동기 DB 쿼리

```python
from databases import Database

database = Database(DATABASE_URL)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@router.get("/users/")
async def get_users():
    """비동기 DB 조회"""
    query = "SELECT * FROM users"
    users = await database.fetch_all(query)
    return users
```

### 외부 API 호출

```python
import httpx

@router.get("/external-data/")
async def get_external_data():
    """비동기 HTTP 요청"""
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

### 병렬 처리

```python
import asyncio

@router.get("/aggregate/")
async def aggregate_data():
    """여러 비동기 작업 병렬 실행"""
    
    async def fetch_users():
        # DB 조회
        return await database.fetch_all("SELECT * FROM users")
    
    async def fetch_posts():
        # 외부 API 호출
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.example.com/posts")
            return response.json()
    
    async def fetch_comments():
        # 다른 DB 조회
        return await database.fetch_all("SELECT * FROM comments")
    
    # 병렬 실행
    users, posts, comments = await asyncio.gather(
        fetch_users(),
        fetch_posts(),
        fetch_comments()
    )
    
    return {
        "users": users,
        "posts": posts,
        "comments": comments
    }
```

---

## 🛡️ 에러 핸들링 및 검증

### 커스텀 예외

```python
class CustomException(Exception):
    def __init__(self, name: str, detail: str):
        self.name = name
        self.detail = detail

@app.exception_handler(CustomException)
async def custom_exception_handler(request, exc: CustomException):
    return JSONResponse(
        status_code=400,
        content={
            "error": exc.name,
            "detail": exc.detail
        }
    )
```

### 검증 에러 커스터마이징

```python
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"]),
            "message": error["msg"],
            "type": error["type"]
        })
    
    return JSONResponse(
        status_code=422,
        content={"errors": errors}
    )
```

---

## 📚 API 문서 자동화 (Swagger)

### 문서 커스터마이징

```python
from fastapi.openapi.utils import get_openapi

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="My API",
        version="1.0.0",
        description="API 설명",
        routes=app.routes,
    )
    
    # 보안 스키마 추가
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

### 엔드포인트 문서화

```python
@router.post(
    "/users/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="사용자 생성",
    description="새로운 사용자를 생성합니다.",
    response_description="생성된 사용자 정보",
    tags=["users"]
)
async def create_user(
    user: UserCreate = Body(
        ...,
        example={
            "email": "user@example.com",
            "username": "testuser",
            "password": "password123"
        }
    )
):
    """
    사용자 생성 API
    
    - **email**: 이메일 주소 (필수)
    - **username**: 사용자명 (3-50자)
    - **password**: 비밀번호 (최소 8자, 숫자 포함)
    """
    ...
```

---

## ⚡ 성능 벤치마크

### 테스트 환경
- AWS EC2 t3.medium (2 vCPU, 4GB RAM)
- Gunicorn + Uvicorn workers
- PostgreSQL DB

### 결과

| 프레임워크 | RPS | 평균 응답시간 | P95 응답시간 |
|-----------|-----|--------------|-------------|
| **FastAPI** | **2,450** | **12ms** | **25ms** |
| Django | 890 | 35ms | 78ms |
| Flask | 1,200 | 28ms | 62ms |

### 최적화 팁

```python
# 1. Uvicorn workers 설정
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000

# 2. 연결 풀링
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20
)

# 3. 캐싱
from functools import lru_cache

@lru_cache(maxsize=128)
def get_settings():
    return Settings()
```

---

## 🎯 정리

### FastAPI 장점
- ✅ 높은 성능 (비동기)
- ✅ 자동 문서화
- ✅ 타입 안전성
- ✅ 현대적 Python 기능 활용

### 추천 사용처
- 🔹 AI/ML API 서빙
- 🔹 마이크로서비스
- 🔹 실시간 데이터 처리
- 🔹 고성능 REST API

FastAPI는 Python 백엔드 개발의 미래입니다. SenPick 프로젝트에서도 FastAPI를 선택해 
높은 성능과 빠른 개발 속도를 모두 얻을 수 있었습니다! 🚀

---

📚 **참고 자료**:
- [FastAPI 공식 문서](https://fastapi.tiangolo.com/)
