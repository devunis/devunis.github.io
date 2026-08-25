(function () {
  "use strict";

  const INDEX_URL = window.DEVUNIS_RAG_INDEX_URL || "/rag-index.json";
  const API_URL = String(window.DEVUNIS_CHAT_API_URL || "").replace(/\/+$/, "");
  const STARTERS = ["어떤 개발자예요?", "주요 기술 스택은?", "대표 프로젝트 알려줘", "경력은 어떻게 되나요?"];
  let documentsPromise;

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function safeSourceUrl(path) {
    try {
      const url = new URL(path, window.location.origin);
      return url.origin === window.location.origin ? url.href : window.location.origin;
    } catch (_error) {
      return window.location.origin;
    }
  }

  async function loadDocuments() {
    if (!documentsPromise) {
      documentsPromise = fetch(INDEX_URL, { credentials: "same-origin" })
        .then((response) => {
          if (!response.ok) throw new Error(`Knowledge index returned ${response.status}`);
          return response.json();
        })
        .then((payload) => Array.isArray(payload.documents) ? payload.documents : []);
    }
    return documentsPromise;
  }

  async function askRemote(question) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${API_URL}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`RAG API returned ${response.status}`);
      const payload = await response.json();
      if (!payload || typeof payload.answer !== "string") throw new Error("Invalid RAG response");
      return {
        answer: payload.answer,
        sources: Array.isArray(payload.sources) ? payload.sources : []
      };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function askStatic(question) {
    const documents = await loadDocuments();
    const results = window.DevunisRag.search(question, documents, { limit: 3 });
    return {
      answer: window.DevunisRag.composeAnswer(question, results),
      sources: results
    };
  }

  function addMessage(log, role, text, sources) {
    const wrapper = createElement("div", `rag-message rag-message--${role}`);
    const label = createElement("span", "rag-message__label", role === "user" ? "YOU" : "DEVUNIS AI");
    const bubble = createElement("div", "rag-message__bubble", text);
    wrapper.append(label, bubble);

    if (sources && sources.length) {
      const sourceList = createElement("div", "rag-sources");
      const sourceLabel = createElement("p", "rag-sources__label", "확인한 근거");
      sourceList.appendChild(sourceLabel);
      const seen = new Set();
      sources.forEach((source) => {
        const key = `${source.url}|${source.title}`;
        if (seen.has(key)) return;
        seen.add(key);
        const link = createElement("a", "rag-source");
        link.href = safeSourceUrl(source.url);
        link.textContent = `${source.type} · ${source.title}`;
        link.setAttribute("aria-label", `${source.title}에서 근거 확인`);
        sourceList.appendChild(link);
      });
      bubble.appendChild(sourceList);
    }

    log.appendChild(wrapper);
    log.scrollTop = log.scrollHeight;
    return wrapper;
  }

  function buildChatbot() {
    if (!window.DevunisRag || document.querySelector(".rag-chat")) return;

    const root = createElement("div", "rag-chat");
    const launcher = createElement("button", "rag-launcher");
    launcher.type = "button";
    launcher.setAttribute("aria-label", "허정윤 AI 챗봇 열기");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<span class="rag-launcher__spark" aria-hidden="true">✦</span><span class="rag-launcher__text">Ask me</span>';

    const panel = createElement("section", "rag-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "허정윤 포트폴리오 챗봇");

    const header = createElement("header", "rag-header");
    const titleWrap = createElement("div", "rag-header__title");
    const statusDot = createElement("span", "rag-status-dot");
    const heading = createElement("div");
    heading.append(
      createElement("strong", "", "DEVUNIS AI"),
      createElement("small", "", API_URL ? "RAG 서버에서 근거를 찾아 답해요" : "포트폴리오에서 근거를 찾아 답해요")
    );
    titleWrap.append(statusDot, heading);
    const close = createElement("button", "rag-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "챗봇 닫기");
    header.append(titleWrap, close);

    const log = createElement("div", "rag-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    addMessage(log, "assistant", "안녕하세요! 허정윤의 경력, 기술, 프로젝트에 대해 물어보세요. 사이트에 공개된 내용만 근거로 답할게요.");

    const starters = createElement("div", "rag-starters");
    STARTERS.forEach((prompt) => {
      const chip = createElement("button", "rag-starter", prompt);
      chip.type = "button";
      chip.addEventListener("click", () => submitQuestion(prompt));
      starters.appendChild(chip);
    });

    const form = createElement("form", "rag-form");
    const input = createElement("textarea", "rag-input");
    input.rows = 1;
    input.maxLength = 280;
    input.placeholder = "예: 어떤 RAG 프로젝트를 했나요?";
    input.setAttribute("aria-label", "질문 입력");
    const submit = createElement("button", "rag-submit", "↑");
    submit.type = "submit";
    submit.setAttribute("aria-label", "질문 보내기");
    form.append(input, submit);
    const privacy = createElement(
      "p",
      "rag-privacy",
      API_URL ? "질문은 답변 생성을 위해 RAG 서버에서 처리됩니다." : "질문은 저장되거나 외부로 전송되지 않습니다."
    );

    panel.append(header, log, starters, form, privacy);
    root.append(panel, launcher);
    document.body.appendChild(root);

    function setOpen(open) {
      panel.hidden = !open;
      launcher.setAttribute("aria-expanded", String(open));
      root.classList.toggle("rag-chat--open", open);
      if (open) {
        input.focus();
        loadDocuments().catch(() => { statusDot.classList.add("rag-status-dot--error"); });
      } else {
        launcher.focus();
      }
    }

    async function submitQuestion(value) {
      const question = String(value || input.value).trim();
      if (!question || submit.disabled) return;
      starters.hidden = true;
      addMessage(log, "user", question);
      input.value = "";
      submit.disabled = true;
      const pending = addMessage(log, "assistant", "사이트에서 근거를 찾고 있어요…");
      pending.classList.add("rag-message--pending");

      try {
        let result;
        if (API_URL) {
          try {
            result = await askRemote(question);
          } catch (_remoteError) {
            statusDot.classList.add("rag-status-dot--error");
            result = await askStatic(question);
          }
        } else {
          result = await askStatic(question);
        }
        pending.remove();
        addMessage(log, "assistant", result.answer, result.sources);
      } catch (_error) {
        pending.remove();
        addMessage(log, "assistant", "지금은 지식 인덱스를 불러오지 못했어요. 잠시 후 다시 시도하거나 소개·프로젝트 페이지를 확인해 주세요.");
        statusDot.classList.add("rag-status-dot--error");
        documentsPromise = undefined;
      } finally {
        submit.disabled = false;
        input.focus();
      }
    }

    launcher.addEventListener("click", () => setOpen(panel.hidden));
    close.addEventListener("click", () => setOpen(false));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitQuestion();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) setOpen(false);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", buildChatbot);
  else buildChatbot();
})();
