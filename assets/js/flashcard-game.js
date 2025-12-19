(function() {
  const terms = [
    'RAG', 'RAG',
    'LangGraph', 'LangGraph',
    'Docker', 'Docker',
    'FastAPI', 'FastAPI',
    'JWT', 'JWT',
    'Qdrant', 'Qdrant',
    'Django', 'Django',
    'Kubernetes', 'Kubernetes'
  ];

  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let startTime = null;
  let timerInterval = null;

  const board = document.getElementById('flashcard-board');
  const timerEl = document.getElementById('flashcard-timer');
  const matchesEl = document.getElementById('flashcard-matches');
  const movesEl = document.getElementById('flashcard-moves');
  const resultEl = document.getElementById('flashcard-result');
  const resetBtn = document.getElementById('flashcard-reset');

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function initGame() {
    cards = shuffle([...terms]);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    startTime = Date.now();
    
    matchesEl.textContent = '0';
    movesEl.textContent = '0';
    timerEl.textContent = '0';
    resultEl.classList.remove('show', 'success');
    
    board.innerHTML = '';
    cards.forEach((term, index) => {
      const card = document.createElement('div');
      card.className = 'flashcard';
      card.dataset.index = index;
      card.dataset.term = term;
      card.textContent = '?';
      card.addEventListener('click', flipCard);
      board.appendChild(card);
    });

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = elapsed;
  }

  function flipCard(e) {
    const card = e.target;
    if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length === 2) {
      return;
    }

    card.classList.add('flipped');
    card.textContent = card.dataset.term;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      moves++;
      movesEl.textContent = moves;
      setTimeout(checkMatch, 800);
    }
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.term === card2.dataset.term) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      matchedPairs++;
      matchesEl.textContent = matchedPairs;

      if (matchedPairs === 8) {
        endGame();
      }
    } else {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      card1.textContent = '?';
      card2.textContent = '?';
    }

    flippedCards = [];
  }

  function endGame() {
    clearInterval(timerInterval);
    const time = timerEl.textContent;
    resultEl.textContent = `🎉 완료! ${time}초, ${moves}번 시도`;
    resultEl.classList.add('show', 'success');
  }

  resetBtn.addEventListener('click', initGame);
  initGame();
})();
