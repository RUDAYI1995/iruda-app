const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('console', m => { if (/failed|Error|error/.test(m.text()) && !/GPU stall/.test(m.text())) logs.push('CON ' + m.text().slice(0, 300)); }); page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 500)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(600);
  await page.addStyleTag({ content: 'div[style*="radial-gradient"]{display:none!important}' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1500);
  const fr = (n) => page.evaluate((n) => { const D = window.__dbg; for (let i = 0; i < n; i++) { D.update(1/30); D.render(1/30); } }, n);
  const info = () => page.evaluate(() => { const t = [...document.querySelectorAll('#canvasHolder div')].map(d => d.innerText).filter(x => /턴|국군|전투를/.test(x)).slice(0, 2).join(' | '); return t.slice(0, 160); });
  await page.evaluate(() => { const D = window.__dbg, p = D.state.player; p.x = 0; p.z = 1900; D.state.cam.fx = null; D.state.cam.yaw = D.state.cam.target = 0; });
  await fr(20); await page.waitForTimeout(3000); await fr(10);
  console.log('prompt:', await info()); await page.screenshot({ path: SP + '/w/tb_0.png' });
  await page.keyboard.press('Enter'); await fr(100);
  console.log('intro:', await info()); await page.screenshot({ path: SP + '/w/tb_1.png' });
  await page.keyboard.press(' '); await page.keyboard.press(' '); await page.keyboard.press(' '); await fr(10);
  console.log('after dlg:', await info()); await page.screenshot({ path: SP + '/w/tb_2.png' });
  const cnt = () => page.evaluate(() => { const x = [...document.querySelectorAll('#canvasHolder div')].map(d => d.innerText).find(v => /턴 \d+/.test(v) && /국군/.test(v)); return x ? x.replace(/\n/g, ' ').slice(0, 110) : 'no hud'; });
  const fr2 = (n, dt) => page.evaluate(([n, dt]) => { const D = window.__dbg; for (let i = 0; i < n; i++) { D.update(dt); D.render(dt); } }, [n, dt]);
  for (let turn = 0; turn < 45; turn++) {
    if (false) { await page.evaluate(() => { for (let s = 0; s < 2; s++){ window.__dbg.state.keys.up = true; window.__dbg.update(0.1); window.__dbg.state.keys.up = false; window.__dbg.update(0.1); } }); await fr2(4, 0.1); }
    await page.keyboard.press('2'); await fr2(1, 0.1);
    
    
    await page.keyboard.press(' '); await fr2(9, 0.25);
    let h = await cnt(); if (turn % 4 === 0) console.log('turn', turn + 1, h); const er = await page.evaluate(() => window.__tbErr || ''); if (er) { console.log('ERR_TB', er); break; }
    const done = await page.evaluate(() => !!document.querySelector('#canvasHolder') && [...document.querySelectorAll('#canvasHolder div')].some(d => /승리|패배|물리쳤/.test(d.innerText) && d.id === '__none'));
    // dialogue skip
    for (let q = 0; q < 6; q++) { const dl = await page.evaluate(() => !!window.__tbS.dlg); if (!dl) break; await page.keyboard.press(' '); await fr2(2, 0.1); }
    if (turn === 12) await page.screenshot({ path: SP + '/w/tb_3.png' });
  }
  console.log('TBS', await page.evaluate(() => { const S = window.__tbS; return JSON.stringify({ st: S.state, anim: S.anim, dlg: !!S.dlg, tw: !!S.tw, turn: S.turn, vis: (document.querySelector('#canvasHolder') ? 1 : 0), G: !!window.__dbg.three.scene.children.find(c => c.name === 'turnBattle') && window.__dbg.three.scene.children.find(c => c.name === 'turnBattle').visible, p: [window.__dbg.state.player.x, window.__dbg.state.player.z] }); })); console.log('LOSE', await page.evaluate(() => window.__tbLose || 'none')); console.log('TBERR', await page.evaluate(() => window.__tbErr || 'none')); await page.screenshot({ path: SP + '/w/tb_4.png' });
  console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
