const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const logic = await page.evaluate(() => {
    const D = window.__dbg, out = {}; let bad = 0, maxStep = 0, ref = 0, prev = 0;
    D.setRef(0);
    for (let y = 0; y <= 600; y += 0.5) {                // walk the whole rope path centre line
      const c = D.skySpiralAt(y); D.setRef(ref);
      if (!D.skyWalkable(c.x, c.z)) { bad++; if (bad < 4) out['blocked@' + y] = [c.x|0, c.z|0, ref]; }
      const h = D.skyHeightAt(c.x, c.z); maxStep = Math.max(maxStep, Math.abs(h - ref)); ref = h;
    }
    out.centreLine = { blocked: bad, maxStep: +maxStep.toFixed(2), endHeight: +ref.toFixed(1) };
    // edges: 6 units to each side must be walkable, 9 units must not (at ref = path height)
    let edgeOk = 0, edgeBad = 0;
    for (let y = 20; y <= 580; y += 37) { const c = D.skySpiralAt(y), rx = Math.cos(c.th), rz = Math.sin(c.th); D.setRef(y);
      if (D.skyWalkable(c.x + rx*5.5, c.z + rz*5.5) && D.skyWalkable(c.x - rx*5.5, c.z - rz*5.5)) edgeOk++; else edgeBad++;
      if (D.skyWalkable(c.x + rx*9.5, c.z + rz*9.5) || D.skyWalkable(c.x - rx*9.5, c.z - rz*9.5)) edgeBad++; }
    out.edges = { ok: edgeOk, bad: edgeBad };
    // ground: free walking east of the old map, trunk blocked, spiral start reachable
    D.setRef(0);
    out.ground = [[640, 400], [900, 2500], [1500, 800], [2100, 2900]].map(([x, z]) => D.skyWalkable(x, z));
    out.trunkBlocked = !D.skyWalkable(1175, 2000) && !D.skyWalkable(1175 + 35, 2000);
    const s0 = D.skySpiralAt(0); D.setRef(0); out.startOk = D.skyWalkable(s0.x, s0.z) && D.skyHeightAt(s0.x, s0.z) < 1;
    // coil above the ground start must not be walkable from the ground
    out.underCoil = D.skyWalkable(s0.x + (s0.x - 1175)*0, s0.z) ;
    // old map unaffected
    out.oldMap = [[0, 0], [300, 1500], [610, 1100]].map(([x, z]) => [D.skyHeightAt(x, z), D.skyWalkable(x, z)]);
    // existing sky routes still work from the ramp: ramp -> pad -> gate -> obelisk
    D.setRef(0); let r2 = 0, ok2 = true;
    for (let x = 622; x <= 1000; x += 3) { D.setRef(r2); if (!D.skyWalkable(x, 1100)) { ok2 = false; out.rampBlockedAt = x; break; } r2 = D.skyHeightAt(x, 1100); }
    for (let z = 1100; ok2 && z <= 1650; z += 3) { D.setRef(r2); if (!D.skyWalkable(1000, z)) { ok2 = false; out.pathBlockedAt = z; break; } r2 = D.skyHeightAt(1000, z); }
    out.skyRoute = { ok: ok2, endHeight: r2 };
    return out;
  });
  console.log(JSON.stringify(logic, null, 1));
  const shot = async (name, x, z, ref, yawDeg) => {
    await page.evaluate(([x, z, ref, yawDeg]) => { const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
      D.setRef(ref); p.x = x; p.z = z; p.y = 0; s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      const gy = D.skyHeightAt(x, z); D.three.camera.position.set(x - Math.sin(y)*32, 16 + gy, z - Math.cos(y)*32);
      for (let i = 0; i < 60; i++) D.render(1/60); }, [x, z, ref, yawDeg]);
    await page.waitForTimeout(200); await page.screenshot({ path: SP + '/tree_' + name + '.png' }); console.log('shot', name);
  };
  const at = y => { const c = (window.__dbg, null); return c; };
  const pts = await page.evaluate(() => [0, 90, 200, 360, 600].map(y => { const c = window.__dbg.skySpiralAt(y); return [c.x, c.z, y, c.th]; }));
  await shot('far_west', 300, 1900, 0, 90);
  await shot('ground_approach', 1020, 1950, 0, 70);
  for (const [x, z, y, th] of pts.slice(0, 5)) await shot('on_' + y, x, z, y, (Math.atan2(-Math.sin(th), Math.cos(th)) * 0 + 0) * 180/Math.PI + (th*180/Math.PI + 90) * -1 + 0);
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
