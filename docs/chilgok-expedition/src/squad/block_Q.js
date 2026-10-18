    // ================= 정예 분대 전투 (10 대 10, 고정 쿼터뷰 타일 전술) =================
    // 1만 대 1만 전선 전투와 따로 가는 작은 전술 전투예요. 맵 밖 별도 무대(x 0, z -60000)에 만들어서 칠곡원정대 맵은 건드리지 않아요.
    // 이기면 국군 공격력 +5 (누적, "사기 진작") — 1만 대 1만 전투에서 적용돼요. 캐릭터 그림은 전부 코드로 그린 임시 그림이에요 (나중에 고화질 그림으로 교체).
    (function buildSquad(){
      var SQ = window.SQ = { active:false, units:[], phase:1, cur:null, mode:"idle", auto:false, log:[] };
      var TS = 8, N = 12, CX = 0, CZ = -60000, MAXPH = 8, built = false;
      var CL = {
        leader:{ name:"토끼 대장", hp:120, atk:28, def:0.10, mov:4, rng:2, spd:108, sk:{ id:"rally", name:"돌격 호령", icon:"📣", cd:3, kind:"allies", rad:4, desc:"주변 4칸 아군 공격력 +25% (2페이즈)" } },
        hamgoki:{ name:"함곡이", hp:110, atk:30, def:0.10, mov:3, rng:1, spd:99, sk:{ id:"gas", name:"독가스", icon:"🧪", cd:4, kind:"gas", rng:4, rad:1, desc:"대상과 주변 적에게 독 (3페이즈, 매 페이즈 -10)" } },
        rifle:{ name:"소총수", hp:90, atk:26, def:0.10, mov:3, rng:4, spd:92, sk:{ id:"aim", name:"조준 사격", icon:"🎯", cd:2, kind:"single", mult:1.5, desc:"엄폐를 무시하고 피해 150%" } },
        mg:{ name:"기관총수", hp:100, atk:18, def:0.10, mov:2, rng:5, spd:70, sk:{ id:"burst", name:"제압 사격", icon:"💥", cd:3, kind:"area", rad:1, mult:0.8, desc:"대상과 주변 1칸 모두 피해 80%" } },
        sniper:{ name:"저격수", hp:70, atk:42, def:0.05, mov:2, rng:8, spd:84, sk:{ id:"snipe", name:"헤드샷", icon:"🔭", cd:3, kind:"single", mult:2.2, desc:"피해 220% (멀리서도 정확)" } },
        shield:{ name:"방패병", hp:140, atk:18, def:0.30, mov:2, rng:1, spd:56, sk:{ id:"taunt", name:"도발", icon:"🛡", cd:4, kind:"self", rad:5, desc:"주변 5칸 적이 2페이즈 동안 나만 공격해요" } },
        medic:{ name:"의무병", hp:80, atk:10, def:0.05, mov:3, rng:3, spd:79, sk:{ id:"heal", name:"치료", icon:"✚", cd:2, kind:"ally", rng:3, heal:45, desc:"아군 1명 체력 45 회복" } },
        sapper:{ name:"공병", hp:90, atk:20, def:0.10, mov:3, rng:2, spd:71, sk:{ id:"trap", name:"함정 설치", icon:"☠", cd:2, kind:"tile", rng:2, dmg:20, desc:"빈 칸에 함정 (밟은 적 -20)" } },
        lucia:{ name:"루샤", hp:200, atk:34, def:0.15, mov:3, rng:4, spd:105, sk:{ id:"gloom", name:"음침한 기운", icon:"😈", cd:4, kind:"self", rad:6, desc:"주변 6칸 적 공격력 -20% (3페이즈)" } },
        assault:{ name:"돌격병", hp:100, atk:30, def:0.10, mov:4, rng:1, spd:88, sk:{ id:"dash", name:"돌진", icon:"🏃", cd:3, kind:"dash", rng:4, mult:1.3, desc:"멀리서 달려가 피해 130%" } },
        gasman:{ name:"독가스병", hp:90, atk:18, def:0.10, mov:3, rng:4, spd:73, sk:{ id:"gas", name:"독가스", icon:"🧪", cd:4, kind:"gas", rng:4, rad:1, desc:"대상과 주변 적에게 독 (3페이즈, 매 페이즈 -10)" } },
        scout:{ name:"정찰병", hp:75, atk:22, def:0.05, mov:5, rng:3, spd:96, sk:{ id:"ambush", name:"기습 사격", icon:"🐾", cd:3, kind:"single", mult:1.6, desc:"피해 160% (빠르게 치고 빠져요)" } },
        grenadier:{ name:"척탄병", hp:95, atk:24, def:0.10, mov:3, rng:4, spd:76, sk:{ id:"grenade", name:"수류탄", icon:"💣", cd:3, kind:"area", rad:1, mult:1.1, desc:"대상과 주변 1칸 모두 피해 110%" } }
      };
      var COLS = { rok:[5, 6, 4, 7, 3, 8, 2, 1, 9, 10], nk:[5, 4, 6, 3, 7, 2, 8, 9, 1, 10] };      // 시작 칸 (대장이 가운데)
      var ROST = { rok:["leader", "hamgoki", "rifle", "scout", "grenadier", "mg", "sniper", "shield", "medic", "sapper"], nk:["lucia", "rifle", "scout", "grenadier", "mg", "sniper", "assault", "assault", "medic", "gasman"] };
      // 칸 종류: ~ 강(헤엄, 이동력 2점)  B 다리  1·2·3 초록 산(한 칸씩 올라가요, 높이 1~3)  M 높은 언덕  A 험한 바위산(못 가요)  t 숲(못 가요)  x 가시 함정(밟으면 -5)  . 풀밭  m 진흙(이동력 2점)  p 논(이동력 2점)  H 언덕(높이 +1, 공격 +10%)  T 천막(walkable=false, 옆 칸 엄폐)  W 돌담(walkable=false)  x/y/z 함정(15/20/25)
      var MAPS = ["............", "11111..HH.t.", "12221....tt.", "12321.mm.x..", "12221.mm.~~~", "11111~~B~~..", "..~B~~.pp.W.", "~~~..x..pp..", "111..WW.t.mm", "121....t..x.", "111..mm....t", "............"];     // 위 줄이 북한군 쪽 (j = 11 … 0)
      var EFN = { focus:{ icon:"🎯", name:"집중", desc:"첫 피격 피해 +50%, 맞으면 해제", col:"#ffd34d" }, dot:{ icon:"☠", name:"독", desc:"매 페이즈 피해 10", col:"#6fdc4a" }, taunt:{ icon:"🛡", name:"도발", desc:"도발한 유닛만 공격할 수 있어요", col:"#7fb4ff" }, atkup:{ icon:"📣", name:"사기 상승", desc:"공격력 +25%", col:"#ff9a4a" }, weak:{ icon:"😈", name:"약화", desc:"공격력 -20%", col:"#b06aff" }, guard:{ icon:"🛡", name:"방어 자세", desc:"받는 피해 -50% (다음 내 차례까지)", col:"#9fe0ff" } };
      var tiles = [], root3 = null, boardMesh = null, hlMesh = null, ring = null, arrow = null, trapMeshes = [], tentMeshes = [], hover = null, floats = [], PICK = [], saved = null;
      function later(fn, ms){ return setTimeout(fn, ms*(SQ.tScale || 1)); }
      function key(i, j){ return i + "," + j; }
      function inb(i, j){ return i >= 0 && j >= 0 && i < N && j < N; }
      function manh(a, b){ return Math.abs(a.i - b.i) + Math.abs(a.j - b.j); }
      function tx(i){ return CX + (i - N/2 + 0.5)*TS; } function tz(j){ return CZ + (j - N/2 + 0.5)*TS; }
      function topY(t){ return t.top !== undefined ? t.top : 1 + t.h*3; }
      function surfY(t){ return t.type === "water" ? 0.4 : topY(t); }
      function rr(){ return Math.random(); }

      // ---------- 캐릭터 그림 (코드로 그린 임시 그림) ----------
      var SPEC = {
        leader:{ skin:"#fff6f0", hair:"#ffffff", hat:"ears", hatc:"#ffffff", body:"#5b7a45", acc:"#d7332e", wep:"stick" }, hamgoki:{ skin:"#ffe2b8", hair:"#e8a64a", hat:"hood", hatc:"#d98a2b", body:"#8a5a2b", acc:"#fff", wep:"flask" },
        rifle:{ skin:"#f6d2ae", hair:"#3a2a1a", hat:"helmet", hatc:"#5b7a45", body:"#6b8c4f", acc:"#2f4a22", wep:"rifle" }, mg:{ skin:"#f6d2ae", hair:"#2a1c10", hat:"helmet", hatc:"#4d6b3a", body:"#58773f", acc:"#2f4a22", wep:"mg" },
        sniper:{ skin:"#f6d2ae", hair:"#6a4a22", hat:"beret", hatc:"#3d5a2e", body:"#4d6a3c", acc:"#222", wep:"sniper" }, shield:{ skin:"#f0c9a0", hair:"#222", hat:"helmet", hatc:"#6a7078", body:"#5a7048", acc:"#9aa4b0", wep:"shield" },
        medic:{ skin:"#f8d9bb", hair:"#a8641e", hat:"cap", hatc:"#ffffff", body:"#e9f1e2", acc:"#d7332e", wep:"kit" }, sapper:{ skin:"#f2cba2", hair:"#3a2a1a", hat:"helmet", hatc:"#c9a227", body:"#76603a", acc:"#444", wep:"wrench" },
        lucia:{ skin:"#f6e4f0", hair:"#6a2a9a", hat:"horns", hatc:"#d9a0ff", body:"#2a1840", acc:"#ff4a6a", wep:"staff" }, assault:{ skin:"#e8c19a", hair:"#2a1c10", hat:"cap", hatc:"#8a5a2a", body:"#9a6a3a", acc:"#c43a2a", wep:"blade" },
        gasman:{ skin:"#e8c19a", hair:"#222", hat:"mask", hatc:"#6b6f4a", body:"#8a7048", acc:"#7be04a", wep:"flask" },
        scout:{ skin:"#f2cba2", hair:"#5a3a1a", hat:"bandana", hatc:"#d7332e", body:"#6e8a4a", acc:"#3a5a2a", wep:"rifle" }, grenadier:{ skin:"#e6bf98", hair:"#2a1c10", hat:"helmet", hatc:"#6a6f3a", body:"#5f6f3a", acc:"#c9a227", wep:"grenade" }
      };
      var VARI = { rifle:1, mg:1, sniper:1, shield:1, sapper:1, assault:1, scout:1, grenadier:1, gasman:1 }, SKINS = ["#f6d2ae", "#e8c19a", "#fbe0c8", "#d9a67a", "#f2cba2"], HAIRS = ["#3a2a1a", "#2a1c10", "#6a4a22", "#a8641e", "#1a1a1a", "#7a5a30"];
      var artCache = {};
      function drawChibi(cl, side, v){
        v = v || 0; var k = cl + side + v; if(artCache[k]) return artCache[k]; var sp = SPEC[cl]; if(v && VARI[cl]){ var sp1 = {}; for(var q0 in sp) sp1[q0] = sp[q0]; sp1.skin = SKINS[v % SKINS.length]; sp1.hair = HAIRS[(v*3) % HAIRS.length]; sp = sp1; } var cv = document.createElement("canvas"); cv.width = 128; cv.height = 192; var g = cv.getContext("2d"), nkTint = side === "nk";
        var body = nkTint && cl !== "lucia" ? "#9a6a3a" : sp.body, hatc = nkTint && cl !== "lucia" && cl !== "leader" ? "#7a4f2a" : sp.hatc;
        g.lineJoin = "round"; g.lineCap = "round"; g.strokeStyle = "#2a2018"; g.lineWidth = 3.5;
        function ell(x, y, rx, ry, col){ g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fill(); g.stroke(); }
        function rrect(x, y, w, h, r, col){ g.fillStyle = col; g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); g.fill(); g.stroke(); }
        // 다리 / 몸 / 팔
        rrect(46, 150, 15, 30, 6, "#3b3328"); rrect(67, 150, 15, 30, 6, "#3b3328"); ell(53, 181, 11, 6, "#2a2018"); ell(75, 181, 11, 6, "#2a2018");
        rrect(36, 100, 56, 58, 16, body); rrect(48, 112, 32, 8, 3, sp.acc);
        rrect(22, 104, 15, 40, 7, body); rrect(91, 104, 15, 40, 7, body); ell(29, 146, 8, 8, sp.skin); ell(99, 146, 8, 8, sp.skin);
        // 무기
        var w = sp.wep; g.fillStyle = "#555";
        if(w === "rifle" || w === "mg" || w === "sniper"){ var L = w === "sniper" ? 78 : (w === "mg" ? 60 : 64); rrect(92, 124, L, 9, 3, "#4a3a2a"); rrect(92 + L - 24, 119, 22, 6, 2, "#333"); if(w === "mg") rrect(120, 134, 10, 18, 3, "#333"); }
        else if(w === "shield"){ rrect(2, 98, 36, 56, 9, "#aab4c0"); rrect(8, 104, 24, 44, 6, "#cdd6e0"); g.fillStyle = "#d7332e"; g.fillRect(15, 118, 10, 16); }
        else if(w === "kit"){ rrect(96, 130, 26, 22, 4, "#fff"); g.fillStyle = "#d7332e"; g.fillRect(106, 134, 6, 14); g.fillRect(101, 139, 16, 4); }
        else if(w === "wrench"){ rrect(100, 96, 8, 54, 3, "#888"); ell(104, 94, 11, 8, "#aaa"); }
        else if(w === "flask"){ ell(106, 134, 11, 13, sp.acc === "#fff" ? "#e8d6a8" : "#7be04a"); rrect(102, 114, 8, 12, 3, "#ddd"); }
        else if(w === "staff"){ rrect(100, 80, 6, 100, 3, "#4a2a5a"); ell(103, 78, 10, 10, "#ff4a6a"); }
        else if(w === "blade"){ rrect(100, 86, 7, 52, 2, "#d9dde4"); rrect(94, 134, 20, 6, 2, "#6a4a2a"); }
        else if(w === "grenade"){ ell(106, 132, 10, 11, "#4f5f30"); rrect(103, 114, 6, 9, 2, "#aaa"); ell(114, 118, 5, 5, "#c9a227"); rrect(40, 126, 48, 8, 3, "#4a3a2a"); ell(48, 134, 6, 7, "#4f5f30"); ell(64, 134, 6, 7, "#4f5f30"); ell(80, 134, 6, 7, "#4f5f30"); }
        else if(w === "stick"){ rrect(100, 110, 6, 40, 3, "#a87a3a"); ell(103, 108, 9, 9, "#ff9a3a"); }
        // 머리
        if(sp.hat === "ears"){ ell(46, 22, 11, 32, sp.hair); ell(82, 22, 11, 32, sp.hair); ell(46, 24, 5, 24, "#ffb6c8"); ell(82, 24, 5, 24, "#ffb6c8"); }
        if(sp.hat === "horns"){ g.fillStyle = sp.hatc; g.beginPath(); g.moveTo(40, 44); g.lineTo(34, 12); g.lineTo(54, 36); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(88, 44); g.lineTo(94, 12); g.lineTo(74, 36); g.closePath(); g.fill(); g.stroke(); }
        ell(64, 72, 38, 36, sp.skin);
        if(sp.hat === "hood"){ g.fillStyle = hatc; g.beginPath(); g.ellipse(64, 60, 41, 36, 0, Math.PI*1.02, Math.PI*1.98); g.lineTo(104, 76); g.lineTo(24, 76); g.closePath(); g.fill(); g.stroke(); }
        else if(sp.hat === "helmet"){ g.fillStyle = hatc; g.beginPath(); g.ellipse(64, 62, 41, 34, 0, Math.PI, Math.PI*2); g.closePath(); g.fill(); g.stroke(); rrect(22, 60, 84, 9, 4, hatc); }
        else if(sp.hat === "beret"){ ell(58, 40, 40, 18, hatc); ell(74, 36, 10, 6, hatc); }
        else if(sp.hat === "cap"){ g.fillStyle = hatc; g.beginPath(); g.ellipse(64, 58, 38, 28, 0, Math.PI, Math.PI*2); g.closePath(); g.fill(); g.stroke(); rrect(36, 58, 60, 8, 3, hatc); if(cl === "medic"){ g.fillStyle = "#d7332e"; g.fillRect(60, 44, 8, 14); g.fillRect(55, 49, 18, 4); } }
        else if(sp.hat === "bandana"){ g.fillStyle = sp.hair; g.beginPath(); g.ellipse(64, 56, 40, 26, 0, Math.PI, Math.PI*2); g.closePath(); g.fill(); g.stroke(); rrect(24, 54, 80, 10, 4, hatc); ell(102, 62, 6, 10, hatc); }
        else if(sp.hat === "ears" || sp.hat === "horns"){ g.fillStyle = sp.hair; g.beginPath(); g.ellipse(64, 56, 40, 24, 0, Math.PI, Math.PI*2); g.closePath(); g.fill(); g.stroke(); if(sp.hat === "ears"){ rrect(70, 40, 24, 10, 4, "#d7332e"); } }
        // 얼굴
        var ey = 76; ell(50, ey, 6, 9, "#1a1a1a"); ell(78, ey, 6, 9, "#1a1a1a"); g.fillStyle = "#fff"; g.beginPath(); g.arc(52, ey - 3, 2.4, 0, 7); g.arc(80, ey - 3, 2.4, 0, 7); g.fill();
        g.fillStyle = "rgba(255,120,120,.5)"; g.beginPath(); g.ellipse(38, 88, 7, 4, 0, 0, 7); g.ellipse(90, 88, 7, 4, 0, 0, 7); g.fill();
        g.strokeStyle = "#7a3a2a"; g.lineWidth = 2.5; g.beginPath(); g.arc(64, 90, 6, 0.15*Math.PI, 0.85*Math.PI); g.stroke();
        if(cl === "lucia"){ g.fillStyle = "#ff3a5a"; g.beginPath(); g.ellipse(50, ey, 3, 5, 0, 0, 7); g.ellipse(78, ey, 3, 5, 0, 0, 7); g.fill(); }
        if(sp.hat === "mask"){ rrect(36, 82, 56, 22, 9, "#4a5a3a"); ell(50, 93, 8, 6, "#222"); ell(78, 93, 8, 6, "#222"); }
        var ex = v % 5; if(VARI[cl] && ex){ g.strokeStyle = "#222"; g.fillStyle = "#3a2412";
          if(ex === 1){ g.lineWidth = 3; g.beginPath(); g.arc(50, ey, 11, 0, 7); g.arc(78, ey, 11, 0, 7); g.moveTo(61, ey); g.lineTo(67, ey); g.stroke(); }
          else if(ex === 2){ g.beginPath(); g.ellipse(55, 86, 9, 4.5, -0.3, 0, 7); g.ellipse(73, 86, 9, 4.5, 0.3, 0, 7); g.fill(); }
          else if(ex === 3){ g.strokeStyle = "#b84a3a"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(84, 62); g.lineTo(92, 92); g.stroke(); g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.moveTo(36, 96); g.lineTo(52, 90); g.stroke(); }
          else if(ex === 4){ rrect(26, 56, 76, 8, 3, "#d7332e"); } }
        return artCache[k] = cv;
      }
      function portrait(cl, side, v){ v = v || 0; var k = "P" + cl + side + v; if(artCache[k]) return artCache[k]; var src = drawChibi(cl, side, v), cv = document.createElement("canvas"); cv.width = cv.height = 96; var g = cv.getContext("2d"); g.fillStyle = side === "rok" ? "#27405f" : "#5f2a2a"; g.fillRect(0, 0, 96, 96); g.drawImage(src, 8, 0, 112, 112, 0, 4, 96, 96); return artCache[k] = cv; }
      function tex(cv){ var t = new THREE.CanvasTexture(cv); if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t; }

      // ---------- 무대 만들기 ----------
      var hlMat = null, plateMat = null;
      function build(){
        if(built) return; built = true; root3 = new THREE.Group(); root3.visible = false; scene.add(root3);
        var plate = new THREE.Mesh(new THREE.BoxGeometry(N*TS + 4, 8, N*TS + 4), new THREE.MeshStandardMaterial({ color:0x6a4e34, roughness:1 })); plate.position.set(CX, -4.6, CZ); root3.add(plate);
        var back = new THREE.Mesh(new THREE.PlaneGeometry(520, 260), new THREE.MeshBasicMaterial({ color:0xb7d8f2, fog:false })); back.position.set(CX + 150, 60, CZ + 150); back.rotation.y = -Math.PI*0.75; back.visible = false; root3.add(back);
        boardMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ roughness:0.95, metalness:0 }), N*N); boardMesh.frustumCulled = false; root3.add(boardMesh);
        var m = new THREE.Matrix4(), c = new THREE.Color();
        MAPS.forEach(function(row, ri){ var j = N - 1 - ri; for(var i = 0; i < N; i++){ var ch = row.charAt(i), t = { i:i, j:j, type:"grass", h:0, tent:false, wall:false, walkable:true, trap:null, unit:null, cost:1 };
          if(ch === "m"){ t.type = "mud"; t.cost = 2; } else if(ch === "p"){ t.type = "paddy"; t.cost = 2; } else if(ch === "H"){ t.type = "hill"; t.h = 1; } else if(ch === "T"){ t.tent = true; t.walkable = false; } else if(ch === "W"){ t.wall = true; t.walkable = false; t.type = "wall"; } else if(ch === "x"){ t.trapDmg = 5; t.perm = true; } else if(ch === "~"){ t.type = "water"; t.cost = 2; t.h = -1; t.top = -2.4; } else if(ch === "B"){ t.type = "bridge"; t.h = 0; t.top = 1.3; } else if(ch === "1" || ch === "2" || ch === "3"){ t.type = "mount"; t.h = +ch; t.peak = ch === "3"; t.top = 1 + t.h*4.6; } else if(ch === "M"){ t.type = "hill"; t.h = 2; t.peak = true; } else if(ch === "A"){ t.type = "crag"; t.walkable = false; t.h = 2; } else if(ch === "t"){ t.type = "tree"; t.walkable = false; }
          tiles[j*N + i] = t; var hgt = (t.type === "water" || t.type === "bridge") ? -0.5 : topY(t); m.compose(new THREE.Vector3(tx(i), hgt/2 - 0.5, tz(j)), new THREE.Quaternion(), new THREE.Vector3(TS - 0.35, hgt + 1, TS - 0.35)); boardMesh.setMatrixAt(j*N + i, m);
          var base = (t.type === "water" || t.type === "bridge") ? 0xc2ab74 : t.type === "crag" ? 0x8a8f96 : t.type === "tree" ? 0x62a044 : t.type === "mount" ? [0x86be60, 0x68a84c, 0x4f9340][t.h - 1] : t.peak ? 0x8cb668 : t.type === "mud" ? 0x8c6a45 : (t.type === "paddy" ? 0x9ec9a2 : (t.type === "wall" ? 0x9aa0a8 : t.type === "hill" ? 0x78a85a : ((i + j) % 2 ? 0x82c260 : 0x74b455))); c.setHex(base); boardMesh.setColorAt(j*N + i, c); } });
        boardMesh.instanceMatrix.needsUpdate = true; boardMesh.instanceColor.needsUpdate = true;
        // 하이라이트 (파랑 이동 / 빨강 공격 / 노랑 위험·범위 / 초록 아군)
        hlMat = new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0.78, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }); var pg = new THREE.PlaneGeometry(TS - 0.7, TS - 0.7); pg.rotateX(-Math.PI/2);
        hlMesh = new THREE.InstancedMesh(pg, hlMat, N*N); hlMesh.frustumCulled = false; hlMesh.renderOrder = 5; hlMesh.setColorAt(0, new THREE.Color(0xffffff)); root3.add(hlMesh); clearHl();      // 색 배열을 처음부터 만들어 둬야 나중에 칠한 색이 보여요
        // 천막 / 함정 / 현재 차례 표시
        tiles.forEach(function(t){ if(t.tent){ var g = new THREE.Group(), cone = new THREE.Mesh(new THREE.ConeGeometry(TS*0.62, 8, 4), new THREE.MeshStandardMaterial({ color:0xb89a64, roughness:1, flatShading:true })); cone.rotation.y = Math.PI/4; cone.position.y = 4; g.add(cone); var door = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.4), new THREE.MeshBasicMaterial({ color:0x3a2a1a })); door.position.set(0, 1.9, TS*0.3); g.add(door); g.position.set(tx(t.i), topY(t) - 0.4, tz(t.j)); root3.add(g); tentMeshes.push(g); } });
        tiles.forEach(function(t){ if(t.wall){ var wm = new THREE.Mesh(new THREE.BoxGeometry(TS - 0.5, 6.5, TS - 0.5), new THREE.MeshStandardMaterial({ color:0x8d939c, roughness:1, flatShading:true })); wm.position.set(tx(t.i), topY(t) + 3.1, tz(t.j)); root3.add(wm); var cap = new THREE.Mesh(new THREE.BoxGeometry(TS - 0.1, 0.9, TS - 0.1), new THREE.MeshStandardMaterial({ color:0xb5bac2, roughness:1 })); cap.position.set(tx(t.i), topY(t) + 6.6, tz(t.j)); root3.add(cap); } });
        ring = new THREE.Mesh(new THREE.RingGeometry(TS*0.38, TS*0.48, 28), new THREE.MeshBasicMaterial({ color:0xffd34d, transparent:true, opacity:0.95, depthWrite:false, side:THREE.DoubleSide })); ring.rotation.x = -Math.PI/2; ring.visible = false; ring.renderOrder = 6; root3.add(ring);
        var ac = document.createElement("canvas"); ac.width = ac.height = 64; var ag = ac.getContext("2d"); ag.fillStyle = "#ffd34d"; ag.strokeStyle = "#5a3a10"; ag.lineWidth = 5; ag.beginPath(); ag.moveTo(10, 10); ag.lineTo(54, 10); ag.lineTo(32, 54); ag.closePath(); ag.fill(); ag.stroke();
        arrow = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex(ac), depthTest:false, transparent:true })); arrow.scale.set(4, 4, 1); arrow.visible = false; arrow.renderOrder = 40; root3.add(arrow);
        for(var q = 0; q < 24; q++){ var fc = document.createElement("canvas"); fc.width = 160; fc.height = 56; var fs = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex(fc), depthTest:false, transparent:true })); fs.userData.cv = fc; fs.visible = false; fs.renderOrder = 50; fs.scale.set(14, 4.9, 1); root3.add(fs); floats.push({ s:fs, on:false, t:0 }); }
        decorate();
      }
      // ---------- 풍경: 강 / 다리 / 산 / 숲 / 꽃 ----------
      var waters = [], RIVER = [[11, 7], [10, 7], [9, 7], [9, 6], [8, 6], [7, 6], [6, 6], [5, 6], [5, 5], [4, 5], [3, 5], [2, 5], [2, 4], [1, 4], [0, 4], [-1, 4]];
      function mkWaterTex(){ var cv = document.createElement("canvas"); cv.width = cv.height = 128; var g = cv.getContext("2d"), q, x; g.fillStyle = "#3d8fd4"; g.fillRect(0, 0, 128, 128); g.fillStyle = "rgba(20,70,150,.28)"; for(q = 0; q < 6; q++){ g.beginPath(); g.ellipse((q*47) % 128, (q*29 + 10) % 128, 22, 8, 0, 0, 7); g.fill(); }
        g.lineWidth = 3; g.lineCap = "round"; for(q = 0; q < 8; q++){ g.strokeStyle = q % 2 ? "rgba(255,255,255,.42)" : "rgba(190,230,255,.5)"; g.beginPath(); for(x = 0; x <= 128; x += 4){ var yy = q*16 + 8 + Math.sin(x/128*Math.PI*2*2 + q)*4; if(x === 0) g.moveTo(x, yy); else g.lineTo(x, yy); } g.stroke(); }
        var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; return t; }
      function addWater(cx, cz, w, d, dx, dz, y, rx, rz){
        var tx0 = WTEX.clone(); tx0.needsUpdate = true; tx0.repeat.set(rx || 1, rz || 1); var pg = new THREE.PlaneGeometry(w, d); pg.rotateX(-Math.PI/2);
        var m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map:tx0, transparent:true, opacity:0.8, depthWrite:false })); m.position.set(cx, y, cz); m.renderOrder = 3; root3.add(m); waters.push({ tx:tx0, dx:dx, dz:dz, rx:rx || 1, rz:rz || 1 }); }
      var WTEX = null, pineGeo = null, pineMat = null, trunkMat = null, trunkGeo = null;
      function pine(x, y, z, s){ var g = new THREE.Group(), tr = new THREE.Mesh(trunkGeo, trunkMat); tr.position.y = 1.2; g.add(tr); for(var q = 0; q < 3; q++){ var c = new THREE.Mesh(pineGeo, pineMat); c.scale.setScalar(1 - q*0.24); c.position.y = 3.4 + q*2.5; g.add(c); } g.scale.setScalar(s); g.position.set(x, y, z); root3.add(g); return g; }
      function mountain(x, z, r, h, col, snow){ var g = new THREE.Group(), fm = new THREE.MeshStandardMaterial({ color:col, roughness:1, flatShading:true }), m1 = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), fm); m1.position.y = h/2 - 0.6; g.add(m1);
        if(snow){ var cap = new THREE.Mesh(new THREE.ConeGeometry(r*0.34, h*0.3, 7), new THREE.MeshStandardMaterial({ color:0xf4f8ff, roughness:1, flatShading:true })); cap.position.y = h*0.85 - 0.6; g.add(cap); } g.position.set(x, 0, z); g.rotation.y = Math.random()*6; root3.add(g); }
      function swimTick(u, tm){
        var tw = (u.alive && !u.dead) ? tileXZ(u.x, u.z) : null, sw = !!(tw && tw.type === "water");
        if(sw){ var ph = tm*6 + u.i*1.3; u.spr.material.rotation = Math.sin(ph)*0.14; u.spr.scale.x = (Math.sin(tm*3.2 + u.j*1.7) > 0 ? 1 : -1)*(u.sx || TS*1.05); u.spr.position.y += Math.sin(ph*0.8)*0.7; u.sh.visible = false;
          if(!u.rip){ u.rip = new THREE.Mesh(new THREE.RingGeometry(TS*0.2, TS*0.27, 24), new THREE.MeshBasicMaterial({ color:0xe4f6ff, transparent:true, opacity:0.7, depthWrite:false, side:THREE.DoubleSide })); u.rip.rotation.x = -Math.PI/2; u.rip.renderOrder = 4; root3.add(u.rip); }
          var pp = (tm*0.9 + u.i*0.31) % 1; u.rip.visible = true; u.rip.position.set(u.x, 0.55, u.z); u.rip.scale.setScalar(1 + pp*1.7); u.rip.material.opacity = (1 - pp)*0.75;
          if(!u.swim){ floatText(u.x, 6, u.z, "🏊 수영!", "#bfe8ff"); } }
        else { if(u.swim){ u.spr.material.rotation = 0; u.spr.scale.x = (u.sx || TS*1.05); if(u.alive) u.sh.visible = true; } if(u.rip) u.rip.visible = false; }
        u.swim = sw;
      }
      function tileXZ(x, z){ return tileOf(Math.floor((x - CX)/TS + N/2), Math.floor((z - CZ)/TS + N/2)); }
      function decorate(){
        var i, q, t, a, r;
        WTEX = mkWaterTex(); pineGeo = new THREE.ConeGeometry(2.3, 3.6, 7); pineMat = new THREE.MeshStandardMaterial({ color:0x2f7a40, roughness:1, flatShading:true }); trunkGeo = new THREE.CylinderGeometry(0.45, 0.6, 2.4, 6); trunkMat = new THREE.MeshStandardMaterial({ color:0x6b4423, roughness:1 });
        var gnd = new THREE.Mesh(new THREE.CircleGeometry(520, 48), new THREE.MeshStandardMaterial({ color:0x72b258, roughness:1 })); gnd.rotation.x = -Math.PI/2; gnd.position.set(CX, -0.66, CZ); root3.add(gnd);
        // 강: 보드 안 (물 칸 + 다리 밑) 은 흐름 방향대로, 보드 밖은 긴 띠로 이어져요
        for(q = 0; q < RIVER.length - 1; q++){ var c0 = RIVER[q], c1 = RIVER[q + 1]; t = tileOf(c0[0], c0[1]); if(t && (t.type === "water" || t.type === "bridge")) addWater(tx(c0[0]), tz(c0[1]), TS + 0.04, TS + 0.04, c1[0] - c0[0], c1[1] - c0[1], 0.4); }
        addWater(tx(11) + TS/2 + TS*7, tz(7), TS*14, TS + 0.04, -1, 0, -0.28, 14, 1); addWater(tx(0) - TS/2 - TS*7, tz(4), TS*14, TS + 0.04, -1, 0, -0.28, 14, 1);
        // 다리 + 칸마다 꾸밈
        var wood = new THREE.MeshStandardMaterial({ color:0x9a6a36, roughness:1, flatShading:true }), wood2 = new THREE.MeshStandardMaterial({ color:0x6b4423, roughness:1 }), rockM = new THREE.MeshStandardMaterial({ color:0x8f949b, roughness:1, flatShading:true }), snowM = new THREE.MeshStandardMaterial({ color:0xf4f8ff, roughness:1, flatShading:true });
        tiles.forEach(function(t){ var x = tx(t.i), z = tz(t.j), y = topY(t);
          if(t.type === "bridge"){ var pl = new THREE.Mesh(new THREE.BoxGeometry(TS*0.8, 0.5, TS + 1.2), wood); pl.position.set(x, 1.05, z); root3.add(pl); [-1, 1].forEach(function(sd){ var rl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, TS + 1.2), wood2); rl.position.set(x + sd*TS*0.4, 2.3, z); root3.add(rl); [-1, 0, 1].forEach(function(pz){ var po = new THREE.Mesh(new THREE.BoxGeometry(0.7, 2.2, 0.7), wood2); po.position.set(x + sd*TS*0.4, 1.5, z + pz*TS*0.46); root3.add(po); }); }); }
          else if(t.type === "crag"){ var rk = new THREE.Mesh(new THREE.ConeGeometry(TS*0.62, 17, 5), rockM); rk.position.set(x, y + 8, z); rk.rotation.y = (t.i*7 + t.j*3) % 6; root3.add(rk); var sc = new THREE.Mesh(new THREE.ConeGeometry(TS*0.2, 4.6, 5), snowM); sc.position.set(x, y + 15.2, z); sc.rotation.y = rk.rotation.y; root3.add(sc); }
          else if(t.type === "tree"){ for(var k = 0; k < 3; k++){ var oa = k*2.1 + t.i, orr = TS*0.22; pine(x + Math.cos(oa)*orr, y, z + Math.sin(oa)*orr, 0.9 + ((t.i*3 + t.j*5 + k) % 4)*0.12); } }
          else if(t.type === "mount"){ if((t.i*5 + t.j*3) % 3 === 0 && t.h < 3) pine(x + TS*0.28, y, z - TS*0.28, 0.5 + t.h*0.12); if((t.i + t.j*2) % 4 === 1 && t.h < 3) pine(x - TS*0.28, y, z + TS*0.26, 0.45 + t.h*0.1); if(t.h === 3){ var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 7, 6), wood2); pole.position.set(x, y + 3.5, z); root3.add(pole); var fg = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), new THREE.MeshBasicMaterial({ color:0xd7332e, side:THREE.DoubleSide })); fg.position.set(x + 1.8, y + 6, z); root3.add(fg); var rk2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4), rockM); rk2.position.set(x - TS*0.3, y + 0.5, z + TS*0.28); root3.add(rk2); } }
          else if(t.type === "hill"){ pine(x + TS*0.3, y, z - TS*0.3, t.peak ? 0.75 : 0.6); if(t.peak){ var rb = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5), rockM); rb.position.set(x - TS*0.3, y + 0.6, z + TS*0.28); root3.add(rb); } } });
        // 먼 산 (뒤쪽 반원) + 먼 숲
        for(q = 0; q < 20; q++){ a = Math.PI*0.75 + (q/19 - 0.5)*Math.PI*1.2 + (Math.random() - 0.5)*0.12; r = 160 + Math.random()*150; var h = 45 + Math.random()*75, far = r > 260; mountain(CX + Math.cos(a)*r, CZ + Math.sin(a)*r, h*(0.75 + Math.random()*0.35), h, far ? 0x8fb0bf : (Math.random() < 0.5 ? 0x5c9158 : 0x6f9d63), h > 70); }
        for(q = 0; q < 70; q++){ a = Math.PI*0.75 + (Math.random() - 0.5)*Math.PI*1.35; r = 62 + Math.random()*110; pine(CX + Math.cos(a)*r, CZ + Math.sin(a)*r, 0 - 0.6, 1.2 + Math.random()*1.4); }
        // 꽃
        var fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.45, 6, 5), new THREE.MeshBasicMaterial({ color:0xffffff }), 90), fm = new THREE.Matrix4(), fcol = new THREE.Color(), fcs = [0xffffff, 0xffe45a, 0xff9ac1, 0xc9a6ff], fn = 0, cands = tiles.filter(function(t){ return t.type === "grass"; });
        for(q = 0; q < 90 && cands.length; q++){ var ft = cands[Math.floor(Math.random()*cands.length)]; fm.makeTranslation(tx(ft.i) + (Math.random() - 0.5)*TS*0.85, topY(ft) + 0.35, tz(ft.j) + (Math.random() - 0.5)*TS*0.85); fl.setMatrixAt(fn, fm); fl.setColorAt(fn, fcol.setHex(fcs[q % 4])); fn++; }
        fl.count = fn; fl.instanceMatrix.needsUpdate = true; if(fl.instanceColor) fl.instanceColor.needsUpdate = true; root3.add(fl);
      }
      function waterTick(tm){ for(var q = 0; q < waters.length; q++){ var w = waters[q]; w.tx.offset.x = (-w.dx*tm*0.22/w.rx) % 1; w.tx.offset.y = (w.dz*tm*0.22/w.rz) % 1; } }
      function tileOf(i, j){ return inb(i, j) ? tiles[j*N + i] : null; }
      function clearHl(){ var m = new THREE.Matrix4().makeScale(0, 0, 0); for(var q = 0; q < N*N; q++) hlMesh.setMatrixAt(q, m); hlMesh.instanceMatrix.needsUpdate = true; }
      function setHl(list){ clearHl(); var m = new THREE.Matrix4(), c = new THREE.Color(); list.forEach(function(h){ var t = tileOf(h.i, h.j); if(!t) return; var q = t.j*N + t.i; m.makeTranslation(tx(t.i), surfY(t) + 0.3 + (h.dy || 0), tz(t.j)); hlMesh.setMatrixAt(q, m); c.setHex(h.c); hlMesh.setColorAt(q, c); }); hlMesh.instanceMatrix.needsUpdate = true; if(hlMesh.instanceColor) hlMesh.instanceColor.needsUpdate = true; }
      function floatText(x, y, z, txt, col){ var f = null; for(var q = 0; q < floats.length; q++) if(!floats[q].on){ f = floats[q]; break; } if(!f) return; var cv = f.s.userData.cv, g = cv.getContext("2d"); g.clearRect(0, 0, 160, 56); g.font = "bold 30px sans-serif"; g.textAlign = "center"; g.lineWidth = 6; g.strokeStyle = "#1a1224"; g.strokeText(txt, 80, 38); g.fillStyle = col || "#fff"; g.fillText(txt, 80, 38); f.s.material.map.needsUpdate = true; f.on = true; f.t = 0; f.s.position.set(x, y, z); f.y0 = y; f.s.visible = true; f.s.material.opacity = 1; }

      // ---------- 유닛 ----------
      var iconTex = {};
      function badgeTex(k){ if(iconTex[k]) return iconTex[k]; var cv = document.createElement("canvas"); cv.width = cv.height = 48; var g = cv.getContext("2d"); g.fillStyle = EFN[k].col; g.beginPath(); g.arc(24, 24, 21, 0, 7); g.fill(); g.strokeStyle = "#1a1224"; g.lineWidth = 3; g.stroke(); g.fillStyle = "#1a1224"; g.font = "bold 26px sans-serif"; g.textAlign = "center"; g.fillText({ focus:"집", dot:"독", taunt:"도", atkup:"↑", weak:"↓", guard:"방" }[k], 24, 33); return iconTex[k] = tex(cv); }
      function mkUnit(side, cls, idx, i, j){
        var d = CL[cls], u = { side:side, cls:cls, d:d, name:(side === "rok" ? "" : "") + d.name + (idx ? " " + idx : ""), hp:d.hp, maxHp:d.hp, atk:d.atk, def:d.def, mov:d.mov, rng:d.rng, spd:d.spd + (side === "rok" ? 0.2 : 0) - idx*0.3, i:i, j:j, alive:true, fx:{}, cd:0, moved:false, acted:false, fade:0, kills:0, anim:null };
        u.spd = Math.round(u.spd*10)/10; u.v = (idx || 0) + (side === "nk" ? 2 : 0); u.sx = TS*1.05; var cv = drawChibi(cls, side, u.v);
        u.spr = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex(cv), transparent:true, alphaTest:0.2 })); u.spr.scale.set(TS*1.05, TS*1.58, 1); u.spr.userData.unit = u; root3.add(u.spr);
        var bc = document.createElement("canvas"); bc.width = 64; bc.height = 9; u.bcv = bc; u.bar = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex(bc), transparent:true, depthTest:false })); u.bar.scale.set(TS*0.95, TS*0.135, 1); u.bar.renderOrder = 20; root3.add(u.bar);
        var sc = document.createElement("canvas"); sc.width = 64; sc.height = 32; var sg = sc.getContext("2d"); sg.fillStyle = "rgba(0,0,0,.4)"; sg.beginPath(); sg.ellipse(32, 16, 28, 12, 0, 0, 7); sg.fill(); u.sh = new THREE.Mesh(new THREE.PlaneGeometry(TS*0.9, TS*0.45), new THREE.MeshBasicMaterial({ map:tex(sc), transparent:true, depthWrite:false })); u.sh.rotation.x = -Math.PI/2; root3.add(u.sh);
        u.icons = []; for(var q = 0; q < 4; q++){ var is = new THREE.Sprite(new THREE.SpriteMaterial({ transparent:true, depthTest:false })); is.scale.set(2.5, 2.5, 1); is.visible = false; is.renderOrder = 21; root3.add(is); u.icons.push(is); }
        placeUnit(u, i, j); drawBar(u); return u;
      }
      function placeUnit(u, i, j){ var t0 = tileOf(u.i, u.j); if(t0 && t0.unit === u) t0.unit = null; u.i = i; u.j = j; var t = tileOf(i, j); t.unit = u; syncUnit(u, tx(i), topY(t), tz(j)); }
      function syncUnit(u, x, y, z){ u.x = x; u.y = y; u.z = z; u.spr.position.set(x, y + TS*0.79 - 0.4, z); u.bar.position.set(x, y + TS*1.72, z); u.sh.position.set(x, y + 0.14, z); for(var q = 0; q < u.icons.length; q++) u.icons[q].position.set(x + (q - 1.5)*2.7, y + TS*1.98, z); }
      function drawBar(u){ var g = u.bcv.getContext("2d"), f = Math.max(0, u.hp/u.maxHp); g.clearRect(0, 0, 64, 9); g.fillStyle = "#1a1224"; g.fillRect(0, 0, 64, 9); g.fillStyle = u.fx.dot ? "#d4e83c" : (u.side === "rok" ? "#4fd15a" : "#e0503c"); if(f < 0.3) g.fillStyle = "#ffb030"; g.fillRect(1.5, 1.5, 61*f, 6); u.bar.material.map.needsUpdate = true; }
      function drawIcons(u){ var keys = Object.keys(u.fx), q; for(q = 0; q < u.icons.length; q++){ var s = u.icons[q]; if(q < keys.length){ s.material.map = badgeTex(keys[q]); s.material.needsUpdate = true; s.visible = u.alive; } else s.visible = false; } }
      function addFx(u, k, o){ var e = u.fx[k]; if(e && o && o.turns) e.turns = Math.max(e.turns || 0, o.turns); else if(!e) u.fx[k] = o || { turns:0 }; drawIcons(u); drawBar(u); updUI(); }
      function delFx(u, k){ if(u.fx[k]){ delete u.fx[k]; drawIcons(u); drawBar(u); } }
      function allAlive(side){ return SQ.units.filter(function(u){ return u.alive && (!side || u.side === side); }); }

      // ---------- 길찾기 / 범위 ----------
      // 이웃 4방향 (위·아래·왼쪽·오른쪽, 대각선 없음)
      var DIRS4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      function neighbors(t){ var r = []; for(var q = 0; q < 4; q++){ var n = tileOf(t.i + DIRS4[q][0], t.j + DIRS4[q][1]); if(n) r.push(n); } return r; }
      // 갈 수 있는 칸 (BFS 확장: 이동력 = 칸마다 드는 점수의 합. 풀밭·언덕 1점, 진흙·논 2점. walkable=false 와 다른 유닛 자리는 못 지나가요)
      function reach(u){
        var R = {}, start = { i:u.i, j:u.j, cost:0, prev:null }; R[key(u.i, u.j)] = start; var open = [start];
        while(open.length){ open.sort(function(a, b){ return a.cost - b.cost; }); var c = open.shift(), nb = neighbors(tileOf(c.i, c.j));
          for(var q = 0; q < nb.length; q++){ var t = nb[q]; var occ = !!(t.unit && t.unit.alive); var tc0 = tileOf(c.i, c.j); if(!t.walkable || (occ && t.unit.side !== u.side) || Math.abs(t.h - tc0.h) > 1) continue; var nc = c.cost + t.cost + (t.h > tc0.h ? 1 : 0), k = key(t.i, t.j); if(nc > u.mov || (R[k] && R[k].cost <= nc)) continue; R[k] = { i:t.i, j:t.j, cost:nc, prev:c, noStop:occ }; open.push(R[k]); } }      // 아군은 지나갈 수 있지만 그 칸에 멈출 수는 없어요
        return R;
      }
      function inRange(a, b, r){ return manh(a, b) <= r; }
      function foesOf(u){ return allAlive(u.side === "rok" ? "nk" : "rok"); }
      function coverAdj(t){ var d = [[1, 0], [-1, 0], [0, 1], [0, -1]]; for(var q = 0; q < 4; q++){ var n = tileOf(t.i + d[q][0], t.j + d[q][1]); if(n && (n.tent || n.type === "tree")) return true; } return false; }

      // ---------- 피해 / 효과 ----------
      function atkOf(u){ var m = 1; if(u.fx.atkup) m *= 1.25; if(u.fx.weak) m *= 0.8; return u.atk*m; }
      function dealDmg(att, tgt, mult, o){
        o = o || {}; var base = (o.fixed || o.dot) ? 0 : atkOf(att)*mult, bonus = "", t = tileOf(tgt.i, tgt.j), at = tileOf(att.i, att.j);
        if(tgt.fx.focus && !o.dot && !o.fixed){ base *= 1.5; bonus = "🎯 "; delFx(tgt, "focus"); }
        if(!o.ignoreCover && !o.dot && coverAdj(t)) base *= 0.8; if(!o.dot && at && at.h > t.h) base *= 1.1;
        var df = tgt.def*(tgt.fx.guard ? 2 : 1); if(o.dot || o.fixed) df = 0; var dmg = Math.max(1, Math.round(base*(1 - Math.min(0.8, df))));
        if(o.fixed) dmg = o.fixed;
        tgt.hp -= dmg; drawBar(tgt); floatText(tgt.x, tgt.y + TS*2.3, tgt.z, (o.dot ? "☠ " : bonus) + "-" + dmg, o.dot ? "#8be05a" : (tgt.side === "rok" ? "#ff9a9a" : "#ffe27a"));
        if(tgt.hp <= 0){ killUnit(tgt, att, o); return dmg; } return dmg;
      }
      function killUnit(u, by, o){ if(!u.alive) return; u.alive = false; u.hp = 0; var t = tileOf(u.i, u.j); if(t && t.unit === u) t.unit = null; u.fade = 1; u.icons.forEach(function(s){ s.visible = false; }); u.bar.visible = false; SQ.turnKills = (SQ.turnKills || 0) + 1; if(by && by.side) by.kills++; if(o && o.trap && u.side === "nk") SQ.bonus.trap = 1; log((u.side === "rok" ? "🔵 " : "🔴 ") + u.name + " 쓰러짐!"); updUI(); }
      function heal(u, n){ var h = Math.min(n, u.maxHp - u.hp); u.hp += h; drawBar(u); floatText(u.x, u.y + TS*2.3, u.z, "✚ +" + h, "#7dffa0"); }
      function stepOn(u){ var t = tileOf(u.i, u.j); if(t && t.trapDmg){ var d = t.trapDmg; if(!t.perm){ t.trapDmg = 0; t.trapOwner = null; if(t.trapMesh){ t.trapMesh.visible = false; } if(t.spk) t.spk.visible = false; } log("💀 " + u.name + " 함정 발동! -" + d); dealDmg({ side:"x", atk:0, i:u.i, j:u.j, kills:0 }, u, 1, { fixed:d, trap:true }); } }
      function mkTrap(t, dmg, perm){ t.trapDmg = dmg; t.perm = !!perm; if(!t.spk){ var sg2 = new THREE.Group(), cm = new THREE.MeshStandardMaterial({ color:0xb8bec6, roughness:0.6, flatShading:true }), tm2 = new THREE.MeshStandardMaterial({ color:0xd7332e, roughness:0.6 }); [[-2, -2], [2, -2], [-2, 2], [2, 2], [0, 0], [0, -2.6], [0, 2.6], [-2.6, 0], [2.6, 0]].forEach(function(p0){ var sp3 = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.4, 5), cm); sp3.position.set(p0[0], 1.2, p0[1]); sg2.add(sp3); var tp3 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 5), tm2); tp3.position.set(p0[0], 2.5, p0[1]); sg2.add(tp3); }); sg2.position.set(tx(t.i), topY(t), tz(t.j)); root3.add(sg2); t.spk = sg2; } t.spk.visible = true; if(!t.trapMesh){ var cv = document.createElement("canvas"); cv.width = cv.height = 64; t.trapCv = cv; var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex(cv), transparent:true, depthTest:false })); sp.scale.set(5.2, 5.2, 1); sp.renderOrder = 15; root3.add(sp); t.trapMesh = sp; } var g = t.trapCv.getContext("2d"); g.clearRect(0, 0, 64, 64); g.fillStyle = "#ffd34d"; g.strokeStyle = "#3a2a10"; g.lineWidth = 4; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill(); g.stroke(); g.fillStyle = "#3a2a10"; g.font = "bold 26px sans-serif"; g.textAlign = "center"; g.fillText("☠", 32, 30); g.font = "bold 20px sans-serif"; g.fillText(String(dmg), 32, 54); t.trapMesh.material.map.needsUpdate = true; t.trapMesh.position.set(tx(t.i), topY(t) + 2.8, tz(t.j)); t.trapMesh.visible = true; }

      // ---------- 행동 ----------
      function skillReady(u){ return u.cd <= 0; }
      function atkTargets(u, rng){ return foesOf(u).filter(function(f){ return inRange(u, f, rng) && tauntOK(u, f); }); }
      function tauntOK(u, f){ var tf = u.fx.taunt; if(!tf || !tf.src || !tf.src.alive) return true; return f === tf.src || manh(u, tf.src) > u.rng + 0; }
      function doAttack(u, f, mult, o){ var k0 = SQ.turnKills || 0; log(u.name + " → " + f.name); var hit = rr() < Math.max(0.55, 0.92 - Math.max(0, manh(u, f) - 3)*0.03); if(u.cls === "sniper") hit = rr() < 0.95; if(!hit){ floatText(f.x, f.y + TS*2.3, f.z, "MISS", "#fff"); return 0; } return dealDmg(u, f, mult || 1, o); }
      function applySkill(u, sk, tg){
        var k = sk.kind; u.cd = sk.cd + 1; log(u.name + " 스킬: " + sk.name);
        if(k === "single") doAttack(u, tg, sk.mult, { ignoreCover:sk.id === "aim" });
        else if(k === "area"){ var c = tileOf(tg.i, tg.j); foesOf(u).forEach(function(f){ if(manh(f, tg) <= sk.rad) dealDmg(u, f, sk.mult, {}); }); }
        else if(k === "heal") heal(tg, sk.heal);
        else if(k === "allies"){ allAlive(u.side).forEach(function(a){ if(manh(a, u) <= sk.rad) addFx(a, "atkup", { turns:2 }); }); floatText(u.x, u.y + TS*2.3, u.z, "📣 호령!", "#ffb06a"); }
        else if(k === "self" && sk.id === "taunt"){ foesOf(u).forEach(function(f){ if(manh(f, u) <= sk.rad) addFx(f, "taunt", { turns:2, src:u }); }); floatText(u.x, u.y + TS*2.3, u.z, "🛡 도발!", "#9fd0ff"); }
        else if(k === "self"){ foesOf(u).forEach(function(f){ if(manh(f, u) <= sk.rad) addFx(f, "weak", { turns:3 }); }); floatText(u.x, u.y + TS*2.3, u.z, "😈 음침한 기운", "#d9a0ff"); }
        else if(k === "gas"){ if(window.SQ.gasFx) window.SQ.gasFx(tg); foesOf(u).forEach(function(f){ if(manh(f, tg) <= sk.rad) addFx(f, "dot", { turns:3, dmg:10 }); }); floatText(tx(tg.i), topY(tileOf(tg.i, tg.j)) + TS*2.3, tz(tg.j), "☣ 독가스", "#8be05a"); }
        else if(k === "tile"){ mkTrap(tg, sk.dmg); tg.trapOwner = u.side; }
        else if(k === "dash"){ var best = null, d4 = [[1, 0], [-1, 0], [0, 1], [0, -1]]; d4.forEach(function(d){ var n = tileOf(tg.i + d[0], tg.j + d[1]); if(n && n.walkable && !(n.unit && n.unit !== u) && (!best || manh(n, u) < manh(best, u))) best = n; }); if(best) placeUnit(u, best.i, best.j); doAttack(u, tg, sk.mult, {}); stepOn(u); }
      }
      function moveUnit(u, R, tile, cb){
        var k = key(tile.i, tile.j), node = R[k], path = []; while(node){ path.unshift(node); node = node.prev; } if(path.length < 2){ if(cb) cb(); return; }
        var t0 = tileOf(u.i, u.j); if(t0.unit === u) t0.unit = null; var dst = tileOf(tile.i, tile.j); dst.unit = u; u.pi = u.i; u.pj = u.j; u.anim = { path:path, k:0, t:0, cb:function(){ u.i = tile.i; u.j = tile.j; stepOn(u); u.moved = true; if(cb) cb(); } };
      }
      // ---------- 차례 관리 ----------
      function buildOrder(){ SQ.order = allAlive().sort(function(a, b){ return b.spd - a.spd; }); }
      function nextTurn(){
        if(!SQ.active) return; if(checkEnd()) return;
        SQ.idx = (SQ.idx === undefined ? -1 : SQ.idx) + 1; if(!SQ.order || SQ.idx >= SQ.order.length){ SQ.phase++; if(SQ.phase > MAXPH){ finish(hpTotal("rok") > hpTotal("nk")); return; } buildOrder(); SQ.idx = 0; log("— 페이즈 " + SQ.phase + " —"); }
        var u = SQ.order[SQ.idx]; if(!u.alive){ nextTurn(); return; }
        SQ.cur = u; u.moved = false; u.acted = false; delFx(u, "guard"); SQ.turnKills = 0; if(u.cd > 0) u.cd--;
        if(u.fx.dot){ dealDmg({ side:"x", atk:0, i:u.i, j:u.j, kills:0 }, u, 1, { dot:true, fixed:u.fx.dot.dmg || 10 }); if(!u.alive){ later(nextTurn, 500); return; } }
        SQ.mode = "idle"; updUI(); focusOn(u);
        if(u.side === "rok" && !SQ.auto){ SQ.mode = "move"; showMove(); }
        else later(function(){ if(SQ.active && SQ.cur === u) aiTurn(u); }, 600);
      }
      function endTurn(){
        var u = SQ.cur; if(!u) return; setHl([]); SQ.mode = "wait";
        Object.keys(u.fx).forEach(function(k){ var e = u.fx[k]; if(k !== "guard" && e && e.turns){ e.turns--; if(e.turns <= 0) delFx(u, k); } });
        if(SQ.turnKills >= 2) SQ.bonus.multi = 1; updUI(); later(nextTurn, 450);
      }
      function hpTotal(side){ var s = 0, m = 0; SQ.units.forEach(function(u){ if(u.side === side){ s += Math.max(0, u.hp); m += u.maxHp; } }); return s/m; }
      function checkEnd(){ var a = allAlive("rok").length, b = allAlive("nk").length; if(!b){ finish(true); return true; } if(!a){ finish(false); return true; } return false; }
      function focusOn(u){ ring.visible = true; ring.position.set(u.x, Math.max(u.y, 0.5) + 0.25, u.z); arrow.visible = true; }

      // ---------- 플레이어 조작 ----------
      function showMove(){ var u = SQ.cur; if(!u || u.moved){ setHl([]); return; } SQ.reach = reach(u); var hl = []; Object.keys(SQ.reach).forEach(function(k){ var r = SQ.reach[k]; if(r.cost > 0 && !r.noStop) hl.push({ i:r.i, j:r.j, c:tileOf(r.i, r.j).cost > 1 ? 0x22d8c0 : 0x4aa8ff }); }); setHl(hl); }
      function showRange(kind){
        var u = SQ.cur, hl = [], sk = u.d.sk, rng = kind === "skill" ? (sk.rng || (sk.kind === "self" || sk.kind === "allies" ? 0 : u.rng)) : u.rng; SQ.rangeKind = kind; SQ.tgts = [];
        var self = kind === "skill" && (sk.kind === "self" || sk.kind === "allies");
        if(self){ SQ.tgts = [u]; hl.push({ i:u.i, j:u.j, c:0x2ee06a }); }
        else tiles.forEach(function(t){ var d = manh(u, t); if(d > rng || d === 0 && !(kind === "skill" && sk.kind === "ally")) return; var ok = false;
          if(kind === "attack" || (kind === "skill" && (sk.kind === "single" || sk.kind === "area" || sk.kind === "dash"))){ ok = t.unit && t.unit.alive && t.unit.side !== u.side && tauntOK(u, t.unit); if(ok) SQ.tgts.push(t); hl.push({ i:t.i, j:t.j, c:ok ? 0xff2a2a : 0xff9a9a }); }
          else if(kind === "skill" && sk.kind === "ally"){ ok = t.unit && t.unit.alive && t.unit.side === u.side; if(ok) SQ.tgts.push(t); hl.push({ i:t.i, j:t.j, c:ok ? 0x2ee06a : 0xa8f0c0 }); }
          else if(kind === "skill" && sk.kind === "gas"){ ok = true; SQ.tgts.push(t); hl.push({ i:t.i, j:t.j, c:t.unit && t.unit.side !== u.side ? 0xff2a2a : 0xe0e060 }); }
          else if(kind === "skill" && sk.kind === "tile"){ ok = t.walkable && !t.unit && !t.trapDmg; if(ok){ SQ.tgts.push(t); hl.push({ i:t.i, j:t.j, c:0xffd34d }); } } });
        setHl(hl); SQ.mode = "target"; SQ.skillKind = kind;
        if(!SQ.tgts.length) logOnce("사정거리 안에 쓸 수 있는 대상이 없어요");
      }
      function logOnce(s){ if(SQ.lastMsg !== s || performance.now() - (SQ.lastMsgT || 0) > 1200){ SQ.lastMsg = s; SQ.lastMsgT = performance.now(); log(s); } }
      function pickAct(slot){
        var u = SQ.cur; if(!SQ.active || !u || u.side !== "rok" || SQ.mode === "wait" || SQ.mode === "ai" || u.anim || u.acted) return;
        if(slot === "attack") showRange("attack");
        else if(slot === "skill"){ if(!skillReady(u)){ logOnce(u.d.sk.name + " 은(는) " + u.cd + "페이즈 뒤에 쓸 수 있어요"); return; } if(u.d.sk.kind === "self" || u.d.sk.kind === "allies"){ u.acted = true; applySkill(u, u.d.sk, u); setHl([]); endTurn(); } else showRange("skill"); }
        else if(slot === "guard"){ u.acted = true; addFx(u, "guard", { turns:1 }); log(u.name + " 방어 자세"); setHl([]); endTurn(); }
        else if(slot === "wait"){ setHl([]); endTurn(); }
        updUI();
      }
      function clickTile(t){
        var u = SQ.cur; if(!SQ.active || !u || u.side !== "rok" || u.anim || SQ.mode === "wait" || SQ.mode === "ai") return;
        if(SQ.mode === "target"){ var ok = SQ.tgts.indexOf(t) >= 0; if(!ok) return; u.acted = true; setHl([]); SQ.mode = "wait"; var kind = SQ.skillKind;
          if(kind === "attack") doAttack(u, t.unit, 1, {}); else applySkill(u, u.d.sk, t.unit || t); later(endTurn, 500); updUI(); return; }
        if(SQ.mode === "move" && !u.moved && !(SQ.reach && SQ.reach[key(t.i, t.j)] && SQ.reach[key(t.i, t.j)].cost > 0 && !SQ.reach[key(t.i, t.j)].noStop) && !t.unit){ logOnce(t.walkable ? "그 칸은 이동력이 모자라거나 막혀서 갈 수 없어요" : "벽·천막이라 지나갈 수 없어요"); return; }
        if(SQ.mode === "move" && !u.moved && SQ.reach && SQ.reach[key(t.i, t.j)] && SQ.reach[key(t.i, t.j)].cost > 0 && !SQ.reach[key(t.i, t.j)].noStop){ var R = SQ.reach; setHl([]); SQ.mode = "wait"; SQ.undo = { i:u.i, j:u.j }; moveUnit(u, R, t, function(){ SQ.mode = "move"; SQ.reach = null; if(!u.alive){ endTurn(); return; } if(!checkEnd()){ setHl([]); } updUI(); }); }
      }
      function rightClick(){ var u = SQ.cur; if(!SQ.active || !u || u.side !== "rok") return; if(SQ.mode === "target"){ SQ.mode = "move"; setHl([]); updUI(); return; } if(u.moved && !u.acted && !u.anim && SQ.undo){ var t = tileOf(u.i, u.j); if(t.unit === u) t.unit = null; placeUnit(u, SQ.undo.i, SQ.undo.j); u.moved = false; SQ.undo = null; showMove(); focusOn(u); log("↩ 이동을 되돌렸어요"); } }

      // ---------- 적 AI: 공격 대상은 점수가 가장 높은 쪽 ----------
      //  점수 = (1 / 체력) × 100 + 공격력(위협도) × 0.1   (전선 전투와 같은 식)
      function atkPower(t){ return atkOf(t); }
      function scoreTarget(t){ return 100/Math.max(1, t.hp) + atkPower(t)*0.1; }
      SQ.scoreTarget = scoreTarget;
      function aiTurn(u){
        SQ.mode = "ai"; var R = reach(u), cand = Object.keys(R).map(function(k){ return R[k]; }).filter(function(r){ return !r.noStop; }), foes = foesOf(u), allies = allAlive(u.side), sk = u.d.sk, best = null, tfs = u.fx.taunt && u.fx.taunt.src && u.fx.taunt.src.alive ? u.fx.taunt.src : null;
        function consider(sc, tile, act){ if(!best || sc > best.sc) best = { sc:sc, tile:tile, act:act }; }
        cand.forEach(function(r){ var t = tileOf(r.i, r.j), pos = { i:r.i, j:r.j }, pen = (t.trapDmg ? -t.trapDmg*1.6 : 0) + (r.cost*0.3) + (coverAdj(t) ? 3 : 0) + (t.h*2);
          var fo = foes.filter(function(f){ return !tfs || f === tfs || manh(pos, f) > u.rng; });
          fo.forEach(function(f){ if(manh(pos, f) <= u.rng){ var sc = 20 + scoreTarget(f)*10 + pen; consider(sc, r, { t:"atk", f:f }); } });
          if(skillReady(u)){
            if(sk.kind === "single" || sk.kind === "area" || sk.kind === "dash"){ var rr2 = sk.kind === "dash" ? sk.rng : u.rng; fo.forEach(function(f){ if(manh(pos, f) <= rr2 && (sk.kind !== "dash" || manh(pos, f) > 1 || true)){ var cnt = sk.kind === "area" ? foes.filter(function(g){ return manh(g, f) <= 1; }).length : 1; consider(26 + scoreTarget(f)*10*sk.mult*cnt + pen, r, { t:"skill", f:f }); } }); }
            else if(sk.kind === "heal"){ allies.forEach(function(a){ if(manh(pos, a) <= sk.rng && a.hp/a.maxHp < 0.7) consider(30 + (1 - a.hp/a.maxHp)*60 + pen, r, { t:"skill", f:a }); }); }
            else if(sk.kind === "gas"){ foes.forEach(function(f){ if(manh(pos, f) <= sk.rng){ var cnt = foes.filter(function(g){ return manh(g, f) <= sk.rad && !g.fx.dot; }).length; if(cnt >= 2) consider(24 + cnt*14 + pen, r, { t:"skill", f:f }); } }); }
            else if(sk.kind === "self"){ var cn = foes.filter(function(f){ return manh(f, pos) <= sk.rad; }).length; if(cn >= 2) consider(22 + cn*8 + pen, r, { t:"skill", f:u }); }
          }
        });
        var finish2 = function(){ endTurn(); };
        if(best){ var go = function(){ if(!u.alive){ later(finish2, 300); return; } var a = best.act; if(a.t === "atk"){ u.acted = true; doAttack(u, a.f, 1, {}); } else { u.acted = true; applySkill(u, sk, a.f); } later(finish2, 650); };
          if(best.tile.cost > 0){ moveUnit(u, R, best.tile, function(){ later(go, 200); }); } else go(); return; }
        // 공격할 수 없으면 가장 가까운 적 쪽으로 이동
        var target = tfs || foes.sort(function(a, b){ return manh(u, a) - manh(u, b); })[0]; if(!target){ finish2(); return; }
        var mv = cand.slice().sort(function(a, b){ var ta = tileOf(a.i, a.j), tb = tileOf(b.i, b.j); return (manh(a, target) + (ta.trapDmg ? ta.trapDmg*1.5 : 0)) - (manh(b, target) + (tb.trapDmg ? tb.trapDmg*1.5 : 0)); })[0];
        if(mv && mv.cost > 0) moveUnit(u, R, mv, function(){ later(finish2, 400); }); else finish2();
      }

      // ---------- 시작 / 끝 ----------
      function resetMap(){ tiles.forEach(function(t){ t.unit = null; t.trapDmg = 0; t.perm = false; if(t.trapMesh) t.trapMesh.visible = false; if(t.spk) t.spk.visible = false; }); MAPS.forEach(function(row, ri){ var j = N - 1 - ri; for(var i = 0; i < N; i++){ var ch = row.charAt(i); if(ch === "x") mkTrap(tileOf(i, j), 5, true); } }); }
      window.sqStart = function(){
        if(SQ.active) return; build(); var p = state.player, cs = state.cam;
        saved = { x:p.x, z:p.z, y:p.y, fov:three.camera.fov }; SQ.units.forEach(function(u){ [u.spr, u.bar, u.sh].concat(u.icons).forEach(function(o){ root3.remove(o); }); }); SQ.units = []; resetMap();
        var cnt = {}; ["rok", "nk"].forEach(function(side){ var j = side === "rok" ? 0 : N - 1; ROST[side].forEach(function(cl, q){ var key2 = side + cl; cnt[key2] = (cnt[key2] || 0) + 1; var tot = ROST[side].filter(function(c){ return c === cl; }).length; SQ.units.push(mkUnit(side, cl, tot > 1 ? cnt[key2] : 0, COLS[side][q], j)); }); });
        SQ.units.forEach(function(u){ if(u.side === "nk") u.fx.focus = { turns:0 }; drawIcons(u); drawBar(u); });      // 게임 시작 때 적에게 집중
        SQ.phase = 1; SQ.idx = undefined; SQ.bonus = { multi:0, trap:0, fast:0 }; SQ.turnKills = 0; SQ.cur = null; SQ.mode = "wait"; SQ.log = []; SQ.result = null; buildOrder(); SQ.idx = -1; SQ.phase = 1;
        SQ.active = true; root3.visible = true; p.x = CX; p.z = CZ; p.y = 0; cs.fx = null; ring.visible = false; arrow.visible = false; ensureUI(); ui.root.style.display = "block"; ui.res.style.display = "none";
        if(window.tbSquadHook) window.tbSquadHook(true); if(window.showToast) showToast(SQ.chain ? "⚔ 별도전투! 10 대 10 · 이긴 쪽 1만 명 공격력 +5 · Esc: 건너뛰고 본선으로" : "⚔ 정예 분대 전투! 10 대 10 · 이기면 국군 공격력 +5");
        log("— 페이즈 1 —"); updUI(); later(nextTurn, 500);
      };
      function finish(win){
        if(SQ.result) return; SQ.bonus.fast = win && SQ.phase <= 6 ? 1 : 0; var score = (SQ.bonus.multi + SQ.bonus.trap + SQ.bonus.fast)*100, before = window.SQM ? window.SQM.bonus : 0; SQ.result = { win:win, score:score };
        if(window.SQM){ if(SQ.chain){ if(win) window.SQM.bonus += 5; else window.SQM.nk = (window.SQM.nk || 0) + 5; } else if(win){ window.SQM.bonus += 5; try{ localStorage.setItem("sqMorale", String(window.SQM.bonus)); }catch(e){} } }
        setHl([]); ring.visible = false; arrow.visible = false; SQ.mode = "done";
        ui.res.innerHTML = '<div style="font-size:26px;font-weight:900;margin-bottom:8px">' + (win ? "🎉 분대 전투 승리!" : "💔 분대 전투 패배") + '</div><div style="font-size:15px;line-height:1.7">' + (win ? "사기 진작! 국군 1만 명 공격력 <b>+5</b> (누적 +" + (window.SQM ? window.SQM.bonus : 0) + ")<br>본선 1만 대 1만 전투에서 적용돼요." : (SQ.chain ? "북한군이 이겼어요… 북한군 1만 명 공격력 <b>+5</b><br>본선 1만 대 1만 전투에서 적용돼요." : "아쉽지만 다음에 다시 도전해요. (사기 보너스는 그대로예요)")) + '<br>추가 점수 ' + score + '점 (연속 처치 ' + (SQ.bonus.multi ? "✔" : "✘") + ' · 함정 처치 ' + (SQ.bonus.trap ? "✔" : "✘") + ' · 6페이즈 이내 ' + (SQ.bonus.fast ? "✔" : "✘") + ')</div>';
        var b = document.createElement("button"); b.textContent = window.SQONLY ? "다시 하기 ⟳" : (SQ.chain ? "본선전투로 ▶" : "전선으로 돌아가기"); b.style.cssText = "margin-top:14px;padding:10px 18px;border-radius:12px;border:3px solid #d8b04a;background:#2b3a6a;color:#fff;font-weight:800;cursor:pointer;font-size:15px;"; b.addEventListener("click", leave); ui.res.appendChild(b); ui.res.style.display = "flex";
      }
      function leave(){
        if(!SQ.active) return; if(window.SQONLY){ location.reload(); return; } SQ.active = false; if(root3) root3.visible = false; var p = state.player; if(saved){ p.x = saved.x; p.z = saved.z; p.y = saved.y; three.camera.fov = saved.fov; } three.camera.near = 0.5; three.camera.far = 3200; three.camera.clearViewOffset(); three.camera.updateProjectionMatrix(); state.cam.fx = null; if(ui) ui.root.style.display = "none"; if(window.tbSquadHook) window.tbSquadHook(false);
        if(SQ.chain){ SQ.chain = false; if(window.tbAfterSquad) window.tbAfterSquad(); }
      }
      function skipSquad(){ if(!SQ.active || window.SQONLY) return; if(SQ.result){ leave(); return; } var ok = true; try{ if(window.confirm) ok = window.confirm("별도전투를 건너뛰고 본선전투로 갈까요? (보상 +5 는 없어요)"); }catch(e){} if(ok) leave(); }
      window.sqActive = function(){ return SQ.active; }; window.sqLeave = leave;
      window.sqFrame = function(dt){ var p = state.player; p.walking = false; };
      var prevPlace = window.dgPlace; window.dgPlace = function(p){ if(SQ.active) return { id:"squad", name:"정예 분대 전투", sub:"10 대 10 전술 전투 · 페이즈 " + SQ.phase + "/" + MAXPH }; return prevPlace ? prevPlace(p) : null; };

      // ---------- 화면 (UI) ----------
      var ui = null;
      function div(css, html){ var d = document.createElement("div"); d.style.cssText = css; if(html) d.innerHTML = html; return d; }
      var GOLD = "border:3px solid #c9a24a;box-shadow:0 0 0 2px #4a3414 inset,0 4px 14px rgba(0,0,0,.5);";
      function ensureUI(){
        if(ui) return; var host = document.getElementById("canvasHolder") || document.body; ui = { root:div("position:absolute;inset:0;z-index:30;pointer-events:none;font-family:inherit;display:none;color:#f3ead2;") };
        ui.top = div("position:absolute;left:0;top:0;right:0;height:78px;display:flex;align-items:flex-start;pointer-events:none;");
        ui.phase = div("position:relative;width:128px;height:78px;background:linear-gradient(#3a2810,#22170a);" + GOLD + "border-radius:0 0 22px 0;flex:0 0 auto;pointer-events:auto;"); ui.top.appendChild(ui.phase);
        ui.order = div("display:flex;gap:4px;padding:5px 8px;overflow:hidden;flex:1;pointer-events:auto;"); ui.top.appendChild(ui.order);
        ui.obj = div("position:absolute;right:6px;top:84px;width:228px;background:rgba(30,22,10,.82);" + GOLD + "border-radius:10px;padding:8px 10px;font-size:12.5px;line-height:1.55;pointer-events:auto;");
        ui.cardL = div("position:absolute;left:6px;bottom:6px;width:268px;background:rgba(22,40,30,.9);" + GOLD + "border-radius:12px;padding:8px 10px;font-size:12px;pointer-events:auto;");
        ui.cardR = div("position:absolute;right:6px;bottom:6px;width:268px;background:rgba(48,22,22,.9);" + GOLD + "border-radius:12px;padding:8px 10px;font-size:12px;pointer-events:auto;");
        ui.bar = div("position:absolute;left:50%;bottom:6px;transform:translateX(-50%);display:flex;gap:6px;align-items:flex-end;pointer-events:auto;");
        ui.log = div("position:absolute;left:50%;bottom:92px;transform:translateX(-50%);width:min(380px,42%);text-align:center;font-size:13px;background:rgba(20,14,8,.72);border-radius:10px;padding:5px 10px;pointer-events:none;min-height:20px;");
        ui.tip = div("position:absolute;display:none;max-width:230px;background:rgba(14,22,40,.96);border:2px solid #7fb4ff;border-radius:8px;padding:6px 9px;font-size:12px;z-index:60;pointer-events:none;");
        ui.res = div("position:absolute;inset:0;background:rgba(10,8,22,.7);display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:auto;z-index:70;color:#fff;");
        ui.help = div("position:absolute;left:62px;top:84px;font-size:11.5px;background:rgba(20,14,8,.6);border-radius:8px;padding:4px 8px;pointer-events:none;", "파랑: 이동 1점 · 청록: 진흙/논 2점 · 클릭: 이동·공격 · 1 공격 · 2 스킬 · 3 방어 · R 대기 · 우클릭: 되돌리기/취소 · Shift+마우스: 적 이동 범위");
        var slots = [["attack", "1", "⚔", "공격"], ["skill", "2", "✨", "스킬"], ["guard", "3", "🛡", "방어"], ["wait", "R", "⏳", "대기"]]; ui.slots = {};
        slots.forEach(function(s){ var b = document.createElement("button"); b.style.cssText = "width:74px;height:74px;border-radius:12px;" + GOLD + "background:linear-gradient(#2c4a6a,#17283c);color:#fff;cursor:pointer;font-family:inherit;position:relative;font-size:12px;line-height:1.2;"; b.innerHTML = '<div style="font-size:26px">' + s[2] + '</div><div class="nm">' + s[3] + '</div><span style="position:absolute;left:5px;top:3px;font-size:11px;color:#ffd34d;font-weight:800">' + s[1] + '</span><span class="cd" style="position:absolute;right:6px;top:3px;font-size:13px;font-weight:800;color:#ff9a9a"></span>'; b.addEventListener("click", function(e){ e.stopPropagation(); pickAct(s[0]); }); ui.bar.appendChild(b); ui.slots[s[0]] = b; });
        var ex = document.createElement("button"); ex.textContent = "후퇴"; ex.style.cssText = "position:absolute;left:6px;top:84px;padding:5px 10px;border-radius:8px;border:2px solid #c9a24a;background:#4a2a2a;color:#fff;cursor:pointer;pointer-events:auto;font-size:12px;"; ex.addEventListener("click", function(){ skipSquad(); }); ex.textContent = "건너뛰기 Esc"; if(window.SQONLY) ex.style.display = "none";
        [ui.top, ui.obj, ui.cardL, ui.cardR, ui.bar, ui.log, ui.help, ui.tip, ui.res].forEach(function(e){ ui.root.appendChild(e); }); ui.root.appendChild(ex);
        var vg = div("position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(10,14,30,.42) 100%);"); ui.root.insertBefore(vg, ui.root.firstChild);
        var bn = div("position:absolute;left:50%;top:8px;transform:translateX(-50%);padding:5px 22px;border-radius:0 0 16px 16px;background:linear-gradient(#3a2810,#22170a);border:2px solid #d8b04a;border-top:none;color:#ffe9a8;font-weight:900;font-size:15px;letter-spacing:2px;text-shadow:0 2px 3px #000;box-shadow:0 4px 12px rgba(0,0,0,.45);pointer-events:none;z-index:5;", "⚔ 칠곡 원정대 · 별도전투 ⚔"); bn.style.top = "0"; ui.root.appendChild(bn);
        [ui.obj, ui.cardL, ui.cardR, ui.log, ui.help].forEach(function(e){ e.style.boxShadow = "0 4px 14px rgba(0,0,0,.45)"; e.style.backdropFilter = "blur(3px)"; });
        var xb = document.createElement("button"); xb.style.cssText = "position:absolute;right:8px;top:6px;padding:6px 12px;border-radius:10px;border:2px solid #d8b04a;background:linear-gradient(#3a2810,#22170a);color:#ffe9a8;font-weight:800;font-size:13px;cursor:pointer;pointer-events:auto;z-index:6;box-shadow:0 3px 8px rgba(0,0,0,.4);"; xb.textContent = "⛶ 맵 확장";
        xb.addEventListener("click", function(e){ e.stopPropagation(); var eb = document.getElementById("expandBtn"); if(eb) eb.click(); setTimeout(function(){ var ex2 = document.getElementById("canvasHolder"); xb.textContent = ex2 && ex2.classList.contains("expanded") ? "⤡ 축소" : "⛶ 맵 확장"; }, 60); });
        ["pointerdown", "mousedown"].forEach(function(ev){ xb.addEventListener(ev, function(e){ e.stopPropagation(); }); }); ui.root.appendChild(xb);
        host.appendChild(ui.root);
      }
      function log(s){ SQ.log.push(s); if(ui) ui.log.textContent = s; }
      function effHtml(u){ var ks = Object.keys(u.fx); if(!ks.length) return '<span style="opacity:.6">상태 효과 없음</span>'; return ks.map(function(k){ var e = EFN[k]; return '<span data-tip="' + e.icon + ' ' + e.name + ' — ' + e.desc + (u.fx[k].turns ? ' (' + u.fx[k].turns + '페이즈 남음)' : '') + '" style="display:inline-block;margin:1px 3px 1px 0;padding:1px 5px;border-radius:8px;background:rgba(255,255,255,.14);border:1px solid ' + e.col + ';cursor:help">' + e.icon + ' ' + e.name + (u.fx[k].turns ? ' ' + u.fx[k].turns : '') + '</span>'; }).join(""); }
      function cardHtml(u, side){
        if(!u) return '<div style="opacity:.6">유닛을 가리켜 보세요</div>'; var pc = portrait(u.cls, u.side, u.v).toDataURL(), f = Math.max(0, u.hp/u.maxHp), sk = u.d.sk;
        return '<div style="display:flex;gap:8px"><img src="' + pc + '" style="width:56px;height:56px;border-radius:50%;border:2px solid #c9a24a"><div style="flex:1"><div style="font-weight:800;font-size:14px">' + u.name + ' <small style="opacity:.7">' + (u.side === "rok" ? "국군" : "북한군") + '</small></div><div>⚔ ' + Math.round(atkOf(u)) + ' · 🛡 ' + Math.round(u.def*100) + '% · 🏃 ' + u.mov + ' · 🎯 ' + u.rng + '</div><div style="background:#111;border-radius:6px;height:11px;margin-top:3px;position:relative"><div style="height:100%;border-radius:6px;width:' + (f*100) + '%;background:' + (f < 0.3 ? "#ffb030" : (u.side === "rok" ? "#4fd15a" : "#e0503c")) + '"></div><span style="position:absolute;left:0;right:0;top:-1px;text-align:center;font-size:10px;font-weight:700">' + Math.max(0, Math.round(u.hp)) + ' / ' + u.maxHp + '</span></div></div></div><div style="margin-top:5px">' + effHtml(u) + '</div><div style="margin-top:4px;font-size:11.5px;opacity:.9" data-tip="' + sk.icon + ' ' + sk.name + ' — ' + sk.desc + '">' + sk.icon + ' <b>' + sk.name + '</b> ' + (u.cd > 0 ? '(쿨타임 ' + u.cd + ')' : '(사용 가능)') + '</div>';
      }
      function updUI(){
        if(!ui) return; var u = SQ.cur;
        ui.phase.innerHTML = '<div style="position:absolute;left:8px;top:6px;font-size:12px;opacity:.85">페이즈</div><div style="position:absolute;left:10px;top:20px;font-size:40px;font-weight:900;line-height:1">' + (SQ.phase < 10 ? "0" : "") + SQ.phase + '<small style="font-size:14px;opacity:.7"> /' + MAXPH + '</small></div>' + (u ? '<img src="' + portrait(u.cls, u.side, u.v).toDataURL() + '" style="position:absolute;right:6px;top:6px;width:62px;height:62px;border-radius:50%;border:3px solid ' + (u.side === "rok" ? "#6fb4ff" : "#ff7a7a") + '">' : "");
        ui.order.innerHTML = ""; var list = []; if(SQ.order){ for(var q = Math.max(0, SQ.idx || 0); q < SQ.order.length; q++) if(SQ.order[q].alive) list.push(SQ.order[q]); var nxt = allAlive().sort(function(a, b){ return b.spd - a.spd; }); list = list.concat(nxt); }
        list.slice(0, 16).forEach(function(w, q){ var d = div("position:relative;width:54px;height:62px;flex:0 0 auto;border-radius:8px;overflow:hidden;border:3px solid " + (w.side === "rok" ? "#4a8fe0" : "#e05a5a") + ";" + (w === u && q === 0 ? "box-shadow:0 0 12px 3px #ffd34d;transform:translateY(3px);" : "") + (q > 0 && list.indexOf(w) !== q ? "opacity:.55;" : ""), ""); d.title = w.name; var im = portrait(w.cls, w.side, w.v); d.appendChild(im.cloneNode ? (function(){ var c = document.createElement("canvas"); c.width = im.width; c.height = im.height; c.getContext("2d").drawImage(im, 0, 0); c.style.cssText = "width:100%;height:100%;display:block"; return c; })() : im); var nb = document.createElement("span"); nb.textContent = Math.round(w.spd); nb.style.cssText = "position:absolute;left:3px;bottom:1px;font-size:13px;font-weight:900;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000"; d.appendChild(nb); ui.order.appendChild(d); });
        var dead = SQ.units.filter(function(x){ return !x.alive && x.side === "nk"; }).length, deadR = SQ.units.filter(function(x){ return !x.alive && x.side === "rok"; }).length, B = SQ.bonus || { multi:0, trap:0, fast:0 };
        ui.obj.innerHTML = '<b style="color:#ffd34d">목표</b> <small>*다음 중 하나 충족</small><br>- 적 전멸 (' + dead + '/10)<br>- ' + MAXPH + '페이즈 뒤 총 HP 우위 (' + Math.min(SQ.phase, MAXPH) + '/' + MAXPH + ')<br><b style="color:#ff8a8a">패배 조건</b><br>- 모든 아군 쓰러짐 (' + deadR + '/10)<br><b style="color:#9fe0ff">추가 점수</b><br>- 한 번에 2명 이상 처치 (' + B.multi + '/1)<br>- 함정으로 적 처치 (' + B.trap + '/1)<br>- 6페이즈 이내 승리 (' + (B.fast || 0) + '/1)<br><b style="color:#ffb06a">🔥 사기 +' + (window.SQM ? window.SQM.bonus : 0) + '</b> <small>(이기면 +5)</small>';
        var showL = u && u.side === "rok" ? u : (SQ.sel || u); ui.cardL.innerHTML = cardHtml(showL); ui.cardR.innerHTML = cardHtml(hover && hover.unit && hover !== showL ? hover.unit : (u && u.side === "nk" ? u : SQ.tgtShow));
        var my = u && u.side === "rok" && !u.acted && SQ.mode !== "wait" && SQ.mode !== "ai" && SQ.mode !== "done" && !u.anim;
        Object.keys(ui.slots).forEach(function(k){ var b = ui.slots[k], on = !!my; if(k === "skill" && u){ b.querySelector(".nm").textContent = u.d.sk.name; b.querySelector(".cd").textContent = u.cd > 0 ? u.cd : ""; b.firstChild.textContent = u.d.sk.icon; if(u.cd > 0) on = false; } b.style.opacity = on || k === "wait" && my ? 1 : 0.45; });
      }
      function showTip(e){ var t = e.target.closest ? e.target.closest("[data-tip]") : null; if(!t){ ui.tip.style.display = "none"; return; } ui.tip.textContent = t.getAttribute("data-tip"); ui.tip.style.display = "block"; var r = ui.root.getBoundingClientRect(); ui.tip.style.left = Math.min(r.width - 240, Math.max(4, e.clientX - r.left + 12)) + "px"; ui.tip.style.top = Math.max(4, e.clientY - r.top - 50) + "px"; }

      // ---------- 마우스 / 키보드 ----------
      var RAY = new THREE.Raycaster(), V2 = new THREE.Vector2();
      var alphaCtx = {};
      function opaqueAt(u, uv){ try{ var im = u.spr.material.map.image, c = alphaCtx[u.cls + u.side + u.v]; if(!c){ c = alphaCtx[u.cls + u.side + u.v] = im.getContext("2d"); } return c.getImageData(Math.min(im.width - 1, Math.max(0, Math.floor(uv.x*im.width))), Math.min(im.height - 1, Math.max(0, Math.floor((1 - uv.y)*im.height))), 1, 1).data[3] > 50; }catch(e){ return true; } }
      function actionable(t){ if(!t) return false; if(SQ.mode === "target") return !!(SQ.tgts && SQ.tgts.indexOf(t) >= 0); if(SQ.mode === "move" && SQ.reach){ var r = SQ.reach[key(t.i, t.j)]; return !!(r && r.cost > 0 && !r.noStop); } return false; }
      function pickAt(ev){
        var el = three.renderer.domElement, r = el.getBoundingClientRect(); V2.set(((ev.clientX - r.left)/r.width)*2 - 1, -((ev.clientY - r.top)/r.height)*2 + 1); RAY.setFromCamera(V2, three.camera);
        var sprs = SQ.units.filter(function(u){ return u.alive; }).map(function(u){ return u.spr; }), hit = RAY.intersectObjects(sprs, false).filter(function(h){ return !h.uv || opaqueAt(h.object.userData.unit, h.uv); }), ut = null, th = null;
        if(hit.length){ var u0 = hit[0].object.userData.unit; ut = tileOf(u0.i, u0.j); }
        var bh = RAY.intersectObject(boardMesh, false); if(bh.length && bh[0].instanceId !== undefined) th = tiles[bh[0].instanceId];
        if(!th){ var o = RAY.ray.origin, d = RAY.ray.direction, bd = 1e9; tiles.forEach(function(t){ var y = surfY(t), s = (y - o.y)/d.y; if(s < 0) return; var x = o.x + d.x*s, z = o.z + d.z*s; if(Math.abs(x - tx(t.i)) <= TS/2 && Math.abs(z - tz(t.j)) <= TS/2 && s < bd){ bd = s; th = t; } }); }
        if(ut && th && ut !== th && actionable(th) && !actionable(ut)) return th;      // 큰 머리 뒤쪽 칸도 누를 수 있어요
        return ut || th;
      }
      window.addEventListener("mousemove", function(ev){ if(!SQ.active || !ui) return; showTip(ev); if(ev.target !== three.renderer.domElement){ return; } var t = pickAt(ev); var prev = hover; hover = t; if(t !== prev){ if(t && t.unit && t.unit.alive) SQ.sel = SQ.sel; updUI(); }
        if(ev.shiftKey && t && t.unit && t.unit.alive && t.unit.side === "nk"){ var R = reach(t.unit), hl = []; Object.keys(R).forEach(function(k){ hl.push({ i:R[k].i, j:R[k].j, c:0xf0d040 }); }); setHl(hl); SQ.shiftShown = true; } else if(SQ.shiftShown){ SQ.shiftShown = false; if(SQ.mode === "move") showMove(); else if(SQ.mode === "target") showRange(SQ.skillKind); else setHl([]); } }, true);
      window.addEventListener("mousedown", function(ev){ if(!SQ.active) return; if(ev.target === three.renderer.domElement){ ev.stopImmediatePropagation(); if(ev.button === 2){ rightClick(); return; } if(ev.button === 0){ var t = pickAt(ev); if(t) clickTile(t); } } }, true);
      window.addEventListener("click", function(ev){ if(SQ.active && ev.target === three.renderer.domElement){ ev.stopImmediatePropagation(); } }, true);
      window.addEventListener("contextmenu", function(ev){ if(SQ.active){ ev.preventDefault(); ev.stopImmediatePropagation(); } }, true);
      window.addEventListener("keydown", function(e){ if(!SQ.active || (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName))) return; var k = e.key.toLowerCase(), used = true;
        if(SQ.result){ if(k === "enter" || k === " ") leave(); } else if(k === "1") pickAct("attack"); else if(k === "2") pickAct("skill"); else if(k === "3") pickAct("guard"); else if(k === "r" || k === " " || k === "enter") pickAct("wait"); else if(k === "escape"){ if(SQ.mode === "target") rightClick(); else skipSquad(); } else if(k === "z") rightClick(); else if(k === "f"){ var eb0 = document.getElementById("expandBtn"); if(eb0) eb0.click(); } else used = (k === "e" || k === "m" || k === "c" || k === "b" || k === "j" || k.length === 1 || k.indexOf("arrow") === 0);
        if(used){ e.stopImmediatePropagation(); e.preventDefault(); } }, true);

      // ---------- 매 프레임 ----------
      window.sqTick = function(t, dt, p){
        if(!SQ.active || !root3) return; var cam = three.camera, tm = t/1000;
        p.x = CX; p.z = CZ; p.y = 0;
        cam.fov = 40; cam.near = 40; cam.far = 900; var hold0 = document.getElementById("canvasHolder"), zt = (hold0 && hold0.classList.contains("expanded")) ? 0.8 : 0.93; SQ.zf = SQ.zf ? SQ.zf + (zt - SQ.zf)*Math.min(1, dt*6) : zt; cam.position.set(CX + 128*SQ.zf, 126*SQ.zf, CZ - 128*SQ.zf); cam.lookAt(CX, 0, CZ); var el = three.renderer.domElement, W0 = el.clientWidth || 800, H0 = el.clientHeight || 480; cam.setViewOffset(W0, H0, 0, H0*0.05, W0, H0); cam.updateProjectionMatrix();
        // 이동 애니메이션
        SQ.units.forEach(function(u){
          if(u.anim){ var a = u.anim, n0 = a.path[a.k], n1 = a.path[a.k + 1]; if(!n1){ var cb = a.cb; u.anim = null; syncUnit(u, tx(u.i = a.path[a.path.length - 1].i), topY(tileOf(u.i, u.j = a.path[a.path.length - 1].j)), tz(u.j)); cb(); }
            else { a.t += dt*5.2; var f = Math.min(1, a.t), t0 = tileOf(n0.i, n0.j), t1 = tileOf(n1.i, n1.j), x = tx(n0.i) + (tx(n1.i) - tx(n0.i))*f, z = tz(n0.j) + (tz(n1.j) - tz(n0.j))*f, y = topY(t0) + (topY(t1) - topY(t0))*f + Math.sin(f*Math.PI)*1.6; syncUnit(u, x, y, z); if(f >= 1){ a.k++; a.t = 0; } if(SQ.cur === u){ ring.position.set(u.x, Math.max(u.y, 0.5) + 0.25, u.z); } } }
          if(!u.alive && u.fade > 0){ u.fade = Math.max(0, u.fade - dt*2); u.spr.material.opacity = u.fade; u.spr.material.transparent = true; u.sh.visible = u.fade > 0.2; if(u.fade <= 0) u.spr.visible = false; }
          else if(u.alive && !u.anim){ var bob = u === SQ.cur ? Math.sin(tm*6)*0.5 : 0; u.spr.position.y = u.y + TS*0.79 - 0.4 + bob; }
          swimTick(u, tm);
        });
        waterTick(tm);
        if(SQ.cur && SQ.cur.alive && ring.visible){ ring.position.set(SQ.cur.x, Math.max(SQ.cur.y, 0.5) + 0.25, SQ.cur.z); ring.scale.setScalar(1 + Math.sin(tm*5)*0.08); arrow.position.set(SQ.cur.x, SQ.cur.y + TS*2.3 + Math.abs(Math.sin(tm*4))*1.4, SQ.cur.z); }
        floats.forEach(function(f){ if(!f.on) return; f.t += dt; f.s.position.y = f.y0 + f.t*5; f.s.material.opacity = Math.max(0, 1 - Math.max(0, f.t - 0.7)/0.7); if(f.t > 1.4){ f.on = false; f.s.visible = false; } });
      };
      // 테스트용: 국군도 AI 로 자동 진행
      SQ.autoplay = function(on){ SQ.auto = !!on; if(on && SQ.cur && SQ.cur.side === "rok" && (SQ.mode === "move" || SQ.mode === "idle")) aiTurn(SQ.cur); };
      SQ.dbg = { place:function(u, i, j){ placeUnit(u, i, j); }, hl:function(){ return hlMesh; }, neighbors:neighbors, clickTile:clickTile, pickAct:pickAct, tileOf:tileOf, reach:reach, rightClick:rightClick, finish:finish };
      SQ.gasFx = function(tgt){ if(window.__tbFx){ var fx = window.__tbFx(); if(fx && fx.puff){ /* 전선 전투용 효과는 이 무대에 안 보여서 생략 */ } } };
    })();
