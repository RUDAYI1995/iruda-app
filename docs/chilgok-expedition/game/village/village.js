/* 칠곡원정대 개울 마을: 기존 월드와 분리된 시범 구간. 모든 건축·지형은 실제 입체 메시다. */
(() => {
  'use strict';
  const T = window.THREE;
  const loading = document.querySelector('#loading');
  if (!T) { loading.textContent = '3D 라이브러리를 읽지 못했습니다. 기존 월드로 돌아가 다시 열어 주세요.'; return; }
  let renderer;
  try { renderer = new T.WebGLRenderer({ antialias:true, powerPreference:'high-performance' }); }
  catch (error) { loading.textContent = 'WebGL을 시작하지 못했습니다. 브라우저의 그래픽 가속을 확인해 주세요.'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  document.querySelector('#view').appendChild(renderer.domElement);
  const scene = new T.Scene();
  scene.background = new T.Color('#b1d9ed');
  scene.fog = new T.Fog('#bdd8df',110,500);
  const camera = new T.PerspectiveCamera(57, innerWidth/innerHeight, .1, 650);
  scene.add(new T.HemisphereLight('#e4f2ff', '#a0a86d', .65));
  const sun = new T.DirectionalLight('#ffedc7', 1.55);
  sun.position.set(-38,62,32); sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera, { left:-48,right:48,top:48,bottom:-48,near:1,far:180 });
  sun.shadow.bias = -.00025; sun.shadow.normalBias = .035;
  scene.add(sun); scene.add(sun.target);
  const clock = new T.Clock();
  const assetManager=new T.LoadingManager();let assetFailed=false;
  assetManager.onLoad=()=>{if(!assetFailed){loading.hidden=true;loading.style.display='none';}};
  assetManager.onError=url=>{assetFailed=true;loading.textContent='이미지 자산을 읽지 못했습니다: '+url;loading.style.display='grid';};
  const assetLoader=new T.TextureLoader(assetManager);
  const landscapeMaterials=window.createLandscapeMaterials(T,assetManager);
  let seed = 1975;
  const random = () => { seed = (1664525*seed+1013904223)>>>0; return seed/4294967296; };
  const range = (a,b) => a+(b-a)*random();
  const color = x => new T.Color(x).convertSRGBToLinear();
  const material = (c,extra={}) => new T.MeshStandardMaterial({color:color(c),roughness:.88,...extra});
  const mats = {
    wood:material('#876039'), darkwood:material('#59432b'), paleWood:material('#b58a52'),
    stone:material('#b4ad91'), rock:material('#969c85'), moss:material('#727d42'),
    wall:material('#f1dfb7'), roof:material('#ad5737'), grass:material('#718c3e'),
    glass:material('#72918a',{roughness:.2,metalness:.15}), black:material('#263e38'),
    white:material('#fff4df'), pink:material('#e77b98'), blue:material('#334c94'), gold:material('#e8b851')
  };
  mats.rock=landscapeMaterials.rock;mats.stone=landscapeMaterials.rock;
  const solidBoxes = [];
  const geometries = { box:new T.BoxGeometry(1,1,1), sphere:new T.SphereGeometry(1,10,7), rock:new T.IcosahedronGeometry(1,1), leaf:new T.SphereGeometry(1,5,3), cylinder:new T.CylinderGeometry(1,1,1,9), branch:new T.CylinderGeometry(.72,1,1,7) };
  function mesh(geo,mat,x,y,z,sx=1,sy=1,sz=1,parent=scene,shadow=true) {
    const o = new T.Mesh(geo,mat); o.position.set(x,y,z); o.scale.set(sx,sy,sz);
    o.castShadow=shadow; o.receiveShadow=true; parent.add(o); return o;
  }
  const box=(mat,x,y,z,sx,sy,sz,parent=scene)=>mesh(geometries.box,mat,x,y,z,sx,sy,sz,parent);
  const sphere=(mat,x,y,z,sx,sy,sz,parent=scene)=>mesh(geometries.sphere,mat,x,y,z,sx,sy,sz,parent);
  function beam(a,b,r,mat,parent=scene) {
    const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);
    const o=mesh(geometries.branch,mat,...av.clone().add(bv).multiplyScalar(.5).toArray(),r,v.length(),r,parent);
    o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize()); return o;
  }
  // 지형·식생·이동이 같은 높이 함수를 사용해 바닥과 발 위치를 일치시킨다.
  const riverX = z => -13 + 2.2*Math.sin(z*.045);
  const roadX = z => 2.3*Math.sin(z*.037)+.9*Math.cos(z*.09);
  function height(x,z) {
    const edge=Math.max(0,Math.abs(x)-19);
    const base=.2*Math.sin(x*.15+z*.04)+.17*Math.sin(z*.15)+edge*.15+Math.sin(z*.065)*Math.min(edge*.15,2.8);
    const d=Math.abs(x-riverX(z));
    return base - Math.max(0,1-d/4.5)*1.8;
  }
  const terrain = new T.PlaneGeometry(185,245,150,190); terrain.rotateX(-Math.PI/2);
  const tp=terrain.attributes.position, tc=[];
  for(let i=0;i<tp.count;i++) {
    const x=tp.getX(i),z=tp.getZ(i)-72; tp.setZ(i,z); tp.setY(i,height(x,z));
    const k=.5+.22*Math.sin(x*.42+z*.23)+.13*Math.sin(x*1.3-z*.8);
    const c=color('#65813c').lerp(color('#b1b365'),k);tc.push(c.r,c.g,c.b);
  }
  terrain.setAttribute('color',new T.Float32BufferAttribute(tc,3));terrain.computeVertexNormals();
  const terrainMat=landscapeMaterials.grass;
  mesh(terrain,terrainMat,0,0,0,1,1,1,scene,false);
  const atlas=assetLoader.load('materials.png');
  atlas.encoding=T.sRGBEncoding; atlas.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  // 아틀라스의 각 사분면을 독립 반복 샘플링한다. 원본 이미지 파일의 픽셀은 편집하지 않는다.
  function atlasMat(c,tile,repeat=1) {
    const m=material(c,{map:atlas});
    m.onBeforeCompile=shader=>{
      shader.uniforms.atlasTile={value:new T.Vector2(...tile)};
      shader.uniforms.tileRepeat={value:repeat};
      shader.fragmentShader='uniform vec2 atlasTile; uniform float tileRepeat;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
        vec2 auv=atlasTile+vec2(.002)+fract(vUv*tileRepeat)*.496;
        vec4 texelColor=texture2D(map,auv); texelColor=mapTexelToLinear(texelColor); diffuseColor*=texelColor;
        #endif`);
    };
    m.customProgramCacheKey=()=>tile.join(',')+':'+repeat; return m;
  }
  mats.wall=atlasMat('#ffffff',[.5,.5],2);
  mats.roof=atlasMat('#e4b59b',[0,0],3);
  mats.wood=atlasMat('#e7d4b0',[.5,0],1);
  const roadMat=atlasMat('#fff2ce',[0,.5],1);
  const roadVerts=[],roadUV=[],roadIdx=[];
  for(let i=0;i<=150;i++) {
    const z=28-i*1.12,cx=roadX(z),w=2.45+.3*Math.sin(z*.14);
    for(const side of [-1,1]) {const x=cx+side*w;roadVerts.push(x,height(x,z)+.025,z);roadUV.push(side===-1?0:1,i*.24);}
    if(i<150){let k=i*2;roadIdx.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const roadGeo=new T.BufferGeometry();roadGeo.setAttribute('position',new T.Float32BufferAttribute(roadVerts,3));roadGeo.setAttribute('uv',new T.Float32BufferAttribute(roadUV,2));roadGeo.setIndex(roadIdx);roadGeo.computeVertexNormals();
  mesh(roadGeo,roadMat,0,0,0,1,1,1,scene,false);
  // 반복 요소는 종류별 인스턴스로 합쳐 PC·휴대폰에 동일한 장면을 적은 드로 호출로 제공한다.
  const batches = new Map();
  const dummy=new T.Object3D();
  function instance(key,geo,mat,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,tint=null,shadow=false) {
    if(!batches.has(key))batches.set(key,{geo,mat,items:[],shadow});
    batches.get(key).items.push({x,y,z,sx,sy,sz,rx,ry,rz,tint});
  }
  function flushInstances() {
    for(const b of batches.values()) {
      const o=new T.InstancedMesh(b.geo,b.mat,b.items.length);o.castShadow=b.shadow;o.receiveShadow=true;
      b.items.forEach((v,i)=>{
        dummy.position.set(v.x,v.y,v.z);dummy.scale.set(v.sx,v.sy,v.sz);dummy.rotation.set(v.rx,v.ry,v.rz);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);
        if(v.tint)o.setColorAt(i,color(v.tint));
      });o.instanceMatrix.needsUpdate=true; if(o.instanceColor)o.instanceColor.needsUpdate=true;scene.add(o);
    }
  }
  const blade=new T.BufferGeometry();blade.setAttribute('position',new T.Float32BufferAttribute([-.055,0,0,.055,0,0,.07,.37,.03,0,.58,.06],3));blade.setIndex([0,1,2,0,2,3]);blade.computeVertexNormals();
  const bladeMat=material('#fff',{side:T.DoubleSide});
  for(let i=0;i<9000;i++) {
    const z=range(-132,27),x=range(-46,48),rd=Math.abs(x-roadX(z)),rv=Math.abs(x-riverX(z));
    if(rd<2.65||rv<3.25)continue;
    const size=range(.45,1.35),y=height(x,z);
    instance('grass',blade,bladeMat,x,y-.03,z,size,size,size,range(-.1,.1),range(0,Math.PI*2),0,random()>.5?'#7c963f':'#a0ac51');
  }
  const petalMat=material('#fff',{side:T.DoubleSide});
  const materialRoadStone=material('#d8ccb0');
  // 길의 큰 돌은 실제 높이를 갖도록 배치하고 바탕 재질과 함께 사용한다.
  for(let i=0;i<2400;i++){
    const z=range(-134,25),x=roadX(z)+range(-2.25,2.25),r=range(.12,.35);
    instance('road-stones',geometries.rock,materialRoadStone,x,height(x,z)+.025,z,r,range(.025,.045),r*range(.7,1.3),0,range(0,6.28),0,random()>.5?'#d0c39e':'#b7ac8d');
  }
  // 오브젝트별 식생 시트를 서로 교차하는 면에 배치한다. 사진 한 장짜리 전체 배경으로 대체하지 않는다.
  const plantTexture=assetLoader.load('assets/meadow-plants.png');plantTexture.encoding=T.sRGBEncoding;plantTexture.anisotropy=8;
  const plantMat=material('#fff',{map:plantTexture,side:T.DoubleSide,alphaTest:.38,emissive:0xffffff,emissiveMap:plantTexture,emissiveIntensity:.13});
  const plantGeos=[];
  for(let panel=0;panel<4;panel++){
    const g=new T.PlaneGeometry(1,1);g.translate(0,.5,0);const uv=g.attributes.uv,col=panel%2,row=panel<2?1:0;
    for(let j=0;j<uv.count;j++)uv.setXY(j,col*.5+.002+uv.getX(j)*.496,row*.5+.002+uv.getY(j)*.496);plantGeos.push(g);
  }
  for(let i=0;i<8200;i++){
    const z=range(-125,26),side=random()>.5?1:-1,x=roadX(z)+side*range(2.6,26),rd=Math.abs(x-riverX(z));
    if(rd<3.4)continue;
    const nearPath=Math.abs(x-roadX(z))<6.5,panel=nearPath&&random()>.48?1+Math.floor(random()*3):0;
    const sz=panel===0?range(.4,.9):range(.4,.8),y=height(x,z),rot=range(0,Math.PI);
    for(const a of [rot,rot+Math.PI/2])instance('plants-'+panel,plantGeos[panel],plantMat,x,y-.05,z,sz,sz,sz,0,a,0,null,false);
  }
  // 바위는 제각기 다른 회전·비율을 주며 하천 양쪽 둑에 배치한다.
  for(let i=0;i<235;i++) {
    const z=range(-140,28),x=riverX(z)+(random()>.5?1:-1)*range(2.9,5.2),s=range(.35,1.4);
    instance('river-rock',geometries.rock,mats.rock,x,height(x,z)+s*.2,z,s,s*.7,s*.8,range(-.3,.3),range(0,6),range(-.2,.2),random()>.5?'#b6b29a':'#8d9987',true);
  }
  const waterMat=new T.ShaderMaterial({transparent:true,side:T.DoubleSide,uniforms:{time:{value:0}},vertexShader:`varying vec3 wpos;void main(){vec4 w=modelMatrix*vec4(position,1.);wpos=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`uniform float time;varying vec3 wpos;void main(){float n=sin(wpos.z*3.+sin(wpos.x*5.+time*.5)+time*1.2)*sin(wpos.x*7.-wpos.z*1.3-time*.8);float ripple=pow(max(0.,n),14.);vec3 c=mix(vec3(.15,.36,.29),vec3(.36,.62,.60),.6+.2*n);c+=ripple*.35;gl_FragColor=vec4(c,.93);}`});
  const wv=[],wi=[];
  for(let i=0;i<=180;i++){const z=30-i,x=riverX(z);wv.push(x-3.15,-.47,z,x+3.15,-.47,z);if(i<180){const k=i*2;wi.push(k,k+2,k+1,k+1,k+2,k+3);}}
  const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wv,3));wg.setIndex(wi);wg.computeVertexNormals();mesh(wg,waterMat,0,0,0,1,1,1,scene,false);
  function fence(x1,z1,x2,z2) {
    const len=Math.hypot(x2-x1,z2-z1),n=Math.ceil(len/2.8);
    for(let i=0;i<=n;i++) {
      const x=x1+(x2-x1)*i/n,z=z1+(z2-z1)*i/n,y=height(x,z);
      instance('fence-post',geometries.box,mats.wood,x,y+.68,z,.23,1.4,.24,0,range(-.06,.06),0,null,true);
      if(i<n)for(const h of [.48,1.05]) {
        const nx=x1+(x2-x1)*(i+1)/n,nz=z1+(z2-z1)*(i+1)/n,ny=height(nx,nz);
        const a=new T.Vector3(x,y+h,z),b=new T.Vector3(nx,ny+h,nz),d=b.clone().sub(a);
        dummy.quaternion.setFromUnitVectors(new T.Vector3(1,0,0),d.clone().normalize());const e=new T.Euler().setFromQuaternion(dummy.quaternion);
        instance('fence-rail',geometries.box,mats.wood,(x+nx)/2,(y+ny)/2+h,(z+nz)/2,d.length(),.12,.12,e.x,e.y,e.z,null,true);
      }
    }
  }
  fence(-6,24,-7,-17);fence(-7,-33,-8,-71);fence(7,20,7,5);fence(7,-22,7,-54);
  const oakTex=assetLoader.load('assets/oak-bough.png');oakTex.encoding=T.sRGBEncoding;oakTex.anisotropy=8;
  const oakMat=material('#e4eca8',{map:oakTex,alphaTest:.4,side:T.DoubleSide,emissive:0xc7d59b,emissiveMap:oakTex,emissiveIntensity:.19});
  const oakGeo=new T.PlaneGeometry(1,1);
  function tree(x,z,size=1,pink=false) {
    const y=height(x,z),trunk=range(5,7)*size,root=range(.32,.52)*size;
    beam([x,y,z],[x+.4*size,y+trunk,z],root,mats.wood);
    for(let j=0;j<5;j++) {
      const a=j*1.256+random()*.3, bx=x+Math.cos(a)*size*2.4,bz=z+Math.sin(a)*size*2.4,by=y+trunk+range(-.8,1.6)*size;
      beam([x,y+trunk*.55,z],[bx,by,bz],root*.48,mats.wood);
      const leafCount=pink?130:37;
      for(let k=0;k<leafCount;k++) {
        const u=range(-1,1),theta=range(0,Math.PI*2),rr=Math.cbrt(random()),rad=2.6*size;
        const lx=bx+rad*rr*Math.sqrt(1-u*u)*Math.cos(theta),ly=by+u*rad*rr*.7,lz=bz+rad*rr*Math.sqrt(1-u*u)*Math.sin(theta);
        const c=pink?(random()>.45?'#efb8c6':'#de96b5'):(random()>.6?'#b0bc57':random()>.5?'#809743':'#5c823e');
        if(pink)instance('pink-leaves',geometries.leaf,petalMat,lx,ly,lz,range(.16,.33)*size,range(.055,.11)*size,range(.13,.3)*size,range(0,3),range(0,6),range(0,3),c,true);
        else instance('oak-bough',oakGeo,oakMat,lx,ly,lz,range(1.45,2.3)*size,range(1.1,1.6)*size,1,range(-.7,.7),range(0,6.28),range(-.6,.6),null,true);
      }
    }
    solidBoxes.push({x,z,rx:root+.1,rz:root+.1});
  }
  tree(-8,12,1.5);tree(-22,-12,1.15);tree(-27,-28,1.1);tree(19,-27,1.05,true);tree(26,-43,1.25,true);tree(-18,-49,.95);tree(9,-66,.9,true);
  for(let i=0;i<30;i++)tree((random()>.5?1:-1)*range(24,65),range(-145,-45),range(.55,1.1),random()>.85);
  for(let b=0;b<150;b++){
    const z=range(-115,22),x=(random()>.5?1:-1)*range(5,38);
    if(Math.abs(x-riverX(z))<4||Math.abs(x-roadX(z))<3.4)continue;
    const radius=range(.3,.9),y=height(x,z);
    for(let j=0;j<28;j++){
      const a=range(0,6.28),r=Math.sqrt(random())*radius;
      instance('green-leaves',geometries.leaf,petalMat,x+Math.cos(a)*r,y+range(.1,.7)*radius,z+Math.sin(a)*r,.22,.085,.18,range(0,3),range(0,6),range(0,3),random()>.5?'#7c943f':'#597d3e',true);
    }
  }
  for(const [x,z,s] of [[-6,18,1.1],[-8,8,.8],[5.8,17,.85],[6.5,-7,.6],[-9,-8,1.2]]){
    instance('river-rock',geometries.rock,mats.rock,x,height(x,z)+s*.3,z,s,s*.6,s*.8,.12,.5,.1,'#8c967e',true);
  }
  function house(x,z,s=1,angle=0) {
    const g=new T.Group();g.position.set(x,height(x,z),z);g.rotation.y=angle;g.scale.setScalar(s);scene.add(g);
    box(mats.stone,0,.3,0,7,.6,6,g);
    box(mats.wall,0,3,0,6.5,5.5,5.5,g);
    // 삼각 박공과 두 면의 지붕은 별도 입체 형태로 구성한다.
    const shape=new T.Shape();shape.moveTo(-3.25,0);shape.lineTo(3.25,0);shape.lineTo(0,3.15);shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth:5.5,bevelEnabled:false});mesh(geo,mats.wall,0,5.7,-2.75,1,1,1,g);
    const roofL=box(mats.roof,-1.9,7.14,0,5.2,.22,6.8,g);roofL.rotation.z=.77;
    const roofR=box(mats.roof,1.9,7.14,0,5.2,.22,6.8,g);roofR.rotation.z=-.77;
    beam([0,9.02,-3.5],[0,9.02,3.5],.16,mats.wood,g);
    for(const side of [-1,1]){
      beam([side*3.8,5.35,-3.45],[0,9.04,-3.45],.14,mats.wood,g);
      beam([side*3.8,5.35,3.45],[0,9.04,3.45],.14,mats.wood,g);
    }
    for(const px of [-3.18,0,3.18])for(const pz of [-2.8,2.8])box(mats.darkwood,px,3,pz,.2,5.5,.2,g);
    for(const py of [.7,3.2,5.65]){box(mats.wood,0,py,-2.86,6.7,.2,.2,g);box(mats.wood,0,py,2.86,6.7,.2,.2,g);box(mats.wood,-3.3,py,0,.2,.2,5.6,g);box(mats.wood,3.3,py,0,.2,.2,5.6,g);}
    for(const px of [-1.55,1.55])beam([px-1.2,3.35,-2.88],[px+1.2,5.5,-2.88],.075,mats.wood,g);
    // 정면 창틀, 창살, 깊이가 있는 화분 상자를 모델링한다.
    for(const px of [-1.6,1.6])for(const py of [2,4.45]) {
      box(mats.darkwood,px,py,-2.89,1.6,1.65,.15,g);box(mats.glass,px,py,-2.99,1.35,1.4,.06,g);
      box(mats.paleWood,px,py,-3.04,.08,1.4,.09,g);box(mats.paleWood,px,py,-3.04,1.35,.08,.09,g);
      box(mats.wood,px,py-.92,-3.1,1.8,.16,.45,g);
      if(py>3) {
        box(mats.wood,px,py-1.05,-3.1,1.6,.32,.48,g);
        for(let j=0;j<12;j++){const cc=j%2?mats.pink:mats.white;sphere(cc,px+range(-.7,.7),py-.8+range(0,.18),-3.1+range(-.15,.15),.1,.09,.1,g);}
      }
    }
    box(mats.wood,.2,1.45,-2.96,1.15,2.5,.16,g);
    for(let j=0;j<6;j++)box(mats.darkwood,-.3+j*.2,1.45,-3.06,.025,2.4,.025,g);
    sphere(mats.gold,.6,1.4,-3.1,.05,.05,.05,g);
    box(mats.stone,0,.28,-3.4,2.4,.22,1,g);box(mats.stone,0,.12,-3.8,2.8,.15,.5,g);
    box(mats.stone,1.7,7.8,1.35,.75,3,.8,g);box(mats.darkwood,1.7,9.35,1.35,.95,.2,1,g);
    // 충돌은 건물 몸체의 회전 후 바깥 경계를 보수적으로 사용한다.
    const ca=Math.abs(Math.cos(angle)),sa=Math.abs(Math.sin(angle));
    solidBoxes.push({x,z,rx:s*(3.5*ca+3*sa),rz:s*(3.5*sa+3*ca)});
    return g;
  }
  // 새 시트 기반 주택은 각 면이 조립된 별도 자산이며 기존 단순 주택과 혼동하지 않는다.
  for(const [x,z,scale,rotation] of [[12,-1,1,-.12],[14,-26,.7,.18],[-24,-38,.65,-.25],[12,-49,.62,-.12],[-21,-67,.62,.2],[18,-85,.6,-.2],[-2,-113,.48,.1]]){
    const cottage=window.createDetailedCottage({THREE:T,manager:assetManager,x,y:height(x,z),z,scale,rotation});scene.add(cottage);solidBoxes.push(cottage.userData.collision);
  }
  // 집 앞 오크통과 시장 천막.
  function barrel(x,z,s=1) {
    const y=height(x,z);mesh(new T.CylinderGeometry(.45,.4,1.05,12),mats.wood,x,y+.53*s,z,s,s,s);
    for(const py of [.17,.84])mesh(new T.TorusGeometry(.445,.025,5,14),mats.darkwood,x,y+py*s,z,s,s,s).rotation.x=Math.PI/2;
  }
  barrel(7.4,1);barrel(8.4,.4,.83);barrel(7.8,-2,.9);
  for(const x of [6.2,11])for(const z of [-15,-19])beam([x,height(x,z),z],[x,3.2,z],.075,mats.wood);
  const canopy=mesh(new T.ConeGeometry(3.1,1,4,1,true),material('#f4dfaa',{side:T.DoubleSide}),8.6,3.35,-17,1,.7,.8);canopy.rotation.y=Math.PI/4;
  box(mats.wood,8.6,1.05,-17,4.6,.2,2);box(mats.darkwood,8.6,.5,-17,4.3,1,1.5);
  for(let j=0;j<25;j++)sphere(j%2?mats.pink:mats.gold,range(6.8,10.3),1.28+random()*.15,range(-17.6,-16.5),.15,.14,.15);
  // 돌다리: 실제 반원 아치 구멍, 걸을 수 있는 곡면 상판과 낮은 난간.
  const bridgeZ=-25,bridgeCenter=riverX(bridgeZ),bridgeLength=11;
  function bridgeY(x){return 1.1+1.4*Math.sin(Math.PI*Math.max(0,Math.min(1,(x-bridgeCenter+bridgeLength/2)/bridgeLength)));}
  const arch=new T.Shape();arch.moveTo(-5.5,-1);arch.lineTo(-5.5,1.1);for(let i=0;i<=30;i++){const x=-5.5+i*11/30;arch.lineTo(x,1.1+1.4*Math.sin(i*Math.PI/30));}arch.lineTo(5.5,-1);arch.lineTo(3.4,-1);for(let i=0;i<=30;i++){const a=i*Math.PI/30;arch.lineTo(Math.cos(a)*3.4,-.8+Math.sin(a)*2.45);}arch.lineTo(-5.5,-1);
  const bridge=mesh(new T.ExtrudeGeometry(arch,{depth:2.9,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:1,steps:1}),mats.stone,bridgeCenter,0,bridgeZ-1.45);
  for(let i=0;i<18;i++) {
    const x=bridgeCenter-5.5+(i+.5)*11/18,y=bridgeY(x);
    for(const side of [-1,1])instance('bridge-block',geometries.box,mats.stone,x,y+.4,bridgeZ+side*1.55,.6,.7,.45,0,range(-.03,.03),0,i%2?'#b7b49b':'#a0a48d',true);
    instance('bridge-deck',geometries.box,mats.stone,x,y,bridgeZ,.64,.15,2.9,0,0,0,'#c7c0a0',true);
  }
  // 다리 진입로는 하천 양쪽 길과 연결한다.
  for(const side of [-1,1]){const x=bridgeCenter+side*7;box(roadMat,x,.18,bridgeZ,3,.18,3);}
  // 이동 범위 밖의 산·성·폭포는 원경 전용 시트다. 이 부분은 완전한 3D 지형이라고 보고하지 않는다.
  const distantTexture=assetLoader.load('assets/distant-valley.png');distantTexture.encoding=T.sRGBEncoding;distantTexture.anisotropy=8;
  const distantMaterial=new T.MeshBasicMaterial({map:distantTexture,alphaTest:.2,side:T.DoubleSide,fog:false,toneMapped:false});
  const distantBackdrop=mesh(new T.PlaneGeometry(360,180),distantMaterial,0,32,-240,1,1,1,scene,false);
  distantBackdrop.receiveShadow=false;
  // 구름 하늘은 입체 장면을 둘러싸는 구면에 절차적으로 그린다.
  const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,vertexShader:`varying vec3 skyDirection;void main(){skyDirection=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 skyDirection;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    void main(){vec3 d=normalize(skyDirection);vec3 c=mix(vec3(.73,.85,.87),vec3(.28,.60,.84),smoothstep(0.,.65,d.y));vec2 p=d.xz/max(d.y,.08)*2.8;float n=noise(p)*.58+noise(p*2.1)*.27+noise(p*4.4)*.15;float cloud=smoothstep(.52,.72,n)*smoothstep(.06,.25,d.y);c=mix(c,vec3(.98,.96,.89),cloud*.96);gl_FragColor=vec4(c,1.);}`});
  mesh(new T.SphereGeometry(480,32,20),skyMat,0,0,-50,1,1,1,scene,false).renderOrder=-100;
  // 정적 건물·나뭇가지·화분도 같은 형태와 재질별로 합친다. 움직이는 캐릭터는 이후 생성해 제외한다.
  scene.updateMatrixWorld(true);
  const staticGroups=new Map();
  scene.traverse(o=>{
    if(!o.isMesh||o.isInstancedMesh||!o.material.isMeshStandardMaterial)return;
    const key=o.geometry.uuid+':'+o.material.uuid;
    if(!staticGroups.has(key))staticGroups.set(key,[]);staticGroups.get(key).push(o);
  });
  for(const list of staticGroups.values()) {
    if(list.length<4)continue;
    const first=list[0],combined=new T.InstancedMesh(first.geometry,first.material,list.length);
    combined.castShadow=list.some(o=>o.castShadow);combined.receiveShadow=true;
    list.forEach((o,i)=>{combined.setMatrixAt(i,o.matrixWorld);o.parent.remove(o);});
    combined.instanceMatrix.needsUpdate=true;scene.add(combined);
  }
  // 흰 토끼와 파란 마법사 고양이의 입체 시제품이며 정식 캐릭터 자산 검수는 별도다.
  function rabbit(){
    const g=new T.Group();scene.add(g);
    sphere(mats.white,0,.6,0,.3,.43,.26,g);sphere(mats.white,0,1.14,0,.39,.36,.34,g);
    for(const x of [-.19,.19]){const e=sphere(mats.white,x,1.72,0,.12,.46,.105,g);e.rotation.z=-x*.65;sphere(mats.pink,x,1.73,-.085,.058,.32,.035,g);sphere(mats.white,x,.14,-.02,.14,.15,.21,g);sphere(mats.white,x*1.75,.65,0,.095,.24,.1,g);sphere(mats.black,x*.82,1.17,-.3,.045,.065,.03,g);sphere(mats.white,x*.82-.012,1.2,-.325,.012,.018,.01,g);}
    sphere(mats.pink,0,1.04,-.34,.035,.026,.025,g);sphere(mats.white,0,.57,.29,.13,.13,.13,g);
    for(const x of [-.11,.11])sphere(mats.pink,x,1.67,.07,.12,.065,.07,g);
    const scarf=box(mats.pink,0,.91,0,.55,.1,.45,g);const tail=box(mats.pink,.16,.76,.25,.12,.35,.06,g);tail.rotation.z=-.25;
    return g;
  }
  function cat(){
    const g=new T.Group();scene.add(g);
    mesh(new T.ConeGeometry(.39,.73,10),mats.blue,0,.48,0,1,1,1,g);
    sphere(material('#c9a76f'),0,.94,0,.28,.27,.25,g);
    for(const side of [-1,1]){mesh(new T.ConeGeometry(.12,.28,3),mats.paleWood,side*.19,1.17,0,1,1,1,g);sphere(mats.black,side*.1,.96,-.22,.027,.04,.02,g);}
    const hat=mesh(new T.ConeGeometry(.4,.85,12),mats.blue,.04,1.52,0,1,1,1,g);hat.rotation.z=-.2;
    mesh(new T.CylinderGeometry(.44,.44,.045,16),mats.blue,0,1.19,0,1,1,1,g);
    beam([.37,.1,0],[.37,1.15,0],.025,mats.wood,g);sphere(mats.gold,.37,1.2,0,.12,.12,.12,g);
    const tail=mesh(new T.TorusGeometry(.23,.075,7,12,Math.PI*1.4),mats.paleWood,-.2,.35,.3,1,1,1,g);tail.rotation.y=.7;
    return g;
  }
  const player=rabbit(),companion=cat();
  const controls={x:0,z:12,yaw:0,pitch:.14,keys:new Set(),touch:new Set(),orbit:false};
  let distance=7.7,drag=null,walkPhase=0;
  function ground(x,z) {
    if(Math.abs(z-bridgeZ)<1.38&&Math.abs(x-bridgeCenter)<5.6)return bridgeY(x)+.09;
    return height(x,z);
  }
  function canWalk(x,z) {
    if(x<-39||x>40||z>23||z<-123)return false;
    if(Math.abs(x-riverX(z))<3.35&&!(Math.abs(z-bridgeZ)<1.25&&Math.abs(x-bridgeCenter)<6))return false;
    return !solidBoxes.some(b=>Math.abs(x-b.x)<b.rx+.36&&Math.abs(z-b.z)<b.rz+.36);
  }
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);controls.orbit=false;});
  canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;controls.yaw-=(e.clientX-drag.x)*.005;controls.pitch=T.MathUtils.clamp(controls.pitch+(e.clientY-drag.y)*.003,-.16,.7);drag.x=e.clientX;drag.y=e.clientY;});
  const stopDrag=()=>{drag=null;};canvas.addEventListener('pointerup',stopDrag);canvas.addEventListener('pointercancel',stopDrag);
  canvas.addEventListener('wheel',e=>{e.preventDefault();distance=T.MathUtils.clamp(distance+e.deltaY*.008,4,15);},{passive:false});
  const moveKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight']);
  addEventListener('keydown',e=>{if(document.querySelector('#reference').open)return;if(moveKeys.has(e.code)){e.preventDefault();controls.keys.add(e.code);controls.orbit=false;}});
  addEventListener('keyup',e=>controls.keys.delete(e.code));
  addEventListener('blur',()=>{controls.keys.clear();controls.touch.clear();drag=null;});
  document.querySelectorAll('[data-move]').forEach(button=>{
    button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);controls.touch.add(button.dataset.move);controls.orbit=false;});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>controls.touch.delete(button.dataset.move));
  });
  document.querySelector('#reset').onclick=()=>{Object.assign(controls,{x:0,z:12,yaw:0,pitch:.14,orbit:false});distance=7.7;controls.keys.clear();controls.touch.clear();};
  document.querySelector('#orbit').onclick=()=>{controls.orbit=!controls.orbit;};
  document.querySelector('#compare').onclick=()=>{controls.keys.clear();controls.touch.clear();document.querySelector('#reference').showModal();};
  document.querySelector('#closeReference').onclick=()=>document.querySelector('#reference').close();
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
  flushInstances();
  const look=new T.Vector3(),camPos=new T.Vector3();
  let frames=0,elapsed=0,lastFPS=0;
  function tick(){
    requestAnimationFrame(tick);const realDt=clock.getDelta(),dt=Math.min(realDt,.04),time=clock.elapsedTime;
    const active=!document.querySelector('#reference').open;
    if(controls.orbit&&active)controls.yaw+=dt*.12;
    const k=controls.keys,q=controls.touch;
    let f=active?Number(k.has('KeyW')||k.has('ArrowUp')||q.has('forward'))-Number(k.has('KeyS')||k.has('ArrowDown')||q.has('back')):0;
    let s=active?Number(k.has('KeyD')||k.has('ArrowRight')||q.has('right'))-Number(k.has('KeyA')||k.has('ArrowLeft')||q.has('left')):0;
    const len=Math.hypot(f,s);if(len){f/=len;s/=len;const speed=(k.has('ShiftLeft')||k.has('ShiftRight')?5.8:3.2)*dt;
      const dx=(s*Math.cos(controls.yaw)-f*Math.sin(controls.yaw))*speed,dz=(-f*Math.cos(controls.yaw)-s*Math.sin(controls.yaw))*speed;
      if(canWalk(controls.x+dx,controls.z))controls.x+=dx;
      if(canWalk(controls.x,controls.z+dz))controls.z+=dz;
      player.rotation.y=Math.atan2(-dx,-dz);walkPhase+=dt*10;
    }else player.rotation.y=controls.yaw;
    const gy=ground(controls.x,controls.z);
    player.position.set(controls.x,gy+(len?Math.abs(Math.sin(walkPhase))*.07:0),controls.z);
    const cx=controls.x-1.15,cz=controls.z+.25;
    companion.position.lerp(new T.Vector3(cx,ground(cx,cz),cz),1-Math.exp(-dt*6));companion.rotation.y=player.rotation.y;
    look.set(controls.x,gy+1.5,controls.z-3.5);
    camPos.set(controls.x+Math.sin(controls.yaw)*distance,gy+3.7+controls.pitch*6,controls.z+Math.cos(controls.yaw)*distance);
    camPos.y=Math.max(camPos.y,height(camPos.x,camPos.z)+1.2);
    camera.position.copy(camPos);look.set(controls.x-Math.sin(controls.yaw)*5,gy+1.65,controls.z-Math.cos(controls.yaw)*5);camera.lookAt(look);
    waterMat.uniforms.time.value=time;
    sun.position.set(controls.x-38,62,controls.z+32);sun.target.position.set(controls.x,0,controls.z-25);
    renderer.render(scene,camera);
    frames++;elapsed+=realDt;if(elapsed>=1){lastFPS=Math.round(frames/elapsed);frames=0;elapsed=0;document.querySelector('#status').textContent=`현재 화면 ${lastFPS} FPS · 실제 휴대폰 검수 전 · 원본 비교 진행 중`;}
  }
  tick();
})();
