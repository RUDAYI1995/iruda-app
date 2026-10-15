const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const A = SP + '/assets/';
function load(f) { return PNG.sync.read(fs.readFileSync(A + 'trees_raw/' + f)); }
function norm(im) { const bg = im.data[(5*im.width + 5)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg));
  for (let y = im.height - 100; y < im.height; y++) for (let x = im.width - 120; x < im.width; x++) { const o = (y*im.width + x)*4; im.data[o] = im.data[o+1] = im.data[o+2] = 255; } return im; }
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function cut(name, png) { const f = A + 'prep_' + name + '.png'; fs.writeFileSync(f, PNG.sync.write(png)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${A}${name}.png`, { stdio: 'inherit' }); }
const t3 = norm(load('t3.png')), t4 = norm(load('t4.png'));
const trees = [
  ['tree0', t3, 430, 65, 620, 270], ['tree1', t3, 630, 70, 810, 270], ['tree2', t3, 820, 65, 1005, 275], ['tree3', t3, 525, 270, 700, 505], ['tree4', t3, 720, 272, 905, 500],
  ['tree5', t4, 25, 10, 410, 400], ['tree6', t4, 435, 20, 875, 320], ['tree7', t4, 350, 245, 615, 525], ['tree8', t4, 745, 210, 995, 535],
  ['bush0', t3, 75, 395, 175, 485], ['bush1', t3, 185, 380, 285, 470], ['bush2', t3, 300, 390, 375, 465]
];
function wipe(png, ox, oy, rects) { for (const [x0, y0, x1, y1] of rects) for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const px = x - ox, py = y - oy; if (px < 0 || py < 0 || px >= png.width || py >= png.height) continue; const i = (py*png.width + px)*4; png.data[i] = png.data[i+1] = png.data[i+2] = 255; } return png; }
trees.forEach(([n, im, a, b, c, d]) => {
  let p = crop(im, a, b, c, d);
  if (n === 'tree5') p = wipe(p, a, b, [[355, 250, 420, 410]]);
  if (n === 'tree6') p = wipe(p, a, b, [[440, 250, 612, 330], [760, 205, 880, 330]]);
  if (n === 'tree7') p = wipe(p, a, b, [[350, 240, 420, 530]].filter(() => false));
  cut(n, p); });
// shadows: dark blobs on near-white -> black with alpha from darkness
const raw = load('t3.png'), bg = raw.data[(5*raw.width + 5)*4];
[['shadow0', 35, 140, 210, 225], ['shadow1', 220, 135, 395, 220]].forEach(([n, a, b, c, d]) => {
  const im = crop(raw, a, b, c, d), o = new PNG({ width: im.width, height: im.height });
  for (let i = 0; i < im.width*im.height; i++) { const l = (im.data[i*4] + im.data[i*4+1] + im.data[i*4+2])/3, al = Math.max(0, Math.min(1, (bg - 6 - l)/(bg - 70)));
    o.data[i*4] = o.data[i*4+1] = o.data[i*4+2] = 20; o.data[i*4+3] = Math.round(al*255); }
  fs.writeFileSync(A + n + '.png', PNG.sync.write(o)); console.log(n, o.width, o.height);
});
