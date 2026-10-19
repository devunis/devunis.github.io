---
title: "DB 마이그레이션 도구 비교: Alembic, Prisma, Flyway, Liquibase"
date: 2026-10-15 12:00:00 +0900
categories: [Backend, Database]
tags: [Database-Migration, Alembic, Prisma, Flyway, Liquibase, Spring-Boot]
---

회원 테이블에 컬럼 하나를 추가했다고 생각해 봅시다. 내 개발 DB는 바뀌었지만 동료의 DB, 테스트 환경, 운영 DB도 같은 상태일까요? 누가 어떤 변경을 적용했는지, 새 환경에서 같은 구조를 만들 수 있는지도 확인해야 합니다.

**DB 마이그레이션 도구는 데이터베이스 변경을 파일과 이력으로 관리하고, 필요한 변경을 적용하도록 돕습니다.** 이 글에서는 Python의 Alembic, TypeScript·JavaScript의 Prisma, Java·Spring에서 자주 함께 검토하는 Flyway·Liquibase를 비교합니다.

공식 문서 확인 기준일은 2026년 10월 15일입니다. 특히 Prisma는 버전별 체계 차이가 커서 **본문의 Prisma 예제는 8계열 문서 기준**으로 설명합니다.

---

## 🎯 여기서 말하는 마이그레이션은?

이 글의 중심은 테이블·컬럼·인덱스·제약 조건을 변경하고 그 이력을 관리하는 **스키마 마이그레이션**입니다. 필요하면 관련 데이터 변경도 포함할 수 있습니다.

| 구분 | 예시 | 주요 관심사 |
| --- | --- | --- |
| 스키마 마이그레이션 | nickname 컬럼 추가 | 변경 순서, 이력, 호환성 |
| 데이터 마이그레이션 | 기존 값 변환·새 컬럼 채우기 | 정확성, 처리량, 재실행 |
| DB 이전 | MySQL 데이터를 PostgreSQL로 이동 | 타입·SQL 변환, 데이터 복제, 전환 |

세 작업은 함께 발생할 수 있지만, Alembic 등을 설치했다고 다른 DB 제품으로의 이전이나 대용량 데이터 이동이 자동으로 해결되지는 않습니다.

### ORM과도 역할이 다르다

ORM은 애플리케이션 객체와 데이터베이스의 매핑·접근을 돕습니다. 마이그레이션은 변경을 어떤 순서로 적용하고 추적할지 다룹니다. 모델을 수정하는 것과 운영 DB를 변경하는 것은 별개의 단계입니다.

Hibernate의 스키마 자동 갱신도 버전별 변경 파일을 리뷰·관리하는 절차와 구분해야 합니다. Spring Boot에서는 초기화·마이그레이션 방식이 중복되지 않도록 구성하고, Flyway나 Liquibase 같은 도구를 사용할 수 있습니다. [Spring Boot 공식 안내](https://docs.spring.io/spring-boot/how-to/data-initialization.html)

---

## 📊 네 도구 비교

| 도구 | 주로 결합하는 환경 | 변경 표현 | 선택할 때 볼 점 |
| --- | --- | --- | --- |
| [Alembic](https://alembic.sqlalchemy.org/en/latest/) | Python·SQLAlchemy | Python revision과 SQLAlchemy 연산 | 모델 메타데이터, 자동 생성 범위, revision 분기 |
| [Prisma](https://www.prisma.io/docs/orm/migrations/how-migrations-work) | TypeScript·JavaScript·Prisma | 8계열의 contract·migration.ts·생성 산출물 | 설치 버전, 생성·적용 단계, 기존 이력 이전 |
| [Flyway](https://documentation.red-gate.com/flyway) | Java·Spring 및 CLI·CI/CD | 버전이 붙은 SQL 파일 등이 대표적 | SQL 관리, 버전 충돌, DB·기능 지원 범위 |
| [Liquibase](https://docs.liquibase.com/) | Java·Spring 및 CLI·CI/CD | SQL·XML·YAML·JSON changelog와 changeset | 변경 단위·조건, 실행 순서, rollback 설계 |

Flyway와 Liquibase를 Java에서 많이 접한다고 Java 애플리케이션에만 쓸 수 있는 것은 아닙니다. 배포 파이프라인에서 별도로 실행할 수도 있습니다.

---

## 🐍 Alembic: SQLAlchemy와 함께 관리하는 revision

Alembic은 SQLAlchemy를 사용하는 Python 환경의 마이그레이션 도구입니다. revision 파일의 `upgrade()`에 적용할 변경을, `downgrade()`에 되돌릴 변경을 정의할 수 있습니다.

`--autogenerate`는 현재 DB와 모델 메타데이터를 비교해 변경 **초안**을 만듭니다. 컬럼 이름 변경을 삭제·추가로 판단하는 경우처럼 의도를 추론하지 못하는 변경도 있으므로 결과를 검토해야 합니다. [Alembic 자동 생성 문서](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)

```bash
alembic revision --autogenerate -m "add nickname"
# 생성된 파일을 검토한 뒤 적용
alembic upgrade head
```

모델 메타데이터와 DB 연결을 `env.py` 등에 올바르게 설정해야 합니다. 여러 브랜치가 revision을 추가하면 head가 여러 개 생길 수 있으므로 변경의 의존 관계도 관리해야 합니다.

---

## 🟦 Prisma: 먼저 버전부터 확인

Prisma ORM 7계열에서 익숙한 `schema.prisma`, `migration.sql`, `migrate dev`, `migrate deploy`를 현재 문서의 8계열 예제와 섞으면 안 됩니다.

확인 시점의 8계열 문서는 `contract.prisma`에서 contract를 생성하고, 마이그레이션을 계획한 뒤 적용하는 방식입니다. `migration.ts`는 편집하는 소스이고 `ops.json`·`migration.json` 등은 실행·검증에 사용하는 산출물입니다. [Prisma 7에서의 변경 안내](https://www.prisma.io/docs/orm/coming-from-prisma-orm-7)

| 단계 | 8계열의 대표 명령 | 역할 |
| --- | --- | --- |
| contract 생성 | `prisma contract emit` | 최신 선언을 산출물로 반영 |
| 변경 계획 | `prisma migration plan` | 변경 파일 생성, DB 적용과 분리 |
| 파일 검사 | `prisma migration check` | 변경 파일의 무결성 등 검사 |
| DB 적용 | `prisma db migrate` | 대상 DB에 필요한 변경 실행 |

기존 프로젝트라면 설치 버전과 이전 이력의 인수 절차를 먼저 확인해야 합니다. 이 글의 8계열 명령을 7계열 프로젝트에 그대로 적용하지 않습니다.

---

## ☕ Flyway: 버전이 있는 SQL을 순서대로 적용

Flyway의 대표적인 방식은 `V1__create_users.sql`, `V2__add_nickname.sql`처럼 버전이 붙은 파일을 관리하는 것입니다. 기본 구분자는 밑줄 두 개이며 설정에 따라 달라질 수 있습니다.

버전별 마이그레이션은 순서대로 적용되고, 기본 이력 테이블인 `flyway_schema_history`는 적용 상태와 체크섬 등을 기록합니다. 이미 공유 환경에 적용한 버전 파일을 수정하기보다 새 버전으로 후속 변경을 추가하는 방식이 권장됩니다. [Flyway 버전별 마이그레이션 문서](https://documentation.red-gate.com/flyway/flyway-concepts/migrations/versioned-migrations)

SQL을 명시적으로 리뷰하기 좋지만, 사용하는 DB의 DDL·잠금·트랜잭션 특성은 작성자가 이해해야 합니다. 지원 DB와 자동 생성·Undo 같은 기능의 제공 범위는 버전·에디션에서 확인합니다.

---

## 🧾 Liquibase: changelog와 changeset으로 변경 관리

Liquibase의 changelog는 변경 목록이며, changeset은 추적하는 변경 단위입니다. changeset의 ID·작성자·파일 경로 등이 식별에 사용됩니다. 기본적으로 적용한 변경을 이력으로 관리하고, 조건이나 반복 실행 옵션을 별도로 구성할 수 있습니다. [Liquibase changeset 문서](https://docs.liquibase.com/community/user-guide-5-0/what-is-a-changeset)

XML·YAML·JSON의 구조화된 변경이나 SQL을 사용할 수 있습니다. 실행 순서는 ID의 숫자만 보고 결정되는 것이 아니라 changelog의 구성·포함 순서 등을 따르므로 이를 명확히 관리해야 합니다. [Liquibase changelog 문서](https://docs.liquibase.com/community/user-guide-5-0/what-is-a-changelog)

구조화된 변경을 사용해도 DB별 기능 차이가 없어지지는 않습니다. 자동 rollback 가능 여부도 변경 종류와 DB에 따라 확인해야 합니다.

---

## 💻 같은 요구를 네 도구로 표현하기

공통 요구는 **기존 `users` 테이블에 NULL을 허용하는 `nickname TEXT` 컬럼 추가**입니다. 기존 DB 연결과 초기 마이그레이션이 구성되어 있다고 가정한 핵심 예제이며, 새 프로젝트 전체 설정은 생략합니다.

### 1. Alembic의 변경 함수

생성된 revision 파일의 식별자와 의존 관계는 유지하고, 아래처럼 변경 함수를 작성합니다.

```python
from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column("users", sa.Column("nickname", sa.Text(), nullable=True))


def downgrade():
    op.drop_column("users", "nickname")
```

`downgrade()`는 구조를 되돌리는 예제입니다. 컬럼을 삭제하면 저장한 nickname 값도 사라집니다.

### 2. Prisma 8의 contract 변경과 계획

기존 contract에 optional 필드를 추가합니다. 아래는 PostgreSQL용 모델 부분의 예시이며, 연결과 generator 등의 프로젝트 설정은 별도로 필요합니다.

```prisma
// use prisma-8

model User {
  id       Int     @id
  email    String
  nickname String?

  @@map("users")
}
```

```bash
npx prisma contract emit
npx prisma migration plan --name add_nickname
npx prisma migration check
npx prisma db migrate --show
# 개발 DB에 적용하고 다음 계획의 기준을 갱신
npx prisma db migrate --advance-ref db
```

기존 초기 변경이 적용되어 있고 `db` ref가 그 상태를 가리키는 개발 환경을 가정합니다. 기존 DB의 상태를 알려주지 않고 빈 기준에서 계획하면 전체 생성 계획이 될 수 있습니다. 생성되는 파일과 SQL을 확인해야 합니다. [Prisma 변경 계획 문서](https://www.prisma.io/docs/orm/migrations/generating-a-migration)

`migration.ts`를 수정했다면 문서에 안내된 재컴파일 단계를 거칩니다. 실행용 JSON만 직접 수정하는 방식은 피하고, CI·운영에서는 검토한 목표 상태와 대상 DB를 명시해 적용합니다. [Prisma 변경 편집](https://www.prisma.io/docs/orm/migrations/editing-a-migration), [적용 문서](https://www.prisma.io/docs/orm/migrations/applying-a-migration)

### 3. Flyway의 SQL 파일

기존 V1이 적용되어 있다고 가정한 `V2__add_nickname.sql` 예제입니다.

```sql
ALTER TABLE users ADD COLUMN nickname TEXT;
```

CLI에 대상 DB와 마이그레이션 위치를 설정한 뒤 상태와 파일을 확인하고 적용합니다.

```bash
flyway info
flyway validate
flyway migrate
```

Spring Boot 통합에서는 기본적으로 `src/main/resources/db/migration` 같은 경로를 활용할 수 있습니다. 프로젝트의 실제 설정과 배포 실행 주체를 확인해야 합니다.

### 4. Liquibase의 XML changelog

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        https://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">
    <changeSet id="add-users-nickname" author="blog-example">
        <addColumn tableName="users">
            <column name="nickname" type="text">
                <constraints nullable="true"/>
            </column>
        </addColumn>
        <rollback>
            <dropColumn tableName="users" columnName="nickname"/>
        </rollback>
    </changeSet>
</databaseChangeLog>
```

`db.changelog.xml`로 저장하고 DB 연결 설정을 준비한 환경의 명령 예시입니다.

```bash
liquibase --changelog-file=db.changelog.xml validate
liquibase --changelog-file=db.changelog.xml update
```

`addColumn`으로 변경을 표현하고 rollback에 역방향 변경을 명시했습니다. 이것도 삭제한 데이터까지 복원한다는 뜻은 아닙니다. [Liquibase addColumn 문서](https://docs.liquibase.com/secure/reference-guide-5-1/change-types/addcolumn)

---

## 🔄 롤백과 데이터 복구는 다르다

| 도구 | 확인할 복구·역방향 변경 |
| --- | --- |
| Alembic | 작성한 downgrade가 실제로 가능한지 검증 |
| Prisma | 설치 버전의 복구·역방향 변경 절차 확인 |
| Flyway | Undo 제공 범위와 별도 역방향 스크립트 확인, 후속 버전으로 수정 가능 |
| Liquibase | 변경별 자동 rollback 지원 또는 직접 작성한 rollback 확인 |

Flyway의 Undo는 사용 에디션과 대응 스크립트가 필요한 기능이며, 모든 변경을 자동 역산하는 것으로 이해하면 안 됩니다. [Flyway Undo 문서](https://documentation.red-gate.com/flyway/reference/commands/undo)

Prisma 역시 과거 명령을 현재 버전의 복구 방법으로 가정하지 않고, 해당 버전의 [복구 문서](https://www.prisma.io/docs/orm/migrations/rollbacks-and-recovery)를 확인합니다.

컬럼을 삭제한 뒤 다시 같은 이름으로 만들더라도 이전 값은 돌아오지 않습니다. 앱의 이전 버전으로 돌아가는 것, 스키마를 역변경하는 것, 백업에서 데이터를 복원하는 것은 서로 다른 작업입니다.

---

## 🚦 운영 배포에서 중요한 점

### 컬럼 추가와 필수 값 적용은 나누기

기존 데이터가 있는 테이블에 필수 컬럼을 추가할 때는 다음과 같은 단계적 변경을 검토할 수 있습니다.

<figure class="article-diagram">
<figcaption>처리 흐름</figcaption>
<ol>
<li>NULL 허용 컬럼 추가</li>
<li>기존·신규 구조와 호환되는 앱 배포</li>
<li>기존 데이터 보완 · backfill</li>
<li>신규 데이터·누락 값 확인</li>
<li>NOT NULL 적용</li>
<li>사용하지 않는 이전 구조 정리</li>
</ol>
</figure>


이는 Expand–Migrate–Contract 방식의 예시입니다. 정확한 순서는 앱의 읽기·쓰기 방식과 동시 실행되는 구버전의 동작에 맞춰 설계해야 합니다.

### 도구가 해결하지 않는 문제

- 큰 테이블의 DDL 잠금·재작성 시간과 DB별 트랜잭션 특성.
- 중단된 데이터 보완 작업의 재시작·중복 처리.
- 구버전·신버전 앱이 함께 동작하는 배포 구간.
- 실제 복구가 가능한 백업과 복구 시간.
- 여러 앱 인스턴스의 실행 경쟁과 마이그레이션 실행 주체.

운영과 비슷한 데이터로 소요 시간·잠금을 확인하고, 빈 DB에서 전체 이력을 적용하는 검사와 이전 버전 DB를 올리는 검사를 구분하면 좋습니다. 이미 적용한 변경 파일을 임의로 덮어쓰기보다 후속 변경으로 문제를 수정하는 흐름도 검토합니다.

---

## ✅ 어떤 도구를 검토할까?

| 현재 환경·요구 | 후보 | 먼저 확인할 것 |
| --- | --- | --- |
| Python·SQLAlchemy 중심 | Alembic | 모델 메타데이터와 revision 구성 |
| Prisma 중심 TypeScript·JavaScript 앱 | 해당 Prisma 버전의 마이그레이션 체계 | 설치 버전·DB 지원·기존 이력 이전 |
| SQL 파일을 직접 관리하는 Java·Spring·CI | Flyway | 버전 규칙·SQL 리뷰·DB별 동작 |
| 변경 단위·조건·rollback을 구조적으로 관리 | Liquibase | changelog 순서·changeset 식별·DB별 지원 |

마이그레이션 도구의 이름보다 팀의 기술 스택과 리뷰 방식, 실제 DB의 변경 특성에 맞는지 확인하는 것이 중요합니다.

---

## 🧪 이 글의 예제 검증 범위

Alembic 변경 함수는 SQLite 임시 DB에서 컬럼 추가·기존 행 유지·역변경을 검증했습니다. Flyway에 제시한 SQL도 SQLite에서 실행했고, Liquibase XML은 구문을 검사했습니다.

Prisma·Flyway·Liquibase의 CLI 전체 흐름과 PostgreSQL 서버에서의 실행은 이 글 작성 과정에서 수행하지 않았습니다. 운영 적용 전에는 해당 도구·DB 버전의 실제 환경에서 검증해야 합니다.

📚 **함께 읽기**:
- [관계형·분산 SQL DB 제품 비교]({% post_url 2026-10-15-relational-distributed-sql-databases %})
