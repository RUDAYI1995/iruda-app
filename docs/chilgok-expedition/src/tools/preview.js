const fs = require('fs');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const im = PNG.sync.read(fs.readFileSync(SP + '/assets/island1.png'));
const W = im.width, H = im.height;
function comp(bgfn) { const o = new PNG({ width: W, height: H }); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y*W+x)*4, a = im.data[i+3]/255, b = bgfn(x, y); for (let k = 0; k < 3; k++) o.data[i+k] = Math.round(im.data[i+k]*a + b[k]*(1-a)); o.data[i+3] = 255; } return o; }
const sky = comp((x, y) => { const t = y/H; return [Math.round(70+120*t), Math.round(110+110*t), Math.round(230+10*t)]; });
const checker = comp((x, y) => (((x>>4)+(y>>4))&1) ? [200,200,200] : [250,250,250]);
// side by side
const both = new PNG({ width: W*2 + 10, height: H });
both.data.fill(255);
PNG.bitblt(sky, both, 0, 0, W, H, 0, 0); PNG.bitblt(checker, both, 0, 0, W, H, W+10, 0);
fs.writeFileSync(SP + '/preview_island1.png', PNG.sync.write(both));
console.log('preview', both.width + 'x' + both.height);
