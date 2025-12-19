---
title: "GitHub Actions로 CI/CD 파이프라인 구축"
date: 2026-01-05 09:00:00 +0900
categories: [DevOps, CI-CD]
tags: [GitHub-Actions, CI-CD, Automation, DevOps]
---

GitHub Actions를 활용한 자동화 파이프라인 구축 방법을 알아봅니다.

---

## 🔄 기본 워크플로우

```.yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          pytest
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to EC2
        run: |
          # SSH and deploy
          echo "Deploying..."
```

---

## 🚀 Docker 빌드 & 푸시

```.yaml
- name: Build and push Docker image
  env:
    DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
    DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
  run: |
    echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
    docker build -t myapp:latest .
    docker push myapp:latest
```

---

📚 **참고 자료**:
- [GitHub Actions 공식 문서](https://docs.github.com/en/actions)
