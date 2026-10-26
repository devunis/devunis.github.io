---
title: "ReAct 에이전트는 어떻게 행동할까? Think·Act·Observe와 최신 구현 비교"
date: 2026-10-26 00:01:00 +0900
categories: [AI, Agents]
tags: [ReAct, Tool-Calling, LangGraph, Deep-Agents, Reflexion, ReWOO]
---

“지난주 중요한 메일을 찾아서 요약해줘.” 모델이 이 요청을 읽었다고 메일함을 자동으로 열 수 있는 것은 아닙니다. 검색 도구와 권한, 실행 코드, 그리고 검색 결과를 다음 판단에 연결하는 구조가 필요합니다.

이때 자주 등장하는 것이 **ReAct(Reasoning + Acting)**입니다. React 프론트엔드 라이브러리와는 다른 개념입니다. 이 글은 2026년 10월 26일 확인한 논문·공식 문서를 바탕으로 기본 루프와 관련 패턴, 현재의 구현 도구를 구분합니다. 특정 프로젝트의 실제 메일이나 내부 구조를 설명하는 글은 아닙니다.

## ReAct: 추론과 행동을 번갈아 연결한다

2022년에 공개된 ReAct 논문은 추론 표현과 작업별 행동을 번갈아 생성하는 접근을 제안했습니다. 행동으로 외부 정보를 얻고, 그 관찰 결과를 다음 판단에 활용합니다. 단순히 계획을 한 번 적고 끝내는 것과는 다릅니다. [ReAct 원 논문](https://arxiv.org/abs/2210.03629)

설명할 때에는 **Think → Act → Observe**로 표현할 수 있습니다. 다만 이것은 동작을 이해하기 위한 구분이며, 제품 API가 반드시 세 필드를 반환한다는 뜻은 아닙니다.

<figure class="article-diagram">
<figcaption>관찰 결과가 다음 행동의 입력이 된다</figcaption>
<ol><li>요청·현재 상태·사용 가능한 도구 확인</li><li>다음 행동 판단: 검색이 필요한가, 답할 수 있는가?</li><li>도구 호출 제안 → 실행기가 검증 후 실행</li><li>결과 또는 오류를 상태에 반영</li><li>완료되지 않았고 예산이 남으면 다음 판단으로 복귀</li><li>완료·중단·추가 질문 중 적절한 결과 반환</li></ol>
</figure>

## Think: 다음에 무엇을 할지 판단한다

메일 요약 요청이라면 기간, 중요도의 기준, 접근 가능한 메일함을 확인해야 합니다. “지난주”는 기준 시각·시간대·주 시작 요일에 따라 달라질 수 있습니다. 정보가 부족하면 사용자에게 확인하는 것도 다음 행동이 될 수 있습니다.

판단에 쓰는 입력에는 다음이 포함될 수 있습니다.

- 사용자 목표와 시스템 지침
- 현재까지의 대화·작업 상태
- 도구 이름·설명·인자 스키마
- 도구 실행 결과와 오류
- 남은 시간·호출 수 등 실행 조건

LLM의 추론을 사람의 의식적인 사고와 동일하게 볼 수는 없습니다. 많은 현재 모델은 토큰화한 입력을 신경망으로 처리해 다음 출력을 생성합니다. 추론 특화 학습이나 추가 추론 연산을 사용하는 모델도 있으므로 “모든 모델에 특별한 추론 기능이 없다”고 단정하는 설명은 피해야 합니다.

또한 화면에 표시되는 계획·설명·도구 호출 기록은 **관찰 가능한 출력**입니다. 모델 내부 계산의 완전하고 충실한 기록이라고 가정하지 않습니다. 애플리케이션은 긴 사고 설명보다 도구 선택의 적절성과 검증 가능한 결과를 평가할 수 있습니다.

## Act: 실행은 모델 밖에서 일어난다

모델은 구조화된 호출을 반환할 수 있습니다. 다음은 개념 예시이며 특정 API의 정확한 메시지 형식은 아닙니다.

```json
{
  "tool": "search_mail",
  "arguments": {
    "period": "previous_week",
    "importance": "user_defined"
  }
}
```

이 JSON 자체가 메일을 검색하지는 않습니다. 실행기가 허용된 도구인지, 인자가 올바른지, 요청자가 해당 메일을 볼 권한이 있는지 확인한 뒤 실제 검색 함수를 호출해야 합니다.

SQL 실행·파일 변경·메일 발송처럼 도구마다 영향이 다릅니다. 읽기 도구와 변경 도구를 구분하고, 중요한 변경에는 승인과 감사 기록을 구성합니다. 모델이 고른 함수명을 제한 없이 실행하는 구조는 피합니다.

## Observe: 결과를 받고 상태를 갱신한다

검색 결과는 관련 메일의 제목·본문·날짜일 수도 있고, 접근 거절·빈 결과·시간 초과일 수도 있습니다. 에이전트는 이를 바탕으로 검색 조건을 바꾸거나 추가 조회를 하거나 종료합니다.

“메일 42건, 중요 메일 5건”처럼 정해진 숫자를 넣은 설명은 이해를 위한 가상 사례일 뿐입니다. 실제 실행 결과처럼 제시해서는 안 됩니다. 페이지네이션이나 일부 결과만 반환된 경우에는 전체를 확인한 것처럼 요약하지 않아야 합니다.

메일·웹 문서 안에는 에이전트를 다른 행동으로 유도하는 문장이 있을 수도 있습니다. **도구가 반환한 외부 콘텐츠는 데이터이며 상위 지시나 실행 권한이 아닙니다.** 관찰한 내용과 신뢰할 수 있는 지침을 구분합니다.

## LLM과 Agent의 차이는 모델 이름보다 제어 구조다

| 구성 | 일반적인 역할 |
| --- | --- |
| 한 번의 모델 호출 | 입력을 바탕으로 텍스트·구조화 값·도구 호출 제안 생성 |
| 에이전트 시스템 | 상태를 유지하며 모델·도구·환경을 반복 연결 |
| 실행기·하네스 | 도구 실행, 맥락 구성, 권한, 종료·복구 정책 등을 담당 |

LLM도 도구 호출 출력을 만들 수 있고, 에이전트가 매번 도구를 사용해야 하는 것도 아닙니다. 차이는 “말만 하는 모델 대 행동하는 모델”이라는 이분법보다 **출력을 실행·관찰·다음 판단으로 연결하는 시스템이 있는가**에서 보는 편이 정확합니다.

현재 LangChain 문서는 에이전트를 도구 호출 루프와 그 주변 하네스로 설명하며 `create_agent`를 제공합니다. 원 논문의 텍스트 Thought·Action 형식과 오늘날 구조화된 도구 호출 API는 구분해야 합니다. 모든 도구 호출 루프가 원 논문을 그대로 재현하는 것은 아닙니다. [LangChain Agents](https://docs.langchain.com/oss/python/langchain/agents)

## 무한 반복하지 않는 최소 모형

아래 코드는 **LLM을 호출하지 않는 실행 가능한 모형**입니다. 검색 도구가 실행되고 결과가 다음 정책 입력으로 전달되는 구조, 허용 목록과 종료 제한만 보여줍니다. `policy`는 실제 모델 대신 결정적으로 동작합니다.

```python
MAILS = [{"subject": "주간 검토", "important": True}]

def search_mail():
    return MAILS.copy()

TOOLS = {"search_mail": search_mail}

def policy(state):
    if not state["observations"]:
        return {"type": "tool", "name": "search_mail"}
    return {"type": "finish", "answer": "중요 메일: 주간 검토"}

def run_agent(max_steps=3):
    state = {"observations": []}
    for _ in range(max_steps):
        action = policy(state)
        if action["type"] == "finish":
            return action["answer"]
        name = action.get("name")
        if action["type"] != "tool" or name not in TOOLS:
            raise ValueError("허용되지 않은 행동")
        result = TOOLS[name]()
        state["observations"].append({"tool": name, "result": result})
    raise RuntimeError("최대 단계 수 초과")

if __name__ == "__main__":
    assert run_agent() == "중요 메일: 주간 검토"
    try:
        run_agent(max_steps=1)
    except RuntimeError:
        print("종료 제한 확인")
    else:
        raise AssertionError("제한 없이 완료됨")
    print(run_agent())
```

운영 구현에는 인자 검증·인증·시간 제한·오류 정책·사용량 제한·상태 저장 등이 더 필요합니다. 단계 수 제한만으로 멈춘 도구 호출을 시간 내에 종료시킬 수 있는 것도 아닙니다.

## 비슷한 패턴은 무엇이 있나?

아래는 서로를 대체하는 모델 목록이 아닙니다. 일부는 연구 방법, 일부는 일반 설계 패턴입니다. 함께 조합할 수도 있습니다.

| 패턴 | ReAct와 비교한 초점 | 주의점 |
| --- | --- | --- |
| 고정 워크플로 | 코드가 경로·순서를 정함 | 예상하지 못한 상황의 분기 설계 |
| Plan-and-Execute | 계획을 세우고 실행·필요 시 재계획 | 잘못된 초기 계획의 누적 |
| ReWOO | 계획과 도구 관찰의 반복 결합을 줄임 | 결과 의존성과 예상 밖 상황 처리 |
| 평가·개선 루프 | 결과를 기준과 비교해 수정 | 신뢰할 평가 기준과 반복 상한 |
| Reflexion | 피드백을 텍스트 기억으로 남겨 다음 시도에 활용 | 잘못된 반성을 재사용할 위험 |
| 다중 에이전트 | 역할·컨텍스트를 나누어 위임 | 비용·조율·정보 전달 손실 |

### Plan-and-Execute와 ReWOO

Plan-and-Execute는 여러 단계의 작업 계획과 실행을 구분하는 일반적인 패턴입니다. 관찰 결과에 따라 재계획할 수도 있어 ReAct와 완전히 배타적인 것은 아닙니다.

2023년 ReWOO 논문은 관찰과 추론의 반복 결합을 줄이고 계획·도구 실행·결과 종합을 나누는 접근을 제안했습니다. 이름에 Observation이 없다고 최종 결과를 사용하지 않는다는 뜻은 아닙니다. [ReWOO 논문](https://arxiv.org/abs/2305.18323)

### Reflexion과 평가·개선

2023년 Reflexion은 모델 가중치를 갱신하기보다 피드백을 언어로 정리해 기억하고 다음 시도에 활용합니다. 일반적인 “답변 한 번 검토하기”와 논문의 구체적인 기억·시도 구조를 동일시하지 않아야 합니다. [Reflexion 논문](https://arxiv.org/abs/2303.11366)

평가·개선 루프에는 테스트, 스키마 검사, 사람의 기준 등을 사용할 수 있습니다. 모델이 스스로 좋다고 평가했다는 것만으로 정답이나 안전성이 증명되지는 않습니다.

## 2026년 현재 구현 도구는 어떻게 연결될까?

| 도구·문서 | 위치 | 확인할 특징 |
| --- | --- | --- |
| LangChain `create_agent` | 에이전트 루프의 고수준 진입점 | 모델·도구·미들웨어 구성 |
| LangGraph | 워크플로·에이전트 제어 구조 | 상태·분기·지속성·중단과 재개 |
| Deep Agents | 장기·복합 작업을 위한 하네스 | 파일 시스템·컨텍스트·하위 에이전트, 선택적 계획·스킬 |
| Claude Agent SDK | Claude Code 기반 실행 환경을 라이브러리로 활용 | 도구·세션·권한·훅·맥락 관리 |

LangGraph는 워크플로와 동적 에이전트를 모두 구성할 수 있습니다. 프레임워크를 사용했다고 모든 흐름이 자율 에이전트가 되는 것은 아닙니다. [워크플로와 에이전트](https://docs.langchain.com/oss/python/langgraph/workflows-agents)

Deep Agents는 파일 시스템을 이용한 컨텍스트 관리와 위임 등 복잡한 작업을 위한 기능을 제공합니다. 이름의 Deep이 새로운 기초 모델이나 ReAct보다 높은 정확도를 자동 보장한다는 뜻은 아닙니다. [Deep Agents 개요](https://docs.langchain.com/oss/python/deepagents/overview)

Claude Agent SDK는 Python·TypeScript 애플리케이션에서 Claude Code의 도구·루프·컨텍스트 관리를 활용하는 방식입니다. 일반 모델 API 클라이언트와 같은 역할은 아닙니다. [Agent SDK 개요](https://code.claude.com/docs/en/agent-sdk/overview)

이 목록은 인기 순위가 아니라 공식 문서에서 확인한 구현 선택지입니다. Reflexion·ReWOO는 2023년 연구이고, 위 SDK·프레임워크의 현재 기능과는 시간·추상화 수준이 다릅니다.

## 최근에는 루프 주변의 설계가 중요해졌다

기본적인 행동 루프만 만들어도 데모는 가능합니다. 하지만 작업이 길어지면 실행 결과가 쌓이고, 관련 없는 문맥이 늘어나며, 도구 오류와 권한 문제가 생깁니다.

최근의 컨텍스트 엔지니어링은 매번 모든 기록을 넣기보다 **현재 판단에 필요한 정보를 어떻게 선택·유지할지**를 다룹니다. 도구 결과 요약, 필요한 자료의 검색, 작업 상태 보존, 하위 작업의 맥락 분리가 여기에 연결됩니다. [Anthropic 컨텍스트 엔지니어링](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

단순·명확한 절차라면 고정 워크플로가 더 예측 가능할 수 있습니다. 경로를 미리 정하기 어렵고 중간 관찰이 중요한 작업은 동적 루프를 검토할 수 있습니다. 두 방식을 결합하는 것도 가능합니다. [에이전트 설계 패턴](https://www.anthropic.com/engineering/building-effective-agents)

## 메일 요약 에이전트라면 무엇을 확인할까?

- **범위:** 지난주의 날짜·시간대, 접근 가능한 메일함, 중요도의 기준
- **정확성:** 원문 근거·날짜·금액·기한의 누락과 왜곡
- **도구:** 검색 인자·페이지네이션·빈 결과·오류 처리
- **실행:** 읽기와 발송·삭제의 권한 분리, 변경 전 승인
- **종료:** 단계·시간·비용 제한, 반복되는 실패 시 중단·추가 질문
- **관찰:** 실제 호출·결과·상태 변화 기록과 민감 정보 보호

평가할 것은 생각을 얼마나 길게 설명했는지가 아닙니다. **필요한 정보를 확인하고, 허용된 행동을 수행하며, 근거 있는 결과로 종료했는지**입니다.

## 참고 자료·관련 글

- [ReAct 원 논문](https://arxiv.org/abs/2210.03629)
- [ReWOO](https://arxiv.org/abs/2305.18323) · [Reflexion](https://arxiv.org/abs/2303.11366)
- [LangChain Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [LangGraph Workflows and agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents)
- [Deep Agents](https://docs.langchain.com/oss/python/deepagents/overview)
- [Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview)
- [스킬·MCP·툴·커넥터 개념 정리]({% post_url 2026-10-15-skills-mcp-tools-connectors %})
- [멱등성과 재시도]({% post_url 2026-10-20-idempotency-retries %})
