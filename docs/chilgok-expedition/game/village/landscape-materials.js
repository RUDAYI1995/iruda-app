/* 산·바위·초지의 입체 표면을 별도 이미지 시트로 입힌다. 먼 풍경 사진을 화면 전체에 덮지 않는다. */
window.createLandscapeMaterials=function(T,manager){
  const atlas=new T.TextureLoader(manager).load('assets/terrain-materials.png');atlas.encoding=T.sRGBEncoding;atlas.anisotropy=8;
  const result={};
  for(const mode of ['grass','rock','mountain']){
    const mat=new T.MeshStandardMaterial({map:atlas,roughness:.97,color:0xffffff});
    mat.onBeforeCompile=shader=>{
      shader.vertexShader='varying vec3 surfaceWorld; varying vec3 surfaceNormal;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
        vec4 surfaceP=vec4(transformed,1.);vec3 surfaceN=normal;
        #ifdef USE_INSTANCING
          surfaceP=instanceMatrix*surfaceP;surfaceN=mat3(instanceMatrix)*surfaceN;
        #endif
        surfaceWorld=(modelMatrix*surfaceP).xyz;surfaceNormal=normalize(mat3(modelMatrix)*surfaceN);`);
      shader.fragmentShader='varying vec3 surfaceWorld; varying vec3 surfaceNormal;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_pars_fragment>',`#include <map_pars_fragment>
        vec4 samplePanel(vec2 p,vec2 panel){return mapTexelToLinear(texture2D(map,panel+vec2(.002)+fract(p)*.496));}
        vec4 stoneSurface(vec3 p,vec3 n){vec3 w=pow(abs(n),vec3(4.));w/=max(w.x+w.y+w.z,.0001);return samplePanel(p.zy*.23,vec2(.5,.5))*w.x+samplePanel(p.xz*.23,vec2(.5,.5))*w.y+samplePanel(p.xy*.23,vec2(.5,.5))*w.z;}`);
      const body=mode==='grass'?`vec4 detailColor=samplePanel(surfaceWorld.xz*.36,vec2(0.,.5));`:
        mode==='rock'?`vec4 detailColor=stoneSurface(surfaceWorld,normalize(surfaceNormal));`:
        `vec3 sn=normalize(surfaceNormal);vec4 cliff=stoneSurface(surfaceWorld,sn);vec4 forest=samplePanel(surfaceWorld.xz*.025,vec2(0.,0.));vec4 summit=samplePanel(surfaceWorld.xz*.08,vec2(.5,0.));float slope=1.-abs(sn.y);float rocky=smoothstep(.28,.63,slope);float snow=smoothstep(85.,125.,surfaceWorld.y)*smoothstep(.2,.65,sn.y);vec4 detailColor=mix(mix(forest,cliff,rocky),summit,snow);`;
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',body+'\ndiffuseColor*=detailColor;');
    };
    mat.customProgramCacheKey=()=>mode;result[mode]=mat;
  }
  return result;
};
