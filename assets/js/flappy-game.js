(function() {
  const canvas = document.getElementById('flappy-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('flappy-score');
  const highScoreEl = document.getElementById('flappy-high-score');
  const resultEl = document.getElementById('flappy-result');
  const resetBtn = document.getElementById('flappy-reset');

  let bird = { x: 50, y: 200, velocity: 0, radius: 15 };
  let pipes = [];
  let score = 0;
  let highScore = parseInt(localStorage.getItem('flappyHighScore')) || 0;
  let gameLoop = null;
  let isGameOver = false;

  const gravity = 0.5;
  const jump = -10;
  const pipeWidth = 50;
  const pipeGap = 150;
  const pipeSpeed = 2;

  highScoreEl.textContent = highScore;

  function initGame() {
    bird = { x: 50, y: 200, velocity: 0, radius: 15 };
    pipes = [];
    score = 0;
    isGameOver = false;
    scoreEl.textContent = '0';
    resultEl.classList.remove('show', 'failure');
    
    if (gameLoop) cancelAnimationFrame(gameLoop);
    addPipe();
    gameLoop = requestAnimationFrame(update);
  }

  function update() {
    if (isGameOver) return;

    // 새 움직임
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // 바닥/천장 충돌
    if (bird.y + bird.radius >= canvas.height || bird.y - bird.radius <= 0) {
      gameOver();
      return;
    }

    // 파이프 움직임
    pipes.forEach(pipe => {
      pipe.x -= pipeSpeed;

      // 충돌 감지
      if (bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + pipeWidth) {
        if (bird.y - bird.radius < pipe.topHeight || bird.y + bird.radius > pipe.topHeight + pipeGap) {
          gameOver();
          return;
        }
      }

      // 점수
      if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
        pipe.passed = true;
        score++;
        scoreEl.textContent = score;
      }
    });

    // 파이프 제거 및 추가
    pipes = pipes.filter(pipe => pipe.x + pipeWidth > 0);
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
      addPipe();
    }

    draw();
    gameLoop = requestAnimationFrame(update);
  }

  function draw() {
    // 배경
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 새
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    // 파이프
    ctx.fillStyle = '#2ecc71';
    pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
      ctx.fillRect(pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height);
    });
  }

  function addPipe() {
    const topHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({ x: canvas.width, topHeight, passed: false });
  }

  function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoop);
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('flappyHighScore', highScore);
      highScoreEl.textContent = highScore;
      resultEl.textContent = `🎉 신기록! ${score}점`;
    } else {
      resultEl.textContent = `게임 오버! 점수: ${score}점`;
    }
    
    resultEl.classList.add('show', 'failure');
  }

  function handleJump() {
    if (!isGameOver) {
      bird.velocity = jump;
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleJump();
    }
  });

  canvas.addEventListener('click', handleJump);

  resetBtn.addEventListener('click', initGame);
  initGame();
})();
