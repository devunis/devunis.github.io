---
title: "RAG Reranker: 검색 후보 재정렬과 평가 방법"
date: 2025-12-22 09:00:00 +0900
categories: [AI, RAG]
tags: [RAG, Reranker, BGE, ColBERT, Search-Optimization]
last_modified_at: 2026-10-15 14:50:00 +0900
---

Reranker는 검색 단계에서 찾은 후보를 질의와 함께 다시 평가해 순서를 정하는 구성 요소입니다. 이 글은 동작과 평가 방법을 설명하며, 측정 근거가 없는 검색 개선율·사용자 반응 수치는 제시하지 않습니다.

## 🔎 검색과 재정렬의 역할

벡터 검색은 많은 문서에서 후보를 좁히고, Cross-Encoder 계열 reranker는 질의와 후보 문서 쌍을 함께 평가할 수 있습니다. 모든 reranker가 같은 구조인 것은 아니므로 모델 문서를 확인합니다.

<figure class="article-diagram">
<figcaption>처리 흐름</figcaption>
<ol>
<li>질의</li>
<li>후보 검색</li>
<li>질의·문서 쌍 평가</li>
<li>재정렬</li>
<li>상위 문서</li>
<li>답변 생성</li>
</ol>
</figure>


검색 단계에서 정답 문서를 놓치면 reranker도 그 문서를 복원할 수 없습니다. 후보의 재현율과 재정렬 품질을 나눠 봐야 합니다.

## 💻 점수에 따라 후보 정렬하기

아래는 모델 호출을 제외한 재정렬 예제입니다. 점수는 정렬 동작을 설명하는 입력값이며 실제 모델의 출력·성능이 아닙니다.

```python
def rank_candidates(documents, scores, limit):
    if len(documents) != len(scores):
        raise ValueError("문서와 점수 수가 다릅니다")
    if limit < 0:
        raise ValueError("limit은 음수일 수 없습니다")
    ranked = sorted(zip(documents, scores), key=lambda item: item[1], reverse=True)
    return [document for document, _ in ranked[:limit]]

print(rank_candidates(["문서 A", "문서 B", "문서 C"], [0.2, 0.8, 0.5], 2))
# ['문서 B', '문서 C']
```

실제 연동에서는 모델별 토큰 길이·배치 크기·점수 의미를 확인합니다. 점수를 그대로 관련성 확률이라고 해석하지 않습니다.

## 📊 평가 계획

| 지표 | 확인할 내용 |
| --- | --- |
| Recall@K | 후보에 정답 문서가 포함되는가? |
| MRR | 첫 관련 문서가 어느 순위에 있는가? |
| NDCG@K | 관련성 등급과 순서를 함께 평가 |
| 지연·비용 | 모델 호출과 문서 길이에 따른 추가 부담 |

같은 질의·정답·후보 조건에서 재정렬 전후를 비교하고, 튜닝용 데이터와 최종 평가용 데이터를 구분합니다. 정답 판정 기준과 표본도 기록해야 합니다.

## ⚡ 지연을 줄이는 방법

후보 수·문서 길이·배치 크기를 조정하고, 같은 질의·문서 조합의 캐싱을 검토할 수 있습니다. 특정 후보 수나 지연 시간이 모든 환경의 최적값은 아닙니다. 권한 필터를 유지하고 검색·재정렬·생성 단계를 각각 측정합니다.

## ✅ 적용 판단

검색 후보에는 정답이 있지만 상위 순위에 나타나지 않는 경우 재정렬을 검토할 수 있습니다. 도입 후 검색 품질이 실제로 나아지는지와 추가 비용·지연이 허용 가능한지를 함께 확인합니다.

📚 [Sentence Transformers Cross-Encoders](https://www.sbert.net/docs/cross_encoder/usage/usage.html)
