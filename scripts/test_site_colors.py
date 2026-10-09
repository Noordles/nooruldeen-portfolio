"""Check color compilation without changing selectors, opacity or default artwork."""
import unittest
from site_colors import rewrite_css, rewrite_markup, catalog
from pathlib import Path

class PaletteTests(unittest.TestCase):
    def test_shadows_and_gradients_share_a_color_without_losing_opacity(self):
        css='.a {color:#74263c;background:linear-gradient(#74263c80,rgba(116,38,60,.9));border:1px solid #74263c}'
        compiled=rewrite_css(css)
        self.assertEqual(compiled.count('--site-color-74263c'),4)
        self.assertIn(' / .9)',compiled)
        self.assertIn(' / 0.501960784)',compiled)

    def test_selectors_strings_and_url_contents_are_unchanged(self):
        css='#fff:hover {color:white;content:"black #74263c";background:url("data:image/svg+xml,%23fff")} @media(max-width:640px){.b{stroke:#30c4a0}}'
        compiled=rewrite_css(css)
        self.assertTrue(compiled.startswith('#fff:hover'))
        self.assertIn('content:"black #74263c"',compiled)
        self.assertIn('url("data:image/svg+xml,%23fff")',compiled)
        self.assertIn('--site-color-ffffff',compiled)
        self.assertIn('--site-color-30c4a0',compiled)
        self.assertEqual(rewrite_css('.a{color:var(--teal);background:var(--photo-blue)}'),'.a{color:var(--teal);background:var(--photo-blue)}')

    def test_inline_svg_and_styles_use_the_same_palette_as_the_stylesheet(self):
        markup='<svg><path fill="#74263c" stroke-opacity=".5"/></svg><p style="color:rgba(116,38,60,.8)">Keep #74263c as text</p><script>const color="#74263c"</script>'
        output=rewrite_markup(markup)
        self.assertEqual(output.count('--site-color-74263c'),2)
        self.assertIn('stroke-opacity=".5"',output)
        self.assertIn('Keep #74263c as text',output)
        self.assertIn('const color="#74263c"',output)

    def test_authored_colors_are_discoverable_including_related_wine_shades(self):
        c=catalog(Path(__file__).resolve().parents[1])
        by_key={entry['key']:entry for entry in c['colors']}
        for key in ['74263c','d18b98','842e44','671d31']:self.assertEqual(by_key[key]['family'],'wine')
        self.assertEqual(by_key['30c4a0']['family'],'teal')
        self.assertIn('/assets/brand/interest-atlas.svg',c['svgAssets'])
        self.assertIn('--wine',c['aliases'])

if __name__=='__main__':unittest.main()
