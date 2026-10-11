const { chromium } = require('playwright-core');
const fs = require('fs');
(async () => {
  const b64 = fs.readFileSync(process.argv[2]).toString('base64');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const r = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/webp;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
    const px = (x, y) => Array.from(g.getImageData(x, y, 1, 1).data);
    let minA = 255, transparentPx = 0, total = 0;
    const all = g.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < all.length; i += 4) { total++; if (all[i] < 255) transparentPx++; if (all[i] < minA) minA = all[i]; }
    // checker colors along a row in the empty top area
    const row = []; for (let x = 4; x < 160; x += 8) row.push(px(x, 20).slice(0,3).join(','));
    return { size:[img.width, img.height], minAlpha:minA, pixelsWithAlphaBelow255: transparentPx, total, corner:px(2,2), farCorner:px(img.width-3, 5), row };
  }, b64);
  console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
