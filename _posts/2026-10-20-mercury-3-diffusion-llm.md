---
title: "Mercury 3 조사: 확산 LLM은 어떻게 빠르게 답할까?"
date: 2026-10-20 00:05:00 +0900
categories: [AI, Models]
tags: [Mercury-3, Inception, Diffusion-LLM, Streaming, AI-Agent]
---

Inception이 2026년 10월 19일 **Mercury 3**를 발표했습니다. 관심을 끄는 것은 속도뿐 아니라, 여러 토큰을 병렬로 예측하는 **확산 기반 언어 모델(diffusion LLM, dLLM)**이라는 접근입니다.

이 글은 2026년 10월 20일 확인한 발표·공식 API 문서·기존 Mercury 연구를 바탕으로 정리합니다. Mercury 3를 직접 벤치마크하거나 유료 API로 시험한 후기는 아닙니다. 제품 사양과 발표자의 성능 주장을 구분합니다. [공식 발표](https://www.inceptionlabs.ai/blog/introducing-mercury-3)

## 발표에서 무엇을 주장했나?

Inception은 NVIDIA GPU에서 **초당 1,068토큰**의 생성 속도를 제시하고, 일부 속도 지향 모델과 비교한 품질·속도 우위를 주장합니다. 이는 **제공자가 발표한 조건의 수치**이며, 이 글의 독립 측정값이 아닙니다.

같은 발표에서는 Mercury 1보다 총 파라미터 규모를 40배 이상 키웠다고 설명합니다. 상대적 증가율만으로 Mercury 3의 정확한 파라미터 수나 운영에 필요한 GPU 구성을 계산할 수는 없습니다. [발표의 확장성 설명](https://www.inceptionlabs.ai/blog/introducing-mercury-3)

“모든 모델보다 모든 작업에서 낫다”는 결론으로 읽지는 않아야 합니다. 비교 대상·추론 설정·입출력 길이·동시 요청 수·평가 도구가 달라지면 결과도 달라질 수 있습니다.

## 자기회귀와 확산: 무엇이 다른가?

일반적인 자기회귀 생성은 이전 토큰을 조건으로 다음 토큰을 예측합니다. 확산 언어 모델은 불완전하거나 마스킹된 표현을 여러 단계에 걸쳐 정제하면서 여러 위치의 토큰을 예측하는 접근을 사용합니다.

<figure class="article-diagram diagram-alternatives">
<figcaption>생성 순서를 이해하기 위한 개념도</figcaption>
<ol>
<li>자기회귀: 앞선 문맥 → 다음 토큰 예측 → 문맥에 추가 → 반복</li>
<li>확산: 불완전한 토큰 배열 → 여러 위치를 병렬로 예측·정제 → 반복 → 확정된 텍스트</li>
</ol>
</figure>

이는 이해를 위한 단순화입니다. 모든 확산 모델이 문장 전체를 한 번에 완성하거나 항상 같은 개수의 정제 단계를 사용하는 것은 아닙니다. 병렬 예측도 비용 없는 연산은 아닙니다.

2025년 Mercury 논문은 Transformer 기반으로 여러 토큰을 병렬 예측하는 모델을 설명합니다. 다만 해당 보고서의 대상은 **이전 Mercury Coder 계열**입니다. 논문에 나온 속도·하드웨어·평가 결과를 Mercury 3의 결과로 옮겨 적을 수는 없습니다. [Mercury 연구 논문](https://arxiv.org/abs/2506.17298)

확산 모델이므로 Transformer를 쓰지 않는다는 설명도 맞지 않습니다. 모델의 구성 요소와 생성 절차는 다른 구분입니다.

## 공식 API 문서 기준 사양

| 항목 | Mercury 3 |
| --- | --- |
| 모델 ID | `mercury-3` |
| 입력·출력 형식 | 텍스트 |
| 컨텍스트 | 1M 토큰 |
| 최대 출력 | 131,072토큰 |
| 주요 엔드포인트 | `/v1/chat/completions` |
| 기능 | 도구 호출, 구조화 출력, 스트리밍 |

수치는 API 문서의 공개 한도입니다. 컨텍스트가 크다고 그 길이 전체에서 필요한 정보를 항상 정확히 찾는다는 뜻은 아닙니다. 최대 컨텍스트와 최대 출력을 동시에 모두 사용할 수 있다고도 가정하지 않습니다. 요청 제한·요금·사용 가능 범위는 실제 계정과 최신 문서를 확인해야 합니다. [모델 문서](https://docs.inceptionlabs.ai/get-started/models)

텍스트 지원 모델이므로, 이미지나 스캔 PDF의 시각적 내용을 그대로 이해한다고 가정해서는 안 됩니다. 문서 처리에는 별도 추출·OCR 등이 필요한지 확인합니다.

## 가격: 정가와 출시 할인을 구분하자

단위는 **100만 토큰당 미국 달러**입니다. 2026년 10월 20일 공식 안내에서 확인한 금액입니다.

| 구분 | 일반 가격 | 출시 할인 가격 |
| --- | --- | --- |
| 입력 | $0.20 | $0.10 |
| 캐시 입력 | $0.02 | $0.01 |
| 출력 | $0.70 | $0.35 |

할인 가격을 영구 가격처럼 계산하면 안 됩니다. 캐시 적중 여부, 추론 관련 사용량과 실제 청구 정책도 확인해야 합니다. [공식 가격·모델 안내](https://www.inceptionlabs.ai/models)

캐시 없는 입력 10,000토큰과 청구 대상 출력 2,000토큰만 있다고 가정하면 출시 할인 단가의 단순 계산은 다음과 같습니다.

```text
입력: 10,000 / 1,000,000 × $0.10 = $0.001
출력:  2,000 / 1,000,000 × $0.35 = $0.0007
합계: $0.0017
```

이는 실제 호출 결과가 아니라 산술 예시입니다. 재시도·도구 호출 반복·추가 추론 사용량·중개 제공자의 요금 등은 포함하지 않았습니다.

## 초당 토큰 수와 첫 답변 시간은 다르다

빠른 생성 속도가 바로 빠른 사용자 경험을 뜻하지는 않습니다.

| 지표 | 확인하는 것 |
| --- | --- |
| TTFT | 첫 출력 토큰이 도착할 때까지의 시간 |
| 첫 답변 시간 | 추론·메타데이터 등을 제외한 사용자가 읽을 답이 시작되는 시점 |
| 생성 처리율 | 생성 구간에서 단위 시간당 전달된 토큰 수 |
| 전체 지연 | 요청 전송부터 필요한 결과를 다 받을 때까지 |
| 서비스 지연 | 검색·도구·DB·모델·화면 반영 등을 포함한 사용자 대기 |

추론을 오래 한 뒤 빠르게 출력하는 경우도 있고, 짧은 응답에서는 연결·첫 출력 지연의 비중이 더 클 수도 있습니다. 따라서 발표의 처리율 하나로 음성 에이전트나 짧은 분류 요청의 체감 속도를 계산하지 않습니다.

## reasoning_effort를 고정해야 비교가 된다

공식 문서는 `instant`, `low`, `medium`, `high`를 제공합니다. Mercury 3에서 생략 시 기본값은 `low`입니다. 이전 Mercury 2·2.5는 기본값이 `medium`으로 설명되어 있습니다. [추론 설정 문서](https://docs.inceptionlabs.ai/capabilities/reasoning-efforts)

모델 이름만 바꾸고 같은 조건으로 비교했다고 생각하면 기본값 차이를 놓칠 수 있습니다. 테스트할 때는 설정과 출력 한도를 기록하고, 속도와 과제 성공률을 함께 봐야 합니다. `high`가 모든 입력의 정답을 보장하는 것도 아닙니다.

## 일반 스트리밍과 diffusing 모드

Mercury는 확산 모델이지만 스트리밍도 지원합니다. 공식 문서는 일반 스트리밍에서 정제된 텍스트를 블록 단위로 내보낸다고 설명합니다.

별도로 `diffusing=true`를 사용하면 중간 정제 과정을 볼 수 있습니다. 이 모드는 각 청크가 그 시점의 전체 텍스트를 담는 것으로 설명됩니다. **기존 내용 뒤에 계속 붙이면 중복될 수 있으므로 표시 내용을 교체하는 방식이 필요합니다.** [Streaming & Diffusion 문서](https://docs.inceptionlabs.ai/capabilities/streaming)

<figure class="article-diagram diagram-alternatives">
<figcaption>화면에 반영하는 방식도 구분한다</figcaption>
<ol>
<li>일반 스트리밍: 새 content 조각을 기존 답변에 추가</li>
<li>diffusing 모드: 중간 전체 텍스트로 화면 내용을 갱신</li>
<li>공통: 전송 조각과 이벤트 경계는 다를 수 있으므로 스트림 파싱 필요</li>
</ol>
</figure>

중간 정제 텍스트는 확정된 결과와 구분해서 취급해야 합니다. 바뀔 수 있는 중간 텍스트를 근거로 결제·삭제·DB 변경 같은 동작을 실행하도록 연결하지 않습니다.

## 공식 SDK로 호출하는 Python 예제

공식 Quick Start는 `inceptionai` SDK를 안내합니다. 키를 발급받아 `INCEPTION_API_KEY` 환경 변수에 설정한 뒤 서버 환경에서 실행합니다. 브라우저 코드나 공개 저장소에 키를 넣지 않습니다.

```bash
python -m pip install inceptionai
```

```python
from inceptionai import Inception

client = Inception()  # INCEPTION_API_KEY 환경 변수 사용

response = client.chat.completions.create(
    model="mercury-3",
    messages=[{
        "role": "user",
        "content": "네트워크 타임아웃과 서버 처리 실패의 차이를 설명해줘."
    }],
    reasoning_effort="medium",
    temperature=0.75,
    max_completion_tokens=1024,
)

print(response.choices[0].message.content)
```

호출 형태는 [공식 Quick Start](https://docs.inceptionlabs.ai/get-started)를 따릅니다. 이 글에서는 Python 문법을 검사했으며 실제 API 호출·청구·응답 품질은 검증하지 않았습니다. 결과를 실행한 것처럼 만들어 넣지 않았습니다.

일반 스트리밍으로 바꾼 예시는 다음과 같습니다.

```python
from inceptionai import Inception

client = Inception()
stream = client.chat.completions.create(
    model="mercury-3",
    messages=[{"role": "user", "content": "RAG의 검색 단계를 간단히 설명해줘."}],
    reasoning_effort="low",
    max_completion_tokens=512,
    stream=True,
)

for chunk in stream:
    if chunk.choices:
        text = chunk.choices[0].delta.content
        if text:
            print(text, end="", flush=True)
print()
```

이 코드는 content만 출력하는 최소 예제입니다. 운영에서는 오류·시간 제한·연결 종료·사용량·필요한 추론 필드 등도 처리해야 합니다.

## 에이전트 개발에서 볼 부분

공식 문서는 도구 호출과 구조화 출력을 제공합니다. 도구 호출은 모델이 실행할 함수와 인자를 제안하는 흐름이며, 실제 실행과 권한 검증은 애플리케이션의 책임입니다. [Tool Use](https://docs.inceptionlabs.ai/capabilities/tool-use)

JSON 스키마를 따르는 출력도 내용의 사실성이나 업무 규칙의 충족을 보장하지 않습니다. 파싱 이후 도메인 검증을 유지해야 합니다. [Structured Outputs](https://docs.inceptionlabs.ai/capabilities/structured-outputs)

개발 관점에서 기대할 수 있는 것은 반복되는 모델 대기 시간의 감소입니다. 다만 이것은 **실험해 볼 가설**입니다. 모델이 잘못된 도구를 골라 호출 횟수가 늘어나면 빠른 생성이 전체 작업 성공으로 이어지지 않을 수 있습니다.

## Mercury 3·Voice·Decide는 별도 제품이다

| 모델 | 공식 안내에서의 역할 |
| --- | --- |
| Mercury 3 | 텍스트 생성·추론·도구 호출 |
| Mercury Voice | 음성 에이전트용 저지연 요구에 맞춘 모델 |
| Mercury Decide | 분류·점수 등 구조화된 판단 |

이전 글의 [TypeSafe Jev]({% post_url 2026-10-16-typesafe-jev-decision-model %})와 역할을 비교할 때에는 Mercury 3 전체를 같은 종류의 결정 전용 모델로 취급하지 않아야 합니다. 공식 모델 문서는 Decide의 결정 엔드포인트가 채팅·스트리밍·도구 호출을 지원하지 않는다고 구분합니다. [모델별 역할](https://docs.inceptionlabs.ai/get-started/models)

## 도입을 검토한다면 이렇게 확인한다

아래는 직접 측정한 결과가 아닌 평가 설계 제안입니다.

| 평가 항목 | 같은 조건으로 기록할 것 |
| --- | --- |
| 한국어 업무 품질 | 요약 누락·숫자·용어·근거 오류 |
| 도구 호출 | 올바른 도구 선택·인자·호출 횟수·최종 성공 |
| 속도 | 첫 답변·완료 지연의 p50·p95, 동시 요청 조건 |
| 비용 | 추론·재시도를 포함한 성공 작업당 청구량 |
| 긴 문서 | 길이·정보 위치별 추출 정확성 |
| 운영 | 요청 제한·타임아웃·오류·데이터 보관 조건 |

같은 프롬프트·도구·데이터·추론 설정을 기록하고 여러 번 실행해야 합니다. 한국어 사용자 경험과 실제 업무의 정확성을 직접 보지 않은 상태에서 발표 수치만으로 모델을 교체하기는 어렵습니다.

Mercury 3의 흥미로운 지점은 확산 방식의 텍스트 생성이 상용 API와 도구 호출로 연결된다는 데 있습니다. 개발자에게 남는 질문은 **얼마나 빨리 토큰을 내는가를 넘어, 필요한 품질로 작업을 얼마나 빨리 끝내는가**입니다.

## 참고 자료·관련 글

- [Mercury 3 공식 발표](https://www.inceptionlabs.ai/blog/introducing-mercury-3)
- [모델 사양](https://docs.inceptionlabs.ai/get-started/models) · [가격](https://www.inceptionlabs.ai/models)
- [Mercury 논문 — 이전 Coder 계열](https://arxiv.org/abs/2506.17298)
- [SDK Quick Start](https://docs.inceptionlabs.ai/get-started)
- [추론 설정](https://docs.inceptionlabs.ai/capabilities/reasoning-efforts) · [스트리밍](https://docs.inceptionlabs.ai/capabilities/streaming)
- [폴링·SSE·WebSocket 비교]({% post_url 2026-10-20-polling-sse-websocket %})
