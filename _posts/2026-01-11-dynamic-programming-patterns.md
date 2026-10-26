---
title: "동적 계획법: 상태·점화식·초기값으로 문제 풀기"
date: 2026-01-11 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

동적 계획법(DP)은 반복되는 부분 문제의 답을 저장해 재사용합니다. 배열을 만든다는 사실보다 상태의 의미와 전이가 올바른지가 중요합니다.

## 🎯 최소 동전 수 문제

주어진 양의 정수 동전을 무제한 사용해 목표 금액을 만들 때 필요한 최소 개수를 구합니다. dp[x]는 금액 x를 만드는 최소 개수입니다.

점화식은 사용 가능한 동전 c에 대해 dp[x] = min(dp[x-c]+1)이며, dp[0]=0으로 시작합니다. 만들 수 없는 상태는 도달 불가 값으로 남깁니다.

```python
def min_coins(coins, amount):
    if amount < 0 or any(c <= 0 for c in coins):
        raise ValueError("금액은 비음수, 동전은 양수여야 합니다")
    unreachable = amount + 1
    dp = [unreachable] * (amount + 1)
    dp[0] = 0
    for value in range(1, amount + 1):
        for coin in coins:
            if coin <= value:
                dp[value] = min(dp[value], dp[value - coin] + 1)
    return -1 if dp[amount] == unreachable else dp[amount]

print(min_coins([1, 3, 4], 6))  # 2
print(min_coins([2], 3))        # -1
```

큰 동전부터 고르면 4+1+1을 택할 수 있지만 최적은 3+3입니다. 그래서 이 문제의 일반적인 동전 집합에는 단순 그리디가 항상 맞지 않습니다.

## 📊 복잡도

목표 금액 A, 동전 종류 C에 대해 시간 O(A·C), 공간 O(A)입니다. 이는 금액의 숫자 크기에 의존하는 의사다항 시간이며, 매우 큰 금액에는 적합하지 않을 수 있습니다.

## ✅ 상태를 설계할 질문

- 저장하는 값이 최소·최대·가능 여부·경우의 수 중 무엇인가?
- 초기 상태와 도달 불가 상태가 구분되는가?
- 항목을 한 번만 쓸지 무제한 쓸지에 따라 전이 순서가 달라지는가?
- 빈 입력과 목표 0을 처리하는가?

메모이제이션은 필요한 상태를 재귀적으로 계산하고, 표 채우기(tabulation)은 정한 순서대로 표를 채웁니다. 같은 문제도 상태와 전이에 따라 시간·공간이 달라집니다.
