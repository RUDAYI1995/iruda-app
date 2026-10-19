    // ================= 3D 군인(국군/북한군) + 3D 루샤: 표지판 같은 그림 대신 몸이 있는 인형 =================
    // 군인 200명은 부위별 InstancedMesh(같은 모양을 한 번에 그림)로, 관절은 2관절 IK(팔·다리)로 움직여요: 걷기/뛰기(발이 땅을 딛고 무릎이 접힘),
    // 총 들고 걷기 ↔ 조준 사격(반동 + 총구 불꽃), 숨쉬기·무게 이동·두리번, 피격 휘청, 쓰러짐, 만세.
    (function buildTBRig(){
      var V3 = THREE.Vector3, M4 = THREE.Matrix4, Q = THREE.Quaternion, E = THREE.Euler, CO = THREE.Color;
      var _m = new M4(), _p = new V3(), _q = new Q(), _s = new V3(), _q2 = new Q(), _e = new E(), root = new M4(), _Y = new V3(0, 1, 0), _Z = new V3(0, 0, 1), _d = new V3();
      function rnd1(seed){ var s = Math.sin(seed*12.9898)*43758.5453; return s - Math.floor(s); }
      function ctex(w, h, fn){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
      function fabricTex(){ return ctex(128, 128, function(g, w, h){ g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, w, h); var i; for(i = 0; i < 1400; i++){ var v = 205 + Math.floor(Math.random()*50); g.fillStyle = "rgb(" + v + "," + v + "," + v + ")"; g.fillRect(Math.random()*w, Math.random()*h, 2, 2); } g.strokeStyle = "rgba(120,120,120,0.16)"; g.lineWidth = 1; for(i = -h; i < w; i += 5){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } }); }
      function faceTex(side){ var cvT = null; var tx = ctex(256, 128, function(g, w, h){ g.fillStyle = "#e9bb94"; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(60,40,28,0.0)"); gr.addColorStop(1, "rgba(120,70,40,0.18)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
          g.fillStyle = "#33261c"; g.fillRect(96, 0, 190, 128); g.fillRect(0, 0, 26, 128); g.fillRect(0, 0, 256, 40);        // 머리카락(뒤/옆/위)
          g.fillStyle = "#f6f2ea"; g.beginPath(); g.ellipse(52, 66, 7, 4.4, 0, 0, 7); g.ellipse(76, 66, 7, 4.4, 0, 0, 7); g.fill(); g.fillStyle = "#2b1a10"; g.beginPath(); g.arc(53, 66, 3, 0, 7); g.arc(77, 66, 3, 0, 7); g.fill();
          g.strokeStyle = "#3a2518"; g.lineWidth = 3; g.beginPath(); g.moveTo(43, 57); g.lineTo(60, 55); g.moveTo(68, 55); g.lineTo(86, 57); g.stroke(); g.strokeStyle = "rgba(150,90,62,0.8)"; g.lineWidth = 2; g.beginPath(); g.moveTo(64, 68); g.lineTo(62, 80); g.lineTo(67, 80); g.stroke(); g.strokeStyle = "#8a4a3a"; g.lineWidth = 3; g.beginPath(); g.moveTo(54, 92); g.quadraticCurveTo(64, 96, 74, 92); g.stroke(); cvT = g.canvas; });
        // 갓루다님이 준 국군/북한군 시트의 얼굴을 머리 앞(u=0.25)에 입혀요
        var src = window.UNITS && window.UNITS[side + "Soldier"]; if(src){ var im = new Image(); im.onload = function(){ var g2 = cvT.getContext("2d"); g2.fillStyle = "#e9bb94"; g2.fillRect(20, 28, 90, 80); var sx = side === "rok" ? 86 : 90, sy = 38, sw = 68, sh = 66; g2.save(); g2.beginPath(); g2.ellipse(64, 72, 36, 40, 0, 0, 7); g2.clip(); g2.drawImage(im, sx, sy, sw, sh, 28, 40, 72, 70); g2.restore(); tx.needsUpdate = true; }; im.src = src; }
        return tx; }
      function shadowTex(){ return ctex(64, 64, function(g, w, h){ var gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, "rgba(0,0,0,0.62)"); gr.addColorStop(0.6, "rgba(0,0,0,0.3)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }
      function ik2(sh, tg, l1, l2, pole, outElbow, outHand){
        var dx = tg.x - sh.x, dy = tg.y - sh.y, dz = tg.z - sh.z, d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-4, dm = (l1 + l2)*0.995; if(d > dm) d = dm; if(d < 0.25) d = 0.25; var nx = dx/(Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-4), ny = dy/(Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-4), nz = dz/(Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-4);
        var a = (l1*l1 - l2*l2 + d*d)/(2*d), h = Math.sqrt(Math.max(0, l1*l1 - a*a)), dp = pole.x*nx + pole.y*ny + pole.z*nz, px = pole.x - nx*dp, py = pole.y - ny*dp, pz = pole.z - nz*dp, pl = Math.sqrt(px*px + py*py + pz*pz) || 1; px /= pl; py /= pl; pz /= pl;
        outElbow.set(sh.x + nx*a + px*h, sh.y + ny*a + py*h, sh.z + nz*a + pz*h); outHand.set(sh.x + nx*d, sh.y + ny*d, sh.z + nz*d);
      }
      function put(mesh, i, px, py, pz, q, sx, sy, sz){ _p.set(px, py, pz); _s.set(sx, sy, sz); _m.compose(_p, q, _s); _m.premultiply(root); mesh.setMatrixAt(i, _m); }
      var QI = new Q();
      function seg(mesh, i, a, b, rad){ _d.subVectors(b, a); var len = _d.length() || 0.01; _d.multiplyScalar(1/len); _q.setFromUnitVectors(_Y, _d); put(mesh, i, (a.x + b.x)/2, (a.y + b.y)/2, (a.z + b.z)/2, _q, rad, len, rad); }
      function hide(mesh, i){ _m.makeScale(0, 0, 0); mesh.setMatrixAt(i, _m); }
      // 특수 병사 겉모습: 자폭병(주황·빨강 조끼+노란 폭탄 배낭) · 독침병(초록 옷+보라 투구) · 철갑병(검은 갑옷, 큰 몸집) · 지휘관(빨간 옷+금빛 투구, 큰 몸집) · 영웅(아주 크고 눈에 띄는 색) · 정예(금빛 투구)
      var ROLEL = {
        bomber:{ cols:{ cloth:0xd8461a, pants:0x7a2a14, helm:0x3a2a1a, pack:0xffd23a, boot:0x2a1a10 }, lod:[2.4, 0.7, 0.35] },
        venom:{ cols:{ cloth:0x35b03a, pants:0x1f6a2a, helm:0x7a2ab8, pack:0x7be04a, boot:0x1a3a1a }, lod:[0.7, 2.0, 0.6] },
        iron:{ cols:{ cloth:0x3a4048, pants:0x2a2e34, helm:0x181b1f, pack:0x5a616c, boot:0x14161a }, lod:[0.45, 0.5, 0.65] },
        cmdr:{ cols:{ cloth:0xb02222, pants:0x6a1a1a, helm:0xffd34d, pack:0x7a1a1a, boot:0x2a1410 }, lod:[2.0, 0.55, 0.55] },
        ehero:{ cols:{ cloth:0x6a1f8f, pants:0x3a1050, helm:0xff4a8a, pack:0x2a0a3a, boot:0x1a0a20 }, lod:[1.4, 0.4, 2.0] },
        ahero:{ cols:{ cloth:0xf0f0f0, pants:0xc9a227, helm:0xffd34d, pack:0xe0c060, boot:0x7a5a20 }, lod:[2.0, 1.9, 1.4] },
        elite:{ cols:{ cloth:0x6a6c3f, pants:0x62613a, helm:0xffd34d, pack:0x4c4e30, boot:0x5b3b25 }, lod:[1.6, 1.5, 0.6] }
      };
      var ROLEC = {}; Object.keys(ROLEL).forEach(function(k){ ROLEC[k] = { cols:ROLEL[k].cols, lod:new CO(ROLEL[k].lod[0], ROLEL[k].lod[1], ROLEL[k].lod[2]) }; });
      function roleLook(u){ if(u.hero) return ROLEC[u.side === "rok" ? "ahero" : "ehero"]; if(u.cmdr) return ROLEC.cmdr; if(u.role) return ROLEC[u.role]; if(u.elite && u.side === "rok") return ROLEC.elite; return null; }
      var COLS = { rok:{ cloth:0x6a6c3f, pants:0x62613a, helm:0x575a3a, pack:0x4c4e30, boot:0x5b3b25 }, nk:{ cloth:0x9a8040, pants:0x8a7338, helm:0x8c7a3e, pack:0x6e5a30, boot:0x5b3b25 } };
      var SKIN = 0xe0ad88, WOOD = 0x5b3b22, STEEL = 0x25272a;
      window.TBRig = { create:function(G, NU, NF){
        var N = NF || NU;      // N = 자세히 그리는 군인 칸 수(가까운 군인만), NU = 전체 군인 수(먼 군인은 간단한 모양으로)
        var cloth = new THREE.MeshStandardMaterial({ map:fabricTex(), roughness:0.95, metalness:0, emissive:0x141414, flatShading:true, fog:false }), plain = new THREE.MeshStandardMaterial({ roughness:0.8, metalness:0.05, emissive:0x101010, flatShading:true, fog:false }), face = new THREE.MeshStandardMaterial({ map:faceTex("rok"), roughness:0.75, emissive:0x1c1816, fog:false }), faceN = new THREE.MeshStandardMaterial({ map:faceTex("nk"), roughness:0.75, emissive:0x1c1816, fog:false });
        var sph = new THREE.SphereGeometry(1, 7, 5), headGeo = new THREE.SphereGeometry(1, 10, 7), cyl = new THREE.CylinderGeometry(1, 0.82, 1, 7, 1), box = new THREE.BoxGeometry(1, 1, 1), hemi = new THREE.SphereGeometry(1, 11, 5, 0, Math.PI*2, 0, Math.PI/2), circ = new THREE.CircleGeometry(1, 16);
        function mk(geo, mat, colored){ var m = new THREE.InstancedMesh(geo, mat, N); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; if(colored){ var c = new CO(1, 1, 1); for(var i = 0; i < N; i++) m.setColorAt(i, c); } G.add(m); return m; }
        var P = { torso:mk(sph, cloth, 1), sho:mk(sph, cloth, 1), pel:mk(sph, cloth, 1), pack:mk(box, cloth, 1), head:mk(headGeo, face, 1), headN:mk(headGeo, faceN, 1), pkL:mk(box, cloth, 1), pkR:mk(box, cloth, 1), stL:mk(box, plain, 1), stR:mk(box, plain, 1), star:mk(box, plain, 1), helm:mk(hemi, plain, 1), rim:mk(cyl, plain, 1), tL:mk(cyl, cloth, 1), tR:mk(cyl, cloth, 1), sL:mk(cyl, cloth, 1), sR:mk(cyl, cloth, 1), bL:mk(box, plain, 1), bR:mk(box, plain, 1), uL:mk(cyl, cloth, 1), uR:mk(cyl, cloth, 1), fL:mk(cyl, cloth, 1), fR:mk(cyl, cloth, 1), hL:mk(sph, plain, 1), hR:mk(sph, plain, 1), stock:mk(box, plain, 1), barrel:mk(box, plain, 1), bayo:mk(box, plain, 1), scope:mk(box, plain, 1), flash:mk(sph, new THREE.MeshBasicMaterial({ color:0xffd45a, fog:false }), 0) };
        var shadow = new THREE.InstancedMesh(circ, new THREE.MeshBasicMaterial({ map:shadowTex(), transparent:true, depthWrite:false, fog:false }), N); shadow.instanceMatrix.setUsage(THREE.DynamicDrawUsage); shadow.frustumCulled = false; shadow.renderOrder = 1; G.add(shadow);
        // ---- 먼 군인: 부위 9개를 한 덩어리로 합친 간단한 모양 (5000 대 5000 에서도 가볍게) ----
        var LODG = (function(){
          var pos = [], nor = [], colr = [], idx = [];
          function addBox(cx, cy, cz, sx, sy, sz, hex){ var b = new THREE.BoxGeometry(sx, sy, sz), p = b.attributes.position, n = b.attributes.normal, ix = b.index, base = pos.length/3, c = new CO(hex), k; for(k = 0; k < p.count; k++){ pos.push(p.getX(k) + cx, p.getY(k) + cy, p.getZ(k) + cz); nor.push(n.getX(k), n.getY(k), n.getZ(k)); colr.push(c.r, c.g, c.b); } for(k = 0; k < ix.count; k++) idx.push(ix.getX(k) + base); }
          addBox(-0.85, 2.3, 0, 1.3, 4.6, 1.5, 0x62613a); addBox(0.85, 2.3, 0, 1.3, 4.6, 1.5, 0x62613a); addBox(0, 6.5, 0, 3.7, 3.7, 2.2, 0x6a6c3f); addBox(0, 7.2, -1.6, 2.4, 2.5, 1.1, 0x4c4e30); addBox(0, 9.9, 0.1, 2.0, 2.1, 2.0, 0xe0ad88); addBox(0, 11.0, 0.1, 2.8, 1.1, 2.8, 0x575a3a); addBox(-2.4, 6.4, 0.8, 1.1, 3.3, 1.1, 0x6a6c3f); addBox(2.4, 6.4, 0.8, 1.1, 3.3, 1.1, 0x6a6c3f); addBox(0.7, 7.0, 2.7, 0.5, 0.5, 5.4, 0x3a2a1c);
          var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(colr, 3)); g.setIndex(idx); return g;
        })();
        var lod = new THREE.InstancedMesh(LODG, new THREE.MeshStandardMaterial({ vertexColors:true, roughness:0.9, flatShading:true, emissive:0x101010, fog:false }), NU); lod.instanceMatrix.setUsage(THREE.DynamicDrawUsage); lod.frustumCulled = false; G.add(lod);
        var cROK = new CO(1, 1, 1), cNK = new CO(1.4, 1.18, 0.82), li; _m.makeScale(0, 0, 0); for(li = 0; li < NU; li++){ lod.setMatrixAt(li, _m); lod.setColorAt(li, cROK); }
        var slotOwner = [], freeSlots = [], NEAR = 150, near2 = NEAR*NEAR, frameNo = 0, lodColDirty = false; for(li = N - 1; li >= 0; li--){ freeSlots.push(li); slotOwner.push(null); }
        var ST = [], tmpC = new CO(), tint1 = new CO(0xb06aff), tint2 = new CO(0xff7a7a);
        for(var i = 0; i < N; i++) ST.push({ px:0, pz:0, yaw:0, ph:rnd1(i)*6.28, walk:0, aim:0, kn:0, sb:0, sg:0, rl:0, pt:0, pn:0, mg:0, sn:0, spr:0, tint:-1, off:rnd1(i + 91)*6.28, init:false, cheer:0, br:0.92 + rnd1(i + 3)*0.16 });
        function setColors(i, u, tint){
          var C = COLS[u.side], rlk = roleLook(u), st = ST[i], b = st.br, amt = tint === 1 ? 0.5 : (tint === 2 ? 0.45 : 0), tc = tint === 1 ? tint1 : tint2;
          if(rlk) C = rlk.cols;
          function col(m, hex, extra){ tmpC.setHex(hex).multiplyScalar(b*(extra || 1)); if(amt) tmpC.lerp(tc, amt); m.setColorAt(i, tmpC); }
          col(P.torso, C.cloth); col(P.sho, C.cloth, 0.94); col(P.pel, C.pants); col(P.pack, C.pack); col(P.head, 0xffffff, 1.0); col(P.headN, 0xffffff, 1.0); col(P.pkL, C.cloth, 0.8); col(P.pkR, C.cloth, 0.8); col(P.stL, 0x8a7a50, 1); col(P.stR, 0x8a7a50, 1); col(P.star, 0xd02a2a, 1); col(P.helm, C.helm); col(P.rim, C.helm, 0.9); col(P.tL, C.pants); col(P.tR, C.pants); col(P.sL, C.pants, 0.95); col(P.sR, C.pants, 0.95); col(P.bL, C.boot); col(P.bR, C.boot); col(P.uL, C.cloth); col(P.uR, C.cloth); col(P.fL, C.cloth, 0.95); col(P.fR, C.cloth, 0.95); col(P.hL, SKIN, 1); col(P.hR, SKIN, 1); col(P.stock, WOOD, 1); col(P.bayo, 0xb9bec4, 1); col(P.scope, 0x1d1f22, 1); col(P.barrel, STEEL, 1);
          Object.keys(P).forEach(function(k){ if(P[k].instanceColor) P[k].instanceColor.needsUpdate = true; }); st.tint = tint;
        }
        function releaseSlot(ur){ var s = ur.slot; if(s < 0) return; for(var kk = 0; kk < PK.length; kk++) hide(P[PK[kk]], s); hide(shadow, s); ur.slot = -1; slotOwner[s] = null; freeSlots.push(s); }
        function assignSlot(ur){ var s = freeSlots.pop(), st = ST[s]; ur.slot = s; slotOwner[s] = ur; st.init = false; st.tint = -1; st.kn = st.sb = st.sg = st.rl = st.pt = st.pn = st.mg = st.sn = st.spr = 0; st.walk = 0; st.aim = 0; st.cheer = 0; }
        function lodHide(ui, ur){ if(ur.lodOn !== false){ _m.makeScale(0, 0, 0); lod.setMatrixAt(ui, _m); ur.lodOn = false; } }
        function lodDraw(ui, u, ur){
          var dx = u.x - ur.lx, dz = u.z - ur.lz; if(dx*dx + dz*dz > 0.05) ur.lyaw = Math.atan2(dx, dz); ur.lx = u.x; ur.lz = u.z;
          var yaw = ur.lyaw !== undefined ? ur.lyaw : (u.yaw0 !== undefined ? u.yaw0 : (u.side === "rok" ? 0 : Math.PI)); if((u.fireT > 0 || u.act === "stab") && u.fx !== undefined) yaw = Math.atan2(u.fx - u.x, u.fz - u.z);
          var fall = 0, rs0 = u.rs || 1, sc = 1.1*rs0; if(u.die >= 0){ fall = Math.min(1, u.die/0.55)*1.5708; if(u.die > 2.3) sc = 1.1*rs0*Math.max(0, 1 - (u.die - 2.3)/0.6); }
          _e.set(-fall, yaw, 0, "YXZ"); _q.setFromEuler(_e); _p.set(u.x, (u.y || 0) + (fall > 0 ? fall*0.6 : 0), u.z); _s.set(sc, sc, sc); _m.compose(_p, _q, _s); lod.setMatrixAt(ui, _m); ur.lodOn = true;
          if(!ur.lc){ var rlc = roleLook(u); lod.setColorAt(ui, rlc ? rlc.lod : (u.side === "nk" ? cNK : cROK)); lodColDirty = true; ur.lc = true; }
        }
        var shL = new V3(-1.45, 8.1, 0.05), shR = new V3(1.45, 8.1, 0.05), hipL = new V3(-0.85, 5.4, 0), hipR = new V3(0.85, 5.4, 0), tg = new V3(), el = new V3(), hd = new V3(), poleA = new V3(), poleL = new V3(0, 0.15, 1), a0 = new V3(), a1 = new V3(), aL = new V3(), aR = new V3(), rh = new V3(), lh = new V3(), eLv = new V3(), eRv = new V3(), hLv = new V3(), hRv = new V3(), kL = new V3(), kR = new V3(), anL = new V3(), anR = new V3(), rd = new V3();
        var API = {}, PK = Object.keys(P);
        var FR = new THREE.Frustum(), PMX = new THREE.Matrix4(), SPH = new THREE.Sphere(new V3(), 11);
        API.update = function(units, tm, dt0, cam){
          // 1000 대 1000: 화면 밖은 건너뛰고, 멀수록 2~3프레임에 한 번만 움직여요(밀린 시간은 합쳐서 반영)
          var S0 = 1.1, i, u, st, dt = dt0, fr = null, ui, nU = units.length, camx = cam ? cam.position.x : 0, camz = cam ? cam.position.z : 0; if(cam && !window.__rigNoCull){ cam.updateMatrixWorld(); PMX.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse); FR.setFromProjectionMatrix(PMX); fr = FR; }
          frameNo++; lodColDirty = false;
          for(ui = 0; ui < nU; ui++){
            u = units[ui]; if(!u) continue; var ur = u._r || (u._r = { slot:-1, lodOn:undefined, lx:u.x, lz:u.z, lyaw:undefined, lc:false, acc:0, fc:0 });
            if(!u.vis || u.die > 2.9){ if(ur.slot >= 0) releaseSlot(ur); lodHide(ui, ur); continue; }
            var cdx = u.x - camx, cdz = u.z - camz, cd2 = cdx*cdx + cdz*cdz;
            if(fr){ SPH.center.set(u.x, (u.y || 0) + 6, u.z); if(!fr.intersectsSphere(SPH)){ if(ur.slot >= 0) releaseSlot(ur); lodHide(ui, ur); ur.acc += dt0; continue; } }
            var wantFull = ur.slot >= 0 ? (cd2 < near2*2.2) : (cd2 < near2 && freeSlots.length > 0);
            if(!wantFull){ if(ur.slot >= 0) releaseSlot(ur); if(((ui + frameNo) & 1) === 0 || ur.lodOn !== true) lodDraw(ui, u, ur); continue; }
            if(ur.slot < 0){ assignSlot(ur); lodHide(ui, ur); }
            i = ur.slot; st = ST[i];
            if(fr){ var ev = cd2 < 16900 ? 1 : (cd2 < 67600 ? 2 : 3); ur.fc++; if(ev > 1 && st.init && (ur.fc % ev) !== 0){ ur.acc += dt0; continue; } }
            dt = dt0 + ur.acc; ur.acc = 0;
            var tint = u.brain > 0 ? 1 : (u.hit > 0 ? 2 : 0); if(tint !== st.tint) setColors(i, u, tint);
            if(!st.init){ st.px = u.x; st.pz = u.z; st.yaw = u.yaw0 !== undefined ? u.yaw0 : (u.side === "rok" ? 0 : Math.PI); st.init = true; }
            var dx = u.x - st.px, dz = u.z - st.pz, sp = dt > 0 ? Math.sqrt(dx*dx + dz*dz)/dt : 0; if(sp > 120) sp = 0; st.px = u.x; st.pz = u.z;
            var walkT = (sp > 2.2 && u.die < 0) ? 1 : 0; st.walk += (walkT - st.walk)*Math.min(1, dt*9); st.ph += (Math.min(sp, 14 + 9*st.spr)*1.1 + (st.walk > 0.3 ? 0.4 : 0))*dt*1.55;
            var aimT = (u.fireT > 0 && u.die < 0) ? 1 : 0; st.aim += (aimT - st.aim)*Math.min(1, dt*14); if(u.cheer) st.cheer += (1 - st.cheer)*Math.min(1, dt*8); else st.cheer += (0 - st.cheer)*Math.min(1, dt*8);
            // 다양한 동작: 무릎쏴(kn) · 총검 찌르기(sb) · 뒤로 손짓(sg) · 장전(rl) · 가리키기(pt) · 맞아서 아픔(pn) · 돌진(spr)
            var act = u.die < 0 ? u.act : null, k1 = Math.min(1, dt*10);
            st.kn += (((act === "kneel" || act === "mg" || act === "snipe") ? 1 : 0) - st.kn)*k1; st.mg += ((act === "mg" ? 1 : 0) - st.mg)*k1; st.sn += ((act === "snipe" ? 1 : 0) - st.sn)*k1; st.sb += ((act === "stab" ? 1 : 0) - st.sb)*Math.min(1, dt*16); st.sg += ((act === "signal" ? 1 : 0) - st.sg)*k1; st.rl += ((act === "reload" ? 1 : 0) - st.rl)*k1; st.pt += ((act === "point" ? 1 : 0) - st.pt)*k1; st.pn += ((u.hit > 0 && u.die < 0 ? 1 : 0) - st.pn)*Math.min(1, dt*12); st.spr += ((sp > 12 && u.die < 0 ? Math.min(1, (sp - 10)/10) : 0) - st.spr)*Math.min(1, dt*8);
            var mgp = st.mg, snp = st.sn, kn = st.kn, sb = st.sb, sg = st.sg, rl = st.rl, pt = st.pt, pn = st.pn, spr = st.spr;
            var fy = u.yaw0 !== undefined ? u.yaw0 : (u.side === "rok" ? 0 : Math.PI), ty = fy; if(sp > 2.2) ty = Math.atan2(dx, dz); else if((u.fireT > 0 || u.act === "stab") && u.fx !== undefined) ty = Math.atan2(u.fx - u.x, u.fz - u.z); else if(u.die < 0 && st.cheer < 0.1) ty = fy + Math.sin(tm*0.5 + st.off)*0.22;
            var da = ty - st.yaw; while(da > Math.PI) da -= 2*Math.PI; while(da < -Math.PI) da += 2*Math.PI; st.yaw += da*Math.min(1, dt*(sp > 2.2 ? 12 : 8));
            var w = st.walk, ph = st.ph, s1 = Math.sin(ph), c1 = Math.cos(ph), idle = 1 - w;
            var bob = Math.abs(s1)*0.3*w + Math.sin(tm*1.6 + st.off)*0.05*idle + (st.cheer > 0.1 ? Math.abs(Math.sin(tm*8 + st.off))*0.9*st.cheer : 0);
            var lean = 0.06*w + 0.05*st.aim, flinch = u.hit > 0 ? Math.sin(Math.min(1, u.hit/0.6)*Math.PI)*0.35 : 0, fall = 0, hy = 0;
            lean += 0.28*spr + 0.12*kn + 0.22*sb - 0.2*pn + 0.1*rl; bob += Math.abs(s1)*0.4*spr - 2.6*kn;
            if(u.die >= 0){ var k = Math.min(1, u.die/0.55), e = k*k*(3 - 2*k); fall = e*(Math.PI/2); hy = e*1.0; lean = 0; flinch = 0; w = 0; }
            var scl = (u.die > 2.3) ? Math.max(0, 1 - (u.die - 2.3)/0.6) : 1;
            // 루트: 위치 + 방향 + 앞뒤로 기울임
            _e.set(-lean + flinch*-1 - fall, st.yaw, 0, "YXZ"); _q2.setFromEuler(_e); _p.set(u.x + Math.sin(tm*0.8 + st.off)*0.1*idle + Math.sin(st.yaw)*1.4*sb, (u.y || 0) + bob + hy, u.z + Math.cos(st.yaw)*1.4*sb); var rsx = S0*scl*(u.rs || 1); _s.set(rsx, rsx, rsx); root.compose(_p, _q2, _s);
            var sway = Math.sin(tm*0.9 + st.off)*0.12*idle, brt = 1 + Math.sin(tm*1.9 + st.off)*0.018;
            // 다리(2관절 IK): 발이 땅을 딛고 무릎이 접혀요
            var stride = 1.7*w + 0.9*spr, side, hip, kn_, an;
            for(side = 0; side < 2; side++){ var phs = ph + side*Math.PI, sn = Math.sin(phs), cs = Math.cos(phs); hip = side ? hipR : hipL; var lift = 0.95*Math.max(0, cs)*w; tg.set(hip.x + (side ? 0.12 : -0.12) + sway*0.5, hip.y - 4.38 + lift + (side ? 0.0 : 0.0), hip.z + stride*sn + (w < 0.5 ? (side ? 0.15 : -0.1) : 0)); tg.y += 2.6*kn; if(!side){ tg.z -= 2.2*kn; tg.y += 0.8*kn; } else tg.z += 0.8*kn; tg.z += (side ? 1.4 : -1.6)*sb; ik2(hip, tg, 2.4, 2.1, poleL, el, hd); if(side){ kR.copy(el); anR.copy(hd); } else { kL.copy(el); anL.copy(hd); } }
                        put(P.pel, i, 0 + sway*0.4, 5.55 - 0.0, 0.0, QI, 1.55, 0.95, 1.05); seg(P.tL, i, kL, hipL, 0.68); seg(P.tR, i, kR, hipR, 0.68); seg(P.sL, i, anL, kL, 0.55); seg(P.sR, i, anR, kR, 0.55);
            put(P.bL, i, anL.x, anL.y - 0.35, anL.z + 0.4, _q.setFromEuler(_e.set(-0.2*Math.max(0, Math.cos(ph))*w, 0, 0)), 0.95, 0.95, 1.8); put(P.bR, i, anR.x, anR.y - 0.35, anR.z + 0.4, _q.setFromEuler(_e.set(-0.2*Math.max(0, Math.cos(ph + Math.PI))*w, 0, 0)), 0.95, 0.95, 1.8);
            // 몸통 (걸을 때 어깨가 엇갈려 비틀림)
            var tw = s1*0.16*w, trs = Math.sin(tw); _e.set(0.04*st.aim, tw, 0); _q.setFromEuler(_e); put(P.torso, i, 0, 7.15, 0, _q, 1.7, 1.75*brt, 1.05); put(P.sho, i, 0, 8.1, 0.02, _q, 2.25, 0.72, 1.0); put(P.pack, i, 0, 7.4, -1.3, _q, 2.0, 2.2, 0.95); put(P.pkL, i, -0.85, 6.35, 0.95, _q, 0.95, 0.95, 0.4); put(P.pkR, i, 0.85, 6.35, 0.95, _q, 0.95, 0.95, 0.4); put(P.stL, i, -0.95, 7.7, 0.98, _q, 0.3, 2.6, 0.18); put(P.stR, i, 0.95, 7.7, 0.98, _q, 0.3, 2.6, 0.18);
            // 머리 + 철모
            _e.set(0.08*w - 0.06*st.aim + 0.25*rl + 0.2*pn + 0.1*snp + 0.12*mgp, Math.sin(tm*0.6 + st.off)*0.28*idle*(1 - snp - mgp) + 1.6*sg, 0.22*snp); _q.setFromEuler(_e);
            var isN = u.side === "nk"; put(isN ? P.headN : P.head, i, 0, 9.85 + 0.03*s1*w, 0.12, _q, 0.98, 1.08, 1.0); hide(isN ? P.head : P.headN, i);
            if(isN){ put(P.helm, i, 0, 10.35 + 0.03*s1*w, 0.1, _q, 1.22, 0.55, 1.28); put(P.rim, i, 0, 10.15, 0.8, _q, 1.15, 0.12, 1.2); put(P.star, i, 0, 10.55, 1.38, _q, 0.4, 0.4, 0.14); } else { put(P.helm, i, 0, 10.05 + 0.03*s1*w, 0.1, _q, 1.28, 0.95, 1.3); put(P.rim, i, 0, 10.0, 0.1, _q, 1.4, 0.18, 1.45); hide(P.star, i); }
            // 팔: 총 들고 걷기(휴대) ↔ 조준(견착) ↔ 만세
            var a = st.aim, ch = st.cheer, rb = u.fireT > 0.38 ? (u.fireT - 0.38)*-3.0 : 0, rcoil = u.fireT > 0.36 && u.fireT < 0.5 ? 0.5 : 0;
            rh.set(0.75*(1 - a) + 1.05*a, 6.9*(1 - a) + 8.05*a, 1.55*(1 - a) + 1.75*a - rcoil*a); lh.set(-0.55*(1 - a) - 0.1*a, 7.6*(1 - a) + 8.4*a, 2.7*(1 - a) + 3.1*a - rcoil*0.5*a);
            rh.y += Math.sin(ph*2)*0.08*w; lh.y += Math.sin(ph*2 + 1)*0.08*w; rh.x += Math.sin(tm*1.3 + st.off)*0.03*idle;
            if(spr > 0.02){ var sr = spr*(1 - a); rh.x += (0.2 - rh.x)*sr*0.6; rh.y += (7.3 - rh.y)*sr + Math.sin(ph)*0.55*spr; rh.z += (1.0 - rh.z)*sr; lh.y += (7.9 - lh.y)*sr - Math.sin(ph)*0.55*spr; lh.z += (2.4 - lh.z)*sr; }
            if(sb > 0.02){ rh.x += (0.9 - rh.x)*sb; rh.y += (7.6 - rh.y)*sb; rh.z += (3.8 - rh.z)*sb; lh.x += (-0.1 - lh.x)*sb; lh.y += (7.9 - lh.y)*sb; lh.z += (6.4 - lh.z)*sb; }
            if(rl > 0.02){ var ro = Math.sin(tm*10)*0.3; rh.x += (0.5 - rh.x)*rl; rh.y += (7.1 - rh.y)*rl; rh.z += (1.9 + ro - rh.z)*rl; lh.x += (-0.2 - lh.x)*rl; lh.y += (6.7 - lh.y)*rl; lh.z += (2.4 - lh.z)*rl; }
            if(pt > 0.02){ rh.x += (1.3 - rh.x)*pt; rh.y += (9.4 - rh.y)*pt; rh.z += (4.8 - rh.z)*pt; }
            if(sg > 0.02){ rh.x += (2.0 + Math.sin(tm*9)*1.0 - rh.x)*sg; rh.y += (11.4 - rh.y)*sg; rh.z += (-0.5 + Math.cos(tm*9)*0.8 - rh.z)*sg; }
            if(mgp > 0.02){ rh.x += (0.8 - rh.x)*mgp; rh.y += (5.9 - rh.y)*mgp; rh.z += (3.3 - rh.z)*mgp; lh.x += (-0.8 - lh.x)*mgp; lh.y += (5.9 - lh.y)*mgp; lh.z += (3.3 - lh.z)*mgp; }
            if(snp > 0.02){ rh.x += (0.6 - rh.x)*snp; rh.y += (8.9 - rh.y)*snp; rh.z += (1.9 - rh.z)*snp; lh.x += (-0.1 - lh.x)*snp; lh.y += (8.8 - lh.y)*snp; lh.z += (4.7 - lh.z)*snp; }
            if(pn > 0.02){ rh.x += (-1.2 - rh.x)*pn; rh.y += (8.1 - rh.y)*pn; rh.z += (1.2 - rh.z)*pn; lh.y += (6.4 - lh.y)*pn*0.6; }
            if(ch > 0.02){ rh.set(rh.x*(1 - ch) + 1.7*ch, rh.y*(1 - ch) + 12.0*ch, rh.z*(1 - ch) + 0.3*ch); lh.set(lh.x*(1 - ch) - 1.7*ch, lh.y*(1 - ch) + 12.0*ch, lh.z*(1 - ch) + 0.3*ch); }
            if(u.hit > 0){ rh.y += flinch*1.2; lh.y += flinch*1.2; }
            rd.copy(lh).sub(rh); var rlen = rd.length() || 1; rd.multiplyScalar(1/rlen); var free = Math.min(1, sg + pt + pn); if(free > 0.01){ rd.x *= (1 - free); rd.y = rd.y*(1 - free) - 0.25*free; rd.z = rd.z*(1 - free) + 0.97*free; var rl2 = Math.sqrt(rd.x*rd.x + rd.y*rd.y + rd.z*rd.z) || 1; rd.multiplyScalar(1/rl2); }
            var bx = rh.x*(1 - free) + (lh.x - rd.x*2.2)*free, by = rh.y*(1 - free) + (lh.y - rd.y*2.2)*free, bz = rh.z*(1 - free) + (lh.z - rd.z*2.2)*free;
            poleA.set(0.9, -1, -0.2); ik2(shR, rh, 1.7, 1.6, poleA, eRv, hRv); poleA.set(-0.9, -1, -0.2); ik2(shL, lh, 1.7, 1.6, poleA, eLv, hLv);
            seg(P.uR, i, eRv, shR, 0.5); seg(P.fR, i, hRv, eRv, 0.42); seg(P.uL, i, eLv, shL, 0.5); seg(P.fL, i, hLv, eLv, 0.42);
            put(P.hR, i, hRv.x, hRv.y, hRv.z, QI, 0.46, 0.46, 0.46); put(P.hL, i, hLv.x, hLv.y, hLv.z, QI, 0.46, 0.46, 0.46);
            // 소총: 두 손 사이 방향
            if(ch > 0.5 || act === "mg"){ hide(P.stock, i); hide(P.barrel, i); hide(P.flash, i); hide(P.bayo, i); hide(P.scope, i); }
            else { _q.setFromUnitVectors(_Z, rd); var cxp = bx + rd.x*1.2, cyp = by + rd.y*1.2, czp = bz + rd.z*1.2; put(P.stock, i, cxp, cyp, czp, _q, 0.34, 0.5, 2.5); var snL = u.role === "sniper" ? 1 : 0; put(P.barrel, i, bx + rd.x*(3.4 + 1.3*snL), by + rd.y*(3.4 + 1.3*snL), bz + rd.z*(3.4 + 1.3*snL), _q, 0.2, 0.22, 2.3 + 2.4*snL); if(act === "snipe") put(P.scope, i, bx + rd.x*2.3, by + rd.y*2.3 + 0.5, bz + rd.z*2.3, _q, 0.3, 0.3, 1.5); else hide(P.scope, i);
              if(spr > 0.3 || sb > 0.1) put(P.bayo, i, bx + rd.x*5.8, by + rd.y*5.8, bz + rd.z*5.8, _q, 0.14, 0.14, 2.2); else hide(P.bayo, i);
              if(u.fireT > 0.4){ var fs = 0.5 + (u.fireT - 0.4)*4; put(P.flash, i, bx + rd.x*(4.9 + 2.6*snL), by + rd.y*(4.9 + 2.6*snL), bz + rd.z*(4.9 + 2.6*snL), QI, fs, fs, fs*1.6); } else hide(P.flash, i); }
            // 그림자
            _p.set(u.x, (u.y || 0) + 0.2, u.z); _e.set(-Math.PI/2, 0, 0); _q.setFromEuler(_e); _s.set(3.3*scl, 2.6*scl, 1); _m.compose(_p, _q, _s); shadow.setMatrixAt(i, _m);
          }
          for(var q = 0; q < PK.length; q++) P[PK[q]].instanceMatrix.needsUpdate = true; shadow.instanceMatrix.needsUpdate = true;
          lod.instanceMatrix.needsUpdate = true; if(lodColDirty && lod.instanceColor) lod.instanceColor.needsUpdate = true;
          var used = N - freeSlots.length; if(used > N*0.93) NEAR = Math.max(55, NEAR*0.94); else if(used < N*0.6) NEAR = Math.min(185, NEAR*1.02); near2 = NEAR*NEAR;
        };
        API.parts = P; return API;
      } };
    })();

    // ---------- 3D 루샤 (보라 한복 + 갓 쓴 토끼): 함곡이처럼 걷고, 숨 쉬고, 웃고, 주문을 외워요 ----------
    (function buildTBLucia(){
      var V3 = THREE.Vector3;
      function ct(w, h, fn){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
      function M(col, o){ o = o || {}; var m = new THREE.MeshStandardMaterial({ color:col, roughness:o.r !== undefined ? o.r : 0.6, metalness:o.m || 0, emissive:o.e !== undefined ? o.e : new THREE.Color(col).multiplyScalar(0.2), side:o.side || THREE.FrontSide, fog:false }); if(o.map){ m.map = o.map; } if(o.tr){ m.transparent = true; m.opacity = o.op; } return m; }
      var SPH = new THREE.SphereGeometry(1, 28, 20), CYL = new THREE.CylinderGeometry(1, 1, 1, 28, 1);
      function ell(p, m, rx, ry, rz, x, y, z){ var o = new THREE.Mesh(SPH, m); o.scale.set(rx, ry, rz); o.position.set(x, y, z); p.add(o); return o; }
      function grp(p, x, y, z){ var g = new THREE.Group(); g.position.set(x, y, z); p.add(g); return g; }
      function ik2(sh, tg, l1, l2, pole, outE, outH){ var dx = tg.x - sh.x, dy = tg.y - sh.y, dz = tg.z - sh.z, d0 = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-4, d = Math.min(d0, (l1 + l2)*0.995), nx = dx/d0, ny = dy/d0, nz = dz/d0, a = (l1*l1 - l2*l2 + d*d)/(2*d), h = Math.sqrt(Math.max(0, l1*l1 - a*a)), dp = pole.x*nx + pole.y*ny + pole.z*nz, px = pole.x - nx*dp, py = pole.y - ny*dp, pz = pole.z - nz*dp, pl = Math.sqrt(px*px + py*py + pz*pz) || 1; outE.set(sh.x + nx*a + px/pl*h, sh.y + ny*a + py/pl*h, sh.z + nz*a + pz/pl*h); outH.set(sh.x + nx*d, sh.y + ny*d, sh.z + nz*d); }
      var _Y = new V3(0, 1, 0), _d = new V3(), _q = new THREE.Quaternion(), _mid = new V3();
      function segMesh(mesh, a, b, r){ _d.subVectors(b, a); var len = _d.length() || 0.01; _d.multiplyScalar(1/len); _q.setFromUnitVectors(_Y, _d); mesh.position.set((a.x + b.x)/2, (a.y + b.y)/2, (a.z + b.z)/2); mesh.quaternion.copy(_q); mesh.scale.set(r, len, r); }
      window.TBLucia = { create:function(G){
        var root = new THREE.Group(); root.visible = false; G.add(root); var inner = grp(root, 0, 0, 0), B = grp(inner, 0, 0, 0);
        var PUR = M(0x5a2a86, { r:0.55, map:ct(256, 256, function(g, w, h){ var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#6a34a0"); gr.addColorStop(1, "#4a2072"); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(255,200,255,0.12)"; g.lineWidth = 3; for(var i = 0; i < 18; i++){ g.beginPath(); g.arc(Math.random()*w, Math.random()*h, 8 + Math.random()*16, 0, 7); g.stroke(); } g.strokeStyle = "rgba(20,0,40,0.35)"; g.lineWidth = 4; for(i = 0; i < 6; i++){ g.beginPath(); g.moveTo(0, i*50); g.quadraticCurveTo(w/2, i*50 + 30, w, i*50); g.stroke(); } }), e:0x2a1244 });
        var PURD = M(0x3d1a5c, { r:0.6 }), WH = M(0xf6f4f2, { r:0.5, e:0x6a6866 }), PK = M(0xf0a8bc, { r:0.6 }), BLK = M(0x14101a, { r:0.4, e:0x08060c }), GOLD = M(0xe3bd47, { r:0.3, m:0.35, e:0x3a2d0a });
        // 발 (치마 밑으로 번갈아 보여요)
        var footL = ell(B, BLK, 1.25, 0.65, 1.9, -1.3, 0.65, 0.4), footR = ell(B, BLK, 1.25, 0.65, 1.9, 1.3, 0.65, 0.4);
        // 치마 (걸을 때 흔들려요)
        var robeG = grp(B, 0, 0, 0), skirt = new THREE.Mesh(CYL, PUR); skirt.scale.set(3.9, 5.0, 3.5); skirt.position.set(0, 3.3, 0); skirt.geometry = new THREE.CylinderGeometry(2.7, 4.1, 1, 32, 1, true); skirt.material = M(0x5a2a86, { r:0.55, map:PUR.map, side:THREE.DoubleSide, e:0x2a1244 }); skirt.scale.set(1, 5.0, 0.9); robeG.add(skirt);
        var hem = new THREE.Mesh(new THREE.CylinderGeometry(4.12, 4.2, 0.55, 32, 1, true), BLK); hem.position.set(0, 1.05, 0); hem.scale.set(1, 1, 0.9); hem.material.side = THREE.DoubleSide; robeG.add(hem);
        var torso = ell(robeG, PUR, 2.9, 2.6, 2.2, 0, 6.7, 0);
        var ribbon = ell(robeG, BLK, 0.45, 2.0, 0.3, 0, 6.8, 2.05);
        var roundel = new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), new THREE.MeshStandardMaterial({ map:ct(128, 128, function(g, w, h){ g.fillStyle = "#e3bd47"; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = "#a97c1e"; g.lineWidth = 6; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = "#b8860b"; g.font = "bold 56px serif"; g.textAlign = "center"; g.fillText("龍", 64, 84); }), emissive:0x2a2008, roughness:0.4, fog:false })); roundel.position.set(0, 4.6, 1.95); robeG.add(roundel);
        // 머리
        var headG = grp(B, 0, 10.4, 0.1); var head = ell(headG, WH, 3.45, 3.0, 2.8, 0, 0, 0);
        ell(headG, M(0xf2b8c4, { r:0.8 }), 0.9, 0.55, 0.3, -2.0, -0.55, 2.3); ell(headG, M(0xf2b8c4, { r:0.8 }), 0.9, 0.55, 0.3, 2.0, -0.55, 2.3);
        var eyes = []; [-1, 1].forEach(function(s){ var eg = grp(headG, s*1.35, 0.35, 2.4); ell(eg, M(0xf8f4f4, { r:0.3 }), 0.85, 0.7, 0.35, 0, 0, 0); ell(eg, M(0x6b1e1e, { r:0.3, e:0x200404 }), 0.62, 0.55, 0.3, 0, -0.03, 0.18); ell(eg, M(0x0c0404, {}), 0.34, 0.4, 0.3, 0, -0.03, 0.3); ell(eg, new THREE.MeshBasicMaterial({ color:0xffffff }), 0.16, 0.2, 0.1, -0.2, 0.2, 0.46); var brow = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.32, 0.4), BLK); brow.position.set(-s*0.15, 0.92, 0.2); brow.rotation.z = s*0.42; eg.add(brow); eyes.push(eg); });
        ell(headG, PK, 0.45, 0.32, 0.4, 0, -0.45, 2.75); var mouth = ell(headG, M(0x8a1c2e, { r:0.4 }), 0.95, 0.3, 0.3, 0, -1.2, 2.5); [-0.38, 0.38].forEach(function(x){ var f = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 8), M(0xffffff, {})); f.rotation.x = Math.PI; f.position.set(x, -1.42, 2.62); headG.add(f); });
        // 귀
        var earL = grp(headG, -1.9, 2.0, -0.4), earR = grp(headG, 1.9, 2.0, -0.4); [earL, earR].forEach(function(E, i){ ell(E, WH, 1.05, 3.7, 0.5, 0, 3.2, 0); ell(E, PK, 0.72, 3.1, 0.2, 0, 3.2, 0.34); E.rotation.z = i ? -0.18 : 0.18; });
        // 갓 (넓은 챙 + 원통 관)
        var hat = grp(headG, 0, 2.55, 0.1), brimM = M(0x15111c, { r:0.5, e:0x0a0810, side:THREE.DoubleSide }); var brim = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.0, 0.2, 40), brimM); brim.scale.set(1, 1, 0.82); hat.add(brim); var crown = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.35, 3.0, 28), M(0x1c1722, { r:0.55, e:0x0c0a12 })); crown.position.y = 1.55; hat.add(crown); var band = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 0.4, 28), M(0x3a2a52, { r:0.4 })); band.position.y = 0.3; hat.add(band);
        [-1, 1].forEach(function(s){ var st = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 6), BLK); st.position.set(s*3.2, -1.6, 1.4); st.rotation.z = s*0.12; headG.add(st); });
        // 팔 (소매) — IK
        var shL = new V3(-2.7, 7.9, 0.2), shR = new V3(2.7, 7.9, 0.2), sleeve = { L:[new THREE.Mesh(CYL, PUR), new THREE.Mesh(CYL, PUR)], R:[new THREE.Mesh(CYL, PUR), new THREE.Mesh(CYL, PUR)] }, handL = ell(B, WH, 0.95, 0.95, 0.95, 0, 0, 0), handR = ell(B, WH, 0.95, 0.95, 0.95, 0, 0, 0);
        [sleeve.L, sleeve.R].forEach(function(a){ a.forEach(function(m, i){ m.geometry = new THREE.CylinderGeometry(i ? 0.95 : 1.15, i ? 0.8 : 1.0, 1, 18); B.add(m); }); });
        // 오라
        var ac = document.createElement("canvas"); ac.width = ac.height = 128; var g = ac.getContext("2d"), gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, "rgba(170,70,255,0.85)"); gr.addColorStop(0.5, "rgba(110,30,190,0.4)"); gr.addColorStop(1, "rgba(60,0,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
        var aura = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(ac), transparent:true, depthWrite:false, fog:false, opacity:0.6 })); aura.scale.set(26, 26, 1); aura.center.set(0.5, 0.2); root.add(aura);
        var wisps = []; for(var wi = 0; wi < 7; wi++){ var ws = new THREE.Sprite(new THREE.SpriteMaterial({ map:aura.material.map, transparent:true, depthWrite:false, fog:false, opacity:0.5, color:0x9a4cff })); ws.scale.set(5, 5, 1); root.add(ws); wisps.push({ s:ws, a:Math.random()*6.28, r:3.5 + Math.random()*2.5, h:Math.random() }); }
        var K = 0.95, st = { px:0, pz:0, yaw:Math.PI, ph:0, walk:0, cast:0, init:false }, tg = new V3(), eL = new V3(), eR = new V3(), hLv = new V3(), hRv = new V3(), poleR = new V3(0.8, -1, -0.4), poleL = new V3(-0.8, -1, -0.4);
        var API = { root:root };
        API.setVisible = function(v){ root.visible = v; };
        // 2P 루샤: 보라 옷을 파란 계열로 물들여 적 루샤와 구분해요 (흰 얼굴/검은 갓은 그대로)
        API.tint = function(hex, amt){ var c = new THREE.Color(hex); root.traverse(function(n){ if(n.isSprite || !n.material || !n.material.color) return; var m = n.material; if(!m.userData.c0) m.userData.c0 = m.color.clone(); var l = m.userData.c0.r*0.3 + m.userData.c0.g*0.59 + m.userData.c0.b*0.11; if(l > 0.75 || l < 0.12) return; m.color.copy(m.userData.c0).lerp(c, amt); if(m.emissive) m.emissive.copy(m.color).multiplyScalar(0.2); }); aura.material.color.set(0x66c0ff); wisps.forEach(function(w){ w.s.material.color.set(0x66c8ff); }); };
        API.update = function(dt, tm, x, z, o){
          if(!root.visible) return; o = o || {}; if(!st.init){ st.px = x; st.pz = z; st.init = true; }
          var dx = x - st.px, dz = z - st.pz, sp = dt > 0 ? Math.sqrt(dx*dx + dz*dz)/dt : 0; if(sp > 120) sp = 0; st.px = x; st.pz = z;
          var wT = sp > 1.8 ? 1 : 0; st.walk += (wT - st.walk)*Math.min(1, dt*8); st.ph += (Math.min(sp, 12)*0.9 + (st.walk > 0.3 ? 0.5 : 0))*dt*1.4; var w = st.walk, idle = 1 - w, s1 = Math.sin(st.ph), c1 = Math.cos(st.ph);
          var castT = o.cast || 0; st.cast += (castT - st.cast)*Math.min(1, dt*9); var ca = st.cast;
          var ty = o.face !== undefined ? o.face : Math.PI; if(sp > 1.8) ty = Math.atan2(dx, dz) ; var da = ty - st.yaw; while(da > Math.PI) da -= 2*Math.PI; while(da < -Math.PI) da += 2*Math.PI; st.yaw += da*Math.min(1, dt*(sp > 1.8 ? 9 : 5));
          var die = o.die === undefined ? -1 : o.die; var scl = die >= 0 ? Math.max(0, 1 - die/1.3) : 1;
          root.position.set(x, 0, z); inner.rotation.y = st.yaw + (die >= 0 ? die*7 : 0); inner.scale.setScalar(K*scl);
          var bob = Math.abs(s1)*0.45*w + Math.sin(tm*1.8)*0.12*idle + Math.sin(tm*14)*0.05*(o.laugh ? 1 : 0) + ca*0.8; B.position.y = bob; B.rotation.x = 0.06*w; B.rotation.z = Math.sin(st.ph)*0.04*w;
          // 치마 흔들림 + 발
          robeG.rotation.z = Math.sin(st.ph + 0.5)*0.07*w; robeG.rotation.x = Math.cos(st.ph)*0.05*w; skirt.scale.x = 1 + Math.abs(s1)*0.04*w;
          var swing = 1.8*w; footL.position.set(-1.3, 0.65 + Math.max(0, Math.cos(st.ph))*0.7*w, 0.4 + swing*Math.sin(st.ph)); footR.position.set(1.3, 0.65 + Math.max(0, -Math.cos(st.ph))*0.7*w, 0.4 - swing*Math.sin(st.ph));
          // 머리/귀/갓
          headG.rotation.x = 0.05*w + Math.sin(tm*1.8)*0.02; headG.rotation.z = Math.sin(st.ph)*0.04*w + Math.sin(tm*0.9)*0.02*idle; headG.rotation.y = Math.sin(tm*0.7)*0.18*idle; earL.rotation.x = -0.12*w - Math.sin(st.ph + 1)*0.1*w + Math.sin(tm*1.4)*0.04; earR.rotation.x = -0.12*w - Math.sin(st.ph + 1.6)*0.1*w + Math.sin(tm*1.2)*0.04; hat.rotation.z = Math.sin(st.ph)*0.03*w;
          eyes.forEach(function(e){ e.scale.y = (Math.sin(tm*0.9) > 0.985 ? 0.15 : 1); });
          mouth.scale.y = 0.3 + (o.laugh ? Math.abs(Math.sin(tm*14))*0.35 : 0) + ca*0.25;
          // 팔: 평소엔 한 손을 입 가까이(낄낄), 걸을 땐 양팔 흔들기, 주문 땐 양손 위로
          var rT = new V3(); rT.set(1.1*(1 - w) + 3.2*w, 9.0*(1 - w) + 5.4*w, 2.8*(1 - w) + (1.2*Math.sin(st.ph))*w);
          var lT = new V3(); lT.set(-3.3, 5.2 + Math.max(0, Math.cos(st.ph))*0.4*w, 0.8 - 1.3*Math.sin(st.ph)*w + 0.0);
          if(ca > 0.02){ rT.set(rT.x*(1 - ca) + 2.5*ca, rT.y*(1 - ca) + 14.3*ca, rT.z*(1 - ca) + 1.4*ca); lT.set(lT.x*(1 - ca) - 2.5*ca, lT.y*(1 - ca) + 14.3*ca, lT.z*(1 - ca) + 1.4*ca); }
          rT.y += Math.sin(tm*14)*0.12*(o.laugh ? 1 : 0); shR.set(2.7, 7.9 + bob*0.0, 0.2); shL.set(-2.7, 7.9, 0.2);
          ik2(shR, rT, 2.5, 2.3, poleR, eR, hRv); ik2(shL, lT, 2.5, 2.3, poleL, eL, hLv);
          segMesh(sleeve.R[0], eR, shR, 1.2); segMesh(sleeve.R[1], hRv, eR, 0.98); segMesh(sleeve.L[0], eL, shL, 1.2); segMesh(sleeve.L[1], hLv, eL, 0.98); handR.position.copy(hRv); handL.position.copy(hLv);
          // 오라
          var pulse = 0.55 + 0.2*Math.sin(tm*3) + ca*0.3; aura.material.opacity = Math.min(1, pulse)*scl; aura.position.set(0, 0.5, -0.5); aura.scale.set(26*(1 + ca*0.25), 26*(1 + ca*0.25), 1);
          wisps.forEach(function(wv){ wv.a += dt*1.2; wv.h = (wv.h + dt*0.22) % 1; wv.s.position.set(Math.cos(wv.a)*wv.r, 1 + wv.h*14, Math.sin(wv.a)*wv.r); wv.s.material.opacity = Math.sin(wv.h*Math.PI)*0.55*scl*(1 + ca); var q = 3 + wv.h*3; wv.s.scale.set(q, q, 1); });
        };
        return API;
      } };
    })();
