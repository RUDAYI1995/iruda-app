    // ================= 폭포 + 흐르는 강 (호국의 다리 강 상류) =================
    // 강은 서쪽 끝의 절벽 폭포에서 시작해서 동쪽으로 흘러 호국의 다리 밑을 지나 바위산 동굴로 들어가요.
    // 월드가 만들어진 뒤(첫 프레임)에 한 번 붙여요. 땅에 강 모양 구멍을 내고, 절벽·소나무·바위·물을 따로 만든 그룹(riverFall)에 담아요.
    (function buildRiverFall(){
      var XA = -300, ZC = 690, WY = -0.25, BED = -2.4, H0 = 72, XE = 548, XMIN = XA - 120, ZLO = 420, ZHI = 960;
      var built = false, RF = null, falls = [], lastWorld = null;
      function sm(a, b, x){ var t = Math.max(0, Math.min(1, (x - a)/(b - a))); return t*t*(3 - 2*t); }
      function hash(i, j){ var s = Math.sin(i*127.1 + j*311.7)*43758.5453; return s - Math.floor(s); }
      function vn(x, z){ var ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz; fx = fx*fx*(3 - 2*fx); fz = fz*fz*(3 - 2*fz);
        var a = hash(ix, iz), b = hash(ix + 1, iz), c = hash(ix, iz + 1), d = hash(ix + 1, iz + 1); return (a + (b - a)*fx) + ((c + (d - c)*fx) - (a + (b - a)*fx))*fz; }
      var seed = 4242; function rnd(){ seed = (seed*16807) % 2147483647; return seed/2147483647; }
      function hw(x){                                           // 강 폭의 절반 (좁은 폭포 개울 → 다리 밑 넓은 강 → 동쪽 폭포)
        var a = 15 + 5*sm(XA, XA + 120, x), h = a + (120 - a)*sm(-140, -40, x);
        h *= 1 - 0.68*sm(430, 545, x);
        var wig = 2.4*Math.sin(x*0.05 + 1.0) + 1.3*Math.sin(x*0.13 + 2.0);
        return h + wig*(0.4 + 0.6*sm(-250, -120, x))*(1 - sm(480, 545, x));
      }
      window.RIVER = { hw:hw, XA:XA, XE:XE, ZC:ZC, WY:WY };
      function gorgeH(x, z){                                    // 서쪽 협곡: 폭포 뒤 절벽 + 개울 옆 풀밭 + 양옆 절벽
        var dlat = Math.abs(z - ZC) - hw(Math.max(x, XA)), dh = XA - x, dn = (vn(x*0.07, z*0.07) - 0.5)*9;
        var Hm = H0*(1 - sm(XA + 10, -70, x)), tx = sm(XMIN, XMIN + 90, x), tz = sm(0, 110, Math.min(z - ZLO, ZHI - z)), k = tx*tz;
        var Ht = 4*(1 - sm(-150, -40, x));
        var hl = dlat > 0 ? Ht*sm(0, 26, dlat + dn*0.3) + (Hm - Ht)*sm(30, 46, dlat + dn) : 0;
        var hh = dh > 0 ? Hm*sm(0, 16, dh + dn) : 0, h0 = Math.max(hl, hh), wall = hh > hl ? sm(0, 16, dh + dn) : sm(30, 46, dlat + dn);
        var h = h0*k + wall*k*(Hm/H0)*(vn(x*0.06, z*0.06)*7 + vn(x*0.15, z*0.15)*3.5) + (hl > 0 && wall < 0.05 ? vn(x*0.1, z*0.1)*1.2*sm(0, 6, dlat)*k : 0);
        if(x < XA - 8){ var f = (1 - sm(20, 34, Math.abs(z - ZC)))*sm(0, 16, dh + dn); h = h + (Hm*k - h)*f; }
        return Math.max(0, h);
      }
      function eastRaw(x, z){
        var r2 = Math.pow((x - 650)/150, 2) + Math.pow((z - ZC)/260, 2), h = r2 < 1 ? 48*(1 - r2) : 0;
        h += h > 0 ? (vn(x*0.06, z*0.06)*6 + vn(x*0.15, z*0.15)*3)*sm(0, 6, h) : 0;
        return h;
      }
      var HL = eastRaw(XE + 1, ZC) - 0.5;                          // 동쪽 폭포 윗물길 높이
      function eastH(x, z){                                     // 동쪽 바위산 (여기서도 폭포가 떨어져요)
        var h = eastRaw(x, z);
        if(x >= XE){ var f = (1 - sm(18, 30, Math.abs(z - ZC)))*(1 - sm(80, 100, x - XE)); h += (HL - 0.4 - h)*f; }
        else { var dr = Math.abs(z - ZC) - hw(x); h *= sm(0, 8, dr); }
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
      function matV(extra){ var o = { vertexColors:true, flatShading:true, roughness:0.95, metalness:0, fog:false }; if(extra) for(var k in extra) o[k] = extra[k]; return new THREE.MeshStandardMaterial(o); }
      var M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), S = new THREE.Vector3(), T = new THREE.Vector3();
      function mx(x, y, z, rx, ry, rz, sx, sy, sz){ E.set(rx, ry, rz); Q.setFromEuler(E); T.set(x, y, z); S.set(sx, sy, sz); return M4.compose(T, Q, S).clone(); }

      // ---------- 절벽(높이 지도) ----------
      var GRASS = [[0.27, 0.55, 0.10], [0.32, 0.60, 0.12], [0.23, 0.50, 0.09]];
      function rockCol(x, y, z, nx, ny, nz){
        var n = hash(Math.floor(x*0.9), Math.floor(z*0.9) + Math.floor(y*0.7)), sh = 0.19 + 0.12*n + 0.07*ny + (nx*0.5 + nz*0.3)*0.05;
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
      var WU = null;
      function fallMesh(sys, off, ph, alpha, ro){
        var C = sys.cfg, NC = 18, NR = 34, pos = [], uv = [], idx = [], i, j;
        for(j = 0; j <= NR; j++){
          var u = j/NR, y = (C.yTop - 0.8) - (C.yTop - 0.8 - (WY + 0.4))*u, half = C.w0 + C.w1*u + 1.6*Math.sin(u*6.0);
          for(i = 0; i <= NC; i++){
            var s = i/NC, z = ZC + (s - 0.5)*2*half, bulge = 1.6 + 2.2*u*u + 1.2*Math.sin(s*Math.PI);
            pos.push(C.face(y, z) + C.sgn*bulge, y, z); uv.push(s, u);
          }
        }
        if(!sys.face) sys.face = { NC:NC, NR:NR, pos:pos };
        for(j = 0; j < NR; j++) for(i = 0; i < NC; i++){ var a = j*(NC + 1) + i, b = a + 1, c = a + NC + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
        var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeBoundingSphere();
        var U = { uT:{ value:0 }, uL:{ value:1 }, uPh:{ value:ph }, uA:{ value:alpha }, uOff:{ value:off }, uSgn:{ value:C.sgn }, uFog:{ value:new THREE.Color(0xbfe0ff) }, uFogR:{ value:new THREE.Vector2(380, 1500) } };
        sys.U.push(U);
        var m = new THREE.ShaderMaterial({ uniforms:U, transparent:true, depthWrite:false, side:THREE.DoubleSide,
          vertexShader:"uniform float uT, uOff, uSgn; varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec3 p = position; p.x += uOff + uSgn*(0.5*sin(uv.y*24.0 - uT*7.0 + uv.x*11.0)*(0.25 + uv.y) + 0.25*sin(uv.y*51.0 - uT*11.0 + uv.x*23.0)); vec4 w = modelMatrix*vec4(p, 1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
          fragmentShader:"uniform float uT, uL, uPh, uA; uniform vec3 uFog; uniform vec2 uFogR; varying vec2 vUv; varying vec3 vW;\n" + NOISE_GLSL +
            "void main(){ float sx = vUv.x, y = vUv.y, t = uT + uPh;\n" +
            "  float s1 = vn(vec2(sx*34.0, y*1.4 - t*1.5)), s2 = vn(vec2(sx*70.0 + 3.0, y*2.2 - t*2.3)), s3 = vn(vec2(sx*14.0, y*0.9 - t*0.9));\n" +
            "  float s = s1*0.4 + s2*0.3 + s3*0.3;\n" +
            "  float clump = vn(vec2(sx*7.0, y*9.0 - t*4.2))*0.6 + vn(vec2(sx*15.0 + 5.0, y*16.0 - t*6.0))*0.4;\n" +
            "  float core = smoothstep(0.30, 0.74, s*0.8 + clump*0.45 + y*0.26);\n" +
            "  vec3 col = mix(vec3(0.36, 0.70, 0.93), vec3(0.97, 0.99, 1.0), core);\n" +
            "  col = mix(col, vec3(0.62, 0.84, 0.96), (1.0 - core)*0.35*smoothstep(0.0, 0.5, y));\n" +
            "  float edge = smoothstep(0.0, 0.10, sx)*smoothstep(1.0, 0.90, sx), topf = smoothstep(0.0, 0.04, y);\n" +
            "  float a = (0.50 + 0.50*core)*edge*topf*uA;\n" +
            "  float burst = smoothstep(0.80, 1.0, y); col = mix(col, vec3(1.0), burst); a = mix(a, clamp(0.9*edge + 0.1, 0.0, 1.0)*uA, burst);\n" +
            "  col *= mix(0.42, 1.0, uL); gl_FragColor = vec4(col, a);\n" +
            "  #include <tonemapping_fragment>\n" +
            "  float fd = length(cameraPosition - vW); gl_FragColor.rgb = mix(gl_FragColor.rgb, uFog, smoothstep(uFogR.x, uFogR.y, fd)); }" });
        var mesh = new THREE.Mesh(g, m); mesh.renderOrder = ro; mesh.frustumCulled = false; return mesh;
      }
      function facePos(F, s, u, out){
        var fi = Math.min(F.NC - 0.001, s*F.NC), fj = Math.min(F.NR - 0.001, u*F.NR), i = Math.floor(fi), j = Math.floor(fj), tx = fi - i, ty = fj - j, k;
        var a = (j*(F.NC + 1) + i)*3, b = a + 3, c = a + (F.NC + 1)*3, d = c + 3;
        for(k = 0; k < 3; k++) out[k] = (F.pos[a + k]*(1 - tx) + F.pos[b + k]*tx)*(1 - ty) + (F.pos[c + k]*(1 - tx) + F.pos[d + k]*tx)*ty;
      }
      var DOT = null;
      function dotTex(){
        if(DOT) return DOT; var c = document.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 1, 32, 32, 32);
        r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.35, "rgba(255,255,255,0.7)"); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return (DOT = new THREE.CanvasTexture(c));
      }
      // 폭포 한 개 = 물줄기 두 겹 + 튀는 물방울 + 아래에서 피어오르는 안개
      function makeFall(cfg){
        var sys = { cfg:cfg, U:[], face:null, drops:[], mist:[], pts:null, group:new THREE.Group() }, i, tex = dotTex();
        sys.group.add(fallMesh(sys, 0, 0.0, 0.95, -4)); sys.group.add(fallMesh(sys, cfg.sgn*1.0, 3.7, 0.55, -3.9));
        var N = 380, pa = new Float32Array(N*3);
        for(i = 0; i < N; i++) sys.drops.push({ s:rnd(), u:rnd(), v:0.45 + rnd()*0.5, off:rnd()*4, jit:(rnd() - 0.5)*2 });
        var gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(pa, 3));
        sys.pts = new THREE.Points(gg, new THREE.PointsMaterial({ map:tex, size:2.4, sizeAttenuation:true, transparent:true, opacity:0.9, depthWrite:false, color:0xffffff, fog:false })); sys.pts.renderOrder = -3.5; sys.pts.frustumCulled = false; sys.group.add(sys.pts);
        for(i = 0; i < 40; i++){ var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, depthWrite:false, opacity:0, fog:false })); sp.renderOrder = -3; sys.group.add(sp); sys.mist.push({ s:sp, a:rnd(), z:(rnd() - 0.5)*cfg.w0*2.6, dx:rnd()*14, sp:0.10 + rnd()*0.12, low:i >= 30 }); }
        var kk = Math.max(0.5, Math.min(1, (cfg.yTop - WY)/72)), NB = 170, im = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0xa6bfd2, roughness:1, flatShading:true, fog:false }), NB), dummy = new THREE.Object3D();
        im.frustumCulled = false; sys.group.add(im); sys.blobs = [];
        for(i = 0; i < NB; i++) sys.blobs.push(i < 120 ? { s:rnd(), u:rnd(), v:0.30 + rnd()*0.35, sz:1.7 + rnd()*2.1, rx:rnd()*6, ry:rnd()*6 } : { base:true, a:rnd(), ang:rnd()*6.283, rad:rnd(), sp:0.25 + rnd()*0.3, rx:rnd()*6, ry:rnd()*6 });
        sys.update = function(t, dt, L, near){
          this.group.visible = near; if(!near) return;
          var P = this.pts.geometry.attributes.position, o = [0, 0, 0], d, k;
          for(k = 0; k < this.drops.length; k++){ d = this.drops[k]; d.u += dt*d.v*0.55; if(d.u >= 1){ d.u = 0; d.s = rnd(); d.off = rnd()*3; d.v = 0.45 + rnd()*0.5; }
            facePos(this.face, d.s, d.u, o); var out = d.off*(0.3 + d.u*1.6); P.setXYZ(k, o[0] + cfg.sgn*out, o[1], o[2] + d.jit*d.u*3); }
          for(k = 0; k < this.blobs.length; k++){ var b = this.blobs[k], sc;
            if(!b.base){ b.u += dt*b.v*0.5; if(b.u >= 1){ b.u = 0; b.s = rnd(); b.v = 0.30 + rnd()*0.35; b.sz = 1.7 + rnd()*2.1; } facePos(this.face, b.s, b.u, o); sc = b.sz*kk*(0.6 + 0.9*b.u); dummy.position.set(o[0] + cfg.sgn*(1.0 + b.u*1.5), o[1], o[2]); }
            else { b.a = (b.a + dt*b.sp) % 1; sc = kk*(2.0 + 2.4*Math.sin(b.a*Math.PI))*(0.8 + 0.5*b.rad); dummy.position.set(cfg.bx + cfg.dirx*(b.a*9 + b.rad*3) + cfg.sgn*1.5, WY + 0.5 + Math.sin(b.a*Math.PI)*2.2, ZC + Math.cos(b.ang)*(cfg.w0 + cfg.w1)*0.9*b.rad); }
            dummy.rotation.set(b.rx + t*0.0004, b.ry, 0); dummy.scale.set(sc, sc*0.85, sc); dummy.updateMatrix(); im.setMatrixAt(k, dummy.matrix); }
          im.instanceMatrix.needsUpdate = true; var bl = 0.35 + 0.65*L; im.material.emissive.setRGB(0.65*bl, 0.75*bl, 0.82*bl); im.material.color.setRGB(bl, bl, bl);
          P.needsUpdate = true; this.pts.material.opacity = 0.5 + 0.45*L; var gcol = 0.45 + 0.55*L; this.pts.material.color.setRGB(gcol, gcol, gcol);
          for(k = 0; k < this.mist.length; k++){ var m = this.mist[k], a; m.a = (m.a + dt*m.sp) % 1; a = m.a; var sc, op;
            if(m.low){ sc = 26 + 14*Math.sin(a*Math.PI); m.s.position.set(cfg.bx + cfg.dirx*(m.dx*1.5 + 6), WY + 2.5 + a*3, ZC + m.z*1.1); op = 0.10*(0.4 + 0.6*Math.sin(a*Math.PI)); }
            else { sc = 9 + a*26; m.s.position.set(cfg.bx + cfg.dirx*(m.dx + a*34), WY + 3 + a*24, ZC + m.z); op = 0.20*Math.sin(a*Math.PI); }
            m.s.scale.set(sc, sc, 1); m.s.material.opacity = op*(0.3 + 0.7*L); var mc = 0.55 + 0.45*L; m.s.material.color.setRGB(mc*0.93, mc*0.98, mc); }
        };
        return sys;
      }
      // ---------- 강물 ----------
      function waterMesh(ring){
        var pts = ring.map(function(q){ return new THREE.Vector2(q[0], -q[1]); }), shape = new THREE.Shape(pts), g = new THREE.ShapeGeometry(shape);
        g.rotateX(-Math.PI/2); g.translate(0, WY, 0);
        WU = { uT:{ value:0 }, uL:{ value:1 }, uFog:{ value:new THREE.Color(0xbfe0ff) }, uFogR:{ value:new THREE.Vector2(380, 1500) }, uSun:{ value:new THREE.Vector3(0.5, 0.6, -0.2).normalize() }, uXA:{ value:XA }, uZC:{ value:ZC } };
        var hwGlsl = "float hwf(float x){ float a = 15.0 + 5.0*smoothstep(" + XA + ".0, " + (XA + 120) + ".0, x); float h = a + (120.0 - a)*smoothstep(-140.0, -40.0, x); h *= 1.0 - 0.68*smoothstep(430.0, 545.0, x);\n" +
          "  float wig = 2.4*sin(x*0.05 + 1.0) + 1.3*sin(x*0.13 + 2.0); return h + wig*(0.4 + 0.6*smoothstep(-250.0, -120.0, x))*(1.0 - smoothstep(480.0, 545.0, x)); }\n";
        var m = new THREE.ShaderMaterial({ uniforms:WU, transparent:true, depthWrite:false, side:THREE.DoubleSide,
          vertexShader:"varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",
          fragmentShader:"uniform float uT, uL, uXA, uZC; uniform vec3 uFog, uSun; uniform vec2 uFogR; varying vec3 vW;\n" + NOISE_GLSL + hwGlsl +
            "float fbm(vec2 p){ float a = 0.5, s = 0.0; for(int i = 0; i < 3; i++){ s += a*vn(p); p = p*2.03 + vec2(11.7, 3.1); a *= 0.5; } return s; }\n" +
            "float hgt(vec2 p){ return fbm(p*0.22 - vec2(uT*1.3, 0.0)) + 0.4*fbm(p*0.62 - vec2(uT*2.2, uT*0.2)) + 0.3*fbm(vec2(p.x*0.35 + uT*0.4, p.y*0.35 - uT*0.55)); }\n" +
            "float ridge(vec2 q){ return 1.0 - abs(vn(q)*2.0 - 1.0); }\n" +
            "float caus(vec2 p){ vec2 q = p*0.5; return pow(ridge(q + vec2(uT*0.35, uT*0.2))*ridge(q*1.7 - vec2(uT*0.3, -uT*0.25)), 4.0); }\n" +
            "void main(){ vec2 p = vW.xz; float e = 0.5, h0 = hgt(p), hx = hgt(p + vec2(e, 0.0)), hz = hgt(p + vec2(0.0, e));\n" +
            "  vec3 n = normalize(vec3(-(hx - h0)/e*1.9, 1.0, -(hz - h0)/e*1.9)); vec3 V = normalize(cameraPosition - vW);\n" +
            "  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0)*0.5 + 0.04;\n" +
            "  float edgeD = hwf(p.x) - abs(p.y - uZC); float depth = clamp(edgeD/20.0, 0.0, 1.0);\n" +
            "  float headD = min(distance(p, vec2(uXA + 14.0, uZC)), distance(p, vec2(534.0, uZC))); float plunge = 1.0 - smoothstep(0.0, 50.0, headD);\n" +
            "  vec3 col = mix(vec3(0.18, 0.78, 0.86), vec3(0.05, 0.40, 0.76), smoothstep(0.0, 1.0, depth));\n" +
            "  col = mix(col, vec3(0.50, 0.85, 0.92), plunge*0.5);\n" +
            "  float diff = clamp(dot(n, normalize(uSun))*0.5 + 0.55, 0.0, 1.2); col *= 0.78 + 0.45*diff;\n" +
            "  vec3 sky = mix(vec3(0.36, 0.64, 0.94), uFog, 0.2); col = mix(col, sky, fres);\n" +
            "  vec3 Hh = normalize(uSun + V); col += vec3(1.0, 0.95, 0.82)*(pow(max(dot(n, Hh), 0.0), 70.0)*0.8 + pow(max(dot(n, Hh), 0.0), 260.0)*(0.6 + vn(p*2.6 - vec2(uT*2.0, 0.0)))*1.4);\n" +
            "  col += vec3(0.55, 0.95, 0.95)*caus(p)*(1.0 - smoothstep(0.05, 0.85, depth))*0.9;\n" +
            "  col += vec3(0.10, 0.14, 0.16)*0.4*smoothstep(0.55, 0.85, hgt(p*vec2(1.0, 2.4) + 3.0));\n" +
            "  float fn = vn(p*0.8 - vec2(uT*1.3, 0.0))*0.6 + vn(p*2.4 - vec2(uT*2.2, 0.0))*0.4;\n" +
            "  float ef = 1.0 - smoothstep(0.4, 3.5 + 3.5*fn, edgeD);\n" +
            "  float pz = abs(mod(p.y - 570.0 + 8.0, 16.0) - 8.0); float pd = length(vec2(max(abs(p.x) - 4.25, 0.0), max(pz - 2.5, 0.0)));\n" +
            "  float pf = (1.0 - smoothstep(0.3, 2.2 + 2.2*fn, pd))*step(abs(p.y - uZC), 124.0);\n" +
            "  float wake = (1.0 - smoothstep(0.0, 9.0, max(p.x - 3.0, 0.0)))*step(0.0, p.x)*(1.0 - smoothstep(0.0, 2.2, max(pz - 2.5, 0.0)))*0.5;\n" +
            "  float rings = 0.5 + 0.5*sin(headD*0.55 - uT*3.6 + vn(p*0.3)*4.0);\n" +
            "  float plf = plunge*smoothstep(0.28, 0.62, fn + plunge*0.5 + rings*0.18*plunge);\n" +
            "  float foam = clamp(ef*0.95 + pf + wake*fn + plf, 0.0, 1.0);\n" +
            "  col = mix(col, vec3(0.97, 0.99, 1.0), foam*smoothstep(0.30, 0.62, fn + 0.25));\n" +
                        "  col *= mix(0.34, 1.0, uL);\n" +
            "  float al = mix(0.40, 0.94, smoothstep(0.0, 0.7, depth)); al = max(al, foam*0.92);\n" +
            "  gl_FragColor = vec4(col, al);\n" +
            "  #include <tonemapping_fragment>\n" +
            "  float fd = length(cameraPosition - vW); gl_FragColor.rgb = mix(gl_FragColor.rgb, uFog, smoothstep(uFogR.x, uFogR.y, fd)); }" });
        var mesh = new THREE.Mesh(g, m); mesh.renderOrder = -5; mesh.frustumCulled = false; return mesh;
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
        var bank_m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors:true, flatShading:true, roughness:1, side:THREE.DoubleSide, fog:false }));
        var ring = []; for(k = 0; k < n; k++) ring.push([xs[k], ZC - hw(xs[k]) + 5]); for(k = n - 1; k >= 0; k--) ring.push([xs[k], ZC + hw(xs[k]) - 5]);
        var sh = new THREE.Shape(ring.map(function(q){ return new THREE.Vector2(q[0], -q[1]); })), bg = new THREE.ShapeGeometry(sh); bg.rotateX(-Math.PI/2); bg.translate(0, BED, 0);
        var bed_m = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ color:0x6d6c5c, roughness:1, fog:false }));
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
      var PETAL = (function(){ var g = new THREE.BufferGeometry(), A = [0, 0, 0], B = [0.45, 0.10, -0.22], C = [1, -0.12, 0], D = [0.45, 0.10, 0.22];
        g.setAttribute("position", new THREE.Float32BufferAttribute([].concat(A, C, B, A, D, C), 3)); return g; })();
      function pineInto(ms, x, y, z, Hh){                         // 사진처럼: 붉은 갈색 줄기 + 아래로 처진 납작한 초록 잎 조각이 층층이
        var tl = Hh*0.92, t, q, n = 9;
        ms.add(new THREE.CylinderGeometry(Hh*0.014, Hh*0.032, tl, 5), mx(x, y + tl/2, z, 0, (rnd() - 0.5)*0.05, (rnd() - 0.5)*0.04, 1, 1, 1), function(){ return [0.40 + rnd()*0.05, 0.15, 0.10]; });
        for(t = 0; t < n; t++){
          var f = t/(n - 1), yy = y + Hh*(0.24 + 0.70*f), L = Hh*(0.30 - 0.21*f), yaw0 = rnd()*6.283, np = t < 2 ? 7 : 6;
          for(q = 0; q < np; q++){
            var yaw = yaw0 + q*(6.283/np) + (t%2)*0.5 + (rnd() - 0.5)*0.35, droop = 0.28 + 0.28*rnd(), ls = L*(0.8 + 0.4*rnd()), sh = 0.55 + 0.45*f + rnd()*0.14;
            ms.add(PETAL, mx(x, yy, z, 0, yaw, -droop, ls, ls*0.9, ls*1.15), function(){ return [0.10 + 0.12*sh, 0.42 + 0.30*sh, 0.04 + 0.06*sh]; });
          }
        }
        for(q = 0; q < 5; q++){ var yw = q*1.2566 + rnd()*0.3; ms.add(PETAL, mx(x, y + Hh*0.95, z, 0, yw, 1.15, Hh*0.08, Hh*0.08, Hh*0.1), function(){ return [0.30, 0.75, 0.10]; }); }
      }
      function birchInto(ms, x, y, z, Hh){
        ms.add(new THREE.CylinderGeometry(Hh*0.018, Hh*0.03, Hh, 5), mx(x, y + Hh/2, z, 0, 0, (rnd() - 0.5)*0.1, 1, 1, 1), function(px, py, pz, nx, ny){ return hash(Math.floor(py*3), Math.floor(px)) > 0.8 ? [0.25, 0.22, 0.2] : [0.93, 0.92, 0.86]; });
        var b; for(b = 0; b < 5; b++) ms.add(new THREE.IcosahedronGeometry(1, 0), mx(x + (rnd() - 0.5)*Hh*0.3, y + Hh*(0.72 + rnd()*0.3), z + (rnd() - 0.5)*Hh*0.3, rnd()*3, rnd()*3, 0, Hh*(0.16 + rnd()*0.08), Hh*0.13, Hh*(0.16 + rnd()*0.08)), function(px, py, pz, nx, ny){ var s2 = 0.45 + 0.4*Math.max(ny, 0); return [0.30*s2 + 0.18, 0.55*s2 + 0.35, 0.08 + 0.1*s2]; });
      }
      function bushInto(ms, x, y, z, r){
        ms.add(new THREE.IcosahedronGeometry(1, 0), mx(x, y + r*0.5, z, rnd()*3, rnd()*6, 0, r*1.4, r*0.9, r*1.2), function(px, py, pz, nx, ny){ var s2 = 0.5 + 0.5*Math.max(ny, 0); return [0.16 + 0.14*s2, 0.46 + 0.30*s2, 0.06 + 0.06*s2]; });
      }
      function logInto(ms, x, y, z, len){
        ms.add(new THREE.CylinderGeometry(1.0, 1.1, len, 6), mx(x, y + 1.0, z, 0, rnd()*3, Math.PI/2, 1, 1, 1), function(px, py, pz, nx, ny){ return [0.36 + 0.06*ny, 0.21 + 0.04*ny, 0.11]; });
      }
      function flowerInto(ms, x, y, z){
        var col = rnd() < 0.6 ? [0.20, 0.38, 0.95] : [0.98, 0.55, 0.15];
        ms.add(new THREE.CylinderGeometry(0.07, 0.07, 1.3, 4), mx(x, y + 0.65, z, 0, 0, 0, 1, 1, 1), function(){ return [0.25, 0.6, 0.12]; });
        ms.add(new THREE.IcosahedronGeometry(0.55, 0), mx(x, y + 1.4, z, rnd()*3, rnd()*3, 0, 1, 0.8, 1), function(){ return col; });
      }
      function rockInto(ms, x, y, z, r, sy){
        var g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position, v = new THREE.Vector3(), i;
        for(i = 0; i < P.count; i++){ v.set(P.getX(i), P.getY(i), P.getZ(i)); var k = 0.78 + 0.5*hash(Math.round(v.x*40) + x*7, Math.round(v.y*40) + Math.round(v.z*40) + z*3); P.setXYZ(i, v.x*k, v.y*k, v.z*k); }
        ms.add(g, mx(x, y, z, rnd()*3, rnd()*6, rnd()*3, r, r*(sy || 0.7), r*(0.8 + rnd()*0.4)), function(px, py, pz, nx, ny){ var b = 0.22 + 0.12*hash(Math.floor(px), Math.floor(pz) + Math.floor(py)) + 0.10*ny; return [b, b*1.01, b*1.05]; });
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
        // 폭포 두 개: 서쪽 협곡(절벽 면을 따라) + 동쪽 바위산(수직 벽)
        var fw = makeFall({ sgn:1, face:function(y, z){ var lo = XA - 24, hi = XA + 3, k; for(k = 0; k < 18; k++){ var mid = (lo + hi)/2; if(gorgeH(mid, z) > y) lo = mid; else hi = mid; } return hi; }, yTop:H0, w0:7, w1:6, bx:XA + 4, dirx:1 });
        var fe = makeFall({ sgn:-1, face:function(){ return XE; }, yTop:HL + 0.2, w0:15, w1:9, bx:XE - 4, dirx:-1 });
        fw.group.name = "waterfallW"; fe.group.name = "waterfallE"; RF.add(fw.group); RF.add(fe.group); falls.push(fw, fe);
        // 위 개울(폭포 바로 위 물길)
        var up = new THREE.Mesh(new THREE.PlaneGeometry(110, 38), new THREE.MeshBasicMaterial({ color:0x6fc4e8, transparent:true, opacity:0.9, fog:false })); up.rotation.x = -Math.PI/2; up.position.set(XA - 70, H0 + 0.35, ZC); up.renderOrder = -4; RF.add(up);
        var up2 = new THREE.Mesh(new THREE.PlaneGeometry(95, 40), new THREE.MeshBasicMaterial({ color:0x6fc4e8, transparent:true, opacity:0.9, fog:false })); up2.rotation.x = -Math.PI/2; up2.position.set(XE + 47, HL + 0.2, ZC); up2.renderOrder = -4; RF.add(up2);
        // 소나무 / 바위 / 갈대 / 버섯
        var pines = new Mesher(), rocks = new Mesher(), deco = new Mesher(), i, tries, x, z, y, cnt = 0, sd2;
        function slope(x, z){ return (Math.abs(terrainH(x + 2, z) - terrainH(x - 2, z)) + Math.abs(terrainH(x, z + 2) - terrainH(x, z - 2)))/4; }
        // 폭포 위 언덕(고원)의 소나무
        for(tries = 0; tries < 1200 && cnt < 64; tries++){ x = XMIN + 10 + rnd()*(XA - 8 - XMIN - 10 + 70); z = ZLO + 30 + rnd()*(ZHI - ZLO - 60); y = gorgeH(x, z);
          if(y < 4 || slope(x, z) > 0.9 || (Math.abs(z - ZC) < 24 && x < XA - 4)) continue; pineInto(pines, x, y - 0.3, z, 24 + rnd()*18); cnt++; }
        // 개울 양옆 풀밭의 큰 소나무 + 자작나무 + 덤불 (사진의 앞쪽 큰 나무들)
        for(cnt = 0, tries = 0; tries < 900 && cnt < 34; tries++){ x = XA - 14 + rnd()*200; sd2 = rnd() < 0.5 ? -1 : 1; z = ZC + sd2*(hw(x) + 5 + rnd()*24); y = gorgeH(x, z);
          if(y > 6 || slope(x, z) > 0.5) continue; pineInto(pines, x, y - 0.3, z, 32 + rnd()*18); cnt++; }
        for(cnt = 0, tries = 0; tries < 600 && cnt < 16; tries++){ x = XA + 10 + rnd()*160; sd2 = rnd() < 0.5 ? -1 : 1; z = ZC + sd2*(hw(x) + 3 + rnd()*14); y = gorgeH(x, z); if(y > 5) continue; birchInto(pines, x, y - 0.2, z, 15 + rnd()*9); cnt++; }
        for(cnt = 0, tries = 0; tries < 800 && cnt < 44; tries++){ x = XA - 10 + rnd()*230; sd2 = rnd() < 0.5 ? -1 : 1; z = ZC + sd2*(hw(x) + 2 + rnd()*20); y = gorgeH(x, z); if(y > 6) continue; bushInto(deco, x, y - 0.3, z, 1.8 + rnd()*2.4); cnt++; }
        for(cnt = 0, tries = 0; tries < 600 && cnt < 40; tries++){ x = XA - 8 + rnd()*160; sd2 = rnd() < 0.5 ? -1 : 1; z = ZC + sd2*(hw(x) + 2 + rnd()*12); y = gorgeH(x, z); if(y > 5) continue; flowerInto(deco, x, y, z); cnt++; }
        for(i = 0; i < 4; i++){ x = XA + 8 + rnd()*50; sd2 = i % 2 ? 1 : -1; z = ZC + sd2*(hw(x) + 3 + rnd()*5); logInto(deco, x, gorgeH(x, z), z, 7 + rnd()*5); }
        // 동쪽 바위산의 소나무
        for(cnt = 0, tries = 0; tries < 600 && cnt < 20; tries++){ x = 560 + rnd()*190; z = 470 + rnd()*440; y = eastH(x, z); if(y < 6 || slope(x, z) > 0.9) continue; pineInto(pines, x, y - 0.3, z, 22 + rnd()*14); cnt++; }
        // 강가(다리 쪽) 소나무
        for(cnt = 0, tries = 0; tries < 800 && cnt < 26; tries++){ x = -100 + rnd()*600; z = rnd() < 0.5 ? 440 + rnd()*100 : 840 + rnd()*100; if(Math.abs(x) < 36) continue; if(Math.abs(z - ZC) < hw(x) + 8) continue; if(x > 400 && eastH(x, z) > 1) continue; y = terrainH(x, z); if(y > 1.5) continue; pineInto(pines, x, 0, z, 22 + rnd()*14); cnt++; }
        // 바위: 강가 / 폭포 아래 / 물밑
        for(i = 0; i < 40; i++){ var xx = -290 + rnd()*820, sd = rnd() < 0.5 ? -1 : 1, off = hw(xx) + (rnd() - 0.55)*4; if(xx > -200 && Math.abs(xx) < 14) continue; rockInto(rocks, xx, rnd() < 0.5 ? 0.4 : WY + 0.4, ZC + sd*off, 1.6 + rnd()*3.0, 0.7); }
        for(i = 0; i < 8; i++){ rockInto(rocks, XA + 8 + rnd()*26, WY + 0.5, ZC + (rnd() - 0.5)*22, 1.6 + rnd()*2.6, 0.75); }
        for(i = 0; i < 9; i++){ rockInto(rocks, 534 - rnd()*40, WY + 0.5, ZC + (rnd() - 0.5)*54, 2.2 + rnd()*3.5, 0.75); }
        for(i = 0; i < 60; i++){ var ux = XA + 20 + rnd()*560, uh = hw(ux), uz = ZC + (rnd() < 0.5 ? -1 : 1)*(uh - 2 - rnd()*(ux < -60 ? uh - 6 : 14)); if(Math.abs(ux) < 12) continue; rockInto(rocks, ux, BED + 0.6, uz, 0.9 + rnd()*1.8, 0.6); }
        for(i = 0; i < 7; i++){ var rz = ZC + (rnd() < 0.5 ? -1 : 1)*(hw(-250) + 3 + rnd()*14); rockInto(rocks, -270 + rnd()*120, Math.max(0, terrainH(-250, rz)) - 0.5, rz, 3 + rnd()*4, 0.9); }
        // 키 큰 풀 (물가)
        for(i = 0; i < 90; i++){ var rx = XA + 6 + rnd()*200, rs = rnd() < 0.5 ? -1 : 1; reedsInto(deco, rx, WY, ZC + rs*(hw(rx) - 1.0 - rnd()*1.6)); }
        for(i = 0; i < 12; i++){ var mx0 = XA + 6 + rnd()*170, ms2 = rnd() < 0.5 ? -1 : 1, mz = ZC + ms2*(hw(mx0) + 3 + rnd()*7); mushroomInto(deco, mx0, Math.max(0, terrainH(mx0, mz)), mz, 1.3 + rnd()*1.0); }
        // 작은 나무 판자 다리 (개울을 건너는 다리)
        (function(){ var bx = -175, zA = ZC - hw(bx) - 5, zB = ZC + hw(bx) + 5, n = Math.ceil((zB - zA)/2.1), q;
          for(q = 0; q < n; q++) deco.add(new THREE.BoxGeometry(5.2, 0.5, 1.9), mx(bx + (rnd() - 0.5)*0.3, 0.55, zA + (q + 0.5)*(zB - zA)/n, 0, (rnd() - 0.5)*0.05, 0, 1, 1, 1), function(px, py, pz, nx, ny){ return [0.50 + 0.1*ny + rnd()*0.06, 0.33 + 0.06*ny, 0.19]; });
          [-2.9, 2.9].forEach(function(o){ deco.add(new THREE.CylinderGeometry(0.4, 0.4, zB - zA + 2, 6), mx(bx + o, 0.25, (zA + zB)/2, Math.PI/2, 0, 0, 1, 1, 1), function(){ return [0.32, 0.19, 0.10]; });
            for(q = 0; q < 4; q++) deco.add(new THREE.CylinderGeometry(0.28, 0.32, 2.6, 5), mx(bx + o, 0.8, zA + 1.5 + q*(zB - zA - 3)/3, 0, 0, 0, 1, 1, 1), function(){ return [0.34, 0.2, 0.11]; }); }); })();
        var pm = pines.mesh(matV({ side:THREE.DoubleSide })); pm.castShadow = true; pm.receiveShadow = true; pm.name = "riverPines"; RF.add(pm);
        var rm = rocks.mesh(matV()); rm.castShadow = true; rm.receiveShadow = true; rm.name = "riverRocks"; RF.add(rm);
        var dm = deco.mesh(matV({ side:THREE.DoubleSide })); dm.name = "riverDeco"; RF.add(dm);
        // 어디든 자유롭게: 강물도 헤엄쳐 들어갈 수 있고(RIVER.water 높이), 언덕은 아주 가파른 절벽(약 70° 이상)만 못 올라가요
        window.RIVER.water = function(x, z){ return x > XA && x < XE && Math.abs(z - ZC) < hw(x) - 0.8; };
        window.RIVER.hh = function(x, z){ if(z < ZLO || z > ZHI) return 0; if(x >= XMIN && x < -30) return gorgeH(x, z); if(x >= 500 && x < 780) return eastH(x, z); return 0; };
        window.RIVER.push = function(p, px0, pz0){
          var hh = window.RIVER.hh; if(!((p.x < -30 && p.x > XMIN - 30) || (p.x > 490 && p.x < 790)) && !((px0 < -30 && px0 > XMIN - 30) || (px0 > 490 && px0 < 790))) return;
          var dist = Math.hypot(p.x - px0, p.z - pz0); if(dist < 1e-6) return;
          function steep(x, z){ return Math.abs(hh(x, z) - hh(px0, pz0)) > 2.7*Math.hypot(x - px0, z - pz0) + 0.8; }
          if(!steep(p.x, p.z)) return;
          if(!steep(p.x, pz0)){ p.z = pz0; return; } if(!steep(px0, p.z)){ p.x = px0; return; }
          p.x = px0; p.z = pz0;
        };
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
        var tt = t/1000, L = 1, fc = scene.fog ? scene.fog.color : null, hm = null, sn = null, fi;
        scene.children.forEach(function(c){ if(c.isHemisphereLight) hm = c; else if(c.isDirectionalLight) sn = c; });
        if(hm && sn){ L = Math.max(0, Math.min(1, (hm.intensity + sn.intensity)/1.9)); }
        var wm = RF.getObjectByName("riverWater"); if(wm){ var wu = wm.material.uniforms; wu.uT.value = tt; wu.uL.value = L; if(fc) wu.uFog.value.copy(fc); if(scene.fog) wu.uFogR.value.set(scene.fog.near*3, scene.fog.far*3); }
        for(fi = 0; fi < falls.length; fi++) falls[fi].U.forEach(function(U){ U.uT.value = tt; U.uL.value = L; if(fc) U.uFog.value.copy(fc); if(scene.fog) U.uFogR.value.set(scene.fog.near*3, scene.fog.far*3); });
        var near = Math.hypot(p.x - 130, p.z - ZC) < 1600; RF.visible = near;
        for(fi = 0; fi < falls.length; fi++) falls[fi].update(t, dt, L, near);
      };
    })();
