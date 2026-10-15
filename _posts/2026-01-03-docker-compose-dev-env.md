---
title: "Docker Compose 개발 환경: 설정·준비 상태·데이터 보존"
date: 2026-01-03 09:00:00 +0900
categories: [DevOps, Docker]
tags: [Docker, Docker-Compose, Development, DevOps]
last_modified_at: 2026-10-15 14:50:00 +0900
---

Docker Compose는 여러 컨테이너의 실행 구성을 선언하는 도구입니다. 아래는 로컬 PostgreSQL 개발 DB 예제이며 운영 배포 전체 구성이 아닙니다.

## 💻 compose.yaml

환경 파일에 로컬 개발용 POSTGRES_PASSWORD를 정하고 저장소에 커밋하지 않습니다.

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?set POSTGRES_PASSWORD}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 5s
      timeout: 3s
      retries: 10

volumes:
  postgres_data:
```

메이저 버전을 정한 예시이며 실제 재현성을 위해서는 검증한 태그·digest와 업그레이드 정책을 관리합니다. 볼륨의 DB 버전을 이미지 변경만으로 안전하게 올릴 수 있다고 가정하지 않습니다.

## 🚀 확인·실행

```bash
docker compose config --quiet
docker compose up -d
docker compose ps
docker compose logs db
docker compose down
```

down은 일반적으로 명명된 볼륨을 보존합니다. `down -v`는 해당 볼륨을 삭제하므로 개발 DB 데이터가 사라질 수 있습니다. 삭제가 필요한 경우에만 사용합니다.

## 🔄 앱과 연결할 때

다른 컨테이너는 서비스 이름 db로 접근하고, 호스트에서는 바인딩한 localhost 포트를 사용합니다. depends_on의 단순 시작 순서는 DB의 접속 준비 완료를 보장하지 않습니다. healthcheck와 service_healthy 조건, 앱의 재시도를 구성합니다.

환경변수 이름을 넣었다고 Django 등의 설정이 자동 반영되는 것은 아닙니다. 애플리케이션에서 해당 값을 읽는 코드를 마련해야 합니다.

📚 [Compose 문서](https://docs.docker.com/compose/) · [시작 순서와 준비 상태](https://docs.docker.com/compose/how-tos/startup-order/)
