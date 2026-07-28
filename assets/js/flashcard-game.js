(function() {
  'use strict';

  const terms = ['RAG', 'LangGraph', 'Docker', 'FastAPI', 'JWT', 'Qdrant', 'Django', 'K8s'];
  const board = document.getElementById('flashcard-board');
  const timerEl = document.getElementById('flashcard-timer');
  const matchesEl = document.getElementById('flashcard-matches');
  const movesEl = document.getElementById('flashcard-moves');
  const bestEl = document.getElementById('flashcard-best');
  const resultEl = document.getElementById('flashcard-result');
  const resetButton = document.getElementById('flashcard-reset');
  const bestStorageKey = 'stackMemoryBestMoves';

  if (!board || !resetButton) return;

  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let startTime = 0;
  let timerId = null;
  let lockBoard = false;
  let hasInitialized = false;

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
    }
    return shuffled;
  }

  function getBest() {
    return Number.parseInt(localStorage.getItem(bestStorageKey), 10) || 0;
  }

  function updateTimer() {
    timerEl.textContent = String(Math.floor((Date.now() - startTime) / 1000));
  }

  function createCard(term, index) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'flashcard';
    card.dataset.term = term;
    card.dataset.cardNumber = String(index + 1).padStart(2, '0');
    card.setAttribute('aria-label', `${index + 1}번 뒤집힌 카드`);
    card.addEventListener('click', () => flipCard(card));
    return card;
  }

  function flipCard(card) {
    if (lockBoard || card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;

    card.classList.add('is-flipped');
    card.setAttribute('aria-label', `${card.dataset.term} 카드`);
    flippedCards.push(card);

    if (flippedCards.length !== 2) return;
    moves += 1;
    movesEl.textContent = String(moves);
    lockBoard = true;
    window.setTimeout(checkPair, 520);
  }

  function checkPair() {
    const [firstCard, secondCard] = flippedCards;
    const isMatch = firstCard.dataset.term === secondCard.dataset.term;

    if (isMatch) {
      firstCard.classList.replace('is-flipped', 'is-matched');
      secondCard.classList.replace('is-flipped', 'is-matched');
      firstCard.disabled = true;
      secondCard.disabled = true;
      matchedPairs += 1;
      matchesEl.textContent = String(matchedPairs);
      if (matchedPairs === terms.length) finishGame();
    } else {
      [firstCard, secondCard].forEach((card) => {
        card.classList.remove('is-flipped');
        card.setAttribute('aria-label', `${card.dataset.cardNumber}번 뒤집힌 카드`);
      });
    }

    flippedCards = [];
    lockBoard = false;
  }

  function finishGame() {
    window.clearInterval(timerId);
    const elapsed = timerEl.textContent;
    const previousBest = getBest();
    if (!previousBest || moves < previousBest) {
      localStorage.setItem(bestStorageKey, String(moves));
      bestEl.textContent = String(moves);
      resultEl.textContent = `NEW BEST · ${elapsed}초 / ${moves}번의 시도로 모든 스택을 연결했습니다.`;
    } else {
      resultEl.textContent = `MEMORY CLEAR · ${elapsed}초 / ${moves}번의 시도`;
    }
    resultEl.className = 'game-result show success';
  }

  function startGame() {
    window.clearInterval(timerId);
    const cards = shuffle(terms.flatMap((term) => [term, term]));
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    lockBoard = false;
    startTime = Date.now();
    timerEl.textContent = '0';
    matchesEl.textContent = '0';
    movesEl.textContent = '0';
    resultEl.className = 'game-result';
    board.innerHTML = '';
    cards.forEach((term, index) => board.appendChild(createCard(term, index)));
    timerId = window.setInterval(updateTimer, 1000);
    hasInitialized = true;
    window.DevArcade?.recordPlay();
  }

  resetButton.addEventListener('click', startGame);
  document.addEventListener('arcade:activate', (event) => {
    if (event.detail.panelId === 'game-memory' && !hasInitialized) startGame();
  });
  bestEl.textContent = getBest() ? String(getBest()) : '—';
})();
