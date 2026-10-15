---
title: "데이터베이스 종류와 대표 제품 총정리 ①: 전체 분류 지도"
date: 2026-10-15 09:00:00 +0900
categories: [Backend, Database]
tags: [Database, SQL, NoSQL, Database-Series]
---

> 데이터베이스 종류와 대표 제품을 비교하는 7편 시리즈의 1편입니다. 각 제품명은 공식 소개 또는 문서로 연결됩니다.

데이터베이스를 공부하다 보면 Oracle, PostgreSQL, MongoDB, Redis, Neo4j, Qdrant 같은 이름이 한꺼번에 등장합니다. 그런데 이 제품들은 같은 문제를 해결하기 위해 만들어진 것이 아닙니다.

회원과 주문을 정확하게 저장하는 일, 문장과 의미가 비슷한 문서를 찾는 일, 사람 사이의 연결을 따라가는 일은 필요한 데이터 모델과 조회 방식이 다릅니다. 이 시리즈에서는 **DB 종류부터 살펴보고, 각 종류의 대표 제품을 특징·사용처·주의점으로 비교**합니다.

시장에 존재하는 모든 DB를 나열하는 목록이나 성능 순위가 아니라, 주요 제품 51개를 이해하기 위한 안내서입니다. 제품명에 연결된 공식 문서에서 상세 기능을 확인할 수 있습니다. 문서 확인 기준일은 **2026년 10월 15일**입니다.

---

## 🗺️ 데이터베이스 종류 한눈에 보기

| 종류 | 중심 개념 | 대표 제품 |
| --- | --- | --- |
| 관계형 | 테이블, 관계, 제약 조건, SQL | Oracle Database, PostgreSQL, MySQL, MariaDB, SQL Server, SQLite, Db2, Aurora |
| 분산 SQL | 관계형 모델과 분산 트랜잭션·수평 확장 | Spanner, CockroachDB, TiDB, YugabyteDB |
| 키·값형 | 키를 알고 빠르게 값을 접근 | Redis, Valkey, DynamoDB, Aerospike |
| 문서형 | JSON과 유사한 중첩 문서 | MongoDB, Couchbase, CouchDB, DocumentDB, Firestore |
| 와이드 컬럼형 | 행 키·파티션 중심의 분산 데이터 모델 | Cassandra, ScyllaDB, HBase, Bigtable |
| 그래프형 | 노드와 관계를 따라 탐색 | Neo4j, Neptune, ArangoDB, JanusGraph, TigerGraph |
| 멀티모델 | 여러 데이터 모델과 접근 방식을 제공 | ArangoDB, Azure Cosmos DB, SurrealDB |
| 시계열형 | 시간 범위 조회, 집계, 보존 정책 | InfluxDB, TimescaleDB, QuestDB, VictoriaMetrics |
| 검색 중심 | 역색인, 텍스트 분석, 관련도 검색 | Elasticsearch, OpenSearch, Solr |
| 벡터형 | 임베딩 벡터의 유사도 검색 | Qdrant, Milvus, Weaviate, Pinecone, Chroma |
| 분석용·데이터 웨어하우스 | 대량 스캔, 집계, 분석 SQL | ClickHouse, DuckDB, Snowflake, BigQuery, Redshift, Druid, Pinot |

이 분류는 서로 배타적이지 않습니다. 앞부분은 데이터 모델, 분산 SQL은 시스템 구조, 뒷부분은 조회 목적을 기준으로 구분했습니다. AWS도 데이터베이스 선택 가이드에서 관계형·키·값·문서·그래프·시계열·벡터 등을 함께 소개합니다. [AWS 공식 선택 가이드](https://docs.aws.amazon.com/decision-guides/latest/decision-guides/databases-on-aws-how-to-choose.html)

---

## 🎯 헷갈리기 쉬운 분류 기준

### 1. 관계형과 NoSQL

관계형 DB는 테이블과 관계를 중심으로 데이터를 다룹니다. 키·값형, 문서형, 와이드 컬럼형, 그래프형은 흔히 NoSQL 범주로 묶습니다.

다만 **NoSQL이라고 트랜잭션이 없거나, SQL을 전혀 사용할 수 없는 것은 아닙니다.** 제품별로 질의 언어, 트랜잭션 범위, 일관성 보장이 다릅니다. 반대로 관계형 DB도 JSON, 공간 정보, 벡터 같은 데이터를 다룰 수 있습니다. [AWS NoSQL 분류](https://docs.aws.amazon.com/whitepapers/latest/choosing-an-aws-nosql-database/types-of-nosql-databases.html)

### 2. 인메모리는 데이터 모델이 아니다

인메모리는 데이터를 메모리 중심으로 처리하는 방식입니다. Redis를 키·값형과 인메모리 저장소로 함께 설명할 수 있는 이유입니다. 영속화 설정, 복제, 장애 시 데이터 손실 가능성은 별도로 확인해야 합니다.

### 3. 서버리스와 관리형은 운영 방식이다

관리형은 제공자가 인프라 관리 작업의 일부를 맡는 방식이고, 서버리스는 자원 할당과 확장의 상당 부분을 서비스가 추상화하는 방식입니다. 데이터 모델이나 SQL 지원 여부를 뜻하지 않습니다.

Amazon RDS는 여러 DB 엔진을 운영하는 서비스입니다. Aurora는 그 안에서 선택할 수 있는 MySQL·PostgreSQL 호환 관계형 엔진 계열입니다. 제품, 엔진, 운영 서비스의 이름을 구분하면 비교가 쉬워집니다. [Aurora 공식 소개](https://aws.amazon.com/rds/aurora/)

### 4. 와이드 컬럼과 컬럼 저장은 다르다

Cassandra의 와이드 컬럼 모델은 행 키·파티션·클러스터링 컬럼 중심으로 접근 패턴을 설계하는 모델입니다. ClickHouse 같은 분석용 DB의 컬럼 지향 저장은 같은 열의 값을 모아 읽고 압축하는 저장 방식입니다. 이름에 컬럼이 들어가지만 같은 분류 기준이 아닙니다.

### 5. 멀티모델은 여러 기능을 제공한다는 뜻이다

ArangoDB는 문서와 그래프 등을 함께 다룹니다. PostgreSQL도 확장을 통해 공간 정보나 벡터 검색을 제공할 수 있습니다. 기능을 지원한다는 사실만으로 전용 제품과 운영 특성이나 성능이 같다고 볼 수는 없습니다.

---

## 🛒 하나의 서비스에서 여러 DB를 사용하는 예

쇼핑 서비스를 예로 들면 다음처럼 역할을 나눌 수 있습니다. 아래는 가능한 구성 예시이며, 처음부터 모두 도입해야 한다는 뜻은 아닙니다.

| 서비스 요구 | 후보 | 판단할 기준 |
| --- | --- | --- |
| 주문·결제 기록 | PostgreSQL, MySQL, Oracle 등 | 트랜잭션, 제약 조건, 복구 |
| 로그인 세션·캐시 | Redis, Valkey | 만료 정책, 유실 허용 범위 |
| 구조가 다양한 상품 문서 | MongoDB 또는 관계형 DB의 JSON 기능 | 필드 변화, 조회 방식 |
| 상품명·본문 검색 | Elasticsearch, OpenSearch, Solr | 언어 분석, 검색 관련도 |
| 연결 관계 탐색 | Neo4j, Neptune 등 | 탐색 깊이, 관계 수 |
| 상품 설명의 의미 검색 | Qdrant 등 또는 pgvector | 검색 품질, 필터, 규모 |
| 서버 지표 | VictoriaMetrics, InfluxDB 등 | 수집량, 보존 기간 |
| 매출·행동 분석 | ClickHouse, BigQuery 등 | 집계 지연, 스캔 비용 |

DB가 늘면 데이터 동기화, 권한 관리, 백업, 장애 대응도 늘어납니다. 주문 원본은 관계형 DB에 두고 검색용 사본만 검색 엔진에 전달하는 식으로 **원본 데이터의 책임과 사본의 갱신 지연**을 명확히 해야 합니다.

---

## ✅ 제품을 비교할 때 확인할 질문

1. **무엇을 조회하는가?** 단건 키 조회, 조인, 경로 탐색, 집계, 유사도 검색 중 무엇이 핵심인가?
2. **어떤 정확성이 필요한가?** 중복 결제 방지처럼 여러 데이터의 원자적 변경이 필요한가?
3. **어떻게 늘어나는가?** 데이터 크기, 쓰기량, 동시 요청, 지역 수 중 무엇이 병목인가?
4. **어떻게 복구하는가?** 백업이 있다는 사실과 실제 복구가 가능하다는 사실은 다르다.
5. **누가 운영하는가?** 팀의 경험, 관리형 지원, 모니터링·보안 체계를 확인한다.
6. **비용은 무엇으로 결정되는가?** 라이선스 외에도 메모리, 복제, 요청, 스캔, 네트워크 비용을 본다.

제품별 성능은 데이터 모델, 인덱스, 쿼리, 하드웨어, 일관성 설정에 따라 달라집니다. “특정 제품이 항상 빠르다”는 순위보다 실제 접근 패턴으로 검증하는 것이 중요합니다.

---

## 📚 데이터베이스 시리즈

1. [전체 분류 지도]({% post_url 2026-10-15-database-types-overview %})
2. [관계형·분산 SQL]({% post_url 2026-10-15-relational-distributed-sql-databases %})
3. [키·값·문서·와이드 컬럼]({% post_url 2026-10-15-nosql-key-value-document-wide-column %})
4. [그래프·멀티모델]({% post_url 2026-10-15-graph-multimodel-databases %})
5. [시계열·검색]({% post_url 2026-10-15-time-series-search-databases %})
6. [벡터 DB와 pgvector]({% post_url 2026-10-15-vector-databases-comparison %})
7. [분석용 DB·데이터 웨어하우스]({% post_url 2026-10-15-analytical-databases-data-warehouses %})
