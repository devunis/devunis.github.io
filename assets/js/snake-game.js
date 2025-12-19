(function() {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('snake-score');
  const highScoreEl = document.getElementById('snake-high-score');
  const resultEl = document.getElementById('snake-result');
  const resetBtn = document.getElementById('snake-reset');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let snake = [{x: 10, y: 10}];
  let food = {x: 15, y: 15};
  let dx = 0;
  let dy = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
  let gameLoop = null;

  highScoreEl.textContent = highScore;

  function initGame() {
    snake = [{x: 10, y: 10}];
    food = generateFood();
    dx = 0;
    dy = 0;
    score = 0;
    scoreEl.textContent = '0';
    resultEl.classList.remove('show', 'failure');
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, 100);
  }

  function update() {
    if (dx === 0 && dy === 0) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};

    // 벽 충돌
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }

    // 자기 몸 충돌
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    // 먹이 먹기
    if (head.x === food.x && head.y === food.y) {
      score++;
      scoreEl.textContent = score;
      food = generateFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    // 배경
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 뱀
    ctx.fillStyle = '#2ecc71';
    snake.forEach((segment, index) => {
      if (index === 0) ctx.fillStyle = '#27ae60'; // 머리
      else ctx.fillStyle = '#2ecc71';
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // 먹이
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  }

  function generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }

  function gameOver() {
    clearInterval(gameLoop);
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('snakeHighScore', highScore);
      highScoreEl.textContent = highScore;
      resultEl.textContent = `🎉 신기록! ${score}점`;
    } else {
      resultEl.textContent = `게임 오버! 점수: ${score}점`;
    }
    
    resultEl.classList.add('show', 'failure');
  }

  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case 'ArrowUp':
        if (dy === 0) { dx = 0; dy = -1; }
        break;
      case 'ArrowDown':
        if (dy === 0) { dx = 0; dy = 1; }
        break;
      case 'ArrowLeft':
        if (dx === 0) { dx = -1; dy = 0; }
        break;
      case 'ArrowRight':
        if (dx === 0) { dx = 1; dy = 0; }
        break;
    }
    e.preventDefault();
  });

  resetBtn.addEventListener('click', initGame);
  initGame();
  draw();
})();
