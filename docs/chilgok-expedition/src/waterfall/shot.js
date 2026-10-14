const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 400))); page.on('console', m => { if (m.type()==='error') logs.push('CON ' + m.text().slice(0,300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3000);
  const views = JSON.parse(process.argv[3]);
  for (let k = 0; k < views.length; k++) {
    await page.evaluate((v) => { const D = window.__dbg; for (let i = 0; i < 3; i++) D.render(0.1); const c = D.three.camera; c.position.set(v[0],v[1],v[2]); c.lookAt(v[3],v[4],v[5]); D.three.renderer.render(D.three.scene, c); }, views[k]);
    await page.screenshot({ path: SP + '/w/s_' + k + '.png' });
  }
  console.log(await page.evaluate(() => JSON.stringify({ built: window.__riverBuilt, rocks: window.ROCK_RECTS.length })));
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
