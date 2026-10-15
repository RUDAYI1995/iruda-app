#!/bin/bash
SP="/tmp/claude-0/-home-user-iruda-app/9a4c4921-0f65-5c2b-a072-f5e1d0ed7816/scratchpad"
python3 -I - "$SP/fixed/칠곡원정대/index.html" "$SP/artifact/chilgok.html" << 'PY'
import sys, re
src, dst = sys.argv[1:3]
s = open(src, encoding="utf-8").read()
s, n = re.subn(r'(<script src="[a-z_]+\.js)\?v=\d+(")', r'\1\2', s)
assert n == 7, n
old = "    display:flex; justify-content:center;\n    padding-block:20px;\n"
assert s.count(old) == 1
s = s.replace(old, old + "    padding-inline:16px;\n")
assert "__dbg" not in s
open(dst, "w", encoding="utf-8").write(s)
print("artifact html refreshed", len(s))
PY
