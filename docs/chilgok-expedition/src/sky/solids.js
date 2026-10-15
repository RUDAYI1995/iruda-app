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
        for(var i = 0; i < n; i++){ var sp = spots[i], hs = h*0.5*sp[2], pm = new THREE.Mesh(potGeo(), LM(0x58311f, { emissive:0x1d0e08 })); pm.scale.set(hs*0.72, hs, hs*0.72); pm.position.set(sp[0]*h*0.9, 0.92, sp[1]*h*0.7); pm.castShadow = true; g.add(pm); }
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
        var pk = LM(0xd9822b), pk2 = LM(0xc96f1c), leaf = LM(0x4a8a2c, { side:THREE.DoubleSide }), leaf2 = LM(0x3a6f22, { side:THREE.DoubleSide });
        for(var q = 0; q < 8; q++){ var lm = new THREE.Mesh(SOLID._lf, q % 2 ? leaf : leaf2), a2 = hh(x + q, z)*6.28, rr = 1.2 + hh(z, q)*h*1.7; lm.rotation.x = -Math.PI/2; lm.rotation.z = a2; lm.scale.set(h*0.5, h*0.42, 1); lm.position.set(Math.cos(a2)*rr, 0.18 + q*0.012, Math.sin(a2)*rr); g.add(lm); }
        for(q = 0; q < 4; q++){ var pm = new THREE.Mesh(sg, q % 2 ? pk : pk2), rr2 = 0.7 + q*0.42, a3 = q*1.7 + hh(x, z)*3, rs = h*0.34*(0.85 + hh(q, x)*0.35); pm.scale.set(rs, rs*0.78, rs); pm.position.set(Math.cos(a3)*rr2*h*0.45, rs*0.7, Math.sin(a3)*rr2*h*0.45); pm.castShadow = true; g.add(pm); addBox(g, 0.28, 0.5, 0.28, LM(0x5a6b2a), pm.position.x, rs*1.35, pm.position.z); }
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
        var e = VA.props[key]; if(!e) return null; var w = h*e.w/e.h*0.75, bh = h*0.55, g = new THREE.Group(), post = LM(0x5b4630), t = baseTex(e);
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
        var g = new THREE.Group(), met = LM(0x9ba1a6);
        addBox(g, h*1.1, 0.45, h*1.1, met, 0, h*0.55, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(s){ addBox(g, 0.35, h*0.55, 0.35, LM(0x7f858a), s[0]*h*0.46, h*0.27, s[1]*h*0.46); });
        [[1.0, 0.3], [-0.9, -0.5]].forEach(function(o){ addCyl(g, h*0.2, h*0.24, h*0.4, 10, LM(0x8a9096), o[0]*h*0.85, h*0.2, o[1]*h*0.85); });
        g.rotation.y = hh(x, z)*3; VIL_RECTS.push({ x:x, z:z, hx:h*0.9, hz:h*0.9 }); return finishSolid(g, x, z, 700, h*2);
      };
      // 터널 하우스: 반원 비닐 + 뼈대 + 흙 이랑
      SOLID.tunnel = function(x, z, h){
        var g = new THREE.Group(), r = h*0.5, len = h*1.6, vin = new THREE.MeshLambertMaterial({ color:0xe6f2ee, transparent:true, opacity:0.4, side:THREE.DoubleSide, depthWrite:false });
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
      var PLANT = { p_bush0:3, p_bush1:3, p_bush2:3, p_cosmos:3, p_sunflower:3, p_wild0:3, p_wild1:3, p_wild2:3, p_wild3:3, p_wild4:3, y_wild:3, y_sunflower:3, y_veg:3, y_leaf:3, y_treefront:3, y_treeside:3, persimmon:3, apple:3, q_cabbage:3, q_lettuce:3, q_pepper:3, q_onion:3, sheaf:3, lily:2 };
      var SOLID_KEY = { y_jars:"jars", f_jaryard:"jars", q_jars:"jars", p_jangdok:"jars", y_firewood:"firewood", p_firewood:"firewood", y_pumpkin:"pumpkin", q_pole:"pole", pole:"pole", f_fsign:"f_fsign", p_sign:"f_fsign", p_bus:"p_bus", f_straw:"f_straw", f_pump:"f_pump", f_scarecrow:"f_scarecrow", q_table:"table", q_tunnel:"tunnel", q_line:"line", p_laundry:"line", f_gazebo:"gazebo", pavilion:"gazebo", p_pyeongsang:"pyeongsang", pyeongsang:"pyeongsang", f_shop:"shop", p_stone:"stone", p_mailbox:"mailbox" };
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
