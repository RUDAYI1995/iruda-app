p='sky/block_V.js'; s=open(p,encoding='utf-8').read()
a=s.index('        flat("t_weedy", (X0 + X1)/2')
b=s.index('        // ---- 집 (앞/옆/뒤 그림을 네 면에 세우고')
ground='''        // 가장자리가 부드럽게 풀밭으로 이어지는 땅 (알파 마스크)
        var softMask = canvasTex(128, 128, function(g, w, h){ var im = g.createImageData(w, h), x, y; for(y = 0; y < h; y++) for(x = 0; x < w; x++){ var u = Math.min(x, w - 1 - x)/(w*0.5), v = Math.min(y, h - 1 - y)/(h*0.5), a = Math.min(u, v)/0.42; a = Math.max(0, Math.min(1, a)); a = a*a*(3 - 2*a); var k = (y*w + x)*4; im.data[k] = im.data[k + 1] = im.data[k + 2] = Math.round(a*255); im.data[k + 3] = 255; } g.putImageData(im, 0, 0); });
        function soft(tile, cx, cz, w, d, rx, ry, y, po, op){
          var t = vtex(VA.tiles[tile], rx, ry, true), m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, alphaMap:softMask, transparent:true, opacity:op || 1, depthWrite:false, polygonOffset:true, polygonOffsetFactor:po, polygonOffsetUnits:po }));
          m.rotation.x = -Math.PI/2; m.position.set(cx, y, cz); m.userData.keep = true; G.add(m); reg(m, cx, cz, 1300); return m;
        }
        soft("t_weedy", (X0 + X1)/2, (Z0 + Z1)/2, Math.abs(X1 - X0) + 90, Z1 - Z0 + 60, 26, 14, 0.055, -1);
        soft("t_yard", -920, 98, 150, 70, 9, 4, 0.06, -2);                      // 큰 기와집 앞마당
        function dirtRoad(x0, z0, x1, z1, w, tile){
          var vert = Math.abs(x1 - x0) < 0.1, len = vert ? Math.abs(z1 - z0) : Math.abs(x1 - x0), t = vtex(VA.tiles[tile || "t_dirt"], w/30, len/30, true);
          var m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshLambertMaterial({ color:0xffffff, map:t, alphaMap:softMask, transparent:true, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 })); m.rotation.x = -Math.PI/2; m.userData.keep = true;
          var gp = new THREE.Group(); gp.add(m); gp.position.set((x0 + x1)/2, 0.07, (z0 + z1)/2); gp.rotation.y = vert ? 0 : Math.PI/2; gp.userData.keep = true; G.add(gp); reg(gp, (x0 + x1)/2, (z0 + z1)/2, 1300);
        }
        dirtRoad(-626, 45, -1128, 45, 17, "t_dirt");                             // 큰길 (큰길 쪽에서 들어와요)
        dirtRoad(-920, 40, -920, 122, 15, "t_dirt");                             // 큰 기와집으로 가는 길
        dirtRoad(-800, -26, -800, 182, 7, "t_gravel2"); dirtRoad(-1040, -26, -1040, 120, 7, "t_gravel2"); dirtRoad(-1112, -28, -1112, 184, 8, "t_gravel2");
'''
s=s[:a]+ground+s[b:]
# houses: replace HOUSES list + walls + props
h0=s.index('        var HOUSES = [')
h1=s.index('        // ---- 탈것 (E 로 타고 내려요)')
new='''        var rs = 20251, rnd = function(){ rs = (rs*16807) % 2147483647; return rs/2147483647; };
        function overlapsRect(x, z, hx, hz){ for(var i = 0; i < VIL_RECTS.length; i++){ var r = VIL_RECTS[i]; if(Math.abs(x - r.x) < hx + r.hx && Math.abs(z - r.z) < hz + r.hz) return true; } return false; }
        houseFull(HD.M, -920, 152, NR); var YARDITEMS = [["jars", 5.5], ["firewood", 4], ["pumpkin", 3.2], ["line", 11], ["bike", 6], ["table", 6.5], ["cabbage", 4.2], ["lettuce", 4.2], ["jars", 5], ["bush", 4.4]];
        var ROWS = [
          { z:84,  rot:NR, maxD:26, skip:[[-990, -850]] },
          { z:136, rot:NR, maxD:25, skip:[[-972, -868], [-1110, -990]] },
          { z:172, rot:NR, maxD:21, skip:[[-972, -868], [-1110, -990]] },
          { z:19,  rot:SR, maxD:26, skip:[] },
          { z:-15, rot:SR, maxD:20, skip:[] }
        ];
        var KINDS = ["B", "SL", "T1", "T2", "TS", "TM", "TL", "WT", "WB", "WA", "WC", "SL", "T1", "TM", "TL", "B"];
        ROWS.forEach(function(R, ri){
          var cursor = -722, guard = 0;
          while(cursor > -1108 && guard++ < 60){
            var kk = KINDS[Math.floor(rnd()*KINDS.length)], d = HD[kk]; if(d.D > R.maxD){ continue; }
            var W = d.W*(0.96 + rnd()*0.1), x = cursor - W/2, skipped = false;
            for(var si = 0; si < R.skip.length; si++){ var sk = R.skip[si]; if(x + W/2 > sk[0] && x - W/2 < sk[1]){ cursor = sk[0] - 4; skipped = true; break; } }
            if(skipped) continue;
            if(x - W/2 < -1110) break;
            var horiz = true, hx = W*0.46, hz = d.D*0.46;
            if(overlapsRect(x, R.z, hx + 1, hz + 1)){ cursor -= 8; continue; }
            var dd = {}; for(var kq in d) dd[kq] = d[kq]; dd.W = W; houseFull(dd, x, R.z, R.rot);
            var fz = R.rot === NR ? -1 : 1, nIt = 1 + Math.floor(rnd()*2.2);
            for(var q = 0; q < nIt; q++){
              var yi = YARDITEMS[Math.floor(rnd()*YARDITEMS.length)], yx = x + (rnd() - 0.5)*W*0.9, yz = R.z + fz*(d.D/2 + 4.5 + rnd()*4);
              if(overlapsRect(yx, yz, 4, 4)) continue;
              if(yi[0] === "bike") card("y_bicycle", yx, yz, yi[1]); else if(yi[0] === "bush") card(rnd() < 0.5 ? "p_bush0" : "p_bush1", yx, yz, yi[1]);
              else if(yi[0] === "cabbage") card("q_cabbage", yx, yz, yi[1]); else if(yi[0] === "lettuce") card("q_lettuce", yx, yz, yi[1]);
              else card({ jars:"y_jars", firewood:"y_firewood", pumpkin:"y_pumpkin", line:"q_line", table:"q_table" }[yi[0]], yx, yz, yi[1]);
            }
            cursor -= W + 4 + rnd()*7;
          }
        });
        // ---- 큰 기와집 마당: 길 양옆 텃밭과 터널 하우스 ----
        [-1005, -1030, -1055, -1080, -1100].forEach(function(gx, gi){ [128, 140, 152, 164, 176].forEach(function(gz, zi){ var kk = ["q_cabbage", "q_lettuce", "q_pepper", "q_onion"][(gi + zi) % 4]; if(!overlapsRect(gx, gz, 4, 4) && !(gi === 2 && zi > 2)) card(kk, gx + (rnd() - 0.5)*3, gz + (rnd() - 0.5)*3, kk === "q_onion" ? 6 : (kk === "q_pepper" ? 5 : 4.2)); }); });
        card("q_tunnel", -1070, 130, 10); card("q_tunnel", -1070, 168, 10);
        // ---- 마당 소품 ----
        function put(key, x, z, h, ry){ card(key, x, z, h); }
        [-700, -790, -880, -1000, -1090].forEach(function(px){ put("q_pole", px, 56, 31); VIL_RECTS.push({ x:px, z:56, hx:1.2, hz:1.2 }); });
        put("q_table", -945, 108, 7); put("q_table", -895, 112, 7); put("q_dish", -990, 8, 5);
        ["persimmon", "apple", "persimmon", "apple"].forEach(function(k, i){ var tx = -715 - i*34, tz = 190; if(!overlapsRect(tx, tz, 4, 4)) put(k, tx, tz, 22 + (i % 3)*2); });
        buildBigTree(-985, 112, 1.25); VIL_RECTS.push({ x:-985, z:112, hx:5, hz:5 }); buildBigTree(-856, 118, 1.1); VIL_RECTS.push({ x:-856, z:118, hx:5, hz:5 });
        ["p_bush0", "p_bush1", "p_cosmos", "y_wild", "p_bush2"].forEach(function(k, i){ for(var q = 0; q < 8; q++){ var bx = -724 - ((i*61 + q*47) % 380), bz = (q % 2 ? 36 : 56) + ((i*13 + q*7) % 5); if(!overlapsRect(bx, bz, 3, 3)) put(k, bx, bz, 3.6 + (q % 3)*0.6); } });
'''
s=s[:h0]+new+s[h1:]
open(p,'w',encoding='utf-8').write(s)
