(function() {
  'use strict';

  const board = document.getElementById('color-board');
  const startButton = document.getElementById('color-start');
  const scoreEl = document.getElementById('color-score');
  const timeEl = document.getElementById('color-time');
  const streakEl = document.getElementById('color-streak');
  const bestEl = document.getElementById('color-best');
  const levelEl = document.getElementById('color-level-label');
  const feedbackEl = document.getElementById('color-feedback');
  const resultEl = document.getElementById('color-result');
  const bestStorageKey = 'chromaScanBest';

  if (!board || !startButton) return;

  let score = 0;
  let streak = 0;
  let timeLeft = 30;
  let timerId = null;
  let isRunning = false;
  let isPaused = false;
  let oddIndex = -1;

  function getBest() {
    return Number.parseInt(localStorage.getItem(bestStorageKey), 10) || 0;
  }

  function getDifficulty() {
    const gridSize = Math.min(8, 2 + Math.floor(score / 3));
    const difference = Math.max(5, 26 - Math.floor(score * 1.15));
    return { gridSize, difference };
  }

  function createRound() {
    const { gridSize, difference } = getDifficulty();
    const count = gridSize * gridSize;
    const hue = Math.floor(Math.random() * 360);
    const saturation = 52 + Math.floor(Math.random() * 28);
    const lightness = 42 + Math.floor(Math.random() * 18);
    const direction = Math.random() > .5 ? 1 : -1;
    const oddLightness = Math.max(18, Math.min(82, lightness + difference * direction));

    oddIndex = Math.floor(Math.random() * count);
    board.innerHTML = '';
    board.classList.remove('is-idle');
    board.style.setProperty('--grid-size', String(gridSize));

    for (let index = 0; index < count; index += 1) {
      const cell = document.createElement('button');
      const isOdd = index === oddIndex;
      cell.type = 'button';
      cell.className = 'color-cell';
      cell.style.backgroundColor = `hsl(${hue} ${saturation}% ${isOdd ? oddLightness : lightness}%)`;
      cell.setAttribute('aria-label', `${index + 1}번 색상 카드`);
      cell.dataset.index = String(index);
      cell.addEventListener('click', handleChoice);
      board.appendChild(cell);
    }

    levelEl.textContent = `LEVEL ${String(score + 1).padStart(2, '0')} · ${gridSize} × ${gridSize} GRID`;
    feedbackEl.textContent = `색상 차이 감도 ${difference}`;
  }

  function flashBoard(className) {
    board.classList.remove('is-hit', 'is-miss');
    void board.offsetWidth;
    board.classList.add(className);
  }

  function handleChoice(event) {
    if (!isRunning) return;
    const selectedIndex = Number.parseInt(event.currentTarget.dataset.index, 10);

    if (selectedIndex === oddIndex) {
      score += 1;
      streak += 1;
      if (score % 5 === 0) timeLeft = Math.min(40, timeLeft + 3);
      scoreEl.textContent = String(score);
      streakEl.textContent = String(streak);
      feedbackEl.textContent = score % 5 === 0 ? '정답 · 보너스 +3초' : '정답 · 다음 스캔';
      flashBoard('is-hit');
      createRound();
    } else {
      streak = 0;
      timeLeft = Math.max(0, timeLeft - 2);
      streakEl.textContent = '0';
      timeEl.textContent = String(timeLeft);
      feedbackEl.textContent = '오답 · 시간 -2초';
      flashBoard('is-miss');
      if (timeLeft === 0) endGame();
    }
  }

  function tick() {
    timeLeft -= 1;
    timeEl.textContent = String(Math.max(0, timeLeft));
    if (timeLeft <= 0) endGame();
  }

  function startGame() {
    if (timerId) window.clearInterval(timerId);
    score = 0;
    streak = 0;
    timeLeft = 30;
    isRunning = true;
    isPaused = false;
    scoreEl.textContent = '0';
    streakEl.textContent = '0';
    timeEl.textContent = '30';
    resultEl.className = 'game-result';
    resultEl.textContent = '';
    startButton.textContent = '다시 시작 ↻';
    window.DevArcade?.recordPlay();
    createRound();
    timerId = window.setInterval(tick, 1000);
  }

  function endGame() {
    isRunning = false;
    isPaused = false;
    if (timerId) window.clearInterval(timerId);
    timerId = null;
    board.innerHTML = '';
    board.classList.add('is-idle');
    levelEl.textContent = 'SESSION COMPLETE';
    feedbackEl.textContent = `${score}개의 색상 차이를 감지했습니다.`;

    const previousBest = getBest();
    if (score > previousBest) {
      localStorage.setItem(bestStorageKey, String(score));
      bestEl.textContent = String(score);
      resultEl.textContent = `NEW BEST · ${score}점 — 시각 감도가 업데이트됐습니다.`;
      resultEl.className = 'game-result show success';
    } else {
      resultEl.textContent = `SCAN COMPLETE · ${score}점 — 최고 기록은 ${previousBest}점입니다.`;
      resultEl.className = 'game-result show';
    }
  }

  document.addEventListener('arcade:activate', (event) => {
    if (event.detail.panelId !== 'game-color' && isRunning) {
      isPaused = true;
      window.clearInterval(timerId);
      timerId = null;
      feedbackEl.textContent = 'PAUSED · 게임으로 돌아오면 계속됩니다.';
    } else if (event.detail.panelId === 'game-color' && isRunning && isPaused) {
      isPaused = false;
      feedbackEl.textContent = 'RESUMED · 다른 색을 찾아보세요.';
      timerId = window.setInterval(tick, 1000);
    }
  });

  startButton.addEventListener('click', startGame);
  bestEl.textContent = String(getBest());
})();
