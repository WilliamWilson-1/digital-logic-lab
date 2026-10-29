/* Authored beginner course. Code is displayed/copied, never evaluated here. */
(function(root){
    'use strict';
    const chapters=root.VerilogGuideData.chapters, H=root.Logic.escape;
    let current='mindset', done={};
    try{const saved=JSON.parse(localStorage.getItem('digital-verilog-course'));
        if(saved&&typeof saved==='object')for(const c of chapters)done[c.id]=saved[c.id]===true;
    }catch{}
    function save(){try{localStorage.setItem('digital-verilog-course',JSON.stringify(done))}catch{}}
    function mount(id,ctx){
        current=chapters.some(c=>c.id===id)?id:'mindset';
        const index=chapters.findIndex(c=>c.id===current), c=chapters[index], view=ctx.container;
        const count=chapters.filter(c=>done[c.id]).length;
        view.innerHTML=`<section class="card tutorial-intro"><span class="eyebrow">VERILOG / FROM CIRCUITS TO RTL</span><h2>把已经懂的电路，写成能验证的代码。</h2><p>面向有数字逻辑基础、会一点 C++ / Python 的初学者。12 章从多数表决器到状态机，使用 Verilog-2001，不要求先学 FPGA 工具链。</p><div class="row"><a class="button primary" href="assets/verilog-start/verilog-starter.zip" download>↓ 教程与六组代码 ZIP</a><a class="button" href="assets/verilog-start/guide.md" download="Verilog上手指导.md">↓ 完整教程 Markdown</a><a class="button" href="#exam/hdl">回到 Verilog 专项 →</a></div><p class="muted">${H(root.VerilogGuideData.verified)}。本页用于阅读，实际编译运行请使用下载包和真实仿真器。</p></section>
        <div class="tutorial-layout"><aside class="card tutorial-toc"><div class="row spread"><h2>学习路线</h2><span id="tutorial-progress">${count} / ${chapters.length}</span></div><progress id="tutorial-progress-bar" value="${count}" max="${chapters.length}" aria-label="教程完成进度"></progress><label class="tutorial-select" for="tutorial-chapter">选择章节<select id="tutorial-chapter">${chapters.map((x,i)=>`<option value="${x.id}" ${x.id===current?'selected':''}>${String(i+1).padStart(2,'0')} · ${H(x.title)}</option>`).join('')}</select></label><nav aria-label="Verilog 教程目录">${chapters.map((x,i)=>`<a href="#verilog/${x.id}" ${x.id===current?'aria-current="page"':''}><span>${String(i+1).padStart(2,'0')}</span><span>${H(x.title)}</span><span class="tutorial-done" data-done="${x.id}" aria-label="${done[x.id]?'已完成':'未完成'}">${done[x.id]?'✓':''}</span></a>`).join('')}</nav></aside>
        <article class="card tutorial-article" id="tutorial-article" aria-labelledby="tutorial-title" tabindex="-1"><span class="eyebrow">LESSON ${String(index+1).padStart(2,'0')} / ${chapters.length}</span><h2 id="tutorial-title">${H(c.title)}</h2><div class="tutorial-content">${c.html}</div><div class="tutorial-complete"><label><input id="tutorial-complete" type="checkbox" ${done[c.id]?'checked':''}>我已理解并动手完成本章</label><span class="muted">学习进度仅保存在此浏览器</span></div><nav class="row spread tutorial-pager" aria-label="教程前后章">${index?`<a class="button" href="#verilog/${chapters[index-1].id}">← 上一章</a>`:'<span class="muted">第一章</span>'}${index<chapters.length-1?`<a class="button primary" href="#verilog/${chapters[index+1].id}">下一章 →</a>`:'<a class="button" href="#verilog/mindset">回到第一章</a>'}</nav></article></div>`;
        view.querySelector('#tutorial-chapter').addEventListener('change',e=>ctx.navigate('verilog/'+e.target.value));
        view.querySelector('#tutorial-complete').addEventListener('change',e=>{
            done[c.id]=e.target.checked;save();
            const n=chapters.filter(x=>done[x.id]).length;
            view.querySelector('#tutorial-progress').textContent=n+' / '+chapters.length;
            view.querySelector('#tutorial-progress-bar').value=n;
            const tick=view.querySelector('[data-done="'+c.id+'"]');tick.textContent=done[c.id]?'✓':'';tick.setAttribute('aria-label',done[c.id]?'已完成':'未完成');
        });
        view.querySelectorAll('.tutorial-content table').forEach(table=>{
            const wrap=document.createElement('div');wrap.className='scroll tutorial-table';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','教程对照表，可横向滚动');table.before(wrap);wrap.append(table);
        });
        view.querySelectorAll('.tutorial-content pre').forEach((pre,i)=>{
            const code=pre.querySelector('code'), text=code?.textContent||pre.textContent;
            pre.tabIndex=0;pre.setAttribute('aria-label','代码示例 '+(i+1)+'，可横向滚动');
            const wrap=document.createElement('div');wrap.className='tutorial-code';
            const bar=document.createElement('div');bar.className='tutorial-code-bar';
            const label=document.createElement('span');label.textContent=code?.className.includes('language-verilog')?'VERILOG':code?.className.includes('language-sh')?'TERMINAL':'TEXT';
            const button=document.createElement('button');button.type='button';button.textContent='复制代码';button.setAttribute('aria-label','复制代码示例 '+(i+1));
            button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text);ctx.toast('代码已复制')}catch{ctx.toast('浏览器未允许复制，请选中代码复制')}});
            bar.append(label,button);pre.before(wrap);wrap.append(bar,pre);
        });
        root.LAB_MATERIALS?.sync();
    }
    root.VerilogGuide={chapters,mount,getChapterId:()=>current};
})(window);
