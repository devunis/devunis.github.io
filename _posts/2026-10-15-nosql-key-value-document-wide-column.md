---
title: "데이터베이스 종류와 대표 제품 총정리 ③: 키·값·문서·와이드 컬럼"
date: 2026-10-15 09:02:00 +0900
categories: [Backend, Database]
tags: [Database, NoSQL, Redis, MongoDB, Cassandra, Database-Series]
---

> 데이터베이스 종류와 대표 제품을 비교하는 7편 시리즈의 3편입니다. 각 제품명은 공식 소개 또는 문서로 연결됩니다.

NoSQL을 하나의 제품군처럼 이해하면 Redis, MongoDB, Cassandra의 차이가 흐려집니다. 이 글에서는 **키로 접근하는가, 문서로 묶는가, 파티션 중심으로 분산하는가**를 기준으로 대표 제품 13개를 비교합니다.

---

## 🔑 키·값형: 키를 알고 접근하는 데이터

`session:123 → 세션 정보`처럼 키로 값을 찾습니다. 값은 문자열에 한정되지 않습니다. Redis는 해시, 리스트, 집합 등 여러 자료구조를 제공하고, DynamoDB는 문서 모델도 지원합니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [Redis](https://redis.io/docs/latest/develop/data-types/) | 메모리 중심 자료구조 서버, 만료·다양한 자료형 지원 | 캐시, 세션, 카운터, 순위 | 영속화·복제·메모리 정책에 따른 유실과 용량 관리 |
| [Valkey](https://valkey.io/) | Redis 7.2 계열에서 분기한 오픈소스 키·값 저장소 | Redis 계열 명령·클라이언트 생태계 활용 | 이후 양쪽 기능이 달라질 수 있어 버전·모듈 호환성 검증 |
| [Amazon DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html) | AWS 관리형 키·값·문서 DB | 키 기반 대규모 요청, 예측 가능한 접근 패턴 | 파티션 키·보조 인덱스와 요청 비용 설계 |
| [Aerospike](https://aerospike.com/docs/database/learn/architecture/hybrid-storage/) | 메모리와 SSD 등을 활용하는 분산 저장 구조 | 낮은 지연이 중요한 대량 키 기반 접근 | 인덱스·스토리지 용량과 에디션별 기능 확인 |

### Redis와 Valkey는 어떻게 비교할까?

공통된 출발점이 있어도 최신 기능까지 동일하다고 볼 수는 없습니다. 사용하는 명령, 클라이언트, 모듈, 관리형 서비스 지원을 실제 버전으로 확인해야 합니다. 라이선스도 제품·버전별 공식 조건을 확인해야 하며, 이름만으로 단정하지 않습니다.

### DynamoDB의 핵심은 키 설계

관계형 DB처럼 자유롭게 조인할 것을 기대하기보다 필요한 조회를 먼저 나열하고 파티션 키·정렬 키·보조 인덱스를 설계합니다. 트랜잭션을 지원하지만 범위와 제한이 있으므로 기능 제공 여부와 실제 요구 충족 여부를 구분합니다.

캐시로 쓸 때는 원본 DB와 불일치가 생기는 시점, 만료 정책, 캐시 장애 시 처리도 설계해야 합니다. 키·값형 제품이라고 모두 일시적인 캐시인 것은 아닙니다.

---

## 📄 문서형: 관련 데이터를 문서로 묶기

상품마다 다른 속성이나 중첩 구조를 문서 단위로 저장합니다. MongoDB는 BSON을 사용합니다. 유연한 구조는 장점이지만 필드 이름·타입·인덱스에 대한 규칙은 여전히 필요합니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [MongoDB](https://www.mongodb.com/docs/manual/introduction/) | BSON 문서, 집계 파이프라인, 인덱스·복제·샤딩 | 상품 카탈로그, 중첩 구조 데이터 | 문서 경계와 참조·중복 저장, 트랜잭션 범위 설계 |
| [Couchbase](https://docs.couchbase.com/server/current/introduction/intro.html) | JSON 문서와 키·값 접근, SQL++ 질의, 모바일 제품 연계 | 문서 조회와 키 기반 접근, 모바일 동기화 요구 | 인덱스·검색·데이터 서비스 구성과 일관성 옵션 확인 |
| [Apache CouchDB](https://docs.couchdb.org/en/stable/intro/overview.html) | HTTP API와 JSON 문서, 복제 중심 설계 | 오프라인 환경을 포함한 문서 동기화 | 복제 충돌 해결과 문서 단위 트랜잭션 특성 이해 |
| [Amazon DocumentDB](https://docs.aws.amazon.com/documentdb/latest/devguide/what-is.html) | MongoDB 호환 API를 제공하는 AWS 관리형 문서 DB | AWS에서 문서 DB 운영 관리 부담 완화 | MongoDB 서버 자체가 아니므로 연산자·인덱스·동작 차이 검증 |
| [Cloud Firestore](https://firebase.google.com/docs/firestore) | 문서·컬렉션 모델, 실시간 리스너와 클라이언트 SDK | 웹·모바일 실시간 데이터 동기화 | 쿼리·인덱스 제약, 읽기·쓰기 과금, 보안 규칙 설계 |

### MongoDB·Couchbase·CouchDB는 이름보다 동작을 비교

MongoDB는 문서 모델과 집계 기능, Couchbase는 문서와 키·값 접근 및 SQL++·모바일 연계, CouchDB는 HTTP와 복제 중심 설계가 구분점입니다. 오프라인 사용이 중요하다면 단순 조회 성능 외에도 충돌 처리와 동기화 구조를 봐야 합니다.

문서형 DB가 조인을 무조건 금지하는 것은 아닙니다. 제품마다 조인·참조 조회·트랜잭션 지원이 다르며, 관련 데이터를 한 문서에 넣었을 때의 크기와 수정 비용까지 고려해야 합니다.

---

## 🧱 와이드 컬럼형: 파티션과 행 키 중심의 분산 접근

행 키나 파티션 키를 기준으로 데이터를 배치하고, 필요한 조회에 맞춰 컬럼·정렬 구조를 설계하는 계열입니다. 제품 간 모델이 완전히 같지는 않습니다. 일반적인 관계형 조인을 기대하기보다는 접근 패턴을 먼저 정하는 것이 중요합니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [Apache Cassandra](https://cassandra.apache.org/doc/latest/cassandra/architecture/overview.html) | 분산 구조와 CQL, 쿼리 중심 파티션·클러스터링 설계 | 대량 쓰기, 여러 노드·지역의 분산 데이터 | 파티션 크기, 일관성 수준, 복구·컴팩션 관리 |
| [ScyllaDB](https://www.scylladb.com/product/) | Cassandra 계열 CQL 생태계와 샤드 중심 처리 구조 | Cassandra 계열 업무의 지연·처리량 요구 검토 | 실제 CQL·드라이버 호환성과 자원·운영 차이 확인 |
| [Apache HBase](https://hbase.apache.org/book.html) | Hadoop 생태계의 분산 컬럼 패밀리 저장소 | 큰 테이블의 행 키 조회·범위 접근 | 행 키 핫스폿과 Hadoop 관련 운영 복잡성 |
| [Google Bigtable](https://cloud.google.com/bigtable/docs/overview) | Google Cloud 관리형 와이드 컬럼 DB | 대규모 행 키 접근, 이벤트·시계열 데이터 | 행 키 설계, 핫스폿, 클러스터·복제 비용 |

CQL은 SQL과 비슷하게 보이지만 Cassandra가 일반적인 관계형 DB라는 뜻은 아닙니다. 지원 쿼리와 데이터 모델을 별도로 이해해야 합니다.

**와이드 컬럼형과 분석용 컬럼 저장 DB는 다릅니다.** Cassandra·HBase는 파티션과 행 키 기반 접근에 초점을 두고, ClickHouse 같은 분석용 제품은 열 단위 스캔·압축과 집계에 초점을 둡니다.

---

## ✅ 세 종류를 고르는 기준

| 핵심 요구 | 먼저 비교할 계열 | 먼저 설계할 것 |
| --- | --- | --- |
| 알고 있는 키로 값을 조회·갱신 | 키·값형 | 키, 만료, 일관성, 용량 |
| 관련 데이터를 중첩 문서로 관리 | 문서형 | 문서 경계, 참조, 인덱스 |
| 정해진 접근 패턴으로 대규모 분산 처리 | 와이드 컬럼형 | 파티션·행 키, 데이터 분포 |

관계형 DB로 처리 가능한 요구도 많습니다. NoSQL 도입은 “데이터가 많다”는 이유 하나보다 접근 패턴과 운영 요구로 판단해야 합니다.

---

## 📚 데이터베이스 시리즈

1. [전체 분류 지도]({% post_url 2026-10-15-database-types-overview %})
2. [관계형·분산 SQL]({% post_url 2026-10-15-relational-distributed-sql-databases %})
3. [키·값·문서·와이드 컬럼]({% post_url 2026-10-15-nosql-key-value-document-wide-column %})
4. [그래프·멀티모델]({% post_url 2026-10-15-graph-multimodel-databases %})
5. [시계열·검색]({% post_url 2026-10-15-time-series-search-databases %})
6. [벡터 DB와 pgvector]({% post_url 2026-10-15-vector-databases-comparison %})
7. [분석용 DB·데이터 웨어하우스]({% post_url 2026-10-15-analytical-databases-data-warehouses %})
