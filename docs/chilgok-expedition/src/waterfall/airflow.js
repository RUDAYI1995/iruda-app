const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 640 } });
  const logs = []; page.on('console', m => { if (/failed|Error|error/.test(m.text()) && !/GPU stall/.test(m.text())) logs.push('CON ' + m.text().slice(0, 400)); }); page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 600)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.addStyleTag({ content: 'div[style*="radial-gradient"]{display:none!important}' });
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  await page.evaluate(() => { for (let i = 0; i < 4; i++) window.__dbg.render(0.05); }); await page.waitForTimeout(1200);
  const out = [];
  async function step(label, fn){ const r = await page.evaluate(fn); out.push(label + ': ' + JSON.stringify(r)); }
  await step('path walkability', () => { const D = window.__dbg; D.setRef(600); const AX = 1340, AZ = 2335, AR = 160; const ux = (AX - 1175)/Math.hypot(AX - 1175, AZ - 2000), uz = (AZ - 2000)/Math.hypot(AX - 1175, AZ - 2000); const ax = 1175 + ux*101, az = 2000 + uz*101, bx = AX - ux*(AR - 4), bz = AZ - uz*(AR - 4);
    const pts = [[1175, 2000], [ax, az], [bx, bz], [AX - 30, AZ - 100], [AX - 20, AZ - 40], [AX + 68, AZ + 25], [AX + 68, AZ + 40], [AX + 68, AZ + 52], [AX + 68, AZ + 66], [AX - 44, AZ + 45]]; const res = [];
    function line(a, b){ let bad = 0, n = 60; for (let i = 0; i <= n; i++){ const x = a[0] + (b[0] - a[0])*i/n, z = a[1] + (b[1] - a[1])*i/n; if (!D.skyWalkable(x, z)) bad++; } return bad; }
    for (let i = 0; i < pts.length - 1; i++) res.push(i + '->' + (i + 1) + ' blockedSamples=' + line(pts[i], pts[i + 1])); return res; });
  // 2) 탑승 지점으로 이동 후 힌트/탑승
  await step('hint at gate', () => { const D = window.__dbg, p = D.state.player; window.skyTeleport(p, 1296, 2380, 600); for (let i = 0; i < 6; i++) { D.update(1/30); D.render(1/30); } return { hint: D.villageHint(p), place: document.getElementById('hudPlace').textContent }; });
  await step('board', () => { const D = window.__dbg, p = D.state.player; D.tryInteract(); for (let i = 0; i < 6; i++) { D.update(1/30); D.render(1/30); } return { x: +p.x.toFixed(0), z: +p.z.toFixed(0), place: document.getElementById('hudPlace').textContent, hint: D.villageHint(p) }; });
  await step('takeoff after 7s', () => { const D = window.__dbg, p = D.state.player; for (let i = 0; i < 7*30; i++) { D.update(1/30); D.render(1/30); } return { hud: [...document.querySelectorAll('#canvasHolder div')].map(d => d.textContent).filter(t => t.includes('비행')).slice(0, 2) }; });
  await step('walk in cabin', () => { const D = window.__dbg, s = D.state, p = s.player; s.keys = { up:true }; for (let i = 0; i < 90; i++) { D.update(1/30); D.render(1/30); } s.keys = {}; return { x: +p.x.toFixed(0), z: +p.z.toFixed(0) }; });
  await step('wall block left', () => { const D = window.__dbg, s = D.state, p = s.player; s.keys = { left:true }; for (let i = 0; i < 120; i++) { D.update(1/30); D.render(1/30); } s.keys = {}; return { x: +p.x.toFixed(0), z: +p.z.toFixed(0) }; });
  await step('J menu', () => { window.dispatchEvent(new KeyboardEvent('keydown', { key:'j' })); const btns = [...document.querySelectorAll('#canvasHolder button')].map(b => b.textContent); return { buttons: btns.length, first: btns.slice(0, 3) }; });
  await page.screenshot({ path: SP + '/w/af_menu.png' });
  await step('choose 호국의 다리', () => { const b = [...document.querySelectorAll('#canvasHolder button')].find(b => b.textContent.includes('호국의 다리')); b.click(); const D = window.__dbg, p = D.state.player; for (let i = 0; i < 20; i++) { D.update(1/30); D.render(1/30); } return { x: +p.x.toFixed(0), z: +p.z.toFixed(0), y: +p.y.toFixed(1), gh: D.groundHeightAt(p.x, p.z), place: document.getElementById('hudPlace').textContent }; });
  await page.screenshot({ path: SP + '/w/af_landed.png' });
  console.log(out.join('\n')); console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
