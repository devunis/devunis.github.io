---
title: "데이터베이스 인덱스 최적화: 실제 성능 개선 사례"
date: 2025-12-31 09:00:00 +0900
categories: [Backend, Database]
tags: [Database, Index, Optimization, Performance, SQL]
---

데이터베이스 인덱스는 쿼리 성능을 좌우하는 핵심 요소입니다. 
헬스케어 시스템 개발 경험을 바탕으로 실제 성능 개선 사례를 공유합니다.

---

## 🎯 인덱스 동작 원리

### B-Tree 인덱스

```sql
-- 인덱스 없이
SELECT * FROM users WHERE email = 'user@example.com';
-- Full Table Scan: 1,000,000행 검색

-- 인덱스 있으면
CREATE INDEX idx_users_email ON users(email);
-- B-Tree 탐색: log₂(1,000,000) ≈ 20번 비교
```

**B-Tree 구조**:
```
           [M]
          /   \
      [D-L]   [N-Z]
      /   \   /   \
   [A-C] [E-L] ...
```

---

## 📊 실제 성능 개선 사례

### Case 1: 단일 컬럼 인덱스

**문제**: 환자 조회 쿼리 느림
```sql
-- Before: 2.5초
SELECT * FROM patients WHERE patient_id = '12345';

EXPLAIN ANALYZE;
-- Seq Scan on patients (cost=0.00..18500.00)
-- Planning time: 0.5 ms
-- Execution time: 2500 ms
```

**해결**:
```sql
CREATE INDEX idx_patients_id ON patients(patient_id);

-- After: 15ms (166배 빠름!)
-- Index Scan using idx_patients_id (cost=0.43..8.45)
-- Execution time: 15 ms
```

### Case 2: Composite Index

**문제**: 날짜 + 상태 조회 느림
```sql
-- Before: 3.2초
SELECT * FROM appointments 
WHERE date = '2025-12-31' AND status = 'confirmed';

-- 각각 인덱스 있어도 느림
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**해결**: Composite Index
```sql
CREATE INDEX idx_appointments_date_status 
ON appointments(date, status);

-- After: 25ms (128배 빠름!)
```

**주의**: 컬럼 순서 중요!
```sql
-- ✅ 좋음: date로 먼저 필터링 (높은 선택도)
CREATE INDEX idx_appointments_date_status ON appointments(date, status);

-- ❌ 나쁨: status 먼저 (낮은 선택도)
CREATE INDEX idx_appointments_status_date ON appointments(status, date);
```

---

## 🔍 쿼리 실행 계획 분석 (EXPLAIN)

### PostgreSQL EXPLAIN

```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'user@example.com';
```

**출력 해석**:
```
Seq Scan on users  (cost=0.00..1693.00 rows=1 width=100)
                   ↑시작 비용  ↑총 비용  ↑예상 행  ↑행 크기
  Filter: (email = 'user@example.com')
  Planning time: 0.123 ms
  Execution time: 45.678 ms
              ↑ 실제 실행 시간
```

**인덱스 사용 확인**:
```
Index Scan using idx_users_email on users
  Index Cond: (email = 'user@example.com')
  Execution time: 0.234 ms  ✅ 빠름!
```

---

## 🎨 인덱스 생성 전략

### 1. WHERE 절 컬럼

```sql
-- 자주 검색되는 컬럼
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_author_id ON posts(author_id);
```

### 2. JOIN 컬럼

```sql
-- Foreign Key에 인덱스
CREATE INDEX idx_posts_user_id ON posts(user_id);

SELECT users.*, posts.*
FROM users
JOIN posts ON users.id = posts.user_id;  -- 빠른 조인
```

### 3. ORDER BY 컬럼

```sql
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- 정렬 없이 바로 반환
SELECT * FROM posts ORDER BY created_at DESC LIMIT 10;
```

### 4. Partial Index (부분 인덱스)

```sql
-- 활성 사용자만 인덱싱
CREATE INDEX idx_users_active 
ON users(email) 
WHERE is_active = true;

-- 인덱스 크기 70% 감소!
```

---

## 📈 헬스케어 시스템 개선 사례

### 문제 상황
- 환자 기록 조회: 평균 4초
- 예약 검색: 평균 2.5초
- 사용자 불만 증가

### 최적화 작업

#### 1. 환자 테이블
```sql
-- Before: 인덱스 없음
SELECT * FROM patients 
WHERE hospital_id = 1 
  AND status = 'active' 
  AND created_at > '2025-01-01';
-- 실행 시간: 4.2초

-- After: Composite Index
CREATE INDEX idx_patients_hospital_status_date 
ON patients(hospital_id, status, created_at);
-- 실행 시간: 35ms (120배 개선!)
```

#### 2. 예약 테이블
```sql
-- Before
SELECT * FROM appointments 
WHERE patient_id = 123 
  AND date BETWEEN '2025-01-01' AND '2025-12-31';
-- 실행 시간: 2.5초

-- After
CREATE INDEX idx_appointments_patient_date 
ON appointments(patient_id, date);
-- 실행 시간: 18ms (138배 개선!)
```

#### 3. 검색 기능
```sql
-- Full-text search
CREATE INDEX idx_patients_name_gin 
ON patients 
USING gin(to_tsvector('korean', name));

SELECT * FROM patients 
WHERE to_tsvector('korean', name) @@ to_tsquery('김철수');
-- 실행 시간: 50ms (한글 검색!)
```

---

## ⚖️ 인덱스 오버헤드 관리

### 트레이드오프

```sql
-- 장점
✅ SELECT 성능 향상

-- 단점
❌ INSERT/UPDATE/DELETE 느려짐
❌ 디스크 공간 사용
❌ 메모리 사용 증가
```

### 불필요한 인덱스 찾기

```sql
-- PostgreSQL
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,  -- 인덱스 사용 횟수
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- 사용되지 않는 인덱스
ORDER BY schemaname, tablename;
```

### 중복 인덱스 제거

```sql
-- 중복 예시
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_name ON users(email, name);
                                           ↑ email은 중복

-- idx_users_email 제거 가능
DROP INDEX idx_users_email;
```

---

## 🔧 모니터링 및 유지보수

### 1. 인덱스 사용률 추적

```sql
-- 주간 사용 통계
SELECT 
    indexname,
    idx_scan as scans,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 2. 슬로우 쿼리 로그

```sql
-- PostgreSQL 설정
ALTER DATABASE mydb SET log_min_duration_statement = 1000;
-- 1초 이상 쿼리 로깅

-- 로그 분석
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC;
```

### 3. 인덱스 재구축

```sql
-- 인덱스 비대화 확인
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size,
    idx_scan,
    idx_tup_read / nullif(idx_scan, 0) as avg_tuples_per_scan
FROM pg_stat_user_indexes
WHERE idx_scan > 0;

-- 재구축
REINDEX INDEX idx_patients_hospital_status_date;
-- 또는 테이블 전체
REINDEX TABLE patients;
```

---

## 📊 최종 성능 결과

### 헬스케어 시스템 (2년 7개월 운영)

| 쿼리 유형 | Before | After | 개선율 |
|---------|--------|-------|--------|
| 환자 조회 | 4.2s | 35ms | **120배** |
| 예약 검색 | 2.5s | 18ms | **138배** |
| 통계 집계 | 8.5s | 120ms | **70배** |
| 한글 검색 | 6.2s | 50ms | **124배** |

**시스템 영향**:
- 사용자 만족도: 65% → 92% ⬆️
- 페이지 로드 시간: 평균 3.5s → 0.5s
- 서버 CPU 사용률: 75% → 35% ⬇️

---

## 🎯 정리

### 인덱스 생성 체크리스트
- [ ] WHERE 절 자주 사용하는 컬럼
- [ ] JOIN 조건 컬럼
- [ ] ORDER BY 컬럼
- [ ] Composite Index 컬럼 순서 확인
- [ ] Partial Index 고려
- [ ] 실행 계획 확인 (EXPLAIN)

### 주의사항
- ⚠️ 인덱스 너무 많으면 역효과
- ⚠️ UPDATE/INSERT 많은 테이블 주의
- ⚠️ 정기적인 모니터링 필요

데이터베이스 인덱스는 적절히 사용하면 시스템 성능을 극적으로 향상시킬 수 있습니다! 📈

---

📚 **참고 자료**:
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Use The Index, Luke](https://use-the-index-luke.com/)
