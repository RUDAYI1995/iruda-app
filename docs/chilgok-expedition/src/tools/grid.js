const fs=require('fs');const SP=process.argv[2];const {PNG}=require(SP+'/imgdiff/node_modules/pngjs');
const im=PNG.sync.read(fs.readFileSync(process.argv[3]));const S=+process.argv[4]||2;
const o=new PNG({width:im.width*S,height:im.height*S});
for(let y=0;y<o.height;y++)for(let x=0;x<o.width;x++){const sx=(x/S)|0,sy=(y/S)|0,i=(sy*im.width+sx)*4,j=(y*o.width+x)*4;
 let r=im.data[i],g=im.data[i+1],b=im.data[i+2];
 const gx=(x%(50*S)==0),gy=(y%(50*S)==0); if(gx||gy){r=255;g=0;b=0;}
 o.data[j]=r;o.data[j+1]=g;o.data[j+2]=b;o.data[j+3]=255;}
fs.writeFileSync(process.argv[5],PNG.sync.write(o));
