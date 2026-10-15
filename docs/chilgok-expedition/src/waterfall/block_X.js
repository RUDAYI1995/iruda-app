    // ================= 스카이캣 공항 (하늘섬 맨 위 섬 옆 탑승장) + 기내 + 탑승/내리기 =================
    // 참고: source-images/airport/terminal_reference.webp, cabin_reference.webp
    // 새 섬은 마법 나무 꼭대기 큰 섬(crown) 남쪽에 다리로 이어요. 기존 하늘섬 그림/지형은 건드리지 않아요.
    (function buildAirport(){
      var AX = 1175, AZ = 2330, AR = 170, AY = 600;                         // 공항 섬 (월드 좌표)
      var BRG = { x:AX, z0:2100, z1:AZ - AR + 6, hw:5 };                    // crown 가장자리 → 공항 섬 다리
      var CX = 1960, CZ = 1500, CY = 1000, CW = 70, CL = 240, CH = 24;     // 기내 방 (중심, 폭, 길이, 벽 높이) — 아무것도 없는 허공
      var built = false, GA = null, GC = null, SKYB = null, tmrs = {}, S = { state:"none", t:0, place:0 };
      var rnd = (function(){ var s = 9137; return function(){ s = (s*16807) % 2147483647; return s/2147483647; }; })();
      function std(col, o){ o = o || {}; var m = new THREE.MeshStandardMaterial({ color:col, roughness:o.r !== undefined ? o.r : 0.6, metalness:o.m || 0, side:o.side || THREE.FrontSide, transparent:!!o.tr, opacity:o.op !== undefined ? o.op : 1, flatShading:!!o.flat }); m.emissive = o.e !== undefined ? new THREE.Color(o.e) : new THREE.Color(col).multiplyScalar(o.em !== undefined ? o.em : 0.3); if(o.map){ m.map = o.map; m.emissiveMap = o.map; m.emissive = new THREE.Color(o.em !== undefined ? o.em*3 : 0.6); } return m; }
      function ct(w, h, fn, rep){ var c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(rep) t.repeat.set(rep[0], rep[1]); if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
      function bx(p, w, h, d, m, x, y, z){ var o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); p.add(o); return o; }
      function cy(p, rt, rb, h, m, x, y, z, seg){ var o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 20), m); o.position.set(x, y, z); p.add(o); return o; }
      function sp(p, r, m, x, y, z, sx, sy, sz){ var o = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), m); o.position.set(x, y, z); o.scale.set(sx || 1, sy || 1, sz || 1); p.add(o); return o; }
      function rr(g, x, y, w, h, r){ g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
      function paw(g, x, y, s, col){ g.fillStyle = col; g.beginPath(); g.ellipse(x, y + s*0.25, s*0.5, s*0.42, 0, 0, 7); g.fill(); [[-0.55, -0.28, 0.2], [-0.2, -0.62, 0.21], [0.2, -0.62, 0.21], [0.55, -0.28, 0.2]].forEach(function(q){ g.beginPath(); g.ellipse(x + q[0]*s, y + q[1]*s, q[2]*s, q[2]*s*1.25, 0, 0, 7); g.fill(); }); }
      function cat(g, cx, cy2, s, col, fill){ g.strokeStyle = col; g.fillStyle = col; g.lineWidth = s*0.09; g.lineJoin = "round"; g.beginPath(); g.moveTo(cx - s*0.62, cy2 - s*0.05); g.lineTo(cx - s*0.55, cy2 - s*0.82); g.lineTo(cx - s*0.16, cy2 - s*0.5); g.moveTo(cx + s*0.62, cy2 - s*0.05); g.lineTo(cx + s*0.55, cy2 - s*0.82); g.lineTo(cx + s*0.16, cy2 - s*0.5); if(fill) g.fill(); g.stroke(); g.beginPath(); g.ellipse(cx, cy2 + s*0.08, s*0.7, s*0.56, 0, 0, 7); if(fill) g.fill(); g.stroke(); }
      function sign(w, h, text, bg, fg, withCat){ return ct(w, h, function(g){ g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "bold " + Math.floor(h*0.3) + "px Arial, sans-serif"; if(withCat){ cat(g, w/2, h*0.3, h*0.2, fg, true); } g.fillText(text, w/2, h*(withCat ? 0.72 : 0.5)); }); }
      // ---------- 돌바닥 / 화단 / 활주로 질감 ----------
      function stoneTex(){ return ct(512, 512, function(g, w, h){ g.fillStyle = "#e6dfd2"; g.fillRect(0, 0, w, h); var y = 0, row = 0; while(y < h){ var rh = 46 + rnd()*26, x = -(row%2)*40; while(x < w){ var rw = 60 + rnd()*50, sh = 226 + Math.floor(rnd()*16); g.fillStyle = "rgb(" + sh + "," + (sh - 6) + "," + (sh - 16) + ")"; rr(g, x + 2, y + 2, rw - 4, rh - 4, 14); g.fill(); g.strokeStyle = "rgba(150,138,120,0.35)"; g.lineWidth = 2; g.stroke(); x += rw; } y += rh; row++; } }, [14, 14]); }
      function bedTex(){ return ct(512, 512, function(g, w, h){ g.fillStyle = "#6e4a34"; g.fillRect(0, 0, w, h); for(var i = 0; i < 4000; i++){ g.fillStyle = "rgba(" + (80 + rnd()*70) + "," + (50 + rnd()*40) + ",30,0.6)"; g.save(); g.translate(rnd()*w, rnd()*h); g.rotate(rnd()*6.3); g.fillRect(0, 0, 14, 2.5); g.restore(); } g.strokeStyle = "#e9e4cf"; g.lineWidth = 8; for(var k = 0; k < 8; k++){ var a = k*Math.PI/4; g.beginPath(); g.moveTo(w/2, h/2); g.lineTo(w/2 + Math.cos(a)*w, h/2 + Math.sin(a)*h); g.stroke(); } g.lineWidth = 34; g.strokeStyle = "#8cc474"; g.beginPath(); g.arc(w/2, h/2, w*0.5 - 4, 0, 7); g.stroke(); }); }
      function tarmacTex(){ return ct(512, 512, function(g, w, h){ g.fillStyle = "#9a9ca6"; g.fillRect(0, 0, w, h); for(var i = 0; i < 1500; i++){ g.fillStyle = "rgba(" + (130 + rnd()*40) + "," + (132 + rnd()*40) + "," + (140 + rnd()*40) + ",0.18)"; g.fillRect(rnd()*w, rnd()*h, 30, 3); } g.strokeStyle = "#e7c64a"; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 130); g.lineTo(w, 130); g.stroke(); g.beginPath(); g.moveTo(256, 130); g.lineTo(256, h); g.stroke(); g.lineWidth = 4; g.strokeStyle = "#cfd2da"; g.setLineDash([26, 22]); g.beginPath(); g.moveTo(0, 400); g.lineTo(w, 400); g.stroke(); }, [4, 4]); }
      // ---------- 공항 섬 ----------
      function blossomTree(p, x, z, h, pink){ var t = new THREE.Group(); t.position.set(x, 0, z); p.add(t); var wood = std(0x7a5a46, { r:0.9 }); cy(t, h*0.045, h*0.07, h*0.5, wood, 0, h*0.25, 0, 8); [[-1, 0.5, 0.3], [1, 0.55, -0.2], [0.2, 0.6, 1]].forEach(function(b){ var br = cy(t, h*0.02, h*0.035, h*0.34, wood, b[0]*h*0.12, h*0.58, b[2]*h*0.12, 6); br.rotation.z = -b[0]*0.6; br.rotation.x = b[2]*0.5; });
        var cols = pink ? [0xf8cfe0, 0xf3b6cf, 0xfde6ef] : [0xffffff, 0xeef3fb, 0xdde8f6]; for(var i = 0; i < 9; i++){ var a = i*2.4, r = h*(0.22 + 0.1*rnd()); sp(t, r, std(cols[i%3], { r:0.95, em:0.35 }), Math.cos(a)*h*0.26, h*(0.62 + 0.2*rnd()), Math.sin(a)*h*0.26, 1, 0.82, 1); } sp(t, h*0.3, std(cols[0], { r:0.95, em:0.35 }), 0, h*0.86, 0, 1, 0.8, 1); }
      function lamp(p, x, z, crystalCol){ var t = new THREE.Group(); t.position.set(x, 0, z); p.add(t); var navy = std(0x2b3558, { r:0.5 }), gold = std(0xd8b04a, { r:0.35, m:0.5, em:0.25 }); bx(t, 5, 2, 5, gold, 0, 1, 0); bx(t, 3.6, 14, 3.6, navy, 0, 9, 0); bx(t, 5, 1.5, 5, gold, 0, 16.5, 0); var c = new THREE.Mesh(new THREE.OctahedronGeometry(3.4, 0), std(crystalCol || 0xbff2ff, { r:0.15, e:0x6fb8d0, tr:true, op:0.92 })); c.scale.set(0.8, 1.5, 0.8); c.position.y = 22; t.add(c); t.userData.c = c; return t; }
      function banner(p, x, z, ry){ var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.setScalar(0.68); p.add(g); var gold = std(0xd8b04a, { r:0.35, m:0.5, em:0.25 }); cy(g, 0.7, 0.9, 52, std(0x39405e, { r:0.5 }), 0, 26, 0, 8); bx(g, 22, 1.4, 1.4, gold, 0, 51, 0); var t = ct(256, 512, function(c, w, h){ c.fillStyle = "#2b3a6a"; c.fillRect(0, 0, w, h); c.fillStyle = "#d8b04a"; c.fillRect(0, 0, w, 14); c.beginPath(); c.moveTo(0, h - 60); c.lineTo(w/2, h); c.lineTo(w, h - 60); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = "#2b3a6a"; c.fill(); cat(c, w/2, 170, 74, "#ffffff", true); paw(c, w/2, 340, 70, "#ffffff"); });
        var f = new THREE.Mesh(new THREE.PlaneGeometry(18, 34), std(0xffffff, { map:t, side:THREE.DoubleSide, em:0.45 })); f.position.set(0, 32, 0.8); g.add(f); }
      function buildTerminal(p){                                           // 로컬 좌표: 건물 중심 (0, 0, 0), 정면은 -z
        var cream = std(0xefe8da, { r:0.7, em:0.28 }), navy = std(0x2f3a63, { r:0.5, em:0.22 }), gold = std(0xd8b04a, { r:0.35, m:0.5, em:0.25 }), W = 70, D = 40, Ht = 28;
        var floor = bx(p, W, 1, D, std(0xf1ece0, { map:stoneTex(), r:0.6, em:0.18 }), 0, 0.5, 0); floor.material.map.repeat.set(3, 2);
        bx(p, W, Ht, 2, cream, 0, Ht/2, D/2 - 1); bx(p, 2, Ht, D, cream, W/2 - 1, Ht/2, 0); bx(p, 2, Ht, D, cream, -W/2 + 1, Ht/2, 0);   // 뒷벽, 양옆 벽
        // 정면: 가운데 큰 아치(입구) + 양옆 기둥 + 아치 간판
        [-1, 1].forEach(function(s){ bx(p, 6, Ht + 4, 6, cream, s*(W/2 - 3), (Ht + 4)/2, -D/2 + 1); bx(p, 8, 2, 8, gold, s*(W/2 - 3), 3, -D/2 + 1); bx(p, 8, 2, 8, gold, s*(W/2 - 3), Ht + 3, -D/2 + 1); bx(p, 9, 18, 3, cream, s*28, 9, -D/2 + 1); bx(p, 9, 18, 3, cream, s*10, 9, -D/2 + 1); });
        var arch = new THREE.Mesh(new THREE.TorusGeometry(15, 2.6, 10, 36, Math.PI), cream); arch.position.set(0, 14, -D/2 + 1); p.add(arch); bx(p, 36, 4.2, 4, cream, 0, Ht + 0.5, -D/2 + 1);
        var sg = new THREE.Mesh(new THREE.CircleGeometry(15, 40, 0, Math.PI), std(0xffffff, { map:sign(512, 256, "SKY CAT AIRLINES", "#2b3a6a", "#f6e9c4", true), em:0.55 })); sg.position.set(0, 14.2, -D/2 - 0.4); sg.rotation.y = Math.PI; p.add(sg);
        // 지붕: 남색 사각 뿔 + 모서리 첨탑(고양이 귀 느낌)
        var roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(W, D)/2*0.82, 22, 4, 1), navy); roof.rotation.y = Math.PI/4; roof.scale.set(W/D*0.74, 1, 1.1); roof.position.set(0, Ht + 11, 0); p.add(roof);
        [[-W/2, -D/2], [W/2, -D/2], [-W/2, D/2], [W/2, D/2]].forEach(function(q, i){ cy(p, 4.6, 5.2, Ht + 10, cream, q[0], (Ht + 10)/2, q[1], 16); var tr = new THREE.Mesh(new THREE.ConeGeometry(6.5, 20, 16), navy); tr.position.set(q[0], Ht + 20, q[1]); p.add(tr); var sp2 = cy(p, 0.35, 0.35, 7, gold, q[0], Ht + 33, q[1], 6); });
        var spire = new THREE.Mesh(new THREE.ConeGeometry(2.6, 11, 12), navy); spire.position.set(0, Ht + 29, 0); p.add(spire); cy(p, 0.3, 0.3, 8, gold, 0, Ht + 39, 0, 6);
        // 내부: 벤치, 화분, 안내 전광판, 등불
        var bench = std(0x3c5aa6, { r:0.8, em:0.25 }); [-18, 4].forEach(function(bxp){ bx(p, 14, 3, 5, bench, bxp, 3, 12); bx(p, 14, 6, 1.6, bench, bxp, 6, 14.2); bx(p, 14, 1.5, 6, gold, bxp, 1.4, 12); });
        var board = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.5), std(0xffffff, { map:ct(256, 128, function(g, w, h){ g.fillStyle = "#14224a"; g.fillRect(0, 0, w, h); g.fillStyle = "#cfe9ff"; g.font = "bold 18px monospace"; g.fillText("SKY CAT  FLIGHT 4096", 12, 26); g.fillStyle = "#7fd6ff"; g.font = "14px monospace"; g.fillText("CHILGOK   BOARDING", 12, 56); g.fillStyle = "#ffd36a"; g.fillText("GATE 1       ON TIME", 12, 84); paw(g, 224, 90, 22, "#cfe9ff"); }), em:0.7 })); board.position.set(0, 19, D/2 - 2.1); board.rotation.y = Math.PI; p.add(board);
        [-1, 1].forEach(function(s){ cy(p, 2.4, 2.8, 4, std(0xe9e2d2, { r:0.8 }), s*29, 2.5, 5, 12); sp(p, 3.2, std(0x4a8a46, { r:0.8, em:0.3 }), s*29, 7, 5, 1, 1.1, 1); });
        [-24, 24].forEach(function(lx){ var l = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 8), std(0xffe9a8, { e:0xffd36a, r:0.3 })); l.position.set(lx, 20, D/2 - 5); p.add(l); });
        // 정문 앞 계단형 단
        bx(p, 40, 1, 4, cream, 0, 0.5, -D/2 - 1.5);
      }
      function buildGear(p, x, z){ var dk = std(0x2d2f36, { r:0.8, em:0.1 }), gr = std(0x9aa0aa, { r:0.4, m:0.6, em:0.15 }); [-1, 1].forEach(function(s){ cy(p, 2.6, 2.6, 3, dk, x, 2.6, z + s*3.2, 14).rotation.x = Math.PI/2; }); cy(p, 0.8, 0.8, 11, gr, x, 9, z, 6); }
      function buildIsland(){
        var G = new THREE.Group(); G.name = "airportIsland"; G.position.set(AX, AY, AZ);
        // 섬 몸통: 윗면 돌바닥 + 가장자리 + 아래로 뾰족한 바위
        var top = new THREE.Mesh(new THREE.CylinderGeometry(AR, AR, 3, 72), [std(0xcfc8b8, { r:0.8, em:0.25 }), std(0xf1ece0, { map:stoneTex(), r:0.6, em:0.2 }), std(0xcfc8b8)]); top.material[1].map.repeat.set(26, 26); top.position.y = -1.5; G.add(top);
        var rock = new THREE.Mesh(new THREE.ConeGeometry(AR*0.98, 150, 28, 4, true), std(0x8d8478, { r:0.95, flat:true, em:0.18 })); var P = rock.geometry.attributes.position; for(var i = 0; i < P.count; i++){ var vy = P.getY(i), k = 1 + (Math.sin(i*12.9)*0.5 + Math.sin(i*4.1)*0.5)*0.14*(vy > -70 ? 1 : 0.4); P.setX(i, P.getX(i)*k); P.setZ(i, P.getZ(i)*k); } rock.geometry.computeVertexNormals(); rock.rotation.x = Math.PI; rock.position.y = -75; G.add(rock);
        var moss = new THREE.Mesh(new THREE.CylinderGeometry(AR + 1.5, AR - 6, 7, 56, 1, true), std(0x7fbf6a, { r:0.9, em:0.25 })); moss.position.y = -6; G.add(moss);
        // 원형 화단 + 광장
        var bed = new THREE.Mesh(new THREE.CircleGeometry(32, 48), std(0xffffff, { map:bedTex(), r:0.9, em:0.3 })); bed.rotation.x = -Math.PI/2; bed.position.set(0, 0.12, -78); G.add(bed);
        // 터미널 (오른쪽 월드 +x), 탑승교, 활주로, 비행기 (왼쪽 -x)
        var term = new THREE.Group(); term.position.set(55, 0, 52); G.add(term); buildTerminal(term);
        var tar = new THREE.Mesh(new THREE.PlaneGeometry(190, 150), std(0xffffff, { map:tarmacTex(), r:0.85, em:0.22 })); tar.rotation.x = -Math.PI/2; tar.position.set(-62, 0.1, 55); G.add(tar);
        // 비행기 (날아다니는 것과 같은 모델)
        if(window.catPlaneClone){ var pl = window.catPlaneClone(); if(pl){ pl.scale.multiplyScalar(0.64); pl.position.set(-85, 13.4, 58); pl.rotation.y = 0; G.add(pl); G.userData.plane = pl; } }
        [[-18, 58], [-98, 40], [-98, 76]].forEach(function(q){ buildGear(G, q[0], q[1]); });
        // 탑승교 (유리 복도): 터미널 서쪽 벽(x=20) → 비행기 문(x≈-44, z≈45)
        var jb = new THREE.Group(); jb.position.set(-12, 0, 45); G.add(jb); var steel = std(0xe9edf2, { r:0.5, em:0.3 }), glass = std(0xa9d8f5, { r:0.1, tr:true, op:0.45, e:0x4a8ab0, side:THREE.DoubleSide });
        bx(jb, 64, 1, 13, steel, 0, 0.6, 0); bx(jb, 64, 1.4, 13, steel, 0, 14, 0); [-1, 1].forEach(function(s){ bx(jb, 64, 12, 0.5, glass, 0, 7.2, s*6.4); bx(jb, 64, 1, 1, steel, 0, 3, s*6.4); });
        for(var ji = -3; ji <= 3; ji++){ bx(jb, 1, 14, 13.6, steel, ji*10, 7, 0); }
        var jbs = ct(256, 64, function(g, w, h){ g.fillStyle = "#2b3a6a"; g.fillRect(0, 0, w, h); paw(g, 40, 38, 30, "#fff"); g.fillStyle = "#fff"; g.font = "bold 28px Arial"; g.textBaseline = "middle"; g.fillText("GATE 1", 76, 34); }); var jsg = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), std(0xffffff, { map:jbs, em:0.6 })); jsg.position.set(-28, 12.5, 38.4); jsg.rotation.y = Math.PI; G.add(jsg);
        [-8, 12, 26].forEach(function(px){ bx(G, 3, 12, 3, steel, -12 + px*2 - 24, 6, 36.5); bx(G, 3, 12, 3, steel, -12 + px*2 - 24, 6, 53.5); });
        // 난간 (활주로 쪽 경계) + 크리스털 등
        var rail = std(0xf0eadc, { r:0.6, em:0.3 }), navyP = std(0x2f3a63, { r:0.5 }); for(var a = -0.55; a <= 0.95; a += 0.07){ var rx = Math.sin(a + 0.4)*(AR - 4), rz = Math.cos(a + 0.4)*(AR - 4); if(rz < -40) continue; var seg = bx(G, 13, 6, 2.4, rail, rx, 3, rz); seg.rotation.y = a + 0.4; bx(G, 3, 9, 3, navyP, rx, 4.5, rz); }
        var lamps = []; [[18, -40], [96, -20], [128, 70], [-130, -30], [-150, 70], [-40, -100], [60, -110], [-110, 120], [20, 140]].forEach(function(q){ lamps.push(lamp(G, q[0], q[1], rnd() < 0.5 ? 0xbff2ff : 0xffc9ec)); });
        // 배너, 꽃나무, 화분
        [[-40, -30, 0], [32, -30, 0], [-40, 20, 0], [10, 22, 0]].forEach(function(q){ banner(G, q[0], q[1], q[2]); });
        [[-95, -128, 0], [-60, -140, 1], [80, -128, 0], [112, -100, 1], [140, -40, 0], [-135, -90, 1], [-30, -150, 0], [32, -150, 1]].forEach(function(q){ blossomTree(G, q[0], q[1], 28 + rnd()*10, q[2]); });
        for(var f = 0; f < 22; f++){ var fa = rnd()*6.28, fr = 20 + rnd()*(AR - 30), fx = Math.cos(fa)*fr, fz = Math.sin(fa)*fr; if(fz > 20 && fx > 20 && fx < 100) continue; if(fx < -20 && fz > -20 && fz < 140 && fr < 150) continue; var pot = new THREE.Group(); pot.position.set(fx, 0, fz); G.add(pot); cy(pot, 3.2, 2.6, 4, std(0xe9e1d0, { r:0.8 }), 0, 2, 0, 12); for(var q2 = 0; q2 < 5; q2++) sp(pot, 1.4, std(rnd() < 0.5 ? 0xffffff : 0xf5b9d2, { r:0.9, em:0.35 }), (rnd() - 0.5)*4, 5 + rnd()*2, (rnd() - 0.5)*4); }
        G.userData.lamps = lamps; return G;
      }
      function bridgeMesh(){ var g = new THREE.Group(); g.name = "airportBridge"; var len = BRG.z1 - BRG.z0; var m = std(0xe8e1d2, { r:0.7, em:0.3 }), r = std(0xf1ece0, { r:0.6, em:0.3 }); bx(g, BRG.hw*2 + 2, 2, len, m, BRG.x, AY - 1, (BRG.z0 + BRG.z1)/2); [-1, 1].forEach(function(s){ bx(g, 1.4, 5, len, r, BRG.x + s*(BRG.hw + 0.4), AY + 1.5, (BRG.z0 + BRG.z1)/2); }); var u = new THREE.Mesh(new THREE.BoxGeometry(BRG.hw*1.4, 8, len), std(0x8d8478, { r:0.95, em:0.15 })); u.position.set(BRG.x, AY - 6, (BRG.z0 + BRG.z1)/2); g.add(u); return g; }
      // ---------- 공항 하늘 배경 (참고 이미지 1번: 보라빛 구름하늘 + 떠 있는 성 섬) ----------
      var SKYT = null;
      function skyTex(mirror){ var im = new Image(); var t = new THREE.Texture(im); t.wrapS = mirror ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; im.onload = function(){ t.needsUpdate = true; }; im.src = "data:image/webp;base64,__SKYTEX__"; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
      function skyBackdrop(){ var HC = 1700, R = 1750, t = skyTex(true); t.repeat.set(2, 1); var m = new THREE.MeshBasicMaterial({ map:t, side:THREE.BackSide, fog:false, depthWrite:false, depthTest:false, color:0xffffff, transparent:true, opacity:1 }); var cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, HC, 64, 1, true), m); cyl.renderOrder = -90; cyl.frustumCulled = false; cyl.name = "airportSky"; cyl.userData.t = t; cyl.userData.HC = HC; return cyl; }
      // ---------- 기내 ----------
      function cloudTexOld(){ return ct(1024, 512, function(g, w, h){ var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5da6f0"); gr.addColorStop(0.55, "#a6d3ff"); gr.addColorStop(1, "#f3f8ff"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
          function island(x, y, s, hue){ g.fillStyle = "rgba(60,48,80,0.25)"; g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.lineTo(x, y + s*1.1); g.closePath(); g.fill(); g.fillStyle = "#c9b8e8"; g.beginPath(); g.moveTo(x - s*0.9, y); g.lineTo(x + s*0.9, y); g.lineTo(x + s*0.2, y + s*0.8); g.lineTo(x - s*0.3, y + s*0.9); g.closePath(); g.fill(); g.fillStyle = hue; g.beginPath(); g.ellipse(x, y - 2, s, s*0.22, 0, 0, 7); g.fill(); for(var k = 0; k < 5; k++){ g.fillStyle = "#e9a9c8"; g.beginPath(); g.arc(x + (k - 2)*s*0.3, y - s*0.3, s*0.17, 0, 7); g.fill(); } g.fillStyle = "#f4efe6"; g.fillRect(x - s*0.12, y - s*0.55, s*0.24, s*0.4); g.fillStyle = "#4b5c9a"; g.beginPath(); g.moveTo(x - s*0.2, y - s*0.55); g.lineTo(x, y - s*0.85); g.lineTo(x + s*0.2, y - s*0.55); g.fill(); }
          island(180, 120, 90, "#8fd08a"); island(560, 70, 55, "#8fd08a"); island(820, 150, 80, "#9ad98f"); island(380, 200, 30, "#8fd08a");
          for(var i = 0; i < 46; i++){ var cx = rnd()*w, cyy = h*(0.5 + rnd()*0.5), cr = 40 + rnd()*70; for(var q = 0; q < 6; q++){ g.fillStyle = "rgba(255,255,255," + (0.5 + rnd()*0.3) + ")"; g.beginPath(); g.arc(cx + (q - 3)*cr*0.45, cyy + Math.sin(q*2)*cr*0.2, cr*(0.5 + rnd()*0.4), 0, 7); g.fill(); } } }); }
      function cloudTex(){ var t = skyTex(false); t.repeat.set(1, 1); return t; }
      function carpetTex(){ return ct(256, 512, function(g, w, h){ g.fillStyle = "#4a69b0"; g.fillRect(0, 0, w, h); for(var i = 0; i < 1800; i++){ g.fillStyle = "rgba(" + (40 + rnd()*40) + "," + (70 + rnd()*40) + "," + (140 + rnd()*40) + ",0.18)"; g.fillRect(rnd()*w, rnd()*h, 6, 2); } g.fillStyle = "#efe3c8"; g.fillRect(18, 0, 6, h); g.fillRect(w - 24, 0, 6, h); paw(g, w/2, 120, 34, "rgba(240,232,214,0.85)"); paw(g, w/2 + 24, 330, 30, "rgba(240,232,214,0.85)"); }, [1, 6]); }
      function seatMesh(p, x, z, ry){ var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry || 0; g.scale.setScalar(0.74); p.add(g); var blue = std(0x2f58b0, { r:0.95, em:0.32 }), cream = std(0xefe8da, { r:0.6, em:0.3 }), gold = std(0xd8b04a, { r:0.35, m:0.6, em:0.25 });
        bx(g, 9, 3.2, 8, blue, 0, 3.2, 0); bx(g, 9, 11, 3, blue, 0, 8.4, 3.4); [-1, 1].forEach(function(s){ bx(g, 1.8, 6, 7.5, cream, s*5.4, 4.6, 0); bx(g, 1.8, 0.7, 7.6, gold, s*5.4, 7.7, 0); var e = new THREE.Mesh(new THREE.ConeGeometry(1.9, 3.4, 4), blue); e.position.set(s*3.4, 15.4, 3.4); g.add(e); });
        var pr = new THREE.Mesh(new THREE.PlaneGeometry(6, 4.4), std(0xffffff, { map:ct(128, 96, function(c, w2, h2){ c.fillStyle = "#f3efe6"; c.fillRect(0, 0, w2, h2); paw(c, 64, 52, 36, "#4a82d0"); }), em:0.5 })); pr.position.set(0, 12.2, 1.8); pr.rotation.y = Math.PI; g.add(pr); bx(g, 9.4, 1, 9, cream, 0, 0.5, 0); return g; }
      function buildCabin(){
        var G = new THREE.Group(); G.name = "catCabin"; G.position.set(CX, CY, CZ);
        var cream = std(0xf0e8d8, { r:0.55, em:0.34, side:THREE.BackSide }), gold = std(0xd8b04a, { r:0.3, m:0.6, em:0.28 }), blue = std(0x2f58b0, { r:0.95, em:0.32 }), navy = std(0x1f3a7a, { r:0.9, em:0.25 });
        // 바닥/카펫/벽/천장
        bx(G, CW, 1, CL, std(0xefe6d2, { r:0.7, em:0.5 }), 0, -0.5, 0); var cp = new THREE.Mesh(new THREE.PlaneGeometry(18, CL - 10), std(0xffffff, { map:carpetTex(), r:0.95, em:0.35 })); cp.rotation.x = -Math.PI/2; cp.position.y = 0.06; G.add(cp);
        [-1, 1].forEach(function(s){ var w = bx(G, 1, CH, CL, std(0xf6efe0, { r:0.6, em:0.62 }), s*CW/2, CH/2, 0); bx(G, 1.4, 1.6, CL, gold, s*(CW/2 - 0.4), 6, 0); bx(G, 1.4, 1.2, CL, gold, s*(CW/2 - 0.4), CH - 0.6, 0); });
        var arch = new THREE.Mesh(new THREE.CylinderGeometry(CW/2, CW/2, CL, 40, 1, true, Math.PI/2, Math.PI), std(0xf8f2e6, { r:0.55, em:0.66, side:THREE.BackSide })); arch.rotation.x = Math.PI/2; arch.scale.set(1, 1, 0.46); arch.position.y = CH; G.add(arch);
        [-1, 1].forEach(function(s){ var cove = new THREE.Mesh(new THREE.CylinderGeometry(CW/2 - 1.4, CW/2 - 1.4, CL - 6, 40, 1, true, s > 0 ? Math.PI*0.62 : Math.PI*1.0, Math.PI*0.04), std(0xffe9b0, { e:0xffd87a, side:THREE.DoubleSide })); cove.rotation.x = Math.PI/2; cove.scale.set(1, 1, 0.46); cove.position.y = CH - 0.2; G.add(cove); });
        var cen = new THREE.Mesh(new THREE.PlaneGeometry(14, 30), std(0xffffff, { map:ct(256, 512, function(g, w, h){ g.fillStyle = "#9a9588"; g.fillRect(0, 0, w, h); g.strokeStyle = "#ffe49a"; g.lineWidth = 12; rr(g, 12, 12, w - 24, h - 24, 40); g.stroke(); paw(g, w/2, h/2, 90, "#fff6df"); }), em:0.7 })); cen.rotation.x = Math.PI/2; cen.position.set(0, CH + 14.2, 0); G.add(cen);
        // 앞/뒤 벽 (앞 = +z : 문 + 그림 액자, 뒤 = -z : 탑승구)
        bx(G, CW, CH + 14, 1, std(0xf6efe0, { r:0.6, em:0.62 }), 0, (CH + 14)/2, CL/2); bx(G, CW, CH + 14, 1, std(0xf6efe0, { r:0.6, em:0.62 }), 0, (CH + 14)/2, -CL/2);
        var door = new THREE.Mesh(new THREE.PlaneGeometry(13, 22), std(0xffffff, { map:ct(128, 256, function(g, w, h){ g.fillStyle = "#6f86ad"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d8b04a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); cat(g, w/2, 100, 36, "#dfe9f7", true); }), em:0.5 })); door.position.set(9, 11, CL/2 - 0.6); door.rotation.y = Math.PI; G.add(door);
        var pic = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), std(0xffffff, { map:cloudTex(), em:0.9 })); pic.position.set(-10, 15, CL/2 - 0.6); pic.rotation.y = Math.PI; G.add(pic); bx(G, 21.6, 13.6, 0.6, gold, -10, 15, CL/2 - 0.3);
        var dd = new THREE.Mesh(new THREE.PlaneGeometry(14, 24), std(0xffffff, { map:ct(128, 256, function(g, w, h){ g.fillStyle = "#e9edf5"; g.fillRect(0, 0, w, h); g.strokeStyle = "#d8b04a"; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); cat(g, w/2, 100, 38, "#2b3a6a", false); g.fillStyle = "#2b3a6a"; g.font = "bold 18px Arial"; g.textAlign = "center"; g.fillText("EXIT", w/2, 200); }), em:0.6 })); dd.position.set(0, 12, -CL/2 + 0.6); G.add(dd);
        // 창문 (양쪽 각 12개): 금테 + 구름/하늘섬 그림 (흘러가요)
        var ct1 = cloudTex(); ct1.repeat.set(0.1, 0.55); ct1.offset.set(0, 0.06); G.userData.cloud = ct1; var winMat = new THREE.MeshBasicMaterial({ map:ct1, side:THREE.DoubleSide, fog:false });
        [-1, 1].forEach(function(s){ for(var i = 0; i < 12; i++){ var wz = -100 + i*18.2; var w = new THREE.Mesh(new THREE.CircleGeometry(1, 28), winMat); w.scale.set(5.2, 8, 1); w.position.set(s*(CW/2 - 0.7), 15.5, wz); w.rotation.y = -s*Math.PI/2; G.add(w); var fr = new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 8, 28), gold); fr.scale.set(5.6, 8.4, 1); fr.position.copy(w.position); fr.position.x -= s*0.2; fr.rotation.y = w.rotation.y; G.add(fr);
            if(i % 3 === 0){ [-1, 1].forEach(function(t2){ bx(G, 0.6, 18, 2.2, navy, s*(CW/2 - 1.4), 14, wz + t2*6.2); }); } } });
        // 좌석 (고양이 귀, 파란 시트): 양쪽 통로 옆, 앞을 봐요
        [-82, -64, -46, -28].forEach(function(z){ [[-14, 0], [-26, 0], [14, 0], [26, 0]].forEach(function(q){ seatMesh(G, q[0], z, Math.PI); }); });
        // 라운지: 둥근 소파 + 대리석 테이블 + 고양이 귀 램프 + 꽃병
        [[-27, 55], [-27, 78], [27, 55], [27, 78]].forEach(function(q, i){ var sf = new THREE.Group(); sf.position.set(q[0], 0, q[1]); G.add(sf); var s = q[0] < 0 ? -1 : 1; bx(sf, 9, 4, 16, blue, 0, 3, 0); bx(sf, 3, 10, 16, blue, s*3, 8, 0); bx(sf, 9.6, 1, 16.6, gold, 0, 1, 0);
          var pl = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), std(0xffffff, { map:ct(64, 64, function(c){ c.fillStyle = "#f2ede2"; c.fillRect(0, 0, 64, 64); paw(c, 32, 36, 22, "#4a82d0"); }), em:0.5 })); pl.position.set(-s*1.2, 7.5, -2); pl.rotation.y = -s*Math.PI/2; sf.add(pl); });
        [[-12, 66], [12, 66]].forEach(function(q){ var t = new THREE.Group(); t.position.set(q[0], 0, q[1]); G.add(t); cy(t, 5.6, 5.6, 0.8, std(0xf4f0e8, { r:0.3, em:0.4 }), 0, 7, 0, 32); cy(t, 0.7, 0.7, 7, gold, 0, 3.5, 0, 8); cy(t, 3, 3.4, 0.5, gold, 0, 0.3, 0, 16); var lg = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 8), std(0xffe29a, { e:0xffc860 })); lg.position.set(-2, 8.7, 0); t.add(lg); var e2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.1, 4), std(0xffe29a, { e:0xffc860 })); e2.position.set(-2.8, 10, 0); t.add(e2); cy(t, 0.9, 1.1, 2.3, std(0xffffff, { r:0.4 }), 2, 8.4, 0, 10); [0, 1, 2].forEach(function(k){ sp(t, 1, std(0xffffff, { r:0.9, em:0.4 }), 2 + (k - 1)*1.1, 10.8 + k*0.3, 0, 1, 1.2, 1); }); });
        // 계단 난간 (오른쪽, 아래층으로) + 고양이 엠블럼 패널
        var rg = new THREE.Group(); rg.position.set(26, 0, 12); G.add(rg); [[0, 0], [0, 30]].forEach(function(q){ cy(rg, 0.5, 0.5, 8, gold, 0, 4, q[1] - 10, 8); }); [3, 6].forEach(function(hh){ var r1 = cy(rg, 0.5, 0.5, 32, gold, 0, hh, 5, 8); r1.rotation.x = Math.PI/2; });
        var em = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), std(0xffffff, { map:ct(128, 128, function(g, w, h){ g.fillStyle = "#efe8da"; g.fillRect(0, 0, w, h); cat(g, 64, 70, 38, "#d8b04a", false); }), em:0.6 })); em.position.set(CW/2 - 0.6, 12, -4); em.rotation.y = -Math.PI/2; G.add(em);
        // 화분
        [[-30, 100], [30, 100], [-30, -100], [30, -100]].forEach(function(q){ cy(G, 2.4, 2, 4, std(0xe9e1d0, { r:0.8 }), q[0], 2, q[1], 12); sp(G, 3, std(0x4a8a46, { r:0.8, em:0.3 }), q[0], 6.5, q[1], 1, 1.1, 1); });
        return G;
      }
      // ---------- 이동 가능 영역 (SKY 높이 후보에 더해져요) ----------
      var IB = [ { x:55, z:52, hx:35, hz:20 }, { x:-85, z:58, hx:72, hz:15 }, { x:-62, z:45, hx:60, hz:1.2 }, { x:-62, z:45, hx:60, hz:1.2 } ];  // 섬 로컬: 터미널 건물(안쪽 빼고), 비행기
      var TERM_DOOR = { x0:55 - 15, x1:55 + 15, z:32 };
      function inTerminalBody(lx, lz){ var tx = lx - 55, tz = lz - 52; if(Math.abs(tx) < 35 && Math.abs(tz) < 20){ if(Math.abs(tx) < 33 && Math.abs(tz) < 18) return false; return true; } return false; }
      function islandBlocked(lx, lz){
        if(inTerminalBody(lx, lz)) return true;
        if(lx > -158 && lx < -26 && lz > 40 && lz < 74 && !(lx > -50 && lz < 52)) return true;     // 비행기 동체 (탑승교 끝은 열려 있어요)
        if(lx > -170 && lx < -10 && lz > 74 && lz < 135) return true;                                  // 날개 쪽
        if(Math.abs(lx + 40) < 7 && lz > 80 && lz < 135 && false) return true;
        return false;
      }
      window.airCands = function(x, z, c){
        var lx = x - AX, lz = z - AZ;
        if(lx*lx + lz*lz <= (AR - 3)*(AR - 3)){ if(!islandBlocked(lx, lz) && !(Math.abs(lx - 0) < 0 )) c.push(AY); }
        if(Math.abs(x - BRG.x) <= BRG.hw && z >= BRG.z0 - 3 && z <= BRG.z1 + 3) c.push(AY);
        if(lx > -64 && lx < 21 && lz > 38.5 && lz < 51.5) c.push(AY);                                    // 탑승교 복도
        if(Math.abs(x - CX) < CW/2 - 3 && Math.abs(z - CZ) < CL/2 - 3){ var cx = x - CX, cz = z - CZ, hit = false;
          [-82, -64, -46, -28].forEach(function(sz){ if(Math.abs(cz - sz) < 5 && ((Math.abs(cx - 14) < 5.5) || (Math.abs(cx + 14) < 5.5) || (Math.abs(cx - 26) < 5.5) || (Math.abs(cx + 26) < 5.5))) hit = true; });
          [[-27, 55], [-27, 78], [27, 55], [27, 78]].forEach(function(q){ if(Math.abs(cx - q[0]) < 6.5 && Math.abs(cz - q[1]) < 9) hit = true; }); [[-12, 66], [12, 66]].forEach(function(q){ if(Math.hypot(cx - q[0], cz - q[1]) < 6.5) hit = true; });
          if(!hit) c.push(CY); }
      };
      // 카메라가 벽 밖으로 나가지 않게 (CAM_RECTS 는 월드 높이 -1 ~ h 범위로 가려요)
      function camWalls(){ var R = window.CAM_RECTS; if(!R) return; var H = CY + 80; R.push({ x:CX - CW/2 - 6, z:CZ, hx:6, hz:CL/2 + 12, h:H }); R.push({ x:CX + CW/2 + 6, z:CZ, hx:6, hz:CL/2 + 12, h:H }); R.push({ x:CX, z:CZ - CL/2 - 6, hx:CW/2 + 12, hz:6, h:H }); R.push({ x:CX, z:CZ + CL/2 + 6, hx:CW/2 + 12, hz:6, h:H }); }
      // ---------- 상호작용 ----------
      var DEST = [
        { id:"city",   name:"왜관 시내",         x:0,    z:20,   y:0, yaw:0 },
        { id:"bridge", name:"호국의 다리",       x:0,    z:500,  y:0, yaw:0 },
        { id:"fall",   name:"폭포 (개울가)",     x:-215, z:600,  y:0, yaw:0 },
        { id:"gasan",  name:"가산산성",          x:-220, z:1000, y:0, yaw:0 },
        { id:"songrim",name:"송림사",            x:-430, z:1050, y:0, yaw:0 },
        { id:"river",  name:"칠곡보 생태공원",   x:0,    z:1650, y:0, yaw:0 },
        { id:"mem",    name:"칠곡호국평화기념관", x:0,    z:2300, y:0, yaw:0 },
        { id:"park",   name:"가산수피아",        x:520,  z:1250, y:0, yaw:0 },
        { id:"vil",    name:"칠곡 농촌 마을",    x:-862, z:458,  y:0, yaw:Math.PI },
        { id:"air",    name:"스카이캣 공항 (하늘섬)", x:AX, z:AZ - AR + 24, y:AY, yaw:0 }
      ];
      var ROUTE = ["왜관 시내", "호국의 다리 · 폭포", "가산산성 · 송림사", "칠곡보 생태공원", "칠곡호국평화기념관", "가산수피아", "칠곡 농촌 마을", "구름바다 · 하늘섬"];
      var ui = null;
      function mkUI(){
        if(ui) return ui; var holder = document.getElementById("canvasHolder"); if(!holder) return null; ui = {};
        var hud = document.createElement("div"); hud.style.cssText = "position:absolute;left:50%;top:44px;transform:translateX(-50%);background:rgba(20,30,60,.72);color:#fff;padding:6px 16px;border-radius:14px;font-size:13px;font-weight:700;pointer-events:none;z-index:7;display:none;text-align:center;"; holder.appendChild(hud); ui.hud = hud;
        var menu = document.createElement("div"); menu.style.cssText = "position:absolute;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(10,20,50,.45);"; var box = document.createElement("div"); box.style.cssText = "background:#fffaf0;border:3px solid #d8b04a;border-radius:18px;padding:16px 18px;width:min(420px,90%);max-height:88%;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.4);font-family:inherit;color:#2b3a6a;";
        box.innerHTML = '<div style="font-weight:800;font-size:16px;margin-bottom:4px">👨‍✈️ 선장님 방송</div><div style="font-size:13px;margin-bottom:10px;color:#5b6890">“승객 여러분, 어디에서 내려 드릴까요?”</div>'; var list = document.createElement("div"); list.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px;"; box.appendChild(list); var cancel = document.createElement("button"); cancel.textContent = "계속 비행하기 (J)"; cancel.style.cssText = "margin-top:10px;width:100%;padding:8px;border-radius:10px;border:2px solid #d8b04a;background:#fff;font-weight:700;cursor:pointer;font-family:inherit;color:#2b3a6a;"; box.appendChild(cancel); menu.appendChild(box); holder.appendChild(menu);
        ui.menu = menu; ui.list = list; cancel.addEventListener("click", function(e){ e.stopPropagation(); closeMenu(); }); ui.cancel = cancel; return ui; }
      function inCabin(p){ return Math.abs(p.x - CX) < CW/2 + 4 && Math.abs(p.z - CZ) < CL/2 + 4 && Math.abs(SKY_REF - CY) < 12; }
      function nearBoard(p){ return Math.hypot(p.x - (AX - 62), p.z - (AZ + 45)) < 10 && Math.abs(SKY_REF - AY) < 8; }
      function nearExit(p){ return inCabin(p) && p.z < CZ - CL/2 + 22 && Math.abs(p.x - CX) < 14; }
      function openMenu(){ var u = mkUI(); if(!u) return; u.list.innerHTML = ""; DEST.forEach(function(d){ if(S.state === "parked" && d.id !== "air") { /* 주차 중에도 어디든 가능 */ } var b = document.createElement("button"); b.textContent = d.name; b.style.cssText = "padding:8px 6px;border-radius:10px;border:2px solid #cdd7ee;background:#f4f7ff;font-weight:700;cursor:pointer;font-family:inherit;color:#2b3a6a;font-size:13px;" + (d.id === "air" ? "grid-column:1 / span 2;border-color:#d8b04a;background:#fff3d4;" : ""); b.addEventListener("click", function(e){ e.stopPropagation(); land(d); }); u.list.appendChild(b); }); u.menu.style.display = "flex"; S.menu = true; }
      function closeMenu(){ if(ui) ui.menu.style.display = "none"; S.menu = false; }
      function land(d){ closeMenu(); var p = state.player; if(window.skyTeleport) window.skyTeleport(p, d.x, d.z, d.y); var cs = state.cam; cs.yaw = cs.target = d.yaw; cs.fx = d.x; cs.fz = d.z; cs.prevV = 999; SKY_REF = d.y; S.state = "none"; if(ui) ui.hud.style.display = "none"; if(typeof showToast === "function") showToast("🛬 " + d.name + "에 도착했어요! 안녕히 가세요, 스카이캣 항공이었어요 🐾"); }
      window.airKey = function(){ var p = state.player; if(S.menu){ closeMenu(); return; } if(inCabin(p)) openMenu(); };
      window.airHint = function(p){ if(S.menu) return null; if(nearBoard(p)) return "E 눌러 스카이캣 항공 탑승하기"; if(nearExit(p) && S.state !== "flying") return "E 눌러 비행기에서 내리기 · J 선장님께 부탁하기"; if(inCabin(p)) return S.state === "flying" ? "J 눌러 선장님께 내릴 곳 말하기" : "J 눌러 선장님과 이야기하기"; return null; };
      window.airInteract = function(p){
        if(S.menu) return true;
        if(nearBoard(p)){ if(window.skyTeleport) window.skyTeleport(p, CX, CZ - CL/2 + 14, CY); var cs = state.cam; cs.yaw = cs.target = 0; SKY_REF = CY; S.state = "parked"; S.t = 0; S.place = 0; if(typeof showToast === "function") showToast("✈ 스카이캣 항공에 탑승했어요! 잠시 후 출발해요 · J 로 선장님께 말할 수 있어요"); return true; }
        if(nearExit(p)){ if(S.state === "flying"){ if(typeof showToast === "function") showToast("🛫 비행 중이에요! 내리려면 J 를 눌러 선장님께 말해 주세요."); return true; } land(DEST[DEST.length - 1]); return true; }
        return false;
      };
      window.airPlace = function(p){ if(p.x < 700) return null; if(inCabin(p)) return { id:"cabin", name:"스카이캣 항공 기내", sub:S.state === "flying" ? "구름 위를 날고 있어요 ✈" : "곧 출발해요 ✈" }; var lx = p.x - AX, lz = p.z - AZ; if(lx*lx + lz*lz < (AR + 10)*(AR + 10) && Math.abs(SKY_REF - AY) < 8) return { id:"airport", name:"스카이캣 공항", sub:"하늘섬 맨 위 탑승장" }; return null; };
      // ---------- 매 프레임 ----------
      window.airTick = function(t, dt, p){
        if(!window.__riverBuilt && !window.__dbgForceAir) return;
        if(!built){ built = true; SKYB = skyBackdrop(); scene.add(SKYB); SKYB.visible = false; GA = buildIsland(); scene.add(GA); GA.visible = false; var br = bridgeMesh(); GA.userData.br = br; scene.add(br); br.visible = false; GC = buildCabin(); scene.add(GC); GC.visible = false; camWalls(); }
        var nearA = p.x > 900 && p.z > 1900 && Math.abs(p.x - AX) < 700, nearC = inCabin(p);
        GA.visible = nearA || nearC; GA.userData.br.visible = nearA; GC.visible = nearC;
        var cam = three.camera; SKYB.visible = nearA && !nearC; if(SKYB.visible){ SKYB.position.set(cam.position.x, cam.position.y + 0.15*SKYB.userData.HC, cam.position.z); }
        if(GA.visible && !GA.userData.plane && !GA.userData.planeTried && window.catPlaneClone){ GA.userData.planeTried = true; var pl = window.catPlaneClone(); if(pl){ pl.scale.multiplyScalar(0.64); pl.position.set(-85, 13.4, 58); GA.add(pl); GA.userData.plane = pl; } }
        if(GA.visible){ var ls = GA.userData.lamps, i; for(i = 0; i < ls.length; i++){ ls[i].userData.c.rotation.y = t/900 + i; ls[i].userData.c.position.y = 22 + Math.sin(t/700 + i)*0.8; } }
        if(S.state !== "none" && !nearC){ S.state = "none"; if(ui) ui.hud.style.display = "none"; }
        if(nearC){
          S.t += dt; var u = mkUI();
          if(S.state === "parked" && S.t > 6){ S.state = "flying"; S.t = 0; if(typeof showToast === "function") showToast("🛫 이륙합니다! 구름 위로 올라가요 ☁"); }
          if(S.state === "flying"){ var cl = GC.userData.cloud; cl.offset.x = (cl.offset.x + dt*0.02) % 1; S.place = Math.floor(S.t/9) % ROUTE.length; }
          GC.position.y = CY + (S.state === "flying" ? Math.sin(t/900)*0.12 : 0);
          if(u){ u.hud.style.display = S.menu ? "none" : "block"; u.hud.textContent = S.state === "flying" ? "✈ 비행 중 · 지금 지나는 곳: " + ROUTE[S.place] + " · J 내리기" : "✈ 탑승 완료 · 곧 이륙합니다"; }
        }
      };
    })();
