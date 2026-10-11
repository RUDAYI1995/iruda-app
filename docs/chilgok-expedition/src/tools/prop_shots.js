const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-2'); await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const D = window.__dbg, d = D.SKY_PROPS ? D.SKY_PROPS.defs : null; return d ? Object.fromEntries(Object.entries(d).map(([k, v]) => [k, [Math.round(v.x), Math.round(v.z)]])) : null; });
  console.log(JSON.stringify(r));
  const shots = [['chapel_front', 'chapel', 30, 0], ['chapel_back', 'chapel', 30, Math.PI], ['gate_front', 'gate', 34, 0], ['gazebo', 'gazebo', 32, 0.6]];
  for (const [name, key, dist, rot] of shots) {
    await page.evaluate(([key, dist, rot]) => { const D = window.__dbg, s = D.state, p = s.player, d = D.SKY_PROPS.defs[key];
      D.setRef(600); const ux = Math.cos(d.a), uz = Math.sin(d.a);
      p.x = 1175 + ux*50; p.z = 2000 + uz*50; p.y = 0;
      for (let i = 0; i < 30; i++) D.render(1/60);
      const c = D.three.camera, ang = d.a + rot - 0 ; const cx = d.x - Math.cos(d.a + (rot ? Math.PI : 0) - Math.PI)*0; 
      // camera in front of the building (towards the plaza) or behind it
      const dir = rot ? -1 : 1; c.position.set(d.x - ux*dist*dir + (-uz)*dist*0.25*(rot?0:1), 600 + 12, d.z - uz*dist*dir + ux*dist*0.25*(rot?0:1)); c.lookAt(d.x, 600 + 7, d.z); D.three.renderer.render(D.three.scene, c); }, [key, dist, rot]);
    await page.waitForTimeout(300); await page.screenshot({ path: SP + '/prop_' + name + '.png' }); console.log('shot', name);
  }
  console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors'); await browser.close();
})();
