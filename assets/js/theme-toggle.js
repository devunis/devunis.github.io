(function() {
  'use strict';

  // ==================== 
  // 초기 테마 설정
  // ==================== 
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // ==================== 
  // 테마 전환
  // ==================== 
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // 애니메이션 효과
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }

  // ==================== 
  // 토글 버튼 생성
  // ==================== 
  function createToggleButton() {
    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark/light mode');
    
    button.innerHTML = `
      <span class="theme-toggle-icon">
        <i class="fas fa-moon dark-icon"></i>
        <i class="fas fa-sun light-icon"></i>
      </span>
    `;
    
    button.addEventListener('click', toggleTheme);
    document.body.appendChild(button);
  }

  // ==================== 
  // Nav 바 스크롤 효과
  // ==================== 
  function initNavScroll() {
    const masthead = document.querySelector('.masthead');
    if (!masthead) return;
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        masthead.classList.add('scrolled');
      } else {
        masthead.classList.remove('scrolled');
      }
    });
  }

  // ==================== 
  // 부드러운 스크롤
  // ==================== 
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#main') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // ==================== 
  // 시스템 테마 감지 (선택 사항)
  // ==================== 
  function detectSystemTheme() {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }

  // ==================== 
  // 초기화
  // ==================== 
  document.addEventListener('DOMContentLoaded', () => {
    detectSystemTheme();
    initTheme();
    createToggleButton();
    initNavScroll();
    initSmoothScroll();
  });

  // 페이지 로드 전에 테마 적용 (깜빡임 방지)
  initTheme();
})();
