---
title: "환경변수·비밀 값 관리: .env와 Secrets Manager"
date: 2026-01-07 09:00:00 +0900
categories: [DevOps, Security]
tags: [Environment-Variables, Security, AWS-Secrets, Best-Practices]
last_modified_at: 2026-10-15 14:50:00 +0900
---

환경변수는 설정을 전달하는 방법이고 비밀 관리 시스템은 저장·접근 통제·회전 등을 다룹니다. `.env` 파일을 사용한다고 값이 암호화되거나 안전하게 관리되는 것은 아닙니다.

## 📁 로컬 개발

실제 비밀 값은 커밋하지 않고 .env.example에는 키와 설명만 넣습니다. 이미 커밋한 비밀은 .gitignore 추가만으로 회수되지 않으므로 폐기·교체와 노출 범위 확인이 필요합니다.

```python
import os

def required_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"필수 환경변수가 없습니다: {name}")
    return value
```

위 함수는 설정 누락 검사입니다. .env를 자동으로 읽지 않으므로 로더나 런타임의 주입이 별도로 필요합니다. 예외·로그에는 비밀 값 자체를 출력하지 않습니다.

## 🐳 컨테이너·배포

환경 주입, 런타임 secret 파일, 관리형 비밀 저장소 등에서 읽는 방법을 요구에 맞게 선택합니다. 빌드 인자·Dockerfile·이미지 레이어·로그에 비밀이 남지 않도록 합니다. 환경별 분리와 최소 권한도 적용합니다.

## ☁️ Secrets Manager

AWS Secrets Manager 같은 서비스에서는 워크로드의 IAM 권한으로 필요한 비밀만 가져옵니다. 자격 증명을 다시 코드에 하드코딩하지 않습니다. 읽기 오류·캐싱·회전 후 재로딩과 DB 연결 갱신도 처리해야 합니다.

모든 운영 환경이 같은 서비스를 써야 하는 것은 아닙니다. 사용하는 플랫폼의 비밀 저장·배포·감사 기능을 확인하고 복구와 폐기 절차를 마련합니다.

📚 [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) · [python-dotenv](https://github.com/theskumar/python-dotenv)
