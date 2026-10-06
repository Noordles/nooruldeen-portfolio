"""Write the publishing credential for Wrangler. Never print secret values."""
import json, os, sys
from pathlib import Path
destination=Path(__file__).resolve().parents[1]/"admin/service/.secrets.json"
if "--clear" in sys.argv:
    destination.unlink(missing_ok=True)
    raise SystemExit(0)
key=os.environ.get("CMS_GITHUB_PRIVATE_KEY","")
token=os.environ.get("CMS_GITHUB_TOKEN","")
if key and token: raise SystemExit("Configure one publishing credential, not both")
if not key and not token: raise SystemExit("A GitHub App private key or restricted publishing token is required")
if key and (not os.environ.get("CMS_GITHUB_APP_ID") or not os.environ.get("CMS_GITHUB_INSTALLATION_ID")):
    raise SystemExit("The GitHub App ID and installation ID are required")
flags=os.O_WRONLY|os.O_CREAT|os.O_TRUNC
fd=os.open(destination,flags,0o600)
with os.fdopen(fd,"w",encoding="utf-8") as file:
    json.dump({"GITHUB_PRIVATE_KEY":key} if key else {"GITHUB_TOKEN":token},file)
print("Prepared the temporary server credential deployment input.")
