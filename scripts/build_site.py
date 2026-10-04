#!/usr/bin/env python3
"""Assemble the organized source folders into a flat static site for GitHub Pages."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist"
PAGE_ROOT = ROOT / "pages"
STYLE_SOURCE = ROOT / "styles" / "site.css"
BROWSER_SCRIPT_ROOT = ROOT / "scripts" / "browser"
ASSET_DIRECTORIES = ("assets", "research-assets")
INPUT_DIRECTORIES = ("pages", "styles", "scripts/browser", *ASSET_DIRECTORIES)


def fail(message: str) -> int:
    print(message, file=sys.stderr)
    return 1


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
        return fail("Page filenames must be unique because published routes stay at the site root.")
    if len({path.name.lower() for path in scripts}) != len(scripts):
        return fail("Browser script filenames must be unique because they publish at the site root.")

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()

    for source in pages:
        shutil.copy2(source, OUTPUT / source.name)
    shutil.copy2(STYLE_SOURCE, OUTPUT / "styles.css")
    for source in scripts:
        shutil.copy2(source, OUTPUT / source.name)
    for directory in ASSET_DIRECTORIES:
        shutil.copytree(ROOT / directory, OUTPUT / directory)
    shutil.copy2(ROOT / "CNAME", OUTPUT / "CNAME")
    (OUTPUT / ".nojekyll").touch()

    print(
        f"Built {len(pages)} pages, one stylesheet, {len(scripts)} browser scripts, "
        f"and {len(ASSET_DIRECTORIES)} asset folders in {OUTPUT}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
