const { chromium } = require('playwright-core'); const fs=require('fs');
const SP=process.argv[2], I=process.argv[3];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const p=await b.newPage();
for(const n of ['69.webp','71.webp','73.webp']){const buf=fs.readFileSync(I+'/'+n).toString('base64');
const d=await p.evaluate(async([b64])=>{const im=new Image();im.src='data:image/webp;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c.toDataURL('image/png').split(',')[1]},[buf]);
fs.writeFileSync(SP+'/assets/in_'+n.split('.')[0]+'.png',Buffer.from(d,'base64'));console.log(n,'ok')}
await b.close()})();
