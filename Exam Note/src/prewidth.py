"""List the longest lines of every <pre class="code"> block in a section file (helps fix CODE TOO WIDE)."""
import html, re, sys
for f in sys.argv[1:]:
    s = open(f).read()
    for i, m in enumerate(re.finditer(r'<pre class="code"[^>]*>(.*?)</pre>', s, re.S)):
        txt = html.unescape(re.sub(r'<[^>]+>', '', m.group(1)))
        lines = txt.split('\n')
        L = max(lines, key=len)
        print(f'{f} pre#{i} line {s[:m.start()].count(chr(10))+1}: max {len(L)}  | {L.strip()[:70]}')
