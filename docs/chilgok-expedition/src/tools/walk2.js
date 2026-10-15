const { chromium } = require('playwright-core');
const SP = process.argv[2], DIR = process.argv[3] || 'test_new';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 400)));
  await page.goto('file://' + SP + '/' + DIR + '/index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1200);
  // deterministic stepping: set held keys, run update(1/30) for `sec` simulated seconds
  const walk = (x, z, keys, sec) => page.evaluate(([x, z, keys, sec]) => {
    const D = window.__dbg, s = D.state, p = s.player;
    p.x = x; p.z = z; p.y = 0; p.vy = 0; s.cam.fx = null; s.cam.target = 0; s.cam.yaw = 0; s.cam.latchFacing = 1; s.cam.prevV = 0; s.cam.flipT = 0;
    ['left','right','up','down','jump'].forEach(k => s.keys[k] = false);
    keys.forEach(k => s.keys[k] = true);
    const n = Math.round(sec * 30), trail = [];
    for (let i = 0; i < n; i++) { D.update(1/30); if (i % Math.max(1, Math.floor(n/6)) === 0) trail.push([+p.x.toFixed(0), +p.z.toFixed(0), +D.groundHeightAt(p.x,p.z).toFixed(0)]); }
    keys.forEach(k => s.keys[k] = false);
    return { x:+p.x.toFixed(1), z:+p.z.toFixed(1), h:+D.groundHeightAt(p.x,p.z).toFixed(1), trail:JSON.stringify(trail) };
  }, [x, z, keys, sec]);
  const R = (label, expect, r) => console.log(label.padEnd(28), `x=${r.x} z=${r.z} h=${r.h}`.padEnd(30), '|', expect, '\n' + ' '.repeat(28), 'trail', r.trail);

  R('A old edge, not at gate', 'expect x=620 (unchanged old rule)', await walk(560, 1000, ['left'], 6));
  R('B old edge, z just off gate', 'expect x=620 (gate is only +-7.5)', await walk(560, 1109, ['left'], 6));
  R('C old edge at gate z', 'expect x climbs past 620 to ~985', await walk(560, 1100, ['left'], 8));
  R('D ramp: try leave sideways', 'expect z stays within 1100+-7.5', await walk(800, 1100, ['up'], 3));
  R('E old map west edge', 'expect x=-620', await walk(-560, 500, ['right'], 6));
  R('F old map south end', 'expect z=-40', await walk(0, 100, ['down'], 8));
  R('G old map north end', 'expect z=2680', await walk(0, 2600, ['up'], 6));
  R('H pad -> path1 -> gate isl', 'expect z reaches ~1330+ on island', await walk(1000, 1108, ['up'], 9));
  R('I gate: central arch pass', 'expect z > 1445 (walks through)', await walk(1000, 1400, ['up'], 3));
  R('J gate: pillar block', 'expect z stops ~1436.6', await walk(1012.5, 1420, ['up'], 3));
  R('K gate: side arch opening', 'expect z passes 1440 at x=1022', await walk(1022, 1420, ['up'], 3));
  R('L gate island side edge', 'expect x stops ~1079', await walk(1000, 1410, ['left'], 6));
  R('M gap between islands', 'expect z stops at path end ~1334.. fine', await walk(1000, 1334, ['up'], 1));
  R('N path2 -> obelisk isl', 'expect continues to obelisk island', await walk(1000, 1500, ['up'], 5));
  R('O obelisk base block', 'expect z stops ~1679', await walk(1000, 1660, ['up'], 3));
  R('P off path1 sideways', 'expect x stays within 1000+-7.5', await walk(1000, 1230, ['left'], 3));
  R('Q back down the ramp', 'expect x<620 and h=0', await walk(985, 1100, ['right'], 14));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})();
