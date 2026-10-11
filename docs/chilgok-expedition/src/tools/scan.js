const { chromium } = require('playwright-core');
const fs = require('fs');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
// hill / mountain tops and slopes (high camera), looking sideways
const SPOTS = JSON.parse(process.argv[3]);
const YAWS = JSON.parse(process.argv[4]);
function metric(file) {
  const im = PNG.sync.read(fs.readFileSync(file)), W = im.width, H = im.height;
  let hit = 0, tot = 0;
  for (let y = Math.floor(H*0.58); y < Math.floor(H*0.9); y++) for (let x = 0; x < W; x += 2) {
    const i = (y*W + x)*4, r = im.data[i], g = im.data[i+1], b = im.data[i+2];
    tot++;
    // cool blue-grey haze band (the mountain-card haze), not green grass / brown path / blue water
    if (Math.abs(r-150) < 26 && Math.abs(g-158) < 22 && Math.abs(b-170) < 24 && b >= g && g >= r-6) hit++;
  }
  return +(100*hit/tot).toFixed(1);
}
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 760, height: 520 } });
  page.on('pageerror', e => console.log('ERR', String(e.message||e).slice(0,200)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1800);
  console.log('spot(x,z) yaw  | old-rule % haze | new-rule % haze');
  for (const [x, z] of SPOTS) for (const yawDeg of YAWS) {
    const res = {};
    for (const rule of ['old', 'new']) {
      await page.evaluate(([x, z, yawDeg, rule]) => {
        const D = window.__dbg, s = D.state, p = s.player, y = yawDeg*Math.PI/180;
        p.x = x; p.z = z; p.y = 0; p.dir = 'back'; p.walking = false;
        s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
        const gy = D.groundHeightAt(x, z);
        D.three.camera.position.set(x - Math.sin(y)*32, 16 + gy, z - Math.cos(y)*32);
        D.render(1/60); D.render(1/60);
        if (rule === 'old') {                    // the previous behaviour: N/S sets always shown, E/W fade in with |sin(yaw)|
          const ek = Math.max(0, Math.min(1, (Math.abs(Math.sin(y)) - 0.1) / 0.5));
          D.three.bg.forEach(c => { const ew = Math.abs(c.hd) > 1; c.g.visible = ew ? ek > 0.001 : true; c.mat.opacity = ew ? c.op*ek : c.op; });
          D.three.renderer.render(D.three.scene, D.three.camera);
        }
      }, [x, z, yawDeg, rule]);
      await page.waitForTimeout(80);
      const f = `${SP}/scan_${rule}_${x}_${z}_${yawDeg}.png`;
      await page.locator('#canvasHolder').screenshot({ path: f });
      res[rule] = metric(f);
    }
    console.log(`(${x},${z})`.padEnd(14), String(yawDeg).padStart(4), ' |', String(res.old).padStart(8), '        |', String(res.new).padStart(8));
  }
  await browser.close();
})();
