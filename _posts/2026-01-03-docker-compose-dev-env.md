---
title: "Docker Compose로 개발 환경 구축하기"
date: 2026-01-03 09:00:00 +0900
categories: [DevOps, Docker]
tags: [Docker, Docker-Compose, Development, DevOps]
---

Docker Compose로 일관된 개발 환경을 구축하는 방법을 알아봅니다.

---

## 📦 Docker Compose란?

여러 컨테이너를 정의하고 실행하는 도구입니다.

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_PASSWORD: secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 🚀 실전 예시

### Django + PostgreSQL + Redis

```yaml
version: '3.8'

services:
  django:
    build:
      context: .
      dockerfile: Dockerfile
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://postgres:password@db:5432/django_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: django_db
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### 실행

```bash
# 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down

# 볼륨 포함 삭제
docker-compose down -v
```

---

## 🎯 환경별 설정

```yaml
# docker-compose.yml (기본)
# docker-compose.prod.yml (프로덕션)

# 프로덕션 실행
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

---

📚 **참고 자료**:
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
