    // ================= 전투 연출: 총알 · 포탄 · 폭발/연기 · 체력바 · 3D 탱크 =================
    // 총알은 총구에서 날아가 맞으면 불꽃(-40), 빗나가면 뒤로 지나가며 MISS. 탱크는 포탑이 돌고 포탄이 포물선으로 날아가 폭발해요.
    (function buildTBFx(){
      var V3 = THREE.Vector3, Q = THREE.Quaternion, M4 = THREE.Matrix4, CO = THREE.Color;
      var _m = new M4(), _p = new V3(), _q = new Q(), _s = new V3(), _Z = new V3(0, 0, 1), _d = new V3(), _r = new V3(), _qq = new Q();
      function ctex(w, h, fn){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t; }
      function radTex(){ return ctex(64, 64, function(g){ var gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }); }
      function starTex(col){ return ctex(64, 64, function(g){ g.fillStyle = "rgba(0,0,0,0)"; g.clearRect(0, 0, 64, 64); g.fillStyle = col; g.beginPath(); for(var i = 0; i < 10; i++){ var a = -Math.PI/2 + i*Math.PI/5, r = i%2 ? 11 : 27; g.lineTo(32 + Math.cos(a)*r, 34 + Math.sin(a)*r); } g.closePath(); g.fill(); }); }
      function taeTex(){ return ctex(64, 64, function(g){ g.clearRect(0, 0, 64, 64); g.fillStyle = "#f4f1e6"; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.fill(); g.fillStyle = "#c8312e"; g.beginPath(); g.arc(32, 32, 20, Math.PI, 0); g.fill(); g.fillStyle = "#2a4fa0"; g.beginPath(); g.arc(32, 32, 20, 0, Math.PI); g.fill(); g.fillStyle = "#c8312e"; g.beginPath(); g.arc(22, 32, 10, 0, 7); g.fill(); g.fillStyle = "#2a4fa0"; g.beginPath(); g.arc(42, 32, 10, 0, 7); g.fill(); }); }
      function iconTex(k){ return ctex(64, 64, function(g){ g.clearRect(0, 0, 64, 64);
        if(k === 0){ g.strokeStyle = "#ffd34d"; g.lineWidth = 6; g.beginPath(); g.arc(32, 32, 22, 0, 7); g.stroke(); g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 18); g.moveTo(32, 46); g.lineTo(32, 60); g.moveTo(4, 32); g.lineTo(18, 32); g.moveTo(46, 32); g.lineTo(60, 32); g.stroke(); g.fillStyle = "#ff5a3c"; g.beginPath(); g.arc(32, 32, 6, 0, 7); g.fill(); }
        else { g.fillStyle = "#6fdc4a"; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.fill(); g.strokeStyle = "#1c5a14"; g.lineWidth = 3; g.stroke(); g.fillStyle = "#f4f4ea"; g.beginPath(); g.arc(32, 28, 15, 0, 7); g.fill(); g.fillRect(24, 36, 16, 12); g.fillStyle = "#1c5a14"; g.beginPath(); g.arc(26, 28, 4.5, 0, 7); g.arc(38, 28, 4.5, 0, 7); g.fill(); g.fillRect(31, 36, 2, 10); } }); }
      function heartTex(){ return ctex(64, 64, function(g){ g.clearRect(0, 0, 64, 64); g.fillStyle = "#ff2d55"; g.beginPath(); g.moveTo(32, 56); g.bezierCurveTo(2, 34, 6, 6, 24, 8); g.bezierCurveTo(30, 9, 32, 14, 32, 18); g.bezierCurveTo(32, 14, 34, 9, 40, 8); g.bezierCurveTo(58, 6, 62, 34, 32, 56); g.fill(); g.fillStyle = "rgba(255,255,255,0.55)"; g.beginPath(); g.ellipse(20, 20, 6, 4, -0.6, 0, 7); g.fill(); }); }
      function ringTex(){ return ctex(128, 128, function(g){ var gr = g.createRadialGradient(64, 64, 40, 64, 64, 62); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.7, "rgba(255,255,255,0.85)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }); }
      var RT = null, HT = null, GT = null;
      window.TBFx = { create:function(G){
        RT = RT || radTex(); HT = HT || heartTex(); GT = GT || ringTex();
        // ---------- 총알 ----------
        var NB = 260, bGeo = new THREE.BoxGeometry(0.16, 0.16, 1);
        var core = new THREE.InstancedMesh(bGeo, new THREE.MeshBasicMaterial({ color:0xfff4c8, fog:false }), NB), glow = new THREE.InstancedMesh(bGeo, new THREE.MeshBasicMaterial({ color:0xffa028, transparent:true, opacity:0.6, depthWrite:false, blending:THREE.AdditiveBlending, fog:false }), NB);
        core.frustumCulled = glow.frustumCulled = false; core.instanceMatrix.setUsage(THREE.DynamicDrawUsage); glow.instanceMatrix.setUsage(THREE.DynamicDrawUsage); G.add(core); G.add(glow);
        var B = [], i; for(i = 0; i < NB; i++){ B.push({ on:false }); _m.makeScale(0, 0, 0); core.setMatrixAt(i, _m); glow.setMatrixAt(i, _m); }
        // ---------- 파티클(불꽃/먼지/연기/폭발) ----------
        var NP = 220, PA = [];
        for(i = 0; i < NP; i++){ var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:RT, transparent:true, depthWrite:false, fog:false })); sp.visible = false; sp.renderOrder = 30; G.add(sp); PA.push({ s:sp, on:false, t:0, life:1, vx:0, vy:0, vz:0, g:0, s0:1, s1:1, a0:1, add:false }); }
        function part(x, y, z, o){ var k = null, j; for(j = 0; j < NP; j++) if(!PA[j].on){ k = PA[j]; break; } if(!k) return; k.on = true; k.t = 0; k.life = o.life; k.vx = o.vx || 0; k.vy = o.vy || 0; k.vz = o.vz || 0; k.g = o.g || 0; k.s0 = o.s0; k.s1 = o.s1; k.a0 = o.a0 === undefined ? 1 : o.a0; var m = k.s.material; m.color.setHex(o.col); m.blending = o.add ? THREE.AdditiveBlending : THREE.NormalBlending; m.opacity = k.a0; m.needsUpdate = true; k.s.position.set(x, y, z); k.s.scale.set(o.s0, o.s0, 1); k.s.visible = true; }
        function rr(a){ return (Math.random() - 0.5)*a; }
        // 빨간 하트: 사방으로 퍼져 나가요 (토끼의 유혹)
        var HS = []; for(i = 0; i < 70; i++){ var hs = new THREE.Sprite(new THREE.SpriteMaterial({ map:HT, transparent:true, depthTest:false, depthWrite:false, fog:false })); hs.visible = false; hs.renderOrder = 36; G.add(hs); HS.push({ s:hs, on:false, t:0, life:1, vx:0, vy:0, vz:0, sz:3 }); }
        var RG = []; for(i = 0; i < 6; i++){ var rg = new THREE.Sprite(new THREE.SpriteMaterial({ map:GT, color:0xffe2a0, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, fog:false })); rg.visible = false; rg.renderOrder = 31; G.add(rg); RG.push({ s:rg, on:false, t:0, life:0.6, r1:30 }); }
        var API = {};
        API.hearts = function(x, y, z, n, big){ var c = 0, j; for(j = 0; j < HS.length && c < n; j++){ var k = HS[j]; if(k.on) continue; var th = Math.random()*6.283, ph = (Math.random() - 0.3)*1.5, sp = 14 + Math.random()*20; k.on = true; k.t = -Math.random()*0.2; k.life = 1.5 + Math.random()*0.5; k.vx = Math.cos(th)*Math.cos(ph)*sp; k.vz = Math.sin(th)*Math.cos(ph)*sp; k.vy = Math.sin(ph)*sp*0.8 + 6; k.sz = (big ? 5 : 3.2) + Math.random()*2.5; k.s.position.set(x, y, z); k.s.visible = false; c++; } };
        API.ring = function(x, y, z, r1, life){ for(var j = 0; j < RG.length; j++){ var k = RG[j]; if(k.on) continue; k.on = true; k.t = 0; k.life = life || 0.6; k.r1 = r1; k.s.position.set(x, y, z); k.s.visible = true; return; } };
        API.puff = function(x, y, z, kind){
          var n;
          if(kind === "gas"){ for(n = 0; n < 16; n++) part(x + rr(16), y + 1 + Math.random()*4, z + rr(16), { life:3.4 + Math.random()*1.6, vx:rr(2), vy:0.5 + Math.random()*0.9, vz:rr(2), s0:6, s1:17 + Math.random()*6, col:0x6fdc4a, a0:0.5 }); }
          else if(kind === "poison"){ for(n = 0; n < 34; n++) part(x + rr(46), y + 1 + Math.random()*7, z + rr(46), { life:4.2 + Math.random()*1.8, vx:rr(3), vy:0.6 + Math.random()*1.3, vz:rr(3), s0:9, s1:28 + Math.random()*10, col:n % 2 ? 0xa04cf0 : 0x6a2aa8, a0:0.6 }); }
          else if(kind === "poisonS"){ for(n = 0; n < 3; n++) part(x + rr(3), y + 3 + Math.random()*3, z + rr(3), { life:1.5, vx:rr(8), vy:2 + Math.random()*2, vz:rr(8), s0:3, s1:9, col:0xb86cff, a0:0.7 }); }
          else if(kind === "gasS"){ for(n = 0; n < 2; n++) part(x + rr(2), y, z + rr(2), { life:1.6, vx:rr(1.5), vy:1.2 + Math.random(), vz:rr(1.5), s0:1.6, s1:5, col:0x8be05a, a0:0.5 }); }
          else if(kind === "spark"){ for(n = 0; n < 4; n++) part(x, y, z, { life:0.28, vx:rr(16), vy:Math.random()*10, vz:rr(16), g:-30, s0:0.9, s1:0.2, col:0xffd870, add:true }); part(x, y, z, { life:0.12, s0:2.6, s1:1.2, col:0xfff0b0, add:true }); }
          else if(kind === "dust"){ for(n = 0; n < 3; n++) part(x + rr(1), y, z + rr(1), { life:0.7, vx:rr(3), vy:3 + Math.random()*2, vz:rr(3), s0:1.4, s1:4.2, col:0xb9a67a, a0:0.55 }); part(x, y, z, { life:0.1, s0:1.6, s1:0.8, col:0xffe9a0, add:true }); }
          else if(kind === "muzzle"){ part(x, y, z, { life:0.07, s0:3.2, s1:1.6, col:0xffd070, add:true }); part(x, y, z, { life:0.5, vy:1.2, vx:rr(1), vz:rr(1), s0:0.8, s1:2.4, col:0xcfcfcf, a0:0.35 }); }
          else if(kind === "big"){ part(x, y, z, { life:0.12, s0:12, s1:6, col:0xfff0b8, add:true }); for(n = 0; n < 4; n++) part(x + rr(1), y, z + rr(1), { life:1.4, vx:rr(5), vy:2 + Math.random()*2, vz:rr(5), s0:2.4, s1:9, col:0xd0d0d0, a0:0.5 }); }
          else if(kind === "blast"){
            part(x, y + 3, z, { life:0.2, s0:16, s1:56, col:0xfff6c8, add:true }); part(x, y + 5, z, { life:0.6, s0:12, s1:38, col:0xff7a18, add:true, a0:0.95 }); part(x, y + 8, z, { life:0.9, s0:8, s1:26, col:0xff4a10, add:true, a0:0.7 });
            API.ring(x, y + 1.5, z, 46, 0.55);
            for(n = 0; n < 16; n++) part(x + rr(5), y + 2, z + rr(5), { life:0.7 + Math.random()*0.5, vx:rr(70), vy:16 + Math.random()*40, vz:rr(70), g:-70, s0:3.4, s1:0.8, col:n % 3 ? 0xffa030 : 0x3a2c20, add:n % 3 > 0 });
            for(n = 0; n < 12; n++) part(x + rr(10), y + 3 + Math.random()*6, z + rr(10), { life:2.0 + Math.random()*1.2, vx:rr(10), vy:6 + Math.random()*9, vz:rr(10), s0:7, s1:24 + Math.random()*10, col:n < 4 ? 0x24211e : 0x6a655e, a0:0.65 });
            for(n = 0; n < 8; n++) part(x + rr(8), y + 0.6, z + rr(8), { life:1.3, vx:rr(40), vy:3 + Math.random()*4, vz:rr(40), s0:5, s1:14, col:0xa39064, a0:0.55 });
          }
          else if(kind === "boom"){
            part(x, y + 1, z, { life:0.22, s0:6, s1:24, col:0xfff2b0, add:true }); part(x, y + 2, z, { life:0.45, s0:5, s1:17, col:0xff7a18, add:true, a0:0.9 });
            for(n = 0; n < 10; n++) part(x + rr(3), y + 1, z + rr(3), { life:0.5 + Math.random()*0.3, vx:rr(34), vy:10 + Math.random()*22, vz:rr(34), g:-45, s0:2, s1:0.5, col:0xffa030, add:true });
            for(n = 0; n < 9; n++) part(x + rr(4), y + 2 + Math.random()*3, z + rr(4), { life:1.5 + Math.random()*0.9, vx:rr(7), vy:4 + Math.random()*6, vz:rr(7), s0:4, s1:13 + Math.random()*5, col:n < 3 ? 0x2a2622 : 0x6f6a62, a0:0.62 });
            for(n = 0; n < 5; n++) part(x + rr(5), y + 0.5, z + rr(5), { life:1.0, vx:rr(16), vy:2 + Math.random()*3, vz:rr(16), s0:3, s1:8, col:0x9c8860, a0:0.5 });
          }
        };
        // 총알 한 발: hit=true면 목표에 맞고 멈춤(cb), 아니면 옆으로 비껴 뒤로 지나감(cb는 지나갈 때)
        API.bullet = function(from, to, o){
          var k = null, j; for(j = 0; j < NB; j++) if(!B[j].on){ k = B[j]; break; } if(!k) return; o = o || {};
          var ux = to.x - from.x, uz = to.z - from.z, L = Math.sqrt(ux*ux + uz*uz) || 1; ux /= L; uz /= L;
          var sx = from.x + ux*3.0, sy = from.y !== undefined ? from.y : 7.0, sz = from.z + uz*3.0, tx = to.x, ty = o.ty !== undefined ? o.ty : 5.6, tz = to.z;
          if(!o.hit){ var side = (Math.random() < 0.5 ? -1 : 1)*(1.6 + Math.random()*2.6); tx += -uz*side; tz += ux*side; ty += (Math.random() - 0.3)*3; }
          _d.set(tx - sx, ty - sy, tz - sz); var D = _d.length() || 1; _d.multiplyScalar(1/D);
          k.on = true; k.x = sx; k.y = sy; k.z = sz; k.dx = _d.x; k.dy = _d.y; k.dz = _d.z; k.D = D; k.end = o.hit ? D : D + 16; k.d = 0; k.delay = o.delay || 0; k.cb = o.cb || null; k.fired = false; k.v = o.speed ? o.speed + Math.random()*40 : 150 + Math.random()*40; k.hit = !!o.hit; k.tx = tx; k.ty = ty; k.tz = tz; k.vis = o.vis !== false;
        };
        function updBullets(dt){
          for(var j = 0; j < NB; j++){ var k = B[j]; if(!k.on) continue;
            if(k.delay > 0){ k.delay -= dt; continue; }
            k.d += k.v*dt; var arrived = k.d >= k.D;
            if(arrived && !k.fired){ k.fired = true; if(k.cb) k.cb(k.hit, k.tx, k.ty, k.tz); }
            if(k.d >= k.end){ k.on = false; _m.makeScale(0, 0, 0); core.setMatrixAt(j, _m); glow.setMatrixAt(j, _m); continue; }
            var hd = Math.min(k.d, k.end); _d.set(k.dx, k.dy, k.dz); _q.setFromUnitVectors(_Z, _d);
            var cl = Math.min(2.6, hd + 0.4), gl = Math.min(6.5, hd + 0.4);
            _p.set(k.x + k.dx*(hd - cl/2), k.y + k.dy*(hd - cl/2), k.z + k.dz*(hd - cl/2)); _s.set(1, 1, cl); _m.compose(_p, _q, _s); core.setMatrixAt(j, _m);
            _p.set(k.x + k.dx*(hd - gl/2), k.y + k.dy*(hd - gl/2), k.z + k.dz*(hd - gl/2)); _s.set(2.6, 2.6, gl); _m.compose(_p, _q, _s); glow.setMatrixAt(j, _m);
          }
          core.instanceMatrix.needsUpdate = true; glow.instanceMatrix.needsUpdate = true;
        }
        // ---------- 포탄(포물선) ----------
        var SH = [];
        for(i = 0; i < 4; i++){ var gp = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.2, 8), new THREE.MeshStandardMaterial({ color:0x6a6a5a, metalness:0.6, roughness:0.4, emissive:0x222218, fog:false })), nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), new THREE.MeshStandardMaterial({ color:0xc9a23a, metalness:0.5, roughness:0.4, emissive:0x302408, fog:false })); body.rotation.x = Math.PI/2; nose.rotation.x = Math.PI/2; nose.position.z = 1.5; gp.add(body); gp.add(nose); var gl2 = new THREE.Sprite(new THREE.SpriteMaterial({ map:RT, color:0xff9a30, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, fog:false })); gl2.scale.set(3.5, 3.5, 1); gp.add(gl2); gp.visible = false; G.add(gp); SH.push({ g:gp, on:false }); }
        API.shell = function(from, to, o){
          var k = null, j; for(j = 0; j < SH.length; j++) if(!SH[j].on){ k = SH[j]; break; } if(!k) return; o = o || {};
          var tx = to.x, tz = to.z; if(!o.hit){ var sd = (Math.random() < 0.5 ? -1 : 1)*(5 + Math.random()*6); tx += sd; tz += (Math.random() - 0.5)*8; }
          var dx = tx - from.x, dz = tz - from.z, L = Math.sqrt(dx*dx + dz*dz);
          k.on = true; k.t = -(o.delay || 0); k.dur = Math.max(0.7, Math.min(1.4, L/55)); k.x0 = from.x; k.y0 = from.y; k.z0 = from.z; k.x1 = tx; k.z1 = tz; k.h = 10 + L*0.18; k.cb = o.cb || null; k.nb = !!o.nb; k.tr = 0; k.g.visible = false;
        };
        function updShells(dt){
          for(var j = 0; j < SH.length; j++){ var k = SH[j]; if(!k.on) continue; k.t += dt; if(k.t < 0) continue;
            var f = Math.min(1, k.t/k.dur), x = k.x0 + (k.x1 - k.x0)*f, z = k.z0 + (k.z1 - k.z0)*f, y = k.y0*(1 - f) + 0.6*f + 4*k.h*f*(1 - f), dfx = (k.x1 - k.x0), dfz = (k.z1 - k.z0), dy = (0.6 - k.y0) + 4*k.h*(1 - 2*f);
            k.g.visible = true; k.g.position.set(x, y, z); _d.set(dfx, dy*k.dur*0.6, dfz).normalize(); _q.setFromUnitVectors(_Z, _d); k.g.quaternion.copy(_q);
            k.tr -= dt; if(k.tr <= 0){ k.tr = 0.035; part(x, y, z, { life:0.6, s0:1.0, s1:2.6, col:0xbfbfbf, a0:0.4 }); }
            if(f >= 1){ k.on = false; k.g.visible = false; if(!k.nb) API.puff(k.x1, 0.5, k.z1, "blast"); if(k.cb) k.cb(); }
          }
        }
        function updParts(dt){
          for(var j = 0; j < NP; j++){ var k = PA[j]; if(!k.on) continue; k.t += dt; if(k.t >= k.life){ k.on = false; k.s.visible = false; continue; }
            var f = k.t/k.life, s = k.s0 + (k.s1 - k.s0)*f; k.vy += k.g*dt; k.s.position.x += k.vx*dt; k.s.position.y += k.vy*dt; k.s.position.z += k.vz*dt; if(k.s.position.y < 0.2) k.s.position.y = 0.2; k.s.scale.set(s, s, 1); k.s.material.opacity = k.a0*(1 - f)*(1 - f*0.3); }
        }
        // ---------- 체력바 (모든 유닛 머리 위, 작게) ----------
        var NBR = 2400, planeG = new THREE.PlaneGeometry(1, 1), bgM = new THREE.InstancedMesh(planeG, new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.62, depthTest:false, depthWrite:false, fog:false }), NBR), fillM = new THREE.InstancedMesh(planeG, new THREE.MeshBasicMaterial({ transparent:true, depthTest:false, depthWrite:false, fog:false }), NBR);
        bgM.frustumCulled = fillM.frustumCulled = false; bgM.renderOrder = 60; fillM.renderOrder = 61; bgM.instanceMatrix.setUsage(THREE.DynamicDrawUsage); fillM.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        var zc = new CO(1, 1, 1); for(i = 0; i < NBR; i++){ fillM.setColorAt(i, zc); _m.makeScale(0, 0, 0); bgM.setMatrixAt(i, _m); fillM.setMatrixAt(i, _m); } G.add(bgM); G.add(fillM);
        var tc = new CO();
        // list: [{x,y,z,w,frac,col,vis}]
        var barsLast = 0;
        // ---------- 상태 효과 아이콘 (🎯 집중 / ☠ 독) : 유닛 머리 위 ----------
        var NIC = 700, icGeo = new THREE.PlaneGeometry(1, 1), icM = [iconTex(0), iconTex(1)].map(function(t){ var m = new THREE.InstancedMesh(icGeo, new THREE.MeshBasicMaterial({ map:t, transparent:true, depthTest:false, depthWrite:false, fog:false }), NIC); m.frustumCulled = false; m.renderOrder = 41; m.count = 0; G.add(m); return m; });
        API.icons = function(list, cam){ _qq.copy(cam.quaternion); var c = [0, 0], k, b, q; for(k = 0; k < list.length; k++){ b = list[k]; q = b.t; if(c[q] >= NIC) continue; _p.set(b.x, b.y, b.z); _s.set(b.s || 3.2, b.s || 3.2, 1); _m.compose(_p, _qq, _s); icM[q].setMatrixAt(c[q]++, _m); } for(q = 0; q < 2; q++){ icM[q].count = c[q]; icM[q].instanceMatrix.needsUpdate = true; } };
        API.bars = function(list, cam){
          var n = list.length, j = 0, k, b; _qq.copy(cam.quaternion); _r.set(1, 0, 0).applyQuaternion(_qq);
          for(k = 0; k < n && j < NBR; k++){
            b = list[k]; if(!b.vis) continue;
            var H = b.h || 0.55, fw = Math.max(0.001, b.w*Math.max(0, Math.min(1, b.frac)));
            _p.set(b.x, b.y, b.z); _s.set(b.w + 0.3, H + 0.3, 1); _m.compose(_p, _qq, _s); bgM.setMatrixAt(j, _m);
            _p.set(b.x - _r.x*(b.w - fw)/2, b.y - _r.y*(b.w - fw)/2, b.z - _r.z*(b.w - fw)/2); _s.set(fw, H, 1); _m.compose(_p, _qq, _s); fillM.setMatrixAt(j, _m);
            tc.setHex(b.frac < 0.3 ? 0xffb030 : b.col); fillM.setColorAt(j, tc); j++;
          }
          var used = j; _m.makeScale(0, 0, 0); for(; j < barsLast; j++){ bgM.setMatrixAt(j, _m); fillM.setMatrixAt(j, _m); } barsLast = used;
          bgM.instanceMatrix.needsUpdate = true; fillM.instanceMatrix.needsUpdate = true; if(fillM.instanceColor) fillM.instanceColor.needsUpdate = true;
        };
        function updHearts(dt){
          var j, k; for(j = 0; j < HS.length; j++){ k = HS[j]; if(!k.on) continue; k.t += dt; if(k.t < 0) continue; if(k.t >= k.life){ k.on = false; k.s.visible = false; continue; } var f = k.t/k.life; k.vy -= 5*dt; k.s.position.x += k.vx*dt; k.s.position.y += k.vy*dt; k.s.position.z += k.vz*dt; var sc = k.sz*(f < 0.15 ? f/0.15 : 1 + f*0.25); k.s.scale.set(sc, sc, 1); k.s.material.opacity = f < 0.7 ? 1 : (1 - f)/0.3; k.s.visible = true; }
          for(j = 0; j < RG.length; j++){ k = RG[j]; if(!k.on) continue; k.t += dt; if(k.t >= k.life){ k.on = false; k.s.visible = false; continue; } var f2 = k.t/k.life, r = k.r1*(0.15 + 0.85*Math.sqrt(f2)); k.s.scale.set(r, r, 1); k.s.material.opacity = (1 - f2)*0.9; }
        }
        API.update = function(dt){ updBullets(dt); updShells(dt); updParts(dt); updHearts(dt); };
        // ---------- 3D 탱크 ----------
        function stdM(col, rough, em){ return new THREE.MeshStandardMaterial({ color:col, roughness:rough === undefined ? 0.78 : rough, metalness:0.15, emissive:em === undefined ? 0x101010 : em, fog:false }); }
        API.makeTank = function(side){
          var TS = 3, rok = side === "rok", hullC = rok ? 0x4f5d34 : 0x6a5c3b, trackC = 0x23211e, darkC = rok ? 0x3c4828 : 0x514530, mats = [];
          function M(c, r){ var m = stdM(c, r); m.userData = { c0:c }; mats.push(m); return m; }
          var g = new THREE.Group(), hull = new THREE.Group(); g.add(hull);
          var lower = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.0, 13), M(hullC)); lower.position.y = 2.2; hull.add(lower);
          var deck = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.7, 8.5), M(darkC)); deck.position.set(0, 3.5, -1.8); hull.add(deck);
          var glacis = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.7, 4.6), M(hullC)); glacis.position.set(0, 3.2, 4.5); glacis.rotation.x = 0.42; hull.add(glacis);
          var rear = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.2, 1.6), M(darkC)); rear.position.set(0, 3.1, -6.0); hull.add(rear);
          [-1, 1].forEach(function(s){
            var tr = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.6, 14.4), M(trackC, 0.9)); tr.position.set(s*4.5, 1.5, 0); hull.add(tr);
            var skirt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 12), M(darkC)); skirt.position.set(s*5.6, 2.7, -0.4); hull.add(skirt);
            var fend = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 14.8), M(darkC)); fend.position.set(s*4.5, 2.95, 0); hull.add(fend);
            for(var w = 0; w < 6; w++){ var wh = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.5, 14), M(0x302d29, 0.9)); wh.rotation.z = Math.PI/2; wh.position.set(s*5.4, 1.35, -5.4 + w*2.2); hull.add(wh); }
            var dw = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.55, 14), M(0x302d29, 0.9)); dw.rotation.z = Math.PI/2; dw.position.set(s*5.4, 1.7, 6.6); hull.add(dw);
          });
          var tur = new THREE.Group(); tur.position.set(0, 4.0, -0.6); g.add(tur);
          var tb = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 3.3, 1.9, 14), M(hullC)); tb.position.y = 1.0; tur.add(tb);
          var mant = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 2.0), M(darkC)); mant.position.set(0, 1.0, 3.0); tur.add(mant);
          var tcap = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.7, 0.5, 14), M(darkC)); tcap.position.y = 2.1; tur.add(tcap);
          var hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.5, 10), M(0x2a2a26)); hatch.position.set(-1.0, 2.5, -0.6); tur.add(hatch);
          var mg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 1.6), M(0x1d1d1d)); mg.position.set(1.0, 2.6, 0.2); tur.add(mg);
          var bar = new THREE.Group(); bar.position.set(0, 1.0, 3.8); tur.add(bar);
          var tube = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 9.5, 10), M(0x2c2c28, 0.5)); tube.rotation.x = Math.PI/2; tube.position.z = 4.6; bar.add(tube);
          var brake = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.1, 10), M(0x2c2c28, 0.5)); brake.rotation.x = Math.PI/2; brake.position.z = 9.6; bar.add(brake);
          var emb = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshBasicMaterial({ map:rok ? taeTex() : starTex("#d42a2a"), transparent:true, fog:false, side:THREE.DoubleSide })); emb.position.set(3.35, 1.0, -0.3); emb.rotation.y = Math.PI/2; tur.add(emb);
          var emb2 = emb.clone(); emb2.position.x = -3.35; tur.add(emb2);
          var plate = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), emb.material); plate.position.set(0, 3.4, 3.3 + 1.6); plate.rotation.x = -0.42; hull.add(plate);
          var sh = new THREE.Mesh(new THREE.CircleGeometry(1, 20), new THREE.MeshBasicMaterial({ map:null, color:0x000000, transparent:true, opacity:0.4, depthWrite:false, fog:false })); sh.rotation.x = -Math.PI/2; sh.scale.set(8.5, 9.5, 1); sh.position.y = 0.08; g.add(sh);
          g.scale.setScalar(TS); g.visible = false; G.add(g);
          var T = { g:g, hull:hull, tur:tur, bar:bar, yaw:rok ? 0 : Math.PI, aimYaw:0, recoil:0, wreck:0, wreckT:0, fireT:0, sm:0, side:side };
          T.setVisible = function(v){ g.visible = v; };
          T.place = function(x, z){ g.position.set(x, 0, z); };
          T.aim = function(x, z){ T.aimYaw = Math.atan2(x - g.position.x, z - g.position.z); };
          T.fire = function(){ T.recoil = 1; T.fireT = 0.25; var a = T.aimYaw, bx = g.position.x + Math.sin(a)*12.4*TS, bz = g.position.z + Math.cos(a)*12.4*TS; API.puff(bx, 5.2*TS, bz, "big"); API.puff(bx, 5.2*TS, bz, "big"); API.puff(bx, 5.2*TS, bz, "muzzle"); };
          T.setWreck = function(on){ T.wreckOn = on; };
          T.update = function(dt, tm){
            g.rotation.y = T.yaw; var want = T.aimYaw - T.yaw; while(want > Math.PI) want -= 2*Math.PI; while(want < -Math.PI) want += 2*Math.PI;
            if(T.wreckOn){ T.wreck = Math.min(1, T.wreck + dt*1.6); } else T.wreck = Math.max(0, T.wreck - dt*3);
            var tw = T.tur.rotation.y; var dd = want - tw; while(dd > Math.PI) dd -= 2*Math.PI; while(dd < -Math.PI) dd += 2*Math.PI; T.tur.rotation.y = tw + dd*Math.min(1, dt*5);
            T.recoil = Math.max(0, T.recoil - dt*3.2); var rc = Math.sin(Math.min(1, T.recoil)*Math.PI*0.5); T.bar.position.z = 3.8 - rc*1.7; hull.position.z = -rc*0.35; hull.rotation.x = -rc*0.02;
            T.sm += dt; var idle = T.wreck > 0 ? 0 : 1; hull.position.y = idle*Math.sin(tm*17 + (rok ? 0 : 1))*0.025; T.tur.rotation.z = T.wreck*0.25; T.tur.position.y = 4.0 + T.wreck*0.9;
            if(T.wreck > 0.05 && T.sm > 0.18){ T.sm = 0; part(g.position.x + rr(3*TS), (5 + Math.random()*2)*TS, g.position.z + rr(3*TS), { life:1.8, vy:9, vx:rr(3), vz:rr(3), s0:6, s1:22, col:0x2c2a28, a0:0.6 }); if(Math.random() < 0.4) part(g.position.x + rr(2*TS), 4.5*TS, g.position.z + rr(2*TS), { life:0.35, vy:4, s0:7, s1:2, col:0xff8a1c, add:true }); }
            else if(!T.wreckOn && T.sm > 0.45){ T.sm = 0; var a2 = T.yaw + Math.PI; part(g.position.x + Math.sin(a2)*6.4*TS + 1.8*TS, 3.9*TS, g.position.z + Math.cos(a2)*6.4*TS, { life:1.0, vy:4, s0:2, s1:6.5, col:0xb4b4b4, a0:0.28 }); }
            for(var mi = 0; mi < mats.length; mi++){ var mm = mats[mi]; if(!mm.userData.t) mm.userData.t = new CO(); mm.color.setHex(mm.userData.c0).lerp(mm.userData.t.setHex(0x161412), T.wreck*0.85); }
          };
          return T;
        };
        // ---------- 언덕 진지: 기관총(삼각대+모래주머니) / 저격수(위장 덤불+긴 총) ----------
        API.makeEmp = function(role, side, x, y, z, yaw){
          var g = new THREE.Group(), sand = new THREE.MeshStandardMaterial({ color:0xb7a06a, roughness:0.95, flatShading:true, fog:false, emissive:0x1a160c }), dark = new THREE.MeshStandardMaterial({ color:0x2a2c2e, roughness:0.5, metalness:0.3, flatShading:true, fog:false }), oli = new THREE.MeshStandardMaterial({ color:side === "rok" ? 0x4f5d34 : 0x6a5c3b, roughness:0.8, flatShading:true, fog:false, emissive:0x101008 }), i;
          for(i = 0; i < 7; i++){ var a = -1.1 + i*0.37, sb = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 1.0), sand); sb.position.set(Math.sin(a)*4.6, 0.45 + (i % 2)*0.05, Math.cos(a)*4.6); sb.rotation.y = a; g.add(sb); }
          if(role === "mg"){
            for(i = 0; i < 3; i++){ var lg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 5), dark), a2 = i*2.094; lg.position.set(Math.sin(a2)*0.9, 1.1, 3.0 + Math.cos(a2)*0.9); lg.rotation.set(Math.cos(a2)*0.35, 0, -Math.sin(a2)*0.35); g.add(lg); }
            var body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 2.2), dark); body.position.set(0, 2.5, 3.0); g.add(body);
            var bar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.6, 8), dark); bar.rotation.x = Math.PI/2; bar.position.set(0, 2.55, 5.4); g.add(bar);
            var am = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 1.2), oli); am.position.set(1.0, 1.9, 2.5); g.add(am);
          } else {
            var bush = new THREE.MeshStandardMaterial({ color:0x4c6a34, roughness:1, flatShading:true, fog:false, emissive:0x0c1406 });
            for(i = 0; i < 4; i++){ var bs = new THREE.Mesh(new THREE.SphereGeometry(1.4, 6, 5), bush); bs.position.set(-2.2 + i*1.5, 1.2, -1.8 + (i % 2)*0.8); bs.scale.y = 0.8; g.add(bs); }
          }
          g.position.set(x, y, z); g.rotation.y = yaw; G.add(g); return g;
        };
        // 연기+불꽃 꼬리(추락하는 비행기)
        API.trail = function(x, y, z){ part(x + rr(1), y, z + rr(1), { life:1.4, vy:3, vx:rr(2), vz:rr(2), s0:3, s1:11, col:0x1e1c1a, a0:0.7 }); part(x, y, z, { life:0.3, s0:5, s1:1.5, col:0xff8a1c, add:true, vx:rr(4), vz:rr(4) }); };
        // ---------- 3D 비행기 (프로펠러 전투기) ----------
        API.makePlane = function(side){
          var rok = side === "rok", PS = 2.1, mats = [], bodyC = rok ? 0xc9d3e0 : 0x66754a, accC = rok ? 0x2a4fa0 : 0x3f4a2e, dark = 0x2b2d30;
          function M(c, r, o){ var m = stdM(c, r === undefined ? 0.5 : r); m.userData = { c0:c }; if(o){ m.transparent = true; m.opacity = o; } mats.push(m); return m; }
          var g = new THREE.Group(), b = new THREE.Group(); g.add(b);
          var fus = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.62, 9, 10), M(bodyC)); fus.rotation.x = Math.PI/2; fus.position.z = 0; b.add(fus);
          var nose = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.95, 1.8, 10), M(accC)); nose.rotation.x = Math.PI/2; nose.position.z = 5.3; b.add(nose);
          var spin = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 8), M(0xd8c060, 0.4)); spin.rotation.x = Math.PI/2; spin.position.z = 6.5; b.add(spin);
          var prop = new THREE.Group(); prop.position.z = 6.2; b.add(prop); var bl = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.0, 0.08), M(dark)); prop.add(bl); var bl2 = bl.clone(); bl2.rotation.z = Math.PI/2; prop.add(bl2);
          var wing = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.3, 3.1), M(bodyC)); wing.position.set(0, -0.15, 0.6); b.add(wing);
          [-1, 1].forEach(function(s){ var tip = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 3.0), M(accC)); tip.position.set(s*6.6, -0.14, 0.55); b.add(tip); var ro = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshBasicMaterial({ map:rok ? taeTex() : starTex("#d42a2a"), transparent:true, fog:false, side:THREE.DoubleSide })); ro.rotation.x = -Math.PI/2; ro.position.set(s*4.1, 0.03, 0.6); b.add(ro); });
          var fin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 2.0), M(accC)); fin.position.set(0, 1.5, -4.2); fin.rotation.x = -0.25; b.add(fin);
          var tp = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.22, 1.5), M(bodyC)); tp.position.set(0, 0.3, -4.3); b.add(tp);
          var can = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), M(0x8fc4ff, 0.2, 0.75)); can.scale.set(0.8, 0.65, 1.7); can.position.set(0, 0.95, 0.7); b.add(can);
          var gun = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4, 6), M(dark)); gun.rotation.x = Math.PI/2; gun.position.set(2.4, -0.2, 2.2); b.add(gun); var gun2 = gun.clone(); gun2.position.x = -2.4; b.add(gun2);
          g.scale.setScalar(PS); g.visible = false; G.add(g);
          var sh = new THREE.Mesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial({ color:0x000000, transparent:true, opacity:0.32, depthWrite:false, fog:false })); sh.rotation.x = -Math.PI/2; sh.visible = false; G.add(sh);
          var P = { g:g, wreck:0, wreckOn:false, sm:0, ps:0, vis:false };
          P.setVisible = function(v){ P.vis = v; g.visible = v; sh.visible = v; };
          P.place = function(x, y, z, yaw, pitch, roll, gy){ g.position.set(x, y, z); g.rotation.set(pitch, yaw, roll, "YXZ"); var h = Math.max(0, y - gy), k = 10*(1 + Math.min(1.2, h/60)*0.2); sh.position.set(x + h*0.18, gy + 0.2, z + h*0.1); sh.scale.set(k*0.9, k*0.45, 1); sh.material.opacity = Math.max(0.08, 0.34 - h*0.003); };
          P.setWreck = function(on){ P.wreckOn = on; };
          P.update = function(dt, tm, alive){ prop.rotation.z += dt*(alive ? 60 : 0); if(P.wreckOn){ P.wreck = Math.min(1, P.wreck + dt*2); } else P.wreck = Math.max(0, P.wreck - dt*4);
            P.sm += dt; if(P.wreckOn && P.sm > 0.2){ P.sm = 0; part(g.position.x + rr(6), g.position.y + 3, g.position.z + rr(6), { life:2.2, vy:7, vx:rr(2), vz:rr(2), s0:5, s1:20, col:0x26231f, a0:0.65 }); if(Math.random() < 0.5) part(g.position.x + rr(5), g.position.y + 2, g.position.z + rr(5), { life:0.4, vy:4, s0:6, s1:2, col:0xff7a18, add:true }); }
            for(var mi = 0; mi < mats.length; mi++){ var mm = mats[mi]; if(!mm.userData.t) mm.userData.t = new CO(); mm.color.setHex(mm.userData.c0).lerp(mm.userData.t.setHex(0x141210), P.wreck*0.85); } };
          return P;
        };
        return API;
      } };
    })();

