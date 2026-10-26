---
title: "데이터베이스 종류와 대표 제품 총정리 ②: 관계형·분산 SQL"
date: 2026-10-15 09:01:00 +0900
categories: [Backend, Database]
tags: [Database, RDBMS, PostgreSQL, MySQL, Distributed-SQL, Database-Series]
---

> 데이터베이스 종류와 대표 제품을 비교하는 7편 시리즈의 2편입니다. 각 제품명은 공식 소개 또는 문서로 연결됩니다.

관계형 DB는 회원·주문·결제처럼 데이터 사이의 관계와 정합성이 중요한 업무에서 검토하는 기본 선택지입니다. 이 글에서는 대표 관계형 제품 8개와 분산 SQL 제품 4개를 비교합니다.

---

## 🎯 관계형 DB는 무엇인가?

데이터를 테이블에 저장하고 기본 키, 외래 키, 제약 조건으로 관계와 규칙을 표현합니다. SQL로 조회·조인·집계하며, 트랜잭션으로 여러 변경을 하나의 작업 단위로 다룰 수 있습니다.

ACID는 원자성·일관성·격리성·지속성을 뜻합니다. 다만 같은 관계형 DB라도 기본 격리 수준과 동시성 제어 방식은 다릅니다. 트랜잭션을 사용한다는 사실만으로 모든 동시성 문제가 해결되지는 않습니다.

---

## 📊 관계형 제품별 특징

표의 사용처는 기능과 구조에서 도출한 선택 예시입니다. 제품명은 공식 소개·문서로 연결됩니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [Oracle Database](https://www.oracle.com/database/) | PL/SQL과 기업용 보안·고가용성 기능, 상용 지원 체계 | 기존 Oracle 업무, 기업의 복구·운영 요구 | 에디션·옵션별 제공 범위와 라이선스 비용 확인 |
| [PostgreSQL](https://www.postgresql.org/about/) | 다양한 데이터 타입·인덱스, JSONB, 확장 기능 | 복잡한 SQL, 관계형 데이터와 JSON·공간 정보 결합 | 실행 계획, VACUUM, 연결 수 등 운영 관리 필요 |
| [MySQL](https://www.mysql.com/about/) | 넓은 웹 생태계, InnoDB 기반 트랜잭션·외래 키 | 웹 서비스의 회원·주문·게시판 | 스토리지 엔진, 버전, SQL 모드에 따른 동작 차이 |
| [MariaDB](https://mariadb.org/about/) | MySQL에서 분기한 독립 프로젝트, 자체 기능·엔진 발전 | MariaDB 운영 경험과 기존 애플리케이션 활용 | 현재 MySQL과 모든 기능이 호환되는 것은 아님 |
| [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server) | T-SQL과 Microsoft 개발·운영 도구 생태계 | 기존 Microsoft 기반 기업 업무 | 에디션별 제한과 운영·라이선스 조건 확인 |
| [SQLite](https://sqlite.org/about.html) | 별도 서버 없이 프로세스 안에서 동작, 파일 기반 | 모바일·데스크톱·로컬 저장, 임베디드 앱 | 동시 쓰기와 네트워크 파일 공유 요구를 검토 |
| [IBM Db2](https://www.ibm.com/products/db2) | 기업용 관계형 DB 계열과 IBM 운영 환경 연계 | 기존 IBM 시스템과 기업 업무 | 플랫폼·제품군별 기능 및 도구 차이 확인 |
| [Amazon Aurora](https://aws.amazon.com/rds/aurora/) | AWS 관리형 MySQL·PostgreSQL 호환 엔진 계열 | AWS에서 관계형 DB 운영 관리 부담 완화 | 원본 엔진과 완전히 동일하지 않으며 버전·기능 호환성 확인 |

### Oracle·PostgreSQL·MySQL을 비교하는 기준

Oracle의 RAC와 Data Guard 같은 기능은 고가용성과 재해 복구를 위한 선택지입니다. 실제 적용 시 구성과 라이선스를 확인해야 합니다. PostgreSQL은 JSONB, PostGIS 같은 확장 생태계를 활용할 수 있습니다. MySQL도 JSON과 복잡한 SQL을 지원하므로 “단순 CRUD만 가능한 DB”로 이해하면 안 됩니다.

세 제품 모두 대규모 서비스에 사용할 수 있습니다. 데이터 규모만으로 제품을 정하기보다는 기존 시스템, 팀의 운영 경험, 필요한 기능, 복구 요구를 함께 봐야 합니다.

### SQLite는 작은 서버형 DB가 아니다

SQLite의 중요한 차이는 데이터 크기보다 **프로세스 안에 포함되는 실행 구조**입니다. 서버 프로세스와 네트워크 연결이 필요 없다는 장점이 있지만, 많은 클라이언트가 동시에 쓰는 서버형 서비스의 요구와는 별도로 평가해야 합니다.

---

## 🌐 분산 SQL은 무엇이 다른가?

분산 SQL은 관계형 모델과 SQL을 제공하면서 데이터를 여러 노드에 나누고 분산 트랜잭션을 처리하는 계열입니다. 관계형과 배타적인 분류가 아니라 **관계형 DB의 분산 구조에 초점을 둔 분류**입니다.

일반적인 DB 복제와도 구분해야 합니다. 읽기 복제본을 추가했다고 쓰기와 트랜잭션 처리까지 자동으로 수평 확장되는 것은 아닙니다.

| 제품 | 특징·강점 | 검토할 사용처 | 주의점 |
| --- | --- | --- | --- |
| [Google Spanner](https://cloud.google.com/spanner) | 관리형 분산 DB, 강한 일관성과 분산 트랜잭션 | 여러 지역에 걸친 데이터와 가용성 요구 | 배치 지역, 키 설계, 지연·비용을 함께 검토 |
| [CockroachDB](https://www.cockroachlabs.com/docs/stable/architecture/overview) | PostgreSQL 와이어 프로토콜과 분산 SQL 구조 | 노드 장애 대응과 지역 분산이 필요한 SQL 업무 | PostgreSQL 전체 기능과 동일하지 않으며 재시도 처리 검토 |
| [TiDB](https://docs.pingcap.com/tidb/stable/overview/) | MySQL 호환 분산 SQL, TiKV·TiFlash를 통한 HTAP | MySQL 생태계에서 확장·실시간 분석 검토 | 호환 범위와 구성 요소별 자원·운영 비용 확인 |
| [YugabyteDB](https://docs.yugabyte.com/stable/explore/) | PostgreSQL 호환 YSQL과 분산 저장 구조 | PostgreSQL 생태계 기반 분산 트랜잭션 | 지원 확장·기능의 차이와 데이터 배치 설계 확인 |

HTAP는 온라인 트랜잭션 처리(OLTP)와 분석 처리(OLAP)를 결합하는 접근입니다. TiDB는 행 기반 TiKV와 열 기반 TiFlash를 제공합니다. 모든 제품이 같은 방식으로 트랜잭션과 분석을 결합하는 것은 아닙니다.

### 분산이면 항상 더 빠를까?

분산 트랜잭션은 노드 간 통신과 합의가 필요합니다. 데이터와 사용자의 위치에 따라 지연이 늘 수 있고, 단일 노드에서 충분한 업무에는 운영 복잡성이 더 커질 수 있습니다. 키가 특정 구간에 몰리는 핫스폿도 해결해야 합니다.

---

## ✅ 선택 기준

- **한 서버 또는 일반적인 관리형 관계형 구성으로 충분하다면** 기존 팀이 잘 운영할 수 있는 제품부터 검토합니다.
- **모바일·로컬 저장이라면** 서버형 DB와 SQLite의 구조 차이를 먼저 봅니다.
- **기존 Oracle·SQL Server·Db2 업무라면** 마이그레이션할 SQL, 저장 프로시저, 운영 도구까지 비교합니다.
- **수평 확장·다중 지역 트랜잭션이 핵심이라면** 분산 SQL 후보를 실제 데이터와 장애 조건으로 검증합니다.

“호환”은 원본 제품과 완전히 같다는 뜻이 아닙니다. SQL 문법, 데이터 타입, 확장, 드라이버, 트랜잭션 격리, 실행 계획을 나눠 확인해야 합니다.

---

## 📚 데이터베이스 시리즈

1. [전체 분류 지도]({% post_url 2026-10-15-database-types-overview %})
2. [관계형·분산 SQL]({% post_url 2026-10-15-relational-distributed-sql-databases %})
3. [키·값·문서·와이드 컬럼]({% post_url 2026-10-15-nosql-key-value-document-wide-column %})
4. [그래프·멀티모델]({% post_url 2026-10-15-graph-multimodel-databases %})
5. [시계열·검색]({% post_url 2026-10-15-time-series-search-databases %})
6. [벡터 DB와 pgvector]({% post_url 2026-10-15-vector-databases-comparison %})
7. [분석용 DB·데이터 웨어하우스]({% post_url 2026-10-15-analytical-databases-data-warehouses %})
