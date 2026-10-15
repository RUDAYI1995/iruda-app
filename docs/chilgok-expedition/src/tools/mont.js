const fs=require('fs');const SP=process.argv[2];const {PNG}=require(SP+'/imgdiff/node_modules/pngjs');
const out=process.argv[3], cols=+process.argv[4], files=process.argv.slice(5);
const CW=500,CH=350, rows=Math.ceil(files.length/cols), o=new PNG({width:cols*CW,height:rows*CH});
files.forEach((f,k)=>{ const im=PNG.sync.read(fs.readFileSync(f)); const ox=(k%cols)*CW, oy=((k/cols)|0)*CH;
 // crop viewport area (game canvas) 100..900 x, 90..600 y approx then scale 
 for(let y=0;y<CH;y++)for(let x=0;x<CW;x++){ const sx=Math.min(im.width-1,(x*im.width/CW)|0), sy=Math.min(im.height-1,(y*im.height/CH)|0), i=(sy*im.width+sx)*4, j=((oy+y)*o.width+ox+x)*4; for(let c=0;c<4;c++)o.data[j+c]=im.data[i+c]; } });
fs.writeFileSync(out,PNG.sync.write(o));
