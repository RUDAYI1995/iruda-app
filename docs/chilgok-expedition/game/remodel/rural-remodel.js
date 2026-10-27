/* 기존 칠곡 농촌마을의 빈 땅에만 조경·건물을 추가한다. 렌더러·입력·캐릭터·저장 루프는 만들지 않는다. */
window.mountRuralRemodel=function({THREE:T,parent,renderer,rects,cameraRects,cameraCircles}){
  const bounds={x0:-1845,x1:-1395,z0:-580,z1:-320};
  const conflicts=rects.filter(r=>r.x+r.hx>bounds.x0&&r.x-r.hx<bounds.x1&&r.z+r.hz>bounds.z0&&r.z-r.hz<bounds.z1);
  // 기존 건물을 자동으로 치우거나 새 자산을 임의 이동하지 않는다. 충돌하면 설치를 중단하고 근거를 남긴다.
  if(conflicts.length){console.error('농촌마을 리모델링 부지에 기존 충돌물이 있습니다.',conflicts);return {ready:false,conflicts};}
  const root=new T.Group();root.name='rural-remodel';root.position.set(-1470,.25,-450);root.rotation.y=Math.PI/2;root.scale.setScalar(3);parent.add(root);
  const localToWorld=(x,z)=>({x:-1470+z*3,z:-450-x*3});
  const worldToLocal=(x,z)=>({x:-(z+450)/3,z:(x+1470)/3});
  const inside=(x,z)=>x>bounds.x0&&x<bounds.x1&&z>bounds.z0&&z<bounds.z1;
  const manager=new T.LoadingManager();
  const status={ready:true,loaded:false,conflicts:[],root,bounds,loadErrors:[]};
  manager.onLoad=()=>{status.loaded=status.loadErrors.length===0;};
  manager.onError=url=>{status.loadErrors.push(url);console.error('농촌마을 자산 로딩 실패:',url);};
  const loader=new T.TextureLoader(manager);
  const encoding=T.sRGBEncoding;
  function tex(name){const t=loader.load('remodel/assets/'+name);t.encoding=encoding;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t;}
  const detailTex=tex('cottage-details.png'),terrainTex=tex('terrain-materials.png'),pathTex=tex('garden-path-v3.png'),plantTex=tex('meadow-plants.png'),oakTex=tex('oak-bough.png');
  const color=c=>new T.Color(c).convertSRGBToLinear();
  const mat=(c,extra={})=>new T.MeshStandardMaterial({color:color(c),roughness:.92,...extra});
  function tileMaterial(source,col,row,repeat=1){
    const m=mat('#fff',{map:source});m.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec4 sampleColor=texture2D(map,vec2(${col*.5+.002},${row*.5+.002})+fract(vUv*${repeat.toFixed(3)})*.496);diffuseColor*=mapTexelToLinear(sampleColor);`);
    };m.customProgramCacheKey=()=>[source.uuid,col,row,repeat].join(':');return m;
  }
  const grass=tileMaterial(terrainTex,0,1,18),stone=tileMaterial(terrainTex,1,1,1),wood=tileMaterial(detailTex,0,0),road=mat('#fff',{map:pathTex});
  // 전체 돌길 이미지를 사용한다. 셰이더 반복으로 NPOT 이미지를 자동 축소하지 않으며 원본 비율에 맞춰 UV를 잡는다.
  road.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','diffuseColor*=mapTexelToLinear(texture2D(map,fract(vUv)));');};
  const unitBox=new T.BoxGeometry(1,1,1),rockGeo=new T.IcosahedronGeometry(1,1),branchGeo=new T.CylinderGeometry(.7,1,1,7);
  function add(geo,material,x,y,z,sx=1,sy=1,sz=1,shadow=true){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=shadow;m.receiveShadow=true;root.add(m);return m;}
  const box=(m,x,y,z,sx,sy,sz)=>add(unitBox,m,x,y,z,sx,sy,sz);
  function beam(a,b,r){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=add(branchGeo,wood,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,d.length(),r);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
  function register(x,z,hx,hz,h){const p=localToWorld(x,z);rects.push({x:p.x,z:p.z,hx:hz*3,hz:hx*3});cameraRects.push({x:p.x,z:p.z,hx:hz*3,hz:hx*3,h:h*3+.25});}
  let seed=20261027;const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const range=(a,b)=>a+(b-a)*rand();
  const batches=new Map(),dummy=new T.Object3D();
  function inst(key,geo,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,shadow=false){if(!batches.has(key))batches.set(key,{geo,material,items:[],shadow});batches.get(key).items.push([x,y,z,sx,sy,sz,rx,ry,rz]);}
  // 새 잔디 패치는 기존 넓은 땅 위에 얹고, 테두리를 투명하게 섞어 기존 논과 잔디를 보존한다.
  const groundGeo=new T.PlaneGeometry(84,140,28,46);groundGeo.rotateX(-Math.PI/2);const pos=groundGeo.attributes.position;
  for(let i=0;i<pos.count;i++)pos.setZ(i,pos.getZ(i)-42);
  const ground=add(groundGeo,grass,0,.055,0,1,1,1,false);
  // 바닥 경계는 셰이더 알파로 부드럽게 이어지며 기존 지면 메시를 자르지 않는다.
  const grassCompile=grass.onBeforeCompile;grass.transparent=true;grass.depthWrite=false;grass.polygonOffset=true;grass.polygonOffsetFactor=-1;grass.polygonOffsetUnits=-1;
  grass.onBeforeCompile=shader=>{grassCompile(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <dithering_fragment>',`vec2 localGround=vec2((vUv.x-.5)*84.,28.-vUv.y*140.);float pathCenter=sin((localGround.y-20.)*.055)*1.1;float streamCenter=-13.5+sin(localGround.y*.045)*1.4;if(abs(localGround.x-pathCenter)<2.5||abs(localGround.x-streamCenter)<2.6)discard;float edge=min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y));gl_FragColor.a*=smoothstep(0.,.13,edge);\n#include <dithering_fragment>`);};
  const roadX=z=>Math.sin((z-20)*.055)*1.1;
  const vertices=[],uvs=[],indices=[];
  for(let i=0;i<=120;i++){const z=20-i,c=roadX(z);vertices.push(c-2.4,.08,z,c+2.4,.08,z);uvs.push(0,i*.37,1,i*.37);if(i<120){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const pathGeo=new T.BufferGeometry();pathGeo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));pathGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));pathGeo.setIndex(indices);pathGeo.computeVertexNormals();add(pathGeo,road,0,0,0,1,1,1,false);
  // 기존 7구역 골목 끝(-1330,-450)부터 새 길 입구까지 같은 높이의 연결로를 만든다.
  const connectorGeo=new T.PlaneGeometry(14,82);connectorGeo.rotateX(-Math.PI/2);for(let i=0;i<connectorGeo.attributes.uv.count;i++)connectorGeo.attributes.uv.setY(i,connectorGeo.attributes.uv.getY(i)*10.4);const connector=new T.Mesh(connectorGeo,road);connector.position.set(-1370,.41,-450);connector.rotation.y=Math.PI/2;connector.receiveShadow=true;parent.add(connector);status.connector=connector;
  const homes=[[13,-9,1,-.12],[15,-46,.86,.12],[-27,-68,.84,-.15]];
  for(const [x,z,s,rotation]of homes){const cottage=window.createDetailedCottage({THREE:T,manager,x,y:.055,z,scale:s,rotation,assetBase:'remodel/assets/'});root.add(cottage);register(x,z,5.3*s,5.3*s,11*s);}
  const riverX=z=>-13.5+Math.sin(z*.045)*1.4;
  const waterMat=new T.ShaderMaterial({side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;uniform float time;void main(){float a=sin(p.z*3.+sin(p.x*7.+time*.8)+time)*sin(p.x*8.-p.z*1.4-time*.6);float sparkle=pow(max(a,0.),14.);vec3 c=mix(vec3(.18,.4,.33),vec3(.42,.67,.67),.6+a*.2)+sparkle*.28;gl_FragColor=vec4(c,1.);}'});
  const wpos=[],widx=[];
  for(let i=0;i<=128;i++){const z=22-i,c=riverX(z);wpos.push(c-2.5,.061,z,c+2.5,.061,z);if(i<128){const a=i*2;widx.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const wgeo=new T.BufferGeometry();wgeo.setAttribute('position',new T.Float32BufferAttribute(wpos,3));wgeo.setIndex(widx);wgeo.computeVertexNormals();const water=add(wgeo,waterMat,0,0,0,1,1,1,false);water.receiveShadow=false;
  const bridgeZ=-30,bridgeC=riverX(bridgeZ),bridgeHalf=5.4;
  const bridgeHeight=x=>.065+1.35*Math.pow(Math.sin(Math.PI*Math.max(0,Math.min(1,(x-bridgeC+bridgeHalf)/(bridgeHalf*2)))),2);
  for(let i=0;i<24;i++){const x=bridgeC-bridgeHalf+(i+.5)*bridgeHalf*2/24,y=bridgeHeight(x);box(stone,x,y-.08,bridgeZ,.48,.16,3);for(const side of [-1,1])box(stone,x,y+.3,bridgeZ+side*1.55,.49,.6,.37);}
  const branchPath=new T.PlaneGeometry(2.7,27);branchPath.rotateX(-Math.PI/2);for(let i=0;i<branchPath.attributes.uv.count;i++)branchPath.attributes.uv.setY(i,branchPath.attributes.uv.getY(i)*17.8);const pathBranch=add(branchPath,road,-13.5,.081,bridgeZ,1,1,1,false);pathBranch.rotation.y=Math.PI/2;
  // 물가 바위는 시트를 적용한 입체이며, 잎은 서로 다른 방향의 투명 면을 겹쳐 구성한다.
  for(let i=0;i<145;i++){const z=range(-106,22),side=rand()>.5?1:-1,x=riverX(z)+side*range(2.6,3.5),s=range(.2,.8);if(Math.abs(z-bridgeZ)<2)continue;inst('rocks',rockGeo,stone,x,.15,z,s,s*.6,s*.9,range(-.3,.3),range(0,6.28),0,true);}
  const plants=mat('#fff',{map:plantTex,side:T.DoubleSide,alphaTest:.4,emissive:0xffffff,emissiveMap:plantTex,emissiveIntensity:.14});
  const plantGeos=[];for(let p=0;p<4;p++){const g=new T.PlaneGeometry(1,1);g.translate(0,.5,0);const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,(p%2)*.5+.002+u.getX(i)*.496,(p<2?.5:0)+.002+u.getY(i)*.496);plantGeos.push(g);}
  const occupied=(x,z,pad=0)=>homes.some(h=>Math.abs(x-h[0])<5.4*h[2]+pad&&Math.abs(z-h[1])<5.4*h[2]+pad);
  for(let i=0;i<3100;i++){const z=range(-103,22),x=range(-36,35);if(Math.abs(x-roadX(z))<2.6||Math.abs(x-riverX(z))<3.2||occupied(x,z,.5)||Math.abs(z-bridgeZ)<1.8)continue;const p=Math.abs(x-roadX(z))<8&&rand()>.45?1+Math.floor(rand()*3):0,s=range(.4,.9),ry=range(0,Math.PI);for(const a of[ry,ry+Math.PI/2])inst('plant-'+p,plantGeos[p],plants,x,.055,z,s,s,s,0,a);}
  const oak=mat('#dfe9b5',{map:oakTex,side:T.DoubleSide,alphaTest:.42,emissive:0xffffff,emissiveMap:oakTex,emissiveIntensity:.12});const leafGeo=new T.PlaneGeometry(1,1);
  function tree(x,z,s){beam([x,.055,z],[x+.2*s,5.7*s,z],.35*s);for(let b=0;b<4;b++){const a=b*Math.PI/2,tx=x+Math.cos(a)*s*2,tz=z+Math.sin(a)*s*2,ty=6*s+range(-.4,.7);beam([x,3.4*s,z],[tx,ty,tz],.15*s);for(let j=0;j<28;j++){const theta=range(0,6.28),r=Math.sqrt(rand())*2*s;inst('oak',leafGeo,oak,tx+Math.cos(theta)*r,ty+range(-1.3,1.3)*s,tz+Math.sin(theta)*r,range(1.6,2.3)*s,range(1.1,1.65)*s,1,range(-.8,.8),range(0,6.28),range(-.4,.4),true);}}register(x,z,.5*s,.5*s,1);const p=localToWorld(x,z);cameraCircles.push({x:p.x,z:p.z,r:6*s,base:3*s*3,h:9*s*3});}
  [[-7,12,1.05],[25,-24,1],[-25,-8,.95],[-30,-40,1.1],[8,-80,.95],[28,-92,.9],[-30,-96,.85]].forEach(a=>tree(...a));
  function fence(x,z,len){for(let i=0;i<=len;i+=2.7){box(wood,x,.6,z-i,.18,1.2,.18);if(i<len)for(const h of[.45,.9])box(wood,x,h,z-i-1.35,.1,.1,2.8);}register(x,z-len/2,.22,len/2+1,1.2);}
  fence(-6.5,18,41);fence(-6.5,-36,44);fence(6,18,12);
  for(const b of batches.values()){const im=new T.InstancedMesh(b.geo,b.material,b.items.length);im.castShadow=b.shadow;im.receiveShadow=true;im.frustumCulled=false;b.items.forEach((v,i)=>{dummy.position.set(v[0],v[1],v[2]);dummy.scale.set(v[3],v[4],v[5]);dummy.rotation.set(v[6],v[7],v[8]);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});im.instanceMatrix.needsUpdate=true;root.add(im);}
  // 기존 렌더러의 색 출력 설정은 바꾸지 않고 새 자산의 출력만 맞춘다.
  if(renderer.outputEncoding!==T.sRGBEncoding){const materials=new Set();root.traverse(o=>{if(o.material&&o.material.isMeshStandardMaterial)materials.add(o.material);});materials.forEach(m=>{const compile=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=shader=>{compile(shader);shader.fragmentShader=shader.fragmentShader.replace('#include <encodings_fragment>','gl_FragColor = LinearTosRGB(gl_FragColor);');};m.customProgramCacheKey=()=>key()+':local-srgb';});}
  status.heightAt=(x,z)=>{if(!inside(x,z))return null;const p=worldToLocal(x,z);if(Math.abs(p.z-bridgeZ)<1.45&&Math.abs(p.x-bridgeC)<=bridgeHalf)return .25+bridgeHeight(p.x)*3;return .415;};
  // 기존 카메라 제어는 유지하고 새 구간 안에서만 내려다보는 높이를 부드럽게 줄인다.
  status.cameraBlendAt=(x,z)=>{if(!inside(x,z))return 0;const d=Math.min(x-bounds.x0,bounds.x1-x,z-bounds.z0,bounds.z1-z);const t=Math.min(1,d/45);return t*t*(3-2*t);};
  status.walkable=(x,z)=>{if(!inside(x,z))return true;const p=worldToLocal(x,z);if(p.z<-106||p.z>22)return true;return Math.abs(p.x-riverX(p.z))>2.6||(Math.abs(p.z-bridgeZ)<1.4&&Math.abs(p.x-bridgeC)<bridgeHalf+.2);};
  status.update=(t,p)=>{const near=Math.hypot(p.x+1610,p.z+450)<650;root.visible=near;connector.visible=near;if(near)waterMat.uniforms.time.value=t/1000;};
  return status;
};
