---
title: "Claude Skills 입문 ①: SKILL.md, Arena, Claude MD Doctor"
date: 2026-10-15 11:00:00 +0900
categories: [AI, LLM]
tags: [Claude-Code, Agent-Skills, SKILL.md, Arena, CLAUDE.md, Context-Engineering]
---

AI에게 매번 같은 작업 순서와 기준을 설명하고 있다면, 그 절차를 재사용할 수 있도록 묶는 방법이 있습니다. **Agent Skills**입니다.

이 글에서는 Skills의 구조를 살펴보고, 서로 다른 문제를 해결하는 커뮤니티 프로젝트 **Arena**와 **Claude MD Doctor**를 소개합니다. 다음 편에서는 디자인·개발·DB·영상 분야의 스킬과 관련 도구를 비교합니다.

2026년 10월 15일 기준 공식 문서와 원본 저장소를 확인한 소개입니다. 설치·실행 후기나 성능 실험 결과가 아니라, 문서에 명시된 기능과 이를 활용할 때의 판단 기준을 정리했습니다.

---

## 🎯 Claude Skills란?

Skill은 특정 작업을 위한 **지침, 메타데이터, 선택적 스크립트·참고 자료**를 묶은 재사용 가능한 작업 패키지입니다. 모델을 새로 학습시키는 대신, 필요한 작업에서 사용할 절차와 자료를 제공합니다. [Anthropic 공식 개요](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

예를 들어 기술 블로그 작성 Skill은 다음을 담을 수 있습니다.

- 기존 글의 front matter와 파일명 규칙 확인.
- 공식 문서로 사실 확인.
- 개념·예제·주의점·참고 자료 순서로 작성.
- 코드 예제와 링크 검증.

이렇게 절차를 묶으면 매번 긴 프롬프트를 다시 붙이는 부담을 줄일 수 있습니다. 실제 사용 가능 여부와 필요한 도구는 실행 환경에 따라 달라집니다.

---

## 📁 SKILL.md의 기본 구조

Skill은 일반적으로 `SKILL.md`를 중심으로 구성합니다.

```text
blog-writing/
├── SKILL.md
├── references/
│   └── writing-guide.md
├── templates/
│   └── post.md
└── scripts/
    └── check_links.py
```

아래는 설명을 위해 만든 최소 예시입니다.

```markdown
---
name: blog-writing
description: 기술 블로그 글을 작성하거나 수정할 때 사용한다. 기존 형식 확인, 공식 출처 조사, 예제 검증을 포함한다.
---

# 기술 블로그 작성

1. 기존 글의 front matter와 파일명 규칙을 확인한다.
2. 독자와 글의 핵심 질문을 정한다.
3. 공식 자료를 확인하고 출처를 연결한다.
4. 예제가 있다면 실행 결과를 확인한다.
5. 변경 파일과 검증 결과를 요약한다.

상세 문체는 references/writing-guide.md를 참고한다.
```

`name`은 이름을, `description`은 무엇을 하고 언제 사용할지를 설명합니다. 본문에는 작업 순서와 판단 기준을 넣습니다. 상세 자료는 별도 파일에 둘 수 있지만, 실제 파일을 만들어 연결해야 합니다.

Claude Code에서 프로젝트용 Skill은 `.claude/skills/<이름>/SKILL.md`, 개인용은 `~/.claude/skills/<이름>/SKILL.md`에 둘 수 있습니다. 관련 작업에서 사용하거나 `/이름`으로 직접 호출할 수 있습니다. 설치·호출 방법은 배포 방식에 따라 달라집니다. [Claude Code Skills 문서](https://code.claude.com/docs/en/skills)

### 필요한 내용을 단계적으로 읽기

Skills는 이름·설명으로 관련성을 판단하고, 필요할 때 본문과 추가 자료를 읽는 방식으로 설계됩니다. 이 때문에 사용 조건을 분명하게 쓰는 것이 중요합니다. 참고 파일로 나눴다고 필요한 순간의 컨텍스트 사용량까지 사라지는 것은 아닙니다.

---

## 🧭 CLAUDE.md·Skill·MCP·플러그인의 차이

| 요소 | 주요 역할 | 예시 |
| --- | --- | --- |
| CLAUDE.md | 프로젝트의 지속적인 맥락과 작업 지침 | 저장소 구조, 사용하는 명령, 코딩 규칙 |
| Skill | 특정 작업에서 사용하는 재사용 절차 | 블로그 작성, 리뷰, DB 튜닝 |
| MCP | 외부 도구·데이터와 연결하는 프로토콜 | 이슈 조회, 문서 검색, DB 도구 연결 |
| 플러그인 | 여러 기능을 배포하는 묶음 | Skills·설정·연결 기능 등을 함께 제공 |

Skill이 작업 방법을 알려주고 MCP 도구가 필요한 데이터에 접근하는 식으로 함께 사용할 수 있습니다. Skill 파일이 있다고 존재하지 않는 도구나 권한이 자동으로 생기지는 않습니다.

프로젝트의 핵심 규칙과 작업 절차를 어디에 둘지는 읽히는 범위와 시점을 고려해야 합니다. [Claude Code 메모리 문서](https://code.claude.com/docs/en/memory)

---

## 🏟️ Arena: 여러 전략의 답안을 경쟁시키기

여기서 소개하는 것은 **[Jakeschincariol/arena-skill](https://github.com/Jakeschincariol/arena-skill)**입니다. Arena라는 이름의 다른 프로젝트와 구분해야 하며, Anthropic의 기본 기능이 아닌 커뮤니티 Skill입니다.

원본 README에 따르면 같은 모델의 서브에이전트에 동일한 과제와 서로 다른 전략 카드를 주고, 답안 생성 → 상호 비판 → 방어·수정 → 심사 → 토너먼트 반복을 수행합니다. 여러 종류의 모델을 비교하는 서비스와는 구조가 다릅니다.

<figure class="article-diagram">
<figcaption>후보를 비교해 답을 다듬는 과정</figcaption>
<ol>
<li>같은 과제 + 서로 다른 전략</li>
<li>여러 후보 답안</li>
<li>상호 비판·답안 수정</li>
<li>기준표로 심사·진출</li>
<li>최종 답안과 검토 과정 반환</li>
</ol>
</figure>

확인 시점의 기본 경쟁자는 100개, `--quick`은 16개입니다. 후보 수와 전체 호출 수는 다릅니다. README의 계산에서는 100개 경쟁자가 전체 595회의 서브에이전트 호출을 사용합니다. 전부 동시에 실행되는 것도 아닙니다.

설치 후 사용하는 호출 예시는 다음과 같습니다.

```text
/arena --quick API 설계안의 대안을 비교해줘
/arena --agents 16 이 문제의 해결 전략을 검토해줘
```

플러그인 설치 시에는 `/arena-skill:arena`처럼 이름 공간이 붙습니다. Claude Code와 Python 3.8 이상이 필요합니다. 결과는 `.arena/` 아래에 기록하며 프로젝트 변경은 별도로 적용하도록 설계되어 있습니다.

**경쟁에서 이겼다는 사실은 정답의 증명이 아닙니다.** 평가 기준과 과제의 완성도가 중요하고, 모델 사용량·시간도 함께 고려해야 합니다. 구체적인 수치와 동작은 [원본 README](https://github.com/Jakeschincariol/arena-skill/blob/main/README.md) 기준입니다.

---

## 🩺 Claude MD Doctor: 지침 파일이 실제로 작동하는지 진단

**[agent-clinic/claude-md-doctor](https://github.com/agent-clinic/claude-md-doctor)**는 `CLAUDE.md`·`AGENTS.md` 같은 에이전트 지침 파일을 진단하는 독립 커뮤니티 프로젝트입니다. 일반 Markdown 글의 문체를 다듬는 도구와 목적이 다릅니다.

| 진단 영역 | 확인하는 내용 |
| --- | --- |
| 파일 상태 | 분량, 구조, 반복·불필요한 설명 |
| 참조 | 존재하지 않는 경로, 명령, import |
| 사실 | 저장소 상태와 어긋난 검증 가능한 주장 |
| 세션 대조 | 지침이 적용된 상황과 준수·위반 기록 |
| 개선 제안 | 문서 정리, 테스트·린터·훅 등으로 옮길 규칙 |

프로젝트 설명에 따르면 Python 3.9 이상이 필요하며, 진단 보고서를 `.claude-md-doctor/report.html`과 JSON으로 생성합니다. 기록을 바탕으로 지침 초안도 제안할 수 있지만 자동으로 채택하거나 훅을 설치하는 방식은 아닙니다. [원본 README](https://github.com/agent-clinic/claude-md-doctor/blob/main/README.md)

Skill 폴더를 직접 복사한 설치에서는 `/claude-md-doctor`, 플러그인 설치에서는 `/claude-md-doctor:claude-md-doctor`로 호출합니다. 명령 이름이 같은 Claude Code 기본 `/doctor`와 구분해야 합니다.

진단은 스크립트의 측정과 에이전트의 해석을 결합합니다. 세션 기록이 없으면 과거 준수 여부를 판단하는 근거도 부족합니다. 규칙을 언급한 것과 실제 수행한 것을 혼동하는 오탐을 검토해야 하며, 점수를 절대적인 품질 판정으로 볼 수는 없습니다. [원본 SKILL.md](https://github.com/agent-clinic/claude-md-doctor/blob/main/skills/claude-md-doctor/SKILL.md)

로컬 스크립트 실행과 모델에 전달되는 문맥의 데이터 처리는 별개입니다. 세션 기록을 진단할 때는 사용하는 Claude 환경의 데이터 처리 조건도 함께 확인합니다.

---

## ⚖️ 두 도구는 어떤 문제가 다를까?

| 비교 | Arena | Claude MD Doctor |
| --- | --- | --- |
| 출발점 | 현재 과제의 답안을 더 검토하고 싶음 | 지속적인 지침이 유효한지 확인하고 싶음 |
| 입력 | 과제와 선택적 기존 답안 | 지침 파일, 저장소, 가능한 세션 기록 |
| 핵심 방식 | 다양한 전략과 토너먼트 평가 | 정적 검사와 기록 대조·해석 |
| 산출물 | 최종 후보와 검토 과정 | 근거를 포함한 진단 보고서·제안 |
| 검토할 비용 | 반복 호출과 실행 시간 | 기록 접근 범위와 진단의 정확성 |

---

## ✅ 좋은 Skill의 기준

사용 조건과 결과물이 명확하고, 필요한 도구·입력이 실제로 존재해야 합니다. 절차를 길게 쓰기보다 실패 조건과 검증 방법을 구체화하는 것이 좋습니다. [Anthropic 작성 가이드](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

설치 전에는 `SKILL.md`뿐 아니라 스크립트·외부 요청·파일 접근도 확인합니다. 평가할 때는 같은 과제를 Skill 적용 전후로 비교하고, 결과 품질과 시간·사용량을 함께 봅니다. 블로그 예제라면 형식 준수, 출처, 코드 실행, 링크 오류를 관찰할 수 있습니다.

📚 **다음 글**: [함께 알아둘 인기 스킬과 도구 9가지]({% post_url 2026-10-15-popular-agent-skills-guide %})
