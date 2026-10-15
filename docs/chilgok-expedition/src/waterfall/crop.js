const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => { const [inp, outp, x0, y0, x1, y1, q] = process.argv.slice(2); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(inp).toString('base64');
  const out = await page.evaluate(async ([src, x0, y0, x1, y1, q]) => { const im = new Image(); im.src = src; await im.decode(); const W = +x1 - +x0, H = +y1 - +y0; const c = document.createElement('canvas'); c.width = W; c.height = H; c.getContext('2d').drawImage(im, +x0, +y0, W, H, 0, 0, W, H); return { W, H, d: c.toDataURL('image/webp', +(q || 0.9)) }; }, [src, x0, y0, x1, y1, q]);
  fs.writeFileSync(outp, out.d.split(',')[1], 'base64'); console.log(out.W, out.H, out.d.length); await b.close(); })();
