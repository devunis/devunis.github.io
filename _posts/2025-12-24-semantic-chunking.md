---
title: "RAG 문서 분할 전략: 고정 길이·구조·의미 기반 청킹"
date: 2025-12-24 09:00:00 +0900
categories: [AI, RAG]
tags: [RAG, Chunking, Semantic-Split, Document-Processing]
last_modified_at: 2026-10-15 14:50:00 +0900
---

청킹은 검색과 문맥 전달에 사용할 문서 단위를 만드는 과정입니다. 한 문서가 너무 길면 필요한 부분을 찾거나 모델에 전달하기 어려워지고, 너무 작게 나누면 설명·표·조건이 분리될 수 있습니다.

## 📏 전략 비교

| 전략 | 방법 | 주의점 |
| --- | --- | --- |
| 고정 길이 | 문자·토큰 길이로 분할 | 문장·표 중간이 잘릴 수 있음 |
| 재귀 분할 | 단락·문장 등 구분자를 우선 적용 | 구분자와 언어·문서 특성 확인 |
| 구조 기반 | 제목·절·코드·표를 기준으로 분할 | 제목 계층과 출처 메타데이터 유지 |
| 의미 기반 | 문장 임베딩 등으로 경계 결정 | 추가 비용, 임계값, 불균일한 길이 |
| 계층형 | 작은 단위로 검색하고 상위 문맥 연결 | 부모·자식 연결과 중복 관리 |

의미 기반이라는 이름만으로 검색 품질이 더 좋다고 단정할 수 없습니다. 문자 수와 토큰 수를 혼용하지 않고 임베딩 모델의 입력 한계를 확인합니다.

## 💻 고정 문자 길이 분할 예제

아래는 경계·오버랩을 이해하기 위한 예제이며 의미 기반 분할기는 아닙니다.

```python
def split_text(text, size, overlap=0):
    if size <= 0 or not 0 <= overlap < size:
        raise ValueError("size > 0, 0 <= overlap < size가 필요합니다")
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = end - overlap
    return chunks

print(split_text("abcdefghij", 4, 1))
# ['abcd', 'defg', 'ghij']
```

## 🔍 오버랩과 메타데이터

오버랩은 경계를 넘어가는 문맥을 보완하지만 중복 검색·저장 비용을 늘릴 수 있습니다. 모든 문서에 맞는 고정 비율은 없습니다. 문서 ID, 제목, 절·페이지, 원문 위치와 버전을 함께 저장하면 출처를 복원하기 쉽습니다.

## 🧪 평가 방법

같은 평가 질의·정답 문서를 사용해 청킹 조건만 바꿉니다. 정답이 검색되는지, 필요한 조건이 한 문맥에 남는지, 중복 후보가 늘어나는지를 확인합니다. 청크 수·색인 비용·검색·생성 지연도 기록합니다.

과거 SenPick 실험표와 고정된 최적 설정은 측정 근거가 없어 제거했습니다. 큰 표·코드·짧은 문서가 있는 데이터셋에서 따로 실패 사례를 확인해야 합니다.

📚 [LangChain Text Splitters](https://docs.langchain.com/oss/python/integrations/splitters/index)
