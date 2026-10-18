    // ================= 대구 가는 길 V84: 구간마다 가로 = 세로로 넓힌 큰 세계 (구역 스트리밍) =================
    // 구간(왜관에서 새로 넓힌 길이 D1 = 3380 을 기준으로, 곱하기는 이 값만 써요):
    //   A 칠곡→대구 북구 입구 D1 × D1 (서쪽은 농촌 마을이라 동쪽으로만 넓혀요) / B 대구 북구 2·D1 정사각형 / C 북구→도심 길 3·D1 정사각형
    //   D 대구 도심 = 원래 칠곡원정대 맵 크기(2720) 정사각형 / E 도심→동대구 3·D1 정사각형
    // 가까운 땅(구역 750×750)과 가까운 도로 토막만 만들었다가 멀어지면 지워요. 도로는 곡선 3D 띠, 차는 InstancedMesh.
    // 건물·산·간판 그림은 전부 임시 모델이에요 (나중에 고화질 그림/모델로 바꿀 자리).
    (function buildDaegu(){
      var DG = window.DG = { riding:null, para:null, built:false, inShop:-1, doors:[], rides:[], chunks:0, segs:0 };
      var hw = 14, DECK = 2.4, ZH = -42, CH = 750, SEG = 150;
      var D1 = 3380, ZA = -40 - D1, ZB = ZA - 2*D1, ZC = ZB - 3*D1, ZD = ZC - 2720, ZE = ZD - 3*D1, ZMIN = ZE - 140;
      var SECS = [
        { id:"A", z0:-40, z1:ZA, xl:-600, xr:-600 + D1, kind:"rural" },
        { id:"B", z0:ZA, z1:ZB, xl:-2*D1, xr:2*D1, kind:"apt", G:470 },
        { id:"C", z0:ZB, z1:ZC, xl:-1.5*D1, xr:1.5*D1, kind:"rural" },
        { id:"D", z0:ZC, z1:ZD, xl:-1360, xr:1360, kind:"city", G:210 },
        { id:"E", z0:ZD, z1:ZMIN, xl:-1.5*D1, xr:1.5*D1, kind:"city2", G:210 }];
      DG.sections = { SECS:SECS, ZA:ZA, ZB:ZB, ZC:ZC, ZD:ZD, ZE:ZE, ZMIN:ZMIN, D1:D1 };
      function secAt(z){ for(var i = 0; i < SECS.length; i++) if(z <= SECS[i].z0 && z > SECS[i].z1) return SECS[i]; return null; }
      function inside(x, z, m){ var S = secAt(z); if(!S) return false; m = m === undefined ? 30 : m; return x > S.xl + m && x < S.xr - m; }
      function sstep(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      function mkRng(seed){ var s = (seed >>> 0) || 1; return function(){ s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s/4294967296; }; }
      var rnd = mkRng(20241018);
      function hash(i, j){ var h = Math.sin(i*127.1 + j*311.7)*43758.5453; return h - Math.floor(h); }
      function vn(x, z){ var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz, ux = fx*fx*(3 - 2*fx), uz = fz*fz*(3 - 2*fz);
        var a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return a + (b - a)*ux + (c - a)*uz + (a - b - c + d)*ux*uz; }
      function ridged(x, z){ var s = 0, a = 1, f = 1, tot = 0; for(var o = 0; o < 5; o++){ var n = 1 - Math.abs(vn(x*f + o*7.3, z*f - o*3.1)*2 - 1); n *= n; s += n*a; tot += a; a *= 0.5; f *= 2.1; } return s/tot; }

      // ---------- 도로 (곡선 → 4 간격으로 다시 찍은 점들) ----------
      var ROADS = [], RBK = {};
      function cr(p0, p1, p2, p3, t){ var t2 = t*t, t3 = t2*t; return 0.5*((2*p1) + (-p0 + p2)*t + (2*p0 - 5*p1 + 4*p2 - p3)*t2 + (-p0 + 3*p1 - 3*p2 + p3)*t3); }
      function sampleRoad(pts, closed){
        var n = pts.length, raw = [], i, k, segs = closed ? n : n - 1;
        for(i = 0; i < segs; i++){ var p0 = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], p1 = pts[i], p2 = pts[closed ? (i + 1) % n : i + 1], p3 = pts[closed ? (i + 2) % n : Math.min(n - 1, i + 2)];
          for(k = 0; k < 24; k++){ var t = k/24; raw.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t), cr(p0[2], p1[2], p2[2], p3[2], t)]); } }
        raw.push(closed ? raw[0].slice() : pts[n - 1].slice());
        var L = [0]; for(i = 1; i < raw.length; i++) L.push(L[i - 1] + Math.hypot(raw[i][0] - raw[i - 1][0], raw[i][1] - raw[i - 1][1]));
        var ds = 4, N = Math.floor(L[L.length - 1]/ds) + 1, X = [], Z = [], Y = [], j = 0;
        for(i = 0; i < N; i++){ var s = i*ds; while(j < raw.length - 2 && L[j + 1] < s) j++; var f = (s - L[j])/Math.max(1e-6, L[j + 1] - L[j]); X.push(raw[j][0] + (raw[j + 1][0] - raw[j][0])*f); Z.push(raw[j][1] + (raw[j + 1][1] - raw[j][1])*f); Y.push(Math.max(0, raw[j][2] + (raw[j + 1][2] - raw[j][2])*f)); }
        var TX = [], TZ = []; for(i = 0; i < N; i++){ var a = closed ? (i - 1 + N) % N : Math.max(0, i - 1), b = closed ? (i + 1) % N : Math.min(N - 1, i + 1), dx = X[b] - X[a], dz = Z[b] - Z[a], l = Math.hypot(dx, dz) || 1; TX.push(dx/l); TZ.push(dz/l); }
        return { n:N, ds:ds, len:(N - 1)*ds, x:X, z:Z, y:Y, tx:TX, tz:TZ };
      }
      function makeRoad(id, name, hwR, pts, o){
        o = o || {}; var r = sampleRoad(pts, !!o.closed); r.id = id; r.name = name; r.hw = hwR; r.mono = !!o.mono; r.closed = !!o.closed; r.cars = o.cars !== false; r.flat = !!o.flat; r.idx = ROADS.length; ROADS.push(r);
        for(var i = 0; i < r.n; i++){ if(r.y[i] > 0.05 ? true : i % 3 === 0){ var key = Math.floor(r.x[i]/100) + "," + Math.floor(r.z[i]/100); (RBK[key] = RBK[key] || []).push(r.idx, i); } }
        return r; }
      function monoPts(fx, z0, z1, ef){ var pts = [], z; for(z = z0; z > z1 + 55; z -= 110) pts.push([fx(z), z, ef ? ef(z) : 0]); pts.push([fx(z1), z1, 0]); return pts; }
      function wander(base, amp, per, ph){ return function(z){ var q = -z; return base + amp*Math.sin(q/per + ph) + amp*0.5*Math.sin(q/(per*0.37) + ph*2); }; }
      var EL = [[-1900, -2800, 23], [-12000, -13300, 20], [-17000, -18700, 24], [-26000, -27300, 18]];      // R0 고가 구간 [위쪽 z, 아래쪽 z, 높이]
      function elev(z){ var y = 0; for(var i = 0; i < EL.length; i++){ var e = EL[i], t = Math.min(sstep(e[0], e[0] - 260, z), sstep(e[1], e[1] + 260, z)); y = Math.max(y, e[2]*t); } return y; }
      function xAt(z){ var q = -z; return (70*Math.sin(q/1900) + 40*Math.sin(q/713 + 1.3))*sstep(0, 700, q)*(1 - sstep(-ZE - 1700, -ZE, q)); }
      function xOf(r, z){ var lo = 0, hi = r.n - 1; while(hi - lo > 1){ var m = (lo + hi) >> 1; if(r.z[m] > z) lo = m; else hi = m; } var f = (r.z[lo] - z)/Math.max(1e-6, r.z[lo] - r.z[hi]); return r.x[lo] + (r.x[hi] - r.x[lo])*f; }
      function yOf(r, z){ var lo = 0, hi = r.n - 1; while(hi - lo > 1){ var m = (lo + hi) >> 1; if(r.z[m] > z) lo = m; else hi = m; } var f = (r.z[lo] - z)/Math.max(1e-6, r.z[lo] - r.z[hi]); return r.y[lo] + (r.y[hi] - r.y[lo])*f; }
      function conn(id, A, za, B, zb){ var xa = xOf(A, za), xb = xOf(B, zb); return makeRoad(id, "연결도로", 10, [[xa, za, 0], [xa, za - 80, 0], [xa + (xb - xa)*0.5, (za + zb)/2, 0], [xb, zb + 80, 0], [xb, zb, 0]], { cars:true, flat:true }); }
      function lemni(cx, cz, a, ex){ var pts = [], n = 56; for(var i = 0; i < n; i++){ var t = i/n*Math.PI*2, d = 1 + Math.sin(t)*Math.sin(t), up = Math.max(0, 1 - Math.abs(t - Math.PI/2)/0.95); pts.push([cx + a*Math.cos(t)/d, cz + ex*a*Math.sin(t)*Math.cos(t)/d, 17*sstep(0, 1, up)]); } return pts; }
      var R0 = makeRoad("R0", "국도 4호선", hw, monoPts(xAt, -40, ZMIN, elev), { mono:true });
      var H1 = makeRoad("H1", "경부고속도로", 20, monoPts(wander(950, 60, 2300, 1), -60, ZC, null), { mono:true });
      var L2 = makeRoad("L2", "지방도 (동쪽)", 10, monoPts(wander(1950, 70, 1800, 2), -60, ZB, null), { mono:true });
      var H3 = makeRoad("H3", "서쪽 고속도로", 20, monoPts(wander(-1100, 60, 2100, 3), ZA - 100, ZE + 1500, null), { mono:true });
      var R4 = makeRoad("R4", "서쪽 국도", 10, monoPts(wander(-2300, 80, 1700, 4), ZB, ZC, null), { mono:true });
      var R5 = makeRoad("R5", "동쪽 국도", 14, monoPts(wander(2450, 80, 1900, 5), ZB, ZC, null), { mono:true });
      var E1 = makeRoad("E1", "동대구 서쪽 도로", 20, monoPts(wander(-1800, 60, 2000, 6), ZD, ZE + 400, null), { mono:true });
      var E2 = makeRoad("E2", "동대구 동쪽 도로", 14, monoPts(wander(2000, 60, 2000, 7), ZD, ZE + 400, null), { mono:true });
      conn("K1", R0, -900, H1, -1250); conn("K2", H1, -1600, L2, -2100); conn("K3", R0, ZA - 1200, H3, ZA - 1800); conn("K4", R0, ZB - 1500, R4, ZB - 2300); conn("K5", R0, ZB - 2600, R5, ZB - 3400);
      conn("K6", R0, ZD - 1500, E1, ZD - 2200); conn("K7", R0, ZD - 3300, E2, ZD - 4000); conn("K8", H1, ZB - 800, R5, ZB - 1600);
      // 8자 도로 (한쪽이 다리로 겹쳐 지나가요) + 꼬불꼬불 도로
      var F8C = { x:1250, z:ZB - 5200 }; makeRoad("F1", "8자 도로", 12, lemni(F8C.x, F8C.z, 520, 0.5), { closed:true, flat:true });
      (function(){ var a = xOf(R0, F8C.z), b = xOf(R5, F8C.z); makeRoad("K10", "8자 도로 연결", 10, [[a, F8C.z + 150, 0], [a + 150, F8C.z + 60, 0], [F8C.x - 520, F8C.z, 0]], { flat:true }); makeRoad("K11", "8자 도로 연결", 10, [[F8C.x + 520, F8C.z, 0], [b - 150, F8C.z - 60, 0], [b, F8C.z - 150, 0]], { flat:true }); })();
      var F8E = { x:-2600, z:ZD - 6200 }; makeRoad("F2", "8자 도로", 12, lemni(F8E.x, F8E.z, 480, 0.5), { closed:true, flat:true });
      (function(){ var a = xOf(E1, F8E.z), pts = []; pts.push([a, F8E.z + 100, 0]); pts.push([(a + F8E.x + 480)/2, F8E.z + 40, 0]); pts.push([F8E.x + 480, F8E.z, 0]); makeRoad("K12", "8자 도로 연결", 10, pts, { flat:true }); })();
      (function(){ var pts = [], z0 = ZB - 5800, a = xOf(R0, z0), b = xOf(R4, z0 - 1900); pts.push([a, z0, 0]); for(var k = 1; k < 17; k++){ var f = k/17; pts.push([a + (b - a)*f + Math.sin(k*0.9)*520*Math.sin(f*Math.PI), z0 - k*112, 0]); } pts.push([b, z0 - 1900, 0]); makeRoad("S1", "꼬불꼬불 도로", 10, pts, { flat:true }); })();
      DG.roads = ROADS;
      var GAPR = ROADS.filter(function(r){ return r.mono; });
      function roadNear(x, z){ var cx = Math.floor(x/100), cz = Math.floor(z/100), best = null, bd = 1e9, bi = 0;
        for(var dx = -1; dx <= 1; dx++) for(var dz = -1; dz <= 1; dz++){ var a = RBK[(cx + dx) + "," + (cz + dz)]; if(!a) continue;
          for(var k = 0; k < a.length; k += 2){ var r = ROADS[a[k]], i = a[k + 1], d = Math.hypot(r.x[i] - x, r.z[i] - z) - r.hw; if(d < bd){ bd = d; best = r; bi = i; } } }
        return best ? { d:bd, r:best, i:bi } : { d:1e9, r:null, i:0 }; }
      function deckY(x, z){ var cx = Math.floor(x/100), cz = Math.floor(z/100), y = 0;
        for(var dx = -1; dx <= 1; dx++) for(var dz = -1; dz <= 1; dz++){ var a = RBK[(cx + dx) + "," + (cz + dz)]; if(!a) continue;
          for(var k = 0; k < a.length; k += 2){ var r = ROADS[a[k]], i = a[k + 1]; if(r.y[i] > 0.05 && Math.hypot(r.x[i] - x, r.z[i] - z) < r.hw + 2 && r.y[i] > y) y = r.y[i]; } }
        return y; }
      function atS(r, s){ if(r.closed){ s = ((s % r.len) + r.len) % r.len; } else s = Math.max(0, Math.min(r.len - 0.001, s)); var i = Math.floor(s/r.ds), f = s/r.ds - i, j = (i + 1) % r.n;
        var tx = r.tx[i] + (r.tx[j] - r.tx[i])*f, tz = r.tz[i] + (r.tz[j] - r.tz[i])*f, l = Math.hypot(tx, tz) || 1;
        return { x:r.x[i] + (r.x[j] - r.x[i])*f, z:r.z[i] + (r.z[j] - r.z[i])*f, y:r.y[i] + (r.y[j] - r.y[i])*f, tx:tx/l, tz:tz/l }; }
      DG.atS = atS; DG.roadNear = roadNear; DG.xOf = xOf; DG.R0 = R0;

      // ---------- 큰 산 (뾰족하고 웅장한 3D 산, 길이 지나는 고개만 뚫려 있어요) + 고가 구간 언덕 ----------
      var TZ = [{ a:-1850, b:-2850, H:64, type:"hill" }, { a:-2850, b:-3250, H:330, c:-3040, type:"wall" }, { a:-11900, b:-13400, H:70, type:"hill" }, { a:-16900, b:-18800, H:70, type:"hill" }];
      function gapDist(x, z){ var d = 1e9; for(var i = 0; i < GAPR.length; i++){ var r = GAPR[i]; if(z > r.z[0] || z < r.z[r.n - 1]) continue; var dd = Math.abs(x - xOf(r, z)) - (r.hw - 14); if(dd < d) d = dd; } return d; }
      function terrH(x, z){
        for(var k = 0; k < TZ.length; k++){ var Q = TZ[k]; if(z > Q.a || z < Q.b) continue; var S = secAt(z); if(!S || x < S.xl || x > S.xr) return 0;
          var d = gapDist(x, z), h; if(d > 1e8) d = 999;
          if(Q.type === "wall"){ var ew = 1 - sstep(70, 180, Math.abs(z - Q.c)); h = ew*((330*(0.28 + 0.72*ridged(x/200 + 3, z/200)))*sstep(28, 85, d) + (62*ridged(x/70 + 9, z/70 - 4) + 18*ridged(x/21, z/21 + 2))*sstep(32, 70, d)); }
          else { var eh = Math.min(sstep(Q.a, Q.a - 150, z), sstep(Q.b, Q.b + 150, z)); h = Q.H*eh*(0.25 + 0.75*vn(x/130, z/130))*sstep(46, 150, d); }
          return h; }
        return 0;
      }
      DG.terrH = terrH;

      // ---------- 질감 (그림 없이 코드로) ----------
      function ct(w, h, fn, rep){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0], rep[1]); if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
      var roadTexCache = {};
      function roadTex(hwR){      // 가로 폭 2·hwR 에 맞는 차선 무늬
        var key = hwR < 12 ? 1 : (hwR < 16 ? 2 : 3); if(roadTexCache[key]) return roadTexCache[key];
        var hwT = key === 1 ? 10 : (key === 2 ? 14 : 20), t = ct(512, 512, function(g, w, h){ g.fillStyle = "#3b3d42"; g.fillRect(0, 0, w, h);
          for(var i = 0; i < 9000; i++){ var v = 50 + Math.random()*26; g.fillStyle = "rgb(" + v + "," + v + "," + (v + 4) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
          var U = w/(hwT*2); function line(x, wd, col, dash){ g.fillStyle = col; if(!dash) g.fillRect((hwT + x)*U - wd*U/2, 0, wd*U, h); else for(var y = 0; y < h; y += h/2) g.fillRect((hwT + x)*U - wd*U/2, y, wd*U, h/4); }
          line(-0.55, 0.28, "#e8b923"); line(0.55, 0.28, "#e8b923"); line(-(hwT - 1.6), 0.34, "#f1f1f1"); line(hwT - 1.6, 0.34, "#f1f1f1");
          if(key >= 2){ line(-(hwT - 1.6)*0.52, 0.26, "#f1f1f1", true); line((hwT - 1.6)*0.52, 0.26, "#f1f1f1", true); } if(key === 3){ line(-(hwT - 1.6)*0.22, 0.2, "#f1f1f1", true); line((hwT - 1.6)*0.22, 0.2, "#f1f1f1", true); } });
        t.anisotropy = 16; return roadTexCache[key] = t; }
      var sideTex = ct(64, 64, function(g, w, h){ g.fillStyle = "#b8b6b0"; g.fillRect(0, 0, w, h); for(var i = 0; i < 300; i++){ var v = 150 + Math.random()*60; g.fillStyle = "rgb(" + v + "," + v + "," + (v - 6) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); } });
      var pavTex = ct(128, 128, function(g, w, h){ g.fillStyle = "#c9c5bb"; g.fillRect(0, 0, w, h); for(var i = 0; i < 500; i++){ var v = 170 + Math.random()*50; g.fillStyle = "rgb(" + v + "," + v + "," + (v - 8) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 3, 3); } g.strokeStyle = "rgba(120,116,105,.7)"; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w/2, 0); g.lineTo(w/2, h); g.moveTo(0, h/2); g.lineTo(w, h/2); g.stroke(); });
      function tileTexFor(G, apt){      // 한 칸(G) 의 길 + 인도 + 블록 바닥. 가장자리가 길이에요 (격자 도시)
        var px = apt ? 512 : 256, per = px/G, st = 10*per, sw = 5*per;
        return ct(px, px, function(g, w, h){ g.fillStyle = apt ? "#a8c488" : "#c6c2b8"; g.fillRect(0, 0, w, h); for(var i = 0; i < w*h/60; i++){ var v = apt ? 150 + Math.random()*40 : 175 + Math.random()*45; g.fillStyle = apt ? "rgb(" + (v - 50) + "," + v + "," + (v - 70) + ")" : "rgb(" + v + "," + v + "," + (v - 8) + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
          g.fillStyle = "#d8d4ca"; g.fillRect(st, st, w - 2*st, sw); g.fillRect(st, h - st - sw, w - 2*st, sw); g.fillRect(st, st, sw, h - 2*st); g.fillRect(w - st - sw, st, sw, h - 2*st);
          g.fillStyle = "#3f4146"; g.fillRect(0, 0, w, st); g.fillRect(0, h - st, w, st); g.fillRect(0, 0, st, h); g.fillRect(w - st, 0, st, h);
          g.fillStyle = "#e8e8e8"; var dl = Math.max(4, per*8); for(var q = 0; q < w; q += dl*2){ g.fillRect(q, 0, dl, 1.5); g.fillRect(q, h - 1.5, dl, 1.5); g.fillRect(0, q, 1.5, dl); g.fillRect(w - 1.5, q, 1.5, dl); } });
      }
      var facade = { col:ct(128, 128, function(g){ g.fillStyle = "#ece9e2"; g.fillRect(0, 0, 128, 128); for(var r = 0; r < 4; r++) for(var c = 0; c < 4; c++){ g.fillStyle = "#45607e"; g.fillRect(c*32 + 6, r*32 + 6, 20, 20); g.fillStyle = "rgba(255,255,255,.28)"; g.fillRect(c*32 + 6, r*32 + 6, 20, 5); g.fillStyle = "#cfcbc2"; g.fillRect(c*32, r*32 + 28, 32, 4); } }),
        emi:ct(128, 128, function(g){ g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128); for(var r = 0; r < 4; r++) for(var c = 0; c < 4; c++) if(Math.random() < 0.5){ g.fillStyle = Math.random() < 0.7 ? "#ffd98a" : "#cfe6ff"; g.fillRect(c*32 + 6, r*32 + 6, 20, 20); } }) };
      function textTex(txt, bg, fg, w, h, border){ return ct(w || 256, h || 64, function(g, W, H){ g.fillStyle = bg; g.fillRect(0, 0, W, H); if(border !== false){ g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(4, 4, W - 8, H - 8); } g.fillStyle = fg; g.font = "bold " + Math.floor(H*0.5) + "px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, W/2, H/2 + 2); }); }
      function mat(col, o){ o = o || {}; var m = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, color:col, flatShading:!!o.flat, vertexColors:!!o.vc, side:o.side || THREE.FrontSide }); if(o.map) m.map = o.map; if(o.fog === false) m.fog = false; return m; }
      function box(par, w, h, d, m, x, y, z){ var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); par.add(o); return o; }
      function cyl(par, rt, rb, h, m, x, y, z, seg){ var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 16), m); o.position.set(x, y, z); par.add(o); return o; }
      function inst(geo, m, n){ var im = new THREE.InstancedMesh(geo, m, Math.max(1, n)); im.frustumCulled = false; return im; }
      var UB = new THREE.BoxGeometry(1, 1, 1); UB.translate(0, 0.5, 0);
      var UP = new THREE.PlaneGeometry(1, 1); UP.rotateX(-Math.PI/2);
      var UPV = new THREE.PlaneGeometry(1, 1);
      var UC = new THREE.ConeGeometry(1, 1, 7); UC.translate(0, 0.5, 0);
      var UR = new THREE.ConeGeometry(0.7071, 1, 4); UR.rotateY(Math.PI/4); UR.translate(0, 0.5, 0);
      var UT = new THREE.CylinderGeometry(0.5, 0.8, 5, 6); UT.translate(0, 2.5, 0);
      var UCa = new THREE.ConeGeometry(4.6, 10, 7), UCb = new THREE.ConeGeometry(3.6, 8, 7); UCa.translate(0, 9, 0); UCb.translate(0, 14, 0);
      var ROCKG = new THREE.ConeGeometry(1, 1, 6); ROCKG.translate(0, 0.5, 0);

      var ROOT = new THREE.Group(); ROOT.visible = false; scene.add(ROOT); DG.ROOT = ROOT;
      var RB = {};      // 막는 상자들: z 200 칸마다 모아 두고 가까운 칸만 검사해요
      function addRect(x, z, hx, hz, owner){ var rr = { x:x, z:z, hx:hx, hz:hz }, c0 = Math.floor(-(z + hz)/200), c1 = Math.floor(-(z - hz)/200); for(var c = c0; c <= c1; c++) (RB[c] = RB[c] || []).push(rr); if(owner) owner.push(rr); return rr; }
      function dropRects(list){ list.forEach(function(rr){ var c0 = Math.floor(-(rr.z + rr.hz)/200), c1 = Math.floor(-(rr.z - rr.hz)/200); for(var c = c0; c <= c1; c++){ var a = RB[c]; if(a){ var k = a.indexOf(rr); if(k >= 0) a.splice(k, 1); } } }); }
      function hitRect(x, z){ var arr = RB[Math.floor(-z/200)]; if(!arr) return false; for(var i = 0; i < arr.length; i++){ var r = arr[i]; if(Math.abs(x - r.x) < r.hx + 1.5 && Math.abs(z - r.z) < r.hz + 1.5) return true; } return false; }
      var LMR = [];       // 랜드마크 자리 (일반 건물/나무가 피해요)
      function lmHit(x, z, pad){ for(var i = 0; i < LMR.length; i++){ var r = LMR[i]; if(Math.abs(x - r.x) < r.hx + pad && Math.abs(z - r.z) < r.hz + pad) return true; } return false; }
      var nightMats = [];
      var MX = new THREE.Matrix4(), MP = new THREE.Vector3(), MS = new THREE.Vector3(), MQ = new THREE.Quaternion(), ME = new THREE.Euler(), MC = new THREE.Color();
      function setM(im, i, x, y, z, sx, sy, sz, ry){ MP.set(x, y, z); MS.set(sx, sy, sz); MQ.setFromEuler(ME.set(0, ry || 0, 0)); MX.compose(MP, MQ, MS); im.setMatrixAt(i, MX); }
      var poleM = mat(0x6b6f76), lampMat = new THREE.MeshBasicMaterial({ color:0x9a9686 }); DG.lampMat = lampMat;
      var DS = THREE.DoubleSide, concM = mat(0xb9b6ae, { side:DS, map:sideTex }), barM = mat(0xcfccc4, { side:DS }), medM = mat(0x4d7a3a, { side:DS });
      var surfMats = {}; function surfMat(hwR){ var k = hwR < 12 ? 1 : (hwR < 16 ? 2 : 3); return surfMats[k] || (surfMats[k] = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, map:roadTex(hwR), side:DS, polygonOffset:true, polygonOffsetFactor:-6, polygonOffsetUnits:-6 })); }
      var swMat = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, map:pavTex, side:DS, polygonOffset:true, polygonOffsetFactor:-8, polygonOffsetUnits:-8 });
      var facadeMat = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, map:facade.col, emissive:0xffffff, emissiveMap:facade.emi, emissiveIntensity:0 }); nightMats.push(facadeMat);
      var PAL = [0xe3ddd0, 0xd0dae2, 0xe8d3c4, 0xc3cdd2, 0xe0dfda, 0xaabbd0, 0xd9cdb8];
      var blockGeoCache = {};
      function blockGeo(H, cols){ var k = H + "_" + cols; if(blockGeoCache[k]) return blockGeoCache[k]; var g = new THREE.BoxGeometry(1, 1, 1); g.translate(0, 0.5, 0); var uv = g.attributes.uv;
        for(var v = 0; v < uv.count; v++){ var face = Math.floor(v/4); if(face === 2 || face === 3) uv.setXY(v, uv.getX(v)*0.02, uv.getY(v)*0.02); else uv.setXY(v, uv.getX(v)*cols, uv.getY(v)*H/7); } return blockGeoCache[k] = g; }
      function blockMeshes(list, cols, parent, own){      // list: {x,z,w,d,h,c}  같은 높이끼리 한 번에 그려요
        var byH = {}; list.forEach(function(b){ (byH[b.h] = byH[b.h] || []).push(b); });
        Object.keys(byH).forEach(function(hk){ var H = +hk, arr = byH[hk], im = inst(blockGeo(H, cols), facadeMat, arr.length); im.count = arr.length;
          arr.forEach(function(b, i){ setM(im, i, b.x, 0, b.z, b.w, H, b.d, 0); im.setColorAt(i, MC.setHex(b.c)); }); parent.add(im); if(own) own.push(im); });
      }

      // ---------- 도로 토막 (가까운 것만 만들어요) ----------
      function newAcc(){ return { pos:[], uv:[], idx:[], base:0 }; }
      function yv(v, i, r){ return typeof v === "function" ? v(i, r.y[i]) : r.y[i] + v; }
      function addRib(acc, r, i0, i1, oA, yA, oB, yB, vsc){
        var k = 0; for(var i = i0; i <= i1; i++){ var nx = r.tz[i], nz = -r.tx[i], v = i*r.ds/(vsc || 24);
          acc.pos.push(r.x[i] + nx*oA, yv(yA, i, r), r.z[i] + nz*oA, r.x[i] + nx*oB, yv(yB, i, r), r.z[i] + nz*oB); acc.uv.push(0, v, 1, v);
          if(i > i0){ var a = acc.base + (k - 1)*2, b = a + 1, c = acc.base + k*2, d = c + 1; acc.idx.push(a, c, b, b, c, d); } k++; }
        acc.base += k*2; }
      function accMesh(acc, m, S){ if(!acc.pos.length) return null; var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(acc.pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(acc.uv, 2)); g.setIndex(acc.idx); g.computeVertexNormals(); S.geos.push(g); var me = new THREE.Mesh(g, m); S.g.add(me); return me; }
      var UBULB = new THREE.SphereGeometry(0.9, 8, 6), gantryTex = {};
      function gantryTexFor(a, b, c, d){ var k = a + b + c + d; return gantryTex[k] || (gantryTex[k] = ct(512, 160, function(g, W, H){ g.fillStyle = "#0e6b3a"; g.fillRect(0, 0, W, H); g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "bold 44px sans-serif"; g.fillText(a, W/2, 56); g.font = "bold 34px sans-serif"; g.fillText(b, W/2, 100); g.font = "26px sans-serif"; g.fillStyle = "#d6f0d6"; g.fillText(c, W/2, 138); })); }
      var segMap = {};
      function buildSeg(r, k){
        var i0 = k*SEG, i1 = Math.min(r.n - 1, i0 + SEG); if(i1 - i0 < 1) return null; var S = { g:new THREE.Group(), geos:[], ims:[] }, A = { surf:newAcc(), conc:newAcc(), med:newAcc(), sw:newAcc(), bar:newAcc() }, i, hwR = r.hw, elevated = false, big = hwR >= 14;
        for(i = i0; i <= i1; i++) if(r.y[i] > 0.3){ elevated = true; break; }
        addRib(A.surf, r, i0, i1, -hwR, 0.09 + r.idx*0.002, hwR, 0.09 + r.idx*0.002, 24);
        function bot(i, y){ return Math.max(y - DECK, -0.05); }
        if(elevated){ addRib(A.conc, r, i0, i1, -hwR, bot, hwR, bot, 24); addRib(A.conc, r, i0, i1, -hwR, bot, -hwR, 0.09, 24); addRib(A.conc, r, i0, i1, hwR, bot, hwR, 0.09, 24); }
        if(big || elevated){ [-hwR + 0.5, hwR - 0.5].forEach(function(o){ addRib(A.bar, r, i0, i1, o, 0.09, o, 2.4, 24); addRib(A.bar, r, i0, i1, o - 0.5, 2.4, o + 0.5, 2.4, 24); }); }
        if(big){ addRib(A.med, r, i0, i1, -0.9, 0.9, 0.9, 0.9, 24); addRib(A.bar, r, i0, i1, -0.9, 0.09, -0.9, 0.9, 24); addRib(A.bar, r, i0, i1, 0.9, 0.09, 0.9, 0.9, 24); }
        if(r.id === "R0" && r.z[i1] < ZA + 120){ addRib(A.sw, r, i0, i1, hwR, 0.16, hwR + 11, 0.16, 6); addRib(A.sw, r, i0, i1, -hwR - 11, 0.16, -hwR, 0.16, 6); }
        accMesh(A.surf, surfMat(hwR), S); accMesh(A.conc, concM, S); accMesh(A.med, medM, S); accMesh(A.bar, barM, S); var swm = accMesh(A.sw, swMat, S);
        // 고가 기둥
        var piers = []; for(i = i0; i <= i1; i += 6) if(r.y[i] > 2.8) piers.push(i);
        if(piers.length){ var pm = inst(UB, mat(0xa9a69f), piers.length*3), c = 0; piers.forEach(function(i){ var ang = Math.atan2(r.tx[i], r.tz[i]), y = r.y[i] - DECK, nx = r.tz[i], nz = -r.tx[i];
            [-(hwR - 6), hwR - 6].forEach(function(o){ setM(pm, c++, r.x[i] + nx*o, 0, r.z[i] + nz*o, 3.4, y, 3.4, ang); }); setM(pm, c++, r.x[i], y - 1.6, r.z[i], hwR*2 - 3, 1.6, 4.4, ang); }); pm.count = c; S.g.add(pm); S.ims.push(pm); }
        // 가로등
        var lp = []; for(i = i0 + 3; i <= i1; i += 11){ [-1, 1].forEach(function(sd){ lp.push([i, sd]); }); }
        if(lp.length){ var lm = inst(UB, poleM, lp.length*2), lb = inst(UBULB, lampMat, lp.length), cc = 0; lp.forEach(function(q, n){ var i = q[0], sd = q[1], ang = Math.atan2(r.tx[i], r.tz[i]), nx = r.tz[i]*sd, nz = -r.tx[i]*sd, px = r.x[i] + r.tz[i]*(hwR - 0.2)*sd, pz = r.z[i] - r.tx[i]*(hwR - 0.2)*sd, y = r.y[i];
            setM(lm, cc++, px, y, pz, 0.7, 15, 0.7, ang); setM(lm, cc++, px - nx*2.8, y + 14.8, pz - nz*2.8, 0.5, 0.5, 5.6, Math.atan2(nx, nz)); setM(lb, n, px - nx*5.4, y + 14.4, pz - nz*5.4, 1, 1, 1, 0); });
          lm.count = cc; lb.count = lp.length; S.g.add(lm); S.g.add(lb); S.ims.push(lm, lb); }
        // 초록 안내 표지판 (문형): 큰 도로만
        if(big){ var per = r.id === "R0" ? 1700 : 2400, s0 = Math.ceil((i0*r.ds)/per)*per + 170; for(var s = s0; s < i1*r.ds; s += per){ var a = atS(r, s), km = Math.max(1, Math.round((R0.len - s)/1250)), g = new THREE.Group(), z = a.z, nmz = r.id === "R0" ? (z > ZA ? "국도 4호선" : (z > ZB ? "대구 북구" : (z > ZC ? "북구 → 도심" : (z > ZD ? "대구 도심" : "도심 → 동대구")))) : r.name;
            var tex = gantryTexFor(nmz, r.id === "R0" ? "↓ 동대구 " + km + "km" : "↓ 대구 방면", r.id === "R0" ? (z > ZA ? "↑ 왜관" : "대구 시내 방면") : "↑ 칠곡 방면", ""), sg = new THREE.Mesh(new THREE.PlaneGeometry(34, 10.6), new THREE.MeshBasicMaterial({ map:tex })); sg.position.set(0, 25, 0.4); g.add(sg); var sg2 = sg.clone(); sg2.rotation.y = Math.PI; sg2.position.z = -0.4; g.add(sg2);
            box(g, 1.2, 25, 1.2, poleM, -hwR + 1, 12.5, 0); box(g, 1.2, 25, 1.2, poleM, hwR - 1, 12.5, 0); box(g, hwR*2, 1.2, 1.2, poleM, 0, 19.5, 0); g.position.set(a.x, a.y, a.z); g.rotation.y = Math.atan2(a.tx, a.tz) + Math.PI; S.g.add(g); } }
        ROOT.add(S.g); DG.segs++; return S;
      }
      function dropSeg(S){ ROOT.remove(S.g); S.geos.forEach(function(g){ g.dispose(); }); S.ims.forEach(function(m){ if(m.dispose) m.dispose(); }); DG.segs--; }

      // ---------- 땅 조각 (구역 750×750, 가까운 것만) ----------
      var rockM = mat(0x7b766c, { flat:true }), terrM = mat(0xffffff, { vc:true, flat:true, fog:false });
      function terrainMesh(C, xa, xb, zb, za, st){
        var nx = Math.max(1, Math.round((xb - xa)/st)), nz = Math.max(1, Math.round((za - zb)/st)), sx = (xb - xa)/nx, sz = (za - zb)/nz, pos = [], col = [], idx = [], H = [], i, j, c = new THREE.Color();
        for(j = 0; j <= nz; j++) for(i = 0; i <= nx; i++) H.push(terrH(xa + i*sx, zb + j*sz));
        var W = nx + 1;
        for(j = 0; j <= nz; j++) for(i = 0; i <= nx; i++){ var h = H[j*W + i], hxm = H[j*W + Math.max(0, i - 1)], hxp = H[j*W + Math.min(nx, i + 1)], hzm = H[Math.max(0, j - 1)*W + i], hzp = H[Math.min(nz, j + 1)*W + i];
          var slope = Math.hypot(hxp - hxm, hzp - hzm)/(2*st), n = (hash(i + xa*0.1, j + zb*0.1) - 0.5)*0.11;
          if(h < 14) c.setRGB(0.46 + n, 0.64 + n, 0.33 + n); else if(h < 120) c.setRGB(0.12 + n, 0.26 + n, 0.12 + n); else c.setRGB(0.17 + n, 0.27 + n, 0.13 + n);
          var rock = Math.max(sstep(0.5, 0.95, slope), sstep(140, 215, h)), strata = 0.06*Math.sin(h*0.55 + hash(i >> 2, j >> 2)*5); c.lerp(new THREE.Color(0.34 + n + strata, 0.31 + n + strata, 0.28 + n + strata), rock*0.92);
          if(h > 255) c.lerp(new THREE.Color(0.86, 0.88, 0.92), sstep(255, 305, h)*0.85);
          pos.push(xa + i*sx, h, zb + j*sz); col.push(c.r, c.g, c.b); }
        for(j = 0; j < nz; j++) for(i = 0; i < nx; i++){ var a = j*W + i, b = a + 1, d = a + W, e = d + 1; if(Math.max(H[a], H[b], H[d], H[e]) < 0.6) continue; idx.push(a, d, b, b, d, e); }
        if(!idx.length) return;
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); C.geos.push(g);
        var m = new THREE.Mesh(g, terrM); m.position.y = 0.04; C.g.add(m);
      }
      function edgeRocks(C, rng, x0, x1, zTop, zBot){
        var list = [];
        function put(x, z, big){ if(x < x0 || x >= x1 || z > zTop || z <= zBot) return; var h = (big ? 150 : 70) + rng()*(big ? 210 : 120); list.push({ x:x, z:z, h:h, r:h*(0.45 + rng()*0.3), ry:rng()*6.28, c:0.9 + rng()*0.2 }); }
        var z, S, xs, x;
        for(z = Math.ceil(zTop/70)*70; z > zBot; z -= 70){ S = secAt(z); if(!S) continue; if(!(S.id === "A" && z > -2700)) put(S.xl - 14 - rng()*120, z + rng()*40 - 20, rng() < 0.5); put(S.xr + 14 + rng()*120, z + rng()*40 - 20, rng() < 0.5); }
        SECS.forEach(function(S, i){ var zt = S.z1, N = SECS[i + 1]; if(zt > zTop + 80 || zt < zBot - 80 || !N) return;
          function strip(xa, xb, zoff){ for(var x = xa; x < xb; x += 70) put(x + rng()*30 - 15, zt + zoff*(rng()*60), rng() < 0.5); }
          if(N.xr > S.xr) strip(S.xr, N.xr, 1); if(N.xl < S.xl) strip(N.xl, S.xl, 1); if(N.xr < S.xr) strip(N.xr, S.xr, -1); if(N.xl > S.xl) strip(S.xl, N.xl, -1); });
        if(ZMIN < zTop + 100 && ZMIN > zBot - 100){ var E = SECS[SECS.length - 1]; for(x = E.xl; x < E.xr; x += 70) put(x + rng()*30 - 15, ZMIN - rng()*100, rng() < 0.6); }
        if(!list.length) return; var im = inst(ROCKG, rockM, list.length); im.count = list.length;
        list.forEach(function(q, i){ setM(im, i, q.x, -4, q.z, q.r, q.h, q.r, q.ry); im.setColorAt(i, MC.setRGB(q.c*0.62, q.c*0.6, q.c*0.56)); }); C.g.add(im); C.ims.push(im);
      }
      function ruralDecor(C, S, rng, x0, x1, zTop, zBot){
        var xa = Math.max(x0, S.xl + 20), xb = Math.min(x1, S.xr - 20), za = Math.min(zTop, S.z0), zb = Math.max(zBot, S.z1); if(xb <= xa || za <= zb) return;
        var fields = [], houses = [], wares = [], trees = [], x, z, FC = [0x6fae4a, 0x86bb52, 0xc9b94c, 0x5f9d45, 0xd2c261], HC = [0xe8dcc4, 0xd9c9a8, 0xcfd8dc, 0xe3b8a0], RC = [0x8a4b3a, 0x4a5a6a, 0x6b5a3a];
        function ok(px, pz, clr){ return px >= x0 && px < x1 && pz <= zTop && pz > zBot && inside(px, pz, 12) && terrH(px, pz) < 1.5 && roadNear(px, pz).d > clr && !lmHit(px, pz, 10); }
        for(x = xa; x < xb; x += 95) for(z = za; z > zb; z -= 95){ var fx = x + rng()*80, fz = z - rng()*80; if(rng() > 0.4 || !ok(fx, fz, 30)) continue; fields.push({ x:fx, z:fz, w:40 + rng()*55, d:26 + rng()*30, c:FC[Math.floor(rng()*5)] }); }
        for(x = xa; x < xb; x += 160) for(z = za; z > zb; z -= 160){ var hx = x + rng()*140, hz = z - rng()*140; if(rng() > 0.3 || !ok(hx, hz, 40)) continue;
          if(rng() < 0.15){ wares.push({ x:hx, z:hz, w:46, d:32, h:14, c:0xb9bec2 }); addRect(hx, hz, 23, 16, C.rects); continue; }
          var w = 14 + rng()*10, d = 12 + rng()*10, h = 8 + rng()*4; houses.push({ x:hx, z:hz, w:w, d:d, h:h, c:HC[Math.floor(rng()*4)], r:RC[Math.floor(rng()*3)] }); addRect(hx, hz, w/2, d/2, C.rects); }
        for(x = xa; x < xb; x += 38) for(z = za; z > zb; z -= 38){ var tx = x + rng()*34, tz = z - rng()*34; if(rng() > 0.3 || !ok(tx, tz, 8) || hitRect(tx, tz)) continue; trees.push([tx, tz, 0.8 + rng()*0.7]); }
        if(fields.length){ var pi = inst(UP, fieldMat, fields.length); pi.count = fields.length; fields.forEach(function(p, i){ setM(pi, i, p.x, 0.06, p.z, p.w, 1, p.d, 0); pi.setColorAt(i, MC.setHex(p.c)); }); C.g.add(pi); C.ims.push(pi); }
        if(houses.length){ var hb = inst(UB, mat(0xffffff), houses.length), hr = inst(UR, mat(0xffffff), houses.length); hb.count = hr.count = houses.length; houses.forEach(function(h, i){ setM(hb, i, h.x, 0, h.z, h.w, h.h, h.d, 0); hb.setColorAt(i, MC.setHex(h.c)); setM(hr, i, h.x, h.h, h.z, h.w*1.12, 5.5, h.d*1.12, 0); hr.setColorAt(i, MC.setHex(h.r)); }); C.g.add(hb); C.g.add(hr); C.ims.push(hb, hr); }
        if(wares.length) blockMeshes(wares, 6, C.g, C.ims);
        addTrees(C, trees);
      }
      var fieldMat = new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, color:0xffffff, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 });
      var treeMats = null;
      function addTrees(C, trees){
        if(!trees.length) return; treeMats = treeMats || { t:mat(0x6b4a2f), c:mat(0xffffff) }; var tm = inst(UT, treeMats.t, trees.length), cm = inst(UCa, treeMats.c, trees.length), cm2 = inst(UCb, treeMats.c, trees.length), cols = [0x3f7a3a, 0x4f8f45, 0x2f6a35, 0x5f9a48]; tm.count = cm.count = cm2.count = trees.length;
        trees.forEach(function(t, i){ var k = t[2]; setM(tm, i, t[0], 0, t[1], k, k, k, 0); setM(cm, i, t[0], 0, t[1], k, k, k, 0); setM(cm2, i, t[0], 0, t[1], k, k, k, 0); MC.setHex(cols[i % 4]); cm.setColorAt(i, MC); cm2.setColorAt(i, MC); });
        C.g.add(tm); C.g.add(cm); C.g.add(cm2); C.ims.push(tm, cm, cm2);
      }
      function aptTowers(C, S, rng, x0, x1, zTop, zBot){
        var G = S.G, list = [], plates = {}, i0 = Math.floor((x0 - S.xl)/G), i1 = Math.floor((x1 - S.xl)/G), j0 = Math.floor((S.z0 - zTop)/G), j1 = Math.floor((S.z0 - zBot)/G), i, j, r, c;
        for(i = i0; i <= i1; i++) for(j = j0; j <= j1; j++){ var bx = S.xl + i*G + G/2, bz = S.z0 - j*G - G/2;
          for(r = 0; r < 5; r++) for(c = 0; c < 3; c++){ var x = bx + (c - 1)*150 + (r % 2 ? 40 : -40), z = bz + (r - 2)*94; if(x < x0 || x >= x1 || z > zTop || z <= zBot) continue; if(!inside(x, z, 70) || roadNear(x, z).d < 50 || lmHit(x, z, 60)) continue;
            var h = [98, 126, 154][Math.floor(hash(i*5 + c, j*7 + r)*3)]; list.push({ x:x, z:z, w:64, d:26, h:h, c:PAL[Math.floor(hash(i + r, j + c)*PAL.length)] }); addRect(x, z, 32, 13, C.rects);
            var key = Math.floor(hash(i*3 + c, j*5 + r)*4); (plates[key] = plates[key] || []).push({ x:x, z:z + 13.3, y:h - 8 }); } }
        blockMeshes(list, 8, C.g, C.ims);
        Object.keys(plates).forEach(function(key){ var arr = plates[key], im = inst(UPV, plateMat(+key), arr.length); im.count = arr.length; arr.forEach(function(p, n){ setM(im, n, p.x, p.y, p.z, 22, 7, 1, 0); }); C.g.add(im); C.ims.push(im); });
      }
      var plateMats = {}; function plateMat(k){ return plateMats[k] || (plateMats[k] = new THREE.MeshBasicMaterial({ map:textTex((101 + k*3) + "동", "#2f5d9a", "#ffffff", 192, 64, false) })); }
      var GENN = ["약국", "미용실", "안경점", "치킨", "분식", "빵집"], GENC = [["#d35400", "#fff"], ["#2c3e50", "#ffd"], ["#8e44ad", "#fff"], ["#16a085", "#fff"], ["#c0392b", "#fff"], ["#2980b9", "#fff"]], signMats = null;
      function signMat(k){ if(!signMats) signMats = GENN.map(function(n, i){ return new THREE.MeshBasicMaterial({ map:textTex(n, GENC[i][0], GENC[i][1], 384, 80) }); }); return signMats[k]; }
      function cityLots(C, S, rng, x0, x1, zTop, zBot){
        var G = S.G, list = [], signs = {}, HS = [28, 42, 63, 84, 105, 126], cz = (S.z0 + S.z1)/2, e2 = S.kind === "city2", pitch = (G - 20)/3, i0 = Math.floor((x0 - S.xl)/G), i1 = Math.floor((x1 - S.xl)/G), j0 = Math.floor((S.z0 - zTop)/G), j1 = Math.floor((S.z0 - zBot)/G), i, j, a, b;
        for(i = i0; i <= i1; i++) for(j = j0; j <= j1; j++){ var bx = S.xl + i*G + G/2, bz = S.z0 - j*G - G/2;
          for(a = 0; a < 3; a++) for(b = 0; b < 3; b++){ var x = bx + (a - 1)*pitch, z = bz + (b - 1)*pitch; if(x < x0 || x >= x1 || z > zTop || z <= zBot) continue; if(!inside(x, z, 40) || roadNear(x, z).d < 38 || lmHit(x, z, 70)) continue;
            var rr = hash(i*13 + a*5 + 1, j*17 + b*3 + 2); if(e2 && rr < 0.28) continue;
            var dc = Math.min(1, Math.hypot(x/(S.xr - S.xl)*2, (z - cz)/(S.z0 - S.z1)*2)), hi = (a === 1 && b === 1) ? 1 + Math.floor(rr*3) : Math.floor(rr*2);
            if(e2) hi = Math.max(0, hi - 1); else hi += dc < 0.35 ? 2 : (dc < 0.65 ? 1 : 0); hi = Math.min(5, hi); var w = pitch - 11, d = pitch - 11, h = HS[hi];
            list.push({ x:x, z:z, w:w, d:d, h:h, c:PAL[Math.floor(hash(i + a*3, j + b*5)*PAL.length)] }); addRect(x, z, w/2, d/2, C.rects);
            if(a !== 1 || b !== 1){ var dx = a !== 1 ? (a === 0 ? -1 : 1) : 0, dz = a !== 1 ? 0 : (b === 0 ? -1 : 1), k = Math.floor(hash(i + a*3, j + b*7)*6); (signs[k] = signs[k] || []).push({ x:x + dx*(w/2 + 0.3), z:z + dz*(d/2 + 0.3), ry:Math.atan2(dx, dz) }); } } }
        blockMeshes(list, 6, C.g, C.ims);
        Object.keys(signs).forEach(function(k){ var arr = signs[k], im = inst(UPV, signMat(+k), arr.length); im.count = arr.length; arr.forEach(function(s, n){ setM(im, n, s.x, 15.5, s.z, 26, 5.4, 1, s.ry); }); C.g.add(im); C.ims.push(im); });
      }
      var chunkMap = {};
      function buildChunk(ci, cj){
        var x0 = ci*CH, x1 = x0 + CH, zTop = -cj*CH, zBot = zTop - CH, rng = mkRng(((ci*73856093) ^ (cj*19349663)) + 12345), C = { g:new THREE.Group(), rects:[], ims:[], geos:[] };
        TZ.forEach(function(Q){ if(Q.a < zBot || Q.b > zTop) return; var S = secAt((Q.a + Q.b)/2); if(!S) return; var xa = Math.max(x0, S.xl), xb = Math.min(x1, S.xr); if(xb <= xa) return; terrainMesh(C, xa, xb, Math.max(zBot, Q.b), Math.min(zTop, Q.a), Q.type === "wall" ? 7.5 : 15); });
        SECS.forEach(function(S){ if(S.z1 >= zTop || S.z0 <= zBot || S.xr <= x0 || S.xl >= x1) return; if(S.kind === "rural") ruralDecor(C, S, rng, x0, x1, zTop, zBot); else if(S.kind === "apt") aptTowers(C, S, rng, x0, x1, zTop, zBot); else cityLots(C, S, rng, x0, x1, zTop, zBot); });
        // 길가 나무
        var trees = [], cx0 = Math.floor(x0/100), cx1 = Math.floor((x1 - 1)/100), cz0 = Math.floor((zBot + 1)/100), cz1 = Math.floor(zTop/100);
        for(var cx = cx0; cx <= cx1; cx++) for(var cz = cz0; cz <= cz1; cz++){ var a = RBK[cx + "," + cz]; if(!a) continue;
          for(var k = 0; k < a.length; k += 2){ var r = ROADS[a[k]], i = a[k + 1]; if(i % 6 !== 0 || r.y[i] > 1 || r.x[i] < x0 || r.x[i] >= x1 || r.z[i] > zTop || r.z[i] <= zBot) continue; var S2 = secAt(r.z[i]); if(!S2) continue; var city = S2.kind === "city" || S2.kind === "city2";
            [-1, 1].forEach(function(sd){ if(rng() < (city ? 0.1 : 0.3)) return; var off = r.hw + (city ? 3.5 : 5 + rng()*8), tx = r.x[i] + r.tz[i]*off*sd, tz = r.z[i] - r.tx[i]*off*sd; if(!inside(tx, tz, 8) || terrH(tx, tz) > 2 || hitRect(tx, tz) || lmHit(tx, tz, 6)) return; trees.push([tx, tz, 0.8 + rng()*0.7]); }); } }
        addTrees(C, trees);
        edgeRocks(C, rng, x0, x1, zTop, zBot);
        ROOT.add(C.g); DG.chunks++; return C;
      }
      function dropChunk(C){ ROOT.remove(C.g); dropRects(C.rects); C.geos.forEach(function(g){ g.dispose(); }); C.ims.forEach(function(m){ if(m.dispose) m.dispose(); }); DG.chunks--; }

      // ---------- 처음에 한 번 만드는 것들: 넓은 땅, 도시 바닥, 랜드마크, 가게 ----------
      var SHOPS = [
        { name:"칠곡 24시 편의점", bg:"#17a05b", fg:"#fff", wall:0xf3f6ef, goods:[0xe74c3c, 0xf1c40f, 0x3498db, 0x2ecc71], lines:["어서 오세요~ 칠곡 24시 편의점이에요!", "삼각김밥이랑 컵라면이 제일 잘 나가요."], npc:0x2b7a4b },
        { name:"동성로 카페", bg:"#6b3f24", fg:"#ffe9c9", wall:0xf1e3cf, goods:[0xd9b28a, 0x8b5a3a, 0xffffff], lines:["동성로 카페에 오신 걸 환영해요 ☕", "대구는 여름에 엄청 덥거든요. 아이스 아메리카노 어때요?"], npc:0x8b5a3a },
        { name:"서문시장 호떡집", bg:"#c0392b", fg:"#fff6d6", wall:0xf7e7c6, goods:[0xd98f3a, 0xe9b15a, 0xc2742a], lines:["서문시장 명물 호떡! 꿀이 줄줄 흘러요 🥞", "많이 먹고 가요, 인심은 대구가 최고지."], npc:0xc0392b },
        { name:"대구 약령시 약방", bg:"#2d5a3d", fg:"#e8f2d8", wall:0xe6e0c8, goods:[0x7b5a3a, 0x9cb36a, 0x6b4f2f], lines:["약령시는 오래된 한약재 시장이에요.", "감초, 대추, 인삼… 건강하게 지내요."], npc:0x2d5a3d },
        { name:"막창구이 맛집", bg:"#8e1f1f", fg:"#ffe3a0", wall:0xeadbc0, goods:[0xc0392b, 0x7f2a1d, 0xf39c12], lines:["대구 하면 막창이죠! 지글지글 🔥", "쫄깃쫄깃, 부추랑 같이 먹어요."], npc:0x7f2a1d },
        { name:"납작만두 분식", bg:"#3b5ba5", fg:"#fff", wall:0xe9edf5, goods:[0xe8cf9a, 0xd9b873, 0xc07a3a], lines:["납작만두는 얇고 납작한 대구식 분식이에요.", "당면 가득! 떡볶이랑 같이 드세요."], npc:0x3b5ba5 }
      ];
      function buildStatic(){
        var base = null; scene.traverse(function(o){ if(!base && o.isMesh && o.geometry && o.geometry.type === "PlaneGeometry" && o.geometry.parameters && o.geometry.parameters.width === 1300) base = o; });
        var Lz = -40 - (ZMIN - 200), cz = (-40 + ZMIN - 200)/2;
        [[2200, 5400], [-5400, -2200]].forEach(function(q){ var w = q[1] - q[0], m = base ? base.material.clone() : new THREE.MeshStandardMaterial({ color:0x8fbf6b, roughness:0.9 });
          if(base && base.material.map){ var t = base.material.map.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w*77/1300, Lz/12); m.map = t; }
          var g = new THREE.Mesh(new THREE.PlaneGeometry(w, Lz), m); g.rotation.x = -Math.PI/2; g.position.set((q[0] + q[1])/2, 0, cz); g.receiveShadow = true; ROOT.add(g); });
        SECS.forEach(function(S){ if(!S.G) return; var w = S.xr - S.xl, l = S.z0 - S.z1, t = tileTexFor(S.G, S.kind === "apt"); t.repeat.set(w/S.G, l/S.G);
          var g = new THREE.Mesh(new THREE.PlaneGeometry(w, l), new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0, map:t, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })); g.rotation.x = -Math.PI/2; g.position.set((S.xl + S.xr)/2, 0.05, (S.z0 + S.z1)/2); ROOT.add(g); });
        // 랜드마크 (임시 모델)
        var LMS = [{ id:"daegu", x:-500, z:ZC - 700, hx:78, hz:30 }, { id:"tower", x:-900, z:ZC - 2000, hx:34, hz:34 }, { id:"dongdaegu", x:500, z:ZE + 250, hx:104, hz:36 }];
        LMS.forEach(function(l){ LMR.push({ x:l.x, z:l.z, hx:l.hx + 10, hz:l.hz + 30 }); addRect(l.x, l.z, l.hx, l.hz); });
        buildDaeguStation(LMS[0]); build83(LMS[1]); buildDongdaegu(LMS[2]);
        // 들어갈 수 있는 가게 6곳 (도심, 국도 4호선 옆)
        var list = []; SHOPS.forEach(function(S, i){ var z = ZC - 420 - i*370, sd = i % 2 ? 1 : -1, xr = xOf(R0, z), w = 50, d = 44, h = 28 + (i % 3)*14, x = xr + sd*(hw + 11 + 25);
          list.push({ x:x, z:z, w:w, d:d, h:h, c:PAL[i] }); addRect(x, z, 25, 22); LMR.push({ x:x, z:z, hx:33, hz:30 });
          var fx = x - sd*(w/2 + 0.25), ry = sd > 0 ? -Math.PI/2 : Math.PI/2, sg = new THREE.Mesh(new THREE.PlaneGeometry(26, 5.4), new THREE.MeshBasicMaterial({ map:textTex(S.name, S.bg, S.fg, 384, 80) })); sg.position.set(fx, 15.5, z); sg.rotation.y = ry; ROOT.add(sg);
          box(ROOT, 7, 1.2, 28, mat(0xf2c94c), x - sd*(w/2 + 3.5), 11.2, z); var door = box(ROOT, 0.8, 9.5, 9, new THREE.MeshBasicMaterial({ color:0xffe58a }), fx - sd*0.1, 4.75, z);
          DG.doors.push({ x:x - sd*(w/2 + 6), z:z, shop:i, sd:sd }); });
        blockMeshes(list, 6, ROOT);
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


      // ---------- 차 (InstancedMesh, 가까운 도로에서만 달려요) ----------
      var CARS = [], CAR_N = 140, carIM = {}, carRoads = [], LANEF = [-0.30, -0.68, 0.30, 0.68], LANEV = [62, 92, 66, 96];
      function pickRoads(p){ carRoads.length = 0; ROADS.forEach(function(r){ if(!r.cars) return; var best = 1e9, bi = 0; for(var i = 0; i < r.n; i += 10){ var d = Math.hypot(r.x[i] - p.x, r.z[i] - p.z); if(d < best){ best = d; bi = i; } } if(best < 1500) carRoads.push({ r:r, s:bi*r.ds, d:best }); }); }
      function respawn(c, minOff){
        if(!carRoads.length){ c.far = true; return; } var q = carRoads[Math.floor(rnd()*carRoads.length)], r = q.r, sgn = rnd() < 0.5 ? -1 : 1; c.r = r; c.far = false; c.s = q.s + sgn*(minOff + rnd()*(1300 - minOff)); if(r.closed) c.s = ((c.s % r.len) + r.len) % r.len; else c.s = Math.max(2, Math.min(r.len - 2, c.s));
        c.o = LANEF[c.ln]*r.hw; c.dir = c.o < 0 ? 1 : -1; c.v = LANEV[c.ln]*(r.hw >= 18 ? 1.25 : 1)*(0.9 + rnd()*0.2); c.cv = c.v; }
      function buildCars(){
        var cols = [0xdcdcdc, 0x222428, 0xc0392b, 0x2e6fd8, 0xf0c419, 0x8f9aa0, 0x27ae60, 0xffffff, 0x6b3f9b];
        for(var i = 0; i < CAR_N; i++){ var big = rnd() < 0.12; CARS.push({ r:R0, s:0, ln:i % 4, o:0, dir:1, v:60, cv:0, far:true, col:big ? 0xe8e4d6 : cols[Math.floor(rnd()*cols.length)], big:big, L:big ? 26 : 14, Hh:big ? 7.5 : 4.2 }); }
        carIM.body = inst(UB, mat(0xffffff), CAR_N); carIM.cab = inst(UB, mat(0x2a3440), CAR_N); carIM.under = inst(UB, mat(0x15171a), CAR_N);
        carIM.head = inst(UB, new THREE.MeshBasicMaterial({ color:0xfff2c4 }), CAR_N*2); carIM.tail = inst(UB, new THREE.MeshBasicMaterial({ color:0xff2a2a }), CAR_N*2);
        carIM.trMat = new THREE.MeshBasicMaterial({ color:0xff3a22, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false }); carIM.trMat2 = new THREE.MeshBasicMaterial({ color:0xfff0c0, transparent:true, opacity:0, blending:THREE.AdditiveBlending, depthWrite:false });
        carIM.trail = inst(UB, carIM.trMat, CAR_N); carIM.trail2 = inst(UB, carIM.trMat2, CAR_N);
        CARS.forEach(function(c, i){ carIM.body.setColorAt(i, MC.setHex(c.col)); }); carIM.body.instanceColor.needsUpdate = true;
        ["body", "cab", "under", "head", "tail", "trail", "trail2"].forEach(function(k){ ROOT.add(carIM[k]); });
      }
      var carT = 0, carsInit = false;
      function updateCars(dt, p, night){
        carT -= dt; if(carT <= 0 || !carsInit){ carT = 0.5; pickRoads(p); if(!carsInit){ carsInit = true; CARS.forEach(function(c){ respawn(c, 0); }); } }
        var i, c, a;
        for(i = 0; i < CARS.length; i++){ c = CARS[i];
          if(c.far){ if(carRoads.length) respawn(c, 700); else { setM(carIM.body, i, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.cab, i, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.under, i, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.head, i*2, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.head, i*2 + 1, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.tail, i*2, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.tail, i*2 + 1, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.trail, i, 0, -500, 0, 0.01, 0.01, 0.01, 0); setM(carIM.trail2, i, 0, -500, 0, 0.01, 0.01, 0.01, 0); continue; } }
          a = atS(c.r, c.s); var hx = a.tx*c.dir, hz = a.tz*c.dir, nx = a.tz, nz = -a.tx, px = a.x + nx*c.o, pz = a.z + nz*c.o, dx = px - p.x, dz = pz - p.z, dp = dx*dx + dz*dz;
          if(dp > 1750*1750){ respawn(c, 700); continue; }
          var tv = (dp < 24*24 && Math.abs(p.y) < 6 + a.y) || (DG.riding && dp < 30*30) ? 0 : c.v;           // 사람이 앞에 있으면 멈춰요
          c.cv += (tv - c.cv)*Math.min(1, dt*(tv === 0 ? 4 : 1.6)); c.s += c.dir*c.cv*dt; if(!c.r.closed && (c.s > c.r.len - 2 || c.s < 2)){ respawn(c, 700); continue; }
          var ry = Math.atan2(hx, hz), y = a.y + 0.1, L = c.L, H = c.Hh;
          setM(carIM.body, i, px, y + H*0.38 + 0.5, pz, 6.2, H*0.55, L, ry); setM(carIM.cab, i, px - hx*L*0.06, y + H*0.38 + 0.5 + H*0.52, pz - hz*L*0.06, 5.4, H*0.5, c.big ? L*0.86 : L*0.5, ry); setM(carIM.under, i, px, y + 0.7, pz, 6, 1.2, L - 1, ry);
          var rx = -hz, rz = hx;
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
        var RS = [[-90, "빨간 승용차", 0xc0392b, false], [ZA - 200, "노란 택시", 0xf0c419, false], [ZB - 300, "파란 버스", 0x2e6fd8, true], [ZB - 3300, "초록 택시", 0x27ae60, false], [ZC - 200, "하얀 승용차", 0xeeeeee, false], [ZD - 300, "빨간 버스", 0xc0392b, true], [ZE + 600, "파란 택시", 0x2e6fd8, false]];
        RS.forEach(function(r, i){ var sd = i % 2 ? 1 : -1; addRide(r[1], r[2], r[3], xOf(R0, r[0]) + sd*(hw + (r[3] ? 16 : 10)), r[0], sd > 0 ? 0 : Math.PI); });
      }
      function nearRide(p){ for(var i = 0; i < DG.rides.length; i++){ var r = DG.rides[i]; if(r !== DG.riding && Math.hypot(p.x - r.x, p.z - r.z) < (r.big ? 22 : 15)) return r; } return null; }

      // ---------- 훅: 이동 막기 / 높이 / E 상호작용 / 장소 이름 ----------
      DG.h = function(x, z){ if(!DG.riding || z > ZH) return 0; return deckY(x, z); };
      DG.push = function(p, px0, pz0){
        if(!inside(p.x, p.z)){ if(inside(px0, p.z)) p.x = px0; else if(inside(p.x, pz0)) p.z = pz0; else { p.x = px0; p.z = pz0; } }      // 구역 가장자리 (바위 산)
        if(terrH(p.x, p.z) > 4){ if(terrH(p.x, pz0) <= 4) p.x = px0; else if(terrH(px0, p.z) <= 4) p.z = pz0; else { p.x = px0; p.z = pz0; } }
        if(hitRect(p.x, p.z)){ if(!hitRect(px0, p.z)) p.x = px0; else if(!hitRect(p.x, pz0)) p.z = pz0; else { p.x = px0; p.z = pz0; } }
        if(DG.riding){ var n = roadNear(p.x, p.z); if(n.r && n.r.y[n.i] > 1 && n.d < 0){ var r = n.r, i = n.i, nx = r.tz[i], nz = -r.tx[i], lat = (p.x - r.x[i])*nx + (p.z - r.z[i])*nz, lim = r.hw - 1.6; if(Math.abs(lat) > lim){ var tgt = lat > 0 ? lim : -lim; p.x += nx*(tgt - lat); p.z += nz*(tgt - lat); } } }
      };
      DG.free = function(p, px0, pz0){
        if(DG.para) return DG.paraConstrain(p);
        if(!(p.z < ZH && (p.x >= -620 || p.z < -2700))) return false;      // 왜관 아래 큰 세계 (서쪽 마을 땅은 마을 규칙 그대로)
        if(p.z > -100 && p.x > -640 && p.x < 660) landPush(p, px0, pz0);      // 왜관 시내 남쪽 건물은 예전처럼 막아요
        DG.push(p, px0, pz0); return true; };
      DG.owns = function(p){ return p.z < ZH && (p.x >= -620 || p.z < -2700); };
      window.dgPlace = function(p){
        if(DG.inShop >= 0) return { id:"shop" + DG.inShop, name:SHOPS[DG.inShop].name, sub:"대구 도심의 가게" };
        if(!DG.owns(p) || p.z > -45) return null; var S = secAt(p.z), z = p.z; if(!S) return null;
        if(S.id === "A"){ if(z > -1850) return { id:"dgA1", name:"국도 4호선", sub:"왜관에서 대구로 가는 평지 길 (차만 다녀요)" }; if(z > -2850) return { id:"dgA2", name:"고가 언덕길", sub:"기둥 위로 이어진 고가도로" }; if(z > -3250) return { id:"dgA3", name:"대구 관문 고개", sub:"큰 산을 가르고 지나는 길" }; return { id:"dgA4", name:"대구 북구 입구", sub:"칠곡을 지나 대구로 들어서요" }; }
        if(S.id === "B") return z > ZA - 3380 ? { id:"dgB1", name:"대구 북구 칠곡 3지구", sub:"아파트 단지 (임시)" } : { id:"dgB2", name:"대구 북구 안쪽", sub:"아파트 단지 (임시)" };
        if(S.id === "C") return { id:"dgC", name:"북구에서 도심 가는 길", sub:"들판과 마을, 고속도로, 8자 도로 (임시)" };
        if(S.id === "D") return { id:"dgD", name:"대구 도심", sub:"대구역 · 83타워 (임시 모델)" };
        return { id:"dgE", name:"도심에서 동대구로", sub:"동대구역 방면 (임시)" }; };
      // ---------- 가게 안 ----------
      var SHOP_X = 2500, SHOP_Z = 500, SHOP_Y = 1400, SW = 64, SL = 46, SH = 17, shopRooms = {};
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
        if(!DG.para) return false; p.x = Math.max(-600, Math.min(2150, p.x)); p.z = Math.max(ZMIN + 20, Math.min(2900, p.z)); if(p.x > SKY.edgeX && p.z < -30) p.z = -30;
        var tx = SKY.tree.x, tz = SKY.tree.z, dx = p.x - tx, dz = p.z - tz, d = Math.hypot(dx, dz); if(d < 46 && d > 0.01){ p.x = tx + dx/d*46; p.z = tz + dz/d*46; } return true; };
      function startChute(p){
        if(DG.para || DG.riding || DG.inShop >= 0 || p.x <= SKY.edgeX || SKY_REF < 40 || SKY_REF > 900) return false;
        DG.para = { t:0 }; p.y = SKY_REF + p.y + 3; p.vy = 0; p.onGround = false; SKY_REF = 0; window.vilRideMul = 0.75; if(!chute) chute = buildChute(); chute.visible = true;
        showToast("🪂 낙하산을 폈어요! 방향키로 날아갈 방향을 조절해요. 땅에 닿으면 접혀요."); return true;
      }
      function endChute(p){ DG.para = null; window.vilRideMul = 1; if(chute) chute.visible = false; p.squash = -0.4; showToast("🛬 사뿐히 착지했어요!"); }
      window.dgKey = function(k){ if(k === "b" || k === "j"){ var p = state.player; if(!screens.game.hidden) startChute(p); } };

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
        if(DG.riding){ var a = DG.riding; if(deckY(p.x, p.z) > 1){ showToast("🚫 고가도로 위에서는 내릴 수 없어요."); return true; }
          var c = state.cam.yaw; a.x = p.x + Math.cos(c)*0; a.z = p.z; a.g.position.set(p.x - Math.cos(c)*9, 0.1, p.z + Math.sin(c)*9); a.x = a.g.position.x; a.z = a.g.position.z; a.ring.position.set(a.x, 0.2, a.z); a.ring.visible = true; DG.riding = null; window.vilRideMul = 1; showToast("🛑 " + a.name + "에서 내렸어요."); return true; }
        if(DG.inShop >= 0){ if(nearExit(p)){ leaveShop(p); return true; } if(nearClerk(p)){ var L = SHOPS[DG.inShop].lines; showToast("💬 " + L[lineIdx++ % L.length]); return true; } return false; }
        var r = nearRide(p); if(r){ DG.riding = r; r.ring.visible = false; window.vilRideMul = r.mul; showToast("🚗 " + r.name + "을(를) 탔어요! 방향키로 달리고, 내리려면 E · 고가도로도 달릴 수 있어요."); return true; }
        var d = nearDoor(p); if(d){ enterShop(p, d); return true; }
        return false; };

      // ---------- 만들기 + 매 프레임 ----------
      function build(){
        DG.built = true; var t0 = performance.now();
        [buildStatic, buildCars, buildRides].forEach(function(f){ try{ f(); }catch(e){ DG.err = (DG.err || "") + f.name + ":" + e.message + " | "; if(window.console) console.error("DG " + f.name, e); } });
        DG.buildMs = performance.now() - t0;
      }
      var nightK = 0, shown = false, sCi = 1e9, sCj = 1e9, wantChunk = [], segT = 0, wantSeg = [];
      function streamTick(p, dt){
        var ci = Math.floor(p.x/CH), cj = Math.floor(-p.z/CH), R = 2, i, j, key;
        if(ci !== sCi || cj !== sCj){ sCi = ci; sCj = cj; wantChunk = [];
          for(i = ci - R; i <= ci + R; i++) for(j = cj - R; j <= cj + R; j++){ key = i + "," + j; if(!chunkMap[key] && -j*CH > ZMIN - CH && -j*CH < -40 + CH) wantChunk.push([i, j, Math.abs(i - ci) + Math.abs(j - cj)]); }
          wantChunk.sort(function(a, b){ return a[2] - b[2]; });
          Object.keys(chunkMap).forEach(function(k){ var q = k.split(","); if(Math.abs(+q[0] - ci) > R + 1 || Math.abs(+q[1] - cj) > R + 1){ if(chunkMap[k].g) dropChunk(chunkMap[k]); delete chunkMap[k]; } }); }
        if(wantChunk.length){ var q = wantChunk.shift(); key = q[0] + "," + q[1]; if(!chunkMap[key]) chunkMap[key] = buildChunk(q[0], q[1]); }
        segT -= dt; if(segT <= 0){ segT = 0.4; wantSeg = [];
          ROADS.forEach(function(r){ var nk = Math.floor((r.n - 1)/SEG) + 1; for(var k = 0; k < nk; k++){ var c = Math.min(r.n - 1, k*SEG + (SEG >> 1)), d = Math.hypot(r.x[c] - p.x, r.z[c] - p.z), kk = r.idx + ":" + k;
              if(d < 1700){ if(!segMap[kk]) wantSeg.push([d, r, k, kk]); } else if(d > 2500 && segMap[kk]){ if(segMap[kk].geos) dropSeg(segMap[kk]); delete segMap[kk]; } } });
          wantSeg.sort(function(a, b){ return a[0] - b[0]; }); }
        if(wantSeg.length){ var s = wantSeg.shift(); if(!segMap[s[3]]) segMap[s[3]] = buildSeg(s[1], s[2]) || { dummy:true }; }
      }
      DG.stream = streamTick;
      window.dgTick = function(t, dt, p){
        // 낙하산
        if(DG.para){ DG.para.t += dt; p.vy = -22 - GRAVITY*Math.min(dt, 0.05); p.onGround = false;      // 중력을 상쇄해서 일정한 속도로 천천히 내려와요
          if(chute){ chute.position.set(p.x, p.y + 18.5, p.z); chute.rotation.z = Math.sin(t/520)*0.07; chute.rotation.x = Math.cos(t/610)*0.05; }
          if(DG.para.t > 0.5 && p.y <= 0.05) endChute(p); }
        else if(!shown && p.x > SKY.edgeX && SKY_REF >= 85 && SKY_REF < 900 && p.z > ZH){ shown = true; showToast("🪂 하늘섬 높은 곳에서 B (또는 J) 를 누르면 낙하산을 펴고 내려갈 수 있어요! (방향키로 방향 조절)"); }
        if(!DG.built){ if(!window.__dbgForceDG && (!window.__riverBuilt || p.z > 300)) return; build(); }
        ROOT.visible = p.z < 800 && DG.inShop < 0;
        var nw = Math.min(1, window.__nightW || 0); nightK += (nw - nightK)*Math.min(1, dt*2);
        var e = nightK < 0.02 ? 0 : nightK; nightMats.forEach(function(m){ m.emissiveIntensity = e*0.95; });
        lampMat.color.setRGB(0.55 + e*0.45, 0.54 + e*0.42, 0.5 + e*0.1);
        if(carIM.trMat){ carIM.trMat.opacity = e*0.5; carIM.trMat2.opacity = e*0.22; }
        if(ROOT.visible){ if(p.z < 400) streamTick(p, dt); updateCars(dt, p, e); for(var i = 0; i < DG.rides.length; i++){ var r = DG.rides[i]; if(r !== DG.riding) r.ring.material.opacity = 0.35 + 0.2*Math.sin(t/300 + i); } }
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
