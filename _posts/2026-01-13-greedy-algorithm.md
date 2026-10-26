---
title: "그리디 알고리즘: 선택 기준과 정당성 검증"
date: 2026-01-13 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

그리디는 각 단계에서 정한 기준에 따라 선택합니다. 빠르게 선택한다는 사실만으로 최적해가 되는 것은 아니며, 선택을 바꿔도 최적성을 잃지 않는 이유를 설명해야 합니다.

## 🎯 겹치지 않는 회의의 최대 개수

각 회의는 시작 < 종료인 구간이고, 앞 회의가 끝나는 시각에 다음 회의가 시작할 수 있다고 가정합니다. 가장 빨리 끝나는 회의부터 선택합니다.

```python
def select_meetings(intervals):
    if any(start >= end for start, end in intervals):
        raise ValueError("시작 시각은 종료 시각보다 작아야 합니다")
    selected = []
    last_end = None
    for start, end in sorted(intervals, key=lambda pair: (pair[1], pair[0])):
        if last_end is None or start >= last_end:
            selected.append((start, end))
            last_end = end
    return selected

print(select_meetings([(1, 4), (2, 3), (3, 5), (4, 6)]))
# [(2, 3), (3, 5)]
```

최적해의 첫 회의를 가장 일찍 끝나는 회의로 바꿔도 뒤 회의가 사용할 시간이 줄지 않습니다. 같은 논리를 남은 구간에 반복할 수 있습니다. 이는 회의 수를 최대화하는 문제의 논리이며 회의마다 보상이 다르면 다른 접근이 필요할 수 있습니다.

## 📊 복잡도

정렬 O(n log n), 순회 O(n)으로 전체 O(n log n)입니다. 이 구현은 정렬 복사와 결과 저장에 O(n) 공간을 사용합니다.

## ✅ 반례부터 찾아보기

최소 동전 수 문제에서 [1, 3, 4]로 6을 만들 때 큰 값 우선은 최적이 아닙니다. 후보 기준이 떠오르면 작은 입력에서 완전 탐색과 비교하고, 교환 논증이나 불변식으로 이유를 설명합니다.
