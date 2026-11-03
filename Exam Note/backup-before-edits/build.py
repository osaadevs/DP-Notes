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
            ("00", "Start"), ("★", "Forecast"), ("B", "Basics"),
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
    "papers": {
        "dir": "papers", "name": "DP Past Papers Answered", "title": "Design Patterns — Past Papers Answered",
        "sections": [("22", "2022"), ("23", "2023"), ("24", "2024"), ("25", "2025")],
    },
}

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
        parts = [p.read_text() for p in files]
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
    url = (OUT / f'{doc["name"]}.html').as_uri()
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    "--virtual-time-budget=15000", f'--print-to-pdf={OUT / (doc["name"] + ".pdf")}', url],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    dom = subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--virtual-time-budget=15000",
                          "--window-size=1200,1600", "--dump-dom", url],
                         capture_output=True, text=True).stdout
    m = re.search(r'<pre id="report">(.*?)</pre>', dom, re.S)
    print(html.unescape(m.group(1)) if m else "NO REPORT FOUND")

if __name__ == "__main__":
    doc = DOCS[next((k for k in DOCS if k in sys.argv), "note")]
    build(doc)
    if "--no-render" not in sys.argv:
        render(doc)
