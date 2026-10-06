# Owner CMS deployment and maintenance

## Current state

The public site remains a static GitHub Pages site built with the existing Python build, HTML templates, CSS and browser scripts. The owner service is a separate Cloudflare Worker with Access authentication, D1 and a private R2 bucket. The service is not activated by simply merging this code.

No working owner account, Access application, D1 instance, R2 bucket or production publishing credential is included in the repository. The checked-in configuration deliberately has empty authentication settings and a placeholder database ID. Missing authentication configuration fails closed.

## Files and boundaries

| Location | Purpose |
| --- | --- |
| pages/ and styles/site.css | Existing public layout and visual identity |
| content/published.json | Validated public content overrides, collection order and published photos/piano |
| scripts/cms_content.py | Generates the editable page catalog and integrates content without rebuilding page layouts |
| scripts/browser/cms-runtime.js | Language overrides, private iframe preview and playback for uploaded recordings |
| admin/service/ui/ | Protected mobile-friendly owner interface |
| admin/service/worker.mjs | Owner API, private uploads, media serving and publishing |
| admin/service/auth.mjs | Cloudflare Access JWT signature and owner validation |
| admin/service/validation.mjs | Allowed fields, URLs, statuses and file signatures |
| admin/service/migrations/ | D1 schema |
| .github/workflows/owner-cms-deploy.yml | Opt-in deployment of the owner service |

Every private route and static admin asset passes through the Worker before the asset binding. D1 drafts and audit history are not copied into the public site. R2 originals are private; only referenced optimized variants become public on publication. The public /admin entry redirects to the protected service after its origin has been activated.

## One-time account setup

Use the website owner's Cloudflare account. The admin subdomain must be in an active Cloudflare DNS zone for the custom domain deployment. Keep the apex website's GitHub Pages records intact; the Worker uses only admin.nooruldeen.com. If DNS is elsewhere, agree on that DNS setup before changing nameservers or records.

### 1. Managed owner authentication

If Zero Trust has not been activated in the owner account, select the Free plan for this one-owner service. Its checkout may require a payment method, acceptance of Cloudflare's terms and authorization for usage beyond free limits. The owner must approve those account commitments before activation; do not silently select a paid plan.

Create a Cloudflare Access **self-hosted** application covering **admin.nooruldeen.com** with no path restriction.

- Name: Noor Owner Studio.
- Allow only the exact owner email. Do not use an Everyone allow rule.
- Use a managed identity provider with MFA, or Cloudflare's managed email one-time PIN login.
- Set a short session duration, such as one hour.
- Record the team hostname (for example team.cloudflareaccess.com) and this application's audience tag.
- Optionally pin the owner subject after the first successful login.

Create a second, more specific Access application covering **admin.nooruldeen.com/media/** and its descendants with an Everyone **Bypass** policy. This lets normal visitors load published images/audio. This exception covers only /media/, never /api/media, /api/ or /admin. The Worker itself returns private originals and unpublished media only after independently validating the signed owner cookie/header against the protected application's audience.

Published media variants must load without an Access login; private originals must remain unavailable to a visitor. Access alone is not the media authorization boundary.

References: [Access applications](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/), [validate Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/), [path precedence](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/).

### 2. Database and original-file storage

First check the owner account for an existing **noor-owner-cms** D1 database and **noor-owner-cms-media** R2 bucket. Reuse resources already created for this deployment. The task's local activation record contains the database ID if it was provisioned during implementation.

Using Wrangler authenticated to the owner account, create only missing resources:

```powershell
npx --yes wrangler@4.147.0 login
# Only if the named database does not already exist:
npx --yes wrangler@4.147.0 d1 create noor-owner-cms
# Only if the private bucket does not already exist:
npx --yes wrangler@4.147.0 r2 bucket create noor-owner-cms-media
```

R2 may require activating a usage-billed subscription before a bucket can be created. Review the free allowances and additional usage prices in the owner account, and obtain the owner's approval before accepting its billing terms.

Record the D1 database ID. Keep the R2 bucket private: no r2.dev public access and no public bucket custom domain. The Worker is the only public serving path. No bucket lifecycle rule should delete originals or live derivatives.

References: [D1](https://developers.cloudflare.com/d1/), [R2 Worker bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/).

### 3. Server-side GitHub publishing

Recommended: create a GitHub App owned by the website owner and install it only on Noordles/nooruldeen-portfolio.

- Repository Contents: read and write.
- Repository Actions: read, for deployment status.
- No webhooks or browser OAuth flow is required.
- Generate an App private key and record the App ID and installation ID.
- Store the PEM as an encrypted deployment secret. Both GitHub's downloaded RSA PEM and PKCS8 PEM are supported.

The service exchanges the App key for short-lived installation tokens on the server. The browser never receives the key or installation token.

A fine-grained personal access token restricted to this repository with Contents read/write and Actions read is an optional alternative. Use one credential mode. When switching modes, remove the obsolete Worker credential first. Do not use the workflow's built-in GITHUB_TOKEN as the publishing credential: commits made with that token generally do not trigger a new Pages workflow.

References: [GitHub App installation authentication](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation), [GitHub Actions trigger behavior](https://docs.github.com/en/actions/how-tos/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow).

### 4. Enable the deployment workflow

Create the GitHub environment **owner-cms**, restricted to main. Configure encrypted secrets and variables there, or use equivalent repository settings.

**Secrets**

- CLOUDFLARE_API_TOKEN: deployment token restricted to the selected account/zone and the required Worker, D1, R2 and custom-domain deployment permissions.
- CMS_GITHUB_PRIVATE_KEY: the App PEM, **or** CMS_GITHUB_TOKEN for the restricted token alternative.

**Variables**

- CLOUDFLARE_ACCOUNT_ID
- CMS_D1_DATABASE_ID
- CMS_ACCESS_TEAM_DOMAIN
- CMS_ACCESS_AUD
- CMS_OWNER_EMAIL
- CMS_GITHUB_APP_ID and CMS_GITHUB_INSTALLATION_ID when using an App
- CMS_OWNER_SUB, optional

Set the **repository-level** variable **OWNER_CMS_ENABLED=true** only after the Access policy and private bucket are ready. It controls whether the job starts.

Run **Deploy owner CMS** from Actions on main. The workflow:

1. Validates account settings and generates an ignored production configuration.
2. Generates the private content catalog from every page.
3. Applies D1 migrations.
4. Prepares a restricted temporary credential file.
5. Deploys code and encrypted Worker secrets together.
6. Deletes the temporary credential file even when deployment fails.

The public Pages workflow remains the existing workflow. Secrets do not enter dist, page JSON or browser bundles. Changing a source page deploys an updated admin catalog without replacing the draft stored in D1.

Reference: [Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/), [Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

### 5. Activate the public /admin entry and preview

After merging the CMS integration and deploying the owner service:

1. Sign in directly at https://admin.nooruldeen.com/admin.
2. Confirm all existing photos and four piano pieces are present.
3. Publish the initial draft once. This sets the validated admin origin in the public content document and keeps the default content unchanged.
4. Wait for the existing Pages deployment to succeed.
5. Open https://nooruldeen.com/admin/ and confirm it enters the protected login.
6. Use Preview from a page, then publish a deliberate small wording edit and confirm it on the public site.

Preview depends on the public CMS runtime being deployed and its configured admin origin matching exactly. The public page accepts preview messages only from that origin and its actual parent window. It does not fetch private drafts.

Before declaring production complete, confirm visitor rejection of the interface and APIs, visitor rejection of private originals/drafts, successful phone uploads, draft retention, publication, gallery ordering, and playback/seek of a new recording. Automated checks support those checks; account policy and deployed behavior must be checked live.

## Content architecture

The catalog covers the existing public pages, approved text/attribute fields and contiguous repeated card collections. The original templates remain the visual defaults. Text overrides are stored by page and stable field key; output is escaped. Shared website fields are edited together by matching their original value and attribute.

Photography and piano are structured ordered arrays, with draft/published/hidden status. The public document contains only published items. Global text has a private working draft and a public saved version.

Source code, decorative icons, SVG internals, scripts and preformatted code blocks are excluded from the general editor. Rich HTML is intentionally not accepted. HTML structure remains a developer responsibility.

For future structural template changes, preserve an element's content identity using data-cms-id before moving it or inserting siblings. The generated key includes its text slot or attribute. Keep existing IDs/slots stable, update the catalog, and migrate saved overrides if a field is removed. Adding a page under pages/ adds its editor automatically.

## Media behavior and limits

- JPEG, PNG, WebP originals: 25 MB maximum; dimensions up to 12000 px and 80 million pixels.
- Browser-generated WebP derivatives: up to 900 px and 2600 px on the longer side, quality 0.9; small images are not enlarged.
- Optimized derivative validation: MIME and binary signature, size, dimensions.
- MP3, WAV and MIDI originals are accepted. MP3/WAV play in browser; MIDI is a download.
- SVG, HTML, executables and arbitrary uploads are refused.
- Names are metadata; random UUID keys are used for storage.
- SHA256 duplicates reuse an existing uploaded original.
- Public media supports range requests for playback/seek; originals always require an owner session.
- Published media has a 24-hour cache lifetime. Used media cannot be deleted, and previously published media is retained until a successful later deployment and cache retention period.
- Hidden means omitted from the page. Previously published URLs are not treated as confidential.
- Saving/publishing/deleting media share a write lock. Draft saves also use revision checks to prevent stale-tab overwrites.

## Backups, failure and recovery

The owner UI exports/restores content backups. Download private originals from the library. Also maintain an operational D1 export and R2 backup in the owner account; GitHub version history covers published content only.

A failed Pages deployment leaves the previous live website in place. The dashboard checks the actual Pages workflow, not just the repository commit. Fix the failed build and republish; do not delete old media while that deployment is unresolved.

A missing credential or authentication setting fails closed. Keep the Access team domain/audience and owner identity aligned with the managed application. If access configuration changes, redeploy those server settings. When changing publishing credential modes, delete the old Worker secret before deploying the new one.

Audit entries record saves, publications, uploads and deletions without storing secrets. Keep Worker logs free of request bodies, cookies, PEMs and tokens.

## Local source copy

The task workspace contains the changed implementation files under work/owner-cms. The GitHub branch/PR holds them against the complete current repository. Run the commands above from a full checkout of that branch or merged main, rather than from a folder containing only the changed-file snapshot.
