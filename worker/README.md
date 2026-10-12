# Claude 포트폴리오 서버

GitHub Pages에는 기존 채팅창을 유지하고, Claude 호출만 Cloudflare Worker에서 처리합니다.
API 키는 저장소나 브라우저에 넣지 않습니다. 노출된 키는 폐기하고 새 키를 사용하세요.

## 배포

저장소 루트에서 Node.js 22 이상으로 실행합니다.

```sh
npm install
npx wrangler login
npm run worker:secret
npm run worker:check
npm run worker:deploy
```

`worker:secret`의 대화형 입력에 **새로 발급한 키**를 붙여 넣습니다. 명령 인자에 키를 넣지 마세요.
Cloudflare 계정에 Workers/Durable Objects 사용 권한과 Anthropic 계정에 API 사용 잔액이 필요합니다.

배포 결과의 `https://devunis-portfolio-chat.<계정>.workers.dev` 주소를 `_config.yml`에 설정합니다.

```yaml
chatbot_api_url: "https://devunis-portfolio-chat.<계정>.workers.dev"
```

이 변경을 GitHub Pages에 배포하면 Claude 연결이 켜집니다. 연결 전에도 기존 검색형 챗봇은 동작합니다.
서버 장애나 사용량 제한 시 검색 결과로 전환했다는 안내가 표시됩니다.

## 로컬 테스트

`worker/.dev.vars`를 만들고 `ANTHROPIC_API_KEY=새키`를 로컬에서만 설정하세요.
이 파일은 Git에서 제외됩니다. 로컬 채팅창을 쓰려면 `worker/wrangler.toml`의 ALLOWED_ORIGIN을
로컬 사이트 주소로 임시 변경하고 `npm run worker:dev`를 실행합니다. 배포 전 원래 주소로 복구하세요.

## 자료와 제한

- 서버는 `https://devunis.github.io/rag-index.json`에서 공개 자료를 읽습니다. 사용자가 자료를 지정할 수 없습니다.
- `_data/chatbot.yml`, 소개·프로젝트 페이지를 수정하고 Pages에 배포하면 자료가 갱신됩니다(캐시 최대 5분).
- 질문당 280자, 응답당 최대 700 토큰. 대화 이력은 전송하지 않으므로 각 질문을 구체적으로 작성하세요.
- IP당 분당 5회·UTC 기준 하루 20회, 사이트 전체 하루 100회 요청으로 제한합니다.
- 실패한 요청도 예산에 포함합니다. 동시 요청도 Durable Object의 원자적 카운터로 계산합니다.
- CORS는 브라우저 출처 제한이며 인증이 아닙니다. 직접 HTTP 호출을 막지는 못하므로 전체 예산을 유지하세요.
- 키는 Worker secret에만 보관합니다. 질문·답변은 앱에서 저장/로그하지 않지만 Anthropic으로 전송됩니다.
- IP는 날짜를 포함해 해시하고 카운터와 함께 보관합니다. 날짜가 바뀌면 교체하고, 마지막 요청 후 24시간이 지나면 삭제합니다.
- Cloudflare 및 Anthropic의 제공자 정책과 보관 설정은 별도로 적용됩니다.
- 요금은 Claude API 호출 및 호스팅 사용량에 따라 발생할 수 있습니다. Anthropic 콘솔의 지출 한도도 설정하세요.
- 모델은 `CLAUDE_MODEL`로 Sonnet 또는 Haiku만 설정할 수 있습니다. 다른 계열은 서버에서 거부합니다. 자료에 없는 사실을 생성하지 않도록 지시하지만 답변 정확도 검토는 필요합니다.

## 검증

```sh
npm test
npm run worker:check
```

공식 참고: [Messages API](https://platform.claude.com/docs/en/api/messages/create),
[Worker 설정](https://developers.cloudflare.com/workers/wrangler/configuration/),
[Durable Object 마이그레이션](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/).
