---
title: "RAG 성능 비교: FAISS, Qdrant, Chroma, Milvus"
date: 2025-08-18 21:00:00 +0900
categories: [Blog, AI, RAG]
tags: [RAG, VectorDB, FAISS, Qdrant, Chroma, Milvus]
---

최근 AI 검색 및 질문응답 시스템(QA) 구축에서 가장 중요한 기술 중 하나가 바로 **RAG (Retrieval-Augmented Generation)** 입니다.  
이번 글에서는 RAG를 구성할 때 자주 사용되는 **벡터 DB (FAISS, Qdrant, Chroma, Milvus)** 를 중심으로 성능 및 특징을 비교해봅니다.

---

## 1. RAG 기본 구조
1. **Retriever** – 사용자의 질문과 유사한 문서를 벡터 검색으로 찾아옴  
2. **Reranker** – 검색된 결과를 정밀하게 재정렬  
3. **Generator (LLM)** – 선택된 문서를 바탕으로 답변 생성  

---

## 2. 비교 대상
- **FAISS** – Meta 제작, 단일 서버/로컬 환경에 강점. 빠르고 가벼움.  
- **Qdrant** – Rust 기반. 메타데이터 필터링/스코어링이 뛰어나 실무형 RAG에 적합.  
- **Chroma** – Pythonic, LLM 개발 친화적. 빠른 실험 및 LangChain 연동에 강점.  
- **Milvus** – 대규모 분산 환경 지원. 기업용/프로덕션에 안정적인 선택.  

---

## 3. 실험 비교 예시

| 방법 | DB | Retriever | Reranker | Chunk 전략 | 정확도(%) | 응답 충실성 | 속도(ms) | 특징 |
|------|----|-----------|-----------|------------|-----------|-------------|----------|------|
| 기본형 | FAISS | Dense | 없음 | Fixed(512) | 72 | 중간 | 빠름 | 단일 서버, 가볍고 빠름 |
| 개선형 | Qdrant | Dense | bge-reranker | Semantic Split | 87 | 높음 | 보통 | 필터링/metadata 검색 강점 |
| 프로토타입 | Chroma | Dense | 없음 | Fixed(512) | 78 | 중간 | 빠름 | 빠른 실험, LangChain 연동 최적 |
| 대규모 | Milvus | Dense | ColBERT | Sliding Window | 90 | 매우 높음 | 느림 | 대규모 분산 환경에서 안정적 |

---

## 4. 정리
- **FAISS** → 연구, 개인 프로젝트, 빠른 실험에 적합  
- **Qdrant** → 프로덕션 RAG, 필터링/메타데이터 검색이 필요한 경우  
- **Chroma** → PoC, 연구 단계에서 빠른 프로토타이핑  
- **Milvus** → 대규모 데이터셋/기업 서비스 운영  

➡️ 결론적으로,  
- **작은 규모 → FAISS / Chroma**  
- **중간 규모 → Qdrant**  
- **대규모 → Milvus**  

---

👉 다음 글에서는 **Reranker 모델(bge-reranker, ColBERT)별 성능 차이**를 다뤄보겠습니다.
