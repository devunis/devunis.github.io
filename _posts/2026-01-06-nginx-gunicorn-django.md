---
title: "Nginx + Gunicorn으로 Django WSGI 서비스 구성하기"
date: 2026-01-06 09:00:00 +0900
categories: [DevOps, Backend]
tags: [Nginx, Gunicorn, Django, Deployment, Production]
last_modified_at: 2026-10-15 14:50:00 +0900
---

Nginx는 프록시·정적 파일 전달 등을 맡고 Gunicorn은 Django WSGI 애플리케이션을 실행할 수 있습니다. 아래는 단일 호스트의 구성 예시이며 HTTPS·DB·감시까지 갖춘 운영 전체 명세는 아닙니다.

## 🔧 Gunicorn

myproject.wsgi가 존재하고 의존성·환경변수가 준비된 상황입니다.

```bash
gunicorn --workers 2 --bind 127.0.0.1:8000   --access-logfile - --error-logfile - myproject.wsgi:application
```

워커 수·타임아웃은 실제 CPU·메모리·업무 부하에 맞춰 측정합니다. 같은 호스트의 프록시 뒤에 두는 예제이므로 앱 포트는 localhost에 바인딩합니다.

## 🌐 Nginx의 프록시 부분

```nginx
server {
    listen 80;
    server_name example.com;
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

example.com은 교체할 예시 도메인입니다. 실제 서비스에는 TLS와 HTTP→HTTPS 전환, 허용 호스트, 정적·업로드 파일 정책을 구성합니다. 전달 헤더는 신뢰하는 프록시 경계 안에서만 사용하도록 Django 설정과 함께 검토합니다.

## ⚙️ 프로세스·데이터 관리

systemd나 컨테이너 런타임으로 재시작·환경 설정·로그를 관리합니다. 실행 사용자 권한, collectstatic, 마이그레이션, 백업과 헬스체크를 확인해야 합니다. 업로드 파일은 정적 파일과 다른 접근 정책이 필요할 수 있습니다.

## 🔄 WSGI와 ASGI

이 예제는 WSGI입니다. 장시간 비동기 연결 등 ASGI 요구가 있으면 ASGI 서버·워커와 앱의 호환성을 검토합니다. 서버 구성만 바꿨다고 모든 동기 코드가 비동기가 되지는 않습니다.

📚 [Django 배포 체크리스트](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/) · [Gunicorn](https://docs.gunicorn.org/en/stable/run.html) · [Nginx 프록시](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
