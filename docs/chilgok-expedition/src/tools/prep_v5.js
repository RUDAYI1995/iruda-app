const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const V = SP + '/assets/village/', N = SP + '/assets/new5/';
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function norm(im) { const bg = im.data[(6*im.width + 6)*4]; for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
function cut(n, p) { const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
const s = [0,1,2,3,4].map(i => norm(rd(N + 'n' + i + '.png')));
const H = [
 [0,'gl_front',50,68,348,165],[0,'gl_side',408,70,495,158],[0,'gl_back',578,72,782,157],
 [0,'gb_front',50,228,350,335],[0,'gb_side',386,238,518,330],[0,'gb_back',578,244,780,328],
 [0,'gs_front',88,415,230,505],[0,'gs_side',352,420,466,505],[0,'gs_back',590,420,722,505],
 [1,'ts_front',97,58,277,160],[1,'ts_side',409,58,515,160],[1,'ts_back',780,58,960,160],
 [1,'tb_front',63,288,494,458],[1,'tb_side',560,310,700,452],[1,'tb_back',756,332,980,452],
 [2,'hr_front',74,62,360,210],[2,'hr_side',476,62,672,200],[2,'hr_back',736,62,990,200],
 [2,'yo_front',62,322,376,450],[2,'yo_side',503,334,694,448],[2,'yo_back',762,334,975,444]
];
H.forEach(([i, n, a, b, c, d]) => cut('h_' + n, crop(s[i], a, b, c, d)));
const P = [[3,'f_shop',84,54,292,236],[3,'f_gazebo',404,70,646,230],[3,'f_well',770,84,930,226],[3,'f_jaryard',80,334,474,500],
 [4,'f_pump',50,68,370,230],[4,'f_scarecrow',454,36,590,236],[4,'f_straw',692,60,978,238],[4,'f_fsign',160,328,256,498]];
P.forEach(([i, n, a, b, c, d]) => cut(n, crop(s[i], a, b, c, d)));
console.log('ok');
