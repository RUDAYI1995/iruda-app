const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 500, height: 300 } });
  await page.addInitScript(() => { const T0 = 1700000000000; Date.now = () => T0; performance.now = () => 5000; window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1500);
  const run = async (name, setup) => {
    await page.evaluate(([setup]) => {
      const D = window.__dbg, s = D.state, p = s.player; p.x = 0; p.z = 900; p.y = 0; s.cam.fx = null; s.cam.fy = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.turn = null;
      D.three.scene.children.forEach(c => { if (c.name === 'skyZone' || c.name === 'skyDome' || c.name === 'skySea') c.visible = false; });
      D.three.camera.position.set(0, 0, 868);
      if (setup) eval(setup);
      for (let i = 0; i < 150; i++) D.render(1/60); }, [setup]);
    await page.waitForTimeout(150); await page.screenshot({ path: SP + '/rc_' + name + '.png' });
  };
  for (const z of [500, 690, 900]) {
    console.log(z, JSON.stringify(await page.evaluate(([z]) => {
      const D = window.__dbg, s = D.state, p = s.player; p.x = 0; p.z = z; p.y = 0; s.cam.fx = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.turn = null;
      D.three.camera.position.set(0, 0, z - 32);
      for (let i = 0; i < 150; i++) D.render(1/60);
      const c = D.three.camera.position; return { cam: [c.y, c.z], fy: s.cam.fy, gy: D.groundHeightAt(0, z), yaw: s.cam.yaw, vel: s.cam.yawVel }; }, [z])));
  }
  await browser.close();
})();
