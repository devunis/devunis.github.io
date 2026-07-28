---
layout: splash
title: " "
permalink: /
---

<link rel="stylesheet" href="/assets/css/landing.css">

<main class="portfolio-home">
  <section class="home-hero" aria-labelledby="home-title">
    <div class="home-shell home-hero-grid">
      <div class="home-hero-copy">
        <p class="home-kicker"><span aria-hidden="true"></span> Backend &amp; AI Developer</p>
        <h1 id="home-title">
          복잡한 기술을<br>
          <em>쓸 수 있는 제품</em>으로 만듭니다.
        </h1>
        <p class="home-intro">
          Java Spring 기반 헬스케어 백엔드 경험 위에 Python과 AI를 연결합니다.
          안정적인 API부터 RAG·에이전트 서비스, 배포까지 한 흐름으로 설계합니다.
        </p>
        <div class="home-actions">
          <a class="home-button home-button--primary" href="#selected-work">
            대표 프로젝트 보기 <span aria-hidden="true">↘</span>
          </a>
          <a class="home-button home-button--ghost" href="https://github.com/devunis" target="_blank" rel="noopener noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl class="home-quick-facts" aria-label="주요 경력 수치">
          <div>
            <dt>2년 7개월</dt>
            <dd>백엔드 실무 경력</dd>
          </div>
          <div>
            <dt>20+</dt>
            <dd>병원 시스템 연동</dd>
          </div>
          <div>
            <dt>{{ site.posts | size }}</dt>
            <dd>기술 아티클</dd>
          </div>
        </dl>
      </div>

      <aside class="home-profile-card" aria-label="개발자 프로필">
        <div class="home-card-bar">
          <span><i aria-hidden="true"></i> profile.json</span>
          <span>SEOUL · KR</span>
        </div>
        <div class="home-profile-main">
          <img src="/assets/images/avatar.png" alt="노트북으로 개발하는 허정윤의 픽셀 아트 아바타">
          <div>
            <p class="home-overline">HELLO, I’M</p>
            <h2>허정윤</h2>
            <p>Backend &amp; AI Developer</p>
          </div>
        </div>
        <div class="home-capability-list">
          <div><span>01</span><strong>Backend Systems</strong><small>Spring · Django · FastAPI</small></div>
          <div><span>02</span><strong>AI Products</strong><small>RAG · LangGraph · Vision</small></div>
          <div><span>03</span><strong>Cloud Delivery</strong><small>AWS · Docker · CI/CD</small></div>
        </div>
        <div class="home-current-work">
          <span>CURRENTLY EXPLORING</span>
          <strong>실시간 Computer Vision 서비스</strong>
        </div>
      </aside>
    </div>
  </section>

  <section class="home-focus" aria-labelledby="focus-title">
    <div class="home-shell">
      <header class="home-section-heading home-section-heading--compact">
        <div>
          <p class="home-section-label">HOW I WORK</p>
          <h2 id="focus-title">기술보다 문제를 먼저 봅니다.</h2>
        </div>
        <p>서비스의 맥락을 이해하고, 운영 가능한 구조로 끝까지 연결하는 개발을 지향합니다.</p>
      </header>

      <div class="home-focus-grid">
        <article>
          <span class="home-focus-number">01</span>
          <h3>견고한 백엔드</h3>
          <p>도메인과 데이터 흐름을 먼저 정리하고, 유지보수 가능한 API와 서버 구조를 설계합니다.</p>
        </article>
        <article>
          <span class="home-focus-number">02</span>
          <h3>검증 가능한 AI</h3>
          <p>모델 호출에 그치지 않고 검색 품질, 응답 안정성, 사용자 경험을 함께 설계합니다.</p>
        </article>
        <article>
          <span class="home-focus-number">03</span>
          <h3>운영까지 한 흐름</h3>
          <p>데이터 수집부터 배포와 관찰까지, 실제로 계속 사용할 수 있는 제품을 만듭니다.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="home-work" id="selected-work" aria-labelledby="work-title">
    <div class="home-shell">
      <header class="home-section-heading">
        <div>
          <p class="home-section-label">SELECTED WORK</p>
          <h2 id="work-title">문제를 해결한 방식이<br>드러나는 작업들.</h2>
        </div>
        <p>백엔드, AI, 데이터가 만나는 지점에서 만든 대표 프로젝트입니다.</p>
      </header>

      <div class="home-project-grid">
        <article class="home-project home-project--featured">
          <div class="home-project-visual home-vision-visual" aria-hidden="true">
            <span class="home-vision-ring home-vision-ring--one"></span>
            <span class="home-vision-ring home-vision-ring--two"></span>
            <span class="home-vision-cross">+</span>
            <strong>VISION<br>ANALYZER</strong>
            <small>ON-DEVICE · REAL-TIME</small>
          </div>
          <div class="home-project-copy">
            <div class="home-project-meta"><span>01 · 2026</span><span>Computer Vision</span></div>
            <h3>Vision Analyzer</h3>
            <p>카메라와 영상에서 사물·표정·손짓을 실시간 분석하는 브라우저 기반 도구입니다. 서버 업로드 없이 온디바이스로 처리합니다.</p>
            <ul class="home-tags" aria-label="사용 기술">
              <li>MediaPipe</li><li>TensorFlow Lite</li><li>Canvas API</li>
            </ul>
            <a href="https://github.com/devunis" target="_blank" rel="noopener noreferrer">GitHub 프로필에서 보기 <span aria-hidden="true">↗</span></a>
          </div>
        </article>

        <article class="home-project">
          <div class="home-project-visual home-project-visual--image home-project-visual--senpick">
            <img src="/assets/images/project-senpick.png" alt="" loading="lazy">
          </div>
          <div class="home-project-copy">
            <div class="home-project-meta"><span>02 · 2025</span><span>LLM Product</span></div>
            <h3>SenPick</h3>
            <p>사용자의 취향과 상황을 이해해 선물을 제안하는 GPT-4o·RAG 기반 개인화 추천 서비스입니다.</p>
            <ul class="home-tags" aria-label="사용 기술">
              <li>LangGraph</li><li>Qdrant</li><li>RAG</li>
            </ul>
            <a href="https://github.com/devunis/Senpick" target="_blank" rel="noopener noreferrer">프로젝트 보기 <span aria-hidden="true">↗</span></a>
          </div>
        </article>

        <article class="home-project">
          <div class="home-project-visual home-project-visual--image home-project-visual--travel">
            <img src="/assets/images/project-travel.png" alt="" loading="lazy">
          </div>
          <div class="home-project-copy">
            <div class="home-project-meta"><span>03 · 2025</span><span>RAG Service</span></div>
            <h3>Travel Checker</h3>
            <p>국가별 반입금지 품목을 빠르게 확인할 수 있도록 공공데이터와 FAISS 검색을 연결한 여행 안내 서비스입니다.</p>
            <ul class="home-tags" aria-label="사용 기술">
              <li>Django</li><li>Gemma 3</li><li>FAISS</li>
            </ul>
            <a href="https://github.com/devunis/travel-checker" target="_blank" rel="noopener noreferrer">프로젝트 보기 <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>

      <div class="home-more-link">
        <a href="/projects/">전체 프로젝트 살펴보기 <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="home-experience" aria-labelledby="experience-title">
    <div class="home-shell home-experience-grid">
      <header>
        <p class="home-section-label">EXPERIENCE</p>
        <h2 id="experience-title">실제 운영 환경에서<br>배운 것들.</h2>
        <p>헬스케어 도메인에서 데이터의 정확성과 서비스의 연속성을 지키는 개발을 경험했습니다.</p>
      </header>

      <article class="home-experience-card">
        <div class="home-experience-top">
          <div>
            <span>2021.11 — 2024.05</span>
            <h3>㈜푸른소나무</h3>
            <p>Backend Developer</p>
          </div>
          <strong>2Y 7M</strong>
        </div>
        <ul>
          <li><span>01</span>건강기능식품 상담 시스템 운영 및 성능 개선</li>
          <li><span>02</span>20개 이상 병원·혈당기 연동 API 개발</li>
          <li><span>03</span>CGMS 연구 대시보드 서버와 UI 구축</li>
          <li><span>04</span>AWS EC2·Docker 기반 서비스 배포와 운영</li>
        </ul>
      </article>
    </div>
  </section>

  <section class="home-writing" aria-labelledby="writing-title">
    <div class="home-shell">
      <header class="home-section-heading">
        <div>
          <p class="home-section-label">WRITING</p>
          <h2 id="writing-title">배운 것을<br>내 언어로 정리합니다.</h2>
        </div>
        <a class="home-text-link" href="/posts/">모든 글 보기 <span aria-hidden="true">→</span></a>
      </header>

      <div class="home-post-grid">
        {% for post in site.posts limit:3 %}
        <article>
          <div class="home-post-meta">
            <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y.%m.%d" }}</time>
            {% if post.tags.first %}<span>{{ post.tags.first }}</span>{% endif %}
          </div>
          <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
          <p>{{ post.excerpt | strip_html | strip_newlines | truncate: 115 }}</p>
          <a class="home-post-link" href="{{ post.url | relative_url }}" aria-label="{{ post.title }} 읽기">Read article <span aria-hidden="true">↗</span></a>
        </article>
        {% endfor %}
      </div>
    </div>
  </section>

  <section class="home-contact" aria-labelledby="contact-title">
    <div class="home-shell">
      <div class="home-contact-card">
        <p class="home-section-label">LET’S BUILD SOMETHING USEFUL</p>
        <h2 id="contact-title">좋은 아이디어를<br>작동하는 서비스로.</h2>
        <p>백엔드와 AI가 만나는 제품에 대해 함께 이야기하고 싶습니다.</p>
        <a class="home-button home-button--light" href="mailto:gjwjddbsg@gmail.com">
          이메일 보내기 <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  </section>
</main>
