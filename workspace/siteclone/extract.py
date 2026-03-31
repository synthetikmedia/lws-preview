import html.parser, re, os

class TextExtractor(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip = False
        self.skip_tags = {'script', 'style', 'noscript'}
        self.depth = 0
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip = True
            self.depth += 1
    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.depth -= 1
            if self.depth <= 0:
                self.skip = False
                self.depth = 0
    def handle_data(self, data):
        if not self.skip:
            t = data.strip()
            if t:
                self.text.append(t)

base = 'C:/Users/canaa/.openclaw/workspace/siteclone/output/www.lightwavesolar.com'
files = []
for root, dirs, fnames in os.walk(base):
    for f in fnames:
        if f == 'index.html':
            files.append(os.path.join(root, f))
files.sort()

out = open('C:/Users/canaa/.openclaw/workspace/siteclone/extracted_text.txt', 'w', encoding='utf-8')
for fpath in files:
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    content = re.sub(r'<head[^>]*>.*?</head>', '', content, flags=re.DOTALL)
    parser = TextExtractor()
    parser.feed(content)
    text = ' '.join(parser.text)
    text = re.sub(r'\s+', ' ', text)
    rel = fpath.replace(base + '/', '').replace(base + '\\', '')
    out.write(f'===== PAGE: {rel} =====\n')
    out.write(text[:8000])
    out.write('\n\n')
out.close()
print(f'Done. Extracted {len(files)} pages.')
