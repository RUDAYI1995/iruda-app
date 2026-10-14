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
