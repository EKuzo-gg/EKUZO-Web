// usage: node server.js <htmlfile> <port> <logfile>
const http=require('http'),fs=require('fs');
const [,, file, port, log]=process.argv;
const html=fs.readFileSync(file); // exact bytes
fs.writeFileSync(log,'');
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x');
  if(req.method==='GET'&&u.pathname==='/season1'){
    res.writeHead(200,{'content-type':'text/html; charset=utf-8','content-length':html.length});
    return res.end(html);
  }
  if(req.method==='POST'&&u.pathname==='/api/season-one'){
    const chunks=[];req.on('data',c=>chunks.push(c));
    req.on('end',()=>{
      const raw=Buffer.concat(chunks).toString('utf8');
      let body;try{body=JSON.parse(raw)}catch(e){body={__unparsable:raw}}
      fs.appendFileSync(log,JSON.stringify({t:Date.now(),ct:req.headers['content-type'],ua:req.headers['user-agent'],body})+'\n');
      res.writeHead(200,{'content-type':'application/json'});res.end('{"ok":true}');
    });
    return;
  }
  res.writeHead(404,{'content-type':'text/plain'});res.end('not found');
}).listen(+port,'127.0.0.1',()=>console.log('listening',port,file));
