(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DevunisRag = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PARTICLES = [
    "으로부터", "에서부터", "에게서는", "이라는", "에서는", "으로", "에게", "한테",
    "부터", "까지", "처럼", "보다", "하고", "이며", "에서", "에는", "의", "은", "는",
    "이", "가", "을", "를", "과", "와", "에", "로", "도", "만"
  ];

  const SYNONYM_GROUPS = [
    ["소개", "프로필", "누구", "사람", "개발자", "허정윤"],
    ["경력", "경험", "회사", "근무", "업무", "실무", "푸른소나무"],
    ["학력", "학교", "대학", "전공", "졸업"],
    ["자격", "자격증", "sqld", "pccp", "빅데이터분석기사"],
    ["기술", "스택", "언어", "프레임워크", "skill", "skills"],
    ["프로젝트", "작업", "서비스", "포트폴리오", "만든", "개발"],
    ["연락", "연락처", "이메일", "메일", "채용", "협업"],
    ["깃허브", "github", "코드", "저장소"],
    ["인공지능", "ai", "llm", "rag", "에이전트", "langgraph"],
    ["백엔드", "backend", "서버", "api", "spring", "django", "fastapi"]
  ];

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^0-9a-z가-힣+#.]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stem(token) {
    for (const particle of PARTICLES) {
      if (token.length > particle.length + 1 && token.endsWith(particle)) {
        return token.slice(0, -particle.length);
      }
    }
    return token;
  }

  function tokenize(value) {
    const normalized = normalize(value);
    if (!normalized) return [];
    return normalized.split(" ").map(stem).filter((token) => token.length > 1 || /[+#]/.test(token));
  }

  function expandQuery(value) {
    const base = tokenize(value);
    const expanded = new Set(base);
    for (const token of base) {
      for (const group of SYNONYM_GROUPS) {
        if (group.some((term) => stem(normalize(term)) === token)) {
          group.forEach((term) => expanded.add(stem(normalize(term))));
        }
      }
    }
    return Array.from(expanded);
  }

  function splitContent(content, maxLength) {
    const clean = String(content || "").replace(/\s+/g, " ").trim();
    if (!clean) return [];
    const limit = maxLength || 360;
    const sentences = clean.match(/[^.!?。！？]+[.!?。！？]?/g) || [clean];
    const chunks = [];
    let current = "";

    for (const rawSentence of sentences) {
      const sentence = rawSentence.trim();
      if (!sentence) continue;
      if (current && current.length + sentence.length + 1 > limit) {
        chunks.push(current);
        current = sentence;
      } else {
        current = current ? `${current} ${sentence}` : sentence;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  function buildChunks(documents) {
    const chunks = [];
    (documents || []).forEach((document, documentIndex) => {
      const texts = document.answer ? [document.answer] : splitContent(document.content);
      texts.forEach((text, chunkIndex) => {
        const title = String(document.title || "제목 없음");
        const tags = Array.isArray(document.tags) ? document.tags.join(" ") : String(document.tags || "");
        chunks.push({
          id: `${document.id || documentIndex}-${chunkIndex}`,
          title,
          url: String(document.url || "/"),
          type: String(document.type || "사이트"),
          text,
          answer: document.answer || "",
          titleTokens: tokenize(title),
          tagTokens: tokenize(tags),
          textTokens: tokenize(text),
          normalizedText: normalize(`${title} ${tags} ${text}`)
        });
      });
    });
    return chunks;
  }

  function termFrequency(tokens, term) {
    let count = 0;
    for (const token of tokens) if (token === term || token.includes(term) || term.includes(token)) count += 1;
    return count;
  }

  function search(question, documents, options) {
    const settings = Object.assign({ limit: 4, minScore: 1.4 }, options);
    const query = normalize(question);
    const terms = expandQuery(question);
    if (!terms.length) return [];

    const chunks = buildChunks(documents);
    const documentFrequency = new Map();
    for (const term of terms) {
      documentFrequency.set(term, chunks.filter((chunk) => chunk.normalizedText.includes(term)).length);
    }

    const ranked = chunks.map((chunk) => {
      let score = 0;
      let matchedOriginalTerms = 0;
      const originalTerms = tokenize(question);

      for (const term of terms) {
        const frequency = documentFrequency.get(term) || 0;
        const idf = Math.log((chunks.length + 1) / (frequency + 1)) + 1;
        const titleHits = termFrequency(chunk.titleTokens, term);
        const tagHits = termFrequency(chunk.tagTokens, term);
        const textHits = termFrequency(chunk.textTokens, term);
        score += idf * (titleHits * 4.2 + tagHits * 3 + Math.min(textHits, 4) * 1.15);
      }

      for (const term of originalTerms) {
        if (chunk.normalizedText.includes(term)) matchedOriginalTerms += 1;
      }
      if (originalTerms.length) score += (matchedOriginalTerms / originalTerms.length) * 4;
      if (query.length > 3 && chunk.normalizedText.includes(query)) score += 8;
      if (chunk.answer) score += 0.35;

      return Object.assign({}, chunk, { score });
    }).filter((chunk) => chunk.score >= settings.minScore)
      .sort((a, b) => b.score - a.score);

    const uniqueUrls = new Set();
    const results = [];
    const confidenceFloor = ranked.length
      ? Math.max(settings.minScore, ranked[0].score * 0.28)
      : settings.minScore;
    for (const chunk of ranked) {
      if (chunk.score < confidenceFloor) break;
      const dedupeKey = `${chunk.url}|${chunk.text}`;
      if (uniqueUrls.has(dedupeKey)) continue;
      uniqueUrls.add(dedupeKey);
      results.push(chunk);
      if (results.length >= settings.limit) break;
    }
    return results;
  }

  function composeAnswer(question, results) {
    if (!results || !results.length) {
      return "사이트에서 관련 근거를 찾지 못했어요. 경력, 기술 스택, 프로젝트, 학력, 연락처처럼 조금 더 구체적으로 물어봐 주세요.";
    }

    const primary = results[0];
    let answer = primary.answer || primary.text;
    if (answer.length > 440) answer = `${answer.slice(0, 437).trim()}…`;

    const lowerQuestion = normalize(question);
    if (/왜|강점|장점|잘하/.test(lowerQuestion)) return `사이트 내용을 기준으로 보면, ${answer}`;
    if (/연락|이메일|메일|깃허브|github/.test(lowerQuestion)) return answer;
    return answer;
  }

  return { normalize, tokenize, expandQuery, splitContent, buildChunks, search, composeAnswer };
});
