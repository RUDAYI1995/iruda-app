    // ================= 칠곡 저택 (대저택, 담쟁이 덮인 석조 건물) — 가산수피아 위쪽 들판 =================
    // 참고: source-images/mansion/ (앞/왼쪽/오른쪽/뒤/지붕 위 + 대문). 이미지는 원래 해상도로 입체 상자의 네 면과 지붕에 입혔어요.
    // 안쪽(마피아 게임)은 다른 프로젝트라 파일을 받은 뒤 연결해요: 지금은 문 앞에서 안내만 나와요.
    (function buildMansion(){
      var MX = 520, MZ = 1010, W = 146, D = 58, H = 70, FW = 150, FH = 90.5;       // 중심, 가로(정면 폭), 깊이, 몸통 높이, 정면 그림 크기
      var built = false, G = null, lastNear = false;
      var IMGS = { front:"__MN_FRONT__", left:"__MN_LEFT__", right:"__MN_RIGHT__", back:"__MN_BACK__", roof:"__MN_ROOF__", gate:"__MN_GATE__" };
      function tex(k){ var im = new Image(), t = new THREE.Texture(im); im.onload = function(){ t.needsUpdate = true; }; im.src = "data:image/webp;base64," + IMGS[k]; if(THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
      function card(k, w, h, x, y, z, ry){
        var t = tex(k), m = new THREE.MeshStandardMaterial({ map:t, emissiveMap:t, emissive:new THREE.Color(0x7a7a7a), roughness:0.9, metalness:0, alphaTest:0.4, side:THREE.FrontSide });
        var o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); o.position.set(x, y, z); o.rotation.y = ry || 0; o.castShadow = false; G.add(o); return o; }
      function build(){
        G = new THREE.Group(); G.name = "mansion"; G.position.set(MX, 0, MZ); G.rotation.y = -Math.PI/2; scene.add(G);
        // 몸통 (카드 뒤에서 옆/뒤에서 봐도 비지 않게), 돌 색
        var stone = new THREE.MeshStandardMaterial({ color:0x5a606c, roughness:0.95, emissive:0x23262c }); var body = new THREE.Mesh(new THREE.BoxGeometry(W - 20, H - 18, D - 4), stone); body.position.y = (H - 18)/2; body.castShadow = true; body.receiveShadow = true; G.add(body);
        // 네 면: 원본 그림 (건물 부분 크기를 정면과 맞춰요)
        card("front", FW, FH, 0, FH/2, D/2 + 0.4, 0);
        card("back", FW, FH, 0, FH/2, -D/2 - 0.4, Math.PI);
        card("left", 1554*0.0894, FH, -W/2 - 0.4 + 0, FH/2, 6, -Math.PI/2);
        card("right", 855*(58/515), 925*(FH/910)*0.99, W/2 + 0.4, FH/2, -2, Math.PI/2);
        // 지붕 (위에서 본 그림) — 몸통 위
        var rt = tex("roof"), rm = new THREE.MeshStandardMaterial({ map:rt, emissiveMap:rt, emissive:new THREE.Color(0x555a66), roughness:0.9, alphaTest:0.4, side:THREE.DoubleSide }); var roof = new THREE.Mesh(new THREE.PlaneGeometry(W - 2, D + 3), rm); roof.rotation.x = -Math.PI/2; roof.rotation.z = Math.PI; roof.position.set(0, H - 18 + 0.15, 0); roof.scale.set(0.86, 1, 0.9); G.add(roof);
        // 앞마당: 돌길 + 대문과 담장 (원본 그림), 계단 앞
        var path = new THREE.Mesh(new THREE.PlaneGeometry(14, 70), new THREE.MeshStandardMaterial({ color:0xb8b0a0, roughness:1, emissive:0x2c2a26 })); path.rotation.x = -Math.PI/2; path.position.set(0, 0.25, D/2 + 38); G.add(path);
        var gate = card("gate", 100, 100*340/870, 0, 100*340/870/2, D/2 + 66, 0);
        // 그림자
        var sg = document.createElement("canvas"); sg.width = sg.height = 64; var g2 = sg.getContext("2d"), gr = g2.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g2.fillStyle = gr; g2.fillRect(0, 0, 64, 64);
        var sh = new THREE.Mesh(new THREE.PlaneGeometry(W + 50, D + 50), new THREE.MeshBasicMaterial({ map:new THREE.CanvasTexture(sg), transparent:true, depthWrite:false })); sh.rotation.x = -Math.PI/2; sh.position.y = 0.12; G.add(sh);
        // 막는 곳 + 카메라 막이 (월드 기준)
        LAND_RECTS.push({ id:"mansion", x:MX, z:MZ, hx:D/2 + 4, hz:W/2 + 3, h:95, name:"칠곡 저택", sub:"담쟁이 덮인 대저택", msg:"🏚 오래된 대저택이에요. 문 앞에서 E 를 누르면 안으로 들어가요." });
        // 대문 담장 양옆 (가운데 문은 열려 있어요)
        [-1, 1].forEach(function(s){ window.ROCK_RECTS.push({ x:MX - (D/2 + 66), z:MZ + s*(12 + 19), hx:2.5, hz:19 }); });
        built = true;
      }
      var DOOR = { x:MX - D/2 - 14, z:MZ };
      function nearDoor(p){ return Math.hypot(p.x - DOOR.x, p.z - DOOR.z) < 16; }
      window.mansionHint = function(p){ return nearDoor(p) ? "E 눌러 저택 안으로 들어가기" : null; };
      window.mansionInteract = function(p){
        if(!nearDoor(p)) return false;
        if(window.MAFIA_ENTER){ window.MAFIA_ENTER(p); return true; }
        if(typeof showToast === "function") showToast("🏚 저택 안(마피아 게임)은 프로젝트 파일을 받은 뒤 연결할게요. 곧 들어갈 수 있어요!");
        return true;
      };
      window.mansionTick = function(t, dt, p){
        if(!window.__riverBuilt) return;
        var d = Math.hypot(p.x - MX, p.z - MZ), near = d < 950 && p.x > -700;
        if(near && !built) build();
        if(built){ G.visible = near && p.x > 300; }
      };
    })();
;(function(){
  // 대저택 안 = 마피아 게임(rudapia). 원본 빌드를 그대로 전체화면 iframe 으로 띄워요.
  var box = null;
  window.MAFIA_ENTER = function(p){
    if(box) return;
    box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;z-index:99999;background:#000;";
    var fr = document.createElement("iframe");
    fr.src = "rudapia/index.html" + (window.MAFIA_QS || "");
    fr.allow = "autoplay; fullscreen";
    fr.style.cssText = "position:absolute;inset:0;width:100%;height:100%;border:0;background:#000;";
    var bt = document.createElement("button");
    bt.textContent = "🏰 저택에서 나가기";
    bt.style.cssText = "position:absolute;right:12px;bottom:12px;z-index:2;padding:8px 14px;border:0;border-radius:10px;background:rgba(20,20,30,.85);color:#fff;font:700 13px sans-serif;cursor:pointer;";
    bt.onclick = window.MAFIA_EXIT;
    box.appendChild(fr); box.appendChild(bt); document.body.appendChild(box);
    window.__mafiaOpen = true;
    try{ fr.addEventListener("load", function(){ try{ fr.contentWindow.focus(); }catch(e){} }); }catch(e){}
  };
  window.MAFIA_EXIT = function(){
    if(!box) return;
    box.remove(); box = null; window.__mafiaOpen = false;
    try{ window.focus(); }catch(e){}
  };
})();
