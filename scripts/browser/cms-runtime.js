
(() => {
  "use strict";
  const tag=document.getElementById("cms-page-data");
  if(!tag)return;
  const config=JSON.parse(tag.textContent);
  const bindings=new Map((config.bindings||[]).map(f=>[f.key,f]));
  let overrides=config.fields||[];
  let collectionItems=config.items||[];
  let designs=config.styles||{},theme=config.theme||{},palette=config.palette||{};
  const colorCatalog=JSON.parse(document.getElementById("cms-color-catalog")?.textContent||"{}");
  const colors=window.noorColors,rootColorProperties=new Set(),localColorProperties=new WeakMap(),svgSources=new Map(),svgImages=new Map();
  const colorSettings=new WeakMap();
  const designWrappers=new Map(),designNodes=new Set(),fontLinks=new Set();
  const styleNodes=new Set(config.styleNodes||[]);
  const knownEffects=new Set(["default","none","wine-highlight","cyan-highlight","teal-highlight","wine-shadow","teal-shadow","duotone-shadow","outline","underline","glow","stamp","wine-frame","cyan-frame","teal-frame","tilt"]);
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
    applyPalette();
    for(const field of overrides){
      const node=nodeFor(field.node);
      if(!node)continue;
      const sharedUrl=["href","src","poster"].includes(field.attribute);
      const value=field.values[language]??((language==="en"||sharedUrl)?field.values.en:undefined)??window.noorCmsDefaultValue?.(field.original,language,node)??field.original;
      if(typeof value!=="string")continue;
      if(field.attribute){
        if(["href","src","poster"].includes(field.attribute)&&!safeUrl(value))continue;
        const next=["href","src","poster"].includes(field.attribute)?asset(value):value;
        if(node.getAttribute(field.attribute)!==next)node.setAttribute(field.attribute,next);
      }else{
        let texts=textSlots.get(field.node)||[];
        if(texts.some(text=>!node.contains(text))){
          const children=[...node.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE);
          texts=children.filter(text=>text.nodeValue.trim()||children.length===1);textSlots.set(field.node,texts);
        }
        const text=texts[field.slot];
        if(text){const next=text.nodeValue.replace(text.nodeValue.trim(),value);if(text.nodeValue!==next)text.nodeValue=next;}
      }
    }
    applyCollection(language);
    applyDesign(language);
    applySvgColors();
    window.dispatchEvent(new Event("noor:colors-changed"));
  }
  function setProperties(node,values,previous){
    for(const key of previous)if(!(key in values))node.style.removeProperty(key);
    for(const [key,value] of Object.entries(values))if(node.style.getPropertyValue(key)!==value)node.style.setProperty(key,value);
    previous.clear();for(const key of Object.keys(values))previous.add(key);
  }
  function applyPalette(){if(colors)setProperties(document.documentElement,colors.variables(colorCatalog,palette),rootColorProperties);}
  function configureColors(node,settings){
    if(!colors)return;
    const signature=JSON.stringify([settings.color,settings.background,settings.border,settings.shadow,settings.palette,palette,settings.effect]);
    if(colorSettings.get(node)===signature)return;
    colorSettings.set(node,signature);
    const local=settings.palette||{},merged=colors.merge(palette,local),properties=colors.variables(colorCatalog,merged,local);
    const previous=localColorProperties.get(node)||new Set();localColorProperties.set(node,previous);
    for(const [key,property] of [["color","text"],["background","background"],["border","border"]]){
      const value=settings[key],enabled=colors.valid(value)||value==="transparent";
      node.classList.toggle("cms-"+property+"-color",enabled);if(enabled)properties["--cms-"+property+"-color"]=value;
    }
    node.classList.remove("cms-shadow-color");
    const base=getComputedStyle(node).textShadow,box=getComputedStyle(node).boxShadow;
    const replacements=new Map((colorCatalog.colors||[]).map(entry=>[colors.rgb(colors.resolve(entry,palette,colorCatalog)).join(","),colors.resolve(entry,merged,colorCatalog)]));
    const remap=value=>value.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*[\d.]+)?\s*\)/g,(all,r,g,b,alpha)=>{
      const next=colors.valid(settings.shadow)?settings.shadow:replacements.get([r,g,b].join(","));
      return next&&colors.rgb(next).join(",")!==[r,g,b].join(",")?"rgba("+colors.rgb(next).join(",")+(alpha||",1")+")":all;
    });
    const textShadow=base==="none"&&colors.valid(settings.shadow)?"3px 3px 0 "+settings.shadow:remap(base),boxShadow=remap(box);
    if(textShadow!==base||boxShadow!==box||colors.valid(settings.shadow)){
      node.classList.add("cms-shadow-color");properties["--cms-text-shadow"]=textShadow;properties["--cms-box-shadow"]=boxShadow;
    }
    setProperties(node,properties,previous);
  }
  function applySvgColors(){
    if(!colors)return;
    const active=new Set();
    for(const image of document.querySelectorAll("img")){
      let record=svgImages.get(image);const source=image.getAttribute("src");
      if(record&&source!==record.result&&source!==record.source){svgImages.delete(image);record=null;}
      if(!record){
        let url;try{url=new URL(source,location.href);}catch{continue;}
        if(url.origin!==location.origin||!colorCatalog.svgAssets?.includes(url.pathname))continue;
        record={source,url:url.href,result:source,revision:0};svgImages.set(image,record);
      }
      active.add(image);
      const computed=getComputedStyle(image),signature=(colorCatalog.colors||[]).map(entry=>computed.getPropertyValue("--site-color-"+entry.key).trim()).join("|");
      if(record.signature===signature)continue;record.signature=signature;const revision=++record.revision;
      if(!signature.replaceAll("|","")){if(image.getAttribute("src")!==record.source)image.setAttribute("src",record.source);record.result=record.source;continue;}
      if(!svgSources.has(record.url))svgSources.set(record.url,fetch(record.url).then(r=>{if(!r.ok)throw Error("SVG unavailable");return r.text();}).then(s=>{if(s.length>1000000||!/<svg\b/i.test(s))throw Error("Invalid SVG");return s;}));
      const effective={colors:{}};
      for(const entry of colorCatalog.colors||[]){const value=computed.getPropertyValue("--site-color-"+entry.key).trim();if(/^\d+ \d+ \d+$/.test(value))effective.colors[entry.key]=colors.hex(value.split(" ").map(Number));}
      svgSources.get(record.url).then(svg=>{
        if(record.revision!==revision||!image.isConnected)return;
        const updated=colors.recolorSvg(svg,colorCatalog,effective);
        record.result=updated===svg?record.source:"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(updated);
        if(image.getAttribute("src")!==record.result)image.setAttribute("src",record.result);
      }).catch(()=>{if(record.revision===revision)record.signature=null;});
    }
    for(const image of svgImages.keys())if(!active.has(image))svgImages.delete(image);
  }
  function setText(node,value){
    if(!node)return;const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT),texts=[];
    while(walker.nextNode())if(!walker.currentNode.parentElement.closest(".highlight-backdrop"))texts.push(walker.currentNode);
    if(texts.map(n=>n.nodeValue).join("")===value)return;
    if(texts.length===1)texts[0].nodeValue=value;else node.textContent=value;
  }
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
  function applyDesign(language){
    let changed=false;const activeNodes=new Set(),activeWrappers=new Set(),resetNodes=new Set();
    function configure(node,settings={}){
      activeNodes.add(node);const before=node.className+"|"+node.style.cssText+"|"+node.dataset.cmsEffect+"|"+node.dataset.cmsEffectText;
      const font=typeof settings.font==="string"&&/^[\p{L}\p{N} _-]{1,80}$/u.test(settings.font)?settings.font:"";
      node.classList.toggle("cms-font-override",Boolean(font));
      if(font){
        const family=JSON.stringify(font)+", "+(/Mono|Courier/i.test(font)?"monospace":/Slab|Georgia|Times|Lora|Playfair|Amiri/i.test(font)?"serif":"sans-serif");
        if(node.style.getPropertyValue("--cms-font-family")!==family)node.style.setProperty("--cms-font-family",family);
        if(!fontLinks.has(font)&&!["Roboto Slab","Barlow Condensed","IBM Plex Mono","Arial","Georgia","Times New Roman","Verdana","Trebuchet MS","Courier New"].includes(font)){
          fontLinks.add(font);const link=document.createElement("link");link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family="+encodeURIComponent(font)+":wght@400;700&display=swap";document.head.append(link);
        }
      }else node.style.removeProperty("--cms-font-family");
      const effect=knownEffects.has(settings.effect)?settings.effect:"default";
      if(effect==="default")delete node.dataset.cmsEffect;else if(node.dataset.cmsEffect!==effect)node.dataset.cmsEffect=effect;
      node.classList.toggle("cms-highlight",effect.endsWith("-highlight")||effect==="stamp"||Boolean(settings.background&&node.classList.contains("cms-inline-design")));
      const phrase=typeof settings.text==="string"?settings.text.trim():"";
      if(phrase&&effect.endsWith("-highlight")){if(node.dataset.cmsEffectText!==phrase)node.dataset.cmsEffectText=phrase;}else delete node.dataset.cmsEffectText;
      configureColors(node,settings);
      if(before!==node.className+"|"+node.style.cssText+"|"+node.dataset.cmsEffect+"|"+node.dataset.cmsEffectText)changed=true;
    }
    configure(document.body,{...designs.$page?.[language],font:designs.$page?.[language]?.font||theme[language]?.font||""});
    for(const [key,langs] of Object.entries(designs)){
      if(key==="$page")continue;const settings=langs?.[language];if(!settings||typeof settings!=="object")continue;
      let node,text,field=bindings.get(key),container=false;
      if(field){
        node=nodeFor(field.node);if(node&&!field.attribute)text=textSlots.get(field.node)?.[field.slot];else container=true;
      }else if(styleNodes.has(key)){node=nodeFor(key);container=true;}
      else{
        const match=key.match(/^(photo|piano):([a-z0-9-]+):(item|title|caption|alt|gallery|description|notes|pieceStatus|difficulty)$/);
        if(!match)continue;const [,type,id,part]=match,item=collectionItems.find(p=>p.id===id);if(!item)continue;
        const card=document.querySelector(type==="photo"?'[data-cms-item="'+id+'"]':'[data-track-card="'+(item.builtin||id)+'"]');if(!card)continue;
        container=part==="item"||part==="alt";
        node=part==="item"?card:type==="photo"?card.querySelector(part==="title"?"figcaption b":part==="caption"?"figcaption small":part==="alt"?"img":".not-used"):card.querySelector(part==="title"?"h3":part==="description"?".track-info > p":'[data-cms-note="'+part+'"]');
        if(type==="photo"&&part==="gallery")node=card.closest(".photo-year-section")?.querySelector(".photo-year-heading h3");
        if(node&&!container){const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);while(walker.nextNode()){if(!walker.currentNode.parentElement.closest(".highlight-backdrop")){text=walker.currentNode;break;}}}
      }
      if(!node)continue;
      if(container){configure(node,settings);continue;}
      if(!text||!node.contains(text))continue;
      const effect=knownEffects.has(settings.effect)?settings.effect:"default";
      if(!settings.font&&effect==="default"&&!settings.color&&!settings.background&&!settings.border&&!settings.shadow&&!Object.keys(settings.palette?.families||{}).length&&!Object.keys(settings.palette?.colors||{}).length)continue;
      let record=designWrappers.get(key);
      if(!record||record.text!==text||!node.contains(record.wrapper)){
        const wrapper=document.createElement("span");wrapper.className="cms-inline-design";wrapper.dataset.cmsStyleField=key;
        text.before(wrapper);wrapper.append(text);record={wrapper,text,node};designWrappers.set(key,record);changed=true;
      }
      activeWrappers.add(key);configure(record.wrapper,settings);if(effect!=="default")resetNodes.add(node);
    }
    for(const [key,record] of designWrappers){if(!activeWrappers.has(key)){if(record.wrapper.contains(record.text))record.wrapper.replaceWith(record.text);designWrappers.delete(key);changed=true;}}
    document.querySelectorAll(".cms-effect-reset").forEach(node=>{if(!node.closest(".highlight-backdrop")&&!resetNodes.has(node)){node.classList.remove("cms-effect-reset");changed=true;}});
    for(const node of resetNodes){if(!node.classList.contains("cms-effect-reset")){node.classList.add("cms-effect-reset");changed=true;}}
    for(const node of designNodes)if(!activeNodes.has(node)){configure(node,{});activeNodes.delete(node);}
    designNodes.clear();for(const node of activeNodes)designNodes.add(node);
    if(changed)window.noorRefreshHighlights?.();
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
    let picking=false,pickOutline;
    const pickedTarget=target=>{
      if(!(target instanceof Element)||target.closest("[data-cms-picker]"))return null;
      const photo=target.closest("[data-cms-item]"),track=target.closest("[data-track-card]");
      if(photo&&config.collection==="photos"){
        const part=target.closest("figcaption b")?"title":target.closest("figcaption small")?"caption":target.closest("img")?"alt":"item";
        return {key:"photo:"+photo.dataset.cmsItem+":"+part,node:part==="item"?photo:target,label:"Photograph / "+part};
      }
      if(track&&config.collection==="piano"){
        const item=collectionItems.find(item=>(item.builtin||item.id)===track.dataset.trackCard);if(!item)return null;
        const part=target.closest("h3")?"title":target.closest(".track-info > p")?"description":"item";
        return {key:"piano:"+item.id+":"+part,node:part==="item"?track:target,label:"Piano piece / "+part};
      }
      const wrapper=target.closest("[data-cms-style-field]");if(wrapper)return {key:wrapper.dataset.cmsStyleField,node:wrapper,label:wrapper.textContent.slice(0,85)};
      const node=target.closest("[data-cms-node]");if(!node||!styleNodes.has(node.dataset.cmsNode))return null;
      const field=[...bindings.values()].find(f=>f.node===node.dataset.cmsNode&&!f.attribute);
      return {key:field?.key||node.dataset.cmsNode,node,label:node.textContent.trim().slice(0,85)||node.tagName.toLowerCase()};
    };
    function stopPicking(){picking=false;pickOutline?.remove();pickOutline=null;}
    document.addEventListener("pointermove",event=>{
      if(!picking)return;const picked=pickedTarget(event.target);if(!picked){if(pickOutline)pickOutline.hidden=true;return;}
      const rect=picked.node.getBoundingClientRect();
      if(!pickOutline){pickOutline=document.createElement("div");pickOutline.dataset.cmsPicker="";pickOutline.style.cssText="position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #30c4a0;background:rgba(48,196,160,.1);box-sizing:border-box";document.body.append(pickOutline);}
      pickOutline.hidden=false;Object.assign(pickOutline.style,{left:rect.left+"px",top:rect.top+"px",width:rect.width+"px",height:rect.height+"px"});
    },true);
    document.addEventListener("click",event=>{
      if(!picking)return;event.preventDefault();event.stopImmediatePropagation();const picked=pickedTarget(event.target);if(!picked)return;
      window.parent.postMessage({type:"noor-cms-color-picked",page:config.page,key:picked.key,label:picked.label},config.adminOrigin);stopPicking();
    },true);
    document.addEventListener("keydown",event=>{if(picking&&event.key==="Escape")stopPicking();});
    window.addEventListener("message",event=>{
      if(event.origin!==config.adminOrigin||event.source!==window.parent||event.data?.page!==config.page)return;
      if(event.data.type==="noor-cms-pick-start"){picking=true;return;}
      if(event.data.type==="noor-cms-pick-stop"){stopPicking();return;}
      if(event.data.type!=="noor-cms-preview")return;
      const data=event.data.data;
      if(!data||data.version!==1)return;
      designs=data.styles?.[config.page]||{};theme=data.theme||{};palette=data.palette||{};
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
