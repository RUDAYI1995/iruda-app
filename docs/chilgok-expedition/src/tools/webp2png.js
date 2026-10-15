const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
 const d = await p.evaluate(async (b64) => { const i = new Image(); i.src = 'data:image/webp;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext('2d').drawImage(i, 0, 0); return [c.width, c.height, c.toDataURL('image/png').split(',')[1]]; }, fs.readFileSync(process.argv[2]).toString('base64'));
 fs.writeFileSync(process.argv[3], Buffer.from(d[2], 'base64')); console.log(d[0], d[1]); await b.close(); })();
