---
title: "Docker 이미지 최적화: 크기를 70% 줄이는 방법"
date: 2026-01-08 09:00:00 +0900
categories: [DevOps, Docker]
tags: [Docker, Optimization, Performance, Best-Practices]
---

Docker 이미지를 최적화하여 빌드 시간과 배포 속도를 개선하는 방법입니다.

---

## ❌ Before: 비효율적인 Dockerfile

```dockerfile
FROM python:3.11
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```
이미지 크기: **1.2GB** 🔴

---

## ✅ After: 최적화된 Dockerfile

```dockerfile
# Multi-stage build
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-alpine
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```
이미지 크기: **350MB** 🟢 (70% 감소!)

---

## 🎯 최적화 기법

### 1. Alpine 베이스 이미지
```dockerfile
FROM python:3.11-alpine  # 5MB
# vs
FROM python:3.11         # 900MB
```

### 2. Multi-stage 빌드
```dockerfile
FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### 3. .dockerignore
```
# .dockerignore
__pycache__
*.pyc
.git
.env
node_modules
tests/
```

### 4. 레이어 캐싱
```dockerfile
# ✅ 좋음: 자주 변하지 않는 것 먼저
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# ❌ 나쁨: 코드 변경 시 재설치
COPY . .
RUN pip install -r requirements.txt
```

---

## 📊 결과 비교

| 기법 | Before | After | 개선 |
|------|--------|-------|------|
| Alpine | 1.2GB | 350MB | -70% |
| Multi-stage | 800MB | 200MB | -75% |
| .dockerignore | 500MB | 400MB | -20% |

---

📚 **참고 자료**:
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
