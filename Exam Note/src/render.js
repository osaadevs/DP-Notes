// Linux replacement for the macOS Chrome call in build.py:
// node render.js <in.html> <out.pdf> <report.txt>
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [, , inp, out, rep] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1600 } });
  await p.goto('file://' + inp, { waitUntil: 'networkidle' });
  await p.waitForSelector('#report', { state: 'attached', timeout: 60000 });
  const report = await p.$eval('#report', e => e.textContent);
  fs.writeFileSync(rep, report);
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
  await b.close();
})();
