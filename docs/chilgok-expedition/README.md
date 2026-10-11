# 칠곡 원정대 (three.js 3D 미니게임) 보관본

Next.js 앱과 별개인 독립 게임이에요. 목표와 기준 사진은 `GOAL-central-village.md`.

## 바로 실행하기

`game/index.html`을 브라우저로 열면 돼요 (`three.min.js`와 같은 폴더).
조작: 방향키/WASD 이동, Space 점프, E 상호작용(낫 줍기/벼 베기/탈것/비닐하우스), M 지도, F 맵 확장.

## 폴더

| 폴더 | 내용 |
|---|---|
| `game/` | 완성본(게시본 V37과 같은 파일). `skyart.js`는 생성물(약 5MB) |
| `src/base/index.html` | 원본 게임(하늘섬/마을을 얹기 전). 패치의 기준 |
| `src/sky/` | 하늘섬·마법 나무·마을 코드 블록(`block_*.js`)과 이를 원본에 끼워 넣는 `apply_patches.py` |
| `src/tools/` | 빌드/테스트 스크립트 (`make_skyart.js`, `rebuild.sh`, `regress2.js`, `zone_walk.js`, ...) |
| `assets/village/` | 마을용 잘라낸 PNG(건물 면, 소품, 바닥 타일) |
| `assets/new5`, `assets/new6` | 제미나이 원본 시트 |
| `source-images/` | 지금까지 받은 모든 이미지(번호순) |
| `ref/` | 목표 기준 사진 |

## 다시 빌드하는 법 (⚠ 경로 수정 필요)

도구 스크립트들은 만든 작업 환경의 임시 폴더(`$SP`)를 기준으로 쓰여 있어요. 새 환경에서 쓰려면 `SP`를 이 폴더에 맞게 바꿔야 해요.

1. `node src/tools/make_skyart.js <SP> <이미지폴더>` → `assets/skyart.js` 생성 (`VT`/`VP` 목록에 있는 이미지만 포함)
2. `src/tools/rebuild.sh` → `apply_patches.py`가 `src/base/index.html`에 `src/sky/*`를 끼워 `index.html` 생성
3. 테스트: `regress2.js`(기존 맵이 원본과 픽셀 동일한지, 12/12 필요), `zone_walk.js`, `cwalk.js`, `farm_test.js`, `ride_test.js`, `rice_test.js`
4. 테스트용 복사본에는 `window.__dbg` 훅이 들어가요. 게시용(`build_artifact.sh`)에는 없어요.

테스트는 Playwright(크롬)와 `imgdiff`(pngjs, pixelmatch) 패키지가 필요해요 (저장소에는 넣지 않았어요).

## 주의

- 기존 맵(x ≥ -620)은 원본과 픽셀 하나도 달라지면 안 돼요 (`regress2.js` 12/12).
- 이 폴더는 Next.js 빌드/린트 대상이 아니에요 (`eslint.config.mjs`에서 제외).
