const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const b64 = fs.readFileSync(process.argv[2]).toString('base64');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const res = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/webp;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const pts = { panel_low:[300,600], panel_low2:[600,550], panel_top:[300,40], panel_mid_left:[60,300], tower:[880,400], grass_left:[200,900], sky:[1500,80] };
    const out = { size:[img.width, img.height] };
    for (const [k,[x,y]] of Object.entries(pts)) { const d = g.getImageData(x,y,1,1).data; out[k] = [d[0],d[1],d[2]]; }
    return out;
  }, b64);
  console.log(JSON.stringify(res));
  await browser.close();
})();
