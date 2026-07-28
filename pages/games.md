---
layout: splash
title: "Developer Arcade"
permalink: /games/
---

<link rel="stylesheet" href="/assets/css/games.css">

<main class="arcade-page">
  <section class="arcade-hero">
    <div class="arcade-shell">
      <div class="arcade-hero-top">
        <a href="/" class="arcade-back"><span aria-hidden="true">←</span> PORTFOLIO</a>
        <span class="arcade-build"><i aria-hidden="true"></i> BUILD 04 · VANILLA JS</span>
      </div>
      <div class="arcade-hero-grid">
        <div>
          <p class="arcade-kicker">SIDE QUEST / DEV ARCADE</p>
          <h1>짧게 몰입하고,<br><em>감각을 깨우는</em> 플레이.</h1>
        </div>
        <div class="arcade-hero-copy">
          <p>설치도 로그인도 없습니다. 집중력, 기억력, 반응 속도를 테스트하는 네 가지 미니 게임을 브라우저에서 바로 즐겨보세요.</p>
          <dl>
            <div><dt>04</dt><dd>PLAYABLE GAMES</dd></div>
            <div><dt id="arcade-total-plays">0</dt><dd>LOCAL PLAYS</dd></div>
            <div><dt>0KB</dt><dd>GAME ENGINE</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <section class="arcade-station" aria-labelledby="arcade-select-title">
    <div class="arcade-shell">
      <div class="arcade-section-heading">
        <div>
          <p>CHOOSE A CHALLENGE</p>
          <h2 id="arcade-select-title">오늘의 플레이를 선택하세요.</h2>
        </div>
        <span>기록은 이 브라우저에만 저장됩니다.</span>
      </div>

      <div class="arcade-selector" role="tablist" aria-label="게임 선택">
        <button type="button" class="arcade-selector-card is-active" id="tab-color" role="tab" aria-selected="true" aria-controls="game-color" data-game-target="game-color">
          <span class="arcade-selector-index">01</span>
          <strong>CHROMA<br>SCAN</strong>
          <small>다른 색 찾기</small>
          <i aria-hidden="true">NEW</i>
        </button>
        <button type="button" class="arcade-selector-card" id="tab-memory" role="tab" aria-selected="false" aria-controls="game-memory" data-game-target="game-memory">
          <span class="arcade-selector-index">02</span>
          <strong>STACK<br>MEMORY</strong>
          <small>개발 용어 매칭</small>
        </button>
        <button type="button" class="arcade-selector-card" id="tab-snake" role="tab" aria-selected="false" aria-controls="game-snake" data-game-target="game-snake">
          <span class="arcade-selector-index">03</span>
          <strong>BYTE<br>SNAKE</strong>
          <small>방향 감각 테스트</small>
        </button>
        <button type="button" class="arcade-selector-card" id="tab-flappy" role="tab" aria-selected="false" aria-controls="game-flappy" data-game-target="game-flappy">
          <span class="arcade-selector-index">04</span>
          <strong>BUG<br>ESCAPE</strong>
          <small>반응 속도 테스트</small>
        </button>
      </div>

      <div class="arcade-console">
        <div class="arcade-console-bar">
          <div><span></span><span></span><span></span></div>
          <p><i aria-hidden="true"></i> ARCADE SESSION ACTIVE</p>
          <span>ESC TO MENU</span>
        </div>

        <section class="game-panel is-active" id="game-color" role="tabpanel" aria-labelledby="tab-color" tabindex="-1">
          <div class="game-panel-head">
            <div>
              <p class="game-code">GAME_01 / VISUAL PERCEPTION</p>
              <h2>Chroma Scan</h2>
              <p>같은 색처럼 보이는 카드 사이에서 미세하게 다른 하나를 찾으세요. 연속 정답을 맞히면 그리드가 커지고 색 차이는 줄어듭니다.</p>
            </div>
            <button type="button" id="color-start" class="arcade-button arcade-button--primary">게임 시작 <span aria-hidden="true">↗</span></button>
          </div>
          <div class="game-metrics" aria-label="Chroma Scan 게임 현황">
            <div><span>SCORE</span><strong id="color-score">0</strong></div>
            <div><span>TIME</span><strong><b id="color-time">30</b>s</strong></div>
            <div><span>STREAK</span><strong id="color-streak">0</strong></div>
            <div><span>BEST</span><strong id="color-best">0</strong></div>
          </div>
          <div class="color-stage">
            <div class="color-stage-top">
              <p id="color-level-label">READY · START 버튼을 눌러주세요</p>
              <p id="color-feedback" aria-live="polite">색상 차이를 감지할 준비가 됐나요?</p>
            </div>
            <div id="color-board" class="color-board is-idle" aria-label="다른 색 카드 찾기 게임 보드"></div>
          </div>
          <div id="color-result" class="game-result" aria-live="polite"></div>
        </section>

        <section class="game-panel" id="game-memory" role="tabpanel" aria-labelledby="tab-memory" tabindex="-1" hidden>
          <div class="game-panel-head">
            <div>
              <p class="game-code">GAME_02 / WORKING MEMORY</p>
              <h2>Stack Memory</h2>
              <p>뒤집힌 카드의 위치를 기억하고 같은 개발 스택을 연결하세요. 적은 시도와 빠른 시간이 좋은 기록입니다.</p>
            </div>
            <button type="button" id="flashcard-reset" class="arcade-button arcade-button--primary">새 게임 <span aria-hidden="true">↻</span></button>
          </div>
          <div class="game-metrics" aria-label="Stack Memory 게임 현황">
            <div><span>TIME</span><strong><b id="flashcard-timer">0</b>s</strong></div>
            <div><span>MATCH</span><strong><b id="flashcard-matches">0</b>/8</strong></div>
            <div><span>MOVES</span><strong id="flashcard-moves">0</strong></div>
            <div><span>BEST</span><strong id="flashcard-best">—</strong></div>
          </div>
          <div id="flashcard-board" class="flashcard-board" aria-label="개발 용어 카드 매칭 보드"></div>
          <div id="flashcard-result" class="game-result" aria-live="polite"></div>
        </section>

        <section class="game-panel" id="game-snake" role="tabpanel" aria-labelledby="tab-snake" tabindex="-1" hidden>
          <div class="game-panel-head">
            <div>
              <p class="game-code">GAME_03 / SPATIAL CONTROL</p>
              <h2>Byte Snake</h2>
              <p>데이터 바이트를 수집하며 길어지는 스네이크를 제어하세요. 방향키와 WASD, 모바일 패드를 모두 지원합니다.</p>
            </div>
            <div class="game-head-actions">
              <button type="button" id="snake-pause" class="arcade-button" aria-pressed="false">일시정지</button>
              <button type="button" id="snake-reset" class="arcade-button arcade-button--primary">새 게임 <span aria-hidden="true">↻</span></button>
            </div>
          </div>
          <div class="game-metrics" aria-label="Byte Snake 게임 현황">
            <div><span>SCORE</span><strong id="snake-score">0</strong></div>
            <div><span>BEST</span><strong id="snake-high-score">0</strong></div>
            <div><span>SPEED</span><strong id="snake-speed">1.0×</strong></div>
            <div><span>STATE</span><strong id="snake-state">READY</strong></div>
          </div>
          <div class="canvas-stage">
            <canvas id="snake-canvas" width="480" height="480" aria-label="Byte Snake 게임 화면"></canvas>
            <div class="canvas-hint" id="snake-hint">방향키 또는 WASD로 시작</div>
          </div>
          <div class="mobile-dpad" aria-label="모바일 방향 조작">
            <button type="button" data-snake-direction="up" aria-label="위">↑</button>
            <button type="button" data-snake-direction="left" aria-label="왼쪽">←</button>
            <button type="button" data-snake-direction="down" aria-label="아래">↓</button>
            <button type="button" data-snake-direction="right" aria-label="오른쪽">→</button>
          </div>
          <div id="snake-result" class="game-result" aria-live="polite"></div>
        </section>

        <section class="game-panel" id="game-flappy" role="tabpanel" aria-labelledby="tab-flappy" tabindex="-1" hidden>
          <div class="game-panel-head">
            <div>
              <p class="game-code">GAME_04 / REACTION CONTROL</p>
              <h2>Bug Escape</h2>
              <p>배포 파이프라인을 막는 버그 사이를 통과하세요. 스페이스바나 화면 터치로 점프할 수 있습니다.</p>
            </div>
            <button type="button" id="flappy-reset" class="arcade-button arcade-button--primary">새 게임 <span aria-hidden="true">↻</span></button>
          </div>
          <div class="game-metrics" aria-label="Bug Escape 게임 현황">
            <div><span>SCORE</span><strong id="flappy-score">0</strong></div>
            <div><span>BEST</span><strong id="flappy-high-score">0</strong></div>
            <div><span>LEVEL</span><strong id="flappy-level">01</strong></div>
            <div><span>STATE</span><strong id="flappy-state">READY</strong></div>
          </div>
          <div class="canvas-stage canvas-stage--flappy">
            <canvas id="flappy-canvas" width="480" height="560" aria-label="Bug Escape 게임 화면"></canvas>
            <button type="button" class="canvas-hint canvas-hint--button" id="flappy-hint">SPACE 또는 TAP으로 시작</button>
          </div>
          <div id="flappy-result" class="game-result" aria-live="polite"></div>
        </section>
      </div>
    </div>
  </section>

  <section class="arcade-tech">
    <div class="arcade-shell">
      <p>BUILT WITHOUT A GAME ENGINE</p>
      <div>
        <span>CANVAS 2D</span>
        <span>VANILLA JAVASCRIPT</span>
        <span>LOCAL STORAGE</span>
        <span>TOUCH + KEYBOARD</span>
      </div>
      <a href="/projects/">프로젝트 더 보기 <span aria-hidden="true">→</span></a>
    </div>
  </section>
</main>

<script src="/assets/js/arcade.js"></script>
<script src="/assets/js/color-game.js"></script>
<script src="/assets/js/flashcard-game.js"></script>
<script src="/assets/js/snake-game.js"></script>
<script src="/assets/js/flappy-game.js"></script>
