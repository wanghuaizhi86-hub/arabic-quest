const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY || '';
const BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const ROOT = __dirname;
const MIME = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};

function send(res, status, body, type='application/json; charset=utf-8') {
  res.writeHead(status, {'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve,reject)=>{let data='';req.on('data',c=>{data+=c;if(data.length>1e6){reject(new Error('请求过大'));req.destroy();}});req.on('end',()=>{try{resolve(JSON.parse(data||'{}'))}catch(e){reject(new Error('请求格式错误'))}});req.on('error',reject)});
}
const systemPrompt = (level) => `你是一位友好、耐心、准确的阿拉伯语教师 Sami，面向中文学习者。当前学习等级：${level}。默认教授现代标准阿拉伯语（MSA）；如用户明确要求某种方言，再切换。请自然地与用户对话，而非只做批改。根据等级控制用词与句长，鼓励用户尽量用阿拉伯语表达。每次回复遵循：1) 先针对用户内容用阿拉伯语自然回应，并附简短中文意思；2) 如果用户的阿拉伯语有错误，增加“✍️ 句子纠错”部分，列出原句、修改后句子、中文解释；如果没有明显错误，明确肯定并提供一个更自然的可选说法；3) 最后只提出一个适合其等级的后续问题，尽量让对话继续。不要把口语中可接受的表达误判为绝对错误；区分语法错误与风格建议。入门用户可以使用中文解释更多，高级用户尽量使用阿拉伯语。不要编造语法规则。`;
const server = http.createServer(async (req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if(req.method==='GET' && url.pathname==='/api/health') return send(res,200,{ok:true,configured:Boolean(API_KEY),model:MODEL});
  if(req.method==='POST' && url.pathname==='/api/chat') {
    if(!API_KEY) return send(res,503,{error:'尚未配置 OPENAI_API_KEY。请参考 README.md 设置环境变量后重启。'});
    try {
      const body = await readBody(req);
      const message = String(body.message || '').trim();
      if(!message) return send(res,400,{error:'消息不能为空'});
      if(message.length>4000) return send(res,400,{error:'单条消息请控制在 4000 字符以内'});
      const level = ['入门','初学','中级','高级'].includes(body.level) ? body.level : '初学';
      const history = Array.isArray(body.history) ? body.history.slice(-12).filter(x=>['user','assistant'].includes(x.role) && typeof x.content==='string').map(x=>({role:x.role,content:x.content.slice(0,4000)})) : [];
      // Avoid duplicating the current message if it is already the last history item.
      if(history.length && history[history.length-1].role==='user' && history[history.length-1].content===message) history.pop();
      const upstream = await fetch(`${BASE_URL}/chat/completions`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:MODEL,temperature:0.55,messages:[{role:'system',content:systemPrompt(level)},...history,{role:'user',content:message}]})
      });
      const data = await upstream.json().catch(()=>({}));
      if(!upstream.ok) return send(res,502,{error:data.error?.message || `AI 服务返回 HTTP ${upstream.status}`});
      const reply = data.choices?.[0]?.message?.content;
      if(!reply) return send(res,502,{error:'AI 服务没有返回文本，请检查模型设置'});
      return send(res,200,{reply,model:MODEL});
    } catch(e) { return send(res,500,{error:e.message || '服务器内部错误'}); }
  }
  if(req.method==='GET') {
    let pathname = decodeURIComponent(url.pathname);
    if(pathname==='/') pathname='/index.html';
    const file = path.resolve(ROOT, '.'+pathname);
    if(!file.startsWith(ROOT+path.sep) && file!==path.join(ROOT,'index.html')) return send(res,403,{error:'禁止访问'});
    fs.readFile(file,(err,content)=>{if(err)return send(res,404,'Not found','text/plain; charset=utf-8');send(res,200,content,MIME[path.extname(file)]||'application/octet-stream')});
    return;
  }
  send(res,405,{error:'Method not allowed'});
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Arabic Quest is running at http://localhost:${PORT}`));
