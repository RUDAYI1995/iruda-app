    // ---------- 하루 흐름 (낮 → 저녁 → 밤 → 새벽 → 아침 → 낮) + 소리 ----------
    // 전체 맵에 적용돼요. 낮 구간은 예전 화면과 같은 색이고, 한 바퀴는 8분이에요.
    (function buildDayCycle(){
      var CYCLE = 480, clock = 0.03*CYCLE, VAV = art && art.village ? art.village : null;
      var hemiL = (typeof hemi !== "undefined") ? hemi : null, sunL = three.sun || ((typeof sun !== "undefined") ? sun : null), ambL = null;
      scene.children.forEach(function(c){ if(c.isAmbientLight) ambL = c; });
      var K = [
        { t:0.00, bg:0xbfe0ff, hemi:0.75, sun:1.15, scol:0xfff2d6, amb:0.18, tint:[1, 1, 1], w:[0, 0, 0] },
        { t:0.32, bg:0xbfe0ff, hemi:0.75, sun:1.15, scol:0xfff2d6, amb:0.18, tint:[1, 1, 1], w:[0, 0, 0] },
        { t:0.44, bg:0xe9946b, hemi:0.55, sun:0.85, scol:0xffa860, amb:0.20, tint:[1.0, 0.78, 0.66], w:[1, 0, 0] },
        { t:0.54, bg:0x121a3c, hemi:0.24, sun:0.40, scol:0x8aa0ff, amb:0.30, tint:[0.32, 0.38, 0.62], w:[0, 1, 0] },
        { t:0.74, bg:0x121a3c, hemi:0.24, sun:0.40, scol:0x8aa0ff, amb:0.30, tint:[0.32, 0.38, 0.62], w:[0, 1, 0] },
        { t:0.84, bg:0xb49ac4, hemi:0.50, sun:0.62, scol:0xffc4aa, amb:0.22, tint:[0.82, 0.76, 0.9], w:[0, 0, 1] },
        { t:0.93, bg:0xf3dfb4, hemi:0.70, sun:1.00, scol:0xffecc4, amb:0.18, tint:[1, 0.96, 0.86], w:[0, 0, 0] },
        { t:1.00, bg:0xbfe0ff, hemi:0.75, sun:1.15, scol:0xfff2d6, amb:0.18, tint:[1, 1, 1], w:[0, 0, 0] }
      ];
      var cA = new THREE.Color(), cB = new THREE.Color(), cur = { bg:new THREE.Color(), scol:new THREE.Color(), hemi:0, sun:0, amb:0, tint:[1, 1, 1], w:[0, 0, 0] };
      function phase(u){
        var i = 0; while(i < K.length - 2 && u > K[i + 1].t) i++;
        var a = K[i], b = K[i + 1], f = Math.max(0, Math.min(1, (u - a.t)/(b.t - a.t))); f = f*f*(3 - 2*f);
        cA.setHex(a.bg); cB.setHex(b.bg); cur.bg.copy(cA).lerp(cB, f);
        cA.setHex(a.scol); cB.setHex(b.scol); cur.scol.copy(cA).lerp(cB, f);
        cur.hemi = a.hemi + (b.hemi - a.hemi)*f; cur.sun = a.sun + (b.sun - a.sun)*f; cur.amb = a.amb + (b.amb - a.amb)*f;
        for(var k = 0; k < 3; k++){ cur.tint[k] = a.tint[k] + (b.tint[k] - a.tint[k])*f; cur.w[k] = a.w[k] + (b.w[k] - a.w[k])*f; }
      }
      // 시간대별 하늘 그림 (밤, 저녁, 새벽): 낮에는 보이지 않아서 예전 화면 그대로예요
      var domes = [];
      if(VAV){
        ["sky_dusk", "sky_night", "sky_dawn"].forEach(function(key, idx){
          var e = VAV.tiles[key]; if(!e) return;
          var im = new Image(), tx = new THREE.Texture(im); im.onload = function(){ tx.needsUpdate = true; }; im.src = e.src;
          tx.wrapS = THREE.MirroredRepeatWrapping; tx.wrapT = THREE.ClampToEdgeWrapping; tx.repeat.set(2, 1);
          if(THREE.SRGBColorSpace) tx.colorSpace = THREE.SRGBColorSpace;
          var m = new THREE.Mesh(new THREE.SphereGeometry(2900, 28, 18), new THREE.MeshBasicMaterial({ map:tx, side:THREE.BackSide, transparent:true, opacity:0, depthWrite:false, fog:false, toneMapped:false }));
          m.renderOrder = -20 + idx; m.frustumCulled = false; m.visible = false; scene.add(m); domes.push(m);
        });
      }
      var vDome = null;
      if(VAV && VAV.tiles.day_sky){
        var dim = new Image(), dtx = new THREE.Texture(dim); dim.onload = function(){ dtx.needsUpdate = true; }; dim.src = VAV.tiles.day_sky.src;
        dtx.wrapS = THREE.MirroredRepeatWrapping; dtx.wrapT = THREE.ClampToEdgeWrapping; dtx.repeat.set(2, 1); if(THREE.SRGBColorSpace) dtx.colorSpace = THREE.SRGBColorSpace;
        vDome = new THREE.Mesh(new THREE.SphereGeometry(2850, 28, 18), new THREE.MeshBasicMaterial({ map:dtx, side:THREE.BackSide, transparent:true, opacity:0, depthWrite:false, fog:false, toneMapped:false }));
        vDome.renderOrder = -25; vDome.frustumCulled = false; vDome.visible = false; scene.add(vDome);
      }
      function bodySprite(key, size){
        if(!VAV || !VAV.props[key]) return null;
        var e = VAV.props[key], im = new Image(), tx = new THREE.Texture(im); im.onload = function(){ tx.needsUpdate = true; }; im.src = e.src;
        if(THREE.SRGBColorSpace) tx.colorSpace = THREE.SRGBColorSpace;
        var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tx, transparent:true, depthWrite:false, fog:false, toneMapped:false, opacity:0 }));
        sp.scale.set(size, size*e.h/e.w, 1); sp.renderOrder = -10; sp.visible = false; scene.add(sp); return sp;
      }
      var sunSp = bodySprite("sun", 430), moonSp = bodySprite("moon", 330);
      // 길가 가로등 불빛 (밤에 켜져요)
      var glowTex = canvasTex(64, 64, function(g, w, h){ var gr = g.createRadialGradient(w/2, h/2, 1, w/2, h/2, w/2); gr.addColorStop(0, "rgba(255,214,130,1)"); gr.addColorStop(0.4, "rgba(255,170,70,0.45)"); gr.addColorStop(1, "rgba(255,150,40,0)"); g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      var lamps = [];
      for(var lz = -700; lz >= -1500; lz -= 150){ var ls = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, fog:false, opacity:0 })); ls.scale.set(15, 15, 1); ls.position.set(lz, 19.5, 227); ls.visible = false; sky.add(ls); lamps.push(ls); }
      var tintList = null;
      function tintMat(m){ var o = m.userData._oc || (m.userData._oc = m.color.clone()); m.color.setRGB(o.r*cur.tint[0], o.g*cur.tint[1], o.b*cur.tint[2]); }
      function gatherTint(){
        tintList = [];
        var skip = [three.playerTopMat, three.playerLegMat];
        scene.traverse(function(o){
          var m = o.material; if(!m || Array.isArray(m) || !m.isMeshBasicMaterial || !m.map || m.blending !== THREE.NormalBlending || skip.indexOf(m) >= 0 || o.isSprite) return;
          if(domes.indexOf(o) >= 0) return;
          if(tintList.indexOf(m) < 0) tintList.push(m);
        });
      }
      var gatherAt = 0, lastW = -1, tmp = new THREE.Vector3();
      three.dayUpdate = function(t, dt, p){
        clock += dt; var u = (window.__dayT !== undefined) ? window.__dayT : (clock/CYCLE) % 1;
        phase(u);
        var night = Math.max(cur.w[0]*0.6, cur.w[1], cur.w[2]*0.5);
        // 색 (하늘 바탕 + 안개). 하늘섬 위에서는 먼 안개가 새 하늘 색을 따라가요
        var mix = three.fogMix || 0, hz = three.hazeCol;
        var bg = cur.bg; scene.background = scene.background && scene.background.isColor ? scene.background : new THREE.Color();
        scene.background.copy(bg);
        if(scene.fog){
          scene.fog.color.copy(bg);
          if(mix > 0 && hz){ cA.copy(hz); cA.r *= cur.tint[0]; cA.g *= cur.tint[1]; cA.b *= cur.tint[2]; scene.fog.color.lerp(cA, mix); }
        }
        if(hemiL) hemiL.intensity = cur.hemi;
        if(sunL){ sunL.intensity = cur.sun; sunL.color.copy(cur.scol); }
        if(ambL) ambL.intensity = cur.amb;
        for(var i = 0; i < domes.length; i++){ var wv = cur.w[i]; domes[i].visible = wv > 0.01; domes[i].material.opacity = wv; domes[i].position.copy(three.camera.position); }
        if(vDome){ var inVil = Math.max(0, Math.min(1, (-p.x - 520)/160)), dd = inVil*Math.max(0, 1 - night*1.4 - cur.w[0]*0.5); vDome.visible = dd > 0.01; vDome.material.opacity = dd; vDome.position.copy(three.camera.position); }
        // 해와 달
        var su = ((u - 0.85 + 1) % 1)/0.62, mu = ((u - 0.43 + 1) % 1)/0.42, cp = three.camera.position;
        function place(sp, q, op){
          if(!sp) return; var on = q >= 0 && q <= 1; sp.visible = on; if(!on) return;
          var el = Math.sin(Math.PI*q)*1.05 + 0.04, az = Math.PI*q;
          tmp.set(Math.cos(az)*Math.cos(el), Math.sin(el), (Math.sin(az)*0.9 + 0.1)*Math.cos(el)).multiplyScalar(2500).add(cp);
          sp.position.copy(tmp); sp.material.opacity = op*Math.min(1, Math.sin(Math.PI*q)*4);
        }
        place(sunSp, su, 1); place(moonSp, mu, 0.95);
        // 카드(산 그림, 나무, 건물 소품)와 구름바다를 시간대 색으로
        if(!tintList){ gatherAt += dt; if(gatherAt > 1.5) gatherTint(); }
        if(tintList) for(i = 0; i < tintList.length; i++) tintMat(tintList[i]);
        if(three.plain && three.plain.material) tintMat(three.plain.material);
        if(three.bg) for(i = 0; i < three.bg.length; i++){ var bm = three.bg[i].mat; if(bm && bm.color) tintMat(bm); }
        // 창문과 가로등 (밤에 켜져요)
        var lit = Math.max(0, Math.min(1, (night - 0.25)/0.5));
        if(window.villageWin) for(i = 0; i < window.villageWin.length; i++){ window.villageWin[i].emissive.setRGB(0.16 + 0.84*lit, 0.14 + 0.62*lit, 0.09 + 0.22*lit); }
        for(i = 0; i < lamps.length; i++){ lamps[i].visible = lit > 0.02 && p.x < -600; lamps[i].material.opacity = lit*0.9; }
        sound(dt, u, night, p);
      };
      three.dayCycle = { phase:function(){ return (window.__dayT !== undefined) ? window.__dayT : (clock/CYCLE) % 1; } };

      // ---------- 소리 (브라우저에서 직접 합성해요: 파일 없음) ----------
      var AC = null, master = null, windG = null, cricketG = null, muted = false, nextBird = 2, nextFrog = 3, roosterDone = false, btn = null;
      function startAudio(){
        if(AC) return;
        try{
          AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = muted ? 0 : 0.5; master.connect(AC.destination);
          var buf = AC.createBuffer(1, AC.sampleRate*2, AC.sampleRate), d = buf.getChannelData(0); for(var q = 0; q < d.length; q++) d[q] = Math.random()*2 - 1;
          var nz = AC.createBufferSource(); nz.buffer = buf; nz.loop = true;
          var bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 520; bp.Q.value = 0.5; windG = AC.createGain(); windG.gain.value = 0.0;
          nz.connect(bp); bp.connect(windG); windG.connect(master); nz.start();
          var co = AC.createOscillator(); co.frequency.value = 4400; var lf = AC.createOscillator(); lf.type = "square"; lf.frequency.value = 17; var lg = AC.createGain(); lg.gain.value = 0.5;
          cricketG = AC.createGain(); cricketG.gain.value = 0; var am = AC.createGain(); am.gain.value = 0.5; lf.connect(lg); lg.connect(am.gain); co.connect(am); am.connect(cricketG); cricketG.connect(master); co.start(); lf.start();
        }catch(e){ AC = null; }
      }
      function tone(f0, f1, dur, vol, type){
        if(!AC || muted) return; var o = AC.createOscillator(), g = AC.createGain(), n = AC.currentTime;
        o.type = type || "sine"; o.frequency.setValueAtTime(f0, n); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), n + dur);
        g.gain.setValueAtTime(0.0001, n); g.gain.exponentialRampToValueAtTime(vol, n + dur*0.2); g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
        o.connect(g); g.connect(master); o.start(n); o.stop(n + dur + 0.05);
      }
      window.playSfx = function(kind){
        if(!AC) return;
        if(kind === "good"){ tone(520, 780, 0.12, 0.12, "triangle"); setTimeout(function(){ tone(780, 1040, 0.16, 0.12, "triangle"); }, 90); }
        else tone(260, 180, 0.12, 0.14, "triangle");
      };
      function sound(dt, u, night, p){
        if(!AC) return;
        var inV = p.x < -600, gust = (typeof windU !== "undefined" && windU) ? windU.gust.value : 1, day = 1 - night;
        windG.gain.value = (0.012 + 0.012*gust)*(muted ? 0 : 1) + (p.x > 620 ? 0.012 : 0);
        cricketG.gain.value = muted ? 0 : night*0.028;
        nextBird -= dt; nextFrog -= dt;
        if(nextBird <= 0){ nextBird = 2 + Math.random()*5; if(day > 0.5){ var f = 2300 + Math.random()*1400; tone(f, f*1.4, 0.11, 0.05, "sine"); setTimeout(function(){ tone(f*1.2, f*1.7, 0.1, 0.045, "sine"); }, 150); } }
        if(nextFrog <= 0){ nextFrog = 1 + Math.random()*3; if(night > 0.5 && inV){ tone(150, 110, 0.12, 0.1, "sawtooth"); setTimeout(function(){ tone(160, 120, 0.12, 0.1, "sawtooth"); }, 170); } }
        if(cur.w[2] > 0.6 && !roosterDone){ roosterDone = true; tone(420, 880, 0.35, 0.09, "sawtooth"); setTimeout(function(){ tone(700, 560, 0.3, 0.09, "sawtooth"); }, 380); setTimeout(function(){ tone(560, 900, 0.5, 0.09, "sawtooth"); }, 760); }
        if(cur.w[2] < 0.2) roosterDone = false;
      }
      function onFirst(){ startAudio(); window.removeEventListener("pointerdown", onFirst); window.removeEventListener("keydown", onFirst); }
      window.addEventListener("pointerdown", onFirst); window.addEventListener("keydown", onFirst);
      btn = document.createElement("button"); btn.textContent = "🔊"; btn.title = "소리 켜기/끄기";
      btn.style.cssText = "position:fixed;bottom:12px;right:12px;z-index:60;width:42px;height:42px;border-radius:21px;border:1px solid #d9c9a8;background:rgba(255,248,232,.92);font-size:20px;cursor:pointer;";
      btn.addEventListener("click", function(e){ e.stopPropagation(); startAudio(); muted = !muted; btn.textContent = muted ? "🔇" : "🔊"; if(master) master.gain.value = muted ? 0 : 0.5; });
      document.body.appendChild(btn);
    })();
