const fs = require('fs');
const SP = process.argv[2];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const rd = f => PNG.sync.read(fs.readFileSync(f));
const sky = rd(SP + '/assets/sky_clean.png'), fall = rd(SP + '/assets/fall_atlas.png'), ff = rd(SP + '/assets/fireflies_cut.png');
// canvas: sky on the left (scaled 0.6), then waterfall & fireflies over a sky-blue background
const W = 1300, H = 520; const out = new PNG({ width: W, height: H }); out.data.fill(255);
function blit(src, ox, oy, scale, bgfn) {
  const w = Math.round(src.width*scale), h = Math.round(src.height*scale);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const sx = Math.min(src.width-1, Math.floor(x/scale)), sy = Math.min(src.height-1, Math.floor(y/scale));
    const i = (sy*src.width+sx)*4, a = src.data[i+3]/255, o = ((oy+y)*W + ox+x)*4;
    const b = bgfn ? bgfn(x, y, h) : [out.data[o], out.data[o+1], out.data[o+2]];
    for (let k = 0; k < 3; k++) out.data[o+k] = Math.round(src.data[i+k]*a + b[k]*(1-a)); out.data[o+3] = 255;
  }
}
blit(sky, 0, 0, 0.62, null);
const blue = (x, y, h) => [60 + 60*y/h, 90 + 90*y/h, 200 + 30*y/h];
blit(fall, 640, 0, 1.0, blue);
blit(ff, 640 + 350 - 0, 0, 0, null);
const dark = () => [14, 12, 30];
// fireflies over a dark sky strip to the right
blit(ff, 1000, 0, 0.7, (x, y, h) => [25 + 30*y/h, 30 + 40*y/h, 90]);
fs.writeFileSync(SP + '/asset_preview.png', PNG.sync.write(out));
console.log('ok');
