const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const A = SP + '/assets/', V = A + 'village/';
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function save(n, p) { fs.writeFileSync(V + n + '.png', PNG.sync.write(p)); }
function norm(im) { const bg = im.data[(6*im.width + 6)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
function cut(n, p) { const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
const a = norm(rd(A + 'in_63.png')), b = norm(rd(A + 'in_64.png')), c = norm(rd(A + 'in_65.png'));
// sheet 63: stone / stream
save('t_wall', crop(a, 842, 26, 976, 160)); save('t_wall2', crop(a, 66, 392, 198, 524));
save('t_gravel', crop(a, 333, 392, 460, 524)); save('t_water', crop(a, 586, 392, 716, 524)); save('t_bank', crop(a, 842, 392, 972, 524));
cut('s_bridge_wood', crop(a, 832, 190, 982, 346)); cut('s_bridge_stone', crop(a, 624, 190, 780, 346));
// sheet 64: houses (cut-outs) + roof tiles
const H = [
  ['g_front', 20, 30, 182, 116], ['g_side', 212, 30, 320, 116], ['g_back', 332, 30, 496, 116], ['g_top', 528, 30, 688, 122],
  ['t_front', 16, 308, 170, 392], ['t_side', 212, 308, 320, 392], ['t_back', 330, 308, 494, 392], ['t_top', 524, 308, 690, 392],
  ['s_front', 16, 430, 200, 520], ['s_side', 210, 430, 322, 520], ['s_back', 332, 430, 510, 520]
];
H.forEach(([n, x0, y0, x1, y1]) => cut('h_' + n, crop(b, x0, y0, x1, y1)));
save('r_gaw', crop(b, 706, 32, 846, 120)); save('r_thatch', crop(b, 526, 152, 680, 240)); save('r_thatch2', crop(b, 703, 312, 846, 398)); save('r_slate', crop(b, 530, 432, 686, 530)); save('r_slate_tin', crop(b, 868, 312, 1004, 398));
// sheet 65: props
const P = [
  ['p_wallrun', 24, 28, 236, 100], ['p_wallcorner', 268, 30, 384, 100], ['p_toldam', 396, 26, 588, 98], ['p_fence', 616, 32, 762, 100], ['p_ridge', 816, 30, 996, 112],
  ['p_jangdok', 68, 128, 290, 228], ['p_firewood', 340, 150, 482, 230], ['p_laundry', 512, 148, 752, 214], ['p_pyeongsang', 786, 132, 968, 252],
  ['p_bush0', 74, 280, 180, 374], ['p_bush1', 194, 290, 302, 374], ['p_bush2', 306, 300, 390, 372], ['p_cosmos', 452, 276, 526, 376], ['p_sunflower', 578, 272, 644, 376],
  ['p_wild0', 718, 316, 782, 376], ['p_wild1', 784, 316, 842, 376], ['p_wild2', 842, 316, 900, 376], ['p_wild3', 872, 296, 934, 376], ['p_wild4', 924, 300, 984, 376],
  ['p_sign', 176, 416, 250, 532], ['p_stone', 380, 424, 446, 524], ['p_mailbox', 564, 418, 630, 526], ['p_bus', 744, 396, 940, 536]
];
P.forEach(([n, x0, y0, x1, y1]) => cut(n, crop(c, x0, y0, x1, y1)));
console.log('ok');
