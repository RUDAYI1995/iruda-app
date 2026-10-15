const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 480 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=-2');            // the new "마법 나무" quick-travel stop
  await page.waitForTimeout(2500);
  const res = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, log = [];
    const start = { x: Math.round(p.x), z: Math.round(p.z), ref: D.getRef() };
    cs.prevSx = cs.prevV = 999;                                   // keep my own latched walking vector
    let t = 0, stuck = 0, last = [p.x, p.z], maxH = 0;
    for (let f = 0; f < 60*160; f++) {                            // up to 160 game-seconds
      const ref = D.getRef();
      // aim at the path centre a little further up (or at the start of the path while still on the ground)
      const tgt = D.skySpiralAt(Math.min(600, ref + 7 + (ref < 1 ? 6 : 0)));
      const dx = tgt.x - p.x, dz = tgt.z - p.z, l = Math.hypot(dx, dz) || 1;
      cs.mvx = dx/l; cs.mvz = dz/l;
      D.update(1/60); t += 1/60;
      if (f % 20 === 0) { D.render(1/60); }
      maxH = Math.max(maxH, D.getRef());
      if (Math.hypot(p.x - last[0], p.z - last[1]) < 0.01) stuck++; else stuck = 0; last = [p.x, p.z];
      if (f % 600 === 0) log.push([Math.round(t), Math.round(D.getRef())]);
      if (D.getRef() >= 599) break;
      if (stuck > 90) { log.push(['STUCK at', Math.round(p.x), Math.round(p.z), D.getRef()]); break; }
    }
    return { start, seconds: +t.toFixed(1), reached: Math.round(D.getRef()), maxH: Math.round(maxH), log };
  });
  console.log(JSON.stringify(res));
  await page.screenshot({ path: SP + '/tree_top_reached.png' });
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
