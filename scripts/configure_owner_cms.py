"""Generate deployment settings from private CI/local environment variables."""
import json, os, re
from pathlib import Path
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parents[1]
def required(name):
    value=os.environ.get(name, "").strip()
    if not value: raise SystemExit("Missing deployment setting: " + name)
    return value
def origin(name, default):
    value=os.environ.get(name,default).rstrip("/")
    url=urlsplit(value)
    if url.scheme!="https" or not url.hostname or url.path or url.query or url.fragment or url.username or url.password:
        raise SystemExit(name+" must be an HTTPS origin")
    return value
def main():
    config=json.loads((ROOT/"admin/service/wrangler.jsonc").read_text("utf-8"))
    account=required("CLOUDFLARE_ACCOUNT_ID")
    database=required("CMS_D1_DATABASE_ID")
    team=required("CMS_ACCESS_TEAM_DOMAIN")
    aud=required("CMS_ACCESS_AUD")
    email=required("CMS_OWNER_EMAIL")
    if not re.fullmatch(r"[a-f0-9]{32}",account): raise SystemExit("Invalid Cloudflare account ID")
    if not re.fullmatch(r"[a-f0-9-]{36}",database) or database=="00000000-0000-0000-0000-000000000000": raise SystemExit("Invalid D1 database ID")
    if not re.fullmatch(r"[a-z0-9-]+\.cloudflareaccess\.com",team): raise SystemExit("Use the Access team hostname, without https://")
    if not re.fullmatch(r"[a-zA-Z0-9_-]{20,200}",aud): raise SystemExit("Invalid Access application audience")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+",email): raise SystemExit("Invalid owner email")
    admin=origin("CMS_ADMIN_ORIGIN","https://admin.nooruldeen.com")
    config["account_id"]=account
    config["routes"]=[{"pattern":urlsplit(admin).hostname,"custom_domain":True}]
    config["d1_databases"][0]["database_id"]=database
    config["r2_buckets"][0]["bucket_name"]=os.environ.get("CMS_R2_BUCKET","noor-owner-cms-media")
    config["vars"].update({
        "ADMIN_ORIGIN":admin,"PUBLIC_SITE_ORIGIN":origin("CMS_PUBLIC_SITE_ORIGIN","https://nooruldeen.com"),
        "ACCESS_TEAM_DOMAIN":team,"ACCESS_AUD":aud,"OWNER_EMAIL":email,"OWNER_SUB":os.environ.get("CMS_OWNER_SUB",""),
        "GITHUB_APP_ID":os.environ.get("CMS_GITHUB_APP_ID",""),"GITHUB_INSTALLATION_ID":os.environ.get("CMS_GITHUB_INSTALLATION_ID","")
    })
    destination=ROOT/"admin/service/wrangler.production.json"
    destination.write_text(json.dumps(config,indent=2)+"\n","utf-8")
    print("Generated owner CMS deployment settings. No secrets were written.")
if __name__=="__main__": main()
