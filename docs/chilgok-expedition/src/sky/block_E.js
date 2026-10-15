  // ================= 하늘섬 (Sky Islands) — 기존 맵 동쪽 끝(화면 왼쪽 끝) 너머에 이어 붙인 확장 구역 =================
  // 기존 월드(x ≤ 620)의 지형·건물·길은 하나도 건드리지 않고, 전부 별도 그룹(sky)에 담아
  // x > 620 쪽 허허벌판에만 놓아요. 바닥 높이/이동 제한은 파일 위쪽의 SKY 관련 함수가 맡아요.
  (function buildSkyZone(){
    var H = SKY.H, GZ = SKY.gateZ, PX = SKY.pathX, HW = SKY.pathHalf;
    var SEA_Y = H - 50, SEA_TILE = 500;
    var sky = new THREE.Group();
    sky.name = "skyZone";
    scene.add(sky);

    var seed = 977;
    function rnd(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
    function hash3(x, y, z){
      var s = Math.sin(Math.round(x*50)*12.9898 + Math.round(y*50)*78.233 + Math.round(z*50)*37.719) * 43758.5453;
      return s - Math.floor(s);
    }
    var bobbers = [], spinners = [], pulsers = [], facers = [];
    var art = window.SKYART || null;                         // 받은 그림들 (skyart.js) — 없으면 도형만으로 동작
    var fogBase = scene.fog ? scene.fog.color.clone() : null;
    var fogNear0 = scene.fog ? scene.fog.near : 0, fogFar0 = scene.fog ? scene.fog.far : 0;
    var hazeCol = (art && art.sky && art.sky.haze) ? new THREE.Color(art.sky.haze[0]/255, art.sky.haze[1]/255, art.sky.haze[2]/255) : null;
    var lastFogF = -1;

    // ---------- 캔버스로 그리는 텍스처 (외부 이미지 없이) ----------
    function canvasTex(w, h, draw){
      var c = document.createElement("canvas"); c.width = w; c.height = h;
      draw(c.getContext("2d"), w, h);
      var t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }
    // 기존 맵 땅(x ±650, 풀밭 사진)과 같은 재질·같은 무늬 간격으로 옆에 이어 붙이는 땅 (경계선이 안 보이게)
    function extGround(x0, x1, offU){
      var src = window.TEXTURES && window.TEXTURES.grass, GZ0 = PATH_MIN_Z - 40, GZ1 = PATH_MAX_Z + 40, groundLen = PATH_MAX_Z - PATH_MIN_Z + 80;
      var m = { flatShading:true, roughness:0.85, metalness:0.05, color:0x8fbf6b };
      if(src){
        var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = src;
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((x1 - x0)*77/1300, groundLen/12); t.offset.set(offU, 0);
        if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.color = 0xffffff;
      }
      var g = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, groundLen), new THREE.MeshStandardMaterial(m));
      g.rotation.x = -Math.PI/2; g.position.set((x0 + x1)/2, 0, (PATH_MIN_Z + PATH_MAX_Z)/2); g.receiveShadow = true; return g;
    }
    function extGround2(x0, x1, z0, z1, offU){
      var src = window.TEXTURES && window.TEXTURES.grass, m = { flatShading:true, roughness:0.85, metalness:0.05, color:0x8fbf6b };
      if(src){
        var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = src;
        t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((x1 - x0)*77/1300, (z1 - z0)/12); t.offset.set(offU, 0);
        if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.color = 0xffffff;
      }
      var g = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial(m));
      g.rotation.x = -Math.PI/2; g.position.set((x0 + x1)/2, 0, (z0 + z1)/2); g.receiveShadow = true; return g;
    }
    var matCache = {};
    function sm(color){ return matCache[color] || (matCache[color] = mat(color)); }
    function glowMat(color, k){
      return new THREE.MeshStandardMaterial({ color:color, emissive:color, emissiveIntensity:(k||0.9), flatShading:true, roughness:0.35, metalness:0.1 });
    }

    // 테라코타 벽돌 (하늘길)
    var brickBase = canvasTex(256, 256, function(g, w, h){
      g.fillStyle = "#8a4a3b"; g.fillRect(0, 0, w, h);
      var rows = 8, cols = 4, bh = h/rows, bw = w/cols;
      var tones = ["#c27560", "#b96a52", "#c98664", "#ae614c", "#cf8e6e"];
      for(var r = 0; r < rows; r++){
        for(var c = -1; c <= cols; c++){
          var x = c*bw + (r%2 ? bw/2 : 0), y = r*bh;
          g.fillStyle = tones[(r*7 + c*3 + 10) % tones.length];
          g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
          g.fillStyle = "rgba(255,236,214,0.20)"; g.fillRect(x + 2, y + 2, bw - 4, 3);
        }
      }
    });
    function brickMat(repX, repY){
      var t = brickBase.clone(); t.needsUpdate = true; t.repeat.set(repX, repY);
      var m = mat(0xffffff, { map:t });
      m.side = THREE.DoubleSide;
      m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2;
      return m;
    }

    // 구름바다용 타일 텍스처
    var cloudTex = canvasTex(512, 512, function(g, w, h){
      g.clearRect(0, 0, w, h);
      g.fillStyle = "rgba(232,240,255,0.80)"; g.fillRect(0, 0, w, h);
      function blob(x, y, r, a, col){
        for(var ox = -1; ox <= 1; ox++){
          for(var oy = -1; oy <= 1; oy++){
            var cx = x + ox*w, cy = y + oy*h;
            var gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
            gr.addColorStop(0, "rgba(" + col + "," + a + ")");
            gr.addColorStop(1, "rgba(" + col + ",0)");
            g.fillStyle = gr; g.fillRect(cx - r, cy - r, r*2, r*2);
          }
        }
      }
      var i;
      for(i = 0; i < 80; i++) blob(rnd()*w, rnd()*h, 40 + rnd()*70, 0.40, "196,212,240");
      for(i = 0; i < 160; i++) blob(rnd()*w, rnd()*h, 26 + rnd()*58, 0.55, "255,255,255");
    });
    var SEA_TW = SEA_TILE, SEA_TH = SEA_TILE;                 // 구름 한 장이 덮는 월드 크기
    if(art && art.cloud){                                      // 제미나이 구름 그림 (이어 붙여도 티 안 나게 가공된 타일)
      SEA_TW = 1500; SEA_TH = 750;
      var cImg = new Image();
      cloudTex = new THREE.Texture(cImg);
      cImg.onload = function(){ cloudTex.needsUpdate = true; };
      cImg.src = art.cloud.src;
      cloudTex.wrapS = cloudTex.wrapT = THREE.RepeatWrapping;
      cloudTex.anisotropy = renderer.capabilities.getMaxAnisotropy ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 1;
    }
    cloudTex.repeat.set(7000/SEA_TW, 7000/SEA_TH);

    // 폭포 물줄기
    var fallTex = canvasTex(64, 256, function(g, w, h){
      g.clearRect(0, 0, w, h);
      for(var i = 0; i < 16; i++){
        var x = rnd()*w, ww = 2 + rnd()*6;
        var gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, "rgba(255,255,255,0.95)");
        gr.addColorStop(0.5, "rgba(205,238,255,0.70)");
        gr.addColorStop(1, "rgba(190,228,255,0.18)");
        g.fillStyle = gr; g.fillRect(x, 0, ww, h);
      }
    });
    var fallMat = new THREE.MeshBasicMaterial({ map:fallTex, transparent:true, opacity:0.85, side:THREE.DoubleSide, depthWrite:false, color:0xe9f8ff });
    var fallLipMat = new THREE.MeshBasicMaterial({ color:0xa9e3ff, transparent:true, opacity:0.8, side:THREE.DoubleSide, depthWrite:false });

    // 관문 포털의 빛
    var portalTex = canvasTex(256, 512, function(g, w, h){
      g.clearRect(0, 0, w, h);
      var baseY = h, spring = h - h*22/40;                              // 아치 모양: 아래 22 높이 + 반지름 10 의 반원 (세로 40 기준)
      g.beginPath();
      g.moveTo(0, baseY); g.lineTo(0, spring);
      g.arc(w/2, spring, w/2, Math.PI, 0, false);
      g.lineTo(w, baseY); g.closePath();
      var gr = g.createRadialGradient(w/2, h*0.62, 6, w/2, h*0.62, h*0.62);
      gr.addColorStop(0.00, "rgba(255,255,255,0.95)");
      gr.addColorStop(0.35, "rgba(255,190,245,0.80)");
      gr.addColorStop(0.75, "rgba(130,235,255,0.55)");
      gr.addColorStop(1.00, "rgba(110,200,255,0.35)");
      g.fillStyle = gr; g.fill();
      g.globalCompositeOperation = "lighter";
      for(var i = 0; i < 9; i++){
        var x = 18 + (w - 36)*(i/8), lg = g.createLinearGradient(0, h, 0, 0);
        lg.addColorStop(0, "rgba(255,255,255,0.0)"); lg.addColorStop(0.5, "rgba(255,255,255,0.18)"); lg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = lg; g.fillRect(x - 2, 0, 4, h);
      }
    });

    // ---------- 하늘 돔 + 구름바다 (하늘섬에 올라섰을 때만 보여요) ----------
    var domeTex = canvasTex(8, 256, function(g, w, h){
      var gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0.00, "#3236c0");
      gr.addColorStop(0.20, "#4558dc");
      gr.addColorStop(0.32, "#5e82ee");
      gr.addColorStop(0.42, "#9cc0fb");
      gr.addColorStop(0.50, "#d4e7ff");
      gr.addColorStop(1.00, "#e8f1fd");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    domeTex.wrapS = domeTex.wrapT = THREE.ClampToEdgeWrapping;
    var dome = new THREE.Mesh(
      new THREE.SphereGeometry(2600, 24, 16),
      new THREE.MeshBasicMaterial({ map:domeTex, side:THREE.BackSide, transparent:true, opacity:0, depthWrite:false, fog:false, toneMapped:false })
    );
    dome.name = "skyDome"; dome.renderOrder = -100; dome.frustumCulled = false; dome.visible = false;
    scene.add(dome);
    if(art && art.sky){
      var skyImg = new Image();
      skyImg.onload = function(){
        var cw = 2048, ch = 1024, cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
        var g = cv.getContext("2d");
        // 그림이 덮는 고도: 위 +32° ~ 아래 -20° (지평선 안개가 고도 0° 에 오도록)
        var yTop = Math.round((90 - 32)/180*ch), yBot = Math.round((90 + 20)/180*ch), tw = cw/4, th = yBot - yTop;
        for(var k = 0; k < 4; k++){
          g.save();
          if(k % 2){ g.translate((k + 1)*tw, 0); g.scale(-1, 1); } else { g.translate(k*tw, 0); }
          g.drawImage(skyImg, 0, yTop, tw, th);
          g.drawImage(skyImg, 0, 0, skyImg.width, 1, 0, 0, tw, yTop);                                  // 맨 윗줄을 위로 늘려 천정까지
          g.drawImage(skyImg, 0, skyImg.height - 1, skyImg.width, 1, 0, yBot, tw, ch - yBot);           // 맨 아랫줄을 아래로 늘려 지평선 아래까지
          g.restore();
        }
        var zg = g.createLinearGradient(0, 0, 0, yTop); zg.addColorStop(0, "rgba(8,12,56,0.5)"); zg.addColorStop(1, "rgba(8,12,56,0)");
        g.fillStyle = zg; g.fillRect(0, 0, cw, yTop);
        var nt = new THREE.CanvasTexture(cv);
        nt.wrapS = THREE.RepeatWrapping; nt.wrapT = THREE.ClampToEdgeWrapping;
        dome.material.map = nt; dome.material.needsUpdate = true;
      };
      skyImg.src = art.sky.src;
    }

    var sea = new THREE.Mesh(
      new THREE.PlaneGeometry(7000, 7000),
      new THREE.MeshBasicMaterial({ map:cloudTex, transparent:true, opacity:0, depthWrite:true, fog:false, toneMapped:false })
    );
    sea.name = "skySea"; sea.rotation.x = -Math.PI/2; sea.renderOrder = -5; sea.frustumCulled = false; sea.visible = false;
    scene.add(sea);

    // 구름 덩어리 (바다 위로 봉긋 솟은 부분)
    (function puffs(){
      var N = (art && art.cloud) ? 110 : 280;
      var im = new THREE.InstancedMesh(
        new THREE.SphereGeometry(1, 10, 8),
        new THREE.MeshLambertMaterial({ color:0xffffff, emissive:0xe6eeff, emissiveIntensity:0.9 }),
        N
      );
      var d = new THREE.Object3D();
      for(var i = 0; i < N; i++){
        var r = 12 + rnd()*26;
        d.position.set(700 + rnd()*720, SEA_Y - 6 + rnd()*12, GZ - 300 + rnd()*1350);
        d.scale.set(r*(1 + rnd()*0.6), r*(0.34 + rnd()*0.18), r*(1 + rnd()*0.6));
        d.rotation.y = rnd()*6.28;
        d.updateMatrix();
        im.setMatrixAt(i, d.matrix);
      }
      im.frustumCulled = false;
      sky.add(im);
    })();

    // ---------- 떠 있는 섬 ----------
    function jitterGeo(geo, r){
      var pos = geo.attributes.position;
      for(var i = 0; i < pos.count; i++){
        var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        if(y > -0.3) continue;                                       // 윗면(걷는 면)은 평평하게
        var depth = Math.min(1, Math.max(0, (-y - 2.8) / (r*0.5)));  // 아래로 갈수록 더 울퉁불퉁
        var aR = 0.035 + 0.09*depth, aY = 0.05*r*depth;
        var h1 = hash3(x, y, z), h2 = hash3(z, y, x);
        if(Math.hypot(x, z) > 0.001){ var k = 1 + (h1 - 0.5)*2*aR; x *= k; z *= k; }
        y += (h2 - 0.5)*2*aY;
        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();
    }
    function V(x, y){ return new THREE.Vector2(x, y); }
    function makeIsland(r, o){
      var g = new THREE.Group();
      var capGeo = new THREE.LatheGeometry([ V(0,0), V(r*0.985,0), V(r,-0.6), V(r*0.99,-2.8), V(0,-2.8) ], 16);
      jitterGeo(capGeo, r);
      var capMat = mat(o.grass || 0x7cc35c); capMat.side = THREE.DoubleSide;
      var cap = new THREE.Mesh(capGeo, capMat); cap.receiveShadow = true; g.add(cap);
      var rockGeo = new THREE.LatheGeometry([
        V(r*0.99,-2.8), V(r*0.94,-r*0.14), V(r*0.80,-r*0.36), V(r*0.60,-r*0.60),
        V(r*0.38,-r*0.86), V(r*0.16,-r*1.10), V(0,-r*1.24)
      ], 16);
      jitterGeo(rockGeo, r);
      var rockMat = mat(o.rock || 0x8b6f5c); rockMat.side = THREE.DoubleSide;
      var rock = new THREE.Mesh(rockGeo, rockMat); rock.receiveShadow = true; g.add(rock);
      return g;
    }

    // 나무: 섬 하나당 색깔별로 합쳐서 그려요 (그리기 횟수를 줄이려고)
    var trunkGeo = new THREE.CylinderGeometry(0.45, 0.7, 3, 5);
    var blobGeo = new THREE.IcosahedronGeometry(2.4, 0);
    var coneGeo = new THREE.ConeGeometry(2.3, 6, 6);
    var TREE_COLORS = [0x74c25c, 0x58b36e, 0x49ad9f, 0xe676a2, 0xf2a3c0, 0x9ad65f, 0xf0c455, 0x5fbf86];
    var _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
    function mtx(px, py, pz, ry, sx, sy, sz){
      _e.set(0, ry, 0); _q.setFromEuler(_e);
      return new THREE.Matrix4().compose(_p.set(px, py, pz), _q, _s.set(sx, sy, sz));
    }
    function addPart(batch, geo, color, tree, lx, ly, lz, sx, sy, sz){
      var g2 = geo.index ? geo.toNonIndexed() : geo.clone();
      g2.applyMatrix4(tree.clone().multiply(mtx(lx, ly, lz, 0, sx, sy, sz)));
      (batch[color] = batch[color] || []).push(g2.attributes.position.array);
    }
    function addTree(batch, x, z){
      var s = 0.8 + rnd()*0.9, ry = rnd()*6.28;
      var T = mtx(x, 0, z, ry, s, s, s);
      var col = TREE_COLORS[Math.floor(rnd()*TREE_COLORS.length)];
      addPart(batch, trunkGeo, 0x8a5a44, T, 0, 1.5, 0, 1, 1, 1);
      if(rnd() < 0.3){
        for(var i = 0; i < 3; i++) addPart(batch, coneGeo, col, T, 0, 4 + i*1.9, 0, 1 - i*0.26, 1, 1 - i*0.26);
      } else {
        addPart(batch, blobGeo, col, T, 0, 4.4, 0, 1.05, 1.0, 1.05);
        addPart(batch, blobGeo, col, T, 0.5, 6.6, -0.3, 0.66, 0.66, 0.66);
      }
    }
    function flushTrees(g, batch, cast){
      Object.keys(batch).forEach(function(color){
        var arrs = batch[color], total = 0, i;
        for(i = 0; i < arrs.length; i++) total += arrs[i].length;
        var merged = new Float32Array(total), off = 0;
        for(i = 0; i < arrs.length; i++){ merged.set(arrs[i], off); off += arrs[i].length; }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(merged, 3));
        geo.computeVertexNormals();
        var m = new THREE.Mesh(geo, sm(+color));
        m.castShadow = !!cast; m.receiveShadow = true;
        g.add(m);
      });
    }
    var treeSways = [], treeTexCache = {};
    function treeTex(list, i){ var k = list === art.trees ? "t" + i : (list === art.bushes ? "b" + i : "s" + i); return treeTexCache[k] || (treeTexCache[k] = artTex(list[i])); }
    function spriteAt(g, list, i, lx, lz, h, withSway){       // 카메라를 향해 서 있는 나무/덤불 그림 (뿌리가 땅에 닿게)
      var e = list[i], w = h*e.w/e.h;
      var piv = new THREE.Group(), face = new THREE.Group();
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map:treeTex(list, i), transparent:true, alphaTest:0.35, side:THREE.DoubleSide }));
      m.position.y = h/2; piv.add(m); face.add(piv); face.position.set(lx, 0.1, lz); g.add(face);
      facers.push(face);
      if(withSway) treeSways.push({ p:piv, ph:rnd()*6.28, k:0.7 + rnd()*0.6 });
      return w;
    }
    function scatterSprites(g, n, r, avoid){
      var tries = 0, placed = 0, shMap = art.shadows && art.shadows.length ? treeTex(art.shadows, 0) : null;
      while(placed < n && tries < n*14){
        tries++;
        var a = rnd()*Math.PI*2, d = Math.sqrt(rnd())*(r - 6), lx = Math.cos(a)*d, lz = Math.sin(a)*d;
        if(avoid && avoid(lx, lz)) continue;
        var h = 11 + rnd()*10, ti = Math.floor(rnd()*art.trees.length);
        if(art.trees[ti].h > 0 && ti === 5) h *= 0.9;
        var w = spriteAt(g, art.trees, ti, lx, lz, h, true);
        if(shMap){ var sh = new THREE.Mesh(new THREE.PlaneGeometry(w*0.85, w*0.5), new THREE.MeshBasicMaterial({ map:treeTex(art.shadows, placed % art.shadows.length), transparent:true, opacity:0.4, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-3, polygonOffsetUnits:-3 }));
          sh.rotation.x = -Math.PI/2; sh.position.set(lx + 1.2, 0.09, lz + 0.8); g.add(sh); }
        placed++;
        if(art.bushes && art.bushes.length && rnd() < 0.8){                          // 나무 곁에 풀 덤불
          var bb = Math.floor(rnd()*art.bushes.length), ba = rnd()*6.28, bd = w*(0.25 + rnd()*0.3);
          spriteAt(g, art.bushes, bb, lx + Math.cos(ba)*bd, lz + Math.sin(ba)*bd, 2.6 + rnd()*2.4, false);
        }
      }
    }
    function scatterTrees(g, n, r, avoid, cast){
      if(art && art.trees && art.trees.length){ scatterSprites(g, Math.max(3, Math.round(n*0.7)), r, avoid); return; }
      var batch = {}, tries = 0, placed = 0;
      while(placed < n && tries < n*14){
        tries++;
        var a = rnd()*Math.PI*2, d = Math.sqrt(rnd())*(r - 6);
        var lx = Math.cos(a)*d, lz = Math.sin(a)*d;
        if(avoid && avoid(lx, lz)) continue;
        addTree(batch, lx, lz); placed++;
      }
      flushTrees(g, batch, cast);
    }

    function addFall(g, r, L){
      var a = rnd()*Math.PI*2, wdt = 3 + rnd()*2.4;
      var pivot = new THREE.Object3D();
      pivot.position.set(Math.cos(a)*(r - 0.6), 0, Math.sin(a)*(r - 0.6));
      pivot.rotation.y = Math.atan2(Math.cos(a), Math.sin(a));       // 로컬 +z 가 섬 바깥쪽
      var geo = new THREE.PlaneGeometry(wdt, L); geo.translate(0, -L/2, 0);
      pivot.add(new THREE.Mesh(geo, fallMat));
      var lg = new THREE.PlaneGeometry(wdt, 9); lg.translate(0, 4.5, 0);
      var lip = new THREE.Mesh(lg, fallLipMat); lip.rotation.x = -Math.PI/2; lip.position.y = 0.1;
      pivot.add(lip);
      g.add(pivot);
    }

    function addIsland(cx, cy, cz, r, o){
      o = o || {};
      var g = makeIsland(r, o);
      g.position.set(cx, cy, cz);
      sky.add(g);
      if(o.bob !== false) bobbers.push({ g:g, y:cy, ph:rnd()*6.28, amp:0.7 + rnd()*0.8 });
      if(o.trees) scatterTrees(g, o.trees, r, o.avoid, o.cast);
      for(var i = 0; i < (o.fall || 0); i++) addFall(g, r, Math.max(12, cy - SEA_Y + 8));
      return g;
    }

    // ---------- 벽돌 하늘길 ----------
    var spireGeo = new THREE.ConeGeometry(4.2, 20, 6);
    function spire(x, topY, z, s){
      var m = new THREE.Mesh(spireGeo, sm(0x86705f));
      m.rotation.x = Math.PI; m.scale.set(s, s, s); m.position.set(x, topY - 10*s, z);
      sky.add(m);
    }
    function brickPath(x, z0, z1){                     // z0 → z1 로 뻗은 직선 하늘길
      var L = z1 - z0, w = 14;
      var m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, L), brickMat(1, L/14));
      m.position.set(x, H + 0.04 - 0.8, (z0 + z1)/2);
      m.castShadow = true; m.receiveShadow = true;
      sky.add(m);
      for(var z = z0 + 18; z < z1 - 10; z += 46) spire(x, H - 1.6, z, 0.9 + rnd()*0.5);
    }

    // ---------- 오르막 (기존 맵 동쪽 끝 → 하늘섬) ----------
    (function ramp(){
      var xs = [], x;
      for(x = SKY.edgeX; x <= SKY.rampEndX + 25; x += 5) xs.push(x);
      var halfW = 7, thick = 1.8, z0 = GZ;
      var pos = [], uv = [], idx = [], acc = 0, i;
      for(i = 0; i < xs.length; i++){
        var hx = skyRampHeight(xs[i]), y = hx + 0.04;
        if(i > 0) acc += Math.hypot(xs[i] - xs[i-1], hx - skyRampHeight(xs[i-1]));
        pos.push(xs[i], y, z0 - halfW,  xs[i], y, z0 + halfW,  xs[i], y - thick, z0 - halfW,  xs[i], y - thick, z0 + halfW);
        uv.push(0, acc/14,  1, acc/14,  0, acc/14,  1, acc/14);
      }
      for(i = 0; i < xs.length - 1; i++){
        var a = i*4, b = (i + 1)*4;
        idx.push(a, a+1, b,  a+1, b+1, b);          // 윗면
        idx.push(a, b, a+2,  b, b+2, a+2);          // 왼쪽 옆면
        idx.push(a+1, a+3, b+1,  b+1, a+3, b+3);    // 오른쪽 옆면
        idx.push(a+2, b+2, a+3,  a+3, b+2, b+3);    // 아랫면
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      var m = new THREE.Mesh(geo, brickMat(1, 1));
      m.castShadow = true; m.receiveShadow = true;
      sky.add(m);
      // 오르막을 받치는 돌기둥
      for(x = SKY.edgeX + 70; x < SKY.rampEndX; x += 52){
        var top = skyRampHeight(x) - thick, ph = top + 0.6;
        if(ph < 3) continue;
        var pil = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.6, ph, 8), sm(0xc9b9b0));
        pil.position.set(x, -0.6 + ph/2, z0); pil.castShadow = true; pil.receiveShadow = true; sky.add(pil);
        var cp = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 7), sm(0xa99a98));
        cp.position.set(x, top - 0.1, z0); sky.add(cp);
      }
    })();

    // ---------- 아치 / 아치 문 ----------
    function archRing(cx, y0, R, th, depth, color){          // 반원 아치 고리 (z 방향 두께 = depth)
      var sh = new THREE.Shape();
      sh.absarc(0, 0, R + th, 0, Math.PI, false);
      sh.lineTo(-R, 0);
      sh.absarc(0, 0, R, Math.PI, 0, true);
      sh.lineTo(R + th, 0);
      var geo = new THREE.ExtrudeGeometry(sh, { depth:depth, bevelEnabled:false, curveSegments:14 });
      var m = new THREE.Mesh(geo, sm(color));
      m.position.set(cx, y0, -depth/2);
      m.castShadow = true; m.receiveShadow = true;
      return m;
    }
    function crystal(parent, x, y, z, r, color){
      var m = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), glowMat(color, 0.95));
      m.scale.y = 1.5; m.position.set(x, y, z);
      parent.add(m);
      spinners.push({ m:m, y:y, ph:rnd()*6.28 });
      return m;
    }
    function buildGate(gx, gy, gz){
      var G = new THREE.Group(); G.position.set(gx, gy, gz); sky.add(G);
      var STONE = 0xcdbcc6, TRIM = 0xaa9aa8;
      function pillar(x, w, h){
        var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 5.2), sm(STONE));
        m.position.set(x, h/2, 0); m.castShadow = true; m.receiveShadow = true; G.add(m);
        var cp = new THREE.Mesh(new THREE.BoxGeometry(w + 1.2, 1.2, 6.2), sm(TRIM));
        cp.position.set(x, h + 0.6, 0); G.add(cp);
      }
      function ring(cx, y0, R, th){ G.add(archRing(cx, y0, R, th, 5.2, STONE)); }
      // 가운데 큰 아치
      pillar(-12.5, 5, 22); pillar(12.5, 5, 22);
      ring(0, 22.6, 10, 3.5);
      // 양옆으로 점점 작아지는 아치 (왼쪽/오른쪽)
      [-1, 1].forEach(function(sd){
        pillar(sd*31, 4, 15);        ring(sd*22, 15.6, 7, 3);
        pillar(sd*44.7, 3.4, 9);     ring(sd*38, 9.6, 5, 2.6);
        crystal(G, sd*31, 19.5, 0, 1.3, sd < 0 ? 0xff8fe0 : 0x66f2ff);
        crystal(G, sd*44.7, 12.5, 0, 1.0, sd < 0 ? 0x66f2ff : 0xff8fe0);
        crystal(G, sd*12.5, 27.5, 0, 2.0, 0x66f2ff);
      });
      crystal(G, 0, 40.5, 0, 2.2, 0xffe08a);
      // 포털의 빛
      var portal = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 40),
        new THREE.MeshBasicMaterial({ map:portalTex, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.DoubleSide, fog:false, opacity:0.9 })
      );
      portal.position.set(0, 20, 0); G.add(portal);
      pulsers.push({ mat:portal.material, base:0.74, amp:0.18 });
      // 바닥에 번지는 빛
      var glow = new THREE.Mesh(
        new THREE.CircleGeometry(15, 28),
        new THREE.MeshBasicMaterial({ color:0xff9ee8, transparent:true, opacity:0.28, depthWrite:false, fog:false })
      );
      glow.rotation.x = -Math.PI/2; glow.position.set(0, 0.12, -8); G.add(glow);
      return G;
    }

    // ---------- 오벨리스크 ----------
    function buildObelisk(ox, oy, oz){
      var G = new THREE.Group(); G.position.set(ox, oy, oz); sky.add(G);
      var b1 = new THREE.Mesh(new THREE.BoxGeometry(16, 3, 16), sm(0xb6a9b8)); b1.position.y = 1.5; G.add(b1);
      var b2 = new THREE.Mesh(new THREE.BoxGeometry(11, 2, 11), sm(0xc6b9c8)); b2.position.y = 4; G.add(b2);
      if(art && art.obelisk){                               // 제미나이 오벨리스크 그림 (카메라를 향해 도는 카드)
        var OH = 80, OW = OH * art.obelisk.w / art.obelisk.h;
        var om = new THREE.Mesh(new THREE.PlaneGeometry(OW, OH),
          new THREE.MeshBasicMaterial({ map:artTex(art.obelisk), transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
        om.position.y = 5 + OH/2 - 0.5; G.add(om); facers.push(om);
        return G;
      }
      var ob = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 4.4, 72, 4), sm(0x9d93a8));
      ob.rotation.y = Math.PI/4; ob.position.y = 5 + 36; ob.castShadow = true; ob.receiveShadow = true; G.add(ob);
      var tip = new THREE.Mesh(new THREE.ConeGeometry(2.3, 6, 4), glowMat(0xffd36b, 0.8));
      tip.rotation.y = Math.PI/4; tip.position.y = 5 + 72 + 3; G.add(tip);
      pulsers.push({ mat:tip.material, base:0.8, amp:0.35, emissive:true });
      return G;
    }

    // ---------- 수도교 (아치가 이어진 옛 다리) ----------
    function aqueduct(x0, x1, z, springY, spans, endBottomY){
      var G = new THREE.Group(); G.position.set(0, 0, z); sky.add(G);
      if(art && art.aqueduct){                              // 제미나이 수도교 그림을 이어 붙여요 (정면을 향한 고정 카드)
        var AL = x1 - x0, an = Math.max(1, Math.round(AL/300)), aw = AL/an, ah = aw * art.aqueduct.h / art.aqueduct.w;
        var aTex = artTex(art.aqueduct);
        for(var ai = 0; ai < an; ai++){
          var am = new THREE.Mesh(new THREE.PlaneGeometry(aw + 0.6, ah),
            new THREE.MeshBasicMaterial({ map:aTex, transparent:true, alphaTest:0.4, side:THREE.DoubleSide }));
          am.position.set(x0 + (ai + 0.5)*aw, endBottomY + ah/2 - 1, 0); G.add(am);
        }
        return G;
      }
      var L = x1 - x0, s = L/spans, R = s/2 - 1.6, th = 1.8;
      var deckY = springY + R + th + 2.2;
      var bottomY = SEA_Y - 20, STONE = 0xcdbfb2;
      for(var i = 0; i <= spans; i++){
        var bot = (i === 0 || i === spans) ? endBottomY : bottomY;
        var top = deckY - 2.2, ph = top - bot;
        var pier = new THREE.Mesh(new THREE.BoxGeometry(3.2, ph, 4.6), sm(STONE));
        pier.position.set(x0 + i*s, bot + ph/2, 0); pier.castShadow = true; pier.receiveShadow = true; G.add(pier);
        if(i < spans) G.add(archRing(x0 + (i + 0.5)*s, springY, R, th, 4.6, STONE));
      }
      var deck = new THREE.Mesh(new THREE.BoxGeometry(L + 3.2, 2.2, 5.4), sm(0xb9ab9f));
      deck.position.set((x0 + x1)/2, deckY - 1.1, 0); deck.castShadow = true; G.add(deck);
      [-1, 1].forEach(function(sd){
        var wall = new THREE.Mesh(new THREE.BoxGeometry(L + 3.2, 1.3, 0.8), sm(0xc9bbae));
        wall.position.set((x0 + x1)/2, deckY + 0.65, sd*2.3); G.add(wall);
      });
      var water = new THREE.Mesh(new THREE.BoxGeometry(L, 0.4, 3.2), new THREE.MeshBasicMaterial({ color:0x9fe0ff, transparent:true, opacity:0.85 }));
      water.position.set((x0 + x1)/2, deckY + 0.2, 0); G.add(water);
      return G;
    }

    // ---------- 폐허 기둥 (맨 뒤쪽 큰 섬) ----------
    function ruins(parent, rx, rz){
      var colGeo = new THREE.CylinderGeometry(1.3, 1.5, 15, 8);
      for(var i = 0; i < 6; i++){
        var c = new THREE.Mesh(colGeo, sm(0xd2c6c0)); c.position.set(rx + (i - 2.5)*7, 7.5, rz); c.castShadow = true; parent.add(c);
      }
      [0, 1].forEach(function(k){
        var lint = new THREE.Mesh(new THREE.BoxGeometry(22, 1.6, 3.4), sm(0xb9aca8));
        lint.position.set(rx + (k ? 10.5 : -10.5), 15.8, rz); parent.add(lint);
      });
    }

    // ================= 실제로 배치 =================
    var pad = new THREE.Mesh(new THREE.CylinderGeometry(30, 30, 1.6, 32), brickMat(2.5, 2.5));
    pad.position.set(PX, H + 0.04 - 0.8, GZ); pad.castShadow = true; pad.receiveShadow = true; sky.add(pad);
    spire(PX, H - 1.6, GZ, 1.6);
    [[-18, -10, 0x66f2ff], [18, -10, 0xff8fe0], [-22, 12, 0xff8fe0], [22, 12, 0x66f2ff]].forEach(function(c){
      crystal(sky, PX + c[0], H + 4.5, GZ + c[1], 1.1, c[2]);
    });

    brickPath(PX, GZ, SKY.gate.z - 70);                   // 1번 하늘길 (시작 광장 → 관문 섬)
    brickPath(PX, SKY.gate.z + 70, SKY.obelisk.z - 56);   // 2번 하늘길 (관문 섬 → 오벨리스크 섬)

    // 관문 섬: 걷는 섬이라 흔들리지 않고, 길/문 자리는 나무를 비워둠
    var gateIsland = addIsland(SKY.gate.x, H, SKY.gate.z, SKY.gate.r, {
      bob:false, trees:15, cast:true,
      avoid:function(lx, lz){ return Math.abs(lx) < 12 || (Math.abs(lx) < 52 && Math.abs(lz - 30) < 10); }
    });
/*BLOCK_G*/
/*BLOCK_T*/
/*BLOCK_V*/
/*BLOCK_D*/

    var obeliskIsland = addIsland(SKY.obelisk.x, H, SKY.obelisk.z, SKY.obelisk.r, {
      bob:false, trees:12, cast:true,
      avoid:function(lx, lz){ return Math.hypot(lx, lz) < 16 || (Math.abs(lx) < 12 && lz < 0); }
    });
    buildObelisk(SKY.obelisk.x, H, SKY.obelisk.z);

    // 멀리/옆에 떠 있는 섬들 (기존 맵 쪽으로 넘어가지 않도록 x - 반지름 ≥ 690 안에서만)
    var PINK = 0x86c96a, TEAL = 0x5fb98a;
    addIsland( 905, H - 6,  GZ + 70,  22, { trees:5 });
    addIsland(1095, H - 10, GZ + 95,  20, { trees:4, fall:1 });
    addIsland( 840, H + 6,  GZ + 210, 36, { trees:9, fall:1 });
    addIsland(1170, H + 10, GZ + 235, 34, { trees:8, grass:TEAL });
    addIsland( 790, H + 26, GZ + 360, 52, { trees:14, fall:2 });
    addIsland(1215, H + 20, GZ + 395, 48, { trees:12, fall:1, grass:PINK });
    addIsland( 880, H + 34, GZ + 560, 38, { trees:9, fall:1 });
    addIsland(1125, H + 40, GZ + 600, 42, { trees:10, grass:TEAL });
    addIsland(1000, H + 44, GZ + 880, 92, { trees:22, fall:2, bob:false, avoid:function(lx, lz){ return Math.abs(lz - 20) < 6 && Math.abs(lx) < 20; } });
    // 수도교 양 끝을 받치는 섬 (수도교와 함께 움직이지 않게 고정)
    addIsland( 850, H + 4,  GZ + 455, 30, { trees:7, bob:false });
    addIsland(1150, H + 4,  GZ + 455, 30, { trees:7, bob:false });
    addIsland( 775, H + 56, GZ + 700, 74, { trees:18, fall:2, bob:false });
    var bigR = addIsland(1370, H + 56, GZ + 740, 66, { trees:16, fall:2, bob:false });

    aqueduct( 850, 1150, GZ + 455, H + 4.5, 9, H + 4);
    aqueduct( 775, 1370, GZ + 700, H + 58, 18, H + 56);

    // 맨 뒤 큰 섬 위의 폐허
    (function(){
      var g = new THREE.Group(); g.position.set(1000, H + 44, GZ + 880); sky.add(g);
      ruins(g, 0, 20);
    })();

    // ================= 새 하늘 + 높이 떠 있는 그림 섬 (제미나이 그림) =================
    // 기존 섬보다 약 4배 높은 하늘(바닥 H=90 → 약 330~560)에 받은 섬 그림을 카드로 세우고,
    // 섬마다 폭포·반딧불·구름 그림자를 붙여요. 그림 파일(skyart.js)이 없으면 아무것도 안 해요.
    // 플레이어가 기존 맵 동쪽(x>500) 근처에 올 때만 서서히 나타나서, 기존 맵 화면은 그대로예요.
    var highIslands = [], fadeMats = [];
    function artTex(a){
      var img = new Image();
      var t = new THREE.Texture(img);
      if(!renderer.capabilities.isWebGL2){ t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; }
      img.onload = function(){ t.needsUpdate = true; };
      img.src = a.src;
      return t;
    }
    function makeFallGeo(wf, wWorld, totalH){            // 폭포: 위쪽 입구(그대로) + 몸통(길게 늘림) + 아래 물안개(그대로)
      var s = wWorld / (wf.bodyX1 - wf.bodyX0), tw = wf.w, th = wf.h;
      var lipH = wf.lipY1 * s, mistH = (th - wf.midY1) * s;
      var midH = Math.max(1, totalH - lipH - 0.35*mistH);
      var cx = (wf.bodyX0 + wf.bodyX1) / 2, pos = [], uv = [], idx = [], pad = 8;
      function quad(x0, x1, yT, yB, r0, r1){
        var b = pos.length/3;
        pos.push((x0-cx)*s, yT, 0,  (x1-cx)*s, yT, 0,  (x0-cx)*s, yB, 0,  (x1-cx)*s, yB, 0);
        var u0 = x0/tw, u1 = x1/tw, v0 = 1 - r0/th, v1 = 1 - r1/th;
        uv.push(u0, v0,  u1, v0,  u0, v1,  u1, v1);
        idx.push(b, b+2, b+1,  b+1, b+2, b+3);
      }
      quad(wf.bodyX0 - pad, wf.bodyX1 + pad, 0, -lipH, 0, wf.lipY1);
      quad(wf.bodyX0 - pad, wf.bodyX1 + pad, -lipH, -lipH - midH, wf.lipY1, wf.midY1);
      var y1 = -lipH - midH;
      quad(0, tw, y1 + 0.15*mistH, y1 - 0.85*mistH, wf.midY1, th);
      var g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    }
    if(art && art.island && art.fall && art.fireflies){
      var fallArtTex = artTex(art.fall), fireTex = artTex(art.fireflies);
      var shadowTex = canvasTex(128, 128, function(g, w, h){
        var gr = g.createRadialGradient(w/2, h/2, 4, w/2, h/2, w/2);
        gr.addColorStop(0, "rgba(34,50,120,0.9)"); gr.addColorStop(0.6, "rgba(34,50,120,0.45)"); gr.addColorStop(1, "rgba(34,50,120,0)");
        g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      });
      var fallMatShared = new THREE.MeshBasicMaterial({ map:fallArtTex, transparent:true, depthWrite:false, side:THREE.DoubleSide, opacity:0.7, fog:false });
      fadeMats.push({ m:fallMatShared, base:0.7 });
      // [x, 높이, z, 가로 크기, 좌우반전, 색조, 폭포 수]  — 높이는 기존 섬(≈90~150)의 약 4배, x는 기존 맵 쪽(≥740)으로 넘어오지 않게
      var HIGH = [
        [1380, 420, 1800, 330, false, 0xffffff, 1],
        [ 830, 450, 1850, 300, true,  0xf3ebff, 1],
        [1010, 480, 2300, 440, false, 0xeaf6ff, 2],
        [1750, 370, 2150, 280, true,  0xfff2e6, 1],
        [ 780, 390, 2250, 280, false, 0xeafff3, 1],
        [1250, 340, 1550, 220, true,  0xffffff, 1],
        [ 900, 355, 1600, 210, false, 0xf6efff, 1],
        [1000, 560, 2800, 560, true,  0xe9f1ff, 2]
      ];
      // 작은 섬 8종 (제미나이 그림): [x, 높이, z, 가로 크기, 좌우반전, 색조, 폭포 수, 그림 번호]
      var VARS = [
        [ 760, 240, 1500, 190, false, 0xffffff, 0, 0],
        [1290, 280, 1440, 150, true,  0xffffff, 0, 1],
        [1520, 310, 1660, 210, false, 0xffffff, 0, 2],
        [ 700, 340, 2060, 160, true,  0xffffff, 0, 3],
        [1180, 300, 2160, 130, false, 0xffffff, 0, 4],
        [1620, 410, 2500, 230, true,  0xffffff, 0, 5],
        [ 800, 280, 2620, 175, false, 0xffffff, 0, 6],
        [1300, 350, 2760, 205, true,  0xffffff, 0, 7]
      ];
      var ISL = HIGH.map(function(h){ return h.concat([art.island]); });
      if(art.variants && art.variants.length) VARS.forEach(function(v){ if(art.variants[v[7]]) ISL.push(v.slice(0, 7).concat([art.variants[v[7]]])); });

      // 바람: 나무 잎 부분(흔들림 마스크)만 살랑살랑, 바위는 그대로 + 날리는 잎
      var windU = { time:{ value:0 }, gust:{ value:1 } };
      var leafTex = canvasTex(32, 32, function(g, w, h){
        g.clearRect(0, 0, w, h); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(w/2, h/2, w*0.2, h*0.42, 0.6, 0, Math.PI*2); g.fill();
      });
      var LEAF_COLS = [0xff6fa8, 0x4fd6a0, 0xb8e04a, 0xff9b6a];
      var texCache = {};
      function entryTex(e, key){ var k = e.src.length + key + e.src.slice(-20); return texCache[k] || (texCache[k] = artTex({ src:e[key] || e.src })); }
      function swayPhong(e, wI, tint, ph){
        var m = new THREE.MeshPhongMaterial({ map:entryTex(e, "src"), normalMap:entryTex(e, "normal"), normalScale:new THREE.Vector2(1.1, 1.1),
          emissive:(e === art.island ? 0x4a4a4a : 0x242424), emissiveMap:entryTex(e, "src"), specular:0x1a1a1a, shininess:10, fog:false,
          transparent:true, alphaTest:0.02, side:THREE.DoubleSide, color:tint });
        var swayT = entryTex(e, "sway");
        m.onBeforeCompile = function(sh){
          sh.uniforms.uTime = windU.time; sh.uniforms.uGust = windU.gust;
          sh.uniforms.uAmp = { value: wI*0.014 }; sh.uniforms.uPh = { value: ph }; sh.uniforms.uSway = { value: swayT };
          sh.vertexShader = sh.vertexShader
            .replace("#include <common>", "#include <common>\nuniform float uTime, uGust, uAmp, uPh;\nuniform sampler2D uSway;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\n" +
              "float sw = texture2D(uSway, uv).r;\n" +
              "float wv = sin(uTime*0.55 + uPh + uv.x*6.0 + uv.y*3.0)*0.65 + sin(uTime*1.1 + uPh*1.7 + uv.y*9.0)*0.22;\n" +
              "transformed.x += wv * sw * uAmp * uGust;\n" +
              "transformed.y += sin(uTime*0.8 + uPh + uv.x*7.0) * sw * uAmp * 0.2 * uGust;");
        };
        return m;
      }

      function swayBasic(e, wI, tint, ph){                 // 원본 색 그대로 + 나무만 바람에 흔들림 (작은 섬 그림용)
        var m = new THREE.MeshBasicMaterial({ map:entryTex(e, "src"), transparent:true, alphaTest:0.4, side:THREE.DoubleSide, color:tint, fog:false });
        var swayT = entryTex(e, "sway");
        m.onBeforeCompile = function(sh){
          sh.uniforms.uTime = windU.time; sh.uniforms.uGust = windU.gust;
          sh.uniforms.uAmp = { value: wI*0.014 }; sh.uniforms.uPh = { value: ph }; sh.uniforms.uSway = { value: swayT };
          sh.vertexShader = sh.vertexShader
            .replace("#include <common>", "#include <common>\nuniform float uTime, uGust, uAmp, uPh;\nuniform sampler2D uSway;")
            .replace("#include <begin_vertex>", "#include <begin_vertex>\n" +
              "float sw = texture2D(uSway, uv).r;\n" +
              "float wv = sin(uTime*0.55 + uPh + uv.x*6.0 + uv.y*3.0)*0.65 + sin(uTime*1.1 + uPh*1.7 + uv.y*9.0)*0.22;\n" +
              "transformed.x += wv * sw * uAmp * uGust;\n" +
              "transformed.y += sin(uTime*0.8 + uPh + uv.x*7.0) * sw * uAmp * 0.2 * uGust;");
        };
        return m;
      }

      // 먼 섬들: 한 장짜리 그림 대신 꼭대기 큰 섬처럼 진짜 3D 바위 + 풀밭 + 살아 있는 그림 나무로 만들어요
      var ROCKS = [0x9a8070, 0x8b7a6a, 0xa08a78, 0x8d7766, 0x947d70];
      var farGrassTex = (art && art.grass) ? artTex(art.grass) : null;
      function build3DFar(sp){
        var x = sp[0], y = sp[1], z = sp[2], wI = sp[3], r = wI*0.34, ph = rnd()*6.28;
        var g = makeIsland(r, { grass:0x8fd37a, rock:ROCKS[Math.floor(rnd()*ROCKS.length)] });
        g.position.set(x, y, z);
        if(farGrassTex){ var gt = farGrassTex.clone(); gt.needsUpdate = true; gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(r/22, r/22);
          var gm = new THREE.Mesh(new THREE.CircleGeometry(r*0.985, 36), new THREE.MeshLambertMaterial({ map:gt, polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }));
          gm.rotation.x = -Math.PI/2; gm.position.y = 0.06; g.add(gm); }
        scatterTrees(g, Math.max(4, Math.round(r/4.2)), r, null, false);
        for(var k = 0; k < sp[6]; k++) addFall(g, r, Math.max(12, y - SEA_Y + 8));
        // 반딧불 빛은 카메라를 향해요
        var ffMat = new THREE.MeshBasicMaterial({ map:fireTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, fog:false, opacity:0.6 });
        var ffc = new THREE.Group(), ff = new THREE.Mesh(new THREE.PlaneGeometry(r*2, r*2*art.fireflies.h/art.fireflies.w), ffMat);
        ff.position.y = r*0.35; ffc.add(ff); ffc.position.z = 0; g.add(ffc); facers.push(ffc);
        var shMat = new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, opacity:0, fog:false });
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(r*2.6, r*1.5), shMat);
        sh.rotation.x = -Math.PI/2; sh.renderOrder = -4;
        sh.position.set(x - (y - SEA_Y)*0.45, SEA_Y + 0.6, z + (y - SEA_Y)*0.16);
        g.name = "highIsland"; sh.name = "highIslandShadow"; g.visible = false; sh.visible = false;
        sky.add(g); sky.add(sh);
        highIslands.push({ is3d:true, ffK:0.5, y0:y, g:g, sh:sh, shMat:shMat, ffMat:ffMat, ph:ph, wI:wI, hI:r*1.3, leaf:null });
      }
      var use3DFar = !!(art && art.trees && art.trees.length);

      ISL.forEach(function(sp){
        if(use3DFar){ build3DFar(sp); return; }
        var e = sp[7], x = sp[0], y = sp[1], z = sp[2], wI = sp[3], hI = wI * e.h / e.w, ph = rnd()*6.28;
        var g = new THREE.Group(); g.position.set(x, y, z);
        var imMat, imGeo;
        if(e.normal && e.height && e.sway){                // 그림에서 뽑은 높이·요철로 진짜 바위처럼 빛을 받게 + 바람에 흔들림
          imMat = swayPhong(e, wI, sp[5], ph);
          imGeo = new THREE.PlaneGeometry(wI, hI, 72, Math.round(72*hI/wI));
        } else if(e.sway){
          imMat = swayBasic(e, wI, sp[5], ph);
          imGeo = new THREE.PlaneGeometry(wI, hI, 40, Math.round(40*hI/wI));
        } else {
          imMat = new THREE.MeshBasicMaterial({ map:entryTex(e, "src"), transparent:true, alphaTest:0.02, side:THREE.DoubleSide, color:sp[5], fog:false });
          imGeo = new THREE.PlaneGeometry(wI, hI);
        }
        var im = new THREE.Mesh(imGeo, imMat);
        if(sp[4]) im.scale.x = -1;
        g.add(im);
        for(var k = 0; k < sp[6]; k++){
          var fx = (k ? 0.24 : -0.2) * (sp[4] ? -1 : 1) + (rnd() - 0.5)*0.06;
          var fm = new THREE.Mesh(makeFallGeo(art.fall, wI*0.042, (y + 0.17*hI) - SEA_Y), fallMatShared);
          fm.position.set(fx*wI, 0.17*hI, 0.6);
          fm.frustumCulled = false;
          g.add(fm);
        }
        var ffMat = new THREE.MeshBasicMaterial({ map:fireTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, fog:false, opacity:0.8 });
        var ff = new THREE.Mesh(new THREE.PlaneGeometry(wI*0.8, wI*0.8*art.fireflies.h/art.fireflies.w), ffMat);
        ff.position.set(0, 0.28*hI, 0.9); g.add(ff);
        // 바람에 날리는 잎사귀 (카드에 붙어 있어서 카메라를 따라 돌아요)
        var NL = 9, lp = new Float32Array(NL*3), lc = new Float32Array(NL*3), ll = [];
        for(var q = 0; q < NL; q++) ll.push({ u:rnd(), sp:0.07 + rnd()*0.07, x0:(rnd() - 0.5)*0.7, y0:0.22 + rnd()*0.22, c:new THREE.Color(LEAF_COLS[q % 4]), s:rnd()*6.28 });
        var lg = new THREE.BufferGeometry();
        lg.setAttribute("position", new THREE.BufferAttribute(lp, 3)); lg.setAttribute("color", new THREE.BufferAttribute(lc, 3));
        var lMat = new THREE.PointsMaterial({ map:leafTex, size:wI*0.02, vertexColors:true, transparent:true, depthWrite:false, fog:false, opacity:0 });
        var pts = new THREE.Points(lg, lMat); pts.frustumCulled = false; pts.position.z = 1.4; g.add(pts);
        // 구름바다에 드리우는 그림자
        var shMat = new THREE.MeshBasicMaterial({ map:shadowTex, transparent:true, depthWrite:false, opacity:0, fog:false });
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(wI*0.9, wI*0.5), shMat);
        sh.rotation.x = -Math.PI/2; sh.renderOrder = -4;
        sh.position.set(x - (y - SEA_Y)*0.45, SEA_Y + 0.6, z + (y - SEA_Y)*0.16);
        g.name = "highIsland"; sh.name = "highIslandShadow";
        g.visible = false; sh.visible = false;
        sky.add(g); sky.add(sh);
        fadeMats.push({ m:imMat, base:1 });
        highIslands.push({ ffK:(e === art.island ? 1 : 0.3), y0:y, g:g, sh:sh, shMat:shMat, ffMat:ffMat, ph:ph, wI:wI, hI:hI, leaf:{ n:NL, pos:lp, col:lc, list:ll, geo:lg, mat:lMat } });
      });
    }

    // ---------- 매 프레임 갱신 (render() 에서 호출) ----------
    three.skyUpdate = function(t, dt, p, skyH){
      var f = Math.max(0, Math.min(1, (skyH - 6) / 44));            // 오르막을 오르며 서서히 하늘로
      dome.visible = f > 0.001;
      if(dome.visible){ dome.material.opacity = f; dome.position.copy(three.camera.position); }
      var camAbove = three.camera.position.y - SEA_Y;
      sea.visible = camAbove > 0.5 && f > 0.001;
      if(sea.visible){
        sea.position.set(p.x, SEA_Y, p.z);
        cloudTex.offset.set(p.x/SEA_TW, -p.z/SEA_TH);
        sea.material.opacity = Math.min(1, camAbove/10) * 0.95;
      }
      fallTex.offset.y += dt*0.55;
      var tt = t/1000, i;
      for(i = 0; i < bobbers.length; i++){ var b = bobbers[i]; b.g.position.y = b.y + Math.sin(tt*0.9 + b.ph)*b.amp; }
      for(i = 0; i < spinners.length; i++){ var s = spinners[i]; s.m.rotation.y = tt*0.9 + s.ph; s.m.position.y = s.y + Math.sin(tt*1.6 + s.ph)*0.5; }
      for(i = 0; i < pulsers.length; i++){
        var pu = pulsers[i], v = pu.base + Math.sin(tt*1.8 + i)*pu.amp;
        if(pu.emissive) pu.mat.emissiveIntensity = v; else pu.mat.opacity = v;
      }
      // 하늘 위에서는 먼 안개 색을 새 하늘의 지평선 색으로 (기존 맵에서는 f=0 이라 원래 색 그대로)
      if(hazeCol && fogBase && scene.fog){
        var fq = Math.round(f*50)/50;
        if(fq !== lastFogF){
          lastFogF = fq;
          three.fogMix = fq*0.85; three.hazeCol = hazeCol;
          scene.fog.near = fogNear0 + (650 - fogNear0)*fq;      // 하늘섬에서는 안개를 옅게 (먼 섬도 색이 살아 있게)
          scene.fog.far  = fogFar0  + (3300 - fogFar0)*fq;
        }
      }
      if(skyExtra) skyExtra(t, dt, p, skyH, tt);
      if(treeExtra) treeExtra(t, dt, p, skyH, tt);
      if(villageExtra) villageExtra(t, dt, p);
      for(i = 0; i < facers.length; i++) facers[i].rotation.y = state.cam.yaw + Math.PI;
      { var gu = (typeof windU !== "undefined" && windU) ? windU.gust.value : 1, tw = t/1000;
        for(i = 0; i < treeSways.length; i++){ var ts = treeSways[i]; ts.p.rotation.z = Math.sin(tw*0.45*ts.k + ts.ph)*0.012*gu + Math.sin(tw*0.17 + ts.ph*2)*0.006; } }
      if(three.bg){ var bgFade = 1 - Math.min(1, f*1.6);                    // 하늘 위에서는 옛 산 그림 카드가 구름바다에 잘려 보여서 서서히 숨겨요
        for(i = 0; i < three.bg.length; i++){ var bc = three.bg[i]; if(f > 0.001){ bc.mat.opacity *= bgFade; bc.g.visible = bc.g.visible && bc.mat.opacity > 0.01; } } }
      windU.time.value = tt; windU.gust.value = 0.9 + 0.25*Math.sin(tt*0.2) + 0.1*Math.sin(tt*0.53 + 1.3);
      // 높이 떠 있는 그림 섬: 카메라를 향해 돌고, 기존 맵 동쪽(x>500)에 가까워질 때만 서서히 나타나요
      if(highIslands.length){
        var gate = Math.max(0, Math.min(1, (p.x + 250) / 250)), yawNow = state.cam.yaw;
        var wf0 = Math.max(0, Math.min(1, (p.x - 300) / 450)), wFar = wf0*wf0*(3 - 2*wf0);
        for(i = 0; i < fadeMats.length; i++) fadeMats[i].m.opacity = fadeMats[i].base * gate;
        for(i = 0; i < highIslands.length; i++){
          var hi = highIslands[i];
          hi.g.visible = gate > 0.001;
          hi.sh.visible = gate > 0.001 && sea.visible;
          if(!hi.g.visible) continue;
          if(!hi.is3d) hi.g.rotation.y = yawNow + Math.PI;
          // 기존 맵 땅에서는 시야각 위로 벗어나서 안 보이니까, 멀리서는 지평선 위로 보이도록 낮춰 보여주고 다가갈수록 제 높이로 올라가요
          if(wFar < 1){
            var cp = three.camera.position, ddx = hi.g.position.x - cp.x, ddz = hi.g.position.z - cp.z, dd = Math.sqrt(ddx*ddx + ddz*ddz) + 1;
            var aReal = Math.atan2(hi.y0 - cp.y, dd), aSee = Math.min(aReal, 0.085);
            hi.g.position.y = cp.y + dd*Math.tan(aSee + (aReal - aSee)*wFar);
          } else if(hi.g.position.y !== hi.y0) hi.g.position.y = hi.y0;
          hi.ffMat.opacity = gate * hi.ffK * (0.38 + 0.2*Math.sin(tt*1.7 + hi.ph));
          hi.shMat.opacity = gate * sea.material.opacity * 0.34;
          if(hi.leaf){
          var lf = hi.leaf; lf.mat.opacity = gate*0.85;
            for(var li = 0; li < lf.n; li++){
              var L = lf.list[li]; L.u += dt*L.sp*(0.6 + 0.6*windU.gust.value); if(L.u > 1) { L.u -= 1; L.x0 = (Math.random() - 0.5)*0.7; L.y0 = 0.22 + Math.random()*0.22; }
              var u = L.u, fade = Math.sin(Math.PI*Math.min(1, u))*1.0;
              lf.pos[li*3]   = (L.x0 + u*0.55*windU.gust.value + Math.sin(tt*2.1 + L.s)*0.02)*hi.wI;
              lf.pos[li*3+1] = (L.y0 - u*0.34 + Math.sin(tt*3.0 + L.s)*0.01)*hi.hI;
              lf.pos[li*3+2] = 0;
              lf.col[li*3] = L.c.r; lf.col[li*3+1] = L.c.g; lf.col[li*3+2] = L.c.b;
            }
            lf.geo.attributes.position.needsUpdate = true; lf.geo.attributes.color.needsUpdate = true;
          }
        }
      }
    };
  })();

