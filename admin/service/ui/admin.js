
const $=s=>document.querySelector(s);
const state={data:null,catalog:null,media:[],revision:0,view:"dashboard",selected:null,dirty:false,lang:"en",section:null,session:null};
let pickMedia,toastTimer;
const element=(tag,attrs={},children=[])=>{
  const node=document.createElement(tag);
  for(const [key,value] of Object.entries(attrs)){if(key==="text")node.textContent=value;else if(key==="class")node.className=value;else if(key.startsWith("on"))node.addEventListener(key.slice(2),value);else node.setAttribute(key,String(value));}
  for(const child of children)node.append(child);return node;
};
const text=(tag,value,cls)=>element(tag,{text:value,...(cls?{class:cls}:{})});
const button=(label,fn,cls)=>element("button",{type:"button",text:label,onclick:fn,...(cls?{class:cls}:{})});
function notice(message,error=false){$("#notice").textContent=message;$("#notice").className="notice"+(error?" error":"");$("#notice").hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("#notice").hidden=true,6000);}
async function api(path,options={}){
  const response=await fetch("/api/"+path,{credentials:"same-origin",...options,headers:{"X-CMS-Request":"1",...(options.body instanceof FormData?{}:{"Content-Type":"application/json"}),...options.headers}});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"The request could not be completed");
  return data;
}
function changed(){state.dirty=true;$("#save-state").textContent="Unsaved changes";$("#save-state").classList.add("dirty");}
function ready(){for(const id of ["save","preview","publish"])$("#"+id).disabled=false;}
function field(label,value,update,{type="text",multiline=false,options,placeholder=""}={}){
  const wrap=element("label",{text:label});
  const input=options?element("select",{},options.map(x=>element("option",{value:x,text:x}))):element(multiline?"textarea":"input",multiline?{}:{type});
  input.value=value??"";input.placeholder=placeholder;
  input.addEventListener("input",()=>{update(input.value);changed();});
  wrap.append(input);return wrap;
}
function pageName(p){const names={"/":"Home","/design/":"Design","/idrl/":"IDRL","/incsmps/":"INCSMPS","/photos/":"Photography","/piano/":"Piano","/research/":"Research","/site-story/":"How the site was made"};return names[p.route]||p.route.split("/").filter(Boolean).at(-1).replaceAll("-"," ");}
function navigate(view){state.view=view;state.selected=null;state.section=null;render();navigation();}
function navigation(){
  const entries=[["dashboard","Dashboard"],["website","Website content"],["photos","Photography"],["piano","Piano"],["media","Media library"],["settings","Settings"]];
  const nav=$("#navigation"),mobile=$("#mobile-nav");nav.replaceChildren();mobile.replaceChildren();
  for(const [value,label] of entries){nav.append(button(label,()=>navigate(value),state.view===value?"active":""));mobile.append(element("option",{value,text:label}));}
  nav.append(text("div","PAGES","nav-label"));
  for(const p of state.catalog.pages){const value="page:"+p.id,label=pageName(p);nav.append(button(label,()=>navigate(value),state.view===value?"active":""));mobile.append(element("option",{value,text:"Page / "+label}));}
  mobile.value=state.view;
}
function heading(title,description){return [text("p","PRIVATE / OWNER CONTENT","kicker"),text("h1",title),text("p",description,"muted")];}
function reorder(list,index,offset,onOrder=()=>{}){const next=index+offset;if(next<0||next>=list.length)return;[list[index],list[next]]=[list[next],list[index]];onOrder();changed();render();}
function rows(list,select,onOrder=()=>{}){
  const ul=element("ul",{class:"item-list"});let dragging;
  list.forEach((item,index)=>{
    const image=item.src||item.thumbnail;
    const row=element("li",{class:"item-row"+(state.selected===item.id?" selected":""),draggable:"true"});
    if(image)row.append(element("img",{src:assetUrl(image),alt:"",loading:"lazy"}));else row.append(text("span",String(index+1).padStart(2,"0"),"kicker"));
    const choose=button(item.title||item.label,()=>select(item.id),"choose-item");choose.append(text("span",item.status||"","status-chip "+(item.status||"")));row.append(choose);
    row.append(element("div",{class:"order-buttons"},[button("↑",()=>reorder(list,index,-1,onOrder)),button("↓",()=>reorder(list,index,1,onOrder))]));
    row.addEventListener("dragstart",()=>{dragging=index;row.classList.add("dragging");});
    row.addEventListener("dragend",()=>row.classList.remove("dragging"));
    row.addEventListener("dragover",event=>event.preventDefault());
    row.addEventListener("drop",event=>{event.preventDefault();if(dragging===undefined||dragging===index)return;const [moved]=list.splice(dragging,1);list.splice(index,0,moved);onOrder();changed();render();});
    ul.append(row);
  });return ul;
}
const assetUrl=value=>value&&new URL(value,state.session.siteOrigin+"/").href;
function allMedia(){
  const built=new Map();
  for(const p of state.catalog.pages)for(const f of p.fields)if(f.attribute==="src"){
    const src=assetUrl(f.value);if(!built.has(src))built.set(src,{id:src,kind:"image",filename:f.value.split("/").pop(),title:f.value.split("/").pop(),src,full:src,uses:[]});built.get(src).uses.push(pageName(p));
  }
  for(const p of state.data.photos){
    const src=assetUrl(p.src);
    if(!src.includes("/media/")&&!built.has(src))built.set(src,{id:src,kind:"image",filename:p.title,title:p.title,alt:p.alt,src,full:assetUrl(p.full),width:p.width,height:p.height,uses:["Photography"]});
  }
  return [...state.media.map(m=>({...m,uses:[...new Set([...(m.uses||[]),...Object.entries(state.data.pages).filter(([,v])=>JSON.stringify(v).includes("/media/"+m.id+"/")).map(([p])=>p),...["photos","piano"].flatMap(t=>state.data[t].filter(p=>JSON.stringify(p).includes("/media/"+m.id+"/")).map(p=>t+": "+p.title))])],src:state.session.adminOrigin+"/media/"+m.id+"/"+(m.kind==="image"?"thumb":"full"),full:state.session.adminOrigin+"/media/"+m.id+"/full",width:m.variants?.thumb?.width,height:m.variants?.thumb?.height})),...built.values()];
}
function chooseMedia(callback,kind="image"){
  pickMedia={callback,kind};$("#media-search").value="";renderChoices();$("#media-dialog").showModal();
}
function renderChoices(){
  const query=$("#media-search").value.toLowerCase(),grid=$("#media-choices");grid.replaceChildren();
  const items=allMedia().filter(m=>(!pickMedia?.kind||m.kind===pickMedia.kind&&!(pickMedia.kind==="audio"&&m.variants?.full?.type==="audio/midi"))&&(m.filename+" "+m.title).toLowerCase().includes(query));
  for(const m of items)grid.append(mediaTile(m,()=>{pickMedia.callback(m);$("#media-dialog").close();changed();render();}));
  if(!items.length)grid.append(text("p","No matching media. Upload a file in the media library.","empty"));
}
function mediaTile(m,onSelect){
  const tile=element("article",{class:"media-tile"});
  if(m.kind==="image")tile.append(element("img",{src:m.src,alt:m.alt||"",loading:"lazy"}));else tile.append(text("p","♫ Audio","kicker"));
  tile.append(text("strong",m.title||m.filename),text("small",m.uses?.length?"Used in "+m.uses.join(", "):"Unused"));
  if(onSelect)tile.append(button("Select",onSelect));
  return tile;
}
async function optimize(file,max){
  const image=await createImageBitmap(file);
  const scale=Math.min(1,max/Math.max(image.width,image.height));
  const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);image.close();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/webp",.9));
  if(!blob)throw new Error("Your browser could not process this image");return blob;
}
async function uploads(files,onUploaded){
  let uploaded=0;const errors=[];
  for(let i=0;i<files.length;i++){
    let file=files[i];
    const canonical={"audio/x-wav":"audio/wav","audio/wave":"audio/wav","audio/x-midi":"audio/midi"}[file.type]||(!file.type&&/\.mid(i)?$/i.test(file.name)?"audio/midi":file.type);
    if(canonical!==file.type)file=new File([file],file.name,{type:canonical,lastModified:file.lastModified});
    notice("Uploading "+(i+1)+" of "+files.length+" / "+file.name);
    try{
      if(file.size>25000000)throw new Error("Choose an original smaller than 25 MB");
      const form=new FormData();form.append("original",file);form.append("title",file.name.replace(/\.[^.]+$/,""));
      if(file.type.startsWith("image/")){
        if(!["image/jpeg","image/png","image/webp"].includes(file.type))throw new Error("Export this photograph as JPEG, PNG or WebP first");
        form.append("thumb",await optimize(file,900),"thumb.webp");form.append("full",await optimize(file,2600),"full.webp");
      }
      const result=await api("media",{method:"POST",body:form});
      if(!state.media.some(m=>m.id===result.media.id))state.media.unshift(result.media);
      uploaded++;
      if(onUploaded)onUploaded(allMedia().find(m=>m.id===result.media.id),file);
    }catch(error){errors.push(file.name+": "+error.message);notice(errors.at(-1),true);}
  }
  if(onUploaded&&uploaded)changed();render();notice(errors.length?uploaded+" uploaded. "+errors.join(" · "):uploaded+" uploaded. Save the draft when you are ready.",Boolean(errors.length));
}
function uploadButton(label,kind,onUploaded,multiple=true){
  const input=element("input",{type:"file",accept:kind==="image"?"image/jpeg,image/png,image/webp":"audio/mpeg,audio/wav,audio/midi",...(multiple?{multiple:""}:{})});
  input.hidden=true;input.addEventListener("change",()=>uploads([...input.files],onUploaded));
  const wrap=element("span",{},[button(label,()=>input.click()),input]);return wrap;
}
function photoFromMedia(m,gallery){return {id:crypto.randomUUID(),status:"draft",gallery,title:m.title||m.filename,caption:"",alt:m.alt||"",src:m.src,full:m.full,width:m.width||900,height:m.height||900,viewerCaption:""};}
function editCollection(type,main){
  const photos=type==="photos",list=state.data[type];
  main.append(...heading(photos?"Photography":"Piano",photos?"Upload photographs, edit captions, and arrange the collection. Draft and hidden items appear only in your admin preview.":"Manage pieces and recordings using the existing listening room design."));
  const toolbar=element("div",{class:"toolbar"});
  if(photos){
    toolbar.append(uploadButton("Upload photographs","image",m=>{list.push(photoFromMedia(m,state.gallery||new Date().getFullYear().toString()));}));
    toolbar.append(button("Add from media library",()=>chooseMedia(m=>list.push(photoFromMedia(m,state.gallery||"Collection")))));
    toolbar.append(field("Upload to gallery",state.gallery||new Date().getFullYear(),v=>state.gallery=v));
  }else toolbar.append(button("Add piece",()=>{const piece={id:crypto.randomUUID(),status:"draft",title:"Untitled piece",composer:"",description:"",notes:"",pieceStatus:"learning",difficulty:"",learnedDate:"",audio:"",video:"",thumbnail:"",midi:"",builtin:""};list.push(piece);state.selected=piece.id;changed();render();}));
  main.append(toolbar);
  const layout=element("div",{class:"editor-grid"});
  layout.append(rows(list,id=>{state.selected=id;render();}));
  const selected=list.find(p=>p.id===state.selected);
  if(!selected)layout.append(text("p",list.length?"Select an item to edit it. Use the arrows or drag items to change their order.":"Your collection is empty. Add the first item above.","empty"));
  else{
    const editor=element("section",{class:"panel"});
    editor.append(text("h2",selected.title));
    editor.append(field("Title",selected.title,v=>selected.title=v),field("Visibility",selected.status,v=>{selected.status=v;render();},{options:["draft","published","hidden"]}));
    if(photos){
      editor.append(field("Gallery / section",selected.gallery,v=>selected.gallery=v),field("Caption / description",selected.caption,v=>{selected.caption=v;selected.viewerCaption="";},{multiline:true}),field("Alt text",selected.alt,v=>selected.alt=v,{multiline:true}));
      editor.append(element("img",{src:assetUrl(selected.src),alt:"",width:"180"}));
      const replace=m=>Object.assign(selected,{src:m.src,full:m.full,width:m.width||900,height:m.height||900});
      editor.append(element("div",{class:"toolbar"},[button("Choose replacement",()=>chooseMedia(replace)),uploadButton("Upload replacement","image",replace,false)]));
    }else{
      for(const [key,label] of [["composer","Composer"],["description","Description"],["notes","My notes"],["pieceStatus","Learning status"],["difficulty","Difficulty"],["learnedDate","Date learned or added"],["video","Video or performance link"],["midi","MIDI download URL"]])editor.append(field(label,selected[key],v=>selected[key]=v,{multiline:["description","notes"].includes(key),type:key==="learnedDate"?"date":["video","midi"].includes(key)?"url":"text"}));
      editor.append(field("Audio URL",selected.audio,v=>selected.audio=v,{type:"url"}));
      editor.append(element("div",{class:"toolbar"},[button("Choose recording",()=>chooseMedia(m=>{selected.audio=m.full;},"audio")),uploadButton("Upload recording","audio",m=>{selected.audio=m.full;},false),button("Choose thumbnail",()=>chooseMedia(m=>selected.thumbnail=m.src))]));
    }
    editor.append(button("Remove item",()=>{if(confirm("Remove this item from the draft? The live page changes when you publish.")){list.splice(list.indexOf(selected),1);state.selected=null;changed();render();}},"danger"));
    layout.append(editor);
  }
  main.append(layout);
}
function pageEditor(main){
  const page=state.catalog.pages.find(p=>"page:"+p.id===state.view);
  main.append(...heading(pageName(page),"Edit the page’s content while keeping its existing layout. English, Romanian and Arabic can be edited separately."));
  const sections=[...new Set(page.fields.map(f=>f.section))];
  if(!state.section)state.section=sections[0];
  const toolbar=element("div",{class:"toolbar"});
  toolbar.append(field("Section",state.section,v=>{state.section=v;render();},{options:sections}),field("Language",state.lang,v=>{state.lang=v;render();},{options:["en","ro","ar"]}));
  main.append(toolbar);
  const values=state.data.pages[page.id]??={};
  const list=element("div",{class:"fields"});
  for(const f of page.fields.filter(f=>f.section===state.section)){
    const langs=values[f.key]||{},value=langs[state.lang]??(state.lang==="en"?f.value:"");
    const box=element("div",{class:"field"});box.append(text("div",f.label,"field-label"));
    const input=field(f.attribute||"Text",value,v=>{values[f.key]??={};values[f.key][state.lang]=v;},{multiline:!f.attribute && value.length>70,placeholder:state.lang==="en"?"":"Keep the site’s existing translation"});
    if(state.lang==="ar")input.lastElementChild.dir="rtl";
    box.append(input);
    if(f.attribute==="src")box.append(button("Choose image",()=>chooseMedia(m=>{values[f.key]??={};values[f.key].en=m.full;})));
    box.append(button("Restore site default",()=>{if(values[f.key])delete values[f.key][state.lang];changed();render();}));
    list.append(box);
  }
  main.append(list);
  for(const group of page.collections.filter(g=>g.section===state.section)){
    const order=state.data.orders[group.key]??=group.members.map(m=>m.id);
    const list=order.map(id=>group.members.find(m=>m.id===id));
    const panel=element("section",{class:"panel"});panel.append(text("h2","Arrange "+group.section));
    const orderRows=rows(list,()=>{},()=>{state.data.orders[group.key]=list.map(m=>m.id);});
    panel.append(orderRows);main.append(panel);
  }
}
function websiteEditor(main){
  main.append(...heading("Website content","Edit shared wording and links across the website. Use Pages for text that belongs to one page."));
  const groups=new Map();
  for(const page of state.catalog.pages)for(const f of page.fields){
    if(f.value.length<2)continue;
    const key=(f.attribute||"text")+":"+f.value;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({page,f});
  }
  const shared=[...groups.values()].filter(g=>new Set(g.map(x=>x.page.id)).size>1);
  const toolbar=element("div",{class:"toolbar"});
  toolbar.append(field("Language",state.lang,v=>{state.lang=v;render();},{options:["en","ro","ar"]}));
  const search=element("input",{type:"search",placeholder:"Search shared names, navigation, labels or links","aria-label":"Search website content"});
  search.value=state.globalSearch||"";toolbar.append(search);main.append(toolbar);
  const fields=element("div",{class:"fields"});main.append(fields);
  const draw=()=>{
    state.globalSearch=search.value;
    const matches=shared.filter(g=>g[0].f.value.toLowerCase().includes(search.value.toLowerCase()));
    fields.replaceChildren();
    for(const group of matches.slice(0,60)){
      const {page,f}=group[0],overrides=state.data.pages[page.id]?.[f.key]||{};
      const update=value=>{for(const {page,f} of group){state.data.pages[page.id]??={};state.data.pages[page.id][f.key]??={};state.data.pages[page.id][f.key][state.lang]=value;}};
      const box=element("div",{class:"field"});
      box.append(text("div",f.value,"field-label"),text("small","Shared across "+new Set(group.map(x=>x.page.id)).size+" pages"));
      const input=field(f.attribute||"Text",overrides[state.lang]??(state.lang==="en"?f.value:""),update,{multiline:!f.attribute&&f.value.length>70,placeholder:state.lang==="en"?"":"Keep the existing translation"});
      if(state.lang==="ar")input.lastElementChild.dir="rtl";
      box.append(input);
      if(f.attribute==="src")box.append(button("Choose image for these pages",()=>chooseMedia(m=>update(m.full))));
      box.append(button("Restore defaults",()=>{for(const {page,f} of group)if(state.data.pages[page.id]?.[f.key])delete state.data.pages[page.id][f.key][state.lang];changed();draw();}));
      fields.append(box);
    }
    if(matches.length>60)fields.append(text("p","Showing 60 shared fields. Search to find a specific phrase.","muted"));
    if(!matches.length)fields.append(text("p","No shared fields match this search. Select a page for its own content.","empty"));
  };
  search.addEventListener("input",draw);draw();
}
function render(){
  const main=$("#workspace");main.replaceChildren();
  if(state.view==="photos"||state.view==="piano")editCollection(state.view,main);
  else if(state.view==="website")websiteEditor(main);
  else if(state.view.startsWith("page:"))pageEditor(main);
  else if(state.view==="media"){
    main.append(...heading("Media library","Browse existing site images and new uploads. Uploaded originals stay private; the website uses optimized copies."));
    main.append(element("div",{class:"toolbar"},[uploadButton("Upload images","image"),uploadButton("Upload audio","audio")]));
    const search=element("input",{type:"search",placeholder:"Search media","aria-label":"Search media"}),grid=element("div",{class:"media-grid"});
    const draw=()=>{
      grid.replaceChildren();
      for(const m of allMedia().filter(m=>(m.title+" "+m.filename).toLowerCase().includes(search.value.toLowerCase()))){
        const tile=mediaTile(m);
        if(/^[a-f0-9-]{36}$/.test(m.id))tile.append(element("a",{href:state.session.adminOrigin+"/media/"+m.id+"/original",download:m.filename,text:"Download private original ↗"}));
        if(/^[a-f0-9-]{36}$/.test(m.id)&&!m.uses?.length)tile.append(button("Delete unused upload",async()=>{
          if(!confirm("Permanently delete this unused upload and its private original?"))return;
          try{await api("media/"+m.id,{method:"DELETE"});state.media=state.media.filter(x=>x.id!==m.id);render();}catch(e){notice(e.message,true);}
        },"danger"));
        grid.append(tile);
      }
    };search.addEventListener("input",draw);main.append(search,grid);draw();
  }else if(state.view==="settings"){
    main.append(...heading("Settings","Your owner session and publishing connection."));
    const panel=element("section",{class:"panel"});
    panel.append(text("h2","Signed in as "+state.session.owner.email),text("p","Website: "+state.session.siteOrigin),text("p","Admin: "+state.session.adminOrigin),text("p","Drafts and originals are held in private storage. Publish saves a version to the site repository, then the existing deployment rebuilds the public pages."),element("a",{href:"/cdn-cgi/access/logout",text:"Sign out of this owner session ↗"}));main.append(panel);
    const backup=element("section",{class:"panel"},[text("h2","Content backup"),text("p","Export your current content and draft. Uploaded files remain in your media library.")]);
    backup.append(button("Download content backup",()=>{
      const url=URL.createObjectURL(new Blob([JSON.stringify(state.data,null,2)],{type:"application/json"}));
      const link=element("a",{href:url,download:"noor-content-"+new Date().toISOString().slice(0,10)+".json"});link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }));
    const restore=element("input",{type:"file",accept:"application/json,.json"});restore.hidden=true;
    restore.addEventListener("change",async()=>{
      const file=restore.files[0];if(!file)return;
      try{
        if(file.size>1800000)throw new Error("This content backup is too large");
        const data=JSON.parse(await file.text());
        if(data.version!==1||!data.pages||!Array.isArray(data.photos)||!Array.isArray(data.piano))throw new Error("Choose an owner CMS content backup");
        if(!confirm("Replace this draft with the selected backup? The live website changes only when you publish."))return;
        const result=await api("draft",{method:"PUT",body:JSON.stringify({revision:state.revision,data})});
        state.data=data;state.revision=result.revision;state.dirty=false;$("#save-state").textContent="Backup restored to draft";render();notice("Backup restored privately. Preview it before publishing.");
      }catch(e){notice(e.message,true);}
    });
    backup.append(button("Restore content backup",()=>restore.click()),restore);main.append(backup);
  }else{
    main.append(...heading("Your website, within reach.","Edit a page, prepare a photograph, or add a piano piece. Save privately as you work, then preview and publish when ready."));
    const stats=element("div",{class:"stats"});
    for(const [label,num] of [["Pages",state.catalog.pages.length],["Photographs",state.data.photos.length],["Piano pieces",state.data.piano.length],["Uploaded media",state.media.length]])stats.append(element("div",{class:"panel stat"},[text("b",num),text("span",label)]));main.append(stats);
    main.append(element("section",{class:"panel"},[text("h2","Publishing"),text("p","Draft revision "+state.revision+" · Last published revision "+state.publishedRevision),button("Check deployment",async()=>{try{const r=await api("releases");const latest=r.releases[0];notice(latest?.runs?.map(x=>x.name+": "+(x.conclusion||x.status)).join(" · ")||"No publication from this admin yet.");}catch(e){notice(e.message,true);}})]));
  }
}
async function save(){
  const result=await api("draft",{method:"PUT",body:JSON.stringify({revision:state.revision,data:state.data})});
  state.revision=result.revision;state.dirty=false;$("#save-state").textContent="Draft saved";$("#save-state").classList.remove("dirty");return result;
}
$("#save").addEventListener("click",async()=>{try{$("#save").disabled=true;await save();notice("Your draft is saved privately.");}catch(e){notice(e.message,true);}finally{$("#save").disabled=false;}});
$("#publish").addEventListener("click",async()=>{
  if(!confirm("Publish this draft to your website? Draft and hidden collection items will stay off the public pages."))return;
  try{$("#publish").disabled=true;if(state.dirty)await save();const release=await api("publish",{method:"POST",body:JSON.stringify({revision:state.revision})});state.publishedRevision=release.revision;notice("Published to the repository. The website deployment is running.");render();}
  catch(e){notice(e.message,true);}finally{$("#publish").disabled=false;}
});
$("#preview").addEventListener("click",()=>{
  const p=state.view.startsWith("page:")?state.catalog.pages.find(p=>"page:"+p.id===state.view):state.catalog.pages.find(p=>p.route===(state.view==="photos"?"/photos/":state.view==="piano"?"/piano/":"/"));
  const url=new URL(p.route,state.session.siteOrigin);url.searchParams.set("cms-preview","1");url.searchParams.set("lang",state.lang);
  const frame=$("#preview-frame");frame.onload=()=>frame.contentWindow.postMessage({type:"noor-cms-preview",data:state.data,page:p.id},state.session.siteOrigin);frame.src=url.href;$("#preview-dialog").showModal();
});
$("#close-preview").addEventListener("click",()=>{$("#preview-dialog").close();$("#preview-frame").src="about:blank";});
$("#close-media").addEventListener("click",()=>$("#media-dialog").close());
$("#media-search").addEventListener("input",renderChoices);
$("#mobile-nav").addEventListener("change",event=>navigate(event.target.value));
window.addEventListener("beforeunload",event=>{if(state.dirty){event.preventDefault();event.returnValue="";}});
try{
  state.session=await api("session");const loaded=await api("content");Object.assign(state,loaded);
  $("#save-state").textContent="Owner session verified";ready();navigation();render();
}catch(error){$("#workspace").replaceChildren(...heading("Sign-in required",error.message),element("a",{href:"/admin",text:"Sign in again ↗"}));$("#save-state").textContent="Editing is locked";}
