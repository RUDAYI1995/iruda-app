const fs = require('fs'), path = require('path');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const pixelmatch = require(SP + '/imgdiff/node_modules/pixelmatch');
const files = fs.readdirSync(SP).filter(f => /^rg_old_.*\.png$/.test(f)).sort();
let n = 0, same = 0;
for (const f of files) {
  const key = f.replace(/^rg_old_/, '').replace(/\.png$/, '');
  const h = path.join(SP, 'rg_hid_' + key + '.png');
  if (!fs.existsSync(h)) continue;
  const A = PNG.sync.read(fs.readFileSync(path.join(SP, f))), B = PNG.sync.read(fs.readFileSync(h));
  const d = pixelmatch(A.data, B.data, null, A.width, A.height, { threshold: 0.05 });
  n++; if (d === 0) same++;
  console.log(key.replace('_', ',').padEnd(14), String(d).padStart(7), 'px different');
}
console.log(`compared ${n} viewpoints: ${same} pixel-identical`);
