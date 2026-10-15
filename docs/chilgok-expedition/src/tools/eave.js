const fs=require('fs');const SP=process.argv[2];const {PNG}=require(SP+'/imgdiff/node_modules/pngjs');
const names=process.argv.slice(3); const out=[]; const CW=300,CH=220; const cols=5, rows=Math.ceil(names.length/cols); const o=new PNG({width:cols*CW,height:rows*CH}); for(let i=0;i<o.data.length;i+=4){o.data[i]=120;o.data[i+1]=150;o.data[i+2]=110;o.data[i+3]=255;}
names.forEach((n,k)=>{ const im=PNG.sync.read(fs.readFileSync(SP+'/assets/village/'+n+'.png')); const w=im.width,h=im.height;
 // bbox trim
 let y0=h,y1=0,x0=w,x1=0; for(let y=0;y<h;y++)for(let x=0;x<w;x++) if(im.data[(y*w+x)*4+3]>128){ if(y<y0)y0=y; if(y>y1)y1=y; if(x<x0)x0=x; if(x>x1)x1=x; }
 const H=y1-y0+1, W=x1-x0+1; const rw=[]; for(let y=y0;y<=y1;y++){ let a=w,b=0; for(let x=x0;x<=x1;x++) if(im.data[(y*w+x)*4+3]>128){ if(x<a)a=x; if(x>b)b=x; } rw.push(b-a+1); }
 // widest row in top 70% (from top), lowest such row within 4% of max
 let mx=0; for(let i=0;i<Math.floor(H*0.7);i++) mx=Math.max(mx,rw[i]); let ey=0; for(let i=0;i<Math.floor(H*0.7);i++) if(rw[i]>=mx*0.96) ey=i;
 const e=1-ey/H; out.push(n+' e='+e.toFixed(2)+' aspect='+(W/H).toFixed(2));
 const sc=Math.min((CW-8)/W,(CH-8)/H); const ox=(k%cols)*CW+4, oy=((k/cols)|0)*CH+4;
 for(let y=0;y<H*sc;y++)for(let x=0;x<W*sc;x++){ const sx=x0+((x/sc)|0), sy=y0+((y/sc)|0), i=(sy*w+sx)*4, j=((oy+y)*o.width+ox+x)*4, a=im.data[i+3]/255; for(let c=0;c<3;c++)o.data[j+c]=im.data[i+c]*a+o.data[j+c]*(1-a); }
 const ly=Math.floor(ey*sc); for(let x=0;x<W*sc;x++){ const j=((oy+ly)*o.width+ox+x)*4; o.data[j]=255;o.data[j+1]=0;o.data[j+2]=0; } });
fs.writeFileSync(SP+'/eave_sheet.png',PNG.sync.write(o)); console.log(out.join('\n'));
