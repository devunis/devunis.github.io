---
layout: single
title: "🎮 개발자 미니 게임"
permalink: /games/
---

<link rel="stylesheet" href="/assets/css/games.css">

잠깐의 휴식이 필요할 때! 간단한 게임으로 머리를 식혀보세요. 🎯

---

## 🧠 코딩 용어 매칭 게임

AI/백엔드 개발 용어를 얼마나 알고 있나요? 같은 용어 카드를 매칭하세요!

<div id="flashcard-game-container">
  <div class="game-header">
    <div class="game-stats">
      <span>⏱️ 시간: <span id="flashcard-timer">0</span>초</span>
      <span>🎯 매칭: <span id="flashcard-matches">0</span> / 8</span>
      <span>🔄 시도: <span id="flashcard-moves">0</span></span>
    </div>
    <button id="flashcard-reset" class="game-button">새 게임</button>
  </div>
  <div id="flashcard-board" class="flashcard-board"></div>
  <div id="flashcard-result" class="game-result"></div>
</div>

<script src="/assets/js/flashcard-game.js"></script>

---

## 🐍 Python Snake

클래식 뱀 게임! Python 개발자라면 꼭 해봐야죠. 🐍

<div id="snake-game-container">
  <div class="game-header">
    <div class="game-stats">
      <span>🎯 점수: <span id="snake-score">0</span></span>
      <span>🏆 최고점: <span id="snake-high-score">0</span></span>
    </div>
    <button id="snake-reset" class="game-button">새 게임</button>
  </div>
  <canvas id="snake-canvas" width="400" height="400"></canvas>
  <div class="game-controls">
    <p>⌨️ 화살표 키로 조작하세요</p>
  </div>
  <div id="snake-result" class="game-result"></div>
</div>

<script src="/assets/js/snake-game.js"></script>

---

## 🚀 Flappy Developer

버그를 피해 날아가세요! 얼마나 오래 버틸 수 있나요? 🐛

<div id="flappy-game-container">
  <div class="game-header">
    <div class="game-stats">
      <span>🎯 점수: <span id="flappy-score">0</span></span>
      <span>🏆 최고점: <span id="flappy-high-score">0</span></span>
    </div>
    <button id="flappy-reset" class="game-button">새 게임</button>
  </div>
  <canvas id="flappy-canvas" width="400" height="600"></canvas>
  <div class="game-controls">
    <p>⌨️ 스페이스바 또는 클릭으로 점프!</p>
  </div>
  <div id="flappy-result" class="game-result"></div>
</div>

<script src="/assets/js/flappy-game.js"></script>

---

## 📊 게임 통계

게임을 즐기고 계신가요? 블로그의 다른 콘텐츠도 확인해보세요!

- [📝 블로그 글 보기](/posts/)
- [🚀 프로젝트 보기](/projects/)
- [👤 소개 보기](/about/)
