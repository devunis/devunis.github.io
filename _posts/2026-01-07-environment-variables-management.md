---
title: "환경변수 관리 베스트 프랙티스: .env부터 AWS Secrets까지"
date: 2026-01-07 09:00:00 +0900
categories: [DevOps, Security]
tags: [Environment-Variables, Security, AWS-Secrets, Best-Practices]
---

환경변수를 안전하게 관리하는 방법을 알아봅니다.

---

## 📁 .env 파일 사용

```bash
# .env
DATABASE_URL=postgresql://localhost/mydb
SECRET_KEY=super-secret-key
API_KEY=your-api-key
```

```python
# Python
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("SECRET_KEY")
```

---

## 🐳 Docker 환경변수

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - .env
```

---

## ☁️ AWS Secrets Manager

```python
import boto3
import json

client = boto3.client('secretsmanager')
response = client.get_secret_value(SecretId='myapp/prod')
secrets = json.loads(response['SecretString'])

DATABASE_URL = secrets['DATABASE_URL']
```

---

## 🔒 보안 체크리스트

- [ ] .env 파일은 .gitignore에 추가
- [ ] 프로덕션은 AWS Secrets Manager 사용
- [ ] 환경별 분리 (.env.dev, .env.prod)
- [ ] 최소 권한 원칙
- [ ] 정기적인 키 로테이션

---

📚 **참고 자료**:
- [python-dotenv](https://github.com/theskumar/python-dotenv)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
