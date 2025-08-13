---
layout: default
title: 홈
---

# 👋 안녕하세요, 허정윤입니다
**Backend & AI Developer** — Java Spring · Python · RAG · 멀티에이전트 · AWS

[이메일](mailto:gjwjddbsg@gmail.com) · [GitHub](https://github.com/devunis) · 서울 동대문구

---

## 🚀 Featured Projects
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;">
  <a href="https://github.com/devunis/SenPick" style="text-decoration:none;">
    <div style="border:1px solid #eaeaea;border-radius:12px;padding:14px;">
      <h3>🛍 SenPick</h3>
      <p>개인 선물 추천 AI — GPT-4o + RAG(Qdrant)로 취향·상황 기반 추천, CTR 15%↑</p>
      <span>GPT-4o · RAG · Qdrant · LangGraph · PEFT/QLoRA</span>
    </div>
  </a>
  <a href="https://github.com/devunis/Travel-Checker" style="text-decoration:none;">
    <div style="border:1px solid #eaeaea;border-radius:12px;padding:14px;">
      <h3>🧳 Travel Checker</h3>
      <p>여행 반입금지 품목 챗봇 — Django + Gemma3 + FAISS RAG</p>
      <span>Django · Gemma3 · FAISS · RAG</span>
    </div>
  </a>
</div>

<p style="margin-top:10px;">
▶ 더 보기: <a href="/projects">프로젝트 전체</a>
</p>

---

## 📝 Latest Posts
<ul>
  {% for post in site.posts limit:3 %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small> — {{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>

---

## 📊 활동 & 코테
<p>
  <img src="https://github-readme-activity-graph.vercel.app/graph?username=devunis&theme=github-dark" alt="activity" />
</p>
<p>
  <a href="https://solved.ac/gjwjddbsg">
    <img src="http://mazassumnida.wtf/api/v2/generate_badge?boj=gjwjddbsg" alt="solvedac" />
  </a>
  <a href="https://leetcode.com/your_leetcode_id/">
    <img src="https://leetcard.jacoblin.cool/your_leetcode_id?theme=dark&ext=activity" alt="leetcode" />
  </a>
</p>
