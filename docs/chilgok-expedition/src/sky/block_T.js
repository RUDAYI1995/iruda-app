    // ---------- 넓힌 땅 + 마법 나무 (1단계: 임시 회색 모형 — 구조·걷기 확인용) ----------
    // 기존 맵의 땅(x ≤ 650)은 그대로 두고, 그 동쪽으로 같은 잔디 땅을 하늘섬 구역 아래까지 이어 붙여요.
    // 줄기 + 줄기를 빙 둘러 오르는 로프길(나선) + 층마다 쉼터가 있고, 걷는 계산은 파일 위쪽 SKY_SPIRAL 이 맡아요.
    var treeExtra = null;
    (function buildMagicTree(){
      var T = SKY.tree, root = new THREE.Group(); root.name = "magicTree"; sky.add(root);
      // 넓힌 땅 (동쪽): 기존 땅 끝(x=650)에서 이어져요
      var ground = extGround(650, SKY.ground.x1, 0); ground.name = "extGround"; root.add(ground);

      // 줄기: 아래 자연 줄기(껍질) → 중간 고딕 탑 → 위 껍질. 그림이 없으면 단색.
      function tileTex(e, rx, ry){
        if(!e) return null;
        var im = new Image(), t = new THREE.Texture(im);
        im.onload = function(){ t.needsUpdate = true; }; im.src = e.src;
        t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.repeat.set(rx, ry);
        t.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
        if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
        return t;
      }
      var barkTex = art ? tileTex(art.bark, 6, 8) : null, towerTex = art ? tileTex(art.tower, 5, 5) : null, stoneTex = art ? tileTex(art.stone, 1, 1) : null;
      var trunkMats = [];
      function trunkMat(map, col){ var m = new THREE.MeshLambertMaterial({ color:map ? 0xffffff : col, map:map || null, transparent:true }); trunkMats.push(m); return m; }
      var mBark = trunkMat(barkTex, 0x8b7762), mBark2 = trunkMat(barkTex, 0x8b7762), mTower = trunkMat(towerTex, 0xb8a9a0);
      function seg(y0, y1, mat, bulge){
        var r0 = skyTrunkR(y0) + (bulge || 0), r1 = skyTrunkR(y1) + (bulge || 0);
        var m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, y1 - y0, 40, 1, true), mat);
        m.position.set(T.x, (y0 + y1)/2, T.z); m.castShadow = true; m.receiveShadow = true; root.add(m); return m;
      }
      var TW0 = 300, TW1 = 540;
      seg(20, TW0, mBark); seg(TW0, TW1, mTower, 0); seg(TW1, T.topY, mBark2);
      // 뿌리 퍼짐 (땅에서 줄기로)
      var mFlare = trunkMat(art ? tileTex(art.bark, 6, 0.9) : null, 0x8b7762);
      var flare = new THREE.Mesh(new THREE.CylinderGeometry(skyTrunkR(20), T.r0 + 9, 20, 40, 1, true), mFlare);
      flare.position.set(T.x, 10, T.z); flare.receiveShadow = true; root.add(flare);
      var tcap = new THREE.Mesh(new THREE.CircleGeometry(skyTrunkR(T.topY), 32), mBark); tcap.rotation.x = -Math.PI/2; tcap.position.set(T.x, T.topY, T.z); root.add(tcap);

      // 꼭대기 큰 섬: 로프길 끝(높이 600)에서 이어지는 둥근 섬. 줄기는 한가운데로 뚫고 올라가요.
      var CR = SKY.crown, crown = makeIsland(CR.r, { grass:0x8fd37a });
      crown.position.set(T.x, CR.y, T.z); root.add(crown);
      (function(){
        var gt = art ? tileTex(art.grass, CR.r/22, CR.r/22) : null, st = art ? tileTex(art.stone, 3, 3) : null;
        var gm = new THREE.Mesh(new THREE.RingGeometry(26, CR.r*0.985, 48, 1), new THREE.MeshLambertMaterial({ color:gt ? 0xffffff : 0x8fd37a, map:gt, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }));
        gm.rotation.x = -Math.PI/2; gm.position.y = 0.06; gm.receiveShadow = true; crown.add(gm);
        var sm2 = new THREE.Mesh(new THREE.RingGeometry(26, 50, 48, 1), new THREE.MeshLambertMaterial({ color:st ? 0xffffff : 0xb89868, map:st, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4 }));
        sm2.rotation.x = -Math.PI/2; sm2.position.y = 0.1; sm2.receiveShadow = true; crown.add(sm2);      // 줄기 둘레 돌바닥 광장
      })();
      scatterTrees(crown, 22, CR.r, function(lx, lz){ return Math.hypot(lx, lz) < 56 || skyPropBlocked(T.x + lx, T.z + lz) || Math.hypot(lx - SKY_PROPS.defs.arch.x + T.x, lz - SKY_PROPS.defs.arch.z + T.z) < 12; }, true);

      // ---- 꼭대기 섬 건물 (진짜 3D: 돌아가면 뒤와 옆이 나와요) ----
      (function(){
        var D = SKY_PROPS.defs;
        var wallTex = art ? tileTex(art.tower, 1.4, 1.4) : null;
        var wallM = new THREE.MeshLambertMaterial({ color:wallTex ? 0xffffff : 0xb3a79e, map:wallTex || null });
        var trimM = new THREE.MeshLambertMaterial({ color:0xa89a8f });
        var roofM = new THREE.MeshLambertMaterial({ color:0x4e5675, flatShading:true });
        var glassM = new THREE.MeshBasicMaterial({ color:0x4fc9ad, fog:false, side:THREE.DoubleSide });
        var woodM = new THREE.MeshLambertMaterial({ color:0x6b4a3a });
        function put(b, x, y, z){ b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true; return b; }
        function place(g, d){                                            // 건물 앞면이 줄기(섬 가운데)를 향하게
          g.position.set(d.x - T.x, 0.1, d.z - T.z); g.rotation.y = Math.atan2(-Math.cos(d.a), -Math.sin(d.a)); crown.add(g);
        }
        function spire(g, x, y, z, h, r){ g.add(put(new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), roofM), x, y + h/2, z)); }
        // 예배당
        (function(){
          var g = new THREE.Group(), W = 14, Hh = 10, Ln = 20;
          g.add(put(new THREE.Mesh(new THREE.BoxGeometry(W, Hh, Ln), wallM), 0, Hh/2, 0));
          var sh = new THREE.Shape(); sh.moveTo(-W/2 - 1, 0); sh.lineTo(W/2 + 1, 0); sh.lineTo(0, 9); sh.lineTo(-W/2 - 1, 0);
          var roof = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth:Ln + 2, bevelEnabled:false }), roofM); g.add(put(roof, 0, Hh, -(Ln + 2)/2));
          [[-W/2, Ln/2], [W/2, Ln/2], [-W/2, -Ln/2], [W/2, -Ln/2]].forEach(function(c){ g.add(put(new THREE.Mesh(new THREE.BoxGeometry(1.6, Hh + 2, 1.6), trimM), c[0], (Hh + 2)/2, c[1])); spire(g, c[0], Hh + 2, c[1], 6, 1.3); });
          spire(g, 0, Hh + 9, Ln/2 - 1, 7, 1.0);
          var door = new THREE.Mesh(new THREE.BoxGeometry(3.4, 5.4, 0.5), woodM); door.position.set(0, 2.7, Ln/2 + 0.1); g.add(door);
          var dsh = new THREE.Shape(); dsh.moveTo(-1.7, 0); dsh.lineTo(1.7, 0); dsh.lineTo(1.7, 4.6); dsh.lineTo(0, 7); dsh.lineTo(-1.7, 4.6); dsh.lineTo(-1.7, 0);
          door.visible = false; var door2 = new THREE.Mesh(new THREE.ShapeGeometry(dsh), woodM); door2.position.set(0, 0.05, Ln/2 + 0.08); g.add(door2);
          for(var k = -1; k <= 1; k += 2) for(var q = -1; q <= 1; q++){                                                // 옆면 창문(밤에 빛나요)
            var w1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 1.8), glassM); w1.position.set(k*(W/2 + 0.05), 5.2, q*6); g.add(w1);
          }
          var rose = new THREE.Mesh(new THREE.CircleGeometry(1.0, 18), glassM); rose.position.set(0, 8.6, Ln/2 + 0.06); g.add(rose);
          var back = new THREE.Mesh(new THREE.CircleGeometry(1.0, 18), glassM); back.rotation.y = Math.PI; back.position.set(0, 8.6, -Ln/2 - 0.06); g.add(back);
          place(g, D.chapel);
        })();
        // 정자
        (function(){
          var g = new THREE.Group();
          g.add(put(new THREE.Mesh(new THREE.CylinderGeometry(9.5, 10, 1.2, 6), trimM), 0, 0.6, 0));
          for(var i = 0; i < 6; i++){ var a = i*Math.PI/3 + Math.PI/6; g.add(put(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 8, 8), wallM), Math.cos(a)*8, 5.2, Math.sin(a)*8)); }
          for(i = 0; i < 6; i++){ var a1 = i*Math.PI/3 + Math.PI/6, a2 = (i + 1)*Math.PI/3 + Math.PI/6; if(i === 4 || i === 3) continue;       // 앞쪽 두 칸은 열어둬서 들어가는 입구
            var mx = (Math.cos(a1) + Math.cos(a2))*4, mz = (Math.sin(a1) + Math.sin(a2))*4;
            var rail = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.5, 0.4), trimM); rail.position.set(mx, 2.6, mz); rail.rotation.y = -(a1 + a2)/2 - Math.PI/2 + 0; g.add(put(rail, mx, 2.6, mz)); }
          var cone = new THREE.Mesh(new THREE.ConeGeometry(11.5, 6.5, 6), roofM); g.add(put(cone, 0, 12.4, 0));
          spire(g, 0, 15.6, 0, 4, 0.7);
          place(g, D.gazebo);
        })();
        // 크리스털 문
        (function(){
          var g = new THREE.Group();
          [-1, 1].forEach(function(sd){ g.add(put(new THREE.Mesh(new THREE.BoxGeometry(3.4, 14, 3.4), wallM), sd*9, 7, 0)); spire(g, sd*9, 14, 0, 6, 2.2); });
          var ring = archRing(0, 12, 6.6, 2.4, 3.4, 0xb3a79e); g.add(ring);
          g.add(put(new THREE.Mesh(new THREE.BoxGeometry(24, 1.4, 6), trimM), 0, 0.7, 0));
          [[-4.5, 2.4, 1.4, 0x66f2ff], [4.5, 2.4, 1.4, 0x66f2ff], [0, 9, 2.2, 0x66f2ff], [-12.5, 1.8, 1.0, 0xff8fe0], [12.5, 1.8, 1.0, 0xff8fe0]].forEach(function(c){ crystal(g, c[0], c[1] + 0.8, 3.2, c[2], c[3]); });
          var big = crystal(g, 0, 21.5, 0, 3.2, 0x66f2ff);
          place(g, D.gate);
        })();
        // 아치 (섬 입구 문: 로프길 끝에서 걸어 나오는 길목)
        (function(){
          var g = new THREE.Group();
          [-1, 1].forEach(function(sd){ g.add(put(new THREE.Mesh(new THREE.BoxGeometry(2.2, 11, 2.2), wallM), sd*5.2, 5.5, 0)); spire(g, sd*5.2, 11, 0, 4.5, 1.6); });
          g.add(archRing(0, 9, 3.6, 1.8, 2.2, 0xb3a79e));
          place(g, D.arch);
        })();
        // 광장 둘레의 크리스털 장식
        for(var ci = 0; ci < 9; ci++){
          var ca = ci*0.7 + 0.3, cr = 52 + (ci % 3)*9, cx = Math.cos(ca)*cr, cz = Math.sin(ca)*cr;
          if(skyPropBlocked(T.x + cx, T.z + cz)) continue;
          crystal(crown, cx, 2 + (ci % 2)*0.6, cz, 0.9 + (ci % 3)*0.4, ci % 2 ? 0xff8fe0 : 0x66f2ff);
        }
      })();
      addFall(crown, CR.r, Math.max(12, CR.y - SEA_Y + 8));

      // 수관: 잎 덩어리 그림 4종을 카드로 (카메라를 향해 돌고, 바람에 살랑살랑)
      var canopyCards = [];
      if(art && art.canopies && art.canopies.length){
        var cTex = art.canopies.map(function(e){ return artTex(e); });
        var CP = [[0,-70,740,200,0],[1,60,750,190,1],[3,0,800,230,2],[0,70,800,170,3],[1,-60,820,170,4],[2,-95,720,170,5],[2,100,730,160,6],[3,-40,745,190,7],[0,40,720,150,8],[1,0,700,140,9]];
        CP.forEach(function(c){
          var e = art.canopies[c[0]], w = c[3], h = w*e.h/e.w;
          var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map:cTex[c[0]], transparent:true, alphaTest:0.02, depthWrite:false, side:THREE.DoubleSide }));
          m.position.set(T.x + c[1]*0.5, c[2], T.z + c[1]*0.2); m.renderOrder = c[4]; root.add(m); facers.push(m); canopyCards.push({ m:m, ph:c[4]*1.7, y:c[2], minOp:0.14 + 0.1*(c[4] % 3) });
        });
      } else {
        var canopyCols = [0xf4a3c4, 0x9be6c9, 0xc3a6ee, 0xf7c0a6, 0x8fd8e8], cg = new THREE.IcosahedronGeometry(1, 1);
        for(var ci = 0; ci < 11; ci++){
          var a = ci*2.4, rr = 34 + (ci % 4)*16, sz = 44 + (ci % 3)*12;
          var cm = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ color:canopyCols[ci % canopyCols.length], flatShading:true }));
          cm.scale.set(sz, sz*0.75, sz); cm.position.set(T.x + Math.cos(a)*rr, T.topY + 62 + (ci % 3)*24, T.z + Math.sin(a)*rr);
          cm.castShadow = true; root.add(cm);
        }
      }

      // 로프길: 나선 중심선을 따라 판자(instanced) + 양옆 밧줄/기둥
      var S = SKY_SPIRAL, N = Math.floor(T.topY);                  // 높이 1 간격으로 샘플
      var plankGeo = new THREE.BoxGeometry(T.hw*2, 0.9, 4.1);
      var plankMat = new THREE.MeshLambertMaterial({ color:0xa8845a });
      if(art && art.plank){ var pt = tileTex(art.plank, 1, 1); pt.wrapS = pt.wrapT = THREE.ClampToEdgeWrapping; plankMat.map = pt; plankMat.color.set(0xffffff); }
      var stoneMat = new THREE.MeshLambertMaterial({ color:stoneTex ? 0xffffff : 0xb89868, map:stoneTex || null });
      var stones = new THREE.InstancedMesh(plankGeo, stoneMat, N + 1); stones.receiveShadow = true; var si = 0;
      var planks = new THREE.InstancedMesh(plankGeo, plankMat, N + 1); planks.receiveShadow = true; planks.castShadow = true;
      var ropeGeo = new THREE.BoxGeometry(0.35, 0.35, 4.2), ropeMat = new THREE.MeshLambertMaterial({ color:0xe3d3a8 });
      var ropes = new THREE.InstancedMesh(ropeGeo, ropeMat, (N + 1)*2);
      var postGeo = new THREE.CylinderGeometry(0.28, 0.28, 5, 6), postMat = new THREE.MeshLambertMaterial({ color:0x6b5a4a });
      var posts = new THREE.InstancedMesh(postGeo, postMat, Math.ceil((N + 1)/4)*2);
      var d = new THREE.Object3D(), d2 = new THREE.Object3D(), pi = 0, ri = 0, qi = 0; d.rotation.order = "YXZ";
      for(var k = 0; k <= N; k++){
        var y = k, yA = Math.max(0, y - 0.6), yB = Math.min(T.topY, y + 0.6);
        var p0 = skySpiralAt(yA), p1 = skySpiralAt(yB), pc = skySpiralAt(y);
        var tx = p1.x - p0.x, tz = p1.z - p0.z, hd = Math.hypot(tx, tz) || 1, pitch = Math.atan2(yB - yA, hd);
        d.rotation.set(-pitch, Math.atan2(tx, tz), 0);
        var rx = Math.cos(pc.th), rz = Math.sin(pc.th), ex = skyExtraW(y), wk = (T.hw*2 + ex)/(T.hw*2);
        d.scale.set(wk, 1, 1);
        d.position.set(pc.x + rx*ex/2, y - 0.45, pc.z + rz*ex/2); d.updateMatrix(); if(ex > 1.5) stones.setMatrixAt(si++, d.matrix); else planks.setMatrixAt(pi++, d.matrix);
        d.scale.set(1, 1, 1);
        for(var sd = -1; sd <= 1; sd += 2){
          var off = sd < 0 ? -(T.hw - 0.3) : (T.hw - 0.3 + ex);          // 안쪽은 그대로, 바깥쪽 가장자리만 쉼터에서 넓어져요
          d.position.set(pc.x + rx*off, y + 4.2, pc.z + rz*off); d.updateMatrix(); ropes.setMatrixAt(ri++, d.matrix);
          if(k % 4 === 0){ d2.position.set(pc.x + rx*off, y + 2, pc.z + rz*off); d2.updateMatrix(); posts.setMatrixAt(qi++, d2.matrix); }
        }
      }
      planks.count = pi; stones.count = si; ropes.count = ri; posts.count = qi;
      [planks, stones, ropes, posts].forEach(function(m){ m.frustumCulled = false; root.add(m); });
      // 층마다 있는 쉼터 표시 (빛나는 수정)
      T.landings.forEach(function(L){
        var lp = skySpiralAt(L), mk = new THREE.Mesh(new THREE.OctahedronGeometry(1.8, 0), glowMat(0xffe08a, 0.9)); mk.scale.y = 1.5;
        mk.position.set(lp.x + Math.cos(lp.th)*(T.hw + 6), L + 6, lp.z + Math.sin(lp.th)*(T.hw + 6)); root.add(mk); spinners.push({ m:mk, y:L + 6, ph:L });
      });

      // ---- 걷는 3D 섬 + 가지 다리 ----
      var grassTex = art ? tileTex(art.grass, 1, 1) : null;
      function grassTop(parent, r, y){            // 섬 윗면에 풀밭 그림을 깔아요
        var gt = grassTex ? grassTex.clone() : null; if(gt){ gt.needsUpdate = true; gt.repeat.set(r/22, r/22); }
        var m = new THREE.Mesh(new THREE.CircleGeometry(r*0.985, 40), new THREE.MeshLambertMaterial({ color:gt ? 0xffffff : 0x8fd37a, map:gt, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }));
        m.rotation.x = -Math.PI/2; m.position.y = y + 0.06; m.receiveShadow = true; parent.add(m); return m;
      }
      grassTop(topIsland, SKY.top.r, 0);
      SKY_ISL.forEach(function(I, i){
        var g = makeIsland(I.r, { grass:0x8fd37a }); g.position.set(I.x, I.y, I.z); root.add(g);
        scatterTrees(g, I.trees, I.r, function(lx, lz){ return Math.hypot(lx, lz) > I.r*0.55 ? false : false; }, true);
        grassTop(g, I.r, 0);
        addFall(g, I.r, Math.max(12, I.y - SEA_Y + 8));
      });
      var bmat = [], bridgeTex = art ? tileTex(art.plank, 1, 1) : null;
      SKY_BR.forEach(function(b){
        var vx = b.bx - b.ax, vz = b.bz - b.az, len = Math.hypot(vx, vz), ang = Math.atan2(vx, vz), cx = (b.ax + b.bx)/2, cz = (b.az + b.bz)/2;
        var G = new THREE.Group(); G.position.set(cx, b.y, cz); G.rotation.y = ang; root.add(G);
        // 판자 (한 장이 가로 9 x 세로 4.1 짜리라, 길이 방향으로 이어 붙여요)
        var pt = bridgeTex ? bridgeTex.clone() : null; if(pt){ pt.needsUpdate = true; pt.wrapS = pt.wrapT = THREE.RepeatWrapping; pt.repeat.set(1, len/4.1); }
        var deck = new THREE.Mesh(new THREE.BoxGeometry(SKY_BR_HW*2, 0.8, len), new THREE.MeshLambertMaterial({ color:pt ? 0xffffff : 0xa8845a, map:pt }));
        deck.position.y = -0.45; deck.receiveShadow = true; deck.castShadow = true; G.add(deck);
        if(b.fromTree){ var pad = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 0.9, 28), new THREE.MeshLambertMaterial({ color:stoneTex ? 0xffffff : 0xb89868, map:stoneTex ? (function(){ var t2 = stoneTex.clone(); t2.needsUpdate = true; return t2; })() : null }));
          pad.position.set(b.ax - cx, -0.45, b.az - cz); pad.rotation.y = -ang; G.add(pad); }
        // 굵은 가지 (다리를 받치는 나무 가지: 쉼터 쪽이 굵고 섬 쪽이 가늘어요)
        var bt = barkTex ? barkTex.clone() : null; if(bt){ bt.needsUpdate = true; bt.repeat.set(2, len/16); }
        var branch = new THREE.Mesh(new THREE.CylinderGeometry(b.fromTree ? 2.6 : 3.4, b.fromTree ? 4.2 : 3.4, len + 4, 12), new THREE.MeshLambertMaterial({ color:bt ? 0xffffff : 0x8b7762, map:bt }));
        branch.rotation.x = Math.PI/2; branch.position.set(0, -3.4, 0); branch.castShadow = true; G.add(branch);
        // 밧줄 난간 + 기둥
        for(var sd = -1; sd <= 1; sd += 2){
          var rope = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, len), new THREE.MeshLambertMaterial({ color:0xe3d3a8 })); rope.position.set(sd*(SKY_BR_HW - 0.3), 4.0, 0); G.add(rope);
          for(var pz = -len/2 + 2; pz <= len/2 - 1; pz += 8){ var post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 4.6, 6), new THREE.MeshLambertMaterial({ color:0x6b5a4a })); post.position.set(sd*(SKY_BR_HW - 0.3), 1.9, pz); G.add(post); }
        }
      });

      // 카메라가 줄기에 가까워지면 줄기를 반투명하게 (줄기 뒤에서 가려지지 않게)
      treeExtra = function(t, dt, p, skyH, tt){
        var cp = three.camera.position, dd = Math.hypot(cp.x - T.x, cp.z - T.z) - skyTrunkR(Math.max(0, Math.min(T.topY, cp.y)));
        var op = Math.max(0.22, Math.min(1, (dd - 6)/36));
        for(var i = 0; i < trunkMats.length; i++) trunkMats[i].opacity = op;
        for(i = 0; i < canopyCards.length; i++){ var cc = canopyCards[i];
          // 카메라가 잎 덩어리 가까이 오면 그 덩어리가 투명해져서, 꼭대기로 오를 때 앞이 부분적으로만 가려져요
          var cdx = cc.m.position.x - cp.x, cdy = cc.m.position.y - cp.y, cdz = cc.m.position.z - cp.z, cd = Math.sqrt(cdx*cdx + cdy*cdy + cdz*cdz);
          var ft = Math.max(0, Math.min(1, (cd - 45)/110)); cc.m.material.opacity = cc.minOp + (1 - cc.minOp)*ft*ft*(3 - 2*ft); cc.m.position.y = cc.y + Math.sin(tt*0.25 + cc.ph)*0.5; cc.m.rotation.z = Math.sin(tt*0.32 + cc.ph)*0.01*(windU ? windU.gust.value : 1) + Math.sin(tt*0.11 + cc.ph*2)*0.005; }
      };
    })();
