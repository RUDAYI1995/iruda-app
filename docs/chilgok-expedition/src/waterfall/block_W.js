    // ================= 폭포 + 흐르는 강 (호국의 다리 강 상류) =================
    // 강은 서쪽 끝의 절벽 폭포에서 시작해서 동쪽으로 흘러 호국의 다리 밑을 지나 바위산 동굴로 들어가요.
    // 월드가 만들어진 뒤(첫 프레임)에 한 번 붙여요. 땅에 강 모양 구멍을 내고, 절벽·소나무·바위·물을 따로 만든 그룹(riverFall)에 담아요.
    (function buildRiverFall(){
      var XA = -300, ZC = 690, WY = -0.25, BED = -1.2, H0 = 72, XE = 548, XMIN = XA - 120, ZLO = 420, ZHI = 960;
      var built = false, RF = null, WU = null, FU = null, mist = [], lastWorld = null;
      function sm(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      function hash(i, j){ var s = Math.sin(i*127.1 + j*311.7)*43758.5453; return s - Math.floor(s); }
      function vn(x, z){ var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz; fx = fx*fx*(3 - 2*fx); fz = fz*fz*(3 - 2*fz);
        var a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return (a + (b - a)*fx) + ((c + (d - c)*fx) - (a + (b - a)*fx))*fz; }
      var seed = 4242; function rnd(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
      function hw(x){                                           // 강 폭의 절반 (서쪽 개울 → 다리 밑 넓은 강 → 동쪽 동굴 입구)
        var a = 46 - 6*sm(XA, XA + 60, x), h = a + (120 - a)*sm(-190, -30, x);
        h *= 1 - 0.68*sm(430, 545, x);
        var wig = 3.0*Math.sin(x*0.045 + 1.0) + 1.6*Math.sin(x*0.13 + 2.0);
        return h + wig*(0.4 + 0.6*sm(-250, -120, x))*(1 - sm(480, 545, x));
      }
      window.RIVER = { hw:hw, XA:XA, XE:XE, ZC:ZC, WY:WY };
      function gorgeH(x, z){                                    // 서쪽 협곡 절벽 높이
        var dz = Math.abs(z - ZC) - hw(Math.max(x, XA)), dx = XA - x;
        var d = (x < XA) ? (dz > 0 ? Math.hypot(dz, dx) : dx) : dz;
        d += (vn(x*0.07, z*0.07) - 0.5)*9;
        var Hm = H0*(1 - sm(XA + 10, -70, x)), tx = sm(XMIN, XMIN + 90, x), tz = sm(0, 110, Math.min(z - ZLO, ZHI - z));
        var wall = sm(0, 16, d), k = Hm/H0*tx*tz;
        var h = H0*k*wall + wall*k*(vn(x*0.06, z*0.06)*7 + vn(x*0.15, z*0.15)*3.5);
        if(x < XA - 8){ var f = (1 - sm(20, 34, Math.abs(z - ZC)))*wall; h = h + (H0*k - h)*f; }
        return h;
      }
      function eastH(x, z){                                     // 동쪽 바위산 (강이 이 안으로 들어가요)
        var r2 = Math.pow((x - 650)/150, 2) + Math.pow((z - ZC)/260, 2), h = r2 < 1 ? 40*Math.pow(1 - r2, 0.6) : 0;
        h += h > 0 ? (vn(x*0.06, z*0.06)*6 + vn(x*0.15, z*0.15)*3)*sm(0, 6, h) : 0;
        if(x < XE){ var dr = Math.abs(z - ZC) - hw(x); h *= sm(0, 8, dr); }
        return h;
      }
      function terrainH(x, z){ return x < -30 ? gorgeH(x, z) : eastH(x, z); }
      window.RIVER.h = terrainH;
      // ---------- 합쳐 그리기 도우미 ----------
      function Mesher(){ this.p = []; this.c = []; }
      Mesher.prototype.add = function(geo, m4, colFn){
        var g = geo.index ? geo.toNonIndexed() : geo, P = g.attributes.position, v = new THREE.Vector3(), tri = [0, 0, 0], i, j;
        for(i = 0; i < P.count; i += 3){
          var vs = [];
          for(j = 0; j < 3; j++){ v.set(P.getX(i + j), P.getY(i + j), P.getZ(i + j)).applyMatrix4(m4); vs.push(v.x, v.y, v.z); }
          var ax = vs[3] - vs[0], ay = vs[4] - vs[1], az = vs[5] - vs[2], bx = vs[6] - vs[0], by = vs[7] - vs[1], bz = vs[8] - vs[2];
          var nx = ay*bz - az*by, ny = az*bx - ax*bz, nz = ax*by - ay*bx, nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
          var c = colFn((vs[0] + vs[3] + vs[6])/3, (vs[1] + vs[4] + vs[7])/3, (vs[2] + vs[5] + vs[8])/3, nx, ny, nz);
          for(j = 0; j < 9; j++) this.p.push(vs[j]);
          for(j = 0; j < 3; j++) this.c.push(c[0], c[1], c[2]);
        }
      };
      Mesher.prototype.mesh = function(mat){
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(this.c, 3));
        g.computeVertexNormals(); g.computeBoundingSphere(); return new THREE.Mesh(g, mat);
      };
      function matV(extra){ var o = { vertexColors:true, flatShading:true, roughness:0.95, metalness:0 }; if(extra) for(var k in extra) o[k] = extra[k]; return new THREE.MeshStandardMaterial(o); }
      var M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), T = new THREE.Vector3();
      function mx(x, y, z, rx, ry, rz, sx, sy, sz){ E.set(rx, ry, rz); Q.setFromEuler(E); T.set(x, y, z); S.set(sx, sy, sz); return M4.compose(T, Q, S).clone(); }

      // ---------- 절벽(높이 지도) ----------
      var GRASS = [[0.27, 0.55, 0.10], [0.32, 0.60, 0.12], [0.23, 0.50, 0.09]];
      function rockCol(x, y, z, nx, ny, nz){
        var n = hash(Math.floor(x*0.9), Math.floor(z*0.9) + Math.floor(y*0.7)), sh = 0.27 + 0.13*n + 0.07*ny + (nx*0.5 + nz*0.3)*0.05;
        return [sh*0.97, sh, sh*1.04];
      }
      function terrainMesh(x0, x1, z0, z1, step, hf){
        var nx = Math.round((x1 - x0)/step), nz = Math.round((z1 - z0)/step), H = [], i, j, ms = new Mesher();
        for(j = 0; j <= nz; j++) for(i = 0; i <= nx; i++) H.push(hf(x0 + i*step, z0 + j*step));
        function h(i, j){ return H[j*(nx + 1) + i]; }
        function P(i, j){ return [x0 + i*step, h(i, j), z0 + j*step]; }
        function tri(a, b, c){
          var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
          var nX = uy*vz - uz*vy, nY = uz*vx - ux*vz, nZ = ux*vy - uy*vx, nl = Math.hypot(nX, nY, nZ) || 1; nX /= nl; nY /= nl; nZ /= nl;
          var cx = (a[0] + b[0] + c[0])/3, cy = (a[1] + b[1] + c[1])/3, cz = (a[2] + b[2] + c[2])/3, col;
          if(nY > 0.66){ var g = GRASS[Math.floor(hash(Math.floor(cx*0.5), Math.floor(cz*0.5))*3)%3], sh = 0.9 + 0.2*hash(Math.floor(cx), Math.floor(cz)); col = [g[0]*sh, g[1]*sh, g[2]*sh]; }
          else col = rockCol(cx, cy, cz, nX, nY, nZ);
          ms.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); for(var q = 0; q < 3; q++) ms.c.push(col[0], col[1], col[2]);
        }
        for(j = 0; j < nz; j++) for(i = 0; i < nx; i++){
          var h00 = h(i, j), h10 = h(i + 1, j), h01 = h(i, j + 1), h11 = h(i + 1, j + 1);
          if(Math.max(h00, h10, h01, h11) < 0.5) continue;
          var a = P(i, j), b = P(i + 1, j), c = P(i, j + 1), d = P(i + 1, j + 1);
          if((i + j) % 2){ tri(a, c, d); tri(a, d, b); } else { tri(a, c, b); tri(b, c, d); }
        }
        return ms.mesh(matV({ polygonOffset:true, polygonOffsetFactor:-2, polygonOffsetUnits:-2 }));
      }
      // ---------- 폭포 물줄기 ----------
      var NOISE_GLSL = "float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x*p.y); }\n" +
        "float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f); return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y); }\n";
      function fallMesh(){
        var NC = 16, NR = 30, pos = [], uv = [], idx = [], i, j;
        for(j = 0; j <= NR; j++){
          var u = j/NR, y = (H0 - 0.8) - (H0 - 0.8 - (WY + 0.4))*u, half = 20 + 9*u + 1.8*Math.sin(u*6.0);
          for(i = 0; i <= NC; i++){
            var s = i/NC, z = ZC + (s - 0.5)*2*half, lo = XA - 24, hi = XA + 3, k;
            for(k = 0; k < 18; k++){ var mid = (lo + hi)/2; if(gorgeH(mid, z) > y) lo = mid; else hi = mid; }
            var bulge = 1.6 + 2.2*u*u + 1.2*Math.sin(s*Math.PI);
            pos.push(hi + bulge, y, z); uv.push(s, u);
          }
        }
        for(j = 0; j < NR; j++) for(i = 0; i < NC; i++){ var a = j*(NC + 1) + i, b = a + 1, c = a + NC + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeBoundingSphere();
        FU = { uT:{ value:0 }, uL:{ value:1 }, uFog:{ value:new THREE.Color(0xbfe0ff) }, uFogR:{ value:new THREE.Vector2(380, 1500) } };
        var m = new THREE.ShaderMaterial({ uniforms:FU, transparent:true, depthWrite:false, side:THREE.DoubleSide,
          vertexShader:"varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
          fragmentShader:"uniform float uT, uL; uniform vec3 uFog; uniform vec2 uFogR; varying vec2 vUv; varying vec3 vW;\n" + NOISE_GLSL +
            "void main(){ float sx = vUv.x, y = vUv.y, t = uT;\n" +
            "  float s = vn(vec2(sx*24.0, y*3.0 - t*1.7))*0.5 + vn(vec2(sx*52.0 + 7.0, y*5.5 - t*2.8))*0.3 + vn(vec2(sx*9.0, y*1.6 - t*1.1))*0.2;\n" +
            "  float cl = vn(vec2(sx*8.0 + t*0.2, y*7.0 - t*3.6));\n" +
            "  float core = smoothstep(0.20, 0.66, s + 0.34*cl + y*0.34);\n" +
            "  vec3 col = mix(vec3(0.42, 0.74, 0.93), vec3(0.97, 0.99, 1.0), core);\n" +
            "  col = mix(col, vec3(1.0), smoothstep(0.78, 1.0, y));\n" +
            "  float edge = smoothstep(0.0, 0.14, sx)*smoothstep(1.0, 0.86, sx), topf = smoothstep(0.0, 0.05, y);\n" +
            "  float a = (0.78 + 0.22*core)*edge*topf; a = mix(a, a*0.8 + 0.2, smoothstep(0.85, 1.0, y));\n" +
            "  col *= mix(0.40, 1.0, uL); gl_FragColor = vec4(col, a);\n" +
            "  #include <tonemapping_fragment>\n" +
            "  float fd = length(cameraPosition - vW); gl_FragColor.rgb = mix(gl_FragColor.rgb, uFog, smoothstep(uFogR.x, uFogR.y, fd)); }" });
        var mesh = new THREE.Mesh(g, m); mesh.renderOrder = 3; mesh.frustumCulled = false; return mesh;
      }
      // ---------- 강물 ----------
      function waterMesh(ring){
        var pts = ring.map(function(q){ return new THREE.Vector2(q[0], -q[1]); }), shape = new THREE.Shape(pts), g = new THREE.ShapeGeometry(shape);
        g.rotateX(-Math.PI/2); g.translate(0, WY, 0);
        WU = { uT:{ value:0 }, uL:{ value:1 }, uFog:{ value:new THREE.Color(0xbfe0ff) }, uFogR:{ value:new THREE.Vector2(380, 1500) }, uSun:{ value:new THREE.Vector3(0.5, 0.6, -0.2).normalize() }, uXA:{ value:XA }, uZC:{ value:ZC } };
        var hwGlsl = "float hwf(float x){ float a = 46.0 - 6.0*smoothstep(" + XA + ".0, " + (XA + 60) + ".0, x); float h = a + (120.0 - a)*smoothstep(-190.0, -30.0, x); h *= 1.0 - 0.68*smoothstep(430.0, 545.0, x);\n" +
          "  float wig = 3.0*sin(x*0.045 + 1.0) + 1.6*sin(x*0.13 + 2.0); return h + wig*(0.4 + 0.6*smoothstep(-250.0, -120.0, x))*(1.0 - smoothstep(480.0, 545.0, x)); }\n";
        var m = new THREE.ShaderMaterial({ uniforms:WU, transparent:true, depthWrite:false, side:THREE.DoubleSide,
          vertexShader:"varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
          fragmentShader:"uniform float uT, uL, uXA, uZC; uniform vec3 uFog, uSun; uniform vec2 uFogR; varying vec3 vW;\n" + NOISE_GLSL + hwGlsl +
            "float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 3; i++){ s += a*vn(p); p = p*2.03 + vec2(11.7, 3.1); a *= 0.5; } return s; }\n" +
            "float hgt(vec2 p){ return fbm(p*0.30 - vec2(uT*1.2, 0.0)) + 0.35*fbm(p*0.85 - vec2(uT*2.1, uT*0.2)); }\n" +
            "void main(){ vec2 p = vW.xz; float e = 0.4, h0 = hgt(p), hx = hgt(p + vec2(e, 0.0)), hz = hgt(p + vec2(0.0, e));\n" +
            "  vec3 n = normalize(vec3(-(hx - h0)/e*1.1, 1.0, -(hz - h0)/e*1.1)); vec3 V = normalize(cameraPosition - vW);\n" +
            "  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0)*0.5 + 0.04;\n" +
            "  float edgeD = hwf(p.x) - abs(p.y - uZC); float depth = clamp(edgeD/20.0, 0.0, 1.0);\n" +
            "  float headD = distance(p, vec2(uXA + 14.0, uZC)); float plunge = 1.0 - smoothstep(0.0, 75.0, headD);\n" +
            "  vec3 col = mix(vec3(0.20, 0.76, 0.76), vec3(0.04, 0.34, 0.66), depth);\n" +
            "  col = mix(col, vec3(0.50, 0.85, 0.92), plunge*0.55);\n" +
            "  vec3 sky = mix(vec3(0.36, 0.64, 0.94), uFog, 0.2); col = mix(col, sky, fres);\n" +
            "  vec3 Hh = normalize(uSun + V); col += vec3(1.0, 0.95, 0.82)*pow(max(dot(n, Hh), 0.0), 80.0)*0.9;\n" +
            "  col += vec3(0.10, 0.14, 0.16)*smoothstep(0.55, 0.85, hgt(p*vec2(1.0, 2.4) + 3.0));\n" +
            "  float fn = vn(p*0.8 - vec2(uT*1.3, 0.0))*0.6 + vn(p*2.4 - vec2(uT*2.2, 0.0))*0.4;\n" +
            "  float ef = 1.0 - smoothstep(0.4, 3.5 + 3.5*fn, edgeD);\n" +
            "  float pz = abs(mod(p.y - 570.0 + 8.0, 16.0) - 8.0); float pd = length(vec2(max(abs(p.x) - 4.25, 0.0), max(pz - 2.5, 0.0)));\n" +
            "  float pf = (1.0 - smoothstep(0.3, 2.2 + 2.2*fn, pd))*step(abs(p.y - uZC), 124.0);\n" +
            "  float wake = (1.0 - smoothstep(0.0, 9.0, max(p.x - 3.0, 0.0)))*step(0.0, p.x)*(1.0 - smoothstep(0.0, 2.2, max(pz - 2.5, 0.0)))*0.5;\n" +
            "  float foam = clamp(ef*0.95 + pf + wake*fn + plunge*smoothstep(0.30, 0.65, fn + plunge*0.45), 0.0, 1.0);\n" +
            "  col = mix(col, vec3(0.97, 0.99, 1.0), foam*smoothstep(0.30, 0.62, fn + 0.25));\n" +
            "  col *= 1.0 - 0.80*smoothstep(500.0, 548.0, p.x);\n" +
            "  col *= mix(0.34, 1.0, uL);\n" +
            "  float al = mix(0.66, 0.95, depth); al = max(al, foam*0.92);\n" +
            "  gl_FragColor = vec4(col, al);\n" +
            "  #include <tonemapping_fragment>\n" +
            "  float fd = length(cameraPosition - vW); gl_FragColor.rgb = mix(gl_FragColor.rgb, uFog, smoothstep(uFogR.x, uFogR.y, fd)); }" });
        var mesh = new THREE.Mesh(g, m); mesh.renderOrder = 2; mesh.frustumCulled = false; return mesh;
      }
      // ---------- 강바닥 + 둑 ----------
      function bedMeshes(){
        var xs = [], x; for(x = XA; x < XE; x += 10) xs.push(x); xs.push(XE);
        var pos = [], col = [], idx = [], n = xs.length;
        function vtx(x, y, z, c){ pos.push(x, y, z); col.push(c[0], c[1], c[2]); return pos.length/3 - 1; }
        var bank = [0.40, 0.34, 0.22], low = [0.30, 0.34, 0.34], k, s;
        [-1, 1].forEach(function(sd){
          var top = [], bot = [];
          for(k = 0; k < n; k++){ var xx = xs[k], zz = ZC + sd*hw(xx); top.push(vtx(xx, 0, zz, bank)); bot.push(vtx(xx, BED, zz - sd*3, low)); }
          for(k = 0; k < n - 1; k++){ if(sd < 0) idx.push(top[k], bot[k], top[k + 1], top[k + 1], bot[k], bot[k + 1]); else idx.push(top[k], top[k + 1], bot[k], top[k + 1], bot[k + 1], bot[k]); }
        });
        // 폭포 쪽 끝 둑
        var hT = vtx(XA, 0, ZC - hw(XA), bank), hB = vtx(XA, 0, ZC + hw(XA), bank), hT2 = vtx(XA + 5, BED, ZC - hw(XA) + 5, low), hB2 = vtx(XA + 5, BED, ZC + hw(XA) - 5, low);
        idx.push(hT, hT2, hB, hB, hT2, hB2);
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
        var bank_m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors:true, flatShading:true, roughness:1, side:THREE.DoubleSide }));
        var ring = []; for(k = 0; k < n; k++) ring.push([xs[k], ZC - hw(xs[k]) + 5]); for(k = n - 1; k >= 0; k--) ring.push([xs[k], ZC + hw(xs[k]) - 5]);
        var sh = new THREE.Shape(ring.map(function(q){ return new THREE.Vector2(q[0], -q[1]); })), bg = new THREE.ShapeGeometry(sh); bg.rotateX(-Math.PI/2); bg.translate(0, BED, 0);
        var bed_m = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color:0x6d6c5c, roughness:1 }));
        return [bank_m, bed_m];
      }
      // ---------- 땅에 강 모양 구멍 ----------
      function cutGround(ground){
        var par = ground.geometry.parameters, W = par.width, D = par.height, cz = ground.position.z, xs = [], x;
        for(x = XA; x < XE; x += 10) xs.push(x); xs.push(XE);
        var ring = []; xs.forEach(function(xx){ ring.push([xx, ZC - hw(xx)]); }); for(var k = xs.length - 1; k >= 0; k--) ring.push([xs[k], ZC + hw(xs[k])]);
        var shape = new THREE.Shape([new THREE.Vector2(-W/2, -D/2), new THREE.Vector2(W/2, -D/2), new THREE.Vector2(W/2, D/2), new THREE.Vector2(-W/2, D/2)]);
        shape.holes.push(new THREE.Path(ring.map(function(q){ return new THREE.Vector2(q[0], cz - q[1]); })));
        var g = new THREE.ShapeGeometry(shape), P = g.attributes.position, U = g.attributes.uv;
        for(var i = 0; i < P.count; i++) U.setXY(i, (P.getX(i) + W/2)/W, (P.getY(i) + D/2)/D);
        U.needsUpdate = true; ground.geometry.dispose(); ground.geometry = g;
      }
      // ---------- 소나무 / 바위 / 갈대 / 버섯 ----------
      function pineInto(ms, x, y, z, Hh){
        var tl = Hh*0.9, lean = (rnd() - 0.5)*0.05;
        ms.add(new THREE.CylinderGeometry(Hh*0.022, Hh*0.04, tl, 5), mx(x, y + tl/2, z, 0, 0, lean, 1, 1, 1), function(){ return [0.42 + rnd()*0.06, 0.20, 0.14]; });
        var tiers = 6, t, q;
        for(t = 0; t < tiers; t++){
          var f = t/(tiers - 1), yy = y + Hh*(0.22 + 0.70*f), r = Hh*(0.30 - 0.22*f);
          for(q = 0; q < 4; q++){
            var a = rnd()*6.283 + t, off = r*0.35*(1 - f*0.5), tilt = 0.45 + rnd()*0.25, rl = Hh*(0.12 + 0.05*(1 - f));
            ms.add(new THREE.ConeGeometry(r*(0.55 + rnd()*0.3), rl, 5), mx(x + Math.cos(a)*off, yy, z + Math.sin(a)*off, Math.sin(a)*tilt*0.5, rnd()*6, -Math.cos(a)*tilt*0.5, 1, 0.55, 1),
              function(px, py, pz, nx, ny){ var g = 0.30 + 0.34*f*0.6 + 0.12*Math.max(ny, 0) + rnd()*0.06; return [0.16 + 0.12*f, g + 0.22, 0.10 + 0.06*f]; });
          }
        }
        ms.add(new THREE.ConeGeometry(Hh*0.05, Hh*0.14, 5), mx(x, y + Hh*0.98, z, 0, 0, 0, 1, 1, 1), function(){ return [0.26, 0.62, 0.18]; });
      }
      function rockInto(ms, x, y, z, r, sy){
        var g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position, v = new THREE.Vector3(), i;
        for(i = 0; i < P.count; i++){ v.set(P.getX(i), P.getY(i), P.getZ(i)); var k = 0.78 + 0.5*hash(Math.round(v.x*40) + x*7, Math.round(v.y*40) + Math.round(v.z*40) + z*3); P.setXYZ(i, v.x*k, v.y*k, v.z*k); }
        ms.add(g, mx(x, y, z, rnd()*3, rnd()*6, rnd()*3, r, r*(sy || 0.7), r*(0.8 + rnd()*0.4)), function(px, py, pz, nx, ny){ var b = 0.30 + 0.12*hash(Math.floor(px), Math.floor(pz) + Math.floor(py)) + 0.10*ny; return [b, b*1.01, b*1.05]; });
      }
      function reedsInto(ms, x, y, z){
        var n = 5 + Math.floor(rnd()*4), i;
        for(i = 0; i < n; i++){
          var a = rnd()*6.283, hh = 5 + rnd()*6, bend = (rnd() - 0.3)*0.45, bx = x + Math.cos(a)*1.4*rnd(), bz = z + Math.sin(a)*1.4*rnd();
          ms.add(new THREE.ConeGeometry(0.42, hh, 3), mx(bx + Math.cos(a)*bend*hh*0.3, y + hh/2 - 0.5, bz + Math.sin(a)*bend*hh*0.3, Math.sin(a)*bend, 0, -Math.cos(a)*bend, 1, 1, 1),
            function(px, py){ var t = Math.min(1, (py - y + 1)/hh); return [0.26 + 0.12*t, 0.62 + 0.16*t, 0.14 + 0.06*t]; });
        }
      }
      function mushroomInto(ms, x, y, z, s){
        ms.add(new THREE.CylinderGeometry(0.35*s, 0.45*s, 1.3*s, 5), mx(x, y + 0.65*s, z, 0, 0, 0, 1, 1, 1), function(){ return [0.92, 0.88, 0.78]; });
        ms.add(new THREE.SphereGeometry(1.4*s, 7, 4, 0, 6.283, 0, 1.45), mx(x, y + 1.25*s, z, 0, 0, 0, 1, 0.8, 1), function(px, py, pz, nx, ny){ return ny > 0.1 && hash(Math.floor(px*2.2), Math.floor(pz*2.2)) > 0.72 ? [0.98, 0.95, 0.9] : [0.82, 0.20, 0.12]; });
      }
      // ---------- 물안개 ----------
      function mistTex(){
        var c = document.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
        r.addColorStop(0, "rgba(255,255,255,0.95)"); r.addColorStop(0.45, "rgba(255,255,255,0.55)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      }
      // ---------- 조립 ----------
      function build(ground){
        RF = new THREE.Group(); RF.name = "riverFall"; scene.add(RF);
        cutGround(ground);
        bedMeshes().forEach(function(m){ RF.add(m); });
        var wm = waterMesh((function(){ var xs = [], r = [], x, k; for(x = XA; x < XE; x += 10) xs.push(x); xs.push(XE); xs.forEach(function(xx){ r.push([xx, ZC - hw(xx) + 0.5]); }); for(k = xs.length - 1; k >= 0; k--) r.push([xs[k], ZC + hw(xs[k]) - 0.5]); return r; })());
        wm.name = "riverWater"; RF.add(wm);
        var g1 = terrainMesh(XMIN, -30, ZLO, ZHI, 5, gorgeH); g1.name = "gorge"; g1.receiveShadow = true; RF.add(g1);
        var g2 = terrainMesh(500, 760, ZLO, ZHI, 5, eastH); g2.name = "eastRock"; g2.receiveShadow = true; RF.add(g2);
        var fm = fallMesh(); fm.name = "waterfall"; RF.add(fm);
        // 위 개울(폭포 바로 위 물길)
        var up = new THREE.Mesh(new THREE.PlaneGeometry(110, 38), new THREE.MeshBasicMaterial({ color:0x6fc4e8, transparent:true, opacity:0.9 })); up.rotation.x = -Math.PI/2; up.position.set(XA - 70, H0 + 0.35, ZC); up.renderOrder = 1; RF.add(up);
        // 동굴 입구
        var cave = new THREE.Mesh(new THREE.CircleGeometry(1, 24, 0, Math.PI), new THREE.MeshBasicMaterial({ color:0x04070c, side:THREE.DoubleSide })); var hE = hw(XE - 1);
        cave.scale.set(hE*0.98, 24, 1); cave.rotation.y = -Math.PI/2; cave.position.set(XE - 0.15, WY, ZC); RF.add(cave);
        // 소나무 / 바위 / 갈대 / 버섯
        var pines = new Mesher(), rocks = new Mesher(), deco = new Mesher(), i, tries, x, z, y, cnt = 0;
        function slope(x, z){ return Math.abs(terrainH(x + 2, z) - terrainH(x - 2, z)) + Math.abs(terrainH(x, z + 2) - terrainH(x, z - 2)); }
        for(tries = 0; tries < 900 && cnt < 70; tries++){ x = XMIN + 10 + rnd()*(XA - 8 - XMIN - 10 + 70); z = ZLO + 30 + rnd()*(ZHI - ZLO - 60); y = gorgeH(x, z);
          if(y < 4 || slope(x, z) > 3.2 || (Math.abs(z - ZC) < 26 && x < XA - 4)) continue; pineInto(pines, x, y - 0.3, z, 22 + rnd()*16); cnt++; }
        for(cnt = 0, tries = 0; tries < 500 && cnt < 22; tries++){ x = 560 + rnd()*190; z = 470 + rnd()*440; y = eastH(x, z); if(y < 6 || slope(x, z) > 3.4) continue; pineInto(pines, x, y - 0.3, z, 20 + rnd()*14); cnt++; }
        for(cnt = 0, tries = 0; tries < 800 && cnt < 34; tries++){ x = -240 + rnd()*740; z = rnd() < 0.5 ? 440 + rnd()*100 : 840 + rnd()*100; if(Math.abs(x) < 36) continue; if(Math.abs(z - ZC) < hw(x) + 8) continue; if(x > 400 && eastH(x, z) > 1) continue; y = terrainH(x, z); if(y > 1.5) continue; pineInto(pines, x, 0, z, 20 + rnd()*14); cnt++; }
        // 개울/강 가장자리 바위와 폭포 아래 바위
        for(i = 0; i < 46; i++){ var xx = -290 + rnd()*820, sd = rnd() < 0.5 ? -1 : 1, off = hw(xx) + (rnd() - 0.55)*5; if(xx > -200 && Math.abs(xx) < 14) continue; rockInto(rocks, xx, rnd() < 0.5 ? 0.4 : WY + 0.4, ZC + sd*off, 1.8 + rnd()*3.4, 0.7); }
        for(i = 0; i < 9; i++){ rockInto(rocks, XA + 10 + rnd()*40, WY + 0.5, ZC + (rnd() - 0.5)*70, 2.5 + rnd()*4, 0.75); }
        for(i = 0; i < 5; i++){ var rz = ZC + (rnd() < 0.5 ? -1 : 1)*(hw(-250) + 2 + rnd()*6); rockInto(rocks, -250 + rnd()*100, terrainH(-250, rz) - 1, rz, 5 + rnd()*5, 0.9); }
        for(i = 0; i < 52; i++){ var rx = XA + 14 + rnd()*190, rs = rnd() < 0.5 ? -1 : 1; reedsInto(deco, rx, WY, ZC + rs*(hw(rx) - 1.2 - rnd()*1.5)); }
        for(i = 0; i < 9; i++){ var mx0 = -250 + rnd()*200, ms2 = rnd() < 0.5 ? -1 : 1, mz = ZC + ms2*(hw(mx0) + 3 + rnd()*3); mushroomInto(deco, mx0, Math.max(0, terrainH(mx0, mz)), mz, 1.2 + rnd()*0.8); }
        var pm = pines.mesh(matV()); pm.castShadow = true; pm.receiveShadow = true; pm.name = "riverPines"; RF.add(pm);
        var rm = rocks.mesh(matV()); rm.castShadow = true; rm.receiveShadow = true; rm.name = "riverRocks"; RF.add(rm);
        var dm = deco.mesh(matV({ side:THREE.DoubleSide })); dm.name = "riverDeco"; RF.add(dm);
        // 물안개
        var mt = mistTex(); for(i = 0; i < 30; i++){ var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:mt, transparent:true, depthWrite:false, opacity:0 })); sp.renderOrder = 4; RF.add(sp); mist.push({ s:sp, a:i/30, z:(rnd() - 0.5)*54, dx:rnd()*12, sp:0.18 + rnd()*0.12 }); }
        // 막는 곳 (사람이 못 지나가게): 강물 전체(다리 길 제외) + 절벽
        var R = window.ROCK_RECTS, C = window.CAM_RECTS;
        for(x = XA + 10; x < XE; x += 20){ if(Math.abs(x) <= 12) continue; var hh = hw(x) - 1.5; R.push({ x:x, z:ZC, hx:11, hz:hh }); }
        R.push({ x:XA - 55, z:ZC, hx:60, hz:300 });
        for(x = XA - 105; x < -40; x += 20){ var hmax = 0, zA, zB; for(z = ZLO; z < ZHI; z += 10) hmax = Math.max(hmax, terrainH(x + 10, z));
          var run = null; for(z = ZLO; z <= ZHI; z += 10){ var hv = terrainH(x + 10, z) > 7 && (x + 10 < XA || Math.abs(z - ZC) > hw(Math.max(x + 10, XA)) + 1); if(hv && !run) run = z; if((!hv || z >= ZHI) && run !== null){ var zz1 = z; R.push({ x:x + 10, z:(run + zz1)/2, hx:10, hz:(zz1 - run)/2 }); C.push({ x:x + 10, z:(run + zz1)/2, hx:10, hz:(zz1 - run)/2, h:terrainH(x + 10, (run + zz1)/2) + 4 }); run = null; } } }
        R.push({ x:XE + 55, z:ZC, hx:50, hz:300 });
        built = true; window.__riverBuilt = true;
      }
      window.riverTick = function(t, dt, p){
        var w = (typeof three !== "undefined") ? three.world : null;
        if(!w || w.children.length < 20) return;
        if(!built){
          var ground = null, old = null;
          w.children.forEach(function(c){ var gp = c.geometry && c.geometry.parameters; if(!gp || gp.width !== 1300) return; if(Math.abs(c.position.y) < 0.001 && gp.height > 2000) ground = c; if(Math.abs(c.position.y - 0.04) < 0.001 && Math.abs(c.position.z - ZC) < 1) old = c; });
          if(!ground || !old) return;
          old.visible = false; (three.boats || []).forEach(function(b){ if(b.baseZ > 548 && b.baseZ < 832) b.dy = -0.5; });
          build(ground);
        }
        var tt = t/1000; if(WU){ WU.uT.value = tt; FU.uT.value = tt; }
        var L = 1, fc = scene.fog ? scene.fog.color : null, hm = null, sn = null;
        scene.children.forEach(function(c){ if(c.isHemisphereLight) hm = c; else if(c.isDirectionalLight) sn = c; });
        if(hm && sn){ L = Math.max(0, Math.min(1, (hm.intensity + sn.intensity)/1.9)); }
        if(WU){ WU.uL.value = L; FU.uL.value = L; if(fc){ WU.uFog.value.copy(fc); FU.uFog.value.copy(fc); } if(scene.fog){ WU.uFogR.value.set(scene.fog.near, scene.fog.far); FU.uFogR.value.set(scene.fog.near, scene.fog.far); } }
        var near = Math.hypot(p.x + 100, p.z - ZC) < 1500; RF.visible = near;
        if(near) for(var i = 0; i < mist.length; i++){ var m = mist[i]; m.a = (m.a + dt*m.sp) % 1; var a = m.a;
          m.s.position.set(XA + 4 + m.dx + a*5, WY + 2 + a*20, ZC + m.z); var sc = 12 + a*26; m.s.scale.set(sc, sc, 1); m.s.material.opacity = 0.5*Math.sin(a*Math.PI)*(0.35 + 0.65*L); }
      };
    })();
