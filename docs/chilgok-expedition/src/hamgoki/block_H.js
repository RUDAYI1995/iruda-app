    // ================= 함곡이 3D 캐릭터 (참고: source-images/characters/hamgoki) =================
    // 그림 조각 대신 입체 모델로 걷고, 뛰고, 점프하고, 헤엄쳐요. 도형(타원체)만으로 만들어서 따로 받는 파일이 없어요.
    // 좌표는 참고 사진 기준 픽셀 단위(발바닥 0, 위쪽 +, 앞 +z)로 만들고 마지막에 게임 크기로 줄여요 (K = 10.5/960).
    (function buildHamgoki(){
      var K = 10.5/960, M = null, built = false, mats = [], clipSet = false;
      function sm(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      function mat(col, o){ o = o || {}; var m = new THREE.MeshStandardMaterial({ color:col, roughness:o.r !== undefined ? o.r : 0.55, metalness:o.m || 0, emissive:o.e !== undefined ? o.e : new THREE.Color(col).multiplyScalar(0.16), side:o.side || THREE.FrontSide, vertexColors:!!o.vc, flatShading:false }); mats.push(m); return m; }
      var SPH = new THREE.SphereGeometry(1, 40, 28);
      function ell(rx, ry, rz, m, x, y, z, parent){ var s = new THREE.Mesh(SPH, m); s.scale.set(rx, ry, rz); s.position.set(x || 0, y || 0, z || 0); s.castShadow = true; if(parent) parent.add(s); return s; }
      function grp(parent, x, y, z){ var g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); if(parent) parent.add(g); return g; }
      function build(){
        var WH = mat(0xf6f4f2, { e:0x4a4846 }), WH2 = mat(0xfaf8f7, { e:0x4a4846 }), PK = mat(0xeeb3bd, { r:0.7 }), PKD = mat(0xa2505f), RED = mat(0xe3213f, { r:0.35 }), REDD = mat(0xb30f28, { r:0.4 }), GOLD = mat(0xe3bd47, { r:0.3, m:0.35, e:0x2a2108 }),
            EYEW = mat(0xf7f3f2, { r:0.3 }), IRIS = mat(0x4d1c0e, { r:0.25, e:0x0a0302 }), PUP = mat(0x0c0404, { r:0.2, e:0x000000 }), SPEC = new THREE.MeshBasicMaterial({ color:0xffffff }), CHEEK = mat(0xf2b8c4, { r:0.8 }), BLK = mat(0x1a0d0d, { r:0.5 }), MOUTH = mat(0xdc2a52, { r:0.3 }), MOUTH2 = mat(0xf59bb0, { r:0.4 });
        var root = new THREE.Group(); root.name = "hamgoki3d"; root.scale.setScalar(K); var o = {};
        o.root = root;
        // 몸: 엉덩이를 축으로 기울고 통통 튀어요
        o.lean = grp(root, 0, 115, 0); o.body = grp(o.lean, 0, -115, 0);
        ell(98, 135, 84, WH, 0, 220, 0, o.body); ell(72, 104, 24, WH2, 0, 205, 66, o.body);                    // 몸통 + 배
        // 다리/발 (엉덩이 축)
        o.legL = grp(root, -60, 115, 0); o.legR = grp(root, 60, 115, 0);
        [o.legL, o.legR].forEach(function(L){ ell(38, 50, 38, WH, 0, -38, 0, L); ell(52, 24, 74, WH, 0, -88, 24, L); ell(50, 5, 68, PK, 0, -108, 24, L); });
        // 머리
        o.head = grp(o.body, 0, 360, 0);
        ell(205, 175, 165, WH, 0, 160, 0, o.head);
        ell(96, 54, 52, WH2, 0, 62, 112, o.head);                                                              // 주둥이
        var eyes = []; [-1, 1].forEach(function(s){
          var e = grp(o.head, s*90, 156, 130); eyes.push(e);
          ell(50, 64, 22, EYEW, 0, 0, 8, e); ell(42, 57, 12, IRIS, 1, -2, 22, e); ell(35, 49, 8, PUP, 1, -3, 28, e);
          ell(11, 14, 5, SPEC, -11, 20, 34, e); ell(5, 6, 3, SPEC, 15, -20, 33, e);
          var br = new THREE.Mesh(new THREE.TorusGeometry(34, 4, 8, 20, Math.PI*0.62), PKD); br.position.set(s*-2, 108, -4); br.rotation.z = Math.PI*0.5 - Math.PI*0.31 + s*0.05; br.scale.set(1, 0.4, 1); e.add(br);   // 눈썹
          ell(40, 27, 14, CHEEK, s*48, -62, -22, e);                                                          // 볼
        });
        o.eyes = eyes;
        ell(18, 12, 12, PKD, 0, 100, 170, o.head);                                                              // 코
        ell(24, 15, 8, MOUTH, -4, 36, 168, o.head); ell(15, 8, 6, MOUTH2, -4, 33, 172, o.head);                // 입
        [-1, 1].forEach(function(s){ var w = new THREE.Mesh(new THREE.TorusGeometry(13, 3, 6, 14, Math.PI*0.85), BLK); w.position.set(s*13 - 4, 60, 171); w.rotation.z = s > 0 ? -0.15 : Math.PI + 0.15 - Math.PI*0.85 + 0.3; w.rotation.z = (s > 0 ? -0.3 : Math.PI + 0.3 - Math.PI*0.85); o.head.add(w); });     // 콧수염
        // 귀
        o.earL = grp(o.head, -95, 300, -15); o.earR = grp(o.head, 95, 300, -15);
        [o.earL, o.earR].forEach(function(E, i){ ell(56, 158, 22, WH, 0, 140, 0, E); ell(40, 134, 9, PK, 0, 138, 19, E); E.rotation.z = i ? -0.2 : 0.12; });
        // 리본 (한쪽 귀 아래)
        o.bow = grp(o.head, -88, 304, 44); o.bow.rotation.z = -0.12; o.bow.rotation.y = 0.15;
        ell(66, 40, 32, RED, -58, 4, 0, o.bow).rotation.z = 0.25; ell(66, 40, 32, RED, 58, 4, 0, o.bow).rotation.z = -0.25; ell(30, 34, 32, REDD, 0, 0, 8, o.bow);
        // 금색 하트 목걸이
        var hg = grp(o.body, 0, 352, 96); ell(24, 24, 18, GOLD, -15, 6, 0, hg); ell(24, 24, 18, GOLD, 15, 6, 0, hg);
        var hc = new THREE.Mesh(new THREE.ConeGeometry(36, 44, 20), GOLD); hc.rotation.z = Math.PI; hc.position.set(0, -12, 0); hc.scale.z = 0.5; hg.add(hc); hg.rotation.x = -0.1;
        // 팔
        o.armL = grp(o.body, -150, 330, 0); o.armR = grp(o.body, 150, 330, 0);
        [o.armL, o.armR].forEach(function(A, i){ ell(44, 56, 42, WH, 0, -34, 0, A); ell(48, 46, 46, WH, i ? 3 : -3, -108, 10, A); A.rotation.x = -0.12; });
        // 망토 (목에서 걸쳐 뒤로 퍼지는 모양) + 동그란 꼬리
        o.cape = grp(o.body, 0, 345, 0);
        (function(){
          var NT = 10, NA = 44, pos = [], col = [], idx = [], i, j;
          for(i = 0; i <= NT; i++){ var t = i/NT, rx = 82 + 124*Math.pow(t, 0.9), rz = 62 + 70*Math.pow(t, 0.9), zc = -22, y = -265*t;
            for(j = 0; j <= NA; j++){ var a = (-125 + 250*j/NA)*Math.PI/180, hem = i === NT ? Math.sin(a*6.5)*8 : 0, wv = Math.sin(a*3 + t*2)*5*t;
              pos.push(rx*Math.sin(a), y + hem, zc - rz*Math.cos(a) + wv); var sh = 0.78 + 0.22*Math.cos(a*0.8)*(0.7 + 0.3*t); col.push(0.92*sh, 0.10*sh, 0.20*sh); } }
          for(i = 0; i < NT; i++) for(j = 0; j < NA; j++){ var a0 = i*(NA + 1) + j, b0 = a0 + 1, c0 = a0 + NA + 1, d0 = c0 + 1; idx.push(a0, c0, b0, b0, c0, d0); }
          var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
          var cm = new THREE.Mesh(g, mat(0xffffff, { vc:true, r:0.42, side:THREE.DoubleSide, e:0x2a0508 })); cm.castShadow = true; o.cape.add(cm);
        })();
        ell(50, 44, 34, WH, 0, -196, -140, o.cape);
        o.eyesBlink = 0;
        root.traverse(function(c){ if(c.isMesh){ c.frustumCulled = false; } });
        M = o; built = true;
      }
      function wrap(a){ while(a > Math.PI) a -= 2*Math.PI; while(a < -Math.PI) a += 2*Math.PI; return a; }
      var last = null, idleT = 0, nextBlink = 2.5, blinkT = -1, earTw = 0, nextTw = 4;
      window.hamgokiUpdate = function(p, dt, t, groundY, runK, swK, swimPh, camYaw){
        var on = (typeof state !== "undefined") && state.charId === "hamgoki";
        if(!on){ if(built){ M.root.visible = false; } return false; }
        if(!built){ build(); scene.add(M.root); }
        var o = M; o.root.visible = true;
        if(window.__swClip && !clipSet){ mats.forEach(function(m){ m.clippingPlanes = [window.__swClip]; m.needsUpdate = true; }); clipSet = true; }
        // 실제로 움직인 방향으로 몸을 돌려요 (오래 가만히 있으면 카메라를 봐요)
        var vx = 0, vz = 0, sp = 0; if(last && dt > 0){ vx = (p.x - last.x)/dt; vz = (p.z - last.z)/dt; sp = Math.hypot(vx, vz); } last = { x:p.x, z:p.z };
        if(p.y > 0.5 && !p.onGround){ /* 점프 중에도 방향 유지 */ }
        if(o.yaw === undefined){ o.yaw = camYaw + Math.PI; }
        if(sp > 4 && sp < 400){ o.tyaw = Math.atan2(vx, vz); idleT = 0; } else { idleT += dt; if(idleT > 1.6) o.tyaw = camYaw + Math.PI; }
        if(o.tyaw === undefined) o.tyaw = o.yaw;
        o.yaw += wrap(o.tyaw - o.yaw)*Math.min(1, dt*(sp > 4 ? 14 : 5));
        var gait = p.gait || 0, ph = p.phase || 0, air = !p.onGround && p.y > 0.35, fall = air && p.vy < 0;
        var wk = gait*(air ? 0 : 1), run = runK*wk, sw = ph;
        // 숨쉬기/깜빡임/귀 쫑긋
        nextBlink -= dt; if(nextBlink <= 0 && blinkT < 0){ blinkT = 0; nextBlink = 2.2 + Math.random()*3.2; }
        var blink = 0; if(blinkT >= 0){ blinkT += dt; blink = Math.sin(Math.min(1, blinkT/0.16)*Math.PI); if(blinkT > 0.16) blinkT = -1; }
        o.eyes.forEach(function(e){ e.scale.y = 1 - 0.9*blink; });
        nextTw -= dt; if(nextTw <= 0){ earTw = 1; nextTw = 3 + Math.random()*5; } earTw = Math.max(0, earTw - dt*2.4);
        var br = Math.sin(t/620)*0.5 + 0.5, idle = 1 - Math.min(1, gait + swK);
        // 뼈대 움직임
        var legA = Math.sin(sw)*0.78*wk*(1 + 0.4*run), armA = Math.sin(sw)*0.85*wk*(1 + 0.4*run), bob = Math.abs(Math.sin(sw))*15*wk*(1 + 0.5*run);
        var lx = legA, rx_ = -legA, alx = -armA - 0.12 - 0.55*run, arx = armA - 0.12 - 0.55*run, az = 0;
        var leanX = 0.06*wk + 0.2*run, headNod = Math.sin(sw*2)*0.04*wk, earBack = -(0.06 + 0.2*run)*wk - 0.5*(sp > 120 ? 0.2 : 0), capeX = 0.07*wk + 0.3*run + Math.sin(t/500)*0.03*idle;
        if(air){ var up = p.vy > 0; lx = up ? -0.7 : -0.3; rx_ = up ? 0.35 : 0.5; alx = arx = up ? -2.5 : -1.1; az = 0.4; earBack = up ? 0.25 : -0.8; capeX = up ? -0.2 : 0.5; leanX = up ? -0.08 : 0.1; bob = 0; }
        var sqz = (p.squash || 0);
        if(swK > 0.02){
          var s2 = swK, stroke = Math.sin(swimPh*1.0), mv = p.walking ? 1 : 0.35;
          lx = lx*(1 - s2) + Math.sin(swimPh*1.6)*0.4*mv*s2; rx_ = rx_*(1 - s2) - Math.sin(swimPh*1.6)*0.4*mv*s2;
          alx = alx*(1 - s2) + (-1.55 + Math.sin(swimPh)*1.05*mv)*s2; arx = arx*(1 - s2) + (-1.55 - Math.sin(swimPh)*1.05*mv)*s2; az = az*(1 - s2) + 0.35*s2;
          leanX = leanX*(1 - s2) + (0.18 + 0.28*mv)*s2; bob = bob*(1 - s2) + (Math.sin(swimPh*0.5)*10)*s2; capeX = capeX*(1 - s2) + 0.5*s2; earBack = earBack*(1 - s2) - 0.15*s2;
        }
        if(window.hamPose){ var kp = window.hamPose(dt); if(kp){ if(kp.legs !== undefined){ lx = kp.legs; rx_ = kp.legs2 !== undefined ? kp.legs2 : kp.legs; } if(kp.arm !== undefined){ alx = arx = kp.arm; az = kp.az || 0; } if(kp.lean !== undefined) leanX = kp.lean; if(kp.bob !== undefined) bob = kp.bob; if(kp.yaw !== undefined) o.yaw += wrap(kp.yaw - o.yaw)*Math.min(1, dt*14); if(kp.ear !== undefined) earBack = kp.ear; } }
        o.legL.rotation.x = lx; o.legR.rotation.x = rx_; o.legL.position.y = 115 + Math.max(0, -Math.sin(sw))*14*wk; o.legR.position.y = 115 + Math.max(0, Math.sin(sw))*14*wk;
        o.armL.rotation.x = alx; o.armR.rotation.x = arx; o.armL.rotation.z = az; o.armR.rotation.z = -az;
        o.lean.rotation.x = leanX; o.lean.position.y = 115 + bob + br*3*idle; o.lean.scale.set(1 - sqz*0.25 + br*0.008*idle, 1 + sqz*0.5 + br*0.014*idle, 1 - sqz*0.25);
        o.lean.rotation.z = Math.sin(sw)*0.04*wk;
        o.head.rotation.x = headNod - leanX*0.6 + 0.04*swK; o.head.rotation.z = Math.sin(t/1700)*0.02*idle;
        var eb = earBack - (fall ? 0.4 : 0) + Math.sin(sw*2 + 1)*0.12*wk;
        o.earL.rotation.x = eb + Math.sin(t/900)*0.03*idle + earTw*Math.sin(t/55)*0.12; o.earR.rotation.x = eb*0.9 + Math.sin(t/1100 + 1)*0.03*idle;
        o.cape.rotation.x = capeX + (air ? 0 : Math.sin(sw*2)*0.05*wk); o.cape.rotation.z = Math.sin(sw)*0.05*wk;
        o.bow.rotation.z = -0.12 + Math.sin(sw*2)*0.05*wk;
        // 위치: 수영 중에는 몸을 물에 담가요 (클립 평면이 물 아래를 잘라내요)
        var sink = swK*(250*K);
        o.root.position.set(p.x, groundY + p.y - sink, p.z); o.root.rotation.y = o.yaw;
        if(window.dgHitRoot) window.dgHitRoot(o.root, p);
        return true;
      };
    })();
