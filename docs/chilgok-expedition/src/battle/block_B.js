    // ================= 칠곡 턴제 전투 (국군 100 : 북한군 100 + 루샤) =================
    // 호국탑 가는 길(월드 z≈1930~2075)에서 국군을 만나면 시작해요. 실시간 전투는 이 턴제로 바뀌었어요.
    // 규칙(갓루다님 설계): 국군/북한군 HP 100 · 총 한 발 40 · 우리 차례(토끼가 움직이고 행동 → 국군 전체 자동 행동) → 적 차례(루샤 스킬 → 북한군 전체 자동 행동)
    // 토끼 스킬 Q 당근 나눠주기(+30 회복) / W 뒷다리 걷어차기(-80) / E 토끼의 유혹(북한군 2명이 따라옴)
    // 루샤 스킬 Q 음침한 기운(3턴간 국군 공격 40→36, 재사용 6턴) / W 어둠의 손길(국군 1명을 2턴간 세뇌) / E 사악한 미소(1번, 10턴 뒤부터, 국군 전체 -10)
    (function buildTurnBattle(){
      var T = 5, Z0 = 1990, NSIDE = 1000, COLS = 40, ROWS = 25, UH = 10, RANGE = 5, DMG = 40, HP = 100, MOVES = 3;
      var BX = 22, BZ0 = -40, BZ1 = 55;
      var LUCIA_SRC = "data:image/webp;base64,__LUCIA__";
      var built = false, G = null, ui = null, rok = [], nk = [], hrok = [], hnk = [], occ = {}, wall = null;
      var RAB = { kind:"rabbit", gx:0, gz:0, hp:300, vhp:300, shots:0, def:false, items:3, alive:true };
      var LUC = { kind:"lucia", gx:0, gz:21, hp:300, vhp:300, alive:true, cdQ:0, cdW:0, usedE:false, curse:0 };
      var S = { state:"idle", active:false, turn:1, moves:MOVES, acted:false, cd:{ q:0, w:0, e:0 }, anim:null, cool:0, log:[], menu:false, dlg:null, intro:0, prevKeys:{}, tw:null, ended:false };
      function mkTank(side, hx){ return { kind:"tank", side:side, gx:hx, hx:hx, gz:side === "rok" ? -33 : 43, hp:190, vhp:190, maxHp:190, atk:85, alive:true, x:0, z:0, hit:0, die:-1, fireWait:0, shot:null, t3:null, engaged:false }; }
      var ROKT = mkTank("rok", -10), ROKT2 = mkTank("rok", 10), NKT = mkTank("nk", -10), NKT2 = mkTank("nk", 10), TANKS = [ROKT, ROKT2, NKT, NKT2];
      function mkPlane(side){ return { kind:"plane", side:side, hp:350, vhp:350, maxHp:350, atk:30, alive:true, die:-1, x:0, y:44, z:Z0 + 40, gx:0, gz:0, vx:0, vy:0, vz:0, yaw:0, pitch:0, roll:0, mode:"patrol", mt:0, hit:0, shot:null, p3:null, init:false }; }
      var P2 = { kind:"p2", side:"rok", gx:2, gz:0, hp:250, vhp:250, maxHp:250, atk:35, alive:true, x:0, z:0, die:-1, hit:0, shots:0 }, LV2 = { cast:0, face:undefined, ft:0 }, LUC3b = null;
      var SUPPORT_RANGE = 5, COUNTER_RANGE = 5;
      var PLR = mkPlane("rok"), PLN = mkPlane("nk"), PLANES = [PLR, PLN];
      // ---------- 유닛 데이터 시트 (UnitData: 체력/공격력) ----------
      // 표는 data/units.csv (구글 시트/엑셀에서 열어 편집). 첫 두 행 Player / Enemy = 국군 병사 / 북한군 병사, 나머지는 토끼·루샤·탱크.
      // 게임 시작(전투 편성) 때 이 체력으로 설정하고, 공격하면 공격력만큼 체력을 깎아요.
      var UNIT_CSV = "__UNIT_CSV__";
      var UNIT_SHEET_URL = "";      // 구글 시트 '웹에 게시 → CSV' 주소를 넣으면 시작 때 그 표를 읽어요 (실패하면 내장 표 사용)
      function UnitData(id, name, hp, atk){ return { id:id, name:name, hp:hp, atk:atk }; }
      var UD = { player:UnitData("Player", "국군 병사", 100, 40), enemy:UnitData("Enemy", "북한군 병사", 100, 40), rabbit:UnitData("Rabbit", "토끼", 300, 30), lucia:UnitData("Lucia", "루샤", 300, 40), tankplayer:UnitData("TankPlayer", "국군 탱크", 190, 85), tankenemy:UnitData("TankEnemy", "북한군 탱크", 190, 85), planeplayer:UnitData("PlanePlayer", "국군 전투기", 350, 30), planeenemy:UnitData("PlaneEnemy", "북한군 전투기", 350, 30), player2:UnitData("Player2", "루샤(2P)", 250, 35), mgplayer:UnitData("MgPlayer", "국군 기관총", 150, 25), mgenemy:UnitData("MgEnemy", "북한군 기관총", 150, 25), sniperplayer:UnitData("SniperPlayer", "국군 저격수", 60, 70), sniperenemy:UnitData("SniperEnemy", "북한군 저격수", 60, 70) };
      function parseUnitCsv(txt){
        var rows = String(txt || "").replace(/\r/g, "").split("\n").map(function(l){ return l.trim(); }).filter(function(l){ return l; }), n = 0; if(rows.length < 2) return 0;
        var head = rows[0].split(",").map(function(h){ return h.trim().toLowerCase(); }), ci = head.indexOf("id"), ch = head.indexOf("hp"), ca = head.indexOf("atk"), cn = head.indexOf("name"); if(ci < 0 || ch < 0 || ca < 0) return 0;
        rows.slice(1).forEach(function(r){ var c = r.split(","), key = (c[ci] || "").trim().toLowerCase(), hp = parseFloat(c[ch]), atk = parseFloat(c[ca]); if(!UD[key] || !(hp >= 1) || !(atk >= 0)){ if(key && window.console) console.warn("유닛 시트: 건너뜀", r); return; } UD[key].hp = Math.round(hp); UD[key].atk = Math.round(atk); if(cn >= 0 && c[cn]) UD[key].name = c[cn].trim(); n++; });
        return n;
      }
      parseUnitCsv(UNIT_CSV);
      window.UnitSheet = { data:UD, csv:UNIT_CSV, load:function(txt){ var n = parseUnitCsv(txt); if(n && built && !S.active) setupFormation(); return n; } };
      function loadRemoteSheet(){ var url = UNIT_SHEET_URL; try{ url = url || localStorage.getItem("unitSheetUrl") || ""; }catch(e){} if(!url || !window.fetch) return; fetch(url).then(function(r){ return r.text(); }).then(function(t){ window.UnitSheet.load(t); }).catch(function(){}); }
      function atkOf(u){ return Math.round(u.atk*((u.side === "rok" && !(u.brain > 0) && LUC.curse > 0) ? 0.9 : 1)); }
      var FX = null, barList = [], pending = [], POSE = null;
      function later(sec, fn){ pending.push({ t:sec, fn:fn }); }
      function shake(p){ S.shake = Math.max(S.shake || 0, p); }
      function smooth(x){ x = Math.max(0, Math.min(1, x)); return x*x*(3 - 2*x); }
      // 함곡이 3D 모델의 포즈 덮어쓰기 (block_H 의 hamgokiUpdate 가 불러요): 뒷다리 차기 / 유혹
      window.hamPose = function(dt){
        if(!POSE) return null; POSE.t += dt; var t = POSE.t; if(t > POSE.dur){ POSE = null; return null; }
        if(POSE.kind === "kick"){ var wind = smooth(t/0.4), snap = smooth((t - 0.4)/0.09), rec = smooth((t - 0.85)/0.35), a = (0.15*wind + 1.45*snap)*(1 - rec), osc = (t > 0.45 && t < 0.85) ? Math.sin(t*46)*0.18 : 0;
          return { legs:a + osc, legs2:a*0.9 - osc, lean:(0.25*wind + 0.85*snap)*(1 - rec), arm:-0.7*(wind)*(1 - rec), az:0.25, bob:(10*wind + 14*snap)*(1 - rec), yaw:POSE.yaw, ear:0.7 }; }
        var up = smooth(t/0.25)*(1 - smooth((t - 0.95)/0.2)); return { arm:-2.9*up, az:0.5*up, lean:-0.12*up, bob:Math.abs(Math.sin(t*11))*13*up, legs:0, legs2:0, ear:0.35 };
      }
      var rnd = (function(){ var s = 7771; return function(){ s = (s*16807) % 2147483647; return s/2147483647; }; })();

      // ---------- 명령 패턴: ICommand { execute(), undo() } / TurnManager.commandHistory (Stack<ICommand>) ----------
      // 모든 행동(이동·공격·스킬·적의 공격)은 명령 객체로 만들어 실행하고 스택에 쌓아요. 우클릭 = pop → undo.
      var TM = { commandHistory:[], team:"player", group:0, gid:0,
        push:function(cmd){ cmd.team = TM.team; cmd.group = TM.group || ++TM.gid; cmd.execute(); TM.commandHistory.push(cmd); return cmd; },
        batch:function(fn){ var g0 = TM.group; TM.group = ++TM.gid; try{ fn(); } finally { TM.group = g0; } },
        clear:function(){ TM.commandHistory.length = 0; },
        undoOne:function(){ var c = TM.commandHistory.pop(); if(c) c.undo(); return c; },
        // 적 행동 직후: 플레이어(국군 포함) 행동이 나올 때까지 연속 undo / 그 밖: 같은 묶음(한 번의 행동·국군 일제사격)만 undo
        undo:function(){ var h = TM.commandHistory, n = 0; if(!h.length) return 0; var top = h[h.length - 1];
          if(top.team === "enemy"){ while(h.length && h[h.length - 1].team === "enemy"){ TM.undoOne(); n++; } }
          else { var g = top.group; while(h.length && h[h.length - 1].group === g && h[h.length - 1].team !== "enemy"){ TM.undoOne(); n++; } }
          return n; } };
      function applyDmg(t, dmg){ var d = dmg; if(t.kind === "rabbit"){ d = RAB.def ? Math.round(dmg*0.5) : dmg; RAB.hp -= d; return d; } t.hp -= d; if(t.hp <= 0){ t.alive = false; if(occ[key(t.gx, t.gz)] === t) delete occ[key(t.gx, t.gz)]; } return d; }
      function AttackCommand(att, tgt, dmg, pHit){
        var c = { kind:"attack", att:att, tgt:tgt, dmg:dmg, pHit:pHit, hit:undefined, dealt:0, prev:null,
          execute:function(){ var t = c.tgt; c.prev = { hp:t.hp, alive:t.alive }; if(c.hit === undefined) c.hit = rnd() < c.pHit; c.dealt = c.hit ? applyDmg(t, c.dmg) : 0; },
          undo:function(){ var t = c.tgt, pv = c.prev; if(!pv) return; t.hp = pv.hp; t.vhp = pv.hp; if(pv.alive && !t.alive && t.kind !== "plane" && !t.hill){ occ[key(t.gx, t.gz)] = t; } t.alive = pv.alive; if(t.alive){ t.die = -1; t.hit = 0; if(t === LUC){ LV.die = -1; } if(t.kind === "tank" && t.t3) t.t3.setWreck(false); if(t.kind === "plane") planeReset(t); } } };
        return c;
      }
      function MoveCommand(u, nx, nz){
        var c = { kind:"move", u:u, nx:nx, nz:nz, ox:0, oz:0,
          execute:function(){ c.ox = u.gx; c.oz = u.gz; if(occ[key(u.gx, u.gz)] === u) delete occ[key(u.gx, u.gz)]; u.gx = nx; u.gz = nz; occ[key(nx, nz)] = u; if(u === RAB){ S.moves--; tween(state.player, wx(nx), wz(nz), 0.2); } },
          undo:function(){ if(occ[key(u.gx, u.gz)] === u) delete occ[key(u.gx, u.gz)]; u.gx = c.ox; u.gz = c.oz; occ[key(u.gx, u.gz)] = u; if(u === RAB){ S.moves++; tween(state.player, wx(u.gx), wz(u.gz), 0.2); } } };
        return c;
      }
      function snapshot(){
        var o = { P:{ gx:P2.gx, gz:P2.gz, hp:P2.hp, alive:P2.alive }, S:{ turn:S.turn, moves:S.moves, acted:S.acted, q:S.cd.q, w:S.cd.w, e:S.cd.e, vd:!!S.volleyDone }, R:{ gx:RAB.gx, gz:RAB.gz, hp:RAB.hp, def:RAB.def, items:RAB.items }, L:{ gx:LUC.gx, gz:LUC.gz, hp:LUC.hp, alive:LUC.alive, cdQ:LUC.cdQ, cdW:LUC.cdW, usedE:LUC.usedE, curse:LUC.curse }, u:[], t:[] };
        ALL.forEach(function(u){ o.u.push([u.gx, u.gz, u.hp, u.alive, u.brain, u.charm]); }); TANKS.concat(PLANES).forEach(function(k){ o.t.push([k.hp, k.alive]); });
        return o;
      }
      function restoreSnap(o){
        S.turn = o.S.turn; S.moves = o.S.moves; S.acted = o.S.acted; S.cd.q = o.S.q; S.cd.w = o.S.w; S.cd.e = o.S.e; S.volleyDone = o.S.vd;
        P2.gx = o.P.gx; P2.gz = o.P.gz; P2.hp = P2.vhp = o.P.hp; P2.alive = o.P.alive; if(P2.alive){ P2.die = -1; P2.hit = 0; }
        RAB.gx = o.R.gx; RAB.gz = o.R.gz; RAB.hp = RAB.vhp = o.R.hp; RAB.def = o.R.def; RAB.items = o.R.items; tween(state.player, wx(RAB.gx), wz(RAB.gz), 0.2);
        LUC.gx = o.L.gx; LUC.gz = o.L.gz; LUC.hp = LUC.vhp = o.L.hp; LUC.alive = o.L.alive; LUC.cdQ = o.L.cdQ; LUC.cdW = o.L.cdW; LUC.usedE = o.L.usedE; LUC.curse = o.L.curse; if(LUC.alive) LV.die = -1;
        var all = ALL; occ = {};
        all.forEach(function(u, i){ var r = o.u[i]; u.gx = r[0]; u.gz = r[1]; u.hp = u.vhp = r[2]; u.alive = r[3]; u.brain = r[4]; u.charm = r[5]; if(u.alive){ u.die = -1; u.hit = 0; if(!u.hill) occ[key(u.gx, u.gz)] = u; } else if(u.die < 0) u.die = 3; u.fireT = 0; u.fireWait = 0; u.shot = null; });
        TANKS.concat(PLANES).forEach(function(k, i){ k.hp = k.vhp = o.t[i][0]; k.alive = o.t[i][1]; if(k.alive){ if(k.kind === "plane") planeReset(k); else { occ[key(k.gx, k.gz)] = k; if(k.t3) k.t3.setWreck(false); } } });
        occ[key(RAB.gx, RAB.gz)] = RAB; if(LUC.alive) occ[key(LUC.gx, LUC.gz)] = LUC; if(P2.alive) occ[key(P2.gx, P2.gz)] = P2;
      }
      function SnapCommand(fn){ var c = { kind:"state", before:null, execute:function(){ c.before = snapshot(); fn(); }, undo:function(){ if(c.before) restoreSnap(c.before); } }; return c; }
      function wx(gx){ return -gx*T; } function wz(gz){ return Z0 + gz*T; }
      function key(gx, gz){ return gx + "," + gz; }
      function dist(a, b){ return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gz - b.gz)); }
      function inb(gx, gz){ if(!(gx >= -BX && gx <= BX && gz >= BZ0 && gz <= BZ1)) return false; return typeof insideAnyHill !== "function" || !insideAnyHill(wx(gx), wz(gz), 8); }      // 산(언덕)은 올라가지 않아요
      function tex(src){ var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = src; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
      var TX = {};
      function mkSprite(t, h, asp, tint){ var m = new THREE.SpriteMaterial({ map:t, transparent:true, alphaTest:0.4, fog:false, color:tint || 0xffffff }); var s = new THREE.Sprite(m); s.scale.set(h*asp, h, 1); s.center.set(0.5, 0); return s; }
      var RIG = null, LUC3 = null, LV = { x:0, z:0, vis:false, cast:0, die:-1, walkIn:false, laugh:false };
      function mkUnit(side, gx, gz, i){
        var ud = side === "rok" ? UD.player : UD.enemy, u = { kind:"soldier", side:side, id:side + i, gx:gx, gz:gz, hp:ud.hp, vhp:ud.hp, maxHp:ud.hp, atk:ud.atk, shot:null, alive:true, x:wx(gx), z:wz(gz), fx:wx(gx), fz:wz(gz), brain:0, charm:0, bar:null, hit:0, die:-1, fireT:0, cheer:0, vis:side === "rok" };
        occ[key(gx, gz)] = u; return u;
      }
      // ---------- 언덕 사수: 언덕마다 기관총 1명 + 저격수 2명 ----------
      // 화면 왼쪽(+x) 언덕 = 북한군, 오른쪽(-x) 언덕 = 국군. 전투 구역(z 1700~2550) 안의 언덕만 써요.
      var HILLSPOT = null;
      function hillSpots(){
        if(HILLSPOT) return HILLSPOT; HILLSPOT = { rok:[], nk:[] }; if(typeof HILLS === "undefined" || typeof groundHeightAt !== "function") return HILLSPOT;
        HILLS.forEach(function(h){
          if(h.cz < 1700 || h.cz > 2550) return; var side = h.cx > 0 ? "nk" : "rok", pts = [], k, sx = h.cx > 0 ? -1 : 1;     // 필드 중앙(x=0) 쪽 비탈을 우선
          for(k = 0; k < 220; k++){ var ang = (k*2.399963) % 6.283, rad = Math.sqrt((k + 1)/220)*0.97, px = h.cx + Math.cos(ang)*h.ax*rad, pz = h.cz + Math.sin(ang)*h.az*rad; pts.push({ x:px, z:pz, y:groundHeightAt(px, pz) }); }
          var mid = pts.filter(function(q){ return q.y >= 26 && q.y <= 55; }); if(mid.length < 3) mid = pts.slice().sort(function(a, b){ return a.y - b.y; }).filter(function(q){ return q.y > 8; });      // 중턱(눈에 잘 띄는 높이), 전장 쪽 비탈 우선
          mid.sort(function(a, b){ return Math.abs(a.x) - Math.abs(b.x); }); var pick = [mid[0]]; for(k = 1; k < mid.length && pick.length < 3; k++){ if(pick.every(function(q){ return Math.hypot(q.x - mid[k].x, q.z - mid[k].z) > 22; })) pick.push(mid[k]); }
          HILLSPOT[side].push(pick);
        });
        return HILLSPOT;
      }
      function mkHill(side, role, p, idx){
        var ud = side === "rok" ? (role === "mg" ? UD.mgplayer : UD.sniperplayer) : (role === "mg" ? UD.mgenemy : UD.sniperenemy), yaw = Math.atan2(-p.x, (Z0 + 70) - p.z);
        return { kind:"soldier", role:role, hill:true, side:side, id:side + role + idx, gx:-p.x/T, gz:(p.z - Z0)/T, hp:ud.hp, vhp:ud.hp, maxHp:ud.hp, atk:ud.atk, alive:true, x:p.x, z:p.z, y:p.y, fx:p.x, fz:p.z, brain:0, charm:0, hit:0, die:-1, fireT:0, fireWait:0, shot:null, shotQ:[], cheer:0, vis:true, yaw0:yaw, prop:null };
      }
      var ALL = [];
      function buildHillUnits(){
        var HS = hillSpots(), old = { rok:hrok.slice(), nk:hnk.slice() }; hrok.length = 0; hnk.length = 0;
        ["rok", "nk"].forEach(function(side){ var arr = side === "rok" ? hrok : hnk; HS[side].forEach(function(pick, hi){ pick.forEach(function(p, j){ var u = mkHill(side, j === 0 ? "mg" : "sniper", p, hi*3 + j); var prev = old[side][arr.length]; u.prop = prev ? prev.prop : null; if(!u.prop && FX){ u.prop = FX.makeEmp(u.role, side, p.x + Math.sin(u.yaw0)*3.2, p.y, p.z + Math.cos(u.yaw0)*3.2, u.yaw0); } arr.push(u); }); }); }); ALL = rok.concat(nk, hrok, hnk);
      }
      function setupFormation(){
        var i, c, r; rok.length = 0; nk.length = 0; occ = {};
        for(r = 0; r < ROWS; r++) for(c = 0; c < COLS; c++){ var gx = c - COLS/2, gz = -1 - r; rok.push(mkUnit("rok", gx, gz, r*COLS + c)); }
        for(r = 0; r < ROWS; r++) for(c = 0; c < COLS; c++){ var gx2 = c - COLS/2, gz2 = 8 + r; nk.push(mkUnit("nk", gx2, gz2 + 40, r*COLS + c)); }
        RAB.gx = 0; RAB.gz = 0; RAB.maxHp = UD.rabbit.hp; RAB.atk = UD.rabbit.atk; RAB.hp = RAB.vhp = RAB.maxHp; RAB.def = false; RAB.items = 3; RAB.alive = true; RAB.shots = 0; occ[key(0, 0)] = RAB;
        LUC.gx = 0; LUC.gz = 36 + 40; LUC.maxHp = UD.lucia.hp; LUC.atk = UD.lucia.atk; LUC.hp = LUC.vhp = LUC.maxHp; LUC.alive = true; LUC.cdQ = 0; LUC.cdW = 0; LUC.usedE = false; LUC.curse = 0; occ[key(LUC.gx, LUC.gz)] = LUC;
        TANKS.forEach(function(k){ var tu = k.side === "rok" ? UD.tankplayer : UD.tankenemy; k.maxHp = tu.hp; k.atk = tu.atk; k.hp = k.vhp = tu.hp; k.alive = true; k.die = -1; k.fireWait = 0; k.shot = null; k.engaged = false; k.gz = k.side === "rok" ? -33 : 43 + 40; k.gx = k.hx; k.x = wx(k.gx); k.z = wz(k.gz); occ[key(k.gx, k.gz)] = k; if(k.t3){ k.t3.setWreck(false); k.t3.wreck = 0; k.t3.setVisible(k.side === "rok"); } });
        P2.maxHp = UD.player2.hp; P2.atk = UD.player2.atk; P2.hp = P2.vhp = P2.maxHp; P2.alive = true; P2.die = -1; P2.hit = 0; P2.shots = 0; P2.gx = 2; P2.gz = 0; P2.x = wx(2); P2.z = wz(0); occ[key(2, 0)] = P2; LV2.cast = 0; LV2.face = undefined; LV2.ft = 0;
        buildHillUnits();
        PLANES.forEach(function(pl){ var pu = pl.side === "rok" ? UD.planeplayer : UD.planeenemy; pl.maxHp = pu.hp; pl.atk = pu.atk; pl.hp = pl.vhp = pu.hp; pl.alive = true; pl.die = -1; pl.mode = "patrol"; pl.shot = null; pl.mt = 0; pl.init = false; if(pl.p3){ pl.p3.setWreck(false); pl.p3.wreck = 0; pl.p3.setVisible(true); } });
        TM.clear(); S.volleyDone = false; TM.team = "player"; TM.group = 0;
      }
      // ---------- 이펙트 (선 / 글자 / 물방울) ----------
      var lines = [], texts = [];
      function initFx(){
        var i; for(i = 0; i < 40; i++){ var gm = new THREE.BufferGeometry(); gm.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); var l = new THREE.Line(gm, new THREE.LineBasicMaterial({ color:0xffe27a, transparent:true, opacity:0, fog:false })); l.visible = false; l.frustumCulled = false; l.userData = { t:9 }; G.add(l); lines.push(l); }
        for(i = 0; i < 120; i++){ var cv = document.createElement("canvas"); cv.width = 128; cv.height = 48; var tx = new THREE.CanvasTexture(cv); var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tx, transparent:true, depthTest:false, fog:false })); sp.scale.set(12, 4.5, 1); sp.visible = false; sp.renderOrder = 50; sp.userData = { cv:cv, tx:tx, t:9 }; G.add(sp); texts.push(sp); }
        RIG = window.TBRig.create(G, 2300); LUC3 = window.TBLucia.create(G); LUC3b = window.TBLucia.create(G); LUC3b.tint(0x2f7fe0, 0.62); FX = window.TBFx.create(G); TANKS.forEach(function(k){ k.t3 = FX.makeTank(k.side); if(k.side === "nk"){ k.t3.yaw = Math.PI; k.t3.aimYaw = Math.PI; } else k.t3.setVisible(true); }); PLANES.forEach(function(pl){ pl.p3 = FX.makePlane(pl.side); pl.p3.setVisible(true); });
      }
      function floatText(x, y, z, txt, col){ var s = null, i; for(i = 0; i < texts.length; i++) if(!texts[i].visible){ s = texts[i]; break; } if(!s) return; var c = s.userData.cv, g = c.getContext("2d"); g.clearRect(0, 0, 128, 48); g.font = "bold 30px Arial, sans-serif"; g.textAlign = "center"; g.lineWidth = 6; g.strokeStyle = "rgba(0,0,0,0.85)"; g.strokeText(txt, 64, 34); g.fillStyle = col || "#fff"; g.fillText(txt, 64, 34); s.userData.tx.needsUpdate = true; s.userData.t = 0; s.userData.y0 = y; s.position.set(x, y, z); s.material.opacity = 1; s.visible = true; }
      function tracer(a, b){ var l = null, i; for(i = 0; i < lines.length; i++) if(!lines[i].visible){ l = lines[i]; break; } if(!l) return; var P = l.geometry.attributes.position; P.setXYZ(0, a.x, UH*0.55, a.z); P.setXYZ(1, b.x, UH*0.5, b.z); P.needsUpdate = true; l.userData.t = 0; l.material.opacity = 1; l.visible = true; }
      // ---------- UI ----------
      function mkUI(){
        var holder = document.getElementById("canvasHolder"); if(!holder || ui) return;
        ui = {}; var root = document.createElement("div"); root.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:25;font-family:inherit;"; holder.appendChild(root); ui.root = root;
        function el(css, html){ var d = document.createElement("div"); d.style.cssText = css; if(html) d.innerHTML = html; root.appendChild(d); return d; }
        ui.top = el("position:absolute;left:8px;top:8px;background:rgba(18,22,50,.78);color:#fff;padding:7px 11px;border-radius:12px;font-size:12px;line-height:1.55;display:none;pointer-events:none;");
        ui.log = el("position:absolute;left:50%;top:8px;transform:translateX(-50%);max-width:46%;background:rgba(0,0,0,.55);color:#fff;padding:5px 12px;border-radius:10px;font-size:12px;text-align:center;display:none;pointer-events:none;");
        ui.menu = el("position:absolute;left:50%;bottom:8px;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:6px;pointer-events:auto;");
        ui.info = document.createElement("div"); ui.info.style.cssText = "background:rgba(20,28,60,.8);color:#ffe9a8;padding:3px 12px;border-radius:9px;font-size:12px;"; ui.menu.appendChild(ui.info);
        ui.skills = document.createElement("div"); ui.skills.style.cssText = "display:none;gap:5px;"; ui.menu.appendChild(ui.skills);
        ui.row = document.createElement("div"); ui.row.style.cssText = "display:flex;gap:5px;flex-wrap:wrap;justify-content:center;"; ui.menu.appendChild(ui.row);
        function btn(parent, label, fn, css){ var b = document.createElement("button"); b.innerHTML = label; b.style.cssText = "padding:7px 11px;border-radius:10px;border:2px solid #d8b04a;background:#fffaf0;color:#2b3a6a;font-weight:800;font-size:13px;cursor:pointer;font-family:inherit;" + (css || ""); b.addEventListener("click", function(e){ e.stopPropagation(); fn(); }); parent.appendChild(b); return b; }
        ui.bAtk = btn(ui.row, "⚔ 공격 <small>1</small>", function(){ doAttack(); }); ui.bDef = btn(ui.row, "🛡 방어 <small>2</small>", function(){ doDefend(); }); ui.bItem = btn(ui.row, "🍙 아이템 <small>3</small>", function(){ doItem(); }); ui.bSkill = btn(ui.row, "✨ 스킬 <small>4</small>", function(){ toggleSkills(); }); ui.bRet = btn(ui.row, "🏃 후퇴 <small>5</small>", function(){ doRetreat(); }, "border-color:#c97a7a;"); ui.bEnd = btn(ui.row, "⏭ 턴 종료 <small>Space</small>", function(){ endPlayerTurn(); }, "background:#2b3a6a;color:#fff;");
        ui.sQ = btn(ui.skills, "🥕 당근 나눠주기 <small>Q</small>", function(){ skillQ(); }); ui.sW = btn(ui.skills, "🦵 뒷다리 걷어차기 <small>W</small>", function(){ skillW(); }); ui.sE = btn(ui.skills, "💘 토끼의 유혹 <small>E</small>", function(){ skillE(); });
        ui.prompt = el("position:absolute;inset:0;background:rgba(10,14,36,.55);display:none;align-items:center;justify-content:center;pointer-events:auto;");
        var pb = document.createElement("div"); pb.style.cssText = "background:#fffaf0;border:3px solid #d8b04a;border-radius:16px;padding:16px 20px;text-align:center;color:#2b3a6a;max-width:86%;"; pb.innerHTML = '<div style="font-weight:800;font-size:16px;margin-bottom:6px">🎖 국군과 북한군이 싸우고 있어요!</div><div style="font-size:13px;margin-bottom:12px">턴제게임 전투를 시작할까요? <small>(국군 1000 : 북한군 1000)</small></div>'; ui.prompt.appendChild(pb); var pr = document.createElement("div"); pr.style.cssText = "display:flex;gap:8px;justify-content:center;"; pb.appendChild(pr);
        btn(pr, "시작 <small>Enter</small>", function(){ startBattle(); }, "background:#2b3a6a;color:#fff;"); btn(pr, "나중에 <small>Esc</small>", function(){ closePrompt(true); });
        ui.dlg = el("position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:min(560px,92%);background:rgba(24,12,48,.9);border:3px solid #a45cff;border-radius:14px;padding:10px 12px;color:#fff;display:none;gap:10px;align-items:center;pointer-events:auto;cursor:pointer;");
        ui.dlgImg = document.createElement("img"); ui.dlgImg.src = LUCIA_SRC; ui.dlgImg.style.cssText = "width:72px;height:104px;object-fit:contain;flex:0 0 auto;"; ui.dlg.appendChild(ui.dlgImg);
        var dt = document.createElement("div"); dt.style.cssText = "flex:1;"; ui.dlgName = document.createElement("div"); ui.dlgName.style.cssText = "font-weight:800;color:#d9b3ff;font-size:13px;margin-bottom:3px;"; ui.dlgText = document.createElement("div"); ui.dlgText.style.cssText = "font-size:15px;line-height:1.5;"; var nx = document.createElement("div"); nx.style.cssText = "text-align:right;font-size:11px;color:#b9a3d9;margin-top:4px;"; nx.textContent = "▶ 클릭 / Space"; dt.appendChild(ui.dlgName); dt.appendChild(ui.dlgText); dt.appendChild(nx); ui.dlg.appendChild(dt);
        ui.dlg.addEventListener("click", function(e){ e.stopPropagation(); nextDlg(); });
        ui.fade = el("position:absolute;inset:0;background:#000;opacity:0;transition:opacity .5s;pointer-events:none;z-index:40;");
        ui.end = el("position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:42px;font-weight:900;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.7);display:none;pointer-events:none;");
      }
      function say(m){ S.log.push(m); if(S.log.length > 3) S.log.shift(); if(ui){ ui.log.innerHTML = S.log.join("<br>"); ui.log.style.display = "block"; } }
      function counts(){ var a = 0, b = 0; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) a++; }); nk.forEach(function(u){ if(u.alive) b++; }); rok.forEach(function(u){ if(u.alive && u.brain > 0) b++; }); return { a:a, b:b }; }
      function refreshUI(){
        if(!ui) return; var c = counts(), ph = S.state === "player" ? "<b style='color:#9fe0ff'>우리 차례</b>" : "<b style='color:#ff9f9f'>" + (S.state === "enemy" ? "적 차례" : "…") + "</b>";
        ui.top.style.display = S.active ? "block" : "none";
        ui.top.innerHTML = "⚔ <b>턴 " + S.turn + "</b> · " + ph + "<br>🎖 국군 " + c.a + "/" + NSIDE + " · 🪖 북한군 " + c.b + "/" + NSIDE + "<br>🐰 HP " + Math.max(0, RAB.hp) + "/" + RAB.maxHp + (RAB.def ? " 🛡" : "") + " · 😈 루샤 " + Math.max(0, LUC.hp) + "/" + LUC.maxHp + "<br>🧙 2P 루샤 HP " + Math.max(0, P2.hp) + "/" + P2.maxHp + (LUC.curse > 0 ? " · 음침한 기운 " + LUC.curse + "턴" : "");
        var pt = S.active && S.state === "player"; ui.menu.style.display = pt ? "flex" : "none";
        ui.info.textContent = "이동 " + S.moves + "칸 남음 (방향키/WASD 한 칸씩) · " + (S.acted ? "행동 완료" : "행동 1회") + " · 우클릭: 되돌리기";
        ui.sQ.innerHTML = "🥕 당근 나눠주기 <small>Q" + (S.cd.q > 0 ? " ·" + S.cd.q + "턴" : "") + "</small>"; ui.sW.innerHTML = "🦵 뒷다리 걷어차기 <small>W" + (S.cd.w > 0 ? " ·" + S.cd.w + "턴" : "") + "</small>"; ui.sE.innerHTML = "💘 토끼의 유혹 <small>E" + (S.cd.e > 0 ? " ·" + S.cd.e + "턴" : "") + "</small>";
        ui.bItem.innerHTML = "🍙 아이템 " + RAB.items + " <small>3</small>";
      }
      // ---------- 대사 ----------
      function showDlg(lines, done, portrait){ S.dlg = { lines:lines, i:0, done:done }; if(ui){ ui.dlg.style.display = "flex"; ui.dlgImg.style.display = portrait === false ? "none" : "block"; } renderDlg(); }
      function renderDlg(){ var d = S.dlg; if(!d || !ui) return; var l = d.lines[d.i]; ui.dlgName.textContent = l[0]; ui.dlgText.textContent = l[1]; }
      function nextDlg(){ var d = S.dlg; if(!d) return; d.i++; if(d.i >= d.lines.length){ S.dlg = null; if(ui) ui.dlg.style.display = "none"; if(d.done) d.done(); } else renderDlg(); }
      // ---------- 전투 시작/종료 ----------
      // ================= 자연 전투 (무작위 난전): 전투 시작 전, 국군 1000 : 북한군 1000 이 실시간으로 서로 싸워요 =================
      // 규칙: 각자 가장 가까운 적을 찾아 다가가 총을 쏘고(명중률은 거리에 따라), 3발이면 쓰러져요. 탱크는 가끔 포탄. 한쪽이 거의 전멸하면 잠시 뒤 다시 시작.
      var AMB = { on:true, gt:0, cnt:{ rok:0, nk:0 }, resetT:0 }, AG = { rok:[], nk:[] }, CS = 12, GXN = 26, GZN = 42, GX0 = -156, GZ0 = 1780, AN = GXN*GZN, gi0;
      for(gi0 = 0; gi0 < AN; gi0++){ AG.rok.push([]); AG.nk.push([]); }
      function agIdx(x, z){ var cx = Math.floor((x - GX0)/CS), cz = Math.floor((z - GZ0)/CS); cx = cx < 0 ? 0 : (cx >= GXN ? GXN - 1 : cx); cz = cz < 0 ? 0 : (cz >= GZN ? GZN - 1 : cz); return cx*GZN + cz; }
      function ambRebuild(){ var i, u; for(i = 0; i < AN; i++){ AG.rok[i].length = 0; AG.nk[i].length = 0; } for(i = 0; i < rok.length; i++){ u = rok[i]; if(u.alive) AG.rok[agIdx(u.x, u.z)].push(u); } for(i = 0; i < nk.length; i++){ u = nk[i]; if(u.alive) AG.nk[agIdx(u.x, u.z)].push(u); } }
      function ambNearest(u){
        var ec = u.side === "rok" ? AG.nk : AG.rok, cx = Math.floor((u.x - GX0)/CS), cz = Math.floor((u.z - GZ0)/CS), best = null, bd = 1e12, r, dx, dz, k;
        for(r = 0; r <= 12; r++){
          for(dx = -r; dx <= r; dx++) for(dz = -r; dz <= r; dz++){ if(Math.max(dx < 0 ? -dx : dx, dz < 0 ? -dz : dz) !== r) continue; var X = cx + dx, Z = cz + dz; if(X < 0 || X >= GXN || Z < 0 || Z >= GZN) continue; var arr = ec[X*GZN + Z]; for(k = 0; k < arr.length; k++){ var o = arr[k]; if(!o.alive) continue; var d2 = (o.x - u.x)*(o.x - u.x) + (o.z - u.z)*(o.z - u.z); if(d2 < bd){ bd = d2; best = o; } } }
          if(best && r*CS >= Math.sqrt(bd)) break;
        }
        return best;
      }
      function ambDamage(t, dmg){ t.hp -= dmg; t.vhp = t.hp; if(t.hp <= 0 && t.alive){ t.alive = false; t.die = 0; t.fireT = 0; AMB.cnt[t.side]--; } else t.hit = 0.25; }
      function ambShoot(u, t, d, camp){
        var hit = Math.random() < (d < 22 ? 0.6 : (d < 36 ? 0.45 : 0.3)); u.fireT = 0.5; u.fx = t.x; u.fz = t.z; if(hit) ambDamage(t, 34);
        if(FX && Math.abs(u.x - camp.x) < 190 && Math.abs(u.z - camp.z) < 190){ FX.bullet({ x:u.x, z:u.z, y:7.2 }, { x:t.x, z:t.z }, { hit:hit, ty:5.6, speed:200 }); if(hit && Math.random() < 0.15) FX.puff(t.x, 6, t.z, "spark"); }
      }
      function ambSplash(x, z, side, dmg){
        var ec = side === "rok" ? AG.nk : AG.rok, cx = Math.floor((x - GX0)/CS), cz = Math.floor((z - GZ0)/CS), n = 0, dx, dz, k;
        for(dx = -1; dx <= 1; dx++) for(dz = -1; dz <= 1; dz++){ var X = cx + dx, Z = cz + dz; if(X < 0 || X >= GXN || Z < 0 || Z >= GZN) continue; var arr = ec[X*GZN + Z]; for(k = 0; k < arr.length && n < 14; k++){ var o = arr[k]; if(o.alive && (o.x - x)*(o.x - x) + (o.z - z)*(o.z - z) < 100){ ambDamage(o, dmg); n++; } } }
      }
      function ambTick(dt, tm){
        AMB.gt -= dt; if(AMB.gt <= 0){ AMB.gt = 0.3; ambRebuild(); }
        var camp = three.camera.position, side, arr, i, u, t, dx, dz, d;
        for(side = 0; side < 2; side++){ arr = side ? nk : rok;
          for(i = 0; i < arr.length; i++){ u = arr[i]; if(!u.alive) continue;
            u.rt -= dt; t = u.tgt; if(u.rt <= 0 || !t || !t.alive){ t = u.tgt = ambNearest(u); u.rt = 0.9 + Math.random()*0.9; } if(!t) continue;
            dx = t.x - u.x; dz = t.z - u.z; d = Math.sqrt(dx*dx + dz*dz) || 1;
            if(d > u.pref){ u.x += dx/d*u.asp*dt + Math.cos(tm*1.7 + u.seed)*1.2*dt; u.z += dz/d*u.asp*dt + Math.sin(tm*1.3 + u.seed)*1.2*dt; } else if(d < u.pref - 8){ u.x -= dx/d*3*dt; u.z -= dz/d*3*dt; }
            if(u.x < -125) u.x = -125; else if(u.x > 125) u.x = 125; if(u.z < 1800) u.z = 1800; else if(u.z > 2250) u.z = 2250;
            u.cd -= dt; if(u.cd <= 0 && d < 50){ u.cd = 1.4 + Math.random()*2.4; ambShoot(u, t, d, camp); }
          }
        }
        TANKS.forEach(function(k){
          if(!k.alive) return; k.cd -= dt; if(k.cd > 0) return; k.cd = 3.5 + Math.random()*3.5; var es = k.side === "rok" ? nk : rok, tg = null, tries = 0; while(tries++ < 14){ var o = es[(Math.random()*es.length) | 0]; if(o.alive){ tg = o; break; } } if(!tg || !k.t3 || !FX) return;
          var tx = tg.x, tz = tg.z, a = Math.atan2(tx - k.x, tz - k.z); k.t3.aim(tx, tz); k.t3.fire(); FX.shell({ x:k.x + Math.sin(a)*37, y:15, z:k.z + Math.cos(a)*37 }, { x:tx, z:tz }, { hit:true, cb:function(){ ambSplash(tx, tz, k.side, 85); if(Math.abs(tx - camp.x) < 220 && Math.abs(tz - camp.z) < 220) shake(0.35); } });
        });
        if(AMB.cnt.rok < NSIDE*0.05 || AMB.cnt.nk < NSIDE*0.05){ AMB.resetT += dt; if(AMB.resetT > 7) ambInit(); } else AMB.resetT = 0;
      }
      function ambInit(){
        setupFormation();
        nk.forEach(function(u){ u.gz -= 40; u.x = wx(u.gx); u.z = wz(u.gz); });
        [NKT, NKT2].forEach(function(k){ k.gz -= 40; k.x = wx(k.gx); k.z = wz(k.gz); });
        rok.concat(nk).forEach(function(u){ u.vis = true; u.tgt = null; u.rt = Math.random()*0.6; u.cd = Math.random()*2.5; u.seed = Math.random()*6.28; u.pref = 20 + Math.random()*10; u.asp = 7.5 + Math.random()*3.5; });
        TANKS.forEach(function(k){ k.cd = 1.5 + Math.random()*3; if(k.t3) k.t3.setVisible(true); });
        AMB.cnt.rok = rok.length; AMB.cnt.nk = nk.length; AMB.resetT = 0; AMB.gt = 0; AMB.on = true; ambRebuild();
      }
      function fade(v){ if(ui && ui.fade) ui.fade.style.opacity = v; }
      // 전투가 끝나면(승리/패배/후퇴) 처음 상태(자연 전투)로 돌아가 다시 시작할 수 있어요
      function restartField(){
        AMB.on = true; ambInit(); LV.vis = false; LV.die = -1; LV.walkIn = false; if(LUC3) LUC3.setVisible(false); if(LUC3b) LUC3b.setVisible(false); S.dlg = null; S.anim = null; S.tw = null; POSE = null;
        var p = state.player; p.x = wx(0); p.z = Z0 - 70; state.cam.fx = null; S.state = "idle"; S.cool = 8; S.active = false; camBattle(false); fade(0);
        if(ui){ ui.top.style.display = "none"; ui.menu.style.display = "none"; ui.log.style.display = "none"; ui.end.style.display = "none"; ui.dlg.style.display = "none"; ui.prompt.style.display = "none"; }
      }
      function openPrompt(){ if(S.state !== "idle" || !ui) return; S.state = "prompt"; ui.prompt.style.display = "flex"; }
      function closePrompt(later){ if(ui) ui.prompt.style.display = "none"; S.state = "idle"; if(later) S.cool = 10; }
      function camBattle(on){ var cs = state.cam; if(on){ S.camSave = { pt:cs.pt, plock:cs.plock }; cs.plock = true; cs.pt = -0.5; cs.yaw = cs.target = 0; cs.turn = null; } else if(S.camSave){ cs.plock = S.camSave.plock; cs.pt = S.camSave.pt || 0; } }
      function startBattle(){
        if(S.state !== "prompt" && S.state !== "idle") return; if(ui) ui.prompt.style.display = "none"; S.state = "fading"; fade(1);
        later(0.55, function(){ AMB.on = false; setupFormation(); [NKT, NKT2].forEach(function(k){ if(k.t3) k.t3.setVisible(false); }); startBattle0(); fade(0); });
      }
      function startBattle0(){
        if(ui) ui.prompt.style.display = "none"; S.state = "intro"; S.active = true; S.turn = 1; S.moves = MOVES; S.acted = false; S.cd.q = S.cd.w = S.cd.e = 0; S.log = []; S.intro = 0; S.ended = false; camBattle(true);
        var p = state.player; tween(p, wx(0), wz(0), 0.9); delete occ[key(RAB.gx, RAB.gz)]; RAB.gx = 0; RAB.gz = 0; occ[key(0, 0)] = RAB;
        nk.forEach(function(u){ u.vis = true; }); [NKT, NKT2].forEach(function(k){ if(k.t3) k.t3.setVisible(true); }); TM.clear(); S.volleyDone = false; S.march = 0; say("🪖 북한군이 몰려와요!"); refreshUI();
      }
      function tween(p, x, z, dur){ S.tw = { p:p, x0:p.x, z0:p.z, x1:x, z1:z, t:0, dur:dur }; }
      function endBattle(win){
        var first = typeof memorialCleared === "function" ? !memorialCleared() : false;
        S.active = false; TM.clear(); camBattle(false); if(ui){ ui.top.style.display = "none"; ui.menu.style.display = "none"; ui.log.style.display = "none"; }
        if(win){ var i; for(i = 0; i < 10; i++) state.defeated.add("grunt" + i); state.defeated.add("boss"); if(typeof writeSave === "function") writeSave(); if(wall){ var ix = window.ROCK_RECTS.indexOf(wall); if(ix >= 0) window.ROCK_RECTS.splice(ix, 1); wall = null; } if(typeof showToast === "function"){ if(first){ showToast("🎉 루샤를 물리쳤어요! 기념관 수호 완료!"); setTimeout(function(){ showToast("✅ 호국탑의 스탬프를 주우러 가보세요"); }, 1800); } else showToast("🎉 승리! 다시 도전하려면 국군에게 다가가세요"); } }
        restartField();
      }
      function resetAfterLoss(){ restartField(); }
      // ---------- 이동/행동 ----------
      function rabbitStep(dx, dz){
        if(S.tw || S.state !== "player") return; if(S.moves <= 0){ say("이동 횟수를 다 썼어요. 행동을 고르거나 턴을 끝내세요"); return; }
        var nx = RAB.gx + dx, nz = RAB.gz + dz; if(!inb(nx, nz)){ say("더 갈 수 없어요"); return; } if(occ[key(nx, nz)]){ say("그 자리는 막혀 있어요"); return; }
        TM.batch(function(){ TM.push(MoveCommand(RAB, nx, nz)); followP2(); }); refreshUI();
      }
      function adjFoes(r){ var res = []; nk.forEach(function(u){ if(u.alive && dist(u, RAB) <= r) res.push(u); }); rok.forEach(function(u){ if(u.alive && u.brain > 0 && dist(u, RAB) <= r) res.push(u); }); if(LUC.alive && dist(LUC, RAB) <= r) res.push(LUC); res.sort(function(a, b){ return dist(a, RAB) - dist(b, RAB) || (a.hp - b.hp); }); return res; }
      function tpos(t){ return t === RAB ? { x:state.player.x, z:state.player.z } : (t === LUC ? { x:LV.x || wx(LUC.gx), z:LV.z || wz(LUC.gz) } : (t.kind === "plane" ? { x:t.x + t.vx*0.25, z:t.z + t.vz*0.25, y:t.y } : (t.hill ? { x:t.x, z:t.z, y:t.y + 5.6 } : { x:t.x, z:t.z }))); }
      function tyOf(t){ return t === LUC ? 22 : (t === RAB ? UH + 4 : (t.kind === "p2" ? 20 : (t.kind === "tank" ? 26 : (t.kind === "plane" ? t.y + 5 : UH + 3.6 + (t.y || 0))))); }
      // 맞았을 때 / 빗나갔을 때 연출 (논리 피해는 AttackCommand 가 이미 적용했어요)
      function impact(c, hit, hx, hy, hz){
        var t = c.tgt, pp = tpos(t);
        if(hit){
          var d = c.dealt; t.vhp = Math.max(0, (t.vhp === undefined ? t.hp : t.vhp) - d); t.hit = 0.3;
          var enemySide = t === RAB || t.kind === "p2" || (t.kind === "soldier" && t.side === "rok" && !(t.brain > 0)); floatText(pp.x, tyOf(t), pp.z, "-" + d, enemySide ? "#ff9a9a" : "#ffe27a");
          if(FX) FX.puff(pp.x, t.kind === "tank" ? 8 : (t.kind === "plane" ? t.y : 6 + (t.y || 0)), pp.z, "spark");
          if(!t.alive && t.vhp <= 0.5){ if(t.kind === "soldier" && t.die < 0){ t.die = 0; t.fireT = 0; } else if(t.kind === "tank"){ t.die = 0; if(t.t3) t.t3.setWreck(true); if(FX) FX.puff(pp.x, 3, pp.z, "blast"); } else if(t.kind === "plane"){ startCrash(t); } else if(t.kind === "p2"){ t.die = 0; } }
        } else { floatText(hx !== undefined ? hx : pp.x, tyOf(t) + 0.5, hz !== undefined ? hz : pp.z, "MISS", "#ffffff"); if(FX && t.kind !== "plane") FX.puff(hx !== undefined ? hx : pp.x, 0.4, (hz !== undefined ? hz : pp.z) + (c.att && c.att.side === "rok" ? 4 : -4), "dust"); }
      }
      function dealTo(t, dmg){ var c = AttackCommand(RAB, t, dmg, 1); c.execute(); impact(c, true); if(t === LUC && LUC.hp <= 0){ LUC.alive = false; } }
      function fireShot(u){
        var c = u.shot; u.shot = null; if(!c || !FX) return; var tp = tpos(c.tgt), spread = 0;
        FX.puff(u.x + Math.sin(Math.atan2(tp.x - u.x, tp.z - u.z))*3.4, (u.y || 0) + 7.2, u.z + Math.cos(Math.atan2(tp.x - u.x, tp.z - u.z))*3.4, "muzzle");
        FX.bullet({ x:u.x, z:u.z, y:(u.y || 0) + 7.2 }, tp, { hit:c.hit, ty:tp.y, speed:u.hill ? 330 : 0, cb:function(h, x, y, z){ impact(c, h, x, y, z); } });
        FX.bullet({ x:u.x, z:u.z, y:(u.y || 0) + 7.2 }, tp, { hit:false, speed:u.hill ? 330 : 0, delay:0.09 + Math.random()*0.05, ty:tp.y !== undefined ? tp.y + Math.random()*2 - 1 : 5 + Math.random()*2 }); if(Math.random() < 0.6) FX.bullet({ x:u.x, z:u.z, y:(u.y || 0) + 7.2 }, tp, { hit:false, speed:u.hill ? 330 : 0, delay:0.2 + Math.random()*0.06, ty:tp.y });
      }
      function fireTank(k){
        var sh = k.shot; k.shot = null; if(!sh || !k.t3 || !FX) return; var tp = tpos(sh.tgt), a = Math.atan2(tp.x - k.x, tp.z - k.z); k.t3.fire(); shake(0.4);
        FX.shell({ x:k.x + Math.sin(a)*37, y:15, z:k.z + Math.cos(a)*37 }, tp, { hit:true, cb:function(){ shake(1); sh.all.forEach(function(c){ impact(c, true); c.tgt.hit = 0.7; }); } });
      }
      function afterAction(){ S.acted = true; S.menu = false; ui.skills.style.display = "none"; refreshUI(); if(LUC.hp <= 0){ S.state = "anim"; later(1.5, finishWin); } }
      // ---------- 지원 공격 → 반격 (우선순위 1 → 2) ----------
      // 1P(토끼)가 공격하면: ① 2P 루샤가 같은 대상을 함께 공격(지원) ② 아직 살아 있는 적이 자신을 공격한 상대에게 반격. 지원으로 쓰러지면 반격 없음. 반격은 반격을 부르지 않아요.
      function attackChain(t, t0){
        var hitBy = [RAB], tp = tpos(t), tcs = t0 + 0.32, sup = null;
        if(P2.alive && t.alive && dist(P2, t) <= SUPPORT_RANGE){
          sup = TM.push(AttackCommand(P2, t, P2.atk, 1)); hitBy.push(P2);
          later(tcs, function(){ LV2.cast = 0.7; LV2.face = Math.atan2(tp.x - P2.x, tp.z - P2.z); LV2.ft = 1.3; floatText(P2.x, 24, P2.z, "🤝 지원 공격!", "#9fe8ff"); if(FX) FX.bullet({ x:P2.x, z:P2.z, y:14 }, tpos(t), { hit:true, cb:function(){ impact(sup, true); } }); });
        }
        if(t.alive && !t.hill && (t.kind === "soldier" || t.kind === "lucia" || t.kind === "tank")){
          var tcc = tcs + (sup ? 0.6 : 0.2);
          hitBy.forEach(function(a){ if(dist(t, a) > COUNTER_RANGE) return; var cc = TM.push(AttackCommand(t, a, t.atk, 0.8)); later(tcc, function(){ floatText(tp.x, tyOf(t) + 3, tp.z, "↩ 반격!", "#ffb0a0"); if(FX) FX.bullet({ x:tp.x, z:tp.z, y:(t.y || 0) + 7.2 }, tpos(a), { hit:cc.hit, cb:function(h, x, y, z){ impact(cc, h, x, y, z); } }); }); });
        }
      }
      function followP2(){
        if(!P2.alive) return; var wx0 = RAB.gx + 2, wz0 = RAB.gz, best = null, bd = 99, dx, dz;
        for(dx = -2; dx <= 2; dx++) for(dz = -2; dz <= 2; dz++){ var nx = wx0 + dx, nz = wz0 + dz; if(!inb(nx, nz)) continue; var occupant = occ[key(nx, nz)]; if(occupant && occupant !== P2) continue; var d = Math.max(Math.abs(dx), Math.abs(dz)) + Math.abs(dx)*0.01 + Math.abs(nx - P2.gx)*0.001; if(d < bd){ bd = d; best = [nx, nz]; } }
        if(best && (best[0] !== P2.gx || best[1] !== P2.gz)) TM.push(MoveCommand(P2, best[0], best[1]));
      }
      function doAttack(){ if(S.state !== "player" || S.acted) return; var f = adjFoes(1); if(!f.length){ say("적이 너무 멀어요. 방향키로 가까이 가세요"); return; } var t0 = f[0];
        TM.batch(function(){ var c = TM.push(AttackCommand(RAB, t0, RAB.atk, 1)); impact(c, true); attackChain(t0, 0.05); TM.push(SnapCommand(afterAction)); }); say("⚔ 토끼의 공격! " + RAB.atk + " 데미지"); }
      function doDefend(){ if(S.state !== "player" || S.acted) return; TM.batch(function(){ TM.push(SnapCommand(function(){ RAB.def = true; afterAction(); })); }); say("🛡 방어 자세! 이번 적 차례 피해 절반"); }
      function doItem(){ if(S.state !== "player" || S.acted) return; if(RAB.items <= 0){ say("아이템이 없어요"); return; } TM.batch(function(){ TM.push(SnapCommand(function(){ RAB.items--; RAB.hp = RAB.vhp = Math.min(RAB.maxHp, RAB.hp + 50); floatText(state.player.x, UH + 3, state.player.z, "+50", "#9fffa8"); afterAction(); })); }); say("🍙 주먹밥으로 HP +50"); }
      function toggleSkills(){ if(S.state !== "player" || S.acted) return; S.menu = !S.menu; ui.skills.style.display = S.menu ? "flex" : "none"; }
      function skillQ(){ if(S.state !== "player" || S.acted) return; if(S.cd.q > 0){ say("당근은 " + S.cd.q + "턴 뒤에 다시 나눠줄 수 있어요"); return; } var n = 0;
        TM.batch(function(){ TM.push(SnapCommand(function(){ rok.forEach(function(u){ if(u.alive && !(u.brain > 0) && dist(u, RAB) <= 6){ var h = Math.min(u.maxHp, u.hp + 30) - u.hp; if(h > 0){ u.hp += h; u.vhp = u.hp; n++; if(n <= 6) floatText(u.x, UH + 2, u.z, "+30", "#9fffa8"); } } }); RAB.hp = RAB.vhp = Math.min(RAB.maxHp, RAB.hp + 30); S.cd.q = 3; afterAction(); })); }); say("🥕 당근 나눠주기! 주변 국군 " + n + "명 HP +30"); }
      function skillW(){ if(S.state !== "player" || S.acted) return; if(S.cd.w > 0){ say("뒷다리 걷어차기는 " + S.cd.w + "턴 뒤에 쓸 수 있어요"); return; } var f = adjFoes(1); if(!f.length){ say("북한군 바로 앞(1칸)으로 가서 쓰세요"); return; } var t = f[0];
        TM.batch(function(){ var c = TM.push(AttackCommand(RAB, t, 80, 1)); var tp = tpos(t), pp = state.player; POSE = { kind:"kick", t:0, dur:1.25, yaw:Math.atan2(tp.x - pp.x, tp.z - pp.z) + Math.PI + 0.7 };
          later(0.47, function(){ impact(c, true); t.hit = 0.8; shake(0.5); if(FX){ FX.puff(tp.x, 6, tp.z, "boom"); FX.ring(tp.x, 5, tp.z, 22, 0.45); FX.puff(tp.x, 6, tp.z, "spark"); } floatText(tp.x, tyOf(t) + 4, tp.z, "💥 KICK!", "#fff2a0"); });
          attackChain(t, 0.47);
          TM.push(SnapCommand(function(){ S.cd.w = 2; afterAction(); })); }); say("🦵 뒷다리 걷어차기! 80 데미지"); }
      function skillE(){ if(S.state !== "player" || S.acted) return; if(S.cd.e > 0){ say("유혹은 " + S.cd.e + "턴 뒤에 쓸 수 있어요"); return; } var c = nk.filter(function(u){ return u.alive && dist(u, RAB) <= 10; }).sort(function(a, b){ return dist(a, RAB) - dist(b, RAB); }).slice(0, 2); if(!c.length){ say("근처(10칸)에 북한군이 없어요"); return; }
        TM.batch(function(){ TM.push(SnapCommand(function(){ POSE = { kind:"charm", t:0, dur:1.3 }; var pp = state.player; later(0.25, function(){ if(FX){ FX.hearts(pp.x, 10, pp.z, 46, true); FX.ring(pp.x, 4, pp.z, 40, 0.8); } });
          c.forEach(function(u){ u.charm = 2; later(0.7, function(){ if(FX) FX.hearts(u.x, 9, u.z, 8, false); floatText(u.x, UH + 6, u.z, "💘", "#ff9fd0"); }); }); S.cd.e = 4; afterAction(); })); }); say("💘 토끼의 유혹! 북한군 " + c.length + "명이 2턴 동안 따라와요"); }
      function doRetreat(){ if(S.state !== "player") return; window.__tbLose = "retreat"; if(!window.confirm || window.confirm("후퇴할까요? (전투가 처음부터 다시 시작돼요)")){ say("🏃 후퇴!"); S.state = "idle"; resetAfterLoss(); if(typeof showToast === "function") showToast("🏃 후퇴했어요. 다시 국군에게 가면 전투를 시작해요"); } }
      // ---------- 턴 진행 ----------
      function endPlayerTurn(){ if(S.state !== "player" || S.tw) return; S.menu = false; ui.skills.style.display = "none"; S.state = "anim"; if(S.volleyDone){ S.state = "enemy"; refreshUI(); runPhase("nk"); } else runPhase("rok"); }
      function stepToward(u, tx, tz){
        var dx = Math.sign(tx - u.gx), dz = Math.sign(tz - u.gz), cands = [];
        if(dx && dz) cands.push([dx, dz]); if(Math.abs(tx - u.gx) >= Math.abs(tz - u.gz)){ if(dx) cands.push([dx, 0]); if(dz) cands.push([0, dz]); } else { if(dz) cands.push([0, dz]); if(dx) cands.push([dx, 0]); }
        for(var i = 0; i < cands.length; i++){ var nx = u.gx + cands[i][0], nz = u.gz + cands[i][1]; if(!inb(nx, nz) || occ[key(nx, nz)]) continue; TM.push(MoveCommand(u, nx, nz)); return true; }
        return false;
      }
      function nearest(u, list){ var best = null, bd = 99; for(var i = 0; i < list.length; i++){ var o = list[i]; if(!o.alive) continue; var d = dist(u, o); if(d < bd || (d === bd && best && o.hp < best.hp)){ bd = d; best = o; } } return best ? { o:best, d:bd } : null; }
      var atkCount = 0;
      function isGround(o){ return o.kind !== "tank" && o.kind !== "plane" && !o.hill && o.kind !== "p2"; }
      // 대열을 지키지 않고 흩어져 움직여요: 적과 3~4칸 거리를 유지하며 빈 곳으로 퍼지고(산은 못 올라가요), 이동한 뒤 1번 사격
      var FW = 2*BX + 1, FH = BZ1 - BZ0 + 1, fieldR = new Uint8Array(FW*FH), fieldN = new Uint8Array(FW*FH);
      function fidx(gx, gz){ return (gx + BX)*FH + (gz - BZ0); }
      function buildField(f, srcs){
        f.fill(13); var cur = [], i, k; srcs.forEach(function(o){ if(o.alive && o.gx >= -BX && o.gx <= BX && o.gz >= BZ0 && o.gz <= BZ1){ k = fidx(o.gx, o.gz); if(f[k] > 0){ f[k] = 0; cur.push(o.gx, o.gz); } } });
        for(var d = 1; d <= 12 && cur.length; d++){ var nx = []; for(i = 0; i < cur.length; i += 2){ for(var ax = -1; ax <= 1; ax++) for(var az = -1; az <= 1; az++){ var gx = cur[i] + ax, gz = cur[i + 1] + az; if(gx < -BX || gx > BX || gz < BZ0 || gz > BZ1) continue; k = fidx(gx, gz); if(f[k] > d){ f[k] = d; nx.push(gx, gz); } } } cur = nx; }
      }
      function buildFields(){
        var a = [], b = [], i; for(i = 0; i < nk.length; i++) if(nk[i].alive) a.push(nk[i]); for(i = 0; i < rok.length; i++){ var u = rok[i]; if(!u.alive) continue; if(u.brain > 0) a.push(u); else b.push(u); }
        if(LUC.alive) a.push(LUC); b.push(RAB); if(P2.alive) b.push(P2); buildField(fieldR, a); buildField(fieldN, b);
      }
      // 대열을 지키지 않고 흩어져 움직여요: 적과 3~4칸 거리를 유지하며 빈 곳으로 퍼지고(산은 못 올라가요), 이동한 뒤 1번 사격
      function freeMove(u){
        var f = (u.side === "nk" || u.brain > 0) ? fieldN : fieldR, near = (u.gx >= -BX && u.gx <= BX && u.gz >= BZ0 && u.gz <= BZ1) ? f[fidx(u.gx, u.gz)] : 13; if(near >= 13) near = 13;
        var ms = near > RANGE + 4 ? 3 : 2, best = null, bs = -1e9, dx, dz, ax, az;
        for(dx = -ms; dx <= ms; dx++) for(dz = -ms; dz <= ms; dz++){
          var nx = u.gx + dx, nz = u.gz + dz; if(!inb(nx, nz) || ((dx || dz) && occ[key(nx, nz)])) continue;
          var nd = f[fidx(nx, nz)], crowd = 0; for(ax = -1; ax <= 1; ax++) for(az = -1; az <= 1; az++){ if((ax || az) && occ[key(nx + ax, nz + az)]) crowd++; }
          var sc = -Math.abs(nd - 3.5)*2.2 - (nd > RANGE ? (nd - RANGE)*1.5 : 0) - crowd*0.9 + rnd()*2.6 + (u.side === "rok" ? dz : -dz)*0.2 - ((dx || dz) ? 0 : 0.5);
          if(sc > bs){ bs = sc; best = [nx, nz]; }
        }
        if(best && (best[0] !== u.gx || best[1] !== u.gz)) TM.push(MoveCommand(u, best[0], best[1]));
      }
      function soldierAct(u, ctx){
        if(u.charm > 0){ if(dist(u, RAB) > 1){ stepToward(u, RAB.gx, RAB.gz); if(dist(u, RAB) > 1) stepToward(u, RAB.gx, RAB.gz); } return; }
        freeMove(u);
        var uN = (u.side === "nk" || u.brain > 0), gs = [], tk = null, rb = null, p2 = null, dx, dz, o;
        for(dx = -RANGE; dx <= RANGE; dx++) for(dz = -RANGE; dz <= RANGE; dz++){
          if(!dx && !dz) continue; o = occ[key(u.gx + dx, u.gz + dz)]; if(!o || !o.alive || o === u) continue;
          if(uN){ if(o === RAB) rb = o; else if(o === P2) p2 = o; else if(o.kind === "soldier" && !o.hill && o.side === "rok" && !(o.brain > 0)) gs.push(o); else if(o.kind === "tank" && o.side === "rok") tk = tk || o; }
          else { if(o === LUC || (o.kind === "soldier" && !o.hill && (o.side === "nk" || o.brain > 0))) gs.push(o); else if(o.kind === "tank" && o.side === "nk") tk = tk || o; }
        }
        var bestL = null, pls = ctx.planes.filter(function(x){ return x.alive && dist(u, x) <= RANGE + 3; });
        if(pls.length && rnd() < 0.1) bestL = pls[0];
        else if(gs.length){ gs.sort(function(a, b){ return dist(u, a) - dist(u, b); }); if(rnd() < 0.55) bestL = gs[0]; else bestL = gs.reduce(function(m, x){ return x.hp < m.hp ? x : m; }, gs[0]); }
        else if(tk) bestL = tk;
        if(rb && RAB.shots < 2 && (rnd() < 0.2 || !bestL)) bestL = rb;      // 토끼는 가끔만 노려요
        else if(p2 && P2.shots < 2 && rnd() < 0.18){ bestL = p2; P2.shots++; }
        if(bestL){ if(bestL === RAB) RAB.shots++; var ph = (bestL === RAB || bestL === P2) ? 0.55 : (bestL === LUC ? 0.7 : (bestL.kind === "tank" ? 0.85 : (bestL.kind === "plane" ? 0.35 : 0.75))); u.shot = TM.push(AttackCommand(u, bestL, atkOf(u), ph)); u.fireWait = 0.05 + Math.random()*1.3; var tp = tpos(bestL); u.fx = tp.x; u.fz = tp.z; }
      }
      // 기관총: 한 차례 4연발(25) / 저격수: 1발(70, 멀리서 정확) — 언덕에서 전장 전체를 쏴요. 저격수는 가끔 적 언덕 사수·루샤·토끼를 노려요
      function hillAct(u, enemyHill, ground){
        if(!u.alive) return; var shots = u.role === "mg" ? 4 : 1, i, pool = ground.filter(function(o){ return o.alive; }); if(!pool.length) return;
        for(i = 0; i < shots; i++){
          var tgt = null, r = rnd(), eh = enemyHill.filter(function(o){ return o.alive; });
          if(u.role === "sniper"){ if(eh.length && r < 0.3) tgt = eh[Math.floor(rnd()*eh.length)]; else if(u.side === "rok" && LUC.alive && r < 0.5) tgt = LUC; else if(u.side === "nk" && RAB.shots < 2 && r < 0.45){ tgt = RAB; RAB.shots++; } }
          if(!tgt) tgt = pool[Math.floor(rnd()*pool.length)];
          var ph = u.role === "sniper" ? 0.85 : 0.5; if(tgt === RAB) ph = 0.6;
          u.shotQ.push({ cmd:TM.push(AttackCommand(u, tgt, u.atk, ph)), w:0.1 + i*0.2 + rnd()*0.5 });
        }
      }
      // ---------- 전투기 ----------
      function planeReset(pl){ pl.mode = "patrol"; pl.mt = 0; pl.shot = null; pl.die = -1; pl.hit = 0; pl.init = false; if(pl.p3){ pl.p3.setWreck(false); pl.p3.wreck = 0; } }
      function patrolPos(pl, tm){ var sg = pl.side === "rok" ? 1 : -1, th = (pl.side === "rok" ? 0 : Math.PI) + tm*0.42*sg; return { x:Math.cos(th)*62, y:(pl.side === "rok" ? 44 : 52) + Math.sin(th*2)*3, z:Z0 + 40 + Math.sin(th)*58 }; }
      function startCrash(pl){ if(pl.mode === "crash" || pl.mode === "wreck") return; pl.mode = "crash"; pl.mt = 0; var sp = Math.max(32, Math.hypot(pl.vx, pl.vz)); pl.cv = { vx:Math.sin(pl.yaw)*sp, vy:3, vz:Math.cos(pl.yaw)*sp, tr:0 }; floatText(pl.x, pl.y + 6, pl.z, "💥 격추!", "#ffd27a"); }
      function planeAct(pl, foes){
        if(!pl.alive) return; var c = foes.filter(function(o){ return o.alive && (o.kind === "soldier" || o.kind === "rabbit" || o.kind === "p2"); }); if(!c.length) return;
        var pool = c.slice(), picks = [], i; for(i = 0; i < 3 && pool.length; i++) picks.push(pool.splice(Math.floor(rnd()*pool.length), 1)[0]);
        var cmds = picks.map(function(o){ return TM.push(AttackCommand(pl, o, pl.atk, 0.7)); }), cx = 0, cz = 0; picks.forEach(function(o){ var tp = tpos(o); cx += tp.x/picks.length; cz += tp.z/picks.length; });
        var dz = pl.side === "rok" ? 1 : -1; pl.E = { x:cx, y:34, z:cz - dz*75 }; pl.X = { x:cx, y:40, z:cz + dz*75 }; pl.from = { x:pl.x, y:pl.y, z:pl.z }; pl.mode = "in"; pl.mt = 0; pl.runCmds = cmds.map(function(cm){ return { cm:cm, done:false }; });
      }
      function fireFromPlane(pl, cm){
        if(!FX) return; var tp = tpos(cm.tgt), from = { x:pl.x, z:pl.z, y:pl.y - 1 };
        FX.puff(pl.x + Math.sin(pl.yaw)*6, pl.y, pl.z + Math.cos(pl.yaw)*6, "muzzle");
        FX.bullet(from, tp, { hit:cm.hit, ty:5.6, cb:function(h, x, y, z){ impact(cm, h, x, y, z); } }); FX.bullet(from, tp, { hit:false, delay:0.07, ty:5 }); FX.bullet(from, tp, { hit:false, delay:0.14, ty:5 });
      }
      function planesTick(dt, tm){
        PLANES.forEach(function(pl){
          if(!pl.p3) return; var gy = 0; try{ gy = groundHeightAt(pl.x, pl.z); }catch(e){}
          var ox = pl.x, oy = pl.y, oz = pl.z, i, f;
          if(pl.mode === "crash"){
            var cv = pl.cv; pl.mt += dt; cv.vy -= 38*dt; pl.x += cv.vx*dt; pl.y += cv.vy*dt; pl.z += cv.vz*dt; pl.pitch = Math.min(1.15, pl.pitch + dt*0.9); pl.roll += dt*5; cv.tr -= dt; if(cv.tr <= 0){ cv.tr = 0.04; if(FX) FX.trail(pl.x, pl.y, pl.z); }
            if(pl.y <= gy + 1.5){ pl.y = gy + 1.5; pl.mode = "wreck"; pl.pitch = 0.2; pl.roll = 0.5; pl.vx = pl.vz = pl.vy = 0; if(FX){ FX.puff(pl.x, gy + 1, pl.z, "blast"); FX.puff(pl.x + 6, gy + 1, pl.z - 4, "boom"); FX.puff(pl.x - 5, gy + 1, pl.z + 5, "boom"); } shake(1); pl.p3.setWreck(true); }
          } else if(pl.mode === "wreck"){ /* 땅에서 불타는 잔해 (주변 피해 없음) */ }
          else {
            var tgt;
            if(!pl.init){ tgt = patrolPos(pl, tm); pl.x = tgt.x; pl.y = tgt.y; pl.z = tgt.z; pl.init = true; ox = pl.x; oy = pl.y; oz = pl.z; }
            if(pl.mode === "patrol"){ tgt = patrolPos(pl, tm); pl.x = tgt.x; pl.y = tgt.y; pl.z = tgt.z; }
            else if(pl.mode === "in"){ pl.mt += dt; f = smooth(pl.mt/0.6); pl.x = pl.from.x + (pl.E.x - pl.from.x)*f; pl.y = pl.from.y + (pl.E.y - pl.from.y)*f; pl.z = pl.from.z + (pl.E.z - pl.from.z)*f; if(pl.mt >= 0.6){ pl.mode = "run"; pl.mt = 0; } }
            else if(pl.mode === "run"){ pl.mt += dt; f = Math.min(1, pl.mt/1.7); pl.x = pl.E.x + (pl.X.x - pl.E.x)*f; pl.y = pl.E.y + (pl.X.y - pl.E.y)*f; pl.z = pl.E.z + (pl.X.z - pl.E.z)*f;
              for(i = 0; i < pl.runCmds.length; i++){ var rc = pl.runCmds[i]; if(rc.done) continue; var tz = tpos(rc.cm.tgt).z, fr = (tz - pl.E.z)/(pl.X.z - pl.E.z) - 0.12; if(f >= Math.max(0.05, Math.min(0.95, fr))){ rc.done = true; fireFromPlane(pl, rc.cm); } }
              if(pl.mt >= 1.7){ pl.mode = "out"; pl.mt = 0; pl.from = { x:pl.x, y:pl.y, z:pl.z }; } }
            else if(pl.mode === "out"){ pl.mt += dt; f = smooth(pl.mt/1.1); tgt = patrolPos(pl, tm); pl.x = pl.from.x + (tgt.x - pl.from.x)*f; pl.y = pl.from.y + (tgt.y - pl.from.y)*f; pl.z = pl.from.z + (tgt.z - pl.from.z)*f; if(pl.mt >= 1.1) pl.mode = "patrol"; }
            if(dt > 0){ var nvx = (pl.x - ox)/dt, nvy = (pl.y - oy)/dt, nvz = (pl.z - oz)/dt; pl.vx += (nvx - pl.vx)*Math.min(1, dt*10); pl.vy += (nvy - pl.vy)*Math.min(1, dt*10); pl.vz += (nvz - pl.vz)*Math.min(1, dt*10); var spd = Math.hypot(pl.vx, pl.vz); if(spd > 4){ var ty = Math.atan2(pl.vx, pl.vz), dy = ty - pl.yaw; while(dy > Math.PI) dy -= 2*Math.PI; while(dy < -Math.PI) dy += 2*Math.PI; pl.yaw += dy*Math.min(1, dt*6); pl.roll += (Math.max(-0.7, Math.min(0.7, -dy*1.6)) - pl.roll)*Math.min(1, dt*5); pl.pitch += (Math.max(-0.4, Math.min(0.4, -pl.vy/Math.max(20, spd))) - pl.pitch)*Math.min(1, dt*5); } }
          }
          pl.gx = Math.round(-pl.x/T); pl.gz = Math.round((pl.z - Z0)/T);
          pl.p3.place(pl.x, pl.y, pl.z, pl.yaw, pl.pitch, pl.roll, gy); pl.p3.update(dt, tm, pl.alive);
        });
      }
      function tankAct(k, foes){
        if(!k.alive) return; var own = (k.side === "rok" ? rok : nk).filter(function(u){ return u.alive && !(u.brain > 0); }).length; if(own > 0) return;      // 앞줄(자기 편 군인)이 모두 쓰러진 뒤에야 나서요
        if(!k.engaged){ k.engaged = true; say(k.side === "rok" ? "🛡 국군 탱크가 앞으로 나섰어요!" : "🪖 북한군 탱크가 앞으로 나섰어요!"); }
        var c = foes.filter(function(o){ return o.alive && !o.hill && (o.kind === "soldier" || o.kind === "rabbit" || o.kind === "p2"); }); if(!c.length) return; var pool = c.filter(function(o){ return o.kind === "soldier"; }); if(!pool.length) pool = c, tg = pool[Math.floor(rnd()*pool.length)]; var tg = pool[Math.floor(rnd()*pool.length)];
        var near = c.filter(function(o){ return o !== tg; }).sort(function(a, b){ return dist(a, tg) - dist(b, tg); }).slice(0, 2), all = [tg].concat(near).map(function(o){ return TM.push(AttackCommand(k, o, k.atk, 1)); });      // 맞은 곳 근처 3명 모두 -85
        k.shot = { all:all, tgt:tg }; k.fireWait = 0.7; if(k.t3){ var tp = tpos(tg); k.t3.aim(tp.x, tp.z); }
      }
      function foesOfROK(){ var l = []; nk.forEach(function(u){ if(u.alive) l.push(u); }); rok.forEach(function(u){ if(u.alive && u.brain > 0) l.push(u); }); if(LUC.alive) l.push(LUC); [NKT, NKT2, PLN].forEach(function(k){ if(k.alive) l.push(k); }); return l; }
      function foesOfNK(){ var l = []; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) l.push(u); }); l.push(RAB); if(P2.alive) l.push(P2); [ROKT, ROKT2, PLR].forEach(function(k){ if(k.alive) l.push(k); }); return l; }
      function runPhase(team){
        var i; atkCount = 0; RAB.shots = 0; P2.shots = 0;
        if(team === "rok"){ TM.team = "player"; TM.group = ++TM.gid; TM.push(SnapCommand(function(){ S.volleyDone = true; }));
          var dm = Math.round(UD.player.atk*(LUC.curse > 0 ? 0.9 : 1)), fo = foesOfROK(), arr = rok.filter(function(u){ return u.alive && !(u.brain > 0); }).sort(function(){ return rnd() - 0.5; }), ctx = { planes:PLN.alive ? [PLN] : [] }; buildFields(); arr.forEach(function(u){ soldierAct(u, ctx); }); tankAct(ROKT, fo); tankAct(ROKT2, fo); planeAct(PLR, fo); hrok.forEach(function(u){ hillAct(u, hnk, fo.filter(function(o){ return o.kind === "soldier" && !o.hill || o === LUC; })); }); say("🎖 국군 일제 사격! (공격 " + dm + ")"); }
        else {
          TM.team = "enemy"; TM.group = ++TM.gid;
          lucia();
          var fo2 = foesOfNK(), arr2 = nk.filter(function(u){ return u.alive; }).concat(rok.filter(function(u){ return u.alive && u.brain > 0; })).sort(function(){ return rnd() - 0.5; }); var ctx2 = { planes:PLR.alive ? [PLR] : [] }; buildFields(); arr2.forEach(function(u){ soldierAct(u, ctx2); }); tankAct(NKT, fo2); tankAct(NKT2, fo2); planeAct(PLN, fo2); hnk.forEach(function(u){ hillAct(u, hrok, fo2.filter(function(o){ return o.kind === "soldier" && !o.hill; })); });
          say("🪖 북한군 일제 사격!");
        }
        S.anim = { t:0, dur:3.1, team:team };
      }
      function foesOfROKbrain(){ var l = []; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) l.push(u); }); l.push(RAB); return l; }
      function lucia(){
        if(!LUC.alive) return;
        var tgt = nearest(LUC, foesOfNK().filter(function(o){ return o !== RAB && isGround(o); }).concat([RAB])); if(!tgt) return;
        LV.cast = 1.1; LV.laughT = 1.2;
        if(!LUC.usedE && S.turn >= 10){ TM.push(SnapCommand(function(){ LUC.usedE = true; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)){ dealTo(u, 10); } }); floatText(wx(LUC.gx), 22, wz(LUC.gz), "😈 사악한 미소", "#d9a0ff"); })); say("😈 루샤의 사악한 미소! 국군 전체 -10"); return; }
        if(LUC.cdQ <= 0 && LUC.curse <= 0){ TM.push(SnapCommand(function(){ LUC.curse = 3; LUC.cdQ = 6; floatText(wx(LUC.gx), 22, wz(LUC.gz), "음침한 기운", "#d9a0ff"); })); say("😈 음침한 기운! 3턴간 국군 공격 40 → 36"); return; }
        if(LUC.cdW <= 0){ var c = rok.filter(function(u){ return u.alive && !(u.brain > 0); }).sort(function(a, b){ return dist(a, LUC) - dist(b, LUC); })[0]; if(c){ TM.push(SnapCommand(function(){ c.brain = 2; LUC.cdW = 3; floatText(c.x, UH + 3, c.z, "세뇌!", "#d9a0ff"); })); say("😈 어둠의 손길! 국군 1명이 2턴 세뇌됐어요"); return; } }
        if(tgt.d <= 5){ LV.cast = 0.5; var cm = TM.push(AttackCommand(LUC, tgt.o, LUC.atk, 0.9)); if(FX){ var tp = tpos(tgt.o); FX.bullet({ x:wx(LUC.gx), z:wz(LUC.gz), y:14 }, tp, { hit:cm.hit, delay:0.3, cb:function(h, x, y, z){ impact(cm, h, x, y, z); } }); } say("😈 루샤의 공격!"); }
        else { stepToward(LUC, tgt.o.gx, tgt.o.gz); }
      }
      function afterPhase(team){
        var c = counts();
        if(LUC.hp <= 0 || LUC.alive === false){ finishWin(); return; }
        if(RAB.hp <= 0){ finishLose("토끼가 쓰러졌어요…"); return; }
        if(c.a <= 0 && !ROKT.alive && !ROKT2.alive){ finishLose("국군이 모두 쓰러졌어요…"); return; }
        if(team === "rok"){ S.state = "enemy"; refreshUI(); runPhase("nk"); return; }
        // 라운드 끝: 효과 감소 (적 행동 묶음에 포함 → 우클릭으로 함께 되돌려요)
        TM.push(SnapCommand(function(){
          S.turn++; RAB.def = false; S.moves = MOVES; S.acted = false; S.volleyDone = false; S.cd.q = Math.max(0, S.cd.q - 1); S.cd.w = Math.max(0, S.cd.w - 1); S.cd.e = Math.max(0, S.cd.e - 1); LUC.cdQ = Math.max(0, LUC.cdQ - 1); LUC.cdW = Math.max(0, LUC.cdW - 1); if(LUC.curse > 0) LUC.curse--;
          rok.forEach(function(u){ if(u.brain > 0){ u.brain--; if(u.brain <= 0){ if(u.alive) floatText(u.x, UH + 3, u.z, "정신 차림", "#9fe0ff"); } } }); nk.forEach(function(u){ if(u.charm > 0) u.charm--; });
        }));
        TM.team = "player"; TM.group = 0;
        S.state = "player"; say("— 턴 " + S.turn + " 시작 — (우클릭: 행동 되돌리기)"); refreshUI();
      }
      function finishWin(){ TM.clear(); TM.team = "player"; TM.group = 0; S.state = "anim"; LV.die = 0; rok.forEach(function(q){ if(q.alive) q.cheer = 1; }); showDlg([["😈 루샤", "크윽…! 내 유흥이… 이럴 수가!"], ["😈 루샤", "다음엔 두고 보자… 칠곡 놈들!"], ["🎖 국군", "만세! 토끼 대장 만세!"]], function(){ endBattle(true); }); }
      function finishLose(msg){ TM.clear(); TM.team = "player"; TM.group = 0; LV.laughT = 3; window.__tbLose = msg + " | rab " + RAB.hp + " luc " + LUC.hp + " cnt " + JSON.stringify(counts()); S.state = "anim"; showDlg([["😈 루샤", "하하하! " + msg + " 별것 아니구나!"], ["😈 루샤", "물러가라… 다시 도전하려면 오거라!"]], function(){ resetAfterLoss(); if(typeof showToast === "function") showToast("💪 패배! 다시 국군에게 다가가면 전투를 다시 시작해요"); }); }
      // ---------- 매 프레임 ----------
      function buildAll(){
        if(built) return; built = true; G = new THREE.Group(); G.name = "turnBattle"; scene.add(G); 
        initFx(); mkUI(); ambInit(); loadRemoteSheet(); wall = (typeof memorialCleared === "function" && memorialCleared()) ? null : { x:0, z:Z0 - 66, hx:80, hz:4 }; if(wall) window.ROCK_RECTS.push(wall);
      }
      window.__tbS = S; window.__tbDbg = { P2:P2, LUC:LUC, RAB:RAB, rok:rok, nk:nk, hrok:hrok, hnk:hnk, PLR:PLR, PLN:PLN, TANKS:TANKS }; window.tbActive = function(){ return S.active; };
      window.tbFrame = function(dt){
        // update() 대신 호출돼요: 키를 한 칸 이동으로 바꿔요 (한 번 눌러야 한 칸)
        var k = state.keys, pk = S.prevKeys, p = state.player; p.walking = !!S.tw; p.dir = "back"; state.keys.jump = false;
        if(S.state === "player" && !S.dlg){ if(k.up && !pk.up) rabbitStep(0, 1); else if(k.down && !pk.down) rabbitStep(0, -1); else if(k.left && !pk.left) rabbitStep(-1, 0); else if(k.right && !pk.right) rabbitStep(1, 0); }
        pk.up = k.up; pk.down = k.down; pk.left = k.left; pk.right = k.right;
      };
      function doUndo(){
        if(!S.active) return false;
        if(S.state !== "player" || S.dlg || S.tw || S.anim){ say("지금은 되돌릴 수 없어요"); return true; }
        var h = TM.commandHistory; if(!h.length){ say("되돌릴 행동이 없어요"); return true; }
        var wasEnemy = h[h.length - 1].team === "enemy"; var n = TM.undo();
        if(wasEnemy){ S.state = "player"; S.moves = 0; S.acted = true; S.volleyDone = true; say("↩ 적의 행동을 되돌렸어요 · 우클릭: 국군 일제사격 → 내 행동 순서로 더 되돌려요 · Space: 적 차례 다시"); }
        else say("↩ 행동을 되돌렸어요");
        S.menu = false; ui.skills.style.display = "none"; refreshUI(); return true;
      }
      window.__tbPose = function(kind, yaw){ POSE = kind === "kick" ? { kind:"kick", t:0, dur:1.25, yaw:yaw } : { kind:"charm", t:0, dur:1.3 }; }; window.__tbFx = function(){ return FX; }; window.__tbKill = function(pl){ pl.hp = 0; pl.vhp = 0; pl.alive = false; startCrash(pl); };
      window.__tbUndo = doUndo; window.__tbTM = TM;
      window.addEventListener("contextmenu", function(e){ if(!S.active) return; e.preventDefault(); e.stopImmediatePropagation(); doUndo(); }, true);
      window.addEventListener("keydown", function(e){
        if(!S.active && S.state !== "prompt") return; var kk = e.key.toLowerCase(), used = true;
        if(S.state === "prompt"){ if(kk === "enter" || kk === "y") startBattle(); else if(kk === "escape" || kk === "n") closePrompt(true); else used = false; }
        else if(S.dlg){ if(kk === " " || kk === "enter") nextDlg(); else used = false; }
        else if(S.state === "player"){ if(kk === "1") doAttack(); else if(kk === "2") doDefend(); else if(kk === "3") doItem(); else if(kk === "4") toggleSkills(); else if(kk === "5") doRetreat(); else if(kk === "z") doUndo(); else if(kk === "q") skillQ(); else if(kk === "w" && e.shiftKey === false && false) skillW(); else if(kk === " " || kk === "enter") endPlayerTurn(); else if(kk === "e") skillE(); else used = false; if(kk === "w"){ skillW(); used = true; } }
        else used = (kk === "e" || kk === "m" || kk === "c" || kk === " ");
        if(used){ e.stopImmediatePropagation(); e.preventDefault(); }
      }, true);
      function lerpTo(u, dt, sp){ var tx = wx(u.gx), tz = wz(u.gz), dx = tx - u.x, dz = tz - u.z, d = Math.sqrt(dx*dx + dz*dz); if(d < 0.02){ u.x = tx; u.z = tz; return; } var step = Math.min(d, Math.max(26*dt, d*dt*3)); u.x += dx/d*step; u.z += dz/d*step; }
      window.tbTick = function(t, dt, p){ try{ tbTick0(t, dt, p); }catch(err){ window.__tbErr = String(err && err.stack || err).slice(0, 600); if(window.console) console.warn("턴제 전투 오류:", err); } };
      function tbTick0(t, dt, p){
        if(!window.__riverBuilt || typeof state === "undefined" || !state.charId) return; if(!built){ if(p.z > 1500 && p.z < 2400 && Math.abs(p.x) < 400) buildAll(); else return; }
        if(S.state === "won" && !S.winT && S.winT !== 0){ return; }
        var far = Math.hypot(p.x, p.z - Z0) > 520; if(G) G.visible = !far && S.state !== "won2";
        if(!G || !G.visible) return;
        var i, u, tm = t/1000;
        for(i = pending.length - 1; i >= 0; i--){ pending[i].t -= dt; if(pending[i].t <= 0){ var pf = pending[i].fn; pending.splice(i, 1); pf(); } }
        { var hh = document.getElementById("canvasHolder"); if(hh){ if(S.shake > 0){ S.shake = Math.max(0, S.shake - dt*1.7); var sh0 = S.shake*7; hh.style.transform = S.shake > 0 ? "translate(" + ((Math.random() - 0.5)*sh0).toFixed(1) + "px," + ((Math.random() - 0.5)*sh0).toFixed(1) + "px)" : ""; } } }
        // 대기 중: 가까이 가면 질문
        if(S.state === "idle"){ S.cool = Math.max(0, S.cool - dt); if(S.cool <= 0 && p.z > Z0 - 100 && p.z < Z0 + 40 && Math.abs(p.x) < 90) openPrompt(); }
        var pf0 = performance.now(); if(AMB.on) ambTick(dt, tm); var pf1 = performance.now();
        // 토끼 이동 트윈
        if(S.tw){ var w = S.tw; w.t += dt; var f = Math.min(1, w.t/w.dur); f = f*f*(3 - 2*f); w.p.x = w.x0 + (w.x1 - w.x0)*f; w.p.z = w.z0 + (w.z1 - w.z0)*f; if(w.t >= w.dur){ S.tw = null; } }
        // 도입 연출: 북한군 행군 → 루샤 등장 → 대사
        if(S.state === "intro"){
          if(S.intro === 0){ S.march += dt; var fm = Math.min(1, S.march/3.2); nk.forEach(function(n){ n.x = wx(n.gx); n.z = wz(n.gz) - 40*T*fm; }); [NKT, NKT2].forEach(function(k){ k.x = wx(k.gx); k.z = wz(k.gz) - 40*T*fm; });
            if(S.march >= 3.2){ S.intro = 1; nk.forEach(function(n){ n.gz -= 40; delete occ[key(n.gx, n.gz + 40)]; occ[key(n.gx, n.gz)] = n; n.z = wz(n.gz); }); [NKT, NKT2].forEach(function(k){ delete occ[key(k.gx, k.gz)]; k.gz -= 40; occ[key(k.gx, k.gz)] = k; k.z = wz(k.gz); }); delete occ[key(LUC.gx, LUC.gz)]; LUC.gz -= 40; occ[key(LUC.gx, LUC.gz)] = LUC; LV.x = wx(LUC.gx); LV.z = wz(LUC.gz + 10); LV.vis = true; LV.walkIn = true; } }
          else if(S.intro === 1){ LV.z -= 15*dt; if(LV.z <= wz(LUC.gz)){ LV.z = wz(LUC.gz); S.intro = 2; LV.walkIn = false; LV.laughT = 1.6; showDlg([["😈 루샤", "네 이 놈! 네놈이 내 유흥을 방해하는구나!"], ["😈 루샤", "저놈들을 없애라!"], ["🎖 국군", "우와아아! 전투 준비!"]], function(){ S.state = "player"; say("— 턴 1 시작 — 방향키로 이동, 행동을 고르세요"); refreshUI(); }); } }
        }
        // 군인 위치/연출 (몸의 움직임은 TBRig 가 그려요)
        var all = ALL;
        for(i = 0; i < all.length; i++){ u = all[i];
          if(!u.hill && !AMB.on && !(S.state === "intro" && u.side === "nk" && S.intro === 0)) lerpTo(u, dt, 5);
          if(u.fireWait > 0){ u.fireWait -= dt; if(u.fireWait <= 0){ u.fireT = 0.5; u.fireWait = 0; fireShot(u); } } else if(u.fireT > 0) u.fireT -= dt;
          if(u.shotQ && u.shotQ.length){ for(var sq = u.shotQ.length - 1; sq >= 0; sq--){ u.shotQ[sq].w -= dt; if(u.shotQ[sq].w <= 0){ var qs = u.shotQ.splice(sq, 1)[0]; u.shot = qs.cmd; var qp = tpos(qs.cmd.tgt); u.fx = qp.x; u.fz = qp.z; u.fireT = 0.5; fireShot(u); } } }
          if(u.hit > 0) u.hit -= dt; if(u.die >= 0) u.die += dt;
}
        var pf2 = performance.now(); if(RIG) RIG.update(all, tm, dt, three.camera); var pf3 = performance.now(); window.__tbPerf = { amb:pf1 - pf0, rig:pf3 - pf2 };
        TANKS.forEach(function(k){ if(!(S.state === "intro" && k.side === "nk" && S.intro === 0)) lerpTo(k, dt, 5); if(k.fireWait > 0){ k.fireWait -= dt; if(k.fireWait <= 0){ k.fireWait = 0; fireTank(k); } } if(k.hit > 0) k.hit -= dt; if(k.t3){ k.t3.place(k.x, k.z); k.t3.update(dt, tm); } }); planesTick(dt, tm);
        if(LUC3b){ if(P2.alive || P2.die < 1.4) lerpTo(P2, dt, 5); if(LV2.cast > 0) LV2.cast -= dt; if(LV2.ft > 0){ LV2.ft -= dt; if(LV2.ft <= 0) LV2.face = undefined; } if(P2.die >= 0) P2.die += dt; if(P2.hit > 0) P2.hit -= dt; LUC3b.setVisible(S.active && !(P2.die > 1.4)); LUC3b.update(dt, tm, P2.x, P2.z, { cast:LV2.cast > 0 ? 1 : 0, die:P2.die >= 0 ? P2.die : undefined, face:LV2.face !== undefined ? LV2.face : 0 }); }
        if(FX){ FX.update(dt); var bl = barList, bn = 0, cpx = three.camera.position.x, cpz = three.camera.position.z;
          for(var bi = 0; bi < ALL.length; bi++){ var bu = ALL[bi], bb = bl[bn] || (bl[bn] = {}); bb.x = bu.x; bb.y = (bu.y || 0) + UH + 3.0; bb.z = bu.z; bb.w = bu.role === "mg" ? 5 : 3.6; bb.h = 0.45; bb.frac = bu.vhp/bu.maxHp; bb.col = bu.brain > 0 ? 0xb06aff : (bu.side === "rok" ? 0x4fd15a : 0xe0503c); bb.vis = !!(S.active && bu.vis && bu.vhp > 0 && (bu.vhp < bu.maxHp || (Math.abs(bu.x - cpx) < 75 && Math.abs(bu.z - cpz) < 75))); bn++; }
          bl.length = bn;
          bl.push({ x:state.player.x, y:UH + 5.2, z:state.player.z, w:8, h:0.8, frac:RAB.vhp/RAB.maxHp, col:0x4aa3ff, vis:S.active && RAB.vhp > 0 });
          bl.push({ x:LV.x, y:23.5, z:LV.z, w:8, h:0.8, frac:LUC.vhp/LUC.maxHp, col:0xb06aff, vis:S.active && LV.vis && LUC.vhp > 0 && LV.die < 0 });
          TANKS.forEach(function(k){ bl.push({ x:k.x, y:33, z:k.z, w:20, h:1.5, frac:k.vhp/k.maxHp, col:k.side === "rok" ? 0x4fd15a : 0xe0503c, vis:S.active && k.vhp > 0 && (k.side === "rok" || S.state !== "intro" || S.intro > 0) }); });
          bl.push({ x:P2.x, y:23.5, z:P2.z, w:8, h:0.8, frac:P2.vhp/P2.maxHp, col:0x35d0c0, vis:S.active && P2.vhp > 0 });
          PLANES.forEach(function(pl){ bl.push({ x:pl.x, y:pl.y + 8, z:pl.z, w:14, h:1.1, frac:pl.vhp/pl.maxHp, col:pl.side === "rok" ? 0x4fd15a : 0xe0503c, vis:S.active && pl.vhp > 0 }); });
          FX.bars(bl, three.camera); }
        // 루샤 (3D, 걷고 웃고 주문을 외워요)
        if(LUC3){ var ltz = wz(LUC.gz), ltx = wx(LUC.gx); if(LV.vis && !LV.walkIn){ LV.x += (ltx - LV.x)*Math.min(1, dt*3.0); LV.z += (ltz - LV.z)*Math.min(1, dt*3.0); }
          if(LV.cast > 0) LV.cast -= dt; if(LV.laughT > 0){ LV.laughT -= dt; } if(LV.die >= 0) LV.die += dt;
          LUC3.setVisible(LV.vis && !(LV.die > 1.4)); LUC3.update(dt, tm, LV.x, LV.z, { cast:LV.cast > 0 ? 1 : 0, die:LV.die >= 0 ? LV.die : undefined, laugh:LV.laughT > 0 }); }
        // 단계 애니메이션
        if(S.anim){ S.anim.t += dt; if(S.anim.t >= S.anim.dur){ var tm2 = S.anim.team; S.anim = null; afterPhase(tm2); } }
        // 이펙트 선/글자
        for(i = 0; i < lines.length; i++){ var l = lines[i]; if(l.visible){ l.userData.t += dt; l.material.opacity = Math.max(0, 1 - l.userData.t/0.35); if(l.userData.t > 0.35) l.visible = false; } }
        for(i = 0; i < texts.length; i++){ var tx = texts[i]; if(tx.visible){ tx.userData.t += dt; tx.position.y = tx.userData.y0 + tx.userData.t*5; tx.material.opacity = Math.max(0, 1 - Math.max(0, tx.userData.t - 0.8)/0.6); if(tx.userData.t > 1.4) tx.visible = false; } }
        // 승리 후 정리
        if(S.winT !== undefined && S.state === "won"){ S.winT += dt; if(S.winT > 5){ G.visible = false; S.state = "won2"; } }
      }
    })();
