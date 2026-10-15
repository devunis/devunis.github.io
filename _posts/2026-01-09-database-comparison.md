---
title: "PostgreSQL vs MySQL vs MariaDB: 기능과 선택 기준"
date: 2026-01-09 09:00:00 +0900
categories: [Backend, Database]
tags: [PostgreSQL, MySQL, MariaDB, Database, Comparison]
last_modified_at: 2026-10-15 14:50:00 +0900
---

세 제품 모두 관계형 DB이며 SQL·트랜잭션·인덱스·조인 등을 제공합니다. 고정된 성능 순위보다 실제 기능·버전·운영 요구를 비교해야 합니다.

## 📊 비교 기준

| 항목 | PostgreSQL | MySQL | MariaDB |
| --- | --- | --- | --- |
| 특징 | 다양한 타입·인덱스·확장 | 넓은 웹 생태계, InnoDB 등 | MySQL에서 분기해 독립 발전 |
| JSON | json·jsonb와 관련 연산 | JSON 타입과 관련 기능 | JSON 표현·관련 기능, MySQL과 차이 확인 |
| 전문 검색 | 기본 기능과 확장 검토 | 엔진·버전별 기능 검토 | 엔진·버전별 기능 검토 |
| 라이선스 | PostgreSQL License | Community·상용 제품의 조건 확인 | 서버·제품·구성 요소 조건 확인 |

MySQL 8부터 GPL이 제한된다는 과거 설명은 제거했습니다. 제품·배포·구성 요소별 실제 조건을 확인해야 합니다. MySQL과 MariaDB도 모든 버전에서 완전한 교체 관계는 아닙니다.

## 💻 집계 SQL 예제

아래는 가상의 테이블을 대상으로 한 쿼리이며 운영 성능 결과가 아닙니다. 집계 별칭을 HAVING에서 사용하는 DB별 차이를 피하려고 집계식을 사용했습니다.

```sql
SELECT hospital_id, COUNT(*) AS patient_count, AVG(age) AS avg_age
FROM patients
WHERE status = 'active'
GROUP BY hospital_id
HAVING COUNT(*) > 100;
```

## ✅ 선택할 때

필요한 데이터 타입·확장·복제·복구를 확인하고, 팀의 운영 경험과 관리형 지원을 봅니다. 실제 쿼리·데이터·동시성에서 실행 계획과 비용을 측정해야 합니다. MySQL·MariaDB를 단순 CRUD만 가능한 DB로 제한하지 않습니다.

📚 [PostgreSQL](https://www.postgresql.org/about/) · [MySQL](https://www.mysql.com/about/) · [MariaDB](https://mariadb.org/about/) · [관계형 제품 비교]({% post_url 2026-10-15-relational-distributed-sql-databases %})
