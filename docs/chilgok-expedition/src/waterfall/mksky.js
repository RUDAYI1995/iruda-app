const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(process.argv[2]).toString('base64');
  const out = await page.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = 2048; c.height = Math.round(2048*im.naturalHeight/im.naturalWidth); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); return { w: im.naturalWidth, h: im.naturalHeight, d: c.toDataURL('image/webp', 0.82) }; }, src);
  fs.writeFileSync(process.argv[3], out.d.split(',')[1], 'base64'); console.log(out.w, out.h, out.d.length); await b.close(); })();
