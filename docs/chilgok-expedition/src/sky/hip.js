      // 사방으로 모인 지붕 집: 벽은 그림의 처마 아랫부분만, 지붕은 그림의 지붕 부분을 지붕 면에 그대로 입혀서 위에서 봐도 벽과 자연스럽게 이어져요
      var EAVE = { h_g_front:.60, h_g_side:.62, h_g_back:.60, h_t_front:.60, h_t_side:.61, h_t_back:.61, h_s_front:.59, h_s_side:.58, h_s_back:.61, h_gs_front:.53, h_gs_side:.56, h_gs_back:.52, h_ts_front:.59, h_ts_side:.59, h_ts_back:.58, h_tb_front:.56, h_tb_side:.56, h_tb_back:.53, h_hr_front:.61, h_hr_side:.57, h_hr_back:.60, sl_blue:.58, t1:.62, t2:.59, tl_s:.52, t_med:.56, tl_m_side:.52, tl_m_back:.50, w_thatch:.66, w_blue:.73, wA_front:.75, wA_back:.76, wB_front:.77, wB_side:.68, wB_back:.74 };
      function eaveOf(k){ return EAVE[k] || 0.58; }
      function faceGeo(pts, uvs, tris){
        var g = new THREE.BufferGeometry(), pa = [], ua = [], i; for(i = 0; i < pts.length; i++){ pa.push(pts[i][0], pts[i][1], pts[i][2]); ua.push(uvs[i][0], uvs[i][1]); }
        g.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(ua, 2)); g.setIndex(tris); g.computeVertexNormals(); return g;
      }
      function hipBody(g, o){
        var P = VA.props, f = P[o.fk], s = P[o.sk], b = P[o.bk]; if(!f || !s || !b) return false;
        var W = o.W, D = o.D, Hf = o.Hf, ef = eaveOf(o.fk), es = eaveOf(o.sk), eb = eaveOf(o.bk), he = Hf*ef, hx = W/2, hz = D/2, r = Math.max(hx - hz*0.95, hx*0.2), wx = hx*0.88, wz = hz*0.88, tr = r/(2*hx);
        function mat(e){ return new THREE.MeshLambertMaterial({ map:pTex(e), transparent:true, alphaTest:0.5, side:THREE.DoubleSide, color:0xe8e2da }); }
        // 벽: 그림의 아랫부분(처마 아래)만
        function wallPlane(e, w, ev, px, pz, ry, mirror){
          var gm = new THREE.PlaneGeometry(w, he), ua = gm.attributes.uv; for(var i = 0; i < ua.count; i++){ var uu = ua.getX(i), vv = ua.getY(i); ua.setXY(i, mirror ? 0.94 - 0.88*uu : 0.06 + 0.88*uu, ev*vv); }
          var m = new THREE.Mesh(gm, mat(e)); m.position.set(px, he/2, pz); m.rotation.y = ry; g.add(m);
        }
        wallPlane(f, 2*wx, ef, 0, wz, 0, false); wallPlane(b, 2*wx, eb, 0, -wz, Math.PI, false);
        wallPlane(s, 2*wz, es, -wx, 0, -Math.PI/2, false); wallPlane(s, 2*wz, es, wx, 0, Math.PI/2, true);
        // 속 덩어리 (벽 + 지붕 속)
        var core = new THREE.Mesh(new THREE.BoxGeometry(2*wx*0.97, he, 2*wz*0.97), new THREE.MeshLambertMaterial({ color:o.wallCol || 0xa89a80 })); core.position.y = he/2; core.castShadow = true; core.receiveShadow = true; g.add(core);
        var A = [-hx, he, hz], B = [hx, he, hz], C = [hx, he, -hz], Dd = [-hx, he, -hz], R1 = [r, Hf, 0], R0 = [-r, Hf, 0];
        function fill(k){ var shr = function(p){ return [p[0]*k, p[1] - 0.25, p[2]*k]; };
          var gm = new THREE.BufferGeometry(), pts = [A, B, R1, R0, C, Dd, R0, R1, Dd, A, R0, B, C, R1].map(shr), pa = []; pts.forEach(function(p){ pa.push(p[0], p[1], p[2]); });
          gm.setAttribute("position", new THREE.Float32BufferAttribute(pa, 3)); gm.setIndex([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 11, 12, 13]); gm.computeVertexNormals();
          var m = new THREE.Mesh(gm, new THREE.MeshLambertMaterial({ color:o.roofCol || 0x66625a, side:THREE.DoubleSide })); m.castShadow = true; g.add(m); }
        fill(0.985);
        // 지붕 네 면: 그림의 지붕 부분(v 가 e~1)을 면 모양대로 입혀요
        function roofFace(e, ev, pts, uvs, tris){ var m = new THREE.Mesh(faceGeo(pts, uvs, tris), mat(e)); m.castShadow = true; g.add(m); }
        roofFace(f, ef, [A, B, R1, R0], [[0, ef], [1, ef], [0.5 + tr, 1], [0.5 - tr, 1]], [0, 1, 2, 0, 2, 3]);                    // 앞
        roofFace(b, eb, [C, Dd, R0, R1], [[0, eb], [1, eb], [0.5 + tr, 1], [0.5 - tr, 1]], [0, 1, 2, 0, 2, 3]);                    // 뒤 (뒤에서 보면 오른쪽이 -x)
        roofFace(s, es, [Dd, A, R0], [[0, es], [1, es], [0.5, 1]], [0, 1, 2]);                                                       // 왼쪽 (왼쪽에서 보면 오른쪽이 +z)
        roofFace(s, es, [B, C, R1], [[1, es], [0, es], [0.5, 1]], [0, 1, 2]);                                                        // 오른쪽 (같은 옆면 그림을 뒤집어서)
        return true;
      }
