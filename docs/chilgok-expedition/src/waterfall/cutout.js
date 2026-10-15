// 사용: node cutout.js 입력.webp 출력.webp x0 y0 x1 y1 [임계값=244]
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const [inp, outp, x0, y0, x1, y1, th] = process.argv.slice(2); const T = +(th || 244);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(inp).toString('base64');
  const out = await page.evaluate(async ([src, x0, y0, x1, y1, T]) => {
    const im = new Image(); im.src = src; await im.decode(); const W = +x1 - +x0, H = +y1 - +y0; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, +x0, +y0, W, H, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H), p = d.data, seen = new Uint8Array(W*H), q = new Int32Array(W*H); let qh = 0, qt = 0;
    const bg = (i) => p[i*4] >= T && p[i*4 + 1] >= T && p[i*4 + 2] >= T;
    function push(i){ if(!seen[i] && bg(i)){ seen[i] = 1; q[qt++] = i; } }
    for(let x = 0; x < W; x++){ push(x); push((H - 1)*W + x); } for(let y = 0; y < H; y++){ push(y*W); push(y*W + W - 1); }
    while(qh < qt){ const i = q[qh++], x = i % W, y = (i - x)/W; if(x > 0) push(i - 1); if(x < W - 1) push(i + 1); if(y > 0) push(i - W); if(y < H - 1) push(i + W); }
    for(let i = 0; i < W*H; i++) if(seen[i]) p[i*4 + 3] = 0;
    // 가장자리 한 겹 부드럽게 + 흰 테두리 줄이기
    const a = new Uint8Array(W*H); for(let i = 0; i < W*H; i++) a[i] = p[i*4 + 3];
    for(let y = 1; y < H - 1; y++) for(let x = 1; x < W - 1; x++){ const i = y*W + x; if(a[i] && (!a[i - 1] || !a[i + 1] || !a[i - W] || !a[i + W])){ p[i*4 + 3] = 150; } }
    g.putImageData(d, 0, 0); let cnt = 0; for(let i = 0; i < W*H; i++) if(seen[i]) cnt++;
    return { w: W, h: H, bgFrac: cnt/(W*H), d: c.toDataURL('image/webp', 0.9) };
  }, [src, x0, y0, x1, y1, T]);
  fs.writeFileSync(outp, out.d.split(',')[1], 'base64'); console.log(out.w, out.h, out.bgFrac.toFixed(3), out.d.length); await b.close(); })();
