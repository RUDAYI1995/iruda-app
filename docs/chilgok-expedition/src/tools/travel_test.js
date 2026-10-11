const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam, out = { log: [] };
    function run(sec, keys){ Object.assign(s.keys, { up:false, down:false, left:false, right:false }, keys); for (let f = 0; f < sec*60; f++) { D.update(1/60); if (f % 6 === 0) D.render(6/60); } }
    function face(tx, tz){ const h = Math.atan2(tx - p.x, tz - p.z); cs.yaw = cs.target = h; cs.yawVel = 0; cs.prevV = 999; }
    const st = D.skySpiralAt(0); face(st.x, st.z);
    // climb until we are on the 200 landing
    let t = 0; Object.assign(s.keys, { up:true });
    while (D.getRef() < 198 && t < 120) { D.update(1/60); t += 1/60; if (Math.round(t*60) % 6 === 0) D.render(6/60); }
    s.keys.up = false; out.reachedLanding = { ref: Math.round(D.getRef()), x: Math.round(p.x), z: Math.round(p.z), t: +t.toFixed(1) };
    // walk onto bridge 0 toward island 0
    const b = D.SKY_BR[0]; out.padInfo = { A: [Math.round(b.ax), Math.round(b.az)], dist: Math.round(Math.hypot(p.x - b.ax, p.z - b.az)) };
    p.x = b.ax - 3; p.z = b.az; D.setRef(200); cs.fx = null; out.atPad = { ref: 200 };
    face(b.bx, b.bz); run(2.6, { up:true });
    out.onBridge = { ref: Math.round(D.getRef()), x: Math.round(p.x), z: Math.round(p.z), end:[Math.round(b.bx),Math.round(b.bz)] };
    face(D.SKY_ISL[0].x, D.SKY_ISL[0].z); run(1.5, { up:true });
    out.onIsland0 = { ref: Math.round(D.getRef()), x: Math.round(p.x), z: Math.round(p.z), expectIsland: [D.SKY_ISL[0].x, D.SKY_ISL[0].z] };
    const b1 = D.SKY_BR[1]; face(b1.bx, b1.bz); run(3.2, { up:true });
    out.island1 = { ref: Math.round(D.getRef()), x: Math.round(p.x), z: Math.round(p.z), expect: [D.SKY_ISL[1].x, D.SKY_ISL[1].z] };
    return out;
  });
  console.log(JSON.stringify(r));
  await page.screenshot({ path: SP + '/travel_end.png' });
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
