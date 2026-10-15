const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2], I = process.argv[3];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const A = SP + '/assets/', V = A + 'village/'; fs.mkdirSync(V, { recursive: true });
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function save(n, p) { fs.writeFileSync(V + n + '.png', PNG.sync.write(p)); }
function cut(n, p) { const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
const f50 = rd(A + 'in_50.png'), f51 = rd(I + '/51.png'), f52 = rd(I + '/52.png'), f53 = rd(I + '/53.png'), f54 = rd(I + '/54.png');
// field tiles
save('field0', crop(f50, 40, 142, 318, 412)); save('field1', crop(f50, 374, 142, 652, 412)); save('field2', crop(f50, 710, 142, 988, 412));
// roads
save('road', crop(f51, 110, 165, 420, 385)); save('roadfield', crop(f51, 592, 140, 950, 415));
// walls & roofs
save('wall_clay', crop(f52, 112, 88, 286, 250)); save('wall_plaster', crop(f52, 388, 88, 560, 250)); save('wall_wood', crop(f52, 668, 90, 912, 248));
save('roof_gaw', crop(f52, 118, 345, 292, 410)); save('roof_thatch', crop(f52, 395, 345, 630, 415)); save('roof_slate', crop(f52, 700, 340, 935, 425));
// greenhouse ridge tile
save('ridge', crop(f53, 380, 322, 645, 458));
// props (white background cut-outs)
function norm(im) { const bg = im.data[(6*im.width + 6)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
norm(f54);
const props = [['gate', 64, 60, 350, 215], ['pyeongsang', 392, 88, 648, 230], ['tiller', 690, 62, 960, 222], ['sheaf', 112, 305, 312, 428], ['pole', 548, 262, 650, 492], ['pavilion', 712, 278, 950, 442]];
props.forEach(([n, a, b, c, d]) => cut(n, crop(f54, a, b, c, d)));

// ---- second batch: village hall / mill, pond, elders, previously received orchard + wall + brook pieces ----
const f48 = rd(A + 'in_48.png'), f55 = rd(I + '/55.png'), f56 = rd(I + '/56.png'), f57 = rd(I + '/57.png');
save('hall_front', crop(f55, 70, 64, 352, 208)); save('hall_side', crop(f55, 404, 80, 654, 204)); save('hall_back', crop(f55, 710, 80, 960, 204));
save('mill_front', crop(f55, 80, 332, 344, 464)); save('mill_side', crop(f55, 414, 338, 648, 462)); save('mill_back', crop(f55, 718, 338, 948, 462));
save('water', crop(f56, 118, 160, 190, 205));
norm(f56); norm(f57); norm(f48);
cut('lily', crop(f56, 782, 358, 902, 424));
cut('elder0', crop(f57, 180, 40, 430, 515)); cut('elder1', crop(f57, 596, 70, 790, 510));
cut('persimmon', crop(f48, 636, 182, 802, 350)); cut('apple', crop(f48, 826, 184, 982, 350));
cut('wall0', crop(f48, 52, 355, 288, 505)); cut('wall1', crop(f48, 636, 372, 822, 506)); cut('wall2', crop(f48, 850, 384, 978, 506));
cut('brook', crop(f48, 316, 358, 610, 492));

// ---- day/night sky pieces from the sky sheet (49.png) ----
const f49 = rd(I + '/49.png');
save('sky_dusk', crop(f49, 98, 65, 278, 245)); save('sky_night', crop(f49, 440, 125, 600, 245)); save('sky_dawn', crop(f49, 98, 333, 278, 513));
const f49n = rd(I + '/49.png'); norm(f49n);
cut('sun', crop(f49n, 738, 52, 832, 148)); cut('moon', crop(f49n, 878, 66, 948, 142));
console.log('done');
