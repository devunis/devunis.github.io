---
title: "이진 탐색: 정렬된 배열의 경계 찾기"
date: 2026-01-12 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

이진 탐색은 정렬된 데이터나 참·거짓이 한 방향으로 바뀌는 단조 조건에서 탐색 범위를 절반씩 줄입니다. 정렬되지 않은 배열에 바로 적용할 수는 없습니다.

## 🎯 lower bound

목표값 이상인 첫 위치를 찾는 예제입니다. 탐색 구간은 [left, right)이며 right는 포함하지 않습니다.

```python
def lower_bound(values, target):
    left, right = 0, len(values)
    while left < right:
        middle = (left + right) // 2
        if values[middle] < target:
            left = middle + 1
        else:
            right = middle
    return left

values = [1, 3, 3, 7]
print(lower_bound(values, 3))  # 1
print(lower_bound(values, 8))  # 4
print(lower_bound([], 2))     # 0
```

반환값은 삽입 위치입니다. 실제 값이 존재하는지 확인하려면 위치가 길이보다 작은지와 해당 값이 목표와 같은지를 추가 검사합니다.

## 📊 복잡도

배열의 인덱스 접근과 비교가 O(1)일 때 시간 O(log n), 추가 공간 O(1)입니다. 처음 정렬해야 한다면 정렬 비용도 별도로 포함합니다.

Python의 bisect_left는 같은 경계 탐색을 제공합니다. 정렬 리스트의 삽입 위치는 빠르게 찾아도 실제 리스트 삽입은 원소 이동으로 O(n)이 될 수 있습니다.

## ✅ 경계 검사

빈 배열, 모든 값보다 작은 목표, 모든 값보다 큰 목표, 중복값을 확인합니다. 답을 이진 탐색하는 문제에서는 판정 조건이 단조적인지 먼저 증명해야 합니다.

📚 [Python bisect](https://docs.python.org/3/library/bisect.html)
