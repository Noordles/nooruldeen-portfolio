
const cache = new Map();
const decode = s => {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) throw new Error("Invalid token");
  return Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"=")), c=>c.charCodeAt(0));
};
export async function verifyOwner(request, env, get = fetch) {
  const token=request.headers.get("Cf-Access-Jwt-Assertion") || (request.headers.get("Cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith("CF_Authorization="))?.slice(17);
  if (!env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || !env.OWNER_EMAIL) throw new Error("Authentication is not configured");
  const issuer="https://"+env.ACCESS_TEAM_DOMAIN;
  if (!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)) throw new Error("Invalid issuer configuration");
  if (!token || token.length>8192) return null;
  try {
    const parts=token.split(".");
    if(parts.length!==3) return null;
    const header=JSON.parse(new TextDecoder().decode(decode(parts[0])));
    const claims=JSON.parse(new TextDecoder().decode(decode(parts[1])));
    const now=Math.floor(Date.now()/1000);
    if(header.alg!=="RS256" || typeof header.kid!=="string" || header.kid.length>150) return null;
    if(claims.iss!==issuer || !Number.isFinite(claims.exp) || claims.exp<=now || (claims.nbf && claims.nbf>now+30)) return null;
    const aud=Array.isArray(claims.aud)?claims.aud:[claims.aud];
    if(!aud.includes(env.ACCESS_AUD) || typeof claims.sub!=="string" || !claims.sub) return null;
    if(typeof claims.email!=="string" || claims.email.toLowerCase()!==env.OWNER_EMAIL.toLowerCase()) return null;
    if(env.OWNER_SUB && claims.sub!==env.OWNER_SUB) return null;
    let keys=cache.get(issuer);
    if(!keys || keys.until<Date.now() || !keys.keys.some(k=>k.kid===header.kid)) {
      const response=await get(issuer+"/cdn-cgi/access/certs");
      if(!response.ok) return null;
      const data=await response.json();
      if(!Array.isArray(data.keys)) return null;
      keys={keys:data.keys,until:Date.now()+300000}; cache.set(issuer,keys);
    }
    const jwk=keys.keys.find(k=>k.kid===header.kid && k.kty==="RSA");
    if(!jwk) return null;
    const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
    const valid=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,decode(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1]));
    return valid?{email:claims.email,sub:claims.sub}:null;
  } catch { return null; }
}
export function validMutation(request, env) {
  return request.headers.get("Origin")===env.ADMIN_ORIGIN &&
    request.headers.get("X-CMS-Request")==="1" &&
    request.headers.get("Sec-Fetch-Site")!=="cross-site";
}
