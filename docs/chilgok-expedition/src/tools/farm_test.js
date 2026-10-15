const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.stack||e).slice(0,300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(2500);
  const r = await page.evaluate(() => {
    const D = window.__dbg, s = D.state, p = s.player, F = D.VIL_FARM, out = [];
    const log = m => out.push(m + ' | ' + (document.getElementById('toast') ? document.getElementById('toast').textContent : ''));
    F.fields.forEach(f => { f.stage = 0; f.at = 0; f.wet = false; f.weedAt = 0; }); F.rice = 0; F.bags = 0; F.melon = 0; F.straw = 0; F.stamped = 0;
    p.x = -1170; p.z = 135; D.setRef(0);
    out.push('hint dry: ' + D.villageHint(p)); D.villageInteract(p); out.push('after water wet=' + F.fields[0].wet + ' hint=' + D.villageHint(p));
    D.villageInteract(p); out.push('after plant stage=' + F.fields[0].stage + ' hint=' + D.villageHint(p));
    F.fields[0].weedAt = Date.now() - 10; out.push('weed hint=' + D.villageHint(p)); D.villageInteract(p); out.push('after pull weedAt=' + F.fields[0].weedAt + ' hint=' + D.villageHint(p));
    F.fields[0].at = Date.now() - 3*18000 - 10; out.push('ripe hint=' + D.villageHint(p)); D.villageInteract(p); out.push('harvest rice=' + F.rice + ' stage=' + F.fields[0].stage);
    F.rice = 3; p.x = -1340; p.z = 230; D.villageInteract(p); out.push('milled bags=' + F.bags + ' stamped=' + F.stamped + ' stampsHas=' + s.stamps.has('rice'));
    // greenhouse
    p.x = -820; p.z = 455; out.push('gh hint=' + D.villageHint(p)); D.villageInteract(p); out.push('inside at ' + Math.round(p.x) + ',' + Math.round(p.z));
    const c = D.VIL_GH_CROPS[0]; p.x = c.x; p.z = c.z; out.push('crop hint=' + D.villageHint(p)); D.villageInteract(p); out.push('melon=' + F.melon);
    p.x = -2600 + 75; p.z = 1500; out.push('exit hint=' + D.villageHint(p)); D.villageInteract(p); out.push('outside at ' + Math.round(p.x) + ',' + Math.round(p.z));
    out.push('walk inside ok=' + (D.villageWalk(-2650, 1500) && !D.villageWalk(-2700, 1500)));
    return out; });
  console.log(r.join('\n')); console.log(errs.length ? 'ERR ' + errs.join('|') : 'no page errors'); await browser.close();
})();
