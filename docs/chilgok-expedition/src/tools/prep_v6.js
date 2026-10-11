const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const V = SP + '/assets/village/', N = SP + '/assets/new6/';
const rd = f => PNG.sync.read(fs.readFileSync(f));
function crop(im, x0, y0, x1, y1) { const w = x1 - x0, h = y1 - y0, o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function norm(im) { let s = [0,0,0], n = 0; for (let y = 2; y < 10; y++) for (let x = 2; x < 10; x++) { const i = (y*im.width + x)*4; for (let c = 0; c < 3; c++) s[c] += im.data[i+c]; n++; } const bg = Math.max(200, Math.round(Math.max(...s)/n)); for (let i = 0; i < im.width*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c]*255/bg)); return im; }
function up(im, k) { const o = new PNG({ width: im.width*k, height: im.height*k }); for (let y = 0; y < o.height; y++) for (let x = 0; x < o.width; x++) { const fx = (x + 0.5)/k - 0.5, fy = (y + 0.5)/k - 0.5, x0 = Math.max(0, Math.min(im.width - 2, Math.floor(fx))), y0 = Math.max(0, Math.min(im.height - 2, Math.floor(fy))), tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0)); for (let c = 0; c < 4; c++) { const g = (xx, yy) => im.data[(yy*im.width + xx)*4 + c]; o.data[(y*o.width + x)*4 + c] = g(x0,y0)*(1-tx)*(1-ty) + g(x0+1,y0)*tx*(1-ty) + g(x0,y0+1)*(1-tx)*ty + g(x0+1,y0+1)*tx*ty; } } return o; }
function sharpen(im, amt) { const w = im.width, h = im.height, o = Buffer.from(im.data), d = im.data; for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) for (let c = 0; c < 3; c++) { const i = (y*w + x)*4 + c; const bl = (o[i - 4] + o[i + 4] + o[i - w*4] + o[i + w*4] + o[i]*4)/8; d[i] = Math.max(0, Math.min(255, o[i] + (o[i] - bl)*amt)); } return im; }
function cut(n, p) { p = sharpen(up(p, 2), 0.7); const f = V + 'prep_' + n + '.png'; fs.writeFileSync(f, PNG.sync.write(p)); cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${V}${n}.png`, { stdio: 'ignore' }); }
const s = ['83', '84', '85'].map(n => norm(rd(N + n + '.png')));
const H = [
 [0,'m_front',18,31,350,104],[0,'m_side',30,123,337,194],[0,'m_back',18,216,348,292],
 [0,'b_front',388,31,510,99],[0,'b_side',390,118,501,189],[0,'b_back',387,216,510,286],
 [0,'t1',555,43,616,80],[0,'t2',553,108,611,150],[0,'tl_s',557,171,616,222],
 [0,'sl_blue',623,33,725,94],[0,'t_med',628,107,723,150],[0,'tl_m_side',625,171,727,230],[0,'tl_m_back',625,245,727,304],
 [0,'w_thatch',815,38,898,97],[0,'w_blue',816,111,894,158],[0,'wA_front',920,36,999,89],[0,'wA_back',924,110,999,161],
 [0,'wB_front',816,180,896,232],[0,'wB_back',816,245,893,299],[0,'wB_side',931,243,988,299],
 [1,'q_dish',59,116,151,207],[1,'q_pole',150,31,335,458],[1,'q_bike',311,98,476,232],[1,'q_jars',494,90,657,222],
 [1,'q_line',669,72,808,225],[1,'q_table',817,100,982,227],[1,'q_tiller',48,320,192,468],[1,'q_tunnel',282,300,453,458],
 [1,'q_furrow',461,323,673,442],[1,'q_pepper',704,298,811,383],[1,'q_onion',863,274,954,378],[1,'q_cabbage',676,418,801,506],[1,'q_lettuce',820,413,970,504],
 [2,'wl_cement',42,323,322,496],[2,'wl_tile',364,313,655,494],[2,'wl_tin',702,305,977,496]
];
function defringe(file) { const im = PNG.sync.read(fs.readFileSync(file)), w = im.width, h = im.height, a0 = Uint8Array.from({ length: w*h }, (_, i) => im.data[i*4 + 3]); const R = 2; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y*w + x; if (a0[i] === 0) continue; let near = 0; for (let dy = -R; dy <= R && !near; dy++) for (let dx = -R; dx <= R; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h || a0[yy*w + xx] < 40) { near = 1; break; } } if (near) { im.data[i*4] = im.data[i*4]*0.62; im.data[i*4 + 1] = im.data[i*4 + 1]*0.7; im.data[i*4 + 2] = im.data[i*4 + 2]*0.55; } } fs.writeFileSync(file, PNG.sync.write(im)); }
H.forEach(([i, n, a, b, c, d]) => { const cr = crop(s[i], a, b, c, d); if(n === 'q_pole'){ for(let y = 0; y < cr.height; y++) for(let x = 0; x < cr.width; x++){ if(y + b > 285 && (x < 78 || x > 108)){ const k = (y*cr.width + x)*4; cr.data[k] = cr.data[k+1] = cr.data[k+2] = 255; } } } cut(n, cr); if(/^q_(cabbage|lettuce|pepper|onion)$/.test(n)) defringe(V + n + '.png'); });
// seamless-ish square tiles (inset to drop the border)
const T = [['t_dirt',32,67,199,226],['t_gravel2',230,67,397,226],['t_stone',428,67,596,226],['t_yard',627,67,794,226],['t_weedy',825,67,992,226]];
T.forEach(([n, a, b, c, d]) => { fs.writeFileSync(V + n + '.png', PNG.sync.write(up(crop(s[2], a, b, c, d), 2))); });
[['t_tin',748,362,840,450],['t_cement',108,385,240,452]].forEach(([n,a,b,c,d])=>{ fs.writeFileSync(V + n + '.png', PNG.sync.write(up(crop(s[2], a, b, c, d), 3))); });
console.log('ok');
