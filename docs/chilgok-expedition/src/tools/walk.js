const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.stack || e).slice(0, 400)));
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1200);
  const pos = () => page.evaluate(() => { const p = window.__dbg.state.player, D = window.__dbg; return { x:+p.x.toFixed(1), z:+p.z.toFixed(1), h:+D.groundHeightAt(p.x,p.z).toFixed(1), hud:document.getElementById('hudPlace').textContent }; });
  const setPos = (x, z) => page.evaluate(([x,z]) => { const s = window.__dbg.state; s.player.x = x; s.player.z = z; s.cam.fx = null; }, [x, z]);
  async function hold(keys, ms){ for(const k of keys) await page.keyboard.down(k); await page.waitForTimeout(ms); for(const k of keys.slice().reverse()) await page.keyboard.up(k); await page.waitForTimeout(150); }

  // 1) old map east edge at a spot that is NOT the gate: must still stop at x=620 like before
  await setPos(560, 1000); await hold(['ArrowLeft'], 2500);
  console.log('1) edge away from gate  ->', JSON.stringify(await pos()), '(expect x=620, old behaviour)');

  // 2) walk into the ramp from the old map at the gate z, screen-left = +x
  await setPos(560, 1100); await hold(['ArrowLeft'], 2200);
  console.log('2) walking onto ramp    ->', JSON.stringify(await pos()), '(expect x>620, rising)');
  await hold(['ArrowLeft'], 3500);
  console.log('   ...further           ->', JSON.stringify(await pos()), '(expect x~985+, h=90)');

  // 3) try to drift off the ramp sideways (z) : must stay on the path
  await hold(['ArrowUp'], 700);
  console.log('3) walk off path edge   ->', JSON.stringify(await pos()), '(z should be gate path or pad, not far off)');

  // 4) at the pad go along path1 toward the gate island
  await setPos(1000, 1108); await hold(['ArrowUp'], 3500);
  console.log('4) path1 forward 3.5s   ->', JSON.stringify(await pos()));

  // 5) walk straight through the central arch of the gate
  await setPos(1000, 1400); await hold(['ArrowUp'], 1200);
  console.log('5) through central arch ->', JSON.stringify(await pos()), '(z should pass 1440)');

  // 6) try to walk into a gate pillar (x offset 12.5 from center, z 1440)
  await setPos(1012.5, 1425); await hold(['ArrowUp'], 900);
  console.log('6) into a pillar        ->', JSON.stringify(await pos()), '(z should stop before ~1436.6)');

  // 7) walk off the far edge of the gate island sideways
  await setPos(1000, 1410); await hold(['ArrowLeft'], 3000);
  console.log('7) island side edge     ->', JSON.stringify(await pos()), '(x should stop near 1000+79=1079)');

  // 8) obelisk base blocked
  await setPos(1000, 1660); await hold(['ArrowUp'], 1500);
  console.log('8) toward obelisk base  ->', JSON.stringify(await pos()), '(should stop ~ z=1679 : 1690-11)');

  // 9) walk back down from the sky to the old map
  await setPos(985, 1100); await hold(['ArrowRight'], 6000);
  console.log('9) back down the ramp   ->', JSON.stringify(await pos()), '(expect x<620, h=0, HUD old landmark)');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await browser.close();
})();
