const fs = require('fs');
const SP = process.argv[2], D = process.argv[3];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
for (const [name, f] of [['waterfall','9.png'], ['fireflies','10.png'], ['sky','11.png']]) {
  const im = PNG.sync.read(fs.readFileSync(D + '/' + f)), W = im.width, H = im.height, d = im.data;
  const px = (x, y) => { const i = (y*W+x)*4; return [d[i], d[i+1], d[i+2], d[i+3]]; };
  console.log(name, W + 'x' + H, 'alpha', px(5,5)[3], 'corner', px(5,5).slice(0,3).join(','), 'center-bottom', px(W>>1, H-8).slice(0,3).join(','));
  if (name !== 'sky') {
    // bounding box of anything noticeably brighter than the dark background, away from the corner star
    let minX = W, maxX = 0, minY = H, maxY = 0, bgm = 0, nb = 0;
    for (let y = 0; y < 60; y++) for (let x = 0; x < 60; x++) { const c = px(x,y); bgm += Math.max(c[0],c[1],c[2]); nb++; }
    bgm /= nb;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (x > 870 && y > 610) continue; const c = px(x,y), m = Math.max(c[0],c[1],c[2]); if (m > bgm + 14) { if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; } }
    console.log('   bg level', bgm.toFixed(1), 'content bbox', minX, minY, maxX, maxY);
  } else {
    // horizon row (where the brightness stops changing quickly) + the star box
    const rows = [0.1,0.3,0.5,0.62,0.75,0.95].map(t => { const y = Math.round(t*H); return y + ':' + px(100,y).slice(0,3).join(',') + ' | ' + px(900,y).slice(0,3).join(','); });
    console.log('   rows (x=100 | x=900):', rows.join('  '));
  }
}
