#!/usr/bin/env python3
"""Check the built static site for broken local references and private-file types."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

REF_ATTRS = {"href", "src", "poster", "action", "data-src", "data-poster", "data-href"}
CSS_URL = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE | re.DOTALL)
JS_URL = re.compile(
    r"""(?P<q>["'])(?P<url>(?:\.{1,2}/|/)?[^"'\s]+?"""
    + r"""(?:\.html|\.css|\.js|\.svg|\.png|\.jpe?g|\.webp|\.gif|\.mp3|\.midi?|\.wav|\.ogg|\.mp4|\.mov|\.pdf|\.zip|\.docx?|\.pptx?|\.xlsx?|\.aep)(?:[?#][^"']*)?)(?P=q)""",
    re.IGNORECASE,
)
PRIVATE_NAMES = {"known_hosts", "id_rsa", "id_ed25519"}
PRIVATE_SUFFIXES = {".pem", ".p12", ".pfx", ".key"}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str]] = []
        self.ids: set[str] = set()
        self.inline_css: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for key, value in attrs:
            if value is None:
                continue
            lowered = key.lower()
            if lowered in REF_ATTRS:
                self.refs.append((value, f"{tag}[{lowered}]"))
            elif lowered in {"srcset", "data-srcset"}:
                for match in re.finditer(r"(?:^|,)\s*([^\s,]+)", value):
                    self.refs.append((match.group(1), f"{tag}[{lowered}]"))
            elif lowered == "style":
                self.inline_css.append(value)
        for key in ("id", "name"):
            if values.get(key):
                self.ids.add(values[key] or "")


def is_external(reference: str) -> bool:
    parsed = urlsplit(reference)
    return bool(parsed.scheme or parsed.netloc) or reference.startswith("//")


def check_reference(
    reference: str,
    source: Path,
    root: Path,
    anchor_map: dict[Path, set[str]],
    errors: list[str],
) -> int:
    reference = reference.strip()
    if not reference or is_external(reference):
        return 0
    parsed = urlsplit(reference)
    relative = unquote(parsed.path)
    if not relative:
        target = source
    elif relative.startswith("/"):
        target = root / relative.lstrip("/")
    else:
        target = source.parent / relative
    target = target.resolve()
    try:
        target.relative_to(root)
    except ValueError:
        errors.append(f"{source.relative_to(root)}: reference escapes the site: {reference}")
        return 1
    if target.is_dir():
        target = target / "index.html"
    if not target.is_file():
        errors.append(f"{source.relative_to(root)}: missing local target: {reference}")
        return 1
    fragment = unquote(parsed.fragment)
    if fragment and target.suffix.lower() == ".html" and fragment not in anchor_map.get(target, set()):
        errors.append(f"{source.relative_to(root)}: missing anchor in {target.relative_to(root)}: #{fragment}")
        return 1
    return 1


def scan_css(text: str, source: Path, root: Path, anchors: dict[Path, set[str]], errors: list[str]) -> int:
    count = 0
    for match in CSS_URL.finditer(text):
        value = match.group(2).strip().strip("'\"")
        if value and value.lower() != "none":
            count += check_reference(value, source, root, anchors, errors)
    return count


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else "dist").resolve()
    if not root.is_dir():
        print(f"Build directory not found: {root}", file=sys.stderr)
        return 1

    errors: list[str] = []
    files = sorted(root.rglob("*"))
    for path in files:
        if path.is_symlink():
            errors.append(f"Symbolic link in published site: {path.relative_to(root)}")
            continue
        if not path.is_file():
            continue
        name = path.name.lower()
        if name in PRIVATE_NAMES or name.startswith(".env"):
            errors.append(f"Private configuration file in published site: {path.relative_to(root)}")
        if path.suffix.lower() in PRIVATE_SUFFIXES:
            errors.append(f"Private-key file in published site: {path.relative_to(root)}")

    html_pages = [path for path in files if path.is_file() and path.suffix.lower() == ".html"]
    parsers: dict[Path, PageParser] = {}
    for page in html_pages:
        parser = PageParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
            parser.close()
        except (OSError, UnicodeError) as error:
            errors.append(f"Cannot read {page.relative_to(root)}: {error}")
            continue
        parsers[page.resolve()] = parser
    anchor_map = {path: parser.ids for path, parser in parsers.items()}

    reference_count = 0
    for page, parser in parsers.items():
        for reference, _context in parser.refs:
            reference_count += check_reference(reference, page, root, anchor_map, errors)
        for css in parser.inline_css:
            reference_count += scan_css(css, page, root, anchor_map, errors)

    for path in files:
        if not path.is_file() or path.is_symlink():
            continue
        suffix = path.suffix.lower()
        if suffix == ".css":
            reference_count += scan_css(path.read_text(encoding="utf-8"), path.resolve(), root, anchor_map, errors)
        elif suffix == ".js":
            text = path.read_text(encoding="utf-8")
            for match in JS_URL.finditer(text):
                reference_count += check_reference(match.group("url"), path.resolve(), root, anchor_map, errors)

    if errors:
        print("Site validation failed:", file=sys.stderr)
        for error in errors:
            print(f" - {error}", file=sys.stderr)
        return 1

    print(f"Validated {len(parsers)} HTML pages and {reference_count} local references.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
