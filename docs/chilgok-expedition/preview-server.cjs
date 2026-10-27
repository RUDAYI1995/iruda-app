// 로컬 시범 실행 전용. 지정된 game 폴더 밖의 요청은 거부한다.
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'game');
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp'};
http.createServer((req,res) => {
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400);res.end();return; }
  if(requested.endsWith('/'))requested += 'index.html';
  const file = path.resolve(root, '.' + requested);
  if(!file.startsWith(root + path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(error,bytes) => {
    if(error){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(bytes);
  });
}).listen(5182,'127.0.0.1',()=>console.log('http://127.0.0.1:5182/village/'));
