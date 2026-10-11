const fs=require('fs');const SP=process.argv[2];const {PNG}=require(SP+'/imgdiff/node_modules/pngjs');
const names=process.argv.slice(4);const CW=250,CH=190,cols=6,rows=Math.ceil(names.length/cols);
const o=new PNG({width:cols*CW,height:rows*CH});for(let i=0;i<o.data.length;i+=4){o.data[i]=110;o.data[i+1]=140;o.data[i+2]=90;o.data[i+3]=255;}
names.forEach((n,k)=>{const im=PNG.sync.read(fs.readFileSync(SP+'/assets/village/'+n+'.png'));const sc=Math.min((CW-8)/im.width,(CH-8)/im.height,1);
 const ox=(k%cols)*CW+4,oy=((k/cols)|0)*CH+4;
 for(let y=0;y<im.height*sc;y++)for(let x=0;x<im.width*sc;x++){const sx=(x/sc)|0,sy=(y/sc)|0,i=(sy*im.width+sx)*4,j=((oy+y)*o.width+ox+x)*4,a=im.data[i+3]/255;
  for(let c=0;c<3;c++)o.data[j+c]=im.data[i+c]*a+o.data[j+c]*(1-a);}});
fs.writeFileSync(process.argv[3],PNG.sync.write(o));
