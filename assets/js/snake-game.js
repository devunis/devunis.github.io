(function() {
  'use strict';

  const canvas = document.getElementById('snake-canvas');
  const scoreEl = document.getElementById('snake-score');
  const highScoreEl = document.getElementById('snake-high-score');
  const speedEl = document.getElementById('snake-speed');
  const stateEl = document.getElementById('snake-state');
  const resultEl = document.getElementById('snake-result');
  const hintEl = document.getElementById('snake-hint');
  const resetButton = document.getElementById('snake-reset');
  const pauseButton = document.getElementById('snake-pause');
  const directionButtons = document.querySelectorAll('[data-snake-direction]');
  const highScoreStorageKey = 'byteSnakeHighScore';

  if (!canvas || !resetButton) return;

  const context = canvas.getContext('2d');
  const gridSize = 24;
  const tileCount = canvas.width / gridSize;
  let snake = [];
  let food = { x: 14, y: 10 };
  let direction = { x: 0, y: 0 };
  let nextDirection = { x: 0, y: 0 };
  let score = 0;
  let highScore = Number.parseInt(localStorage.getItem(highScoreStorageKey), 10) || 0;
  let loopId = null;
  let loopDelay = 112;
  let isPaused = false;
  let hasStarted = false;
  let isGameOver = false;

  function roundedRect(x, y, width, height, radius) {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
  }

  function generateFood() {
    let nextFood;
    do {
      nextFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } while (snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y));
    return nextFood;
  }

  function drawGrid() {
    context.fillStyle = '#090c11';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(135, 160, 255, .055)';
    context.lineWidth = 1;
    for (let value = 0; value <= canvas.width; value += gridSize) {
      context.beginPath();
      context.moveTo(value, 0);
      context.lineTo(value, canvas.height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, value);
      context.lineTo(canvas.width, value);
      context.stroke();
    }
  }

  function draw() {
    drawGrid();
    snake.forEach((segment, index) => {
      context.fillStyle = index === 0 ? '#b6c3ff' : `rgba(135, 160, 255, ${Math.max(.35, 1 - index * .035)})`;
      roundedRect(
        segment.x * gridSize + 2,
        segment.y * gridSize + 2,
        gridSize - 4,
        gridSize - 4,
        index === 0 ? 7 : 5
      );
    });

    context.fillStyle = '#5de2aa';
    context.shadowColor = 'rgba(93, 226, 170, .7)';
    context.shadowBlur = 14;
    context.beginPath();
    context.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize * .3,
      0,
      Math.PI * 2
    );
    context.fill();
    context.shadowBlur = 0;
  }

  function scheduleLoop() {
    window.clearTimeout(loopId);
    loopId = window.setTimeout(update, loopDelay);
  }

  function update() {
    if (isPaused || isGameOver || !hasStarted) return;
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount;
    const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

    if (hitWall || hitSelf) {
      endGame();
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreEl.textContent = String(score);
      food = generateFood();
      loopDelay = Math.max(58, 112 - score * 4);
      speedEl.textContent = `${(112 / loopDelay).toFixed(1)}×`;
    } else {
      snake.pop();
    }

    draw();
    scheduleLoop();
  }

  function setDirection(x, y) {
    if (isGameOver) return;
    if (hasStarted && direction.x + x === 0 && direction.y + y === 0) return;
    nextDirection = { x, y };

    if (!hasStarted) {
      hasStarted = true;
      stateEl.textContent = 'RUNNING';
      hintEl.classList.add('is-hidden');
      window.DevArcade?.recordPlay();
      scheduleLoop();
    }
  }

  function togglePause() {
    if (!hasStarted || isGameOver) return;
    isPaused = !isPaused;
    stateEl.textContent = isPaused ? 'PAUSED' : 'RUNNING';
    pauseButton.textContent = isPaused ? '계속하기' : '일시정지';
    pauseButton.setAttribute('aria-pressed', String(isPaused));
    hintEl.textContent = isPaused ? 'PAUSED · P 키로 계속' : '방향키 또는 WASD로 시작';
    hintEl.classList.toggle('is-hidden', !isPaused);
    if (!isPaused) scheduleLoop();
  }

  function endGame() {
    isGameOver = true;
    stateEl.textContent = 'CRASHED';
    hintEl.textContent = 'GAME OVER · 새 게임을 눌러주세요';
    hintEl.classList.remove('is-hidden');

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(highScoreStorageKey, String(highScore));
      highScoreEl.textContent = String(highScore);
      resultEl.textContent = `NEW BEST · ${score}개의 바이트를 수집했습니다.`;
    } else {
      resultEl.textContent = `PROCESS ENDED · ${score}점 / 최고 기록 ${highScore}점`;
    }
    resultEl.className = 'game-result show failure';
  }

  function resetGame() {
    window.clearTimeout(loopId);
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    loopDelay = 112;
    isPaused = false;
    hasStarted = false;
    isGameOver = false;
    food = generateFood();
    scoreEl.textContent = '0';
    speedEl.textContent = '1.0×';
    stateEl.textContent = 'READY';
    pauseButton.textContent = '일시정지';
    pauseButton.setAttribute('aria-pressed', 'false');
    hintEl.textContent = '방향키 또는 WASD로 시작';
    hintEl.classList.remove('is-hidden');
    resultEl.className = 'game-result';
    draw();
  }

  function handleKey(event) {
    const keyMap = {
      ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
      ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
      ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
      ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
    };
    if (keyMap[event.key]) {
      const activePanel = document.getElementById('game-snake');
      if (activePanel?.hidden) return;
      event.preventDefault();
      setDirection(...keyMap[event.key]);
    }
    if ((event.key === 'p' || event.key === 'P') && !document.getElementById('game-snake')?.hidden) {
      event.preventDefault();
      togglePause();
    }
  }

  document.addEventListener('keydown', handleKey);
  document.addEventListener('arcade:activate', (event) => {
    if (event.detail.panelId !== 'game-snake' && hasStarted && !isGameOver && !isPaused) togglePause();
  });
  directionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const directions = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
      setDirection(...directions[button.dataset.snakeDirection]);
    });
  });
  pauseButton.addEventListener('click', togglePause);
  resetButton.addEventListener('click', resetGame);
  highScoreEl.textContent = String(highScore);
  resetGame();
})();
