---
title: "시간복잡도 최적화: 반복 계산을 줄이는 누적 합"
date: 2026-01-15 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

시간복잡도는 입력 크기에 따라 연산량이 어떻게 증가하는지 설명합니다. 최선·평균·최악 값을 모든 알고리즘에 같은 표로 붙이면 실제 구현과 맞지 않습니다.

## 🎯 반복되는 구간 합

길이 n인 배열에서 q개의 구간 합을 매번 순회하면 최악 O(nq)입니다. 누적 합을 한 번 만들면 전처리 O(n), 각 질의 O(1)로 계산할 수 있습니다.

```python
def build_prefix(values):
    prefix = [0]
    for value in values:
        prefix.append(prefix[-1] + value)
    return prefix


def range_sum(prefix, left, right):
    n = len(prefix) - 1
    if not 0 <= left <= right <= n:
        raise ValueError("0 <= left <= right <= n이 필요합니다")
    return prefix[right] - prefix[left]

prefix = build_prefix([2, -1, 4, 3])
print(range_sum(prefix, 1, 3))  # 3: 원래 배열의 [1, 3)
```

추가 공간은 O(n), 전체 전처리·질의 시간은 O(n+q)입니다. 원소가 자주 바뀌면 단순 누적 합의 갱신 비용이 커지므로 다른 자료구조를 검토해야 합니다.

## 📊 병목 찾기

| 관찰 | 검토할 개선 |
| --- | --- |
| 같은 구간을 계속 순회 | 누적 합 |
| 같은 상태를 재계산 | 메모이제이션·DP |
| 선형 검색을 반복 | 정렬·이진 탐색 또는 해시 |
| 앞 원소 제거가 반복 | deque 등 적합한 자료구조 |

복잡도를 줄여도 입력·출력, 객체 생성, 메모리 접근이 실제 시간에 영향을 줍니다. 고정된 초당 연산 수를 모든 환경의 기준으로 사용하지 않습니다.

## ✅ 검증

작은 입력에서는 단순 구현과 결과를 비교하고, 빈 구간·전체 구간·음수 원소를 확인합니다. 최적화 전후의 계산 결과가 같아야 합니다.
