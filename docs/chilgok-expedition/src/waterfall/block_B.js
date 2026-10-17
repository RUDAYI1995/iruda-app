    // ================= 칠곡 턴제 전투 (국군 100 : 북한군 100 + 루샤) =================
    // 호국탑 가는 길(월드 z≈1930~2075)에서 국군을 만나면 시작해요. 실시간 전투는 이 턴제로 바뀌었어요.
    // 규칙(갓루다님 설계): 국군/북한군 HP 100 · 총 한 발 40 · 우리 차례(토끼가 움직이고 행동 → 국군 전체 자동 행동) → 적 차례(루샤 스킬 → 북한군 전체 자동 행동)
    // 토끼 스킬 Q 당근 나눠주기(+30 회복) / W 뒷다리 걷어차기(-80) / E 토끼의 유혹(북한군 2명이 따라옴)
    // 루샤 스킬 Q 음침한 기운(3턴간 국군 공격 40→36, 재사용 6턴) / W 어둠의 손길(국군 1명을 2턴간 세뇌) / E 사악한 미소(1번, 10턴 뒤부터, 국군 전체 -10)
    (function buildTurnBattle(){
      var T = 5, Z0 = 1990, NSIDE = 100, UH = 10, RANGE = 5, DMG = 40, HP = 100, MOVES = 3;
      var BX = 12, BZ0 = -14, BZ1 = 26;
      var LUCIA_SRC = "data:image/webp;base64,__LUCIA__";
      var built = false, G = null, ui = null, rok = [], nk = [], occ = {}, wall = null;
      var RAB = { kind:"rabbit", gx:0, gz:0, hp:300, shots:0, def:false, items:3, alive:true };
      var LUC = { kind:"lucia", gx:0, gz:21, hp:300, alive:true, cdQ:0, cdW:0, usedE:false, curse:0 };
      var S = { state:"idle", active:false, turn:1, moves:MOVES, acted:false, cd:{ q:0, w:0, e:0 }, anim:null, cool:0, log:[], menu:false, dlg:null, intro:0, prevKeys:{}, tw:null, ended:false };
      var rnd = (function(){ var s = 7771; return function(){ s = (s*16807) % 2147483647; return s/2147483647; }; })();
      function wx(gx){ return -gx*T; } function wz(gz){ return Z0 + gz*T; }
      function key(gx, gz){ return gx + "," + gz; }
      function dist(a, b){ return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gz - b.gz)); }
      function inb(gx, gz){ return gx >= -BX && gx <= BX && gz >= BZ0 && gz <= BZ1; }
      function tex(src){ var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = src; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
      var TX = {};
      function mkSprite(t, h, asp, tint){ var m = new THREE.SpriteMaterial({ map:t, transparent:true, alphaTest:0.4, fog:false, color:tint || 0xffffff }); var s = new THREE.Sprite(m); s.scale.set(h*asp, h, 1); s.center.set(0.5, 0); return s; }
      function mkUnit(side, gx, gz, i){
        var asp = side === "rok" ? 0.5304 : 0.55, sp = mkSprite(TX[side], UH, asp);
        var u = { kind:"soldier", side:side, id:side + i, gx:gx, gz:gz, hp:HP, alive:true, sp:sp, x:wx(gx), z:wz(gz), fx:wx(gx), fz:wz(gz), brain:0, charm:0, bar:null, hit:0, die:-1, hop:0, w:UH*asp };
        sp.position.set(u.x, 0, u.z); G.add(sp); occ[key(gx, gz)] = u; return u;
      }
      function setupFormation(){
        var i, c, r; rok.length = 0; nk.length = 0; occ = {};
        for(r = 0; r < 10; r++) for(c = 0; c < 10; c++){ var gx = c - 5, gz = -1 - r; if(gx === 0 && gz === -1 && false) continue; var u = mkUnit("rok", gx, gz, r*10 + c); rok.push(u); }
        for(r = 0; r < 10; r++) for(c = 0; c < 10; c++){ var gx2 = c - 5, gz2 = 8 + r; var n = mkUnit("nk", gx2, gz2 + 40, r*10 + c); n.sp.visible = false; nk.push(n); }
        RAB.gx = 0; RAB.gz = 0; RAB.hp = 300; RAB.def = false; RAB.items = 3; RAB.alive = true; occ[key(0, 0)] = RAB;
        LUC.gx = 0; LUC.gz = 21 + 40; LUC.hp = 300; LUC.alive = true; LUC.cdQ = 0; LUC.cdW = 0; LUC.usedE = false; LUC.curse = 0; occ[key(LUC.gx, LUC.gz)] = LUC;
      }
      // ---------- 이펙트 (선 / 글자 / 물방울) ----------
      var lines = [], texts = [], auraS = null, lucS = null;
      function initFx(){
        var i; for(i = 0; i < 40; i++){ var gm = new THREE.BufferGeometry(); gm.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); var l = new THREE.Line(gm, new THREE.LineBasicMaterial({ color:0xffe27a, transparent:true, opacity:0, fog:false })); l.visible = false; l.frustumCulled = false; l.userData = { t:9 }; G.add(l); lines.push(l); }
        for(i = 0; i < 18; i++){ var cv = document.createElement("canvas"); cv.width = 128; cv.height = 48; var tx = new THREE.CanvasTexture(cv); var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tx, transparent:true, depthTest:false, fog:false })); sp.scale.set(12, 4.5, 1); sp.visible = false; sp.renderOrder = 50; sp.userData = { cv:cv, tx:tx, t:9 }; G.add(sp); texts.push(sp); }
        var ac = document.createElement("canvas"); ac.width = ac.height = 128; var g = ac.getContext("2d"), gr = g.createRadialGradient(64, 64, 6, 64, 64, 64); gr.addColorStop(0, "rgba(170,70,255,0.9)"); gr.addColorStop(0.5, "rgba(110,30,190,0.45)"); gr.addColorStop(1, "rgba(60,0,110,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
        auraS = new THREE.Sprite(new THREE.SpriteMaterial({ map:new THREE.CanvasTexture(ac), transparent:true, depthWrite:false, fog:false, opacity:0.0 })); auraS.scale.set(30, 30, 1); auraS.center.set(0.5, 0.15); auraS.visible = false; G.add(auraS);
        lucS = mkSprite(TX.lucia, 17, 660/960); lucS.visible = false; G.add(lucS);
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
        var pb = document.createElement("div"); pb.style.cssText = "background:#fffaf0;border:3px solid #d8b04a;border-radius:16px;padding:16px 20px;text-align:center;color:#2b3a6a;max-width:86%;"; pb.innerHTML = '<div style="font-weight:800;font-size:16px;margin-bottom:6px">🎖 국군 소대를 만났어요!</div><div style="font-size:13px;margin-bottom:12px">전투를 시작할까요? <small>(국군 100 : 북한군 100 · 턴제)</small></div>'; ui.prompt.appendChild(pb); var pr = document.createElement("div"); pr.style.cssText = "display:flex;gap:8px;justify-content:center;"; pb.appendChild(pr);
        btn(pr, "시작 <small>Enter</small>", function(){ startBattle(); }, "background:#2b3a6a;color:#fff;"); btn(pr, "나중에 <small>Esc</small>", function(){ closePrompt(true); });
        ui.dlg = el("position:absolute;left:50%;bottom:10px;transform:translateX(-50%);width:min(560px,92%);background:rgba(24,12,48,.9);border:3px solid #a45cff;border-radius:14px;padding:10px 12px;color:#fff;display:none;gap:10px;align-items:center;pointer-events:auto;cursor:pointer;");
        ui.dlgImg = document.createElement("img"); ui.dlgImg.src = LUCIA_SRC; ui.dlgImg.style.cssText = "width:72px;height:104px;object-fit:contain;flex:0 0 auto;"; ui.dlg.appendChild(ui.dlgImg);
        var dt = document.createElement("div"); dt.style.cssText = "flex:1;"; ui.dlgName = document.createElement("div"); ui.dlgName.style.cssText = "font-weight:800;color:#d9b3ff;font-size:13px;margin-bottom:3px;"; ui.dlgText = document.createElement("div"); ui.dlgText.style.cssText = "font-size:15px;line-height:1.5;"; var nx = document.createElement("div"); nx.style.cssText = "text-align:right;font-size:11px;color:#b9a3d9;margin-top:4px;"; nx.textContent = "▶ 클릭 / Space"; dt.appendChild(ui.dlgName); dt.appendChild(ui.dlgText); dt.appendChild(nx); ui.dlg.appendChild(dt);
        ui.dlg.addEventListener("click", function(e){ e.stopPropagation(); nextDlg(); });
        ui.end = el("position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:42px;font-weight:900;color:#fff;text-shadow:0 3px 12px rgba(0,0,0,.7);display:none;pointer-events:none;");
      }
      function say(m){ S.log.push(m); if(S.log.length > 3) S.log.shift(); if(ui){ ui.log.innerHTML = S.log.join("<br>"); ui.log.style.display = "block"; } }
      function counts(){ var a = 0, b = 0; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) a++; }); nk.forEach(function(u){ if(u.alive) b++; }); rok.forEach(function(u){ if(u.alive && u.brain > 0) b++; }); return { a:a, b:b }; }
      function refreshUI(){
        if(!ui) return; var c = counts(), ph = S.state === "player" ? "<b style='color:#9fe0ff'>우리 차례</b>" : "<b style='color:#ff9f9f'>" + (S.state === "enemy" ? "적 차례" : "…") + "</b>";
        ui.top.style.display = S.active ? "block" : "none";
        ui.top.innerHTML = "⚔ <b>턴 " + S.turn + "</b> · " + ph + "<br>🎖 국군 " + c.a + "/100 · 🪖 북한군 " + c.b + "/100<br>🐰 HP " + Math.max(0, RAB.hp) + "/300" + (RAB.def ? " 🛡" : "") + " · 😈 루샤 " + Math.max(0, LUC.hp) + "/300" + (LUC.curse > 0 ? " · 음침한 기운 " + LUC.curse + "턴" : "");
        var pt = S.active && S.state === "player"; ui.menu.style.display = pt ? "flex" : "none";
        ui.info.textContent = "이동 " + S.moves + "칸 남음 (방향키/WASD 한 칸씩) · " + (S.acted ? "행동 완료" : "행동 1회");
        ui.sQ.innerHTML = "🥕 당근 나눠주기 <small>Q" + (S.cd.q > 0 ? " ·" + S.cd.q + "턴" : "") + "</small>"; ui.sW.innerHTML = "🦵 뒷다리 걷어차기 <small>W" + (S.cd.w > 0 ? " ·" + S.cd.w + "턴" : "") + "</small>"; ui.sE.innerHTML = "💘 토끼의 유혹 <small>E" + (S.cd.e > 0 ? " ·" + S.cd.e + "턴" : "") + "</small>";
        ui.bItem.innerHTML = "🍙 아이템 " + RAB.items + " <small>3</small>";
      }
      // ---------- 대사 ----------
      function showDlg(lines, done, portrait){ S.dlg = { lines:lines, i:0, done:done }; if(ui){ ui.dlg.style.display = "flex"; ui.dlgImg.style.display = portrait === false ? "none" : "block"; } renderDlg(); }
      function renderDlg(){ var d = S.dlg; if(!d || !ui) return; var l = d.lines[d.i]; ui.dlgName.textContent = l[0]; ui.dlgText.textContent = l[1]; }
      function nextDlg(){ var d = S.dlg; if(!d) return; d.i++; if(d.i >= d.lines.length){ S.dlg = null; if(ui) ui.dlg.style.display = "none"; if(d.done) d.done(); } else renderDlg(); }
      // ---------- 전투 시작/종료 ----------
      function openPrompt(){ if(S.state !== "idle" || !ui) return; S.state = "prompt"; ui.prompt.style.display = "flex"; }
      function closePrompt(later){ if(ui) ui.prompt.style.display = "none"; S.state = "idle"; if(later) S.cool = 10; }
      function camBattle(on){ var cs = state.cam; if(on){ S.camSave = { pt:cs.pt, plock:cs.plock }; cs.plock = true; cs.pt = -2.1; cs.yaw = cs.target = 0; cs.turn = null; } else if(S.camSave){ cs.plock = S.camSave.plock; cs.pt = S.camSave.pt || 0; } }
      function startBattle(){
        if(ui) ui.prompt.style.display = "none"; S.state = "intro"; S.active = true; S.turn = 1; S.moves = MOVES; S.acted = false; S.cd.q = S.cd.w = S.cd.e = 0; S.log = []; S.intro = 0; S.ended = false; camBattle(true);
        var p = state.player; tween(p, wx(0), wz(0), 0.9); delete occ[key(RAB.gx, RAB.gz)]; RAB.gx = 0; RAB.gz = 0; occ[key(0, 0)] = RAB;
        nk.forEach(function(u){ u.sp.visible = true; }); S.march = 0; say("🪖 북한군이 몰려와요!"); refreshUI();
      }
      function tween(p, x, z, dur){ S.tw = { p:p, x0:p.x, z0:p.z, x1:x, z1:z, t:0, dur:dur }; }
      function endBattle(win){
        S.active = false; S.state = win ? "won" : "idle"; camBattle(false); if(ui){ ui.top.style.display = "none"; ui.menu.style.display = "none"; ui.log.style.display = "none"; }
        if(win){ var i; for(i = 0; i < 10; i++) state.defeated.add("grunt" + i); state.defeated.add("boss"); if(typeof writeSave === "function") writeSave(); if(wall){ var ix = window.ROCK_RECTS.indexOf(wall); if(ix >= 0) window.ROCK_RECTS.splice(ix, 1); wall = null; } if(typeof showToast === "function"){ showToast("🎉 루샤를 물리쳤어요! 기념관 수호 완료!"); setTimeout(function(){ showToast("✅ 호국탑의 스탬프를 주우러 가보세요"); }, 1800); } S.winT = 0; }
      }
      function resetAfterLoss(){
        var i; G.children.slice().forEach(function(c){ if(c.userData && c.userData.unit) G.remove(c); }); rok.forEach(function(u){ G.remove(u.sp); if(u.bar) G.remove(u.bar); }); nk.forEach(function(u){ G.remove(u.sp); if(u.bar) G.remove(u.bar); }); setupFormation(); lucS.visible = false; auraS.visible = false;
        var p = state.player; p.x = wx(0); p.z = Z0 - 70; state.cam.fx = null; S.state = "idle"; S.cool = 6; S.active = false; camBattle(false); if(ui){ ui.top.style.display = "none"; ui.menu.style.display = "none"; ui.log.style.display = "none"; ui.end.style.display = "none"; }
      }
      // ---------- 이동/행동 ----------
      function rabbitStep(dx, dz){
        if(S.tw || S.state !== "player") return; if(S.moves <= 0){ say("이동 횟수를 다 썼어요. 행동을 고르거나 턴을 끝내세요"); return; }
        var nx = RAB.gx + dx, nz = RAB.gz + dz; if(!inb(nx, nz)){ say("더 갈 수 없어요"); return; } if(occ[key(nx, nz)]){ say("그 자리는 막혀 있어요"); return; }
        delete occ[key(RAB.gx, RAB.gz)]; RAB.gx = nx; RAB.gz = nz; occ[key(nx, nz)] = RAB; S.moves--; tween(state.player, wx(nx), wz(nz), 0.2); refreshUI();
      }
      function adjFoes(r){ var res = []; nk.forEach(function(u){ if(u.alive && dist(u, RAB) <= r) res.push(u); }); rok.forEach(function(u){ if(u.alive && u.brain > 0 && dist(u, RAB) <= r) res.push(u); }); if(LUC.alive && dist(LUC, RAB) <= r) res.push(LUC); res.sort(function(a, b){ return dist(a, RAB) - dist(b, RAB) || (a.hp - b.hp); }); return res; }
      function dealTo(t, dmg, srcKind){
        if(t.kind === "rabbit"){ RAB.shots++; var d = RAB.def ? Math.round(dmg*0.5) : dmg; RAB.hp -= d; floatText(state.player.x, UH + 3, state.player.z, "-" + d, "#ff9f9f"); return; }
        if(t.kind === "lucia"){ LUC.hp -= dmg; floatText(wx(LUC.gx), 20, wz(LUC.gz), "-" + dmg, "#ffe27a"); if(LUC.hp <= 0){ LUC.alive = false; delete occ[key(LUC.gx, LUC.gz)]; } t.hit = 0.3; return; }
        t.hp -= dmg; t.hit = 0.3; if(t.hp < HP){ if(!t.bar){ t.bar = new THREE.Sprite(new THREE.SpriteMaterial({ color:t.side === "rok" ? 0x5fd36a : 0xe05a5a, depthTest:false, fog:false })); t.bar.renderOrder = 40; G.add(t.bar); } }
        if(t.hp <= 0){ t.alive = false; t.die = 0; delete occ[key(t.gx, t.gz)]; if(t.bar) t.bar.visible = false; }
      }
      function afterAction(){ S.acted = true; S.menu = false; ui.skills.style.display = "none"; refreshUI(); if(LUC.hp <= 0){ S.state = "anim"; finishWin(); } }
      function doAttack(){ if(S.state !== "player" || S.acted) return; var f = adjFoes(1); if(!f.length){ say("적이 너무 멀어요. 방향키로 가까이 가세요"); return; } tracer({ x:state.player.x, z:state.player.z }, { x:wx(f[0].gx), z:wz(f[0].gz) }); dealTo(f[0], 30); say("⚔ 토끼의 공격! 30 데미지"); afterAction(); }
      function doDefend(){ if(S.state !== "player" || S.acted) return; RAB.def = true; say("🛡 방어 자세! 이번 적 차례 피해 절반"); afterAction(); }
      function doItem(){ if(S.state !== "player" || S.acted) return; if(RAB.items <= 0){ say("아이템이 없어요"); return; } RAB.items--; RAB.hp = Math.min(300, RAB.hp + 50); floatText(state.player.x, UH + 3, state.player.z, "+50", "#9fffa8"); say("🍙 주먹밥으로 HP +50"); afterAction(); }
      function toggleSkills(){ if(S.state !== "player" || S.acted) return; S.menu = !S.menu; ui.skills.style.display = S.menu ? "flex" : "none"; }
      function skillQ(){ if(S.state !== "player" || S.acted) return; if(S.cd.q > 0){ say("당근은 " + S.cd.q + "턴 뒤에 다시 나눠줄 수 있어요"); return; } var n = 0; rok.forEach(function(u){ if(u.alive && !(u.brain > 0) && dist(u, RAB) <= 6){ var h = Math.min(HP, u.hp + 30) - u.hp; if(h > 0){ u.hp += h; n++; if(u.bar && u.hp >= HP) u.bar.visible = false; if(n <= 6) floatText(u.x, UH + 2, u.z, "+30", "#9fffa8"); } } }); RAB.hp = Math.min(300, RAB.hp + 30); S.cd.q = 3; say("🥕 당근 나눠주기! 주변 국군 " + n + "명 HP +30"); afterAction(); }
      function skillW(){ if(S.state !== "player" || S.acted) return; if(S.cd.w > 0){ say("뒷다리 걷어차기는 " + S.cd.w + "턴 뒤에 쓸 수 있어요"); return; } var f = adjFoes(1); if(!f.length){ say("북한군 바로 앞(1칸)으로 가서 쓰세요"); return; } var t = f[0]; tracer({ x:state.player.x, z:state.player.z }, { x:wx(t.gx), z:wz(t.gz) }); dealTo(t, 80); S.cd.w = 2; say("🦵 뒷다리 걷어차기! 80 데미지"); afterAction(); }
      function skillE(){ if(S.state !== "player" || S.acted) return; if(S.cd.e > 0){ say("유혹은 " + S.cd.e + "턴 뒤에 쓸 수 있어요"); return; } var c = nk.filter(function(u){ return u.alive && dist(u, RAB) <= 10; }).sort(function(a, b){ return dist(a, RAB) - dist(b, RAB); }).slice(0, 2); if(!c.length){ say("근처(10칸)에 북한군이 없어요"); return; } c.forEach(function(u){ u.charm = 2; floatText(u.x, UH + 3, u.z, "💘", "#ff9fd0"); }); S.cd.e = 4; say("💘 토끼의 유혹! 북한군 " + c.length + "명이 2턴 동안 따라와요"); afterAction(); }
      function doRetreat(){ if(S.state !== "player") return; window.__tbLose = "retreat"; if(!window.confirm || window.confirm("후퇴할까요? (전투가 처음부터 다시 시작돼요)")){ say("🏃 후퇴!"); S.state = "idle"; resetAfterLoss(); if(typeof showToast === "function") showToast("🏃 후퇴했어요. 다시 국군에게 가면 전투를 시작해요"); } }
      // ---------- 턴 진행 ----------
      function endPlayerTurn(){ if(S.state !== "player" || S.tw) return; S.menu = false; ui.skills.style.display = "none"; S.state = "anim"; runPhase("rok"); }
      function stepToward(u, tx, tz){
        var dx = Math.sign(tx - u.gx), dz = Math.sign(tz - u.gz), cands = [];
        if(dx && dz) cands.push([dx, dz]); if(Math.abs(tx - u.gx) >= Math.abs(tz - u.gz)){ if(dx) cands.push([dx, 0]); if(dz) cands.push([0, dz]); } else { if(dz) cands.push([0, dz]); if(dx) cands.push([dx, 0]); }
        for(var i = 0; i < cands.length; i++){ var nx = u.gx + cands[i][0], nz = u.gz + cands[i][1]; if(!inb(nx, nz) || occ[key(nx, nz)]) continue; delete occ[key(u.gx, u.gz)]; u.gx = nx; u.gz = nz; occ[key(nx, nz)] = u; return true; }
        return false;
      }
      function nearest(u, list){ var best = null, bd = 99; for(var i = 0; i < list.length; i++){ var o = list[i]; if(!o.alive) continue; var d = dist(u, o); if(d < bd || (d === bd && best && o.hp < best.hp)){ bd = d; best = o; } } return best ? { o:best, d:bd } : null; }
      var atkCount = 0;
      function soldierAct(u, foes, ownDmg){
        var n = nearest(u, foes.filter(function(o){ return o !== RAB; })) || nearest(u, foes); if(!n) return;
        if(u.charm > 0){ if(dist(u, RAB) > 1) stepToward(u, RAB.gx, RAB.gz); return; }
        if(n.d > 2) stepToward(u, n.o.gx, n.o.gz);                        // 앞으로 한 칸 (적과 2칸이 될 때까지)
        var bestL = null, q, o; for(q = 0; q < foes.length; q++){ o = foes[q]; if(!o.alive || o === RAB || dist(u, o) > RANGE) continue; if(!bestL || o.hp < bestL.hp || (o.hp === bestL.hp && dist(u, o) < dist(u, bestL))) bestL = o; }
        if(foes.indexOf(RAB) >= 0 && RAB.shots < 2 && dist(u, RAB) <= RANGE && (rnd() < 0.2 || !bestL)) bestL = RAB;      // 토끼는 가끔만 노려요
        if(bestL){ dealTo(bestL, ownDmg); u.hop = 0.25; if(++atkCount % 4 === 0) tracer(u, { x:wx(bestL.gx), z:wz(bestL.gz) }); }
      }
      function foesOfROK(){ var l = []; nk.forEach(function(u){ if(u.alive) l.push(u); }); rok.forEach(function(u){ if(u.alive && u.brain > 0) l.push(u); }); if(LUC.alive) l.push(LUC); return l; }
      function foesOfNK(){ var l = []; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) l.push(u); }); l.push(RAB); return l; }
      function runPhase(team){
        var i; atkCount = 0; RAB.shots = 0;
        if(team === "rok"){ var dm = LUC.curse > 0 ? 36 : DMG, fo = foesOfROK(), arr = rok.filter(function(u){ return u.alive && !(u.brain > 0); }).sort(function(a, b){ return b.gz - a.gz; }); arr.forEach(function(u){ soldierAct(u, fo, dm); }); say("🎖 국군 일제 행동 (공격 " + dm + ")"); }
        else {
          // 루샤 먼저
          lucia();
          var fo2 = foesOfNK(), arr2 = nk.filter(function(u){ return u.alive; }).concat(rok.filter(function(u){ return u.alive && u.brain > 0; })).sort(function(a, b){ return a.gz - b.gz; }); arr2.forEach(function(u){ soldierAct(u, u.side === "rok" ? foesOfROKbrain() : fo2, DMG); });
          say("🪖 북한군 일제 행동");
        }
        S.anim = { t:0, dur:1.25, team:team };
      }
      function foesOfROKbrain(){ var l = []; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)) l.push(u); }); l.push(RAB); return l; }
      function lucia(){
        if(!LUC.alive) return;
        var tgt = nearest(LUC, foesOfNK().filter(function(o){ return o !== RAB; }).concat([RAB])); if(!tgt) return;
        if(!LUC.usedE && S.turn >= 10){ LUC.usedE = true; var n = 0; rok.forEach(function(u){ if(u.alive && !(u.brain > 0)){ dealTo(u, 10); n++; } }); floatText(wx(LUC.gx), 22, wz(LUC.gz), "😈 사악한 미소", "#d9a0ff"); say("😈 루샤의 사악한 미소! 국군 전체 -10"); return; }
        if(LUC.cdQ <= 0 && LUC.curse <= 0){ LUC.curse = 3; LUC.cdQ = 6; floatText(wx(LUC.gx), 22, wz(LUC.gz), "음침한 기운", "#d9a0ff"); say("😈 음침한 기운! 3턴간 국군 공격 40 → 36"); return; }
        if(LUC.cdW <= 0){ var c = rok.filter(function(u){ return u.alive && !(u.brain > 0); }).sort(function(a, b){ return dist(a, LUC) - dist(b, LUC); })[0]; if(c){ c.brain = 2; c.sp.material.color.setHex(0xb06aff); LUC.cdW = 3; floatText(c.x, UH + 3, c.z, "세뇌!", "#d9a0ff"); say("😈 어둠의 손길! 국군 1명이 2턴 세뇌됐어요"); return; } }
        if(tgt.d <= 5){ dealTo(tgt.o, DMG); tracer({ x:wx(LUC.gx), z:wz(LUC.gz) }, { x:wx(tgt.o.gx), z:wz(tgt.o.gz) }); say("😈 루샤의 공격!"); }
        else { delete occ[key(LUC.gx, LUC.gz)]; var old = { gx:LUC.gx, gz:LUC.gz }; if(!stepToward(LUC, tgt.o.gx, tgt.o.gz)){ } occ[key(LUC.gx, LUC.gz)] = LUC; }
      }
      function afterPhase(team){
        var c = counts();
        if(LUC.hp <= 0 || LUC.alive === false){ finishWin(); return; }
        if(RAB.hp <= 0){ finishLose("토끼가 쓰러졌어요…"); return; }
        if(c.a <= 0){ finishLose("국군이 모두 쓰러졌어요…"); return; }
        if(team === "rok"){ S.state = "enemy"; refreshUI(); runPhase("nk"); return; }
        // 라운드 끝: 효과 감소
        S.turn++; RAB.def = false; S.moves = MOVES; S.acted = false; S.cd.q = Math.max(0, S.cd.q - 1); S.cd.w = Math.max(0, S.cd.w - 1); S.cd.e = Math.max(0, S.cd.e - 1); LUC.cdQ = Math.max(0, LUC.cdQ - 1); LUC.cdW = Math.max(0, LUC.cdW - 1); if(LUC.curse > 0) LUC.curse--;
        rok.forEach(function(u){ if(u.brain > 0){ u.brain--; if(u.brain <= 0){ u.sp.material.color.setHex(0xffffff); if(u.alive) floatText(u.x, UH + 3, u.z, "정신 차림", "#9fe0ff"); } } }); nk.forEach(function(u){ if(u.charm > 0) u.charm--; });
        S.state = "player"; say("— 턴 " + S.turn + " 시작 —"); refreshUI();
      }
      function finishWin(){ S.state = "anim"; var u = LUC; lucS.userData.die = 0; showDlg([["😈 루샤", "크윽…! 내 유흥이… 이럴 수가!"], ["😈 루샤", "다음엔 두고 보자… 칠곡 놈들!"], ["🎖 국군", "만세! 토끼 대장 만세!"]], function(){ endBattle(true); }); }
      function finishLose(msg){ window.__tbLose = msg + " | rab " + RAB.hp + " luc " + LUC.hp + " cnt " + JSON.stringify(counts()); S.state = "anim"; showDlg([["😈 루샤", "하하하! " + msg + " 별것 아니구나!"], ["😈 루샤", "물러가라… 다시 도전하려면 오거라!"]], function(){ resetAfterLoss(); if(typeof showToast === "function") showToast("💪 패배! 다시 국군에게 다가가면 전투를 다시 시작해요"); }); }
      // ---------- 매 프레임 ----------
      function buildAll(){
        if(built) return; built = true; G = new THREE.Group(); G.name = "turnBattle"; scene.add(G); TX.rok = tex(window.UNITS.rokSoldier); TX.nk = tex(window.UNITS.nkSoldier); TX.lucia = tex(LUCIA_SRC);
        initFx(); setupFormation(); mkUI(); wall = { x:0, z:Z0 - 66, hx:80, hz:4 }; window.ROCK_RECTS.push(wall);
      }
      window.__tbS = S; window.__tbDbg = { LUC:LUC, RAB:RAB, rok:rok, nk:nk }; window.tbActive = function(){ return S.active; };
      window.tbFrame = function(dt){
        // update() 대신 호출돼요: 키를 한 칸 이동으로 바꿔요 (한 번 눌러야 한 칸)
        var k = state.keys, pk = S.prevKeys, p = state.player; p.walking = !!S.tw; p.dir = "back"; state.keys.jump = false;
        if(S.state === "player" && !S.dlg){ if(k.up && !pk.up) rabbitStep(0, 1); else if(k.down && !pk.down) rabbitStep(0, -1); else if(k.left && !pk.left) rabbitStep(-1, 0); else if(k.right && !pk.right) rabbitStep(1, 0); }
        pk.up = k.up; pk.down = k.down; pk.left = k.left; pk.right = k.right;
      };
      window.addEventListener("keydown", function(e){
        if(!S.active && S.state !== "prompt") return; var kk = e.key.toLowerCase(), used = true;
        if(S.state === "prompt"){ if(kk === "enter" || kk === "y") startBattle(); else if(kk === "escape" || kk === "n") closePrompt(true); else used = false; }
        else if(S.dlg){ if(kk === " " || kk === "enter") nextDlg(); else used = false; }
        else if(S.state === "player"){ if(kk === "1") doAttack(); else if(kk === "2") doDefend(); else if(kk === "3") doItem(); else if(kk === "4") toggleSkills(); else if(kk === "5") doRetreat(); else if(kk === "q") skillQ(); else if(kk === "w" && e.shiftKey === false && false) skillW(); else if(kk === " " || kk === "enter") endPlayerTurn(); else if(kk === "e") skillE(); else used = false; if(kk === "w"){ skillW(); used = true; } }
        else used = (kk === "e" || kk === "m" || kk === "c" || kk === " ");
        if(used){ e.stopImmediatePropagation(); e.preventDefault(); }
      }, true);
      function lerpTo(u, dt, sp){ u.x += (wx(u.gx) - u.x)*Math.min(1, dt*sp); u.z += (wz(u.gz) - u.z)*Math.min(1, dt*sp); }
      window.tbTick = function(t, dt, p){ try{ tbTick0(t, dt, p); }catch(err){ window.__tbErr = String(err && err.stack || err).slice(0, 600); if(window.console) console.warn("턴제 전투 오류:", err); } };
      function tbTick0(t, dt, p){
        if(!window.__riverBuilt || typeof state === "undefined" || !state.charId) return; if(!built){ if(memorialCleared()){ built = true; S.state = "won"; return; } if(p.z > 1500 && p.z < 2400 && Math.abs(p.x) < 400) buildAll(); else return; }
        if(S.state === "won" && !S.winT && S.winT !== 0){ return; }
        var far = Math.hypot(p.x, p.z - Z0) > 520; if(G) G.visible = !far && S.state !== "won2";
        if(!G || !G.visible) return;
        var i, u, tm = t/1000;
        // 대기 중: 가까이 가면 질문
        if(S.state === "idle"){ S.cool = Math.max(0, S.cool - dt); if(S.cool <= 0 && p.z > Z0 - 100 && p.z < Z0 + 40 && Math.abs(p.x) < 90 && typeof memorialCleared === "function" && !memorialCleared()) openPrompt(); }
        // 토끼 이동 트윈
        if(S.tw){ var w = S.tw; w.t += dt; var f = Math.min(1, w.t/w.dur); f = f*f*(3 - 2*f); w.p.x = w.x0 + (w.x1 - w.x0)*f; w.p.z = w.z0 + (w.z1 - w.z0)*f; if(w.t >= w.dur){ S.tw = null; } }
        // 도입 연출: 북한군 행군 → 루샤 등장 → 대사
        if(S.state === "intro"){ S.march += dt; var fm = Math.min(1, S.march/3.2); nk.forEach(function(n, idx){ n.z = wz(n.gz) - 40*T*(1 - fm) ; n.gz = n.gz; }); if(S.march >= 3.2 && S.intro === 0){ S.intro = 1; nk.forEach(function(n){ n.gz -= 40; delete occ[key(n.gx, n.gz + 40)]; occ[key(n.gx, n.gz)] = n; n.z = wz(n.gz); }); delete occ[key(LUC.gx, LUC.gz)]; LUC.gz -= 40; occ[key(LUC.gx, LUC.gz)] = LUC; lucS.visible = true; auraS.visible = true; lucS.userData.pop = 0; showDlg([["😈 루샤", "네 이 놈! 네놈이 내 유흥을 방해하는구나!"], ["😈 루샤", "저놈들을 없애라!"], ["🎖 국군", "우와아아! 전투 준비!"]], function(){ S.state = "player"; say("— 턴 1 시작 — 방향키로 이동, 행동을 고르세요"); refreshUI(); }); } }
        // 스프라이트 위치/연출
        var all = rok.concat(nk);
        for(i = 0; i < all.length; i++){ u = all[i]; var sp = u.sp; if(S.state === "intro" && u.side === "nk" && S.intro === 0){ sp.position.set(wx(u.gx), 0, u.z + 0); continue; }
          lerpTo(u, dt, 5); var hop = u.hop > 0 ? Math.sin(u.hop/0.25*Math.PI)*1.6 : 0; if(u.hop > 0) u.hop -= dt; var sc = 1; if(u.hit > 0){ u.hit -= dt; sc = 1 + 0.18*Math.sin(u.hit/0.3*Math.PI); }
          if(u.die >= 0){ u.die += dt; sc = Math.max(0, 1 - u.die/0.5); if(u.die > 0.5){ sp.visible = false; u.die = -2; if(u.bar) u.bar.visible = false; } }
          if(u.alive || u.die >= 0){ sp.position.set(u.x, hop, u.z); sp.scale.set(u.w*sc, UH*sc, 1); }
          if(u.bar && u.bar.visible){ u.bar.position.set(u.x, UH + 1.2, u.z); u.bar.scale.set(Math.max(0.2, 5*Math.max(0, u.hp)/HP), 0.55, 1); } }
        // 루샤
        if(lucS){ var lz = wz(LUC.gz), lxw = wx(LUC.gx); if(lucS.userData.x === undefined){ lucS.userData.x = lxw; lucS.userData.z = lz; } lucS.userData.x += (lxw - lucS.userData.x)*Math.min(1, dt*4); lucS.userData.z += (lz - lucS.userData.z)*Math.min(1, dt*4);
          var pop = lucS.userData.pop !== undefined ? Math.min(1, lucS.userData.pop += dt*2) : 1, dsc = lucS.userData.die !== undefined ? Math.max(0, 1 - (lucS.userData.die += dt)/1.2) : 1; lucS.position.set(lucS.userData.x, 0.4 + Math.sin(tm*2.4)*0.5, lucS.userData.z); lucS.scale.set(17*(660/960)*pop*dsc, 17*pop*dsc, 1); auraS.position.set(lucS.userData.x, 0, lucS.userData.z - 0.5); auraS.material.opacity = (0.55 + 0.25*Math.sin(tm*3))*pop*dsc; if(LUC.hp <= 0 && !lucS.userData.die && false){} }
        // 단계 애니메이션
        if(S.anim){ S.anim.t += dt; if(S.anim.t >= S.anim.dur){ var tm2 = S.anim.team; S.anim = null; afterPhase(tm2); } }
        // 이펙트 선/글자
        for(i = 0; i < lines.length; i++){ var l = lines[i]; if(l.visible){ l.userData.t += dt; l.material.opacity = Math.max(0, 1 - l.userData.t/0.35); if(l.userData.t > 0.35) l.visible = false; } }
        for(i = 0; i < texts.length; i++){ var tx = texts[i]; if(tx.visible){ tx.userData.t += dt; tx.position.y = tx.userData.y0 + tx.userData.t*5; tx.material.opacity = Math.max(0, 1 - Math.max(0, tx.userData.t - 0.8)/0.6); if(tx.userData.t > 1.4) tx.visible = false; } }
        // 승리 후 정리
        if(S.winT !== undefined && S.state === "won"){ S.winT += dt; if(S.winT > 5){ G.visible = false; S.state = "won2"; } }
      }
    })();
