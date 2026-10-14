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
    run('west hill from N edge (-300,400) up 8s', -300, 400, { up:true }, 8);
    run('west plateau top toward fall (-470,690) left 8s', -470, 690, { left:true }, 8);
    run('meadow beside stream (-200,640) up 4s (into stream)', -200, 640, { up:true }, 4);
    run('main river N bank (-95,540) up 6s (swim in)', -95, 540, { up:true }, 6);
    run('east mound from N (590,430) up 8s', 590, 430, { up:true }, 8);
    run('bridge cross (0,500) up 14s', 0, 500, { up:true }, 14);
    res.push('water level: ' + [[-200,690],[0,640],[300,690]].map(q => q.join(',') + '=' + D.groundHeightAt(q[0], q[1]).toFixed(2)).join(' | '));
    return res.join('\n'); });
  console.log(out); console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
