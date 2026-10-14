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
    function run(label, x, z, keys, secs){ p.x = x; p.z = z; p.y = 0; s.cam.fx = null; s.cam.yaw = 0; s.cam.target = 0; s.cam.turn = null; s.keys = keys; for (let i = 0; i < secs*30; i++) { D.update(1/30); } s.keys = {}; res.push(label + ' -> x=' + p.x.toFixed(1) + ' z=' + p.z.toFixed(1)); }
    for (let i = 0; i < 5; i++) D.render(0.1);
    run('bridge cross (0,500) up 14s', 0, 500, { up:true }, 14);
    run('N bank into river (-95,540) up 6s', -95, 540, { up:true }, 6);
    run('S bank into river (105,860) down 6s', 105, 860, { down:true }, 6);
    run('N bank mid (300,540) up 6s', 300, 540, { up:true }, 6);
    run('stream (-250,600) up 4s', -250, 600, { up:true }, 4);
    run('west gorge (-150,700) left(+x?) ', -150, 700, { right:true }, 3);
    run('east cave (500,690) right', 500, 690, { left:true }, 3);
    run('north bank walk west (-30,520) right 6s', -30, 520, { right:true }, 6);
    run('north bank walk east (30,520) left 6s', 30, 520, { left:true }, 6);
    return res.join('\n'); });
  console.log(out); console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
