const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(process.argv[2]).toString('base64');
  const out = await page.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 1024, 1024); return c.toDataURL('image/webp', 0.74); }, src);
  fs.writeFileSync(process.argv[3], out.split(',')[1], 'base64'); console.log(out.length); await b.close(); })();
