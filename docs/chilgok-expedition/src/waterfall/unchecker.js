const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => { const [inp, outp, prevp] = process.argv.slice(2); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/png;base64,' + fs.readFileSync(inp).toString('base64');
  const r = await page.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const W = im.naturalWidth, H = im.naturalHeight, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, W, H), p = d.data;
    let n = 0;
    function bounds(len, get){ const b = [0]; let st = get(0) > 71 ? 1 : 0; for (let t = 1; t < len; t++){ const v = get(t); if (st === 1 && v < 63){ st = 0; b.push(t); } else if (st === 0 && v > 79){ st = 1; b.push(t); } } return b; }
    // 가로 경계: 위쪽 맨 윗줄들(배경만 있음)의 평균, 세로 경계: 왼쪽 맨 끝 열들의 평균
    const bx = bounds(W, x => { let s = 0; for (let y = 2; y < 9; y++) s += p[(y*W + x)*4]; return s/7; });
    const by = bounds(H, y => { let s = 0; for (let x = 0; x < 6; x++) s += p[(y*W + x)*4]; return s/6; });
    function idx(arr, v){ let lo = 0; while (lo + 1 < arr.length && arr[lo + 1] <= v) lo++; return lo; }
    const par0 = (p[(5*W + 2)*4] > 71 ? 0 : 1);
    // 칸(체크무늬 한 칸)마다 배경 밝기 = 그 칸 안의 "회색이고 어두운" 픽셀들의 중앙값. 칸이 폭포로 가려졌으면 같은 홀짝 칸들의 중앙값
    const nbx = bx.length, nby = by.length, cellV = {}, parV = [[], []];
    function isBgPix(i){ const R = p[i], G = p[i+1], B = p[i+2]; return Math.abs(R - G) < 7 && Math.abs(G - B) < 9 && R < 108; }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const i = (y*W + x)*4; if (!isBgPix(i)) continue; const cx = idx(bx, x), cy = idx(by, y), k = cx + ',' + cy; (cellV[k] || (cellV[k] = [])).push(p[i]); }
    function med(a){ a.sort((u, v) => u - v); return a[a.length >> 1]; }
    const cellBg = {}; Object.keys(cellV).forEach(k => { if (cellV[k].length > 12){ cellBg[k] = med(cellV[k]); const [cx, cy] = k.split(',').map(Number); parV[(cx + cy) & 1].push(cellBg[k]); } });
    const parBg = [med(parV[0].slice()), med(parV[1].slice())];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++){ const i = (y*W + x)*4, cx = idx(bx, x), cy = idx(by, y), k = cx + ',' + cy, bg = cellBg[k] !== undefined ? cellBg[k] : parBg[(cx + cy) & 1];
      const R = p[i], G = p[i+1], B = p[i+2], mx = Math.max(R, G, B);
      let a = (mx - bg - 7)/(232 - bg); a = Math.max(0, Math.min(1, a*1.15));
      if (isBgPix(i) && mx <= bg + 12) a = 0;
      if (a < 0.05){ p[i+3] = 0; continue; }
      const inv = 1/a; p[i] = Math.max(0, Math.min(255, (R - bg*(1 - a))*inv)); p[i+1] = Math.max(0, Math.min(255, (G - bg*(1 - a))*inv)); p[i+2] = Math.max(0, Math.min(255, (B - bg*(1 - a))*inv)); p[i+3] = Math.round(a*255); n++; }
    // 남은 체크무늬 조각 제거: 진한 물줄기(알파>0.55) 주변 28px 안만 남기고, 아주 옅은 알파는 부드럽게 줄임
    const strong = new Uint8Array(W*H); for (let i = 0; i < W*H; i++) strong[i] = p[i*4 + 3] > 140 ? 1 : 0;
    const R = 28, tmp = new Uint8Array(W*H), dil = new Uint8Array(W*H);
    for (let y = 0; y < H; y++){ let run = 0; for (let x = 0; x < W; x++){ if (strong[y*W + x]) run = R; else if (run > 0) run--; tmp[y*W + x] = run > 0 ? 1 : 0; } run = 0; for (let x = W - 1; x >= 0; x--){ if (strong[y*W + x]) run = R; else if (run > 0) run--; if (run > 0) tmp[y*W + x] = 1; } }
    for (let x = 0; x < W; x++){ let run = 0; for (let y = 0; y < H; y++){ if (tmp[y*W + x]) run = R; else if (run > 0) run--; dil[y*W + x] = run > 0 ? 1 : 0; } run = 0; for (let y = H - 1; y >= 0; y--){ if (tmp[y*W + x]) run = R; else if (run > 0) run--; if (run > 0) dil[y*W + x] = 1; } }
    for (let i = 0; i < W*H; i++){ let a = p[i*4 + 3]/255; if (!dil[i]) a = 0; else { const t = Math.max(0, Math.min(1, (a - 0.07)/0.25)); a = a*(t*t*(3 - 2*t)); } p[i*4 + 3] = Math.round(a*255); }
    g.putImageData(d, 0, 0); const prev = document.createElement('canvas'); prev.width = W; prev.height = H; const pg = prev.getContext('2d'); pg.fillStyle = '#3d6fc8'; pg.fillRect(0, 0, W, H); pg.drawImage(c, 0, 0);
    const crop = (x0, y0, x1, y1) => { const cc = document.createElement('canvas'); cc.width = x1 - x0; cc.height = y1 - y0; cc.getContext('2d').drawImage(c, x0, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0); return cc.toDataURL('image/webp', 0.95); };
    return { big: crop(718, 116, 930, 342), small: crop(2, 158, 146, 330), strip: crop(819, 140, 851, 252), W, H, n, nb:[bx.length, by.length], png: c.toDataURL('image/png'), prev: prev.toDataURL('image/png') }; }, src);
  fs.writeFileSync(outp, r.png.split(',')[1], 'base64'); fs.writeFileSync('fall_big.webp', r.big.split(',')[1], 'base64'); fs.writeFileSync('fall_small.webp', r.small.split(',')[1], 'base64'); fs.writeFileSync('fall_strip.webp', r.strip.split(',')[1], 'base64'); fs.writeFileSync(prevp, r.prev.split(',')[1], 'base64'); console.log(r.W, r.H, r.n, r.nb); await b.close(); })();
