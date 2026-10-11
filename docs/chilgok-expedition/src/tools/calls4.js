const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const r = await page.evaluate(() => { const D = window.__dbg, T = D.three, out = {}; const sceneKids = T.scene.children.map(c => c.name + ':' + c.type + ':' + c.children.length); 
    const byTop = {}; T.scene.traverse(o => { if (!o.isMesh) return; let q = o; while (q.parent && q.parent !== T.scene) q = q.parent; const k = (q.name || q.type) + ':' + o.geometry.type; byTop[k] = (byTop[k] || 0) + 1; });
    return { sceneKids, byTop }; });
  console.log(JSON.stringify(r.sceneKids)); const e = Object.entries(r.byTop).sort((a, b) => b[1] - a[1]).slice(0, 14); console.log(JSON.stringify(e));
  await browser.close();
})();
