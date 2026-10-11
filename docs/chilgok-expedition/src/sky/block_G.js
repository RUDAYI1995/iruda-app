    // ---------- 아치 문 + 순간이동 포털 (제미나이 그림) + 위쪽 하늘 섬 ----------
    // 아래 관문 섬의 아치 문 포털에 걸어 들어가면 훨씬 높은 "천공 섬"으로 순간이동하고,
    // 천공 섬의 아치 포털로 들어가면 다시 내려와요. 그림(arch/portal)이 없으면 예전 도형 문으로 동작해요.
    var TOP = SKY.top, skyExtra = null, portals = [];
    function buildArtGate(gx, gy, gz, sc){
      var G = new THREE.Group(); G.position.set(gx, gy, gz); G.scale.set(sc, sc, sc); sky.add(G);
      var archTex = artTex(art.arch), portTex = artTex(art.portal);
      var U = 0.149;                                               // 그림 1px = 월드 0.149 (기둥 위치가 걷기 충돌과 맞게)
      var aw = art.arch.w * U, ah = art.arch.h * U;
      [-2.4, 2.4].forEach(function(dz){                            // 앞뒤 두 장을 겹쳐 두께감
        var m = new THREE.Mesh(new THREE.PlaneGeometry(aw, ah),
          new THREE.MeshBasicMaterial({ map:archTex, transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
        m.position.set(0, ah/2 - 6*U, dz); G.add(m);
      });
      // 수정 불꽃 둘레에 번지는 빛
      var halo = canvasTex(64, 64, function(g, w, h){
        var gr = g.createRadialGradient(w/2, h/2, 1, w/2, h/2, w/2);
        gr.addColorStop(0, "rgba(255,255,255,0.95)"); gr.addColorStop(0.35, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      });
      [[-44.5, 31, 0x66f2ff], [-30.8, 34.7, 0xff8fe0], [30.8, 34.7, 0xff8fe0], [44.5, 31, 0x66f2ff]].forEach(function(c){
        var hm = new THREE.Mesh(new THREE.PlaneGeometry(10, 10),
          new THREE.MeshBasicMaterial({ map:halo, color:c[2], transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, fog:false, opacity:0.7 }));
        hm.position.set(c[0], c[1], 0.2); G.add(hm);
        pulsers.push({ mat:hm.material, base:0.62, amp:0.22 });
      });
      // 문 안쪽에서 빙글빙글 도는 소용돌이 (서로 반대로 도는 두 겹)
      var layers = [];
      [[26, 1], [19, -1.6]].forEach(function(d){
        var pm = new THREE.Mesh(new THREE.PlaneGeometry(d[0], d[0]),
          new THREE.MeshBasicMaterial({ map:portTex, transparent:true, depthWrite:false, side:THREE.DoubleSide, fog:false, opacity:0.9 }));
        pm.position.set(0, 21.5, 0); G.add(pm);
        layers.push({ m:pm, sp:d[1] });
        pulsers.push({ mat:pm.material, base:0.78, amp:0.12 });
      });
      var glow = new THREE.Mesh(new THREE.CircleGeometry(15, 28),
        new THREE.MeshBasicMaterial({ color:0xff9ee8, transparent:true, opacity:0.28, depthWrite:false, fog:false }));
      glow.rotation.x = -Math.PI/2; glow.position.set(0, 0.12, -8); G.add(glow);
      portals.push({ layers:layers });
      return G;
    }
    function buildGateAny(gx, gy, gz, sc){
      if(art && art.arch && art.portal) return buildArtGate(gx, gy, gz, sc);
      var G = buildGate(gx, gy, gz); G.scale.set(sc, sc, sc); return G;
    }
    var gateG = buildGateAny(PX, H, SKY.gate.z + 30, 1);

    // 위쪽 천공 섬 (실제로 걸어 다니는 섬)
    var topRoot = new THREE.Group(); sky.add(topRoot);
    var topIsland = makeIsland(TOP.r, { grass:0x8fd37a });
    topIsland.position.set(TOP.x, TOP.y, TOP.z); topRoot.add(topIsland);
    scatterTrees(topIsland, 15, TOP.r, function(lx, lz){ return Math.hypot(lx, lz - 22) < 32 || Math.hypot(lx, lz + 14) < 15 || Math.hypot(lx, lz) < 10; }, true);
    addFall(topIsland, TOP.r, Math.max(12, TOP.y - SEA_Y + 8));
    var topPad = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 1.2, 28), brickMat(1.5, 1.5));
    topPad.position.set(TOP.x, TOP.y - 0.55, TOP.z - 14); topPad.receiveShadow = true; topRoot.add(topPad);
    [[-9, 0x66f2ff], [9, 0xff8fe0]].forEach(function(c){
      var cr = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), glowMat(c[1], 0.95));
      cr.scale.y = 1.5; cr.position.set(TOP.x + c[0], TOP.y + 3.5, TOP.z - 14); topRoot.add(cr);
      spinners.push({ m:cr, y:TOP.y + 3.5, ph:rnd()*6.28 });
    });
    var retG = buildGateAny(TOP.x, TOP.y, TOP.z + 22, 0.6);
    topRoot.add(retG);

    // 포털에 들어가면 하얀 빛이 번쩍하면서 이동해요
    var flash = document.createElement("div");
    flash.style.cssText = "position:fixed;inset:0;pointer-events:none;opacity:0;z-index:9999;background:radial-gradient(circle,#ffffff 0%,#d9fbff 45%,#ffd3f2 100%);";
    document.body.appendChild(flash);
    var telLock = 0;
    function teleport(p, x, z, y){
      var cs = state.cam;
      p.x = x; p.z = z; p.y = 0; p.vy = 0;
      SKY_REF = y;
      cs.fx = x; cs.fz = z; cs.fy = y; cs.yaw = 0; cs.target = 0; cs.turn = null; cs.yawVel = 0;
      three.camera.position.y = y + 16;
      flash.style.transition = "none"; flash.style.opacity = "1";
      setTimeout(function(){ flash.style.transition = "opacity .8s ease-out"; flash.style.opacity = "0"; }, 40);
    }
    window.skyTeleport = teleport;
    skyExtra = function(t, dt, p, skyH, tt){
      var i;
      for(i = 0; i < portals.length; i++){ var L = portals[i].layers; for(var k = 0; k < L.length; k++) L[k].m.rotation.z += dt*0.45*L[k].sp; }
      topRoot.visible = p.x > 560;
      var gx = SKY.gate.x, gz = SKY.gate.z + 30;
      var inUp  = Math.abs(p.x - gx) < 9 && Math.abs(p.z - gz) < 5 && skyH < TOP.y - 50;
      var inDn  = Math.abs(p.x - TOP.x) < 6 && Math.abs(p.z - (TOP.z + 22)) < 4 && skyH >= TOP.y - 1;
      var near  = (Math.abs(p.x - gx) < 16 && Math.abs(p.z - gz) < 12) || (Math.abs(p.x - TOP.x) < 12 && Math.abs(p.z - (TOP.z + 22)) < 10);
      if(!near) telLock = 0;
      if(telLock) return;
      if(inUp){ telLock = 1; teleport(p, TOP.x, TOP.z - 14, TOP.y); }
      else if(inDn){ telLock = 1; teleport(p, gx, gz - 14, H); }
    };
