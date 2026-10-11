const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 500, height: 300 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3500);
  console.log(JSON.stringify(await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, out = {};
    function walk(x, z, yawDeg, sec){ p.x = x; p.z = z; cs.fx = null; cs.fy = null; const y = yawDeg*Math.PI/180; cs.yaw = cs.target = y; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true; D.setRef(0); for (let f = 0; f < sec*60; f++) D.update(1/60); s.keys.up = false; return [Math.round(p.x), Math.round(p.z)]; }
    out.northSpine = walk(-632, 250, 0, 20);   // 93/s *20 = 1860 -> should reach ~2110? capped by walkable (<=2720)
    out.southSpine = walk(-632, 250, 180, 30);
    out.z2alley = walk(-632, 600, -90, 6);     // along zone-2 alley centre
    out.z4branch = walk(-900, 1300, 180, 3);   // up the T-branch at x=-900
    out.z8loop = walk(-780, -800, 0, 1.5);     // along the loop
    out.paddyN = walk(-1000, 1900, 0, 3); out.paddyS = walk(-1000, -1800, 180, 3);
    out.wallBlock = walk(-900, 600, 0, 2);      // from alley centre z=600 north toward the wall (z=614) must stop near 612
    return out; })));
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors'); await browser.close();
})();
