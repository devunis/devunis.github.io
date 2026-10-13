import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { ChatBudget } from '../worker/index.mjs';
const origin = 'https://devunis.github.io';
function request(message = '경력 알려줘', options = {}) {
  return new Request('https://chat.example/v1/chat', {
    method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }), ...options
  });
}
function environment() {
  return { ANTHROPIC_API_KEY: 'test-only', CHAT_BUDGET: {
    idFromName: () => 'global', get: () => ({ fetch: async () => Response.json({ allowed: true }) })
  }};
}
test('rejects other origins and invalid/oversized input before provider requests', async () => {
  assert.equal((await worker.fetch(request('경력', { headers: { Origin: 'https://other.example' } }), {})).status, 403);
  assert.equal((await worker.fetch(request(''), {})).status, 400);
  assert.equal((await worker.fetch(request('x'.repeat(281)), {})).status, 400);
  assert.equal((await worker.fetch(request('x'.repeat(5000)), {})).status, 413);
  assert.equal((await worker.fetch(request('경력', { body: '{' }), {})).status, 400);
});
test('preflight works; missing secrets and non-Sonnet/Haiku models fail closed', async () => {
  const preflight = await worker.fetch(request('', { method: 'OPTIONS', body: undefined }), {});
  assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), origin);
  assert.equal((await worker.fetch(request(), {})).status, 503);
  assert.equal((await worker.fetch(request(), { ...environment(), CLAUDE_MODEL: 'claude-opus-4-6' })).status, 503);
});
test('retrieves trusted evidence and sends only server-held key to Claude', async (t) => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (url.endsWith('/rag-index.json')) return Response.json({ documents: [{ title: '경력', tags: ['경력'], url: '/about/', type: '경력', answer: '푸른소나무에서 백엔드 개발자로 근무했습니다.' }] });
    return Response.json({ content: [{ type: 'text', text: '공개 자료에 따르면 백엔드 개발 경험이 있어요.' }] });
  });
  const response = await worker.fetch(request(), environment());
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.sources[0].url, '/about/');
  assert.equal(calls[0].url, `${origin}/rag-index.json`);
  assert.equal(calls[1].options.headers['x-api-key'], 'test-only');
  assert.equal(JSON.parse(calls[1].options.body).model, 'claude-haiku-4-5-20251001');
  assert.ok(!JSON.stringify(payload).includes('test-only'));
});
test('named project questions send only the selected project to the model', async (t) => {
  let references;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/rag-index.json')) return Response.json({ documents: [
      { title: 'SenPick 프로젝트', type: '프로젝트', tags: ['RAG'], answer: '선물 추천 서비스입니다.' },
      { title: 'Travel Checker 프로젝트', type: '프로젝트', tags: ['RAG', '여행'], answer: '국가별 반입금지 품목 안내 서비스입니다.' }
    ] });
    references = JSON.parse(JSON.parse(options.body).messages[0].content).reference_material;
    return Response.json({ content: [{ type: 'text', text: 'Travel Checker는 여행 서비스입니다.' }] });
  });
  const response = await worker.fetch(request('Travel Checker 프로젝트 소개해줘'), environment());
  assert.equal(response.status, 200);
  assert.deepEqual(references.map(reference => reference.title), ['Travel Checker 프로젝트']);
  assert.deepEqual((await response.json()).sources.map(source => source.title), ['Travel Checker 프로젝트']);
});

test('unknown questions avoid model charges and provider failures remain private', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.endsWith('/rag-index.json')) return Response.json({ documents: [] });
    throw new Error('Should not call provider');
  });
  assert.equal((await (await worker.fetch(request('점심 메뉴'), environment())).json()).sources.length, 0);
  t.mock.restoreAll();
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('secret provider error'); });
  const response = await worker.fetch(request(), environment());
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('secret provider error'));
});
test('exhausted budget blocks upstream calls', async () => {
  const env = environment();
  env.CHAT_BUDGET.get = () => ({ fetch: async () => Response.json({ allowed: false }) });
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
});
test('durable budget enforces per-client and global limits', async () => {
  const data = new Map();
  const storage = { get: async k => structuredClone(data.get(k)), put: async (k,v) => data.set(k, structuredClone(v)), setAlarm: async () => {}, deleteAll: async () => data.clear() };
  storage.transaction = fn => fn(storage);
  const budget = new ChatBudget({ storage });
  const check = async client => (await (await budget.fetch(new Request('https://budget/check', { method: 'POST', body: JSON.stringify({client}) }))).json()).allowed;
  for (let i = 0; i < 5; i++) assert.equal(await check('same-client'), true);
  assert.equal(await check('same-client'), false);
  for (let i = 0; i < 95; i++) assert.equal(await check(`client-${i}`), true);
  assert.equal(await check('next-client'), false);
  await budget.alarm();
  assert.equal(await check('next-client'), true);
});
