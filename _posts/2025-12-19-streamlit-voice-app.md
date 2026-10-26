---
title: "Tongue Twist 회고: Streamlit 음성 입력·피드백 흐름"
date: 2025-12-19 10:00:00 +0900
categories: [AI, Project]
tags: [Streamlit, OpenAI, Whisper, GPT-4o, TTS, Python, 음성인식]
last_modified_at: 2026-10-15 14:50:00 +0900
---

Tongue Twist는 Streamlit과 음성 인식·언어 모델·음성 합성을 조합하는 발음 연습 프로젝트입니다. 녹음한 음성에서 텍스트를 얻고 문장 비교와 피드백을 제공하는 흐름을 중심으로 설명합니다.

## 🎤 처리 단계

<figure class="article-diagram">
<figcaption>목소리에서 피드백까지</figcaption>
<ol>
<li>녹음</li>
<li>음성 인식 · STT</li>
<li>문장 비교·피드백 생성</li>
<li>음성 합성 · TTS</li>
<li>재생</li>
</ol>
</figure>


녹음이 끝난 뒤 처리하는 요청·응답 방식과 지속적으로 오디오를 전달하는 실시간 스트리밍을 구분합니다. 지연을 측정하지 않고 “즉시” 또는 “고정된 속도”를 보장하지 않습니다.

## 🧠 발음 평가의 한계

음성을 텍스트로 바꾸는 모델은 문맥을 활용해 발음의 차이를 정규화할 수 있습니다. 따라서 인식 결과와 정답 문장이 같다고 실제 음소·억양·조음이 정확했다고 판단할 수 없습니다.

텍스트 기반 피드백은 문장 일치·누락 등을 설명하는 보조 수단입니다. 정밀한 발음 평가에는 원본 오디오를 사용하는 별도 평가 방법과 검증 데이터가 필요합니다. 이 프로젝트를 검증된 발음 진단 시스템으로 소개하지 않습니다.

## 📁 요청별 임시 파일

공유 파일명 input.mp3·output.mp3를 모든 사용자가 쓰면 동시 요청에서 충돌할 수 있습니다. 사용 후 삭제만으로 처리 중 충돌이 해결되지는 않습니다. 요청별 버퍼·임시 디렉터리와 수명 관리가 필요합니다.

```python
from pathlib import Path
from tempfile import TemporaryDirectory

with TemporaryDirectory() as directory:
    input_path = Path(directory) / "input.mp3"
    output_path = Path(directory) / "output.mp3"
    # 이 요청의 녹음·변환 파일은 해당 디렉터리 안에서 처리합니다.
    # 재생에 필요한 바이트를 읽은 뒤 블록을 종료합니다.
```

위 코드는 파일 수명 설명용이며 실제 녹음·모델 호출은 포함하지 않습니다.

## 🔄 세션과 오류 처리

Streamlit의 session_state는 세션 안의 재실행 사이에 상태를 유지하는 기능입니다. 영구 저장소가 아니므로 새 연결·브라우저 새로고침 등의 조건에서 유지되는 범위를 확인해야 합니다.

파일 크기·길이·형식, 음성 인식 실패, 외부 API 타임아웃과 재생 실패를 처리합니다. 사용자 오디오와 변환 텍스트의 보존·삭제 정책을 정하고 비밀 값은 클라이언트나 저장소에 노출하지 않습니다.

## ⚡ 속도 개선 기록

STT·피드백 생성·TTS 시간을 각각 측정해 병목을 찾습니다. 원문 인식 결과가 필요한 생성 단계처럼 의존성이 있는 작업은 무조건 병렬 실행할 수 없습니다. 실제로 적용한 방법과 측정한 결과를 구분해 회고에 남깁니다.

📚 [Tongue Twist 원본](https://github.com/devunis/tongue-twist) · [Streamlit Session State](https://docs.streamlit.io/develop/api-reference/caching-and-state/st.session_state)
