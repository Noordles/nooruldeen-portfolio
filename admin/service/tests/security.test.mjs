
import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
globalThis.crypto=webcrypto;
import {verifyOwner,validMutation} from "../auth.mjs";
import {handle} from "../worker.mjs";
import {safeUrl,validateDocument,publishedDocument,inspectMedia,mediaUses} from "../validation.mjs";
const pair=await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
const jwk=await crypto.subtle.exportKey("jwk",pair.publicKey);jwk.kid="test-key";
const env={ACCESS_TEAM_DOMAIN:"noor-test.cloudflareaccess.com",ACCESS_AUD:"test-audience",OWNER_EMAIL:"owner@example.com",ADMIN_ORIGIN:"https://admin.nooruldeen.com",PUBLIC_SITE_ORIGIN:"https://nooruldeen.com"};
const b64=b=>Buffer.from(b).toString("base64url");
const claims={iss:"https://"+env.ACCESS_TEAM_DOMAIN,aud:[env.ACCESS_AUD],email:env.OWNER_EMAIL,sub:"owner-id",exp:Math.floor(Date.now()/1000)+600};
const keyFetch=async()=>new Response(JSON.stringify({keys:[jwk]}),{headers:{"Content-Type":"application/json"}});
async function token(overrides={},head={}){
  const input=b64(JSON.stringify({alg:"RS256",kid:jwk.kid,...head}))+"."+b64(JSON.stringify({...claims,...overrides}));
  return input+"."+b64(await crypto.subtle.sign("RSASSA-PKCS1-v1_5",pair.privateKey,new TextEncoder().encode(input)));
}
const request=jwt=>new Request(env.ADMIN_ORIGIN+"/api/content",{headers:jwt?{"Cf-Access-Jwt-Assertion":jwt}:{}});
test("only a valid signed owner token is accepted",async()=>assert.equal((await verifyOwner(request(await token()),env,keyFetch)).sub,"owner-id"));
for(const [name,change] of Object.entries({expired:{exp:1},wrongOwner:{email:"visitor@example.com"},wrongAudience:{aud:["other"]},wrongIssuer:{iss:"https://attacker.test"},future:{nbf:Math.floor(Date.now()/1000)+600},missingSubject:{sub:""}})){
  test("reject "+name,async()=>assert.equal(await verifyOwner(request(await token(change)),env,keyFetch),null));
}
test("reject algorithm confusion",async()=>assert.equal(await verifyOwner(request(await token({}, {alg:"none"})),env,keyFetch),null));
test("reject tampering",async()=>{
  const parts=(await token()).split(".");parts[1]=b64(JSON.stringify({...claims,email:"visitor@example.com"}));
  assert.equal(await verifyOwner(request(parts.join(".")),env,keyFetch),null);
});
test("reject missing authentication",async()=>assert.equal(await verifyOwner(request(),env,keyFetch),null));
test("signed Access cookie can authorize private media",async()=>{
  const r=new Request(env.ADMIN_ORIGIN+"/media/x/original",{headers:{Cookie:"other=1; CF_Authorization="+await token()}});
  assert.equal((await verifyOwner(r,env,keyFetch)).sub,"owner-id");
});
test("missing auth configuration fails closed",async()=>assert.rejects(()=>verifyOwner(request(),{},keyFetch)));
test("owner subject pin is enforced",async()=>assert.equal(await verifyOwner(request(await token()),{...env,OWNER_SUB:"different"},keyFetch),null));
test("forged admin requests cannot reach database or assets",async()=>{
  const dependencies={...env,DB:{prepare(){throw new Error("database reached");}},ASSETS:{fetch(){throw new Error("assets reached");}}};
  const r=await handle(request("forged.token.value"),dependencies);assert.equal(r.status,401);
});
test("mutations require both matching Origin and custom request header",()=>{
  const opts={method:"POST",headers:{Origin:env.ADMIN_ORIGIN,"X-CMS-Request":"1"}};
  assert.equal(validMutation(new Request(env.ADMIN_ORIGIN+"/api/publish",opts),env),true);
  assert.equal(validMutation(new Request(env.ADMIN_ORIGIN+"/api/publish",{...opts,headers:{Origin:"https://attacker.test","X-CMS-Request":"1"}}),env),false);
  assert.equal(validMutation(new Request(env.ADMIN_ORIGIN+"/api/publish",{method:"POST",headers:{Origin:env.ADMIN_ORIGIN}}),env),false);
});
for(const value of ["javascript:alert(1)","data:text/html,<script>","file:///secret","//attacker.test","../secret","https://user:pass@attacker.test","/ok\\bad"]){
  test("reject unsafe URL "+value,()=>assert.equal(safeUrl(value),false));
}
test("normal website and external links are allowed",()=>{
  for(const value of ["/design/","#about","assets/a.webp","https://example.com/report","mailto:noor@example.com","tel:+401234"])assert.equal(safeUrl(value),true);
});
const catalog={pages:[{id:"home/index.html",fields:[{key:"a:0",kind:"text"},{key:"a@href",kind:"url"}],collections:[{key:"list",members:[{id:"a"},{id:"b"}]}]}]};
const initial={version:1,pages:{},orders:{},photos:[],piano:[]};
test("unknown fields, pages and order members are rejected",()=>{
  assert.throws(()=>validateDocument({...initial,pages:{"unknown":{}}},catalog,env));
  assert.throws(()=>validateDocument({...initial,pages:{"home/index.html":{unknown:{en:"text"}}}},catalog,env));
  assert.throws(()=>validateDocument({...initial,orders:{list:["a","a"]}},catalog,env));
});
test("script links and invalid languages are rejected",()=>{
  assert.throws(()=>validateDocument({...initial,pages:{"home/index.html":{"a@href":{en:"javascript:alert(1)"}}}},catalog,env));
  assert.throws(()=>validateDocument({...initial,pages:{"home/index.html":{"a:0":{fr:"text"}}}},catalog,env));
});
test("draft and hidden items never enter published payload",()=>{
  const doc={...initial,photos:[{id:"a",status:"draft"},{id:"b",status:"published"}],piano:[{id:"x",status:"hidden"}]};
  assert.deepEqual(publishedDocument(doc).photos,[{id:"b",status:"published"}]);assert.deepEqual(publishedDocument(doc).piano,[]);
});
test("media references in pages and collections prevent deletion",()=>{
  const id="00000000-0000-4000-8000-000000000000",url="https://admin.nooruldeen.com/media/"+id+"/full";
  const doc={pages:{"home/index.html":{"a@href":{en:url}}},photos:[{title:"Photograph",full:url}],piano:[]};
  assert.equal(mediaUses(doc,id).length,2);
});
test("unsupported and spoofed uploads are rejected",()=>{
  const svg=new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>').buffer;
  assert.throws(()=>inspectMedia(svg,"image/svg+xml"));
  assert.throws(()=>inspectMedia(svg,"image/png"));
  assert.throws(()=>inspectMedia(svg,"image/jpeg"));
  assert.throws(()=>inspectMedia(new Uint8Array(4).buffer,"audio/mpeg"));
});
test("PNG dimensions are read from binary header",()=>{
  const png=new Uint8Array(40);png.set([137,80,78,71,13,10,26,10]);png.set(new TextEncoder().encode("IHDR"),12);const v=new DataView(png.buffer);v.setUint32(16,1600);v.setUint32(20,900);
  assert.deepEqual(inspectMedia(png.buffer,"image/png"),{width:1600,height:900});
});
