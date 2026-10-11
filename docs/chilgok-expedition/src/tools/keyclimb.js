const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 480 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, cs = s.cam; let out = { log: [] };
    // 1) walk from the quick-travel spot toward the path start with plain keys (screen-up = camera forward), like a player would
    const st = D.skySpiralAt(0);
    // face the path start: pick the heading to it
    const h = Math.atan2(st.x - p.x, st.z - p.z); cs.yaw = cs.target = h; cs.yawVel = 0;
    s.keys.up = true; let t = 0, maxJump = 0, lastYaw = cs.yaw, maxYawStep = 0, lastCam = null, maxCamStep = 0;
    for (let f = 0; f < 60*200; f++) {
      D.update(1/60); t += 1/60; if (f % 3 === 0) D.render(3/60);
      const ref = D.getRef(), c = D.three.camera.position;
      if (lastCam) maxCamStep = Math.max(maxCamStep, Math.hypot(c.x-lastCam[0], c.y-lastCam[1], c.z-lastCam[2]));
      lastCam = [c.x, c.y, c.z];
      maxYawStep = Math.max(maxYawStep, Math.abs(Math.atan2(Math.sin(cs.yaw-lastYaw), Math.cos(cs.yaw-lastYaw)))); lastYaw = cs.yaw;
      if (f % 600 === 0) out.log.push([Math.round(t), Math.round(ref)]);
      if (ref >= 590) break;
    }
    s.keys.up = false;
    out.seconds = +t.toFixed(1); out.ref = Math.round(D.getRef()); out.maxCamStepPerFrame = +maxCamStep.toFixed(2); out.maxYawStepDeg = +(maxYawStep*180/Math.PI).toFixed(2);
    return out;
  });
  console.log(JSON.stringify(r));
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
