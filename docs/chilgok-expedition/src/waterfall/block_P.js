    // ================= 스카이캣 항공 (거대한 고양이 비행기) — 3분마다 하늘을 가로질러 날아가요 =================
    (function buildCatPlane(){
      var built = false, G = null, inner = null, active = false, t0 = 0, nextT = null, strobe = null, FLY_MS = 80000, PERIOD = 180000, SPAN = 3600, lane = 0, x0 = 0, SC = 1.1;
      var BODY = 0x2a98ff, DEEP = 0x1573e6;
      function sm(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      function cv(w, h){ var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
      function tex(c, rep){ var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0], rep[1]); var r = three.renderer; t.anisotropy = r && r.capabilities ? Math.min(8, r.capabilities.getMaxAnisotropy()) : 1; return t; }
      function rrect(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      function paw(g, x, y, s, col){ g.fillStyle = col; g.beginPath(); g.ellipse(x, y + s*0.25, s*0.5, s*0.42, 0, 0, 7); g.fill(); [[-0.55, -0.28, 0.2], [-0.2, -0.62, 0.21], [0.2, -0.62, 0.21], [0.55, -0.28, 0.2]].forEach(function(q){ g.beginPath(); g.ellipse(x + q[0]*s, y + q[1]*s, q[2]*s, q[2]*s*1.25, 0, 0, 7); g.fill(); }); }
      function catFace(g, cx, cy, s, col){ g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s*0.07; g.lineJoin = "round";
        g.beginPath(); g.moveTo(cx - s*0.62, cy - s*0.1); g.lineTo(cx - s*0.55, cy - s*0.78); g.lineTo(cx - s*0.18, cy - s*0.5); g.moveTo(cx + s*0.62, cy - s*0.1); g.lineTo(cx + s*0.55, cy - s*0.78); g.lineTo(cx + s*0.18, cy - s*0.5); g.stroke();
        g.beginPath(); g.ellipse(cx, cy + s*0.05, s*0.68, s*0.55, 0, 0, 7); g.stroke();
        g.beginPath(); g.ellipse(cx - s*0.27, cy - s*0.05, s*0.07, s*0.1, 0, 0, 7); g.ellipse(cx + s*0.27, cy - s*0.05, s*0.07, s*0.1, 0, 0, 7); g.fill();
        g.beginPath(); g.moveTo(cx - s*0.06, cy + s*0.12); g.lineTo(cx + s*0.06, cy + s*0.12); g.lineTo(cx, cy + s*0.2); g.closePath(); g.fill();
        g.lineWidth = s*0.035; [[-1, -0.06], [-1, 0.06], [1, -0.06], [1, 0.06]].forEach(function(w){ g.beginPath(); g.moveTo(cx + w[0]*s*0.45, cy + s*0.2 + w[1]*s); g.lineTo(cx + w[0]*s*0.95, cy + s*0.2 + w[1]*s*2.2); g.stroke(); }); }
      // ---------- 동체 그림 (오른쪽 옆면 한 장 → 양쪽 면으로 펼쳐요) ----------
      var SS = 3072, SH = 768, FL0 = -105, FL1 = 100;
      function sideImage(){
        var c = cv(SS, SH), g = c.getContext("2d"), i;
        var gr = g.createLinearGradient(0, 0, 0, SH); gr.addColorStop(0, "#5ab8ff"); gr.addColorStop(0.28, "#2f9dff"); gr.addColorStop(0.5, "#1685ff"); gr.addColorStop(0.64, "#36a0ff"); gr.addColorStop(0.7, "#eef5fa"); gr.addColorStop(1, "#cfdbe4");
        g.fillStyle = gr; g.fillRect(0, 0, SS, SH);
        g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, 150, SS, 10);                                 // 윗면 하이라이트 줄
        var tg = g.createLinearGradient(0, 0, 500, 0); tg.addColorStop(0, "rgba(20,90,170,0.65)"); tg.addColorStop(1, "rgba(20,90,170,0)"); g.fillStyle = tg; g.fillRect(0, 0, 500, SH);   // 꼬리 쪽은 진한 파랑
        g.fillStyle = "rgba(25,100,190,0.55)"; g.beginPath(); g.moveTo(0, 470); g.bezierCurveTo(900, 500, 1500, 560, 2300, 540); g.lineTo(2300, 560); g.bezierCurveTo(1500, 580, 900, 530, 0, 500); g.fill();   // 배 경계 진한 줄
        // 창문 두 줄 + 문
        g.fillStyle = "#16324f"; for(i = 0; i < 52; i++){ var wx = 330 + i*34; if(wx > 2140) break; rrect(g, wx, 288, 20, 14, 5); g.fill(); }
        for(i = 0; i < 40; i++){ var wx2 = 330 + i*44; if(wx2 > 2100) break; if(i % 8 === 4) continue; rrect(g, wx2, 392, 22, 17, 6); g.fill(); }
        g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 3; g.fillStyle = "rgba(190,225,250,0.55)"; [560, 1130, 1700, 2150].forEach(function(dx){ rrect(g, dx, 330, 56, 118, 16); g.fill(); g.stroke(); });
        // 글자 + 발자국 + 로고
        g.fillStyle = "#ffffff"; g.font = "bold 112px 'Arial Narrow', Arial, sans-serif"; g.textBaseline = "middle"; g.fillText("SKY CAT AIRLINES", 1090, 352);
        g.font = "bold 44px Arial, sans-serif"; g.fillText("FLIGHT 4096", 440, 480);
        [[760, 230, 40], [880, 520, 34], [1980, 470, 36], [2060, 232, 34], [1010, 600, 30]].forEach(function(p){ paw(g, p[0], p[1], p[2], "rgba(255,255,255,0.95)"); });
        catFace(g, 985, 352, 48, "#ffffff");
        // ---- 고양이 머리 (코 쪽) ----
        var hx = 2300;
        var mg = g.createLinearGradient(0, 0, 0, SH); g.fillStyle = "#f4f8fb";
        g.beginPath(); g.moveTo(hx + 20, 600); g.bezierCurveTo(hx + 180, 380, hx + 520, 380, SS, 390); g.lineTo(SS, SH); g.lineTo(hx - 40, SH); g.closePath(); g.fill();           // 하얀 주둥이/턱
        g.strokeStyle = "rgba(30,90,170,0.7)"; g.lineWidth = 7; g.lineCap = "round";
        [[0, 0], [24, 8], [48, 20]].forEach(function(o){ g.beginPath(); g.moveTo(hx + 360 + o[0], 128 + o[1]); g.quadraticCurveTo(hx + 440 + o[0], 100 + o[1], hx + 530 + o[0], 140 + o[1]); g.stroke(); });   // 이마 줄무늬
        g.strokeStyle = "#1a2f55"; g.lineWidth = 10; g.fillStyle = "#16324f";
        rrect(g, hx + 240, 240, 150, 40, 14); g.fill(); rrect(g, hx + 410, 250, 90, 36, 14); g.fill();                              // 조종석 창
        // 눈
        var ex = hx + 585, ey = 350;
        g.fillStyle = "#f6fbff"; g.beginPath(); g.ellipse(ex, ey, 112, 130, 0, 0, 7); g.fill();
        var ig = g.createRadialGradient(ex, ey + 10, 6, ex, ey + 10, 90); ig.addColorStop(0, "#0a2a8a"); ig.addColorStop(0.55, "#1f67d8"); ig.addColorStop(1, "#4fb2ff"); g.fillStyle = ig; g.beginPath(); g.ellipse(ex, ey + 6, 96, 114, 0, 0, 7); g.fill();
        g.fillStyle = "#06143a"; g.beginPath(); g.ellipse(ex + 4, ey + 10, 46, 64, 0, 0, 7); g.fill();
        g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(ex - 26, ey - 34, 20, 26, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(ex + 30, ey + 44, 12, 14, 0, 0, 7); g.fill();
        g.strokeStyle = "#0b2250"; g.lineWidth = 11; g.beginPath(); g.ellipse(ex, ey, 92, 108, 0, 3.6, 5.7); g.stroke();
        g.lineWidth = 8; [[-0.5, -22], [-0.15, -34]].forEach(function(l){ g.beginPath(); g.moveTo(ex + 82, ey - 50 + l[1]*0.2); g.lineTo(ex + 128, ey - 76 + l[1]); g.stroke(); });   // 속눈썹
        // 미소 + 수염
        g.strokeStyle = "#7a2d3d"; g.lineWidth = 9; g.beginPath(); g.moveTo(SS - 330, 560); g.quadraticCurveTo(SS - 230, 640, SS - 90, 560); g.stroke();
        g.strokeStyle = "rgba(60,100,140,0.85)"; g.lineWidth = 5; [[-8, 0], [0, 30], [8, 60]].forEach(function(w){ g.beginPath(); g.moveTo(SS - 330, 505 + w[1]); g.quadraticCurveTo(SS - 460, 495 + w[1] + w[0], SS - 640, 515 + w[1] + w[0]*3); g.stroke(); });
        return c;
      }
      function bodyTexture(){
        var Wc = 1536, Hc = 3072, c = cv(Wc, Hc), g = c.getContext("2d"), S = sideImage();
        g.fillStyle = "#1e8cff"; g.fillRect(0, 0, Wc, Hc);
        g.save(); g.translate(0, Hc); g.rotate(-Math.PI/2); g.drawImage(S, 0, 0); g.restore();                                  // 오른쪽 옆면: u 0..0.5
        var m = cv(SS, SH), mg = m.getContext("2d"); mg.translate(SS, 0); mg.scale(-1, 1); mg.drawImage(S, 0, 0);                  // 왼쪽 옆면은 글자가 바로 읽히게 뒤집어요
        g.save(); g.translate(Wc, Hc); g.rotate(-Math.PI/2); g.scale(1, -1); g.drawImage(m, 0, 0); g.restore();
        return tex(c);
      }
      function fuselage(){
        var NL = 140, NS = 56, pos = [], uv = [], idx = [], i, j;
        function R(x){ var Rm = 17; if(x < -45){ var t = Math.max(0, (x - FL0)/(-45 - FL0)); return 1.5 + (Rm - 1.5)*Math.pow(Math.sin(t*Math.PI/2), 0.85); }
          if(x < 40) return Rm; if(x < 62) return Rm + 2.4*sm(40, 62, x); var u = (x - 62)/(FL1 - 62); return 19.4*Math.sqrt(Math.max(0, 1 - u*u)); }
        function Y(x){ return x < -30 ? 7*sm(-30, FL0, x) : (x > 70 ? -2.2*sm(70, FL1, x) : 0); }
        for(i = 0; i <= NL; i++){ var u = i/NL, x = FL0 + (FL1 - FL0)*(u < 0.5 ? 0.5*Math.pow(u*2, 1.0) : 1 - 0.5*Math.pow((1 - u)*2, 1.0)); var r = R(x), yc = Y(x);
          for(j = 0; j <= NS; j++){ var a = j/NS*Math.PI*2; pos.push(x, yc + r*1.08*Math.cos(a), r*Math.sin(a)); uv.push(j/NS, (x - FL0)/(FL1 - FL0)); } }
        for(i = 0; i < NL; i++) for(j = 0; j < NS; j++){ var a0 = i*(NS + 1) + j, b0 = a0 + 1, c0 = a0 + NS + 1, d0 = c0 + 1; idx.push(a0, b0, c0, b0, d0, c0); }
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
        var bt = bodyTexture(); return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map:bt, emissiveMap:bt, emissive:0x404040, roughness:0.32, metalness:0.08, fog:false, side:THREE.DoubleSide }));
      }
      function std(col, o){ var p = { color:col, roughness:0.4, metalness:0.1, fog:false, side:THREE.DoubleSide, emissive:new THREE.Color(col).multiplyScalar(0.22) }; if(o) for(var k in o) p[k] = o[k]; if(p.map){ p.emissiveMap = p.map; p.emissive = new THREE.Color(0x3a3a3a); } return new THREE.MeshStandardMaterial(p); }
      function flat(pts, depth, mat, rotX){ var sh = new THREE.Shape(pts.map(function(q){ return new THREE.Vector2(q[0], q[1]); })), g = new THREE.ExtrudeGeometry(sh, { depth:depth, bevelEnabled:false }); if(rotX) g.rotateX(Math.PI/2); return new THREE.Mesh(g, mat); }
      function nacelle(){
        var gp = new THREE.Group(), c = cv(256, 256), g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#5cb8f0"); gr.addColorStop(0.5, "#2f95e0"); gr.addColorStop(1, "#1f6fbf"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
        paw(g, 128, 128, 70, "#ffffff"); g.fillStyle = "#fff"; g.font = "bold 26px Arial"; g.textAlign = "center"; g.fillText("CAT AIR", 128, 232);
        var t = tex(c, [2, 1]);
        var body = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.2, 17, 28, 1, true), std(0xffffff, { map:t, roughness:0.3 })); body.rotation.z = Math.PI/2; gp.add(body);
        var ring = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.7, 10, 28), std(0xc9d2da, { metalness:0.6, roughness:0.25 })); ring.rotation.y = Math.PI/2; ring.position.x = 8.5; gp.add(ring);
        var inl = new THREE.Mesh(new THREE.CircleGeometry(5.3, 28), new THREE.MeshBasicMaterial({ color:0x0a0d12, fog:false })); inl.rotation.y = Math.PI/2; inl.position.x = 7.6; gp.add(inl);
        var hub = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3, 12), std(0x9aa5ae, { metalness:0.7 })); hub.rotation.z = -Math.PI/2; hub.position.x = 8.2; gp.add(hub);
        var noz = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 5.2, 4, 20), std(0x7d8791, { metalness:0.5 })); noz.rotation.z = Math.PI/2; noz.position.x = -10.5; gp.add(noz);
        return gp;
      }
      function finDecal(){
        var c = cv(512, 640), g = c.getContext("2d"); catFace(g, 256, 200, 150, "#ffffff"); g.fillStyle = "#fff"; g.font = "bold 92px Arial, sans-serif"; g.textAlign = "center"; g.fillText("CAT AIR", 256, 470);
        var t = tex(c); return new THREE.MeshBasicMaterial({ map:t, transparent:true, fog:false, side:THREE.FrontSide, depthWrite:false });
      }
      function build(){
        G = new THREE.Group(); G.name = "catPlane"; G.visible = false; inner = new THREE.Group(); G.add(inner); G.scale.setScalar(SC); scene.add(G);
        inner.add(fuselage());
        var wingM = std(0xe7edf2, { roughness:0.45 }), blueM = std(DEEP), i, sd;
        [1, -1].forEach(function(s){
          var w = flat([[12, 0], [-46, 95], [-60, 95], [-38, 0]], 2.2, wingM, true); w.position.set(0, -3 + 0, 0); if(s < 0) w.scale.z = -1; inner.add(w);
          var wl = flat([[-47, 95], [-60, 95], [-72, 112], [-64, 112]], 1.2, blueM, true); wl.position.y = 0.5; if(s < 0) wl.scale.z = -1; inner.add(wl);
          var st = flat([[-80, 0], [-94, 38], [-103, 38], [-98, 0]], 1.4, wingM, true); st.position.set(0, 6, 0); if(s < 0) st.scale.z = -1; inner.add(st);
          [[32, -2, 12], [62, -22, 12]].forEach(function(e){
            var n = nacelle(); n.position.set(e[1], -10.5, s*e[0]); inner.add(n);
            var py = new THREE.Mesh(new THREE.BoxGeometry(14, 4.5, 1.6), std(0xaab4bd)); py.position.set(e[1] - 6, -6.2, s*e[0]); inner.add(py);
          });
        });
        var fin = flat([[-58, 13], [-88, 62], [-102, 62], [-100, 13]], 1.8, blueM, false); fin.position.z = -0.9; inner.add(fin);
        var dm = finDecal(); [1, -1].forEach(function(s){ var d = new THREE.Mesh(new THREE.PlaneGeometry(27, 33.7), dm); d.position.set(-82, 36, s*1.0); if(s < 0) d.rotation.y = Math.PI; d.rotation.z = 0.2; inner.add(d); });
        var bel = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), std(0xe9eff4)); bel.scale.set(48, 5, 17); bel.position.set(-14, -11.5, 0); inner.add(bel);
        // 귀 (파란 겉 + 분홍 속)
        [1, -1].forEach(function(s){
          var e1 = new THREE.Mesh(new THREE.ConeGeometry(9.6, 23, 4), std(BODY, { roughness:0.35 })); e1.scale.z = 0.42; e1.position.set(58, 24, s*10.5); e1.rotation.set(s*-0.42, 0.55*s, 0.16); inner.add(e1);
          var e2 = new THREE.Mesh(new THREE.ConeGeometry(6.6, 17, 4), std(0xf4a3bb, { roughness:0.5 })); e2.scale.z = 0.3; e2.position.set(61.6, 23.2, s*10.9); e2.rotation.set(s*-0.42, 0.55*s, 0.16); inner.add(e2);
        });
        var nose = new THREE.Mesh(new THREE.SphereGeometry(3.1, 16, 12), std(0xf08aa4, { roughness:0.35 })); nose.scale.set(1.1, 0.8, 1.2); nose.position.set(98.6, -4.2, 0); inner.add(nose);
        function lamp(col, x, y, z, r){ var m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), new THREE.MeshBasicMaterial({ color:col, fog:false })); m.position.set(x, y, z); inner.add(m); return m; }
        lamp(0xff3030, -72, 3, -112, 1.6); lamp(0x30ff60, -72, 3, 112, 1.6); strobe = lamp(0xffffff, -103, 14, 0, 2.2);
        built = true;
      }
      window.planeStart = function(p){ if(!built) build(); active = true; t0 = (typeof performance !== "undefined" ? performance.now() : 0); x0 = p.x + SPAN/2; lane = p.z + 600; };
      window.planePlace = function(x, y, z, yaw){ if(!built) build(); G.visible = true; G.position.set(x, y, z); G.rotation.y = yaw; inner.rotation.set(0, 0, 0); };
      window.planeTick = function(t, dt, p){
        if(!window.__riverBuilt) return;                                          // 월드가 다 만들어진 뒤부터
        if(nextT === null) nextT = t + 15000;                                      // 처음엔 15초 뒤, 그 다음부터 3분마다
        if(!active && t >= nextT){ window.planeStart(p); t0 = t; nextT = t + PERIOD; }
        if(!built || !active){ if(G && !active) G.visible = false; return; }
        var k = (t - t0)/FLY_MS;
        if(k >= 1){ active = false; G.visible = false; return; }
        lane += (p.z + 600 - lane)*Math.min(1, dt*0.8);
        var x = x0 - SPAN*k, y = 68 + 6*Math.sin(k*6.3);
        G.visible = true; G.position.set(x, y, lane); G.rotation.y = Math.PI;                  // 코가 -x(화면 오른쪽)로 날아가요
        inner.rotation.x = 0.05*Math.sin(k*9.0); inner.rotation.z = 0.03*Math.sin(k*7.0 + 1);
        if(strobe) strobe.visible = (Math.floor(t/500) % 3) !== 0;
      };
    })();
