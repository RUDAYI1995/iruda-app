import sys, io

base_path, block_a_path, block_e_path, out_path = sys.argv[1:5]
src = open(base_path, encoding="utf-8").read()
block_a = open(block_a_path, encoding="utf-8").read()
block_e = open(block_e_path, encoding="utf-8").read()
import os
block_g = open(os.path.join(os.path.dirname(block_e_path), "block_G.js"), encoding="utf-8").read()
assert block_e.count("/*BLOCK_G*/\n") == 1
block_e = block_e.replace("/*BLOCK_G*/\n", block_g)
block_t = open(os.path.join(os.path.dirname(block_e_path), "block_T.js"), encoding="utf-8").read()
assert block_e.count("/*BLOCK_T*/\n") == 1
block_e = block_e.replace("/*BLOCK_T*/\n", block_t)
block_v = open(os.path.join(os.path.dirname(block_e_path), "block_V.js"), encoding="utf-8").read()
assert block_e.count("/*BLOCK_V*/\n") == 1
block_e = block_e.replace("/*BLOCK_V*/\n", block_v)
block_d = open(os.path.join(os.path.dirname(block_e_path), "block_D.js"), encoding="utf-8").read()
assert block_e.count("/*BLOCK_D*/\n") == 1
block_e = block_e.replace("/*BLOCK_D*/\n", block_d)


def sub(old, new, label):
    global src
    n = src.count(old)
    assert n == 1, "%s: expected exactly 1 match, found %d" % (label, n)
    src = src.replace(old, new)



# ================= 카메라: 걷는 방향을 따라 도는 시점 =================
# C1: camera state
sub(
    "  cam: { yaw:0, target:0, flipT:0, fx:null, fz:null, prevV:0, latchFacing:1 }\n",
    "  cam: { yaw:0, target:0, turn:null, fx:null, fz:null, prevV:0, prevSx:0, mvx:0, mvz:0 }\n",
    "C1 cam state",
)

# C2: helpers (turn timing constants, angle wrap, turn start)
sub(
    "var SPEED = 93;      // world units per second\n",
    "// 카메라는 걷는 방향을 따라 돌아요: 위/아래는 거의 바로, 왼쪽/오른쪽은 1초에 걸쳐 부드럽게\n"
    "var CAM_FLIP_SEC = 0.25;\n"
    "var CAM_SIDE_SEC = 1.0;\n"
    "function wrapAngle(a){ a = (a + Math.PI) % (2*Math.PI); if(a < 0) a += 2*Math.PI; return a - Math.PI; }\n"
    "function turnCameraTo(heading, sec){\n"
    "  var cs = state.cam;\n"
    "  var to = wrapAngle(heading);\n"
    "  cs.target = to;\n"
    "  cs.turn = { from: cs.yaw, to: cs.yaw + wrapAngle(to - cs.yaw), t: 0, dur: Math.max(0.001, sec) };\n"
    "}\n"
    "var SPEED = 93;      // world units per second\n",
    "C2 helpers",
)

# C3: input -> walking direction + camera heading (replaces the old 0/180-degree flip logic)
a = src.index("  var sx = (state.keys.right?1:0) - (state.keys.left?1:0);")
b = src.index("  p.x = Math.max(X_MIN, Math.min(X_MAX, p.x));")
new_input = """  var sx = (state.keys.right?1:0) - (state.keys.left?1:0);   // screen-relative: + = screen right
  var rawV = (state.keys.up?1:0) - (state.keys.down?1:0);    // screen-relative: + = up on screen
  // 걷는 방향은 방향키 조합이 바뀔 때 한 번 정하고, 키를 누르고 있는 동안은 그대로 유지해요
  // (카메라가 도는 동안에도 길이 휘지 않게). 카메라는 그 방향을 앞으로 보도록 돌아요:
  //  - 아래: 바로(CAM_FLIP_SEC) 뒤돌아서 캐릭터가 앞을 보게
  //  - 왼쪽/오른쪽: CAM_SIDE_SEC(1초) 동안 옆으로 돌아서 캐릭터가 앞을 보게
  if(sx !== cs.prevSx || rawV !== cs.prevV){
    cs.prevSx = sx; cs.prevV = rawV;
    var H = cs.target;                                 // 지금 보는 방향 (화면의 "위"가 가리키는 월드 방향)
    var fwdX = Math.sin(H), fwdZ = Math.cos(H);
    var rgtX = -Math.cos(H), rgtZ = Math.sin(H);       // 화면 오른쪽이 가리키는 월드 방향
    cs.mvx = rawV*fwdX + sx*rgtX;
    cs.mvz = rawV*fwdZ + sx*rgtZ;
    if(Math.abs(cs.mvx) < 1e-9) cs.mvx = 0;
    if(Math.abs(cs.mvz) < 1e-9) cs.mvz = 0;
    if(rawV < 0) turnCameraTo(H + Math.PI, CAM_FLIP_SEC);
    else if(rawV === 0 && sx !== 0) turnCameraTo(H - sx*Math.PI/2, CAM_SIDE_SEC);
  }
  if(cs.mvx || cs.mvz){
    var len = Math.hypot(cs.mvx, cs.mvz), dxw = cs.mvx/len, dzw = cs.mvz/len;
    p.x += dxw * SPEED * (window.vilRideMul || 1) * dt;
    p.z += dzw * SPEED * (window.vilRideMul || 1) * dt;
    p.walking = true;
    // 실제로 걸어간 방향을 "화면 기준"으로 보여줘요: 카메라에서 멀어지면 뒷모습, 다가오면 앞모습,
    // 옆으로 가면 옆모습 (카메라가 돌아가는 중에도 지금 보는 각도 기준)
    var sY = Math.sin(cs.yaw), cY = Math.cos(cs.yaw);
    var away = dxw*sY + dzw*cY, across = -dxw*cY + dzw*sY;   // + across = 화면 오른쪽
    if(Math.abs(away) >= Math.abs(across) - 1e-6) p.dir = away > 0 ? "back" : "front";
    else p.dir = across > 0 ? "right" : "left";
  }
"""
src = src[:a] + new_input + src[b:]

# C4: smooth, time-based camera turn (replaces the old exponential easing toward 0/PI)
sub(
    "  cs.yaw += (cs.target - cs.yaw) * (1 - Math.pow(0.003, dt));\n  if(Math.abs(cs.target - cs.yaw) < 0.002) cs.yaw = cs.target;\n",
    "  if(cs.turn){\n"
    "    cs.turn.t += dt;\n"
    "    var tk = Math.min(1, cs.turn.t / cs.turn.dur);\n"
    "    tk = tk*tk*(3 - 2*tk);\n"
    "    cs.yaw = cs.turn.from + (cs.turn.to - cs.turn.from)*tk;\n"
    "    if(cs.turn.t >= cs.turn.dur){ cs.yaw = wrapAngle(cs.turn.to); cs.turn = null; }\n"
    "  }\n",
    "C4 yaw turn",
)

# C5: units pick front/back/side art from the real camera angle (was: only 0 or 180 degrees)
sub(
    "  var camSide = Math.cos(state.cam.yaw) >= 0 ? -1 : 1;  // world +X is screen-left at yaw 0, screen-right at yaw PI\n",
    "  var camSinY = Math.sin(state.cam.yaw), camCosY = Math.cos(state.cam.yaw);   // world +X is screen-left at yaw 0, screen-right at yaw PI\n",
    "C5a camSide",
)
sub(
    "      var camF = Math.cos(state.cam.yaw) >= 0 ? 1 : -1;\n      var away = u.hz * camF, side = u.hx * camSide;       // + away = heading away from the camera; + side = toward screen-right\n",
    "      var away = u.hx*camSinY + u.hz*camCosY, side = -u.hx*camCosY + u.hz*camSinY;   // + away = heading away from the camera; + side = toward screen-right\n",
    "C5b tank view",
)
sub(
    "        var away = u.faceZ * (Math.cos(state.cam.yaw) >= 0 ? 1 : -1) > 0;\n",
    "        var away = u.faceZ * Math.cos(state.cam.yaw) > 1e-6;\n",
    "C5c soldier view",
)

# C6: flat tree pictures turn with the camera so they don't turn edge-on (vanish) when viewed from the side
sub(
    "  three.facers = [];      // groups that turn to face the camera every frame\n",
    "  three.facers = [];      // groups that turn to face the camera every frame\n  three.treeCards = [];   // flat tree pictures that turn with the camera heading\n",
    "C6a treeCards list",
)
sub(
    "    mesh.position.set(x, h/2 - h*TREE_SINK, z);\n    world.add(mesh);\n",
    "    mesh.position.set(x, h/2 - h*TREE_SINK, z);\n    world.add(mesh);\n    three.treeCards.push(mesh);\n",
    "C6b register tree",
)
sub(
    "  for(var fi=0; fi<three.facers.length; fi++) three.facers[fi].rotation.y = cs.yaw + Math.PI;\n",
    "  for(var fi=0; fi<three.facers.length; fi++) three.facers[fi].rotation.y = cs.yaw + Math.PI;\n"
    "  for(var ti=0; ti<three.treeCards.length; ti++) three.treeCards[ti].rotation.y = cs.yaw;\n",
    "C6c turn trees",
)

# C7: distant mountains: four sets (N, E, S, W). Only the set that matches the camera heading is shown
# (cross-fading while the camera turns), so side views never expose the card edges of the other sets.
sub(
    "    function card(key, H, dist, dx, dz, opacity, order, flip){\n",
    "    function card(key, H, dist, dx, dz, opacity, order, flip, heading){\n",
    "C7a card signature",
)
sub(
    "      three.bg.push({ g:g, dx:dx, dz:dz });\n",
    "      three.bg.push({ g:g, dx:dx, dz:dz, mat:m.material, op:opacity, hd:(heading || 0) });\n",
    "C7b card push",
)
sub(
    "    card(\"palgong\", 600, 1700,  350, -1700, 0.92, -9, true);\n",
    "    card(\"palgong\", 600, 1700,  350, -1700, 0.92, -9, true, Math.PI);\n",
    "C7c1 south palgong",
)
sub(
    "    card(\"yuhak\",   330, 1250, -720, -1250, 0.96, -8, true);\n",
    "    card(\"yuhak\",   330, 1250, -720, -1250, 0.96, -8, true, Math.PI);\n",
    "C7c2 south yuhak",
)
sub(
    "    card(\"chiki\",   250, 1000,  760, -1000, 1.00, -7, true);\n",
    "    card(\"chiki\",   250, 1000,  760, -1000, 1.00, -7, true, Math.PI);\n",
    "C7c3 south chiki",
)
sub(
    "    card(\"gasan\",   290,  950, -250,  -950, 1.00, -6, true);\n",
    "    card(\"gasan\",   290,  950, -250,  -950, 1.00, -6, true, Math.PI);\n"
    "    // east (+x) and west (-x): the same ranges turned to the side\n"
    "    card(\"palgong\", 640, 1700,  1700,  150, 0.92, -9, false, Math.PI/2);\n"
    "    card(\"yuhak\",   330, 1250,  1250, -820, 0.96, -8, false, Math.PI/2);\n"
    "    card(\"chiki\",   250,  980,   980,  800, 1.00, -7, false, Math.PI/2);\n"
    "    card(\"gasan\",   300,  940,   940,  430, 1.00, -6, false, Math.PI/2);\n"
    "    card(\"palgong\", 600, 1700, -1700, -150, 0.92, -9, true, -Math.PI/2);\n"
    "    card(\"yuhak\",   330, 1250, -1250,  820, 0.96, -8, true, -Math.PI/2);\n"
    "    card(\"chiki\",   250, 1000,  -980, -800, 1.00, -7, true, -Math.PI/2);\n"
    "    card(\"gasan\",   290,  950,  -940, -430, 1.00, -6, true, -Math.PI/2);\n",
    "C7c4 south gasan + east/west",
)
sub(
    "    bgc.g.rotation.y = cs.yaw + Math.PI;\n",
    "    bgc.g.rotation.y = cs.yaw + Math.PI;\n"
    "    // 보는 방향과 맞는 산 그림 세트만 보이고, 카메라가 돌 때는 부드럽게 바뀌어요\n"
    "    var bw = Math.max(0, Math.min(1, (Math.cos(cs.yaw - bgc.hd) - 0.55) / 0.45));\n"
    "    bgc.g.visible = bw > 0.001;\n"
    "    bgc.mat.opacity = bgc.op * bw;\n",
    "C7d heading weights",
)

# P8: load the AI art file (optional: the sky zone works without it)
sub(
    '<script src="mountains.js?v=1"></script>',
    '<script src="mountains.js?v=1"></script>\n<script src="skyart.js"></script>',
    "P8 skyart script tag",
)

# P1: ground height gets the sky term (0 everywhere in the existing map) + the sky helper block
sub(
    "  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z));\n}\n",
    "  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z), skyHeightAt(x, z));\n}\n" + block_a,
    "P1 groundHeightAt",
)

# P2: remember the previous position, and let the sky zone resolve moves beyond the old east edge
sub(
    "function update(dt){\n  var p = state.player;\n",
    "function update(dt){\n  var p = state.player;\n  var px0 = p.x, pz0 = p.z;\n",
    "P2a update head",
)
sub(
    "  p.x = Math.max(X_MIN, Math.min(X_MAX, p.x));\n  p.z = Math.max(PATH_MIN_Z, Math.min(PATH_MAX_Z, p.z));\n",
    "  if(!skyConstrain(p, px0, pz0)){\n"
    "    p.x = Math.max(X_MIN, Math.min(X_MAX, p.x));\n"
    "    p.z = Math.max(PATH_MIN_Z, Math.min(PATH_MAX_Z, p.z));\n"
    "  }\n"
    "  SKY_REF = (p.x > SKY.edgeX) ? skyHeightAt(p.x, p.z) : 0;\n",
    "P2b clamp",
)

# P3: shadow window follows the player up onto the sky islands (skyH is 0 in the existing map)
sub(
    "  three.sun.position.set(p.x + 110, 55, p.z - 30);\n  three.sun.target.position.set(p.x, 0, p.z);\n",
    "  var skyH = skyHeightAt(p.x, p.z);\n"
    "  three.sun.position.set(p.x + 110, 55 + skyH, p.z - 30);\n"
    "  three.sun.target.position.set(p.x, skyH, p.z);\n",
    "P3 sun",
)

# P4: camera looks a bit more level on the sky islands, and the sky layer animates
sub(
    "  cam.lookAt(p.x + sinY*14, groundY + 3 + p.y, p.z + cosY*14);\n\n  three.renderer.render(three.scene, three.camera);\n",
    "  cam.lookAt(p.x + sinY*14, groundY + 3 + p.y + Math.min(1, skyH/SKY.H)*12, p.z + cosY*14);\n"
    "  if(three.skyUpdate){ try{ three.skyUpdate(t, dt, p, skyH); }catch(skyErr2){ if(window.console) console.warn(\"skyUpdate failed:\", skyErr2); three.skyUpdate = null; } }\n  if(three.dayUpdate){ try{ three.dayUpdate(t, dt, p); }catch(dayErr){ if(window.console) console.warn(\"dayUpdate failed:\", dayErr); three.dayUpdate = null; } }\n\n"
    "  three.renderer.render(three.scene, three.camera);\n",
    "P4 camera",
)

# P5: HUD shows the sky island name while standing out there
sub(
    "function updateHud(force){\n  var m = currentLandmark();\n",
    "function updateHud(force){\n  var m = (state.player.x > SKY.edgeX) ? SKY_PLACE : (state.player.x < VIL.westX - 20 ? VILLAGE_PLACE : currentLandmark());\n",
    "P5 hud",
)

# P6: world-select screen gets one extra quick-travel stop after the existing six
sub(
    "  var cur = currentLandmark();\n  LANDMARKS.forEach(function(m, i){\n",
    "  var inSky = state.player.x > SKY.edgeX;\n  var cur = inSky ? {id:-1} : currentLandmark();\n  LANDMARKS.forEach(function(m, i){\n",
    "P6a cur",
)
sub(
    "  stampDots(stampRow);\n}\ndocument.getElementById(\"btnMap\")",
    "  var skyLine = document.createElement(\"div\");\n"
    "  skyLine.style.cssText = \"flex:1;align-self:center;height:3px;background:var(--panel-border);min-width:14px;margin-top:-20px;\";\n"
    "  worldNodes.appendChild(skyLine);\n"
    "  var skyBtn = document.createElement(\"button\");\n"
    "  skyBtn.className = \"node-btn\";\n"
    "  skyBtn.innerHTML = '<div class=\"node-dot' + (inSky ? ' current' : '') + '\">\\u2601</div><div class=\"node-label\">하늘섬</div>';\n"
    "  skyBtn.addEventListener(\"click\", function(){\n"
    "    state.player.x = SKY.pathX;\n"
    "    state.player.z = SKY.gateZ + 8;\n"
    "    SKY_REF = SKY.H;\n"
    "    showScreen(\"game\");\n"
    "  });\n"
    "  worldNodes.appendChild(skyBtn);\n"
    "  var treeLine = document.createElement(\"div\");\n"
    "  treeLine.style.cssText = skyLine.style.cssText;\n"
    "  worldNodes.appendChild(treeLine);\n"
    "  var treeBtn = document.createElement(\"button\");\n"
    "  treeBtn.className = \"node-btn\";\n"
    "  treeBtn.innerHTML = '<div class=\"node-dot\">\\u{1F333}</div><div class=\"node-label\">마법 나무</div>';\n"
    "  treeBtn.addEventListener(\"click\", function(){\n"
    "    var s0 = skySpiralAt(0);\n"
    "    state.player.x = s0.x + Math.cos(s0.th)*16;\n"
    "    state.player.z = s0.z + Math.sin(s0.th)*16;\n"
    "    SKY_REF = 0;\n"
    "    showScreen(\"game\");\n"
    "  });\n"
    "  worldNodes.appendChild(treeBtn);\n"
    "  var vilLine = document.createElement(\"div\");\n"
    "  vilLine.style.cssText = skyLine.style.cssText;\n"
    "  worldNodes.appendChild(vilLine);\n"
    "  var vilBtn = document.createElement(\"button\");\n"
    "  vilBtn.className = \"node-btn\";\n"
    "  vilBtn.innerHTML = '<div class=\"node-dot\">\\u{1F33E}</div><div class=\"node-label\">농촌 마을</div>';\n"
    "  vilBtn.addEventListener(\"click\", function(){\n"
    "    state.player.x = -700; state.player.z = VIL.roadZ; SKY_REF = 0;\n"
    "    state.cam.yaw = state.cam.target = -Math.PI/2; state.cam.yawVel = 0;\n"
    "    showScreen(\"game\");\n"
    "  });\n"
    "  worldNodes.appendChild(vilBtn);\n"
    "  stampDots(stampRow);\n}\ndocument.getElementById(\"btnMap\")",
    "P6b node",
)

# P7: build the sky zone right before the player's shadow blob (inside initThree)
sub(
    "  // player shadow (flat circle)\n",
    "  try{\n" + block_e + "\n  }catch(skyErr){ if(window.console) console.warn(\"sky zone failed (the game keeps working):\", skyErr); three.skyUpdate = null; }\n  // player shadow (flat circle)\n",
    "P7 build",
)

# ---- N: smoother camera (critically-damped yaw spring, smoothed focus height) + rope-path assist ----
sub(
    "  cs.target = to;\n  cs.turn = { from: cs.yaw, to: cs.yaw + wrapAngle(to - cs.yaw), t: 0, dur: Math.max(0.001, sec) };\n",
    "  cs.target = to;\n  cs.turn = null;\n  cs.omega = 5.5 / Math.max(0.05, sec);\n  cs.maxVel = arguments[2] || 1e9;\n",
    "N1 turnCameraTo spring",
)
sub(
    "  if(cs.turn){\n    cs.turn.t += dt;\n    var tk = Math.min(1, cs.turn.t / cs.turn.dur);\n    tk = tk*tk*(3 - 2*tk);\n    cs.yaw = cs.turn.from + (cs.turn.to - cs.turn.from)*tk;\n    if(cs.turn.t >= cs.turn.dur){ cs.yaw = wrapAngle(cs.turn.to); cs.turn = null; }\n  }\n",
    "  {\n"
    "    // 목표 방향으로 속도가 끊기지 않게(방향을 바꿔도 부드럽게) 도는 감쇠 스프링\n"
    "    var om = cs.omega || 5.5, vel = cs.yawVel || 0, nSub = Math.max(1, Math.ceil(dt/0.008)), hh = dt/nSub;\n"
    "    for(var si = 0; si < nSub; si++){\n"
    "      var er = wrapAngle(cs.target - cs.yaw);\n"
    "      vel += (om*om*er - 2*om*vel) * hh;\n"
    "      var mv = cs.maxVel || 1e9; if(vel > mv) vel = mv; else if(vel < -mv) vel = -mv;\n"
    "      cs.yaw += vel * hh;\n"
    "    }\n"
    "    if(Math.abs(wrapAngle(cs.target - cs.yaw)) < 1e-4 && Math.abs(vel) < 2e-3){ cs.yaw = cs.target; vel = 0; }\n"
    "    cs.yaw = wrapAngle(cs.yaw); cs.yawVel = vel;\n"
    "  }\n",
    "N2 yaw spring",
)
sub(
    "  state.cam.fx = null; // snap the camera to the character on (re)entry, e.g. after quick travel\n",
    "  state.cam.fx = null; state.cam.fy = null; // snap the camera to the character on (re)entry, e.g. after quick travel\n",
    "N0 snap fy",
)
sub(
    "  cs.fx += (p.x - cs.fx) * camLerp;\n  cs.fz += (p.z - cs.fz) * camLerp;\n",
    "  cs.fx += (p.x - cs.fx) * camLerp;\n  cs.fz += (p.z - cs.fz) * camLerp;\n"
    "  if(cs.fy === undefined || cs.fy === null) cs.fy = groundY;\n"
    "  cs.fy += (groundY - cs.fy) * (1 - Math.pow(1 - 0.1, dt*60));        // 계단·오르막에서 높이가 툭툭 끊기지 않게\n"
    "  if(Math.abs(groundY - cs.fy) < 0.01) cs.fy = groundY;   // 거의 다 따라잡으면 딱 맞춰요 (미세한 높이 차이로 바닥 겹침이 깜빡이지 않게)\n",
    "N3 smoothed focus",
)
sub(
    "  var desiredY = 16 + groundY + p.y*0.4;\n",
    "  var inSkyCam = p.x > SKY.edgeX, camGY = inSkyCam ? cs.fy : groundY;      // 기존 맵은 예전 그대로, 하늘섬 구역만 부드럽게\n  var desiredY = 16 + camGY + p.y*0.4;\n",
    "N4 desiredY",
)
sub(
    "  cam.lookAt(p.x + sinY*14, groundY + 3 + p.y + Math.min(1, skyH/SKY.H)*12, p.z + cosY*14);\n",
    "  cam.lookAt((inSkyCam ? cs.fx : p.x) + sinY*14, camGY + 3 + p.y + Math.min(1, skyH/SKY.H)*12, (inSkyCam ? cs.fz : p.z) + cosY*14);\n",
    "N5 lookAt",
)
sub(
    "  var desiredY = 16 + camGY + p.y*0.4;\n  cam.position.x = cs.fx - sinY*32;\n  cam.position.z = cs.fz - cosY*32;\n",
    "  var vk = cs.vk || 0, vt = (p.x < VIL.westX - 50 && p.x > VIL.x1 - 100) ? 1 : 0; vk += (vt - vk)*(1 - Math.pow(0.02, dt)); cs.vk = vk < 0.001 ? 0 : vk;   // 마을 안에서는 카메라를 더 높고 멀리 (지붕 속으로 파고들지 않게)\n"
    "  var desiredY = 16 + camGY + p.y*0.4 + 15*cs.vk, camBack = 32 + 14*cs.vk;\n  cam.position.x = cs.fx - sinY*camBack;\n  cam.position.z = cs.fz - cosY*camBack;\n",
    "V3 village camera",
)
sub(
    "  if(!skyConstrain(p, px0, pz0)){\n",
    "  skyRopeAssist(p, px0, pz0, cs, sx, rawV, dt);\n  if(!skyConstrain(p, px0, pz0)){\n",
    "N6 rope assist",
)

# ---- V: village interaction (E key) + hint text ----
sub(
    "  var handled = false;\n  three.markers.forEach(function(mk){\n    if(handled) return;\n",
    "  if(villageInteract(p)) return;\n  var handled = false;\n  three.markers.forEach(function(mk){\n    if(handled) return;\n",
    "V1 interact",
)
sub(
    "  interactHint.textContent = nearEnemy ? \"E 눌러 공격!\" : \"E 눌러 살펴보기\";\n  interactHint.hidden = !nearAny;\n",
    "  var vh = nearEnemy ? null : villageHint(p);\n  interactHint.textContent = nearEnemy ? \"E 눌러 공격!\" : (vh || \"E 눌러 살펴보기\");\n  interactHint.hidden = !(nearAny || vh);\n",
    "V2 hint",
)

# ---- X: lighter rendering on hi-dpi screens + village-zone quick travel buttons ----
sub(
    "renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));",
    "renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.5));",
    "X1 pixel ratio",
)
sub(
    "  worldNodes.appendChild(vilBtn);\n",
    "  worldNodes.appendChild(vilBtn);\n"
    "  var zrow = document.createElement(\"div\");\n"
    "  zrow.style.cssText = \"flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:14px;\";\n"
    "  var zn = [[1,\"입구 마을\",250],[2,\"장터 골목\",600],[3,\"ㄱ자 골목\",950],[4,\"갈림길\",1300],[5,\"과수원\",1650],[6,\"정자 마당\",-100],[7,\"구불 골목\",-450],[8,\"공동 마당\",-800],[9,\"방앗간\",-1150],[10,\"마을 끝\",-1500]];\n"
    "  zn.forEach(function(q){\n"
    "    var zb = document.createElement(\"button\"); zb.className = \"node-btn\"; zb.style.cssText = \"font-size:12px;padding:4px 8px;\";\n"
    "    zb.innerHTML = \"\\u{1F33E} \" + q[0] + \"구역 \" + q[1];\n"
    "    zb.addEventListener(\"click\", function(){ state.player.x = -700; state.player.z = q[2]; SKY_REF = 0; state.cam.yaw = state.cam.target = -Math.PI/2; state.cam.yawVel = 0; showScreen(\"game\"); });\n"
    "    zrow.appendChild(zb);\n"
    "  });\n"
    "  worldNodes.appendChild(zrow);\n",
    "X2 zone buttons",
)

open(out_path, "w", encoding="utf-8").write(src)
print("patched ->", out_path, len(src), "bytes")
