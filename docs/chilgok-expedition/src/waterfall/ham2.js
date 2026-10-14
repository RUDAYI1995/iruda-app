const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 3; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1200);
  // 게임 카메라 그대로: 걷기 / 달리기 / 점프 / 옆으로 걷기
  const cases = [['walk', { up:true }, 30, false], ['run', { up:true }, 40, true], ['side', { left:true }, 40, false], ['jump', { up:true }, 0, false]];
  for (const [name, keys, frames, run] of cases) {
    await page.evaluate(([keys, frames, run, name]) => { const D = window.__dbg, s = D.state, p = s.player; if (name === 'walk') { p.x = 40; p.z = 100; s.cam.fx = null; s.cam.yaw = s.cam.target = 0; s.cam.turn = null; for (let i = 0; i < 20; i++) { D.update(1/30); D.render(1/30); } }
      s.keys = Object.assign({}, keys, { run }); for (let i = 0; i < frames; i++) { D.update(1/30); D.render(1/30); }
      if (name === 'jump') { s.keys = { up:true, jump:true }; for (let i = 0; i < 6; i++) { D.update(1/30); D.render(1/30); s.keys = { up:true }; } }
      D.render(1/60); }, [keys, frames, run, name]);
    await page.screenshot({ path: SP + '/w/g_' + name + '.png' });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
