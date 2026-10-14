const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500); await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1500);
  const shots = [['idle', 0, {}], ['swim-up', 25, { up:true }], ['swim-left', 25, { left:true }]];
  for (const [name, frames, keys] of shots) {
    await page.evaluate(([frames, keys]) => { const D = window.__dbg, s = D.state, p = s.player; if (!window.__init) { window.__init = 1; p.x = -150; p.z = 690; s.cam.fx = null; s.cam.yaw = s.cam.target = 0; s.cam.turn = null; for (let i = 0; i < 20; i++) { D.update(1/30); D.render(1/30); } }
      s.keys = keys; for (let i = 0; i < frames; i++) { D.update(1/30); D.render(1/30); } for (let i = 0; i < 3; i++) D.render(0.03); }, [frames, keys]);
    const st = await page.evaluate(() => { const p = window.__dbg.state.player; return 'x=' + p.x.toFixed(0) + ' z=' + p.z.toFixed(0) + ' swim=' + p.swim + ' swimK=' + (p.swimK||0).toFixed(2); });
    console.log(name, st); await page.screenshot({ path: SP + '/w/sw_' + name + '.png' });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
