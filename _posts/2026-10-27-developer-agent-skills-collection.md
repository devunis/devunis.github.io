---
title: "개발자용 AI 스킬 12선: 디자인·테스트·DB·디버깅·보안까지"
date: 2026-10-27 00:01:00 +0900
categories: [AI, Development]
tags: [Agent-Skills, Developer-Tools, Testing, Code-Review, Security]
---

AI 코딩 도구에 “잘 만들어줘”라고 요청하는 것과, 프로젝트를 확인하고 구현·검증하는 절차를 알려주는 것은 다릅니다. **Agent Skill은 특정 작업의 절차와 참고 자료를 재사용하는 방법**입니다.

이 글에서는 2026년 10월 27일 확인한 제작자 저장소와 원본 문서를 기준으로 개발에 활용할 수 있는 12개를 작업별로 정리합니다. 설치 수 순위나 모든 스킬을 직접 검증한 성능 평가는 아닙니다. 예전의 [인기 스킬 소개]({% post_url 2026-10-15-popular-agent-skills-guide %})보다 개발 단계별 선택에 초점을 맞췄습니다.

## 스킬, 스킬 모음, 실행 도구는 다르다

스킬은 보통 `SKILL.md`와 선택적인 참고 문서·스크립트·템플릿으로 구성됩니다. 스킬 모음 저장소에는 여러 작업의 스킬이 들어 있고, 플러그인은 이를 다른 구성 요소와 함께 배포할 수 있습니다. [Anthropic Skills 저장소](https://github.com/anthropics/skills)

브라우저 테스트 스킬을 설치했다고 브라우저 실행 환경까지 모두 준비되는 것은 아닙니다. DB 검토 지침이 있다고 운영 DB 접근 권한이 생기는 것도 아닙니다. **지침과 실행 능력, 서비스 접근 권한을 구분**해야 합니다.

## 작업별로 고르는 12개

| 작업 | 스킬 | 제작자·저장소 |
| --- | --- | --- |
| 화면 디자인 | frontend-design | Anthropic Skills |
| React·Next.js 성능 | react-best-practices 폴더 | Vercel Agent Skills |
| UI·접근성 검토 | web-design-guidelines | Vercel Agent Skills |
| 웹 UI 테스트 | webapp-testing | Anthropic Skills |
| PostgreSQL | supabase-postgres-best-practices | Supabase Agent Skills |
| 원인 중심 디버깅 | systematic-debugging | Superpowers |
| 완료 전 검증 | verification-before-completion | Superpowers |
| Django 권한 검토 | django-access-review | Sentry Skills |
| 변경 사항 보안 리뷰 | differential-review | Trail of Bits Skills |
| 프로젝트 지침 정리 | agents-md | Sentry Skills |
| MCP 서버 개발 | mcp-builder | Anthropic Skills |
| 자체 스킬 제작·개선 | skill-creator | Anthropic Skills |

표의 저장소 소유자와 개별 폴더를 함께 확인해야 합니다. 같은 이름의 스킬이 다른 곳에도 있을 수 있으며, 폴더명·스킬 메타데이터 이름·플러그인 설치 이름이 항상 일치하는 것은 아닙니다.

## 1. frontend-design: 화면의 방향을 구체화하기

[원본 스킬](https://github.com/anthropics/skills/tree/main/skills/frontend-design)은 목적과 콘텐츠에 맞는 시각적 방향, 글자 크기, 색상, 레이아웃을 선택하도록 안내합니다. 랜딩 페이지·대시보드·제품 화면을 만들 때 검토할 수 있습니다.

단순히 색상을 추가하는 것보다, 정보의 우선순위와 사용자가 해야 할 일을 먼저 정하는 데 활용하면 좋습니다. 기존 디자인 시스템과 실제 화면 크기·키보드 검증을 대체하지는 않습니다.

**요청 예시:** “이 관리자 화면에서 가장 중요한 작업이 먼저 보이도록 구성하고, 모바일에서도 표와 버튼이 겹치지 않게 검토해줘.”

## 2. React best practices: 성능 문제를 살펴보기

[Vercel의 react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)는 요청의 연쇄 대기, 번들 크기, 서버·클라이언트 렌더링 등 성능과 관련된 패턴을 다룹니다.

불필요한 최적화를 일괄 적용하기보다, 느린 화면의 실제 측정 결과와 함께 사용합니다. 규칙에 맞는 코드와 사용자가 체감할 개선은 같은 것이 아닙니다.

**요청 예시:** “데이터 요청의 의존 관계와 번들 구성을 먼저 살펴보고, 측정 가능한 병목 후보만 정리해줘.”

## 3. web-design-guidelines: 만들어진 UI 검토하기

[Vercel의 web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)는 접근성·폼·포커스·애니메이션·테마 등을 검토하는 데 활용할 수 있습니다.

제작 방향을 잡는 frontend-design과 달리, 구현된 UI를 기준에 맞춰 살펴보는 데 초점을 둘 수 있습니다. 다크모드 명암비, 키보드 이동, 오류 메시지처럼 놓치기 쉬운 부분을 확인합니다. 두 항목의 범위는 [Vercel 저장소 안내](https://github.com/vercel-labs/agent-skills)에서도 확인할 수 있습니다.

**요청 예시:** “현재 화면의 폼 라벨·포커스·다크모드 대비를 검토하고 문제 위치를 알려줘.”

## 4. webapp-testing: 실제 화면에서 확인하기

[webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)은 Playwright를 활용한 로컬 웹 애플리케이션 상호작용과 테스트를 안내합니다. 버튼 동작·브라우저 로그·스크린샷 같은 실행 근거를 확인하는 데 적합합니다.

실행 환경과 브라우저 의존성이 필요합니다. 화면이 열렸다는 사실만 확인할지, 저장 후 데이터까지 확인할지 테스트 목표를 먼저 정해야 합니다.

**요청 예시:** “테스트 계정으로 입력→저장→목록 반영을 확인하고, 실패하면 브라우저 로그와 화면을 남겨줘.”

## 5. supabase-postgres-best-practices: DB 검토 기준 만들기

[Supabase의 PostgreSQL 스킬](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices)은 쿼리·연결 관리·스키마·잠금·RLS 등 PostgreSQL 지침을 제공합니다. Supabase 전체 제품을 다루는 `supabase` 스킬과 구분됩니다. [저장소 안내](https://github.com/supabase/agent-skills)

느린 쿼리라면 실행 계획·데이터 분포·쓰기 비용을 함께 봅니다. 스킬이 제시한 인덱스를 바로 운영 DB에 적용하기보다 검증 가능한 변경으로 만들어야 합니다.

**요청 예시:** “이 쿼리와 실행 계획을 함께 보고 인덱스 후보, 쓰기 비용, 검증 방법을 설명해줘.”

## 6. systematic-debugging: 추측 수정에서 벗어나기

[Superpowers의 systematic-debugging](https://github.com/obra/superpowers/tree/main/skills/systematic-debugging)은 재현·오류 읽기·변경 이력·가설 검증을 통해 원인을 좁히는 절차를 강조합니다.

에러 메시지 한 줄을 보고 곧바로 코드를 바꾸는 대신, 실패 조건과 정상 조건의 차이를 찾는 데 사용할 수 있습니다. 서비스 장애에서 반드시 지켜야 하는 팀의 대응 절차가 있다면 함께 적용합니다.

**요청 예시:** “코드를 수정하기 전에 실패를 재현하고, 원인 후보별로 어떤 증거가 필요한지 정리해줘.”

## 7. verification-before-completion: 완료 주장을 확인하기

[verification-before-completion](https://github.com/obra/superpowers/tree/main/skills/verification-before-completion)은 완료·수정·테스트 통과 같은 주장에 새로운 검증 근거를 요구하는 지침입니다.

“아마 통과할 것”과 실제 실행 결과를 구분하는 데 도움이 됩니다. 단순한 수정에 불필요한 검사를 무한정 늘리기보다, 변경의 성공 조건을 증명하는 검증을 선택합니다.

두 스킬은 [Superpowers](https://github.com/obra/superpowers) 개발 방법론의 일부입니다. 전체 묶음과 개별 스킬의 적용 범위가 다르므로 기존 팀 절차와 겹치는 부분을 확인합니다.

**요청 예시:** “이번 변경의 성공 조건을 먼저 적고, 직접 확인한 결과와 아직 확인하지 못한 범위를 구분해줘.”

## 8. django-access-review: 로그인 다음의 권한 검사

[Sentry의 django-access-review](https://github.com/getsentry/skills/tree/main/skills/django-access-review)는 Django·DRF의 접근 제어, 객체 권한, 사용자·테넌트 사이 데이터 격리를 검토합니다.

인증된 사용자라는 사실만으로 다른 사용자의 데이터를 읽고 바꿀 수 있어서는 안 됩니다. 스킬은 해당 코드의 실제 권한 구조와 데이터 흐름을 확인하는 방식으로 안내합니다.

**요청 예시:** “사용자 A가 URL의 객체 ID를 바꿨을 때 사용자 B의 데이터를 읽거나 수정할 수 있는지 조회부터 저장까지 추적해줘.”

## 9. differential-review: 이번 변경이 만든 보안 영향

[Trail of Bits의 differential-review](https://github.com/trailofbits/skills/tree/main/plugins/differential-review)는 변경 코드, Git 이력, 호출 관계와 테스트 범위를 바탕으로 보안 영향을 살펴봅니다.

전체 저장소를 막연히 검사하는 대신 PR이나 커밋의 변화가 권한·외부 호출 등 중요한 경계에 어떤 영향을 주는지 검토할 때 후보가 됩니다. 도구의 보고서는 보안 무결성의 보증서가 아닙니다. [Trail of Bits 모음](https://github.com/trailofbits/skills)

**요청 예시:** “이 변경이 인증·인가 경계를 약화하는지 검토하고, 확인된 문제와 추정만 가능한 부분을 나누어 보고해줘.”

## 10. agents-md: 프로젝트 지침을 간결하게 유지하기

[Sentry의 agents-md](https://github.com/getsentry/skills/tree/main/skills/agents-md)는 실제 저장소의 명령·문서·규칙을 확인해 `AGENTS.md`·`CLAUDE.md` 같은 지침을 정리하는 데 사용합니다.

확인하지 않은 테스트 명령을 넣거나 긴 일반론을 복사하기보다 프로젝트에서 필요한 내용을 유지하는 방향입니다. 파일 탐색·상속·우선순위는 사용하는 에이전트의 규칙도 확인해야 합니다.

**요청 예시:** “실제로 존재하는 빌드·테스트 명령과 수정하면 안 되는 생성 파일을 확인해 프로젝트 지침을 정리해줘.”

Sentry의 모음은 팀의 개발 관행을 담고 있습니다. 서비스 연동이나 운영 오류 조사를 위한 별도 도구와 같은 것으로 이해하면 안 됩니다. [Sentry Skills 안내](https://github.com/getsentry/skills)

## 11. mcp-builder: 도구를 노출하는 서버 만들기

[Anthropic의 mcp-builder](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)는 외부 API·서비스를 연결하는 MCP 서버를 설계하고 구현하는 지침입니다.

도구 이름과 인자·결과를 모델이 이해할 수 있게 만드는 것부터 오류 처리와 검증까지 생각할 수 있습니다. 이 스킬 자체가 실행 중인 MCP 서버는 아닙니다.

**요청 예시:** “사내 문서 검색 API를 MCP 도구로 감싸되, 검색 범위와 권한이 명확하고 결과에 출처가 포함되도록 설계해줘.”

## 12. skill-creator: 우리 팀의 반복 작업을 스킬로

[Anthropic의 skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)는 스킬 제작·수정과 평가를 안내합니다. 반복되는 리뷰 기준이나 문서 작성 절차를 재사용하고 싶을 때 살펴볼 수 있습니다.

**요청 예시:** “API 변경 시 계약·권한·호환성·테스트를 확인하는 스킬을 만들고, 적용되어야 할 요청과 아닌 요청으로 평가해줘.”

파일이 생겼다는 사실과 적절한 상황에서 호출되어 좋은 결과를 낸다는 사실은 다릅니다. 적용 조건과 결과를 모두 확인해야 합니다.

## 설치는 필요한 것부터 선택한다

아래는 **독자가 실행할 수 있는 예시**입니다. 이 글 작성 과정에서 이 모음들을 사용자 환경에 설치하지 않았습니다.

```bash
# 검색
npx skills find testing

# UI 검토 스킬 하나 선택
npx skills add vercel-labs/agent-skills --skill web-design-guidelines

# PostgreSQL 스킬 하나 선택
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices
```

확인 시점 Skills CLI는 Node.js 22.20 이상을 요구하며, 기본 설치 범위는 현재 프로젝트입니다. 전체 프로젝트에서 사용할 전역 설치와 구분합니다. 선택 화면에서 대상 스킬과 에이전트를 확인합니다. [Skills CLI 공식 안내](https://github.com/vercel-labs/skills)

플러그인 단위로 배포되는 모음은 제작자의 설치 문서를 따릅니다. 하나의 설치 명령을 모든 에이전트와 저장소에 그대로 적용할 수 있다고 가정하지 않습니다.

## 많이 설치하기보다 작업에 맞게 조합하기

<figure class="article-diagram">
<figcaption>과제 하나에서 시작하는 스킬 선택</figcaption>
<ol><li>목표와 성공 조건 정의</li><li>현재 기술·작업에 맞는 스킬 선택</li><li>원본 지침·스크립트·의존성과 적용 범위 확인</li><li>작은 변경 또는 테스트 환경에서 실행</li><li>결과 검증 후 유지할 스킬과 팀 규칙 정리</li></ol>
</figure>

| 작업 예 | 조합 후보 |
| --- | --- |
| 새 UI 제작 | frontend-design → web-design-guidelines → webapp-testing |
| 재현 가능한 버그 수정 | systematic-debugging → 관련 테스트 → verification-before-completion |
| Django API 변경 | django-access-review + 변경 범위 리뷰 |
| PostgreSQL 병목 조사 | supabase-postgres-best-practices + 실행 계획·부하 검증 |
| 사내 도구 연결 | mcp-builder + 프로젝트 권한·실행 정책 |

이 조합은 이 글의 활용 제안이며 각 제작자가 하나의 통합 제품으로 제공한다는 뜻은 아닙니다. 같은 작업에 지침이 여러 개 겹치면 프레임워크 버전·우선순위·기존 프로젝트 규칙부터 맞춥니다.

스킬에는 실행 스크립트가 포함될 수 있습니다. 설치 전 원본과 실행·네트워크·쓰기 범위를 확인하고, 설치 수나 별 개수를 안전성 보증으로 받아들이지 않습니다. 공식 제작자의 스킬도 프로젝트의 목적·권한과 맞는지는 별도로 판단해야 합니다.

## 관련 글

- [스킬·MCP·툴·커넥터 개념 정리]({% post_url 2026-10-15-skills-mcp-tools-connectors %})
- [ReAct와 에이전트 구현 비교]({% post_url 2026-10-26-react-agent-reason-act-observe %})
- [Skills 디렉터리](https://skills.sh/)
