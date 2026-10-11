const { chromium } = require('playwright-core');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html'); await page.waitForTimeout(500);
  await page.click('#btnStart'); await page.click('#btnToWorld'); await page.click('#worldNodes .node-btn >> nth=-1'); await page.waitForTimeout(3000);
  for (const [x, z] of [[-900, 40], [-1100, -1100]]) {
    const r = await page.evaluate(([x, z]) => { const D = window.__dbg, s = D.state, p = s.player; D.setRef(0); p.x = x; p.z = z; p.y = 0; s.cam.yaw = s.cam.target = 0; s.cam.fx = null; s.cam.fy = null; for (let i = 0; i < 40; i++) D.render(1/60);
      const R = D.three.renderer, info = R.info, out = {};
      info.reset(); D.render(1/60); out.withShadow = info.render.calls;
      const se = R.shadowMap.enabled; R.shadowMap.enabled = false; R.shadowMap.needsUpdate = true; info.reset(); D.render(1/60); out.noShadow = info.render.calls; R.shadowMap.enabled = se;
      const T = D.three; let vis = 0, cast = 0, V = 0, Vc = 0; T.scene.traverse(o => { if (!o.isMesh) return; let v = true, q = o, inV = false; while (q) { if (!q.visible) { v = false; break; } if (q.name === 'village') inV = true; q = q.parent; } if (!v) return; vis++; if (o.castShadow) cast++; if (inV) { V++; if (o.castShadow) Vc++; } });
      out.visMeshes = vis; out.castMeshes = cast; out.villageVis = V; out.villageCast = Vc; return out; }, [x, z]);
    console.log(x, z, JSON.stringify(r));
  }
  await browser.close();
})();
