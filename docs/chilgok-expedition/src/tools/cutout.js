// White-background cutout: flood-fill the background from the border, then recover soft edges
// with "difference from white" matting so no white halo is left around the object.
// usage: node cutout.js <scratchpad> <in.png> <out.png> [--wmark]
const fs = require('fs');
const SP = process.argv[2], inFile = process.argv[3], outFile = process.argv[4];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const im = PNG.sync.read(fs.readFileSync(inFile));
const W = im.width, H = im.height, src = im.data;
const N = W * H;
const dist = new Uint8Array(N);                       // how far each pixel is from pure white
for (let i = 0; i < N; i++) dist[i] = 255 - Math.min(src[i*4], src[i*4+1], src[i*4+2]);

// 1) background = near-white pixels connected to the image border
const BG_T = 14;
const bg = new Uint8Array(N), q = new Int32Array(N);
let qh = 0, qt = 0;
function push(i) { if (!bg[i] && dist[i] <= BG_T) { bg[i] = 1; q[qt++] = i; } }
for (let x = 0; x < W; x++) { push(x); push((H-1)*W + x); }
for (let y = 0; y < H; y++) { push(y*W); push(y*W + W-1); }
while (qh < qt) {
  const i = q[qh++], x = i % W, y = (i / W) | 0;
  if (x > 0) push(i-1); if (x < W-1) push(i+1); if (y > 0) push(i-W); if (y < H-1) push(i+W);
}

// 1b) enclosed white pockets (e.g. between hanging roots and the rock) are background too:
//     any sizeable region of near-pure-white that is not connected to the border
{
  const seen = new Uint8Array(N); const WH_T = 10, MIN_HOLE = 25;
  for (let s0 = 0; s0 < N; s0++) {
    if (bg[s0] || seen[s0] || dist[s0] > WH_T) continue;
    const comp = []; qh = 0; qt = 0; q[qt++] = s0; seen[s0] = 1;
    while (qh < qt) {
      const i = q[qh++]; comp.push(i);
      const x = i % W, y = (i / W) | 0;
      for (const j of [x>0?i-1:-1, x<W-1?i+1:-1, y>0?i-W:-1, y<H-1?i+W:-1]) if (j >= 0 && !bg[j] && !seen[j] && dist[j] <= WH_T) { seen[j] = 1; q[qt++] = j; }
    }
    if (comp.length >= MIN_HOLE) for (const i of comp) bg[i] = 1;
  }
}

// 2) drop small isolated specks (stray sparkles, watermark) – keep components >= MIN_AREA
const MIN_AREA = 400, label = new Int32Array(N); let nl = 0; const areas = [0];
for (let s = 0; s < N; s++) {
  if (bg[s] || label[s]) continue;
  nl++; let a = 0; qh = 0; qt = 0; q[qt++] = s; label[s] = nl;
  while (qh < qt) {
    const i = q[qh++]; a++;
    const x = i % W, y = (i / W) | 0;
    const nb = [x > 0 ? i-1 : -1, x < W-1 ? i+1 : -1, y > 0 ? i-W : -1, y < H-1 ? i+W : -1];
    for (const j of nb) if (j >= 0 && !bg[j] && !label[j]) { label[j] = nl; q[qt++] = j; }
  }
  areas.push(a);
}
let removed = 0;
for (let i = 0; i < N; i++) if (!bg[i] && areas[label[i]] < MIN_AREA) { bg[i] = 1; removed++; }

// 3) distance (in px, up to 4) from each foreground pixel to the background
const ring = new Uint8Array(N); qh = 0; qt = 0;
for (let i = 0; i < N; i++) if (bg[i]) { const x = i % W, y = (i / W) | 0; if ((x>0&&!bg[i-1])||(x<W-1&&!bg[i+1])||(y>0&&!bg[i-W])||(y<H-1&&!bg[i+W])) {} }
const cur = [];
for (let i = 0; i < N; i++) if (!bg[i]) {
  const x = i % W, y = (i / W) | 0;
  if ((x>0&&bg[i-1])||(x<W-1&&bg[i+1])||(y>0&&bg[i-W])||(y<H-1&&bg[i+W])) { ring[i] = 1; cur.push(i); }
}
let frontier = cur;
for (let r = 2; r <= 4; r++) {
  const next = [];
  for (const i of frontier) {
    const x = i % W, y = (i / W) | 0;
    for (const j of [x>0?i-1:-1, x<W-1?i+1:-1, y>0?i-W:-1, y<H-1?i+W:-1]) if (j >= 0 && !bg[j] && !ring[j]) { ring[j] = r; next.push(j); }
  }
  frontier = next;
}

// 4) output: interior opaque; edge ring (<=3px) re-matted against white
const out = new PNG({ width: W, height: H });
for (let i = 0; i < N; i++) {
  const o = i*4;
  if (bg[i]) { out.data[o] = out.data[o+1] = out.data[o+2] = 0; out.data[o+3] = 0; continue; }
  const r = ring[i];
  if (r === 0 || r >= 4) { out.data[o] = src[o]; out.data[o+1] = src[o+1]; out.data[o+2] = src[o+2]; out.data[o+3] = 255; continue; }
  // reference foreground colour = the most saturated (farthest from white) non-background pixel nearby
  const x = i % W, y = (i / W) | 0; let best = i, bd = dist[i];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
    const j = yy*W + xx; if (bg[j]) continue;
    if (dist[j] > bd) { bd = dist[j]; best = j; }
  }
  const a = Math.max(0, Math.min(1, dist[i] / Math.max(bd, 24)));
  out.data[o] = src[best*4]; out.data[o+1] = src[best*4+1]; out.data[o+2] = src[best*4+2];
  out.data[o+3] = Math.round(255 * Math.pow(a, 0.85));
}
// 5) bleed colours 2px into the transparent area so filtering never pulls in black
for (let pass = 0; pass < 2; pass++) {
  const copy = Buffer.from(out.data);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y*W + x, o = i*4; if (copy[o+3] !== 0) continue;
    let r = 0, g = 0, b = 0, c = 0;
    for (const j of [x>0?i-1:-1, x<W-1?i+1:-1, y>0?i-W:-1, y<H-1?i+W:-1]) if (j >= 0 && copy[j*4+3] > 0) { r += copy[j*4]; g += copy[j*4+1]; b += copy[j*4+2]; c++; }
    if (c) { out.data[o] = r/c; out.data[o+1] = g/c; out.data[o+2] = b/c; }
  }
}
// 6) crop to the object (+ margin)
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (out.data[(y*W+x)*4+3] > 8) { if (x<minX)minX=x; if (x>maxX)maxX=x; if (y<minY)minY=y; if (y>maxY)maxY=y; }
const pad = 6; minX = Math.max(0, minX-pad); minY = Math.max(0, minY-pad); maxX = Math.min(W-1, maxX+pad); maxY = Math.min(H-1, maxY+pad);
const cw = maxX-minX+1, ch = maxY-minY+1, crop = new PNG({ width: cw, height: ch });
PNG.bitblt(out, crop, minX, minY, cw, ch, 0, 0);
fs.writeFileSync(outFile, PNG.sync.write(crop));
console.log(`cutout -> ${outFile}  ${cw}x${ch}  (specks removed: ${removed}px, components kept: ${areas.filter(a => a >= MIN_AREA).length})`);
