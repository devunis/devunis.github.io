---
title: "Prompt Engineering: Chain-of-Thought(CoT) 실전 활용"
date: 2025-12-23 09:00:00 +0900
categories: [AI, LLM]
tags: [Prompt-Engineering, CoT, GPT, LLM, AI]
---

LLM의 성능을 최대로 끌어내는 가장 효과적인 방법 중 하나가 바로 **Prompt Engineering**입니다. 
이번 글에서는 특히 강력한 기법인 **Chain-of-Thought(CoT)**를 중심으로 실전 활용법을 다룹니다.

---

## 🎯 Prompt Engineering이란?

**Prompt Engineering**은 LLM에게 최적의 입력을 설계하는 기술입니다.

### Bad Prompt ❌

```python
prompt = "파이썬이 뭐야?"

response = llm(prompt)
# 결과: 너무 일반적이고 구체성 없는 답변
```

### Good Prompt ✅

```python
prompt = """
당신은 5년 경력의 백엔드 개발자에게 설명하는 시니어 개발자입니다.

질문: 파이썬의 GIL(Global Interpreter Lock)이 성능에 미치는 영향을 설명하고,
이를 우회하는 3가지 방법을 코드 예시와 함께 제시해주세요.

답변 형식:
1. GIL 설명 (100자 이내)
2. 성능 영향 분석
3. 우회 방법 + 코드
"""

response = llm(prompt)
# 결과: 구체적이고 실용적인 답변
```

---

## 🧠 Chain-of-Thought(CoT)란?

**CoT**는 LLM이 **단계적으로 사고하도록** 유도하는 기법입니다.

### 예시: 수학 문제

#### Without CoT ❌

```python
prompt = "3개의 사과가 있고, 2개를 더 샀습니다. 그 중 4개를 먹었습니다. 남은 사과는?"

# LLM 답변: "1개입니다"  (틀림!)
```

#### With CoT ✅

```python
prompt = """
3개의 사과가 있고, 2개를 더 샀습니다. 그 중 4개를 먹었습니다. 남은 사과는?

단계별로 생각해봅시다:
1. 처음 사과 개수: 
2. 산 사과를 더하면:
3. 먹은 사과를 빼면:
"""

# LLM 답변:
# 1. 처음 사과 개수: 3개
# 2. 산 사과를 더하면: 3 + 2 = 5개
# 3. 먹은 사과를 빼면: 5 - 4 = 1개
# 따라서 남은 사과는 1개입니다. ✓
```

---

## 🎨 Zero-shot CoT vs Few-shot CoT

### Zero-shot CoT

**특징**: 예시 없이 "단계적으로 생각하세요" 지시만

```python
prompt = """
질문: FastAPI와 Django 중 어떤 프레임워크를 선택해야 할까요?

단계별로 생각해봅시다:
"""

response = llm(prompt)
```

**장점**: 
- ✅ 간단함
- ✅ 도메인 지식 불필요

**단점**:
- ❌ 일관성 떨어짐
- ❌ 복잡한 문제에 부족

### Few-shot CoT

**특징**: 예시를 통해 사고 패턴 학습

```python
prompt = """
다음 기술 스택 선택 문제를 단계별로 분석해주세요.

예시 1:
질문: 소규모 스타트업에서 빠르게 MVP를 만들어야 합니다. Django vs FastAPI?
분석:
1. 요구사항: 빠른 개발, 적은 리소스
2. Django 장점: Admin, ORM, 완성도
3. FastAPI 장점: 속도, 간결성, 비동기
4. 결론: Django (Admin으로 개발 속도 확보)

예시 2:
질문: AI 추론 API를 구축해야 합니다. Django vs FastAPI?
분석:
1. 요구사항: 비동기 처리, 높은 성능
2. Django 단점: 동기 처리 기본
3. FastAPI 장점: 네이티브 async, 빠른 응답
4. 결론: FastAPI (비동기 처리에 최적)

이제 다음 질문에 답하세요:
질문: {your_question}
"""
```

**장점**:
- ✅ 일관된 품질
- ✅ 도메인 특화 가능

**단점**:
- ❌ 긴 프롬프트
- ❌ 예시 작성 노력 필요

---

## 💻 실전 활용 패턴

### 1. 코드 리뷰

```python
code_review_prompt = """
당신은 시니어 Python 개발자입니다. 다음 코드를 리뷰하세요.

코드:
{code}

단계별 분석:
1. 가독성 평가
2. 성능 이슈 확인
3. 보안 취약점 검토
4. 개선 제안 (코드 예시 포함)

각 단계별로 구체적인 근거를 제시하세요.
"""

# 사용
code = """
def get_users():
    users = []
    for i in range(1000):
        user = db.query(f"SELECT * FROM users WHERE id = {i}")
        users.append(user)
    return users
"""

response = llm(code_review_prompt.format(code=code))
```

**LLM 답변 예시**:
```
1. 가독성 평가:
   - 함수명은 명확하나, 변수명 i는 의미 불명확
   - SQL 쿼리가 하드코딩되어 가독성 저하

2. 성능 이슈 확인:
   - N+1 쿼리 문제! 1000번 DB 호출
   - 개선: 단일 쿼리로 모든 사용자 조회

3. 보안 취약점 검토:
   - ⚠️ SQL Injection 위험! f-string 사용
   - 파라미터화된 쿼리 필수

4. 개선 제안:
```python
def get_users():
    """모든 사용자를 효율적으로 조회"""
    return db.query(
        "SELECT * FROM users WHERE id BETWEEN ? AND ?",
        (1, 1000)
    )
```
```

### 2. 기술 문서 작성

```python
doc_writing_prompt = """
당신은 기술 문서 작성 전문가입니다.

주제: {topic}
대상 독자: {audience}

다음 단계로 문서를 작성하세요:
1. 독자의 배경 지식 수준 파악
2. 핵심 개념 3가지 선정
3. 각 개념을 예시와 함께 설명
4. 실전 코드 예시 제공
5. 다음 학습 단계 제안

각 섹션은 명확히 구분하고, 코드는 주석을 포함하세요.
"""

# 사용
response = llm(doc_writing_prompt.format(
    topic="Python asyncio",
    audience="2년 경력 백엔드 개발자"
))
```

### 3. 디버깅 지원

```python
debug_prompt = """
다음 에러를 단계별로 분석하고 해결하세요.

에러 메시지:
{error_message}

코드:
{code}

분석 단계:
1. 에러 타입 및 발생 위치 파악
2. 근본 원인 분석
3. 재현 시나리오 작성
4. 해결 방법 제시 (코드 포함)
5. 예방 전략 제안
"""

# 실제 사용
error = """
TypeError: 'NoneType' object is not subscriptable
  File "app.py", line 42, in get_user
    return user['name']
"""

code = """
def get_user(user_id):
    user = db.get(user_id)
    return user['name']
"""

response = llm(debug_prompt.format(error_message=error, code=code))
```

---

## 🚀 Self-Consistency 기법

같은 질문을 여러 번 하고, **다수결**로 답을 결정!

```python
def self_consistency_cot(query: str, n_samples: int = 5):
    """Self-Consistency를 사용한 CoT"""
    
    prompt = f"""
    질문: {query}
    
    단계별로 생각해봅시다:
    """
    
    # 여러 번 실행 (temperature > 0으로 다양성 확보)
    responses = []
    for _ in range(n_samples):
        response = llm(prompt, temperature=0.7)
        responses.append(response)
    
    # 최종 답변 추출
    final_answers = [extract_answer(r) for r in responses]
    
    # 다수결
    from collections import Counter
    most_common = Counter(final_answers).most_common(1)[0][0]
    
    return most_common

# 사용
answer = self_consistency_cot(
    "FastAPI에서 백그라운드 태스크를 구현하는 가장 좋은 방법은?"
)
```

**결과**:
```
응답 1: Celery 사용
응답 2: BackgroundTasks 사용
응답 3: BackgroundTasks 사용
응답 4: BackgroundTasks 사용
응답 5: asyncio.create_task 사용

최종 답변: BackgroundTasks 사용 (3/5)
```

---

## 🌳 Tree of Thoughts (ToT)

여러 사고 경로를 **트리 구조**로 탐색!

```python
def tree_of_thoughts(problem: str):
    """ToT: 여러 해결 경로 탐색"""
    
    # 1단계: 가능한 접근법 생성
    approaches_prompt = f"""
    문제: {problem}
    
    이 문제를 해결하는 3가지 다른 접근법을 제시하세요:
    """
    approaches = llm(approaches_prompt)
    
    # 2단계: 각 접근법 평가
    best_approach = None
    best_score = 0
    
    for approach in parse_approaches(approaches):
        eval_prompt = f"""
        접근법: {approach}
        
        이 접근법을 다음 기준으로 평가하세요 (1-10점):
        1. 실현 가능성:
        2. 효율성:
        3. 유지보수성:
        
        총점:
        """
        
        score = extract_score(llm(eval_prompt))
        if score > best_score:
            best_score = score
            best_approach = approach
    
    # 3단계: 최선의 접근법으로 상세 해결책 생성
    solution_prompt = f"""
    문제: {problem}
    선택된 접근법: {best_approach}
    
    단계별 구현 방법:
    """
    
    return llm(solution_prompt)
```

---

## 📊 성능 향상 측정

### 실험 설정

```python
# 테스트 문제 (코딩 테스트)
problems = load_coding_problems()  # 100개

# 1. 기본 프롬프트
correct_basic = 0
for problem in problems:
    response = llm(f"다음 문제를 풀어주세요: {problem}")
    if is_correct(response, problem.answer):
        correct_basic += 1

print(f"기본: {correct_basic}/100")  # 62/100

# 2. Zero-shot CoT
correct_cot = 0
for problem in problems:
    prompt = f"""
    문제: {problem}
    
    단계별로 생각해봅시다:
    """
    response = llm(prompt)
    if is_correct(response, problem.answer):
        correct_cot += 1

print(f"CoT: {correct_cot}/100")  # 78/100 (+16%)

# 3. Self-Consistency CoT
correct_sc = 0
for problem in problems:
    answer = self_consistency_cot(problem, n_samples=5)
    if is_correct(answer, problem.answer):
        correct_sc += 1

print(f"SC-CoT: {correct_sc}/100")  # 85/100 (+23%)
```

---

## 🎯 실전 팁 및 베스트 프랙티스

### 1. 명확한 역할 부여

```python
prompt = """
당신은 {role}입니다.
{background_context}

{instruction}
"""

# 예시
prompt = """
당신은 10년 경력의 시스템 아키텍트입니다.
마이크로서비스 아키텍처 설계 경험이 풍부합니다.

다음 시스템의 아키텍처를 설계하세요: {system_description}
"""
```

### 2. 구조화된 출력 요구

```python
prompt = """
다음 형식으로 답변하세요:

## 분석
- 요구사항:
- 제약사항:

## 해결책
```python
# 코드
```

## 장단점
- 장점:
- 단점:

## 대안
"""
```

### 3. 예시 기반 학습

```python
# SenPick에서 사용한 프롬프트
prompt = """
당신은 개인화 추천 시스템 전문가입니다.

사용자 선호도 분석 예시:

입력: {"clicks": ["AI", "Backend"], "time": "morning"}
출력: {"recommended_tags": ["AI", "Backend", "DevOps"], "confidence": 0.85}

입력: {"clicks": ["Frontend"], "time": "evening"}
출력: {"recommended_tags": ["Frontend", "React", "CSS"], "confidence": 0.72}

이제 다음 사용자를 분석하세요:
입력: {user_data}
출력:
"""
```

---

## 📝 정리

### CoT 적용 체크리스트
- ✅ 복잡한 추론이 필요한가?
- ✅ 단계별 설명이 도움되는가?
- ✅ 긴 프롬프트를 감당할 수 있는가? (비용)
- ✅ 응답 시간이 중요하지 않은가?

### 권장 사용처
- ✅ 코드 리뷰
- ✅ 디버깅
- ✅ 아키텍처 설계
- ✅ 수학/논리 문제
- ❌ 단순 정보 검색
- ❌ 빠른 응답 필요 (챗봇)

Chain-of-Thought는 LLM의 추론 능력을 크게 향상시킬 수 있는 강력한 기법입니다. 
적절히 활용하면 더 정확하고 신뢰할 수 있는 AI 시스템을 구축할 수 있습니다! 🎯

---

📚 **참고 자료**:
- [Chain-of-Thought Prompting Paper](https://arxiv.org/abs/2201.11903)
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
