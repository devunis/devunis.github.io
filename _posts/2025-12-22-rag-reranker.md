---
title: "RAG Reranker로 검색 정확도 30% 개선하기"
date: 2025-12-22 09:00:00 +0900
categories: [AI, RAG]
tags: [RAG, Reranker, BGE, ColBERT, Search-Optimization]
---

RAG 시스템에서 검색 결과의 품질은 최종 응답의 품질을 좌우합니다. 
이번 글에서는 **Reranker**를 도입하여 검색 정확도를 30% 개선한 실전 경험을 공유합니다.

---

## 🤔 Reranker가 필요한 이유

벡터 검색만으로는 충분하지 않은 경우가 많습니다:

```python
# 문제 상황: 단순 벡터 검색
query = "파이썬 비동기 처리 성능 개선 방법"

# 검색 결과
results = [
    "1. 파이썬 기초 문법",           # ❌ 관련 없음
    "2. 비동기 프로그래밍 개요",     # ⚠️ 일부 관련
    "3. asyncio 성능 최적화",        # ✅ 정확히 일치!
    "4. 자바스크립트 async/await",   # ❌ 다른 언어
    "5. 파이썬 동시성 처리",         # ⚠️ 일부 관련
]
```

벡터 검색은 **의미적 유사도**만 고려하지만, 실제로는:
- 🎯 **질문-문서 관련성** (Relevance)
- 📊 **구체성** (Specificity)
- 🔍 **정확한 답변 포함 여부**

이 모든 것을 고려해야 합니다.

---

## 🔄 Retrieval vs Reranking

### 2단계 파이프라인

```
[User Query] 
    ↓
[1️⃣ Retrieval] ← 빠른 검색 (벡터 DB)
    ↓ (100개 후보)
[2️⃣ Reranking] ← 정밀한 재정렬
    ↓ (상위 5개)
[LLM Generator]
```

### 왜 2단계인가?

| 단계 | 목적 | 속도 | 정확도 |
|------|------|------|--------|
| Retrieval | 후보 추출 | 빠름 ⚡ | 중간 |
| Reranking | 정밀 평가 | 느림 🐢 | 높음 |

Reranker는 모든 문서에 적용하기엔 느리지만, 소수 후보에만 적용하면 효율적입니다!

---

## 🏆 주요 Reranker 모델

### 1. BGE Reranker (추천 ⭐)

**특징**:
- 🇨🇳 BAAI(Beijing Academy of AI)에서 개발
- ✅ 한국어 지원 우수
- ✅ 무료 오픈소스
- ✅ 빠른 속도

```python
from sentence_transformers import CrossEncoder

# 모델 로드
reranker = CrossEncoder('BAAI/bge-reranker-large')

# 사용 예시
query = "파이썬 비동기 성능 개선"
documents = [
    "asyncio는 파이썬의 비동기 처리 라이브러리입니다",
    "자바스크립트의 async/await 문법",
    "Python의 GIL은 성능에 영향을 줍니다",
]

# 질문-문서 쌍 생성
pairs = [[query, doc] for doc in documents]

# 점수 계산
scores = reranker.predict(pairs)

# 정렬
ranked_results = sorted(
    zip(documents, scores),
    key=lambda x: x[1],
    reverse=True
)

for doc, score in ranked_results:
    print(f"점수: {score:.4f} | {doc}")
```

**출력**:
```
점수: 0.8932 | asyncio는 파이썬의 비동기 처리 라이브러리입니다
점수: 0.4521 | Python의 GIL은 성능에 영향을 줍니다
점수: 0.1243 | 자바스크립트의 async/await 문법
```

### 2. ColBERT

**특징**:
- 🎯 Late Interaction 메커니즘
- ✅ 더 정확한 토큰 레벨 매칭
- ❌ 느린 속도
- ❌ 큰 모델 크기

```python
from colbert.infra import Run, RunConfig
from colbert.data import Queries
from colbert import Searcher

# ColBERT 검색
with Run().context(RunConfig(nranks=1, experiment="my_experiment")):
    searcher = Searcher(index="my_index")
    results = searcher.search(query, k=10)
```

### 3. Cohere Rerank API

**특징**:
- 🌐 클라우드 API
- ✅ 간단한 사용
- ✅ 다국어 지원
- 💰 유료 (무료 티어 제한적)

```python
import cohere

co = cohere.Client('YOUR_API_KEY')

results = co.rerank(
    query=query,
    documents=documents,
    top_n=5,
    model='rerank-multilingual-v2.0'
)

for result in results:
    print(f"점수: {result.relevance_score} | {result.document['text']}")
```

---

## 💻 RAG 파이프라인 통합

### LangChain 통합

```python
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CrossEncoderReranker
from langchain_community.cross_encoders import HuggingFaceCrossEncoder

# 1. 기본 retriever (벡터 검색)
base_retriever = vectorstore.as_retriever(
    search_kwargs={"k": 20}  # 20개 후보 검색
)

# 2. Reranker 설정
model = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-large")
compressor = CrossEncoderReranker(model=model, top_n=5)

# 3. 통합 retriever
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)

# 4. 사용
docs = compression_retriever.get_relevant_documents(query)
```

### FastAPI 엔드포인트

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

@app.post("/search")
async def search_with_rerank(request: SearchRequest):
    # 1단계: 벡터 검색
    candidates = await vector_search(
        request.query,
        k=50  # 50개 후보
    )
    
    # 2단계: Reranking
    pairs = [[request.query, doc.content] for doc in candidates]
    scores = reranker.predict(pairs)
    
    # 정렬 및 상위 k개 선택
    ranked_docs = sorted(
        zip(candidates, scores),
        key=lambda x: x[1],
        reverse=True
    )[:request.top_k]
    
    return {
        "results": [
            {
                "content": doc.content,
                "score": float(score),
                "metadata": doc.metadata
            }
            for doc, score in ranked_docs
        ]
    }
```

---

## 📊 성능 개선 실험 결과

### 실험 설정
- **데이터셋**: SenPick 기술 문서 1,000건
- **평가 지표**: NDCG@5, MRR, Precision@5
- **테스트 쿼리**: 100개

### Before (벡터 검색만)

```python
# 벡터 검색만 사용
results = qdrant_client.search(
    collection_name="docs",
    query_vector=embed(query),
    limit=5
)
```

**결과**:
- NDCG@5: 0.67
- MRR: 0.72
- Precision@5: 0.58

### After (벡터 검색 + Reranker)

```python
# 1. 벡터 검색 (20개)
candidates = qdrant_client.search(
    collection_name="docs",
    query_vector=embed(query),
    limit=20
)

# 2. Reranking (상위 5개)
pairs = [[query, c.payload["content"]] for c in candidates]
scores = reranker.predict(pairs)
top5 = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)[:5]
```

**결과**:
- NDCG@5: 0.87 ⬆️ **+30%**
- MRR: 0.91 ⬆️ **+26%**
- Precision@5: 0.78 ⬆️ **+34%**

### 실제 사용자 피드백

| 지표 | Before | After | 개선율 |
|------|--------|-------|--------|
| 만족도 (5점) | 3.2 | 4.1 | +28% |
| CTR | 12% | 15% | +25% |
| 재방문율 | 45% | 58% | +29% |

---

## ⚖️ 비용 vs 성능 트레이드오프

### 지연시간 분석

```python
import time

# 벡터 검색만
start = time.time()
results = vector_search(query, k=5)
print(f"벡터 검색: {(time.time() - start)*1000:.1f}ms")  # 15ms

# 벡터 검색 + Reranker
start = time.time()
candidates = vector_search(query, k=20)  # 20ms
scores = reranker.predict(pairs)  # 45ms
print(f"전체: {(time.time() - start)*1000:.1f}ms")  # 65ms
```

### 최적화 전략

#### 1. 후보 수 최적화

```python
# 실험을 통해 최적 후보 수 찾기
for k in [10, 20, 30, 50]:
    candidates = vector_search(query, k=k)
    # Reranking 후 NDCG 측정
```

**결과**: k=20이 속도와 정확도의 균형점!

#### 2. 배치 처리

```python
# 한 번에 여러 쿼리 처리
queries = ["query1", "query2", "query3"]
all_pairs = []

for query in queries:
    candidates = vector_search(query, k=20)
    pairs = [[query, c] for c in candidates]
    all_pairs.extend(pairs)

# 배치로 한 번에 처리 (GPU 활용)
scores = reranker.predict(all_pairs)
```

#### 3. 캐싱

```python
from functools import lru_cache

@lru_cache(maxsize=1000)
def rerank_cached(query: str, doc_ids: tuple):
    # 동일한 쿼리-문서 조합은 캐시에서 반환
    ...
```

---

## 🎯 실전 적용 팁

### 1. 모델 선택 가이드

```python
# 빠른 응답 필요 (< 50ms)
reranker = CrossEncoder('BAAI/bge-reranker-base')  # base 버전

# 정확도 우선 (< 100ms 허용)
reranker = CrossEncoder('BAAI/bge-reranker-large')  # large 버전

# 최고 정확도 (속도 무관)
# ColBERT 사용
```

### 2. 하이브리드 검색 + Reranking

```python
from langchain.retrievers import EnsembleRetriever

# 벡터 검색 + 키워드 검색
vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})
bm25_retriever = BM25Retriever.from_documents(docs, k=10)

# 앙상블
ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.5, 0.5]
)

# Reranking 추가
final_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=ensemble_retriever
)
```

### 3. 모니터링

```python
import logging

logger = logging.getLogger(__name__)

def search_with_metrics(query: str):
    start = time.time()
    
    # 검색
    candidates = vector_search(query, k=20)
    retrieval_time = time.time() - start
    
    # Reranking
    start = time.time()
    scores = reranker.predict(pairs)
    rerank_time = time.time() - start
    
    # 로깅
    logger.info(f"Query: {query}")
    logger.info(f"Retrieval: {retrieval_time*1000:.1f}ms")
    logger.info(f"Reranking: {rerank_time*1000:.1f}ms")
    logger.info(f"Top score: {max(scores):.4f}")
    
    return results
```

---

## 📝 정리

### Reranker 도입 체크리스트
- ✅ 벡터 검색 결과가 만족스럽지 않은가?
- ✅ 50-100ms 추가 지연을 감당할 수 있는가?
- ✅ 정확도가 사용자 경험에 중요한가?
- ✅ 충분한 GPU/CPU 리소스가 있는가?

### 권장 설정
```python
# 프로덕션 권장 설정
RETRIEVAL_K = 20  # 검색 후보 수
RERANK_TOP_N = 5  # 최종 결과 수
MODEL = "BAAI/bge-reranker-large"  # 한국어 지원 우수
```

Reranker는 RAG 시스템의 품질을 크게 향상시킬 수 있는 강력한 도구입니다. 
SenPick에서는 30% 정확도 개선과 함께 사용자 만족도가 크게 상승했습니다! 🎉

---

📚 **참고 자료**:
- [BGE Reranker](https://github.com/FlagOpen/FlagEmbedding)
- [Cohere Rerank API](https://cohere.com/rerank)
