---
title: "Nginx + Gunicorn으로 Django 프로덕션 배포"
date: 2026-01-06 09:00:00 +0900
categories: [DevOps, Backend]
tags: [Nginx, Gunicorn, Django, Deployment, Production]
---

Django를 프로덕션 환경에 안전하게 배포하는 방법입니다.

---

## 🔧 Gunicorn 설정

```bash
# 설치
pip install gunicorn

# 실행
gunicorn --workers 4 \
         --bind 0.0.0.0:8000 \
         --timeout 120 \
         --access-logfile - \
         --error-logfile - \
         myproject.wsgi:application
```

---

## 🌐 Nginx 설정

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /static/ {
        alias /path/to/static/;
    }
    
    location /media/ {
        alias /path/to/media/;
    }
}
```

---

## ⚙️ Systemd 서비스

```ini
[Unit]
Description=Gunicorn Django
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/myproject
ExecStart=/home/ubuntu/venv/bin/gunicorn --workers 4 --bind 127.0.0.1:8000 myproject.wsgi
Restart=always

[Install]
WantedBy=multi-user.target
```

django_ec2 프로젝트에서 이 구성으로 안정적으로 운영 중입니다! 🚀

---

📚 **참고 자료**:
- [Gunicorn 공식 문서](https://docs.gunicorn.org/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
