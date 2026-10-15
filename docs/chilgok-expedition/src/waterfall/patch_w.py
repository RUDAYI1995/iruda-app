import sys, os, shutil
SP = os.path.dirname(os.path.abspath(__file__)) + "/.."
src = open(SP + "/pub/index.html", encoding="utf-8").read()
import base64
blk = open(SP + "/w/block_W.js", encoding="utf-8").read().replace("__WATERTEX__", base64.b64encode(open(SP + "/w/water_tex.webp","rb").read()).decode()) + open(SP + "/w/block_P.js", encoding="utf-8").read() + open(SP + "/w/block_H.js", encoding="utf-8").read() + open(SP + "/w/block_X.js", encoding="utf-8").read().replace("__SKYTEX__", base64.b64encode(open(SP + "/w/sky_tex.webp","rb").read()).decode())
def sub(old, new, label):
    global src
    n = src.count(old); assert n == 1, "%s: %d" % (label, n); src = src.replace(old, new)
sub("    // ---------- 하루 흐름 (낮 → 저녁 → 밤 → 새벽 → 아침 → 낮) + 소리 ----------\n", blk + "    // ---------- 하루 흐름 (낮 → 저녁 → 밤 → 새벽 → 아침 → 낮) + 소리 ----------\n", "W block")
sub("      if(nearShop(txNear, tz) || insideMountain", "      if((tz > 548 && tz < 832) || nearShop(txNear, tz) || insideMountain", "tree near")
sub("      if(nearShop(txFar, tz+18) || insideMountain", "      if((tz + 18 > 548 && tz + 18 < 832) || nearShop(txFar, tz+18) || insideMountain", "tree far")
sub("b.mesh.position.y = 0.4 + Math.sin(tt*1.3)*0.15;", "b.mesh.position.y = 0.4 + (b.dy || 0) + Math.sin(tt*1.3)*0.15;", "boat dy")
sub("        if(window.dinoTick) window.dinoTick(t, dt, p);\n", "        if(window.dinoTick) window.dinoTick(t, dt, p);\n        if(window.riverTick) window.riverTick(t, dt, p);\n        if(window.planeTick) window.planeTick(t, dt, p);\n", "tick")
sub("plain.position.y = -0.6;", "plain.position.y = -3;", "plain y")
sub("three.plain.position.set(p.x, -0.6, p.z);", "three.plain.position.set(p.x, -3, p.z);", "plain follow")

sub("  var desiredY = 16 + camGY + p.y*0.4 + 15*cs.vk, camBack = 32 + 14*cs.vk;\n",
    "  cs.pv = (cs.pv || 0) + ((cs.pt || 0) - (cs.pv || 0))*Math.min(1, dt*6); var pv = Math.abs(cs.pv) < 0.002 ? 0 : cs.pv;      // 마우스 위아래 시점 (위 = 하늘 쪽, 아래 = 내려다보기)\n  var desiredY = 16 + camGY + p.y*0.4 + 15*cs.vk + (pv < 0 ? -pv*30 : -pv*8), camBack = 32 + 14*cs.vk + (pv < 0 ? -pv*10 : 0);\n", "pitch cam")
sub("camGY + 3 + p.y + Math.min(1, skyH/SKY.H)*12, (inSkyCam", "camGY + 3 + p.y + Math.min(1, skyH/SKY.H)*12 + (pv > 0 ? pv*26 : pv*14), (inSkyCam", "pitch look")
sub("  if(k === \"f\"){ setMapExpanded(!mapExpanded); }\n", "  if(k === \"f\"){ setMapExpanded(!mapExpanded); }\n  else if(k === \"c\"){ var cs0 = state.cam; cs0.plock = !cs0.plock; showToast(cs0.plock ? \"🔒 시점 고정 (C로 풀기)\" : \"🔓 시점 자유 — 마우스를 위아래로 움직여 보세요 (C로 고정)\"); }\n", "key c")
sub("expandBtn.addEventListener(\"click\", function(){ setMapExpanded(!mapExpanded); expandBtn.blur(); });\n", "expandBtn.addEventListener(\"click\", function(){ setMapExpanded(!mapExpanded); expandBtn.blur(); });\n(function(){ var ch = document.getElementById(\"canvasHolder\");\n  ch.addEventListener(\"mousemove\", function(e){ var cs = state.cam; if(cs.plock) return; var r = ch.getBoundingClientRect(); if(!r.height) return; var v = -((e.clientY - r.top)/r.height - 0.5)*2, a = Math.abs(v); cs.pt = a < 0.14 ? 0 : (v < 0 ? -1 : 1)*Math.min(1, (a - 0.14)/0.8); });\n})();\n", "mouse pitch")
sub("E 살펴보기 · M 지도 · F 맵 확장", "E 살펴보기 · M 지도 · F 맵 확장<br>마우스 위아래 시점 · C 시점 고정", "help")

sub("  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z), skyHeightAt(x, z));\n", "  if((bridgeH <= 0 || Math.abs(x) >= 10) && window.RIVER && window.RIVER.water && window.RIVER.water(x, z)) return -0.25;      // 강물 위를 헤엄쳐요\n  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z), skyHeightAt(x, z), (window.RIVER && window.RIVER.hh) ? window.RIVER.hh(x, z) : 0);\n", "ground river")
sub("function landPush(p, px0, pz0){\n", "function landPush(p, px0, pz0){\n  if(window.RIVER && window.RIVER.push) window.RIVER.push(p, px0, pz0);      // 폭포 언덕: 오를 수 있는 경사만\n", "landPush river")

sub("    p.x += dxw * SPEED * p.spdK * (window.vilRideMul || 1) * dt;\n    p.z += dzw * SPEED * p.spdK * (window.vilRideMul || 1) * dt;\n",
    "    var swM = p.swim ? 0.6 : 1;      // 헤엄칠 때는 천천히\n    p.x += dxw * SPEED * p.spdK * (window.vilRideMul || 1) * swM * dt;\n    p.z += dzw * SPEED * p.spdK * (window.vilRideMul || 1) * swM * dt;\n", "swim speed")
sub("  SKY_REF = (p.x > SKY.edgeX) ? skyHeightAt(p.x, p.z) : 0;\n\n  if(state.keys.jump && p.onGround){",
    "  SKY_REF = (p.x > SKY.edgeX) ? skyHeightAt(p.x, p.z) : 0;\n  p.swim = !!(window.RIVER && window.RIVER.water && window.RIVER.water(p.x, p.z) && (bridgeHeightAt(p.z) <= 0 || Math.abs(p.x) >= 10) && p.y < 1.5);\n\n  if(state.keys.jump && p.onGround && !p.swim){", "swim flag")
sub("  var riseY = groundY + p.y + bob;\n",
    "  p.swimK = (p.swimK || 0) + ((p.swim ? 1 : 0) - (p.swimK || 0))*Math.min(1, dt*7);\n  var swK = p.swimK < 0.02 ? 0 : p.swimK, swimPh = 0;\n  if(swK > 0){ p.sph = (p.sph || 0) + dt*(p.walking ? 6.4 : 2.2); swimPh = p.sph; bob = 0; }\n  if(window.swimFx) window.swimFx(p, dt, t, swK);\n  var riseY = groundY + p.y + bob;\n", "swim ph")
sub("  three.playerLegSprite.material.rotation = legSwing;\n",
    "  three.playerLegSprite.material.rotation = legSwing;\n  three.playerLegSprite.visible = swK < 0.35;\n", "leg vis")
sub("  three.playerTopSprite.material.rotation = armSwing;\n",
    "  three.playerTopSprite.material.rotation = armSwing;\n  if(swK > 0){        // 수영: 몸 아래쪽을 물에 담그고(클립), 숨 쉬듯 떠오르고, 팔을 젓듯 좌우로 기울이고 늘었다 줄어요\n    var stroke = Math.sin(swimPh), moving = p.walking ? 1 : 0.35, heave = Math.sin(swimPh*0.5)*0.35;\n    three.playerTopSprite.scale.set(baseW*(1.02 + 0.08*Math.abs(stroke)*moving)*sxFactor, topH*(0.98 - 0.05*Math.abs(stroke)*moving)*syFactor, 1);\n    three.playerTopSprite.position.set(p.x, groundY + topH*(0.5 - 0.17*swK) + 0.2 + heave*swK + 0.35*Math.abs(stroke)*moving*swK, p.z);\n    three.playerTopSprite.material.rotation = stroke*0.17*moving*swK + Math.sin(swimPh*0.5)*0.03*swK;\n  }\n", "swim top")
sub("      window.sfxStep = function(runK){", "      window.sfxSplash = function(v){\n        if(!AC || muted) return; var n = AC.currentTime, ns = AC.createBufferSource(); ns.buffer = noiseB(); var f = AC.createBiquadFilter(); f.type = \"bandpass\"; f.Q.value = 0.7; f.frequency.setValueAtTime(1800, n); f.frequency.exponentialRampToValueAtTime(500, n + 0.5);\n        var g = AC.createGain(); g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(0.16*(v || 1), n + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.55); ns.connect(f); f.connect(g); g.connect(master); ns.start(n, Math.random()*0.4); ns.stop(n + 0.6);\n      };\n      window.sfxStep = function(runK){", "sfx splash")

sub("  three.playerTopSprite.material.rotation = armSwing;\n  if(swK > 0){",
    "  three.playerTopSprite.material.rotation = armSwing;\n  var hamOn = window.hamgokiUpdate ? window.hamgokiUpdate(p, dt, t, groundY, runK, swK, swimPh, state.cam.yaw) : false;\n  if(swK > 0){", "ham call")

sub("  // The world is thousands of units long, far more than one shadow map can\n", "  three.playerTopSprite.visible = !hamOn; if(hamOn) three.playerLegSprite.visible = false;      // 3D 캐릭터일 때는 그림 조각을 숨겨요\n  // The world is thousands of units long, far more than one shadow map can\n", "ham vis")

sub("function skyBranchCands(x, z, c){\n  var i, hw2 = SKY_BR_HW*SKY_BR_HW;\n", "function skyBranchCands(x, z, c){\n  var i, hw2 = SKY_BR_HW*SKY_BR_HW;\n  if(window.airCands) window.airCands(x, z, c);      // 스카이캣 공항 섬 / 기내\n", "air cands")
sub("function villageHint(p){                     // 마을에서 E 를 누르면 무엇을 하는지 알려줘요 (없으면 null)\n", "function villageHint(p){                     // 마을에서 E 를 누르면 무엇을 하는지 알려줘요 (없으면 null)\n  var ah = window.airHint ? window.airHint(p) : null; if(ah) return ah;\n", "air hint")
sub("function villageInteract0(p){                 // 처리했으면 true\n", "function villageInteract0(p){                 // 처리했으면 true\n  if(window.airInteract && window.airInteract(p)) return true;\n", "air interact")
sub("  if(k===\"m\") showScreen(\"world\");\n", "  if(k===\"m\") showScreen(\"world\");\n  if(k===\"j\" && window.airKey) window.airKey();\n", "J key")
sub("  var m = (state.player.x > SKY.edgeX) ? SKY_PLACE :", "  var m = (state.player.x > SKY.edgeX) ? ((window.airPlace && window.airPlace(state.player)) || SKY_PLACE) :", "air place")
sub("        if(window.riverTick) window.riverTick(t, dt, p);\n", "        if(window.riverTick) window.riverTick(t, dt, p);\n        if(window.airTick) window.airTick(t, dt, p);\n", "air tick")
sub("E 살펴보기 · M 지도 · F 맵 확장<br>마우스 위아래 시점 · C 시점 고정", "E 살펴보기 · M 지도 · F 맵 확장<br>마우스 위아래 시점 · C 시점 고정 · J 선장님 호출(비행기 안)", "help j")
os.makedirs(SP + "/w/out", exist_ok=True); os.makedirs(SP + "/w/test", exist_ok=True)
open(SP + "/w/out/index.html", "w", encoding="utf-8").write(src)
HOOK = "window.__dbg = {state:state, three:three, render:render, update:update, groundHeightAt:groundHeightAt, SKY:SKY, SKY_PROPS:SKY_PROPS, SKY_SPIRAL:SKY_SPIRAL, skyWalkable:skyWalkable, tryInteract:tryInteract, villageHint:villageHint, CHARACTERS:CHARACTERS, setRef:function(v){SKY_REF=v;}};\n"
MARK = "/* ---------------- Boot ---------------- */"
assert src.count(MARK) == 1
open(SP + "/w/test/index.html", "w", encoding="utf-8").write(src.replace(MARK, HOOK + MARK))
for d in ("out", "test"):
    for f in os.listdir(SP + "/pub"):
        if f == "index.html": continue
        dst = SP + "/w/" + d + "/" + f
        if not os.path.exists(dst): os.symlink(SP + "/pub/" + f, dst)
print("built", len(src))
