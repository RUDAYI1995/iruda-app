const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const views = [[-60,40,640,-300,30,690],[-150,14,690,-300,25,690]];
  for (let k = 0; k < views.length; k++) {
    await page.evaluate((v) => { const D = window.__dbg, sc = D.three.scene; for (let i = 0; i < 3; i++) D.render(0.1);
      sc.children.forEach(c => { if (c.isHemisphereLight) c.intensity = 0.24; if (c.isDirectionalLight) c.intensity = 0.4; if (c.isAmbientLight) c.intensity = 0.3; });
      sc.fog.color.setHex(0x121a3c); sc.background = new THREE.Color(0x121a3c);
      window.riverTick(5000, 0.016, { x: 0, z: 690 });
      const c = D.three.camera; c.position.set(v[0],v[1],v[2]); c.lookAt(v[3],v[4],v[5]); D.three.renderer.render(sc, c); }, views[k]);
    await page.screenshot({ path: SP + '/w/n_' + k + '.png' });
  }
  await browser.close(); })();
