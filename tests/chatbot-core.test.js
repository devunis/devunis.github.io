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

const projects = [
  documents[1],
  { id: "travel", title: "Travel Checker 프로젝트", url: "/projects/", type: "프로젝트",
    tags: ["Travel Checker", "여행", "FAISS", "RAG"], answer: "Travel Checker는 여행 서비스입니다." },
  { id: "voice", title: "Tongue Twist 프로젝트", url: "/projects/", type: "프로젝트",
    tags: ["Tongue Twist", "발음", "Whisper"], answer: "Tongue Twist는 발음 연습 게임입니다." }
];

test("named project introductions do not return the entire portfolio", () => {
  for (const question of ["Travel Checker 프로젝트 소개해줘", "travel checker 프로젝트 알려줘", "Travel Checker RAG 프로젝트 소개해줘"]) {
    const results = rag.search(question, projects);
    assert.deepEqual(results.map(result => result.id), ["travel-0"]);
    assert.equal(rag.composeAnswer(question, results), projects[1].answer);
  }
});

test("project keyword questions select matching projects", () => {
  assert.deepEqual(rag.search("여행 프로젝트 소개해줘", projects).map(result => result.id), ["travel-0"]);
  assert.deepEqual(rag.search("RAG 프로젝트 알려줘", projects).map(result => result.id), ["project-0", "travel-0"]);
});

test("unknown project names and topics do not substitute other owned projects", () => {
  for (const question of ["Quantum Garden 프로젝트 소개해줘", "블록체인 프로젝트 알려줘", "대표 블록체인 프로젝트 소개해줘"]) {
    const results = rag.search(question, projects);
    assert.deepEqual(results, []);
    assert.match(rag.composeAnswer(question, results), /근거를 찾지 못/);
  }
});

test("an overview does not treat blog examples as owned projects", () => {
  const blog = { title: "프로젝트 소개", url: "/posts/ideas/", type: "기술 글", content: "블록체인 프로젝트 아이디어입니다." };
  assert.deepEqual(rag.search("대표 프로젝트 알려줘", [blog]), []);
});

test("common overview wording still returns the complete owned-project list", () => {
  for (const question of ["대표 프로젝트 알려줘", "주요 프로젝트 목록 알려주세요", "어떤 프로젝트를 만들었나요?", "프로젝트 소개 좀 해줘", "대표프로젝트알려줘"]) {
    assert.deepEqual(rag.search(question, projects).map(result => result.id), ["project-0", "travel-0", "voice-0"]);
  }
});

test("broad project introductions still list owned projects and respect the limit", () => {
  const blog = { title: "Travel Checker 프로젝트 소개", type: "기술 글", content: "Travel Checker 예제입니다." };
  assert.deepEqual(rag.search("대표 프로젝트 알려줘", [blog, ...projects], { limit: 2 }).map(result => result.id), ["project-0", "travel-0"]);
});

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


test("representative projects prefer owned projects over blog examples", () => {
  const blog = {id:"blog",title:"대표 프로젝트 아이디어",url:"/posts/ideas/",type:"기술 글",content:"대표 프로젝트 AI 코드 리뷰어 프로젝트 포트폴리오 생성기 프로젝트"};
  const another = {...documents[1],id:"travel",title:"Travel Checker 프로젝트",answer:"Travel Checker는 여행 서비스입니다."};
  const results = rag.search("대표 프로젝트 알려줘",[blog,...documents,another],{limit:3});
  assert.equal(results.length,2);
  assert.ok(results.every(result=>result.type==='프로젝트'));
  assert.match(rag.composeAnswer("대표 프로젝트 알려줘",results),/\*\*SenPick 프로젝트\*\*/);
  assert.doesNotMatch(rag.composeAnswer("대표 프로젝트 알려줘",results),/코드 리뷰어/);
});

