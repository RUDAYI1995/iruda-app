const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 600 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 400)));
  await page.addInitScript(() => { window.__now = 5000; performance.now = () => window.__now; Date.now = () => 1700000000000 + window.__now; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const shots = [];
  for (const [label, now] of [['5s', 5000], ['16s', 16000], ['20s(start)', 20500], ['45s', 45000], ['70s', 70000], ['101s', 101000], ['120s', 120000], ['199s', 199500], ['230s (2nd)', 230000], ['280s', 280000], ['300s', 300000]]) {
    const r = await page.evaluate(([label, now]) => { const D = window.__dbg, p = D.state.player; window.__now = now; p.x = 0; p.z = 500; D.render(0.05); const q = D.three.scene.children.find(c => c.name === 'catPlane'); let nd = ''; if (q && q.visible) { const v = q.position.clone().project(D.three.camera); nd = ' ndc=' + v.x.toFixed(2) + ',' + v.y.toFixed(2) + ' z=' + v.z.toFixed(3) + ' cam=' + D.three.camera.position.toArray().map(a => a.toFixed(0)); } return label + ': ' + (q && q.visible ? 'FLYING pos=' + q.position.toArray().map(v => v.toFixed(0)) + nd : 'hidden'); }, [label, now]);
    console.log(r);
    if (label === '70s') await page.screenshot({ path: SP + '/w/flow_70.png' });
  }
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
