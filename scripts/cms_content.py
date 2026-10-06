"""Owner CMS integration. Preserve source markup and replace only approved content."""
from __future__ import annotations
import argparse, hashlib, html, json, re
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

VOID = set("area base br col embed hr img input link meta param source track wbr".split())
SKIP = set("script style noscript template svg canvas pre code".split())
EDIT_ATTRS = {"a": ("href", "title", "aria-label"), "img": ("alt", "src"), "button": ("title", "aria-label"), "input": ("placeholder",), "textarea": ("placeholder",), "video": ("src", "poster"), "audio": ("src",), "source": ("src",)}
CARD_CLASSES = set("work-card topic-feature research-deck-card site-story-preview incsmps-page-card incsmps-gallery-card logo-piece".split())
CONFIG = {"version": 1, "pages": {}, "orders": {}, "photos": None, "piano": None, "styles": {}, "theme": {}, "adminOrigin": ""}
def uid(value): return hashlib.sha256(value.encode()).hexdigest()[:16]
def read_json(path, default):
    return json.loads(path.read_text("utf-8")) if path.is_file() else default
def safe_url(value):
    if not isinstance(value, str) or len(value) > 2048 or re.search(r"[\x00-\x20\\]", value): return False
    p = urlsplit(value)
    if p.scheme: return p.scheme in ("https", "http", "mailto", "tel") and not p.username and not p.password
    return not value.startswith("//") and ".." not in p.path.split("/")
def route(path):
    fixed = {"home/index.html": "/", "design/design.html": "/design/", "design/idrl.html": "/idrl/", "design/incsmps.html": "/incsmps/", "hobbies/photos.html": "/photos/", "hobbies/piano.html": "/piano/", "research/research.html": "/research/", "site-story/site-story.html": "/site-story/"}
    return fixed.get(path, "/research/" + Path(path).stem.removeprefix("research-") + "/")

class Catalog(HTMLParser):
    def __init__(self, document, path):
        super().__init__(convert_charrefs=True)
        self.document, self.path = document, path
        self.offsets = [0]
        for m in re.finditer("\n", document): self.offsets.append(m.end())
        self.stack, self.roots, self.nodes, self.fields = [], [], [], []
        self.feed(document)
        self.close()
    def source_offset(self): 
        row, column = self.getpos()
        return self.offsets[row - 1] + column
    def handle_starttag(self, tag, attrs):
        parent = self.stack[-1] if self.stack else None
        siblings = parent["children"] if parent else self.roots
        attr = dict(attrs)
        serial = sum(n["tag"] == tag for n in siblings) + 1
        address = (parent["address"] + "/" if parent else "") + f"{tag}:{serial}"
        classes = set((attr.get("class") or "").split())
        languages = parent["languages"] if parent else ["en", "ro", "ar"]
        if tag not in ("html", "body") and attr.get("lang") in ("en", "ro", "ar"): languages = [attr["lang"]]
        elif "full-name" in classes and parent and "brand-name" in (parent["attrs"].get("class") or "").split(): languages = ["en", "ro"]
        content_excluded = bool(parent and parent["contentExcluded"]) or tag in SKIP or "photo-year-section" in classes or "track-list" in classes
        excluded = content_excluded or bool(parent and parent["excluded"]) or attr.get("aria-hidden") == "true"
        node = {"id": attr.get("data-cms-id") or uid(self.path + "/" + address), "tag": tag, "attrs": attr, "address": address, "children": [], "start": self.source_offset(), "openEnd": self.source_offset() + len(self.get_starttag_text()), "end": None, "slots": 0, "excluded": excluded, "contentExcluded": content_excluded, "languages": languages, "section": (parent["section"] if parent else "Metadata"), "parent": parent}
        if tag in ("section", "article") and attr.get("id"): node["section"] = attr["id"]
        siblings.append(node)
        self.nodes.append(node)
        if not content_excluded:
            names = EDIT_ATTRS.get(tag, ())
            if tag == "meta" and attr.get("name") == "description": names = ("content",)
            for name in names:
                value = attr.get(name)
                if value and value.strip():
                    self.fields.append({"key": node["id"] + "@" + name, "node": node["id"], "kind": "url" if name in ("href", "src", "poster") else "text", "attribute": name, "value": value, "languages": languages, "section": node["section"], "label": name + ": " + value[:85]})
        if tag not in VOID: self.stack.append(node)
        else: node["end"] = node["openEnd"]
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                end = self.document.find(">", self.source_offset()) + 1
                for node in self.stack[i:]: node["end"] = end
                del self.stack[i:]
                break
    def handle_data(self, data):
        if not self.stack or not data.strip(): return
        node = self.stack[-1]
        slot = node["slots"]
        node["slots"] += 1
        if node["excluded"]: return
        start = self.source_offset()
        # getpos() addresses raw source. Entity spelling is preserved when unchanged.
        end = self.document.find("<", start)
        if end < 0: end = len(self.document)
        self.fields.append({"key": node["id"] + ":" + str(slot), "node": node["id"], "kind": "text", "slot": slot, "value": data.strip(), "languages": node["languages"], "section": node["section"], "label": node["tag"] + ": " + data.strip()[:100], "start": start, "end": end})
    def groups(self):
        groups = []
        nodes = {n["id"]: n for n in self.nodes}
        for parent in self.nodes:
            children = parent["children"]
            members = [n for n in children if not n["excluded"] and (n["tag"] == "article" or bool(CARD_CLASSES & set((n["attrs"].get("class") or "").split())))]
            if len(members) < 2: continue
            positions = [children.index(n) for n in members]
            if positions != list(range(min(positions), max(positions) + 1)): continue
            if any(not n["end"] for n in members): continue
            items = []
            for member in members:
                keys = [f["key"] for f in self.fields if nodes[f["node"]]["address"] == member["address"] or nodes[f["node"]]["address"].startswith(member["address"] + "/")]
                items.append({"id": member["id"], "label": re.sub("<[^>]+>", " ", self.document[member["start"]:member["end"]]).strip()[:120], "fieldKeys": keys})
            groups.append({"key": parent["id"], "section": parent["section"], "label": "Items in " + parent["section"], "members": items, "_nodes": members})
        return groups
    def schema(self):
        return {"id": self.path, "route": route(self.path), "label": self.path.replace(".html", "").replace("/", " / "), "fields": [{k: v for k, v in f.items() if k not in ("start", "end")} for f in self.fields], "collections": [{k: v for k, v in g.items() if k != "_nodes"} for g in self.groups()]}

def apply_edits(document, edits):
    for start, end, value in sorted(edits, reverse=True):
        document = document[:start] + value + document[end:]
    return document
def render_fields(document, path, values, mark=True):
    catalog = Catalog(document, path)
    edits, node_keys = [], defaultdict(list)
    runtime = []
    for field in catalog.fields:
        key, nodeid = field["key"], field["node"]
        node_keys[nodeid].append(key)
        override = values.get(key, {})
        if not isinstance(override, dict): continue
        en = override.get("en", field["value"])
        if not isinstance(en, str): raise ValueError("Content values must be text")
        if field["kind"] == "url" and not safe_url(en): raise ValueError("Unsafe link")
        if en != field["value"] and "slot" in field:
            raw = document[field["start"]:field["end"]]
            lead, tail = re.match(r"^\s*", raw).group(), re.search(r"\s*$", raw).group()
            edits.append((field["start"], field["end"], lead + (html.escape(en, quote=False) if en else "&#8203;") + tail))
        if override:
            runtime.append({**{k:field[k] for k in ("node", "slot", "attribute") if k in field}, "values": {l:v for l,v in override.items() if l in ("en","ro","ar") and isinstance(v,str)}, "original": field["value"]})
    for node in catalog.nodes:
        if node["excluded"] and not node_keys[node["id"]]: continue
        opening = document[node["start"]:node["openEnd"]]
        for field in catalog.fields:
            if field["node"] != node["id"] or "attribute" not in field: continue
            en = values.get(field["key"], {}).get("en", field["value"])
            if en == field["value"]: continue
            pattern = re.compile(r"(\b" + re.escape(field["attribute"]) + r"\s*=\s*)([\"']).*?\2", re.I | re.S)
            opening = pattern.sub(lambda m: m[1] + m[2] + html.escape(en, quote=True) + m[2], opening, count=1)
        if mark:
            at = opening.rfind("/>") if opening.rstrip().endswith("/>") else opening.rfind(">")
            opening = opening[:at] + ' data-cms-node="' + node["id"] + '"' + opening[at:]
        if opening != document[node["start"]:node["openEnd"]]: edits.append((node["start"], node["openEnd"], opening))
    return apply_edits(document, edits), runtime

def render_orders(document, path, orders):
    catalog = Catalog(document, path)
    groups = {g["key"]: g for g in catalog.groups()}
    def segment(node):
        start, end = node["start"], node["end"] or len(document)
        edits = []
        group = groups.get(node["id"])
        ordered = None
        if group and isinstance(orders.get(group["key"]), list):
            members = group["_nodes"]
            mapping = {n["id"]: n for n in members}
            ordered = [x for x in orders[group["key"]] if x in mapping]
            if len(ordered) != len(set(ordered)): raise ValueError("Duplicate ordering member")
            ordered.extend(n["id"] for n in members if n["id"] not in ordered)
            if ordered == [n["id"] for n in members]: ordered = None
            if ordered:
                edits.append((members[0]["start"]-start, members[-1]["end"]-start, "\n".join(segment(mapping[x]) for x in ordered)))
        moved = set(n["id"] for n in group["_nodes"]) if group and ordered else set()
        for child in node["children"]:
            if child["id"] in moved or not child["end"]: continue
            before = document[child["start"]:child["end"]]
            after = segment(child)
            if before != after: edits.append((child["start"]-start, child["end"]-start, after))
        return apply_edits(document[start:end], edits)
    edits = []
    for node in catalog.roots:
        if node["end"]:
            after = segment(node)
            if after != document[node["start"]:node["end"]]: edits.append((node["start"],node["end"],after))
    return apply_edits(document, edits)

def photo_defaults(document):
    items = []
    section = ""
    token = re.compile(r'<section class="photo-year-section"[^>]*>|<figure class="photo-card">.*?</figure>', re.S)
    for match in token.finditer(document):
        raw = match[0]
        if raw.startswith("<section"):
            section = re.search(r'aria-label="([^"]+)"', raw)[1].removesuffix(" photographs")
            continue
        p = Catalog(raw, "photo")
        nodes = p.nodes
        a = next(n["attrs"] for n in nodes if n["tag"] == "a" and "data-photo-open" in n["attrs"])
        image = next(n["attrs"] for n in nodes if n["tag"] == "img")
        title = re.search(r"<b>(.*?)</b>", raw, re.S)
        small = re.search(r"<small>(.*?)</small>", raw, re.S)
        items.append({"id": "legacy-" + uid(a["href"]), "status": "published", "gallery": section, "title": html.unescape(title[1]) if title else "", "caption": html.unescape(small[1]) if small else "", "alt": image.get("alt",""), "src": image["src"], "full": a["href"], "width": int(image.get("width",900)), "height": int(image.get("height",900)), "viewerCaption": a.get("data-caption",""), "legacyHtml": raw})
    return items
def piano_defaults(document):
    items = []
    for raw in re.findall(r'<article class="track-card.*?</article>', document, re.S):
        key = re.search(r'data-track-card="([^"]+)"',raw)[1]
        items.append({"id": key, "status":"published", "title":html.unescape(re.search(r"<h3>(.*?)</h3>",raw,re.S)[1]), "description":html.unescape(re.search(r"<p>(.*?)</p>",raw,re.S)[1]), "composer":"Evgeny Grinko" if key=="melting" else "Noor", "notes":"", "difficulty":"", "learnedDate":"", "pieceStatus":"learned" if key=="melting" else "improvised", "audio":"", "video":"", "thumbnail":"", "midi":"", "builtin":key, "legacyHtml":raw})
    return items
def clean_item(item, defaults):
    return {k: v for k, v in item.items() if k != "legacyHtml"} == {k: v for k, v in defaults.items() if k != "legacyHtml"}
def photo_html(item):
    esc = lambda x: html.escape(str(x),quote=True)
    title, caption, alt = esc(item.get("title","")), esc(item.get("caption","")), esc(item.get("alt",""))
    full, thumb = item.get("full",""), item.get("src","")
    if not safe_url(full) or not safe_url(thumb): raise ValueError("Invalid photo path")
    return f'<figure class="photo-card"><a href="{esc(full)}" data-photo-open data-caption="{esc(item.get("viewerCaption") or (item.get("title","") + " · " + item.get("caption","")))}" data-alt="{alt}"><img src="{esc(thumb)}" alt="{alt}" loading="lazy" decoding="async" width="{int(item.get("width",900))}" height="{int(item.get("height",900))}" /><figcaption><span><b>{title}</b><small>{caption}</small></span></figcaption></a><a class="photo-card-download" href="{esc(full)}" download aria-label="Download {title}"><span>DOWNLOAD</span><b aria-hidden="true" class="arrow-glyph">↓</b></a></figure>'
def replace_photos(document, items):
    existing = {x["id"]:x for x in photo_defaults(document)}
    current = list(existing.values())
    if len(items)==len(current) and all(clean_item(a,b) for a,b in zip(items,current)): return document
    grouped = {}
    for item in items:
        if item.get("status")!="published": continue
        grouped.setdefault(item.get("gallery") or "Collection",[]).append(item)
    sections = []
    for name, photos in grouped.items():
        cards = [existing[p["id"]]["legacyHtml"] if p["id"] in existing and clean_item(p,existing[p["id"]]) else photo_html(p) for p in photos]
        label=html.escape(name,quote=True)
        sections.append(f'<section class="photo-year-section" aria-label="{label} photographs"><div class="photo-year-heading"><h3>{label}</h3><span>{label}</span></div><div class="photo-grid-masonry">' + "\n".join(cards) + "</div></section>")
    start = document.index('<section class="photo-year-section"')
    # Gallery year sections are followed by a closing gallery section and dialog.
    end = document.rfind("</div></section>",start,document.index("<dialog",start)) + len("</div></section>")
    if end < start: raise ValueError("Photography template boundary missing")
    result = document[:start] + "\n".join(sections) + document[end:]
    visible = [p for p in items if p.get("status") == "published"]
    first = html.escape(visible[0]["full"], quote=True) if visible else ""
    result = re.sub(r'(<a class="photo-viewer-download"[^>]*\bhref=")[^"]*(")', lambda m: m[1]+first+m[2], result, count=1)
    return result
def piano_html(item, number):
    esc=lambda x:html.escape(str(x),quote=True)
    media=item.get("audio","")
    if media and not safe_url(media): raise ValueError("Invalid audio URL")
    video=item.get("video","")
    if video and not safe_url(video): raise ValueError("Invalid video URL")
    key=esc(item["id"])
    built=item.get("builtin","")
    button=(f'<button class="track-button" type="button" data-track="{esc(built)}" aria-label="Play {esc(item["title"])}" aria-pressed="false"><span class="play-symbol" aria-hidden="true">▶</span><span class="button-text">PLAY</span></button>' if built and not media else f'<button class="track-button" type="button" data-cms-audio="{esc(media)}" aria-label="Play {esc(item["title"])}" aria-pressed="false"><span class="play-symbol" aria-hidden="true">▶</span><span class="button-text">PLAY</span></button>' if media else "")
    extra="".join(f'<p data-cms-note="{k}">{esc(item.get(k,""))}</p>' for k in ("notes","difficulty","learnedDate") if item.get(k) or any(v.get(k) for v in item.get("translations",{}).values()))
    video_link=f'<a data-cms-note class="audio-download-link" href="{esc(video)}" rel="noopener noreferrer" target="_blank">WATCH PERFORMANCE ↗</a>' if video else ""
    midi=item.get("midi","")
    if midi and not safe_url(midi): raise ValueError("Invalid MIDI URL")
    audio_link=f'<a data-cms-note class="audio-download-link" href="{esc(media)}" download>DOWNLOAD AUDIO ↓</a>' if media else ""
    midi_link=f'<a data-cms-note class="audio-download-link" href="{esc(midi)}" download>DOWNLOAD MIDI ↓</a>' if midi else ""
    thumbnail=f'<img data-cms-note src="{esc(item["thumbnail"])}" alt="" loading="lazy" width="120" height="120" />' if item.get("thumbnail") and safe_url(item["thumbnail"]) else ""
    description=" · ".join(x for x in (item.get("pieceStatus"),item.get("composer"),item.get("description")) if x)
    return f'<article class="track-card" data-track-card="{esc(built or item["id"])}"><span class="track-number">{number:02}</span><div class="track-info">{thumbnail}<h3>{esc(item["title"])}</h3><p>{esc(description)}</p>{extra}<div class="track-downloads">{video_link}{midi_link}{audio_link}</div></div><span class="track-duration"></span>{button}<div class="track-progress" role="slider" tabindex="0" {"data-track-seek="+chr(34)+esc(built)+chr(34) if built and not media else "data-cms-seek"} aria-label="Seek in {esc(item["title"])}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div></article>'
def replace_piano(document, items):
    existing={p["id"]:p for p in piano_defaults(document)}
    initial=list(existing.values())
    if len(items)==len(initial) and all(clean_item(a,b) for a,b in zip(items,initial)): return document
    start=document.index('<div class="track-list">')
    card_end=document.rfind("</article>")+len("</article>")
    end=document.index("</div>",card_end)+len("</div>")
    cards=[]
    for item in items:
        if item.get("status")!="published": continue
        number=len(cards)+1
        if item["id"] in existing and item.get("builtin") and not item.get("audio"):
            original=existing[item["id"]]
            raw=original["legacyHtml"]
            raw=re.sub(r'(<span class="track-number">).*?(</span>)',lambda m:m[1]+f"{number:02}"+m[2],raw,count=1)
            if item.get("thumbnail") and safe_url(item["thumbnail"]):
                raw=raw.replace("<h3>",'<img data-cms-note src="'+html.escape(item["thumbnail"],quote=True)+'" alt="" loading="lazy" width="120" height="120" /><h3>',1)
            raw=re.sub(r"<h3>.*?</h3>",lambda m:"<h3>"+html.escape(item["title"])+"</h3>",raw,count=1,flags=re.S)
            description=item.get("description","")
            if item.get("composer")!=original.get("composer"): description=" · ".join(x for x in (item.get("composer"),description) if x)
            extra="".join('<p data-cms-note="'+k+'">'+html.escape(item.get(k,""))+"</p>" for k in ("notes","difficulty","learnedDate") if item.get(k) or any(v.get(k) for v in item.get("translations",{}).values()))
            if item.get("pieceStatus")!=original.get("pieceStatus") and item.get("pieceStatus") or any(v.get("pieceStatus") for v in item.get("translations",{}).values()): extra+='<p data-cms-note="pieceStatus">'+html.escape(item.get("pieceStatus",""))+"</p>"
            if item.get("video") and safe_url(item["video"]): extra+='<a data-cms-note class="audio-download-link" href="'+html.escape(item["video"],quote=True)+'" rel="noopener noreferrer" target="_blank">WATCH PERFORMANCE ↗</a>'
            if item.get("midi") and safe_url(item["midi"]): extra+='<a data-cms-note class="audio-download-link" href="'+html.escape(item["midi"],quote=True)+'" download>DOWNLOAD MIDI ↓</a>'
            raw=re.sub(r"<p>.*?</p>",lambda m:"<p>"+html.escape(description)+"</p>"+extra,raw,count=1,flags=re.S)
        else: raw=piano_html(item,number)
        cards.append(raw)
    return document[:start]+'<div class="track-list">'+"\n".join(cards)+"</div>"+document[end:]

def render(document, path, configuration):
    piano_baseline = [{k:v for k,v in p.items() if k!="legacyHtml"} for p in piano_defaults(document)] if path=="hobbies/piano.html" else []
    photo_baseline = [{k:v for k,v in p.items() if k!="legacyHtml"} for p in photo_defaults(document)] if path=="hobbies/photos.html" else []
    source_catalog=Catalog(document,path)
    bindings=[{k:v for k,v in f.items() if k in ("key","node","slot","attribute","value")} for f in source_catalog.fields]
    style_nodes=[m["id"] for g in source_catalog.groups() for m in g["members"]]
    values=configuration.get("pages",{}).get(path,{})
    document,runtime=render_fields(document,path,values)
    document=render_orders(document,path,configuration.get("orders",{}))
    if path=="hobbies/photos.html" and configuration.get("photos") is not None: document=replace_photos(document,configuration["photos"])
    if path=="hobbies/piano.html" and configuration.get("piano") is not None: document=replace_piano(document,configuration["piano"])
    collection="photos" if path=="hobbies/photos.html" else "piano" if path=="hobbies/piano.html" else ""
    items=(configuration.get(collection) if collection else None)
    if items is None: items=photo_baseline if collection=="photos" else piano_baseline
    if collection=="photos":
        catalog=Catalog(document,path)
        cards=[n for n in catalog.nodes if n["tag"]=="figure" and "photo-card" in (n["attrs"].get("class") or "").split()]
        visible=[p for p in items if p.get("status")=="published"]
        document=apply_edits(document,[(n["openEnd"]-1,n["openEnd"]-1,' data-cms-item="'+html.escape(p["id"],quote=True)+'"') for n,p in zip(cards,visible)])
    data=json.dumps({"bindings":bindings,"styleNodes":style_nodes,"styles":configuration.get("styles",{}).get(path,{}),"theme":configuration.get("theme",{}),"collection":collection,"items":items,"pianoDefaults":piano_baseline,"fields":runtime,"adminOrigin":configuration.get("adminOrigin",""),"page":path},ensure_ascii=False).replace("<","\\u003c")
    script='<script id="cms-page-data" type="application/json">'+data+'</script><script src="/cms-runtime.js" defer></script>'
    return document.replace("</head>",script+"\n</head>",1)
def generate(root):
    pages=[]
    for path in sorted((root/"pages").rglob("*.html")):
        relative=path.relative_to(root/"pages").as_posix()
        pages.append(Catalog(path.read_text("utf-8"),relative).schema())
    photos=photo_defaults((root/"pages/hobbies/photos.html").read_text("utf-8"))
    piano=piano_defaults((root/"pages/hobbies/piano.html").read_text("utf-8"))
    for item in photos+piano: item.pop("legacyHtml",None)
    schema={"version":1,"pages":pages}
    initial={"version":1,"pages":{},"orders":{},"photos":photos,"piano":piano,"styles":{},"theme":{},"adminOrigin":""}
    saved=read_json(root/"content/published.json", CONFIG)
    for key in ("pages","orders","styles","theme","adminOrigin"): initial[key]=saved.get(key,initial[key])
    for key in ("photos","piano"):
        if saved.get(key) is not None: initial[key]=saved[key]
    return schema,initial
def export(root,out):
    out.mkdir(parents=True,exist_ok=True)
    schema,initial=generate(root)
    for name,value in (("catalog.json",schema),("initial-content.json",initial)):
        (out/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+"\n","utf-8")
    return schema
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--admin-export",type=Path,required=True)
    args=parser.parse_args()
    export(Path(__file__).resolve().parents[1],args.admin_export)
