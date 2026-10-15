const fs = require('fs');
const { PNG } = require(process.argv[2] + '/imgdiff/node_modules/pngjs');
const f = process.argv[3];
const im = PNG.sync.read(fs.readFileSync(f)), W = im.width, H = im.height, d = im.data;
console.log('size', W + 'x' + H, '| has alpha < 255:', (() => { let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] < 255) n++; return n; })());
const px = (x, y) => { const i = (y*W + x)*4; return [d[i], d[i+1], d[i+2]]; };
console.log('corners', JSON.stringify([px(2,2), px(W-3,2), px(2,H-3), px(W-3,H-3)]));
// background stats on a border ring (20px): how white and how noisy
let sum = [0,0,0], n = 0, minV = 255, nonWhite = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (x > 20 && x < W-21 && y > 20 && y < H-21) continue;
  const c = px(x, y); n++; for (let k = 0; k < 3; k++) sum[k] += c[k];
  const m = Math.min(c[0], c[1], c[2]); if (m < minV) minV = m; if (m < 245) nonWhite++;
}
console.log('border ring mean RGB', sum.map(s => (s/n).toFixed(1)).join(','), '| darkest border pixel min-channel', minV, '| ring pixels below 245:', nonWhite, 'of', n);
// how much of the image is "not near-white" (rough foreground size)
let fg = 0, minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = px(x,y); if (Math.min(c[0],c[1],c[2]) < 225) { fg++; if (x<minX) minX=x; if (x>maxX) maxX=x; if (y<minY) minY=y; if (y>maxY) maxY=y; } }
console.log('foreground-ish px', fg, 'bbox', [minX, minY, maxX, maxY].join(','));
