const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1500);
  for (const [name, keys] of [['swim_idle', {}], ['swim_move', { up:true }]]) {
    await page.evaluate(([name, keys]) => { const D = window.__dbg, s = D.state, p = s.player; if (name === 'swim_idle') { p.x = -20; p.z = 620; s.cam.fx = null; s.cam.yaw = s.cam.target = 0; s.cam.turn = null; s.keys = {}; for (let i = 0; i < 45; i++) { D.update(1/30); D.render(1/30); } }
      else { s.keys = keys; for (let i = 0; i < 22; i++) { D.update(1/30); D.render(1/30); } s.keys = {}; } D.render(1/60); }, [name, keys]);
    await page.screenshot({ path: SP + '/w/g_' + name + '.png', clip: { x: 250, y: 200, width: 500, height: 300 } });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
