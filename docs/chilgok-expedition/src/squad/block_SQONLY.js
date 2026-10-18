/* ---- 별도전투 단독 버전: 시작 화면을 자동으로 넘기고 별도전투만 바로 시작해요 ---- */
window.SQONLY = true;
(function(){
  var ov = document.createElement("div"); ov.id = "sqLoading"; ov.style.cssText = "position:fixed;inset:0;z-index:99999;background:#14182e;color:#ffe9a8;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 22px sans-serif;gap:10px;"; ov.innerHTML = '<div>⚔ 칠곡 원정대 · 별도전투</div><div style="font-size:14px;opacity:.75;font-weight:600">전장을 불러오는 중…</div>'; document.body.appendChild(ov);
  var step = 0, t0 = Date.now(), done = false;
  var iv = setInterval(function(){
    try{
      if(done) return; var el = function(id){ return document.getElementById(id); };
      if(step === 0){ var b0 = el("btnStart"); if(b0){ b0.click(); step = 1; } }
      else if(step === 1){ var b1 = el("btnToWorld"); if(b1){ b1.click(); step = 2; } }
      else if(step === 2){ var nb = document.querySelector("#worldNodes .node-btn"); if(nb){ nb.click(); step = 3; t0 = Date.now(); } }
      else if(step === 3){ if(typeof state !== "undefined" && state.charId && window.sqStart && Date.now() - t0 > 1800){ step = 4; t0 = Date.now(); } }
      else if(step === 4){ if(Date.now() - t0 > 600){ done = true; clearInterval(iv); if(window.__tbS){ window.__tbS.cool = 1e9; } window.sqStart(); if(typeof setMapExpanded === "function") setMapExpanded(true); setTimeout(function(){ var bs = document.querySelectorAll("button"); for(var i = 0; i < bs.length; i++) if(bs[i].textContent === "⛶ 맵 확장") bs[i].textContent = "⤡ 축소"; }, 700); setTimeout(function(){ ov.style.display = "none"; }, 500); } }
    }catch(e){ if(window.console) console.warn("별도전투 단독 시작 오류", e); }
  }, 250);
})();
