---
title: "SenPick 개발 회고: GPT-4o + RAG로 CTR 15% 달성"
date: 2026-01-17 09:00:00 +0900
categories: [Project, Retrospective]
tags: [SenPick, RAG, LangGraph, Project, GPT-4o]
---

개인화 기술 뉴스 추천 서비스 SenPick 개발 회고입니다. GPT-4o와 RAG를 활용해 CTR 15%를 달성한 과정을 공유합니다.

---

## 🎯 프로젝트 배경

### 문제 인식
- 🔍 기술 정보 과부하
- ⏰ 양질의 콘텐츠 발견 시간 소요
- 🎯 개인화 부족

### 목표
> "사용자 취향에 맞는 기술 뉴스를 AI가 추천"

---

## 🛠️ 기술 스택 선정

### 왜 이 기술들인가?

```
Frontend: Streamlit (빠른 프로토타입)
Backend: FastAPI (비동기 처리)
LLM: GPT-4o (최신 모델)
Vector DB: Qdrant (메타데이터 필터링)
Framework: LangGraph (멀티 에이전트)
Deployment: AWS EC2 + Docker
```

**FastAPI 선택 이유**:
- ✅ 비동기 처리로 AI 추론 효율화
- ✅ Pydantic 통합으로 타입 안전성
- ✅ 자동 API 문서화

---

## 🏗️ 아키텍처 설계

### 멀티 에이전트 시스템

```
User Query
    ↓
[Router Agent] ← 질문 분석
    ↓
    ├─→ [RAG Agent] ← 벡터 DB 검색
    ├─→ [Web Search Agent] ← 실시간 검색
    └─→ [Personalization Agent] ← 사용자 프로필
    ↓
[Response Generator]
    ↓
Personalized Result
```

### LangGraph 구현

```python
from langgraph.graph import StateGraph

workflow = StateGraph(AgentState)

# 에이전트 추가
workflow.add_node("router", router_node)
workflow.add_node("rag", rag_agent_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("personalizer", personalization_node)

# 조건부 라우팅
workflow.add_conditional_edges(
    "router",
    route_decision,
    {
        "knowledge": "rag",
        "latest": "web_search"
    }
)

app = workflow.compile()
```

---

## 🔥 핵심 기능 구현

### 1. RAG + 웹 검색 하이브리드

```python
async def hybrid_search(query: str, user_profile: dict):
    # 병렬 검색
    rag_results, web_results = await asyncio.gather(
        qdrant_search(query, user_profile["interests"]),
        tavily_search(query)
    )
    
    # Reranker로 재정렬
    all_results = rag_results + web_results
    ranked = rerank(query, all_results)
    
    return ranked[:5]
```

### 2. 개인화 추천 로직

```python
def personalize_results(results: list, user_profile: dict):
    """사용자 선호도 기반 재정렬"""
    
    for result in results:
        score = 0
        
        # 관심 태그 매칭
        for tag in result["tags"]:
            if tag in user_profile["interests"]:
                score += 2
        
        # 읽은 기사 유사도
        similarity = compute_similarity(
            result["embedding"],
            user_profile["avg_embedding"]
        )
        score += similarity * 3
        
        # 클릭 이력 반영
        if result["source"] in user_profile["preferred_sources"]:
            score += 1.5
        
        result["personalized_score"] = score
    
    return sorted(results, key=lambda x: x["personalized_score"], reverse=True)
```

### 3. 실시간 피드백 학습

```python
@app.post("/feedback")
async def collect_feedback(
    article_id: int,
    action: str,  # "click", "like", "skip"
    user_id: int
):
    """사용자 행동 수집"""
    
    # 프로필 업데이트
    user_profile = get_user_profile(user_id)
    
    if action == "click":
        user_profile["clicked_articles"].append(article_id)
        article = get_article(article_id)
        
        # 임베딩 평균 갱신
        update_user_embedding(user_id, article["embedding"])
        
        # 선호 태그 강화
        for tag in article["tags"]:
            user_profile["interests"][tag] = user_profile["interests"].get(tag, 0) + 1
    
    save_user_profile(user_profile)
    
    return {"status": "success"}
```

---

## 💪 개발 과정 도전과제

### 1. Hallucination 문제
**문제**: GPT-4o가 없는 정보 생성
```python
# 해결: 프롬프트 개선
prompt = """
⚠️ 중요: 다음 컨텍스트의 정보만 사용하세요.
컨텍스트에 없으면 "정보가 없습니다"라고 답하세요.

컨텍스트: {context}
질문: {question}
"""
```

### 2. 검색 정확도 향상
**Before**: NDCG@5 = 0.67
**After (Reranker 도입)**: NDCG@5 = 0.87 (+30%)

### 3. 응답 속도 최적화
```python
# 비동기 + 캐싱
@lru_cache(maxsize=100)
def embed_query(query: str):
    return embedding_model.embed(query)

# 병렬 처리
results = await asyncio.gather(
    search_qdrant(),
    search_web(),
    generate_summary()
)
```

---

## 📊 CTR 15% 달성 과정

### 실험 과정

| 버전 | 변경사항 | CTR |
|------|----------|-----|
| v1.0 | 기본 벡터 검색 | 8% |
| v1.1 | + Reranker | 11% (+3%) |
| v1.2 | + 개인화 | 13% (+2%) |
| v1.3 | + 실시간 피드백 | 15% (+2%) |

### 핵심 개선 요인

1. **Reranker 도입** (3% 기여)
   - BGE Reranker로 관련도 재정렬
   
2. **개인화 알고리즘** (2% 기여)
   - 사용자 프로필 기반 스코어링
   
3. **실시간 학습** (2% 기여)
   - 클릭 피드백 즉시 반영

---

## 🎓 배운 점

### 기술적 학습
- ✅ LangGraph로 복잡한 워크플로우 구현
- ✅ Qdrant 메타데이터 필터링 활용
- ✅ 비동기 프로그래밍으로 성능 최적화
- ✅ Reranker의 중요성 체감

### 제품적 학습
- ✅ 사용자 피드백의 중요성
- ✅ 점진적 개선 (v1.0 → v1.3)
- ✅ A/B 테스트로 검증

---

## 😔 아쉬운 점

### 1. 스케일링 이슈
- 현재: 단일 EC2 서버
- 개선 필요: 로드 밸런싱, 캐시 레이어

### 2. 평가 지표 부족
- RAGAS 등 자동 평가 미도입
- 사용자 만족도 정량화 필요

### 3. 비용 최적화
- GPT-4o 비용 관리 필요
- 캐싱 전략 강화

---

## 🚀 향후 개선 방향

### 단기 (1개월)
- [ ] 캐싱 레이어 추가 (Redis)
- [ ] 응답 시간 1초 이하로 단축
- [ ] 오프라인 임베딩 pre-compute

### 중기 (3개월)
- [ ] 다중 언어 지원
- [ ] 모바일 앱 개발
- [ ] 커뮤니티 기능 추가

### 장기 (6개월)
- [ ] 자체 LLM 파인튜닝
- [ ] 수평 확장 아키텍처
- [ ] B2B 서비스 전환

---

## 📝 정리

SenPick 개발을 통해 **RAG + 멀티 에이전트 + 개인화**의 시너지를 경험했습니다.

**핵심 성과**:
- ✅ CTR 15% 달성
- ✅ 응답 정확도 87% (NDCG@5)
- ✅ 평균 응답 시간 2.3초

가장 중요한 교훈은 **"사용자 피드백을 빠르게 반영하는 시스템"**이 성공의 열쇠라는 것입니다! 🎯

---

📚 **프로젝트 링크**:
- [SenPick GitHub](https://github.com/devunis)
- [데모 사이트](https://senpick.example.com)
