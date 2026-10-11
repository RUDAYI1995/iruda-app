// Normalise the white-ish backgrounds of the new AI pictures to pure white, blank the corner logo, and cut out single objects.
const fs = require('fs'), cp = require('child_process');
const SP = process.argv[2], I = process.argv[3];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
function load(n) { return PNG.sync.read(fs.readFileSync(I + '/' + n + '.png')); }
function normalise(im) {
  const w = im.width, bg = im.data[(5*w + 5)*4];                    // corner pixel = background level
  for (let i = 0; i < w*im.height; i++) for (let c = 0; c < 3; c++) im.data[i*4+c] = Math.min(255, Math.round(im.data[i*4+c] * 255 / bg));
  for (let y = im.height - 110; y < im.height; y++) for (let x = w - 150; x < w; x++) { const o = (y*w + x)*4; im.data[o] = im.data[o+1] = im.data[o+2] = 255; }   // logo star
  return im;
}
function crop(im, x0, y0, w, h) { const o = new PNG({ width: w, height: h }); PNG.bitblt(im, o, x0, y0, w, h, 0, 0); return o; }
function run(name, png) {
  const f = SP + '/assets/prep_' + name + '.png'; fs.writeFileSync(f, PNG.sync.write(png));
  cp.execSync(`node ${SP}/cutout.js ${SP} ${f} ${SP}/assets/${name}.png`, { stdio: 'inherit' });
}
run('obelisk', normalise(load(17)));
run('aqueduct', normalise(load(18)));
const g = normalise(load(19));
const cells = [[185,25,260,170],[385,25,260,170],[575,25,260,170],[190,195,260,170],[385,195,260,170],[575,195,260,170],[185,370,260,170],[385,370,260,170]];
cells.forEach((c, i) => run('isl_v' + (i+1), crop(g, c[0], c[1], c[2], c[3])));
