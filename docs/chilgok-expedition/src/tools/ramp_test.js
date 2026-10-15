const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, log = [];
    p.x = 560; p.z = 1100; D.setRef(0); cs.fx = null; cs.fy = null;
    const h = Math.PI/2; cs.yaw = cs.target = h; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true;      // walk +x along the ramp
    for (let f = 0; f < 60*14; f++) { D.update(1/60); if (f % 60 === 0) log.push([Math.round(p.x), Math.round(D.getRef())]); }
    // sideways off the ramp at x=700 should drop back to ground
    return log; })));
  await browser.close();
})();
