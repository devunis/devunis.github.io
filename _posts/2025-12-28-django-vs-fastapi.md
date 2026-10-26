---
title: "Django vs FastAPI: 기능 구성과 비동기 처리 비교"
date: 2025-12-28 09:00:00 +0900
categories: [Backend, Comparison]
tags: [Django, FastAPI, Python, Backend, AI]
last_modified_at: 2026-10-15 14:50:00 +0900
---

Django와 FastAPI는 기능 구성과 개발 방식이 다릅니다. 하나를 동기·저성능, 다른 하나를 비동기·고성능으로 고정해 비교하지 않습니다.

## 📊 기능 구성

| 관점 | Django | FastAPI |
| --- | --- | --- |
| 기본 범위 | ORM·Admin·인증·템플릿 등 통합 | API 라우팅·검증·의존성·OpenAPI 중심 |
| 데이터 접근 | Django ORM | 별도 라이브러리 선택 |
| 비동기 | ASGI·비동기 뷰와 지원 API 활용 | async 경로와 비동기 I/O 활용 |
| 관리자 | 등록·권한 설정으로 Admin 활용 | 별도 도구·구현 선택 |
| API 개발 | 추가 API 계층 선택 가능 | API 스키마·문서 구성 제공 |

Django도 비동기 기능을 제공합니다. 동기 미들웨어·ORM 기능·트랜잭션 등과 함께 쓸 때는 버전별 지원 범위를 확인해야 합니다. FastAPI도 동기 함수를 사용할 수 있고, 이벤트 루프에서 블로킹 작업을 실행하면 병목이 생깁니다.

## 🎁 실제 프로젝트와 일반 예제 구분

SenPick 공개 README는 Django 기반 선물 추천 서비스입니다. 과거 글의 “SenPick은 FastAPI로 구현했고 Django보다 빠르다”는 설명과 수치 비교는 근거가 없어 제거했습니다.

프로젝트 선택은 Admin·인증·데이터 관리가 필요한지, API를 중심으로 필요한 구성 요소를 조합할지, 팀의 경험과 운영 도구가 무엇인지로 판단할 수 있습니다.

## ⚡ 성능을 비교하려면

동일한 엔드포인트·데이터·DB 쿼리·외부 호출·서버 자원·워커 설정으로 비교합니다. 동시성, 응답 지연 분포와 오류율을 함께 봅니다. 각기 다른 업무를 처리하는 두 프로젝트의 응답 시간을 프레임워크 성능으로 일반화하지 않습니다.

## ✅ AI 서비스도 요구부터 보기

모델 호출은 어느 프레임워크에서도 가능합니다. CPU/GPU 추론을 분리할지, 외부 API 대기를 동시 처리할지, 요청을 작업 큐로 넘길지 등은 서비스 구조의 문제입니다.

📚 [Django 비동기 지원](https://docs.djangoproject.com/en/stable/topics/async/) · [FastAPI 동시성](https://fastapi.tiangolo.com/async/) · [SenPick](https://github.com/devunis/SenPick)
