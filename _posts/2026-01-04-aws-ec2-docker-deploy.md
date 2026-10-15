---
title: "AWS EC2 Docker 배포: 네트워크·설정·운영 점검"
date: 2026-01-04 09:00:00 +0900
categories: [DevOps, AWS]
tags: [AWS, EC2, Docker, Deployment, Cloud]
last_modified_at: 2026-10-15 14:50:00 +0900
---

EC2에 컨테이너를 실행하는 것과 서비스를 운영 가능한 상태로 만드는 것은 다릅니다. 이 글은 배포 절차의 개념 가이드이며 특정 프로젝트가 현재 안정적으로 운영 중이라는 주장은 하지 않습니다.

## 🏗️ 배포 전 준비

OS·CPU 아키텍처에 맞는 Docker Engine과 Compose 플러그인을 공식 절차로 설치합니다. 이미지·의존성 버전을 관리하고, 테스트한 이미지 식별자로 배포합니다.

## 🔒 네트워크 구성

SSH는 관리 주체로 제한하고 앱 내부 포트를 무조건 인터넷에 공개하지 않습니다. 리버스 프록시·로드 밸런서와 TLS 구성을 정하고 DB는 필요한 네트워크에서만 접근하도록 합니다. 보안 그룹과 컨테이너 포트 바인딩을 함께 확인합니다.

## 🚀 실행 절차 예시

프로젝트에 검토한 compose.yaml과 환경 설정이 준비된 상황의 명령입니다.

```bash
docker compose config --quiet
docker compose pull
docker compose up -d
docker compose ps
docker compose logs --tail=100
```

이미지를 레지스트리에서 가져오는 방식의 예시입니다. 소스 빌드 방식이면 Dockerfile과 빌드 절차가 추가로 필요합니다. 환경 값은 이미지·공개 저장소에 넣지 않습니다.

## 🌐 HTTPS와 운영

인증서 발급 전에 도메인·DNS·80/443 경로를 준비합니다. 프록시가 호스트 프로세스인지 컨테이너인지에 따라 인증서 경로·갱신·재적용 방식이 달라집니다. Certbot 명령 하나가 모든 구조에 맞지는 않습니다.

헬스체크, 재시작 정책, 로그 보존·민감 값 마스킹, 디스크, 비밀 값, 마이그레이션 실행 주체를 확인합니다. 볼륨·DB 백업과 복구·이전 이미지 전환을 별도로 검증해야 합니다.

📚 [EC2 보안 그룹](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html) · [Docker Ubuntu 설치](https://docs.docker.com/engine/install/ubuntu/)
