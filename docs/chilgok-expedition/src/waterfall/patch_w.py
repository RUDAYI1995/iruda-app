import sys, os, shutil
SP = os.path.dirname(os.path.abspath(__file__)) + "/.."
src = open(SP + "/pub/index.html", encoding="utf-8").read()
blk = open(SP + "/w/block_W.js", encoding="utf-8").read() + open(SP + "/w/block_P.js", encoding="utf-8").read()
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

sub("  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z), skyHeightAt(x, z));\n", "  if(bridgeH <= 0 && window.RIVER && window.RIVER.water && window.RIVER.water(x, z)) return -0.25;      // 강물 위를 헤엄쳐요\n  return Math.max(bridgeH, mountainHeight(x, z), hillHeightAt(x, z), skyHeightAt(x, z), (window.RIVER && window.RIVER.hh) ? window.RIVER.hh(x, z) : 0);\n", "ground river")
sub("function landPush(p, px0, pz0){\n", "function landPush(p, px0, pz0){\n  if(window.RIVER && window.RIVER.push) window.RIVER.push(p, px0, pz0);      // 폭포 언덕: 오를 수 있는 경사만\n", "landPush river")
os.makedirs(SP + "/w/out", exist_ok=True); os.makedirs(SP + "/w/test", exist_ok=True)
open(SP + "/w/out/index.html", "w", encoding="utf-8").write(src)
HOOK = "window.__dbg = {state:state, three:three, render:render, update:update, groundHeightAt:groundHeightAt};\n"
MARK = "/* ---------------- Boot ---------------- */"
assert src.count(MARK) == 1
open(SP + "/w/test/index.html", "w", encoding="utf-8").write(src.replace(MARK, HOOK + MARK))
for d in ("out", "test"):
    for f in os.listdir(SP + "/pub"):
        if f == "index.html": continue
        dst = SP + "/w/" + d + "/" + f
        if not os.path.exists(dst): os.symlink(SP + "/pub/" + f, dst)
print("built", len(src))
