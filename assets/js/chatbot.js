(function () {
  "use strict";

  const INDEX_URL = window.DEVUNIS_RAG_INDEX_URL || "/rag-index.json";
  const API_URL = String(window.DEVUNIS_CHAT_API_URL || "").replace(/\/+$/, "");
  const STARTERS = ["어떤 개발자예요?", "대표 프로젝트 알려줘", "주요 기술 스택은?", "경력은 어떻게 되나요?"];
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
    const timeout = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch(`${API_URL}/v1/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Chat API returned ${response.status}`);
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

  // Construct DOM nodes instead of accepting HTML from model responses.
  function renderMarkdown(target, value) {
    target.replaceChildren();
    function inline(parent, text) {
      const tokens = /(`[^`\n]+`|\*\*[^*\n]+\*\*|__[^_\n]+__|\[[^\]\n]+\]\([^\s)]+\)|\*[^*\n]+\*)/g;
      let cursor = 0;
      for (const match of text.matchAll(tokens)) {
        parent.append(document.createTextNode(text.slice(cursor, match.index)));
        const token = match[0];
        let node;
        if (token.startsWith('`')) node = createElement('code', '', token.slice(1,-1));
        else if (token.startsWith('**') || token.startsWith('__')) node = createElement('strong', '', token.slice(2,-2));
        else if (token.startsWith('*')) node = createElement('em', '', token.slice(1,-1));
        else {
          const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          try {
            const url = new URL(link[2], window.location.origin);
            if (!['http:','https:','mailto:'].includes(url.protocol)) throw new Error('Unsupported link');
            node = createElement('a', '', link[1]); node.href = url.href;
            if (url.origin !== window.location.origin) { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
          } catch (_) { node = document.createTextNode(token); }
        }
        parent.append(node); cursor = match.index + token.length;
      }
      parent.append(document.createTextNode(text.slice(cursor)));
    }
    const lines = String(value).replace(/\r\n?/g, '\n').split('\n');
    let list = null, paragraph = null, code = null;
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        list = paragraph = null;
        if (code) code = null;
        else { const pre = createElement('pre'); code = createElement('code'); pre.append(code); target.append(pre); }
        continue;
      }
      if (code) { code.append(document.createTextNode(line + '\n')); continue; }
      if (!line.trim()) { list = paragraph = null; continue; }
      const item = line.match(/^\s*(?:([-*+])|\d+[.)])\s+(.+)$/);
      if (item) {
        paragraph = null;
        const kind = item[1] ? 'ul' : 'ol';
        if (!list || list.tagName.toLowerCase() !== kind) { list = createElement(kind); target.append(list); }
        const li = createElement('li'); inline(li,item[2]); list.append(li); continue;
      }
      if (list && /^\s{2,}\S/.test(line)) { list.lastElementChild.append(createElement('br')); inline(list.lastElementChild,line.trim()); continue; }
      list = null;
      const heading = line.match(/^#{1,6}\s+(.+)$/);
      if (heading) { paragraph = null; const h = createElement('h3'); inline(h,heading[1]); target.append(h); continue; }
      if (/^>\s?/.test(line)) { paragraph = null; const quote = createElement('blockquote'); inline(quote,line.replace(/^>\s?/,'')); target.append(quote); continue; }
      if (!paragraph) { paragraph = createElement('p'); target.append(paragraph); }
      else paragraph.append(createElement('br'));
      inline(paragraph,line);
    }
  }

  function addMessage(log, role, text, sources) {
    const wrapper = createElement("div", `rag-message rag-message--${role}`);
    const label = createElement("span", "rag-message__label", role === "user" ? "YOU" : "DEVUNIS AI");
    const bubble = createElement("div", "rag-message__bubble");
    if (role === 'assistant') renderMarkdown(bubble, text);
    else bubble.textContent = text;
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
    const avatarUrl = new URL("assets/images/avatar.png", new URL(INDEX_URL, window.location.origin)).href;
    const launcherAvatar = createElement("img", "rag-launcher__avatar");
    launcherAvatar.src = avatarUrl;
    launcherAvatar.alt = "";
    launcher.append(launcherAvatar, createElement("span", "rag-launcher__text", "허정윤에게 물어보기"), createElement("span", "rag-launcher__arrow", "↗"));

    const panel = createElement("section", "rag-panel");
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-label", "허정윤 포트폴리오 챗봇");

    const header = createElement("header", "rag-header");
    const titleWrap = createElement("div", "rag-header__title");
    const statusDot = createElement("span", "rag-status-dot");
    const heading = createElement("div", "rag-heading");
    heading.append(
      createElement("strong", "", "DEVUNIS / ASSISTANT"),
      createElement("small", "", API_URL ? "Claude와 함께 둘러보는 포트폴리오" : "대화로 둘러보는 포트폴리오")
    );
    const profile = createElement("div", "rag-profile");
    const avatar = createElement("img", "rag-avatar");
    avatar.src = avatarUrl; avatar.alt = "";
    profile.append(avatar, statusDot);
    titleWrap.append(profile, heading);
    const close = createElement("button", "rag-close", "×");
    close.type = "button";
    close.setAttribute("aria-label", "챗봇 닫기");
    header.append(titleWrap, close);

    const log = createElement("div", "rag-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    const welcome = createElement("div", "rag-welcome");
    welcome.append(
      createElement("p", "rag-eyebrow", "A LITTLE MORE ABOUT ME"),
      createElement("h2", "rag-welcome__title", "안녕하세요,\n무엇이 궁금하세요?"),
      createElement("p", "rag-welcome__copy", "만들어 온 서비스부터 일하는 방식까지.\n허정윤의 이야기를 편하게 물어보세요.")
    );
    const note = createElement("div", "rag-welcome__note");
    note.append(createElement("span", "", "↗"), createElement("span", "", "공개된 포트폴리오를 근거로 답해요"));
    welcome.append(note);
    log.append(welcome);

    const starters = createElement("div", "rag-starters");
    STARTERS.forEach((prompt, index) => {
      const chip = createElement("button", "rag-starter");
      chip.append(createElement("span", "rag-starter__number", `0${index + 1}`), createElement("span", "rag-starter__text", prompt), createElement("span", "rag-starter__arrow", "↗"));
      chip.type = "button";
      chip.addEventListener("click", () => submitQuestion(prompt));
      starters.appendChild(chip);
    });

    log.append(starters);

    const form = createElement("form", "rag-form");
    const input = createElement("textarea", "rag-input");
    input.rows = 1;
    input.maxLength = 280;
    input.placeholder = "궁금한 점을 남겨주세요…";
    input.setAttribute("aria-label", "질문 입력");
    const submit = createElement("button", "rag-submit", "↑");
    submit.type = "submit";
    submit.setAttribute("aria-label", "질문 보내기");
    form.append(input, submit);
    const privacy = createElement(
      "p",
      "rag-privacy",
      API_URL ? "질문은 서버와 Anthropic에 전송됩니다. 개인정보는 입력하지 마세요." : "질문은 저장되거나 외부로 전송되지 않습니다."
    );

    panel.append(header, log, form, privacy);
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

    const pause = ms => new Promise(resolve => window.setTimeout(resolve, ms));
    async function revealAnswer(result) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        addMessage(log, 'assistant', result.answer, result.sources); return;
      }
      const message = addMessage(log, 'assistant', '');
      message.setAttribute('aria-hidden', 'true');
      message.classList.add('rag-message--typing');
      const bubble = message.querySelector('.rag-message__bubble');
      const characters = Array.from(result.answer);
      const step = Math.max(3, Math.ceil(characters.length / 90));
      for (let end = step; end < characters.length; end += step) {
        const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 100;
        renderMarkdown(bubble,characters.slice(0,end).join(''));
        if (follow) log.scrollTop = log.scrollHeight;
        await pause(30);
      }
      message.remove();
      addMessage(log, 'assistant', result.answer, result.sources);
    }

    async function submitQuestion(value) {
      const question = String(value || input.value).trim();
      if (!question || submit.disabled) return;
      if (question.length > 280) return;
      starters.hidden = true;
      welcome.hidden = true;
      addMessage(log, "user", question);
      input.value = "";
      submit.disabled = true;
      const startedAt = Date.now();
      const pending = addMessage(log, "assistant", "사이트에서 근거를 찾고 있어요…");
      pending.classList.add("rag-message--pending");

      try {
        let result;
        if (API_URL) {
          try {
            result = await askRemote(question);
            statusDot.classList.remove("rag-status-dot--error");
          } catch (_remoteError) {
            statusDot.classList.add("rag-status-dot--error");
            result = await askStatic(question);
            result.answer = "지금은 AI 연결을 사용할 수 없어 포트폴리오 검색 결과를 보여드려요.\n\n" + result.answer;
          }
        } else {
          result = await askStatic(question);
        }
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await pause(Math.max(0, 450 - (Date.now() - startedAt)));
        pending.remove();
        await revealAnswer(result);
      } catch (_error) {
        pending.remove();
        addMessage(log, "assistant", "지금은 지식 인덱스를 불러오지 못했어요. 잠시 후 다시 시도하거나 소개·프로젝트 페이지를 확인해 주세요.");
        statusDot.classList.add("rag-status-dot--error");
        documentsPromise = undefined;
      } finally {
        submit.disabled = false;
        if (!panel.hidden) input.focus();
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
