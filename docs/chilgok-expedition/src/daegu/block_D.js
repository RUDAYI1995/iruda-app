    // ================= 대구 가는 길 (국도 4호선 평지 → 고가 언덕길 → 큰 산 고개 → 대구 북구 칠곡 아파트 → 대구 도심) + 탈것 + 낙하산 =================
    // 왜관 시내 남쪽(z < -40)으로 이어 붙인 새 구역이에요. 기존 맵(z ≥ -40)은 건드리지 않아요.
    // 도로는 곡선(스플라인)을 따라 코드로 만든 3D 띠(차선/방호벽/기둥/표지판/가로등), 차는 InstancedMesh(밤에는 헤드라이트·빛줄기).
    // 건물·산·간판 그림은 전부 임시 모델이에요 (나중에 고화질 그림/모델로 바꿀 자리).
    (function buildDaegu(){
      var DG = window.DG = { riding:null, para:null, built:false, inShop:-1, doors:[], rides:[] };
      var hw = 14, DECK = 2.4, WALLZ = -1600;
      function sstep(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      var seed = 20241018; function rnd(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
      function hash(i, j){ var h = Math.sin(i*127.1 + j*311.7)*43758.5453; return h - Math.floor(h); }
      function vn(x, z){ var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx*fx*(3 - 2*fx), uz = fz*fz*(3 - 2*fz);
        var a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return a + (b - a)*ux + (c - a)*uz + (a - b - c + d)*ux*uz; }
      function ridged(x, z){ var s = 0, a = 1, f = 1, tot = 0; for(var o = 0; o < 5; o++){ var n = 1 - Math.abs(vn(x*f + o*7.3, z*f - o*3.1)*2 - 1); n *= n; s += n*a; tot += a; a *= 0.5; f *= 2.1; } return s/tot; }

      // ---------- 길 중심선 (x, z, 높이) ----------
      var CPT = [[0,-40,0],[0,-130,0],[10,-300,0],[-18,-520,0],[-42,-760,0],[-50,-990,0],
                 [-42,-1070,5],[-24,-1160,16],[4,-1250,23],[26,-1330,22],[16,-1410,9],[-6,-1470,0],
                 [-26,-1560,0],[-34,-1650,0],[-28,-1740,0],[-14,-1830,0],[4,-1960,0],[18,-2090,0],
                 [24,-2240,0],[20,-2420,0],[12,-2600,0],[4,-2760,0],[0,-3000,0],[0,-3380,0]];
      var RT = (function(){
        function cr(p0, p1, p2, p3, t){ var t2 = t*t, t3 = t2*t; return 0.5*((2*p1) + (-p0 + p2)*t + (2*p0 - 5*p1 + 4*p2 - p3)*t2 + (-p0 + 3*p1 - 3*p2 + p3)*t3); }
        var raw = [], n = CPT.length, i, k;
        for(i = 0; i < n - 1; i++){ var p0 = CPT[Math.max(0, i - 1)], p1 = CPT[i], p2 = CPT[i + 1], p3 = CPT[Math.min(n - 1, i + 2)];
          for(k = 0; k < 24; k++){ var t = k/24; raw.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t), cr(p0[2], p1[2], p2[2], p3[2], t)]); } }
        raw.push(CPT[n - 1].slice());
        var L = [0]; for(i = 1; i < raw.length; i++) L.push(L[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
        var ds = 4, N = Math.floor(L[L.length - 1]/ds) + 1, X = [], Z = [], Y = [], j = 0;
        for(i = 0; i < N; i++){ var s = i*ds; while(j < raw.length - 2 && L[j + 1] < s) j++; var f = (s - L[j])/Math.max(1e-6, L[j + 1] - L[j]); X.push(raw[j][0] + (raw[j + 1][0] - raw[j][0])*f); Z.push(raw[j][1] + (raw[j + 1][1] - raw[j][1])*f); Y.push(Math.max(0, raw[j][2] + (raw[j + 1][2] - raw[j][2])*f)); }
        var TX = [], TZ = []; for(i = 0; i < N; i++){ var a = Math.max(0, i - 1), b = Math.min(N - 1, i + 1), dx = X[b] - X[a], dz = Z[b] - Z[a], l = Math.hypot(dx, dz) || 1; TX.push(dx/l); TZ.push(dz/l); }
        return { n:N, ds:ds, len:(N - 1)*ds, x:X, z:Z, y:Y, tx:TX, tz:TZ };
      })();
      function idxAtZ(z){ var lo = 0, hi = RT.n - 1; while(hi - lo > 1){ var m = (lo + hi) >> 1; if(RT.z[m] > z) lo = m; else hi = m; } return lo; }
      function atZ(z){ if(z >= RT.z[0]) return { x:RT.x[0], y:RT.y[0], i:0 }; if(z <= RT.z[RT.n - 1]) return { x:RT.x[RT.n - 1], y:RT.y[RT.n - 1], i:RT.n - 2 };
        var i = idxAtZ(z), f = (RT.z[i] - z)/Math.max(1e-6, RT.z[i] - RT.z[i + 1]); return { x:RT.x[i] + (RT.x[i + 1] - RT.x[i])*f, y:RT.y[i] + (RT.y[i + 1] - RT.y[i])*f, i:i }; }
      function atS(s){ s = Math.max(0, Math.min(RT.len - 0.001, s)); var i = Math.floor(s/RT.ds), f = s/RT.ds - i, j = Math.min(RT.n - 1, i + 1);
        var tx = RT.tx[i] + (RT.tx[j] - RT.tx[i])*f, tz = RT.tz[i] + (RT.tz[j] - RT.tz[i])*f, l = Math.hypot(tx, tz) || 1;
        return { x:RT.x[i] + (RT.x[j] - RT.x[i])*f, z:RT.z[i] + (RT.z[j] - RT.z[i])*f, y:RT.y[i] + (RT.y[j] - RT.y[i])*f, tx:tx/l, tz:tz/l }; }
      DG.route = RT; DG.atZ = atZ; DG.ROOT = null; DG.atS = atS;

      // ---------- 큰 산 (뾰족하고 웅장한 3D 산, 길이 지나는 고개만 뚫려 있어요) ----------
      function terrH(x, z){
        if(z > -1010 || z < -1790) return 0;
        var xr = atZ(z).x, d = Math.abs(x - xr), edge = 1 - sstep(560, 690, Math.abs(x));
        var ew = 1 - sstep(70, 180, Math.abs(z - WALLZ)), eh = sstep(-1010, -1090, z)*(1 - sstep(-1400, -1470, z));
        var big = ew*((330*(0.28 + 0.72*ridged(x/200 + 3, z/200)))*sstep(28, 85, d) + (62*ridged(x/70 + 9, z/70 - 4) + 18*ridged(x/21, z/21 + 2))*sstep(32, 70, d));
        var hill = 64*eh*(0.25 + 0.75*vn(x/130, z/130))*sstep(46, 150, d);
        return Math.max(big, hill)*edge;
      }
      DG.terrH = terrH;

      // ---------- 질감 (그림 없이 코드로) ----------
      function ct(w, h, fn, rep){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0], rep[1]); if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
      var roadTex = ct(512, 512, function(g, w, h){ g.fillStyle = "#3b3d42"; g.fillRect(0, 0, w, h);
        for(var i = 0; i < 9000; i++){ var v = 50 + Math.random()*26; g.fillStyle = "rgb(" + v + "," + v + "," + (v + 4) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
        var U = w/28; function line(x, wd, col, dash){ g.fillStyle = col; if(!dash) g.fillRect((14 + x)*U - wd*U/2, 0, wd*U, h); else for(var y = 0; y < h; y += h/2) g.fillRect((14 + x)*U - wd*U/2, y, wd*U, h/4); }
        line(-0.55, 0.28, "#e8b923"); line(0.55, 0.28, "#e8b923"); line(-6.9, 0.26, "#f1f1f1", true); line(6.9, 0.26, "#f1f1f1", true); line(-12.4, 0.34, "#f1f1f1"); line(12.4, 0.34, "#f1f1f1"); });
      roadTex.anisotropy = 16;
      var sideTex = ct(64, 64, function(g, w, h){ g.fillStyle = "#b8b6b0"; g.fillRect(0, 0, w, h); for(var i = 0; i < 300; i++){ var v = 150 + Math.random()*60; g.fillStyle = "rgb(" + v + "," + v + "," + (v - 6) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); } });
      var pavTex = ct(128, 128, function(g, w, h){ g.fillStyle = "#c9c5bb"; g.fillRect(0, 0, w, h); for(var i = 0; i < 500; i++){ var v = 170 + Math.random()*50; g.fillStyle = "rgb(" + v + "," + v + "," + (v - 8) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 3, 3); } g.strokeStyle = "rgba(120,116,105,.7)"; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w/2, 0); g.lineTo(w/2, h); g.moveTo(0, h/2); g.lineTo(w, h/2); g.stroke(); });
      var streetTex = ct(64, 256, function(g, w, h){ g.fillStyle = "#3f4146"; g.fillRect(0, 0, w, h); for(var i = 0; i < 1500; i++){ var v = 52 + Math.random()*24; g.fillStyle = "rgb(" + v + "," + v + "," + (v + 3) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); } g.fillStyle = "#e8e8e8"; for(var y = 0; y < h; y += 64) g.fillRect(w/2 - 1.5, y, 3, 32); g.fillRect(3, 0, 2, h); g.fillRect(w - 5, 0, 2, h); });
      var facade = { col:ct(128, 128, function(g){ g.fillStyle = "#ece9e2"; g.fillRect(0, 0, 128, 128); for(var r = 0; r < 4; r++) for(var c = 0; c < 4; c++){ g.fillStyle = "#45607e"; g.fillRect(c*32 + 6, r*32 + 6, 20, 20); g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(c*32 + 6, r*32 + 6, 20, 5); g.fillStyle = "#cfcbc2"; g.fillRect(c*32, r*32 + 28, 32, 4); } }),
        emi:ct(128, 128, function(g){ g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128); for(var r = 0; r < 4; r++) for(var c = 0; c < 4; c++) if(Math.random() < 0.5){ g.fillStyle = Math.random() < 0.7 ? "#ffd98a" : "#cfe6ff"; g.fillRect(c*32 + 6, r*32 + 6, 20, 20); } }) };
      function textTex(txt, bg, fg, w, h, border){ return ct(w || 256, h || 64, function(g, W, H){ g.fillStyle = bg; g.fillRect(0, 0, W, H); if(border !== false){ g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(4, 4, W - 8, H - 8); } g.fillStyle = fg; g.font = "bold " + Math.floor(H*0.5) + "px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, W/2, H/2 + 2); }); }
      function mat(col, o){ o = o || {}; var m = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, color:col, flatShading:!!o.flat, vertexColors:!!o.vc, side:o.side || THREE.FrontSide }); if(o.map) m.map = o.map; if(o.fog === false) m.fog = false; return m; }
      function box(par, w, h, d, m, x, y, z){ var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); par.add(o); return o; }
      function cyl(par, rt, rb, h, m, x, y, z, seg){ var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), m); o.position.set(x, y, z); par.add(o); return o; }
      function inst(geo, m, n){ var im = new THREE.InstancedMesh(geo, m, n); im.frustumCulled = false; return im; }

      var ROOT = new THREE.Group(); ROOT.visible = false; scene.add(ROOT); DG.ROOT = ROOT;
      var rects = window.ROCK_RECTS || (window.ROCK_RECTS = []);
      function addRect(x, z, hx, hz){ rects.push({ x:x, z:z, hx:hx, hz:hz }); }
      var nightMats = [];            // 밤에 켜질 창문/불빛 재질들
      var MX = new THREE.Matrix4(), MP = new THREE.Vector3(), MS = new THREE.Vector3(), MQ = new THREE.Quaternion(), ME = new THREE.Euler(), MC = new THREE.Color();
      function setM(im, i, x, y, z, sx, sy, sz, ry){ MP.set(x, y, z); MS.set(sx, sy, sz); MQ.setFromEuler(ME.set(0, ry || 0, 0)); MX.compose(MP, MQ, MS); im.setMatrixAt(i, MX); }

      // ---------- 도로 띠 ----------
      function yv(v, i){ return typeof v === "function" ? v(i, RT.y[i]) : RT.y[i] + v; }
      function ribbon(oA, yA, oB, yB, m, vscale, i0, i1){
        i0 = i0 || 0; i1 = i1 === undefined ? RT.n - 1 : i1; var pos = [], uv = [], idx = [], k = 0;
        for(var i = i0; i <= i1; i++){ var nx = RT.tz[i], nz = -RT.tx[i], v = i*RT.ds/(vscale || 24);
          pos.push(RT.x[i] + nx*oA, yv(yA, i), RT.z[i] + nz*oA, RT.x[i] + nx*oB, yv(yB, i), RT.z[i] + nz*oB); uv.push(0, v, 1, v);
          if(i > i0){ var a = (k - 1)*2, b = a + 1, c = k*2, d = c + 1; idx.push(a, c, b, b, c, d); } k++; }
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        return new THREE.Mesh(g, m); }
      var poleM = mat(0x6b6f76);
      function buildRoad(){
        var DS = THREE.DoubleSide, conc = mat(0xb9b6ae, { side:DS, map:sideTex }), barM = mat(0xcfccc4, { side:DS });
        var road = ribbon(-hw, 0.09, hw, 0.09, new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:roadTex, side:DS }), 24); ROOT.add(road);
        function bot(i, y){ return Math.max(y - DECK, -0.05); }
        ROOT.add(ribbon(-hw, bot, hw, bot, conc, 24));                                        // 상판 아랫면
        ROOT.add(ribbon(-hw, bot, -hw, 0.09, conc, 24)); ROOT.add(ribbon(hw, bot, hw, 0.09, conc, 24));   // 상판 옆면
        [-hw + 0.5, hw - 0.5].forEach(function(o){ ROOT.add(ribbon(o, 0.09, o, 2.4, barM, 24)); ROOT.add(ribbon(o - 0.5, 2.4, o + 0.5, 2.4, barM, 24)); });   // 방호벽
        ROOT.add(ribbon(-0.9, 0.9, 0.9, 0.9, mat(0x4d7a3a, { side:DS }), 24)); ROOT.add(ribbon(-0.9, 0.09, -0.9, 0.9, barM, 24)); ROOT.add(ribbon(0.9, 0.09, 0.9, 0.9, barM, 24));   // 중앙분리대
        // 기둥 (고가 구간)
        var piers = [], i; for(i = 0; i < RT.n; i += 6) if(RT.y[i] > 2.8) piers.push(i);
        if(piers.length){ var pm = inst(new THREE.BoxGeometry(1, 1, 1), mat(0xa9a69f), piers.length*3), c = 0;
          piers.forEach(function(i){ var ang = Math.atan2(RT.tx[i], RT.tz[i]), y = RT.y[i] - DECK, nx = RT.tz[i], nz = -RT.tx[i];
            [-8, 8].forEach(function(o){ setM(pm, c++, RT.x[i] + nx*o, y/2, RT.z[i] + nz*o, 3.4, y, 3.4, ang); });
            setM(pm, c++, RT.x[i], y - 0.8, RT.z[i], hw*2 - 3, 1.6, 4.4, ang); });
          pm.count = c; ROOT.add(pm); }
        // 인도 (아파트·도심 구간)
        var s0 = idxAtZ(-2120), swM = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:pavTex, side:DS });
        [[hw, hw + 11], [-hw - 11, -hw]].forEach(function(o){ var m = ribbon(o[0], 0.16, o[1], 0.16, swM, 24, s0); var u = m.geometry.attributes.uv; for(var j = 0; j < u.count; j++) u.setXY(j, u.getX(j)*3, u.getY(j)*5); ROOT.add(m); });
        // 가로등
        var lampPos = []; for(var s = 30; s < RT.len - 10; s += 44){ var a = atS(s); [-1, 1].forEach(function(sd){ lampPos.push({ x:a.x + a.tz*(hw - 0.2)*sd, z:a.z - a.tx*(hw - 0.2)*sd, y:a.y, sd:sd, tx:a.tx, tz:a.tz }); }); }
        var lm = inst(new THREE.BoxGeometry(1, 1, 1), poleM, lampPos.length*2), lb = inst(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ color:0xffffff }), lampPos.length), cc = 0;
        lampPos.forEach(function(L, ii){ var ang = Math.atan2(L.tx, L.tz), nx = L.tz*L.sd, nz = -L.tx*L.sd;
          setM(lm, cc++, L.x, L.y + 7.5, L.z, 0.7, 15, 0.7, ang); setM(lm, cc++, L.x - nx*2.8, L.y + 15, L.z - nz*2.8, 0.5, 0.5, 5.6, Math.atan2(nx, nz));
          setM(lb, ii, L.x - nx*5.4, L.y + 14.4, L.z - nz*5.4, 1, 1, 1, 0); });
        ROOT.add(lm); ROOT.add(lb); DG.lampBulbs = lb;
        // 초록 안내 표지판 (문형)
        [[-170, "국도 4호선", "↓ 대구 25km", "↑ 왜관"], [-640, "칠곡IC 4km", "↓ 대구 20km", "국도 4호선"], [-1000, "고가 언덕길", "대구 북구 ↓", "안전 운전"], [-1700, "대구 관문", "↓ 대구 북구 칠곡", "고개를 지나면 대구"], [-2000, "대구 북구 칠곡", "↓ 도심 6km", "칠곡 3지구"], [-2640, "대구 도심", "대구역 · 동대구역 · 83타워", "↓ 직진"]].forEach(function(S){
          var a = atZ(S[0]), i = a.i, g = new THREE.Group();
          var tex = ct(512, 160, function(c, W, H){ c.fillStyle = "#0e6b3a"; c.fillRect(0, 0, W, H); c.strokeStyle = "#fff"; c.lineWidth = 6; c.strokeRect(6, 6, W - 12, H - 12); c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "bold 44px sans-serif"; c.fillText(S[1], W/2, 56); c.font = "bold 34px sans-serif"; c.fillText(S[2], W/2, 100); c.font = "26px sans-serif"; c.fillStyle = "#d6f0d6"; c.fillText(S[3], W/2, 138); });
          var sg = new THREE.Mesh(new THREE.PlaneGeometry(34, 10.6), new THREE.MeshBasicMaterial({ map:tex, side:DS })); sg.position.set(0, 25, 0); g.add(sg);
          box(g, 1.2, 25, 1.2, poleM, -hw + 1, 12.5, 0); box(g, 1.2, 25, 1.2, poleM, hw - 1, 12.5, 0); box(g, hw*2, 1.2, 1.2, poleM, 0, 19.5, 0);
          var sg2 = sg.clone(); sg2.rotation.y = Math.PI; g.add(sg2); sg.position.z = 0.4; sg2.position.z = -0.4; sg.material.side = THREE.FrontSide; sg2.material = sg.material;
          g.position.set(a.x, a.y, S[0]); g.rotation.y = Math.atan2(RT.tx[i], RT.tz[i]) + Math.PI; ROOT.add(g); });
      }

      // ---------- 땅 위 꾸밈: 큰 산, 논, 나무 ----------
      function buildTerrain(){
        var x0 = -690, x1 = 690, z0 = -1790, z1 = -1010, st = 7, nx = Math.round((x1 - x0)/st), nz = Math.round((z1 - z0)/st), pos = [], col = [], idx = [], H = [], i, j;
        for(j = 0; j <= nz; j++) for(i = 0; i <= nx; i++) H.push(terrH(x0 + i*st, z0 + j*st));
        var c = new THREE.Color();
        for(j = 0; j <= nz; j++) for(i = 0; i <= nx; i++){
          var h = H[j*(nx + 1) + i], hxm = H[j*(nx + 1) + Math.max(0, i - 1)], hxp = H[j*(nx + 1) + Math.min(nx, i + 1)], hzm = H[Math.max(0, j - 1)*(nx + 1) + i], hzp = H[Math.min(nz, j + 1)*(nx + 1) + i];
          var slope = Math.hypot(hxp - hxm, hzp - hzm)/(2*st), n = (hash(i, j) - 0.5)*0.11;
          if(h < 14) c.setRGB(0.46 + n, 0.64 + n, 0.33 + n); else if(h < 120) c.setRGB(0.12 + n, 0.26 + n, 0.12 + n); else c.setRGB(0.17 + n, 0.27 + n, 0.13 + n);
          var rock = Math.max(sstep(0.5, 0.95, slope), sstep(140, 215, h)); var strata = 0.06*Math.sin(h*0.55 + hash(i >> 2, j >> 2)*5); c.lerp(new THREE.Color(0.34 + n + strata, 0.31 + n + strata, 0.28 + n + strata), rock*0.92);
          if(h > 255) c.lerp(new THREE.Color(0.86, 0.88, 0.92), sstep(255, 305, h)*0.85);
          pos.push(x0 + i*st, h, z0 + j*st); col.push(c.r, c.g, c.b); }
        for(j = 0; j < nz; j++) for(i = 0; i < nx; i++){ var a = j*(nx + 1) + i, b = a + 1, d = a + nx + 1, e = d + 1; if(Math.max(H[a], H[b], H[d], H[e]) < 0.6) continue; idx.push(a, d, b, b, d, e); }
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
        var m = new THREE.Mesh(g, mat(0xffffff, { vc:true, flat:true, fog:false })); m.position.y = 0.04; ROOT.add(m); DG.terrain = m;
      }
      function buildScenery(){
        // 논(들판) 조각: 국도 4호선 양옆
        var patches = []; for(var s = 40; s < 1000; s += 22){ var a = atS(s); [-1, 1].forEach(function(sd){ var off = hw + 26 + rnd()*150; if(rnd() < 0.8) patches.push({ x:a.x + a.tz*off*sd, z:a.z - a.tx*off*sd + (rnd() - 0.5)*10, w:40 + rnd()*60, d:26 + rnd()*30, c:[0x6fae4a, 0x86bb52, 0xc9b94c, 0x5f9d45, 0xd2c261][Math.floor(rnd()*5)] }); }); }
        var pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-Math.PI/2); var pi = inst(pg, mat(0xffffff), patches.length);
        patches.forEach(function(p, i){ setM(pi, i, p.x, 0.06, p.z, p.w, 1, p.d, 0); pi.setColorAt(i, MC.setHex(p.c)); }); ROOT.add(pi);
        // 나무
        var T = [], s2; function tryTree(x, z){ if(Math.abs(x) > 600 || terrH(x, z) > 2) return; var a = atZ(z); if(Math.abs(x - a.x) < hw + 4) return; if(inRect(x, z, 6)) return; T.push([x, z, 0.8 + rnd()*0.7]); }
        for(s2 = 20; s2 < RT.len; s2 += 24){ var a = atS(s2), zone = a.z > -1010 || (a.z < -1790 && a.z > -2120) ? 0 : (a.z <= -2120 && a.z > -2700 ? 1 : (a.z <= -2700 ? 2 : 3)); if(zone === 3) continue;
          [-1, 1].forEach(function(sd){ var off = zone === 0 ? hw + 8 + rnd()*34 : (zone === 1 ? hw + 13 + rnd()*10 : hw + 3.5); if(zone !== 2 && rnd() < 0.2) return; tryTree(a.x + a.tz*off*sd, a.z - a.tx*off*sd); }); }
        for(var q = 0; q < 140; q++){ var tz = -40 - rnd()*960, tx = (rnd() - 0.5)*1160; tryTree(tx, tz); }
        for(q = 0; q < 70; q++){ tz = -1800 - rnd()*330; tx = (rnd() - 0.5)*1160; tryTree(tx, tz); }
        var tg = new THREE.CylinderGeometry(0.5, 0.8, 5, 6), cg = new THREE.ConeGeometry(4.6, 10, 7), cg2 = new THREE.ConeGeometry(3.6, 8, 7); tg.translate(0, 2.5, 0);
        cg.translate(0, 9, 0); cg2.translate(0, 14, 0);
        var tm = inst(tg, mat(0x6b4a2f), T.length), cm = inst(cg, mat(0xffffff), T.length), cm2 = inst(cg2, mat(0xffffff), T.length), cols = [0x3f7a3a, 0x4f8f45, 0x2f6a35, 0x5f9a48];
        T.forEach(function(t, i){ var k = t[2]; setM(tm, i, t[0], 0, t[1], k, k, k, 0); setM(cm, i, t[0], 0, t[1], k, k, k, 0); setM(cm2, i, t[0], 0, t[1], k, k, k, 0); MC.setHex(cols[i % 4]); cm.setColorAt(i, MC); cm2.setColorAt(i, MC); });
        ROOT.add(tm); ROOT.add(cm); ROOT.add(cm2);
      }
      var CLEAR = [];
      function inRect(x, z, pad){ for(var i = 0; i < CLEAR.length; i++){ var r = CLEAR[i]; if(Math.abs(x - r.x) < r.hx + pad && Math.abs(z - r.z) < r.hz + pad) return true; } return false; }

      // ---------- 건물 (같은 높이끼리 한 번에 그려요) ----------
      var facadeMat = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:facade.col, emissive:0xffffff, emissiveMap:facade.emi, emissiveIntensity:0 }); nightMats.push(facadeMat);
      function blockMeshes(list, cols){            // list: {x,z,w,d,h,c}
        var byH = {}; list.forEach(function(b){ (byH[b.h] = byH[b.h] || []).push(b); });
        Object.keys(byH).forEach(function(hk){ var H = +hk, arr = byH[hk], g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); var uv = g.attributes.uv;
          for(var v = 0; v < uv.count; v++){ var face = Math.floor(v/4); if(face === 2 || face === 3) uv.setXY(v, uv.getX(v)*0.02, uv.getY(v)*0.02); else uv.setXY(v, uv.getX(v)*cols, uv.getY(v)*H/7); }
          var im = inst(g, facadeMat, arr.length); arr.forEach(function(b, i){ setM(im, i, b.x, 0, b.z, b.w, H, b.d, 0); im.setColorAt(i, MC.setHex(b.c)); }); ROOT.add(im); });
      }
      var PAL = [0xe3ddd0, 0xd0dae2, 0xe8d3c4, 0xc3cdd2, 0xe0dfda, 0xaabbd0, 0xd9cdb8];
      function buildApartments(){
        var list = [], plates = [];
        for(var k = 0; k < 6; k++){ var z = -2200 - k*94; var xr = atZ(z).x;
          [-1, 1].forEach(function(sd){ [0, 1, 2].forEach(function(ring){ if(ring === 2 && k % 2) return; var w = 64, d = 26, x = xr + sd*(hw + 11 + 40 + ring*118), hh = [98, 126, 154][(k + ring + (sd > 0 ? 1 : 0)) % 3];
            list.push({ x:x, z:z, w:w, d:d, h:hh, c:PAL[(k*3 + ring + (sd > 0 ? 2 : 0)) % PAL.length] }); addRect(x, z, w/2, d/2); CLEAR.push({ x:x, z:z, hx:w/2 + 6, hz:d/2 + 6}); plates.push({ x:x, z:z + d/2 + 0.3, y:hh - 8, n:101 + plates.length }); }); }); }
        blockMeshes(list, 8);
        // 옥상 띠 + 동 번호판
        var texCache = {}; plates.forEach(function(p){ var key = p.n % 12; var t = texCache[key] || (texCache[key] = textTex((101 + key) + "동", "#2f5d9a", "#ffffff", 192, 64, false));
          var m = new THREE.Mesh(new THREE.PlaneGeometry(22, 7), new THREE.MeshBasicMaterial({ map:t })); m.position.set(p.x, p.y, p.z); ROOT.add(m); });
        // 단지 입구 간판
        var gateZ = -2150, a = atZ(gateZ); [-1, 1].forEach(function(sd){ var g = new THREE.Group(); box(g, 3, 18, 3, mat(0x9aa3ab), 0, 9, 0); var t = textTex("칠곡 3지구 아파트 단지 (임시)", "#1d4f91", "#fff", 512, 96); var s = new THREE.Mesh(new THREE.PlaneGeometry(36, 6.8), new THREE.MeshBasicMaterial({ map:t, side:THREE.DoubleSide })); s.position.set(0, 20, 0); g.add(s); g.position.set(a.x + sd*(hw + 22), 0, gateZ); g.rotation.y = 0; ROOT.add(g); });
      }
      var SHOPS = [
        { name:"칠곡 24시 편의점", bg:"#17a05b", fg:"#fff", wall:0xf3f6ef, goods:[0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71], lines:["어서 오세요~ 칠곡 24시 편의점이에요!", "삼각김밥이랑 컵라면이 제일 잘 나가요."], npc:0x2b7a4b },
        { name:"동성로 카페", bg:"#6b3f24", fg:"#ffe9c9", wall:0xf1e3cf, goods:[0xd9b28a, 0x8b5a3a, 0xffffff], lines:["동성로 카페에 오신 걸 환영해요 ☕", "대구는 여름에 엄청 덥거든요. 아이스 아메리카노 어때요?"], npc:0x8b5a3a },
        { name:"서문시장 호떡집", bg:"#c0392b", fg:"#fff6d6", wall:0xf7e7c6, goods:[0xd98f3a, 0xe9b15a, 0xc2742a], lines:["서문시장 명물 호떡! 꿀이 줄줄 흘러요 🥞", "많이 먹고 가요, 인심은 대구가 최고지."], npc:0xc0392b },
        { name:"대구 약령시 약방", bg:"#2d5a3d", fg:"#e8f2d8", wall:0xe6e0c8, goods:[0x7b5a3a, 0x9cb36a, 0x6b4f2f], lines:["약령시는 오래된 한약재 시장이에요.", "감초, 대추, 인삼… 건강하게 지내요."], npc:0x2d5a3d },
        { name:"막창구이 맛집", bg:"#8e1f1f", fg:"#ffe3a0", wall:0xeadbc0, goods:[0xc0392b, 0x7f2a1d, 0xf39c12], lines:["대구 하면 막창이죠! 지글지글 🔥", "쫄깃쫄깃, 부추랑 같이 먹어요."], npc:0x7f2a1d },
        { name:"납작만두 분식", bg:"#3b5ba5", fg:"#fff", wall:0xe9edf5, goods:[0xe8cf9a, 0xd9b873, 0xc07a3a], lines:["납작만두는 얇고 납작한 대구식 분식이에요.", "당면 가득! 떡볶이랑 같이 드세요."], npc:0x3b5ba5 }
      ];
      function buildCity(){
        var Z0 = -2690, i;
        // 바닥(포장)
        var pg = new THREE.PlaneGeometry(1240, 760); pg.rotateX(-Math.PI/2); pavTex.repeat.set(70, 40);
        var pav = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:pavTex })); pav.position.set(0, 0.05, (Z0 - 3420)/2); ROOT.add(pav);
        // 가로 길
        var STREETS = [-2850, -3060, -3260]; STREETS.forEach(function(sz){ var g = new THREE.PlaneGeometry(1240, 20); g.rotateX(-Math.PI/2); var t = streetTex.clone(); t.needsUpdate = true; t.repeat.set(1, 1); g.attributes.uv; var uv = g.attributes.uv; for(var v = 0; v < uv.count; v++){ var u0 = uv.getX(v), v0 = uv.getY(v); uv.setXY(v, v0, u0*60); }
          var m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:t })); m.material.map.rotation = 0; m.position.set(0, 0.07, sz); ROOT.add(m); });
        // 랜드마크 (임시 모델)
        var LM = [{ id:"daegu", x:-250, z:-2790, hx:78, hz:30 }, { id:"tower", x:-330, z:-3160, hx:34, hz:34 }, { id:"dongdaegu", x:290, z:-3340, hx:104, hz:36 }];
        LM.forEach(function(l){ var xr0 = atZ(l.z).x; CLEAR.push({ x:(l.x + xr0)/2, z:l.z, hx:Math.abs(l.x - xr0)/2 + l.hx + 8, hz:l.hz + 24 }); addRect(l.x, l.z, l.hx, l.hz); });      // 길에서 랜드마크까지 광장(건물 없음)
        // 일반 건물 + 가게 줄
        var bands = [[-2700, -2850], [-2850, -3060], [-3060, -3260], [-3260, -3415]], rowX = [55, 117, 190, 270, 360, 450, 540], list = [], shopLots = [], HS = [28, 42, 63, 84, 105, 126];
        bands.forEach(function(b){ var len = b[0] - b[1] - 22, cnt = Math.max(1, Math.floor(len/58)), d = len/cnt - 8;
          for(var q = 0; q < cnt; q++){ var z = b[0] - 11 - (q + 0.5)*(len/cnt); var xr = atZ(z).x;
            [-1, 1].forEach(function(sd){ rowX.forEach(function(rx, ri){ var w = ri === 0 ? 50 : 56, x = xr + sd*(rx + (ri === 0 ? 0 : 6)); if(Math.abs(x) > 590) return; if(inRect(x, z, 2) || (Math.abs(x - xr) < 1)) return;
              var hi = ri === 0 ? Math.floor(rnd()*2) : Math.min(5, 1 + Math.floor(rnd()*3) + Math.floor(ri/2)); var h = HS[hi]; list.push({ x:x, z:z, w:w, d:d, h:h, c:PAL[Math.floor(rnd()*PAL.length)] }); addRect(x, z, w/2, d/2); CLEAR.push({ x:x, z:z, hx:w/2, hz:d/2 });
              if(ri === 0) shopLots.push({ x:x, z:z, w:w, d:d, sd:sd, h:h }); }); }); } });
        blockMeshes(list, 6);
        // 가게 간판(길 쪽 벽) + 문. 6곳은 들어갈 수 있어요
        var GEN = ["약국", "미용실", "안경점", "치킨", "분식", "빵집", "문구점", "꽃집", "휴대폰", "세탁소", "국밥", "은행"], GC = [["#d35400", "#fff"], ["#2c3e50", "#ffd"], ["#8e44ad", "#fff"], ["#16a085", "#fff"], ["#c0392b", "#fff"], ["#2980b9", "#fff"]], tcache = {};
        var enter = {}; var lots = shopLots.slice().sort(function(a, b){ return b.z - a.z; }); var pick = [2, 5, 8, 11, 14, 17]; pick.forEach(function(pi, si){ if(lots[pi]) enter[pi] = si; else if(lots.length) enter[lots.length - 1 - si] = si; });
        lots.forEach(function(L, li){ var si = enter[li], name = si !== undefined ? SHOPS[si].name : GEN[li % GEN.length], cc = si !== undefined ? [SHOPS[si].bg, SHOPS[si].fg] : GC[li % GC.length];
          var t = tcache[name] || (tcache[name] = textTex(name, cc[0], cc[1], 384, 80)); var fx = L.x - L.sd*(L.w/2 + 0.25), ry = L.sd > 0 ? -Math.PI/2 : Math.PI/2;
          var sg = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.4), new THREE.MeshBasicMaterial({ map:t })); sg.position.set(fx, 15.5, L.z); sg.rotation.y = ry; ROOT.add(sg);
          var awn = box(ROOT, 7, 1.2, 28, mat(si !== undefined ? 0xf2c94c : 0x9aa6b2), L.x - L.sd*(L.w/2 + 3.5), 11.2, L.z);
          var door = box(ROOT, 0.8, 9.5, 9, mat(si !== undefined ? 0xfff2a8 : 0x5b6a78), fx - L.sd*0.1, 4.75, L.z); if(si !== undefined){ door.material = new THREE.MeshBasicMaterial({ color:0xffe58a }); DG.doors.push({ x:L.x - L.sd*(L.w/2 + 6), z:L.z, shop:si, sd:L.sd }); } });
        // 랜드마크 모델
        buildDaeguStation(LM[0]); build83(LM[1]); buildDongdaegu(LM[2]);
      }
      function buildDaeguStation(L){
        var g = new THREE.Group(); g.position.set(L.x, 0, L.z); var stone = mat(0xd8c29c), roof = mat(0x6a4a3a), gl = mat(0x35506e);
        box(g, 150, 34, 46, stone, 0, 17, 0); box(g, 156, 4, 50, roof, 0, 36, 0); box(g, 36, 62, 30, stone, 0, 31, 4); box(g, 40, 4, 34, roof, 0, 63, 4);
        for(var i = -3; i <= 3; i++){ if(i === 0) continue; box(g, 14, 18, 1, gl, i*19, 13, 23.2); box(g, 14, 12, 1, gl, i*19, 28, 23.2); }
        box(g, 20, 22, 1.2, mat(0x2a2f38), 0, 11, 23.4);
        var ck = ct(128, 128, function(c, W, H){ c.fillStyle = "#fff8e1"; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.strokeStyle = "#333"; c.lineWidth = 5; c.stroke(); for(var t = 0; t < 12; t++){ var a = t/12*6.283; c.beginPath(); c.moveTo(64 + Math.sin(a)*50, 64 - Math.cos(a)*50); c.lineTo(64 + Math.sin(a)*58, 64 - Math.cos(a)*58); c.stroke(); } c.lineWidth = 6; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 24); c.moveTo(64, 64); c.lineTo(92, 74); c.stroke(); });
        var cf = new THREE.Mesh(new THREE.CircleGeometry(11, 24), new THREE.MeshBasicMaterial({ map:ck })); cf.position.set(0, 46, 19.2); g.add(cf);
        var nm = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ map:textTex("대구역 (임시 모델)", "#1b3a6b", "#fff", 512, 100) })); nm.position.set(0, 27, 23.6); g.add(nm);
        ROOT.add(g);
      }
      function build83(L){
        var g = new THREE.Group(); g.position.set(L.x, 0, L.z); var cm = mat(0xc9ccd1), pm = mat(0x7b8794), red = mat(0xd23c3c), wh = mat(0xf2f2f2);
        box(g, 64, 20, 64, mat(0xb4a58f), 0, 10, 0);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function(q){ var l = cyl(g, 2.2, 3.4, 150, cm, q[0]*13, 82, q[1]*13, 8); l.rotation.z = -q[0]*0.04; l.rotation.x = q[1]*0.04; });
        cyl(g, 6, 6, 160, wh, 0, 85, 0, 12);
        var ring = cyl(g, 20, 20, 9, pm, 0, 162, 0, 24); var emm = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  color:0x2a3b52, emissive:0xffffff, emissiveIntensity:0 }); nightMats.push(emm); cyl(g, 20.4, 20.4, 5, emm, 0, 162, 0, 24);
        cyl(g, 0.3, 11, 12, wh, 0, 172.5, 0, 24); cyl(g, 0.4, 0.4, 70, wh, 0, 214, 0, 6);
        for(var i = 0; i < 6; i++) cyl(g, 0.55, 0.55, 8, i % 2 ? red : wh, 0, 182 + i*10, 0, 6);
        var nm = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), new THREE.MeshBasicMaterial({ map:textTex("83타워 (임시 모델)", "#7a1f2b", "#fff", 512, 100) })); nm.position.set(0, 22, 32.4); g.add(nm);
        ROOT.add(g);
      }
      function buildDongdaegu(L){
        var g = new THREE.Group(); g.position.set(L.x, 0, L.z); var wall = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  color:0xd4dde6, map:facade.col, emissive:0xffffff, emissiveMap:facade.emi, emissiveIntensity:0 }); nightMats.push(wall); wall.map = facade.col.clone(); wall.map.needsUpdate = true; wall.map.repeat.set(26, 4);
        var m = new THREE.Mesh(new THREE.BoxGeometry(200, 28, 54), wall); m.position.y = 14; g.add(m);
        var rf = new THREE.Mesh(new THREE.CylinderGeometry(36, 36, 210, 20, 1, false, 0, Math.PI), mat(0xe9eef3, { side:THREE.DoubleSide })); rf.rotation.z = Math.PI/2; rf.rotation.y = Math.PI/2; rf.scale.set(1, 1, 0.9); rf.position.set(0, 24, 0); rf.rotation.set(0, 0, Math.PI/2); rf.rotateX(Math.PI); g.add(rf);
        box(g, 210, 3, 8, mat(0x586b7e), 0, 31, 34); [-90, -45, 0, 45, 90].forEach(function(px){ box(g, 3, 31, 3, mat(0x586b7e), px, 15.5, 34); });
        var nm = new THREE.Mesh(new THREE.PlaneGeometry(50, 9), new THREE.MeshBasicMaterial({ map:textTex("동대구역 (임시 모델)", "#1b3a6b", "#fff", 512, 100) })); nm.position.set(0, 22, 27.4); g.add(nm);
        ROOT.add(g);
      }

      // ---------- 차 (InstancedMesh) ----------
      var CARS = [], CAR_N = 130, carIM = {};
      function buildCars(){
        var lanes = [[-4.2, 1, 62], [-9.6, 1, 92], [4.2, -1, 66], [9.6, -1, 96]];       // [옆 위치, 방향(+1 = 대구 쪽), 속도]
        var cols = [0xdcdcdc, 0x222428, 0xc0392b, 0x2e6fd8, 0xf0c419, 0x8f9aa0, 0x27ae60, 0xffffff, 0x6b3f9b];
        for(var i = 0; i < CAR_N; i++){ var ln = lanes[i % 4], big = rnd() < 0.12; CARS.push({ s:rnd()*RT.len, o:ln[0], dir:ln[1], v:ln[2]*(0.9 + rnd()*0.2), cv:0, col:big ? 0xe8e4d6 : cols[Math.floor(rnd()*cols.length)], big:big, L:big ? 26 : 14, Hh:big ? 7.5 : 4.2 }); }
        var unit = new THREE.BoxGeometry(1, 1, 1);
        carIM.body = inst(unit, mat(0xffffff), CAR_N); carIM.cab = inst(unit, mat(0x2a3440), CAR_N); carIM.under = inst(unit, mat(0x15171a), CAR_N);
        var lampMat = new THREE.MeshBasicMaterial({ color:0xfff2c4 }), tailMat = new THREE.MeshBasicMaterial({ color:0xff2a2a }); carIM.lampMat = lampMat; carIM.tailMat = tailMat;
        carIM.head = inst(unit, lampMat, CAR_N*2); carIM.tail = inst(unit, tailMat, CAR_N*2);
        var trMat = new THREE.MeshBasicMaterial({ color:0xff3a22, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }), trMat2 = new THREE.MeshBasicMaterial({ color:0xfff0c0, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false });
        carIM.trail = inst(unit, trMat, CAR_N); carIM.trail2 = inst(unit, trMat2, CAR_N); carIM.trMat = trMat; carIM.trMat2 = trMat2; trMat.fog = trMat2.fog = true;
        CARS.forEach(function(c, i){ carIM.body.setColorAt(i, MC.setHex(c.col)); }); carIM.body.instanceColor.needsUpdate = true;
        ["body", "cab", "under", "head", "tail", "trail", "trail2"].forEach(function(k){ ROOT.add(carIM[k]); });
      }
      function updateCars(dt, p, night){
        var i, c, a, n = 0;
        for(i = 0; i < CARS.length; i++){ c = CARS[i];
          a = atS(c.s); var hx = a.tx*c.dir, hz = a.tz*c.dir, nx = a.tz, nz = -a.tx, px = a.x + nx*c.o, pz = a.z + nz*c.o;
          var dp = (px - p.x)*(px - p.x) + (pz - p.z)*(pz - p.z), tv = dp < 24*24 && Math.abs(p.y) < 6 + a.y ? 0 : c.v;           // 사람이 앞에 있으면 멈춰요
          if(DG.riding && dp < 30*30) tv = 0;
          c.cv += (tv - c.cv)*Math.min(1, dt*(tv === 0 ? 4 : 1.6)); c.s += c.dir*c.cv*dt; if(c.s > RT.len - 1) c.s = 1; if(c.s < 1) c.s = RT.len - 1;
          var ry = Math.atan2(hx, hz), y = a.y + 0.1, L = c.L, H = c.Hh;
          setM(carIM.body, i, px, y + H*0.38 + 0.5, pz, 6.2, H*0.55, L, ry);
          setM(carIM.cab, i, px - hx*L*0.06, y + H*0.38 + 0.5 + H*0.52, pz - hz*L*0.06, 5.4, H*0.5, c.big ? L*0.86 : L*0.5, ry);
          setM(carIM.under, i, px, y + 0.7, pz, 6, 1.2, L - 1, ry);
          var rx = -hz, rz = hx;      // 차의 오른쪽
          setM(carIM.head, i*2, px + hx*L*0.5 + rx*2.2, y + H*0.3 + 0.7, pz + hz*L*0.5 + rz*2.2, 1.3, 0.9, 0.5, ry); setM(carIM.head, i*2 + 1, px + hx*L*0.5 - rx*2.2, y + H*0.3 + 0.7, pz + hz*L*0.5 - rz*2.2, 1.3, 0.9, 0.5, ry);
          setM(carIM.tail, i*2, px - hx*L*0.5 + rx*2.4, y + H*0.3 + 0.7, pz - hz*L*0.5 + rz*2.4, 1.3, 0.8, 0.4, ry); setM(carIM.tail, i*2 + 1, px - hx*L*0.5 - rx*2.4, y + H*0.3 + 0.7, pz - hz*L*0.5 - rz*2.4, 1.3, 0.8, 0.4, ry);
          var tl = night > 0.05 ? 24 + c.cv*0.25 : 0.01, hl = night > 0.05 ? 20 : 0.01;
          setM(carIM.trail, i, px - hx*(L*0.5 + tl*0.5), y + H*0.3 + 0.8, pz - hz*(L*0.5 + tl*0.5), 3.6, 0.5, tl, ry); setM(carIM.trail2, i, px + hx*(L*0.5 + hl*0.5), y + 0.9, pz + hz*(L*0.5 + hl*0.5), 3.6, 0.4, hl, ry);
        }
        ["body", "cab", "under", "head", "tail", "trail", "trail2"].forEach(function(k){ carIM[k].instanceMatrix.needsUpdate = true; });
      }

      // ---------- 탈 수 있는 차 ----------
      function carModel(col, big){
        var g = new THREE.Group(), L = big ? 26 : 14, H = big ? 7.5 : 4.2, bm = mat(col), gm = mat(0x2a3440), dk = mat(0x15171a);
        box(g, 6.2, H*0.55, L, bm, 0, H*0.38 + 0.5, 0); box(g, 5.4, H*0.5, big ? L*0.86 : L*0.5, gm, 0, H*0.9 + 0.5, big ? 0 : -L*0.06); box(g, 6, 1.2, L - 1, dk, 0, 0.7, 0);
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function(q){ var w = cyl(g, 1.3, 1.3, 1, dk, q[0]*3.1, 1.3, q[1]*L*0.32, 12); w.rotation.z = Math.PI/2; });
        var hm = new THREE.MeshBasicMaterial({ color:0xfff2c4 }); box(g, 1.3, 0.9, 0.5, hm, 2.2, H*0.3 + 0.7, L*0.5); box(g, 1.3, 0.9, 0.5, hm, -2.2, H*0.3 + 0.7, L*0.5);
        box(g, 1.3, 0.8, 0.4, new THREE.MeshBasicMaterial({ color:0xff2a2a }), 2.4, H*0.3 + 0.7, -L*0.5); box(g, 1.3, 0.8, 0.4, new THREE.MeshBasicMaterial({ color:0xff2a2a }), -2.4, H*0.3 + 0.7, -L*0.5);
        return g;
      }
      function addRide(name, col, big, x, z, ry){
        var g = carModel(col, big); g.position.set(x, 0.1, z); g.rotation.y = ry || 0; ROOT.add(g);
        var ring = new THREE.Mesh(new THREE.RingGeometry(big ? 17 : 10, big ? 19 : 11.2, 28), new THREE.MeshBasicMaterial({ color:0xffe27a, transparent:true, opacity:0.55, side:THREE.DoubleSide, depthWrite:false })); ring.rotation.x = -Math.PI/2; ring.position.set(x, 0.2, z); ROOT.add(ring);
        DG.rides.push({ name:name, g:g, ring:ring, x:x, z:z, big:big, mul:big ? 2.6 : 3.2, hd:ry || 0 });
      }
      function buildRides(){
        var a = atZ(-90); addRide("빨간 승용차", 0xc0392b, false, a.x + hw + 9, -90, 0);
        a = atZ(-2210); addRide("노란 택시", 0xf0c419, false, a.x + hw + 14, -2210, Math.PI);
        a = atZ(-2790); addRide("파란 버스", 0x2e6fd8, true, a.x - hw - 14, -2790, 0);
      }
      function nearRide(p){ for(var i = 0; i < DG.rides.length; i++){ var r = DG.rides[i]; if(r !== DG.riding && Math.hypot(p.x - r.x, p.z - r.z) < (r.big ? 22 : 15)) return r; } return null; }

      // ---------- 가게 안 ----------
      var SHOP_X = 2500, SHOP_Z = -300, SHOP_Y = 1400, SW = 64, SL = 46, SH = 17, shopRooms = {};
      function shopCenter(k){ return { x:SHOP_X + k*110, z:SHOP_Z }; }
      function buildShop(k){
        var S = SHOPS[k], C = shopCenter(k), g = new THREE.Group(); g.position.set(C.x, SHOP_Y, C.z);
        var fl = ct(128, 128, function(c){ c.fillStyle = "#d8d2c4"; c.fillRect(0, 0, 128, 128); c.fillStyle = "#b7ad98"; c.fillRect(0, 0, 64, 64); c.fillRect(64, 64, 64, 64); }, [SW/8, SL/8]);
        var f = new THREE.Mesh(new THREE.PlaneGeometry(SW, SL), new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:fl })); f.rotation.x = -Math.PI/2; g.add(f);
        var wm = mat(S.wall); function wall(w, h, x, y, z, ry){ var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); }
        wall(SW, SH, 0, SH/2, SL/2, Math.PI); wall(SL, SH, SW/2, SH/2, 0, -Math.PI/2); wall(SL, SH, -SW/2, SH/2, 0, Math.PI/2);
        wall(SW/2 - 7, SH, -(SW/4 + 3.5), SH/2, -SL/2, 0); wall(SW/2 - 7, SH, (SW/4 + 3.5), SH/2, -SL/2, 0);   // 문 양옆 (문 폭 14)
        box(g, 14, 3.6, 0.8, mat(S.wall), 0, SH - 1.8, -SL/2);
        var sg = new THREE.Mesh(new THREE.PlaneGeometry(36, 7.5), new THREE.MeshBasicMaterial({ map:textTex(S.name, S.bg, S.fg, 512, 106) })); sg.position.set(0, 12.5, SL/2 - 0.2); sg.rotation.y = Math.PI; g.add(sg);
        var dr = new THREE.Mesh(new THREE.PlaneGeometry(14, 11), new THREE.MeshBasicMaterial({ color:0xfff2a8, transparent:true, opacity:0.55 })); dr.position.set(0, 5.5, -SL/2 + 0.2); g.add(dr);
        // 선반
        for(var r = 0; r < 3; r++) for(var i = 0; i < 7; i++){ var gc = S.goods[(i + r) % S.goods.length]; box(g, 3.6, 1.4, 2.2, mat(gc), -SW/2 + 6 + i*8.2, 4.2 + r*3.6, SL/2 - 2); }
        box(g, SW - 4, 0.6, 3.4, mat(0x7a5a3a), 0, 2.6, SL/2 - 2); box(g, SW - 4, 0.6, 3.4, mat(0x7a5a3a), 0, 6.2, SL/2 - 2); box(g, SW - 4, 0.6, 3.4, mat(0x7a5a3a), 0, 9.8, SL/2 - 2);
        for(r = 0; r < 2; r++) for(i = 0; i < 4; i++){ box(g, 3, 6, 10, mat(0x9b7b55), -SW/2 + 4, 3, -6 + (i - 1.5)*0 + (r*0) + i*5 - 8 + r*0); }
        // 계산대 + 점원
        box(g, 24, 4.4, 5, mat(0x8b6b4a), 8, 2.2, 6); box(g, 22, 0.5, 4.4, mat(0xe6dcc8), 8, 4.6, 6);
        var npc = new THREE.Group(); cyl(npc, 2.2, 2.6, 6.4, mat(S.npc), 0, 3.2, 0, 14); var hd = new THREE.Mesh(new THREE.SphereGeometry(2.1, 14, 10), mat(0xf2c9a0)); hd.position.y = 8.3; npc.add(hd); box(npc, 3.6, 1.2, 3.6, mat(S.npc), 0, 10.4, 0);
        var ey = new THREE.MeshBasicMaterial({ color:0x222222 }); [[-0.8, 0], [0.8, 0]].forEach(function(e){ var s = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), ey); s.position.set(e[0], 8.5, -1.9); npc.add(s); });
        npc.position.set(8, 0, 10.5); npc.rotation.y = 0; g.add(npc); g.userData.npc = { x:C.x + 8, z:C.z + 10.5 };
        // 손님용 탁자
        [[-16, -4], [-4, -8]].forEach(function(q, qi){ cyl(g, 3, 3, 0.6, mat(0xe9dcc2), q[0], 4, q[1], 16); cyl(g, 0.5, 0.5, 4, mat(0x6b4a2f), q[0], 2, q[1], 8); });
        g.visible = false; scene.add(g); shopRooms[k] = g; return g;
      }
      function inShopRect(x, z, k){ var C = shopCenter(k); return Math.abs(x - C.x) < SW/2 - 2.5 && Math.abs(z - C.z) < SL/2 - 1.5; }
      var prevAir = window.airCands;
      window.airCands = function(x, z, c){ if(prevAir) prevAir(x, z, c); if(x > SHOP_X - 40){ for(var k = 0; k < SHOPS.length; k++) if(inShopRect(x, z, k)){ c.push(SHOP_Y); return; } } };
      function shopOf(p){ if(p.x < SHOP_X - 40) return -1; for(var k = 0; k < SHOPS.length; k++) if(inShopRect(p.x, p.z, k)) return k; return -1; }
      function enterShop(p, d){
        var C = shopCenter(d.shop); if(!shopRooms[d.shop]) buildShop(d.shop);
        DG.exit = { x:p.x, z:p.z }; if(window.skyTeleport) window.skyTeleport(p, C.x, C.z - SL/2 + 6, SHOP_Y); var cs = state.cam; cs.yaw = cs.target = 0; cs.fx = C.x; cs.fz = C.z - SL/2 + 6; cs.prevV = 999; SKY_REF = SHOP_Y; DG.inShop = d.shop;
        showToast("🏪 " + SHOPS[d.shop].name + "에 들어왔어요! (E 로 점원과 이야기 · 문 쪽에서 E 로 나가기)");
      }
      function leaveShop(p){
        var ex = DG.exit || { x:0, z:-80 }; if(window.skyTeleport) window.skyTeleport(p, ex.x, ex.z, 0); var cs = state.cam; cs.yaw = cs.target = 0; cs.fx = ex.x; cs.fz = ex.z; cs.prevV = 999; SKY_REF = 0; DG.inShop = -1; showToast("👋 가게에서 나왔어요.");
      }

      // ---------- 낙하산 ----------
      var chute = null;
      function buildChute(){
        var g = new THREE.Group(), tex = ct(256, 64, function(c, W, H){ var cols = ["#e74c3c", "#fff", "#3498db", "#fff", "#f1c40f", "#fff", "#2ecc71", "#fff"]; for(var i = 0; i < 8; i++){ c.fillStyle = cols[i]; c.fillRect(i*W/8, 0, W/8, H); } });
        var dome = new THREE.Mesh(new THREE.SphereGeometry(11, 24, 12, 0, Math.PI*2, 0, Math.PI/2), new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0,  map:tex, side:THREE.DoubleSide })); dome.scale.set(1, 0.62, 1); dome.position.y = 4; g.add(dome);
        var pts = []; for(var i = 0; i < 8; i++){ var a = i/8*Math.PI*2; pts.push(Math.cos(a)*10.8, 4.4, Math.sin(a)*10.8, 0, -3, 0); }
        var lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color:0xffffff }))); g.visible = false; scene.add(g); return g;
      }
      DG.paraConstrain = function(p){
        if(!DG.para) return false; p.x = Math.max(-600, Math.min(2150, p.x)); p.z = Math.max(-3400, Math.min(2900, p.z)); if(p.x > SKY.edgeX && p.z < -30) p.z = -30;
        var tx = SKY.tree.x, tz = SKY.tree.z, dx = p.x - tx, dz = p.z - tz, d = Math.hypot(dx, dz); if(d < 46 && d > 0.01){ p.x = tx + dx/d*46; p.z = tz + dz/d*46; } return true; };
      function startChute(p){
        if(DG.para || DG.riding || DG.inShop >= 0 || p.x <= SKY.edgeX || SKY_REF < 40 || SKY_REF > 900) return false;
        DG.para = { t:0 }; p.y = SKY_REF + p.y + 3; p.vy = 0; p.onGround = false; SKY_REF = 0; window.vilRideMul = 0.75; if(!chute) chute = buildChute(); chute.visible = true;
        showToast("🪂 낙하산을 폈어요! 방향키로 날아갈 방향을 조절해요. 땅에 닿으면 접혀요."); return true;
      }
      function endChute(p){ DG.para = null; window.vilRideMul = 1; if(chute) chute.visible = false; p.squash = -0.4; showToast("🛬 사뿐히 착지했어요!"); }
      window.dgKey = function(k){ if(k === "b"){ var p = state.player; if(!screens.game.hidden) startChute(p); } };

      // ---------- 훅: 이동 막기 / 높이 / E 상호작용 / 장소 이름 ----------
      DG.h = function(x, z){ if(!DG.riding || z > -1000 || z < -1475) return 0; var a = atZ(z); return Math.abs(x - a.x) < hw ? a.y : 0; };
      DG.push = function(p, px0, pz0){
        if(p.z > -1000 || p.x < -700 || p.x > 700) return;
        if(terrH(p.x, p.z) > 4){ if(terrH(p.x, pz0) <= 4) p.x = px0; else if(terrH(px0, p.z) <= 4) p.z = pz0; else { p.x = px0; p.z = pz0; } }
        if(DG.riding && p.z > -1475){ var a = atZ(p.z), dx = p.x - a.x; if(a.y > 1 && Math.abs(dx) > hw - 1.6) p.x = a.x + (dx > 0 ? 1 : -1)*(hw - 1.6); }
      };
      var ZONES = [[-45, -1000, "국도 4호선", "왜관에서 대구로 가는 평지 길 (차만 다녀요)"], [-1000, -1440, "고가 언덕길", "기둥 위로 이어진 고가도로"], [-1440, -1790, "대구 관문 고개", "큰 산을 가르고 지나는 길"], [-1790, -2150, "대구 북구 가는 길", "칠곡을 지나 대구로 들어서요"], [-2150, -2700, "대구 북구 칠곡 아파트 단지", "칠곡 3지구 풍경 (임시)"], [-2700, -3430, "대구 도심", "대구역 · 동대구역 · 83타워 (임시 모델)"]];
      window.dgPlace = function(p){
        if(DG.inShop >= 0) return { id:"shop" + DG.inShop, name:SHOPS[DG.inShop].name, sub:"대구 도심의 가게" };
        if(p.x > SKY.edgeX || p.z > -45) return null; for(var i = 0; i < ZONES.length; i++) if(p.z <= ZONES[i][0] && p.z > ZONES[i][1]) return { id:"dg" + i, name:ZONES[i][2], sub:ZONES[i][3] }; return null; };
      function nearDoor(p){ for(var i = 0; i < DG.doors.length; i++){ var d = DG.doors[i]; if(Math.hypot(p.x - d.x, p.z - d.z) < 10) return d; } return null; }
      function nearClerk(p){ var s = DG.inShop; if(s < 0 || !shopRooms[s]) return false; var n = shopRooms[s].userData.npc; return Math.hypot(p.x - n.x, p.z - n.z) < 16; }
      function nearExit(p){ var s = DG.inShop; if(s < 0) return false; var C = shopCenter(s); return p.z < C.z - SL/2 + 10 && Math.abs(p.x - C.x) < 10; }
      window.dgHint = function(p){
        if(DG.para) return null; if(DG.riding) return "E 눌러 " + DG.riding.name + "에서 내리기";
        if(DG.inShop >= 0){ if(nearExit(p)) return "E 눌러 가게에서 나가기"; if(nearClerk(p)) return "E 눌러 점원과 이야기하기"; return null; }
        var r = nearRide(p); if(r) return "E 눌러 " + r.name + " 타기"; var d = nearDoor(p); if(d) return "E 눌러 '" + SHOPS[d.shop].name + "' 들어가기"; return null; };
      var lineIdx = 0;
      window.dgInteract = function(p){
        if(DG.para) return true;
        if(DG.riding){ var a = DG.riding, g = atZ(p.z); if(p.z < -1000 && p.z > -1475 && g.y > 1 && Math.abs(p.x - g.x) < hw){ showToast("🚫 고가도로 위에서는 내릴 수 없어요."); return true; }
          var c = state.cam.yaw; a.x = p.x + Math.cos(c)*0; a.z = p.z; a.g.position.set(p.x - Math.cos(c)*9, 0.1, p.z + Math.sin(c)*9); a.x = a.g.position.x; a.z = a.g.position.z; a.ring.position.set(a.x, 0.2, a.z); a.ring.visible = true; DG.riding = null; window.vilRideMul = 1; showToast("🛑 " + a.name + "에서 내렸어요."); return true; }
        if(DG.inShop >= 0){ if(nearExit(p)){ leaveShop(p); return true; } if(nearClerk(p)){ var L = SHOPS[DG.inShop].lines; showToast("💬 " + L[lineIdx++ % L.length]); return true; } return false; }
        var r = nearRide(p); if(r){ DG.riding = r; r.ring.visible = false; window.vilRideMul = r.mul; showToast("🚗 " + r.name + "을(를) 탔어요! 방향키로 달리고, 내리려면 E · 고가도로도 달릴 수 있어요."); return true; }
        var d = nearDoor(p); if(d){ enterShop(p, d); return true; }
        return false; };

      // ---------- 만들기 + 매 프레임 ----------
      function build(){
        DG.built = true; var t0 = performance.now();
        [buildRoad, buildTerrain, buildApartments, buildCity, buildScenery, buildCars, buildRides].forEach(function(f){ try{ f(); }catch(e){ DG.err = (DG.err || "") + f.name + ":" + e.message + " | "; if(window.console) console.error("DG " + f.name, e); } });
        DG.buildMs = performance.now() - t0;
      }
      var nightK = 0, shown = false;
      window.dgTick = function(t, dt, p){
        // 낙하산
        if(DG.para){ DG.para.t += dt; p.vy = -22 - GRAVITY*Math.min(dt, 0.05); p.onGround = false;      // 중력을 상쇄해서 일정한 속도로 천천히 내려와요
          if(chute){ chute.position.set(p.x, p.y + 18.5, p.z); chute.rotation.z = Math.sin(t/520)*0.07; chute.rotation.x = Math.cos(t/610)*0.05; }
          if(DG.para.t > 0.5 && p.y <= 0.05) endChute(p); }
        else if(!shown && p.x > SKY.edgeX && SKY_REF >= 85 && SKY_REF < 900){ shown = true; showToast("🪂 하늘섬에서 B 를 누르면 낙하산을 펴고 내려갈 수 있어요! (방향키로 방향 조절)"); }
        if(!DG.built){ if(!window.__dbgForceDG && (!window.__riverBuilt || p.z > 300 || p.x > 700)) return; build(); }
        ROOT.visible = p.z < 600 && p.x < 760 && DG.inShop < 0;
        var nw = Math.min(1, window.__nightW || 0); nightK += (nw - nightK)*Math.min(1, dt*2);
        // 밤 불빛
        var e = nightK < 0.02 ? 0 : nightK; nightMats.forEach(function(m){ m.emissiveIntensity = e*0.95; });
        if(DG.lampBulbs){ DG.lampBulbs.material.color.setRGB(0.55 + e*0.45, 0.54 + e*0.42, 0.5 + e*0.1); }
        if(carIM.trMat){ carIM.trMat.opacity = e*0.5; carIM.trMat2.opacity = e*0.22; }
        if(ROOT.visible){ updateCars(dt, p, e); for(var i = 0; i < DG.rides.length; i++){ var r = DG.rides[i]; if(r !== DG.riding) r.ring.material.opacity = 0.35 + 0.2*Math.sin(t/300 + i); } }
        // 타고 있는 차
        if(DG.riding){ var r2 = DG.riding; if(r2.px === undefined){ r2.px = p.x; r2.pz = p.z; }
          var dx = p.x - r2.px, dz = p.z - r2.pz; if(dx*dx + dz*dz > 0.0004){ var want = Math.atan2(dx, dz), df = want - r2.hd; while(df > Math.PI) df -= Math.PI*2; while(df < -Math.PI) df += Math.PI*2; r2.hd += df*Math.min(1, dt*9); }
          r2.px = p.x; r2.pz = p.z; r2.g.position.set(p.x, groundHeightAt(p.x, p.z) + p.y + 0.1, p.z); r2.g.rotation.y = r2.hd; if(r2.g.parent !== ROOT){ ROOT.add(r2.g); } r2.g.visible = true; }
        else { for(var j = 0; j < DG.rides.length; j++) DG.rides[j].px = undefined; }
        // 가게 안
        var sk = shopOf(p); if(sk !== DG.inShop && sk >= 0){ DG.inShop = sk; } if(DG.inShop >= 0 && sk < 0 && p.x > SKY.edgeX && SKY_REF < 1300) DG.inShop = -1;
        for(var k in shopRooms) shopRooms[k].visible = (+k === DG.inShop);
      };
      DG.start = startChute;
    })();
