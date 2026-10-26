---
title: "자료구조 선택: 접근 패턴과 연산 비용부터 보기"
date: 2026-01-16 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

자료구조는 무엇을 저장하는지뿐 아니라 어떤 연산을 반복하는지에 따라 선택합니다. 모든 자료구조를 같은 시간복잡도 표로 설명할 수는 없습니다.

## 📊 자주 사용하는 선택지

| 요구 | Python 예시 | 비용·주의점 |
| --- | --- | --- |
| 인덱스 접근·뒤 삽입 | list | 인덱스 O(1), append 상각 O(1), 앞 삽입·삭제 O(n) |
| 앞뒤 삽입·삭제 | deque | 양끝 연산 O(1), 중간 접근은 비용 증가 |
| 키 조회·빈도 집계 | dict | 평균 O(1), 해시 충돌·키 비용에 영향 |
| 중복 제거·소속 확인 | set | 평균 O(1), 순서 보장에 의존하지 않기 |
| 최솟값 반복 선택 | heapq | 루트 조회 O(1), 삽입·제거 O(log n) |
| 정렬된 경계 검색 | list + bisect | 검색 O(log n), 삽입은 O(n) 가능 |

## 💻 빈도 집계와 큐 예제

```python
from collections import Counter, deque

counts = Counter(["a", "b", "a"])
print(counts["a"])  # 2

queue = deque(["first", "second"])
queue.append("third")
print(queue.popleft())  # first
```

힙의 내부 배열이 전체 정렬 결과인 것은 아닙니다. 딕셔너리가 입력 순서를 유지해도 키의 크기순으로 정렬되는 것은 아닙니다.

## ✅ 선택 과정

1. 필요한 연산과 빈도를 나열합니다.
2. 원소 수와 메모리 제한을 확인합니다.
3. 최악·평균·상각 비용을 구분합니다.
4. 중복·순서·빈 입력 요구를 확인합니다.
5. 대표 입력에서 검증합니다.

📚 [Python collections](https://docs.python.org/3/library/collections.html) · [스택·큐·힙 비교]({% post_url 2026-10-15-stack-queue-heap %})
