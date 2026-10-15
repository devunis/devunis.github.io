---
title: "Python vs Java 코딩 테스트: 구현·자료구조·입출력 비교"
date: 2026-01-14 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

코딩 테스트 언어 선택은 팀의 실무 언어와 별개로 문제 유형·시간 제한·익숙함에 영향을 받습니다. 특정 언어의 성능을 고정된 배수로 비교할 수는 없습니다.

## 📊 구현 관점

| 항목 | Python | Java |
| --- | --- | --- |
| 정수 | int는 가변 정밀도, 큰 수 연산 비용 증가 | int·long 범위 확인, 필요하면 BigInteger |
| 우선순위 큐 | heapq | PriorityQueue |
| 큐 | collections.deque | ArrayDeque |
| 정렬 기준 | key 함수 | Comparator |
| 입력 | 입력량에 맞는 파싱 선택 | BufferedReader 등과 파싱 방식 선택 |

Python list의 맨 앞 pop은 원소 이동 비용이 있습니다. Java에서도 큐에 맞는 구현을 선택해야 합니다. 재귀 깊이·스택 크기와 메모리 제한도 확인합니다.

## 💻 같은 누적 합 계산

아래는 외부 의존성이 없는 핵심 구현입니다.

```python
def prefix_sums(values):
    result = [0]
    for value in values:
        result.append(result[-1] + value)
    return result

print(prefix_sums([2, -1, 4]))  # [0, 2, 1, 5]
```

```java
public class PrefixSums {
    public static long[] prefixSums(int[] values) {
        long[] result = new long[values.length + 1];
        for (int i = 0; i < values.length; i++) {
            result[i + 1] = result[i] + values[i];
        }
        return result;
    }
}
```

둘 다 n개 값을 처리하는 시간·결과 공간은 O(n)입니다. Java는 합계에 long을 사용해 int 범위를 넘는 합에 대비하지만 long도 유한한 범위입니다. Python 큰 정수의 연산 비용을 항상 O(1)로 가정하지 않습니다.

## ✅ 선택 기준

해당 채점 환경의 언어별 제한을 확인하고, 실제 입력 규모로 검증합니다. 언어를 바꾸기 전에 알고리즘 복잡도와 자료구조·입출력 병목을 먼저 점검합니다.

📚 [Python 자료구조](https://docs.python.org/3/tutorial/datastructures.html) · [Java PriorityQueue](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/PriorityQueue.html)
