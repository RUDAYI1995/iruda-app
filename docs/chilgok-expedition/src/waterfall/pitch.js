const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.message).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const box = await page.evaluate(() => { const r = document.getElementById('canvasHolder').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  async function frames(n){ await page.evaluate((n) => { const D = window.__dbg; D.state.player.x = 0; D.state.player.z = 400; for (let i = 0; i < n; i++) D.render(0.1); }, n); }
  const st = () => page.evaluate(() => { const c = window.__dbg.state.cam; return 'pt=' + (c.pt||0).toFixed(2) + ' pv=' + (c.pv||0).toFixed(2) + ' lock=' + !!c.plock; });
  await frames(5); console.log('start', await st()); await page.screenshot({ path: SP + '/w/pi_0.png' });
  await page.mouse.move(box[0] + box[2]/2, box[1] + 5); await frames(25); console.log('mouse top   ', await st()); await page.screenshot({ path: SP + '/w/pi_up.png' });
  await page.mouse.move(box[0] + box[2]/2, box[1] + box[3] - 5); await frames(25); console.log('mouse bottom', await st()); await page.screenshot({ path: SP + '/w/pi_down.png' });
  await page.keyboard.press('c'); await page.mouse.move(box[0] + box[2]/2, box[1] + 5); await frames(25); console.log('C locked then mouse top', await st());
  await page.keyboard.press('c'); await page.mouse.move(box[0] + box[2]/2, box[1] + box[3]/2); await frames(25); console.log('C unlocked, mouse center', await st());
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
