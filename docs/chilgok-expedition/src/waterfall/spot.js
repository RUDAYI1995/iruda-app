const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 520 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(1500);
  console.log(await page.evaluate(() => { const D = window.__dbg, rows = []; const rects = D.LAND_RECTS.concat(D.TOWN_RECTS, window.ROCK_RECTS || []);
    const lm = D.LANDMARKS.map(l => l.theme + '@' + l.z).join(', ');
    function free(cx, cz, hx, hz){ for (const h of D.HILLS){ const dx = (Math.max(Math.abs(cx - h.cx) - hx, 0))/(h.ax + 20), dz = (Math.max(Math.abs(cz - h.cz) - hz, 0))/(h.az + 20); if (dx*dx + dz*dz < 1) return false; }
      for (const r of rects){ if (Math.abs(cx - r.x) < r.hx + hx + 20 && Math.abs(cz - r.z) < r.hz + hz + 20) return false; } if (cz - hz < 548 && cz + hz > 832) return false; if (cz + hz > 540 && cz - hz < 840) return false; return true; }
    for (let z = 250; z <= 1230; z += 30) for (let x = 80; x <= 560; x += 20) if (free(x, z, 95, 85)) rows.push(x + ',' + z);
    return 'landmarks: ' + lm + '\nfree centers (hx95,hz85): ' + rows.join(' | '); }));
  await browser.close(); })();
