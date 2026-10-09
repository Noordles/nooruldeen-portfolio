"""Compile authored colors into palette variables without changing default colors."""
from collections import Counter
import colorsys
from functools import lru_cache
from html.parser import HTMLParser
from pathlib import Path
import re

FAMILIES = [
    {"key": "wine", "label": "Wine / burgundy", "color": "#74263c", "description": "Wine highlights, pink accents, borders, shadows and glows."},
    {"key": "teal", "label": "Teal / green", "color": "#30c4a0", "description": "Green accents, layered highlights and illustrations."},
    {"key": "cyan", "label": "Cyan / blue", "color": "#267e94", "description": "Blue panels, photography accents and illustrations."},
    {"key": "ink", "label": "Dark backgrounds", "color": "#101312", "description": "Dark surfaces and their related shades."},
    {"key": "paper", "label": "Cream / light text", "color": "#e9e0cf", "description": "Cream lettering, light borders and muted text."},
]
NAMED = {"white": "ffffff", "black": "000000", "red": "ff0000", "green": "008000", "blue": "0000ff", "yellow": "ffff00", "cyan": "00ffff", "magenta": "ff00ff", "gray": "808080", "grey": "808080", "orange": "ffa500", "purple": "800080", "pink": "ffc0cb", "lime": "00ff00", "teal": "008080", "navy": "000080", "silver": "c0c0c0", "gold": "ffd700"}
SKIP = r"/\*.*?\*/|url\((?:[^()\"']|\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*')*\)|\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'"
COLOR = re.compile(r"(?P<skip>" + SKIP + r")|(?P<color>\#[a-f0-9]{8}(?![\w-])|\#[a-f0-9]{6}(?![\w-])|\#[a-f0-9]{4}(?![\w-])|\#[a-f0-9]{3}(?![\w-])|rgba?\([^()]*\)|(?<![\w-])(?:" + "|".join(NAMED) + r")(?![\w-]))", re.I | re.S)
LEX = re.compile(SKIP + r"|[{};:()]", re.I | re.S)
COLOR_ATTRS = {"style", "fill", "stroke", "stop-color", "flood-color", "lighting-color", "color"}

def parse_color(value):
    value = value.lower()
    alpha = "1"
    if value in NAMED:
        key = NAMED[value]
    elif value.startswith("#"):
        value = value[1:]
        if len(value) in (3, 4): value = "".join(c * 2 for c in value)
        key = value[:6]
        if len(value) == 8: alpha = format(int(value[6:], 16) / 255, ".9g")
    else:
        parts = re.split(r"[,\s/]+", value[value.index("(") + 1:-1].strip())
        if len(parts) not in (3, 4): return None
        try:
            rgb = [max(0, min(255, round(float(c.rstrip("%")) * (2.55 if c.endswith("%") else 1)))) for c in parts[:3]]
            key = "".join(f"{c:02x}" for c in rgb)
            if len(parts) == 4: alpha = parts[3]
        except ValueError: return None
    return key, alpha

def colors_in(value):
    for match in COLOR.finditer(value):
        if match["color"] and (parsed := parse_color(match["color"])): yield parsed

def rewrite_value(value):
    def replace(match):
        if not match["color"]: return match[0]
        parsed = parse_color(match["color"])
        if not parsed: return match[0]
        key, alpha = parsed
        rgb = " ".join(str(int(key[i:i+2], 16)) for i in (0, 2, 4))
        return f"rgb(var(--site-color-{key}, {rgb})" + (f" / {alpha}" if alpha != "1" else "") + ")"
    return COLOR.sub(replace, value)

def declarations(css):
    """Yield declaration values, preserving selectors, comments and URL contents."""
    blocks, parens, boundary, start = [], 0, 0, None
    for token in LEX.finditer(css):
        char = token[0]
        if len(char) != 1: continue
        if char == "(": parens += 1
        elif char == ")": parens = max(0, parens - 1)
        elif parens: continue
        elif char == "{":
            header = css[boundary:token.start()].strip()
            blocks.append(not bool(re.match(r"@(?:media|supports|container|layer|(?:-[\w]+-)?keyframes|scope)\b", header)))
            boundary, start = token.end(), None
        elif char in ";}":
            if start is not None: yield start, token.start(), css[start:token.start()]
            if char == "}" and blocks: blocks.pop()
            boundary, start = token.end(), None
        elif char == ":" and blocks and blocks[-1] and start is None: start = token.end()

def rewrite_css(css):
    for start, end, value in reversed(list(declarations(css))): css = css[:start] + rewrite_value(value) + css[end:]
    return css

class MarkupColors(HTMLParser):
    def __init__(self, document, rewrite=False):
        super().__init__(convert_charrefs=True)
        self.document, self.rewrite, self.values, self.edits, self.in_style = document, rewrite, [], [], False
        self.offsets = [0] + [m.end() for m in re.finditer("\n", document)]
        self.feed(document)
    def source_offset(self):
        row, col = self.getpos()
        return self.offsets[row - 1] + col
    def handle_starttag(self, tag, attrs):
        if tag == "style": self.in_style = True
        raw = self.get_starttag_text()
        updated = raw
        for key, value in attrs:
            if key not in COLOR_ATTRS or not value: continue
            self.values.append(value)
            if self.rewrite:
                pattern = re.compile(r"(\b" + re.escape(key) + r"\s*=\s*)([\"'])(.*?)\2", re.S | re.I)
                updated = pattern.sub(lambda m: m[1] + m[2] + rewrite_value(m[3]) + m[2], updated, count=1)
        if updated != raw: self.edits.append((self.source_offset(), self.source_offset() + len(raw), updated))
    handle_startendtag = handle_starttag
    def handle_endtag(self, tag):
        if tag == "style": self.in_style = False
    def handle_data(self, data):
        if self.in_style:
            self.values.extend(value for _, _, value in declarations(data))
            if self.rewrite: self.edits.append((self.source_offset(), self.source_offset() + len(data), rewrite_css(data)))

def rewrite_markup(document):
    parser = MarkupColors(document, True)
    for start, end, value in sorted(parser.edits, reverse=True): document = document[:start] + value + document[end:]
    return document

def family(key):
    r, g, b = (int(key[i:i+2], 16) / 255 for i in (0, 2, 4))
    h, light, saturation = colorsys.rgb_to_hls(r, g, b)
    h *= 360
    if saturation >= .18 and (h >= 325 or h <= 18): return "wine"
    if saturation >= .18 and 140 <= h < 180: return "teal"
    if saturation >= .18 and 180 <= h <= 225: return "cyan"
    if light < .26: return "ink"
    if saturation < .2 or (20 < h < 100 and saturation < .55 and light > .55): return "paper"
    return "other"

@lru_cache(maxsize=4)
def catalog(root):
    root = Path(root)
    css = (root / "styles/site.css").read_text("utf-8")
    counts = Counter(key for _, _, value in declarations(css) for key, _ in colors_in(value))
    for path in (root / "scripts/browser").glob("*.js"):
        counts.update(value[1:].lower() for value in re.findall(r"paletteColor\(\s*['\"](#[0-9a-fA-F]{6})['\"]", path.read_text("utf-8")))
    svg_assets = []
    for folder in ("pages", "assets", "research-assets"):
        for path in sorted((root / folder).rglob("*.html" if folder == "pages" else "*.svg")):
            parser = MarkupColors(path.read_text("utf-8"))
            counts.update(key for value in parser.values for key, _ in colors_in(value))
            if folder != "pages": svg_assets.append("/" + path.relative_to(root).as_posix())
    for item in FAMILIES: counts.setdefault(item["color"][1:], 0)
    aliases = {}
    first_block = css[:css.index("}") + 1]
    for start, _, value in declarations(first_block):
        prop = re.search(r"(--[\w-]+)\s*:\s*$", first_block[:start])
        if prop and list(colors_in(value)): aliases[prop[1]] = rewrite_value(value.strip())
    colors = [{"key": key, "value": "#" + key, "family": family(key), "count": count} for key, count in sorted(counts.items())]
    families = [{**item, "count": sum(c["count"] for c in colors if c["family"] == item["key"])} for item in FAMILIES]
    return {"families": families, "colors": colors, "aliases": aliases, "svgAssets": svg_assets}
