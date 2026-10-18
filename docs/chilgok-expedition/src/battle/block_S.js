    // ================= 전투 소리 (6·25 전쟁 분위기: 총소리 · 기관총 연사 · 포 쏘는 소리 · 포탄 휘파람/폭발) =================
    // 전부 WebAudio 로 합성해요(파일 없음). 귀가 아프지 않게: 전체 음량을 낮추고, 컴프레서로 큰 소리를 눌러주고, 0.1초당 소리 수를 제한하고, 멀수록 작고 둔탁하게 해요.
    (function buildTBSnd(){
      var AC = null, master = null, comp = null, noiseBuf = null, enabled = true, vol = 0.55, win = { t:-1, c:{} }, amb = null;
      var LIM = { rifle:7, mg:5, cannon:2, boom:2, sniper:2, whistle:2 };
      function ctx(){
        if(AC) return AC; var C = window.AudioContext || window.webkitAudioContext; if(!C) return null;
        try{
          AC = new C(); comp = AC.createDynamicsCompressor(); comp.threshold.value = -22; comp.knee.value = 24; comp.ratio.value = 10; comp.attack.value = 0.003; comp.release.value = 0.25;
          master = AC.createGain(); master.gain.value = 0.32*vol; master.connect(comp); comp.connect(AC.destination);
          noiseBuf = AC.createBuffer(1, AC.sampleRate*2, AC.sampleRate); var d = noiseBuf.getChannelData(0); for(var i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
        }catch(e){ AC = null; }
        return AC;
      }
      function ready(kind){
        if(!enabled) return false; var a = ctx(); if(!a) return false; if(a.state === "suspended"){ try{ a.resume(); }catch(e){} }
        var now = a.currentTime; if(now - win.t > 0.1){ win.t = now; win.c = {}; } win.c[kind] = (win.c[kind] || 0) + 1; return win.c[kind] <= (LIM[kind] || 4);
      }
      function atten(dist){ return 1/(1 + (dist || 0)/65); }
      function noise(at, dur, type, f0, f1, q, gain, decay){
        var src = AC.createBufferSource(); src.buffer = noiseBuf; src.playbackRate.value = 0.85 + Math.random()*0.3; var f = AC.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, at); if(f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), at + dur); f.Q.value = q || 0.7;
        var g = AC.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(gain, at + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, at + (decay || dur)); src.connect(f); f.connect(g); g.connect(master); src.start(at, Math.random()*1.5, dur + 0.05);
      }
      function tone(at, dur, f0, f1, gain){ var o = AC.createOscillator(); o.type = "sine"; o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), at + dur); var g = AC.createGain(); g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(gain, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + dur); o.connect(g); g.connect(master); o.start(at); o.stop(at + dur + 0.03); }
      var API = {};
      API.setEnabled = function(v){ enabled = !!v; if(AC && master) master.gain.value = enabled ? 0.32*vol : 0; };
      API.toggle = function(){ API.setEnabled(!enabled); return enabled; };
      API.isOn = function(){ return enabled; };
      API.setVolume = function(v){ vol = Math.max(0, Math.min(1, v)); if(AC && master && enabled) master.gain.value = 0.32*vol; };
      // 소총 한 발: 짧은 "탕" (고음 잡음 + 낮은 울림)
      API.rifle = function(dist){ if(!ready("rifle")) return; var a = atten(dist); if(a < 0.05) return; var t = AC.currentTime + Math.random()*0.03, lp = Math.max(900, 5200/(1 + (dist || 0)/70));
        noise(t, 0.11, "bandpass", 1500*(0.85 + Math.random()*0.3), 700, 0.7, 0.24*a, 0.1); noise(t, 0.08, "lowpass", lp, 0, 0.5, 0.1*a, 0.08); tone(t, 0.07, 150, 60, 0.12*a); };
      // 기관총 한 발(연사 소리는 이 소리가 빠르게 반복): 더 짧고 건조한 "타다다"
      API.mg = function(dist){ if(!ready("mg")) return; var a = atten(dist); if(a < 0.05) return; var t = AC.currentTime + Math.random()*0.02; noise(t, 0.06, "bandpass", 1900*(0.9 + Math.random()*0.2), 900, 0.8, 0.17*a, 0.055); tone(t, 0.04, 170, 80, 0.07*a); };
      // 저격총: 크고 낮은 한 발 + 긴 여운
      API.sniper = function(dist){ if(!ready("sniper")) return; var a = atten(dist*0.6); if(a < 0.04) return; var t = AC.currentTime; noise(t, 0.2, "bandpass", 1100, 450, 0.6, 0.3*a, 0.18); noise(t + 0.03, 0.7, "lowpass", 600, 160, 0.4, 0.12*a, 0.6); tone(t, 0.12, 120, 45, 0.2*a); };
      // 전차포 발사: "쿠웅" (낮은 울림 + 짧은 쇳소리)
      API.cannon = function(dist){ if(!ready("cannon")) return; var a = atten(dist*0.5); if(a < 0.04) return; var t = AC.currentTime; noise(t, 0.04, "highpass", 3200, 0, 0.7, 0.12*a, 0.04); noise(t, 0.5, "lowpass", 900, 180, 0.5, 0.36*a, 0.45); tone(t, 0.42, 95, 36, 0.36*a); };
      // 포탄 날아오는 휘파람
      API.whistle = function(dur){ if(!ready("whistle")) return; var t = AC.currentTime; var o = AC.createOscillator(); o.type = "sawtooth"; o.frequency.setValueAtTime(1700, t); o.frequency.exponentialRampToValueAtTime(520, t + dur); var f = AC.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 3; var g = AC.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + dur*0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05); };
      // 포탄 폭발: 거리만큼 늦게 들리는 "쿠과광" + 낮은 진동
      API.boom = function(dist){ if(!ready("boom")) return; var a = atten(dist*0.45); if(a < 0.04) return; var t = AC.currentTime + Math.min(0.5, (dist || 0)/420); noise(t, 1.3, "lowpass", 380, 70, 0.4, 0.46*a, 1.2); noise(t, 0.18, "bandpass", 1200, 300, 0.6, 0.18*a, 0.16); tone(t, 1.0, 58, 26, 0.4*a); };
      // 멀리서 들리는 전투 소음(낮은 웅웅거림) — 싸움이 클수록 조금 커져요
      API.ambience = function(level){
        if(!enabled) return; var a = ctx(); if(!a) return; if(a.state === "suspended"){ try{ a.resume(); }catch(e){} }
        if(!amb){ var src = a.createBufferSource(); src.buffer = noiseBuf; src.loop = true; var f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 220; var g = a.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(master); src.start(); amb = { g:g }; }
        amb.g.gain.linearRampToValueAtTime(0.045*Math.max(0, Math.min(1, level)), a.currentTime + 0.6);
      };
      API.stopAmbience = function(){ if(amb && AC) amb.g.gain.linearRampToValueAtTime(0, AC.currentTime + 0.5); };
      window.TBSnd = API;
    })();

