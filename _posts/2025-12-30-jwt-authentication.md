---
title: "JWT 인증 구현하기: FastAPI + OAuth2"
date: 2025-12-30 09:00:00 +0900
categories: [Backend, Security]
tags: [JWT, OAuth2, FastAPI, Authentication, Security]
---

안전한 API를 위해서는 적절한 인증 시스템이 필수입니다. 
이번 글에서는 JWT와 OAuth2를 활용한 인증 시스템 구현 방법을 다룹니다.

---

## 🔐 JWT 동작 원리

### JWT (JSON Web Token) 구조

```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**구성 요소**:
1. **Header**: 토큰 타입, 알고리즘
2. **Payload**: 사용자 정보 (Claims)
3. **Signature**: 검증용 서명

---

## 🎯 Access Token vs Refresh Token

| 특징 | Access Token | Refresh Token |
|------|--------------|---------------|
| **용도** | API 접근 | 토큰 갱신 |
| **유효기간** | 짧음 (15분) | 김 (7일) |
| **저장 위치** | 메모리 | HttpOnly 쿠키 |
| **노출 위험** | 높음 | 낮음 |

### 워크플로우

```
1. 로그인
   → Access Token (15분) + Refresh Token (7일) 발급

2. API 요청
   → Access Token 사용

3. Access Token 만료
   → Refresh Token으로 갱신

4. Refresh Token도 만료
   → 재로그인 필요
```

---

## 💻 FastAPI OAuth2 구현

### 1. 설치

```bash
pip install fastapi python-jose[cryptography] passlib[bcrypt] python-multipart
```

### 2. 설정

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# 설정
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

### 3. 토큰 생성

```python
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### 4. 비밀번호 해싱

```python
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# 사용 예시
hashed = get_password_hash("mypassword123")
print(hashed)
# $2b$12$KIXxkP4eZ3YQwHv.FNXb4.Xz...
```

### 5. 로그인 엔드포인트

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

app = FastAPI()

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # 사용자 검증
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 잘못되었습니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 토큰 생성
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
```

---

## 🛡️ 인증 미들웨어

### 현재 사용자 가져오기

```python
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 실패",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    
    return user

# 보호된 엔드포인트
@app.get("/users/me")
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
```

### 활성 사용자만 허용

```python
async def get_current_active_user(
    current_user = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="비활성 사용자")
    return current_user

@app.get("/items/")
async def read_items(current_user = Depends(get_current_active_user)):
    return [{"item_id": 1, "owner": current_user.username}]
```

---

## 🔄 토큰 갱신

```python
@app.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
    except JWTError:
        raise HTTPException(status_code=401, detail="유효하지 않은 토큰")
    
    # 새로운 토큰 발급
    new_access_token = create_access_token(data={"sub": username})
    new_refresh_token = create_refresh_token(data={"sub": username})
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
```

---

## 🌐 CORS 설정

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔒 보안 베스트 프랙티스

### 1. 환경 변수 사용

```python
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY 환경 변수가 설정되지 않았습니다")
```

### 2. HTTPS만 허용

```python
# 프로덕션 설정
if ENVIRONMENT == "production":
    app.add_middleware(
        HTTPSRedirectMiddleware
    )
```

### 3. Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, ...):
    # 1분에 5번만 로그인 시도 가능
    ...
```

---

## 📝 정리

### 체크리스트
- [ ] JWT Secret Key 안전하게 보관
- [ ] Access Token 짧게 (15분)
- [ ] Refresh Token HttpOnly 쿠키
- [ ] HTTPS 사용
- [ ] Rate Limiting 적용
- [ ] 비밀번호 해싱 (bcrypt)

JWT 인증은 Stateless하고 확장 가능한 인증 방식입니다. 
보안 베스트 프랙티스를 준수하면 안전한 API를 구축할 수 있습니다! 🔐

---

📚 **참고 자료**:
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWT.io](https://jwt.io/)
