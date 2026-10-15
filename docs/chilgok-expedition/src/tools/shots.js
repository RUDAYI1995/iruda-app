const { chromium } = require('playwright-core');
const SP = process.argv[2], DIR = process.argv[3], OUT = process.argv[4];
const shots = JSON.parse(process.argv[5]);   // [[name, x, z, settleMs, yawTarget?]]
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 600)));
  page.on('console', m => { if (m.type() === 'error') errs.push('[console.error] ' + m.text().slice(0, 300)); });
  await page.goto('file://' + SP + '/' + DIR + '/index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1500);
  for (const [name, x, z, settle] of shots) {
    await page.evaluate(([x, z]) => { const s = window.__dbg.state; s.player.x = x; s.player.z = z; s.cam.fx = null; }, [x, z]);
    await page.waitForTimeout(settle || 2500);
    const info = await page.evaluate(() => ({ hud: document.getElementById('hudPlace').textContent, y: window.__dbg.groundHeightAt(window.__dbg.state.player.x, window.__dbg.state.player.z).toFixed(1) }));
    console.log(name, JSON.stringify(info));
    await page.screenshot({ path: SP + '/' + OUT + '_' + name + '.png' });
  }
  if (errs.length) console.log('ERRORS:\n' + errs.join('\n')); else console.log('no page errors');
  await browser.close();
})();
