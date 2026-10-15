const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000/ludapia', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const startBtn = await page.$('#introStartBtn');
  if (startBtn) await startBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/tmp/claude-0/-home-user-iruda-app/9a4c4921-0f65-5c2b-a072-f5e1d0ed7816/scratchpad/ludapia-after.png' });
  await browser.close();
})();
