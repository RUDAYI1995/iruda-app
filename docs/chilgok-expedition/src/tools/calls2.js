const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  const r = await page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = x; p.z = z; p.y = 0; s.cam.yaw = s.cam.target = 0; s.cam.fx = null; s.cam.fy = null; for (let i = 0; i < 40; i++) D.render(1/60);
    const T = D.three, cam = T.camera; cam.updateMatrixWorld(true); const fr = new THREE.Frustum(), m = new THREE.Matrix4(); m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); fr.setFromProjectionMatrix(m);
    const cnt = {}, mats = new Set(); let tot = 0;
    T.scene.traverse(o => { if (!o.isMesh || !o.material) return; let v = true, q = o; while (q) { if (!q.visible) { v = false; break; } q = q.parent; } if (!v) return; if (o.frustumCulled && o.geometry && o.geometry.boundingSphere === null) o.geometry.computeBoundingSphere(); if (o.frustumCulled && !fr.intersectsObject(o)) return;
      tot++; let inV = false, a = o; while (a) { if (a.name === 'village') { inV = true; break; } a = a.parent; } const g = (inV ? 'V:' : 'O:') + o.geometry.type + (o.isInstancedMesh ? '*I' : ''); cnt[g] = (cnt[g] || 0) + 1; mats.add(o.material.uuid); });
    return { tot, mats: mats.size, cnt }; }, [+process.argv[3], +process.argv[4]]);
  console.log(JSON.stringify(r)); await browser.close();
})();
