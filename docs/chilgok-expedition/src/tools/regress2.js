const { chromium } = require('playwright-core');
const fs = require('fs');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const pixelmatch = require(SP + '/imgdiff/node_modules/pixelmatch');
const POS = [[0,-20],[0,150],[0,500],[0,690],[0,900],[-220,1000],[-300,1196],[0,1650],[0,2300],[300,1500],[500,300],[610,1100]];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => { const T0 = 1700000000000; Date.now = () => T0; performance.now = () => 5000; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1800);
  let same = 0;
  for (const [x, z] of POS) {
    await page.evaluate(([x, z]) => {
      const D = window.__dbg, s = D.state, p = s.player;
      p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.turn = null;
      D.three.scene.children.forEach(c => { if (c.name === 'skyZone' || c.name === 'skyDome' || c.name === 'skySea') c.visible = false; });
      D.three.camera.position.set(x, 0, z - 32); document.querySelectorAll('button').forEach(b => { if (b.title === '소리 켜기/끄기') b.style.display = 'none'; });
      for (let i = 0; i < 150; i++) D.render(1/60);
    }, [x, z]);
    await page.waitForTimeout(120);
    const f = `${SP}/rg2_${x}_${z}.png`;
    await page.screenshot({ path: f });
    const ref = `${SP}/rg_old_${x}_${z}.png`;
    const A = PNG.sync.read(fs.readFileSync(ref)), B = PNG.sync.read(fs.readFileSync(f));
    const d = pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: 0.05 });
    if (d === 0) same++;
    console.log(`${x},${z}`.padEnd(12), String(d).padStart(7), 'px different from the original game');
  }
  console.log(`RESULT: ${same}/${POS.length} viewpoints identical to the original (forward-facing views, sky hidden)`);
  console.log('errors:', JSON.stringify(errs));
  await browser.close();
})();
