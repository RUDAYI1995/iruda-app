// 3D islands/cards: [x, z, radius]  (xz footprint, conservative)
const obs = [
 [1000,1100,30],[1000,1410,82],[1000,1690,68],[905,1170,22],[1095,1195,20],[840,1310,36],[1170,1335,34],[790,1460,52],[1215,1495,48],[880,1660,38],[1125,1700,42],[1000,1980,92],
 [850,1555,30],[1150,1555,30],[775,1800,74],[1370,1840,66],[1000,2060,52],
 // high cards: disc radius ~ w/2 (they face the camera, so any heading)
 [1380,1800,165],[830,1850,150],[1010,2300,220],[1750,2150,140],[780,2250,140],[1250,1550,110],[900,1600,105],[1000,2800,280],
 [760,1500,95],[1290,1440,82],[1520,1660,105],[700,2060,80],[1180,2160,65],[1620,2500,115],[800,2620,88],[1300,2760,102],
];
// aqueduct lines (x0..x1 at z)
const lines = [[850,1150,1555],[775,1370,1800]];
const R = 55;               // trunk root-flare radius + margin
let best = [];
for (let x = 650; x <= 1800; x += 25) for (let z = 1000; z <= 3000; z += 25) {
  let m = 1e9;
  for (const [ox, oz, r] of obs) m = Math.min(m, Math.hypot(x - ox, z - oz) - r - R);
  for (const [x0, x1, lz] of lines) { const cx = Math.max(x0, Math.min(x1, x)); m = Math.min(m, Math.hypot(x - cx, z - lz) - 6 - R); }
  const c = Math.hypot(x - 1050, z - 2000);                      // closeness to the middle of the sky zone
  best.push([m, c, x, z]);
}
best.filter(b => b[0] > 0).sort((a, b) => a[1] - b[1]).slice(0, 12).forEach(b => console.log('clear', b[0].toFixed(0), 'dist-to-middle', b[1].toFixed(0), 'at', b[2], b[3]));
console.log('best clearance:', best.sort((a, b) => b[0] - a[0]).slice(0, 5).map(b => b[0].toFixed(0) + '@' + b[2] + ',' + b[3]).join('  '));
