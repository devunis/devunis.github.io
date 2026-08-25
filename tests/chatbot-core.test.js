const test = require("node:test");
const assert = require("node:assert/strict");
const rag = require("../assets/js/chatbot-core.js");

const documents = [
  {
    id: "career",
    title: "백엔드 실무 경력",
    url: "/about/",
    type: "경력",
    tags: ["경력", "회사", "병원"],
    content: "허정윤은 푸른소나무에서 2년 7개월 동안 백엔드 개발자로 일했습니다.",
    answer: "푸른소나무에서 2년 7개월 동안 백엔드 개발자로 일했습니다."
  },
  {
    id: "project",
    title: "SenPick 프로젝트",
    url: "/projects/",
    type: "프로젝트",
    tags: ["RAG", "Qdrant", "LangGraph"],
    content: "취향과 상황을 이해해 선물을 추천하는 RAG 서비스입니다.",
    answer: "SenPick은 RAG 기반 개인화 선물 추천 서비스입니다."
  }
];

test("Korean particles are normalized for retrieval", () => {
  assert.ok(rag.tokenize("경력은 어떻게 되나요?").includes("경력"));
});

test("career synonym query ranks career evidence first", () => {
  const results = rag.search("어느 회사에서 근무했나요?", documents);
  assert.equal(results[0].id, "career-0");
});

test("RAG project query returns the project source", () => {
  const results = rag.search("RAG로 만든 서비스 알려줘", documents);
  assert.equal(results[0].url, "/projects/");
  assert.match(rag.composeAnswer("RAG 프로젝트는?", results), /SenPick/);
});

test("unknown questions return a grounded fallback", () => {
  const results = rag.search("오늘 점심 메뉴", documents);
  assert.deepEqual(results, []);
  assert.match(rag.composeAnswer("오늘 점심 메뉴", results), /근거를 찾지 못/);
});
