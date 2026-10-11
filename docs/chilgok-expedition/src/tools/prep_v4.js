const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const A = SP + '/assets/', V = A + 'village/';
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function save(n, p) { fs.writeFileSync(V + n + '.png', PNG.sync.write(p)); }
function norm(im) { const bg = im.data[(6*im.width + 6)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
function cut(n, p) { const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
// far terraced valley: keep y 150..404, fade the pale sky into transparency (alpha from "greenness"/darkness vs sky)
const t = rd(A + 'in_74.png'), tc = crop(t, 0, 140, 1024, 405);
for (let y = 0; y < tc.height; y++) for (let x = 0; x < tc.width; x++) {
  const i = (y*tc.width + x)*4, r = tc.data[i], g = tc.data[i+1], b = tc.data[i+2], lum = (r + g + b)/3, sat = Math.max(r, g, b) - Math.min(r, g, b);
  const dark = Math.max(0, Math.min(1, (232 - lum)/26)), col = Math.max(0, Math.min(1, (sat - 6)/16));
  let a = Math.max(dark, col); if (y > tc.height - 6) a = a*Math.max(0, (tc.height - y)/6);
  tc.data[i+3] = Math.round(a*255);
}
save('far_terrace', tc);
save('day_sky', crop(rd(A + 'in_75.png'), 0, 0, 1024, 396));
const g = norm(rd(A + 'in_76.png'));
cut('gate_front', crop(g, 74, 98, 312, 424)); cut('gate_open', crop(g, 342, 98, 600, 424)); cut('gate_side', crop(g, 630, 90, 772, 424));
console.log('ok');
