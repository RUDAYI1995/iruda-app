const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 600)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.addStyleTag({ content: 'div[style*="radial-gradient"]{display:none!important}' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1200);
  const views = JSON.parse(process.argv[3]);
  for (let k = 0; k < views.length; k++) {
    const v = views[k];
    await page.evaluate((v) => { const D = window.__dbg, p = D.state.player, s = D.state; window.skyTeleport(p, v.px, v.pz, v.py); s.cam.yaw = s.cam.target = v.yaw || 0; for (let i = 0; i < (v.n || 12); i++) { D.update(1/30); D.render(1/30); }
      if (v.day) { D.three.scene.children.forEach(c => { if (c.isHemisphereLight) c.intensity = 0.75; if (c.isDirectionalLight) c.intensity = 1.15; if (c.isAmbientLight) c.intensity = 0.18; }); D.three.scene.background = new THREE.Color(0xbfe0ff); D.three.scene.fog.color.setHex(0xbfe0ff); }
      if (v.c) { const c = D.three.camera; c.position.set(v.c[0], v.c[1], v.c[2]); c.lookAt(v.c[3], v.c[4], v.c[5]); D.three.renderer.render(D.three.scene, c); } }, v);
    await page.waitForTimeout(600); await page.screenshot({ path: SP + '/w/a_' + k + '.png' });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
