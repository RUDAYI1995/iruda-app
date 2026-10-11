// Turns the pasted AI images into game-ready assets and writes skyart.js (window.SKYART).
//  - waterfall / fireflies: light-on-dark pictures -> RGBA (brightness becomes alpha), watermark star cropped away
//  - sky: watermark star painted out, kept as JPEG
//  - island: the already-cut-out PNG, re-encoded as WebP
const fs = require('fs');
const { chromium } = require('playwright-core');
const SP = process.argv[2], D = process.argv[3];
const { PNG } = require(SP + '/imgdiff/node_modules/pngjs');
const rd = f => PNG.sync.read(fs.readFileSync(f));

function lightOnDark(im, x0, y0, w, h, bgLevel, gain) {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = ((y0 + y) * im.width + (x0 + x)) * 4, o = (y * w + x) * 4;
    const r = im.data[i], g = im.data[i+1], b = im.data[i+2], m = Math.max(r, g, b);
    const a = Math.max(0, Math.min(1, (m - bgLevel) / gain));
    const k = m > 0 ? 255 / m : 0;                           // colour normalised so the brightest channel is 255
    out.data[o] = Math.min(255, r*k); out.data[o+1] = Math.min(255, g*k); out.data[o+2] = Math.min(255, b*k);
    out.data[o+3] = Math.round(a * 255);
  }
  return out;
}

// ---- waterfall atlas (crop x 355..705, y 145..650) ----
const wf = rd(D + '/9.png');
const WF = { x0: 355, y0: 145, w: 350, h: 505 };
const fall = lightOnDark(wf, WF.x0, WF.y0, WF.w, WF.h, 5, 235);
// extents of the falling body (rows 40..300 of the atlas) so the game can stretch just that part
let bx0 = WF.w, bx1 = 0;
for (let y = 40; y < 300; y++) for (let x = 0; x < WF.w; x++) if (fall.data[(y*WF.w + x)*4 + 3] > 22) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; }
console.log('waterfall body x-range in atlas:', bx0, bx1);

// ---- fireflies (crop x 330..770, y 215..575) ----
const ff = rd(D + '/10.png');
const FF = { x0: 330, y0: 215, w: 440, h: 360 };
const fireflies = lightOnDark(ff, FF.x0, FF.y0, FF.w, FF.h, 36, 150);

// ---- sky: paint out the corner star by interpolating from the box border ----
const sky = rd(D + '/11.png');
const SW = sky.width, SH = sky.height;
{
  const bx0 = 906, bx1 = 964, by0 = 453, by1 = 512;
  const get = (x, y) => { const i = (y*SW + x)*4; return [sky.data[i], sky.data[i+1], sky.data[i+2]]; };
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const tx = (x - bx0) / (bx1 - bx0), ty = (y - by0) / (by1 - by0);
    const L = get(bx0 - 1, y), R = get(bx1 + 1, y), T = get(x, by0 - 1), B = get(x, by1 + 1);
    const i = (y*SW + x)*4;
    for (let k = 0; k < 3; k++) sky.data[i+k] = Math.round(0.5 * (L[k]*(1-tx) + R[k]*tx) + 0.5 * (T[k]*(1-ty) + B[k]*ty));
  }
}
// average colour of the bottom (haze) band, used to tint the distance fog while up in the sky
let hz = [0, 0, 0], hn = 0;
for (let y = SH - 70; y < SH; y++) for (let x = 0; x < SW; x++) { const i = (y*SW + x)*4; hz[0] += sky.data[i]; hz[1] += sky.data[i+1]; hz[2] += sky.data[i+2]; hn++; }
hz = hz.map(v => Math.round(v / hn));
console.log('sky haze colour', hz.join(','));

const island = rd(SP + '/assets/island1.png');

// ---- rock relief: derive a height map + normal map + crevice-darkened colour from the flat picture ----
function boxBlur(src, w, h, r) {                                  // separable box blur on a Float32Array
  const tmp = new Float32Array(w*h), out = new Float32Array(w*h), n = 2*r + 1;
  for (let y = 0; y < h; y++) { let acc = 0; for (let x = -r; x <= r; x++) acc += src[y*w + Math.min(w-1, Math.max(0, x))];
    for (let x = 0; x < w; x++) { tmp[y*w + x] = acc / n; acc += src[y*w + Math.min(w-1, x + r + 1)] - src[y*w + Math.max(0, x - r)]; } }
  for (let x = 0; x < w; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[Math.min(h-1, Math.max(0, y))*w + x];
    for (let y = 0; y < h; y++) { out[y*w + x] = acc / n; acc += tmp[Math.min(h-1, y + r + 1)*w + x] - tmp[Math.max(0, y - r)*w + x]; } }
  return out;
}
function makeRelief(im, opt) {
  opt = opt || {};
  const w = im.width, h = im.height, N = w*h;
  const a = new Float32Array(N), L = new Float32Array(N);
  for (let i = 0; i < N; i++) { a[i] = im.data[i*4+3] / 255; L[i] = (0.3*im.data[i*4] + 0.59*im.data[i*4+1] + 0.11*im.data[i*4+2]) / 255; }
  // distance to the silhouette edge (two-pass chamfer) -> rounded "inflated" body
  const INF = 1e9, d = new Float32Array(N);
  for (let i = 0; i < N; i++) d[i] = a[i] > 0.5 ? INF : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y*w + x; if (!d[i]) continue;
    if (x > 0) d[i] = Math.min(d[i], d[i-1] + 1); if (y > 0) d[i] = Math.min(d[i], d[i-w] + 1);
    if (x > 0 && y > 0) d[i] = Math.min(d[i], d[i-w-1] + 1.414); if (x < w-1 && y > 0) d[i] = Math.min(d[i], d[i-w+1] + 1.414); }
  for (let y = h-1; y >= 0; y--) for (let x = w-1; x >= 0; x--) { const i = y*w + x; if (!d[i]) continue;
    if (x < w-1) d[i] = Math.min(d[i], d[i+1] + 1); if (y < h-1) d[i] = Math.min(d[i], d[i+w] + 1);
    if (x < w-1 && y < h-1) d[i] = Math.min(d[i], d[i+w+1] + 1.414); if (x > 0 && y < h-1) d[i] = Math.min(d[i], d[i+w-1] + 1.414); }
  const R = opt.R || 70, body = new Float32Array(N);
  for (let i = 0; i < N; i++) body[i] = a[i] > 0.5 ? Math.pow(Math.min(1, d[i] / R), 0.55) : 0;
  const bodyS = boxBlur(body, w, h, 4);
  // fine detail: local brightness (dark = crevice/deeper, bright = ridge/closer), two scales
  const lo = boxBlur(L, w, h, 14), mid = boxBlur(L, w, h, 4), fine = new Float32Array(N), coarse = new Float32Array(N);
  const lo2 = boxBlur(L, w, h, 2);
  for (let i = 0; i < N; i++) { coarse[i] = L[i] - lo[i]; fine[i] = L[i] - lo2[i]; }
  const hgt = new Float32Array(N);
  for (let i = 0; i < N; i++) hgt[i] = a[i] > 0.5 ? Math.max(0, Math.min(1, bodyS[i]*0.55 + 0.5*0 + (coarse[i]*2.6 + fine[i]*1.2) * 0.45 + 0.1)) : 0;
  const hs = boxBlur(hgt, w, h, 1);
  // wind mask: foliage (saturated colour) in the upper part of the picture sways, rock stays still
  let top = h; for (let i = 0; i < N; i++) if (a[i] > 0.5) { top = Math.floor(i / w); break; }
  let bot = 0; for (let i = N - 1; i >= 0; i--) if (a[i] > 0.5) { bot = Math.floor(i / w); break; }
  const span = (bot - top) * (opt.topFrac || 0.3), swm = new Float32Array(N);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y*w + x; if (a[i] < 0.5) continue;
    const r = im.data[i*4], g = im.data[i*4+1], b = im.data[i*4+2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx > 0 ? (mx - mn) / mx : 0;
    const up = Math.max(0, Math.min(1, 1 - (y - top) / span));
    swm[i] = Math.max(0, Math.min(1, (sat - (opt.satLo === undefined ? 0.1 : opt.satLo)) / (opt.satW || 0.18))) * Math.pow(up, 0.8); }
  const swb = boxBlur(swm, w, h, 2), sway = new PNG({ width: w, height: h });
  for (let i = 0; i < N; i++) { const v = Math.round(Math.min(1, swb[i]) * 255); sway.data[i*4] = sway.data[i*4+1] = sway.data[i*4+2] = v; sway.data[i*4+3] = 255; }
  // normal map (tangent space, +Y up, OpenGL convention)
  const nrm = new PNG({ width: w, height: h }), hmap = new PNG({ width: w, height: h }), col = new PNG({ width: w, height: h });
  const STR = 4.5;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y*w + x, xl = Math.max(0, x-1), xr = Math.min(w-1, x+1), yu = Math.max(0, y-1), yd = Math.min(h-1, y+1);
    const dx = (hs[y*w + xr] - hs[y*w + xl]) * 0.5, dy = (hs[yd*w + x] - hs[yu*w + x]) * 0.5;
    let nx = -dx*STR, ny = dy*STR, nz = 1; const l = Math.hypot(nx, ny, nz); nx /= l; ny /= l; nz /= l;
    const o = i*4;
    nrm.data[o] = Math.round((nx*0.5 + 0.5)*255); nrm.data[o+1] = Math.round((ny*0.5 + 0.5)*255); nrm.data[o+2] = Math.round((nz*0.5 + 0.5)*255); nrm.data[o+3] = 255;
    const hv = Math.round(Math.min(1, hs[i]) * 255); hmap.data[o] = hmap.data[o+1] = hmap.data[o+2] = hv; hmap.data[o+3] = 255;
    // colour: deepen crevices, lift ridges a little, add a soft cavity term from the body height (rim light falls off to the edge)
    const k = 1 + Math.max(-0.5, Math.min(0.45, coarse[i]*2.4 + fine[i]*1.4));
    const rim = 0.86 + 0.14*bodyS[i];
    for (let c = 0; c < 3; c++) col.data[o+c] = Math.max(0, Math.min(255, im.data[o+c] * k * rim));
    col.data[o+3] = im.data[o+3];
  }
  return { nrm, hmap, col, sway };
}
const relief = makeRelief(island, { topFrac:0.3, satLo:-1, satW:1 });
relief.col = enrichFoliage(relief.col, relief.sway, { cycles: 1.5, shift: 0, mul: 1.7, floor: 0.05, dark: 0.1, gain: 2.0, push: false });
function upscale(im, k) {                                         // bilinear RGBA upscale (colours were bled into the transparent rim already)
  const w = im.width*k, h = im.height*k, o = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const fx = Math.max(0, (x + 0.5)/k - 0.5), fy = Math.max(0, (y + 0.5)/k - 0.5), x0 = Math.min(im.width-1, Math.floor(fx)), y0 = Math.min(im.height-1, Math.floor(fy));
    const x1 = Math.min(im.width-1, x0+1), y1 = Math.min(im.height-1, y0+1), tx = fx - x0, ty = fy - y0;
    for (let c = 0; c < 4; c++) { const v = (im.data[(y0*im.width+x0)*4+c]*(1-tx) + im.data[(y0*im.width+x1)*4+c]*tx)*(1-ty) + (im.data[(y1*im.width+x0)*4+c]*(1-tx) + im.data[(y1*im.width+x1)*4+c]*tx)*ty; o.data[(y*w+x)*4+c] = Math.round(v); }
  }
  return o;
}

// clean the matte edge of a tiny cut-out: erode the alpha, then bleed interior colours outward so no grey halo is left
function cleanEdge(im, k) {
  const w = im.width, h = im.height, N = w*h, m = new Uint8Array(N);
  for (let i = 0; i < N; i++) m[i] = im.data[i*4+3] > 128 ? 1 : 0;
  const inner = new Uint8Array(N);                                // pixels whose 4 neighbours are all opaque
  for (let y = 1; y < h-1; y++) for (let x = 1; x < w-1; x++) { const i = y*w + x; if (m[i] && m[i-1] && m[i+1] && m[i-w] && m[i+w]) inner[i] = 1; }
  const o = new PNG({ width: w, height: h }); o.data = Buffer.from(im.data);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y*w + x; if (inner[i]) continue;
    let r = 0, g = 0, b = 0, c = 0;                              // rim pixel: take the colour of the interior pixels within 2px (thin parts keep their own colour)
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const j = yy*w + xx; if (inner[j]) { r += im.data[j*4]; g += im.data[j*4+1]; b += im.data[j*4+2]; c++; } }
    if (c) { o.data[i*4] = r/c; o.data[i*4+1] = g/c; o.data[i*4+2] = b/c; }
    o.data[i*4+3] = m[i] ? 255 : 0;
  }
  return o;
}
function sharpen(im, amount) {                                    // unsharp mask on RGB (alpha untouched)
  const w = im.width, h = im.height, N = w*h, o = new PNG({ width: w, height: h });
  for (let c = 0; c < 3; c++) { const ch = new Float32Array(N); for (let i = 0; i < N; i++) ch[i] = im.data[i*4+c];
    const bl = boxBlur(ch, w, h, 2); for (let i = 0; i < N; i++) o.data[i*4+c] = Math.max(0, Math.min(255, ch[i] + (ch[i] - bl[i]) * amount)); }
  for (let i = 0; i < N; i++) o.data[i*4+3] = im.data[i*4+3];
  return o;
}
function softAlpha(im, r) {                                       // smooth the alpha edge so the cut-out contour is round, not stair-stepped
  const w = im.width, h = im.height, N = w*h, a = new Float32Array(N); for (let i = 0; i < N; i++) a[i] = im.data[i*4+3];
  const b = boxBlur(boxBlur(a, w, h, r), w, h, r), o = new PNG({ width: w, height: h });
  for (let i = 0; i < N; i++) { o.data[i*4] = im.data[i*4]; o.data[i*4+1] = im.data[i*4+1]; o.data[i*4+2] = im.data[i*4+2]; o.data[i*4+3] = Math.round(Math.max(0, Math.min(255, (b[i] - 128) * 2.2 + 128))); }
  return o;
}

// make the tree foliage richer: boost saturation (more where the wind/foliage mask is strong) and give each tree its own hue shift
function rgb2hsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d > 0) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx === 0 ? 0 : d / mx, mx]; }
function hsv2rgb(h, s, v) { h = ((h % 360) + 360) % 360; const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; }
function enrichFoliage(col, sway, opt) {
  const w = col.width, h = col.height, o = new PNG({ width: w, height: h }); o.data = Buffer.from(col.data);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y*w + x)*4; if (col.data[i+3] < 10) continue;
    const m = Math.max(0, Math.min(1, sway.data[i] / 255 * (opt.gain || 2.2))); if (m < 0.04) continue;
    let [hh, ss, vv] = rgb2hsv(col.data[i], col.data[i+1], col.data[i+2]);
    const shift = (opt.shift || 40) * Math.sin(x * 2*Math.PI * (opt.cycles || 4) / w + (opt.phase || 0));       // each tree drifts to its own hue
    if (ss > 0.035) hh += shift * m + (opt.push === false ? 0 : 14 * Math.sin((hh - 20) * Math.PI / 180 * 1.0) * m);
    ss = Math.min(1, ss + (Math.min(1, ss*(opt.mul || 2.6)) - ss) * m + (ss > 0.035 ? (opt.floor || 0.14) * m : 0));
    vv = vv * (1 - (opt.dark || 0.14) * m);
    const [r, g, b] = hsv2rgb(hh, ss, vv); o.data[i] = r; o.data[i+1] = g; o.data[i+2] = b;
  }
  return o;
}
const variants = [];
for (let n = 1; n <= 8; n++) { const base = cleanEdge(rd(SP + '/assets/isl_v' + n + '.png'), 2); const up = softAlpha(sharpen(upscale(base, 4), 0.9), 3); const rel = makeRelief(up, { R: 34, topFrac: 0.5, satLo: 0.03, satW: 0.1 }); variants.push({ up: enrichFoliage(up, rel.sway, { cycles: 1, shift: 0, mul: 1.8, floor: 0.06, dark: 0.1, gain: 2.4, push: false }), rel }); }
const obelisk = rd(SP + '/assets/obelisk.png'), aqueduct = rd(SP + '/assets/aqueduct.png');


// ---- cloud sea tile: crop the cloud floor of the picture, cross-fade the left/right ends, mirror top/bottom -> a seamless 1024x512 tile ----
function resizeBilinear(im, W, H) {
  const o = new PNG({ width: W, height: H });
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const fx = Math.max(0, Math.min(im.width - 1, (x + 0.5) * im.width / W - 0.5)), fy = Math.max(0, Math.min(im.height - 1, (y + 0.5) * im.height / H - 0.5));
    const x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(im.width - 1, x0 + 1), y1 = Math.min(im.height - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
    for (let c = 0; c < 4; c++) { const v = (im.data[(y0*im.width+x0)*4+c]*(1-tx) + im.data[(y0*im.width+x1)*4+c]*tx)*(1-ty) + (im.data[(y1*im.width+x0)*4+c]*(1-tx) + im.data[(y1*im.width+x1)*4+c]*tx)*ty; o.data[(y*W+x)*4+c] = Math.round(v); }
  }
  return o;
}
function makeCloudTile(src) {
  const CX = 20, CY = 352, CW = 860, CH = 220;                // cloud floor only (no mountains, no corner logo)
  const patch0 = new PNG({ width: CW, height: CH }); PNG.bitblt(src, patch0, CX, CY, CW, CH, 0, 0);
  const WT = 1024, HT = 512, OX = 110, OY = 90;
  const big = resizeBilinear(patch0, WT + OX, HT + OY);       // the picture is soft, so stretching it vertically is not visible
  // periodic: cross-fade the tail into the head in x, then in y
  const tx = new PNG({ width: WT, height: HT + OY });
  for (let y = 0; y < HT + OY; y++) for (let x = 0; x < WT; x++) for (let c = 0; c < 4; c++) {
    let v = big.data[(y*big.width + x)*4 + c];
    if (x < OX) { const t = x / OX; v = big.data[(y*big.width + WT + x)*4 + c]*(1 - t) + v*t; }
    tx.data[(y*WT + x)*4 + c] = v;
  }
  const out = new PNG({ width: WT, height: HT });
  for (let y = 0; y < HT; y++) for (let x = 0; x < WT; x++) for (let c = 0; c < 4; c++) {
    let v = tx.data[(y*WT + x)*4 + c];
    if (y < OY) { const t = y / OY; v = tx.data[((HT + y)*WT + x)*4 + c]*(1 - t) + v*t; }
    out.data[(y*WT + x)*4 + c] = Math.round(v);
  }
  // local contrast: bring out the billows (periodic blur so the tile still wraps)
  const W2 = out.width, H2 = out.height, lum = new Float32Array(W2*H2);
  for (let i = 0; i < W2*H2; i++) lum[i] = (out.data[i*4] + out.data[i*4+1] + out.data[i*4+2]) / 3;
  const bl = boxBlurWrap(lum, W2, H2, 22), res = new PNG({ width: W2, height: H2 });
  for (let i = 0; i < W2*H2; i++) { const d = (lum[i] - bl[i]) * 1.9; for (let c = 0; c < 3; c++) res.data[i*4+c] = Math.max(0, Math.min(255, out.data[i*4+c] + d)); res.data[i*4+3] = 255; }
  return res;
}
function boxBlurWrap(src, w, h, r) {
  const tmp = new Float32Array(w*h), o = new Float32Array(w*h), n = 2*r + 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let a = 0; for (let k = -r; k <= r; k++) a += src[y*w + ((x + k + w) % w)]; tmp[y*w + x] = a / n; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let a = 0; for (let k = -r; k <= r; k++) a += tmp[((y + k + h) % h)*w + x]; o[y*w + x] = a / n; }
  return o;
}
const cloudTile = makeCloudTile(rd(D + '/20.png'));


// ---- magic-tree pictures: tile textures (corner star painted out by copying a neighbouring patch) + cut-out canopies ----
function fixStar(im, x0, y0, x1, y1) { const w = im.width; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) for (let c = 0; c < 4; c++) im.data[(y*w + x)*4 + c] = im.data[(y*w + x - 110)*4 + c]; return im; }
const barkTile = fixStar(rd(SP + '/assets/in_28.png'), 865, 865, 945, 935);
const towerTile = fixStar(rd(SP + '/assets/in_29.png'), 865, 865, 945, 935);
const stoneTile = rd(SP + '/assets/in_31.png');
const grassTile = rd(SP + '/assets/in_35.png');
const canopies = [0, 1, 2, 3].map(k => rd(SP + '/assets/canopy' + k + '.png'));

// plank tile from the top-down rope bridge: take 4 planks, rotate 90deg so picture-x = across the path
const bridgeSrc = rd(D + '/33.png');
const plankTile = (() => { const cx = 200, cy = 440, cw = 130, ch = 138, o = new PNG({ width: ch, height: cw });
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) { const i = ((cy + y)*bridgeSrc.width + cx + x)*4, ox = y, oy = cw - 1 - x, j = (oy*ch + ox)*4; for (let c = 0; c < 4; c++) o.data[j+c] = bridgeSrc.data[i+c]; }
  return o; })();

const treePics = [0,1,2,3,4,5,6,7,8].map(i => rd(SP + '/assets/tree' + i + '.png'));
const bushPics = [0,1,2].map(i => rd(SP + '/assets/bush' + i + '.png'));
const shadowPics = [0,1].map(i => rd(SP + '/assets/shadow' + i + '.png'));

const VT = ['field0','field1','field2','road','roadfield','wall_clay','wall_plaster','wall_wood','roof_gaw','roof_thatch','roof_slate','ridge','hall_front','hall_side','hall_back','mill_front','mill_side','mill_back','water','sky_dusk','sky_night','sky_dawn','t_wall','t_wall2','t_gravel','t_water','t_bank','r_gaw','r_thatch','r_slate','a_road','a_wall','a_bark','day_sky','t_dirt','t_gravel2','t_stone','t_yard','t_weedy','t_tin','t_cement'];
const VP = ['h_gl_front','h_gl_side','h_gl_back','h_gb_front','h_gb_side','h_gb_back','h_gs_front','h_gs_side','h_gs_back','h_ts_front','h_ts_side','h_ts_back','h_tb_front','h_tb_side','h_tb_back','h_hr_front','h_hr_side','h_hr_back','h_yo_front','h_yo_side','h_yo_back','f_shop','f_gazebo','f_well','f_jaryard','f_pump','f_scarecrow','f_straw','f_fsign','far_terrace','gate_front','gate_open','gate_side','y_pumpkin','y_sunflower','y_wild','y_veg','y_jars','y_firewood','y_bicycle','y_treefront','y_treeside','y_leaf','h_g_front','h_g_side','h_g_back','h_g_top','h_t_front','h_t_side','h_t_back','h_t_top','h_s_front','h_s_side','h_s_back','p_wallrun','p_wallcorner','p_toldam','p_fence','p_ridge','p_jangdok','p_firewood','p_laundry','p_pyeongsang','p_bush0','p_bush1','p_bush2','p_cosmos','p_sunflower','p_wild0','p_wild1','p_wild2','p_wild3','p_wild4','p_sign','p_stone','p_mailbox','p_bus','s_bridge_wood','s_bridge_stone','sun','moon','gate','pyeongsang','tiller','sheaf','pole','pavilion','lily','elder0','elder1','persimmon','apple','wall0','wall1','wall2','brook','m_front','m_side','m_back','b_front','b_side','b_back','t1','t2','tl_s','sl_blue','t_med','tl_m_side','tl_m_back','w_thatch','w_blue','wA_front','wA_back','wB_front','wB_back','wB_side','q_dish','q_pole','q_bike','q_jars','q_line','q_table','q_tiller','q_tunnel','q_furrow','q_pepper','q_onion','q_cabbage','q_lettuce','wl_cement','wl_tile','wl_tin'];
const vTiles = {}, vProps = {};
VT.forEach(n => { vTiles[n] = rd(SP + '/assets/village/' + n + '.png'); });
VP.forEach(n => { vProps[n] = rd(SP + '/assets/village/' + n + '.png'); });
const arch = rd(SP + '/assets/arch.png');                    // stone gate (white background already cut out)
// ---- portal swirl (light on black): crop around the swirl, leaving the corner logo out ----
const pt = rd(D + '/14.png');
const PT = { x0: 285, y0: 60, w: 440, h: 440 };
const portal = lightOnDark(pt, PT.x0, PT.y0, PT.w, PT.h, 6, 170);

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage();
  const enc = async (png, mime, q) => page.evaluate(async ([b64, mime, q]) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL(mime, q);
  }, [PNG.sync.write(png).toString('base64'), mime, q]);
  const art = {
    island:    { src: await enc(relief.col, 'image/webp', 0.93), w: island.width, h: island.height,
                 normal: await enc(relief.nrm, 'image/webp', 0.95), height: await enc(relief.hmap, 'image/webp', 0.9), sway: await enc(relief.sway, 'image/webp', 0.9) },
    obelisk:   { src: await enc(obelisk, 'image/webp', 0.93), w: obelisk.width, h: obelisk.height },
    aqueduct:  { src: await enc(aqueduct, 'image/webp', 0.93), w: aqueduct.width, h: aqueduct.height },
    cloud:     { src: await enc(cloudTile, 'image/jpeg', 0.9), w: 1024, h: 512 },
    bark:      { src: await enc(barkTile, 'image/jpeg', 0.9), w: barkTile.width, h: barkTile.height },
    tower:     { src: await enc(towerTile, 'image/jpeg', 0.9), w: towerTile.width, h: towerTile.height },
    stone:     { src: await enc(stoneTile, 'image/jpeg', 0.88), w: stoneTile.width, h: stoneTile.height },
    plank:     { src: await enc(plankTile, 'image/jpeg', 0.92), w: plankTile.width, h: plankTile.height },
    grass:     { src: await enc(grassTile, 'image/jpeg', 0.9), w: grassTile.width, h: grassTile.height },
    trees:     [],
    bushes:    [],
    shadows:   [],
    village:   { tiles:{}, props:{} },
    canopies:  [],
    variants:  [],
    arch:      { src: await enc(arch, 'image/webp', 0.93), w: arch.width, h: arch.height },
    portal:    { src: await enc(portal, 'image/webp', 0.92), w: portal.width, h: portal.height },
    fall:      { src: await enc(fall, 'image/webp', 0.92), w: fall.width, h: fall.height, bodyX0: bx0, bodyX1: bx1, lipY1: 100, midY1: 300 },
    fireflies: { src: await enc(fireflies, 'image/webp', 0.92), w: fireflies.width, h: fireflies.height },
    sky:       { src: await enc(sky, 'image/jpeg', 0.92), w: SW, h: SH, haze: hz }
  };
  for (const t of treePics) art.trees.push({ src: await enc(t, 'image/webp', 0.9), w: t.width, h: t.height });
  for (const t of bushPics) art.bushes.push({ src: await enc(t, 'image/webp', 0.9), w: t.width, h: t.height });
  for (const t of shadowPics) art.shadows.push({ src: await enc(t, 'image/webp', 0.85), w: t.width, h: t.height });
  for (const n of VT) art.village.tiles[n] = { src: await enc(vTiles[n], 'image/jpeg', 0.9), w: vTiles[n].width, h: vTiles[n].height };
  for (const n of VP) art.village.props[n] = { src: await enc(vProps[n], 'image/webp', 0.9), w: vProps[n].width, h: vProps[n].height };
  for (const c of canopies) art.canopies.push({ src: await enc(c, 'image/webp', 0.92), w: c.width, h: c.height });
  for (const v of variants) art.variants.push({ src: await enc(v.up, 'image/webp', 0.95), w: v.up.width, h: v.up.height, sway: await enc(v.rel.sway, 'image/webp', 0.9) });   // original colours, no relief (tiny source pictures)
  fs.writeFileSync(SP + '/assets/cloud_tile.png', PNG.sync.write(cloudTile));
  fs.writeFileSync(SP + '/assets/var1_relit.png', PNG.sync.write(variants[0].rel.col));
  fs.writeFileSync(SP + '/assets/var1_sway.png', PNG.sync.write(variants[0].rel.sway));
  fs.writeFileSync(SP + '/assets/island_sway.png', PNG.sync.write(relief.sway));
  for (const k of Object.keys(art).filter(k => !['variants','canopies','trees','bushes','shadows','village'].includes(k))) console.log(k.padEnd(10), art[k].w + 'x' + art[k].h, Math.round(art[k].src.length * 0.75 / 1024) + 'KB');
  fs.writeFileSync(SP + '/assets/skyart.js', 'window.SKYART = ' + JSON.stringify(art) + ';\n');
  // also keep readable previews of what the game will use
  fs.writeFileSync(SP + '/assets/fall_atlas.png', PNG.sync.write(fall));
  fs.writeFileSync(SP + '/assets/island_normal.png', PNG.sync.write(relief.nrm));
  fs.writeFileSync(SP + '/assets/island_height.png', PNG.sync.write(relief.hmap));
  fs.writeFileSync(SP + '/assets/island_relit.png', PNG.sync.write(relief.col));
  fs.writeFileSync(SP + '/assets/portal_cut.png', PNG.sync.write(portal));
  fs.writeFileSync(SP + '/assets/fireflies_cut.png', PNG.sync.write(fireflies));
  fs.writeFileSync(SP + '/assets/sky_clean.png', PNG.sync.write(sky));
  console.log('wrote assets/skyart.js');
  await browser.close();
})();
