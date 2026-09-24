import { $, esc } from './utils.js';
import { ic, ui } from './icons.js';
import { S, curPage } from './state.js';
import { DEFS, GROUPS } from './blocks.js';
import { hooks } from './hooks.js';

export function buildPalette(){
  const root = $('#tab-els'); if (!root) return; root.innerHTML = '';
  GROUPS.forEach(([g, types]) => {
    const l = document.createElement('div'); l.className='glabel'; l.textContent = g; root.appendChild(l);
    const grid = document.createElement('div'); grid.className='chips';
    types.forEach(t => {
      const c = document.createElement('div'); c.className='chip'; c.draggable = true;
      c.innerHTML = ic(t,18) + `<span>${DEFS[t].name}</span>`; c.title='Arrastra o haz clic para añadir';
      c.addEventListener('click', () => hooks.addBlock?.(t));
      c.addEventListener('dragstart', e => { S.dragData = { kind:'new', type:t }; e.dataTransfer.effectAllowed='copy'; e.dataTransfer.setData('text/plain', t); });
      c.addEventListener('dragend', () => { S.dragData = null; });
      grid.appendChild(c);
    });
    root.appendChild(grid);
  });
}

export function layerLabel(b){
  const p = b.props;
  switch(b.type){
    case 'heading': case 'text': return p.text;
    case 'button': return p.label; case 'link': return p.text;
    case 'quote': return '"' + p.text + '"';
    case 'list': return p.items.split('\n').filter(Boolean).length + ' elementos';
    case 'section': return 'Sección · ' + p.children.length + ' bloques';
    case 'columns': return 'Columnas ' + p.ratio;
    case 'spacer': return 'Espacio ' + p.height + 'px';
    default: return DEFS[b.type].name;
  }
}

export function renderLayers(){
  const box = $('#layers'); if (!box) return; box.innerHTML = '';
  if (!curPage().blocks.length){ box.innerHTML = '<div style="padding:14px 18px;color:var(--mut);font-size:12px">Sin bloques en esta página.</div>'; return; }
  const add = (b, d) => {
    const r = document.createElement('div'); r.className='lyr'; r.style.setProperty('--d', d); r.dataset.id = b.id;
    if (S.selId === b.id) r.classList.add('on');
    r.innerHTML = ic(b.type,14) + `<span class="nm">${esc(layerLabel(b)).slice(0,30)}</span><button class="rm" title="Eliminar">${ui('x',12)}</button>`;
    r.addEventListener('click', () => { hooks.onBlockClick?.(b.id); document.querySelector(`.blk[data-id="${b.id}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' }); });
    r.querySelector('.rm').addEventListener('click', e => { e.stopPropagation(); hooks.onBlockClick?.(b.id); hooks.delSel?.(); });
    box.appendChild(r);
  };
  const walk = (arr, d) => arr.forEach(b => { add(b, d);
    if (b.type==='section') walk(b.props.children, d+1);
    if (b.type==='columns') b.props.cells.forEach(c => walk(c, d+1)); });
  walk(curPage().blocks, 0);
}