#!/bin/bash
# usage: rebuild.sh  (re-applies patches and refreshes the test_new copy)
SP="/tmp/claude-0/-home-user-iruda-app/9a4c4921-0f65-5c2b-a072-f5e1d0ed7816/scratchpad"
python3 -I "$SP/sky/apply_patches.py" "$SP/base/index.html" "$SP/sky/block_A.js" "$SP/sky/block_E.js" "$SP/fixed/칠곡원정대/index.html" || exit 1
python3 -I - "$SP" << 'PY'
import sys, os
SP = sys.argv[1]
HOOK = "window.__dbg = {state:state, three:three, showScreen:showScreen, update:update, render:render, SKY:SKY, groundHeightAt:groundHeightAt, skyWalkable:skyWalkable, villageInteract:villageInteract, villageHint:villageHint, VIL_FARM:VIL_FARM, VIL_GH_CROPS:VIL_GH_CROPS, villageWalk:vilWalkable, SKY_PROPS:SKY_PROPS, SKY_BR:SKY_BR, SKY_ISL:SKY_ISL, skyHeightAt:skyHeightAt, skySpiralAt:skySpiralAt, setRef:function(v){SKY_REF=v;}, getRef:function(){return SKY_REF;}, currentLandmark:currentLandmark};\n"
MARK = "/* ---------------- Boot ---------------- */"
s = open(os.path.join(SP, "fixed", "칠곡원정대", "index.html"), encoding="utf-8").read()
assert s.count(MARK) == 1
open(os.path.join(SP, "test_new", "index.html"), "w", encoding="utf-8").write(s.replace(MARK, HOOK + MARK))
PY
cp "$SP/assets/skyart.js" "$SP/fixed/칠곡원정대/skyart.js" && cp "$SP/assets/skyart.js" "$SP/test_new/skyart.js"
echo rebuilt
