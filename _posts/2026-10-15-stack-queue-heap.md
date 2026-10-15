---
title: "Stack, Queue, Heap: 차이와 언제 써야 할까?"
date: 2026-10-15 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Data-Structure, Go, Stack, Queue, Heap]
---

같은 데이터를 저장해도 **어떤 순서로 꺼내야 하는지**에 따라 적합한 자료구조가 달라집니다. 스택은 최근 항목, 큐는 먼저 들어온 항목, 힙은 우선순위가 높은 항목을 꺼낼 때 사용합니다.

이 글의 Heap은 **자료구조인 이진 힙**을 뜻합니다. 프로그램의 메모리 heap 영역과는 별개의 개념입니다.

---

## 🎯 핵심 개념: 꺼내는 기준이 다르다

`3 → 1 → 2` 순서로 값을 넣고 모두 꺼낸다고 생각해 봅시다.

| 자료구조 | 꺼내는 기준 | 나오는 순서 | 대표 사용처 |
| --- | --- | --- | --- |
| 스택(Stack) | LIFO: 나중에 넣은 것부터 | 2 → 1 → 3 | 되돌리기, DFS, 괄호 검사 |
| 큐(Queue) | FIFO: 먼저 넣은 것부터 | 3 → 1 → 2 | BFS, 작업 대기열 |
| 최소 힙(Min Heap) | 작은 값부터 | 1 → 2 → 3 | 다익스트라, 최소 비용 작업 선택 |
| 최대 힙(Max Heap) | 큰 값부터 | 3 → 2 → 1 | 높은 우선순위 작업 선택 |

스택과 큐는 접근 규칙을 정의하는 추상 자료형입니다. 힙은 우선순위 큐를 구현하는 대표적인 자료구조입니다. 우선순위 큐를 반드시 힙으로 구현해야 하는 것은 아닙니다.

### 스택: 최근 작업을 먼저 처리

접시를 쌓고 맨 위에서 꺼내는 모습입니다. `Push`로 넣고 `Pop`으로 꺼냅니다. DFS에서는 최근에 발견한 정점을 먼저 탐색할 수 있고, 괄호 검사에서는 가장 최근의 여는 괄호부터 짝을 맞춥니다.

되돌리기를 구현한다면 작업 기록을 스택에 쌓습니다. 다시 실행까지 지원하려면 별도의 스택과 상태 관리도 필요합니다.

### 큐: 도착 순서를 유지

줄을 선 순서대로 처리하는 모습입니다. 뒤에 `Enqueue`하고 앞에서 `Dequeue`합니다. 가중치가 없는 그래프의 BFS는 큐를 사용해 시작점에서 가까운 정점부터 탐색합니다.

실제 메시지 시스템에서는 여러 소비자와 재시도 때문에 완료 순서가 달라질 수 있습니다. 자료구조 큐의 FIFO와 분산 시스템의 처리 보장은 구분해야 합니다.

### 힙: 우선순위에 따라 선택

이진 힙은 **완전 이진 트리** 형태를 가지며 보통 배열로 저장합니다. 최소 힙에서는 부모 값이 자식 값보다 작거나 같습니다. 따라서 루트가 최솟값입니다. 최대 힙은 비교 방향을 반대로 적용합니다.

0부터 시작하는 배열에서 인덱스 `i`의 자식은 `2*i+1`, `2*i+2`입니다. 부모는 `i > 0`일 때 `(i-1)/2`입니다.

힙의 배열 전체가 정렬된 것은 아닙니다. 형제나 서로 다른 하위 트리 사이의 순서는 보장하지 않습니다. 삽입은 위로, 루트 제거는 아래로 이동하며 힙 조건을 복구하므로 트리 높이에 해당하는 O(log n) 작업이 필요합니다.

동일한 우선순위의 입력 순서도 기본적으로 보장하지 않습니다. 같은 우선순위에서 FIFO가 필요하면 입력 순번을 추가해 함께 비교해야 합니다.

---

## 🧠 메모리 heap과 자료구조 heap의 차이

| 구분 | 자료구조 heap | 메모리 heap |
| --- | --- | --- |
| 목적 | 우선순위에 따라 원소 선택 | 프로그램 객체를 위한 메모리 할당·관리 |
| 핵심 | 부모와 자식 사이의 순서 조건 | 객체의 수명과 메모리 회수 |
| Go에서의 예 | `container/heap`으로 최소 힙 구성 | 런타임과 GC가 관리하는 객체 메모리 |

자료구조 힙을 만든다고 메모리가 특별한 우선순위 방식으로 할당되는 것은 아닙니다. 또한 Go에서 `new`나 포인터 사용만으로 메모리 heap 할당을 단정할 수 없습니다. 컴파일러는 탈출 분석 등을 통해 할당 위치를 결정합니다.

함수 호출의 메모리 stack 역시 이 글에서 직접 구현하는 스택과 역할을 구분해서 이해하면 좋습니다.

---

## 💻 Go 구현: 같은 입력, 다른 출력

아래 예제는 **Go 1.18 이상**에서 `main.go`로 저장한 뒤 `go run main.go`로 실행할 수 있습니다. 빈 스택과 큐는 `(0, false)`를 반환하고, 힙은 길이를 확인한 후 꺼냅니다.

큐는 연결 리스트로 구현해 앞에서 꺼낼 때 전체 원소를 이동하지 않도록 했습니다. 정수 예제이므로 반환값이 `0`이어도 성공 여부는 `bool`로 구분합니다.

```go
package main

import (
    "container/heap"
    "fmt"
)

type Stack []int

func (s *Stack) Push(v int) {
    *s = append(*s, v)
}

func (s *Stack) Pop() (int, bool) {
    if len(*s) == 0 {
        return 0, false
    }
    last := len(*s) - 1
    v := (*s)[last]
    *s = (*s)[:last]
    return v, true
}

type node struct {
    value int
    next  *node
}

type Queue struct {
    head *node
    tail *node
}

func (q *Queue) Enqueue(v int) {
    n := &node{value: v}
    if q.tail == nil {
        q.head = n
    } else {
        q.tail.next = n
    }
    q.tail = n
}

func (q *Queue) Dequeue() (int, bool) {
    if q.head == nil {
        return 0, false
    }
    v := q.head.value
    q.head = q.head.next
    if q.head == nil {
        q.tail = nil
    }
    return v, true
}

type MinHeap []int

func (h MinHeap) Len() int           { return len(h) }
func (h MinHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }

func (h *MinHeap) Push(x any) {
    *h = append(*h, x.(int))
}

func (h *MinHeap) Pop() any {
    last := len(*h) - 1
    v := (*h)[last]
    *h = (*h)[:last]
    return v
}

func main() {
    var s Stack
    var q Queue
    h := &MinHeap{}
    heap.Init(h)

    for _, v := range []int{3, 1, 2} {
        s.Push(v)
        q.Enqueue(v)
        heap.Push(h, v)
    }

    var stackOut, queueOut, heapOut []int
    for {
        v, ok := s.Pop()
        if !ok {
            break
        }
        stackOut = append(stackOut, v)
    }
    for {
        v, ok := q.Dequeue()
        if !ok {
            break
        }
        queueOut = append(queueOut, v)
    }
    for h.Len() > 0 {
        heapOut = append(heapOut, heap.Pop(h).(int))
    }

    fmt.Println("stack:", stackOut)
    fmt.Println("queue:", queueOut)
    fmt.Println("heap:", heapOut)
}
```

실행 결과:

```text
stack: [2 1 3]
queue: [3 1 2]
heap: [1 2 3]
```

### Go의 heap.Pop과 직접 구현한 Pop은 역할이 다르다

사용할 때는 **`heap.Push(h, v)`와 `heap.Pop(h)`**를 호출해야 합니다. 위의 `h.Push`와 `h.Pop`은 표준 라이브러리가 힙 조건을 복구하는 과정에서 사용하는 내부 동작입니다. `h.Pop()`을 직접 호출하면 마지막 원소를 제거할 뿐, 최솟값을 올바르게 꺼내는 연산이 되지 않습니다.

최솟값을 제거하지 않고 조회하려면 `h.Len() > 0`을 확인한 뒤 `(*h)[0]`을 읽습니다. 최대 힙이 필요하면 `Less`의 비교를 `>`로 바꾸면 됩니다. 기존 원소로 시작한다면 `heap.Init(h)`로 힙 조건을 먼저 만들어야 합니다.

---

## 📊 시간 복잡도 비교

`n`은 저장된 원소 수입니다. 스택은 동적 배열, 큐는 위의 연결 리스트, 힙은 배열 기반 이진 힙을 기준으로 합니다.

| 연산 | 스택 | 큐 | 이진 힙 |
| --- | --- | --- | --- |
| 삽입 | 상각 O(1) | O(1) | O(log n)¹ |
| 다음 원소 제거 | O(1) | O(1) | O(log n) |
| 다음 원소 조회 | O(1) | O(1) | O(1) |
| 임의의 값 검색 | O(n) | O(n) | O(n) |
| n개 원소로 초기 구성 | O(n) | O(n) | O(n), heap.Init 사용 |
| 원소 저장 공간 | O(n) | O(n) | O(n) |

¹ 힙 순서를 복구하는 작업은 O(log n)입니다. Go 슬라이스의 용량 확장으로 복사가 발생하는 개별 삽입은 O(n)이 될 수 있으므로, 동적 배열의 확장 비용까지 포함하면 삽입은 상각 O(log n)으로 이해합니다. 스택의 `append`도 같은 이유로 개별 삽입은 O(n)이 될 수 있습니다.

슬라이스는 원소를 꺼내도 기존 용량을 유지할 수 있습니다. 포인터 원소를 저장하는 스택이나 힙은 제거되는 칸을 `nil`로 비워 객체 참조가 불필요하게 남지 않도록 해야 합니다. 위 연결 리스트 큐는 제거한 노드를 더 이상 참조하지 않아 GC가 회수할 수 있지만, 노드별 할당과 포인터 공간이 필요합니다. 연속 메모리의 장점이 필요하면 링 버퍼도 고려할 수 있습니다.

---

## 🎯 실전 선택 팁

1. **최근에 넣은 항목으로 돌아가야 한다면 스택**: DFS, 괄호 검사, 작업 이력.
2. **들어온 순서를 지켜야 한다면 큐**: BFS, 단일 소비자의 작업 대기열.
3. **매번 가장 작거나 큰 항목이 필요하다면 힙**: 다익스트라의 다음 후보, 마감 시간이 가까운 작업, 상위 K개 유지.

예를 들어 가장 큰 K개를 유지할 때는 크기 K의 **최소 힙**을 사용할 수 있습니다. 새 값이 루트보다 크면 루트를 교체하고 힙을 복구합니다. 전체 N개를 처리하는 비용은 O(N log K), 저장 공간은 O(K)입니다(K ≥ 2 기준). 반대로 처음부터 모든 원소의 정렬 결과가 필요하다면 일반 정렬이 더 단순할 수 있습니다.

자료구조를 고를 때는 이름보다 **무엇을 먼저 꺼내야 하는가**를 먼저 정하면 됩니다.

---

📚 **참고 자료**:
- [Go 공식 문서: container/heap](https://pkg.go.dev/container/heap)
- [Go 공식 문서: 슬라이스의 길이와 용량](https://go.dev/tour/moretypes/11)
- [Go FAQ: stack과 heap 할당](https://go.dev/doc/faq#stack_or_heap)
