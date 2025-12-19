---
title: "Streamlit으로 AI 음성 앱 만들기: tongue-twist 프로젝트 회고"
date: 2025-12-19 10:00:00 +0900
categories: [AI, Project]
tags: [Streamlit, OpenAI, Whisper, GPT-4o, TTS, Python, 음성인식]
---

최근 **tongue-twist**라는 AI 기반 한국어 발음 연습 게임을 개발했습니다. 이 프로젝트는 **Streamlit**, **OpenAI Whisper**, **GPT-4o-mini**, **TTS**를 활용하여 사용자의 음성을 실시간으로 인식하고 피드백을 제공하는 인터랙티브한 웹 애플리케이션입니다.

발음 연습이 필요한 사람들이 재미있게 연습할 수 있도록, 앵무새 게임처럼 문장을 따라 말하고 즉각적인 피드백을 받을 수 있는 시스템을 만들고자 했습니다.

---

## 1. 프로젝트 아키텍처

tongue-twist는 다음과 같은 파이프라인으로 동작합니다:

```
사용자 음성 입력
    ↓
Whisper STT (음성→텍스트)
    ↓
GPT-4o-mini (발음 평가)
    ↓
TTS (피드백 음성)
    ↓
Streamlit UI
```

각 단계는 OpenAI의 멀티모달 API를 통해 매끄럽게 연결되며, Streamlit이 전체 UI/UX를 담당합니다.

---

## 2. 핵심 기술 구현

### 2-1. Streamlit 음성 녹음

Streamlit에서 음성을 녹음하기 위해 `streamlit-audiorecorder` 라이브러리를 사용했습니다. 이 라이브러리는 브라우저에서 직접 마이크 입력을 받아 녹음할 수 있게 해줍니다.

```python
from audiorecorder import audiorecorder

audio = audiorecorder("녹음 시작", "녹음 종료")
if len(audio) > 0:
    audio.export("input.mp3", format="mp3")
```

사용자가 "녹음 시작" 버튼을 누르면 녹음이 시작되고, "녹음 종료" 버튼을 누르면 녹음이 멈추면서 MP3 파일로 저장됩니다. 실시간으로 녹음 상태를 확인할 수 있어 사용자 경험이 매우 좋았습니다.

### 2-2. OpenAI Whisper STT

녹음된 음성 파일을 텍스트로 변환하기 위해 OpenAI의 Whisper API를 사용했습니다. Whisper는 특히 한국어 음성 인식에서 높은 정확도를 보여줍니다.

```python
def stt():
    with open("input.mp3", "rb") as f:
        transcriptions = client.audio.transcriptions.create(
            file=f,
            model="whisper-1",
            language="ko"
        )
    return transcriptions.text
```

`language="ko"` 파라미터를 지정하여 한국어에 최적화된 인식 결과를 얻을 수 있었습니다. 발음이 정확하지 않아도 문맥을 파악하여 적절히 변환해주는 것이 인상적이었습니다.

### 2-3. GPT-4o로 발음 평가

Whisper로 변환된 텍스트를 GPT-4o-mini에 전달하여 발음의 정확도를 판단하고 피드백을 생성합니다. System Instruction을 통해 앵무새 게임의 규칙을 명확히 설정했습니다.

```python
system_instruction = """
당신은 한국어 발음 연습 게임의 진행자입니다.
사용자가 제시된 문장을 정확히 따라 말했는지 평가하고,
친절하고 격려하는 톤으로 피드백을 제공하세요.

규칙:
1. 문장이 정확하면 "정확합니다!" 라고 칭찬하고 다음 문장 제시
2. 틀렸거나 비슷하면 어느 부분이 달랐는지 구체적으로 설명
3. 너무 짧거나 관련 없는 답변이면 다시 시도하도록 유도
"""
```

GPT-4o-mini는 비용 효율적이면서도 충분히 정확한 평가를 제공하여, 실시간 피드백 시스템에 적합했습니다.

### 2-4. TTS로 음성 피드백

GPT-4o-mini가 생성한 텍스트 피드백을 다시 음성으로 변환하여 사용자에게 들려줍니다. OpenAI의 TTS API를 활용했습니다.

```python
def tts(text):
    response = client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text
    )
    response.stream_to_file("output.mp3")
    
    # Streamlit에서 오디오 재생
    with open("output.mp3", "rb") as audio_file:
        audio_bytes = audio_file.read()
        st.audio(audio_bytes, format="audio/mp3")
```

`voice="nova"` 파라미터로 자연스러운 한국어 음성을 선택했으며, Streamlit의 `st.audio()`를 통해 브라우저에서 바로 재생할 수 있었습니다.

---

## 3. 개발 과정에서의 도전과 해결

### 도전 1: 임시 파일 관리

**문제**: 음성 파일(`input.mp3`, `output.mp3`)이 매 요청마다 생성되면서 서버 용량이 점차 증가하는 문제가 발생했습니다.

**해결**: 파일 사용 후 즉시 삭제하는 로직을 추가했습니다.

```python
import os

# 사용 후 즉시 삭제
if os.path.exists("input.mp3"):
    os.remove("input.mp3")
if os.path.exists("output.mp3"):
    os.remove("output.mp3")
```

이를 통해 디스크 공간을 절약하고 파일 충돌 문제도 방지할 수 있었습니다.

### 도전 2: 세션 상태 관리

**문제**: Streamlit은 페이지가 새로고침될 때마다 코드가 재실행되므로, 대화 히스토리를 유지하는 것이 어려웠습니다.

**해결**: Streamlit의 `st.session_state`를 활용하여 채팅 로그와 오디오 로그를 별도로 관리했습니다.

```python
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "audio_history" not in st.session_state:
    st.session_state.audio_history = []

# 새로운 메시지 추가
st.session_state.chat_history.append({
    "role": "user",
    "content": user_input
})
```

이를 통해 사용자가 여러 번 연습하면서 이전 대화 내용을 계속 볼 수 있게 되었습니다.

### 도전 3: API 키 보안

**문제**: OpenAI API 키를 코드에 직접 하드코딩하면 보안 위험이 있습니다.

**해결**: 환경변수 파일(`.env`)을 사용하고 `.gitignore`에 추가하여 API 키가 GitHub에 노출되지 않도록 했습니다.

```python
from dotenv import load_dotenv
import os

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

`.gitignore` 파일:
```
.env
input.mp3
output.mp3
```

---

## 4. 프로젝트 성과 및 배운 점

### 성과

- ✅ **실시간 음성 인식 및 피드백 구현**: STT → LLM → TTS 파이프라인 완성
- ✅ **인터랙티브한 UI/UX**: Streamlit을 통해 직관적이고 사용하기 쉬운 인터페이스 제공
- ✅ **OpenAI 멀티모달 API 통합**: Whisper, GPT-4o-mini, TTS를 하나의 애플리케이션에서 활용

### 배운 점

#### 1. Streamlit의 강력함
Streamlit은 프론트엔드 개발 없이도 Python 코드만으로 웹 애플리케이션을 빠르게 만들 수 있습니다. 특히 AI/ML 프로젝트의 프로토타이핑에 최적화되어 있어, 아이디어를 빠르게 검증할 수 있었습니다.

#### 2. 음성 처리 파이프라인
STT → LLM → TTS 파이프라인을 직접 구현하면서 각 단계의 역할과 중요성을 깊이 이해하게 되었습니다. 특히 Whisper의 정확도와 TTS의 자연스러움이 사용자 경험에 큰 영향을 미친다는 것을 체감했습니다.

#### 3. 사용자 경험 설계
실시간 피드백의 중요성을 깨달았습니다. 사용자가 말한 후 즉시 결과를 확인할 수 있어야 몰입도가 높아지며, 음성 피드백은 텍스트만 제공하는 것보다 훨씬 효과적이었습니다.

---

## 5. 개선 방향

현재 프로젝트는 기본적인 발음 연습 기능을 제공하지만, 다음과 같은 개선을 고려하고 있습니다:

- [ ] **발음 평가 정확도 향상**: 커스텀 평가 모델을 도입하여 더 세밀한 발음 분석
- [ ] **난이도 조절 기능**: 초급/중급/고급 문장 제공
- [ ] **발음 점수 시각화**: 사용자의 발음 정확도를 그래프로 표시
- [ ] **모바일 최적화**: 모바일 브라우저에서도 원활하게 동작하도록 UI 개선

---

## 마무리

tongue-twist 프로젝트를 통해 Streamlit과 OpenAI API를 활용한 음성 AI 애플리케이션을 빠르게 구축할 수 있음을 확인했습니다. 복잡한 프론트엔드 개발 없이도 Python만으로 실용적인 서비스를 만들 수 있다는 점이 매우 인상적이었습니다.

음성 AI 기술은 이제 개인 개발자도 쉽게 접근할 수 있는 수준이 되었으며, 앞으로 더 많은 창의적인 애플리케이션이 등장할 것으로 기대됩니다.

🔗 **프로젝트 GitHub**: [devunis/tongue-twist](https://github.com/devunis/tongue-twist)

---

다음에는 발음 평가 모델을 커스터마이징하거나, 더 다양한 언어를 지원하는 방향으로 프로젝트를 발전시켜볼 계획입니다. 여러분도 Streamlit으로 재미있는 AI 프로젝트를 만들어보세요! 🚀
