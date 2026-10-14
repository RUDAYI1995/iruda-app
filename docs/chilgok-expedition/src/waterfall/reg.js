const { chromium } = require('playwright-core'); const fs = require('fs');
const SP = process.argv[2]; const { PNG } = require('pngjs'); const pm = require('pixelmatch');
const POS = [[0,-20],[0,150],[0,500],[0,690],[0,900],[-220,1000],[-300,1196],[0,1650],[0,2300],[300,1500],[500,300],[610,1100]];
async function shoot(dir, tag, browser) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 560 } });
  await page.addInitScript(() => { const T0 = 1700000000000; Date.now = () => T0; performance.now = () => 5000; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/' + dir + '/index.html'); await page.addStyleTag({ content: '[title="음악 볼륨"],[title="소리 켜기/끄기"]{display:none!important}' });
  await page.waitForTimeout(400); await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1800);
  for (const [x, z] of POS) {
    await page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state, p = s.player; p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.turn = null;
      D.three.scene.children.forEach(c => { if (c.name === 'skyZone' || c.name === 'skyDome' || c.name === 'skySea') c.visible = false; }); for (let i = 0; i < 40; i++) D.render(1/60); }, [x, z]);
    await page.screenshot({ path: `${SP}/w/rg_${tag}_${x}_${z}.png` });
  }
  await page.close();
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  await shoot('base_test', 'old', browser); await shoot('test', 'new', browser);
  let same = 0;
  for (const [x, z] of POS) { const A = PNG.sync.read(fs.readFileSync(`${SP}/w/rg_old_${x}_${z}.png`)), B = PNG.sync.read(fs.readFileSync(`${SP}/w/rg_new_${x}_${z}.png`)); const d = pm(A.data, B.data, null, A.width, A.height, { threshold: 0.05 }); if (d === 0) same++; console.log(`${x},${z}`.padEnd(12), d); }
  console.log(`identical ${same}/${POS.length}`); await browser.close(); })();
