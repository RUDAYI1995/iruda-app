    // ---------- 칠곡 농촌 마을 (서쪽 땅): 논, 비닐하우스, 시골집, 소품 ----------
    var villageExtra = null;
    (function buildVillage(){
      var V = new THREE.Group(); V.name = "village"; sky.add(V);
      var CP = V;
      var PADS = [];                                             // 벼논 한 칸씩 (위치, 푸른/황금)
      var CULL = [];                                             // 멀리 있는 물건은 안 그려서 빨라져요 (가까이 가면 다시 보여요)
      function reg(o, x, z, r){ CULL.push({ o:o, x:x, z:z, r:r }); }                                                // 지금 만드는 것을 담을 그룹 (구역마다 바뀌어요)
      var VA = art && art.village;
      var PTC = {};
      var EAVE = { h_g_front:.60, h_g_side:.62, h_g_back:.60, h_t_front:.60, h_t_side:.61, h_t_back:.61, h_s_front:.59, h_s_side:.58, h_s_back:.61, h_gs_front:.53, h_gs_side:.56, h_gs_back:.52, h_ts_front:.59, h_ts_side:.59, h_ts_back:.58, h_tb_front:.56, h_tb_side:.56, h_tb_back:.53, h_hr_front:.61, h_hr_side:.57, h_hr_back:.60, sl_blue:.58, t1:.62, t2:.59, tl_s:.52, t_med:.56, tl_m_side:.52, tl_m_back:.50, h_gl_front:.58, h_gl_side:.53, h_gl_back:.54, h_gb_side:.53, h_gb_back:.49, w_thatch:.66, w_blue:.73, wA_front:.75, wA_back:.76, wB_front:.77, wB_side:.68, wB_back:.74 };
      var TC = {};                                               // 같은 그림은 한 번만 읽어요 (구역이 많아져도 가벼워요)
      function baseTex(e){
        var b = TC[e.src]; if(b) return b;
        var im = new Image(); b = new THREE.Texture(im); b._clones = [];
        im.onload = function(){ b.needsUpdate = true; b._loaded = true; for(var i = 0; i < b._clones.length; i++) b._clones[i].needsUpdate = true; };
        im.src = e.src; if(THREE.SRGBColorSpace) b.colorSpace = THREE.SRGBColorSpace; return (TC[e.src] = b);
      }
      function cloneTex(e){ var b = baseTex(e), t = b.clone(); b._clones.push(t); if(b._loaded) t.needsUpdate = true; return t; }
      function vtex(e, rx, ry, mirror){
        if(!e) return null;
        var t = cloneTex(e);
        t.wrapS = t.wrapT = mirror ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping; t.repeat.set(rx, ry);
        t.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
        return t;
      }
      function lamb(name, rx, ry, col, mirror, extra){
        var t = VA ? vtex(VA.tiles[name], rx, ry, mirror) : null, o = { color:t ? 0xffffff : col, map:t };
        if(extra) for(var k in extra) o[k] = extra[k];
        return new THREE.MeshLambertMaterial(o);
      }
      // 넓힌 땅 (서쪽): 기존 땅 끝(x=-650)에서 같은 풀밭 무늬로 이어져요
      var ground = extGround(VIL.x1, -650, 0.1923); CP.add(ground);

      // 마을 흙길 (기존 맵 서쪽 끝에서 마을 안쪽까지)
      var RX0 = -620, RX1 = -1560, RL = RX0 - RX1;
      var road = new THREE.Mesh(new THREE.PlaneGeometry(RL, VIL.roadHalf*2), lamb("road", RL/22, 1, 0xc9ad84, true));
      road.rotation.x = -Math.PI/2; road.position.set((RX0 + RX1)/2, 0.05, VIL.roadZ); road.receiveShadow = true; CP.add(road);

      // 돌바닥 골목 (받은 돌길 그림을 이어 붙여요)
      (function(){
        var L = 480, tex = VA ? vtex(VA.tiles.a_road, L/43, 1, true) : null;
        var m = new THREE.Mesh(new THREE.PlaneGeometry(L, 17), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x9a9488, map:tex, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 }));
        m.rotation.x = -Math.PI/2; m.position.set(-640 - L/2, 0.07, VIL.roadZ); m.receiveShadow = true; CP.add(m);
      })();

      // 논: 농사 체험 상태에 따라 모양이 바뀌어요 (0 빈 논 / 1 모내기 직후 / 2 푸른 벼 / 3 황금 벼). 둑은 흙으로 살짝 올려요
      var rimM = new THREE.MeshLambertMaterial({ color:0x6d5236 }), fieldMeshes = [];
      var mudMat = new THREE.MeshLambertMaterial({ color:0x6b5842 });
      var wetMat = lamb("water", 4, 4, 0x3f6f7a, true, { emissive:0x0c2228 });
      var stageMat = [mudMat, lamb("field0", 3, 3, 0x7a6a50, true), lamb("field1", 3, 3, 0x4f9a3a, true), lamb("field2", 3, 3, 0xc2a53a, true)];
      var weedMeshes = [], weedGeo = new THREE.ConeGeometry(0.9, 3.2, 5), weedM = new THREE.MeshLambertMaterial({ color:0x6fd13a });
      VIL_FIELD_ROWS.forEach(function(rz, ri){ VIL_FIELD_COLS.forEach(function(cx, ci){
        var rim = new THREE.Mesh(new THREE.BoxGeometry(VIL_FIELD_W + 5, 0.5, VIL_FIELD_D + 5), rimM); rim.position.set(cx, 0.25, rz); rim.receiveShadow = true; CP.add(rim);
        var f = new THREE.Mesh(new THREE.PlaneGeometry(VIL_FIELD_W, VIL_FIELD_D), stageMat[0]);
        f.rotation.x = -Math.PI/2; f.position.set(cx, 0.52, rz); f.receiveShadow = true; CP.add(f); fieldMeshes.push(f);
        var wg = new THREE.Group(); for(var wi = 0; wi < 7; wi++){ var wm = new THREE.Mesh(weedGeo, weedM); wm.position.set((wi - 3)*8 + (wi % 2)*2, 2, (wi % 3 - 1)*22); wg.add(wm); }
        wg.position.set(cx, 0.6, rz); wg.visible = false; CP.add(wg); weedMeshes.push(wg);
      }); });
      var lastStages = [], ghCrops = [];
      function refreshFields(){
        for(var i = 0; i < fieldMeshes.length; i++){
          var st = vilFieldStage(i), fl = VIL_FARM.fields[i], key = st + (st === 0 && fl.wet ? 10 : 0);
          if(lastStages[i] !== key){ lastStages[i] = key; fieldMeshes[i].material = (st === 0 && fl.wet) ? wetMat : stageMat[st]; }
          weedMeshes[i].visible = vilWeedNow(i);
        }
        for(i = 0; i < ghCrops.length; i++){ var c = VIL_GH_CROPS[i], rd = vilGHReady(c); if(ghCrops[i].fruit.visible !== rd) ghCrops[i].fruit.visible = rd; }
      }
      // 화면 구석에 보이는 농사 현황
      var badge = document.createElement("div");
      badge.style.cssText = "position:fixed;top:10px;right:12px;z-index:50;background:rgba(40,30,20,.72);color:#fff3d0;padding:6px 12px;border-radius:14px;font:600 14px sans-serif;display:none;pointer-events:none;";
      document.body.appendChild(badge);
      window.villageRefresh = function(){ refreshFields(); badge.textContent = "🌾 벼 " + VIL_FARM.rice + " · 🍚 쌀 " + VIL_FARM.bags + " · 🍈 " + VIL_FARM.melon + " · 🍓 " + VIL_FARM.straw + (VIL_FARM.sickle ? " · 🔪 낫" : "") + (VIL_FARM.stamped ? " · 🏅" : ""); };
      window.villageRefresh();

      var vShTex = canvasTex(64, 64, function(g, w, h){ var gr = g.createRadialGradient(w/2, h/2, 2, w/2, h/2, w/2); gr.addColorStop(0, "rgba(0,0,0,0.9)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      // =================== 고정된 3D 소품 (카메라를 따라 돌지 않고, 두께와 무게가 있어요) ===================
      var MCACHE = {};
      function LM(c, o){ var k = c + (o ? JSON.stringify(o) : ""); if(!MCACHE[k]){ var oo = { color:c }; if(o) for(var q in o) oo[q] = o[q]; MCACHE[k] = new THREE.MeshLambertMaterial(oo); } return MCACHE[k]; }
      function hh(x, z){ var v = Math.sin(x*12.9898 + z*78.233)*43758.5453; return v - Math.floor(v); }
      function finishSolid(g, x, z, r, blobW){
        g.position.set(x, 0, z); CP.add(g); reg(g, x, z, r || 700);
        if(blobW){ var sh = new THREE.Mesh(new THREE.PlaneGeometry(blobW, blobW*0.8), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.42, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.set(x + 0.8, 0.09, z + 0.5); CP.add(sh); reg(sh, x, z, r || 700); }
        return g;
      }
      function addCyl(g, rt, rb, h, seg, mat, px, py, pz, rx, rz){ var m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(px, py, pz); if(rx) m.rotation.x = rx; if(rz) m.rotation.z = rz; m.castShadow = true; g.add(m); return m; }
      function addBox(g, w, h, d, mat, px, py, pz, ry){ var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(px, py, pz); if(ry) m.rotation.y = ry; m.castShadow = true; g.add(m); return m; }
      var SOLID = {};
      // 장독대: 돌 받침 위에 둥글고 두툼한 항아리들
      var potProfile = [[0.001, 0], [0.42, 0], [0.58, 0.06], [0.74, 0.28], [0.8, 0.5], [0.7, 0.75], [0.5, 0.9], [0.46, 0.96], [0.56, 1.0], [0.56, 1.05]];
      function potGeo(){ if(!SOLID._pg){ var pts = potProfile.map(function(p){ return new THREE.Vector2(p[0], p[1]); }); SOLID._pg = new THREE.LatheGeometry(pts, 16); } return SOLID._pg; }
      SOLID.jars = function(x, z, h){
        var g = new THREE.Group(), s = h*0.5, base = LM(0x8c8473), n = 5 + Math.floor(hh(x, z)*2);
        addBox(g, h*1.7, 0.5, h*1.35, base, 0, 0.25, 0); addBox(g, h*1.5, 0.45, h*1.15, LM(0x9a927f), 0, 0.7, 0);
        var spots = [[-0.5, -0.25, 1.0], [0.4, -0.3, 1.12], [-0.1, 0.25, 0.8], [0.62, 0.22, 0.7], [-0.62, 0.3, 0.62], [0.05, -0.55, 0.55]];
        for(var i = 0; i < n; i++){ var sp = spots[i], hs = h*0.5*sp[2], pm = new THREE.Mesh(potGeo(), LM(0x4a2a1a, { emissive:0x241108 })); pm.scale.set(hs*0.72, hs, hs*0.72); pm.position.set(sp[0]*h*0.9, 0.92, sp[1]*h*0.7); pm.castShadow = true; g.add(pm); }
        g.rotation.y = hh(z, x)*6.28; VIL_RECTS.push({ x:x, z:z, hx:h*0.8, hz:h*0.7 }); return finishSolid(g, x, z, 700, h*1.8);
      };
      // 장작 더미
      SOLID.firewood = function(x, z, h){
        var g = new THREE.Group(), r = h*0.1, L = h*0.9, bark = LM(0x6b4a32), cap = LM(0xc9a06a), cm = [bark, cap, cap], rows = [5, 4, 3, 2];
        if(!SOLID._lg) SOLID._lg = new THREE.CylinderGeometry(r, r, L, 8);
        rows.forEach(function(nn, ri){ for(var i = 0; i < nn; i++){ var m = new THREE.Mesh(SOLID._lg, cm); m.rotation.x = Math.PI/2; m.position.set((i - (nn - 1)/2)*r*2.05, r + ri*r*1.8, 0); m.rotation.z = (hh(i + x, ri) - 0.5)*0.08; m.castShadow = true; g.add(m); } });
        addBox(g, r*2.4, h*0.04, L*0.9, LM(0x4a3524), -r*5.4, h*0.02, 0);
        g.rotation.y = (hh(x, z) < 0.5 ? 0 : Math.PI/2) + (hh(z, x) - 0.5)*0.4; VIL_RECTS.push({ x:x, z:z, hx:h*0.55, hz:h*0.55 }); return finishSolid(g, x, z, 700, h*1.5);
      };
      // 호박밭: 주름진 호박과 넓은 잎
      SOLID.pumpkin = function(x, z, h){
        var g = new THREE.Group(), sg = SOLID._sg;
        if(!sg){ sg = new THREE.SphereGeometry(1, 14, 9); var ps = sg.attributes.position; for(var i = 0; i < ps.count; i++){ var px = ps.getX(i), pz = ps.getZ(i), a = Math.atan2(pz, px), k = 1 + 0.08*Math.cos(a*9); ps.setX(i, px*k); ps.setZ(i, pz*k); } sg.computeVertexNormals(); SOLID._sg = sg; SOLID._lf = new THREE.CircleGeometry(1, 7); }
        var pk = LM(0xdc7418), pk2 = LM(0xc4600f), leaf = LM(0x4a8a2c, { side:THREE.DoubleSide }), leaf2 = LM(0x3a6f22, { side:THREE.DoubleSide });
        for(var q = 0; q < 8; q++){ var lm = new THREE.Mesh(SOLID._lf, q % 2 ? leaf : leaf2), a2 = hh(x + q, z)*6.28, rr = 1.2 + hh(z, q)*h*1.7; lm.rotation.x = -Math.PI/2; lm.rotation.z = a2; lm.scale.set(h*0.5, h*0.42, 1); lm.position.set(Math.cos(a2)*rr, 0.18 + q*0.012, Math.sin(a2)*rr); g.add(lm); }
        for(q = 0; q < 4; q++){ var pm = new THREE.Mesh(sg, q % 2 ? pk : pk2), rr2 = 0.7 + q*0.42, a3 = q*1.7 + hh(x, z)*3, rs = h*0.34*(0.85 + hh(q, x)*0.35); pm.scale.set(rs, rs*0.68, rs); pm.position.set(Math.cos(a3)*rr2*h*0.45, rs*0.7, Math.sin(a3)*rr2*h*0.45); pm.castShadow = true; g.add(pm); addBox(g, 0.28, 0.5, 0.28, LM(0x5a6b2a), pm.position.x, rs*1.35, pm.position.z); }
        return finishSolid(g, x, z, 600, h*2.4);
      };
      // 전봇대
      SOLID.pole = function(x, z, h){
        var g = new THREE.Group(), wood = LM(0x6a5a46), ins = LM(0xe6e1d4);
        addCyl(g, h*0.018, h*0.026, h, 8, wood, 0, h/2, 0);
        addBox(g, h*0.24, 0.5, 0.55, wood, 0, h*0.9, 0); addBox(g, h*0.17, 0.45, 0.5, wood, 0, h*0.78, 0);
        [-0.1, 0, 0.1].forEach(function(o){ addCyl(g, 0.22, 0.3, 0.9, 6, ins, o*h, h*0.9 + 0.7, 0); });
        [-0.07, 0.07].forEach(function(o){ addCyl(g, 0.2, 0.28, 0.8, 6, ins, o*h, h*0.78 + 0.6, 0); });
        addBox(g, 1.6, 2.2, 1.4, LM(0x555a5c), 0.8, h*0.66, 0);
        g.rotation.y = hh(x, z)*3.14; return finishSolid(g, x, z, 1200, 0);
      };
      // 팻말: 나무 기둥 두 개 + 두툼한 판 (양면에 그림)
      function signBoard(key, x, z, h){
        var e = VA.props[key]; if(!e) return null; var bh = h*0.72, w = bh*e.w/e.h*1.15, g = new THREE.Group(), post = LM(0x5b4630), t = baseTex(e);
        var face = new THREE.MeshLambertMaterial({ map:t, transparent:true, alphaTest:0.4 }), edge = LM(0x6b5238);
        [-1, 1].forEach(function(sd){ addBox(g, 0.7, h, 0.7, post, sd*w*0.42, h/2, 0); });
        var bd = new THREE.Mesh(new THREE.BoxGeometry(w, bh, 0.6), [edge, edge, edge, edge, face, face]); bd.position.set(0, h*0.7, 0); bd.castShadow = true; g.add(bd);
        g.rotation.y = Math.PI + (hh(x, z) - 0.5)*0.3; VIL_RECTS.push({ x:x, z:z, hx:w*0.5, hz:1.2 }); return finishSolid(g, x, z, 800, w*0.9);
      }
      SOLID.f_fsign = function(x, z, h){ return signBoard("f_fsign", x, z, h); }; SOLID.p_sign = SOLID.f_fsign; SOLID.p_bus = function(x, z, h){ return signBoard("p_bus", x, z, h); };
      // 볏짚 더미: 두툼한 둥근 더미
      SOLID.f_straw = function(x, z, h){
        var g = new THREE.Group(), t = VA ? vtex(VA.tiles.r_thatch, 2, 2, true) : null, mat = new THREE.MeshLambertMaterial({ color:0xe0c168, map:t });
        var pts = [[0.001, 1.0], [0.18, 0.96], [0.42, 0.8], [0.62, 0.5], [0.7, 0.2], [0.72, 0]].map(function(p){ return new THREE.Vector2(p[0], p[1]); });
        var m = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), mat); m.scale.set(h*0.8, h, h*0.8); m.castShadow = true; g.add(m); addCyl(g, 0.15, 0.15, h*1.15, 5, LM(0x6a5230), 0, h*0.55, 0);
        VIL_RECTS.push({ x:x, z:z, hx:h*0.55, hz:h*0.55 }); return finishSolid(g, x, z, 800, h*1.8);
      };
      // 펌프
      SOLID.f_pump = function(x, z, h){
        var g = new THREE.Group(), iron = LM(0x3d4145), stone = LM(0x8c8473);
        addBox(g, h*0.5, h*0.12, h*0.5, stone, 0, h*0.06, 0); addCyl(g, h*0.06, h*0.07, h*0.72, 8, iron, 0, h*0.46, 0); addBox(g, h*0.18, h*0.14, h*0.12, iron, 0, h*0.86, 0);
        addBox(g, h*0.6, h*0.05, h*0.05, iron, h*0.22, h*0.94, 0).rotation.z = 0.25; addCyl(g, h*0.035, h*0.035, h*0.28, 6, iron, -h*0.16, h*0.55, 0, 0, 1.2);
        addCyl(g, h*0.14, h*0.12, h*0.18, 10, LM(0x4a7aa8), -h*0.3, h*0.09, h*0.1);
        VIL_RECTS.push({ x:x, z:z, hx:h*0.3, hz:h*0.3 }); return finishSolid(g, x, z, 700, h*0.9);
      };
      // 허수아비
      SOLID.f_scarecrow = function(x, z, h){
        var g = new THREE.Group(), wood = LM(0x6a4c30), straw = LM(0xd9b66a);
        addCyl(g, 0.3, 0.38, h, 6, wood, 0, h/2, 0); addBox(g, h*0.8, 0.4, 0.4, wood, 0, h*0.74, 0);
        addBox(g, h*0.3, h*0.34, h*0.16, LM(0x8a6a4a), 0, h*0.66, 0.1); addBox(g, h*0.34, h*0.1, h*0.17, LM(0x4a6a8a), 0, h*0.56, 0.1);
        var hd = new THREE.Mesh(new THREE.SphereGeometry(h*0.1, 10, 8), straw); hd.position.set(0, h*0.9, 0.1); g.add(hd);
        addCyl(g, h*0.02, h*0.17, h*0.12, 10, LM(0x9a7a3a), 0, h*1.0, 0.1); addCyl(g, h*0.17, h*0.17, 0.12, 12, LM(0x9a7a3a), 0, h*0.95, 0.1);
        [-1, 1].forEach(function(sd){ addCyl(g, 0.12, 0.2, h*0.2, 5, straw, sd*h*0.42, h*0.68, 0.1, 0, 0.4*sd); });
        g.rotation.y = (hh(x, z) - 0.5)*0.8 + Math.PI; VIL_RECTS.push({ x:x, z:z, hx:1.2, hz:1.2 }); return finishSolid(g, x, z, 800, h*0.5);
      };
      // 평상 / 탁자와 걸상
      SOLID.table = function(x, z, h){
        var g = new THREE.Group(), met = LM(0x7d858b);
        addBox(g, h*1.1, 0.45, h*1.1, met, 0, h*0.55, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(s){ addBox(g, 0.35, h*0.55, 0.35, LM(0x7f858a), s[0]*h*0.46, h*0.27, s[1]*h*0.46); });
        [[1.0, 0.3], [-0.9, -0.5]].forEach(function(o){ addCyl(g, h*0.2, h*0.24, h*0.4, 10, LM(0x6f777d), o[0]*h*0.85, h*0.2, o[1]*h*0.85); });
        g.rotation.y = hh(x, z)*3; VIL_RECTS.push({ x:x, z:z, hx:h*0.9, hz:h*0.9 }); return finishSolid(g, x, z, 700, h*2);
      };
      // 터널 하우스: 반원 비닐 + 뼈대 + 흙 이랑
      SOLID.tunnel = function(x, z, h){
        var g = new THREE.Group(), r = h*0.5, len = h*1.6, vin = new THREE.MeshLambertMaterial({ color:0xdcefea, transparent:true, opacity:0.55, side:THREE.DoubleSide, depthWrite:false });
        var sk = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 14, 1, true, 0, Math.PI), vin); sk.rotation.z = Math.PI/2; sk.rotation.y = Math.PI/2; g.add(sk);
        sk.rotation.set(0, 0, 0); sk.rotation.x = 0; sk.rotation.z = Math.PI/2; sk.position.y = 0;
        var arch = LM(0xb9c0c4); for(var i = 0; i < 5; i++){ var rb = new THREE.Mesh(new THREE.TorusGeometry(r, 0.14, 5, 14, Math.PI), arch); rb.rotation.y = Math.PI/2; rb.position.x = (i - 2)*len/4; g.add(rb); }
        addBox(g, len, 0.3, r*2, LM(0x5a4030), 0, 0.15, 0); addBox(g, len, 0.12, 0.12, arch, 0, r, 0);
        for(i = 0; i < 6; i++) addBox(g, 0.9, 0.7, 0.7, LM(0x4f8a2e), (i - 2.5)*len/6, 0.6, (i % 2 ? 1 : -1)*r*0.35);
        VIL_RECTS.push({ x:x, z:z, hx:len*0.55, hz:r }); g.rotation.y = (hh(x, z) < 0.5 ? 0 : Math.PI/2) * 0 ; return finishSolid(g, x, z, 700, h*1.6);
      };
      // 빨랫줄
      SOLID.line = function(x, z, h){
        var g = new THREE.Group(), w = h*1.2, wood = LM(0x6a4c30);
        [-1, 1].forEach(function(sd){ addCyl(g, 0.22, 0.28, h, 6, wood, sd*w/2, h/2, 0); });
        addBox(g, w, 0.08, 0.08, LM(0xcfcfcf), 0, h*0.92, 0);
        [[0x4a76a8, 1.6, 2.4, -0.38], [0xf0ece0, 1.2, 1.7, -0.12], [0xc9876a, 0.7, 0.9, 0.1], [0xe4dccb, 1.7, 2.0, 0.34]].forEach(function(c){ var m = new THREE.Mesh(new THREE.PlaneGeometry(c[1], c[2]), LM(c[0], { side:THREE.DoubleSide })); m.position.set(c[3]*w, h*0.92 - c[2]/2, 0); m.rotation.y = 0.12; g.add(m); });
        g.rotation.y = hh(x, z)*0.5; VIL_RECTS.push({ x:x, z:z, hx:0.8, hz:0.8 }); return finishSolid(g, x, z, 700, 0);
      };
      // 정자
      SOLID.gazebo = function(x, z, h){
        var g = new THREE.Group(), s = h*0.8, wood = LM(0x6a4a2c), rt = VA ? vtex(VA.tiles.r_gaw, 4, 2, true) : null;
        addBox(g, s*2.1, 0.7, s*2.1, LM(0x8c8473), 0, 0.35, 0); addBox(g, s*1.9, 0.5, s*1.9, LM(0x9a7a50), 0, 0.95, 0);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(c){ addCyl(g, 0.45, 0.5, h*0.62, 8, wood, c[0]*s*0.82, 1.2 + h*0.31, c[1]*s*0.82); });
        [[0, 1], [0, -1]].forEach(function(c){ addBox(g, s*1.75, 0.5, 0.5, wood, 0, 1.2 + h*0.6, c[1]*s*0.82); addBox(g, 0.5, 0.5, s*1.75, wood, c[1]*s*0.82, 1.2 + h*0.6, 0); });
        var rg = new THREE.CylinderGeometry(s*0.18, s*1.55, h*0.42, 4, 1); rg.rotateY(Math.PI/4); var rf = new THREE.Mesh(rg, new THREE.MeshLambertMaterial({ color:rt ? 0xffffff : 0x4a4a52, map:rt })); rf.position.y = 1.2 + h*0.62 + h*0.2; rf.castShadow = true; g.add(rf);
        addBox(g, s*1.7, 0.3, s*1.7, LM(0x5a3a22), 0, 1.2 + h*0.6 + 0.3, 0);
        VIL_RECTS.push({ x:x, z:z, hx:s*1.0, hz:s*1.0 }); return finishSolid(g, x, z, 900, s*2.6);
      };
      // 평상
      SOLID.pyeongsang = function(x, z, h){
        var g = new THREE.Group(), wood = LM(0xa48458), dk = LM(0x6a4c30);
        addBox(g, h*2.2, 0.6, h*1.4, wood, 0, h*0.55, 0); for(var i = 0; i < 5; i++) addBox(g, h*2.2, 0.1, 0.12, dk, 0, h*0.55 + 0.32, (i - 2)*h*0.28);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(s2){ addBox(g, 0.6, h*0.55, 0.6, dk, s2[0]*h*0.95, h*0.27, s2[1]*h*0.58); });
        g.rotation.y = (hh(x, z) < 0.5 ? 0 : Math.PI/2); VIL_RECTS.push({ x:x, z:z, hx:h*1.1, hz:h*0.7 }); return finishSolid(g, x, z, 700, h*2.4);
      };
      // 가게(작은 건물): 그림을 네 면에 두른 두툼한 상자
      SOLID.shop = function(x, z, h){
        var e = VA.props.f_shop; if(!e) return null; var g = new THREE.Group(), W = h*e.w/e.h, D = W*0.7, t = baseTex(e);
        var pm = function(){ return new THREE.MeshLambertMaterial({ map:t, transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xece6dc }); };
        addBox(g, W*0.84, h*0.5, D*0.84, LM(0x8a7a62), 0, h*0.25, 0);
        var rg = new THREE.CylinderGeometry(W*0.22, W*0.72, h*0.4, 4, 1); rg.rotateY(Math.PI/4); var rf = new THREE.Mesh(rg, LM(0x5a5048)); rf.scale.set(1, 1, D/W); rf.position.y = h*0.5 + h*0.18; g.add(rf);
        [[0, D*0.43, 0, false], [0, -D*0.43, Math.PI, true], [-W*0.43, 0, -Math.PI/2, false], [W*0.43, 0, Math.PI/2, true]].forEach(function(p){ var m = new THREE.Mesh(new THREE.PlaneGeometry(p[2] === 0 || p[2] === Math.PI ? W : D*1.0, h), pm()); m.position.set(p[0], h/2, p[1]); m.rotation.y = p[2]; if(p[3]) m.scale.x = -1; g.add(m); });
        g.rotation.y = Math.PI; VIL_RECTS.push({ x:x, z:z, hx:W*0.45, hz:D*0.45 }); return finishSolid(g, x, z, 900, W*1.1);
      };
      // 돌 / 우체통
      SOLID.stone = function(x, z, h){ var g = new THREE.Group(), m = new THREE.Mesh(new THREE.DodecahedronGeometry(h*0.5, 0), LM(0x8d8a80)); m.scale.set(1.2, 0.8, 1); m.position.y = h*0.3; m.rotation.y = hh(x, z)*3; m.castShadow = true; g.add(m); VIL_RECTS.push({ x:x, z:z, hx:h*0.55, hz:h*0.5 }); return finishSolid(g, x, z, 600, h*1.4); };
      SOLID.mailbox = function(x, z, h){ var g = new THREE.Group(); addCyl(g, 0.25, 0.3, h*0.7, 6, LM(0x5b4630), 0, h*0.35, 0); addBox(g, h*0.45, h*0.3, h*0.3, LM(0xb03a2e), 0, h*0.8, 0); VIL_RECTS.push({ x:x, z:z, hx:1, hz:1 }); return finishSolid(g, x, z, 600, 0); };
      // 풀, 꽃, 나무, 텃밭 작물: 두 장~세 장을 엇갈려 꽂아 입체로 (고정, 카메라를 따라 돌지 않아요)
      function crossCard(key, x, z, h, nPlanes, soil){
        var e = VA.props[key]; if(!e) return null; var w = h*e.w/e.h, g = new THREE.Group(), t = baseTex(e), r0 = hh(x, z)*3.14;
        var mat = new THREE.MeshLambertMaterial({ map:t, transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xf2f2ec });
        for(var i = 0; i < nPlanes; i++){ var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.y = h*0.5; m.rotation.y = r0 + i*Math.PI/nPlanes; g.add(m); }
        if(soil){ var sm = new THREE.Mesh(new THREE.CircleGeometry(w*0.42, 10), LM(0x4a3524)); sm.rotation.x = -Math.PI/2; sm.position.y = 0.06; g.add(sm); }
        return finishSolid(g, x, z, key === "persimmon" || key === "apple" ? 900 : 480, w*0.8);
      }
      SOLID.well = function(x, z, h){ wellAt(x, z); return null; };
      var PLANT = { p_bush0:3, p_bush1:3, p_bush2:3, p_cosmos:3, p_sunflower:3, p_wild0:3, p_wild1:3, p_wild2:3, p_wild3:3, p_wild4:3, y_wild:3, y_sunflower:3, y_veg:3, y_leaf:3, y_treefront:3, y_treeside:3, persimmon:3, apple:3, q_cabbage:3, q_lettuce:3, q_pepper:3, q_onion:3, sheaf:3, lily:2 };
      var SOLID_KEY = { y_jars:"jars", f_jaryard:"jars", q_jars:"jars", p_jangdok:"jars", y_firewood:"firewood", p_firewood:"firewood", y_pumpkin:"pumpkin", q_pole:"pole", pole:"pole", f_fsign:"f_fsign", p_sign:"f_fsign", p_bus:"p_bus", f_straw:"f_straw", f_pump:"f_pump", f_scarecrow:"f_scarecrow", q_table:"table", q_tunnel:"tunnel", q_line:"line", p_laundry:"line", f_gazebo:"gazebo", pavilion:"gazebo", p_pyeongsang:"pyeongsang", pyeongsang:"pyeongsang", f_shop:"shop", f_well:"well", p_stone:"stone", p_mailbox:"mailbox" };
      function fixedFlat(key, x, z, h, yaw){                           // 한 장 그림을 바닥이나 세워서 고정해요 (자전거, 경운기, 이랑)
        var e = VA.props[key]; if(!e) return null; var w = h*e.w/e.h, g = new THREE.Group(), mat = new THREE.MeshLambertMaterial({ map:baseTex(e), transparent:true, alphaTest:0.4, side:THREE.DoubleSide, color:0xf0f0ea });
        [0, 0.7].forEach(function(o){ var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(0, h*0.5, o - 0.35); g.add(m); });
        g.rotation.y = yaw || 0; VIL_RECTS.push({ x:x, z:z, hx:w*0.4, hz:1.5 }); return finishSolid(g, x, z, 600, w*0.8);
      }
      function furrowFlat(key, x, z, h){ var e = VA.props[key]; if(!e) return null; var w = h*e.w/e.h*1.2, m = new THREE.Mesh(new THREE.PlaneGeometry(w, w*e.h/e.w), new THREE.MeshLambertMaterial({ map:baseTex(e), transparent:true, alphaTest:0.4, side:THREE.DoubleSide })); m.rotation.x = -Math.PI/2; m.position.set(x, 0.14, z); CP.add(m); reg(m, x, z, 600); return m; }
      function dispatch(key, x, z, h){
        if(!VA) return false;
        var sk = SOLID_KEY[key];
        if(sk && SOLID[sk]){ SOLID[sk](x, z, h); return true; }
        if(PLANT[key]){ crossCard(key, x, z, h, PLANT[key], false); return true; }
        if(key === "q_furrow"){ furrowFlat(key, x, z, h); return true; }
        if(key === "y_bicycle" || key === "q_bike" || key === "tiller" || key === "q_tiller" || key === "q_dish"){ fixedFlat(key, x, z, h, hh(x, z) < 0.5 ? 0 : Math.PI); return true; }
        return false;
      }

      // 그림 카드 소품 (카메라를 향해 서 있어요)
      function card(key, x, z, h){
        if(!VA || !VA.props[key]) return;
        if(dispatch(key, x, z, h)) return;
        var e = VA.props[key], w = h*e.w/e.h;
        var t = baseTex(e);
        var piv = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map:t, transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
        m.position.y = h*0.465; piv.add(m); piv.position.set(x, 0.1, z); CP.add(piv); facers.push(piv); reg(piv, x, z, 480);
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(w*0.8, w*0.35), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.45, depthWrite:false }));
        sh.rotation.x = -Math.PI/2; sh.position.set(x + 1, 0.09, z + 0.5); CP.add(sh);
      }
      // 시골집 (진짜 3D: 돌아가면 뒤와 옆이 나와요)
      function house(kind, x, z, faceNorth){
        var g = new THREE.Group(), W = kind === "slate" ? 17 : 18, D = 12, H = 5.6, rise = kind === "thatch" ? 5.6 : 4.4, ov = kind === "thatch" ? 2.2 : 1.8;
        var wallName = kind === "thatch" ? "wall_clay" : (kind === "slate" ? "wall_wood" : "wall_plaster");
        var body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), lamb(wallName, W/9, H/9, 0xcdbfae)); body.position.y = H/2; body.castShadow = true; body.receiveShadow = true; g.add(body);
        var roofName = kind === "thatch" ? "roof_thatch" : (kind === "slate" ? "roof_slate" : "roof_gaw");
        var run = D/2 + ov, Ls = Math.sqrt(run*run + rise*rise), ang = Math.atan2(rise, run), RW = W + 2*ov;
        for(var sd = -1; sd <= 1; sd += 2){
          var rf = new THREE.Mesh(new THREE.BoxGeometry(RW, 0.6, Ls), lamb(roofName, RW/10, Ls/6, 0x4a4a52, false));
          rf.position.set(0, H + rise/2 + 0.05, sd*run/2); rf.rotation.x = sd*ang; rf.castShadow = true; rf.receiveShadow = true; g.add(rf);
        }
        var gs = new THREE.Shape(); gs.moveTo(-D/2, 0); gs.lineTo(D/2, 0); gs.lineTo(0, rise); gs.lineTo(-D/2, 0);
        for(sd = -1; sd <= 1; sd += 2){ var gb = new THREE.Mesh(new THREE.ShapeGeometry(gs), lamb(wallName, 1, 1, 0xcdbfae)); gb.rotation.y = Math.PI/2*sd; gb.position.set(sd*(W/2 + 0.02), H, 0); g.add(gb); }
        var woodM = new THREE.MeshLambertMaterial({ color:0x6b4a32 }), paper = new THREE.MeshLambertMaterial({ color:0xf0e3c6, emissive:0x2a2418 }); (window.villageWin = window.villageWin || []).push(paper);
        var door = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.2, 0.3), woodM); door.position.set(-W/4, 2.1, D/2 + 0.12); g.add(door);
        [W/6, W/2.9].forEach(function(wx){ var wd = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.6, 0.3), paper); wd.position.set(wx, 3.0, D/2 + 0.12); g.add(wd); var fr = new THREE.Mesh(new THREE.BoxGeometry(3.7, 2.9, 0.2), woodM); fr.position.set(wx, 3.0, D/2 + 0.05); g.add(fr); });
        var step = new THREE.Mesh(new THREE.BoxGeometry(W*0.7, 0.8, 2.2), new THREE.MeshLambertMaterial({ color:0x8a7d70 })); step.position.set(0, 0.4, D/2 + 1.2); step.receiveShadow = true; g.add(step);
        g.scale.set(1.8, 1.8, 1.8); g.position.set(x, 0, z); g.rotation.y = faceNorth ? Math.PI : 0; CP.add(g); return g;
      }
      houseArt("gaw", -790, 300, true); houseArt("thatch", -870, 200, false); houseArt("slate", -950, 300, true); houseArt("gaw", -1030, 200, false);

      // 시골집 (받은 앞, 옆, 뒤 그림을 4면에 세우고, 위에는 기와/초가/슬레이트 질감의 지붕을 얹어요. 돌아가면 뒷면이 나와요)
      function pTex(e){ if(PTC[e.src]) return PTC[e.src]; var t = cloneTex(e); t.anisotropy = 4; return (PTC[e.src] = t); }
      // 사방으로 모인 지붕 집: 벽은 그림의 처마 아랫부분만, 지붕은 그림의 지붕 부분을 지붕 면에 그대로 입혀서 위에서 봐도 벽과 자연스럽게 이어져요
      function eaveOf(k){ return EAVE[k] || 0.58; }
      function faceGeo(pts, uvs, tris){
        var g = new THREE.BufferGeometry(), pa = [], ua = [], i; for(i = 0; i < pts.length; i++){ pa.push(pts[i][0], pts[i][1], pts[i][2]); ua.push(uvs[i][0], uvs[i][1]); }
        g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(ua, 2)); g.setIndex(tris); g.computeVertexNormals(); return g;
      }
      function compoundTop(g, W, D, Hf){
            var ch = Hf*0.34, cc = new THREE.Mesh(new THREE.BoxGeometry(W*0.9, ch, D*0.9), new THREE.MeshLambertMaterial({ color:0x7c7468 })); cc.position.y = ch/2; cc.castShadow = true; cc.receiveShadow = true; g.add(cc);
          var cyt = VA ? vtex(VA.tiles.t_yard, 3, 2, true) : null, cy = new THREE.Mesh(new THREE.PlaneGeometry(W*0.84, D*0.84), new THREE.MeshLambertMaterial({ color:0xffffff, map:cyt })); cy.rotation.x = -Math.PI/2; cy.position.y = ch + 0.06; g.add(cy);
          var crt = VA ? vtex(VA.tiles.r_gaw, 7, 3, true) : null, crg = new THREE.CylinderGeometry(W*0.06, W*0.27, Hf*0.3, 4, 1); crg.rotateY(Math.PI/4);
          var crm = new THREE.Mesh(crg, new THREE.MeshLambertMaterial({ color:0xffffff, map:crt })); crm.scale.set(1.0, 1, 0.62); crm.position.set(0, ch + Hf*0.15 - 0.1, -D*0.1); crm.castShadow = true; g.add(crm);
      }
      function hipBody(g, o){
        var P = VA.props, f = P[o.fk], s = P[o.sk], b = P[o.bk]; if(!f || !s || !b) return false;
        var W = o.W, D = o.D, Hf = o.Hf, ef = eaveOf(o.fk), es = eaveOf(o.sk), eb = eaveOf(o.bk), he = Hf*ef, hx = W/2, hz = D/2, r = Math.max(hx - hz*0.95, hx*0.2), wx = hx*0.88, wz = hz*0.88, tr = r/(2*hx);
        function mat(e){ return new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da }); }
        // 벽: 그림의 아랫부분(처마 아래)만
        function wallPlane(e, w, ev, px, pz, ry, mirror){
          var gm = new THREE.PlaneGeometry(w, he), ua = gm.attributes.uv; for(var i = 0; i < ua.count; i++){ var uu = ua.getX(i), vv = ua.getY(i); ua.setXY(i, mirror ? 0.94 - 0.88*uu : 0.06 + 0.88*uu, ev*vv); }
          var m = new THREE.Mesh(gm, mat(e)); m.position.set(px, he/2, pz); m.rotation.y = ry; g.add(m);
        }
        wallPlane(f, 2*wx, ef, 0, wz, 0, false); wallPlane(b, 2*wx, eb, 0, -wz, Math.PI, false);
        wallPlane(s, 2*wz, es, -wx, 0, -Math.PI/2, false); wallPlane(s, 2*wz, es, wx, 0, Math.PI/2, true);
        // 속 덩어리 (벽 + 지붕 속)
        var core = new THREE.Mesh(new THREE.BoxGeometry(2*wx*0.97, he, 2*wz*0.97), new THREE.MeshLambertMaterial({ color:o.wallCol || 0xa89a80 })); core.position.y = he/2; core.castShadow = true; core.receiveShadow = true; g.add(core);
        var A = [-hx, he, hz], B = [hx, he, hz], C = [hx, he, -hz], Dd = [-hx, he, -hz], R1 = [r, Hf, 0], R0 = [-r, Hf, 0];
        function fill(k){ var shr = function(p){ return [p[0]*k, p[1] - 0.25, p[2]*k]; };
          var gm = new THREE.BufferGeometry(), pts = [A, B, R1, R0, C, Dd, R0, R1, Dd, A, R0, B, C, R1].map(shr), pa = []; pts.forEach(function(p){ pa.push(p[0], p[1], p[2]); });
          gm.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3)); gm.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13]); gm.computeVertexNormals();
          var m = new THREE.Mesh(gm, new THREE.MeshLambertMaterial({ color:o.roofCol || 0x66625a, side:THREE.DoubleSide })); m.castShadow = true; g.add(m); }
        fill(0.985);
        // 지붕 네 면: 그림의 지붕 부분(v 가 e~1)을 면 모양대로 입혀요
        function roofFace(e, ev, pts, uvs, tris){ var m = new THREE.Mesh(faceGeo(pts, uvs, tris), mat(e)); m.castShadow = true; g.add(m); }
        roofFace(f, ef, [A, B, R1, R0], [[0, ef], [1, ef], [0.5 + tr, 1], [0.5 - tr, 1]], [0, 1, 2, 0, 2, 3]);                    // 앞
        roofFace(b, eb, [C, Dd, R0, R1], [[0, eb], [1, eb], [0.5 + tr, 1], [0.5 - tr, 1]], [0, 1, 2, 0, 2, 3]);                    // 뒤 (뒤에서 보면 오른쪽이 -x)
        roofFace(s, es, [Dd, A, R0], [[0, es], [1, es], [0.5, 1]], [0, 1, 2]);                                                       // 왼쪽 (왼쪽에서 보면 오른쪽이 +z)
        roofFace(s, es, [B, C, R1], [[1, es], [0, es], [0.5, 1]], [0, 1, 2]);                                                        // 오른쪽 (같은 옆면 그림을 뒤집어서)
        return true;
      }

      function houseArt(kind, x, z, faceNorth, sc){
        var HP = { gaw:"h_g_", thatch:"h_t_", slate:"h_s_", gaw_l:"h_gl_", gaw_big:"h_gb_", gaw_small:"h_gs_", th_small:"h_ts_", th_barn:"h_tb_", hanok_red:"h_hr_", yangok:"h_yo_" };
        var P = VA && VA.props, pre = HP[kind] || "h_g_";
        var f = P && P[pre + "front"], sd = P && P[pre + "side"], bk = P && P[pre + "back"];
        if(!f || !sd || !bk) return house(kind, x, z, faceNorth);
        var kmul = ({ gaw_l:1.18, gaw_big:1.3, th_barn:1.35, th_small:0.85, gaw_small:0.9, yangok:0.95 })[kind] || 1;
        var g = new THREE.Group(), Wf = 36*(sc || 1)*kmul, Hf = Wf*f.h/f.w, Ws = Hf*sd.w/sd.h, Wb = Math.min(Hf*bk.w/bk.h, Wf);
        var HIPK = { gaw:1, thatch:1, slate:1, gaw_small:1, th_small:1, th_barn:1, hanok_red:1, gaw_l:1 }, usedHip = false;
        if(kind === "gaw_big"){
          var cD = Math.max(Wf*0.5, Math.min(Ws, Wf*0.95)); compoundTop(g, Wf, cD, Hf); usedHip = true;
          [[f, Wf, 0, cD/2, 0, 0], [bk, Math.min(Wb, Wf), 0, -cD/2, Math.PI, 0], [sd, cD, -Wf*0.46, 0, -Math.PI/2, 0], [sd, cD, Wf*0.46, 0, Math.PI/2, 1]].forEach(function(q){
            var pm = new THREE.Mesh(new THREE.PlaneGeometry(q[1], Hf), new THREE.MeshLambertMaterial({ map:pTex(q[0]), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da })); pm.position.set(q[2], Hf/2, q[3]); pm.rotation.y = q[4]; if(q[5]) pm.scale.x = -1; g.add(pm); });
        }
        if(HIPK[kind]){
          var tk = kind === "thatch" || kind === "th_small" || kind === "th_barn", Dp = Math.max(Wf*0.5, Math.min(Ws, Wf*1.05));
          usedHip = hipBody(g, { fk:pre + "front", sk:pre + "side", bk:pre + "back", W:Wf, D:Dp, Hf:Hf, wallCol:tk ? 0x9a8460 : 0xb4aa98, roofCol:tk ? 0xa88f52 : (kind === "hanok_red" ? 0x7a4636 : 0x55534e) });
        }
        if(!usedHip){
        var thatchK = kind === "thatch" || kind === "th_small" || kind === "th_barn";
        var dx = Wf*0.43, dz = Ws*0.40, flatTop = kind === "yangok";
        // 속 덩어리: 벽 + (납작한 지붕 또는 사방으로 모인 지붕). 그림 면 사이로 하늘이 비치지 않고, 위에서 봐도 지붕처럼 보여요.
        var wallCol = thatchK ? 0x9a8460 : (flatTop ? 0x8a5a48 : (kind === "hanok_red" ? 0xb9a58a : 0xb4aa98));
        var wh = Hf*(flatTop ? 0.86 : 0.42);
        var core = new THREE.Mesh(new THREE.BoxGeometry(dx*1.9, wh, dz*1.9), new THREE.MeshLambertMaterial({ color:wallCol })); core.position.y = wh/2; core.castShadow = true; core.receiveShadow = true; g.add(core);
        if(flatTop){
          var slab = new THREE.Mesh(new THREE.BoxGeometry(dx*2.02, Hf*0.07, dz*2.02), new THREE.MeshLambertMaterial({ color:0x8c8a84 })); slab.position.y = wh + Hf*0.035; g.add(slab);
        } else {
          var rk = thatchK ? "r_thatch" : "r_gaw", rt = VA ? vtex(VA.tiles[rk], 5, 2, true) : null, rbot = dx*1.98*0.7071*1.0, rise = Hf*0.44;
          var roofM = new THREE.MeshLambertMaterial({ color:rt ? (kind === "hanok_red" ? 0xd9805e : 0xffffff) : 0x55545a, map:rt });
          var rg = new THREE.CylinderGeometry(rbot*(thatchK ? 0.2 : 0.34), rbot, rise, 4, 1); rg.rotateY(Math.PI/4); var roof = new THREE.Mesh(rg, roofM); roof.scale.set(1, 1, dz/dx); roof.position.y = wh + rise/2 - 0.2; roof.castShadow = true; g.add(roof);
        }
        function wall(e, w, px, pz, ry, mir){
          var m = new THREE.Mesh(new THREE.PlaneGeometry(w, Hf), new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da }));
          m.position.set(px, Hf/2, pz); m.rotation.y = ry; if(mir) m.scale.x = -1; g.add(m); return m;
        }
        wall(f, Wf, 0, dz, 0); wall(bk, Wb, 0, -dz, Math.PI);
        wall(sd, dz*1.96, -dx, 0, -Math.PI/2); wall(sd, dz*1.96, dx, 0, Math.PI/2, true);
        }
        g.position.set(x, 0, z); g.rotation.y = (typeof faceNorth === "number") ? faceNorth : (faceNorth ? Math.PI : 0); CP.add(g);
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(Wf*0.95, Ws*0.9), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.4, depthWrite:false }));
        sh.rotation.x = -Math.PI/2; sh.position.set(x + 3, 0.09, z + 2); CP.add(sh); reg(g, x, z, 950); reg(sh, x, z, 950);
        return g;
      }
      window.__houseArt = houseArt; window.__card = card;
      // 돌담 (낮은 3D 블록에 받은 돌담 질감)
      function wallRun(cx, cz, len, rotY){
        var tex = VA ? vtex(VA.tiles.t_wall, len/6, 0.8, true) : null;
        var wm = new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x8a8478, map:tex });
        var w = new THREE.Mesh(new THREE.BoxGeometry(len, 4.4, 1.9), wm); w.position.set(cx, 2.2, cz); w.rotation.y = rotY || 0; w.castShadow = true; w.receiveShadow = true; CP.add(w);
        var cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.3, 0.7, 2.4), new THREE.MeshLambertMaterial({ color:0x6f6a60 })); cap.position.set(cx, 4.55, cz); cap.rotation.y = rotY || 0; CP.add(cap);
      }
      // 골목 양옆으로 이어지는 돌담 (돌 질감 몸체 + 기와 지붕)
      function wallSeg(x0, x1, z){
        var len = Math.abs(x1 - x0), cx = (x0 + x1)/2;
        var tex = VA ? vtex(VA.tiles.a_wall, len/11, 0.7, true) : null, rt = VA ? vtex(VA.tiles.r_gaw, len/9, 0.4, true) : null;
        var body = new THREE.Mesh(new THREE.BoxGeometry(len, 7.6, 2.4), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x8a8478, map:tex }));
        body.position.set(cx, 3.8, z); body.castShadow = true; body.receiveShadow = true; CP.add(body);
        var capM = new THREE.MeshLambertMaterial({ color:rt ? 0xffffff : 0x4a4a52, map:rt });
        [-1, 1].forEach(function(sd){ var c = new THREE.Mesh(new THREE.BoxGeometry(len + 0.6, 0.5, 1.9), capM); c.position.set(cx, 8.15, z + sd*0.9); c.rotation.x = sd*0.5; c.castShadow = true; CP.add(c); });
        var ridge = new THREE.Mesh(new THREE.BoxGeometry(len + 0.6, 0.45, 0.6), new THREE.MeshLambertMaterial({ color:0x34353a })); ridge.position.set(cx, 8.75, z); CP.add(ridge);
      }
      VIL_WALLS.forEach(function(w){ wallSeg(w.x0, w.x1, w.z); });

      // 개울 + 나무다리 (바닥에 붙는 평면)
      (function(){
        var st = VA ? vtex(VA.tiles.t_gravel, 1, 340/26, true) : null;
        var sm = new THREE.Mesh(new THREE.PlaneGeometry(26, 340), new THREE.MeshLambertMaterial({ color:st ? 0xffffff : 0x6a8f98, map:st, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }));
        sm.rotation.x = -Math.PI/2; sm.position.set(-680, 0.1, 250); sm.receiveShadow = true; CP.add(sm);
        var e = VA && VA.props.s_bridge_wood;
        if(e){ var br = new THREE.Mesh(new THREE.PlaneGeometry(27, 27*e.h/e.w), new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.3, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 }));
          br.rotation.x = -Math.PI/2; br.rotation.z = Math.PI/2; br.position.set(-680, 0.16, 250); CP.add(br); }
      })();

      // 비닐하우스 (뼈대 + 반투명 비닐 + 안쪽 이랑)
      function greenhouse(x, z){
        var g = new THREE.Group(), L = 28, R = 6.4;
        var vinyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, L, 22, 1, true, 0, Math.PI), new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.34, side:THREE.DoubleSide, depthWrite:false }));
        vinyl.rotation.z = Math.PI/2; g.add(vinyl);
        var ribM = new THREE.MeshLambertMaterial({ color:0x9aa3a8 });
        for(var i = -2; i <= 2; i++){ var rib = new THREE.Mesh(new THREE.TorusGeometry(R, 0.17, 6, 18, Math.PI), ribM); rib.rotation.y = Math.PI/2; rib.position.x = i*6; g.add(rib); }
        [-0.6, 0, 0.6].forEach(function(f){ var a = Math.PI/2 - f*1.1; var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, L, 6), ribM); bar.rotation.z = Math.PI/2; bar.position.set(0, Math.sin(a)*R, Math.cos(a)*R); g.add(bar); });
        var base = new THREE.Mesh(new THREE.PlaneGeometry(L - 1, R*2 - 1), lamb("ridge", 3.2, 1.6, 0x5a4026, true)); base.rotation.x = -Math.PI/2; base.position.y = 0.08; base.receiveShadow = true; g.add(base);
        var endM = new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.3, side:THREE.DoubleSide, depthWrite:false });
        [-1, 1].forEach(function(sd){ var e = new THREE.Mesh(new THREE.CircleGeometry(R, 22, 0, Math.PI), endM); e.rotation.y = Math.PI/2; e.position.x = sd*L/2; g.add(e); });
        g.scale.set(1.5, 1.5, 1.5); g.position.set(x, 0, z); CP.add(g);
      }
      (function(){                                               // 두 줄로 길게 이어 붙인 비닐하우스 단지 (한꺼번에 그려서 가벼워요)
        var n = VIL_GH_OUT.length, R = 6.4, L = 28, S = 1.5, d = new THREE.Object3D(), m4 = new THREE.Matrix4(), lm = new THREE.Matrix4();
        function inst(geo, mat, count){ var im = new THREE.InstancedMesh(geo, mat, count); im.frustumCulled = false; CP.add(im); return im; }
        var vg = new THREE.CylinderGeometry(R, R, L, 22, 1, true, 0, Math.PI); vg.rotateZ(Math.PI/2);
        var vm = inst(vg, new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.34, side:THREE.DoubleSide, depthWrite:false }), n);
        var rg = new THREE.TorusGeometry(R, 0.17, 6, 18, Math.PI); rg.rotateY(Math.PI/2);
        var rm = inst(rg, new THREE.MeshLambertMaterial({ color:0x9aa3a8 }), n*5);
        var bg = new THREE.PlaneGeometry(L - 1, R*2 - 1); bg.rotateX(-Math.PI/2);
        var bm = inst(bg, lamb("ridge", 3.2, 1.6, 0x5a4026, true), n); bm.receiveShadow = true;
        var eg = new THREE.CircleGeometry(R, 22, 0, Math.PI); eg.rotateY(Math.PI/2);
        var em = inst(eg, new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.3, side:THREE.DoubleSide, depthWrite:false }), n*2);
        var ri = 0, ei = 0;
        VIL_GH_OUT.forEach(function(o, i){
          d.position.set(o.x, 0, o.z); d.scale.setScalar(S); d.rotation.set(0, 0, 0); d.updateMatrix(); m4.copy(d.matrix);
          vm.setMatrixAt(i, m4); lm.makeTranslation(0, 0.08, 0); bm.setMatrixAt(i, new THREE.Matrix4().multiplyMatrices(m4, lm));
          for(var k = -2; k <= 2; k++){ lm.makeTranslation(k*6, 0, 0); rm.setMatrixAt(ri++, new THREE.Matrix4().multiplyMatrices(m4, lm)); }
          [-1, 1].forEach(function(sd){ lm.makeTranslation(sd*L/2, 0, 0); em.setMatrixAt(ei++, new THREE.Matrix4().multiplyMatrices(m4, lm)); });
        });
      })();

      // 그림 카드 소품 배치
      card("pavilion", -1180, 290, 26);
      card("tiller", -1090, 228, 11); card("sheaf", -1105, 266, 7);
      for(var pz = -700; pz >= -1500; pz -= 150) card("pole", pz, 226, 22);

      // ---- 두 번째 묶음: 마을회관, 정미소, 연못, 어르신, 과수원, 돌담, 개울 ----
      function boxBuilding(name, x, z, W, D, H, tk, faceZ){
        var g = new THREE.Group(), T = VA ? VA.tiles : null;
        function m(key){ var t = T && T[key] ? vtex(T[key], 1, 1, false) : null; if(t){ t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; } return new THREE.MeshLambertMaterial({ color:t ? 0xffffff : 0xb9b0a3, map:t }); }
        var side = m(tk + "_side"), front = m(tk + "_front"), back = m(tk + "_back"), top = new THREE.MeshLambertMaterial({ color:0x8e8a82 });
        var body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), [side, side, top, top, front, back]); body.position.y = H/2; body.castShadow = true; body.receiveShadow = true; g.add(body);
        g.position.set(x, 0, z); g.rotation.y = faceZ > 0 ? 0 : Math.PI; CP.add(g); return g;
      }
      boxBuilding("hall", -1260, 305, 30, 18, 11, "hall", -1);
      boxBuilding("mill", -1340, 200, 26, 20, 11, "mill", 1);

      // 연못: 물 타일 + 흙 가장자리 + 수련
      (function(){
        var P = VIL_POND, rimR = new THREE.Mesh(new THREE.CircleGeometry(P.r + 6, 40), new THREE.MeshLambertMaterial({ color:0x6d6a4e })); rimR.rotation.x = -Math.PI/2; rimR.position.set(P.x, 0.1, P.z); CP.add(rimR);
        var wt = lamb("t_water", 5, 5, 0x2f7f8f, true);
        var wm = new THREE.Mesh(new THREE.CircleGeometry(P.r, 40), new THREE.MeshLambertMaterial({ color:0xffffff, map:wt.map, emissive:0x10303a, transparent:true, opacity:0.93 })); wm.rotation.x = -Math.PI/2; wm.position.set(P.x, 0.25, P.z); CP.add(wm);
        for(var k = 0; k < 8; k++){ var ka = k*0.8 + 0.3, kr = 14 + (k % 3)*14; card("lily", P.x + Math.cos(ka)*kr, P.z + Math.sin(ka)*kr, 3.2); }
      })();
      // 어르신, 과수원, 돌담, 개울
      // 새 소품들: 장독대, 땔감, 빨래 줄, 평상, 표지판, 표지석, 우체통, 버스 정류장
      card("p_laundry", -962, 322, 9); card("p_pyeongsang", -905, 288, 6);
      card("p_sign", -650, 266, 7); card("p_stone", -1198, 238, 7); card("p_mailbox", -780, 226, 5); card("p_bus", -646, 336, 10);
      // 큰 나무 (3D)
      var bigTrees = [];
      function buildBigTree(x, z, sc){
        var g = new THREE.Group(), barkT = VA ? vtex(VA.tiles.a_bark, 1.2, 2.2, true) : null;
        var barkM = new THREE.MeshLambertMaterial({ color:barkT ? 0xd8cfc4 : 0x6b5a48, map:barkT });
        function limb(r0, r1, len, px, py, pz, rx, rz){
          var m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 10, 1), barkM);
          m.position.set(px, py, pz); m.rotation.set(rx, 0, rz); m.castShadow = true; g.add(m); return m;
        }
        // 줄기: 아래가 굵고 살짝 휘는 3마디
        limb(3.6, 3.0, 7, 0, 3.5, 0, 0, 0); limb(3.0, 2.4, 7, 0.5, 10, 0.2, 0.05, -0.08); limb(2.4, 1.9, 6, 1.1, 16, 0.3, -0.04, -0.1);
        // 뿌리 퍼짐
        for(var i = 0; i < 8; i++){ var a = i*Math.PI/4 + 0.3, rl = 6 + (i % 3)*1.6; var r = limb(1.5, 0.35, rl, Math.cos(a)*rl*0.42, 0.7, Math.sin(a)*rl*0.42, 0, 0); r.rotation.set(Math.sin(a)*1.25, 0, -Math.cos(a)*1.25); }
        // 큰 가지
        var tips = [];
        for(i = 0; i < 7; i++){ var ba = i*Math.PI*2/7 + 0.5, tilt = 0.85 + (i % 2)*0.25, bl = 12 + (i % 3)*3;
          var bx = 1.2 + Math.cos(ba)*bl*0.4, by = 17 + Math.cos(tilt)*bl*0.5, bz = 0.3 + Math.sin(ba)*bl*0.4;
          var b = limb(1.2, 0.3, bl, bx, by, bz, 0, 0); b.rotation.set(Math.sin(ba)*tilt, 0, -Math.cos(ba)*tilt);
          tips.push([1.2 + Math.cos(ba)*bl*0.8, 17 + Math.cos(tilt)*bl*0.95, 0.3 + Math.sin(ba)*bl*0.8]); }
        // 잎 뭉치: 잎 카드를 여러 방향으로 겹쳐서 입체로
        var leafE = VA && VA.props.y_leaf;
        if(leafE){
          var lt = pTex(leafE), lm = [0x9cc07c, 0x88b068, 0xa8c888].map(function(c){ return new THREE.MeshLambertMaterial({ map:lt, color:c, transparent:true, alphaTest:0.45, side:THREE.DoubleSide }); });
          var lg = new THREE.PlaneGeometry(9, 9*leafE.h/leafE.w), sd = 11, rn = function(){ sd = (sd*16807) % 2147483647; return sd/2147483647; };
          var leaves = new THREE.Group(); g.add(leaves);
          var im3 = lm.map(function(mm){ var q = new THREE.InstancedMesh(lg, mm, 30); q.frustumCulled = false; leaves.add(q); return q; }), dd = new THREE.Object3D();
          for(i = 0; i < 90; i++){
            var tp = tips[i % tips.length], lx = tp[0] + (rn() - 0.5)*13, ly = tp[1] + (rn() - 0.3)*9, lz = tp[2] + (rn() - 0.5)*13;
            dd.position.set(lx, ly, lz); dd.rotation.set((rn() - 0.5)*1.6 - 0.3, rn()*6.28, (rn() - 0.5)*1.2); dd.scale.setScalar(0.8 + rn()*0.8); dd.updateMatrix();
            im3[i % 3].setMatrixAt(Math.floor(i/3), dd.matrix);
          }
          bigTrees.push({ leaves:leaves, ph:rn()*6.28 });
        }
        g.scale.setScalar(sc); g.position.set(x, 0.1, z); CP.add(g);
        var tsh = new THREE.Mesh(new THREE.PlaneGeometry(46*sc, 30*sc), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.5, depthWrite:false })); tsh.rotation.x = -Math.PI/2; tsh.position.set(x + 4, 0.09, z + 3); CP.add(tsh);
      }
      // 담 너머 마당: 호박 덩굴, 해바라기, 들꽃, 채소밭, 항아리, 땔감, 자전거
      (function(){
        var H = { y_pumpkin:3.2, y_sunflower:9, y_wild:4.6, y_veg:4.2 };
        var N = [[-715, "y_sunflower"], [-748, "y_wild"], [-805, "y_pumpkin"], [-835, "y_veg"], [-905, "y_sunflower"], [-940, "y_wild"], [-972, "y_pumpkin"], [-1002, "y_veg"], [-1066, "y_sunflower"], [-1096, "y_wild"]];
        var S = [[-715, "y_wild"], [-745, "y_pumpkin"], [-822, "y_sunflower"], [-860, "y_veg"], [-915, "y_wild"], [-987, "y_pumpkin"], [-1012, "y_sunflower"], [-1062, "y_veg"], [-1092, "y_wild"]];
        N.forEach(function(n){ card(n[1], n[0], 225, H[n[1]]*1.25); }); S.forEach(function(n){ card(n[1], n[0], 276, H[n[1]]*1.25); });
        // 담 안쪽 가장자리를 따라 풀 덤불과 덩굴을 빽빽하게
        var sd2 = 77, rn2 = function(){ sd2 = (sd2*16807) % 2147483647; return sd2/2147483647; }, HB = { p_bush0:4.6, p_bush1:4.4, p_bush2:3.8, y_pumpkin:3.4, y_wild:4.8, p_cosmos:7 }, KB = ["p_bush0", "p_bush1", "p_bush2", "y_pumpkin", "y_wild", "p_cosmos", "p_bush0"];
        for(var hx = -650; hx > -1110; hx -= 6.5){ [[225.2], [275.8]].forEach(function(zz){ var gap = false; VIL_GATES.forEach(function(gt){ if(Math.abs(hx - gt.x) < 9) gap = true; }); if(gap || rn2() < 0.22) return; var k = KB[Math.floor(rn2()*KB.length)]; card(k, hx + rn2()*3, zz[0] + (rn2() - 0.5)*2.4, HB[k]*(0.8 + rn2()*0.5)); }); }
        card("y_jars", -848, 224, 5); card("y_firewood", -1020, 225, 4); card("y_bicycle", -955, 226, 6); card("y_jars", -840, 280, 5);
        // 길 끝의 큰 나무: 진짜 3D (껍질 입힌 굵은 줄기 + 뿌리 + 가지 + 입체로 겹친 잎 뭉치). 사방에서 봐도 나무예요.
        buildBigTree(-1130, 222, 1.5);
      })();
      card("elder0", VIL_ELDERS[0].x, VIL_ELDERS[0].z, 10); card("elder1", VIL_ELDERS[1].x, VIL_ELDERS[1].z, 9);
      for(var oi = 0; oi < 10; oi++) card(oi % 2 ? "apple" : "persimmon", -800 - oi*52, 600 + (oi % 3)*14, 17 + (oi % 4));

      // ---- 비닐하우스 안쪽 방 (밖의 비닐하우스 4동이 모두 이 방으로 이어져요) ----
      (function(){
        var G = VIL_GH, grp = new THREE.Group(); grp.position.set(G.cx, 0, G.cz); CP.add(grp);
        var shell = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, G.L, 26, 1, true, 0, Math.PI), new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.3, side:THREE.DoubleSide, depthWrite:false }));
        shell.rotation.z = Math.PI/2; grp.add(shell);
        var ribM = new THREE.MeshLambertMaterial({ color:0x9aa3a8 });
        for(var i = -9; i <= 9; i++){ var rib = new THREE.Mesh(new THREE.TorusGeometry(30, 0.4, 6, 28, Math.PI), ribM); rib.rotation.y = Math.PI/2; rib.position.x = i*8.4; grp.add(rib); }
        var floor = new THREE.Mesh(new THREE.PlaneGeometry(G.L, 60), lamb("ridge", 14, 1.6, 0x4a3524, true)); floor.rotation.x = -Math.PI/2; floor.position.y = 0.06; floor.receiveShadow = true; grp.add(floor);
        var ground2 = new THREE.Mesh(new THREE.PlaneGeometry(1500, 900), new THREE.MeshStandardMaterial({ color:0x7fae5a, roughness:0.9, metalness:0.05 })); ground2.rotation.x = -Math.PI/2; ground2.position.set(-400, -0.35, 0); grp.add(ground2);
        var endM2 = new THREE.MeshLambertMaterial({ color:0xeaf2f6, transparent:true, opacity:0.32, side:THREE.DoubleSide, depthWrite:false });
        [-1, 1].forEach(function(sd){ var ew = new THREE.Mesh(new THREE.CircleGeometry(30, 26, 0, Math.PI), endM2); ew.rotation.y = Math.PI/2; ew.position.x = sd*G.L/2; grp.add(ew); });
        var door = new THREE.Mesh(new THREE.BoxGeometry(1, 10, 8), new THREE.MeshLambertMaterial({ color:0xf0e8d6, emissive:0x222018 })); door.position.set(G.L/2 - 1, 5, 0); grp.add(door);
        var leafG = new THREE.SphereGeometry(1, 7, 6), melonG = new THREE.SphereGeometry(1, 10, 8), leafM = new THREE.MeshLambertMaterial({ color:0x4f9a3a }), melonM = new THREE.MeshLambertMaterial({ color:0xf3d34a }), berryM = new THREE.MeshLambertMaterial({ color:0xd8242f });
        VIL_GH_CROPS.forEach(function(c){
          var pl = new THREE.Group(); pl.position.set(c.x - G.cx, 0, c.z - G.cz);
          for(var k = 0; k < 5; k++){ var lf = new THREE.Mesh(leafG, leafM); lf.scale.set(2.4, 1.1, 2.0); lf.position.set(Math.cos(k*1.3)*2.2, 1.6 + (k % 2)*0.6, Math.sin(k*1.3)*2.2); pl.add(lf); }
          var fruit = new THREE.Group();
          if(c.kind === "melon"){ var m = new THREE.Mesh(melonG, melonM); m.scale.set(1.9, 1.6, 1.6); m.position.set(0.8, 2.4, 0.6); fruit.add(m); }
          else for(var b = 0; b < 3; b++){ var bm = new THREE.Mesh(melonG, berryM); bm.scale.set(0.7, 0.9, 0.7); bm.position.set(Math.cos(b*2.1)*1.8, 1.4, Math.sin(b*2.1)*1.8); fruit.add(bm); }
          pl.add(fruit); grp.add(pl); ghCrops.push({ fruit:fruit });
        });
        window.villageRefresh();
      })();

      // 대문 (받은 정면, 열림, 옆면 그림): 담 사이 출입구마다 한 채씩. 돌아가면 옆면과 뒷면이 나와요
      VIL_GATES.forEach(function(gt){
        var F = VA && VA.props.gate_open, S2 = VA && VA.props.gate_side; if(!F || !S2) return;
        var h = 11.5, w = h*F.w/F.h, g = new THREE.Group(), mt = function(e){ return new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da }); };
        var fm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mt(F)); fm.position.set(0, h/2, 1.0); g.add(fm);
        var bm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mt(F)); bm.position.set(0, h/2, -1.0); g.add(bm);
        var sw = h*S2.w/S2.h; [-1, 1].forEach(function(sd){ var sm = new THREE.Mesh(new THREE.PlaneGeometry(sw, h), mt(S2)); sm.rotation.y = Math.PI/2; sm.position.set(sd*w*0.46, h/2, 0); g.add(sm); });
        g.position.set(gt.x, 0, gt.z); CP.add(g);
      });
      // 먼 풍경: 계단식 논과 산 (길 끝 서쪽) + 마을 하늘
      (function(){
        var e = VA && VA.tiles.far_terrace; if(!e) return;
        var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = e.src; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
        var W = 1900, Hh = W*e.h/e.w, piv = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), new THREE.MeshBasicMaterial({ map:t, transparent:true, alphaTest:0.04, side:THREE.DoubleSide, fog:false }));
        m.position.y = Hh*0.46; piv.add(m); piv.position.set(-1900, 0, 300); CP.add(piv); facers.push(piv);
      })();

      // =================== 구역 확장 (1구역 = 지금 마을, 위로 2~5구역, 아래로 6~10구역) ===================
      var SPINE_X = -632, ZONE_H = 350;
      var ZONES = [
        { n:1,  zc:250,  name:"입구 마을",       sub:"돌담 골목과 논이 있는 마을" },
        { n:2,  zc:600,  name:"장터 골목",       sub:"집이 빽빽한 장터 골목, 끝에 우물 마당",       segs:[[-632,600,-1230,600]], plaza:{ x:-1285, z:600, s:76, well:true, stalls:true }, kinds:["gaw_big","slate","th_small","gaw_small","yangok","hanok_red"] },
        { n:3,  zc:950,  name:"ㄱ자 골목",       sub:"모퉁이를 돌아 이어지는 골목",                 segs:[[-632,950,-1080,950],[-1080,950,-1080,1100],[-1080,1100,-1420,1100]], kinds:["gaw_l","th_barn","hanok_red","gaw_small"], tree:{ x:-1440, z:1100 } },
        { n:4,  zc:1300, name:"갈림길 마을",     sub:"세 갈래로 나뉘는 골목",                       segs:[[-632,1300,-1350,1300],[-900,1300,-900,1140],[-1150,1300,-1150,1460]], kinds:["gaw_l","gaw_big","yangok","th_small","hanok_red"] },
        { n:5,  zc:1650, name:"과수원 마을",     sub:"감나무와 사과나무가 있는 골목",               segs:[[-632,1650,-1400,1650]], kinds:["th_barn","th_small","gaw_small","th_barn"], orchard:{ x0:-700, x1:-1380, z:1580, rows:2 }, onlySide:1 },
        { n:6,  zc:-100, name:"정자 마당",       sub:"큰 나무와 정자가 있는 마당",                  segs:[[-632,-100,-1010,-100]], plaza:{ x:-1100, z:-100, s:150, pavilion:true, tree:true }, kinds:["gaw_big","th_small","hanok_red","gaw_l"] },
        { n:7,  zc:-450, name:"구불 골목",       sub:"굽이굽이 이어지는 골목",                      segs:[[-632,-450,-850,-450],[-850,-450,-850,-370],[-850,-370,-1070,-370],[-1070,-370,-1070,-450],[-1070,-450,-1330,-450]], kinds:["yangok","th_barn","gaw_small","hanok_red","slate"] },
        { n:8,  zc:-800, name:"공동 마당",       sub:"골목이 네모로 둘러싸는 공동 마당",            segs:[[-632,-800,-780,-800],[-780,-800,-1100,-800],[-1100,-800,-1100,-690],[-1100,-690,-780,-690],[-780,-690,-780,-800],[-1100,-800,-1300,-800]], center:{ x:-940, z:-745, well:true }, kinds:["gaw_l","hanok_red","th_small","yangok"] },
        { n:9,  zc:-1150,name:"방앗간 골목",     sub:"방앗간과 창고가 늘어선 골목",                 segs:[[-632,-1150,-1450,-1150]], mills:true, kinds:["yangok","slate","gaw_small","th_barn"] },
        { n:10, zc:-1500,name:"마을 끝",         sub:"개울을 건너 마을 끝 마당으로",                segs:[[-632,-1500,-1300,-1500]], stream:{ x:-1000 }, kinds:["gaw_big","th_small","hanok_red","gaw_l"], tree:{ x:-1340, z:-1500 }, hall:true }
      ];
      function zoneOf(z){ for(var i = 0; i < ZONES.length; i++) if(Math.abs(z - ZONES[i].zc) < ZONE_H/2) return ZONES[i]; return z > 1825 ? { n:11, name:"북쪽 벼농사 들판", sub:"끝없이 펼쳐진 벼논" } : (z < -1675 ? { n:0, name:"남쪽 논농사 들판", sub:"길게 이어진 논" } : null); }
      var zoneGroups = [];
      var zrnd = function(seed){ var sd = seed; return function(){ sd = (sd*16807) % 2147483647; return sd/2147483647; }; };
      var YARD = [["y_pumpkin", 3.2], ["y_sunflower", 9], ["y_wild", 4.6], ["y_veg", 4.2], ["y_jars", 5], ["y_firewood", 4], ["y_bicycle", 6], ["p_bush0", 4.4], ["p_bush1", 4.2], ["p_cosmos", 7]];
      function gateAt(x, z, rotY){
        var F = VA && VA.props.gate_open, S2 = VA && VA.props.gate_side; if(!F || !S2) return;
        var h = 11.5, w = h*F.w/F.h, g = new THREE.Group(), mt = function(e){ return new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da }); };
        var fm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mt(F)); fm.position.set(0, h/2, 1.0); g.add(fm);
        var bm = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mt(F)); bm.position.set(0, h/2, -1.0); g.add(bm);
        var sw = h*S2.w/S2.h; [-1, 1].forEach(function(sd){ var sm = new THREE.Mesh(new THREE.PlaneGeometry(sw, h), mt(S2)); sm.rotation.y = Math.PI/2; sm.position.set(sd*w*0.46, h/2, 0); g.add(sm); });
        g.position.set(x, 0, z); g.rotation.y = rotY || 0; CP.add(g); reg(g, x, z, 600);
      }
      function wallLine(a, c, b, vert){                          // 돌담 한 토막 (a~b 구간, 고정 좌표 c). vert 이면 z 방향으로 뻗어요
        var len = b - a, mid = (a + b)/2; if(len < 2) return;
        var g = new THREE.Group(), tex = VA ? vtex(VA.tiles.a_wall, len/11, 0.7, true) : null, rt = VA ? vtex(VA.tiles.r_gaw, len/9, 0.4, true) : null;
        var body = new THREE.Mesh(new THREE.BoxGeometry(len, 7.6, 2.4), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x8a8478, map:tex })); body.position.y = 3.8; body.receiveShadow = true; g.add(body);
        var capM = new THREE.MeshLambertMaterial({ color:rt ? 0xffffff : 0x4a4a52, map:rt });
        [-1, 1].forEach(function(sd){ var cp = new THREE.Mesh(new THREE.BoxGeometry(len + 0.6, 0.5, 1.9), capM); cp.position.set(0, 8.15, sd*0.9); cp.rotation.x = sd*0.5; g.add(cp); });
        var ridge = new THREE.Mesh(new THREE.BoxGeometry(len + 0.6, 0.45, 0.6), new THREE.MeshLambertMaterial({ color:0x34353a })); ridge.position.y = 8.75; g.add(ridge);
        if(vert){ g.position.set(c, 0, mid); g.rotation.y = Math.PI/2; VIL_RECTS.push({ x:c, z:mid, hx:1.5, hz:len/2 + 0.5 }); }
        else { g.position.set(mid, 0, c); VIL_RECTS.push({ x:mid, z:c, hx:len/2 + 0.5, hz:1.5 }); }
        CP.add(g); reg(g, vert ? c : mid, vert ? mid : c, 950 + len/2);
      }
      function wellAt(x, z){
        var tex = VA ? vtex(VA.tiles.a_wall, 2, 0.4, true) : null, g = new THREE.Group();
        var ring = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.8, 3.2, 14), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x8a8478, map:tex })); ring.position.y = 1.6; ring.castShadow = true; g.add(ring);
        var wat = new THREE.Mesh(new THREE.CircleGeometry(3.4, 14), new THREE.MeshLambertMaterial({ color:0x2d6b78 })); wat.rotation.x = -Math.PI/2; wat.position.y = 3.15; g.add(wat);
        var woodM = new THREE.MeshLambertMaterial({ color:0x6b4a32 });
        [-1, 1].forEach(function(sd){ var pst = new THREE.Mesh(new THREE.BoxGeometry(0.7, 7.5, 0.7), woodM); pst.position.set(sd*3.9, 5.5, 0); g.add(pst); });
        var roof = new THREE.Mesh(new THREE.ConeGeometry(6.6, 2.8, 4), new THREE.MeshLambertMaterial({ color:0x4a4a52 })); roof.rotation.y = Math.PI/4; roof.position.y = 10.4; g.add(roof);
        g.position.set(x, 0, z); CP.add(g); VIL_RECTS.push({ x:x, z:z, hx:5.2, hz:5.2 });
      }
      function zoneBuild(Z){
        var G = new THREE.Group(); G.name = "zone" + Z.n; V.add(G); var prev = CP; CP = G; zoneGroups.push({ G:G, zc:Z.zc });
        var rn = zrnd(Z.n*977 + 13), segs = Z.segs, AH = 10;
        function segHit(sg, x, z, hx, hz, pad){
          var x0 = Math.min(sg[0], sg[2]) - pad, x1 = Math.max(sg[0], sg[2]) + pad, z0 = Math.min(sg[1], sg[3]) - pad, z1 = Math.max(sg[1], sg[3]) + pad;
          return x + hx > x0 && x - hx < x1 && z + hz > z0 && z - hz < z1;
        }
        function free(x, z, hx, hz){
          if(x - hx < -1990 || x + hx > -650) return false;
          for(var i = 0; i < VIL_RECTS.length; i++){ var r = VIL_RECTS[i]; if(Math.abs(x - r.x) < hx + r.hx && Math.abs(z - r.z) < hz + r.hz) return false; }
          for(i = 0; i < segs.length; i++) if(segHit(segs[i], x, z, hx, hz, AH + 6)) return false;
          if(Z.plaza && Math.abs(x - Z.plaza.x) < Z.plaza.s/2 + hx && Math.abs(z - Z.plaza.z) < Z.plaza.s/2 + hz) return false;
          if(Z.stream && Math.abs(x - Z.stream.x) < 16 + hx) return false;
          return true;
        }
        // 골목 바닥(돌길) + 이음 모서리
        segs.forEach(function(sg){
          var vert = sg[0] === sg[2], a = vert ? Math.min(sg[1], sg[3]) : Math.min(sg[0], sg[2]), b = vert ? Math.max(sg[1], sg[3]) : Math.max(sg[0], sg[2]), len = b - a + 15;
          var tex = VA ? vtex(VA.tiles.a_road, len/43, 1, true) : null;
          var m = new THREE.Mesh(new THREE.PlaneGeometry(len, 17), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x9a9488, map:tex, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 }));
          m.rotation.x = -Math.PI/2; var gp = new THREE.Group(); gp.add(m); gp.position.set(vert ? sg[0] : (a + b)/2, 0.07, vert ? (a + b)/2 : sg[1]); gp.rotation.y = vert ? Math.PI/2 : 0; G.add(gp);
        });
        if(Z.plaza){ var P = Z.plaza, pt = VA ? vtex(VA.tiles.a_road, P.s/43, P.s/43*0.6, true) : null;
          var pm = new THREE.Mesh(new THREE.PlaneGeometry(P.s, P.s), new THREE.MeshLambertMaterial({ color:pt ? 0xffffff : 0x9a9488, map:pt, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })); pm.rotation.x = -Math.PI/2; pm.position.set(P.x, 0.07, P.z); G.add(pm);
          if(P.well){ if(VA && VA.props.f_well){ card("f_well", P.x, P.z, 14); VIL_RECTS.push({ x:P.x, z:P.z, hx:5.5, hz:5.5 }); } else wellAt(P.x, P.z); }
          if(P.stalls){ card("f_shop", P.x - 22, P.z + 30, 15); VIL_RECTS.push({ x:P.x - 22, z:P.z + 30, hx:8, hz:4 }); card("f_jaryard", P.x + 24, P.z + 26, 12); card("p_pyeongsang", P.x - 24, P.z - 24, 6.5); card("y_veg", P.x + 22, P.z - 22, 4.2); }
          if(P.pavilion){ card(VA && VA.props.f_gazebo ? "f_gazebo" : "pavilion", P.x + 30, P.z - 25, 22); VIL_RECTS.push({ x:P.x + 30, z:P.z - 25, hx:9, hz:9 }); }
          if(P.tree){ buildBigTree(P.x - 25, P.z + 28, 1.6); VIL_RECTS.push({ x:P.x - 25, z:P.z + 28, hx:5, hz:5 }); }
        }
        if(Z.center){ if(VA && VA.props.f_well){ card("f_well", Z.center.x, Z.center.z, 14); VIL_RECTS.push({ x:Z.center.x, z:Z.center.z, hx:5.5, hz:5.5 }); } else wellAt(Z.center.x, Z.center.z); card("f_jaryard", Z.center.x + 40, Z.center.z + 12, 12); for(var ci = 0; ci < 7; ci++) card(YARD[ci % 7][0], Z.center.x + (rn() - 0.5)*120, Z.center.z + (rn() - 0.5)*40, YARD[ci % 7][1]); }
        if(Z.tree){ buildBigTree(Z.tree.x, Z.tree.z, 1.4); VIL_RECTS.push({ x:Z.tree.x, z:Z.tree.z, hx:5, hz:5 }); }
        if(Z.stream){ var sx0 = Z.stream.x, sl = ZONE_H - 20, st = VA ? vtex(VA.tiles.t_gravel, 1, sl/26, true) : null;
          var sm2 = new THREE.Mesh(new THREE.PlaneGeometry(26, sl), new THREE.MeshLambertMaterial({ color:st ? 0xffffff : 0x6a8f98, map:st, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 })); sm2.rotation.x = -Math.PI/2; sm2.position.set(sx0, 0.1, Z.zc); G.add(sm2);
          var be = VA && VA.props.s_bridge_wood; if(be){ var bmm = new THREE.Mesh(new THREE.PlaneGeometry(27, 27*be.h/be.w), new THREE.MeshLambertMaterial({ map:pTex(be), transparent:true, alphaTest:0.3, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 })); bmm.rotation.x = -Math.PI/2; bmm.rotation.z = Math.PI/2; bmm.position.set(sx0, 0.16, Z.zc); G.add(bmm); }
          VIL_RECTS.push({ x:sx0, z:Z.zc - 92, hx:13, hz:78 }); VIL_RECTS.push({ x:sx0, z:Z.zc + 92, hx:13, hz:78 }); }
        // 집, 담, 출입문, 마당
        var gates = segs.map(function(){ return [[], []]; });
        var houseList = [];
        segs.forEach(function(sg, si){
          var vert = sg[0] === sg[2], a = vert ? Math.min(sg[1], sg[3]) : Math.min(sg[0], sg[2]), b = vert ? Math.max(sg[1], sg[3]) : Math.max(sg[0], sg[2]), c0 = vert ? sg[0] : sg[1];
          [-1, 1].forEach(function(side, sidx){
            if(Z.onlySide && side !== Z.onlySide) return;
            for(var p = a + 62; p < b - 40; p += 96 + rn()*16){
              var sc = 0.86 + rn()*0.3, kind = Z.kinds[Math.floor(rn()*Z.kinds.length)], hx = 17*sc*(({ gaw_l:1.18, gaw_big:1.3, th_barn:1.35, th_small:0.85, gaw_small:0.9, yangok:0.95 })[kind] || 1), hz = 12.5*sc, off = 52 + (rn() - 0.5)*6;
              var hxw = vert ? c0 + side*off : p, hzw = vert ? p : c0 + side*off, rot = vert ? (side > 0 ? -Math.PI/2 : Math.PI/2) : (side > 0 ? Math.PI : 0);
              var rx = vert ? hz : hx, rz = vert ? hx : hz;
              if(!free(hxw, hzw, rx + 1, rz + 1)) continue;
              if(Z.mills && side < 0 && !vert){ var mk = rn() < 0.5 ? "mill" : "hall"; boxBuilding(mk, hxw, hzw, 28, 20, 11, mk, 1); VIL_RECTS.push({ x:hxw, z:hzw, hx:15, hz:11.5 }); }
              else { houseArt(kind, hxw, hzw, rot, sc); VIL_RECTS.push({ x:hxw, z:hzw, hx:rx, hz:rz }); }
              gates[si][sidx].push(p);
              houseList.push({ x:hxw, z:hzw, vert:vert, side:side });
              var ny = 1 + Math.floor(rn()*3);                   // 마당 소품
              for(var q = 0; q < ny; q++){ var yk = YARD[Math.floor(rn()*YARD.length)], yp = p + (rn() - 0.5)*30, yo = c0 + side*(18 + rn()*14);
                card(yk[0], vert ? yo : yp, vert ? yp : yo, yk[1]*(0.9 + rn()*0.3)); }
            }
          });
        });
        segs.forEach(function(sg, si){
          var vert = sg[0] === sg[2], a = vert ? Math.min(sg[1], sg[3]) : Math.min(sg[0], sg[2]), b = vert ? Math.max(sg[1], sg[3]) : Math.max(sg[0], sg[2]), c0 = vert ? sg[0] : sg[1];
          if(!vert && b >= SPINE_X - 2) b = SPINE_X - 18;
          [-1, 1].forEach(function(side, sidx){
            if(Z.onlySide && side !== Z.onlySide) return;
            var c = c0 + side*14, open = gates[si][sidx].map(function(gp){ return [gp - 6.5, gp + 6.5]; });
            segs.forEach(function(o, oi){ if(oi === si) return; var ov = o[0] === o[2]; if(ov === vert) return;
              var oc = ov ? o[0] : o[1], oa = ov ? Math.min(o[1], o[3]) : Math.min(o[0], o[2]), ob = ov ? Math.max(o[1], o[3]) : Math.max(o[0], o[2]);
              if(c >= oa - 10 && c <= ob + 10 && oc > a - 12 && oc < b + 12) open.push([oc - 11, oc + 11]); });
            if(Z.plaza){ var P2 = Z.plaza; if(!vert && Math.abs(c - P2.z) < P2.s/2 && P2.x + P2.s/2 > a - 2) open.push([P2.x - P2.s/2 - 12, 1e9]); }
            open.sort(function(u, v){ return u[0] - v[0]; });
            var cur = a; open.forEach(function(o2){ if(o2[0] > cur) wallLine(cur, c, Math.min(o2[0], b), vert); cur = Math.max(cur, o2[1]); }); if(cur < b) wallLine(cur, c, b, vert);
            gates[si][sidx].forEach(function(gp){ gateAt(vert ? c : gp, vert ? gp : c, vert ? Math.PI/2 : 0); });
          });
        });
        // 과수원 줄
        if(Z.orchard){ var O = Z.orchard; for(var r = 0; r < O.rows; r++) for(var ox = O.x0; ox > O.x1; ox -= 38){ var tx = ox + (rn() - 0.5)*8, tz = O.z - r*34 + (rn() - 0.5)*6; if(!free(tx, tz, 4, 4)) continue; card(rn() < 0.5 ? "persimmon" : "apple", tx, tz, 22 + rn()*5); } }
        // 돌담 안쪽 풀 덤불
        houseList.forEach(function(h){ for(var k = 0; k < 2; k++){ var bk = ["p_bush0", "p_bush1", "p_bush2", "y_wild"][Math.floor(rn()*4)]; card(bk, h.x + (rn() - 0.5)*30, h.z - h.side*(h.vert ? 0 : 20) + (rn() - 0.5)*6, 4 + rn()*1.5); } });
        CP = prev;
      }
      // 마을 앞 큰길(남북) + 땅 넓히기
      (function(){
        var tex = VA ? vtex(VA.tiles.a_road, 5350/43, 1, true) : null, len = 5350;
        var sp = new THREE.Mesh(new THREE.PlaneGeometry(len, 17), new THREE.MeshLambertMaterial({ color:tex ? 0xffffff : 0x9a9488, map:tex, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 }));
        sp.rotation.x = -Math.PI/2; var gp = new THREE.Group(); gp.add(sp); gp.rotation.y = Math.PI/2; gp.position.set(SPINE_X, 0.075, 25); CP.add(gp);
        CP.add(extGround2(VIL.x1, -600, -2700, -60, 0.1923));
      })();
      ZONES.forEach(function(Z){ if(Z.segs) zoneBuild(Z); });
      // 비닐하우스 단지 쪽 길: 1구역 끝에서 단지 끝까지 가는 골목
      // 벼농사/논농사 들판: 북쪽(위)과 남쪽(아래)으로 길게 (한 장씩이 아니라 한꺼번에 그려서 가벼워요)
      (function(){
        var mats = [lamb("field1", 3, 3, 0x4f9a3a, true), lamb("field2", 3, 3, 0xc2a53a, true)];
        var plane = new THREE.PlaneGeometry(72, 96); plane.rotateX(-Math.PI/2);
        var cols = 18, rowsN = [], rowsS = []; for(var r = 0; r < 8; r++){ rowsN.push(1900 + r*104); rowsS.push(-1800 - r*104); }
        var all = []; rowsN.concat(rowsS).forEach(function(rz){ for(var c = 0; c < cols; c++) all.push([-730 - c*80, rz]); });
        var buckets = [[], []], h = 7; all.forEach(function(q, i){ h = (h*16807 + i*31) % 2147483647; var bt2 = h/2147483647 < 0.5 ? 0 : 1; buckets[bt2].push(q); PADS.push({ x:q[0], z:q[1], t:bt2 }); });
        var d = new THREE.Object3D();
        buckets.forEach(function(bk, bi){
          var im = new THREE.InstancedMesh(plane, mats[bi], bk.length); im.receiveShadow = true;
          bk.forEach(function(q, i){ d.position.set(q[0], 0.52, q[1]); d.updateMatrix(); im.setMatrixAt(i, d.matrix); }); im.frustumCulled = false; CP.add(im);
        });
        var rimG = new THREE.BoxGeometry(77, 0.5, 101), rimI = new THREE.InstancedMesh(rimG, new THREE.MeshLambertMaterial({ color:0x6d5236 }), all.length);
        all.forEach(function(q, i){ d.position.set(q[0], 0.25, q[1]); d.updateMatrix(); rimI.setMatrixAt(i, d.matrix); }); rimI.frustumCulled = false; CP.add(rimI);
        // ---- 빳빳하게 선 벼 포기 (가까이 가면 논마다 촘촘히 심어져 있어요) + 낫으로 베기 ----
        (function(){
          var RH = 5.0, RW = 4.4, STEP = 3.4, RAD = 175;
          function ricetex(gold){
            return canvasTex(128, 256, function(g, w, hh){
              g.clearRect(0, 0, w, hh);
              var n = 15, i;
              for(i = 0; i < n; i++){
                var a = (i/(n - 1) - 0.5)*0.62 + (((i*37) % 7) - 3)*0.012, len = hh*(0.62 + ((i*53) % 11)/11*0.34), bx = w/2 + (((i*29) % 9) - 4)*2.2, tx = bx + Math.sin(a)*len*0.5, ty = hh - 6 - Math.cos(a)*len;
                var gr = g.createLinearGradient(0, hh, 0, ty);
                gr.addColorStop(0, gold ? "#8a6a14" : "#2f6d22"); gr.addColorStop(0.6, gold ? "#c9a62c" : "#5fae35"); gr.addColorStop(1, gold ? "#f0d25a" : "#9bd653");
                g.strokeStyle = gr; g.lineWidth = 4.2 - (i % 3)*0.6; g.lineCap = "round";
                g.beginPath(); g.moveTo(bx, hh - 4); g.quadraticCurveTo(bx + Math.sin(a)*len*0.18, hh - len*0.55, tx, ty); g.stroke();
                if(gold && i % 2 === 0){                          // 익은 이삭 (무거워서 끝이 살짝 숙여요)
                  g.save(); g.translate(tx, ty); g.rotate(a*0.6 + 0.35); g.fillStyle = "#e9c23c";
                  for(var k = 0; k < 7; k++){ g.beginPath(); g.ellipse(k*1.5 - 3, -k*5 - 2, 3.4, 5.2, 0.25, 0, 6.3); g.fill(); }
                  g.restore();
                }
              }
            });
          }
          function mkMat(gold){
            var m = new THREE.MeshLambertMaterial({ map:ricetex(gold), transparent:false, alphaTest:0.45, side:THREE.DoubleSide, color:gold ? 0xf4e6b8 : 0xe8f5da });
            m.onBeforeCompile = function(sh){
              sh.uniforms.uRt = riceU.t;
              sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uRt;")
                .replace("#include <begin_vertex>", "vec3 transformed = vec3(position);\n#ifdef USE_INSTANCING\nfloat ph = instanceMatrix[3].x*0.11 + instanceMatrix[3].z*0.09;\ntransformed.x += sin(uRt*1.5 + ph)*0.30*(position.y/" + RH.toFixed(1) + ")*(position.y/" + RH.toFixed(1) + ");\ntransformed.z += cos(uRt*1.1 + ph)*0.18*(position.y/" + RH.toFixed(1) + ");\n#endif");
            };
            return m;
          }
          var riceU = { t:{ value:0 } };
          // 세 장을 엇갈려 꽂은 포기 하나
          var pos = [], uvs = [], idx = [], v0 = 0;
          [0, Math.PI/3, -Math.PI/3].forEach(function(ang){
            var c = Math.cos(ang)*RW/2, sn = Math.sin(ang)*RW/2;
            pos.push(-c, 0, sn,  c, 0, -sn,  c, RH, -sn,  -c, RH, sn); uvs.push(0, 0, 1, 0, 1, 1, 0, 1); idx.push(v0, v0 + 1, v0 + 2, v0, v0 + 2, v0 + 3); v0 += 4;
          });
          var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); geo.setIndex(idx); geo.computeVertexNormals();
          var CAP = 6500, pools = [0, 1].map(function(gold){ var im = new THREE.InstancedMesh(geo, mkMat(gold === 1), CAP); im.frustumCulled = false; im.count = 0; im.castShadow = false; CP.add(im); return im; });
          var stub = new THREE.InstancedMesh(geo, mkMat(true), 2500); stub.frustumCulled = false; stub.count = 0; CP.add(stub);
          var cut = {}, lastX = 1e9, lastZ = 1e9, lastT = 0, dd = new THREE.Object3D(), hillsNear = [];
          function hkey(ix, iz){ return ix + "," + iz; }
          function hrnd(ix, iz){ var v = Math.sin(ix*12.9898 + iz*78.233)*43758.5453; return v - Math.floor(v); }
          function layout(px, pz, now){
            var cnt = [0, 0], sc2 = 0, i, ix, iz;
            hillsNear.length = 0;
            for(i = 0; i < PADS.length; i++){
              var pd = PADS[i]; if(Math.abs(pd.x - px) > RAD + 40 || Math.abs(pd.z - pz) > RAD + 50) continue;
              var ix0 = Math.ceil((pd.x - 33)/STEP), ix1 = Math.floor((pd.x + 33)/STEP), iz0 = Math.ceil((pd.z - 45)/STEP), iz1 = Math.floor((pd.z + 45)/STEP);
              for(ix = ix0; ix <= ix1; ix++) for(iz = iz0; iz <= iz1; iz++){
                var hx2 = ix*STEP + (hrnd(ix, iz) - 0.5)*1.1, hz2 = iz*STEP + (hrnd(iz, ix) - 0.5)*1.1, dx = hx2 - px, dz = hz2 - pz, dd2 = dx*dx + dz*dz;
                if(dd2 > RAD*RAD) continue;
                var k = hkey(ix, iz), ct = cut[k];
                if(ct && now < ct){ if(sc2 < 2500){ dd.position.set(hx2, 0.55, hz2); dd.rotation.set(0, hrnd(ix, ix)*6.28, 0); dd.scale.set(0.9, 0.16, 0.9); dd.updateMatrix(); stub.setMatrixAt(sc2++, dd.matrix); } continue; }
                if(ct) delete cut[k];
                if(cnt[pd.t] >= CAP) continue;
                var sc = 0.85 + hrnd(ix + 5, iz)*0.4; dd.position.set(hx2, 0.55, hz2); dd.rotation.set(0, hrnd(ix, iz)*6.28, 0); dd.scale.set(sc, sc*(0.9 + hrnd(iz, ix + 3)*0.3), sc); dd.updateMatrix();
                pools[pd.t].setMatrixAt(cnt[pd.t]++, dd.matrix);
                if(dd2 < 400) hillsNear.push({ k:k, x:hx2, z:hz2, d:dd2, t:pd.t });
              }
            }
            pools[0].count = cnt[0]; pools[1].count = cnt[1]; stub.count = sc2;
            pools[0].instanceMatrix.needsUpdate = pools[1].instanceMatrix.needsUpdate = stub.instanceMatrix.needsUpdate = true;
            lastX = px; lastZ = pz; lastT = now;
          }
          window.vilRiceTick = function(t, dt, p){
            riceU.t.value = t/1000; var now = Date.now(), inField = p.x < VIL.westX && (p.z > 1840 || p.z < -1740);
            if(!inField) return;
            if(Math.hypot(p.x - lastX, p.z - lastZ) > 22 || now - lastT > 4000) layout(p.x, p.z, now);
            for(var si = 0; si < sickles.length; si++){ var sk = sickles[si]; if(sk.back && now > sk.back){ sk.back = 0; sk.g.visible = true; } if(sk.g.visible){ sk.g.rotation.y = t/700 + si; sk.g.position.y = 2.2 + Math.sin(t/400 + si)*0.5; sk.beam.material.opacity = 0.18 + 0.08*Math.sin(t/300 + si); } }
            for(var ai = arcs.length - 1; ai >= 0; ai--){ var ar = arcs[ai]; ar.life -= dt; ar.m.rotation.z += dt*18; ar.m.material.opacity = Math.max(0, ar.life*3); if(ar.life <= 0){ CP.remove(ar.m); arcs.splice(ai, 1); } }
          };
          // 들판 곳곳에 놓인 낫 3자루 (E 로 장착)
          var sickles = [], arcs = [];
          [[-930, 2056], [-1330, 2264], [-1090, -2060]].forEach(function(sp){
            var g = new THREE.Group(), steel = new THREE.MeshLambertMaterial({ color:0xc9ced6, emissive:0x30343a }), wood = new THREE.MeshLambertMaterial({ color:0x7a5230 });
            var blade = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.32, 6, 16, Math.PI*1.15), steel); blade.position.set(0.8, 0, 0); g.add(blade);
            var hd = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 3.6, 8), wood); hd.position.set(-1.9, -1.1, 0); hd.rotation.z = 0.55; g.add(hd);
            g.scale.set(1.5, 1.5, 1.5); g.position.set(sp[0], 2.2, sp[1]); CP.add(g);
            var beam = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 26, 10, 1, true), new THREE.MeshBasicMaterial({ color:0xffe27a, transparent:true, opacity:0.22, depthWrite:false, side:THREE.DoubleSide })); beam.position.set(sp[0], 13, sp[1]); CP.add(beam);
            var ring = new THREE.Mesh(new THREE.RingGeometry(3.2, 4.2, 24), new THREE.MeshBasicMaterial({ color:0xffd24a, transparent:true, opacity:0.7, side:THREE.DoubleSide })); ring.rotation.x = -Math.PI/2; ring.position.set(sp[0], 0.7, sp[1]); CP.add(ring);
            g.userData.keep = true; beam.userData.keep = true; ring.userData.keep = true; var o = { g:g, x:sp[0], z:sp[1], beam:beam, ring:ring, back:0 }; g.visible = !VIL_FARM.sickle || true; sickles.push(o);
          });
          function nearSickle(p){ for(var i = 0; i < sickles.length; i++){ var sk = sickles[i]; if(sk.g.visible && Math.hypot(p.x - sk.x, p.z - sk.z) < 11) return sk; } return null; }
          window.vilRiceHint = function(p){
            if(!(p.z > 1840 || p.z < -1740)) return null;
            var sk = nearSickle(p); if(sk) return VIL_FARM.sickle ? "이미 낫을 가지고 있어요" : "E 눌러 낫 장착하기";
            var near = 0; for(var i = 0; i < hillsNear.length; i++) if(hillsNear[i].d < 64) near++;
            if(near > 0) return VIL_FARM.sickle ? "E 눌러 낫으로 벼 베기 (벼 " + VIL_FARM.rice + ")" : "낫이 필요해요! 들판에서 낫을 찾아보세요";
            return null;
          };
          window.vilRiceInteract = function(p){
            if(!(p.z > 1840 || p.z < -1740)) return false;
            var sk = nearSickle(p);
            if(sk){
              if(VIL_FARM.sickle){ showToast("🌾 이미 낫을 가지고 있어요. 벼 앞에서 E 를 눌러 베어 보세요!"); return true; }
              VIL_FARM.sickle = 1; sk.g.visible = false; sk.back = Date.now() + 60000; vilSave(); showToast("🔪 낫을 장착했어요! 이제 벼 앞에서 E 를 눌러 베어 보세요."); if(window.villageRefresh) window.villageRefresh(); return true;
            }
            var cand = hillsNear.filter(function(h2){ return h2.d < 64; }).sort(function(a, b){ return a.d - b.d; });
            if(!cand.length) return false;
            if(!VIL_FARM.sickle){ showToast("🌾 맨손으로는 벨 수 없어요. 들판 곳곳(반짝이는 곳)에 놓인 낫을 먼저 챙겨 보세요!"); return true; }
            var n2 = Math.min(3, cand.length), now = Date.now(), i2;
            for(i2 = 0; i2 < n2; i2++) cut[cand[i2].k] = now + 90000;
            VIL_FARM.rice += n2; VIL_FARM.harvested += n2; vilSave(); if(window.villageRefresh) window.villageRefresh();
            var am = new THREE.Mesh(new THREE.RingGeometry(2.4, 4.4, 20, 1, 0, Math.PI*1.2), new THREE.MeshBasicMaterial({ color:0xfff2b0, transparent:true, opacity:0.9, side:THREE.DoubleSide, depthWrite:false })); am.rotation.x = -Math.PI/2; am.position.set(p.x, 3.5, p.z); CP.add(am); arcs.push({ m:am, life:0.3 });
            layout(p.x, p.z, now);
            showToast("🌾 벼 " + n2 + "포기를 베었어요! (벼 " + VIL_FARM.rice + "개)");
            return true;
          };
        })();
        for(var di = 0; di < 26; di++){ var dh = (di*2654435761) % 1000/1000, dk = ["f_scarecrow", "f_pump", "f_straw"][di % 3], dxz = -760 - dh*1340, dzz = (di % 2 ? 1 : -1)*(1940 + ((di*37) % 700)); card(dk, dxz, dzz, dk === "f_scarecrow" ? 11 : (dk === "f_pump" ? 8 : 5)); }
        card("f_fsign", SPINE_X + 20, 1860, 11); card("f_fsign", SPINE_X + 20, -1740, 11);
        // 논둑 길 (농로): 들판 가운데로 동서로 한 줄
        [2200, -2100].forEach(function(rz){ var rt = VA ? vtex(VA.tiles.a_road, 1450/43, 1, true) : null, rm = new THREE.Mesh(new THREE.PlaneGeometry(1450, 8), new THREE.MeshLambertMaterial({ color:rt ? 0xffffff : 0xb9a47a, map:rt })); rm.rotation.x = -Math.PI/2; rm.position.set(-1440, 0.6, rz - 52); CP.add(rm); });
      })();

      // =================== 중앙 마을 (큰 기와집을 중심으로 흙길, 양옥, 초가, 슬레이트집, 창고, 텃밭이 있는 마을) ===================
      (function(){
        if(!VA || !VA.props.m_front) return;
        var G = new THREE.Group(); G.name = "central"; V.add(G); var prevCP = CP; CP = G;
        var X0 = -715, X1 = -1125, Z0 = -30, Z1 = 186;
        function flat(tile, cx, cz, w, d, rx, ry, y, po){                       // 바닥에 깔리는 흙 무늬
          var t = vtex(VA.tiles[tile], rx, ry, true), m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, polygonOffset:true, polygonOffsetFactor:po, polygonOffsetUnits:po }));
          m.rotation.x = -Math.PI/2; m.position.set(cx, y, cz); G.add(m); return m;
        }
        // 가장자리가 부드럽게 풀밭으로 이어지는 땅 (알파 마스크)
        var softMask = canvasTex(128, 128, function(g, w, h){ var im = g.createImageData(w, h), x, y; for(y = 0; y < h; y++) for(x = 0; x < w; x++){ var u = Math.min(x, w - 1 - x)/(w*0.5), v = Math.min(y, h - 1 - y)/(h*0.5), a = Math.min(u, v)/0.42; a = Math.max(0, Math.min(1, a)); a = a*a*(3 - 2*a); var k = (y*w + x)*4; im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.round(a*255); im.data[k + 3] = 255; } g.putImageData(im, 0, 0); });
        function soft(tile, cx, cz, w, d, rx, ry, y, po, op){
          var t = vtex(VA.tiles[tile], rx, ry, true), m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, alphaMap:softMask, transparent:true, opacity:op || 1, depthWrite:false, polygonOffset:true, polygonOffsetFactor:po, polygonOffsetUnits:po }));
          m.rotation.x = -Math.PI/2; m.position.set(cx, y, cz); m.userData.keep = true; G.add(m); reg(m, cx, cz, 1300); return m;
        }
        soft("t_weedy", (X0 + X1)/2, (Z0 + Z1)/2, Math.abs(X1 - X0) + 90, Z1 - Z0 + 60, 26, 14, 0.055, -1);
        soft("t_yard", -920, 98, 150, 70, 9, 4, 0.06, -2);                      // 큰 기와집 앞마당
        function dirtRoad(x0, z0, x1, z1, w, tile){
          var vert = Math.abs(x1 - x0) < 0.1, len = vert ? Math.abs(z1 - z0) : Math.abs(x1 - x0), t = vtex(VA.tiles[tile || "t_dirt"], w/30, len/30, true);
          var m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, alphaMap:softMask, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })); m.rotation.x = -Math.PI/2; m.userData.keep = true;
          var gp = new THREE.Group(); gp.add(m); gp.position.set((x0 + x1)/2, 0.07, (z0 + z1)/2); gp.rotation.y = vert ? 0 : Math.PI/2; gp.userData.keep = true; G.add(gp); reg(gp, (x0 + x1)/2, (z0 + z1)/2, 1300);
        }
        dirtRoad(-626, 45, -1128, 45, 17, "t_dirt");                             // 큰길 (큰길 쪽에서 들어와요)
        dirtRoad(-920, 40, -920, 122, 15, "t_dirt");                             // 큰 기와집으로 가는 길
        // ---- 집 (앞/옆/뒤 그림을 네 면에 세우고, 속은 단색 덩어리로 채워요) ----
        function houseFull(d, x, z, rot){
          var P = VA.props, f = P[d.f], s = P[d.s || d.f], b = P[d.b || d.f]; if(!f || !s || !b) return;
          var W = d.W, Hf = W*f.h/f.w, D = d.D || Math.min(W*1.05, Hf*s.w/s.h*0.9), g = new THREE.Group();
          if(d.compound){ compoundTop(g, W, D, Hf); }
          else
          if(d.hip && hipBody(g, { fk:d.f, sk:d.s || d.f, bk:d.b || d.f, W:W, D:d.D || W*0.7, Hf:Hf, wallCol:d.core, roofCol:d.roofCol })){ g.userData.hipDone = true; }
          else {
          var wh = Hf*(d.roof === "flat" ? 0.84 : 0.4), core = new THREE.Mesh(new THREE.BoxGeometry(W*0.84, wh, D*0.84), new THREE.MeshLambertMaterial({ color:d.core || 0x6a625a })); core.position.y = wh/2; core.castShadow = true; g.add(core);
          if(d.roof === "flat"){ var slab = new THREE.Mesh(new THREE.BoxGeometry(W*0.9, Hf*0.06, D*0.9), new THREE.MeshLambertMaterial({ color:0x8c8a84 })); slab.position.y = wh + Hf*0.03; g.add(slab); }
          else {
            var rkey = d.roof === "thatch" ? "r_thatch" : (d.roof === "gaw" ? "r_gaw" : null), rtx = rkey && VA ? vtex(VA.tiles[rkey], 4, 2, true) : null, rb = W*0.5*1.3, rise = Hf*0.42;
            var rgg = new THREE.CylinderGeometry(rb*(d.roof === "thatch" ? 0.2 : 0.3), rb, rise, 4, 1); rgg.rotateY(Math.PI/4);
            var rfm = new THREE.Mesh(rgg, new THREE.MeshLambertMaterial({ color:rtx ? 0xffffff : (d.roofCol || 0x7a8794), map:rtx })); rfm.scale.set(1, 1, D/W); rfm.position.y = wh + rise/2 - 0.3; rfm.castShadow = true; g.add(rfm);
          }
          }
          function pl(e, w, h2, px, pz, ry, mir){
            var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h2), new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xece6dc }));
            m.position.set(px, h2/2, pz); m.rotation.y = ry; if(mir) m.scale.x = -1; g.add(m);
          }
          var Ws = Hf*s.w/s.h, Wb = W*b.h > 0 ? Hf*b.w/b.h : W;
          if(!(d.hip && g.children.length > 0 && g.userData.hipDone)){
            pl(f, W, Hf, 0, D/2, 0); pl(b, Math.min(Wb, W*1.04), Hf, 0, -D/2, Math.PI, true);
            pl(s, Math.min(Ws, D*1.15), Hf, -W*0.47, 0, -Math.PI/2); pl(s, Math.min(Ws, D*1.15), Hf, W*0.47, 0, Math.PI/2, true);
          }
          g.position.set(x, 0, z); g.rotation.y = rot; CP.add(g);
          var sh = new THREE.Mesh(new THREE.PlaneGeometry(W*1.0, D*1.0), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.42, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.set(x + 2, 0.09, z + 1.5); CP.add(sh);
          reg(g, x, z, 950); reg(sh, x, z, 950);
          var horiz = Math.abs(Math.sin(rot)) < 0.5; VIL_RECTS.push({ x:x, z:z, hx:(horiz ? W : D)*0.46, hz:(horiz ? D : W)*0.46 });
        }
        var NR = Math.PI, SR = 0;
        var HD = {
          M:  { f:"m_front", s:"m_side", b:"m_back", W:76, D:60, core:0x6a665e, compound:true, roof:"gaw" },
          B:  { f:"b_front", s:"b_side", b:"b_back", W:34, D:26, core:0x8c5a46, roof:"flat" },
          SL: { f:"sl_blue", W:32, D:23, core:0x9aa4ad, hip:true, roof:"metal", roofCol:0x7f98ad },
          T1: { f:"t1", W:24, D:17, core:0xa9894c, hip:true, roof:"thatch" }, T2: { f:"t2", W:23, D:17, core:0xa9894c, hip:true, roof:"thatch" },
          TS: { f:"tl_s", W:22, D:17, core:0x8a847a, hip:true, roof:"gaw" }, TM: { f:"t_med", W:34, D:22, core:0xa9894c, hip:true, roof:"thatch" },
          TL: { f:"tl_m_back", s:"tl_m_side", b:"tl_m_back", W:34, D:24, core:0x8a847a, hip:true, roof:"gaw" },
          WT: { f:"w_thatch", W:27, D:18, core:0xa9894c, hip:true, roof:"thatch" }, WB: { f:"w_blue", W:22, D:16, core:0x9aa0a8, hip:true, roof:"metal", roofCol:0x8aa0b4 },
          WA: { f:"wA_front", s:"wA_front", b:"wA_back", W:25, D:17, core:0x8a8984, hip:true, roof:"metal", roofCol:0x8a8d90 }, WC: { f:"wB_front", s:"wB_side", b:"wB_back", W:23, D:17, core:0x84705e, hip:true, roof:"metal", roofCol:0x8a6a55 }
        };
        window.__houseFull = function(k, x, z, rot){ houseFull(HD[k], x, z, rot); };
        var rs = 20251, rnd = function(){ rs = (rs*16807) % 2147483647; return rs/2147483647; };
        function overlapsRect(x, z, hx, hz){ for(var i = 0; i < VIL_RECTS.length; i++){ var r = VIL_RECTS[i]; if(Math.abs(x - r.x) < hx + r.hx && Math.abs(z - r.z) < hz + r.hz) return true; } return false; }
        houseFull(HD.M, -920, 152, NR); var YARDITEMS = [["jars", 5.5], ["firewood", 4], ["pumpkin", 3.2], ["line", 11], ["bike", 6], ["table", 6.5], ["cabbage", 4.2], ["lettuce", 4.2], ["jars", 5], ["bush", 4.4]];
        var ROWS = [
          { z:84,  rot:NR, maxD:26, skip:[[-990, -850]] },
          { z:136, rot:NR, maxD:25, skip:[[-972, -868], [-1110, -990]] },
          { z:172, rot:NR, maxD:21, skip:[[-972, -868], [-1110, -990]] }
        ];
        var KINDS = ["B", "SL", "T1", "T2", "TS", "TM", "TL", "WT", "WB", "WA", "WC", "SL", "T1", "TM", "TL", "B"];
        ROWS.forEach(function(R, ri){
          var cursor = -722, guard = 0;
          while(cursor > -1108 && guard++ < 60){
            var kk = KINDS[Math.floor(rnd()*KINDS.length)], d = HD[kk]; if(d.D > R.maxD){ continue; }
            var W = d.W*(0.96 + rnd()*0.1), x = cursor - W/2, skipped = false;
            for(var si = 0; si < R.skip.length; si++){ var sk = R.skip[si]; if(x + W/2 > sk[0] && x - W/2 < sk[1]){ cursor = sk[0] - 4; skipped = true; break; } }
            if(skipped) continue;
            if(x - W/2 < -1110) break;
            var horiz = true, hx = W*0.46, hz = d.D*0.46;
            if(overlapsRect(x, R.z, hx + 1, hz + 1)){ cursor -= 8; continue; }
            var dd = {}; for(var kq in d) dd[kq] = d[kq]; dd.W = W; houseFull(dd, x, R.z, R.rot);
            var fz = R.rot === NR ? -1 : 1, nIt = 1 + Math.floor(rnd()*2.2);
            for(var q = 0; q < nIt; q++){
              var yi = YARDITEMS[Math.floor(rnd()*YARDITEMS.length)], yx = x + (rnd() - 0.5)*W*0.9, yz = R.z + fz*(d.D/2 + 4.5 + rnd()*4);
              if(overlapsRect(yx, yz, 4, 4)) continue;
              if(yi[0] === "bike") card("y_bicycle", yx, yz, yi[1]); else if(yi[0] === "bush") card(rnd() < 0.5 ? "p_bush0" : "p_bush1", yx, yz, yi[1]);
              else if(yi[0] === "cabbage") card("q_cabbage", yx, yz, yi[1]); else if(yi[0] === "lettuce") card("q_lettuce", yx, yz, yi[1]);
              else card({ jars:"y_jars", firewood:"y_firewood", pumpkin:"y_pumpkin", line:"q_line", table:"q_table" }[yi[0]], yx, yz, yi[1]);
            }
            cursor -= W + 4 + rnd()*7;
          }
        });
        // ---- 큰 기와집 마당: 길 양옆 텃밭과 터널 하우스 ----
        [-1005, -1030, -1055, -1080, -1100].forEach(function(gx, gi){ [128, 140, 152, 164, 176].forEach(function(gz, zi){ var kk = ["q_cabbage", "q_lettuce", "q_pepper", "q_onion"][(gi + zi) % 4]; if(!overlapsRect(gx, gz, 4, 4) && !(gi === 2 && zi > 2)) card(kk, gx + (rnd() - 0.5)*3, gz + (rnd() - 0.5)*3, kk === "q_onion" ? 6 : (kk === "q_pepper" ? 5 : 4.2)); }); });
        card("q_tunnel", -1070, 130, 10); card("q_tunnel", -1070, 168, 10);
        // ---- 큰길 남쪽: 텃밭과 터널 하우스 (카메라가 집 지붕에 가리지 않게 낮은 것만) ----
        for(var gx = -742, gk = 0; gx > -1100; gx -= 15, gk++){
          [-12, 8, 27].forEach(function(gz, zi){
            if(overlapsRect(gx, gz, 5, 5)) return;
            var m4 = (gk + zi*2) % 7;
            if(m4 === 3){ card("q_tunnel", gx, gz, 9); return; }
            var kk = ["q_cabbage", "q_lettuce", "q_pepper", "q_onion", "y_veg"][(gk + zi) % 5];
            card(kk, gx + (rnd() - 0.5)*3, gz + (rnd() - 0.5)*3, kk === "q_onion" ? 6 : (kk === "q_pepper" ? 5 : 4.2));
          });
        }
        // ---- 마당 소품 ----
        function put(key, x, z, h, ry){ card(key, x, z, h); }
        [-700, -790, -880, -1000, -1090].forEach(function(px){ put("q_pole", px, 56, 31); VIL_RECTS.push({ x:px, z:56, hx:1.2, hz:1.2 }); });
        put("q_table", -945, 108, 7); put("q_table", -895, 112, 7); 
        ["persimmon", "apple", "persimmon", "apple"].forEach(function(k, i){ var tx = -715 - i*34, tz = 190; if(!overlapsRect(tx, tz, 4, 4)) put(k, tx, tz, 22 + (i % 3)*2); });
        buildBigTree(-985, 112, 1.25); VIL_RECTS.push({ x:-985, z:112, hx:5, hz:5 }); buildBigTree(-856, 118, 1.1); VIL_RECTS.push({ x:-856, z:118, hx:5, hz:5 });
        ["p_bush0", "p_bush1", "p_cosmos", "y_wild", "p_bush2"].forEach(function(k, i){ for(var q = 0; q < 8; q++){ var bx = -724 - ((i*61 + q*47) % 380), bz = (q % 2 ? 36 : 56) + ((i*13 + q*7) % 5); if(!overlapsRect(bx, bz, 3, 3)) put(k, bx, bz, 3.6 + (q % 3)*0.6); } });
        // ---- 탈것 (E 로 타고 내려요) ----
        var rides = [], riding = null;
        function cardR(key, x, z, h, kind){
          var e = VA.props[key], w = h*e.w/e.h, piv = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map:baseTex(e), transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
          m.position.y = h*0.5; piv.add(m); var m2 = m.clone(); m2.position.z = 0.7; piv.add(m2); piv.userData.keep = true; piv.rotation.y = (x*7 + z) % 2 < 1 ? 0 : Math.PI; piv.position.set(x, 0.1, z); CP.add(piv);
          var sh = new THREE.Mesh(new THREE.PlaneGeometry(w*0.8, w*0.35), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.45, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.set(x + 1, 0.09, z + 0.5); CP.add(sh);
          var ring = new THREE.Mesh(new THREE.RingGeometry(w*0.55, w*0.62, 24), new THREE.MeshBasicMaterial({ color:0xffe27a, transparent:true, opacity:0.55, side:THREE.DoubleSide, depthWrite:false })); ring.rotation.x = -Math.PI/2; ring.position.set(x, 0.12, z); CP.add(ring);
          ring.userData.keep = true; sh.userData.keep = true; var it = { kind:kind, piv:piv, m:m, m2:m2, sh:sh, ring:ring, x:x, z:z, mul:kind === "bike" ? 1.85 : 1.45, name:kind === "bike" ? "자전거" : "경운기" }; rides.push(it); return it;
        }
        cardR("q_bike", -705, 30, 10, "bike"); cardR("q_bike", -1005, 60, 10, "bike"); cardR("q_tiller", -860, 62, 11, "tiller"); cardR("q_tiller", -1090, 28, 11, "tiller");
        function nearRide(p){ for(var i = 0; i < rides.length; i++){ var r = rides[i]; if(r !== riding && Math.hypot(p.x - r.x, p.z - r.z) < 10) return r; } return null; }
        function dismount(p, quiet){
          if(!riding) return; var r = riding, c = state.cam.yaw;
          r.x = p.x - Math.cos(c)*6; r.z = p.z + Math.sin(c)*6; if(!vilWalkable(r.x, r.z)){ r.x = p.x; r.z = p.z; }
          var fi = facers.indexOf(r.piv); if(fi >= 0) facers.splice(fi, 1); r.piv.rotation.y = hh(r.x, r.z) < 0.5 ? 0 : Math.PI; r.m.scale.x = 1; r.m.updateMatrix(); r.m2.visible = true; r.piv.position.set(r.x, 0.1, r.z); r.sh.position.set(r.x + 1, 0.09, r.z + 0.5); r.ring.position.set(r.x, 0.12, r.z); r.ring.visible = true; r.sh.visible = true;
          window.vilRideMul = 1; riding = null; if(!quiet) showToast("🛑 " + r.name + "에서 내렸어요.");
        }
        window.vilRideHint = function(p){ if(riding) return "E 눌러 " + riding.name + "에서 내리기"; var r = nearRide(p); return r ? "E 눌러 " + r.name + " 타기" : null; };
        window.vilRideInteract = function(p){
          if(riding){ dismount(p); return true; }
          var r = nearRide(p); if(!r) return false;
          riding = r; window.vilRideMul = r.mul; r.ring.visible = false; r.m2.visible = false; if(facers.indexOf(r.piv) < 0) facers.push(r.piv); showToast(r.kind === "bike" ? "🚲 자전거를 탔어요! 더 빨리 달릴 수 있어요. (내리려면 E)" : "🚜 경운기를 탔어요! 털털털 달려요. (내리려면 E)");
          return true;
        };
        window.vilRideTick = function(t, dt, p){
          if(riding && p.x >= VIL.westX - 2){ dismount(p, true); return; }
          if(!riding){ for(var i = 0; i < rides.length; i++) rides[i].ring.material.opacity = 0.35 + 0.2*Math.sin(t/300 + i); return; }
          var c = state.cam.yaw, r = riding, rx = p.x + Math.sin(c)*0.9, rz = p.z + Math.cos(c)*0.9;
          r.piv.position.set(rx, 0.1 + (r.kind === "tiller" ? Math.sin(t/45)*0.18 : 0), rz); r.sh.position.set(rx + 1, 0.09, rz + 0.5);
          var want = p.dir === "right" ? -1 : (p.dir === "left" ? 1 : r.m.scale.x); if(r.m.scale.x !== want){ r.m.scale.x = want; r.m.updateMatrix(); }
        };
        CP = prevCP;
      })();

      // 마을에 들어오면 농사 현황과 벼 자라기를 갱신해요 (기존 맵에서는 아무 일도 안 해요)
      var vTick = 0, cullT = 1, worldCulled = false;
      villageExtra = function(t, dt, p){
        var inV = p.x < VIL.westX - 20;
        if(inV){ var zz = zoneOf(p.z); if(zz && VILLAGE_PLACE.id !== "village" + zz.n){ VILLAGE_PLACE.id = "village" + zz.n; VILLAGE_PLACE.name = "칠곡 농촌 마을 · " + (zz.n >= 1 && zz.n <= 10 ? zz.n + "구역 " : "") + zz.name; VILLAGE_PLACE.sub = zz.sub; } }
        cullT += dt;
        if(cullT > 0.3){ cullT = 0;
          for(var zi = 0; zi < zoneGroups.length; zi++) zoneGroups[zi].G.visible = Math.hypot(p.x + 1000, p.z - zoneGroups[zi].zc) < 1700;
          // 마을 깊숙이 들어가면, 멀리 있는 기존 맵 물건(나무, 건물 등 작은 것)은 안 그려요 (먼 것은 안개에 묻혀서 거의 안 보여요)
          if(typeof three !== "undefined" && three.world){
            var deep = p.x < VIL.westX - 80, wch = three.world.children, wi, wc;
            if(deep){
              for(wi = 0; wi < wch.length; wi++){
                wc = wch[wi]; if(wc._vcull === undefined){ wc._vcull = 0; try{ var bb = new THREE.Box3().setFromObject(wc), sz = bb.getSize(new THREE.Vector3()); wc._vcull = (isFinite(sz.x) && Math.max(sz.x, sz.z) < 140) ? 1 : 2; wc._vcx = (bb.min.x + bb.max.x)/2; wc._vcz = (bb.min.z + bb.max.z)/2; }catch(e){ wc._vcull = 2; } }
                if(wc._vcull !== 1) continue;
                var wdx = wc._vcx - p.x, wdz = wc._vcz - p.z, far = wdx*wdx + wdz*wdz > 1250*1250;
                if(far && wc.visible){ wc.visible = false; wc._vhid = true; } else if(!far && wc._vhid){ wc.visible = true; wc._vhid = false; }
              }
              worldCulled = true;
            } else if(worldCulled){
              for(wi = 0; wi < wch.length; wi++){ wc = wch[wi]; if(wc._vhid){ wc.visible = true; wc._vhid = false; } }
              worldCulled = false;
            }
          }
          for(var ci2 = 0; ci2 < CULL.length; ci2++){ var cu = CULL[ci2], dx2 = cu.x - p.x, dz2 = cu.z - p.z; cu.o.visible = dx2*dx2 + dz2*dz2 < cu.r*cu.r; } }
        if(window.vilRiceTick) window.vilRiceTick(t, dt, p);
        if(window.vilRideTick) window.vilRideTick(t, dt, p);
        badge.style.display = inV ? "block" : "none";
        for(var bt = 0; bt < bigTrees.length; bt++){ var T3 = bigTrees[bt], w3 = (typeof windU !== "undefined" && windU) ? windU.gust.value : 1; T3.leaves.rotation.z = Math.sin(t/1000*0.45 + T3.ph)*0.012*w3; T3.leaves.rotation.x = Math.sin(t/1000*0.33 + T3.ph*2)*0.008*w3; }
        if(inV){ vTick += dt; if(vTick > 1){ vTick = 0; window.villageRefresh(); } }
      };
      // 움직이지 않는 물건은 같은 재질끼리 구역별로 하나로 합쳐서 그려요 (그리기 횟수가 수십 분의 1로 줄어요)
      (function batchStatic(){
        V.updateMatrixWorld(true);
        var skip = new Set(), winMats = new Set(window.villageWin || []), imgId = 0, canon = {}, buckets = {}, list = [];
        facers.forEach(function(f){ f.traverse(function(o){ skip.add(o); }); });
        bigTrees.forEach(function(b){ b.leaves.traverse(function(o){ skip.add(o); }); });
        V.traverse(function(o){ if(o.userData && o.userData.keep) o.traverse(function(c){ skip.add(c); }); });
        var DEFB = THREE.Material.prototype.onBeforeCompile;
        V.traverse(function(o){
          if(!o.isMesh || o.isInstancedMesh || skip.has(o) || !o.visible) return;
          var m = o.material, g = o.geometry; if(!m || Array.isArray(m) || winMats.has(m) || !g || !g.attributes || !g.attributes.position) return;
          if(m.onBeforeCompile !== DEFB || !(m.isMeshLambertMaterial || m.isMeshBasicMaterial)) return;
          var mp = m.map, im = mp && mp.image; if(im && im._bid === undefined) im._bid = ++imgId;
          var key = [m.type, m.color ? m.color.getHex() : 0, im ? im._bid : 0, mp ? mp.wrapS + "." + mp.wrapT : 0, m.transparent ? 1 : 0, m.opacity, m.alphaTest, m.side, m.emissive ? m.emissive.getHex() : 0, m.depthWrite ? 1 : 0, m.polygonOffset ? m.polygonOffsetFactor : "x", m.blending, o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0, o.renderOrder].join("|");
          o.updateMatrixWorld(true); var e = o.matrixWorld.elements, cx = Math.floor(e[12]/520), cz = Math.floor(e[14]/520);
          var bk = key + "#" + cx + "," + cz; (buckets[bk] || (buckets[bk] = { key:key, cx:cx, cz:cz, mats:m, items:[] })).items.push(o); list.push(o);
        });
        var inv = new THREE.Matrix4().copy(V.matrixWorld); if(inv.invert) inv.invert(); else inv.getInverse(inv);
        var tmpM = new THREE.Matrix4(), nm = new THREE.Matrix3(), vv = new THREE.Vector3(), chunks = [];
        Object.keys(buckets).forEach(function(bk){
          var B = buckets[bk], m0 = B.mats, items = B.items, vc = 0, ic = 0, i, j;
          items.forEach(function(o){ var g = o.geometry; vc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; });
          var pos = new Float32Array(vc*3), nor = new Float32Array(vc*3), uv = new Float32Array(vc*2), idx = new Uint32Array(ic), vo = 0, io = 0;
          items.forEach(function(o){
            var g = o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, mp = m0.map, rx = mp ? mp.repeat.x : 1, ry = mp ? mp.repeat.y : 1, ox = mp ? mp.offset.x : 0, oy = mp ? mp.offset.y : 0, n = P.count;
            tmpM.multiplyMatrices(inv, o.matrixWorld); nm.getNormalMatrix(tmpM);
            for(i = 0; i < n; i++){
              vv.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(tmpM); pos[(vo + i)*3] = vv.x; pos[(vo + i)*3 + 1] = vv.y; pos[(vo + i)*3 + 2] = vv.z;
              if(N){ vv.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(nm).normalize(); nor[(vo + i)*3] = vv.x; nor[(vo + i)*3 + 1] = vv.y; nor[(vo + i)*3 + 2] = vv.z; } else nor[(vo + i)*3 + 1] = 1;
              if(U){ uv[(vo + i)*2] = U.getX(i)*rx + ox; uv[(vo + i)*2 + 1] = U.getY(i)*ry + oy; }
            }
            if(g.index){ for(j = 0; j < g.index.count; j++) idx[io++] = g.index.getX(j) + vo; } else { for(j = 0; j < n; j++) idx[io++] = vo + j; }
            vo += n;
          });
          var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere();
          var ck = key2(m0); var cm = canon[ck];
          if(!cm){ cm = m0.clone(); if(m0.map){ var tt = m0.map.clone(); tt.repeat.set(1, 1); tt.offset.set(0, 0); tt.needsUpdate = true; cm.map = tt; if(m0.map.image && !m0.map.image.complete){ (function(a, b){ var im2 = a.image; if(im2 && im2.addEventListener) im2.addEventListener("load", function(){ b.needsUpdate = true; }); })(m0.map, tt); } } canon[ck] = cm; }
          var ms = new THREE.Mesh(geo, cm); ms.castShadow = items[0].castShadow; ms.receiveShadow = items[0].receiveShadow; ms.renderOrder = items[0].renderOrder; ms.userData.merged = true; V.add(ms); chunks.push(ms);
          reg(ms, (B.cx + 0.5)*520, (B.cz + 0.5)*520, 1450);
        });
        function key2(m){ var mp = m.map, im = mp && mp.image; return [m.type, m.color ? m.color.getHex() : 0, im ? im._bid : 0, mp ? mp.wrapS + "." + mp.wrapT : 0, m.transparent ? 1 : 0, m.opacity, m.alphaTest, m.side, m.emissive ? m.emissive.getHex() : 0, m.depthWrite ? 1 : 0, m.polygonOffset ? m.polygonOffsetFactor : "x", m.blending].join("|"); }
        list.forEach(function(o){ o._merged = true; if(o.parent) o.parent.remove(o); });
        CULL = CULL.filter(function(cu){ var o = cu.o; if(o._merged) return false; if(!o.isMesh && o.children && o.children.length === 0 && !o.userData.merged) return false; return true; });
        window.__batchInfo = { merged:list.length, chunks:chunks.length };
      })();
      // 움직이지 않는 물건은 매 프레임 위치를 다시 계산하지 않게 고정해요 (카메라를 따라 도는 카드와 잎 뭉치는 제외)
      (function(){
        var ex = new Set(facers); bigTrees.forEach(function(b){ ex.add(b.leaves); });
        V.updateMatrixWorld(true);
        V.traverse(function(o){ if(o === V || ex.has(o) || o.userData.keep) return; o.matrixAutoUpdate = false; });
      })();
    })();
