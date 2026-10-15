const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 520 } });
  const logs = []; page.on('pageerror', e => logs.push('ERR ' + String(e.stack||e).slice(0, 400)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/w/test/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=0'); await page.waitForTimeout(2000);
  const out = await page.evaluate(() => { const D = window.__dbg, sc = D.three.scene; for (let i = 0; i < 4; i++) D.render(0.05); window.skyTeleport(D.state.player, 1340, 2230, 600); for (let i = 0; i < 6; i++) { D.update(1/30); D.render(1/30); }
    const mine = new Set(['airportIsland', 'airportBridge', 'catCabin', 'airportSky', 'catPlane', 'riverFall']); const res = [];
    // 기존 하늘 구역(x>700) 물체들의 3D 상자 모으기
    const items = []; sc.updateMatrixWorld(true);
    function walk(o, top){ if (mine.has(o.name)) return; if (o.isMesh || o.isSprite){ const b = new THREE.Box3().setFromObject(o); const s = b.getSize(new THREE.Vector3()); if (isFinite(s.x) && b.max.x > 700 && s.x > 25 && s.x < 2000 && s.y > 6) items.push({ top, n: o.name || o.type, g: o.geometry && o.geometry.type, b }); } o.children.forEach(c => walk(c, top || o.name || o.type)); }
    sc.children.forEach(c => walk(c, null));
    const boxes = { airport: new THREE.Box3(new THREE.Vector3(1180, 440, 2175), new THREE.Vector3(1500, 730, 2495)), bridge: new THREE.Box3(new THREE.Vector3(1215, 585, 2090), new THREE.Vector3(1290, 612, 2205)), cabin: new THREE.Box3(new THREE.Vector3(1920, 985, 1375), new THREE.Vector3(2000, 1060, 1625)) };
    Object.keys(boxes).forEach(k => { const hits = items.filter(it => it.b.intersectsBox(boxes[k])); res.push(k + ': ' + hits.length + ' hits'); hits.slice(0, 12).forEach(h => res.push('   ' + h.top + '/' + h.n + ' ' + h.g + ' x' + Math.round(h.b.min.x) + '..' + Math.round(h.b.max.x) + ' y' + Math.round(h.b.min.y) + '..' + Math.round(h.b.max.y) + ' z' + Math.round(h.b.min.z) + '..' + Math.round(h.b.max.z))); });
    res.push('total items ' + items.length);
    // 전체 겹침 검사: 큰 섬(위 상자 폭 60 이상) 끼리 3D 상자가 크게 겹치는 쌍
    const big = items.filter(it => (it.b.max.x - it.b.min.x) > 80 && it.b.max.x < 2300 && it.b.min.x > 650 && !/^Mesh$|extGround/.test('') ); res.push('big items ' + big.length);
    const seenPairs = new Set(); for (let i = 0; i < big.length; i++) for (let j = i + 1; j < big.length; j++){ const A = big[i].b, B = big[j].b; if (big[i].top === big[j].top && big[i].n === big[j].n && false) continue; const I = A.clone().intersect(B); if (I.isEmpty()) continue; const sz = I.getSize(new THREE.Vector3()); if (sz.x > 40 && sz.y > 30 && sz.z > 40){ const key = Math.round(A.min.x) + ':' + Math.round(A.min.y) + ':' + Math.round(A.min.z) + '|' + Math.round(B.min.x) + ':' + Math.round(B.min.y) + ':' + Math.round(B.min.z); if (seenPairs.has(key)) continue; seenPairs.add(key); res.push('OVERLAP ' + [big[i].top, big[i].g, Math.round(A.min.x), Math.round(A.max.x), Math.round(A.min.y), Math.round(A.max.y), Math.round(A.min.z), Math.round(A.max.z)].join(' ') + '  <->  ' + [big[j].top, big[j].g, Math.round(B.min.x), Math.round(B.max.x), Math.round(B.min.y), Math.round(B.max.y), Math.round(B.min.z), Math.round(B.max.z)].join(' ')); } } return res.join('\n'); });
  console.log(out); console.log(logs.join('\n') || 'no errors'); await browser.close(); })();
