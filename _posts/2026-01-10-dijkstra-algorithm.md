---
title: "다익스트라: 음수 가중치가 없는 그래프의 최단 경로"
date: 2026-01-10 09:00:00 +0900
categories: [Algorithm, Problem-Solving]
tags: [Algorithm, Coding-Test, BOJ, Problem-Solving]
last_modified_at: 2026-10-15 14:50:00 +0900
---

다익스트라는 시작점에서 다른 정점까지의 최단 거리를 구합니다. 전제는 모든 간선 가중치가 0 이상이라는 것입니다. 음수 간선이 있으면 다른 알고리즘을 검토해야 합니다.

## 🎯 핵심 과정

현재 알려진 거리가 가장 작은 정점을 먼저 처리하고, 연결된 간선을 통해 더 짧은 경로를 발견하면 갱신합니다. 힙에 오래된 거리도 남을 수 있으므로 꺼낸 값이 최신 값인지 확인합니다.

## 💻 Python 구현

정점은 0부터 시작하고 graph[u]는 (도착점, 가중치)의 목록입니다.

```python
import heapq
from math import inf


def dijkstra(graph, start):
    if not 0 <= start < len(graph):
        raise ValueError("시작점이 범위를 벗어났습니다")
    for edges in graph:
        for v, weight in edges:
            if not 0 <= v < len(graph) or weight < 0:
                raise ValueError("정점 범위와 비음수 가중치가 필요합니다")
    distances = [inf] * len(graph)
    distances[start] = 0
    queue = [(0, start)]
    while queue:
        cost, u = heapq.heappop(queue)
        if cost != distances[u]:
            continue
        for v, weight in graph[u]:
            candidate = cost + weight
            if candidate < distances[v]:
                distances[v] = candidate
                heapq.heappush(queue, (candidate, v))
    return distances


graph = [[(1, 4), (2, 1)], [], [(1, 2)], []]
print(dijkstra(graph, 0))
# [0, 3, 1, inf]
```

## 📊 복잡도와 주의점

이 구현은 감소 키 대신 중복 힙 항목을 넣습니다. 간선 수 E, 정점 수 V에 대해 검증 비용을 포함한 시간은 O(V + E log(E+1)), 저장 공간은 O(V+E)로 볼 수 있습니다. 단순 그래프에서 흔히 O((V+E) log V) 형태로 설명합니다.

도달할 수 없는 정점은 inf입니다. 모든 간선의 비용이 같다면 BFS가 더 간단할 수 있고, 경로 자체가 필요하면 이전 정점을 추가로 기록합니다.

📚 [Python heapq](https://docs.python.org/3/library/heapq.html)
