const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('console', m => { if (/failed|Error|error|오류/.test(m.text()) && !/GPU stall/.test(m.text())) logs.push('CON ' + m.text().slice(0, 300)); }); page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(600);
  await page.addStyleTag({ content: 'div[style*="radial-gradient"]{display:none!important}' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1500);
  const fr = (n, dt) => page.evaluate(([n, dt]) => { const D = window.__dbg; for (let i = 0; i < n; i++) { D.update(dt); D.render(dt); } }, [n, dt || 1/30]);
  await page.evaluate(() => { const D = window.__dbg, p = D.state.player; p.x = 0; p.z = 1900; D.state.cam.fx = null; D.state.cam.yaw = D.state.cam.target = 0; });
  await fr(20); await page.waitForTimeout(3000); await fr(10);
  await page.keyboard.press('Enter'); await fr(40, 0.1); await page.screenshot({ path: SP + '/w/tw_0.png' }); await fr(60, 0.1);
  for (let q = 0; q < 5; q++) { await page.keyboard.press(' '); await fr(2, 0.1); }
  await page.screenshot({ path: SP + '/w/tw_1.png' });
  await fr(40, 0.1); console.log('pre', await page.evaluate(() => JSON.stringify({ keys: window.__dbg.state.keys, moves: window.__tbS.moves, tw: window.__tbS.tw, st: window.__tbS.state, dlg: !!window.__tbS.dlg, vis: !document.querySelector('#screen-game').hidden })));
  for (let s = 0; s < 4; s++) { await page.keyboard.down('ArrowUp'); console.log('keys', await page.evaluate(() => JSON.stringify(window.__dbg.state.keys))); await fr(3, 0.1); await page.keyboard.up('ArrowUp'); await fr(4, 0.1); }
  console.log('rabbit gz after 4 up presses (max 3 moves):', await page.evaluate(() => window.__tbDbg.RAB.gz));
  await page.keyboard.press('w'); await fr(3, 0.1); console.log('kick (no adjacent):', await page.evaluate(() => window.__tbS.log.slice(-1)[0]));
  await page.keyboard.press('q'); await fr(3, 0.1); await page.screenshot({ path: SP + '/w/tw_2.png' });
  await page.keyboard.press(' '); await fr(20, 0.1); await page.screenshot({ path: SP + '/w/tw_3.png' }); await fr(25, 0.1);
  // 루샤를 약하게 만들고 앞으로 불러와서 승리 흐름 확인
  await page.evaluate(() => { const D = window.__tbDbg; D.LUC.hp = 1; D.LUC.gx = 0; D.LUC.gz = -4; });
  for (let t = 0; t < 4; t++) { await page.keyboard.press(' '); await fr(20, 0.1); const st = await page.evaluate(() => window.__tbS.state); if (st === 'anim' || st === 'won') break; }
  await fr(6, 0.1);
  for (let q = 0; q < 6; q++) { const dl = await page.evaluate(() => !!window.__tbS.dlg); if (!dl) break; await page.screenshot({ path: SP + '/w/tw_4.png' }); await page.keyboard.press(' '); await fr(2, 0.1); }
  await fr(30, 0.1);
  console.log('state', await page.evaluate(() => JSON.stringify({ st: window.__tbS.state, active: window.__tbS.active, lucHp: window.__tbDbg.LUC.hp, cleared: window.__dbg.state.defeated.size })));
  await page.screenshot({ path: SP + '/w/tw_5.png' });
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
