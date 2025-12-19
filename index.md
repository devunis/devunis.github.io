---
layout: splash
title: "안녕하세요, 허정윤입니다"
permalink: /
header:
  overlay_color: "#000"
  overlay_filter: "0.35"
  overlay_image: /assets/images/hero.png   # 없으면 주석 처리해도 됨
  actions:
    - label: "GitHub"
      url: "https://github.com/devunis"
    - label: "이메일"
      url: "mailto:gjwjddbsg@gmail.com"
excerpt: "Backend & AI Developer — Java Spring · Python · RAG · AWS"
feature_row:
  - image_path: /assets/images/project-senpick.png
    alt: "SenPick"
    title: "🛍 SenPick"
    excerpt: "GPT-4o + RAG(Qdrant) 기반 개인 선물 추천 · CTR 15%↑"
    url: "https://github.com/devunis/SenPick"
    btn_label: "코드 보기"
    btn_class: "btn--primary"
  - image_path: /assets/images/project-travel.png
    alt: "Travel Checker"
    title: "🧳 Travel Checker"
    excerpt: "Django + Gemma3 + FAISS RAG로 반입금지 품목 안내"
    url: "https://github.com/devunis/Travel-Checker"
    btn_label: "코드 보기"
    btn_class: "btn--primary"
  - image_path: /assets/images/project-tongue-twist.png
    alt: "Tongue Twist"
    title: "🎤 Tongue Twist"
    excerpt: "Streamlit + Whisper + GPT-4o로 AI 발음 연습 게임"
    url: "https://github.com/devunis/tongue-twist"
    btn_label: "코드 보기"
    btn_class: "btn--primary"
---

{% include feature_row id="feature_row" %}

## 📝 최신 글
<ul>
  {% for post in site.posts limit:5 %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small> — {{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>

## 📊 활동 & 코테
<p>
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=devunis&theme=github-dark" alt="activity" />
</p>
<p>
  <a href="https://solved.ac/gjwjddbsg">
    <img src="http://mazassumnida.wtf/api/v2/generate_badge?boj=gjwjddbsg" alt="solvedac" />
  </a>
  <a href="https://leetcode.com/gjwjddbsg/">
    <img src="https://leetcard.jacoblin.cool/gjwjddbsg?theme=dark&ext=activity" alt="leetcode" />
  </a>
</p>
