const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const A = SP + '/assets/', V = A + 'village/';
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function save(n, p) { fs.writeFileSync(V + n + '.png', PNG.sync.write(p)); }
function norm(im) { const bg = im.data[(6*im.width + 6)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
function cut(n, p) { const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
const f69 = norm(rd(A + 'in_69.png')), f70 = norm(rd(A + 'in_70.png')), f71 = norm(rd(A + 'in_71.png')), f72 = norm(rd(A + 'in_72.png')), f73 = norm(rd(A + 'in_73.png'));
save('a_road', crop(f69, 190, 168, 860, 418));
save('a_wall', crop(f70, 846, 374, 966, 492));
save('a_roofcap', crop(f70, 70, 386, 240, 408));
// houses from the new mapping sheet (override the earlier ones)
[['h_g_front', 52, 54, 244, 154], ['h_g_side', 260, 54, 354, 154], ['h_g_back', 370, 54, 528, 154], ['h_t_front', 50, 226, 244, 324], ['h_t_side', 262, 226, 360, 324], ['h_t_back', 378, 226, 544, 324], ['h_s_front', 48, 400, 248, 502], ['h_s_side', 262, 400, 366, 502], ['h_s_back', 376, 400, 544, 502]]
  .forEach(([n, a, b, c, d]) => cut(n, crop(f71, a, b, c, d)));
save('r_gaw', crop(f71, 572, 78, 690, 148)); save('r_thatch', crop(f71, 572, 232, 690, 310)); save('r_slate', crop(f71, 574, 408, 826, 496));
// yard props
[['y_pumpkin', 40, 116, 350, 220], ['y_sunflower', 364, 46, 508, 238], ['y_wild', 546, 78, 718, 218], ['y_veg', 740, 96, 980, 234], ['y_jars', 70, 320, 294, 448], ['y_firewood', 392, 342, 614, 468], ['y_bicycle', 708, 324, 940, 474],
 ['y_treefront', 34, 82, 458, 466], ['y_treeside', 476, 78, 774, 460], ['y_leaf', 804, 222, 968, 340]].forEach(([n, a, b, c, d]) => cut(n, crop(f72.width === f73.width && n.startsWith('y_tree') || n === 'y_leaf' ? f73 : f72, a, b, c, d)));
save('a_bark', crop(f73, 796, 56, 970, 176));
console.log('ok');
