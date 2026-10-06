
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
  const input=options?element("select",{},options.map(x=>element("option",{value:x.value??x,text:x.label??x}))):element(multiline?"textarea":"input",multiline?{}:{type});
  input.value=value??"";input.placeholder=placeholder;
  input.setAttribute("aria-label",label);
  input.addEventListener("input",()=>{update(input.value);changed();});
  wrap.append(input);return wrap;
}
function pageName(p){const names={"/":"Home","/design/":"Design","/idrl/":"IDRL","/incsmps/":"INCSMPS","/photos/":"Photography","/piano/":"Piano","/research/":"Research","/site-story/":"How the site was made"};return names[p.route]||p.route.split("/").filter(Boolean).at(-1).replaceAll("-"," ");}
function navigate(view){state.view=view;state.selected=null;state.section=null;state.pageSearch="";render();navigation();}
function navigation(){
  const entries=[["dashboard","Dashboard"],["website","Website content"],["photos","Photography"],["piano","Piano"],["media","Media library"],["settings","Settings"]];
  const nav=$("#navigation"),mobile=$("#mobile-nav");nav.replaceChildren();mobile.replaceChildren();
  for(const [value,label] of entries){nav.append(button(label,()=>navigate(value),state.view===value?"active":""));mobile.append(element("option",{value,text:label}));}
  nav.append(text("div","PAGES","nav-label"));
  const directories=new Map();
  for(const p of state.catalog.pages){const directory=p.id.split("/")[0];if(!directories.has(directory))directories.set(directory,[]);directories.get(directory).push(p);}
  for(const directory of [...new Set(["home","research","design","hobbies","site-story",...directories.keys()])]){
    const pages=directories.get(directory);if(!pages)continue;
    const name=directory==="site-story"?"Site story":directory[0].toUpperCase()+directory.slice(1);
    nav.append(text("div",name,"nav-directory"));
    for(const p of pages){
      const value="page:"+p.id,label=pageName(p),nested=p.id.includes("/projects/")||["/idrl/","/incsmps/"].includes(p.route);
      const item=button(label,()=>navigate(value),"page-nav"+(nested?" nested":"")+(state.view===value?" active":""));
      item.append(text("small",p.route,"page-route"));nav.append(item);
      mobile.append(element("option",{value,text:name+" / "+label+" · "+p.route}));
    }
  }
  mobile.value=state.view;
}
function heading(title,description){return [text("p","PRIVATE / OWNER CONTENT","kicker"),text("h1",title),text("p",description,"muted")];}
function reorder(list,index,offset,onOrder=()=>{}){const next=index+offset;if(next<0||next>=list.length)return;[list[index],list[next]]=[list[next],list[index]];onOrder();changed();render();}
function rows(list,select,onOrder=()=>{},{editable=false}={}){
  const ul=element("ul",{class:"item-list"});let dragging;
  list.forEach((item,index)=>{
    const image=item.src||item.thumbnail;
    const row=element("li",{class:"item-row"+(state.selected===item.id?" selected":""),draggable:"true"});
    if(image)row.append(element("img",{src:assetUrl(image),alt:"",loading:"lazy"}));else row.append(text("span",String(index+1).padStart(2,"0"),"kicker"));
    const choose=button(item.title||item.label,()=>select(item.id),"choose-item");choose.append(text("span",item.status||"","status-chip "+(item.status||"")));row.append(choose);
    choose.dataset.itemId=item.id;
    if(editable)choose.setAttribute("aria-expanded",String(state.selected===item.id));
    const controls=element("div",{class:"order-buttons"},[button("↑",()=>reorder(list,index,-1,onOrder)),button("↓",()=>reorder(list,index,1,onOrder))]);
    if(editable)controls.prepend(button(state.selected===item.id?"Close editor":"Edit",()=>select(item.id),"edit-item"));
    row.append(controls);
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
function collectionField(label,item,key,{multiline=false}={}){
  const value=state.lang==="en"?item[key]:item.translations?.[state.lang]?.[key];
  const wrap=field(label,value,v=>{
    if(state.lang==="en")item[key]=v;
    else{item.translations??={};item.translations[state.lang]??={};item.translations[state.lang][key]=v;}
    if(["caption","title"].includes(key)&&"gallery" in item){if(state.lang==="en")item.viewerCaption="";else item.translations[state.lang].viewerCaption="";}
  },{multiline,placeholder:state.lang==="en"?"":"Keep the site’s existing translation"});
  wrap.lastElementChild.dir=state.lang==="ar"?"rtl":"ltr";return wrap;
}
function editCollection(type,main){
  const photos=type==="photos",list=state.data[type];
  main.append(...heading(photos?"Photography":"Piano",photos?"Upload photographs, edit captions, and arrange the collection. Draft items appear in preview; hidden items stay off the page.":"Manage pieces and recordings using the existing listening room design."));
  const toolbar=element("div",{class:"toolbar"});
  toolbar.append(languageEditor());
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
    editor.append(text("p",editorLanguages.find(l=>l.value===state.lang).label+" · Text changes belong to this language. Files, order and visibility are shared.","muted"));
    editor.append(collectionField("Title",selected,"title"),field("Visibility",selected.status,v=>{selected.status=v;render();},{options:["draft","published","hidden"]}));
    if(photos){
      editor.append(collectionField("Gallery / section",selected,"gallery"),collectionField("Caption / description",selected,"caption",{multiline:true}),collectionField("Alt text",selected,"alt",{multiline:true}));
      editor.append(element("img",{src:assetUrl(selected.src),alt:"",width:"180"}));
      const replace=m=>Object.assign(selected,{src:m.src,full:m.full,width:m.width||900,height:m.height||900});
      editor.append(element("div",{class:"toolbar"},[button("Choose replacement",()=>chooseMedia(replace)),uploadButton("Upload replacement","image",replace,false)]));
    }else{
      for(const [key,label] of [["composer","Composer"],["description","Description"],["notes","My notes"],["pieceStatus","Learning status"],["difficulty","Difficulty"]])editor.append(collectionField(label,selected,key,{multiline:["description","notes"].includes(key)}));
      for(const [key,label] of [["learnedDate","Date learned or added"],["video","Video or performance link"],["midi","MIDI download URL"]])editor.append(field(label,selected[key],v=>selected[key]=v,{type:key==="learnedDate"?"date":"url"}));
      editor.append(button("Restore this language’s text",()=>{if(state.lang!=="en"&&selected.translations)delete selected.translations[state.lang];changed();render();}));
      editor.append(field("Audio URL",selected.audio,v=>selected.audio=v,{type:"url"}));
      editor.append(element("div",{class:"toolbar"},[button("Choose recording",()=>chooseMedia(m=>{selected.audio=m.full;},"audio")),uploadButton("Upload recording","audio",m=>{selected.audio=m.full;},false),button("Choose thumbnail",()=>chooseMedia(m=>selected.thumbnail=m.src))]));
    }
    editor.append(button("Remove item",()=>{if(confirm("Remove this item from the draft? The live page changes when you publish.")){list.splice(list.indexOf(selected),1);state.selected=null;changed();render();}},"danger"));
    layout.append(editor);
  }
  main.append(layout);
}
const editorLanguages=[{value:"en",label:"English editor"},{value:"ro",label:"Romanian editor"},{value:"ar",label:"Arabic editor"}];
const sectionLabel=value=>value==="Metadata"?"Page content & metadata":value==="top"?"Hero / top":value;
const availableInLanguage=f=>!f.languages||f.languages.includes(state.lang);
function languageEditor(){return field("Editing language",state.lang,v=>{state.lang=v;state.selected=null;render();},{options:editorLanguages});}
function contentField(page,f,onUpdate=()=>{}){
  const values=state.data.pages[page.id]??={},langs=values[f.key]||{};
  const value=langs[state.lang]??(state.lang==="en"||f.languages?.length===1?f.value:"");
  const box=element("div",{class:"field","data-field-key":f.key});box.append(text("div",f.label,"field-label"));
  const update=v=>{
    values[f.key]??={};values[f.key][state.lang]=v;
    document.querySelectorAll('[data-field-key="'+f.key+'"] label input,[data-field-key="'+f.key+'"] label textarea').forEach(input=>{if(input.value!==v)input.value=v;});
    onUpdate();
  };
  const input=field(f.attribute||"Text",value,update,{multiline:!f.attribute&&Math.max(value.length,f.value.length)>70,placeholder:state.lang==="en"?"":"Keep the site’s existing translation"});
  input.lastElementChild.dir=state.lang==="ar"?"rtl":"ltr";box.append(input);
  if(["src","poster"].includes(f.attribute))box.append(button("Choose image",()=>chooseMedia(m=>update(m.full))));
  box.append(button("Restore site default",()=>{if(values[f.key])delete values[f.key][state.lang];changed();render();}));
  return box;
}
function pageEditor(main){
  const page=state.catalog.pages.find(p=>"page:"+p.id===state.view);
  const directory=page.id.split("/")[0],parent=state.catalog.pages.find(p=>p.id.split("/")[0]===directory&&p.id.endsWith("/"+directory+".html"));
  const breadcrumb=element("div",{class:"page-breadcrumb","aria-label":"Page location"});
  if(parent&&parent.id!==page.id)breadcrumb.append(button(pageName(parent),()=>navigate("page:"+parent.id)),text("span","›"));
  else if(directory==="hobbies")breadcrumb.append(text("span","Hobbies"),text("span","›"));
  breadcrumb.append(text("span",pageName(page)));main.append(breadcrumb);
  main.append(...heading(pageName(page),"Edit text, numbers, images and links in the selected language. Search all content, or click Edit on an Arrange item to edit its contents."));
  main.append(element("a",{class:"page-location",href:new URL(page.route,state.session.siteOrigin).href,target:"_blank",rel:"noopener noreferrer",text:page.route+" ↗"}));
  const fields=page.fields.filter(availableInLanguage),sections=[...new Set(fields.map(f=>f.section))];
  if(!state.section)state.section="All content";
  const toolbar=element("div",{class:"toolbar"});
  toolbar.append(languageEditor(),field("Section",state.section,v=>{state.section=v;render();},{options:["All content",...sections.map(value=>({value,label:sectionLabel(value)}))]}));
  const search=element("input",{type:"search",placeholder:"Find a heading, paragraph, number, image or link","aria-label":"Search page content"});
  search.value=state.pageSearch||"";toolbar.append(element("label",{text:"Search content"},[search]));main.append(toolbar);
  const body=element("div");main.append(body);
  const values=state.data.pages[page.id]??={},byKey=new Map(fields.map(f=>[f.key,f]));
  const memberLabel=member=>{
    const texts=(member.fieldKeys||[]).map(key=>byKey.get(key)).filter(f=>f&&!f.attribute);
    const title=texts.find(f=>/^h[1-6]:/.test(f.label));
    if(title)return values[title.key]?.[state.lang]??values[title.key]?.en??title.value;
    return texts.map(f=>values[f.key]?.[state.lang]??values[f.key]?.en??f.value).join(" ").slice(0,120)||member.label;
  };
  const refreshRows=()=>{
    for(const group of page.collections)for(const member of group.members){
      const row=body.querySelector('[data-item-id="'+member.id+'"]');
      if(row)row.firstChild.nodeValue=memberLabel(member);
    }
  };
  const draw=()=>{
    state.pageSearch=search.value;body.replaceChildren();const query=search.value.trim().toLowerCase();
    const matched=fields.filter(f=>(state.section==="All content"||f.section===state.section)&&(!query||[f.label,f.value,...Object.values(values[f.key]||{})].some(v=>v.toLowerCase().includes(query))));
    body.append(text("p",matched.length+" editable fields in "+editorLanguages.find(l=>l.value===state.lang).label.toLowerCase()+". Changes in other languages are kept separately.","muted"));
    const matchedKeys=new Set(matched.map(f=>f.key));
    for(const group of page.collections.filter(g=>(state.section==="All content"||g.section===state.section)&&(!query||g.members.some(m=>(m.fieldKeys||[]).some(k=>matchedKeys.has(k)))))){
      const order=state.data.orders[group.key]||group.members.map(m=>m.id);
      const items=order.map(id=>group.members.find(m=>m.id===id)).filter(Boolean).map(m=>({...m,label:memberLabel(m)}));
      const panel=element("section",{class:"panel arrange-panel","data-collection-key":group.key});panel.append(text("h2","Arrange / "+sectionLabel(group.section)));
      panel.append(rows(items,id=>{state.selected=state.selected===id?null:id;draw();},()=>{state.data.orders[group.key]=items.map(m=>m.id);},{editable:true}));
      const selected=items.find(m=>m.id===state.selected);
      if(selected){
        const editor=element("div",{class:"item-editor fields"});editor.append(text("h3","Edit item / "+editorLanguages.find(l=>l.value===state.lang).label));
        for(const key of selected.fieldKeys||[]){const f=byKey.get(key);if(f)editor.append(contentField(page,f,refreshRows));}
        if(!editor.querySelector(".field"))editor.append(text("p","This item has no content in the selected language.","muted"));
        panel.append(editor);
      }
      body.append(panel);
    }
    const list=element("div",{class:"fields"});let section;
    for(const f of matched){if(f.section!==section){section=f.section;list.append(text("h2",sectionLabel(section)));}list.append(contentField(page,f,refreshRows));}
    if(!matched.length)list.append(text("p","No matching content in this language. Try another search or choose All content.","empty"));
    body.append(list);
  };
  search.addEventListener("input",draw);draw();
}
function websiteEditor(main){
  main.append(...heading("Website content","Edit shared wording and links across the website. Use Pages for text that belongs to one page."));
  const groups=new Map();
  for(const page of state.catalog.pages)for(const f of page.fields.filter(availableInLanguage)){
    if(f.value.length<2)continue;
    const key=(f.attribute||"text")+":"+f.value;
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push({page,f});
  }
  const shared=[...groups.values()].filter(g=>new Set(g.map(x=>x.page.id)).size>1);
  const toolbar=element("div",{class:"toolbar"});
  toolbar.append(languageEditor());
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
let previewPage,previewTimer;
function sendPreview(){if(previewPage&&$("#preview-dialog").open)$("#preview-frame").contentWindow.postMessage({type:"noor-cms-preview",data:state.data,page:previewPage.id},state.session.siteOrigin);}
window.addEventListener("message",event=>{
  if(!previewPage||event.origin!==state.session?.siteOrigin||event.source!==$("#preview-frame").contentWindow||event.data?.page!==previewPage.id)return;
  if(event.data.type==="noor-cms-preview-ready")sendPreview();
  if(event.data.type==="noor-cms-preview-applied"){
    clearTimeout(previewTimer);$("#preview-status").textContent="Your current "+editorLanguages.find(l=>l.value===state.lang).label.replace(" editor","")+" edits are shown here, including unsaved changes.";
  }
});
$("#preview").addEventListener("click",()=>{
  const p=state.view.startsWith("page:")?state.catalog.pages.find(p=>"page:"+p.id===state.view):state.catalog.pages.find(p=>p.route===(state.view==="photos"?"/photos/":state.view==="piano"?"/piano/":"/"));
  const url=new URL(p.route,state.session.siteOrigin);url.searchParams.set("cms-preview","1");url.searchParams.set("lang",state.lang);
  previewPage=p;clearTimeout(previewTimer);$("#preview-status").textContent="Loading your current edits…";
  const frame=$("#preview-frame");frame.onload=sendPreview;frame.src=url.href;$("#preview-dialog").showModal();
  previewTimer=setTimeout(()=>{$("#preview-status").textContent="The preview hasn’t confirmed your edits yet. Close it and try Preview again.";},15000);
});
$("#close-preview").addEventListener("click",()=>$("#preview-dialog").close());
$("#preview-dialog").addEventListener("close",()=>{previewPage=null;clearTimeout(previewTimer);$("#preview-frame").onload=null;$("#preview-frame").src="about:blank";});
$("#close-media").addEventListener("click",()=>$("#media-dialog").close());
$("#media-search").addEventListener("input",renderChoices);
$("#mobile-nav").addEventListener("change",event=>navigate(event.target.value));
window.addEventListener("beforeunload",event=>{if(state.dirty){event.preventDefault();event.returnValue="";}});
try{
  state.session=await api("session");const loaded=await api("content");Object.assign(state,loaded);
  $("#save-state").textContent="Owner session verified";ready();navigation();render();
}catch(error){$("#workspace").replaceChildren(...heading("Sign-in required",error.message),element("a",{href:"/admin",text:"Sign in again ↗"}));$("#save-state").textContent="Editing is locked";}
