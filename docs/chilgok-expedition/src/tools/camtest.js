const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });   // we drive time ourselves
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1500);
  // run `sec` simulated seconds at 60fps with the given held keys; sample [t, yaw(deg), x, z, dir] at checkpoints
  const run = (keys, sec, marks) => page.evaluate(([keys, sec, marks]) => {
    const D = window.__dbg, s = D.state, p = s.player, out = [];
    ['left','right','up','down'].forEach(k => s.keys[k] = false);
    keys.forEach(k => s.keys[k] = true);
    const n = Math.round(sec * 60);
    for (let i = 1; i <= n; i++) {
      D.update(1/60); D.render(1/60);
      const t = i/60;
      if (marks.some(m => Math.abs(m - t) < 0.5/60)) out.push([+t.toFixed(2), +(s.cam.yaw*180/Math.PI).toFixed(1), +p.x.toFixed(1), +p.z.toFixed(1), p.dir]);
    }
    keys.forEach(k => s.keys[k] = false);
    return out;
  }, [keys, sec, marks]);
  const reset = (x, z) => page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state; s.player.x = x; s.player.z = z; s.cam.yaw = 0; s.cam.target = 0; s.cam.turn = null; s.cam.prevSx = 0; s.cam.prevV = 0; s.cam.mvx = 0; s.cam.mvz = 0; s.cam.fx = null; ['left','right','up','down'].forEach(k => s.keys[k] = false); }, [x, z]);
  const show = (label, rows) => { console.log(label); rows.forEach(r => console.log('   t=' + r[0] + 's  camera yaw=' + String(r[1]).padStart(6) + 'deg  pos=(' + r[2] + ', ' + r[3] + ')  sprite=' + r[4])); };

  await reset(0, 300);
  show('1) UP then DOWN: camera should flip right away (no 0.3s wait)', await run(['up'], 0.3, [0.1, 0.3]));
  show('   ...press DOWN (walk toward the camera):', await run(['down'], 0.5, [0.02, 0.1, 0.17, 0.25, 0.3, 0.5]));

  await reset(0, 300);
  show('2) LEFT: camera should take ~1.0s to turn 90deg and then character looks forward', await run(['left'], 1.3, [0.02, 0.25, 0.5, 0.75, 1.0, 1.25]));

  await reset(0, 300);
  show('3) RIGHT:', await run(['right'], 1.3, [0.02, 0.5, 1.0, 1.25]));

  await reset(0, 300);
  show('4) LEFT held 1.3s, release, then UP keeps walking the same way (+x)', await run(['left'], 1.3, [1.3]));
  show('   ...then UP 0.5s:', await run(['up'], 0.5, [0.5]));
  show('   ...then DOWN 0.5s (turn around, -x):', await run(['down'], 0.5, [0.25, 0.5]));

  await reset(0, 300);
  show('5) diagonal UP+LEFT: camera should not turn, walk diagonally', await run(['up','left'], 0.6, [0.3, 0.6]));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})();
