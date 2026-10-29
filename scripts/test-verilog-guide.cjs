const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require(process.env.JSDOM_PATH||'jsdom');
(async()=>{
 const root=path.resolve(__dirname,'..'),dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://example.test/#verilog/mindset',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window;
 const errors=[],scrolls=[],copies=[];w.scrollTo=x=>scrolls.push(x);w.matchMedia=()=>({matches:false,addEventListener(){}});w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};
 Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async t=>copies.push(t)}});w.addEventListener('error',e=>errors.push(e.message));
 for(const name of ['appearance.js','engine.js','knowledge.js','segments.js','materials.js','guide-text.js','midterm-engine.js','midterm.js','verilog-data.js','verilog-guide.js','app.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));
 const $=s=>w.document.querySelector(s),go=p=>w.DigitalLab.navigate(p),tick=()=>new Promise(r=>w.setTimeout(r,30));
 assert.equal(w.VerilogGuide.chapters.length,12);
 for(const c of w.VerilogGuide.chapters){
  go('verilog/'+c.id);assert.equal($('#tutorial-title').textContent,c.title);assert.equal($('#group-systems').getAttribute('aria-selected'),'true');
  assert.equal(w.document.querySelectorAll('.sidebar [aria-current="page"]').length,1);
  assert.ok(!$('#view').textContent.includes('{{example:'));
  for(const pre of w.document.querySelectorAll('.tutorial-content pre'))assert.equal(pre.tabIndex,0);
  for(const table of w.document.querySelectorAll('.tutorial-content table'))assert.equal(table.parentElement.getAttribute('role'),'region');
 }
 go('verilog/first-run');const code=$('.tutorial-content pre code').textContent;$('.tutorial-code button').click();await tick();assert.equal(copies[0],code);
 $('#tutorial-complete').checked=true;$('#tutorial-complete').dispatchEvent(new w.Event('change'));assert.equal($('#tutorial-progress-bar').value,1);assert.equal(JSON.parse(w.localStorage.getItem('digital-verilog-course'))['first-run'],true);
 go('lab');go('verilog');assert.equal(w.location.hash,'#verilog/first-run');assert.ok($('#tutorial-complete').checked);
 $('#tutorial-chapter').value='assignment';$('#tutorial-chapter').dispatchEvent(new w.Event('change'));assert.equal(w.location.hash,'#verilog/assignment');assert.equal(w.document.activeElement.id,'tutorial-article');assert.equal(scrolls.at(-1).top,0);
 $('.tutorial-pager a:last-child').click();assert.equal(w.location.hash,'#verilog/counter');w.history.back();await tick();assert.equal(w.location.hash,'#verilog/assignment');
 go('verilog/unknown');assert.equal(w.location.hash,'#verilog/mindset');go('verilog/practice');$('.tutorial-content summary').click();assert.ok($('.tutorial-content details').open);
 go('exam/hdl');assert.ok($('a[href="#verilog/mindset"]'));assert.equal($('#exam-error').textContent,'');
 const download=fs.readFileSync(path.join(root,'assets/verilog-start/guide.md'),'utf8');assert.match(download,/q1 <= q0/);assert.match(download,/不是等下一个时钟/);
 assert.ok(fs.readFileSync(path.join(root,'assets/verilog-start/verilog-starter.zip')).subarray(0,2).equals(Buffer.from('PK')));
 assert.deepEqual(errors,[]);dom.window.close();console.log('PASS 12 tutorial routes, navigation/history, completion persistence, code copy, code/table scrolling and download assets');
})().catch(e=>{console.error(e);process.exit(1)});
