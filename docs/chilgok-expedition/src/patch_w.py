import sys, os, shutil
SP = os.path.dirname(os.path.abspath(__file__)) + "/.."
src = open(SP + "/w/base_test/index.html", encoding="utf-8").read()
import base64
MN = {k: base64.b64encode(open(SP + "/w/mn/" + k + ".webp","rb").read()).decode() for k in ("front","left","right","back","roof","gate")}
blk = open(SP + "/w/block_W.js", encoding="utf-8").read().replace("__WATERTEX__", base64.b64encode(open(SP + "/w/water_tex.webp","rb").read()).decode()) + open(SP + "/w/block_P.js", encoding="utf-8").read() + open(SP + "/w/block_H.js", encoding="utf-8").read() + (lambda t: [t := t.replace("__MN_" + k.upper() + "__", v) for k, v in MN.items()][-1])(open(SP + "/w/block_M.js", encoding="utf-8").read()) + open(SP + "/w/block_R.js", encoding="utf-8").read() + open(SP + "/w/block_S.js", encoding="utf-8").read() + open(SP + "/w/block_F.js", encoding="utf-8").read() + open(SP + "/w/block_B.js", encoding="utf-8").read().replace("__UNIT_CSV__", __import__("json").dumps(open(SP + "/w/units.csv", encoding="utf-8").read())[1:-1]).replace("__LUCIA__", base64.b64encode(open(SP + "/w/rusha_cut.webp","rb").read()).decode()).replace("__AIRUDA__", base64.b64encode(open(SP + "/w/airuda_orb.png","rb").read()).decode()) + open(SP + "/w/block_X.js", encoding="utf-8").read().replace("__SKYTEX__", base64.b64encode(open(SP + "/w/sky_tex.webp","rb").read()).decode()).replace("__TERMTEX__", base64.b64encode(open(SP + "/w/term_open.webp","rb").read()).decode()) + open(SP + "/w/block_D.js", encoding="utf-8").read() + open(SP + "/w/block_Q.js", encoding="utf-8").read()
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

FALLB = base64.b64encode(open(SP + "/w/fall_big.webp","rb").read()).decode(); FALLS = base64.b64encode(open(SP + "/w/fall_strip.webp","rb").read()).decode()
sub("    if(art && art.island && art.fall && art.fireflies){\n      var fallArtTex = artTex(art.fall),",
    "    if(art && art.fall){ art.fall = { src:\"data:image/webp;base64," + FALLB + "\", w:212, h:226, bodyX0:17, bodyX1:187, lipY1:34, midY1:140 }; }      // 하늘섬 물줄기: 갓루다님이 준 새 물줄기 그림 (V68)\n    if(art && art.island && art.fall && art.fireflies){\n      var fallArtTex = artTex(art.fall),", "new fall art")
sub("    var fallLipMat = new THREE.MeshBasicMaterial({ color:0xa9e3ff, transparent:true, opacity:0.8, side:THREE.DoubleSide, depthWrite:false });\n",
    "    var fallLipMat = new THREE.MeshBasicMaterial({ color:0xa9e3ff, transparent:true, opacity:0.8, side:THREE.DoubleSide, depthWrite:false });\n    var fallStrip = (function(){ var im = new Image(), t = new THREE.Texture(im); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2); im.onload = function(){ t.needsUpdate = true; }; im.src = \"data:image/webp;base64," + FALLS + "\"; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t; })();\n    fallMat.map = fallStrip; fallMat.color.set(0xffffff); fallMat.opacity = 0.92; fallMat.needsUpdate = true; fallLipMat.opacity = 0.35;\n", "strip fall")
sub("      fallTex.offset.y += dt*0.55;\n", "      fallTex.offset.y += dt*0.55; fallStrip.offset.y += dt*0.32;\n", "strip scroll")

sub("      var a = rnd()*Math.PI*2, wdt = 3 + rnd()*2.4;\n      var pivot = new THREE.Object3D();\n", "      var a = rnd()*Math.PI*2, wdt = 7 + rnd()*5;      // 새 물줄기 그림에 맞게 넓힘 (V68)\n      var pivot = new THREE.Object3D();\n", "wider fall")
sub("      pivot.add(lip);\n      g.add(pivot);\n    }\n", "      pivot.add(lip);\n      var mst = new THREE.Sprite(fallMistMat); mst.scale.set(wdt*3.2, wdt*2.2, 1); mst.position.set(0, -L + wdt*0.5, 2); pivot.add(mst);      // 떨어진 물이 부서지는 물안개\n      g.add(pivot);\n    }\n", "fall mist")
sub("    fallMat.map = fallStrip;", "    var fallMistTex = canvasTex(64, 64, function(g, w, h){ var gr = g.createRadialGradient(w/2, h/2, 2, w/2, h/2, w/2); gr.addColorStop(0, \"rgba(255,255,255,0.75)\"); gr.addColorStop(0.5, \"rgba(230,244,255,0.32)\"); gr.addColorStop(1, \"rgba(230,244,255,0)\"); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); });\n    var fallMistMat = new THREE.SpriteMaterial({ map:fallMistTex, transparent:true, depthWrite:false, opacity:0.55, fog:false });\n    fallMat.map = fallStrip;", "mist mat")

sub("function villageHint(p){                     // 마을에서 E 를 누르면 무엇을 하는지 알려줘요 (없으면 null)\n  var ah = window.airHint ? window.airHint(p) : null; if(ah) return ah;\n", "function villageHint(p){                     // 마을에서 E 를 누르면 무엇을 하는지 알려줘요 (없으면 null)\n  var ah = window.airHint ? window.airHint(p) : null; if(ah) return ah;\n  var mh = window.mansionHint ? window.mansionHint(p) : null; if(mh) return mh;\n", "mansion hint")
sub("  if(window.airInteract && window.airInteract(p)) return true;\n", "  if(window.airInteract && window.airInteract(p)) return true;\n  if(window.mansionInteract && window.mansionInteract(p)) return true;\n", "mansion interact")
sub("        if(window.airTick) window.airTick(t, dt, p);\n", "        if(window.airTick) window.airTick(t, dt, p);\n        if(window.mansionTick) window.mansionTick(t, dt, p);\n", "mansion tick")

sub("    if(memorialCleared()) return; // already won in a previous session: no battle\n", "    three.battle = null; return;      // 실시간 전투는 턴제 전투(block_B)로 바뀌었어요\n", "old battle off")
sub("function update(dt){\n  var p = state.player;\n", "function update(dt){\n  if(window.tbActive && window.tbActive()){ window.tbFrame(dt); return; }\n  var p = state.player;\n", "update hook")
sub("        if(window.mansionTick) window.mansionTick(t, dt, p);\n", "        if(window.mansionTick) window.mansionTick(t, dt, p);\n        if(window.tbTick) window.tbTick(t, dt, p);\n", "tb tick")

# --- 대구 가는 길 (V82)
sub("  if(x <= SKY.ground.x1 && z >= PATH_MIN_Z && z <= 2720 && tr > T.blockR){", "  if(x <= SKY.ground.x1 && z >= -40 && z <= 2720 && tr > T.blockR){", "ground in z")
sub("var PATH_MIN_Z = -40, PATH_MAX_Z = 2680;", "var PATH_MIN_Z = -33320, PATH_MAX_Z = 2680;      // 남쪽으로 대구 동대구까지 이어 붙였어요 (V84)", "path min z")
sub("  var groundLen = PATH_MAX_Z-PATH_MIN_Z+80;\n", "  var groundLen = PATH_MAX_Z-PATH_MIN_Z+80, pathLen = 2800;      // 흙길은 왜관 시내까지만 (남쪽은 아스팔트 도로)\n", "ground len")
sub('var pathTex = photoTex("path", 2, groundLen/6);', 'var pathTex = photoTex("path", 2, pathLen/6);', "path tex")
sub("plane(16, groundLen, 0xE7D9AE, 0, 0.02, (PATH_MIN_Z+PATH_MAX_Z)/2, pathTex?{map:pathTex}:null);", "plane(16, pathLen, 0xE7D9AE, 0, 0.02, 1320, pathTex?{map:pathTex}:null);", "path plane")
sub("function skyConstrain(p, px0, pz0){\n", "function skyConstrain(p, px0, pz0){\n  if(window.DG && window.DG.free && window.DG.free(p, px0, pz0)) return true;      // 왜관 아래 큰 세계 / 낙하산 (V84)\n", "para constrain")
sub("function skyHeightAt(x, z){\n", "function skyHeightAt(x, z){\n  if(window.DG && window.DG.para) return 0;      // 낙하산 타는 동안은 땅까지 내려가요\n", "para sky h")
sub("(window.RIVER && window.RIVER.hh) ? window.RIVER.hh(x, z) : 0);\n", "(window.RIVER && window.RIVER.hh) ? window.RIVER.hh(x, z) : 0, window.DG ? window.DG.h(x, z) : 0);\n", "dg ground h")
sub("((window.airPlace && window.airPlace(state.player)) || SKY_PLACE) : (state.player.x < VIL.westX - 20 ? VILLAGE_PLACE : (landPlaceAt(state.player) || currentLandmark()))", "((window.dgPlace && window.dgPlace(state.player)) || (window.airPlace && window.airPlace(state.player)) || SKY_PLACE) : (state.player.x < VIL.westX - 20 ? ((window.dgPlace && window.dgPlace(state.player)) || VILLAGE_PLACE) : ((window.dgPlace && window.dgPlace(state.player)) || landPlaceAt(state.player) || currentLandmark()))", "dg place")
sub("  var mh = window.mansionHint ? window.mansionHint(p) : null; if(mh) return mh;\n", "  var mh = window.mansionHint ? window.mansionHint(p) : null; if(mh) return mh;\n  var dh = window.dgHint ? window.dgHint(p) : null; if(dh) return dh;\n", "dg hint")
sub("  if(window.mansionInteract && window.mansionInteract(p)) return true;\n", "  if(window.mansionInteract && window.mansionInteract(p)) return true;\n  if(window.dgInteract && window.dgInteract(p)) return true;\n", "dg interact")
sub("        if(window.tbTick) window.tbTick(t, dt, p);\n", "        if(window.tbTick) window.tbTick(t, dt, p);\n        if(window.dgTick) window.dgTick(t, dt, p);\n        if(window.sqTick) window.sqTick(t, dt, p);\n", "dg tick")
sub('  if(k==="m") showScreen("world");\n', '  if(k==="m") showScreen("world");\n  if((k==="b" || k==="j") && window.dgKey) window.dgKey(k);\n', "B key")
sub("        for(var k = 0; k < 3; k++){ cur.tint[k] = a.tint[k] + (b.tint[k] - a.tint[k])*f; cur.w[k] = a.w[k] + (b.w[k] - a.w[k])*f; }\n", "        for(var k = 0; k < 3; k++){ cur.tint[k] = a.tint[k] + (b.tint[k] - a.tint[k])*f; cur.w[k] = a.w[k] + (b.w[k] - a.w[k])*f; }\n        window.__nightW = Math.min(1, cur.w[1] + 0.6*cur.w[2] + 0.35*cur.w[0]);\n", "night w")
sub("  three.playerTopSprite.visible = !hamOn; if(hamOn) three.playerLegSprite.visible = false;", "  three.playerTopSprite.visible = !hamOn && !(window.DG && window.DG.riding) && !(window.sqActive && window.sqActive()); if(hamOn || (window.DG && window.DG.riding) || (window.sqActive && window.sqActive())) three.playerLegSprite.visible = false;", "hide rider")
# 산 이름 (뒷배경 큰 산: 칠곡의 산 이름으로, 임시)
sub('sub:"팔공산 도립공원 속 옛 산성"', 'sub:"가산 위에 있는 옛 산성"', "gasan sub")
sub('showToast("🏔 가산 정상! 팔공산과 낙동강이 한눈에 내려다보여요");', 'showToast("🏔 가산 정상! 유학산과 낙동강이 한눈에 내려다보여요");', "gasan toast")
os.makedirs(SP + "/w/out", exist_ok=True); os.makedirs(SP + "/w/test", exist_ok=True)

# --- 언덕 오류 수정: 그림자 번쩍임(셰도 아크네/떨림) + 캐릭터 그림자판이 비탈에 파묻히는 문제
sub("      m.castShadow = true; m.receiveShadow = true;\n      world.add(m);\n      // a few trees dotted on the slopes", "      m.castShadow = false; m.receiveShadow = true;      // 언덕은 자기 그림자를 만들지 않아요 (비탈에서 하얀/검은 네모가 번쩍이던 원인)\n      world.add(m);\n      // a few trees dotted on the slopes", "hill self-shadow off")
sub("  sun.shadow.bias = -0.0015;\n", "  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.45;\n", "shadow bias")
sub("  three.sun.position.set(p.x + 110, 55 + skyH, p.z - 30);\n  three.sun.target.position.set(p.x, skyH, p.z);\n", """  // 그림자 창을 그림자 한 칸(텍셀) 단위로만 움직여서 걸을 때 그림자 가장자리가 떨리지 않게 해요
  var _sn = three._snap || (three._snap = { d:new THREE.Vector3(), r:new THREE.Vector3(), u:new THREE.Vector3(), t:new THREE.Vector3() });
  _sn.d.set(110, 55, -30).normalize(); _sn.r.set(0, 1, 0).cross(_sn.d).normalize(); _sn.u.copy(_sn.d).cross(_sn.r).normalize(); _sn.t.set(p.x, skyH, p.z);
  var _ts = 140/1024, _a = _sn.t.dot(_sn.r), _b = _sn.t.dot(_sn.u); _sn.t.addScaledVector(_sn.r, Math.round(_a/_ts)*_ts - _a).addScaledVector(_sn.u, Math.round(_b/_ts)*_ts - _b);
  three.sun.position.set(_sn.t.x + 110, _sn.t.y + 55, _sn.t.z - 30);
  three.sun.target.position.copy(_sn.t);
""", "shadow snap")
sub("  three.shadowMesh.position.set(p.x, groundY + 0.03, p.z);\n", """  { var _g1 = groundHeightAt(p.x + 1.5, p.z), _g2 = groundHeightAt(p.x - 1.5, p.z), _g3 = groundHeightAt(p.x, p.z + 1.5), _g4 = groundHeightAt(p.x, p.z - 1.5), _nv = three._shN || (three._shN = new THREE.Vector3());
    _nv.set(-(_g1 - _g2)/3, 1, -(_g3 - _g4)/3).normalize(); three.shadowMesh.rotation.set(0, 0, 0); three.shadowMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), _nv);
    three.shadowMesh.position.set(p.x + _nv.x*0.18, groundY + 0.03 + _nv.y*0.18, p.z + _nv.z*0.18); three.shadowMesh.material.polygonOffset = true; three.shadowMesh.material.polygonOffsetFactor = -4; three.shadowMesh.material.polygonOffsetUnits = -4; }
""", "shadow blob slope")
sub("  worldNodes.appendChild(vilBtn);\n  var zrow = document.createElement(\"div\");", "  worldNodes.appendChild(vilBtn);\n" + """
  var dgRow = document.createElement("div");
  dgRow.style.cssText = "flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:14px;";
  [["🏙 대구광역시", -90], ["국도 4호선 대구 관문", -3300], ["대구 북구", -3620], ["북구→도심 길", -10480], ["대구 도심", -20620], ["동대구 방면", -23340]].forEach(function(q, qi){
    var db = document.createElement("button"); db.className = "node-btn"; db.style.cssText = "font-size:" + (qi ? 12 : 14) + "px;padding:4px 10px;" + (qi ? "" : "font-weight:800;");
    db.innerHTML = q[0];
    db.addEventListener("click", function(){ var rx = (window.DG && DG.xOf && DG.R0) ? DG.xOf(DG.R0, q[1]) + 22 : 60; state.player.x = rx; state.player.z = q[1]; SKY_REF = 0; state.cam.yaw = state.cam.target = Math.PI; state.cam.yawVel = 0; showScreen("game"); });
    dgRow.appendChild(db);
  });
  worldNodes.appendChild(dgRow);
  var zrow = document.createElement("div");""", "daegu world nodes")
sub("  three.playerTopSprite.material.rotation = armSwing;\n", "  three.playerTopSprite.material.rotation = armSwing;\n  if(window.dgHitPose) window.dgHitPose(p);\n", "car hit pose")
open(SP + "/w/out/index.html", "w", encoding="utf-8").write(src)
HOOK = "window.__dbg = {state:state, three:three, render:render, update:update, groundHeightAt:groundHeightAt, SKY:SKY, SKY_PROPS:SKY_PROPS, SKY_SPIRAL:SKY_SPIRAL, skyWalkable:skyWalkable, tryInteract:tryInteract, villageHint:villageHint, CHARACTERS:CHARACTERS, setRef:function(v){SKY_REF=v;}, HILLS:HILLS, insideAnyHill:insideAnyHill, LAND_RECTS:LAND_RECTS, TOWN_RECTS:TOWN_RECTS, LANDMARKS:LANDMARKS, MT:MT};\n"
MARK = "/* ---------------- Boot ---------------- */"
assert src.count(MARK) == 1
open(SP + "/w/test/index.html", "w", encoding="utf-8").write(src.replace(MARK, HOOK + MARK))
for d in ("out", "test"):
    for f in os.listdir(SP + "/pub"):
        if f == "index.html": continue
        dst = SP + "/w/" + d + "/" + f
        if not os.path.exists(dst): os.symlink(SP + "/pub/" + f, dst)
os.makedirs(SP + "/w/out_sq", exist_ok=True)
open(SP + "/w/out_sq/index.html", "w", encoding="utf-8").write(src.replace(MARK, open(SP + "/w/block_SQONLY.js", encoding="utf-8").read() + MARK))
for f in os.listdir(SP + "/pub"):
    if f == "index.html": continue
    dst = SP + "/w/out_sq/" + f
    if not os.path.exists(dst): os.symlink(SP + "/pub/" + f, dst)
print("built", len(src))
