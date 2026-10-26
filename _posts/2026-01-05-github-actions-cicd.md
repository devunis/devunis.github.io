---
title: "GitHub Actions: 테스트와 실제 배포를 구분하는 CI/CD"
date: 2026-01-05 09:00:00 +0900
categories: [DevOps, CI-CD]
tags: [GitHub-Actions, CI-CD, Automation, DevOps]
last_modified_at: 2026-10-15 14:50:00 +0900
---

CI는 변경을 자동으로 검사하고, CD는 검증한 결과물을 전달·배포하는 흐름입니다. 로그에 “Deploying”을 출력하는 것만으로 서버 배포가 구현되지는 않습니다.

## 🔄 최소 Python 테스트 워크플로우

아래는 requirements.txt와 pytest 테스트가 있는 프로젝트용 CI 예제입니다. `.github/workflows/test.yml`에 저장하며 배포 작업은 포함하지 않습니다.

{% raw %}
```yaml
name: Python tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: python -m pip install -r requirements.txt pytest
      - run: python -m pytest
```
{% endraw %}

액션 버전과 의존성은 프로젝트 정책에 맞게 관리합니다. 재현성과 공급망 통제를 위해 검증한 commit SHA 고정을 검토할 수 있습니다.

## 🚀 배포를 추가하려면

이미지 빌드·레지스트리 인증·고유 태그 push·대상 서버 적용·헬스체크·실패 복구를 실제로 구현해야 합니다. PR 실행에서 운영 배포가 일어나지 않도록 이벤트·브랜치·환경 조건을 명시합니다.

비밀 값이 필요한 단계는 최소 권한으로 구성합니다. 외부 PR 코드나 입력 문자열을 신뢰해 명령에 그대로 삽입하지 않습니다. 배포에 사용하는 환경 보호·승인 정책과 동시 실행도 관리합니다.

## ✅ 확인할 결과

워크플로우 성공, 테스트 성공, 이미지 게시 성공, 서비스 배포 성공을 나눠 확인합니다. 이전 단계의 성공이 다음 단계까지 보장하지 않습니다.

📚 [GitHub Actions 문서](https://docs.github.com/en/actions) · [배포 환경](https://docs.github.com/en/actions/deployment/targeting-different-environments/managing-environments-for-deployment)
