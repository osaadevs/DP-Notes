"""Builds the exam documents: concatenates sections into one HTML file, prints it to PDF
with headless Chrome and prints the layout report (overflows, diagram warnings).

    python3 build.py           -> the exam note      (sections/)
    python3 build.py papers    -> past papers answered (papers/)
"""
import html, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

DOCS = {
    "note": {
        "dir": "sections", "name": "DP Exam Note", "title": "Design Patterns — Open-Book Exam Note",
        "sections": [  # code, short label for the thumb index
            ("00", "Start"), ("B", "Basics"),
            ("01", "Singleton"), ("02", "Factory"), ("03", "Facade"), ("04", "Adapter"), ("05", "Proxy"),
            ("06", "Decorator"), ("07", "Template"), ("08", "Chain"), ("09", "State"),
            ("10", "SOLID"), ("11", "Micro"), ("12", "Bank"), ("13", "Worked"),
        ],
    },
    "practice": {
        "dir": "practice", "name": "DP Practice Papers", "title": "Design Patterns — Practice Papers",
        "sections": [("P1", "Paper 1"), ("P2", "Paper 2"), ("P3", "Paper 3")], "flow": True, "body": "qonly",
    },
    "answers": {
        "dir": "practice", "name": "DP Practice Papers - Answers", "title": "Design Patterns — Practice Papers with Answers",
        "sections": [("P1", "Paper 1"), ("P2", "Paper 2"), ("P3", "Paper 3")], "flow": True, "body": "aonly",
    },
    "kit": {
        "dir": "kit", "name": "DP UML and Code Kit", "title": "Design Patterns — UML and Code Kit",
        "sections": [("K", "Method"), ("01", "Singleton"), ("02", "Factory"), ("03", "Facade"), ("04", "Adapter"),
                     ("05", "Proxy"), ("06", "Decorator"), ("07", "Template"), ("08", "Chain"), ("09", "State"), ("M", "Micro"), ("P", "Practice")],
    },
    "papers": {
        "dir": "papers", "name": "DP Past Papers Answered", "title": "Design Patterns — Past Papers Answered",
        "sections": [("22", "2022"), ("23", "2023"), ("24", "2024"), ("25", "2025")],
    },
}

KW = r'\b(public|private|protected|static|final|abstract|class|interface|extends|implements|return|new|void|if|else|throw|throws|synchronized|volatile|enum|null|this|super|for|while|try|catch|finally|boolean|int|double|long|default|switch|case|break|true|false|instanceof)\b'

def _hl_line(line):
    code, cmt = line, ''
    for m in re.finditer(r'//|/\*', line):
        if line[:m.start()].count('"') % 2 == 0:
            code, cmt = line[:m.start()], line[m.start():]
            break
    out = []
    for p in re.split(r'("(?:[^"\\]|\\.)*")', code):
        if len(p) >= 2 and p.startswith('"') and p.endswith('"'):
            out.append('<span class="s">%s</span>' % html.escape(p, quote=False))
        else:
            out.append(re.sub(KW, r'<span class="k">\1</span>', html.escape(p, quote=False)))
    if cmt:
        out.append('<span class="c">%s</span>' % html.escape(cmt, quote=False))
    return ''.join(out)

def java_blocks(text):
    """<pre class="code" data-j>raw java</pre>  ->  escaped + highlighted like the hand-written blocks."""
    def rep(m):
        body = m.group(2).strip('\n')
        return '<pre class="code"%s>%s</pre>' % (m.group(1), '\n'.join(_hl_line(l) for l in body.split('\n')))
    return re.sub(r'<pre class="code"([^>]*?) data-j>(.*?)</pre>', rep, text, flags=re.S)

def build(doc):
    css = (ROOT / "style.css").read_text()
    js = (ROOT / "uml.js").read_text()
    files = sorted((ROOT / doc["dir"]).glob("*.html"))
    if doc.get("flow"):  # static pages first, then question chunks flowed into pages by paginate.js
        static = [p.read_text() for p in files if p.name.startswith("00-")]
        flow = [p.read_text() for p in files if not p.name.startswith("00-")]
        parts = static + ['<div id="pages"></div><div id="stage">'] + flow + ['</div>']
        js = (ROOT / "paginate.js").read_text() + "\n" + js
    else:
        parts = [java_blocks(p.read_text()) for p in files]
    secs = ",".join('{code:"%s",short:"%s"}' % s for s in doc["sections"])
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>{doc["title"]}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,600;0,700;1,400&display=block" rel="stylesheet">
<style>{css}</style>
<script>window.SECTIONS=[{secs}];window.DIAGRAMS={{}};</script>
</head><body class="{doc.get('body', '')}">
{''.join(parts)}
<script>{js}</script>
</body></html>"""
    (OUT / f'{doc["name"]}.html').write_text(page)

def render(doc):
    src = OUT / f'{doc["name"]}.html'
    pdf = OUT / (doc["name"] + ".pdf")
    rep = ROOT / "report.txt"
    subprocess.run(["node", str(ROOT / "render.js"), str(src), str(pdf), str(rep)], check=True)
    report = rep.read_text()
    marks = [l.split("|", 3) for l in report.splitlines() if l.startswith("BM|")]
    print("\n".join(l for l in report.splitlines() if not l.startswith("BM|")))
    if marks:
        add_bookmarks(OUT / (doc["name"] + ".pdf"), marks)

def add_bookmarks(pdf_path, marks):
    """Adds a two-level PDF outline: section -> page titles."""
    from pypdf import PdfReader, PdfWriter
    r = PdfReader(str(pdf_path)); w = PdfWriter(); w.append(r)
    parent = None
    for _, lvl, title, page in marks:
        idx = int(page) - 1
        if lvl == "1":
            parent = w.add_outline_item(title, idx)
        else:
            w.add_outline_item(title, idx, parent=parent)
    w.page_mode = "/UseOutlines"
    with open(pdf_path, "wb") as f:
        w.write(f)

if __name__ == "__main__":
    doc = DOCS[next((k for k in DOCS if k in sys.argv), "note")]
    build(doc)
    if "--no-render" not in sys.argv:
        render(doc)
