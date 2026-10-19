---
title: "TypeSafe Jev란? 빠른 의사결정을 위한 AI 모델과 활용 방법"
date: 2026-10-16 00:01:00 +0900
categories: [AI, Models]
tags: [Jev, TypeSafe, System-One, Decision-Model, Python, AI-Agent]
---

AI 서비스에서 필요한 답이 항상 긴 문장은 아닙니다. 고객 문의를 어느 팀으로 보낼지, 검색 결과가 질문과 관련 있는지, 다음 단계에 어떤 도구를 사용할지처럼 **정해진 범위 안에서 판단 하나가 필요한 순간**도 많습니다.

TypeSafe의 **Jev**는 이런 판단을 소프트웨어 안에서 처리하기 위한 모델입니다. 이 글에서는 2026년 10월 16일 기준 공식 문서를 바탕으로 개념과 사용 방법을 살펴봅니다. 직접 운영하거나 성능을 측정한 후기는 아닙니다.

## Jev와 System One 모델

TypeSafe는 Jev를 자사의 첫 공개 **System One 모델**로 소개합니다. 입력 상태와 질문을 전달하면 코드가 소비할 수 있는 구조화된 판단을 반환합니다. 여기서 System One은 TypeSafe가 설명하는 모델 범주이며, 사람의 인지 체계와 동일하게 작동한다는 뜻으로 받아들이지는 않아야 합니다.

서비스 입장에서 보면 다음과 같은 역할입니다.

<figure class="article-diagram">
<figcaption>처리 흐름</figcaption>
<ol>
<li>고객 문의</li>
<li>Jev: 담당 팀 선택</li>
<li>서비스 코드: 결과·검토 기준 확인</li>
<li>담당 팀 전달 또는 검토 대기열 보관</li>
</ol>
</figure>


자유로운 답변 생성과 범위가 정해진 판단을 나누면 각각을 별도로 평가하기 쉬워집니다. Jev의 개념과 기본 입력은 [공식 Introduction](https://docs.typesafe.ai/introduction)에서 확인할 수 있습니다.

## LLM의 구조화 출력과 무엇이 다른가?

일반적인 LLM도 JSON 스키마나 구조화 출력 기능으로 분류 결과를 반환할 수 있습니다. 따라서 “LLM은 구조화된 값을 반환하지 못한다”는 설명은 맞지 않습니다.

차이는 무엇을 중심으로 제공되는가에 있습니다. TypeSafe는 Jev를 텍스트 생성 없이 질문 타입에 맞는 판단을 내리는 모델로 설명하고, 이를 위한 API를 제공합니다. **출력 형식이 정해져 있다는 사실과 판단 내용이 맞다는 사실은 별개**입니다.

| 구분 | 일반적인 생성형 LLM | Jev |
| --- | --- | --- |
| 대표적인 작업 | 설명, 요약, 코드·문장 생성 | 선택, 기준에 따른 점수화, 명제 판단 |
| 결과 활용 | 사람이 읽거나 코드가 구조화 출력을 처리 | 코드가 판단 값을 받아 분기·정렬 |
| 서비스 설계 | 생성 품질과 출력 계약을 함께 설계 | 질문·선택지·판단 기준을 명확히 설계 |
| 함께 쓸 수 있는 방식 | 선택된 자료로 최종 답변 생성 | 앞단에서 경로나 관련성 판단 |

TypeSafe는 새로운 아키텍처와 **RLCD(Reinforcement Learning for Calibrated Decisions)**를 소개합니다. 공개된 제품 설명만으로 내부 구현 전체나 모든 작업에서의 우위를 확인할 수 있는 것은 아닙니다. [TypeSafe 공식 소개](https://typesafe.ai/)

## 세 가지 질문 타입: Choice, Score, Noul

### Choice: 후보 중 하나 선택

Choice는 부서, 문서 종류, 처리 경로처럼 미리 정의한 선택지 중 하나를 고릅니다. 응답에는 선택 결과인 `choice`, 선택지별 `probabilities`, 그리고 `confidence`가 포함됩니다.

선택지를 설계할 때에는 서로 겹치는 범위를 줄이는 것이 좋습니다. 어떤 후보에도 맞지 않는 입력이 들어올 수 있다면 `other` 같은 항목도 마련합니다. 예를 들어 배송과 결제 문제를 함께 말한 문의는 단순한 한 가지 분류만으로 충분하지 않을 수 있습니다. [Choice 문서](https://docs.typesafe.ai/primitives/choice)

### Score: 순서가 있는 기준으로 평가

Score는 관련성이나 긴급성처럼 정도를 판단할 때 사용합니다. 순서가 있는 기준 목록을 정의하고 결과로 `score`, `probabilities`, `confidence`를 받습니다.

“좋은 문서인지 평가해줘”보다 “질문과 무관함 → 일부 관련 있음 → 질문에 직접 답함”처럼 구분 가능한 기준을 주는 편이 평가 목적을 분명하게 만듭니다. 숫자만 보고 의미를 추측하지 않도록 기준과 결과를 함께 저장하는 것도 좋습니다. [Score 문서](https://docs.typesafe.ai/primitives/score)

### Noul: 명제의 참일 확률

Noul은 제시한 문장이 참인지 묻고 `noul`이라는 0~1 범위의 값을 반환합니다. 단순한 불리언 값으로 이해하기보다, 애플리케이션이 기준을 적용하기 전의 확률 신호로 보는 것이 적절합니다.

예를 들어 “이 문의는 배송 상태 확인을 요청한다”라는 명제를 평가할 수 있습니다. Choice·Score와 달리 별도의 `confidence` 필드가 있다고 가정하면 안 됩니다. [Noul 문서](https://docs.typesafe.ai/primitives/noul)

## Python으로 문의 분류하기

아래는 공식 SDK 호출 형태를 사용한 학습용 예제입니다. Python 3.10 이상이 필요하며, API 키를 발급받아 `TYPESAFE_API_KEY` 환경 변수에 설정합니다. 키를 소스 파일이나 블로그에 넣지 않습니다.

```bash
python3 -m venv .venv
.venv/bin/pip install typesafe-sdk
```

```python
from typesafe_sdk import Choice, TypeSafeClient

with TypeSafeClient(model="jev-latest") as client:
    response = client.system_one(
        state="My parcel has not arrived. Where can I track it?",
        questions={
            "team": Choice(
                instructions="Choose the team responsible for this request.",
                criteria={
                    "shipping": "Delivery status and parcel tracking",
                    "billing": "Payments and invoices",
                    "other": "Requests outside the listed teams",
                },
            )
        },
    )

answer = response.choices["team"]
print("선택:", answer.choice)
print("선택지별 확률:", answer.probabilities)
print("확신도:", answer.confidence)
```

이 코드는 출력값을 확인하는 데까지만 진행합니다. 실제 문의를 전송하는 기능은 별도로 구현해야 합니다. 예상 결과를 실제 실행 결과처럼 제시하지 않았으며, 이 글 작성 과정에서 유료 API 호출은 수행하지 않았습니다. SDK·인증·HTTP 엔드포인트는 [공식 Quick start](https://docs.typesafe.ai/introduction/quickstart)를 기준으로 했습니다.

## 확신도는 정답 보증이 아니다

Choice의 특정 선택지 확률과 `confidence`는 같은 값이 아닙니다. 공식 문서는 확신도를 확률 분포가 퍼진 정도와 연결해 설명합니다. 여러 선택지로 확률이 나뉘는 입력과 하나로 집중되는 입력은 다르게 처리할 수 있습니다.

그렇다고 높은 확신도가 오류 가능성을 없애지는 않습니다. 실제 데이터에서 오분류와 확신도를 함께 관찰하고, 어떤 입력을 자동 처리할지 결정해야 합니다. 임의로 정한 임계값을 모든 서비스에 적용할 근거는 없습니다. [Confidence 문서](https://docs.typesafe.ai/confidence)

## 백엔드와 RAG에서 어떻게 활용할까?

다음은 도입을 검토할 수 있는 **설계 예시**이며, 제 프로젝트에 적용해 성과를 확인했다는 의미는 아닙니다.

- **문의 라우팅:** 문의 유형을 선택한 뒤 해당 처리 흐름으로 연결합니다. 여러 문제가 섞인 경우를 별도로 다룹니다.
- **RAG 관련성 평가:** 검색된 문서가 질문에 답하는지를 기준별로 평가하고, 답변 생성에 전달할 자료를 고릅니다.
- **에이전트 경로 선택:** 현재 상태에서 사용할 도구나 다음 단계를 선택합니다. 도구 실행 권한과 입력 검증은 서비스 코드가 담당합니다.

RAG에 추가한다면 검색 시간을 포함한 전체 응답 시간과 실제 답변 품질을 비교해야 합니다. 판단 단계 하나가 빨라도 네트워크와 추가 호출 때문에 전체 서비스가 느려질 가능성은 있습니다.

## 빠르고 저렴하다는 말은 어떻게 확인할까?

공식 사이트는 특정 워크플로에서의 속도·비용 비교를 제시합니다. 하지만 그 수치를 모든 입력과 서비스의 성능으로 일반화할 수는 없습니다. 모델 비교에서는 **같은 작업·입력·품질 기준**을 사용하는 것이 중요합니다.

직접 검증할 때에는 다음을 기록할 수 있습니다.

| 항목 | 확인할 내용 |
| --- | --- |
| 정확성 | 정답이 있는 평가 데이터에서의 오분류와 유형별 오류 |
| 지연 시간 | 네트워크를 포함한 p50·p95와 타임아웃 |
| 비용 | 실패·재시도를 포함한 전체 처리 비용 |
| 확률 품질 | 높은 확률을 준 결과가 실제로 얼마나 자주 맞는지 |
| 대체 방식 | 규칙, 기존 분류기, LLM 구조화 출력과의 비교 |

키워드만으로 충분히 처리되는 문제라면 규칙이 더 단순할 수 있습니다. 긴 설명이나 복잡한 문제 풀이가 필요하면 생성형 모델이 더 적절할 수 있습니다. Jev의 도입 여부는 모델 이름보다 **서비스에 필요한 판단과 평가 결과**로 결정하는 편이 좋습니다.

## 참고 자료

- [TypeSafe 공식 사이트](https://typesafe.ai/)
- [Introduction](https://docs.typesafe.ai/introduction)
- [Quick start](https://docs.typesafe.ai/introduction/quickstart)
- [Choice](https://docs.typesafe.ai/primitives/choice) · [Score](https://docs.typesafe.ai/primitives/score) · [Noul](https://docs.typesafe.ai/primitives/noul)
- [Confidence](https://docs.typesafe.ai/confidence)
- [공식 Python SDK](https://github.com/typesafe-ai/typesafe-sdk-python)
