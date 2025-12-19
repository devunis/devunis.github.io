---
title: "Semantic Chunking: RAG 성능을 좌우하는 문서 분할 전략"
date: 2025-12-24 09:00:00 +0900
categories: [AI, RAG]
tags: [RAG, Chunking, Semantic-Split, Document-Processing]
---

RAG 시스템에서 문서를 어떻게 나누느냐는 검색 품질에 결정적인 영향을 미칩니다. 
이번 글에서는 다양한 **Chunking 전략**과 각각의 장단점, 그리고 최적 설정을 찾는 방법을 다룹니다.

---

## 🤔 Chunking이 RAG에 미치는 영향

### 문제 상황

```python
# 나쁜 예: 전체 문서를 하나의 청크로
document = """
(10,000자 분량의 긴 기술 문서)
파이썬 소개... asyncio 설명... 성능 최적화... 배포 전략...
"""

chunks = [document]  # 단 1개의 청크

# 문제점:
# 1. 임베딩이 너무 일반적 → 검색 정확도 하락
# 2. LLM 컨텍스트 한계 초과 가능
# 3. 관련 없는 정보까지 포함 → 노이즈 증가
```

### 좋은 예: 적절한 크기로 분할

```python
chunks = [
    "파이썬 소개: 파이썬은...",           # 200자
    "asyncio 개념: 비동기 프로그래밍...",  # 250자
    "성능 최적화: 다음 방법들로...",       # 180자
]

# 장점:
# 1. 각 청크가 명확한 주제
# 2. 검색 정확도 향상
# 3. LLM 컨텍스트 효율적 사용
```

---

## 📏 Fixed-size vs Semantic Chunking

### 1. Fixed-size Chunking

**고정된 문자/토큰 수로 분할**

```python
def fixed_size_chunking(text: str, chunk_size: int = 500, overlap: int = 50):
    """고정 크기 청킹"""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = end - overlap  # 오버랩 적용
    
    return chunks

# 사용
text = "긴 문서 내용..."
chunks = fixed_size_chunking(text, chunk_size=500, overlap=50)
```

**장점**:
- ✅ 구현 간단
- ✅ 예측 가능한 청크 수
- ✅ 빠른 처리

**단점**:
- ❌ 문장 중간에서 잘림
- ❌ 문맥 손실 가능
- ❌ 의미 단위 무시

### 2. Semantic Chunking

**의미 단위로 분할**

```python
from langchain.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# 임베딩 기반 의미 분할
text_splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile"  # 의미 변화 감지
)

chunks = text_splitter.split_text(text)

# 각 청크는 의미적으로 연관된 내용만 포함
```

**장점**:
- ✅ 문맥 보존
- ✅ 의미 단위 유지
- ✅ 더 나은 검색 품질

**단점**:
- ❌ 느린 처리 (임베딩 필요)
- ❌ 청크 크기 불균등
- ❌ 복잡한 구현

---

## 🪟 Sliding Window 기법

청크 간 오버랩을 통해 문맥 연결성 유지!

```python
text = "A B C D E F G H I J"

# 오버랩 없음
chunks = ["A B C", "D E F", "G H I"]  # 문맥 단절

# 오버랩 있음 (1개)
chunks = ["A B C", "C D E", "E F G", "G H I"]  # 연결성 유지
```

### 구현

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,  # 20% 오버랩
    length_function=len,
    separators=["\n\n", "\n", ". ", " ", ""]
)

chunks = splitter.split_text(text)

# 예시 출력
print(f"청크 1: ...성능 최적화가 중요합니다.")
print(f"청크 2: 성능 최적화가 중요합니다. 다음 방법을...")
#                ↑ 오버랩 영역
```

**오버랩 크기 선택 가이드**:
- 📌 10-20%: 일반적인 경우
- 📌 20-30%: 높은 문맥 의존성
- 📌 5-10%: 메모리 제약

---

## 📄 문장/단락 기반 분할

### 문장 기반

```python
from langchain.text_splitter import CharacterTextSplitter

# 문장 단위로 분할
splitter = CharacterTextSplitter(
    separator=". ",
    chunk_size=1000,
    chunk_overlap=0
)

chunks = splitter.split_text(text)
```

### 단락 기반

```python
# 단락(이중 줄바꿈) 단위
splitter = CharacterTextSplitter(
    separator="\n\n",
    chunk_size=1000,
    chunk_overlap=100
)

chunks = splitter.split_text(text)
```

### 계층적 분할

```python
# 우선순위: 단락 > 문장 > 단어
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=[
        "\n\n",  # 단락
        "\n",    # 줄바꿈
        ". ",    # 문장
        " ",     # 단어
        ""       # 문자
    ]
)

# 가능한 한 큰 단위로 분할 시도
chunks = splitter.split_text(text)
```

---

## 🔧 LangChain RecursiveCharacterTextSplitter 실전

### 기본 사용

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
    is_separator_regex=False,
)

# 문서 분할
texts = text_splitter.create_documents([long_document])

# 메타데이터 포함
texts = text_splitter.create_documents(
    [long_document],
    metadatas=[{"source": "doc1.pdf", "page": 1}]
)
```

### 코드 특화 분할

```python
from langchain.text_splitter import Language, RecursiveCharacterTextSplitter

# Python 코드 분할
python_splitter = RecursiveCharacterTextSplitter.from_language(
    language=Language.PYTHON,
    chunk_size=500,
    chunk_overlap=50
)

code = """
def example():
    # 함수 정의
    pass

class MyClass:
    # 클래스 정의
    pass
"""

chunks = python_splitter.split_text(code)
# 함수/클래스 단위로 분할 시도
```

### Markdown 특화

```python
from langchain.text_splitter import MarkdownHeaderTextSplitter

# 헤더 기반 분할
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on
)

markdown_text = """
# Introduction
This is intro.

## Section 1
Content 1.

## Section 2
Content 2.
"""

chunks = markdown_splitter.split_text(markdown_text)

# 각 청크는 헤더 정보를 메타데이터로 포함
for chunk in chunks:
    print(chunk.metadata)  # {"Header 1": "Introduction", "Header 2": "Section 1"}
```

---

## 🎯 최적 Chunk 크기 결정 방법

### 실험적 접근

```python
import numpy as np
from sklearn.metrics import ndcg_score

def evaluate_chunk_size(documents, queries, chunk_size, overlap):
    """청크 크기별 성능 평가"""
    
    # 1. 문서 분할
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap
    )
    chunks = splitter.split_documents(documents)
    
    # 2. 벡터 DB 구축
    vectorstore = build_vectorstore(chunks)
    
    # 3. 검색 성능 평가
    scores = []
    for query, relevant_docs in queries:
        results = vectorstore.similarity_search(query, k=5)
        score = calculate_relevance(results, relevant_docs)
        scores.append(score)
    
    return np.mean(scores)

# 다양한 크기 실험
results = {}
for size in [200, 500, 1000, 1500, 2000]:
    for overlap in [0, 50, 100, 200]:
        score = evaluate_chunk_size(docs, queries, size, overlap)
        results[(size, overlap)] = score

# 최적 설정 찾기
best_config = max(results, key=results.get)
print(f"최적 설정: chunk_size={best_config[0]}, overlap={best_config[1]}")
```

### 실험 결과 (SenPick 사례)

| Chunk Size | Overlap | NDCG@5 | 응답 시간 |
|-----------|---------|---------|----------|
| 200 | 0 | 0.65 | 1.2s |
| 500 | 50 | 0.78 | 1.5s |
| **1000** | **100** | **0.85** | **1.8s** |
| 1500 | 150 | 0.83 | 2.1s |
| 2000 | 200 | 0.79 | 2.5s |

**결론**: chunk_size=1000, overlap=100이 최적!

---

## 🔍 Overlap 전략 및 실험

### Overlap이 중요한 이유

```python
# 오버랩 없음
chunk1 = "...파이썬은 강력한 언어입니다."
chunk2 = "비동기 프로그래밍은..."
# 문제: "파이썬의 비동기 프로그래밍" 쿼리에 약함

# 오버랩 있음
chunk1 = "...파이썬은 강력한 언어입니다. 비동기 프로그래밍은..."
chunk2 = "비동기 프로그래밍은... asyncio를 사용하면..."
# 해결: 문맥 연결 유지
```

### 동적 오버랩

```python
def dynamic_overlap_chunking(text, base_chunk_size=1000):
    """문맥에 따라 오버랩 조정"""
    
    chunks = []
    sentences = text.split('. ')
    
    current_chunk = []
    current_size = 0
    
    for sentence in sentences:
        sentence_len = len(sentence)
        
        if current_size + sentence_len > base_chunk_size:
            # 청크 완성
            chunk_text = '. '.join(current_chunk)
            chunks.append(chunk_text)
            
            # 오버랩: 마지막 2-3문장 유지
            overlap_sentences = current_chunk[-2:]
            current_chunk = overlap_sentences + [sentence]
            current_size = sum(len(s) for s in current_chunk)
        else:
            current_chunk.append(sentence)
            current_size += sentence_len
    
    # 마지막 청크
    if current_chunk:
        chunks.append('. '.join(current_chunk))
    
    return chunks
```

---

## 🎨 고급 전략

### 1. Hierarchical Chunking

```python
# 계층적 청킹: 큰 청크 + 작은 청크
def hierarchical_chunking(text):
    # 레벨 1: 큰 청크 (문맥 파악)
    large_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200
    )
    large_chunks = large_splitter.split_text(text)
    
    # 레벨 2: 작은 청크 (정밀 검색)
    small_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    
    result = []
    for large_chunk in large_chunks:
        small_chunks = small_splitter.split_text(large_chunk)
        for small_chunk in small_chunks:
            result.append({
                "small_chunk": small_chunk,
                "large_chunk": large_chunk,  # 문맥 정보
            })
    
    return result
```

### 2. Context-Enriched Chunking

```python
def context_enriched_chunking(document):
    """청크에 문맥 정보 추가"""
    
    # 기본 분할
    chunks = split_document(document)
    
    enriched_chunks = []
    for i, chunk in enumerate(chunks):
        # 문서 제목, 섹션 정보 추가
        enriched = f"""
        [Document: {document.title}]
        [Section: {document.section}]
        [Chunk {i+1}/{len(chunks)}]
        
        {chunk}
        """
        enriched_chunks.append(enriched)
    
    return enriched_chunks
```

---

## 📊 실전 성능 비교

### 테스트 환경
- 문서: 50개 기술 블로그 (평균 5,000자)
- 쿼리: 100개 질문
- 평가 지표: NDCG@5, MRR

### 결과

| 전략 | NDCG@5 | MRR | 청크 수 |
|------|--------|-----|---------|
| Fixed(500) | 0.68 | 0.72 | 500 |
| Fixed(1000) | 0.75 | 0.79 | 250 |
| Semantic | 0.82 | 0.86 | 320 |
| **Recursive(1000, 100)** | **0.85** | **0.89** | 280 |
| Hierarchical | 0.84 | 0.88 | 450 |

---

## 🎯 정리 및 권장사항

### 기본 권장 설정

```python
# 범용 설정
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=100,  # 10%
    separators=["\n\n", "\n", ". ", " ", ""]
)
```

### 상황별 선택 가이드

| 상황 | 추천 전략 |
|------|----------|
| 일반 문서 | Recursive (1000, 100) |
| 코드 | Language-specific |
| Markdown | Header-based |
| 짧은 문서 | Fixed (500, 50) |
| 긴 문서 | Hierarchical |

### 체크리스트
- [ ] 청크 크기는 임베딩 모델 한계 고려
- [ ] 오버랩은 10-20% 권장
- [ ] 문장 중간 분할 방지
- [ ] 메타데이터 포함
- [ ] 성능 실험으로 최적화

Chunking은 RAG 성능의 기초입니다. 적절한 전략을 선택하고 실험을 통해 최적화하면 
검색 품질을 크게 향상시킬 수 있습니다! 🎯

---

📚 **참고 자료**:
- [LangChain Text Splitters](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
