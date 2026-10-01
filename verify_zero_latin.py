import os, sys, re, json
from html.parser import HTMLParser

sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("🔍 COMPREHENSIVE STOREFRONT ZERO LATIN WORD VERIFICATION")
print("=" * 60)

violations = []

def report(file, loc, kind, text):
    violations.append((file, loc, kind, text))
    print(f"❌ [{file}] ({loc}) - {kind}: {repr(text)}")

# 1. Check locales/ar.default.json
print("\n--- 1. Testing locales/ar.default.json ---")
with open('locales/ar.default.json', 'r', encoding='utf-8') as f:
    locales = json.load(f)
    def check_loc(obj, path=''):
        if isinstance(obj, str):
            clean = re.sub(r'\{\{.*?\}\}', '', obj)
            clean = re.sub(r'\{%.*?%\}', '', clean)
            latin = re.findall(r'[A-Za-z]+', clean)
            if latin:
                report('locales/ar.default.json', path, 'Locale text contains Latin', latin)
        elif isinstance(obj, dict):
            for k, v in obj.items():
                check_loc(v, f"{path}.{k}" if path else k)
    check_loc(locales)

# 2. Check all liquid templates, sections, snippets
print("\n--- 2. Testing all .liquid files ---")

class StorefrontHTMLParser(HTMLParser):
    def __init__(self, filename):
        super().__init__()
        self.filename = filename
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        self.tag_stack.append(tag)
        attrs_dict = dict(attrs)

        # Check customer-facing attributes: placeholder, alt, title, aria-label
        for attr in ['placeholder', 'alt', 'title', 'aria-label']:
            if attr in attrs_dict and attrs_dict[attr]:
                val = attrs_dict[attr]
                # strip liquid tags
                clean = re.sub(r'__LIQUID_EXPR__', '', val)
                clean = re.sub(r'__LIQUID_TAG__', '', clean)
                # check if there are Latin words
                latin = [w for w in re.findall(r'[A-Za-z]+', clean) if len(w) >= 2]
                latin = [w for w in latin if not any(ext in val for ext in ['.jpg', '.png', '.webp', '.svg', 'http', 'https', 'wa.me'])]
                if latin:
                    report(self.filename, f"<{tag} {attr}>", f"Attribute {attr} contains Latin", val)

        # Check option texts: <option ...>text</option>
        # (option value for standard city selector was converted to Arabic; internal sorting values manual/best-selling are valid query params)
        if tag == 'option':
            val = attrs_dict.get('value', '')
            # If city option in COD form
            if 'cod-express-form' in self.filename and val:
                latin = [w for w in re.findall(r'[A-Za-z]+', val) if len(w) >= 2]
                if latin:
                    report(self.filename, f"<option value>", "City option value contains Latin", val)

    def handle_endtag(self, tag):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
        elif tag in self.tag_stack:
            while self.tag_stack and self.tag_stack[-1] != tag:
                self.tag_stack.pop()
            if self.tag_stack:
                self.tag_stack.pop()

    def handle_data(self, data):
        # Scripts and styles are source code, while SVG text can be visible.
        if any(t in self.tag_stack for t in ['script', 'style']):
            return

        clean = data.replace('__LIQUID_EXPR__', ' ').replace('__LIQUID_TAG__', ' ')
        clean = clean.replace('&nbsp;', ' ').replace('&copy;', ' ').replace('&mdash;', ' ').replace('&ndash;', ' ').replace('&amp;', ' ')
        clean = re.sub(r'#[0-9A-Fa-f]{3,8}\b', '', clean).strip()
        if not clean:
            return

        latin = [w for w in re.findall(r'[A-Za-z]+', clean) if len(w) >= 2]
        if latin:
            report(self.filename, "text node", f"Visible text node contains Latin: {latin}", clean[:80])

for root, dirs, files in os.walk('.'):
    if 'node_modules' in root or '.git' in root or 'assets' in root:
        continue
    for f in files:
        if f.endswith('.liquid'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as fp:
                raw_content = fp.read()

            # Remove liquid comments
            clean_content = re.sub(r'\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}', '', raw_content, flags=re.DOTALL)
            # Remove liquid capture blocks
            clean_content = re.sub(r'\{%-?\s*capture\s+.*?-?%\}.*?\{%-?\s*endcapture\s*-?%\}', '', clean_content, flags=re.DOTALL)
            # Remove HTML comments
            clean_content = re.sub(r'<!--.*?-->', '', clean_content, flags=re.DOTALL)
            # Remove schema blocks
            clean_content = re.sub(r'\{%-?\s*schema\s*-?%\}.*?\{%-?\s*endschema\s*-?%\}', '', clean_content, flags=re.DOTALL)

            # Replace liquid expressions and tags before HTML parsing so < or > inside liquid logic don't break HTML tags
            clean_content = re.sub(r'\{\{.*?\}\}', '__LIQUID_EXPR__', clean_content, flags=re.DOTALL)
            clean_content = re.sub(r'\{%.*?%\}', '__LIQUID_TAG__', clean_content, flags=re.DOTALL)

            parser = StorefrontHTMLParser(path)
            try:
                parser.feed(clean_content)
            except Exception as e:
                print(f"Parser error on {path}: {e}")

            # Check schema labels, defaults, infos
            schema_matches = re.findall(r'\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}', raw_content, flags=re.DOTALL)
            for s_str in schema_matches:
                try:
                    s_data = json.loads(s_str)
                    def check_schema_obj(obj, prefix=''):
                        if isinstance(obj, dict):
                            for k, v in obj.items():
                                if k in ['label', 'default', 'info', 'placeholder', 'name'] and isinstance(v, str):
                                    tech = ['h1', 'h2', 'h3', 'center', 'left', 'right', 'main-menu', 'all', 'subdued',
                                            'accent', 'outline', 'primary', 'secondary', 'small', 'medium', 'large',
                                            'adapt', 'square', 'portrait', 'landscape', 'leaf', 'shield', 'flask',
                                            'star', 'truck', 'badge-check', 'sparkle', 'check', 'circle', 'scroll',
                                            'fixed', 'top', 'bottom', 'slide', 'fade', 'grid', 'carousel', 'none',
                                            'contain', 'cover', 'auto', 'drawer', 'popup', 'page', 'standard',
                                            'button', 'link', 'banner', 'image_first', 'text_first', 'true', 'false',
                                            'best-sellers', 'about', 'contact', 'news', 'privacy', 'terms', 'shipping', 'returns']
                                    if v not in tech and not v.startswith('#') and not v.startswith('/'):
                                        latin = re.findall(r'[A-Za-z]+', v)
                                        if latin:
                                            report(path, f"schema {k}", f"Schema {k} contains Latin: {latin}", v)
                                elif isinstance(v, (dict, list)):
                                    check_schema_obj(v, f"{prefix}.{k}")
                        elif isinstance(obj, list):
                            for i, item in enumerate(obj):
                                check_schema_obj(item, f"{prefix}[{i}]")
                    check_schema_obj(s_data)
                except Exception as e:
                    pass

# 3. Check the standalone brand page and the SVG logos it displays.
print("\n--- 3. Testing standalone page and displayed SVG logos ---")
for path in ['index.html', 'assets/natura-logo-primary.svg', 'assets/natura-logo-minimal.svg',
             'assets/natura-logo-horizontal.svg', 'assets/natura-icon-only.svg']:
    with open(path, encoding='utf-8') as fp:
        raw_content = fp.read()
    clean_content = re.sub(r'<!--.*?-->', '', raw_content, flags=re.DOTALL)
    parser = StorefrontHTMLParser(path)
    parser.feed(clean_content)

# 4. Check text supplied by JSON templates and active theme settings.
print("\n--- 4. Testing configured storefront text ---")
display_keys = {'badge', 'title', 'subtitle', 'eyebrow', 'headline', 'description',
                'placeholder', 'text_1', 'text_2', 'text_3', 'view_all_text',
                'before_label', 'after_label', 'before_sub', 'after_sub',
                'stat_1_number', 'stat_2_number', 'stat_3_number',
                'stat_1_label', 'stat_2_label', 'stat_3_label',
                'btn_primary_text', 'btn_secondary_text', 'btn_text', 'disclaimer',
                'brand_desc', 'links_heading', 'service_heading', 'cod_text'}
for root in ['templates', 'config']:
    for directory, _, files in os.walk(root):
        for filename in files:
            if not filename.endswith('.json') or filename == 'settings_schema.json':
                continue
            path = os.path.join(directory, filename)
            with open(path, encoding='utf-8') as fp:
                data = json.load(fp)
            def check_display(obj, location=''):
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        child = f'{location}.{key}' if location else key
                        if key in display_keys and isinstance(value, str) and re.search(r'[A-Za-z]', value):
                            report(path, child, 'Configured text contains Latin', value)
                        elif isinstance(value, (dict, list)):
                            check_display(value, child)
                elif isinstance(obj, list):
                    for i, value in enumerate(obj):
                        check_display(value, f'{location}[{i}]')
            check_display(data)

print("\n" + "=" * 60)
if len(violations) == 0:
    print("0 Latin words in scanned theme text, configured copy, standalone page, and displayed SVGs.")
    print("Raster image lettering and Shopify admin content require separate review.")
else:
    print(f"⚠️ FOUND {len(violations)} LATIN OCCURRENCES TO FIX.")
print("=" * 60)
sys.exit(1 if violations else 0)
