---
title: "데이터베이스 인덱스 최적화: 쿼리·실행 계획·비용 검토"
date: 2025-12-31 09:00:00 +0900
categories: [Backend, Database]
tags: [Database, Index, Optimization, Performance, SQL]
last_modified_at: 2026-10-15 14:50:00 +0900
---

인덱스는 특정 조건의 조회·정렬·조인을 돕지만 저장 공간과 쓰기 비용을 늘립니다. 이 글은 최적화 방법을 설명하며, 측정 근거가 없는 실제 운영 성과와 시간·개선율은 제시하지 않습니다.

## 🎯 접근 패턴부터 확인

자주 실행하는 쿼리, 조건의 선택도, 반환 행 수, 정렬·조인과 데이터 갱신 빈도를 정리합니다. 인덱스가 존재해도 옵티마이저가 순차 스캔을 선택할 수 있으며 작은 테이블이나 많은 행을 읽는 쿼리에서 합리적일 수 있습니다.

## 💻 설명용 SQL

아래는 PostgreSQL 기준입니다. 실행할 DB에 동일한 테이블·인덱스가 없는 실습 환경에서 확인합니다.

```sql
CREATE TABLE appointments (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    appointment_date DATE NOT NULL
);

CREATE INDEX idx_appointments_patient_date
ON appointments (patient_id, appointment_date);

EXPLAIN
SELECT id, appointment_date
FROM appointments
WHERE patient_id = 42
ORDER BY appointment_date;
```

이는 쿼리·인덱스 관계를 설명하는 예제이며 출력 계획이나 응답 시간을 미리 확정하지 않습니다. EXPLAIN ANALYZE는 실제 실행하므로 쓰기 쿼리와 부하에 주의해야 합니다.

## 📊 복합·부분 인덱스

| 선택지 | 판단할 내용 |
| --- | --- |
| 복합 인덱스 | 동등·범위 조건, 컬럼 순서, 정렬과 쿼리 패턴 |
| 부분 인덱스 | 일부 행을 대상으로 하는 조건과 실제 쿼리의 일치 |
| 포함 컬럼 | 읽기 이점과 인덱스 크기·갱신 비용 |
| 전문·다른 인덱스 종류 | 검색 연산과 데이터 타입에 맞는 지원 |

“첫 컬럼이 없는 조건에는 절대로 사용할 수 없다” 같은 단정 대신 DB 버전과 실제 실행 계획을 봅니다. 다른 DB의 부분 인덱스 문법·기능을 동일하게 가정하지 않습니다.

## ⚡ 개선을 검증하기

동일한 데이터·통계·쿼리·파라미터·캐시 조건에서 계획과 지연을 비교합니다. 읽기 개선과 함께 INSERT·UPDATE·DELETE의 비용, 잠금, 인덱스 생성 시간·디스크를 확인합니다.

작은 더미 데이터에서 인덱스 사용 여부만 확인한 결과를 운영의 수십·수백 배 개선으로 표현하지 않습니다. 근거 있는 로그가 생기면 측정 조건과 함께 기록할 수 있습니다.

## ✅ 유지보수

미사용 통계의 관측 기간과 재시작 여부를 확인하고, 제약 조건이 사용하는 인덱스를 검토 없이 제거하지 않습니다. 통계 갱신·테이블 관리와 실제 장애 복구 절차도 함께 확인합니다.

📚 [PostgreSQL 인덱스](https://www.postgresql.org/docs/current/indexes.html) · [EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
