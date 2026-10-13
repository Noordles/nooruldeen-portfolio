/* Shared accessible seek bar for portfolio and thesis presentations. */
(() => {
  'use strict';
  const words={en:['Choose slide','Slide {current} of {total}'],ro:['Alege diapozitivul','Diapozitivul {current} din {total}'],ar:['اختر الشريحة','الشريحة {current} من {total}']};
  function attach(track,total,show,getIndex,options={}){
    if(!track||!Number.isInteger(total)||total<1)throw Error('A presentation needs a track and slide count');
    const language=()=>options.language?.()||(typeof document!=='undefined'?document.documentElement?.lang:'en')||'en';
    const rtl=()=>language()==='ar',clamp=i=>Math.max(0,Math.min(total-1,Math.round(i)));
    track.setAttribute('role','slider');track.setAttribute('tabindex','0');track.setAttribute('aria-orientation','horizontal');track.setAttribute('aria-valuemin','1');track.setAttribute('aria-valuemax',String(total));
    function update(index){const active=clamp(index),p=total>1?100*active/(total-1):100,copy=words[language()]||words.en;track.setAttribute('aria-label',copy[0]);track.setAttribute('aria-valuenow',String(active+1));track.setAttribute('aria-valuetext',copy[1].replace('{current}',String(active+1)).replace('{total}',String(total)));track.style.setProperty('--seek-position',p+'%');const fill=track.querySelector('[data-slide-progress]');if(fill)fill.style.width=p+'%';}
    const seek=event=>{const r=track.getBoundingClientRect();if(!r.width)return;const p=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));show(clamp((rtl()?1-p:p)*(total-1)));};
    let dragging=false;
    track.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;event.preventDefault();dragging=true;track.focus();track.setPointerCapture?.(event.pointerId);seek(event);});
    track.addEventListener('pointermove',event=>{if(dragging)seek(event);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])track.addEventListener(type,()=>{dragging=false;});
    track.addEventListener('keydown',event=>{let index=getIndex();if(event.key==='Home')index=0;else if(event.key==='End')index=total-1;else if(event.key==='ArrowRight')index+=rtl()?-1:1;else if(event.key==='ArrowLeft')index+=rtl()?1:-1;else if(event.key==='ArrowUp')index++;else if(event.key==='ArrowDown')index--;else if(event.key==='PageUp')index+=5;else if(event.key==='PageDown')index-=5;else return;event.preventDefault();event.stopPropagation();show(clamp(index));});
    if(typeof MutationObserver!=='undefined'&&typeof document!=='undefined'){const observer=new MutationObserver(()=>update(getIndex()));observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});}
    update(getIndex());return {update};
  }
  if(typeof window!=='undefined')window.NoorPresentationSeek={attach};if(typeof module!=='undefined')module.exports={attach};
})();
