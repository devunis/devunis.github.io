---
title: "데이터베이스 종류와 대표 제품 총정리 ④: 그래프·멀티모델"
date: 2026-10-15 09:03:00 +0900
categories: [Backend, Database]
tags: [Database, GraphDB, Neo4j, Knowledge-Graph, Multi-Model, Database-Series]
---

> 데이터베이스 종류와 대표 제품을 비교하는 7편 시리즈의 4편입니다. 각 제품명은 공식 소개 또는 문서로 연결됩니다.

사람, 상품, 계좌 같은 개별 정보보다 **서로 어떻게 연결되어 있는가**가 중요한 문제가 있습니다. 그래프 DB는 이 연결을 노드와 관계로 표현하고, 관계를 따라 탐색하도록 설계합니다.

이 글에서는 그래프 제품 5개와, ArangoDB를 포함한 멀티모델 제품 3개를 비교합니다. ArangoDB는 두 분류에 걸치므로 서로 다른 제품은 총 7개입니다.

---

## 🕸️ 그래프 DB의 핵심 개념

속성 그래프(Property Graph)는 노드와 관계에 속성을 붙입니다.

<figure class="article-diagram relation-diagram">
<figcaption>구매 관계를 연결한 그래프</figcaption>
<ul><li>사용자 A <span>구매 →</span> 상품 X</li><li>사용자 B <span>구매 →</span> 상품 X</li><li>사용자 B <span>구매 →</span> 상품 Y</li></ul>
</figure>

이 구조에서는 “나와 같은 상품을 구매한 사람이 산 다른 상품”을 관계 탐색으로 표현할 수 있습니다. 관계형 DB에서도 조인으로 구현할 수 있지만, 탐색 단계와 관계 종류가 늘어날수록 그래프 모델을 비교할 가치가 생깁니다.

그래프 DB가 모든 조인보다 빠른 것은 아닙니다. 시작점의 선택도, 탐색 깊이, 관계 수, 인덱스에 따라 결과가 달라집니다. [Neo4j 그래프 개념](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/)

### 속성 그래프와 RDF

- **속성 그래프**: 노드·관계에 속성을 붙이고 경로를 탐색합니다. Cypher, Gremlin 등 제품별 언어를 사용합니다.
- **RDF**: 주어·술어·목적어의 트리플로 정보를 표현합니다. 표준 식별자와 지식 표현을 활용하며 SPARQL로 조회할 수 있습니다.

둘 다 지식 그래프에 사용할 수 있습니다. “지식 그래프 = RDF만 가능” 또는 “그래프 DB = Neo4j”라고 이해하면 범위가 좁아집니다. Neptune은 두 모델의 API를 제공합니다. [Neptune 공식 문서](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html)

---

## 📊 그래프 제품별 특징

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [Neo4j](https://neo4j.com/docs/getting-started/appendix/graphdb-concepts/) | 속성 그래프와 Cypher, 그래프 개발·분석 생태계 | 추천, 권한 관계, 연결 탐색, 지식 그래프 | 탐색 범위·고차수 노드, 배포·에디션별 기능 확인 |
| [Amazon Neptune](https://docs.aws.amazon.com/neptune/latest/userguide/intro.html) | AWS 관리형, 속성 그래프의 Gremlin·openCypher와 RDF의 SPARQL | AWS의 관계 탐색, RDF 지식 데이터 | 선택한 모델·언어의 제약과 DB·Analytics 제품 차이 확인 |
| [ArangoDB](https://arangodb.com/multi-model/) | 문서·그래프·키·값을 함께 다루고 AQL 제공 | 문서 속성과 연결 관계를 함께 질의 | 분산 그래프 배치, AQL과 기능별 운영 특성 학습 |
| [JanusGraph](https://docs.janusgraph.org/) | Gremlin과 Cassandra·HBase 등 외부 저장 백엔드 활용 | 기존 분산 저장소와 대규모 그래프 결합 | 저장·색인 백엔드까지 운영하며 보장은 백엔드·설정에 영향받음 |
| [TigerGraph](https://www.tigergraph.com/tigergraph-db/) | GSQL과 분산·병렬 그래프 처리 구조 | 대규모 다단계 탐색, 그래프 분석 | GSQL 학습과 실제 쿼리의 분산 실행·자원 요구 확인 |

### Neo4j·Neptune·JanusGraph의 선택 포인트

Neo4j는 Cypher와 속성 그래프 생태계, Neptune은 AWS 관리형 운영과 두 그래프 모델, JanusGraph는 외부 분산 저장소와의 조합이 구분점입니다. 같은 그래프 제품이어도 질의 언어와 운영 책임이 다릅니다.

노드 하나에 관계가 과도하게 몰리는 **고차수 노드**는 어느 제품에서든 탐색 비용을 키울 수 있습니다. 조회 결과 수와 최대 탐색 깊이를 제한하고, 시작점을 좁히는 인덱스를 설계해야 합니다.

---

## 🧩 멀티모델 DB: 여러 모델을 제공

멀티모델은 하나의 제품이나 서비스 계열에서 여러 데이터 모델·접근 방식을 제공한다는 뜻입니다. 같은 엔진과 데이터에서 결합하는 방식인지, API별로 계정·기능이 나뉘는지는 제품마다 다릅니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [ArangoDB](https://arangodb.com/multi-model/) | 문서와 그래프를 AQL로 함께 다룸 | 중첩 문서와 경로 탐색을 결합 | 모델을 합쳐도 인덱스·샤딩 설계는 필요 |
| [Azure Cosmos DB](https://learn.microsoft.com/en-us/azure/cosmos-db/overview) | 글로벌 분산 관리형 서비스, API·모델별 접근과 일관성 선택 | Azure 기반 지역 분산 문서·키 기반 업무 | API별 지원 기능·트랜잭션 범위와 RU·파티션 설계 확인 |
| [SurrealDB](https://surrealdb.com/docs/what-is-surrealdb) | SurrealQL로 문서·그래프 관계 등 여러 모델 표현 | 여러 데이터 표현을 한 질의 계층에서 다루는 앱 | 전용 언어, 버전·스토리지 엔진별 기능과 운영 도구 검증 |

Cosmos DB의 여러 API를 하나의 데이터셋에서 자유롭게 섞어 쓸 수 있다고 가정하면 안 됩니다. 실제 사용하는 API와 계정 구성을 기준으로 지원 범위를 확인해야 합니다.

멀티모델은 시스템 수를 줄이는 선택지가 될 수 있지만, 각 모델에 특화된 제품을 항상 대체하지는 않습니다. 데이터의 이동을 줄이는 이점과 기능·운영의 결합 정도를 함께 평가해야 합니다.

---

## 🎯 그래프 DB를 검토할 상황

| 문제 | 그래프로 표현할 내용 | 검토할 질문 |
| --- | --- | --- |
| 추천 | 사용자·상품·구매·관심 관계 | 얼마나 깊게 연결을 탐색하는가? |
| 사기 탐지 | 계좌·기기·주소·송금 연결 | 공통 연결과 의심 경로를 찾는가? |
| 지식 그래프 | 문서·개체·사실 관계 | 식별자·출처·관계 타입을 어떻게 관리하는가? |
| 권한 관리 | 사용자·팀·역할·리소스 관계 | 상속·예외·순환을 어떻게 처리하는가? |
| 공급망 | 부품·공급사·제품 의존 관계 | 변경의 영향을 몇 단계까지 찾는가? |

GraphRAG에서는 문서에서 추출한 개체·관계를 검색에 활용할 수 있습니다. 다만 그래프 DB를 도입했다고 추출된 사실이 정확해지는 것은 아닙니다. 출처, 중복 개체 병합, 관계의 유효 시점도 관리해야 합니다.

---

## 📚 데이터베이스 시리즈

1. [전체 분류 지도]({% post_url 2026-10-15-database-types-overview %})
2. [관계형·분산 SQL]({% post_url 2026-10-15-relational-distributed-sql-databases %})
3. [키·값·문서·와이드 컬럼]({% post_url 2026-10-15-nosql-key-value-document-wide-column %})
4. [그래프·멀티모델]({% post_url 2026-10-15-graph-multimodel-databases %})
5. [시계열·검색]({% post_url 2026-10-15-time-series-search-databases %})
6. [벡터 DB와 pgvector]({% post_url 2026-10-15-vector-databases-comparison %})
7. [분석용 DB·데이터 웨어하우스]({% post_url 2026-10-15-analytical-databases-data-warehouses %})
