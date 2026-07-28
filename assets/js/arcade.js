(function() {
  'use strict';

  const tabs = Array.from(document.querySelectorAll('[data-game-target]'));
  const panels = Array.from(document.querySelectorAll('.game-panel'));
  const totalPlaysEl = document.getElementById('arcade-total-plays');
  const storageKey = 'devArcadeTotalPlays';

  function getTotalPlays() {
    return Number.parseInt(localStorage.getItem(storageKey), 10) || 0;
  }

  function updateTotalPlays() {
    if (totalPlaysEl) totalPlaysEl.textContent = String(getTotalPlays());
  }

  function activateGame(panelId, updateHash) {
    const nextPanel = document.getElementById(panelId);
    const nextTab = tabs.find((tab) => tab.dataset.gameTarget === panelId);
    if (!nextPanel || !nextTab) return;

    tabs.forEach((tab) => {
      const isActive = tab === nextTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel === nextPanel;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });

    if (updateHash && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${panelId}`);
    }

    document.dispatchEvent(new CustomEvent('arcade:activate', {
      detail: { panelId }
    }));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateGame(tab.dataset.gameTarget, true);
      window.requestAnimationFrame(() => {
        document.getElementById(tab.dataset.gameTarget)?.focus({ preventScroll: true });
      });
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateGame(tabs[nextIndex].dataset.gameTarget, true);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    document.querySelector('.arcade-selector')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center'
    });
  });

  window.DevArcade = {
    recordPlay() {
      localStorage.setItem(storageKey, String(getTotalPlays() + 1));
      updateTotalPlays();
    },
    activateGame
  };

  const hashTarget = window.location.hash.replace('#', '');
  if (panels.some((panel) => panel.id === hashTarget)) {
    activateGame(hashTarget, false);
  } else {
    activateGame('game-color', false);
  }
  updateTotalPlays();
})();
