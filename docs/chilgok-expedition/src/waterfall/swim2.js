const { chromium } = require('playwright-core');
const SP = process.argv[2], mode = process.argv[3] || 'normal';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500); await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1500);
  const info = await page.evaluate((mode) => { const D = window.__dbg, s = D.state, p = s.player; p.x = -20; p.z = 640; s.cam.fx = null; s.cam.yaw = s.cam.target = 0; s.cam.turn = null;
    for (let i = 0; i < 40; i++) { D.update(1/30); D.render(1/30); }
    const th = D.three; if (mode === 'noclip') th.playerTopSprite.material.clippingPlanes = null; if (mode === 'low') window.__dbgClip = -3;
    D.render(0.03); const cp = th.playerTopSprite.material.clippingPlanes; const top = th.playerTopSprite, leg = th.playerLegSprite;
    return JSON.stringify({ swim: p.swim, k: p.swimK, topPos: top.position.toArray().map(v => +v.toFixed(1)), topScale: top.scale.toArray().map(v => +v.toFixed(1)), clipC: cp && cp[0].constant, wy: (window.RIVER||{}).WY, legVis: leg.visible, legH: th.spriteBaseSize*th.legFrac, base: th.spriteBaseSize, cam: D.three.camera.position.toArray().map(v => +v.toFixed(0)) }); }, mode);
  console.log(info); await page.screenshot({ path: SP + '/w/sw2_' + mode + '.png' }); await browser.close(); })();
