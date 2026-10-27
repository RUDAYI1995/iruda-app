// 기존 게임 좌표와 높이·통행 계약을 렌더링 없이 검사한다. 이미지 로딩만 대역으로 교체한다.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const T=require('../game/three.min.js');
const OriginalLoader=T.TextureLoader;
let requested=0;
T.TextureLoader=class {
  constructor(manager){this.manager=manager||new T.LoadingManager();}
  load(url){requested++;const texture=new T.Texture();texture.userData={source:url};this.manager.itemStart(url);queueMicrotask(()=>this.manager.itemEnd(url));return texture;}
};
const errors=[];
const context={window:{},console:{error:(...args)=>errors.push(args)},Set,Map,Math};
vm.createContext(context);
for(const name of ['detailed-cottage.js','rural-remodel.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../game/remodel',name),'utf8'),context,{filename:name});
const renderer={outputEncoding:T.LinearEncoding,capabilities:{getMaxAnisotropy:()=>8}};
function mount(rects=[]){const parent=new T.Group(),cameraRects=[],cameraCircles=[];const status=context.window.mountRuralRemodel({THREE:T,parent,renderer,rects,cameraRects,cameraCircles});return {parent,rects,cameraRects,cameraCircles,status};}
const blockedRect={x:-1500,z:-450,hx:12,hz:12};
const denied=mount([blockedRect]);
assert.equal(denied.status.ready,false);
assert.equal(denied.parent.children.length,0,'기존 충돌과 겹치면 아무 자산도 설치하지 않아야 한다.');
assert.equal(requested,0,'부지 충돌이 있으면 이미지 로딩 전에 중단해야 한다.');
assert.equal(denied.rects.length,1,'기존 충돌 등록을 변경하지 않아야 한다.');
const out=mount();
assert.equal(out.status.ready,true);
assert.equal(out.parent.children.length,2,'기존 씬에는 구역 그룹과 연결로만 추가한다.');
assert.ok(out.rects.length>3);
assert.ok(out.cameraRects.length>3);
assert.ok(out.cameraCircles.length>0);
const facadeSources=new Set();let verifiedTile=false;
out.status.root.traverse(o=>{
  if(!o.isMesh)return;
  const source=o.material.map&&o.material.map.userData.source;
  if(source&&/cottage-(front|side|rear)-v3\.png$/.test(source)){
    facadeSources.add(source);
    const uv=o.geometry.attributes.uv;
    assert.equal(Math.min(...Array.from({length:uv.count},(_,i)=>uv.getX(i))),0);
    assert.equal(Math.max(...Array.from({length:uv.count},(_,i)=>uv.getX(i))),1,'새 벽 한 면은 이미지 전체 가로를 사용해야 한다.');
  }
  if(o.geometry.userData.assetRole==='curved-clay-tile'){
    const uv=o.geometry.attributes.uv,x=Array.from({length:uv.count},(_,i)=>uv.getX(i));
    assert.ok(Math.max(...x)-Math.min(...x)<.1,'작은 기와에 전체 기와 배열을 반복하지 않아야 한다.');
    verifiedTile=true;
  }
});
assert.equal(facadeSources.size,3);
assert.equal(verifiedTile,true);
for(const source of facadeSources){
  const bytes=fs.readFileSync(path.join(__dirname,'../game',source));
  assert.ok(bytes.readUInt32BE(16)>=1200,'새 벽면 이미지의 실제 가로 해상도를 검사한다.');
}
for(const [x,z]of [[0,0],[-700,-450],[-1200,135],[-2600,1500]]){
  assert.equal(out.status.heightAt(x,z),null,'기존 구역 높이를 덮어쓰지 않아야 한다.');
  assert.equal(out.status.walkable(x,z),true,'기존 구역의 통행 판단을 제한하지 않아야 한다.');
  assert.equal(out.status.cameraBlendAt(x,z),0,'기존 구역의 카메라 높이를 바꾸지 않아야 한다.');
}
for(let x=-1330;x>=-1470;x-=5){
  assert.equal(out.status.walkable(x,-450),true,'기존 골목 끝과 새 길 사이가 이어져야 한다.');
  assert.ok(!out.rects.some(r=>Math.abs(x-r.x)<r.hx&&Math.abs(-450-r.z)<r.hz),'연결로를 새 충돌 상자가 막지 않아야 한다.');
}
const localWorld=(x,z)=>({x:-1470+z*3,z:-450-x*3});
const river=z=>-13.5+Math.sin(z*.045)*1.4;
const riverPoint=localWorld(river(-15),-15);
assert.equal(out.status.walkable(riverPoint.x,riverPoint.z),false,'다리 밖 수로는 막아야 한다.');
const bridge=localWorld(river(-30),-30);
assert.equal(out.status.walkable(bridge.x,bridge.z),true,'수로의 다리는 통과할 수 있어야 한다.');
assert.ok(out.status.heightAt(bridge.x,bridge.z)>3,'다리 중앙의 발 높이가 상판과 함께 올라가야 한다.');
assert.equal(out.status.heightAt(-1500,-450),.415);
assert.equal(out.status.cameraBlendAt(-1600,-450),1);
assert.equal(out.status.cameraBlendAt(-1395,-450),0);
assert.ok(out.status.cameraBlendAt(-1410,-450)>0&&out.status.cameraBlendAt(-1410,-450)<1,'입구에서 시점이 부드럽게 바뀌어야 한다.');
out.status.update(1000,{x:0,z:0});assert.equal(out.status.root.visible,false);
out.status.update(1000,{x:-1600,z:-450});assert.equal(out.status.root.visible,true);
queueMicrotask(()=>{
  assert.equal(out.status.loaded,true);
  assert.equal(out.status.loadErrors.length,0);
  T.TextureLoader=OriginalLoader;
  console.log('농촌마을 통합 계약 검사 통과: 부지 보호, 기존 구역 경계, 연결로, 수로·다리 높이, 카메라 등록, 거리별 표시, 자산 로딩.');
});
