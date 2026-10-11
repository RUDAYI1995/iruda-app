const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(1500);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, T = { x: 1175, z: 2000 }, top = { x: 1000, z: 2060 }, out = [];
    const want = Math.atan2(top.z - T.z, top.x - T.x);
    for (let y = 300; y <= 420; y += 1) { const s = D.skySpiralAt(y); let d = Math.atan2(Math.sin(s.th - want), Math.cos(s.th - want)); out.push([y, +(Math.abs(d)*180/Math.PI).toFixed(1)]); }
    out.sort((a, b) => a[1] - b[1]); return out.slice(0, 5); })));
  await browser.close();
})();
