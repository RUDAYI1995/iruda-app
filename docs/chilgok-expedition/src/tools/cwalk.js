const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(2500);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, out = {};
    function walk(x, z, yawDeg, sec){ p.x = x; p.z = z; D.setRef(0); cs.fx = null; cs.fy = null; const y = yawDeg*Math.PI/180; cs.yaw = cs.target = y; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true;
      for (let f = 0; f < sec*60; f++) D.update(1/60); s.keys.up = false; return [Math.round(p.x), Math.round(p.z)]; }
    out.roadWest = walk(-640, 45, -90, 6);
    out.toMansion = walk(-920, 46, 0, 3);
    out.southRow = walk(-700, -5, -90, 4);
    return out; })));
  await browser.close();
})();
