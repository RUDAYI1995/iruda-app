      // =================== 중앙 마을 (큰 기와집을 중심으로 흙길, 양옥, 초가, 슬레이트집, 창고, 텃밭이 있는 마을) ===================
      (function(){
        if(!VA || !VA.props.m_front) return;
        var G = new THREE.Group(); G.name = "central"; V.add(G); var prevCP = CP; CP = G;
        var X0 = -715, X1 = -1125, Z0 = -30, Z1 = 186;
        function flat(tile, cx, cz, w, d, rx, ry, y, po){                       // 바닥에 깔리는 흙 무늬
          var t = vtex(VA.tiles[tile], rx, ry, true), m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, polygonOffset:true, polygonOffsetFactor:po, polygonOffsetUnits:po }));
          m.rotation.x = -Math.PI/2; m.position.set(cx, y, cz); G.add(m); return m;
        }
        flat("t_weedy", (X0 + X1)/2, (Z0 + Z1)/2, Math.abs(X1 - X0) + 40, Z1 - Z0 + 10, 24, 12, 0.055, -1);
        flat("t_yard", -920, 96, 120, 56, 7, 3.3, 0.06, -2);                    // 큰 기와집 앞마당
        function dirtRoad(x0, z0, x1, z1, w, tile){
          var vert = Math.abs(x1 - x0) < 0.1, len = vert ? Math.abs(z1 - z0) : Math.abs(x1 - x0), t = vtex(VA.tiles[tile || "t_dirt"], w/30, len/30, true);
          var m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })); m.rotation.x = -Math.PI/2;
          var gp = new THREE.Group(); gp.add(m); gp.position.set((x0 + x1)/2, 0.07, (z0 + z1)/2); gp.rotation.y = vert ? 0 : Math.PI/2; G.add(gp);
        }
        dirtRoad(-632, 45, -1125, 45, 15, "t_dirt");                             // 큰길 (큰길 쪽에서 들어와요)
        dirtRoad(-920, 45, -920, 118, 12, "t_dirt");                             // 큰 기와집으로 가는 길
        dirtRoad(-1112, -28, -1112, 184, 7, "t_gravel2"); dirtRoad(-715, -28, -715, 46, 6, "t_gravel2");
        // ---- 집 (앞/옆/뒤 그림을 네 면에 세우고, 속은 단색 덩어리로 채워요) ----
        function houseFull(d, x, z, rot){
          var P = VA.props, f = P[d.f], s = P[d.s || d.f], b = P[d.b || d.f]; if(!f || !s || !b) return;
          var W = d.W, Hf = W*f.h/f.w, D = d.D || Math.min(W*1.05, Hf*s.w/s.h*0.9), g = new THREE.Group();
          var core = new THREE.Mesh(new THREE.BoxGeometry(W*0.84, Hf*0.74, D*0.84), new THREE.MeshLambertMaterial({ color:d.core || 0x6a625a })); core.position.y = Hf*0.37; core.castShadow = true; g.add(core);
          function pl(e, w, h2, px, pz, ry, mir){
            var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h2), new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xece6dc }));
            m.position.set(px, h2/2, pz); m.rotation.y = ry; if(mir) m.scale.x = -1; g.add(m);
          }
          var Ws = Hf*s.w/s.h, Wb = W*b.h > 0 ? Hf*b.w/b.h : W;
          pl(f, W, Hf, 0, D/2, 0); pl(b, Math.min(Wb, W*1.04), Hf, 0, -D/2, Math.PI, true);
          pl(s, Math.min(Ws, D*1.15), Hf, -W*0.47, 0, -Math.PI/2); pl(s, Math.min(Ws, D*1.15), Hf, W*0.47, 0, Math.PI/2, true);
          g.position.set(x, 0, z); g.rotation.y = rot; CP.add(g);
          var sh = new THREE.Mesh(new THREE.PlaneGeometry(W*1.0, D*1.0), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.42, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.set(x + 2, 0.09, z + 1.5); CP.add(sh);
          reg(g, x, z, 950); reg(sh, x, z, 950);
          var horiz = Math.abs(Math.sin(rot)) < 0.5; VIL_RECTS.push({ x:x, z:z, hx:(horiz ? W : D)*0.46, hz:(horiz ? D : W)*0.46 });
        }
        var NR = Math.PI, SR = 0;
        var HD = {
          M:  { f:"m_front", s:"m_side", b:"m_back", W:76, D:60, core:0x5a5650 },
          B:  { f:"b_front", s:"b_side", b:"b_back", W:34, D:26, core:0x8c5a46 },
          SL: { f:"sl_blue", W:32, D:23, core:0x7c8794 },
          T1: { f:"t1", W:24, D:17, core:0xa9894c }, T2: { f:"t2", W:23, D:17, core:0xa9894c },
          TS: { f:"tl_s", W:22, D:17, core:0x5c5a5c }, TM: { f:"t_med", W:34, D:22, core:0xa9894c },
          TL: { f:"tl_m_back", s:"tl_m_side", b:"tl_m_back", W:34, D:24, core:0x5c5a5c },
          WT: { f:"w_thatch", W:27, D:18, core:0xa9894c }, WB: { f:"w_blue", W:22, D:16, core:0x8a929c },
          WA: { f:"wA_front", s:"wA_front", b:"wA_back", W:25, D:17, core:0x7b7a76 }, WC: { f:"wB_front", s:"wB_side", b:"wB_back", W:23, D:17, core:0x7b6a5c }
        };
        var HOUSES = [
          ["M", -920, 150, NR],
          ["B", -745, 84, NR], ["T1", -805, 80, NR], ["SL", -862, 84, NR], ["TM", -990, 83, NR], ["TS", -1052, 80, NR], ["WT", -1098, 84, NR],
          ["TL", -748, 8, SR], ["T2", -805, 8, SR], ["WA", -862, 7, SR], ["B", -950, 8, SR], ["SL", -1012, 8, SR], ["WC", -1070, 7, SR]
        ];
        HOUSES.forEach(function(h){ houseFull(HD[h[0]], h[1], h[2], h[3]); });
        // ---- 담: 함석 울타리, 시멘트 블록 담 ----
        function panelWall(x, z, len, vert, tile, h, col){
          var thk = 1.2, t = vtex(VA.tiles[tile], len/9, h/9, true), g = new THREE.Group();
          var body = new THREE.Mesh(new THREE.BoxGeometry(len, h, thk), new THREE.MeshLambertMaterial({ color:col || 0xffffff, map:t })); body.position.y = h/2; g.add(body);
          if(tile === "t_cement"){ var cp = new THREE.Mesh(new THREE.BoxGeometry(len + 0.5, 0.7, thk + 0.7), new THREE.MeshLambertMaterial({ color:0xa9a398 })); cp.position.y = h + 0.3; g.add(cp); }
          else [-1, 1].forEach(function(sd){ var po = new THREE.Mesh(new THREE.BoxGeometry(0.7, h + 1.2, 0.7), new THREE.MeshLambertMaterial({ color:0x5b4636 })); po.position.set(sd*len/2, (h + 1.2)/2, 0); g.add(po); });
          g.position.set(x, 0, z); if(vert) g.rotation.y = Math.PI/2; CP.add(g); reg(g, x, z, 950);
          VIL_RECTS.push(vert ? { x:x, z:z, hx:1.2, hz:len/2 } : { x:x, z:z, hx:len/2, hz:1.2 });
        }
        panelWall(-770, 108, 56, false, "t_tin", 6.4); panelWall(-1060, 18, 44, false, "t_tin", 6.4); panelWall(-1124, 60, 50, true, "t_tin", 6.4);
        panelWall(-735, 28, 40, false, "t_cement", 4.6); panelWall(-980, 28, 36, false, "t_cement", 4.6); panelWall(-1118, 6, 36, true, "t_cement", 4.6);
        // ---- 마당 소품 ----
        function put(key, x, z, h, ry){ card(key, x, z, h); }
        [-700, -790, -880, -1000, -1090].forEach(function(px){ put("q_pole", px, 56, 31); VIL_RECTS.push({ x:px, z:56, hx:1.2, hz:1.2 }); });
        put("q_jars", -758, 62, 6.2); put("q_jars", -1040, 62, 6.2); put("q_line", -830, 62, 12); put("q_table", -945, 108, 7); put("q_table", -895, 112, 7); put("q_dish", -990, 8, 5);
        put("q_cabbage", -1010, 128, 4.2); put("q_lettuce", -1052, 132, 4.2); put("q_cabbage", -1032, 170, 4.2); put("q_pepper", -1075, 170, 5); put("q_onion", -1098, 130, 6); put("q_furrow", -1100, 152, 5);
        put("q_tunnel", -1030, 150, 10); put("q_tunnel", -1070, 150, 10);
        ["persimmon", "apple", "persimmon", "apple", "persimmon"].forEach(function(k, i){ var tx = -735 - i*30, tz = 145 + ((i*37) % 25); put(k, tx, tz, 22 + (i % 3)*2); VIL_RECTS.push({ x:tx, z:tz, hx:3, hz:3 }); });
        buildBigTree(-985, 112, 1.2); VIL_RECTS.push({ x:-985, z:112, hx:5, hz:5 });
        ["p_bush0", "p_bush1", "p_cosmos", "y_wild", "p_bush2"].forEach(function(k, i){ for(var q = 0; q < 6; q++){ var bx = X0 - 10 - ((i*61 + q*47) % 400), bz = (q % 2 ? 24 : 70) + ((i*13 + q*7) % 8); put(k, bx, bz, 4 + (q % 3)*0.5); } });
        // ---- 탈것 (E 로 타고 내려요) ----
        var rides = [], riding = null;
        function cardR(key, x, z, h, kind){
          var e = VA.props[key], w = h*e.w/e.h, piv = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map:baseTex(e), transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
          m.position.y = h*0.5; piv.add(m); piv.position.set(x, 0.1, z); CP.add(piv); facers.push(piv);
          var sh = new THREE.Mesh(new THREE.PlaneGeometry(w*0.8, w*0.35), new THREE.MeshBasicMaterial({ map:vShTex, transparent:true, opacity:0.45, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.set(x + 1, 0.09, z + 0.5); CP.add(sh);
          var ring = new THREE.Mesh(new THREE.RingGeometry(w*0.55, w*0.62, 24), new THREE.MeshBasicMaterial({ color:0xffe27a, transparent:true, opacity:0.55, side:THREE.DoubleSide, depthWrite:false })); ring.rotation.x = -Math.PI/2; ring.position.set(x, 0.12, z); CP.add(ring);
          var it = { kind:kind, piv:piv, m:m, sh:sh, ring:ring, x:x, z:z, mul:kind === "bike" ? 1.85 : 1.45, name:kind === "bike" ? "자전거" : "경운기" }; rides.push(it); return it;
        }
        cardR("q_bike", -705, 30, 10, "bike"); cardR("q_bike", -1005, 60, 10, "bike"); cardR("q_tiller", -860, 62, 11, "tiller"); cardR("q_tiller", -1090, 28, 11, "tiller");
        function nearRide(p){ for(var i = 0; i < rides.length; i++){ var r = rides[i]; if(r !== riding && Math.hypot(p.x - r.x, p.z - r.z) < 10) return r; } return null; }
        function dismount(p, quiet){
          if(!riding) return; var r = riding, c = state.cam.yaw;
          r.x = p.x - Math.cos(c)*6; r.z = p.z + Math.sin(c)*6; if(!vilWalkable(r.x, r.z)){ r.x = p.x; r.z = p.z; }
          r.piv.position.set(r.x, 0.1, r.z); r.sh.position.set(r.x + 1, 0.09, r.z + 0.5); r.ring.position.set(r.x, 0.12, r.z); r.ring.visible = true; r.sh.visible = true;
          window.vilRideMul = 1; riding = null; if(!quiet) showToast("🛑 " + r.name + "에서 내렸어요.");
        }
        window.vilRideHint = function(p){ if(riding) return "E 눌러 " + riding.name + "에서 내리기"; var r = nearRide(p); return r ? "E 눌러 " + r.name + " 타기" : null; };
        window.vilRideInteract = function(p){
          if(riding){ dismount(p); return true; }
          var r = nearRide(p); if(!r) return false;
          riding = r; window.vilRideMul = r.mul; r.ring.visible = false; showToast(r.kind === "bike" ? "🚲 자전거를 탔어요! 더 빨리 달릴 수 있어요. (내리려면 E)" : "🚜 경운기를 탔어요! 털털털 달려요. (내리려면 E)");
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
