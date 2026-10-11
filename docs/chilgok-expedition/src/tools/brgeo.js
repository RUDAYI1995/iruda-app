const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(1500);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, T = { x: 1175, z: 2000 };
    return D.SKY_BR.map((b, i) => {
      // min distance from tree axis to the segment
      const vx = b.bx - b.ax, vz = b.bz - b.az, l2 = vx*vx + vz*vz, u = Math.max(0, Math.min(1, ((T.x - b.ax)*vx + (T.z - b.az)*vz)/l2));
      const d = Math.hypot(b.ax + u*vx - T.x, b.az + u*vz - T.z);
      const rad = Math.atan2(b.az - T.z, b.ax - T.x), dirOut = (vx*Math.cos(rad) + vz*Math.sin(rad))/Math.sqrt(l2);
      return { i, y: b.y, from: [Math.round(b.ax), Math.round(b.az)], to: [Math.round(b.bx), Math.round(b.bz)], minDistToTrunk: Math.round(d), outwardness: +dirOut.toFixed(2) };
    }); })));
  await browser.close();
})();
