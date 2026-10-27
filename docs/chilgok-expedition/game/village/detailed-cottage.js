/* 생성 시트의 면별 UV와 돌출 구조를 조립한다. 이미지 자체를 완성된 3D 모델로 취급하지 않는다. */
window.createDetailedCottage = function ({ THREE:T, manager, x, y, z, scale=1, rotation=0 }) {
  const root=new T.Group();root.position.set(x,y,z);root.rotation.y=rotation;root.scale.setScalar(scale);
  const loader=new T.TextureLoader(manager);
  function texture(url){const t=loader.load(url);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t;}
  // 같은 집을 여러 곳에 배치해도 고해상도 시트는 한 번만 읽고 공유한다.
  if(!window.createDetailedCottage.shared){
    const wallTex=texture('assets/cottage-walls.png'),detailTex=texture('assets/cottage-details.png');
    window.createDetailedCottage.shared={walls:new T.MeshStandardMaterial({map:wallTex,color:0xffffff,roughness:.85,emissive:0xffffff,emissiveMap:wallTex,emissiveIntensity:.12}),detail:new T.MeshStandardMaterial({map:detailTex,color:0xffffff,roughness:.9,emissive:0xffffff,emissiveMap:detailTex,emissiveIntensity:.08})};
  }
  const {walls,detail}=window.createDetailedCottage.shared;
  const shadowWood=new T.MeshStandardMaterial({color:new T.Color('#987044').convertSRGBToLinear(),roughness:.85});
  const dark=new T.MeshStandardMaterial({color:new T.Color('#715333').convertSRGBToLinear(),roughness:.85});
  const flowerMats=['#f8d8e7','#fff4de','#e998bb','#c7add9'].map(c=>new T.MeshStandardMaterial({color:new T.Color(c).convertSRGBToLinear(),roughness:.9,side:T.DoubleSide}));
  const green=new T.MeshStandardMaterial({color:new T.Color('#557a32').convertSRGBToLinear(),roughness:.9,side:T.DoubleSide});
  const unitBox=new T.BoxGeometry(1,1,1),leafGeo=new T.SphereGeometry(1,6,4);
  // UV를 시트 사분면 내부로 제한해 옆 패널이나 흰 배경이 섞이지 않게 한다.
  function uvTile(geo,col,row){const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,col*.5+.002+uv.getX(i)*.496,row*.5+.002+uv.getY(i)*.496);return geo;}
  function add(geo,mat,px,py,pz,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,mat);o.position.set(px,py,pz);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;}
  function timber(px,py,pz,sx,sy,sz){return add(unitBox,shadowWood,px,py,pz,sx,sy,sz);}
  function beam(a,b,r=.11){const d=new T.Vector3(...b).sub(new T.Vector3(...a));const o=add(new T.CylinderGeometry(r,r,d.length(),6),shadowWood,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
  function blockWithTile(px,py,pz,sx,sy,sz,col,row){return add(uvTile(new T.BoxGeometry(1,1,1),col,row),detail,px,py,pz,sx,sy,sz);}
  // 앞/좌/뒤/우는 서로 다른 시트 패널을 사용한다. 몸체 폭 8m, 깊이 8m, 처마 높이 6.8m.
  const faceData=[{p:[0,3.4,4],a:0,t:[0,1]},{p:[-4,3.4,0],a:-Math.PI/2,t:[1,1]},{p:[0,3.4,-4],a:Math.PI,t:[0,0]},{p:[4,3.4,0],a:Math.PI/2,t:[1,0]}];
  for(const f of faceData){const m=add(uvTile(new T.PlaneGeometry(8,6.8),...f.t),walls,...f.p);m.rotation.y=f.a;}
  const gableGeo=new T.BufferGeometry();gableGeo.setAttribute('position',new T.Float32BufferAttribute([-4,6.8,0,4,6.8,0,0,10.3,0],3));gableGeo.setAttribute('uv',new T.Float32BufferAttribute([0,.5,.5,.5,.25,1],2));gableGeo.setIndex([0,1,2]);gableGeo.computeVertexNormals();
  add(gableGeo,detail,0,0,4.015);add(gableGeo,detail,0,0,-4.015).rotation.y=Math.PI;
  // 지붕은 얇은 평면 두 장이 아니라 휘어진 표면과 두꺼운 처마·용마루로 조립한다.
  const roofY=t=>10.3-4.05*t+.4*t*t*t*t;
  const raisedTile=uvTile(new T.BoxGeometry(.46,.035,.42),1,1);
  for(const side of [-1,1]){
    const pos=[],uv=[],idx=[],nx=24,nz=16;
    for(let i=0;i<=nx;i++)for(let j=0;j<=nz;j++){const t=i/nx;pos.push(side*t*4.75,roofY(t),-4.65+j/nz*9.3);uv.push(.502+t*.496,.502+j/nz*.496);}
    for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j,b=a+nz+1;if(side===1)idx.push(a,a+1,b,b,a+1,b+1);else idx.push(a,b,a+1,b,a+1,b+1);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();add(geo,detail,0,0,0);
    // 기와 줄마다 얇은 돌출 메시를 더해 가장자리 두께를 만들고 같은 지붕 시트를 사용한다.
    for(let row=1;row<=12;row++)for(let col=0;col<22;col++){
      const t=row/12,xx=side*t*4.75,zz=-4.45+col*.42;
      const tile=add(raisedTile,detail,xx,roofY(t)+.035,zz);
      tile.rotation.z=side*Math.atan2(-4.05+1.6*t*t*t,4.75);
    }
    beam([side*4.72,roofY(1)-.09,-4.85],[side*4.72,roofY(1)-.09,4.85],.16);
    for(const zz of [-4.72,4.72])for(let i=0;i<15;i++){const t=i/15,n=(i+1)/15;beam([side*t*4.75,roofY(t)-.11,zz],[side*n*4.75,roofY(n)-.11,zz],.16);}
    for(let j=0;j<12;j++){const zz=-4.1+j*.75;beam([side*3.4,6.52,zz],[side*4.6,6.3,zz],.095);}
  }
  beam([0,10.35,-4.9],[0,10.35,4.9],.17);
  // 벽의 주요 보·창상자와 기초를 실제로 돌출시켜 시점이 바뀌어도 측면 두께가 보인다.
  for(const px of [-3.92,0,3.92])for(const pz of [-4.05,4.05])timber(px,3.5,pz,.19,6.6,.2);
  for(const py of [1.12,3.82,6.62]){timber(0,py,4.06,8.15,.16,.17);timber(0,py,-4.06,8.15,.16,.17);timber(-4.06,py,0,.17,.16,8.15);timber(4.06,py,0,.17,.16,8.15);}
  let seed=55;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function planter(px,py,pz,angle=0){
    const g=new T.Group();g.position.set(px,py,pz);g.rotation.y=angle;root.add(g);
    const b=new T.Mesh(uvTile(new T.BoxGeometry(1.55,.36,.45),0,0),detail);b.position.y=-.15;b.castShadow=true;b.receiveShadow=true;g.add(b);
    for(let i=0;i<25;i++){
      const xx=(rng()-.5)*1.4,zz=(rng()-.5)*.4,yy=.02+rng()*.16;
      const leaves=new T.Mesh(leafGeo,green);leaves.position.set(xx,yy-.04,zz);leaves.scale.set(.18,.1,.15);g.add(leaves);
      if(i<18){const f=new T.Mesh(leafGeo,flowerMats[i%4]);f.position.set(xx,yy+.09,zz-.04);f.scale.set(.08,.055,.08);g.add(f);}
    }
  }
  for(const xx of [-2.22,2.22]){planter(xx,4.47,4.22);planter(xx,1.55,4.22);planter(xx,4.47,-4.22,Math.PI);}
  for(const side of [-1,1])for(const zz of [-2.1,2.1]){planter(side*4.22,4.47,zz,side*Math.PI/2);planter(side*4.22,1.55,zz,side*Math.PI/2);}
  // 현관과 돌계단. 문 위치는 앞면 시트 중앙과 맞춘다.
  for(let i=0;i<3;i++)blockWithTile(0,.14+i*.2,4.6-i*.24,2.6,.28,1.3-i*.2,1,0);
  timber(-1.1,2.7,4.25,.14,2.8,.14);timber(1.1,2.7,4.25,.14,2.8,.14);
  blockWithTile(0,3.67,4.45,2.8,.17,1.5,1,1).rotation.x=.15;
  for(const xx of [-.98,.98])beam([xx,2.8,4.12],[xx,3.52,5.08],.09);
  blockWithTile(2.3,8.7,-1.8,.85,3.1,.9,1,0);blockWithTile(2.3,10.28,-1.8,1.05,.18,1.1,1,0);
  // 같은 형태·재질의 정적 부품만 인스턴싱해 돌출 디테일의 호출 비용을 줄인다.
  root.updateMatrixWorld(true);const grouped=new Map();
  root.traverse(o=>{if(!o.isMesh)return;const key=o.geometry.uuid+o.material.uuid;if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(o);});
  const inv=new T.Matrix4().copy(root.matrixWorld).invert();
  for(const list of grouped.values()){if(list.length<4)continue;const batch=new T.InstancedMesh(list[0].geometry,list[0].material,list.length);batch.castShadow=true;batch.receiveShadow=true;list.forEach((o,i)=>{batch.setMatrixAt(i,new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));o.parent.remove(o);});root.add(batch);}
  root.userData.collision={x,z,rx:5*scale,rz:5*scale};
  return root;
};
