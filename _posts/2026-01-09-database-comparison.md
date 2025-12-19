---
title: "PostgreSQL vs MySQL vs MariaDB: 프로젝트별 선택 가이드"
date: 2026-01-09 09:00:00 +0900
categories: [Backend, Database]
tags: [PostgreSQL, MySQL, MariaDB, Database, Comparison]
---

헬스케어 시스템에서 MariaDB를 2년 7개월간 사용한 경험을 바탕으로 DB 선택 가이드를 제공합니다.

---

## 📊 핵심 비교

| 특징 | PostgreSQL | MySQL | MariaDB |
|------|------------|-------|---------|
| **성능** | 복잡한 쿼리에 강함 | 단순 읽기에 빠름 | MySQL 호환 |
| **JSON** | 강력 (jsonb) | 제한적 | 제한적 |
| **Full-text** | 우수 | 보통 | 보통 |
| **라이선스** | PostgreSQL | GPL (v8부터 제한) | GPL |

---

## 🏥 헬스케어 시스템 (MariaDB)

### 선택 이유
- ✅ MySQL 호환 (기존 코드 재사용)
- ✅ 완전한 오픈소스
- ✅ 안정성

### 실전 경험
```sql
-- 복잡한 환자 통계 쿼리도 빠름
SELECT 
    hospital_id,
    COUNT(*) as patient_count,
    AVG(age) as avg_age
FROM patients
WHERE status = 'active'
GROUP BY hospital_id
HAVING patient_count > 100;

-- 실행 시간: 45ms (50,000건)
```

---

## 🎯 프로젝트별 선택

### PostgreSQL 추천
- 📌 복잡한 쿼리
- 📌 JSON 데이터
- 📌 GIS (PostGIS)
- 📌 Full-text search

### MySQL/MariaDB 추천
- 📌 단순 CRUD
- 📌 읽기 위주
- 📌 레거시 호환

---

📚 **참고 자료**:
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [MariaDB 공식 문서](https://mariadb.com/kb/en/)
