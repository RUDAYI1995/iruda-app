const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const logs = []; page.on('console', m => { if (/failed|Error|error/.test(m.text()) && !/GPU stall/.test(m.text())) logs.push('CON ' + m.text().slice(0, 300)); }); page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(600);
  await page.addStyleTag({ content: 'div[style*="radial-gradient"]{display:none!important}' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { const D = window.__dbg, p = D.state.player; p.x = 420; p.z = 1010; D.state.cam.fx = null; for (let i = 0; i < 20; i++) { D.update(1/30); D.render(1/30); } }); await page.waitForTimeout(5000); await page.evaluate(() => { for (let i = 0; i < 3; i++) window.__dbg.render(0.03); });
  const views = JSON.parse(process.argv[3]);
  for (let k = 0; k < views.length; k++) { const v = views[k];
    await page.evaluate((v) => { const D = window.__dbg, p = D.state.player, s = D.state; p.x = v.px; p.z = v.pz; s.cam.fx = null; s.cam.yaw = s.cam.target = v.yaw || 0; for (let i = 0; i < 8; i++) { D.update(1/30); D.render(1/30); } if (v.c) { const c = D.three.camera; c.position.set(v.c[0], v.c[1], v.c[2]); c.lookAt(v.c[3], v.c[4], v.c[5]); D.three.renderer.render(D.three.scene, c); } }, v);
    await page.waitForTimeout(800); await page.screenshot({ path: SP + '/w/m_' + k + '.png' }); }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
