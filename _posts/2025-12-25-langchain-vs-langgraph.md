---
title: "LangChain vs LangGraph: 추상화와 실행 흐름의 차이"
date: 2025-12-25 09:00:00 +0900
categories: [AI, Framework]
tags: [LangChain, LangGraph, AI-Framework, Comparison]
last_modified_at: 2026-10-15 14:50:00 +0900
---

LangChain과 LangGraph는 경쟁하는 두 성능 등급이 아니라 함께 사용할 수 있는 서로 다른 추상화입니다. 이름만으로 개발 속도나 응답 품질을 결정할 수는 없습니다.

## 📊 역할 비교

| 관점 | LangChain | LangGraph |
| --- | --- | --- |
| 중심 | 모델·도구·검색 통합과 에이전트 구성 요소 | 상태 기반 실행과 분기·반복 제어 |
| 활용 | 모델 연결과 공통 인터페이스, 에이전트 구성 | 사용자 정의 워크플로우와 실행 상태 관리 |
| 함께 사용 | LangGraph 위의 고수준 에이전트 기능 활용 가능 | LangChain 구성 요소를 노드에서 활용 가능 |

현재 LangChain의 에이전트는 LangGraph를 기반으로 하므로 “LangChain은 분기·상태 처리가 불가능하다”는 단정은 맞지 않습니다. 실제 API와 지원 기능은 사용하는 버전의 문서를 확인합니다.

## 🎯 간단한 흐름과 제어가 많은 흐름

<figure class="article-diagram diagram-alternatives">
<figcaption>처리 흐름</figcaption>
<ol>
<li>단순 흐름: 질문 → 검색 → 답변</li>
<li>조건 판단: 정보 부족 → 추가 질문 / 충분 → 검색</li>
<li>검증: 보완 필요 → 재검색 / 충족 → 종료</li>
</ol>
</figure>


간단한 흐름도 상태와 오류 처리가 필요하고, 복잡한 그래프도 불필요한 단계가 많으면 관리가 어려워집니다. 필요한 제어를 기준으로 선택합니다.

## 🎁 프로젝트 설명은 실제 내용과 구분

SenPick은 Django 기반 감정·상황별 선물 추천 프로젝트입니다. 공개 회고에서 설명하는 역할 분리와 조건 기반 추천 흐름을 참고할 수 있지만, CTR 상승이나 특정 프레임워크의 성능 우위를 증명하는 실험은 아닙니다.

## ⚡ 응답 속도를 비교할 때

검색·모델 호출·네트워크 대기·후처리 시간을 나눠 측정합니다. 동일한 모델·프롬프트·요청 조건으로 비교해야 하며, 그래프 구조 자체가 모델 추론을 빠르게 만드는 것은 아닙니다.

## ✅ 선택 기준

표준 통합과 기본 에이전트에서 시작할지, 상태 전이·중단·재개를 직접 제어해야 하는지 판단합니다. 도구 호출 권한, 종료 조건, 외부 작업 재시도와 비용은 어느 쪽에서도 설계해야 합니다.

📚 [LangChain 개요](https://docs.langchain.com/oss/python/langchain/overview) · [LangGraph 개요](https://docs.langchain.com/oss/python/langgraph/overview) · [SenPick 원본](https://github.com/devunis/SenPick)
