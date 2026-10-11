const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  for (const f of process.argv.slice(2)) {
    const b64 = fs.readFileSync(f).toString('base64');
    const r = await page.evaluate(async (b64) => { const i = new Image(); i.src = 'data:image/webp;base64,' + b64; await i.decode(); return [i.naturalWidth, i.naturalHeight]; }, b64);
    console.log(f.split('/').pop(), r.join('x'), (fs.statSync(f).size/1024).toFixed(0) + 'KB');
  }
  await browser.close();
})();
