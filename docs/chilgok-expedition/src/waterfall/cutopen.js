// 터미널 정면 이미지: 150,30 ~ 1386,950 로 자르고, 입구 아치 안쪽(홀이 보이는 곳)을 투명하게 뚫어요 (그 자리에 진짜 3D 홀이 보여요)
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => { const [inp, outp] = process.argv.slice(2); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const page = await b.newPage();
  const src = 'data:image/webp;base64,' + fs.readFileSync(inp).toString('base64');
  const out = await page.evaluate(async (src) => { const im = new Image(); im.src = src; await im.decode(); const X0 = 150, Y0 = 30, W = 1236, H = 920; const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, X0, Y0, W, H, 0, 0, W, H);
    const poly = [[588, 905], [588, 660], [622, 626], [678, 603], [770, 594], [862, 603], [918, 626], [952, 660], [952, 905]].map(p => [p[0] - X0, p[1] - Y0]);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); poly.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fillStyle = '#000'; g.fill();
    return c.toDataURL('image/webp', 0.9); }, src);
  fs.writeFileSync(outp, out.split(',')[1], 'base64'); console.log(out.length); await b.close(); })();
