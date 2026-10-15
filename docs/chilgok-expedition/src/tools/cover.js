const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(3500);
  const r = await page.evaluate(() => {
    const D = window.__dbg, sc = D.three.scene, T = D.three.camera.position.constructor;
    const rc = new (Object.getPrototypeOf(D.three.camera).constructor === Object ? function(){} : function(){})();
    return null; });
  // ground coverage via 2D rectangles of big horizontal planes
  const cov = await page.evaluate(() => {
    const D = window.__dbg, sc = D.three.scene, out = [];
    sc.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && Math.abs(o.rotation.x + Math.PI/2) < 1e-3 && o.geometry.parameters.width > 500) { o.updateWorldMatrix(true, false); const p = o.getWorldPosition(new o.position.constructor()); out.push([Math.round(p.x - o.geometry.parameters.width/2), Math.round(p.x + o.geometry.parameters.width/2), Math.round(p.z - o.geometry.parameters.height/2), Math.round(p.z + o.geometry.parameters.height/2), Math.round(p.y*10)/10, o.name || '']); } });
    return out; });
  console.log(JSON.stringify(cov));
  await browser.close();
})();
