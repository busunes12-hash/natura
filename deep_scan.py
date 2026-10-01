import os, re, json, sys

sys.stdout.reconfigure(encoding='utf-8')

print("=== DEEP SCAN OF ALL SECTIONS AND SNIPPETS ===")

all_files = []
for folder in ['sections', 'snippets', 'templates', 'layout']:
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.endswith('.liquid') or f.endswith('.json'):
                all_files.append(os.path.join(root, f))

found = 0
for path in sorted(all_files):
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()

    if path.endswith('.json'):
        # scan json strings
        try:
            data = json.load(open(path, 'r', encoding='utf-8'))
            def check_json(o, p=''):
                global found
                if isinstance(o, str):
                    # remove liquid tags
                    c = re.sub(r'\{\{.*?\}\}', '', o)
                    c = re.sub(r'\{%.*?%\}', '', c)
                    # find latin
                    latin = re.findall(r'[A-Za-z]{2,}', c)
                    # ignore technical keys/values
                    tech = ['main', 'header', 'footer', 'index', 'page', 'product', 'collection', 'blog', 'article',
                            'search', 'cart', 'drawer', 'popup', 'announcement', 'hero', 'banner', 'ingredients',
                            'routine', 'why', 'choose', 'before', 'after', 'testimonials', 'press', 'faq', 'newsletter',
                            'cookie', 'consent', 'account', 'login', 'register', 'addresses', 'order', 'list',
                            'showcase', 'bar', 'featured', 'trust', 'all', 'true', 'false', 'type', 'settings',
                            'order', 'sections', 'blocks', 'block_order', 'desktop', 'mobile', 'none', 'auto',
                            'subdued', 'accent', 'outline', 'primary', 'secondary', 'solid', 'transparent',
                            'left', 'center', 'right', 'top', 'bottom', 'start', 'end']
                    latin = [x for x in latin if x.lower() not in tech and not x.startswith('#') and not x.startswith('http')]
                    if latin:
                        print(f"JSON {path} [{p}]: {o}")
                        found += 1
                elif isinstance(o, dict):
                    for k, v in o.items():
                        check_json(v, f"{p}.{k}")
                elif isinstance(o, list):
                    for i, v in enumerate(o):
                        check_json(v, f"{p}[{i}]")
            check_json(data)
        except Exception as e:
            pass
        continue

    # Liquid file
    # 1. check schema
    schemas = re.findall(r'\{%-?\s*schema\s*-?%\}(.*?)\{%-?\s*endschema\s*-?%\}', content, re.DOTALL)
    for s_str in schemas:
        try:
            s_obj = json.loads(s_str)
            def check_s(obj, p=''):
                global found
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        if k in ['label', 'default', 'name', 'info', 'placeholder'] and isinstance(v, str):
                            latin = re.findall(r'[A-Za-z]{2,}', v)
                            tech = ['h1', 'h2', 'h3', 'center', 'left', 'right', 'main-menu', 'all', 'subdued', 'accent',
                                    'small', 'medium', 'large', 'adapt', 'square', 'portrait', 'landscape',
                                    'leaf', 'shield', 'flask', 'star', 'truck', 'badge-check', 'sparkle', 'check',
                                    'circle', 'scroll', 'fixed', 'top', 'bottom', 'slide', 'fade', 'grid', 'carousel', 'none',
                                    'contain', 'cover', 'auto', 'drawer', 'popup', 'page', 'standard',
                                    'button', 'link', 'banner', 'image_first', 'text_first', 'true', 'false',
                                    'best-sellers', 'about', 'contact', 'news', 'privacy', 'terms', 'shipping', 'returns']
                            latin = [x for x in latin if x.lower() not in tech and not x.startswith('/')]
                            if latin:
                                print(f"SCHEMA {path} [{k}]: {v}")
                                found += 1
                        elif isinstance(v, (dict, list)):
                            check_s(v, f"{p}.{k}")
                elif isinstance(obj, list):
                    for i, x in enumerate(obj):
                        check_s(x, f"{p}[{i}]")
            check_s(s_obj)
        except Exception as e:
            pass

    # 2. strip schema, comments, style, script, svg
    no_code = re.sub(r'\{%-?\s*schema\s*-?%\}.*?\{%-?\s*endschema\s*-?%\}', '', content, flags=re.DOTALL)
    no_code = re.sub(r'\{%-?\s*comment\s*-?%\}.*?\{%-?\s*endcomment\s*-?%\}', '', no_code, flags=re.DOTALL)
    no_code = re.sub(r'<!--.*?-->', '', no_code, flags=re.DOTALL)
    no_code = re.sub(r'<style.*?>.*?</style>', '', no_code, flags=re.DOTALL)
    no_code = re.sub(r'<script.*?>.*?</script>', '', no_code, flags=re.DOTALL)
    no_code = re.sub(r'<svg.*?>.*?</svg>', '', no_code, flags=re.DOTALL)

    # 3. Check visible text between > and <
    text_pieces = re.findall(r'>([^<]+)<', no_code)
    for t in text_pieces:
        # strip liquid
        clean = re.sub(r'\{\{.*?\}\}', '', t)
        clean = re.sub(r'\{%.*?%\}', '', clean).strip()
        # strip entities
        clean = re.sub(r'&[a-zA-Z]+;', '', clean)
        latin = re.findall(r'[A-Za-z]{2,}', clean)
        if latin:
            print(f"TEXT {path}: {latin} in \"{clean[:60]}\"")
            found += 1

    # 4. Check user attributes
    for attr in ['placeholder', 'alt', 'title']:
        matches = re.findall(rf'{attr}=["\']([^"\']+)["\']', no_code)
        for m in matches:
            clean = re.sub(r'\{\{.*?\}\}', '', m)
            clean = re.sub(r'\{%.*?%\}', '', clean)
            latin = re.findall(r'[A-Za-z]{2,}', clean)
            latin = [x for x in latin if not any(x in m for x in ['jpg', 'png', 'webp', 'svg', 'http', 'shopify'])]
            if latin:
                print(f"ATTR {path} [{attr}]: {m}")
                found += 1

print(f"\nScan done! Found {found} potential items.")
