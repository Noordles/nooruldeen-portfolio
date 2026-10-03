# Nooruldeen.com

Static portfolio website for Al Sammarraie Nooruldeen. The repository root is the site root; there is no build step.

## GitHub Pages

Publish the `main` branch from `/ (root)` in the repository’s Pages settings. The `CNAME` file sets the custom domain to `nooruldeen.com`.

In Cloudflare DNS, point the apex domain at GitHub Pages and point `www` to the account’s `github.io` hostname. Keep any existing mail records, such as MX and TXT records, intact.
