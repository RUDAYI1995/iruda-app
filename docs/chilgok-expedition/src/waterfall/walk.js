const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.message).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2500);
  const out = await page.evaluate(() => { const D = window.__dbg, s = D.state, p = s.player, res = [];
    function run(label, x, z, keys, secs){ p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.yaw = 0; s.cam.target = 0; s.cam.turn = null; s.keys = keys; for (let i = 0; i < secs*30; i++) { D.update(1/30); } s.keys = {}; res.push(label + ' -> x=' + p.x.toFixed(1) + ' z=' + p.z.toFixed(1) + ' groundH=' + D.groundHeightAt(p.x, p.z).toFixed(1)); }
    for (let i = 0; i < 5; i++) D.render(0.1);
    run('bridge cross (0,500) up 14s', 0, 500, { up:true }, 14);
    run('step off deck sideways (5,690) right 3s (blocked)', 5, 690, { right:true }, 3);
    run('step off deck sideways (-5,690) left 3s (blocked)', -5, 690, { left:true }, 3);
    run('north bank into river (-95,540) up 4s', -95, 540, { up:true }, 4); res.push('  swim=' + p.swim);
    run('swim across to S bank (-95,700) up 6s', -95, 700, { up:true }, 6); res.push('  swim=' + p.swim);
    run('swim under bridge (30,600) up 3s', 30, 600, { up:true }, 3); res.push('  swim=' + p.swim + ' gh=' + D.groundHeightAt(p.x, p.z));
    run('west hill from N edge (-300,400) up 8s', -300, 400, { up:true }, 8);
    run('east mound from N (590,430) up 8s', 590, 430, { up:true }, 8);
    run('stream swim (-250,600) up 4s', -250, 600, { up:true }, 4); res.push('  swim=' + p.swim);
    return res.join('\n'); });
  console.log(out); console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
