#!/usr/bin/env python3
"""Build the static portfolio into dist/ using only Python's standard library."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "dist"
PUBLISHED_DIRECTORIES = ("assets", "research-assets")
ROOT_SUFFIXES = {".html", ".css", ".js", ".svg", ".ico", ".webmanifest"}


def fail(message: str) -> int:
    print(message, file=sys.stderr)
    return 1


def main() -> int:
    if OUTPUT.is_symlink():
        return fail(f"Refusing to replace a symbolic link: {OUTPUT}")
    if OUTPUT.exists() and not OUTPUT.is_dir():
        return fail(f"Build destination is not a directory: {OUTPUT}")

    required = [ROOT / "index.html", ROOT / "CNAME"]
    required.extend(ROOT / name for name in PUBLISHED_DIRECTORIES)
    missing = [str(path.relative_to(ROOT)) for path in required if not path.exists()]
    if missing:
        return fail("Required site input is missing: " + ", ".join(missing))

    inputs = [path for path in ROOT.iterdir() if path.is_file() and path.suffix.lower() in ROOT_SUFFIXES]
    if not any(path.name.lower() == "index.html" for path in inputs):
        return fail("The site entry page index.html is missing.")

    for directory in PUBLISHED_DIRECTORIES:
        source = ROOT / directory
        if not source.is_dir():
            return fail(f"Required site input is not a directory: {directory}")
        if any(path.is_symlink() for path in source.rglob("*")):
            return fail(f"Symbolic links are not allowed in published input: {directory}")

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()

    for source in sorted(inputs, key=lambda item: item.name.lower()):
        shutil.copy2(source, OUTPUT / source.name)
    for directory in PUBLISHED_DIRECTORIES:
        shutil.copytree(ROOT / directory, OUTPUT / directory)
    shutil.copy2(ROOT / "CNAME", OUTPUT / "CNAME")
    (OUTPUT / ".nojekyll").touch()

    print(f"Built {len(inputs)} root site files and {len(PUBLISHED_DIRECTORIES)} asset folders in {OUTPUT}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
