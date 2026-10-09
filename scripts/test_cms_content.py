"""Regression checks for discoverable, language-specific CMS content."""
import json
from pathlib import Path
import unittest

from cms_content import Catalog, render

ROOT = Path(__file__).resolve().parents[1]


class ContentCatalogTests(unittest.TestCase):
    def test_research_hero_and_card_contents_are_discoverable(self):
        path = "research/projects/research-shifting-shadows.html"
        schema = Catalog((ROOT / "pages" / path).read_text(), path).schema()
        fields = {f["value"]: f for f in schema["fields"]}
        for value in ("Shifting", "shadows.", "What the reported models say", "Why the association is not a causal pathway", "≈ 0.35"):
            self.assertIn(value, fields)
        heading = fields["What the reported models say"]
        member = next(m for g in schema["collections"] for m in g["members"] if heading["key"] in m["fieldKeys"])
        self.assertEqual(len(member["fieldKeys"]), 3)

    def test_language_specific_markup_and_decorative_images(self):
        document = '<div class="brand-name"><span class="full-name">Noor</span><span class="full-name" lang="ar">نور</span></div><div aria-hidden="true"><img src="assets/background.webp" alt="" /></div>'
        fields = Catalog(document, "sample.html").schema()["fields"]
        by_value = {f["value"]: f for f in fields}
        self.assertEqual(by_value["Noor"]["languages"], ["en", "ro"])
        self.assertEqual(by_value["نور"]["languages"], ["ar"])
        image = by_value["assets/background.webp"]
        result = render('<head></head>' + document, "sample.html", {"pages": {"sample.html": {image["key"]: {"en": "/new.webp"}}}})
        self.assertIn('src="/new.webp"', result)
        self.assertIn('data-cms-node="' + image["node"] + '"', result)

    def test_empty_text_keeps_a_stable_runtime_slot(self):
        document = '<head></head><h1>First <em>middle</em> last</h1>'
        schema = Catalog(document, "sample.html").schema()
        first = next(f for f in schema["fields"] if f["value"] == "First")
        result = render(document, "sample.html", {"pages": {"sample.html": {first["key"]: {"en": ""}}}})
        self.assertIn("&#8203;", result)
        self.assertIn('"slot": 0', result)
        self.assertIn(" last</h1>", result)

    def test_collection_translations_survive_public_rendering(self):
        path = "hobbies/piano.html"
        from cms_content import piano_defaults
        document = (ROOT / "pages" / path).read_text()
        items = piano_defaults(document)
        for item in items:
            item.pop("legacyHtml", None)
        items[0]["translations"] = {"ar": {"title": "مقطوعة", "notes": "ملاحظة"}}
        result = render(document, path, {"piano": items})
        self.assertIn('data-cms-note="notes"', result)
        payload = json.loads(result.split('<script id="cms-page-data" type="application/json">')[1].split('</script>')[0])
        self.assertEqual(payload["items"][0]["translations"]["ar"]["title"], "مقطوعة")

    def test_page_areas_and_color_settings_keep_existing_field_ids(self):
        document='<html><head></head><body><header>Brand</header><section id="hero"><h1>Noor</h1><div class="hero-illustration" aria-hidden="true"><img src="/art.svg" /></div></section></body></html>'
        schema=Catalog(document,"sample.html").schema()
        heading=next(f for f in schema['fields'] if f['value']=='Noor')
        hero=next(t for t in schema['designTargets'] if t['label']=='Hero')
        palette={'families':{'wine':'#4834bc'}}
        styles={hero['key']:{'en':{'background':'#111111'}}}
        output=render(document,'sample.html',{'palette':palette,'styles':{'sample.html':styles}})
        payload=json.loads(output.split('<script id="cms-page-data" type="application/json">')[1].split('</script>')[0])
        self.assertIn(hero['key'],payload['styleNodes'])
        self.assertIn('data-cms-node="'+hero['key']+'"',output)
        self.assertEqual(payload['palette'],palette)
        self.assertTrue(any(f['key']==heading['key'] for f in payload['bindings']))

    def test_design_settings_are_embedded_with_approved_bindings(self):
        document = '<head></head><h1>Noor</h1>'
        field = Catalog(document, "sample.html").fields[0]
        styles = {field["key"]: {"en": {"font": "Georgia", "effect": "wine-highlight", "text": "Noor"}}}
        result = render(document, "sample.html", {"styles": {"sample.html": styles}, "theme": {"ar": {"font": "Amiri"}}})
        payload = json.loads(result.split('<script id="cms-page-data" type="application/json">')[1].split('</script>')[0])
        self.assertEqual(payload["styles"], styles)
        self.assertEqual(payload["theme"], {"ar": {"font": "Amiri"}})
        self.assertEqual(payload["bindings"][0]["key"], field["key"])


if __name__ == "__main__":
    unittest.main()
