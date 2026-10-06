
(() => {
  "use strict";
  const tag=document.getElementById("cms-page-data");
  if(!tag)return;
  const config=JSON.parse(tag.textContent);
  const bindings=new Map((config.bindings||[]).map(f=>[f.key,f]));
  let overrides=config.fields||[];
  let collectionItems=config.items||[];
  const safeUrl=value=>{
    if(typeof value!=="string"||/[\x00-\x20\\]/.test(value)||value.startsWith("//"))return false;
    try{const u=new URL(value,location.origin);return !u.username&&!u.password&&["https:","http:","mailto:","tel:"].includes(u.protocol);}catch{return false;}
  };
  const asset=value=>value&&(/^[a-z][a-z0-9+.-]*:/i.test(value)||value.startsWith("/")||value.startsWith("#")||value.startsWith("?")?value:"/"+value);
  const nodeFor=id=>document.querySelector('[data-cms-node="'+id+'"]');
  const textSlots=new Map();
  for(const field of bindings.values()){
    const node=nodeFor(field.node);
    if(node&&!textSlots.has(field.node))textSlots.set(field.node,[...node.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE&&n.nodeValue.trim()));
  }
  function apply(language=document.documentElement.lang||"en"){
    for(const field of overrides){
      const node=nodeFor(field.node);
      if(!node)continue;
      const value=field.values[language]??field.values.en??window.noorCmsDefaultValue?.(field.original,language)??field.original;
      if(typeof value!=="string")continue;
      if(field.attribute){
        if(["href","src","poster"].includes(field.attribute)&&!safeUrl(value))continue;
        const next=["href","src","poster"].includes(field.attribute)?asset(value):value;
        if(node.getAttribute(field.attribute)!==next)node.setAttribute(field.attribute,next);
      }else{
        let texts=textSlots.get(field.node)||[];
        if(texts.some(text=>text.parentNode!==node)){
          const children=[...node.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
          texts=children.filter(text=>text.nodeValue.trim()||children.length===1);textSlots.set(field.node,texts);
        }
        const text=texts[field.slot];
        if(text){const next=text.nodeValue.replace(text.nodeValue.trim(),value);if(text.nodeValue!==next)text.nodeValue=next;}
      }
    }
    applyCollection(language);
  }
  function setText(node,value){if(!node)return;const child=node.firstChild;if(child?.nodeType===Node.TEXT_NODE&&node.childNodes.length===1){if(child.nodeValue!==value)child.nodeValue=value;}else if(node.textContent!==value)node.textContent=value;}
  function setAttribute(node,key,value){if(node&&node.getAttribute(key)!==value)node.setAttribute(key,value);}
  function applyCollection(language){
    const localized=(item,key)=>item.translations?.[language]?.[key]??window.noorCmsDefaultValue?.(item[key]||"",language)??item[key]??"";
    for(const item of collectionItems){
      if(config.collection==="photos"){
        const card=document.querySelector('[data-cms-item="'+item.id+'"]');if(!card)continue;
        const title=localized(item,"title"),caption=localized(item,"caption"),alt=localized(item,"alt");
        setText(card.querySelector("figcaption b"),title);setText(card.querySelector("figcaption small"),caption);
        setAttribute(card.querySelector("img"),"alt",alt);setAttribute(card.querySelector("[data-photo-open]"),"data-alt",alt);
        const translation=item.translations?.[language],edited=translation&&("title" in translation||"caption" in translation);
        setAttribute(card.querySelector("[data-photo-open]"),"data-caption",(edited?translation.viewerCaption:localized(item,"viewerCaption"))||[title,caption].filter(Boolean).join(" · "));
        const gallery=card.closest(".photo-year-section");
        if(gallery){setText(gallery.querySelector(".photo-year-heading h3"),localized(item,"gallery"));setText(gallery.querySelector(".photo-year-heading > span"),localized(item,"gallery"));}
      }else if(config.collection==="piano"){
        const card=document.querySelector('[data-track-card="'+(item.builtin||item.id)+'"]');if(!card)continue;
        setText(card.querySelector("h3"),localized(item,"title"));
        const original=(config.pianoDefaults||[]).find(p=>p.id===item.id);
        const composer=localized(item,"composer"),description=localized(item,"description");
        const copy=item.builtin?(original?.composer===item.composer&&!item.translations?.[language]?.composer?description:[composer,description].filter(Boolean).join(" · ")):[localized(item,"pieceStatus"),composer,description].filter(Boolean).join(" · ");
        setText(card.querySelector(".track-info > p"),copy);
        for(const key of ["notes","difficulty","pieceStatus"])setText(card.querySelector('[data-cms-note="'+key+'"]'),localized(item,key));
      }
    }
  }
  window.noorCmsApply=apply;
  apply();
  const el=(tag,attrs={},children=[])=>{
    const node=document.createElement(tag);
    for(const [key,value] of Object.entries(attrs))key==="text"?node.textContent=value:node.setAttribute(key,String(value));
    node.append(...children);return node;
  };
  function previewPhotos(items){
    const container=document.querySelector(".photo-gallery-page");
    if(!container)return;
    const old=[...container.querySelectorAll(".photo-year-section")];
    const anchor=old[0]||container.querySelector(".photos-download-toolbar")?.nextSibling;
    const fragment=document.createDocumentFragment(),groups=new Map();
    for(const item of items.filter(i=>i.status!=="hidden")){
      if(!safeUrl(item.full)||!safeUrl(item.src))continue;
      const name=item.gallery||"Collection";if(!groups.has(name))groups.set(name,[]);groups.get(name).push(item);
    }
    for(const [name,items] of groups){
      const grid=el("div",{class:"photo-grid-masonry"});
      for(const p of items){
        const caption=p.viewerCaption||[p.title,p.caption].filter(Boolean).join(" · ");
        const link=el("a",{href:asset(p.full),"data-photo-open":"","data-caption":caption,"data-alt":p.alt||""},[
          el("img",{src:asset(p.src),alt:p.alt||"",loading:"lazy",decoding:"async",width:p.width||900,height:p.height||900}),
          el("figcaption",{},[el("span",{},[el("b",{text:p.title}),el("small",{text:p.caption||""})])])
        ]);
        grid.append(el("figure",{class:"photo-card","data-cms-item":p.id},[link,el("a",{class:"photo-card-download",href:asset(p.full),download:"","aria-label":"Download "+p.title},[el("span",{text:"DOWNLOAD"}),el("b",{"aria-hidden":"true",class:"arrow-glyph",text:"↓"})])]));
      }
      fragment.append(el("section",{class:"photo-year-section","aria-label":name+" photographs"},[el("div",{class:"photo-year-heading"},[el("h3",{text:name}),el("span",{text:name})]),grid]));
    }
    if(anchor)container.insertBefore(fragment,anchor);else container.append(fragment);
    old.forEach(node=>node.remove());
  }
  function previewPiano(items){
    const list=document.querySelector(".track-list");
    if(!list)return;
    const existing=new Map([...list.querySelectorAll("[data-track-card]")].map(n=>[n.dataset.trackCard,n]));
    const fragment=document.createDocumentFragment();
    let number=0;
    for(const p of items.filter(i=>i.status!=="hidden")){
      number++;
      let card=existing.get(p.builtin||p.id);
      if(card && p.audio)card=card.cloneNode(true);
      if(!card){
        card=el("article",{class:"track-card","data-track-card":p.id},[el("span",{class:"track-number"}),el("div",{class:"track-info"},[el("h3"),el("p")]),el("span",{class:"track-duration"}),el("div",{class:"track-progress",role:"slider",tabindex:"0","data-cms-seek":"","aria-label":"Seek in "+p.title,"aria-valuemin":"0","aria-valuemax":"100","aria-valuenow":"0"},[el("span")])]);
      }
      card.querySelector(".track-number").textContent=String(number).padStart(2,"0");
      card.querySelector("h3").textContent=p.title;
      const defaultPiece=(config.pianoDefaults||[]).find(x=>x.id===p.id);
      const description=p.builtin?(defaultPiece&&defaultPiece.composer===p.composer?p.description:[p.composer,p.description].filter(Boolean).join(" · ")):[p.pieceStatus,p.composer,p.description].filter(Boolean).join(" · ");
      card.querySelector(".track-info > p").textContent=description;
      card.querySelectorAll("[data-cms-note]").forEach(n=>n.remove());
      for(const key of ["notes","difficulty","learnedDate"])if(p[key]||Object.values(p.translations||{}).some(v=>v[key]))card.querySelector(".track-info").append(el("p",{"data-cms-note":key,text:p[key]||""}));
      if(p.builtin&&(p.pieceStatus&&defaultPiece?.pieceStatus!==p.pieceStatus||Object.values(p.translations||{}).some(v=>v.pieceStatus)))card.querySelector(".track-info").append(el("p",{"data-cms-note":"pieceStatus",text:p.pieceStatus||""}));
      if(p.thumbnail&&safeUrl(p.thumbnail))card.querySelector(".track-info").prepend(el("img",{"data-cms-note":"",src:asset(p.thumbnail),alt:"",width:"120",height:"120",loading:"lazy"}));
      if(p.midi&&safeUrl(p.midi))card.querySelector(".track-info").append(el("a",{"data-cms-note":"",class:"audio-download-link",href:asset(p.midi),download:"",text:"DOWNLOAD MIDI ↓"}));
      if(p.audio&&safeUrl(p.audio)){
        card.querySelector(".track-info").append(el("a",{"data-cms-note":"",class:"audio-download-link",href:asset(p.audio),download:"",text:"DOWNLOAD AUDIO ↓"}));
        card.querySelector(".track-button")?.remove();
        card.append(el("button",{class:"track-button",type:"button","data-cms-audio":asset(p.audio),"aria-label":"Play "+p.title,"aria-pressed":"false"},[el("span",{class:"play-symbol","aria-hidden":"true",text:"▶"}),el("span",{class:"button-text",text:"PLAY"})]));
        const seek=card.querySelector(".track-progress");seek.removeAttribute("data-track-seek");seek.setAttribute("data-cms-seek","");
      }
      if(p.video&&safeUrl(p.video))card.querySelector(".track-info").append(el("a",{"data-cms-note":"",class:"audio-download-link",href:p.video,target:"_blank",rel:"noopener noreferrer",text:"WATCH PERFORMANCE ↗"}));
      fragment.append(card);
    }
    list.replaceChildren(fragment);
  }
  if(config.adminOrigin && new URLSearchParams(location.search).get("cms-preview")==="1"){
    const reply=type=>window.parent.postMessage({type,page:config.page},config.adminOrigin);
    window.addEventListener("message",event=>{
      if(event.origin!==config.adminOrigin||event.source!==window.parent||event.data?.type!=="noor-cms-preview"||event.data.page!==config.page)return;
      const data=event.data.data;
      if(!data||data.version!==1)return;
      // Draft data replaces published overrides, including fields restored to their defaults.
      overrides=overrides.map(field=>({...field,values:{}}));
      for(const [key,values] of Object.entries(data.pages?.[config.page]||{})){
        const field=bindings.get(key);if(!field||!values||typeof values!=="object")continue;
        overrides=overrides.filter(f=>!(f.node===field.node&&f.slot===field.slot&&f.attribute===field.attribute));
        overrides.push({...field,original:field.value,values});
      }
      for(const [group,ids] of Object.entries(data.orders||{})){
        const parent=nodeFor(group);if(!parent||!Array.isArray(ids))continue;
        const nodes=ids.map(nodeFor).filter(node=>node?.parentElement===parent);
        const current=[...parent.children].filter(node=>nodes.includes(node));
        if(current.every((node,index)=>node===nodes[index]))continue;
        const anchor=current.at(-1)?.nextSibling||null,fragment=document.createDocumentFragment();
        fragment.append(...nodes);parent.insertBefore(fragment,anchor);
      }
      if(config.collection==="photos"&&Array.isArray(data.photos)){collectionItems=data.photos;previewPhotos(data.photos);}
      if(config.collection==="piano"&&Array.isArray(data.piano)){collectionItems=data.piano;previewPiano(data.piano);}
      apply();
      reply("noor-cms-preview-applied");
    });
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>reply("noor-cms-preview-ready"),{once:true});
    else reply("noor-cms-preview-ready");
  }
  let audio,active,context,analyser,frame;
  function stopMedia(){
    if(audio){audio.pause();audio.currentTime=0;}
    if(active){active.setAttribute("aria-pressed","false");active.querySelector(".button-text").textContent="PLAY";active.querySelector(".play-symbol").textContent="▶";}
    cancelAnimationFrame(frame);active=null;
  }
  window.addEventListener("noor:stop-media",stopMedia);
  function visual(){
    const canvas=document.getElementById("piano-visualizer");
    if(!canvas||!analyser||!active)return;
    const ctx=canvas.getContext("2d"),samples=new Uint8Array(analyser.fftSize);analyser.getByteTimeDomainData(samples);
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle="#36b99e";ctx.lineWidth=1.5;ctx.beginPath();
    for(let i=0;i<samples.length;i++){const x=i/(samples.length-1)*canvas.width,y=samples[i]/255*canvas.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.stroke();frame=requestAnimationFrame(visual);
  }
  document.addEventListener("click",async event=>{
    const button=event.target.closest("[data-cms-audio]");
    if(!button)return;
    if(active===button){stopMedia();return;}
    window.dispatchEvent(new Event("noor:stop-piano"));stopMedia();
    if(!safeUrl(button.dataset.cmsAudio))return;
    audio=new Audio();audio.crossOrigin=new URL(button.dataset.cmsAudio,location.href).origin===config.adminOrigin&&new URLSearchParams(location.search).has("cms-preview")?"use-credentials":"anonymous";audio.src=button.dataset.cmsAudio;active=button;
    const card=button.closest(".track-card"),seek=card.querySelector(".track-progress"),status=document.getElementById("piano-status");
    audio.addEventListener("timeupdate",()=>{
      const percent=Number.isFinite(audio.duration)&&audio.duration?audio.currentTime/audio.duration*100:0;
      seek.querySelector("span").style.width=percent+"%";seek.setAttribute("aria-valuenow",String(Math.round(percent)));
    });
    audio.addEventListener("loadedmetadata",()=>{const secs=Math.floor(audio.duration);if(Number.isFinite(secs))card.querySelector(".track-duration").textContent=Math.floor(secs/60)+":"+String(secs%60).padStart(2,"0");});
    audio.addEventListener("ended",()=>{stopMedia();if(status)status.textContent="READY TO PLAY";});
    audio.addEventListener("error",()=>{stopMedia();if(status)status.textContent="AUDIO IS NOT AVAILABLE";});
    try{
      context??=new (window.AudioContext||window.webkitAudioContext)();await context.resume();
      const source=context.createMediaElementSource(audio);analyser=context.createAnalyser();analyser.fftSize=1024;source.connect(analyser);analyser.connect(context.destination);
      await audio.play();button.setAttribute("aria-pressed","true");button.querySelector(".button-text").textContent="STOP";button.querySelector(".play-symbol").textContent="■";if(status)status.textContent="PLAYING / "+card.querySelector("h3").textContent;visual();
    }catch{stopMedia();if(status)status.textContent="AUDIO IS NOT AVAILABLE";}
  });
  const seekMedia=(seek,percent)=>{if(!audio||!active||active.closest(".track-card")!==seek.closest(".track-card")||!Number.isFinite(audio.duration))return;audio.currentTime=Math.max(0,Math.min(100,percent))/100*audio.duration;};
  document.addEventListener("click",event=>{const seek=event.target.closest("[data-cms-seek]");if(seek){const box=seek.getBoundingClientRect();seekMedia(seek,(event.clientX-box.left)/box.width*100);}});
  document.addEventListener("keydown",event=>{const seek=event.target.closest("[data-cms-seek]");if(!seek)return;const amount={ArrowLeft:-3,ArrowDown:-3,ArrowRight:3,ArrowUp:3,PageDown:-10,PageUp:10}[event.key];if(amount!==undefined||["Home","End"].includes(event.key)){event.preventDefault();seekMedia(seek,event.key==="Home"?0:event.key==="End"?100:Number(seek.getAttribute("aria-valuenow")||0)+amount);}});
})();
