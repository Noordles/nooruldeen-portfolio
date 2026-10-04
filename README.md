# Nooruldeen.com

A simple personal website to introduce me and share a little of what I make, study, and enjoy.

I’m Noor, an Economics Informatics student at the Bucharest University of Economic Studies, originally from Baghdad. I’m interested in economic research and visual communication, and I also manage a small retail shop. This site brings together a short introduction, design and development work, research projects, photography, and piano.

## What’s on the site

- **About and selected work:** a quick introduction and a selection of projects.
- **Design and development:** web, identity, and motion work.
- **Research:** projects about Iraq’s economy, migration, regional change, and data.
- **Photography:** a chronological collection of phone photographs.
- **Piano:** a MIDI-led performance of “Melting” and three original sketches.

## How it works

The site is built with plain HTML, CSS, and JavaScript. It has no framework, package manager, database, or application server. GitHub Pages serves the static files using the custom domain in `CNAME`.

The Pages workflow builds a clean `dist/` folder, checks local links and public files, then deploys that folder when changes reach `main`. GitHub Actions are pinned to commit SHAs, and checkout does not persist its token into later steps.

## Build and preview locally

Install Python 3, then run these commands from the repository root:

```powershell
python scripts/build_site.py
python scripts/validate_site.py dist
python -m http.server 8000 --directory dist
```

Open [http://localhost:8000](http://localhost:8000) to preview the built site. The build scripts use only Python’s standard library.

## Repository layout

- `*.html`, `styles.css`, and `*.js`: pages, styles, and browser behavior.
- `assets/`: images, audio, design work, and photography used by the site.
- `research-assets/`: project images and documents linked from research pages.
- `scripts/`: the static-site build and validation scripts.
- `.github/workflows/pages.yml`: build, validate, and deploy the site.
- `CNAME`: the custom domain, `nooruldeen.com`.

## Public files

The GitHub repository and the published website are public. Every committed file can be viewed on GitHub. The build also publishes everything inside `assets/` and `research-assets/`, including files that visitors can download directly. Keep passwords, private keys, personal documents, and anything else you do not want public out of the repository. If a credential is ever committed, revoke it and create a new one; deleting the file later does not remove it from Git history.
