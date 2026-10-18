# 턴제 스킬/특성/버프 — 1단계: 이벤트 종류 정의 (V83)

코드: `src/battle/block_B.js` 의 `EVT / evOn / evEmit` (밖에서는 `window.TBEvents`).

| 이벤트 | 데이터 | 언제 |
|---|---|---|
| `OnBattleStart` | `{}` | 전투 시작(턴 1 이전) |
| `OnTurnStart` | `{turn, side}` | 플레이어 턴 시작 (`side:"rok"`) |
| `OnTurnEnd` | `{turn, side}` | 플레이어 턴 끝(`"rok"`), 적 행동까지 끝난 라운드 끝(`"nk"`) |
| `OnDamaged` | `{target, source, amount, hpAfter, lethal}` | 턴제 공격으로 피해를 입었을 때 |
| `OnKilled` | `{target, source}` | HP가 0이 된 직후 (OnDamaged 뒤) |

사용: `TBEvents.on("OnDamaged", function(e){...})` → 해제 함수를 돌려줘요. 모르는 이름은 오류.
스킬·특성·버프가 같은 이벤트 이름과 데이터 모양을 공유하는 것이 목적이라, 다음 단계(조건 공유·버프)는 이 위에 얹어요.

## 확인한 것 / 한계
- 실제 전투 흐름으로 확인: 시작 1회, 턴 시작/끝, 피해 175회, 쓰러짐 9회가 순서대로 발생.
- `source`(누가 때렸나)는 아직 대부분 `null` — `applyDmg(t, dmg, src)` 호출부에서 공격자를 넘겨줘야 해요(2단계).
- 실시간 난전(ambient)과 우클릭 되돌리기 중에는 이벤트가 안 나가요(되돌리기 시 효과 복구는 버프 단계에서 설계).
- 적 턴 시작(`OnTurnStart side:"nk"`)은 아직 없어요.
