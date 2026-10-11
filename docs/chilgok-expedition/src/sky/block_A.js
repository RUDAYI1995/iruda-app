
/* ---------------- 하늘섬 (Sky Islands) + 마법 나무 ----------------
   기존 맵(x ∈ [-620, 620])의 동쪽 끝 너머, 아무것도 없던 허허벌판에 새로 이어 붙인 확장 구역이에요.
   게임 화면은 +z 방향을 바라보기 때문에 월드 +x 쪽이 화면에서는 "가장 왼쪽"이에요.
   아래 함수들은 전부 x > 620 에서만 일하고, x ≤ 620 (기존 맵)에서는 아무것도 바꾸지 않아요.

   층이 여러 개라서(땅 0 / 하늘길 90 / 천공 섬 360 / 나선 로프길 0~600) "지금 서 있는 높이"(SKY_REF)에
   가장 가까운 면만 밟을 수 있어요. 다른 층으로 건너뛰거나 가장자리 밖으로는 못 나가요. */
var SKY = {
  edgeX: 620,          // 기존 맵 동쪽 끝 (= X_MAX)
  gateZ: 1100,         // 하늘길 오르막이 시작되는 z
  H: 90,               // 하늘섬 바닥 높이
  rampEndX: 960,       // 오르막이 끝나는 x
  pathX: 1000,         // 하늘섬 중심선 x
  pathHalf: 7.5,       // 길 폭의 절반
  gate:    { x:1000, z:1410, r:82 },   // 관문 섬 (아치 문)
  obelisk: { x:1000, z:1690, r:68 },   // 오벨리스크 섬
  top:     { x:1000, z:2060, r:50, y:395 },   // 천공 섬 (아치 포털로 순간이동, 기존 섬보다 약 4배 높이)
  ground:  { x1:2200, z1:3000 },              // 기존 맵 땅을 하늘섬 구역 아래까지 넓힌 땅 (x 620~2200)
  // 마법 나무: 넓힌 땅에서 솟아올라 하늘까지. 줄기를 빙 둘러 오르는 로프길로 걸어 올라가요.
  crown: { r:105, y:600 },                    // 마법 나무 꼭대기를 둘러싼 큰 섬 (로프길 끝에서 바로 걸어 들어가요)
  tree: { x:1175, z:2000, topY:600, r0:38, r1:24, gap:13, hw:6.5, slope:0.28,
          th0:Math.atan2(-0.55, -0.83), landR:15, landings:[90, 200, 395, 480, 600], blockR:41 }
};
var SKY_PLACE = { id:"sky", name:"하늘섬", sub:"구름 위에 떠 있는 비밀의 섬" };
var SKY_REF = 0, SKY_STEP = 5;      // 지금 서 있는 면의 높이 / 한 걸음에 오르내릴 수 있는 높이

function skyEase(t){ t = Math.max(0, Math.min(1, t)); return t*t*(3-2*t); }
function skyRampHeight(x){ return SKY.H * skyEase((x - SKY.edgeX) / (SKY.rampEndX - SKY.edgeX)); }

// ---- 마법 나무 줄기와 나선 로프길 ----
function skyTrunkR(y){ var T = SKY.tree, t = Math.max(0, Math.min(1, y/T.topY)); return T.r0 + (T.r1 - T.r0)*t; }
// 로프길 중심선을 높이 2 간격 표로 만들어 둬요 (각도 th 는 올라갈수록 커짐, R 은 줄기 둘레 + 간격)
var SKY_SPIRAL = (function(){
  var T = SKY.tree, n = Math.ceil(T.topY/2), ys = [], ths = [], rs = [], th = T.th0;
  for(var i = 0; i <= n; i++){
    var y = Math.min(T.topY, i*2), R = skyTrunkR(y) + T.gap;
    ys.push(y); rs.push(R); ths.push(th);
    var y2 = Math.min(T.topY, (i + 1)*2), R2 = skyTrunkR(y2) + T.gap;
    if(y2 > y) th += (y2 - y) / (T.slope * (R + R2)/2);
  }
  return { n:n, ys:ys, ths:ths, rs:rs };
})();
function skyExtraW(y){              // 층마다 로프길이 바깥쪽으로 넓어지는 쉼터 폭
  var T = SKY.tree, w = 0;
  for(var i = 0; i < T.landings.length; i++){ var d = (y - T.landings[i])/11; w += 9*Math.exp(-d*d); }
  return Math.min(9, w);
}
function skySpiralAt(y){            // 높이 y 에서의 로프길 중심점 {x, z, th, R}
  var S = SKY_SPIRAL, T = SKY.tree, f = Math.max(0, Math.min(S.n, y/2)), i = Math.min(S.n - 1, Math.floor(f)), u = f - i;
  var th = S.ths[i] + (S.ths[i+1] - S.ths[i])*u, R = S.rs[i] + (S.rs[i+1] - S.rs[i])*u;
  return { x:T.x + R*Math.cos(th), z:T.z + R*Math.sin(th), th:th, R:R };
}

// (x, z) 위에서 밟을 수 있는 면의 높이들을 SKY_C 에 모아요
var SKY_C = [];
function skyCands(x, z){
  var c = SKY_C; c.length = 0;
  if(x <= SKY.edgeX) return c;
  var g = SKY.gateZ, px = SKY.pathX, hw = SKY.pathHalf, T = SKY.tree, S = SKY_SPIRAL;
  var tdx = x - T.x, tdz = z - T.z, tr = Math.sqrt(tdx*tdx + tdz*tdz);
  // 1) 넓힌 땅 (마법 나무 뿌리 자리는 막혀 있어요)
  var groundIn = false, coilLow = false;
  if(x <= SKY.ground.x1 && z >= PATH_MIN_Z && z <= 2720 && tr > T.blockR){ c.push(0); groundIn = true; }
  // 2) 오르막, 시작 광장, 하늘길 2개, 관문 섬, 오벨리스크 섬 (높이 90)
  if(x <= SKY.rampEndX + 25 && Math.abs(z - g) <= hw) c.push(x < SKY.rampEndX ? skyRampHeight(x) : SKY.H);
  if(Math.hypot(x - px, z - g) <= 28) c.push(SKY.H);
  if(Math.abs(x - px) <= hw && z >= g && z <= SKY.gate.z - 76) c.push(SKY.H);
  if(Math.hypot(x - SKY.gate.x, z - SKY.gate.z) <= SKY.gate.r - 3){
    // 아치 문의 기둥 자리는 막고, 아치 사이 뚫린 곳은 지나갈 수 있어요
    var gx = Math.abs(x - SKY.gate.x), gdz = Math.abs(z - (SKY.gate.z + 30));
    if(!(gdz < 3.4 && ((gx >= 9.6 && gx <= 15.4) || (gx >= 28.6 && gx <= 33.4) || (gx >= 42.8 && gx <= 46.6)))) c.push(SKY.H);
  }
  if(Math.abs(x - px) <= hw && z >= SKY.gate.z + 70 && z <= SKY.obelisk.z - 62) c.push(SKY.H);
  var od = Math.hypot(x - SKY.obelisk.x, z - SKY.obelisk.z);
  if(od <= SKY.obelisk.r - 3 && od > 11) c.push(SKY.H);                // 오벨리스크 받침대 안으로는 못 들어가요
  // 3-b) 마법 나무 꼭대기 큰 섬 (줄기 둘레는 막혀 있어요)
  if(tr > 28 && tr <= SKY.crown.r - 3 && !skyPropBlocked(x, z)) c.push(SKY.crown.y);
  // 3) 천공 섬
  if(Math.hypot(x - SKY.top.x, z - SKY.top.z) <= SKY.top.r - 3) c.push(SKY.top.y);
  // 4) 마법 나무를 빙 둘러 오르는 로프길 (코일마다 높이가 하나씩) + 층마다 있는 쉼터
  if(tr > 8 && tr < T.r0 + T.gap + T.hw + 3 + 12){
    var th = Math.atan2(tdz, tdx), TWO = Math.PI*2;
    var m0 = Math.ceil((S.ths[0] - th)/TWO), m1 = Math.floor((S.ths[S.n] - th)/TWO);
    for(var m = m0; m <= m1; m++){
      var tt = th + m*TWO, lo = 0, hi = S.n;
      while(hi - lo > 1){ var mid = (lo + hi) >> 1; if(S.ths[mid] <= tt) lo = mid; else hi = mid; }
      var u = (tt - S.ths[lo]) / (S.ths[lo+1] - S.ths[lo]), R = S.rs[lo] + (S.rs[lo+1] - S.rs[lo])*u;
      var yy = S.ys[lo] + (S.ys[lo+1] - S.ys[lo])*u;
      if(tr >= R - T.hw && tr <= R + T.hw + skyExtraW(yy)){ c.push(yy); if(yy <= 7) coilLow = true; }
    }
  }
  if(groundIn){ for(var gi = 1; gi < c.length; gi++) if(c[gi] <= 7){ coilLow = true; break; } }       // 오르막·로프길 시작처럼 땅 위를 덮은 길은 그 높이를 따라가요
  if(groundIn && coilLow) c.splice(0, 1);          // 로프길 시작 부분은 땅 위를 덮고 있어서, 판자 위에 서면 판자 높이를 따라가요
  skyBranchCands(x, z, c);
  return c;
}
// 로프길 가장자리에 부딪히면 막히지 않고 가장자리를 따라 미끄러지도록, 길 폭 안으로 반지름을 맞춘 자리를 돌려줘요
function skyRopeClamp(x, z){
  var T = SKY.tree, S = SKY_SPIRAL, tdx = x - T.x, tdz = z - T.z, tr = Math.sqrt(tdx*tdx + tdz*tdz);
  if(tr < 8 || tr > T.r0 + T.gap + T.hw + 3 + 12) return null;
  var th = Math.atan2(tdz, tdx), TWO = Math.PI*2, m0 = Math.ceil((S.ths[0] - th)/TWO), m1 = Math.floor((S.ths[S.n] - th)/TWO), best = null, bd = 1e9;
  for(var m = m0; m <= m1; m++){
    var tt = th + m*TWO, lo = 0, hi = S.n;
    while(hi - lo > 1){ var mid = (lo + hi) >> 1; if(S.ths[mid] <= tt) lo = mid; else hi = mid; }
    var u = (tt - S.ths[lo]) / (S.ths[lo+1] - S.ths[lo]), R = S.rs[lo] + (S.rs[lo+1] - S.rs[lo])*u, yy = S.ys[lo] + (S.ys[lo+1] - S.ys[lo])*u;
    var dy = Math.abs(yy - SKY_REF);
    if(dy <= SKY_STEP && dy < bd){ bd = dy; best = { R:R, ex:skyExtraW(yy) }; }
  }
  if(!best) return null;
  var rc = Math.max(best.R - T.hw + 0.15, Math.min(best.R + T.hw + best.ex - 0.15, tr));
  return { x:T.x + rc*Math.cos(th), z:T.z + rc*Math.sin(th) };
}
function skyWalkable(x, z){          // 지금 서 있는 높이에서 (x, z) 로 걸어갈 수 있나요?
  var c = skyCands(x, z);
  for(var i = 0; i < c.length; i++) if(Math.abs(c[i] - SKY_REF) <= SKY_STEP) return true;
  return false;
}
function skyHeightAt(x, z){
  if(x <= SKY.edgeX) return 0;            // 기존 맵에서는 항상 0 → 기존 높이 계산에 영향 없음
  var c = skyCands(x, z), best = null, bd = 1e9, low = null;
  for(var i = 0; i < c.length; i++){
    var d = Math.abs(c[i] - SKY_REF);
    if(d <= SKY_STEP && d < bd){ bd = d; best = c[i]; }          // 지금 서 있는 높이에 가장 가까운 면 (겹친 층으로 저절로 올라가지 않게)
    if(low === null || c[i] < low) low = c[i];
  }
  return best !== null ? best : (low !== null ? low : 0);
}
// 이동 한 걸음 뒤에 호출: 하늘섬 쪽(x > 620)으로 넘어간 경우만 처리하고, 처리했으면 true.
// false 를 돌려주면 기존 이동 제한(X_MIN/X_MAX, PATH_MIN_Z/PATH_MAX_Z)이 그대로 적용돼요.
function skyConstrain(p, px0, pz0){
  if(p.x < VIL.westX) return vilConstrain(p, px0, pz0);
  if(p.x <= SKY.edgeX) return false;
  if(skyWalkable(p.x, p.z)) return true;
  var rq = skyRopeClamp(p.x, p.z);          // 나선 로프길 가장자리: 길을 따라 미끄러지게
  if(rq && skyWalkable(rq.x, rq.z)){ p.x = rq.x; p.z = rq.z; return true; }
  if(px0 > SKY.edgeX){                      // 이미 하늘섬 위: 가장자리에서 미끄러지듯 막기
    if(skyWalkable(px0, p.z)){ p.x = px0; return true; }
    if(skyWalkable(p.x, pz0)){ p.z = pz0; return true; }
    p.x = px0; p.z = pz0; return true;
  }
  return false;                             // 갈 수 없는 곳이면 예전처럼 x=620 에서 막힘
}

// 로프길 위에서는 길을 따라 걷게 도와줘요: 위쪽 키 = 길 따라 올라가기, 아래쪽 키 = 내려가기, 옆 키 = 길 폭 안에서 좌우로.
// 카메라도 걷는 방향(길의 접선)을 따라 부드럽게 돌아요. 길이 휘어도 키를 계속 누르고만 있으면 돼요.
var SKY_ASSIST_ON = false;
function skyRopeAssist(p, px0, pz0, cs, sx, rawV, dt){
  var on = skyRopeAssist0(p, px0, pz0, cs, sx, rawV, dt);
  if(SKY_ASSIST_ON && !on) cs.prevV = 999;        // 쉼터로 들어서면 지금 보는 방향 기준으로 키 방향을 다시 잡아요
  SKY_ASSIST_ON = on;
  return on;
}
function skyRopeAssist0(p, px0, pz0, cs, sx, rawV, dt){
  if(SKY_REF < 2 || px0 <= SKY.edgeX) return false;
  var T = SKY.tree, ddx = px0 - T.x, ddz = pz0 - T.z, R = Math.sqrt(ddx*ddx + ddz*ddz);
  if(R < 8 || !skyRopeClamp(px0, pz0)) return false;
  var bc = []; skyBranchCands(px0, pz0, bc);
  for(var bi = 0; bi < bc.length; bi++) if(Math.abs(bc[bi] - SKY_REF) <= 2.5) return false;      // 가지 다리 입구/다리 위에서는 자유롭게
  p.x = px0; p.z = pz0;
  if(!rawV && !sx) return true;
  var s = SPEED*0.8*dt, th = Math.atan2(ddz, ddx), cr = Math.cos(th), sr = Math.sin(th);
  var Y = cs.yaw, rightX = -Math.cos(Y), rightZ = Math.sin(Y);
  var dR = sx * (rightX*cr + rightZ*sr) * s * 0.8;
  var R2 = Math.max(10, R + dR), th2 = th + rawV * s / R2;
  p.x = T.x + R2*Math.cos(th2); p.z = T.z + R2*Math.sin(th2);
  p.walking = true;
  if(rawV){
    var up = rawV > 0 ? 1 : -1, tx = -Math.sin(th2)*up, tz = Math.cos(th2)*up;
    turnCameraTo(Math.atan2(tx, tz), 1.2, 1.8);
    p.dir = up > 0 ? "back" : "front";
  } else p.dir = (sx*(rightX*cr + rightZ*sr)) > 0 ? "right" : "left";
  return true;
}

// ---- 가지 다리 + 걷는 3D 섬 (마법 나무 쉼터에서 뻗어 나가 섬들을 이어요) ----
// 섬: 높이가 쉼터 높이와 같아서 가지 다리가 수평으로 이어져요. 다리는 [시작 쉼터 높이 or 섬 번호 → 섬 번호] 순서.
var SKY_ISL = [
  { x:1330, z:2090, r:38, y:200, trees:6 },   // 0
  { x:1340, z:2260, r:34, y:200, trees:5 },   // 1
  { x:1015, z:1900, r:40, y:480, trees:6 },   // 2
  { x:1090, z:1770, r:36, y:480, trees:5 }    // 3
];
var SKY_BR = (function(){
  var T = SKY.tree, out = [];
  function fromLanding(L, ii){
    var sp = skySpiralAt(L), rx = Math.cos(sp.th), rz = Math.sin(sp.th), off = T.hw + 4;
    var ax = sp.x + rx*off, az = sp.z + rz*off, I = SKY_ISL[ii], dx = I.x - ax, dz = I.z - az, d = Math.hypot(dx, dz);
    out.push({ ax:ax, az:az, bx:I.x - dx/d*(I.r - 4), bz:I.z - dz/d*(I.r - 4), y:L, fromTree:true });
  }
  function between(i, j){
    var A = SKY_ISL[i], B = SKY_ISL[j], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
    out.push({ ax:A.x + dx/d*(A.r - 4), az:A.z + dz/d*(A.r - 4), bx:B.x - dx/d*(B.r - 4), bz:B.z - dz/d*(B.r - 4), y:A.y });
  }
  fromLanding(200, 0); between(0, 1);
  fromLanding(480, 2); between(2, 3);
  // 쉼터 395 → 천공 섬 (쉼터 방향이 천공 섬을 정확히 향하는 높이를 골라서, 다리가 줄기를 가로지르지 않게)
  var sp = skySpiralAt(SKY.top.y), rx = Math.cos(sp.th), rz = Math.sin(sp.th), ax = sp.x + rx*(T.hw + 4), az = sp.z + rz*(T.hw + 4);
  var tx = SKY.top.x - ax, tz = SKY.top.z - az, td = Math.hypot(tx, tz);
  out.push({ ax:ax, az:az, bx:SKY.top.x - tx/td*(SKY.top.r - 4), bz:SKY.top.z - tz/td*(SKY.top.r - 4), y:SKY.top.y, fromTree:true });
  return out;
})();
var SKY_BR_HW = 4.5;
function skyBranchCands(x, z, c){
  var i, hw2 = SKY_BR_HW*SKY_BR_HW;
  for(i = 0; i < SKY_ISL.length; i++){ var I = SKY_ISL[i]; if(Math.hypot(x - I.x, z - I.z) <= I.r - 3) c.push(I.y); }
  for(i = 0; i < SKY_BR.length; i++){
    var b = SKY_BR[i], vx = b.bx - b.ax, vz = b.bz - b.az, wx = x - b.ax, wz = z - b.az, l2 = vx*vx + vz*vz;
    var u = Math.max(0, Math.min(1, (wx*vx + wz*vz)/l2)), ex = wx - u*vx, ez = wz - u*vz;
    if(ex*ex + ez*ez <= hw2) c.push(b.y);
    if(b.fromTree && (x - b.ax)*(x - b.ax) + (z - b.az)*(z - b.az) <= 196) c.push(b.y);      // 가지 다리 입구 쉼터 (반지름 14)
  }
}


// ---- 꼭대기 큰 섬의 건물들 (예배당, 정자, 크리스털 문, 아치): 통과할 수 없는 자리 ----
// 로프길 끝이 향하는 각도를 기준으로, 길을 막지 않게 둘레에 흩어 놓아요.
var SKY_PROPS = (function(){
  var T = SKY.tree, th = SKY_SPIRAL.ths[SKY_SPIRAL.n], out = { list:[], defs:[] };
  function at(a, r){ return { a:a, r:r, x:T.x + Math.cos(a)*r, z:T.z + Math.sin(a)*r }; }
  var chapel = at(th + 2.2, 74), gazebo = at(th - 2.1, 72), gate = at(th + Math.PI, 82), arch = at(th, 66);
  out.defs = { chapel:chapel, gazebo:gazebo, gate:gate, arch:arch };
  out.list.push({ x:chapel.x, z:chapel.z, rad:13 });
  out.list.push({ x:gazebo.x, z:gazebo.z, rad:10 });
  var tx = -Math.sin(gate.a), tz = Math.cos(gate.a);                  // 크리스털 문은 기둥 둘만 막고 가운데는 지나갈 수 있어요
  out.list.push({ x:gate.x + tx*9, z:gate.z + tz*9, rad:3.4 });
  out.list.push({ x:gate.x - tx*9, z:gate.z - tz*9, rad:3.4 });
  return out;
})();
function skyPropBlocked(x, z){
  var L = SKY_PROPS.list;
  for(var i = 0; i < L.length; i++){ var dx = x - L[i].x, dz = z - L[i].z; if(dx*dx + dz*dz < L[i].rad*L[i].rad) return true; }
  return false;
}

/* ---------------- 칠곡 농촌 마을 (서쪽 확장 땅, x < -620) ----------------
   기존 맵의 서쪽 끝(x=-620) 너머에 같은 풀밭 땅을 이어 붙이고, 논·비닐하우스·시골집을 놓은 구역이에요.
   x ≥ -620 (기존 맵)에서는 아무것도 바꾸지 않아요. */
var VIL = { westX:-620, x1:-2200, roadZ:250, roadHalf:7 };
var VILLAGE_PLACE = { id:"village", name:"칠곡 농촌 마을", sub:"논과 비닐하우스, 시골집이 있는 마을" };
// 통과할 수 없는 건물 자리 (x, z, 가로 절반, 세로 절반)
var VIL_RECTS = [
  { x:-790,  z:300, hx:16.5, hz:12.5 }, { x:-870,  z:200, hx:16.5, hz:12.5 }, { x:-950,  z:300, hx:16.5, hz:12.5 }, { x:-1030, z:200, hx:16.5, hz:12.5 },
  { x:-1180, z:290, hx:10, hz:10 },
  { x:-1260, z:305, hx:16, hz:10 }, { x:-1340, z:200, hx:15, hz:11.5 },
  { x:-680, z:158, hx:13, hz:78 }, { x:-680, z:340, hx:13, hz:76 },
  { x:-1130, z:222, hx:4.5, hz:4.5 }
];
// 골목 양옆의 돌담 (집 앞 대문 자리와 개울 자리는 비워요)
var VIL_GATES = [{ x:-680, z:236 }, { x:-870, z:236 }, { x:-1030, z:236 }, { x:-790, z:264 }, { x:-950, z:264 }];
var VIL_WALLS = [
  { x0:-650, x1:-666, z:236 }, { x0:-694, x1:-864, z:236 }, { x0:-876, x1:-1024, z:236 }, { x0:-1036, x1:-1230, z:236 },
  { x0:-650, x1:-666, z:264 }, { x0:-694, x1:-784, z:264 }, { x0:-796, x1:-944, z:264 }, { x0:-956, x1:-1230, z:264 }
];
var VIL_POND = { x:-1740, z:260, r:60 };
function vilWalkable(x, z){
  if(Math.abs(x - VIL_GH.cx) < VIL_GH.L/2 - 2 && Math.abs(z - VIL_GH.cz) < VIL_GH.hw) return true;      // 비닐하우스 안쪽 방
  if(x >= VIL.westX || x < VIL.x1 || z < -2650 || z > 2720) return false;
  if(Math.hypot(x - VIL_POND.x, z - VIL_POND.z) < VIL_POND.r) return false;
  for(var i = 0; i < VIL_RECTS.length; i++){ var r = VIL_RECTS[i]; if(Math.abs(x - r.x) < r.hx && Math.abs(z - r.z) < r.hz) return false; }
  for(i = 0; i < VIL_WALLS.length; i++){ var w = VIL_WALLS[i]; if(x < Math.max(w.x0, w.x1) + 1 && x > Math.min(w.x0, w.x1) - 1 && Math.abs(z - w.z) < 1.8) return false; }
  return true;
}
function vilConstrain(p, px0, pz0){
  if(p.x >= VIL.westX) return false;
  if(vilWalkable(p.x, p.z)) return true;
  if(px0 < VIL.westX){
    if(vilWalkable(px0, p.z)){ p.x = px0; return true; }
    if(vilWalkable(p.x, pz0)){ p.z = pz0; return true; }
    p.x = px0; p.z = pz0; return true;
  }
  return false;                              // 기존 맵에서 건물 자리로는 못 들어가요 (예전처럼 x=-620 에서 막힘)
}

/* ---------------- 농촌 마을 농사 체험 (모내기 → 벼 자라기 → 벼 베기 → 방앗간에서 쌀 찧기) ---------------- */
var VIL_FIELD_COLS = [-1170, -1250, -1330, -1410, -1490], VIL_FIELD_ROWS = [135, 368], VIL_FIELD_W = 72, VIL_FIELD_D = 96;
var VIL_GROW_MS = 18000;                     // 한 단계가 자라는 시간 (모내기 → 푸른 벼 → 황금 벼)
var VIL_MILL = { x:-1340, z:200 }, VIL_ELDERS = [{ x:-760, z:262, name:"마을 어르신", lines:["칠곡은 낙동강 물을 먹고 자란 쌀이 맛있기로 유명하단다.", "모내기부터 수확까지 한 번 해 보렴. 벼가 황금빛이 되면 E를 눌러 베는 거야."] }, { x:-1300, z:262, name:"방앗간 할머니", lines:["방앗간에서 벼를 찧으면 하얀 쌀이 나온단다.", "수고했구나, 칠곡 쌀로 밥 한 그릇 먹고 가렴."] }];
var VIL_FARM = (function(){
  var f = { fields:[], sickle:0, rice:0, bags:0, planted:0, harvested:0, melon:0, straw:0, stamped:0 }, i, raw = null;
  try{ raw = JSON.parse(localStorage.getItem("chilgok_farm_v2") || "null"); }catch(e){}
  var n = VIL_FIELD_COLS.length * VIL_FIELD_ROWS.length;
  for(i = 0; i < n; i++){ var st = (Math.floor(i/VIL_FIELD_COLS.length) + i) % 4; f.fields.push({ stage:st, at:0, wet:st > 0, weedAt:0 }); }
  if(raw && raw.fields && raw.fields.length === n){ for(var k in raw) f[k] = raw[k]; }
  return f;
})();
function vilSave(){ try{ localStorage.setItem("chilgok_farm_v2", JSON.stringify(VIL_FARM)); }catch(e){} }
function vilFieldIndex(c, r){ return r*VIL_FIELD_COLS.length + c; }
function vilFieldStage(i){                   // 시간이 지나면서 저절로 자라요 (1 모내기 → 2 푸른 벼 → 3 황금 벼)
  var fl = VIL_FARM.fields[i]; if(fl.stage === 0 || fl.stage === 3 || !fl.at) return fl.stage;
  var g = Math.floor((Date.now() - fl.at)/VIL_GROW_MS);
  return Math.max(1, Math.min(3, 1 + g));
}
function vilNearField(p){
  for(var r = 0; r < VIL_FIELD_ROWS.length; r++) for(var c = 0; c < VIL_FIELD_COLS.length; c++)
    if(Math.abs(p.x - VIL_FIELD_COLS[c]) < VIL_FIELD_W/2 + 5 && Math.abs(p.z - VIL_FIELD_ROWS[r]) < VIL_FIELD_D/2 + 5) return vilFieldIndex(c, r);
  return -1;
}
function vilWeedNow(i){ var fl = VIL_FARM.fields[i]; return fl.stage > 0 && fl.weedAt > 0 && Date.now() >= fl.weedAt; }
// 비닐하우스 안쪽 방 (밖에서 보이는 비닐하우스 4동이 모두 같은 방으로 이어져요)
var VIL_GH = { cx:-2600, cz:1500, L:160, hw:24, rows:[-14, 0, 14], cols:8 };
var VIL_GH_OUT = [];
(function(){ for(var i = 0; i < 16; i++) [440, 470].forEach(function(z){ var x = -820 - i*43; VIL_GH_OUT.push({ x:x, z:z }); VIL_RECTS.push({ x:x, z:z, hx:21.5, hz:10.5 }); }); })();
var VIL_GH_CROPS = (function(){ var a = [], r, c; for(r = 0; r < 3; r++) for(c = 0; c < VIL_GH.cols; c++) a.push({ r:r, c:c, x:VIL_GH.cx - 60 + c*16, z:VIL_GH.cz + VIL_GH.rows[r], ready:true, at:0, kind:r === 1 ? "straw" : "melon" }); return a; })();
function vilInGH(p){ return Math.abs(p.x - VIL_GH.cx) < VIL_GH.L/2 + 6 && Math.abs(p.z - VIL_GH.cz) < VIL_GH.hw + 6; }
function vilNearGHOut(p){ for(var i = 0; i < VIL_GH_OUT.length; i++) if(Math.abs(p.x - VIL_GH_OUT[i].x) < 33 && Math.abs(p.z - VIL_GH_OUT[i].z) < 20) return i; return -1; }
function vilGHCropNear(p){ for(var i = 0; i < VIL_GH_CROPS.length; i++){ var c = VIL_GH_CROPS[i]; if(Math.hypot(p.x - c.x, p.z - c.z) < 7) return i; } return -1; }
function vilGHReady(c){ return c.ready || (c.at && Date.now() - c.at > 14000); }
function vilTravel(p, x, z, yaw){
  if(window.skyTeleport) window.skyTeleport(p, x, z, 0);
  else { p.x = x; p.z = z; }
  var cs = state.cam; cs.yaw = cs.target = yaw; cs.yawVel = 0; cs.turn = null; cs.fx = x; cs.fz = z; cs.prevV = 999; SKY_REF = 0;
}
function villageHint(p){                     // 마을에서 E 를 누르면 무엇을 하는지 알려줘요 (없으면 null)
  if(p.x >= VIL.westX) return null;
  var d, i;
  var rd0 = window.vilRideHint ? window.vilRideHint(p) : null; if(rd0) return rd0;
  var rh = window.vilRiceHint ? window.vilRiceHint(p) : null; if(rh) return rh;
  if(vilInGH(p)){
    if(p.x > VIL_GH.cx + VIL_GH.L/2 - 14) return "E 눌러 비닐하우스 밖으로 나가기";
    i = vilGHCropNear(p); if(i >= 0) return vilGHReady(VIL_GH_CROPS[i]) ? (VIL_GH_CROPS[i].kind === "melon" ? "E 눌러 참외 따기" : "E 눌러 딸기 따기") : "열매가 자라는 중...";
    return null;
  }
  if(vilNearGHOut(p) >= 0) return "E 눌러 비닐하우스 들어가기";
  i = vilNearField(p);
  if(Math.hypot(p.x - VIL_MILL.x, p.z - VIL_MILL.z) < 38) return VIL_FARM.rice > 0 ? "E 눌러 벼 찧기 (벼 " + VIL_FARM.rice + ")" : "E 눌러 살펴보기";
  for(d = 0; d < VIL_ELDERS.length; d++) if(Math.hypot(p.x - VIL_ELDERS[d].x, p.z - VIL_ELDERS[d].z) < 14) return "E 눌러 인사하기";
  if(i >= 0){
    var fl = VIL_FARM.fields[i], st = vilFieldStage(i);
    if(st === 0) return fl.wet ? "E 눌러 모내기" : "E 눌러 물 대기";
    if(vilWeedNow(i)) return "E 눌러 잡초 뽑기";
    return st === 3 ? "E 눌러 벼 베기" : "벼가 자라는 중...";
  }
  return null;
}
function villageInteract(p){ var r = villageInteract0(p); if(r && window.playSfx) window.playSfx("good"); return r; }
function villageInteract0(p){                 // 처리했으면 true
  if(p.x >= VIL.westX) return false;
  var d, i;
  if(window.vilRideInteract && window.vilRideInteract(p)) return true;
  if(window.vilRiceInteract && window.vilRiceInteract(p)) return true;
  if(vilInGH(p)){
    if(p.x > VIL_GH.cx + VIL_GH.L/2 - 14){ vilTravel(p, -862, 458, Math.PI); return true; }
    i = vilGHCropNear(p);
    if(i >= 0){
      var c = VIL_GH_CROPS[i];
      if(!vilGHReady(c)){ showToast("🌿 열매가 아직 자라는 중이에요."); return true; }
      c.ready = false; c.at = Date.now();
      if(c.kind === "melon"){ VIL_FARM.melon++; showToast("🍈 참외를 땄어요! (참외 " + VIL_FARM.melon + "개)"); } else { VIL_FARM.straw++; showToast("🍓 딸기를 땄어요! (딸기 " + VIL_FARM.straw + "개)"); }
      vilSave(); if(window.villageRefresh) window.villageRefresh(); return true;
    }
    return true;
  }
  if(vilNearGHOut(p) >= 0){ vilTravel(p, VIL_GH.cx + 30, VIL_GH.cz, -Math.PI/2); showToast("🌱 비닐하우스 안이에요. 익은 열매 앞에서 E 를 눌러 따 보세요!"); return true; }
  i = vilNearField(p);
  if(Math.hypot(p.x - VIL_MILL.x, p.z - VIL_MILL.z) < 38){
    if(VIL_FARM.rice <= 0){ showToast("🌾 방앗간이에요. 논에서 벼를 베어 오면 쌀로 찧어 드려요!"); return true; }
    VIL_FARM.bags += VIL_FARM.rice; var n = VIL_FARM.rice; VIL_FARM.rice = 0;
    var msg = "🍚 벼 " + n + "단을 찧어 칠곡 쌀 " + n + "포대를 얻었어요! (모두 " + VIL_FARM.bags + "포대)";
    if(VIL_FARM.bags >= 3 && !VIL_FARM.stamped){ VIL_FARM.stamped = 1; try{ state.stamps.add("rice"); writeSave(); }catch(e){} msg += "  🏅 칠곡 쌀 도장을 받았어요!"; }
    vilSave(); if(window.villageRefresh) window.villageRefresh(); showToast(msg); return true;
  }
  for(d = 0; d < VIL_ELDERS.length; d++) if(Math.hypot(p.x - VIL_ELDERS[d].x, p.z - VIL_ELDERS[d].z) < 14){
    var E = VIL_ELDERS[d]; E.k = ((E.k|0) + 1) % E.lines.length; showToast("👴 " + E.name + ": " + E.lines[E.k]); return true;
  }
  if(i >= 0){
    var fl = VIL_FARM.fields[i], st = vilFieldStage(i);
    if(st === 0){
      if(!fl.wet){ fl.wet = true; showToast("💧 수로 물을 논에 댔어요! 이제 모를 심을 수 있어요."); }
      else { fl.stage = 1; fl.at = Date.now(); fl.weedAt = Date.now() + 9000; VIL_FARM.planted++; showToast("🌱 모내기 완료! 벼가 자라는 동안 잡초가 올라오면 뽑아 주세요."); }
    } else if(vilWeedNow(i)){ fl.weedAt = 0; showToast("🌿 잡초를 뽑았어요!"); }
    else if(st === 3){ fl.stage = 0; fl.at = 0; fl.wet = false; fl.weedAt = 0; VIL_FARM.rice++; VIL_FARM.harvested++; showToast("🌾 벼를 베었어요! 방앗간에서 쌀로 찧어 보세요. (벼 " + VIL_FARM.rice + "단)"); }
    else { showToast("🌿 벼가 아직 자라는 중이에요. 황금빛이 되면 베어요!"); return true; }
    vilSave(); if(window.villageRefresh) window.villageRefresh(); return true;
  }
  return false;
}
