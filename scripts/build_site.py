#!/usr/bin/env python3
"""Assemble organized source folders into a clean-URL static site."""

from __future__ import annotations

import html
import json
import re
import shutil
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist"
PAGE_ROOT = ROOT / "pages"
STYLE_SOURCE = ROOT / "styles" / "site.css"
BROWSER_SCRIPT_ROOT = ROOT / "scripts" / "browser"
ASSET_DIRECTORIES = ("assets", "research-assets")
INPUT_DIRECTORIES = ("pages", "styles", "scripts/browser", *ASSET_DIRECTORIES)
PUBLIC_SCRIPT_NAMES = {
    "script.js",
    "photos-gallery.js",
    "piano-player.js",
    "piano-melting.js",
    "research-presentation.js",
}
HTML_ATTRIBUTE = re.compile(
    r"""(?P<prefix>\b(?:href|src|poster|action|data-src|data-poster|data-href|srcset)\s*=\s*)(?P<quote>["'])(?P<value>.*?)(?P=quote)""",
    re.IGNORECASE | re.DOTALL,
)


def fail(message: str) -> int:
    print(message, file=sys.stderr)
    return 1


def output_path_for_page(source: Path) -> Path:
    relative = source.relative_to(PAGE_ROOT).as_posix()
    fixed_routes = {
        "home/index.html": Path("index.html"),
        "design/design.html": Path("design/index.html"),
        "design/idrl.html": Path("idrl/index.html"),
        "hobbies/photos.html": Path("photos/index.html"),
        "hobbies/piano.html": Path("piano/index.html"),
        "research/research.html": Path("research/index.html"),
    }
    if relative in fixed_routes:
        return fixed_routes[relative]

    project_prefix = "research/projects/"
    if relative.startswith(project_prefix) and relative.lower().endswith(".html"):
        filename = Path(relative).name
        if not filename.startswith("research-"):
            raise ValueError(f"Research project page needs a research- filename: {relative}")
        slug = filename[len("research-") : -len(".html")]
        if not slug:
            raise ValueError(f"Research project page has an empty route: {relative}")
        return Path("research") / slug / "index.html"

    raise ValueError(f"No public route is defined for page: {relative}")


def public_route(output_path: Path) -> str:
    if output_path.as_posix() == "index.html":
        return "/"
    suffix = "/index.html"
    if not output_path.as_posix().endswith(suffix):
        raise ValueError(f"Page output must end in index.html: {output_path}")
    return "/" + output_path.as_posix()[: -len("index.html")]


def rewrite_url(value: str, page_routes: dict[str, str]) -> str:
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc or value.startswith("//"):
        return value

    raw_path = parsed.path
    path = raw_path[2:] if raw_path.startswith("./") else raw_path
    filename = Path(path).name.lower()
    if filename in page_routes and not path.startswith(("assets/", "research-assets/")):
        route = page_routes[filename]
        return route + (f"?{parsed.query}" if parsed.query else "") + (
            f"#{parsed.fragment}" if parsed.fragment else ""
        )

    if raw_path.startswith("/"):
        return value
    if path.startswith(("assets/", "research-assets/")) or path in PUBLIC_SCRIPT_NAMES | {"styles.css"}:
        return "/" + path + (f"?{parsed.query}" if parsed.query else "") + (
            f"#{parsed.fragment}" if parsed.fragment else ""
        )
    return value


def rewrite_html_references(document: str, page_routes: dict[str, str]) -> str:
    def replace_attribute(match: re.Match[str]) -> str:
        value = match.group("value")
        if match.group("prefix").strip().lower().startswith("srcset"):
            value = re.sub(r"[^\s,]+", lambda item: rewrite_url(item.group(0), page_routes), value)
        else:
            value = rewrite_url(value, page_routes)
        return match.group("prefix") + match.group("quote") + value + match.group("quote")

    return HTML_ATTRIBUTE.sub(replace_attribute, document)


def add_site_metadata(document: str, route: str) -> str:
    additions = []
    if not re.search(r'<link\s+[^>]*rel=["\']canonical["\']', document, re.IGNORECASE):
        additions.append(f'<link rel="canonical" href="https://nooruldeen.com{route}" />')
    if not re.search(r'<link\s+[^>]*rel=["\']icon["\']', document, re.IGNORECASE):
        additions.append('<link rel="icon" type="image/svg+xml" href="/assets/brand/noor-favicon.svg" />')
    if not additions:
        return document
    markup = "\n".join(f"  {item}" for item in additions)
    return re.sub(r"</head\s*>", lambda match: f"{markup}\n{match.group(0)}", document, count=1, flags=re.IGNORECASE)


def add_homepage_alias_redirect(document: str) -> str:
    script = (
        '<script>if (window.location.pathname.toLowerCase() === "/index.html") '
        '{ window.location.replace("/" + window.location.search + window.location.hash); }</script>'
    )
    return re.sub(r"<head(\s[^>]*)?>", lambda match: match.group(0) + "\n  " + script, document, count=1, flags=re.IGNORECASE)


def write_legacy_redirect(destination: Path, route: str, title: str) -> None:
    safe_title = html.escape(title)
    safe_route = html.escape(route, quote=True)
    script_route = json.dumps(route)
    document = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="https://nooruldeen.com{safe_route}" />
    <title>{safe_title}</title>
    <script>window.location.replace({script_route} + window.location.search + window.location.hash);</script>
    <noscript><meta http-equiv="refresh" content="0;url={safe_route}" /></noscript>
  </head>
  <body>
    <p>This page has moved. <a href="{safe_route}">Continue to the clean address</a>.</p>
  </body>
</html>
"""
    destination.write_text(document, encoding="utf-8")


def main() -> int:
    if OUTPUT.is_symlink():
        return fail(f"Refusing to replace a symbolic link: {OUTPUT}")
    if OUTPUT.exists() and not OUTPUT.is_dir():
        return fail(f"Build destination is not a directory: {OUTPUT}")

    required = [
        PAGE_ROOT / "home" / "index.html",
        STYLE_SOURCE,
        BROWSER_SCRIPT_ROOT,
        ROOT / "CNAME",
        *(ROOT / name for name in ASSET_DIRECTORIES),
    ]
    missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]
    if missing:
        return fail("Required site input is missing: " + ", ".join(missing))

    input_roots = [ROOT / name for name in INPUT_DIRECTORIES]
    for directory in input_roots:
        if not directory.is_dir():
            return fail(f"Required input is not a directory: {directory.relative_to(ROOT)}")
        if any(path.is_symlink() for path in directory.rglob("*")):
            return fail(f"Symbolic links are not allowed in site input: {directory.relative_to(ROOT)}")

    pages = sorted(PAGE_ROOT.rglob("*.html"))
    scripts = sorted(BROWSER_SCRIPT_ROOT.rglob("*.js"))
    if not pages:
        return fail("No HTML pages were found under pages/.")
    if not scripts:
        return fail("No browser scripts were found under scripts/browser/.")
    if len({path.name.lower() for path in pages}) != len(pages):
        return fail("Page filenames must be unique so each legacy .html address can redirect.")
    if len({path.name.lower() for path in scripts}) != len(scripts):
        return fail("Browser script filenames must be unique because they publish at the site root.")

    try:
        output_paths = {source: output_path_for_page(source) for source in pages}
    except ValueError as error:
        return fail(str(error))
    if len({path.as_posix().lower() for path in output_paths.values()}) != len(output_paths):
        return fail("Two source pages map to the same clean route.")

    page_routes = {
        source.name.lower(): public_route(output_path)
        for source, output_path in output_paths.items()
    }

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()

    for source, output_path in output_paths.items():
        route = public_route(output_path)
        destination = OUTPUT / output_path
        destination.parent.mkdir(parents=True, exist_ok=True)
        document = source.read_text(encoding="utf-8")
        document = rewrite_html_references(document, page_routes)
        if route == "/":
            document = add_homepage_alias_redirect(document)
        document = add_site_metadata(document, route)
        destination.write_text(document, encoding="utf-8")

        if route != "/":
            title_match = re.search(r"<title[^>]*>(.*?)</title>", document, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1).strip() if title_match else "Al Sammarraie Nooruldeen"
            write_legacy_redirect(OUTPUT / source.name, route, title)

    shutil.copy2(STYLE_SOURCE, OUTPUT / "styles.css")
    for source in scripts:
        script_text = source.read_text(encoding="utf-8")
        script_text = re.sub(
            r"""(?P<quote>["'])(?P<path>(?:\./)?(?:assets|research-assets)/[^"'\s]+)(?P=quote)""",
            lambda match: match.group("quote") + "/" + match.group("path").removeprefix("./") + match.group("quote"),
            script_text,
        )
        shutil.copy2(source, OUTPUT / source.name)
        (OUTPUT / source.name).write_text(script_text, encoding="utf-8")
    for directory in ASSET_DIRECTORIES:
        shutil.copytree(ROOT / directory, OUTPUT / directory)
    shutil.copy2(ROOT / "CNAME", OUTPUT / "CNAME")
    (OUTPUT / ".nojekyll").touch()

    print(
        f"Built {len(pages)} clean-route pages and {len(pages) - 1} legacy redirects, "
        f"one stylesheet, {len(scripts)} browser scripts, and {len(ASSET_DIRECTORIES)} asset folders in {OUTPUT}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
