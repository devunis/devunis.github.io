---
title: "OpenSearch란? 검색 엔진의 기본 구조부터 로그 분석·RAG 활용까지"
date: 2026-11-17 00:01:00 +0900
categories: [Backend, Search]
tags: [OpenSearch, Elasticsearch, Search, Inverted-Index, Vector-Search, RAG]
---

블로그 제목과 본문을 검색하고, 로그에서 오류를 찾고, 질문과 관련된 문서를 가져오는 기능은 모두 검색과 연결됩니다. **OpenSearch는 문서를 저장하고 검색·집계하는 분산 검색·분석 엔진**입니다.

관계형 DB와 무엇이 다른지, Elasticsearch와 어떤 관계인지부터 살펴보고 간단한 검색 API를 만들어 보겠습니다. 내용은 2026년 11월 17일 확인한 공식 문서를 기준으로 합니다.

## OpenSearch·Dashboards·AWS 서비스의 차이

| 이름 | 역할 |
| --- | --- |
| OpenSearch | JSON 문서의 색인·검색·분석을 수행하는 엔진 |
| OpenSearch Dashboards | 데이터를 탐색하고 시각화하며 쿼리를 실행하는 웹 도구 |
| Amazon OpenSearch Service | AWS에서 OpenSearch 클러스터의 배포·운영을 지원하는 관리형 서비스 |

OpenSearch는 AWS에서만 사용할 수 있는 제품이 아닙니다. 직접 설치해 운영할 수 있고, 관리 부담을 줄이기 위해 AWS 서비스를 선택할 수도 있습니다. 관리형에서도 데이터 모델, 검색 품질, 접근 권한과 비용은 설계해야 합니다. [OpenSearch 소개](https://docs.opensearch.org/latest/getting-started/intro/), [AWS 서비스 안내](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/what-is.html)

### Elasticsearch와는 어떤 관계일까?

OpenSearch와 Dashboards는 Apache 2.0 라이선스의 Elasticsearch 7.10.2와 Kibana 7.10.2에서 분기한 프로젝트입니다. OpenSearch는 Apache 2.0 라이선스로 제공됩니다. [공식 FAQ](https://opensearch.org/faq/)

공통된 출발점이 있어 쿼리와 개념이 비슷하지만, 이후에는 독립적으로 발전했습니다. 최신 Elasticsearch의 클라이언트·플러그인·인덱스를 그대로 연결할 수 있다고 가정하면 안 됩니다. 이전할 때는 사용하는 버전과 API, 분석기, 보안 설정, 색인 형식의 호환성을 확인해야 합니다.

## 관계형 DB 대신 쓰는 걸까?

관계형 DB에서도 전문 검색 기능을 제공할 수 있습니다. OpenSearch를 추가하는 이유는 단순히 “DB 검색은 느리다”가 아니라, 필요한 검색 기능과 운영 구조에 있습니다.

| 요구 | 먼저 살펴볼 구성 |
| --- | --- |
| 주문·결제·재고의 정합성 | 관계형 DB의 트랜잭션·제약 조건 |
| 제목·본문의 관련도 순위 | 전문 검색과 분석기·가중치 설계 |
| 상품 필터와 카테고리별 집계 | 검색 조건·필터·집계의 조합 |
| 많은 로그의 탐색과 시각화 | 수집 파이프라인·검색 인덱스·Dashboards |
| 질문과 의미가 비슷한 자료 조회 | 임베딩·벡터 검색 또는 하이브리드 검색 |

기존 PostgreSQL 검색으로 요구를 충족한다면 별도 엔진 없이 시작해도 됩니다. OpenSearch를 추가하면 검색 기능을 분리할 수 있지만 데이터 복제, 동기화와 클러스터 운영이라는 비용도 생깁니다.

## 문서·인덱스·매핑부터 이해하기

OpenSearch는 데이터를 **문서(Document)**로 저장하고, 관련 문서를 **인덱스(Index)**로 묶습니다. 블로그라면 글 한 편을 문서로, 검색할 글 모음을 `blog_posts_demo` 인덱스로 생각할 수 있습니다.

```json
{
  "title": "OpenSearch 검색 입문",
  "category": "backend",
  "published": true
}
```

**매핑(Mapping)**은 각 필드의 타입과 색인 방식을 정의합니다. 같은 문자열이라도 제목을 검색할지, 카테고리를 정확히 비교할지에 따라 타입이 달라집니다.

| 필드 타입 | 기본 동작 | 예시 |
| --- | --- | --- |
| `text` | 분석기로 문자열을 토큰화해 전문 검색에 사용 | 제목·본문 |
| `keyword` | 값을 하나의 항목으로 색인해 정확한 값 비교에 사용 | 카테고리·상품 코드 |
| `date` | 날짜·시간으로 해석 | 작성 시각 |
| `boolean` | 참·거짓 값 | 공개 여부 |
| `integer` 등 숫자 타입 | 숫자 비교·범위·집계 | 가격·응답 시간 |

`keyword`는 기본적으로 대소문자를 구분하며, 필요하면 normalizer를 설정할 수 있습니다. 같은 문자열을 본문 검색과 정렬에 모두 쓰려면 `text` 필드와 `keyword` 하위 필드로 나누는 방법도 있습니다. [text 필드](https://docs.opensearch.org/latest/mappings/supported-field-types/text/), [keyword 필드](https://docs.opensearch.org/latest/mappings/supported-field-types/keyword/)

## 검색은 어떻게 빨라질까? 역색인

책 뒤의 찾아보기에서 단어를 찾고 페이지로 이동하는 것처럼, **역색인은 검색어에서 그 단어가 등장하는 문서로 접근**하도록 만듭니다.

| 설명용 토큰 | 포함된 문서 |
| --- | --- |
| 검색 | 문서 1, 문서 2 |
| 로그 | 문서 2, 문서 3 |
| 배포 | 문서 3 |

검색 시 후보 문서를 찾은 뒤 관련도 점수를 계산해 순서를 정할 수 있습니다. 키워드 검색에서는 BM25가 대표적으로 사용됩니다. 위 표는 개념도이며 실제 토큰은 분석기 설정에 따라 달라집니다. [검색 기능 개요](https://docs.opensearch.org/latest/search-plugins/)

<figure class="article-diagram">
<figcaption>문서가 검색 결과가 되기까지</figcaption>
<ol><li>제목·본문 등 원문 입력</li><li>분석기로 검색용 토큰 생성</li><li>토큰과 문서의 관계를 역색인에 기록</li><li>질의와 일치하는 후보 조회·관련도 계산</li><li>조건에 맞는 검색 결과 반환</li></ol>
</figure>

한국어에서는 조사·복합어·띄어쓰기·사용자 사전이 검색 품질에 영향을 줍니다. `analysis-nori` 같은 언어 분석 플러그인을 검토하고, `_analyze` API로 실제 색인·질의 토큰을 확인하면 원인을 찾기 쉽습니다. 사용할 수 있는 플러그인과 설치 방법은 배포 환경에 따라 확인합니다. [플러그인 관리](https://docs.opensearch.org/latest/install-and-configure/plugins/)

## 예제: 공개된 백엔드 글만 검색하기

아래는 **OpenSearch Dashboards의 Dev Tools 콘솔**에서 위에서부터 실행하는 REST 요청 예시입니다. 접속한 클러스터에서 인덱스 생성·문서 쓰기·검색 권한이 필요하며, 다른 데이터와 겹치지 않는 새 인덱스 이름을 사용합니다. [Dev Tools 사용법](https://docs.opensearch.org/latest/dashboards/dev-tools/console/)

### 1. 매핑을 정하고 문서 저장

```http
PUT /blog_posts_demo
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "category": { "type": "keyword" },
      "published": { "type": "boolean" }
    }
  }
}

PUT /blog_posts_demo/_doc/1?refresh=wait_for
{
  "title": "OpenSearch 검색 입문",
  "category": "backend",
  "published": true
}

PUT /blog_posts_demo/_doc/2?refresh=wait_for
{
  "title": "OpenSearch 검색 초안",
  "category": "backend",
  "published": false
}

PUT /blog_posts_demo/_doc/3?refresh=wait_for
{
  "title": "화면 디자인 입문",
  "category": "frontend",
  "published": true
}
```

문서 저장 성공과 검색에서 보이는 시점은 다를 수 있습니다. 예제의 `refresh=wait_for`는 변경이 검색 가능해지는 refresh를 기다리도록 합니다. 매번 강제 refresh를 수행하면 색인 성능에 부담이 될 수 있습니다. [Refresh 안내](https://docs.opensearch.org/latest/api-reference/index-apis/refresh/)

### 2. 검색 조건과 필터 결합

```http
GET /blog_posts_demo/_search
{
  "_source": ["title", "category"],
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "OpenSearch" } }
      ],
      "filter": [
        { "term": { "category": "backend" } },
        { "term": { "published": true } }
      ]
    }
  }
}
```

`match`는 제목을 분석해 검색하고, `filter`는 카테고리와 공개 여부를 참·거짓 조건으로 좁힙니다. 필터는 관련도 점수에 기여하지 않습니다. 위 문서만 저장된 상태라면 문서 1이 조회 대상이고, 문서 2는 비공개여서 제외됩니다. [bool 쿼리](https://docs.opensearch.org/latest/query-dsl/compound/bool/)

예제의 JSON 구문은 검사했으며 실제 클러스터 실행은 검증하지 않았습니다. `published` 필터는 동작 설명용입니다. 실제 서비스의 접근 권한은 서버에서 강제해야 하며, 사용자가 임의로 필터를 제거할 수 있는 쿼리를 그대로 전달하면 안 됩니다.

## 원본 DB와 검색 데이터는 어떻게 연결할까?

블로그 본문과 공개 상태는 원본 DB가 관리하고, 검색에 필요한 사본을 OpenSearch에 전달하는 구성을 생각할 수 있습니다.

<figure class="article-diagram">
<figcaption>원본 DB에서 검색용 사본으로 전달</figcaption>
<ol><li>원본 DB에 글 생성·수정·삭제 기록</li><li>아웃박스·CDC 등으로 변경 전달</li><li>글 ID를 기준으로 OpenSearch 문서 갱신</li><li>검색 API가 권한 범위를 적용해 조회</li></ol>
</figure>

여기서 중요한 것은 **변경 이벤트가 늦거나 중복되거나 순서가 바뀔 때의 처리**입니다. DB 저장과 색인 요청을 연속 호출하는 것만으로 두 작업이 하나의 트랜잭션이 되지는 않습니다.

안정적인 문서 ID, 변경 버전, 재시도, 삭제 반영과 전체 재색인 절차를 정해야 합니다. 특히 비공개 전환이나 접근 권한 변경의 지연은 정보 노출로 이어질 수 있으므로, 검색 사본의 권한 최신성과 응답 직전의 검증 정책을 함께 설계합니다.

## 로그 분석과 벡터 검색에도 쓰인다

**로그 분석**에서는 시간 범위·서비스 이름·오류 코드를 기준으로 문서를 찾고 집계합니다. Dashboards로 추이를 볼 수 있지만, 로그 수집·타입 정리·민감 정보 마스킹·보존 기간은 별도로 구성해야 합니다. [데이터 탐색](https://docs.opensearch.org/latest/dashboards/discover/index/)

**벡터 검색**은 텍스트 등을 임베딩으로 표현해 가까운 벡터를 찾습니다. 외부에서 생성한 벡터를 저장하거나 모델 연계를 구성할 수 있습니다. RAG에서는 검색된 원문을 생성 모델에 전달하는 검색 계층으로 활용합니다. [벡터 인덱스 생성](https://docs.opensearch.org/latest/vector-search/creating-vector-index/)

**하이브리드 검색**은 키워드와 의미 검색을 결합합니다. 상품 코드·정확한 오류 문구에는 키워드가, 표현이 달라도 비슷한 의미를 찾을 때는 벡터가 도움이 될 수 있습니다. 점수의 범위가 다르므로 정규화 후 결합하거나 순위를 결합하는 방식 등을 비교합니다. 도입 후에는 실제 질의로 검색 품질·지연·비용을 평가해야 합니다. [하이브리드 검색](https://docs.opensearch.org/3.9/search-plugins/hybrid-search/)

## 운영할 때 알아둘 샤드와 복제본

OpenSearch는 인덱스를 **샤드(Shard)**로 나누고 여러 노드에 배치할 수 있습니다. 기본 샤드인 primary와 그 사본인 replica를 구분합니다. 샤드를 지나치게 많이 만들면 관리 비용과 자원 사용이 늘 수 있으므로 데이터 크기와 부하를 기준으로 설계합니다. [클러스터 기본 구조](https://docs.opensearch.org/latest/getting-started/intro/#cluster-architecture)

복제본은 장애 대응에 도움을 주지만 잘못된 삭제까지 과거 상태로 돌려주는 백업은 아닙니다. 스냅샷과 복원 절차를 별도로 준비하고 복구가 되는지 확인해야 합니다. [스냅샷·복원](https://docs.opensearch.org/3.9/opensearch/snapshots/snapshot-restore/)

처음에는 작은 데이터로 **매핑 → 토큰 확인 → 검색·필터 → 원본 변경 반영**을 익히면 좋습니다. 검색 결과가 기대와 다르다면 노드를 늘리기 전에 어떤 데이터가 색인되었고, 어떤 토큰과 조건으로 조회했는지부터 확인해 보세요.

## 함께 읽기

- [시계열 DB와 검색 중심 저장소 비교]({% post_url 2026-10-15-time-series-search-databases %})
- [Elasticsearch와 RAG의 관계]({% post_url 2025-08-25-elasticsearch-vs-rag %})
- [벡터 DB와 pgvector 비교]({% post_url 2026-10-15-vector-databases-comparison %})
- [멱등성과 재시도]({% post_url 2026-10-20-idempotency-retries %})
