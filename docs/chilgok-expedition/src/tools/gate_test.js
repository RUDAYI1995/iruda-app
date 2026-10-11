const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 640, height: 400 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(2500);
  const spots = [[0,300],[-400,1500],[300,1000],[480,1100],[560,1100],[620,1100],[800,1100],[1000,1108]];
  for (const [x, z] of spots) {
    const r = await page.evaluate(([x, z]) => {
      const D = window.__dbg, s = D.state, p = s.player, sc = D.three.scene;
      p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.yaw = 0; s.cam.target = 0; s.cam.turn = null;
      for (let i = 0; i < 3; i++) D.render(1/60);
      const sky = sc.getObjectByName('skyZone');
      let hi = 0, hiVis = 0, sh = 0, shVis = 0;
      sky.children.forEach(c => { if (c.name === 'highIsland') { hi++; if (c.visible) hiVis++; } if (c.name === 'highIslandShadow') { sh++; if (c.visible) shVis++; } });
      const f = sc.fog;
      return { islands: hiVis + '/' + hi, shadows: shVis + '/' + sh, fog: [f.near, f.far, f.color.getHexString()].join(' '), dome: sc.getObjectByName('skyDome').visible, sea: sc.getObjectByName('skySea').visible };
    }, [x, z]);
    console.log(`(${x},${z})`.padEnd(12), JSON.stringify(r));
  }
  console.log(errs.length ? 'ERRORS ' + errs.join('|') : 'no page errors');
  await browser.close();
})();
