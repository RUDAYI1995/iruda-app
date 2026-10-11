const { chromium } = require('playwright-core');
const fs = require('fs');
const SP = process.argv[2];
(async () => {
  const png64 = fs.readFileSync(SP + '/assets/island1.png').toString('base64');
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium',
    args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e).slice(0, 300)));
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.goto('file://' + SP + '/test_new/index.html');
  await page.waitForTimeout(400);
  await page.click('#btnStart'); await page.click('#btnToWorld');
  await page.click('#worldNodes .node-btn >> nth=0');
  await page.waitForTimeout(1500);
  const shot = async (name, withCards) => {
    await page.evaluate(async ([png64, withCards]) => {
      const D = window.__dbg, s = D.state, p = s.player, sc = D.three.scene;
      p.x = 1000; p.z = 1108; p.y = 0; s.cam.fx = null; s.cam.yaw = 0; s.cam.target = 0; s.cam.turn = null;
      // add (or remove) AI-art island billboards beside the walkable path, to judge scale/colour next to the procedural scenery
      let grp = sc.getObjectByName('testCards');
      if (grp) sc.remove(grp);
      if (withCards) {
        const img = new Image(); img.src = 'data:image/png;base64,' + png64; await img.decode();
        const tex = new THREE.Texture(img); tex.needsUpdate = true;
        grp = new THREE.Group(); grp.name = 'testCards';
        const mk = (x, y, z, w, flip) => {
          const h = w * img.naturalHeight / img.naturalWidth;
          const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, alphaTest: 0.02 }));
          m.position.set(x, y + h*0.5, z); m.rotation.y = 0; if (flip) m.scale.x = -1; grp.add(m);
        };
        mk(1090, 112, 1330, 120, false);     // right-ish of the path (world +x is screen-left)
        mk( 905, 126, 1390, 150, true);
        mk(1010, 165, 1700, 220, false);     // far, big
        sc.add(grp);
      }
      D.three.camera.position.set(1000, 16 + 90, 1076);
      for (let i = 0; i < 80; i++) D.render(1/60);
    }, [png64, withCards]);
    await page.waitForTimeout(200);
    await page.screenshot({ path: SP + '/island_scene_' + name + '.png' });
  };
  await shot('without', false);
  await shot('with', true);
  console.log(errs.length ? 'ERRORS ' + errs.join(' | ') : 'no page errors');
  await browser.close();
})();
