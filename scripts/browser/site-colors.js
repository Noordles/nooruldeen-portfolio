/* Shared palette math for the site and owner editor. No arbitrary CSS is accepted. */
((root)=>{
  "use strict";
  const valid=value=>typeof value==="string"&&/^#[0-9a-f]{6}$/i.test(value);
  const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
  const hex=channels=>"#"+channels.map(c=>Math.round(c).toString(16).padStart(2,"0")).join("");
  const clamp=n=>Math.max(0,Math.min(1,n));
  function hsl(value){
    const [r,g,b]=rgb(value).map(n=>n/255),max=Math.max(r,g,b),min=Math.min(r,g,b),delta=max-min,l=(max+min)/2;
    let h=0,s=0;
    if(delta){s=delta/(1-Math.abs(2*l-1));h=max===r?((g-b)/delta)%6:max===g?(b-r)/delta+2:(r-g)/delta+4;h=(h*60+360)%360;}
    return [h,s,l];
  }
  function fromHsl(h,s,l){
    h=(h%360+360)%360;s=clamp(s);l=clamp(l);
    const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;
    const channels=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
    return hex(channels.map(n=>(n+m)*255));
  }
  function resolve(entry,palette={},catalog={}){
    const exact=palette.colors?.[entry.key];if(valid(exact))return exact.toLowerCase();
    const family=catalog.families?.find(f=>f.key===entry.family),replacement=palette.families?.[entry.family];
    if(!family||!valid(replacement)||replacement.toLowerCase()===family.color)return entry.value;
    if(entry.value===family.color)return replacement.toLowerCase();
    const base=hsl(family.color),source=hsl(entry.value),next=hsl(replacement);
    const delta=((source[0]-base[0]+540)%360)-180;
    return fromHsl(next[0]+delta,source[1]+next[1]-base[1],source[2]+next[2]-base[2]);
  }
  const merge=(global={},local={})=>({families:{...global.families,...local.families},colors:{...global.colors,...local.colors}});
  function variables(catalog,palette={},only){
    const out={};
    for(const entry of catalog.colors||[]){
      if(only&&!only.families?.[entry.family]&&!only.colors?.[entry.key])continue;
      if(!palette.families?.[entry.family]&&!palette.colors?.[entry.key])continue;
      out["--site-color-"+entry.key]=rgb(resolve(entry,palette,catalog)).join(" ");
    }
    if(only&&Object.keys(out).length)Object.assign(out,catalog.aliases||{});
    return out;
  }
  function recolorSvg(source,catalog,palette){
    const colors=new Map((catalog.colors||[]).map(entry=>[entry.key,resolve(entry,palette,catalog)]));
    return source.replace(/(\b(?:fill|stroke|stop-color|flood-color|lighting-color|color)\s*=\s*)(["'])(#[0-9a-f]{3,8})\2/gi,(all,prefix,quote,value)=>{
      let key=value.slice(1).toLowerCase(),alpha="";
      if(key.length===3||key.length===4)key=[...key].map(c=>c+c).join("");
      if(key.length===8){alpha=key.slice(6);key=key.slice(0,6);}
      const next=colors.get(key);return next?prefix+quote+next+alpha+quote:all;
    }).replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(all,open,css,close)=>open+css.replace(/#[0-9a-f]{6}\b/gi,value=>colors.get(value.slice(1).toLowerCase())||value)+close);
  }
  const api={valid,rgb,hex,hsl,fromHsl,resolve,merge,variables,recolorSvg};
  root.noorColors=api;if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
