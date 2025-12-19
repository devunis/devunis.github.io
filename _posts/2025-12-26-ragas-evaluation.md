---
title: "RAG 시스템 평가 지표: RAGAS로 품질 측정하기"
date: 2025-12-26 09:00:00 +0900
categories: [AI, RAG]
tags: [RAG, RAGAS, Evaluation, Metrics, Quality]
---

"우리 RAG 시스템이 잘 작동하고 있나요?" - 이 질문에 객관적으로 답하기 위해 **RAGAS** 프레임워크를 활용한 
RAG 평가 방법을 알아봅니다.

---

## 🎯 RAG 평가의 중요성

### 왜 평가가 필요한가?

```python
# 주관적 평가 ❌
"음... 답변이 괜찮은 것 같은데?"

# 객관적 평가 ✅
"Faithfulness: 0.87, Relevancy: 0.92"
```

**평가 없이는**:
- ❌ 개선 방향 불명확
- ❌ A/B 테스트 불가
- ❌ 성능 퇴화 감지 불가
- ❌ 팀 간 소통 어려움

---

## 📊 주요 평가 지표

### 1. Faithfulness (충실성)

**정의**: 생성된 답변이 주어진 컨텍스트에 근거하는가?

```python
# High Faithfulness ✅
Context: "FastAPI는 Python 3.6+의 비동기 웹 프레임워크입니다."
Answer: "FastAPI는 Python 3.6 이상에서 동작하는 비동기 프레임워크입니다."
# → 컨텍스트에 충실

# Low Faithfulness ❌
Answer: "FastAPI는 2015년에 출시된 프레임워크입니다."
# → 컨텍스트에 없는 정보 (환각)
```

**계산 방법**:
```
Faithfulness = (컨텍스트에서 검증 가능한 문장 수) / (전체 문장 수)
```

### 2. Answer Relevancy (답변 관련성)

**정의**: 답변이 질문에 직접적으로 대응하는가?

```python
Question: "FastAPI의 성능 최적화 방법은?"

# High Relevancy ✅
Answer: "FastAPI 성능 최적화를 위해 1) 비동기 처리 활용, 2) Pydantic 모델 캐싱..."

# Low Relevancy ❌
Answer: "FastAPI는 Python 웹 프레임워크입니다. Django와 다르게..."
# → 질문과 무관한 내용
```

### 3. Context Recall (컨텍스트 재현율)

**정의**: 정답에 필요한 정보가 검색된 컨텍스트에 포함되어 있는가?

```python
Ground Truth: "FastAPI는 Starlette와 Pydantic을 기반으로 합니다."

Retrieved Context:
- Doc1: "FastAPI는 Starlette를 사용합니다."  ✅
- Doc2: "FastAPI는 빠른 성능을 자랑합니다."  ⚠️
# Pydantic 정보 누락 → Recall 낮음
```

### 4. Context Precision (컨텍스트 정밀도)

**정의**: 검색된 컨텍스트가 얼마나 관련성이 높은가?

```python
Query: "FastAPI 비동기 처리"

# High Precision ✅
Retrieved:
1. "FastAPI의 async/await 사용법"
2. "비동기 데이터베이스 연동"

# Low Precision ❌
Retrieved:
1. "FastAPI 설치 방법"
2. "FastAPI 역사"
3. "Django와의 비교"
4. "FastAPI 비동기 처리"  ← 관련 문서는 1개뿐
```

---

## 🔧 RAGAS 프레임워크 소개

**RAGAS** (RAG Assessment)는 LLM을 활용한 RAG 평가 프레임워크입니다.

### 설치

```bash
pip install ragas
```

### 기본 사용법

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_recall,
    context_precision,
)
from datasets import Dataset

# 평가 데이터 준비
data = {
    "question": ["FastAPI의 장점은?", "Django vs FastAPI"],
    "answer": [
        "FastAPI는 빠르고 비동기 처리를 지원합니다.",
        "FastAPI는 성능이 우수하고, Django는 기능이 풍부합니다."
    ],
    "contexts": [
        ["FastAPI는 높은 성능의 비동기 웹 프레임워크입니다."],
        ["FastAPI는 빠른 성능, Django는 완성도 높은 기능 제공"]
    ],
    "ground_truths": [
        "FastAPI는 빠른 성능과 비동기 처리가 장점입니다.",
        "FastAPI는 성능, Django는 생태계가 강점입니다."
    ]
}

dataset = Dataset.from_dict(data)

# 평가 실행
result = evaluate(
    dataset,
    metrics=[
        faithfulness,
        answer_relevancy,
        context_recall,
        context_precision,
    ],
)

print(result)
```

**출력**:
```python
{
    'faithfulness': 0.87,
    'answer_relevancy': 0.92,
    'context_recall': 0.85,
    'context_precision': 0.89
}
```

---

## 💻 실전 RAG 시스템 평가

### 1. 데이터 수집

```python
from langchain.vectorstores import Qdrant
from langchain.chains import RetrievalQA

# RAG 시스템 실행
def evaluate_rag_system(questions, ground_truths):
    """RAG 시스템 평가 데이터 생성"""
    
    evaluation_data = {
        "question": [],
        "answer": [],
        "contexts": [],
        "ground_truths": []
    }
    
    for question, truth in zip(questions, ground_truths):
        # 1. 검색
        docs = retriever.get_relevant_documents(question)
        contexts = [doc.page_content for doc in docs]
        
        # 2. 답변 생성
        answer = qa_chain({"query": question})["result"]
        
        # 3. 데이터 저장
        evaluation_data["question"].append(question)
        evaluation_data["answer"].append(answer)
        evaluation_data["contexts"].append(contexts)
        evaluation_data["ground_truths"].append(truth)
    
    return evaluation_data

# 테스트 데이터 준비
test_questions = [
    "Python asyncio란?",
    "FastAPI 설치 방법은?",
    # ... 더 많은 질문
]

test_ground_truths = [
    "asyncio는 Python의 비동기 I/O 라이브러리입니다.",
    "pip install fastapi로 설치할 수 있습니다.",
    # ... 정답
]

# 평가 데이터 생성
eval_data = evaluate_rag_system(test_questions, test_ground_truths)
```

### 2. 평가 실행

```python
from ragas import evaluate
from datasets import Dataset

dataset = Dataset.from_dict(eval_data)

# 평가
results = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, context_precision]
)

print(f"Faithfulness: {results['faithfulness']:.2f}")
print(f"Answer Relevancy: {results['answer_relevancy']:.2f}")
print(f"Context Recall: {results['context_recall']:.2f}")
print(f"Context Precision: {results['context_precision']:.2f}")
```

### 3. 상세 분석

```python
# 질문별 점수 확인
for i, question in enumerate(eval_data["question"]):
    print(f"\n질문: {question}")
    print(f"  Faithfulness: {results.scores[i]['faithfulness']:.2f}")
    print(f"  Relevancy: {results.scores[i]['answer_relevancy']:.2f}")
    
    # 낮은 점수 항목 디버깅
    if results.scores[i]['faithfulness'] < 0.7:
        print(f"  ⚠️ 낮은 충실성 - 환각 가능성")
        print(f"  답변: {eval_data['answer'][i]}")
        print(f"  컨텍스트: {eval_data['contexts'][i][0][:100]}...")
```

---

## 📈 평가 결과 해석

### 점수 기준

| 지표 | 우수 | 양호 | 개선 필요 |
|------|------|------|----------|
| Faithfulness | >0.9 | 0.7-0.9 | <0.7 |
| Answer Relevancy | >0.85 | 0.7-0.85 | <0.7 |
| Context Recall | >0.8 | 0.6-0.8 | <0.6 |
| Context Precision | >0.8 | 0.6-0.8 | <0.6 |

### SenPick 실제 결과

#### Before (기본 RAG)
```python
{
    'faithfulness': 0.72,        # 환각 많음
    'answer_relevancy': 0.78,    # 질문 이탈
    'context_recall': 0.65,      # 정보 누락
    'context_precision': 0.70    # 노이즈 많음
}
```

#### After (Reranker + Chunking 최적화)
```python
{
    'faithfulness': 0.89,        # ↑ +17%
    'answer_relevancy': 0.91,    # ↑ +13%
    'context_recall': 0.83,      # ↑ +18%
    'context_precision': 0.87    # ↑ +17%
}
```

---

## 🔧 개선 전략 수립

### 1. Faithfulness 개선

**문제**: 답변에 환각(Hallucination) 발생

**해결책**:
```python
# 1. 프롬프트 개선
prompt = """
다음 컨텍스트만을 사용하여 답변하세요.
컨텍스트에 없는 정보는 "정보가 없습니다"라고 답하세요.

컨텍스트: {context}
질문: {question}
"""

# 2. Temperature 낮추기
llm = ChatOpenAI(temperature=0.0)  # 더 결정론적

# 3. 컨텍스트 강조
prompt = """
⚠️ 중요: 다음 컨텍스트의 정보만 사용하세요.

{context}
"""
```

### 2. Context Recall 개선

**문제**: 중요 정보가 검색되지 않음

**해결책**:
```python
# 1. 검색 개수 증가
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 10}  # 5 → 10
)

# 2. Reranker 도입
from langchain.retrievers import ContextualCompressionRetriever

compression_retriever = ContextualCompressionRetriever(
    base_retriever=retriever,
    base_compressor=reranker
)

# 3. 하이브리드 검색
from langchain.retrievers import EnsembleRetriever

ensemble = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.5, 0.5]
)
```

### 3. Context Precision 개선

**문제**: 무관한 문서가 많이 검색됨

**해결책**:
```python
# 1. 유사도 임계값 설정
docs = vectorstore.similarity_search_with_score(query, k=10)
filtered_docs = [doc for doc, score in docs if score > 0.7]

# 2. Metadata 필터링
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 5,
        "filter": {"category": "backend"}
    }
)

# 3. Reranker로 상위 k개만
final_docs = reranker.rerank(docs, top_n=3)
```

---

## 🔬 A/B 테스트 방법

```python
def compare_rag_versions(version_a, version_b, test_data):
    """두 RAG 시스템 비교"""
    
    # Version A 평가
    results_a = evaluate_rag_system(version_a, test_data)
    scores_a = evaluate(Dataset.from_dict(results_a), metrics=[...])
    
    # Version B 평가
    results_b = evaluate_rag_system(version_b, test_data)
    scores_b = evaluate(Dataset.from_dict(results_b), metrics=[...])
    
    # 비교
    print("=== A/B Test Results ===")
    for metric in ['faithfulness', 'answer_relevancy', 'context_recall']:
        diff = scores_b[metric] - scores_a[metric]
        symbol = "↑" if diff > 0 else "↓"
        print(f"{metric}: {scores_a[metric]:.2f} → {scores_b[metric]:.2f} ({symbol}{abs(diff):.2f})")
    
    # 통계적 유의성 검정
    from scipy.stats import ttest_rel
    t_stat, p_value = ttest_rel(scores_a.scores, scores_b.scores)
    print(f"\np-value: {p_value:.4f}")
    print("통계적으로 유의미" if p_value < 0.05 else "유의미하지 않음")

# 사용 예시
compare_rag_versions(
    version_a={"retriever": basic_retriever, "llm": gpt35},
    version_b={"retriever": reranker_retriever, "llm": gpt4},
    test_data=test_questions
)
```

---

## 📊 시각화 및 모니터링

```python
import matplotlib.pyplot as plt
import pandas as pd

def visualize_evaluation(results_over_time):
    """평가 결과 시각화"""
    
    df = pd.DataFrame(results_over_time)
    
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    
    metrics = ['faithfulness', 'answer_relevancy', 
               'context_recall', 'context_precision']
    
    for i, (ax, metric) in enumerate(zip(axes.flat, metrics)):
        ax.plot(df['date'], df[metric], marker='o')
        ax.set_title(metric.replace('_', ' ').title())
        ax.set_xlabel('Date')
        ax.set_ylabel('Score')
        ax.grid(True, alpha=0.3)
        ax.set_ylim(0, 1)
    
    plt.tight_layout()
    plt.savefig('rag_evaluation_trends.png')
    plt.show()

# 사용
results_history = [
    {'date': '2025-01-01', 'faithfulness': 0.75, ...},
    {'date': '2025-01-08', 'faithfulness': 0.82, ...},
    # ...
]

visualize_evaluation(results_history)
```

---

## 🎯 모니터링 자동화

```python
from datetime import datetime
import json

class RAGMonitor:
    """프로덕션 RAG 모니터링"""
    
    def __init__(self, rag_system, alert_threshold=0.7):
        self.rag_system = rag_system
        self.threshold = alert_threshold
        self.history = []
    
    def daily_evaluation(self, test_questions, ground_truths):
        """일일 평가 실행"""
        
        # 평가 데이터 생성
        eval_data = self.generate_eval_data(test_questions, ground_truths)
        
        # 평가 실행
        results = evaluate(
            Dataset.from_dict(eval_data),
            metrics=[faithfulness, answer_relevancy]
        )
        
        # 기록
        record = {
            'date': datetime.now().isoformat(),
            'scores': results
        }
        self.history.append(record)
        
        # 알림
        if results['faithfulness'] < self.threshold:
            self.send_alert(f"⚠️ Faithfulness dropped: {results['faithfulness']:.2f}")
        
        return results
    
    def send_alert(self, message):
        """알림 전송 (Slack, Email 등)"""
        print(f"ALERT: {message}")
        # 실제로는 Slack/Email 전송

# 사용
monitor = RAGMonitor(rag_system, alert_threshold=0.75)
monitor.daily_evaluation(test_questions, ground_truths)
```

---

## 📝 정리

### RAGAS 도입 체크리스트
- [ ] 평가용 테스트 데이터셋 구축 (최소 50개)
- [ ] Ground truth 정답 작성
- [ ] 평가 스크립트 작성
- [ ] CI/CD에 평가 통합
- [ ] 주기적 모니터링 설정
- [ ] 알림 시스템 구축

### 권장 워크플로우

```python
# 1. 개발 단계
→ 소규모 테스트 데이터로 빠르게 평가
→ 각 지표별 개선 전략 수립

# 2. 배포 전
→ 대규모 테스트 데이터로 철저히 평가
→ 기준 점수 통과 확인

# 3. 프로덕션
→ 실시간 샘플링 평가
→ 주간/월간 전체 평가
→ 성능 퇴화 감지 및 알림
```

RAGAS를 활용하면 RAG 시스템의 품질을 객관적으로 측정하고 지속적으로 개선할 수 있습니다! 📊

---

📚 **참고 자료**:
- [RAGAS 공식 문서](https://docs.ragas.io/)
- [RAGAS GitHub](https://github.com/explodinggradients/ragas)
