---
layout: splash
title: "안녕하세요, 허정윤입니다"
header:
  overlay_color: "#000"
  overlay_filter: "0.35"
  overlay_image: /assets/img/hero.webp   # 없으면 나중에 추가
  actions:
    - label: "GitHub"
      url: "https://github.com/devunis"
    - label: "이메일"
      url: "mailto:gjwjddbsg@gmail.com"
excerpt: "Backend & AI Developer — Java Spring · Python · RAG · 멀티에이전트 · AWS"
feature_row:
  - image_path: /assets/img/project-senpick.webp
    alt: "SenPick"
    title: "🛍 SenPick"
    excerpt: "개인 선물 추천 AI — GPT-4o + RAG(Qdrant)로 취향·상황 기반 추천, CTR 15%↑"
    url: "https://github.com/devunis/SenPick"
    btn_label: "코드 보기"
    btn_class: "btn--primary"
  - image_path: /assets/img/project-travel.webp
    alt: "Travel Checker"
    title: "🧳 Travel Checker"
    excerpt: "여행 반입금지 품목 챗봇 — Django + Gemma3 + FAISS RAG"
    url: "https://github.com/devunis/Travel-Checker"
    btn_label: "코드 보기"
    btn_class: "btn--primary"
---

{% include feature_row %}

## 📝 최신 글
{% for post in site.posts limit:3 %}
- [{{ post.title }}]({{ post.url }}) <small>— {{ post.date | date: "%Y-%m-%d" }}</small>
{% endfor %}

## 📊 활동 & 코테
<p>
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=devunis&theme=github-dark" alt="activity" />
</p>
<p>
  <a href="https://solved.ac/gjwjddbsg">
    <img src="http://mazassumnida.wtf/api/v2/generate_badge?boj=gjwjddbsg" alt="solvedac" />
  </a>
  <!-- 리트코드 아이디 있으면 변경 -->
  <a href="https://leetcode.com/your_leetcode_id/">
    <img src="https://leetcard.jacoblin.cool/your_leetcode_id?theme=dark&ext=activity" alt="leetcode" />
  </a>
</p>
