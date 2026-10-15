const { chromium } = require('playwright-core');
const SP = process.argv[2], target = process.argv[3];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const msgs = [];
  page.on('pageerror', e => msgs.push('PAGEERR ' + String(e.stack||e).slice(0,500)));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(m.type() + ' ' + m.text().slice(0,300)); });
  page.on('requestfailed', r => msgs.push('REQFAIL ' + r.url().slice(-60)));
  await page.goto('file://' + SP + '/' + target); await page.waitForTimeout(2500);
  const steps = [];
  for (const sel of ['#btnStart', '#btnToWorld']) { try { await page.click(sel, { timeout: 4000 }); steps.push(sel + ' ok'); } catch (e) { steps.push(sel + ' FAIL'); } await page.waitForTimeout(800); }
  try { await page.click('#worldNodes .node-btn >> nth=0', { timeout: 4000 }); steps.push('node ok'); } catch (e) { steps.push('node FAIL'); }
  await page.waitForTimeout(6000);
  console.log(steps.join(' | ')); console.log(msgs.slice(0, 12).join('\n') || 'no errors');
  await page.screenshot({ path: SP + '/realrun.png' });
  await browser.close();
})();
