      // 움직이지 않는 물건은 같은 재질끼리 구역별로 하나로 합쳐서 그려요 (그리기 횟수가 수십 분의 1로 줄어요)
      (function batchStatic(){
        V.updateMatrixWorld(true);
        var skip = new Set(), winMats = new Set(window.villageWin || []), imgId = 0, canon = {}, buckets = {}, list = [];
        facers.forEach(function(f){ f.traverse(function(o){ skip.add(o); }); });
        bigTrees.forEach(function(b){ b.leaves.traverse(function(o){ skip.add(o); }); });
        V.traverse(function(o){ if(o.userData && o.userData.keep) o.traverse(function(c){ skip.add(c); }); });
        var DEFB = THREE.Material.prototype.onBeforeCompile;
        V.traverse(function(o){
          if(!o.isMesh || o.isInstancedMesh || skip.has(o) || !o.visible) return;
          var m = o.material, g = o.geometry; if(!m || Array.isArray(m) || winMats.has(m) || !g || !g.attributes || !g.attributes.position) return;
          if(m.onBeforeCompile !== DEFB || !(m.isMeshLambertMaterial || m.isMeshBasicMaterial)) return;
          var mp = m.map, im = mp && mp.image; if(im && im._bid === undefined) im._bid = ++imgId;
          var key = [m.type, m.color ? m.color.getHex() : 0, im ? im._bid : 0, mp ? mp.wrapS + "." + mp.wrapT : 0, m.transparent ? 1 : 0, m.opacity, m.alphaTest, m.side, m.emissive ? m.emissive.getHex() : 0, m.depthWrite ? 1 : 0, m.polygonOffset ? m.polygonOffsetFactor : "x", m.blending, o.castShadow ? 1 : 0, o.receiveShadow ? 1 : 0, o.renderOrder].join("|");
          o.updateMatrixWorld(true); var e = o.matrixWorld.elements, cx = Math.floor(e[12]/260), cz = Math.floor(e[14]/260);
          var bk = key + "#" + cx + "," + cz; (buckets[bk] || (buckets[bk] = { key:key, cx:cx, cz:cz, mats:m, items:[] })).items.push(o); list.push(o);
        });
        var inv = new THREE.Matrix4().copy(V.matrixWorld); if(inv.invert) inv.invert(); else inv.getInverse(inv);
        var tmpM = new THREE.Matrix4(), nm = new THREE.Matrix3(), vv = new THREE.Vector3(), chunks = [];
        Object.keys(buckets).forEach(function(bk){
          var B = buckets[bk], m0 = B.mats, items = B.items, vc = 0, ic = 0, i, j;
          items.forEach(function(o){ var g = o.geometry; vc += g.attributes.position.count; ic += g.index ? g.index.count : g.attributes.position.count; });
          var pos = new Float32Array(vc*3), nor = new Float32Array(vc*3), uv = new Float32Array(vc*2), idx = new Uint32Array(ic), vo = 0, io = 0;
          items.forEach(function(o){
            var g = o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, mp = m0.map, rx = mp ? mp.repeat.x : 1, ry = mp ? mp.repeat.y : 1, ox = mp ? mp.offset.x : 0, oy = mp ? mp.offset.y : 0, n = P.count;
            tmpM.multiplyMatrices(inv, o.matrixWorld); nm.getNormalMatrix(tmpM);
            for(i = 0; i < n; i++){
              vv.set(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(tmpM); pos[(vo + i)*3] = vv.x; pos[(vo + i)*3 + 1] = vv.y; pos[(vo + i)*3 + 2] = vv.z;
              if(N){ vv.set(N.getX(i), N.getY(i), N.getZ(i)).applyMatrix3(nm).normalize(); nor[(vo + i)*3] = vv.x; nor[(vo + i)*3 + 1] = vv.y; nor[(vo + i)*3 + 2] = vv.z; } else nor[(vo + i)*3 + 1] = 1;
              if(U){ uv[(vo + i)*2] = U.getX(i)*rx + ox; uv[(vo + i)*2 + 1] = U.getY(i)*ry + oy; }
            }
            if(g.index){ for(j = 0; j < g.index.count; j++) idx[io++] = g.index.getX(j) + vo; } else { for(j = 0; j < n; j++) idx[io++] = vo + j; }
            vo += n;
          });
          var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); geo.computeBoundingSphere();
          var ck = key2(m0); var cm = canon[ck];
          if(!cm){ cm = m0.clone(); if(m0.map){ var tt = m0.map.clone(); tt.repeat.set(1, 1); tt.offset.set(0, 0); tt.needsUpdate = true; cm.map = tt; if(m0.map.image && !m0.map.image.complete){ (function(a, b){ var im2 = a.image; if(im2 && im2.addEventListener) im2.addEventListener("load", function(){ b.needsUpdate = true; }); })(m0.map, tt); } } canon[ck] = cm; }
          var ms = new THREE.Mesh(geo, cm); ms.castShadow = items[0].castShadow; ms.receiveShadow = items[0].receiveShadow; ms.renderOrder = items[0].renderOrder; ms.userData.merged = true; V.add(ms); chunks.push(ms);
          reg(ms, (B.cx + 0.5)*260, (B.cz + 0.5)*260, 1500);
        });
        function key2(m){ var mp = m.map, im = mp && mp.image; return [m.type, m.color ? m.color.getHex() : 0, im ? im._bid : 0, mp ? mp.wrapS + "." + mp.wrapT : 0, m.transparent ? 1 : 0, m.opacity, m.alphaTest, m.side, m.emissive ? m.emissive.getHex() : 0, m.depthWrite ? 1 : 0, m.polygonOffset ? m.polygonOffsetFactor : "x", m.blending].join("|"); }
        list.forEach(function(o){ o._merged = true; if(o.parent) o.parent.remove(o); });
        CULL = CULL.filter(function(cu){ var o = cu.o; if(o._merged) return false; if(!o.isMesh && o.children && o.children.length === 0 && !o.userData.merged) return false; return true; });
        window.__batchInfo = { merged:list.length, chunks:chunks.length };
      })();
