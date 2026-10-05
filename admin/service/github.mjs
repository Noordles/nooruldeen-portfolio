
let installationToken;
const base64url=bytes=>btoa(Array.from({length:Math.ceil(bytes.byteLength/8192)},(_,i)=>String.fromCharCode(...new Uint8Array(bytes).subarray(i*8192,(i+1)*8192))).join("")).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
export async function getToken(env) {
  if(env.GITHUB_TOKEN) return env.GITHUB_TOKEN;
  if(installationToken && installationToken.expires>Date.now()+60000) return installationToken.value;
  if(!env.GITHUB_PRIVATE_KEY||!env.GITHUB_APP_ID||!env.GITHUB_INSTALLATION_ID) throw new Error("Publishing is not configured");
  const encode=o=>base64url(new TextEncoder().encode(JSON.stringify(o)));
  const now=Math.floor(Date.now()/1000);
  const input=encode({alg:"RS256",typ:"JWT"})+"."+encode({iat:now-60,exp:now+540,iss:env.GITHUB_APP_ID});
  const pem=env.GITHUB_PRIVATE_KEY.replace(/\\n/g,"\n").replace(/-----[^-]+-----/g,"").replace(/\s/g,"");
  const bytes=Uint8Array.from(atob(pem),c=>c.charCodeAt(0));
  const key=await crypto.subtle.importKey("pkcs8",bytes,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["sign"]);
  const sig=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(input));
  const r=await fetch("https://api.github.com/app/installations/"+encodeURIComponent(env.GITHUB_INSTALLATION_ID)+"/access_tokens",{method:"POST",headers:{Authorization:"Bearer "+input+"."+base64url(sig),Accept:"application/vnd.github+json","User-Agent":"noor-owner-cms","X-GitHub-Api-Version":"2022-11-28"}});
  if(!r.ok) throw new Error("GitHub installation authentication failed");
  const data=await r.json();
  installationToken={value:data.token,expires:Date.parse(data.expires_at)};
  return data.token;
}
export async function github(env,path,options={}) {
  if(!/^[\w.-]+\/[\w.-]+$/.test(env.GITHUB_REPOSITORY)) throw new Error("Invalid repository configuration");
  const token=await getToken(env);
  return fetch("https://api.github.com/repos/"+env.GITHUB_REPOSITORY+"/"+path,{...options,headers:{Authorization:"Bearer "+token,Accept:"application/vnd.github+json","Content-Type":"application/json","User-Agent":"noor-owner-cms","X-GitHub-Api-Version":"2022-11-28",...options.headers}});
}
export async function published(env) {
  const r=await github(env,"contents/content/published.json?ref="+encodeURIComponent(env.GITHUB_BRANCH||"main"));
  if(r.status===404) return {sha:null,data:null};
  if(!r.ok) throw new Error("Could not read published content");
  const file=await r.json();
  const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,"")),c=>c.charCodeAt(0))));
  return {sha:file.sha,data};
}
export async function publish(env,data,revision) {
  const current=await published(env);
  const payload={message:"Publish owner content revision "+revision,branch:env.GITHUB_BRANCH||"main",content:base64url(new TextEncoder().encode(JSON.stringify(data,null,2)+"\n")).replace(/-/g,"+").replace(/_/g,"/")};
  payload.content=payload.content.padEnd(Math.ceil(payload.content.length/4)*4,"=");
  if(current.sha) payload.sha=current.sha;
  const response=await github(env,"contents/content/published.json",{method:"PUT",body:JSON.stringify(payload)});
  if(!response.ok) throw new Error(response.status===409?"Repository changed during publication; try again":"GitHub publication failed");
  const result=await response.json();
  return {sha:result.commit.sha,url:result.commit.html_url};
}
