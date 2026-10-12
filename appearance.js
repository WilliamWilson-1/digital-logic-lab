(() => {
 'use strict';
 const root=document.documentElement,media={dark:matchMedia('(prefers-color-scheme: dark)'),solid:matchMedia('(prefers-reduced-transparency: reduce)')};
 let preference={theme:'system',solid:false};
 try{const saved=JSON.parse(localStorage.getItem('digital-logic-appearance'));if(saved&&['system','light','dark'].includes(saved.theme))preference={theme:saved.theme,solid:saved.solid===true};else{const old=localStorage.getItem('digital-logic-theme');if(['light','dark'].includes(old))preference.theme=old}}catch{}
 function apply(){root.dataset.theme=preference.theme==='system'?(media.dark.matches?'dark':'light'):preference.theme;root.dataset.transparency=preference.solid||media.solid.matches?'reduced':'regular';const theme=document.getElementById('appearance-theme'),solid=document.getElementById('appearance-solid');if(theme)theme.value=preference.theme;if(solid){solid.checked=root.dataset.transparency==='reduced';solid.disabled=media.solid.matches;solid.title=media.solid.matches?'系统已开启减少透明效果':''}document.querySelector('meta[name="theme-color"]')?.setAttribute('content',root.dataset.theme==='dark'?'#111816':'#eef2f1');window.dispatchEvent(new Event('lab:appearance'))}
 function persist(){try{localStorage.setItem('digital-logic-appearance',JSON.stringify(preference))}catch{}apply()}
 media.dark.addEventListener('change',apply);media.solid.addEventListener('change',apply);apply();
 document.addEventListener('DOMContentLoaded',()=>{apply();document.getElementById('appearance-theme').addEventListener('change',e=>{preference.theme=e.target.value;persist()});document.getElementById('appearance-solid').addEventListener('change',e=>{preference.solid=e.target.checked;persist()});const menus=[...document.querySelectorAll('.top-actions details')];for(const menu of menus)menu.addEventListener('toggle',()=>{if(menu.open)menus.filter(m=>m!==menu).forEach(m=>m.open=false)});document.addEventListener('click',e=>menus.forEach(m=>{if(m.open&&!m.contains(e.target))m.open=false}));document.addEventListener('keydown',e=>{if(e.key==='Escape')for(const m of menus)if(m.open){m.open=false;m.querySelector('summary').focus()}})});
 window.LabAppearance={apply};
})();
