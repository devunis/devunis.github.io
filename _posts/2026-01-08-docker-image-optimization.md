---
title: "Docker 이미지 최적화: 베이스·멀티스테이지·레이어 캐시"
date: 2026-01-08 09:00:00 +0900
categories: [DevOps, Docker]
tags: [Docker, Optimization, Performance, Best-Practices]
last_modified_at: 2026-10-15 14:50:00 +0900
---

이미지 최적화는 크기뿐 아니라 재현성, 빌드 시간, 보안 업데이트와 운영 호환성을 함께 다룹니다. 이미지 크기와 감소율은 의존성·아키텍처·빌드 조건에 따라 달라지므로 고정된 성과로 제시하지 않습니다.

## 🐳 Python 멀티스테이지 예제

requirements.txt와 app.py가 있는 앱을 가정합니다. 아래는 의존성 설치 결과를 같은 베이스의 실행 단계로 옮기는 예제입니다. 실제 배포에서는 베이스 이미지와 패키지 버전을 검증·고정합니다.

```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN python -m venv /opt/venv && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS runtime
WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY app.py .
RUN useradd --create-home appuser
USER appuser
CMD ["python", "app.py"]
```

네이티브 확장을 사용하는 패키지는 실행 단계에도 공유 라이브러리가 필요할 수 있습니다. 이전 예제처럼 Debian 계열에서 설치한 패키지를 Alpine의 musl 환경에 그대로 복사하면 호환성 문제가 생길 수 있습니다.

## 📦 빌드 컨텍스트와 캐시

```text
# .dockerignore 예시
.git
.env
__pycache__
*.pyc
.venv
```

의존성 파일을 먼저 복사해 설치하고 소스는 나중에 복사하면 소스 변경마다 의존성 설치 레이어가 무효화되는 일을 줄일 수 있습니다. 비밀 값은 이미지 레이어에 넣지 않습니다.

## ⚡ 무엇을 측정할까?

같은 플랫폼에서 최종 이미지 크기, 캐시 없음·있음 빌드 시간, 취약점·실행 결과를 비교합니다. 작은 베이스가 필요한 라이브러리·디버깅 도구를 제공하는지도 봅니다. 멀티스테이지라는 이유만으로 크기가 반드시 줄지는 않습니다.

📚 [Docker 빌드 권장사항](https://docs.docker.com/build/building/best-practices/) · [멀티스테이지 빌드](https://docs.docker.com/build/building/multi-stage/)
