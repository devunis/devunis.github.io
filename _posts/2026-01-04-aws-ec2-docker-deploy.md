---
title: "AWS EC2에 Docker 애플리케이션 배포하기"
date: 2026-01-04 09:00:00 +0900
categories: [DevOps, AWS]
tags: [AWS, EC2, Docker, Deployment, Cloud]
---

AWS EC2에 Docker 기반 애플리케이션을 배포하는 실전 가이드입니다.

---

## 🚀 배포 단계

### 1. EC2 인스턴스 생성

```bash
# AMI: Ubuntu 22.04 LTS
# 인스턴스 타입: t3.medium
# 보안 그룹: 22(SSH), 80(HTTP), 443(HTTPS), 8000(App)
```

### 2. Docker 설치

```bash
# EC2 접속
ssh -i key.pem ubuntu@ec2-ip

# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 애플리케이션 배포

```bash
# Git clone
git clone https://github.com/yourname/yourapp.git
cd yourapp

# 환경 변수 설정
cat > .env << EOF
DATABASE_URL=postgresql://...
SECRET_KEY=...
EOF

# 빌드 및 실행
docker-compose up -d --build

# 로그 확인
docker-compose logs -f
```

---

## 🔒 SSL 인증서 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# 인증서 발급
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 모니터링

```bash
# 컨테이너 상태
docker ps

# 리소스 사용량
docker stats

# 로그
docker-compose logs --tail=100 -f
```

SenPick은 이 방법으로 배포하여 안정적으로 운영 중입니다! ⚡

---

📚 **참고 자료**:
- [AWS EC2 공식 문서](https://docs.aws.amazon.com/ec2/)
