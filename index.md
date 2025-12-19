---
layout: splash
title: "허정윤 | Backend & AI Developer"
permalink: /
header:
  overlay_color: "#000"
  overlay_filter: "0.0"
---

<link rel="stylesheet" href="/assets/css/theme.css">
<link rel="stylesheet" href="/assets/css/landing.css">

<!-- Hero Section -->
<section class="hero-section">
  <div class="particles" id="particles"></div>
  <div class="hero-content">
    <div class="hero-text">
      <h1 class="greeting">안녕하세요 👋</h1>
      <h2 class="name">저는 <span class="highlight">허정윤</span>입니다</h2>
      <div class="typing-container">
        <span class="typing-text" id="typing-text"></span>
        <span class="cursor">|</span>
      </div>
      <p class="description">
        2년 7개월 백엔드 개발 경력 | Spring · Python · AI/RAG 전문가
      </p>
      <div class="hero-buttons">
        <a href="https://github.com/devunis" class="btn-primary" target="_blank">
          <i class="fab fa-github"></i> GitHub
        </a>
        <a href="mailto:gjwjddbsg@gmail.com" class="btn-secondary">
          <i class="fas fa-envelope"></i> Contact
        </a>
        <a href="/posts/" class="btn-secondary">
          <i class="fas fa-blog"></i> Blog
        </a>
      </div>
    </div>
  </div>
  <div class="scroll-indicator">
    <div class="mouse">
      <div class="wheel"></div>
    </div>
    <p>Scroll Down</p>
  </div>
</section>

<!-- Stats Section -->
<section class="stats-section">
  <div class="container">
    <div class="stats-grid">
      <div class="stat-card">
        <!-- Career months: 2021.11 - 2024.05 = 31 months. Update manually as needed -->
        <div class="stat-number" data-target="31">0</div>
        <div class="stat-label">개월 경력</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" data-target="20">0</div>
        <div class="stat-label">병원 API 연동</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" data-target="3">0</div>
        <div class="stat-label">주요 프로젝트</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" data-target="{{ site.posts | size }}">0</div>
        <div class="stat-label">블로그 포스트</div>
      </div>
    </div>
  </div>
</section>

<!-- Tech Stack Section -->
<section class="tech-section">
  <div class="container">
    <h2 class="section-title">💻 기술 스택</h2>
    <div class="tech-grid">
      <div class="tech-card" data-tilt>
        <div class="tech-icon">🐍</div>
        <h3>Python</h3>
        <p>Django · FastAPI</p>
      </div>
      <div class="tech-card" data-tilt>
        <div class="tech-icon">☕</div>
        <h3>Java</h3>
        <p>Spring · MyBatis</p>
      </div>
      <div class="tech-card" data-tilt>
        <div class="tech-icon">🤖</div>
        <h3>AI/RAG</h3>
        <p>LangChain · LangGraph</p>
      </div>
      <div class="tech-card" data-tilt>
        <div class="tech-icon">🗄️</div>
        <h3>Database</h3>
        <p>PostgreSQL · Qdrant</p>
      </div>
      <div class="tech-card" data-tilt>
        <div class="tech-icon">☁️</div>
        <h3>Cloud</h3>
        <p>AWS · Docker</p>
      </div>
      <div class="tech-card" data-tilt>
        <div class="tech-icon">🔧</div>
        <h3>DevOps</h3>
        <p>GitHub Actions · CI/CD</p>
      </div>
    </div>
  </div>
</section>

<!-- Projects Section -->
<section class="projects-section">
  <div class="container">
    <h2 class="section-title">🚀 주요 프로젝트</h2>
    <div class="projects-grid">
      
      <div class="project-card" data-aos="fade-up">
        <div class="project-image">
          <div class="project-overlay">
            <a href="https://github.com/devunis/SenPick" class="project-link" target="_blank">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        <div class="project-content">
          <h3>🛍 SenPick</h3>
          <p class="project-desc">GPT-4o + RAG(Qdrant) 기반 개인 맞춤 선물 추천 시스템</p>
          <div class="project-tags">
            <span class="tag">GPT-4o</span>
            <span class="tag">LangGraph</span>
            <span class="tag">Qdrant</span>
            <span class="tag">RAG</span>
          </div>
          <div class="project-achievement">
            <i class="fas fa-chart-line"></i> CTR 15% 향상
          </div>
        </div>
      </div>

      <div class="project-card" data-aos="fade-up" data-aos-delay="100">
        <div class="project-image">
          <div class="project-overlay">
            <a href="https://github.com/devunis/Travel-Checker" class="project-link" target="_blank">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        <div class="project-content">
          <h3>🧳 Travel Checker</h3>
          <p class="project-desc">Django + Gemma3 + FAISS RAG로 국가별 반입금지 품목 안내</p>
          <div class="project-tags">
            <span class="tag">Django</span>
            <span class="tag">Gemma3</span>
            <span class="tag">FAISS</span>
            <span class="tag">RAG</span>
          </div>
          <div class="project-achievement">
            <i class="fas fa-globe"></i> 10개국 데이터 수집
          </div>
        </div>
      </div>

      <div class="project-card" data-aos="fade-up" data-aos-delay="200">
        <div class="project-image">
          <div class="project-overlay">
            <a href="https://github.com/devunis/tongue-twist" class="project-link" target="_blank">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        <div class="project-content">
          <h3>🎤 Tongue Twist</h3>
          <p class="project-desc">Streamlit + Whisper + GPT-4o 기반 AI 발음 연습 게임</p>
          <div class="project-tags">
            <span class="tag">Streamlit</span>
            <span class="tag">Whisper</span>
            <span class="tag">GPT-4o</span>
            <span class="tag">TTS</span>
          </div>
          <div class="project-achievement">
            <i class="fas fa-microphone"></i> 실시간 발음 평가
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- Experience Section -->
<section class="experience-section">
  <div class="container">
    <h2 class="section-title">💼 경력</h2>
    <div class="timeline">
      
      <div class="timeline-item" data-aos="fade-right">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-date">2021.11 - 2024.05</div>
          <h3>㈜푸른소나무</h3>
          <h4>백엔드 개발자</h4>
          <ul>
            <li>건강기능식품 상담 시스템 2년간 운영 및 유지보수</li>
            <li>Spring · MyBatis · AWS EC2 · MariaDB 기반</li>
            <li>20개 이상 병원과 혈당기 연동 서버 API 개발</li>
            <li>CGMS 대시보드 구축 (대학 연구 과제)</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- GitHub Activity Section -->
<section class="activity-section">
  <div class="container">
    <h2 class="section-title">📊 개발 활동</h2>
    <div class="activity-grid">
      <div class="activity-card" data-aos="zoom-in">
        <img src="https://github-readme-activity-graph.vercel.app/graph?username=devunis&theme=react-dark&hide_border=true&area=true" alt="GitHub Activity" />
      </div>
      <div class="activity-badges">
        <div class="badge-card" data-aos="zoom-in" data-aos-delay="100">
          <a href="https://solved.ac/gjwjddbsg" target="_blank">
            <img src="http://mazassumnida.wtf/api/v2/generate_badge?boj=gjwjddbsg" alt="Solved.ac" />
          </a>
        </div>
        <div class="badge-card" data-aos="zoom-in" data-aos-delay="200">
          <a href="https://leetcode.com/gjwjddbsg/" target="_blank">
            <img src="https://leetcard.jacoblin.cool/gjwjddbsg?theme=dark&ext=activity" alt="LeetCode" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Latest Posts Section -->
<section class="posts-section">
  <div class="container">
    <h2 class="section-title">📝 최신 블로그 글</h2>
    <div class="posts-grid">
      {% for post in site.posts limit:6 %}
      <div class="post-card" data-aos="fade-up">
        <div class="post-date">{{ post.date | date: "%Y.%m.%d" }}</div>
        <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <div class="post-tags">
          {% for tag in post.tags limit:3 %}
          <span class="tag">{{ tag }}</span>
          {% endfor %}
        </div>
      </div>
      {% endfor %}
    </div>
    <div class="text-center" style="margin-top: 30px;">
      <a href="/posts/" class="btn-primary">모든 글 보기 →</a>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta-section">
  <div class="container">
    <div class="cta-content" data-aos="zoom-in">
      <h2>함께 일하고 싶으신가요?</h2>
      <p>백엔드 개발, AI/RAG 시스템, 데이터 파이프라인 구축 프로젝트를 찾고 있습니다.</p>
      <div class="cta-buttons">
        <a href="mailto:gjwjddbsg@gmail.com" class="btn-primary-large">
          <i class="fas fa-envelope"></i> 이메일 보내기
        </a>
        <a href="/about/" class="btn-secondary-large">
          <i class="fas fa-user"></i> 더 알아보기
        </a>
      </div>
    </div>
  </div>
</section>

<script src="/assets/js/landing.js"></script>
