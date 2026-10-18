# Meshy AI 프롬프트: 주인공 토끼 (함곡이) — 돌아다니는 3D 캐릭터용

게임(three.js)에서 걸어 다니고 전투 동작까지 하는 캐릭터로 쓰기 위한 요청서예요.
참고 그림: `meshy/hamgoki_front.png`, `_left.png`, `_right.png`, `_back.png` (게임 안 작은 그림이라 해상도가 낮아요 → **원본 고해상도 그림이 있으면 그걸 쓰는 게 훨씬 좋아요**).

## 캐릭터 특징 (그림에서 읽은 것)
- 하얀 털의 토끼, 길고 큰 귀(귀 안쪽은 연분홍)
- 머리 왼쪽 귀 뿌리에 **빨간 리본(나비 매듭)**
- **빨간 망토**(어깨에서 뒤로 길게), 가슴 가운데 **금색 하트 모양 펜던트**
- 크고 둥근 검은 눈(하이라이트 있음), 작은 분홍 코, 활짝 웃는 입, 볼에 연한 분홍 홍조
- 짧고 통통한 몸, 머리가 큰 2~2.5등신 치비 비율, 둥근 손발

## 추천 작업 순서 (Meshy)
1. **Image to 3D** 선택 → 앞모습 그림(`hamgoki_front.png` 또는 고해상도 원본) 업로드. (글자·치수 표시가 들어간 그림이면 지우고 올리세요.)
2. 설정
   - Model: 최신(Meshy-5 이상) / **Symmetry: On**
   - **Pose: A-pose (또는 T-pose)** ← 리깅(뼈대 넣기)에 필요해요
   - Topology: Quad 또는 Triangle, **Polycount 약 12,000~25,000**
   - Texture: **PBR 끄고** 만화풍 색칠만(Albedo), 해상도 1024~2048
3. 결과가 마음에 들면 **Auto-Rig(리깅)** → 사람형(Humanoid) 뼈대로 생성. 귀·망토·리본은 따로 움직이지 않아도 괜찮아요(몸에 붙은 채로).
4. **Animate**에서 아래 동작을 만들고 **.glb**로 내보내기.

## 프롬프트 (영어로 넣어야 결과가 좋아요)

**Text/Image 프롬프트**
```
A cute chibi white rabbit hero mascot, 2.5-head-tall proportions, big round head, short chubby body.
Long upright white ears with soft pink inner ears. A red bow tied at the base of the left ear.
A flowing red cape, and a small golden heart-shaped pendant on the chest.
Large glossy black eyes with white highlights, small pink nose, happy open smile, light pink blush on cheeks.
Rounded paws and feet, simple clean cartoon style, smooth stylized 3D character like a mobile game mascot.
Neutral standing A-pose, arms slightly away from the body, facing forward, full body, symmetrical, game-ready low poly, clean topology, no background.
```

**Negative(제외할 것)**
```
realistic fur, photorealistic, extra limbs, text, watermark, logo, background, scenery, weapon, complex accessories, thin floating parts, holes, noisy texture, uneven proportions
```

## 게임에서 쓰려면 이런 사양이면 좋아요
- 형식: **.glb** 한 파일 (뼈대 + 텍스처 포함), 크기 5MB 이하
- 삼각형 수 12,000~25,000, 재질 1~2개, 텍스처 1장(1024~2048)
- 키는 약 1.0(단위 1m 기준), 발바닥이 원점, **앞쪽이 +Z 또는 -Z 중 한쪽으로 통일**(알려 주시면 맞출게요)
- 망토는 몸에 붙은 단순한 천 모양(출렁이는 물리 없이)
- 필요한 동작(이름 그대로 부탁): `idle`(숨쉬기) · `walk` · `run` · `jump` · `kick`(뒷발차기) · `charm`(하트 던지기/손 흔들기) · `hit`(맞기) · `cheer`(만세) — 뼈대가 같으면 동작만 따로 받아도 돼요

## 다음에 필요한 캐릭터 (같은 방식으로)
께곡이(호랑이) · 하곡이(부엉이) · 는곡이(사슴) · 들곡이(거북이) · 사곡이(수달) · 람곡이(돼지). 토끼 결과가 좋으면 같은 프롬프트 틀에서 **생김새 문단만 바꿔서** 쓰면 돼요. 원하시면 6명분 프롬프트도 써 드릴게요.

## 코드로 다듬는 방법과의 차이 (솔직하게)
- 제가 코드(three.js 도형 조합)로 원본 그림을 닮은 3D 캐릭터를 만들 수는 있어요(토끼 때처럼). 하지만 도형 조합이라 **그림의 세밀한 질감·얼굴 표현은 Meshy보다 훨씬 단순**해요.
- 그래서 얼굴과 디테일이 중요한 주인공은 Meshy, 급하게 필요한 조연은 제가 코드로 만든 임시 3D 또는 평면 그림으로 먼저 쓰는 걸 추천해요.
