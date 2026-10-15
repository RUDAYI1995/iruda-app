const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, out = {};
    // for each bridge, walk centre line from start to end at its height and make sure it's walkable the whole way; also the junction with the tree
    D.SKY_BR.forEach((b, i) => {
      D.setRef(b.y); let bad = 0, n = 0;
      for (let u = 0; u <= 1.0001; u += 0.01) { const x = b.ax + (b.bx-b.ax)*u, z = b.az + (b.bz-b.az)*u; n++; if (!D.skyWalkable(x, z)) bad++; }
      // sides: 3 units sideways of centre ok, 7 not
      const L = Math.hypot(b.bx-b.ax, b.bz-b.az), nx = -(b.bz-b.az)/L, nz = (b.bx-b.ax)/L, mx = (b.ax+b.bx)/2, mz = (b.az+b.bz)/2;
      out['bridge'+i] = { len: Math.round(L), y: b.y, blockedSamples: bad, sideOk: D.skyWalkable(mx+nx*3, mz+nz*3), edgeBlocked: !D.skyWalkable(mx+nx*7, mz+nz*7) };
    });
    // islands
    out.islands = D.SKY_ISL.map(I => { D.setRef(I.y); return D.skyWalkable(I.x, I.z) && !D.skyWalkable(I.x + I.r + 3, I.z); });
    // tree start of each tree bridge reachable from the spiral band: walk the polar path then step outwards
    out.junction = D.SKY_BR.filter(b => b.fromTree).map(b => { D.setRef(b.y); return D.skyWalkable(b.ax, b.az); });
    return out;
  });
  console.log(JSON.stringify(r));
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
