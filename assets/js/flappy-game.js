(function() {
  'use strict';

  const canvas = document.getElementById('flappy-canvas');
  const scoreEl = document.getElementById('flappy-score');
  const highScoreEl = document.getElementById('flappy-high-score');
  const levelEl = document.getElementById('flappy-level');
  const stateEl = document.getElementById('flappy-state');
  const resultEl = document.getElementById('flappy-result');
  const hintButton = document.getElementById('flappy-hint');
  const resetButton = document.getElementById('flappy-reset');
  const highScoreStorageKey = 'bugEscapeHighScore';

  if (!canvas || !resetButton) return;

  const context = canvas.getContext('2d');
  const gravity = .42;
  const jumpPower = -7.6;
  const pipeWidth = 58;
  const baseGap = 164;
  let player = { x: 82, y: 260, velocity: 0, radius: 14 };
  let pipes = [];
  let particles = [];
  let score = 0;
  let highScore = Number.parseInt(localStorage.getItem(highScoreStorageKey), 10) || 0;
  let frameId = null;
  let frameCount = 0;
  let isRunning = false;
  let isGameOver = false;

  function currentLevel() {
    return Math.floor(score / 5) + 1;
  }

  function currentSpeed() {
    return Math.min(4.2, 2.15 + currentLevel() * .18);
  }

  function currentGap() {
    return Math.max(122, baseGap - currentLevel() * 5);
  }

  function addPipe() {
    const gap = currentGap();
    const margin = 72;
    const topHeight = margin + Math.random() * (canvas.height - gap - margin * 2);
    pipes.push({ x: canvas.width + 20, topHeight, gap, passed: false });
  }

  function addJumpParticles() {
    for (let index = 0; index < 5; index += 1) {
      particles.push({
        x: player.x - 10,
        y: player.y + (Math.random() - .5) * 12,
        vx: -1.5 - Math.random(),
        vy: (Math.random() - .5) * 1.2,
        life: 20
      });
    }
  }

  function drawBackground() {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#101931');
    gradient.addColorStop(1, '#090c12');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.strokeStyle = 'rgba(135, 160, 255, .07)';
    context.lineWidth = 1;
    for (let y = 40; y < canvas.height; y += 48) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
  }

  function drawPlayer() {
    context.save();
    context.translate(player.x, player.y);
    context.rotate(Math.max(-.35, Math.min(.75, player.velocity * .055)));
    context.fillStyle = '#ffd66d';
    context.shadowColor = 'rgba(255, 214, 109, .55)';
    context.shadowBlur = 14;
    context.beginPath();
    context.arc(0, 0, player.radius, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.fillStyle = '#0b0e14';
    context.fillRect(-5, -3, 10, 6);
    context.fillStyle = '#ffd66d';
    context.font = '700 9px Fira Code';
    context.textAlign = 'center';
    context.fillText('DEV', 0, 3);
    context.restore();
  }

  function drawPipes() {
    pipes.forEach((pipe) => {
      const gradient = context.createLinearGradient(pipe.x, 0, pipe.x + pipeWidth, 0);
      gradient.addColorStop(0, '#684fe0');
      gradient.addColorStop(1, '#87a0ff');
      context.fillStyle = gradient;
      context.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
      context.fillRect(pipe.x, pipe.topHeight + pipe.gap, pipeWidth, canvas.height);

      context.fillStyle = 'rgba(255, 255, 255, .2)';
      context.fillRect(pipe.x + 9, 0, 2, pipe.topHeight);
      context.fillRect(pipe.x + 9, pipe.topHeight + pipe.gap, 2, canvas.height);
    });
  }

  function drawParticles() {
    particles.forEach((particle) => {
      context.fillStyle = `rgba(135, 160, 255, ${particle.life / 20})`;
      context.fillRect(particle.x, particle.y, 4, 2);
    });
  }

  function draw() {
    drawBackground();
    drawPipes();
    drawParticles();
    drawPlayer();
  }

  function update() {
    if (!isRunning || isGameOver) return;
    frameCount += 1;
    player.velocity += gravity;
    player.y += player.velocity;

    pipes.forEach((pipe) => {
      pipe.x -= currentSpeed();
      const overlapsX = player.x + player.radius > pipe.x && player.x - player.radius < pipe.x + pipeWidth;
      const hitsPipe = overlapsX && (
        player.y - player.radius < pipe.topHeight ||
        player.y + player.radius > pipe.topHeight + pipe.gap
      );
      if (hitsPipe) endGame();

      if (!pipe.passed && pipe.x + pipeWidth < player.x) {
        pipe.passed = true;
        score += 1;
        scoreEl.textContent = String(score);
        levelEl.textContent = String(currentLevel()).padStart(2, '0');
      }
    });

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
    });
    particles = particles.filter((particle) => particle.life > 0);
    pipes = pipes.filter((pipe) => pipe.x + pipeWidth > -10);

    if (!pipes.length || pipes[pipes.length - 1].x < canvas.width - 210) addPipe();
    if (player.y - player.radius <= 0 || player.y + player.radius >= canvas.height) endGame();

    draw();
    if (!isGameOver) frameId = window.requestAnimationFrame(update);
  }

  function jump() {
    if (document.getElementById('game-flappy')?.hidden) return;
    if (isGameOver) return;
    if (!isRunning) {
      isRunning = true;
      stateEl.textContent = 'RUNNING';
      hintButton.classList.add('is-hidden');
      window.DevArcade?.recordPlay();
      frameId = window.requestAnimationFrame(update);
    }
    player.velocity = jumpPower;
    addJumpParticles();
  }

  function endGame() {
    if (isGameOver) return;
    isGameOver = true;
    isRunning = false;
    window.cancelAnimationFrame(frameId);
    stateEl.textContent = 'CRASHED';
    hintButton.textContent = 'GAME OVER · 새 게임을 눌러주세요';
    hintButton.classList.remove('is-hidden');

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(highScoreStorageKey, String(highScore));
      highScoreEl.textContent = String(highScore);
      resultEl.textContent = `NEW BEST · ${score}개의 버그 게이트를 통과했습니다.`;
    } else {
      resultEl.textContent = `DEPLOY FAILED · ${score}점 / 최고 기록 ${highScore}점`;
    }
    resultEl.className = 'game-result show failure';
  }

  function resetGame() {
    window.cancelAnimationFrame(frameId);
    player = { x: 82, y: 260, velocity: 0, radius: 14 };
    pipes = [];
    particles = [];
    score = 0;
    frameCount = 0;
    isRunning = false;
    isGameOver = false;
    scoreEl.textContent = '0';
    levelEl.textContent = '01';
    stateEl.textContent = 'READY';
    hintButton.textContent = 'SPACE 또는 TAP으로 시작';
    hintButton.classList.remove('is-hidden');
    resultEl.className = 'game-result';
    addPipe();
    draw();
  }

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !document.getElementById('game-flappy')?.hidden) {
      event.preventDefault();
      jump();
    }
  });
  document.addEventListener('arcade:activate', (event) => {
    if (event.detail.panelId !== 'game-flappy' && isRunning) {
      isRunning = false;
      window.cancelAnimationFrame(frameId);
      stateEl.textContent = 'PAUSED';
      hintButton.textContent = 'TAP TO RESUME';
      hintButton.classList.remove('is-hidden');
    }
  });
  canvas.addEventListener('pointerdown', jump);
  hintButton.addEventListener('click', jump);
  resetButton.addEventListener('click', resetGame);
  highScoreEl.textContent = String(highScore);
  resetGame();
})();
