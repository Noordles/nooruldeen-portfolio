import copy, importlib.util, json, re, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"scripts"))
import cms_content as cms

class ContentTests(unittest.TestCase):
    def test_every_existing_page_remains_identical_when_content_is_unchanged(self):
        pages=list((ROOT/"pages").rglob("*.html"))
        self.assertGreaterEqual(len(pages),18)
        for page in pages:
            original=page.read_text("utf-8")
            output=cms.render(original,page.relative_to(ROOT/"pages").as_posix(),cms.CONFIG)
            output=re.sub(r' data-cms-node="[a-f0-9]{16}"',"",output)
            output=re.sub(r'<script id="cms-page-data".*?</script><script src="/cms-runtime.js" defer></script>\n',"",output,flags=re.S)
            self.assertEqual(original,output,str(page))
    def test_complete_catalog_has_unique_ids_and_all_routes(self):
        catalog,initial=cms.generate(ROOT)
        for page in catalog["pages"]:
            keys=[f["key"] for f in page["fields"]]
            self.assertEqual(len(keys),len(set(keys)))
            self.assertGreater(len(keys),10)
        routes={p["route"] for p in catalog["pages"]}
        self.assertTrue({"/","/design/","/research/","/photos/","/piano/","/idrl/","/incsmps/","/site-story/"}<=routes)
        self.assertGreater(len(initial["photos"]),50)
        self.assertEqual(len(initial["piano"]),4)
    def test_edits_are_plain_text_and_keep_nested_heading_layout(self):
        source='<html><head></head><body><section id="about"><h2>Hello<br><span>world</span></h2><p>Old &amp; familiar</p></section></body></html>'
        cat=cms.Catalog(source,"home/index.html")
        field=next(f for f in cat.fields if f["value"]=="Old & familiar")
        output=cms.render(source,"home/index.html",{**cms.CONFIG,"pages":{"home/index.html":{field["key"]:{"en":'<script>alert("x")</script>',"ar":"نص جديد"}}}})
        self.assertIn("&lt;script&gt;",output)
        self.assertIn("<br ",output)
        self.assertIn("world</span>",output)
        self.assertIn("\\u003cscript",output)
    def test_unsafe_links_fail(self):
        source='<html><head></head><body><a href="/design/">Design</a></body></html>'
        field=next(f for f in cms.Catalog(source,"home/index.html").fields if f.get("attribute")=="href")
        with self.assertRaises(ValueError):
            cms.render(source,"home/index.html",{**cms.CONFIG,"pages":{"home/index.html":{field["key"]:{"en":"javascript:alert(1)"}}}})
        for value in ["javascript:alert(1)","//evil.test/a","../secrets","https://a:b@evil.test/"]:
            self.assertFalse(cms.safe_url(value))
    def test_reordering_moves_original_cards_without_recreating_them(self):
        source='<html><head></head><body><div><article class="work-card"><h3>One</h3></article><article class="work-card"><h3>Two</h3></article></div></body></html>'
        group=cms.Catalog(source,"home/index.html").groups()[0]
        ids=[m["id"] for m in group["members"]]
        output=cms.render_orders(source,"home/index.html",{group["key"]:ids[::-1]})
        self.assertLess(output.index("Two"),output.index("One"))
    def test_default_photo_and_piano_collections_preserve_exact_markup(self):
        photos=(ROOT/"pages/hobbies/photos.html").read_text("utf-8")
        piano=(ROOT/"pages/hobbies/piano.html").read_text("utf-8")
        self.assertEqual(photos,cms.replace_photos(photos,cms.photo_defaults(photos)))
        self.assertEqual(piano,cms.replace_piano(piano,cms.piano_defaults(piano)))
    def test_photo_status_and_gallery(self):
        source=(ROOT/"pages/hobbies/photos.html").read_text("utf-8")
        items=cms.photo_defaults(source)
        hidden=items[0]["full"]
        items[0]["status"]="hidden"
        items[1]["gallery"]="New gallery"
        out=cms.replace_photos(source,items)
        self.assertNotIn('href="'+hidden+'"',out)
        self.assertIn("<h3>New gallery</h3>",out)
        self.assertIn("data-photo-viewer",out)
        self.assertEqual(len(re.findall(r'<figure class="photo-card">',out)),len(items)-1)
    def test_new_piano_piece_and_updated_builtin(self):
        source=(ROOT/"pages/hobbies/piano.html").read_text("utf-8")
        items=cms.piano_defaults(source)
        items[0]["title"]="A new title"
        items[0]["notes"]="My performance note"
        items.append({"id":"new-piece","title":"New piece","status":"published","composer":"Composer","pieceStatus":"learned","description":"Description","audio":"https://admin.nooruldeen.com/media/00000000-0000-4000-8000-000000000000/full"})
        out=cms.replace_piano(source,items)
        self.assertIn("My performance note",out)
        self.assertIn("Melting-Evgeny-Grinko.mp3",out)
        self.assertIn("data-cms-audio",out)
        self.assertIn("Composer",out)
        self.assertIn('<span class="track-number">05</span>',out)
    def test_drafts_do_not_render_on_public_pages(self):
        source=(ROOT/"pages/hobbies/piano.html").read_text("utf-8")
        items=cms.piano_defaults(source)
        items.append({"id":"secret-draft","title":"Private draft title","status":"draft"})
        self.assertNotIn("Private draft title",cms.replace_piano(source,items))
    def test_public_build_does_not_copy_admin_service_or_private_uploads(self):
        spec=importlib.util.spec_from_file_location("build",ROOT/"scripts/build_site.py")
        build=importlib.util.module_from_spec(spec);spec.loader.exec_module(build)
        self.assertNotIn("admin",build.ASSET_DIRECTORIES)
        self.assertNotIn("admin",build.INPUT_DIRECTORIES)
        self.assertIn("cms-runtime.js",build.PUBLIC_SCRIPT_NAMES)

if __name__=="__main__":unittest.main()
