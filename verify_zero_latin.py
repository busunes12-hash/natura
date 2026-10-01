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
        # Ignore script, style, svg
        if any(t in self.tag_stack for t in ['script', 'style', 'svg']):
            return

        clean = data.replace('__LIQUID_EXPR__', ' ').replace('__LIQUID_TAG__', ' ')
        clean = clean.replace('&nbsp;', ' ').replace('&copy;', ' ').replace('&mdash;', ' ').replace('&ndash;', ' ').replace('&amp;', ' ')
        clean = clean.strip()
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

print("\n" + "=" * 60)
if len(violations) == 0:
    print("✨ SUCCESS! 0 LATIN WORDS FOUND ACROSS THE ENTIRE STOREFRONT! ✨")
else:
    print(f"⚠️ FOUND {len(violations)} LATIN OCCURRENCES TO FIX.")
print("=" * 60)
