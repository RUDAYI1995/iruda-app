const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 450 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const out = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, res = [];
    const sky = D.three.scene.getObjectByName('skyZone');
    const THREEv = D.three.camera.position.constructor;
    for (const [x, z, yawDeg] of [[0,1300,90],[200,1500,80],[350,1700,70],[450,1400,90],[480,2000,60],[550,1300,90],[300,1100,60]]) {
      const y = yawDeg*Math.PI/180; p.x = x; p.z = z; p.y = 0; s.cam.yaw = y; s.cam.target = y; s.cam.turn = null; s.cam.fx = null;
      D.three.camera.position.set(x - Math.sin(y)*32, 16 + D.groundHeightAt(x, z), z - Math.cos(y)*32);
      for (let i = 0; i < 40; i++) D.render(1/60);
      const cam = D.three.camera; cam.updateMatrixWorld();
      let vis = 0, tot = 0, det = [];
      sky.children.forEach(c => { if (c.name === 'highIsland') { tot++; const v = new THREEv().copy(c.position).project(cam); const inV = v.z < 1 && Math.abs(v.x) < 1.05 && v.y > -1 && v.y < 1.05; if (inV) vis++; det.push((v.x).toFixed(1)+','+(v.y).toFixed(1)); } });
      res.push([x, z, yawDeg, c => 0].slice(0,3).join('/') + ' visible ' + vis + '/' + tot + '  ' + det.join(' | '));
    }
    return res;
  });
  console.log(out.join('\n'));
  await browser.close();
})();
