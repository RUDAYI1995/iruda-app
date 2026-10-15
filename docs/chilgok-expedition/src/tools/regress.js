const { chromium } = require('playwright-core');
const fs = require('fs');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const pixelmatch = require(SP + '/imgdiff/node_modules/pixelmatch');
const POS = [[0,-20],[0,150],[0,500],[0,690],[0,900],[-220,1000],[-300,1196],[-235,1370],[-430,1070],[0,1650],[0,2300],[300,1500],[400,2000],[-500,600],[500,300],[250,1100],[610,800],[610,1100],[610,1300],[-610,1500]];

async function capture(browser, dir, hideSky, tag){
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => {            // freeze time + stop the auto loop → frames are fully deterministic
    const T0 = 1700000000000; Date.now = () => T0; performance.now = () => 5000;
    window.requestAnimationFrame = () => 0;
  });
  await page.goto('file://' + SP + '/' + dir + '/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1800);            // let every texture finish decoding
  const out = {};
  for (const [x, z] of POS) {
    await page.evaluate(([x, z, hideSky]) => {
      const D = window.__dbg, s = D.state, p = s.player;
      p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.target = 0; s.cam.yaw = 0;
      D.three.scene.children.forEach(c => { if (c.name === 'skyZone' || c.name === 'skyDome' || c.name === 'skySea') c.visible = !hideSky ? c.name === 'skyZone' ? true : c.visible : false; });
      D.three.camera.position.set(x, 0, z - 32);
      for (let i = 0; i < 150; i++) D.render(1/60);
    }, [x, z, hideSky]);
    await page.waitForTimeout(120);
    const f = `${SP}/rg_${tag}_${x}_${z}.png`;
    await page.screenshot({ path: f });
    out[x + ',' + z] = f;
  }
  await page.close();
  return { out, errs };
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const oldR = await capture(browser, 'test_old', false, 'old');
  const hidR = await capture(browser, 'test_new', true,  'hid');
  const visR = await capture(browser, 'test_new', false, 'vis');
  function diff(a, b){
    const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(b));
    return pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: 0.05 });
  }
  console.log('position        | old vs new(sky hidden) | old vs new(sky shown)');
  let allSame = true;
  for (const k of Object.keys(oldR.out)) {
    const d1 = diff(oldR.out[k], hidR.out[k]), d2 = diff(oldR.out[k], visR.out[k]);
    if (d1 !== 0) allSame = false;
    console.log(k.padEnd(15), '|', String(d1).padStart(8), 'px different   |', String(d2).padStart(8), 'px different');
  }
  console.log(allSame ? 'RESULT: existing map is pixel-identical with the sky zone hidden (code hooks change nothing).' : 'RESULT: DIFFERENCES FOUND with sky hidden!');
  console.log('errors:', JSON.stringify([...oldR.errs, ...hidR.errs, ...visR.errs]));
  await browser.close();
})();
