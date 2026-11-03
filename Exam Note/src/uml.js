/* Tiny UML / diagram renderer for the exam note.
   Diagrams are declared in DIAGRAMS[name] = {items:[...], edges:[...]}
   and drawn into <svg class="dg" data-d="name"></svg>.
   All sizes are in px of the viewBox; SCALE converts px -> mm on paper. */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const INK = '#111', GREY = '#555';
  const SANS = '"IBM Plex Sans", Arial, sans-serif';
  const MONO = '"IBM Plex Mono", Menlo, monospace';
  const SCALE = 0.3;            // mm per px
  const REPORT = [];
  const ctx = document.createElement('canvas').getContext('2d');
  const tw = (s, font) => { ctx.font = font; return ctx.measureText(s).width; };

  function E(tag, a, p) {
    const e = document.createElementNS(NS, tag);
    for (const k in a) if (a[k] !== undefined && a[k] !== null) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }
  function T(p, x, y, s, o = {}) {
    const t = E('text', {
      x, y, 'font-family': o.mono ? MONO : SANS, 'font-size': o.size || 9,
      'font-weight': o.bold ? 700 : (o.semi ? 600 : 400), 'font-style': o.italic ? 'italic' : 'normal',
      'text-anchor': o.anchor || 'start', fill: o.fill || INK,
      'text-decoration': o.underline ? 'underline' : null
    }, p);
    if (o.halo) { t.setAttribute('stroke', '#fff'); t.setAttribute('stroke-width', 3.2); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round'); }
    t.textContent = s;
    return t;
  }

  function defs(svg, id) {
    const d = E('defs', {}, svg);
    const mk = (n, w, h, rx, ry, path, fill) => {
      const m = E('marker', { id: id + n, viewBox: `0 0 ${w} ${h}`, refX: rx, refY: ry, markerWidth: w, markerHeight: h, markerUnits: 'userSpaceOnUse', orient: 'auto' }, d);
      E('path', { d: path, fill, stroke: INK, 'stroke-width': 1, 'stroke-linejoin': 'miter' }, m);
    };
    mk('tri', 14, 13, 13.4, 6.5, 'M0.6,0.6 L13.4,6.5 L0.6,12.4 Z', '#fff');   // generalisation / realisation
    mk('open', 11, 10, 10.4, 5, 'M0.6,0.6 L10.4,5 L0.6,9.4', 'none');          // association / dependency
    mk('fill', 10, 8, 10, 4, 'M0,0 L10,4 L0,8 Z', INK);                          // state transition / flow
    mk('dia', 18, 10, 0.6, 5, 'M0.6,5 L9,0.6 L17.4,5 L9,9.4 Z', '#fff');      // aggregation (at the whole)
    mk('fdia', 18, 10, 0.6, 5, 'M0.6,5 L9,0.6 L17.4,5 L9,9.4 Z', INK);         // composition (at the whole)
  }

  /* ---------- items ---------- */
  const LH = 11.6, PAD = 7;
  const F_NAME = `700 10px ${SANS}`, F_STEREO = `italic 8px ${SANS}`, F_MEM = `8.4px ${MONO}`;

  function mem(s) { // '_' prefix = static (underlined), '/' prefix = abstract (italic)
    let underline = false, italic = false;
    while (s[0] === '_' || s[0] === '/') { if (s[0] === '_') underline = true; else italic = true; s = s.slice(1); }
    return { s, underline, italic };
  }

  function drawClass(g, c, name) {
    const ws = [tw(c.name, F_NAME)];
    if (c.stereo) ws.push(tw('«' + c.stereo + '»', F_STEREO));
    [...(c.attrs || []), ...(c.ops || [])].forEach(m => ws.push(tw(mem(m).s, F_MEM)));
    const need = Math.ceil(Math.max(...ws) + PAD * 2);
    const w = Math.max(c.w || 0, need);
    if (c.w && need > c.w + 0.5) REPORT.push(`diagram ${name}: class ${c.name} grew ${c.w}->${need}`);
    const headH = (c.stereo ? 11 : 0) + 18;
    const sec = arr => arr ? (arr.length ? arr.length * LH + 5 : 7) : 0;
    const h = headH + sec(c.attrs) + sec(c.ops);
    const x = c.cx !== undefined ? c.cx - w / 2 : c.x, y = c.y;
    E('rect', { x, y, width: w, height: h, fill: c.shade ? '#ececec' : '#fff', stroke: INK, 'stroke-width': 1 }, g);
    let ty = y + 13;
    if (c.stereo) { T(g, x + w / 2, ty - 1, '«' + c.stereo + '»', { size: 8, italic: true, anchor: 'middle', fill: GREY }); ty += 11; }
    T(g, x + w / 2, ty, c.name, { size: 10, bold: true, anchor: 'middle', italic: !!c.abstract });
    let yy = y + headH;
    for (const arr of [c.attrs, c.ops]) {
      if (!arr) continue;
      E('line', { x1: x, y1: yy, x2: x + w, y2: yy, stroke: INK, 'stroke-width': 1 }, g);
      let ly = yy + 2;
      arr.forEach(m => { const o = mem(m); ly += LH; T(g, x + PAD, ly - 2, o.s, { mono: true, size: 8.4, underline: o.underline, italic: o.italic }); });
      yy += sec(arr);
    }
    return { x, y, w, h };
  }

  function drawNode(g, n) { // generic box with lines; first line bold
    const lines = n.lines || [n.label];
    const fonts = lines.map((_, i) => i === 0 ? `700 ${n.size || 9.5}px ${SANS}` : `${n.small || 8}px ${SANS}`);
    const need = Math.ceil(Math.max(...lines.map((l, i) => tw(l, fonts[i]))) + 16);
    const w = Math.max(n.w || 0, need);
    const h = n.h || (10 + lines.length * 11.5);
    const x = n.cx !== undefined ? n.cx - w / 2 : n.x, y = n.y;
    E('rect', { x, y, width: w, height: h, rx: n.round === undefined ? 4 : n.round, fill: n.dark ? INK : (n.shade ? '#ececec' : '#fff'), stroke: INK, 'stroke-width': n.dark ? 1 : 1, 'stroke-dasharray': n.dashed ? '4 3' : null }, g);
    const top = n.top ? y + 13 : y + h / 2 - (lines.length * 11.5) / 2 + 9;
    lines.forEach((l, i) => T(g, n.align === 'left' ? x + 8 : x + w / 2, top + i * 11.5, l, { size: i === 0 ? (n.size || 9.5) : (n.small || 8), bold: i === 0, anchor: n.align === 'left' ? 'start' : 'middle', fill: n.dark ? '#fff' : (i === 0 ? INK : GREY) }));
    return { x, y, w, h };
  }

  function drawState(g, s) {
    const w = Math.max(s.w || 0, Math.ceil(tw(s.label, `600 9.5px ${SANS}`) + 22));
    const h = s.h || 24;
    const x = s.cx !== undefined ? s.cx - w / 2 : s.x, y = s.y;
    E('rect', { x, y, width: w, height: h, rx: 10, fill: s.shade ? '#ececec' : '#fff', stroke: INK, 'stroke-width': 1.1 }, g);
    T(g, x + w / 2, y + h / 2 + 3.4, s.label, { size: 9.5, semi: true, anchor: 'middle' });
    return { x, y, w, h };
  }

  function drawInit(g, s) { E('circle', { cx: s.cx, cy: s.cy, r: 5, fill: INK }, g); return { x: s.cx - 5, y: s.cy - 5, w: 10, h: 10 }; }
  function drawFinal(g, s) {
    E('circle', { cx: s.cx, cy: s.cy, r: 7.5, fill: '#fff', stroke: INK, 'stroke-width': 1.1 }, g);
    E('circle', { cx: s.cx, cy: s.cy, r: 4.3, fill: INK }, g);
    return { x: s.cx - 7.5, y: s.cy - 7.5, w: 15, h: 15 };
  }
  function drawText(g, t) {
    (t.lines || [t.text]).forEach((l, i) => T(g, t.x, t.y + i * (t.lh || 11), l, { size: t.size || 8.5, italic: t.italic, bold: t.bold && i === 0, anchor: t.anchor, fill: t.fill || GREY, mono: t.mono }));
    return null;
  }

  /* ---------- edges ---------- */
  function anchor(b, side, o, abs) {
    o = o === undefined ? 0.5 : o;
    if (side === 'top') return { x: abs !== undefined ? abs : b.x + b.w * o, y: b.y };
    if (side === 'bottom') return { x: abs !== undefined ? abs : b.x + b.w * o, y: b.y + b.h };
    if (side === 'left') return { x: b.x, y: abs !== undefined ? abs : b.y + b.h * o };
    return { x: b.x + b.w, y: abs !== undefined ? abs : b.y + b.h * o };
  }
  const vert = s => s === 'top' || s === 'bottom';

  function route(p1, s1, p2, s2, e) {
    if (e.loop) { // self-association: out and back on the same side
      const d = e.loop;
      if (vert(s1)) { const y = s1 === 'top' ? Math.min(p1.y, p2.y) - d : Math.max(p1.y, p2.y) + d; return [p1, { x: p1.x, y }, { x: p2.x, y }, p2]; }
      const x = s1 === 'left' ? Math.min(p1.x, p2.x) - d : Math.max(p1.x, p2.x) + d;
      return [p1, { x, y: p1.y }, { x, y: p2.y }, p2];
    }
    if (e.via) return [p1, ...e.via.map(([x, y]) => ({ x, y })), p2];
    if (vert(s1) && vert(s2)) {
      if (Math.abs(p1.x - p2.x) < 0.5) return [p1, p2];
      const my = e.mid !== undefined ? e.mid : (p1.y + p2.y) / 2;
      return [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
    }
    if (!vert(s1) && !vert(s2)) {
      if (Math.abs(p1.y - p2.y) < 0.5) return [p1, p2];
      const mx = e.mid !== undefined ? e.mid : (p1.x + p2.x) / 2;
      return [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
    }
    if (vert(s1)) return [p1, { x: p1.x, y: p2.y }, p2];
    return [p1, { x: p2.x, y: p1.y }, p2];
  }

  const STYLE = {
    realize: { dash: '5 3', end: 'tri' },
    extend: { end: 'tri' },
    assoc: { end: 'open' },
    line: {},
    depend: { dash: '5 3', end: 'open' },
    aggr: { start: 'dia' },
    comp: { start: 'fdia' },
    trans: { end: 'fill' },
    flow: { end: 'fill' },
    dflow: { end: 'fill', dash: '4 3' }
  };

  function drawEdge(g, e, boxes, id, name) {
    const A = boxes[e.a], B = boxes[e.b];
    if (!A || !B) { REPORT.push(`diagram ${name}: missing item ${e.a} or ${e.b}`); return; }
    const p1 = anchor(A, e.as || 'bottom', e.ao, e.ax), p2 = anchor(B, e.bs || 'top', e.bo, e.bx);
    const pts = route(p1, e.as || 'bottom', p2, e.bs || 'top', e);
    const st = STYLE[e.type || 'assoc'];
    E('path', {
      d: 'M' + pts.map(p => `${p.x},${p.y}`).join(' L'), fill: 'none', stroke: INK, 'stroke-width': 1.05,
      'stroke-dasharray': st.dash || null, 'marker-start': st.start ? `url(#${id}${st.start})` : null,
      'marker-end': st.end ? `url(#${id}${st.end})` : null, 'stroke-linejoin': 'round'
    }, g);
    if (e.label) {
      let lx = e.lx, ly = e.ly, anchorTxt = e.lanchor || 'middle';
      if (lx === undefined) {
        let best = 0, seg = [pts[0], pts[1]];
        for (let i = 0; i < pts.length - 1; i++) { const L = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y); if (L > best) { best = L; seg = [pts[i], pts[i + 1]]; } }
        lx = (seg[0].x + seg[1].x) / 2; ly = (seg[0].y + seg[1].y) / 2;
        if (Math.abs(seg[0].y - seg[1].y) < 0.5) ly -= 4; else { lx += 5; ly += 3; anchorTxt = 'start'; }
      }
      T(g, lx, ly, e.label, { size: e.lsize || 8.2, italic: !!e.litalic, anchor: anchorTxt, fill: e.lfill || INK, halo: true, semi: !e.litalic });
    }
    if (e.m1) T(g, p1.x + (e.m1x || 4), p1.y + (e.m1y || 10), e.m1, { size: 8, fill: GREY });
    if (e.m2) T(g, p2.x + (e.m2x || 4), p2.y + (e.m2y || -4), e.m2, { size: 8, fill: GREY });
  }

  function render(svg, name, spec, idx) {
    const id = 'd' + idx + '_';
    defs(svg, id);
    const g = E('g', {}, svg);
    const ge = E('g', {}, g);           // edges below boxes
    const gi = E('g', {}, g);
    const boxes = {};
    for (const it of spec.items) {
      const k = it.k || 'class';
      const b = k === 'class' ? drawClass(gi, it, name) : k === 'node' ? drawNode(gi, it) : k === 'state' ? drawState(gi, it)
        : k === 'init' ? drawInit(gi, it) : k === 'final' ? drawFinal(gi, it) : drawText(gi, it);
      if (it.id) boxes[it.id] = b;
    }
    for (const e of spec.edges || []) drawEdge(ge, e, boxes, id, name);
    // overlap check between boxes
    const ids = Object.keys(boxes);
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const a = boxes[ids[i]], b = boxes[ids[j]];
      if (a.x < b.x + b.w - 0.5 && b.x < a.x + a.w - 0.5 && a.y < b.y + b.h - 0.5 && b.y < a.y + a.h - 0.5) REPORT.push(`diagram ${name}: ${ids[i]} overlaps ${ids[j]}`);
    }
    const bb = g.getBBox(), m = 4;
    svg.setAttribute('viewBox', `${bb.x - m} ${bb.y - m} ${bb.width + 2 * m} ${bb.height + 2 * m}`);
    const wmm = (bb.width + 2 * m) * SCALE * (spec.scale || 1);
    svg.style.width = wmm + 'mm';
    svg.style.maxWidth = '100%';
    svg.style.display = 'block';
    if (spec.center !== false) { svg.style.marginLeft = 'auto'; svg.style.marginRight = 'auto'; }
    svg._check = () => {
      const real = svg.getBoundingClientRect().width / 3.7795;
      if (real < wmm - 1) REPORT.push(`diagram ${name}: scaled down ${wmm.toFixed(0)}mm -> ${real.toFixed(0)}mm`);
    };
  }


  function buildToc() {
    const secs = window.SECTIONS || [];
    const label = c => { const s = secs.find(x => x.code === c); return s ? (c + '  ' + s.short) : c; };
    const pages = [...document.querySelectorAll('.page')];
    const groups = [];
    pages.forEach((p, i) => {
      const h = p.querySelector('.ph h1');
      const title = h ? h.textContent.trim() : '';
      const sec = p.dataset.sec;
      if (!groups.length || groups[groups.length - 1].sec !== sec) groups.push({ sec, rows: [] });
      groups[groups.length - 1].rows.push({ title, page: i + 1 });
    });
    groups.forEach(g => {
      REPORT.push(`BM|1|${label(g.sec)}|${g.rows[0].page}`);
      g.rows.forEach(r => REPORT.push(`BM|2|${r.title}|${r.page}`));
    });
    const toc = document.getElementById('toc');
    if (!toc) return;
    toc.innerHTML = groups.map(g => `<div class="sec"><b class="h"><span>${label(g.sec)}</span></b>` +
      g.rows.filter(r => r.title !== 'Contents').map(r => `<div class="row"><span>${r.title}</span><b>${r.page}</b></div>`).join('') + '</div>').join('');
  }

  function checkPages() {
    const pages = [...document.querySelectorAll('.page')];
    pages.forEach((p, i) => {
      const pn = i + 1;
      const f = p.querySelector('.pnum'); if (f) f.textContent = pn;
      const b = p.querySelector('.body');
      if (!b) return;
      const br = b.getBoundingClientRect();
      let bottom = br.top;
      [...b.children].forEach(c => { bottom = Math.max(bottom, c.getBoundingClientRect().bottom); });
      const free = (br.bottom - bottom) / 3.7795;
      if (free < -0.5) REPORT.push(`PAGE ${pn} OVERFLOW by ${(-free).toFixed(1)}mm`);
      else REPORT.push(`page ${pn} free ${free.toFixed(1)}mm`);
      b.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width && r.right > br.right + 1) REPORT.push(`PAGE ${pn} H-OVERFLOW ${el.tagName}.${el.className} +${((r.right - br.right) / 3.78).toFixed(1)}mm`);
      });
      b.querySelectorAll('pre').forEach(el => { if (el.scrollWidth > el.clientWidth + 1) REPORT.push(`PAGE ${pn} CODE TOO WIDE by ${((el.scrollWidth - el.clientWidth) / 3.78).toFixed(1)}mm: ${el.textContent.slice(0, 40).replace(/\n/g, ' ')}`); });
      b.querySelectorAll('td, th, .cell').forEach(el => { if (el.scrollWidth > el.clientWidth + 1) REPORT.push(`PAGE ${pn} CELL OVERFLOW: ${el.textContent.slice(0, 40)}`); });
    });
    const pre = document.createElement('pre'); pre.id = 'report'; pre.textContent = REPORT.join('\n');
    document.body.appendChild(pre);
    console.log(REPORT.join('\n'));
  }

  function buildTabs() {
    const secs = window.SECTIONS || [];
    document.querySelectorAll('.page').forEach(p => {
      const cur = p.dataset.sec;
      const lad = document.createElement('div'); lad.className = 'ladder';
      secs.forEach(s => {
        const d = document.createElement('div');
        d.className = 'rung' + (s.code === cur ? ' on' : '');
        d.innerHTML = `<b>${s.code}</b>`;
        lad.appendChild(d);
      });
      p.appendChild(lad);
    });
  }

  window.addEventListener('load', () => {
    document.fonts.ready.then(() => {
      const hideAns = document.body.classList.contains('qonly');
      document.querySelectorAll('svg.dg').forEach((svg, i) => {
        if (hideAns && svg.closest('.a, .aonly')) return;   // answers hidden in the question paper
        const name = svg.dataset.d, spec = (window.DIAGRAMS || {})[name];
        if (!spec) { REPORT.push('missing diagram ' + name); return; }
        render(svg, name, spec, i);
      });
      if (window.paginate) window.paginate();
      buildTabs();
      buildToc();
      setTimeout(() => {
        document.querySelectorAll('svg.dg').forEach(s => s._check && s._check());
        checkPages();
      }, 300);
    });
  });
})();
