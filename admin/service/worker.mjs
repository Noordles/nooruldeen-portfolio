
import {verifyOwner,validMutation} from "./auth.mjs";
import {InputError,assert,text,validateDocument,publishedDocument,mediaUses,inspectMedia} from "./validation.mjs";
import {publish,github} from "./github.mjs";
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});
const no=(status,message)=>json({error:message},status);
const security=(response,env,isMedia=false)=>{
  const headers=new Headers(response.headers);
  headers.set("X-Content-Type-Options","nosniff");
  headers.set("Referrer-Policy","same-origin");
  if(!isMedia){
    headers.set("Cache-Control","no-store");
    headers.set("X-Frame-Options","DENY");
    headers.set("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: "+env.PUBLIC_SITE_ORIGIN+"; connect-src 'self'; frame-src "+env.PUBLIC_SITE_ORIGIN+"; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'");
  }
  return new Response(response.body,{status:response.status,headers});
};
async function assetJson(env,name){
  const response=await env.ASSETS.fetch(new Request("https://assets.internal/"+name));
  if(!response.ok) throw new Error("The content catalog is missing");
  return response.json();
}
async function document(env,id){
  return env.DB.prepare("SELECT * FROM documents WHERE id=?").bind(id).first();
}
async function seed(env){
  const current=await document(env,"draft");
  if(current) return current;
  const initial=await assetJson(env,"initial-content.json");
  initial.adminOrigin=env.ADMIN_ORIGIN;
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO documents (id,body,revision) VALUES ('draft',?,1)").bind(JSON.stringify(initial)),
    env.DB.prepare("INSERT OR IGNORE INTO documents (id,body,revision) VALUES ('published',?,1)").bind(JSON.stringify(publishedDocument(initial)))
  ]);
  return document(env,"draft");
}
async function bodyJson(request){
  if(!(request.headers.get("Content-Type")||"").startsWith("application/json")) throw new InputError("Use JSON");
  const reader=request.body?.getReader();
  if(!reader) throw new InputError("Request body missing");
  let size=0,parts=[];
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>1900000){await reader.cancel();throw new InputError("Content is too large");}parts.push(value);}
  const buffer=new Uint8Array(size);let offset=0;for(const part of parts){buffer.set(part,offset);offset+=part.length;}
  try{return JSON.parse(new TextDecoder().decode(buffer));}catch{throw new InputError("Invalid JSON");}
}
async function audit(env,owner,action,details){
  await env.DB.prepare("INSERT INTO audit(owner,action,details) VALUES (?,?,?)").bind(owner.sub,action,JSON.stringify(details)).run();
}
const metadata=row=>({id:row.id,filename:row.filename,kind:row.kind,public:Boolean(row.public),createdAt:row.created_at,...JSON.parse(row.metadata)});
async function library(env,draft,pub){
  const {results}=await env.DB.prepare("SELECT * FROM media ORDER BY created_at DESC").all();
  return results.map(r=>({...metadata(r),uses:[...new Set([...mediaUses(draft,r.id),...mediaUses(pub,r.id)])]}));
}
async function serveMedia(request,env,path){
  const match=path.match(/^\/media\/([a-f0-9-]{36})\/(thumb|full|original)$/);
  if(!match || !["GET","HEAD"].includes(request.method)) return no(404,"Media not found");
  const [,id,variant]=match;
  const row=await env.DB.prepare("SELECT * FROM media WHERE id=?").bind(id).first();
  if(!row) return no(404,"Media not found");
  const publicFile=row.public && variant!=="original";
  if(!publicFile && !await verifyOwner(request,env)) return no(404,"Media not found");
  const record=metadata(row),entry=record.variants[variant];
  if(!entry) return no(404,"Media not found");
  const object=await env.MEDIA.get(id+"/"+variant);
  if(!object) return no(404,"Media not found");
  const headers=new Headers({"Content-Type":entry.type,"Cache-Control":publicFile?"public, max-age=86400":"private, no-store","ETag":object.httpEtag,"X-Content-Type-Options":"nosniff","Content-Disposition":"inline; filename="+JSON.stringify(record.filename.replace(/[^\w.-]/g,"_"))});
  if(request.headers.get("Origin")===env.PUBLIC_SITE_ORIGIN){headers.set("Access-Control-Allow-Origin",env.PUBLIC_SITE_ORIGIN);headers.set("Access-Control-Allow-Credentials","true");headers.set("Vary","Origin");}
  if(request.headers.get("If-None-Match")===object.httpEtag)return new Response(null,{status:304,headers});
  return new Response(request.method==="HEAD"?null:object.body,{headers});
}
async function upload(request,env,owner){
  assert((request.headers.get("Content-Type")||"").startsWith("multipart/form-data"),"Use a file upload form");
  assert(Number(request.headers.get("Content-Length")||0)<=37000000,"Upload exceeds 35 MB");
  const form=await request.formData(),original=form.get("original");
  assert(original && typeof original.arrayBuffer==="function","Choose a file");
  const kind=original.type.startsWith("image/")?"image":"audio";
  const hashBytes=await original.arrayBuffer();
  assert(hashBytes.byteLength<=25000000,"Original files must be 25 MB or smaller");
  const dimensions=inspectMedia(hashBytes,original.type);
  if(kind==="image")assert(dimensions.width>0&&dimensions.height>0&&dimensions.width<=12000&&dimensions.height<=12000&&dimensions.width*dimensions.height<=80000000,"Image dimensions are too large");
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",hashBytes)),x=>x.toString(16).padStart(2,"0")).join("");
  const duplicate=await env.DB.prepare("SELECT * FROM media WHERE json_extract(metadata,'$.hash')=?").bind(hash).first();
  if(duplicate)return json({media:metadata(duplicate),duplicate:true});
  const id=crypto.randomUUID(),variants={};
  const buffers={original:hashBytes};
  const files={original};
  if(kind==="image"){
    for(const variant of ["thumb","full"]){
      const file=form.get(variant);
      assert(file && typeof file.arrayBuffer==="function" && ["image/jpeg","image/png","image/webp"].includes(file.type),"Optimized image missing");
      const bytes=await file.arrayBuffer();
      assert(bytes.byteLength<=(variant==="thumb"?2000000:8000000),"Optimized image is too large");
      const info=inspectMedia(bytes,file.type);
      assert(info.width>0&&info.height>0&&info.width<=3000&&info.height<=12000&&info.width*info.height<=16000000,"Invalid optimized dimensions");
      buffers[variant]=bytes;files[variant]=file;
      variants[variant]={type:file.type,size:bytes.byteLength,width:info.width,height:info.height};
    }
  } else {buffers.full=hashBytes;files.full=original;}
  variants.original={type:original.type,size:hashBytes.byteLength,...dimensions};
  if(kind==="audio")variants.full={...variants.original};
  const record={hash,variants,title:text(form.get("title")||original.name,2048),alt:text(form.get("alt")||"",2048)};
  try{
    for(const [variant,bytes] of Object.entries(buffers))await env.MEDIA.put(id+"/"+variant,bytes,{httpMetadata:{contentType:files[variant].type}});
    await env.DB.prepare("INSERT INTO media(id,filename,kind,metadata) VALUES (?,?,?,?)").bind(id,original.name.slice(0,200),kind,JSON.stringify(record)).run();
  }catch(e){await env.MEDIA.delete(Object.keys(buffers).map(v=>id+"/"+v));throw e;}
  await audit(env,owner,"upload",{id,kind});
  return json({media:{id,filename:original.name,kind,public:false,...record}},201);
}
export async function handle(request,env){
  const url=new URL(request.url),path=url.pathname;
  if(path.startsWith("/media/"))return serveMedia(request,env,path);
  const owner=await verifyOwner(request,env);
  if(!owner)return no(401,"Owner sign-in is required");
  if(url.origin!==env.ADMIN_ORIGIN)return no(403,"Use the configured admin address");
  if(!["GET","HEAD"].includes(request.method)&&!validMutation(request,env))return no(403,"Request origin could not be verified");
  if(path==="/api/session")return json({owner:{email:owner.email},siteOrigin:env.PUBLIC_SITE_ORIGIN,adminOrigin:env.ADMIN_ORIGIN});
  if(path==="/api/content" && request.method==="GET"){
    const draft=await seed(env),pub=await document(env,"published");
    return json({revision:draft.revision,data:JSON.parse(draft.body),catalog:await assetJson(env,"catalog.json"),media:await library(env,JSON.parse(draft.body),pub?JSON.parse(pub.body):{}),publishedRevision:pub?.revision??0});
  }
  if(path==="/api/draft"&&request.method==="PUT"){
    const input=await bodyJson(request);
    assert(Number.isInteger(input.revision),"A revision is required");
    const validated=validateDocument(input.data,await assetJson(env,"catalog.json"),env);
    const result=await env.DB.prepare("UPDATE documents SET body=?,revision=revision+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id='draft' AND revision=?").bind(JSON.stringify(validated),input.revision).run();
    if(!result.meta.changes)return no(409,"This draft changed in another tab. Reload before saving.");
    await audit(env,owner,"save",{revision:input.revision+1});
    return json({revision:input.revision+1});
  }
  if(path==="/api/publish"&&request.method==="POST"){
    const input=await bodyJson(request),draft=await seed(env);
    if(input.revision!==draft.revision)return no(409,"Save your latest draft before publishing");
    const token=crypto.randomUUID(),now=Date.now();
    const lock=await env.DB.prepare("INSERT INTO publish_lock(id,token,until_ms) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET token=excluded.token,until_ms=excluded.until_ms WHERE publish_lock.until_ms<?").bind(token,now+120000,now).run();
    if(!lock.meta.changes)return no(409,"A publication is already in progress");
    try{
      const data=publishedDocument(validateDocument(JSON.parse(draft.body),await assetJson(env,"catalog.json"),env));
      const released=await publish(env,data,draft.revision);
      const {results:media}=await env.DB.prepare("SELECT id FROM media").all();
      const ids=media.filter(m=>mediaUses(data,m.id).length).map(m=>m.id);
      const operations=[
        env.DB.prepare("INSERT INTO documents(id,body,revision) VALUES('published',?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,revision=excluded.revision,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')").bind(JSON.stringify(data),draft.revision),
        env.DB.prepare("INSERT OR IGNORE INTO releases(sha,revision,commit_url) VALUES(?,?,?)").bind(released.sha,draft.revision,released.url),
        ...ids.map(id=>env.DB.prepare("UPDATE media SET public=1 WHERE id=?").bind(id))
      ];
      await env.DB.batch(operations);
      await audit(env,owner,"publish",{revision:draft.revision,sha:released.sha});
      return json({...released,revision:draft.revision,status:"deploying"});
    }finally{await env.DB.prepare("DELETE FROM publish_lock WHERE token=?").bind(token).run();}
  }
  if(path==="/api/media"&&request.method==="POST")return upload(request,env,owner);
  const mediaMatch=path.match(/^\/api\/media\/([a-f0-9-]{36})$/);
  if(mediaMatch&&request.method==="DELETE"){
    const id=mediaMatch[1],draft=await seed(env),pub=await document(env,"published");
    if(mediaUses(JSON.parse(draft.body),id).length || (pub&&mediaUses(JSON.parse(pub.body),id).length))return no(409,"This media is still used by a draft or a published item");
    const row=await env.DB.prepare("SELECT * FROM media WHERE id=?").bind(id).first();
    if(!row)return no(404,"Media not found");
    await env.MEDIA.delete(Object.keys(metadata(row).variants).map(v=>id+"/"+v));
    await env.DB.prepare("DELETE FROM media WHERE id=?").bind(id).run();
    await audit(env,owner,"delete-media",{id});
    return json({deleted:true});
  }
  if(path==="/api/releases"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT * FROM releases ORDER BY created_at DESC LIMIT 10").all();
    const latest=results[0];
    if(latest){
      const r=await github(env,"actions/runs?head_sha="+latest.sha+"&per_page=5");
      if(r.ok){
        const {workflow_runs}=await r.json();
        latest.runs=workflow_runs.map(r=>({name:r.name,status:r.status,conclusion:r.conclusion,url:r.html_url}));
      }
    }
    return json({releases:results});
  }
  if(path==="/api/audit"&&request.method==="GET"){
    const {results}=await env.DB.prepare("SELECT action,details,created_at FROM audit ORDER BY id DESC LIMIT 30").all();return json({events:results});
  }
  if(path.startsWith("/api/"))return no(404,"Endpoint not found");
  if(request.method!=="GET"&&request.method!=="HEAD")return no(405,"Method not allowed");
  const assetUrl=new URL(request.url);assetUrl.pathname=path==="/"||path==="/admin"||path==="/admin/"?"/index.html":path;
  return env.ASSETS.fetch(new Request(assetUrl,request));
}
export default {
  async fetch(request,env){
    try{return security(await handle(request,env),env,new URL(request.url).pathname.startsWith("/media/"));}
    catch(error){
      if(error instanceof InputError)return security(no(422,error.message),env);
      console.error("CMS request failed",error.name);
      return security(no(503,"The admin service could not complete this request. Please try again."),env);
    }
  }
};
