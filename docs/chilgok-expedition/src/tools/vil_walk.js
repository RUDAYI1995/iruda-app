const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 600, height: 400 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, out = {};
    function walk(x, z, yawDeg, sec, key){ p.x = x; p.z = z; cs.fx = null; cs.fy = null; const y = yawDeg*Math.PI/180; cs.yaw = cs.target = y; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true; D.setRef(0);
      for (let f = 0; f < sec*60; f++) D.update(1/60); s.keys.up = false; return [Math.round(p.x), Math.round(p.z)]; }
    out.intoVillage = walk(-560, 250, -90, 3);            // from the old map out west along the road
    out.intoHouse = walk(-700, 300, -90, 5);              // along the north side: must stop at the first house (x ~ -790+16)
    out.farWest = walk(-700, 250, -90, 40);               // far along the road
    out.oldMapEdge = walk(560, 700, 90, 2);               // old map east edge unchanged: east at z=700 (river) -> sky logic
    return out; })));
  await browser.close();
})();
