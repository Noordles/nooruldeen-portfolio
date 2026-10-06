
export class InputError extends Error {}
export const assert=(condition,message)=>{if(!condition) throw new InputError(message);};
const plain=o=>o!==null && typeof o==="object" && !Array.isArray(o) && Object.getPrototypeOf(o)===Object.prototype;
export function text(v,max=20000) { assert(typeof v==="string" && v.length<=max && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v),"Invalid text"); return v; }
export function safeUrl(value) {
  if(typeof value!=="string" || value.length>2048 || /[\x00-\x20\\]/.test(value) || value.startsWith("//")) return false;
  if(!value) return true;
  try {
    const u=new URL(value,"https://nooruldeen.com/");
    if(u.username || u.password) return false;
    const scheme=/^[a-z][a-z0-9+.-]*:/i.test(value);
    return scheme?["https:","http:","mailto:","tel:"].includes(u.protocol):!value.split(/[?#]/)[0].split("/").includes("..");
  } catch{return false;}
}
export function validateDocument(input,catalog,env) {
  assert(plain(input) && input.version===1,"Unsupported content format");
  assert(plain(input.pages) && plain(input.orders),"Invalid page data");
  const out={version:1,pages:{},orders:{},photos:[],piano:[],adminOrigin:env.ADMIN_ORIGIN};
  const pages=new Map(catalog.pages.map(p=>[p.id,p]));
  for(const [id,values] of Object.entries(input.pages)) {
    assert(pages.has(id) && plain(values),"Unknown page");
    const fields=new Map(pages.get(id).fields.map(f=>[f.key,f]));
    out.pages[id]={};
    for(const [key,langs] of Object.entries(values)) {
      assert(fields.has(key) && plain(langs),"Unknown editable field");
      out.pages[id][key]={};
      for(const [lang,value] of Object.entries(langs)) {
        assert(["en","ro","ar"].includes(lang),"Unknown language");
        text(value);
        if(fields.get(key).kind==="url" || fields.get(key).attribute==="src") assert(safeUrl(value),"Unsafe URL");
        out.pages[id][key][lang]=value;
      }
    }
  }
  const groups=new Map(catalog.pages.flatMap(p=>p.collections).map(g=>[g.key,g]));
  for(const [key,ids] of Object.entries(input.orders)) {
    assert(groups.has(key) && Array.isArray(ids),"Unknown collection");
    const allowed=groups.get(key).members.map(m=>m.id);
    assert(ids.length===allowed.length && new Set(ids).size===ids.length && ids.every(id=>allowed.includes(id)),"Invalid item order");
    out.orders[key]=ids;
  }
  for(const type of ["photos","piano"]) {
    assert(Array.isArray(input[type]) && input[type].length<=1500,"Invalid collection size");
    const ids=new Set();
    for(const raw of input[type]) {
      assert(plain(raw) && /^[a-z0-9][a-z0-9-]{0,79}$/.test(raw.id) && !ids.has(raw.id),"Invalid or duplicate item ID");
      ids.add(raw.id);
      assert(["draft","published","hidden"].includes(raw.status),"Invalid publication status");
      const item={id:raw.id,status:raw.status};
      const fields=type==="photos"?["gallery","title","caption","alt","src","full","viewerCaption"]:["title","composer","description","notes","pieceStatus","difficulty","learnedDate","audio","video","thumbnail","midi","builtin"];
      for(const field of fields) item[field]=text(raw[field]??"",field==="description"||field==="notes"?20000:2048);
      if(raw.translations!==undefined){
        assert(plain(raw.translations),"Invalid collection translations");item.translations={};
        const translatedFields=type==="photos"?["gallery","title","caption","alt","viewerCaption"]:["title","composer","description","notes","pieceStatus","difficulty"];
        for(const [lang,values] of Object.entries(raw.translations)){
          assert(["ro","ar"].includes(lang)&&plain(values),"Invalid translation language");item.translations[lang]={};
          for(const [key,value] of Object.entries(values)){assert(translatedFields.includes(key),"Unknown translated field");item.translations[lang][key]=text(value,key==="description"||key==="notes"?20000:2048);}
        }
      }
      assert(item.title.trim().length>0,"Every item needs a title");
      for(const field of (type==="photos"?["src","full"]:["audio","video","thumbnail","midi"])) assert(safeUrl(item[field]),"Unsafe media URL");
      if(type==="photos"){
        assert(item.src && item.full,"A photograph needs image files");
        assert(Number.isInteger(raw.width)&&Number.isInteger(raw.height)&&raw.width>0&&raw.height>0&&raw.width<=12000&&raw.height<=12000,"Invalid image dimensions");
        item.width=raw.width;item.height=raw.height;
      } else assert(!item.builtin||["melting","baghdad","obor","three-cities"].includes(item.builtin),"Unknown built-in piano performance");
      out[type].push(item);
    }
  }
  assert(JSON.stringify(out).length<=1800000,"Content is too large");
  return out;
}
export const publishedDocument=doc=>({...doc,photos:doc.photos.filter(x=>x.status==="published"),piano:doc.piano.filter(x=>x.status==="published")});
export const mediaUses=(doc,id)=> {
  const result=[];
  for(const [page,values] of Object.entries(doc?.pages??{})) if(JSON.stringify(values).includes("/media/"+id+"/")) result.push(page);
  for(const type of ["photos","piano"]) for(const item of doc?.[type]??[]) if(JSON.stringify(item).includes("/media/"+id+"/")) result.push(type+": "+item.title);
  return result;
};
export function inspectMedia(bytes,type) {
  const a=new Uint8Array(bytes),view=new DataView(bytes);
  const match=(offset,s)=>[...s].every((ch,i)=>a[offset+i]===ch.charCodeAt(0));
  assert(a.length>12,"Empty or invalid file");
  if(type==="image/png"){
    assert(a.length>=24&&a[0]===137&&match(1,"PNG\r\n\x1a\n")&&match(12,"IHDR"),"PNG signature mismatch");
    return {width:view.getUint32(16),height:view.getUint32(20)};
  }
  if(type==="image/webp"){
    assert(match(0,"RIFF")&&match(8,"WEBP"),"WebP signature mismatch");
    if(match(12,"VP8X")&&a.length>=30) return {width:1+a[24]+(a[25]<<8)+(a[26]<<16),height:1+a[27]+(a[28]<<8)+(a[29]<<16)};
    if(match(12,"VP8 ")&&a.length>30&&a[23]===157&&a[24]===1&&a[25]===42) return {width:view.getUint16(26,true)&16383,height:view.getUint16(28,true)&16383};
    if(match(12,"VP8L")&&a[20]===47&&a.length>25) {
      const bits=view.getUint32(21,true);return {width:(bits&16383)+1,height:((bits>>>14)&16383)+1};
    }
    throw new InputError("Unsupported WebP encoding");
  }
  if(type==="image/jpeg"){
    assert(a[0]===255&&a[1]===216,"JPEG signature mismatch");
    let i=2;
    while(i+9<a.length){
      if(a[i]!==255){i++;continue;}
      const marker=a[i+1];i+=2;
      if(marker===216||marker===217) continue;
      const size=view.getUint16(i);
      assert(size>=2&&i+size<=a.length,"Invalid JPEG data");
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) return {height:view.getUint16(i+3),width:view.getUint16(i+5)};
      i+=size;
    }
    throw new InputError("JPEG dimensions missing");
  }
  if(type==="audio/mpeg"){assert(match(0,"ID3")||(a[0]===255&&(a[1]&224)===224),"MP3 signature mismatch");return {};}
  if(type==="audio/wav"){assert(match(0,"RIFF")&&match(8,"WAVE"),"WAV signature mismatch");return {};}
  if(type==="audio/midi"){assert(a.length>=14&&match(0,"MThd")&&view.getUint32(4)===6,"MIDI signature mismatch");return {};}
  throw new InputError("Use JPEG, PNG, WebP, MP3, WAV or MIDI files");
}
