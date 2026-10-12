(() => {
  'use strict';
  window.mountReviewSegments=({root,onSelect,onLayout})=>{
    const buttons=[...root.querySelectorAll('[role="tab"]')],pill=root.querySelector('.tab-highlight');
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
    let drag=null,frame=0,blockedClick=null;
    const nearest=(items,center)=>items.reduce((best,item,index)=>Math.abs(item.center-center)<Math.abs(items[best].center-center)?index:best,0);
    function geometry(){
      const rect=root.getBoundingClientRect(),scale=root.offsetWidth?rect.width/root.offsetWidth:1;
      const items=buttons.map(button=>({left:button.offsetLeft,top:button.offsetTop,width:button.offsetWidth,height:button.offsetHeight,center:button.offsetLeft+button.offsetWidth/2}));
      return items.every(item=>item.width>0&&item.height>0)&&scale>0?{rect,scale,items}:null;
    }
    function paint(){
      frame=0;if(!drag?.started)return;
      const items=drag.items,center=Math.max(items[0].center,Math.min(items.at(-1).center,drag.center));
      let lower=items[0],upper=items.at(-1);
      for(let i=0;i<items.length-1;i++)if(center>=items[i].center&&center<=items[i+1].center){lower=items[i];upper=items[i+1];break;}
      const t=upper.center===lower.center?0:(center-lower.center)/(upper.center-lower.center);
      const width=lower.width+(upper.width-lower.width)*t,height=lower.height+(upper.height-lower.height)*t,top=lower.top+(upper.top-lower.top)*t;
      pill.style.width=width+'px';pill.style.height=height+'px';pill.style.transform=`translate(${center-width/2}px,${top}px)${reducedMotion.matches?'':' scale(1.045)'}`;
      root.classList.add('tabs-measured');
      buttons.forEach((button,index)=>button.classList.toggle('is-preview',index===nearest(items,center)));
    }
    function stop(commit=false,event=null){
      if(!drag)return;
      const previous=drag;
      if(commit&&previous.started&&event)previous.center=previous.startCenter+(event.clientX-previous.rect.left)/previous.scale-previous.startX;
      if(frame){cancelAnimationFrame(frame);frame=0;}
      drag=null;root.classList.remove('is-dragging');buttons.forEach(button=>button.classList.remove('is-preview'));
      try{if(root.hasPointerCapture?.(previous.id))root.releasePointerCapture(previous.id);}catch{}
      if(previous.started)blockedClick={id:previous.id,until:performance.now()+500};
      if(commit&&previous.started){const index=nearest(previous.items,previous.center);onSelect(index);buttons[index].focus({preventScroll:true});}
      onLayout();
    }
    root.addEventListener('pointerdown',event=>{
      if(drag||event.isPrimary===false||event.button!==0)return;
      blockedClick=null;
      const measured=geometry();if(!measured)return;
      const x=(event.clientX-measured.rect.left)/measured.scale;
      const pressed=buttons.indexOf(event.target.closest('[role="tab"]'));
      const startCenter=measured.items[pressed<0?nearest(measured.items,x):pressed].center;
      drag={...measured,id:event.pointerId,startX:x,startY:event.clientY,startCenter,center:startCenter,started:false};
    });
    // Document listeners preserve release/cancel handling even if capture is unavailable.
    document.addEventListener('pointermove',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      const x=(event.clientX-drag.rect.left)/drag.scale,dx=x-drag.startX,dy=(event.clientY-drag.startY)/drag.scale;
      if(!drag.started){
        if(Math.abs(dy)>6&&Math.abs(dy)>Math.abs(dx)){stop();return;}
        if(Math.abs(dx)<=6)return;
        drag.started=true;root.classList.add('is-dragging');
        try{root.setPointerCapture?.(drag.id);}catch{}
      }
      drag.center=drag.startCenter+dx;
      if(event.cancelable)event.preventDefault();
      if(!frame)frame=requestAnimationFrame(paint);
    },{passive:false});
    document.addEventListener('pointerup',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      if(!drag.started&&root.contains(event.target)&&!event.target.closest('[role="tab"]')){
        const index=nearest(drag.items,(event.clientX-drag.rect.left)/drag.scale);stop();onSelect(index);buttons[index].focus({preventScroll:true});return;
      }
      stop(true,event);
    });
    document.addEventListener('pointercancel',event=>{if(drag?.id===event.pointerId)stop();});
    // Touch may transfer implicit capture from a child button to this track.
    root.addEventListener('lostpointercapture',event=>{if(event.target===root&&drag?.id===event.pointerId)stop();});
    root.addEventListener('click',event=>{
      if(blockedClick&&performance.now()<=blockedClick.until&&event.detail>0&&(event.pointerId===undefined||event.pointerId===blockedClick.id)){
        blockedClick=null;event.preventDefault();event.stopImmediatePropagation();
      }
    },true);
    root.addEventListener('keydown',()=>stop(),true);
    window.addEventListener('blur',()=>stop());window.addEventListener('resize',()=>stop());window.addEventListener('hashchange',()=>stop());window.addEventListener('lab:route',()=>stop());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    root.classList.add('drag-enabled');return{cancel:()=>stop()};
  };
})();
