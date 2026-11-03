/* Flows .chunk blocks from #stage into fixed A4 pages inside #pages.
   A chunk = one question. Its children are blocks that are never split. */
window.paginate = function () {
  const stage = document.getElementById('stage'), out = document.getElementById('pages');
  if (!stage || !out) return;

  function newPage(ch, cont) {
    const p = document.createElement('section');
    p.className = 'page';
    p.dataset.sec = ch.dataset.sec;
    const title = ch.dataset.title + (cont ? ' (cont.)' : '');
    const lede = cont ? 'continued' : (ch.dataset.lede || '');
    p.innerHTML = `<div class="body"><header class="ph"><div class="code">${ch.dataset.code}</div>
      <div><h1>${title}</h1><div class="lede">${lede}</div></div>
      <div class="meta">${ch.dataset.meta || ''}</div></header></div>
      <div class="foot"><span>${ch.dataset.foot || ''}</span><span>page <b class="pnum"></b></span></div>`;
    out.appendChild(p);
    return p.querySelector('.body');
  }
  function overflows(body) {
    const limit = body.getBoundingClientRect().bottom;
    const last = body.lastElementChild;
    return last.getBoundingClientRect().bottom > limit + 0.5;
  }

  [...stage.querySelectorAll(':scope > .chunk')].forEach(ch => {
    let cont = 0, body = newPage(ch, cont);
    [...ch.children].forEach(b => {
      if (getComputedStyle(b).display === 'none') return;
      body.appendChild(b);
      if (overflows(body) && body.children.length > 2) {
        body.removeChild(b);
        body = newPage(ch, ++cont);
        body.appendChild(b);
      }
    });
  });
  stage.remove();
};
