const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => { const D = window.__dbg, s = D.state, p = s.player, o = [];
    D.setRef(0); p.x = -708; p.z = 32; p.y = 0; for (let i = 0; i < 10; i++) D.render(1/60);
    o.push('hint=' + D.villageHint(p)); D.villageInteract(p); o.push('mul=' + window.vilRideMul + ' hint=' + D.villageHint(p));
    const cs = s.cam; function walk(){ p.x = -708; p.z = 45; cs.fx = null; cs.fy = null; cs.yaw = cs.target = -Math.PI/2; cs.yawVel = 0; cs.prevV = 999; s.keys.up = true; for (let f = 0; f < 60; f++) D.update(1/60); s.keys.up = false; return Math.round(Math.abs(p.x + 708)); }
    o.push('riding moved ' + walk() + ' units in 1s'); 
    D.villageInteract(p); o.push('after dismount mul=' + window.vilRideMul + ' hint=' + D.villageHint(p));
    return o; });
  console.log(r.join('\n')); console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors'); await browser.close();
})();
