---
title: "LangChain vs LangGraph: 언제 무엇을 써야 할까?"
date: 2025-12-25 09:00:00 +0900
categories: [AI, Framework]
tags: [LangChain, LangGraph, AI-Framework, Comparison]
---

LLM 애플리케이션을 개발할 때 LangChain과 LangGraph 중 어떤 것을 선택해야 할까요? 
이번 글에서는 두 프레임워크의 차이점과 프로젝트 유형별 선택 가이드를 제공합니다.

---

## 🔗 LangChain: 체인 기반 접근

**LangChain**은 LLM 애플리케이션 구축을 위한 가장 인기 있는 프레임워크입니다.

### 핵심 특징
- 📦 **풍부한 생태계** (150+ 통합)
- ⛓️ **체인 기반** 워크플로우
- 🎯 **간단한 사용법**
- 📚 **방대한 문서 및 커뮤니티**

### 기본 예시

```python
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# 1. 컴포넌트 정의
llm = ChatOpenAI(model="gpt-4")
prompt = ChatPromptTemplate.from_template("다음 질문에 답하세요: {question}")
parser = StrOutputParser()

# 2. 체인 구성 (LCEL)
chain = prompt | llm | parser

# 3. 실행
response = chain.invoke({"question": "파이썬이란?"})
```

### RAG 구현

```python
from langchain.vectorstores import Qdrant
from langchain.chains import RetrievalQA

# Retrieval Chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vectorstore.as_retriever(),
    return_source_documents=True
)

result = qa_chain({"query": "FastAPI 성능 최적화 방법은?"})
```

---

## 🔀 LangGraph: 상태 그래프 기반

**LangGraph**는 LangChain의 한계를 극복하기 위해 만들어진 확장 프레임워크입니다.

### 핵심 특징
- 📊 **State Graph** 아키텍처
- 🔄 **순환 처리** 지원
- 🎛️ **복잡한 제어 흐름**
- 💾 **영속적 상태 관리**

### 기본 예시

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 1. 상태 정의
class AgentState(TypedDict):
    messages: list
    next_action: str

# 2. 노드 정의
def node_1(state: AgentState):
    state["messages"].append("Node 1 executed")
    state["next_action"] = "node_2"
    return state

def node_2(state: AgentState):
    state["messages"].append("Node 2 executed")
    return state

# 3. 그래프 구성
workflow = StateGraph(AgentState)
workflow.add_node("node_1", node_1)
workflow.add_node("node_2", node_2)

workflow.set_entry_point("node_1")
workflow.add_edge("node_1", "node_2")
workflow.add_edge("node_2", END)

# 4. 실행
app = workflow.compile()
result = app.invoke({"messages": [], "next_action": ""})
```

---

## ⚖️ 아키텍처 비교

### LangChain: 선형 체인

```python
# 순차적 실행
chain = (
    RunnablePassthrough.assign(
        context=lambda x: retriever.get_relevant_documents(x["question"])
    )
    | prompt
    | llm
    | parser
)

# 흐름: question → retriever → prompt → llm → parser
```

**한계**:
- ❌ 조건 분기 어려움
- ❌ 반복 처리 불가
- ❌ 동적 워크플로우 제한

### LangGraph: 유연한 그래프

```python
# 조건부 분기
def should_continue(state):
    if state["confidence"] > 0.8:
        return "finish"
    else:
        return "refine"

workflow.add_conditional_edges(
    "initial",
    should_continue,
    {
        "finish": END,
        "refine": "refine_node"
    }
)

# 반복 처리
workflow.add_edge("refine_node", "initial")  # 사이클!
```

---

## 📊 상세 비교표

| 특징 | LangChain | LangGraph |
|------|-----------|-----------|
| **학습 곡선** | 쉬움 ⭐⭐⭐ | 중간 ⭐⭐ |
| **단순 체인** | 매우 적합 ✅ | 과한 면 있음 |
| **복잡한 로직** | 어려움 ❌ | 매우 적합 ✅ |
| **조건 분기** | 제한적 ⚠️ | 자유로움 ✅ |
| **순환 처리** | 불가능 ❌ | 가능 ✅ |
| **상태 관리** | 제한적 ⚠️ | 강력함 ✅ |
| **에러 복구** | 수동 | 체크포인트 ✅ |
| **디버깅** | 쉬움 ✅ | 복잡 ⚠️ |
| **생태계** | 매우 풍부 ✅ | 성장 중 ⚠️ |

---

## 🎯 사용 사례별 선택 가이드

### LangChain을 선택하세요 👉

#### 1. 단순 RAG
```python
# 질문 → 검색 → 답변 생성
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever
)
```

#### 2. 프롬프트 체이닝
```python
# 요약 → 번역 → 정리
chain = summary_chain | translate_chain | format_chain
```

#### 3. 빠른 프로토타입
```python
# 5분 안에 챗봇 구축
from langchain.chains import ConversationChain

chain = ConversationChain(llm=llm)
```

### LangGraph를 선택하세요 👉

#### 1. 멀티 에이전트
```python
# RAG Agent ↔ Web Search Agent ↔ Code Agent
workflow.add_node("rag", rag_agent)
workflow.add_node("web", web_agent)
workflow.add_node("code", code_agent)

# 동적 라우팅
workflow.add_conditional_edges("router", route_decision)
```

#### 2. Human-in-the-loop
```python
# 사용자 승인 대기
workflow.add_node("wait_approval", wait_for_human)
workflow.add_edge("generate", "wait_approval")
workflow.add_conditional_edges(
    "wait_approval",
    lambda x: "approved" if x["approved"] else "regenerate"
)
```

#### 3. 반복적 개선
```python
# 답변 생성 → 자체 평가 → 개선 (반복)
workflow.add_edge("generate", "evaluate")
workflow.add_conditional_edges(
    "evaluate",
    lambda x: END if x["quality"] > 0.9 else "improve"
)
workflow.add_edge("improve", "generate")  # 순환
```

---

## 🔄 마이그레이션 가이드

### LangChain → LangGraph

```python
# Before: LangChain
from langchain.chains import LLMChain

chain = LLMChain(llm=llm, prompt=prompt)
result = chain.run(question="...")

# After: LangGraph
from langgraph.graph import StateGraph

class State(TypedDict):
    question: str
    answer: str

def llm_node(state: State):
    response = llm.invoke(prompt.format(question=state["question"]))
    state["answer"] = response
    return state

workflow = StateGraph(State)
workflow.add_node("llm", llm_node)
workflow.set_entry_point("llm")
workflow.add_edge("llm", END)

app = workflow.compile()
result = app.invoke({"question": "...", "answer": ""})
```

---

## 💼 실전 프로젝트 경험

### Travel Checker (LangChain)

**프로젝트**: 여행 정보 QA 시스템

```python
# 단순한 RAG 체인
from langchain.chains import RetrievalQA

qa = RetrievalQA.from_chain_type(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    chain_type="stuff",
    retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
)

# 충분히 동작!
```

**선택 이유**:
- ✅ 단순한 워크플로우 (검색 → 답변)
- ✅ 빠른 개발 (1주일)
- ✅ 안정적인 라이브러리

### SenPick (LangGraph)

**프로젝트**: 개인화 기술 뉴스 추천

```python
# 복잡한 멀티 에이전트
workflow = StateGraph(AgentState)

# 여러 에이전트 추가
workflow.add_node("router", router_node)
workflow.add_node("rag", rag_agent_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("personalizer", personalize_node)

# 조건부 라우팅
workflow.add_conditional_edges(
    "router",
    route_decision,
    {
        "knowledge": "rag",
        "news": "web_search"
    }
)

# 순환 개선
workflow.add_edge("personalizer", "router")  # 재검색 가능
```

**선택 이유**:
- ✅ 복잡한 의사결정 트리
- ✅ 동적 에이전트 선택
- ✅ 상태 기반 개인화
- ✅ 반복적 품질 개선

**결과**: CTR 15% 향상 🎯

---

## 🎨 코드 비교: 같은 기능 구현

### 요구사항
> 질문 분석 → RAG 검색 → 부족하면 웹 검색 → 답변 생성

### LangChain 구현

```python
from langchain.chains import LLMChain
from langchain.agents import AgentExecutor, create_react_agent

# Agent 사용 (제한적)
tools = [rag_tool, web_search_tool]
agent = create_react_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools)

result = agent_executor.invoke({"input": question})

# 한계: 복잡한 제어 흐름 어려움
```

### LangGraph 구현

```python
from langgraph.graph import StateGraph

class State(TypedDict):
    question: str
    rag_results: list
    web_results: list
    answer: str

def rag_node(state):
    results = rag_search(state["question"])
    state["rag_results"] = results
    return state

def should_web_search(state):
    # RAG 결과 품질 평가
    if len(state["rag_results"]) < 2:
        return "web_search"
    return "generate"

workflow = StateGraph(State)
workflow.add_node("rag", rag_node)
workflow.add_node("web_search", web_search_node)
workflow.add_node("generate", generate_node)

workflow.set_entry_point("rag")
workflow.add_conditional_edges("rag", should_web_search)
workflow.add_edge("web_search", "generate")
workflow.add_edge("generate", END)

app = workflow.compile()

# 명확한 제어 흐름!
```

---

## ⚠️ 주의사항

### LangChain
- ⚠️ 복잡한 로직은 코드가 지저분해짐
- ⚠️ 에러 처리 수동으로 구현 필요
- ⚠️ 상태 추적 어려움

### LangGraph
- ⚠️ 초기 학습 곡선
- ⚠️ 보일러플레이트 코드 증가
- ⚠️ 단순한 체인에는 과함

---

## 🎯 의사결정 플로우차트

```
시작
  ↓
워크플로우가 단순한가? (검색 → 생성)
  ↓ Yes                     ↓ No
LangChain 사용         조건 분기가 필요한가?
                            ↓ Yes
                       멀티 에이전트인가?
                            ↓ Yes
                       LangGraph 사용
```

---

## 📝 정리

### 빠른 선택 가이드

| 프로젝트 유형 | 추천 |
|--------------|------|
| 단순 RAG | LangChain |
| 챗봇 (1:1) | LangChain |
| 프로토타입 | LangChain |
| 멀티 에이전트 | LangGraph |
| 복잡한 워크플로우 | LangGraph |
| Human-in-the-loop | LangGraph |
| 상태 관리 중요 | LangGraph |

### 함께 사용하기

```python
# LangChain 컴포넌트를 LangGraph에서 사용
from langchain.chains import RetrievalQA
from langgraph.graph import StateGraph

def rag_node(state):
    # LangChain의 RetrievalQA 활용
    qa_chain = RetrievalQA.from_chain_type(...)
    result = qa_chain(state["question"])
    state["answer"] = result
    return state

# 둘의 장점을 결합!
```

두 프레임워크는 상호 보완적입니다. 프로젝트 요구사항에 따라 적절히 선택하거나, 
필요하다면 함께 사용하세요! 🚀

---

📚 **참고 자료**:
- [LangChain 공식 문서](https://python.langchain.com/)
- [LangGraph 공식 문서](https://langchain-ai.github.io/langgraph/)
