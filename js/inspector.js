import { $ } from './utils.js';
import { ui, ic } from './icons.js';
import { S, curPage, pushHistory } from './state.js';
import { DEFS, findBlock, countBlocks, pageFile } from './blocks.js';
import { FAM_OPTS, ALIGNS } from './config.js';
import { refreshBlock } from './blockRender.js';
import { hooks } from './hooks.js';

export function setP(prop, val){ const f = findBlock(S.selId); if (!f) return; f.block.props[prop] = val; refreshBlock(S.selId); hooks.save?.(); }

/* ---------- controles ---------- */
const H = t => { const d = document.createElement('div'); d.className='sect'; d.textContent = t; return d; };
function F(label, ctrl){ const f = document.createElement('div'); f.className='fld';
  const l = document.createElement('label'); l.textContent = label; f.append(l, ctrl); return f; }
function inpF(val, on, ph){ const i = document.createElement('input'); i.value = val ?? ''; if (ph) i.placeholder = ph;
  i.addEventListener('input', () => on(i.value)); i.addEventListener('change', pushHistory); return i; }
function taF(val, on, rows, mono){ const t = document.createElement('textarea'); t.rows = rows||3; t.value = val;
  if (mono){ t.style.fontFamily='var(--mono)'; t.style.fontSize='12px'; }
  t.addEventListener('input', () => on(t.value)); t.addEventListener('change', pushHistory); return t; }
function rangeF(min, max, step, val, on){ const w = document.createElement('div'); w.className='rangew';
  const r = document.createElement('input'); Object.assign(r, {type:'range',min,max,step,value:val});
  const o = document.createElement('span'); o.textContent = val;
  r.addEventListener('input', () => { o.textContent = r.value; on(+r.value); });
  r.addEventListener('change', pushHistory); w.append(r, o); return w; }
function selF(opts, val, on){ const s = document.createElement('select');
  opts.forEach(([v,l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l;
    if (String(v) === String(val)) o.selected = true; s.append(o); });
  s.addEventListener('change', () => { on(s.value); pushHistory(); }); return s; }
function segF(opts, val, on){ const w = document.createElement('div'); w.className='seg';
  opts.forEach(([v,l]) => { const b = document.createElement('button'); b.type='button';
    b.innerHTML = ({al:'‹',ac:'≡',ar:'›'}[l] && (l==='al'||l==='ac'||l==='ar')) ? ui(l,14) : l;
    if (String(v) === String(val)) b.classList.add('on');
    b.addEventListener('click', () => { [...w.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); on(v); pushHistory(); });
    w.append(b); });
  return w; }
function colorF(val, on, opts = {}){ const row = document.createElement('div'); row.className='colorrow';
  const c = document.createElement('input'); c.type='color'; c.value = /^#[0-9a-f]{6}$/i.test(val||'') ? val : '#ffffff';
  const t = document.createElement('input'); t.type='text'; t.className='hex'; t.value = val||''; t.placeholder = opts.clear?'transparente':'#000000';
  c.addEventListener('input', () => { t.value = c.value; on(c.value); });
  c.addEventListener('change', pushHistory);
  t.addEventListener('change', () => { let v = t.value.trim();
    if (!v){ if (opts.clear){ on(''); pushHistory(); return; } v = '#000000'; }
    if (v[0] !== '#') v = '#'+v;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)){ t.value = v; if (v.length===7) c.value = v; on(v); pushHistory(); }
    else t.value = val||''; });
  row.append(c, t);
  if (opts.clear){ const x = document.createElement('button'); x.type='button'; x.className='clr'; x.title='Quitar color';
    x.innerHTML = ui('x',13); x.addEventListener('click', () => { t.value=''; on(''); pushHistory(); }); row.append(x); }
  return row; }
function pageSel(val, on, emptyLabel){
  return selF([['', emptyLabel||'— Ninguna —'], ...S.doc.pages.map(pg => ['page:'+pg.id, '📄 '+pg.name])], val||'', on);
}
function linkField(p){
  const wrap = document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;gap:6px';
  const isPage = typeof p.href==='string' && p.href.startsWith('page:') && S.doc.pages.some(pg => 'page:'+pg.id===p.href);
  const sel = document.createElement('select');
  S.doc.pages.forEach(pg => { const o = document.createElement('option'); o.value='page:'+pg.id; o.textContent='📄 Página: '+pg.name;
    if (p.href===o.value) o.selected=true; sel.append(o); });
  const ext = document.createElement('option'); ext.value='ext'; ext.textContent='🔗 URL externa'; if (!isPage) ext.selected=true; sel.append(ext);
  const url = document.createElement('input'); url.placeholder='https://…'; url.value = isPage?'':(p.href||''); url.style.display = isPage?'none':'';
  const note = document.createElement('div'); note.className='note'; note.textContent = isPage?'El enlace apunta a una página de este proyecto.':'';
  sel.addEventListener('change', () => {
    if (sel.value==='ext'){ p.href = url.value||'https://ejemplo.com'; url.style.display=''; note.textContent=''; }
    else { p.href = sel.value; url.style.display='none'; note.textContent='El enlace apunta a una página de este proyecto.'; }
    refreshBlock(S.selId); hooks.save?.(); pushHistory(); });
  url.addEventListener('input', () => { p.href = url.value; refreshBlock(S.selId); hooks.save?.(); });
  url.addEventListener('change', pushHistory);
  wrap.append(sel, url, note); return wrap;
}

/* ---------- render ---------- */
export function renderInspector(){
  const box = $('#insp'); if (!box) return; box.innerHTML = '';
  if (!S.selId || !findBlock(S.selId)){ pageInspector(box);
    $('#insp-title').textContent = 'Página'; $('#insp-icon').innerHTML = ic('page',16); $('#insp-tid').textContent = 'AJUSTES'; return; }
  const b = findBlock(S.selId).block, p = b.props;
  $('#insp-title').textContent = DEFS[b.type].name; $('#insp-icon').innerHTML = ic(b.type,16); $('#insp-tid').textContent = b.id.toUpperCase();

  box.appendChild(H('Contenido'));
  switch(b.type){
    case 'heading': box.append(
      F('Texto', inpF(p.text, v=>setP('text',v))),
      F('Etiqueta', segF([['h1','H1'],['h2','H2'],['h3','H3']], p.tag, v=>setP('tag',v))),
      F('Tamaño', rangeF(16,96,1,p.size, v=>setP('size',v))),
      F('Grosor', rangeF(300,900,100,p.weight, v=>setP('weight',v))),
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Alineación', segF(ALIGNS, p.align, v=>setP('align',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'text': box.append(
      F('Texto', taF(p.text, v=>setP('text',v), 4)),
      F('Tamaño', rangeF(11,42,1,p.size, v=>setP('size',v))),
      F('Grosor', selF([['400','Normal'],['600','Seminegrita'],['700','Negrita']], String(p.weight||400), v=>setP('weight',+v))),
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Alineación', segF(ALIGNS, p.align, v=>setP('align',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'button': box.append(
      F('Etiqueta', inpF(p.label, v=>setP('label',v))),
      F('Enlazar a', linkField(p)),
      F('Abrir en', segF([['_self','Misma pestaña'],['_blank','Nueva pestaña']], p.target, v=>setP('target',v))),
      F('Tamaño', rangeF(12,26,1,p.size, v=>setP('size',v))),
      F('Color de fondo', colorF(p.bg, v=>setP('bg',v))),
      F('Color de texto', colorF(p.color, v=>setP('color',v))),
      F('Redondez', rangeF(0,60,1,p.radius, v=>setP('radius',v))),
      F('Alineación', segF(ALIGNS, p.align, v=>setP('align',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'link': box.append(
      F('Texto del enlace', inpF(p.text, v=>setP('text',v))),
      F('Enlazar a', linkField(p)),
      F('Abrir en', segF([['_self','Misma pestaña'],['_blank','Nueva pestaña']], p.target, v=>setP('target',v))),
      F('Tamaño', rangeF(11,32,1,p.size, v=>setP('size',v))),
      F('Grosor', rangeF(400,800,100,p.weight, v=>setP('weight',v))),
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Alineación', segF(ALIGNS, p.align, v=>setP('align',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'image': { const up = document.createElement('button'); up.type='button'; up.className='btn-s';
      up.innerHTML = ui('download',14) + ' Subir archivo…';
      up.addEventListener('click', () => { const f = document.createElement('input'); f.type='file'; f.accept='image/*';
        f.onchange = () => { const file = f.files[0]; if (!file) return; const r = new FileReader();
          r.onload = () => { setP('src', r.result); pushHistory(); }; r.readAsDataURL(file); }; f.click(); });
      box.append(
        F('URL de la imagen', inpF(p.src, v=>setP('src',v), 'https://…')), up,
        F('Texto alternativo', inpF(p.alt, v=>setP('alt',v))),
        F('Ancho', rangeF(20,100,1,p.width, v=>setP('width',v))),
        F('Redondez', rangeF(0,48,1,p.radius, v=>setP('radius',v))),
        F('Alineación', segF(ALIGNS, p.align, v=>setP('align',v)))); break; }
    case 'video': box.append(
      F('URL (YouTube o embed)', inpF(p.url, v=>setP('url',v), 'https://youtube.com/watch?v=…')),
      F('Redondez', rangeF(0,48,1,p.radius, v=>setP('radius',v)))); break;
    case 'list': box.append(
      F('Elementos (uno por línea)', taF(p.items, v=>setP('items',v), 5)),
      F('Viñeta', selF([['•','• Punto'],['✓','✓ Check'],['→','→ Flecha'],['—','— Guion'],['◆','◆ Rombo']], p.marker, v=>setP('marker',v))),
      F('Espaciado', rangeF(0,30,1,p.spacing, v=>setP('spacing',v))),
      F('Tamaño', rangeF(12,30,1,p.size, v=>setP('size',v))),
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'quote': box.append(
      F('Cita', taF(p.text, v=>setP('text',v), 3)),
      F('Autor', inpF(p.author, v=>setP('author',v))),
      F('Tamaño', rangeF(14,40,1,p.size, v=>setP('size',v))),
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Color de acento', colorF(p.accent, v=>setP('accent',v))),
      F('Tipografía', selF(FAM_OPTS, p.family, v=>setP('family',v)))); break;
    case 'divider': box.append(
      F('Color', colorF(p.color, v=>setP('color',v))),
      F('Grosor', rangeF(1,10,1,p.thickness, v=>setP('thickness',v))),
      F('Estilo', segF([['solid','Sólida'],['dashed','Guiones'],['dotted','Puntos']], p.style, v=>setP('style',v))),
      F('Ancho', rangeF(10,100,1,p.width, v=>setP('width',v)))); break;
    case 'spacer': box.append(F('Altura', rangeF(4,260,2,p.height, v=>setP('height',v)))); break;
    case 'html': box.append(F('Código HTML', taF(p.code, v=>setP('code',v), 7, true))); break;
    case 'section': box.append(
      F('Fondo', colorF(p.bg, v=>setP('bg',v))),
      F('Padding vertical', rangeF(0,140,2,p.padY, v=>setP('padY',v))),
      F('Padding horizontal', rangeF(0,140,2,p.padX, v=>setP('padX',v))),
      F('Redondez', rangeF(0,60,1,p.radius, v=>setP('radius',v)))); break;
    case 'columns': box.append(
      F('Proporción', segF([['1:1','1 : 1'],['1:2','1 : 2'],['2:1','2 : 1']], p.ratio, v=>setP('ratio',v))),
      F('Hueco entre columnas', rangeF(0,64,2,p.gap, v=>setP('gap',v)))); break;
  }

  if (b.type !== 'section' && b.type !== 'spacer'){
    box.appendChild(H('Caja'));
    box.append(
      F('Padding vertical', rangeF(0,120,1,p.padY, v=>setP('padY',v))),
      F('Padding horizontal', rangeF(0,120,1,p.padX, v=>setP('padX',v))),
      F('Fondo del bloque', colorF(p.boxBg, v=>setP('boxBg',v), { clear:true })));
  }

  const acts = document.createElement('div'); acts.className='insp-actions';
  const bd = document.createElement('button'); bd.className='btn-s'; bd.innerHTML = ui('copy',13)+' Duplicar'; bd.onclick = () => hooks.dupSel?.();
  const bx = document.createElement('button'); bx.className='btn-s dngr'; bx.innerHTML = ui('trash',13)+' Eliminar'; bx.onclick = () => hooks.delSel?.();
  acts.append(bd, bx); box.appendChild(acts);
}

export function pageInspector(box){
  const s = S.doc.settings, pg = curPage();
  box.appendChild(H('Página actual'));
  box.append(F('Nombre de la página', inpF(pg.name, v => { pg.name = v || 'Página'; hooks.renderPageTabs?.(); hooks.applySettings?.(); hooks.save?.(); })));
  const pf = document.createElement('div'); pf.className='note';
  pf.innerHTML = `Se exportará como <b style="color:var(--acc2);font-family:var(--mono)">${pageFile(pg)}</b>${S.pageIdx===0?' <i>(página de inicio)</i>':''}.`;
  box.appendChild(pf);

  box.appendChild(H('Estilos del sitio'));
  box.append(
    F('Título del sitio', inpF(s.title, v => { s.title = v; hooks.save?.(); })),
    F('Color de fondo', colorF(s.bg, v => { s.bg = v; hooks.applySettings?.(); hooks.save?.(); })),
    F('Color de texto base', colorF(s.color, v => { s.color = v; hooks.applySettings?.(); hooks.save?.(); })),
    F('Tipografía base', selF(FAM_OPTS, s.font, v => { s.font = v; hooks.applySettings?.(); pushHistory(); })),
    F('Ancho máximo', segF([[720,'Estrecho'],[960,'Medio'],[1140,'Ancho']], s.maxWidth, v => { s.maxWidth = +v; hooks.applySettings?.(); pushHistory(); })));

  box.appendChild(H('Proyecto'));
  const pl = document.createElement('div'); pl.className='plist';
  S.doc.pages.forEach(p => { const r = document.createElement('div'); r.innerHTML = `<b>${p.name}</b><span>${pageFile(p)}</span>`; pl.appendChild(r); });
  box.appendChild(pl);
  const n = document.createElement('div'); n.className='note'; n.style.marginTop='8px';
  n.innerHTML = `<b style="color:var(--tx)">${countBlocks()}</b> bloques en esta página · <b style="color:var(--tx)">${S.doc.pages.length}</b> página(s).`;
  box.appendChild(n);

  const clr = document.createElement('button'); clr.className='btn-s dngr'; clr.style.marginTop='4px';
  clr.innerHTML = ui('trash',13)+' Vaciar esta página';
  clr.onclick = () => { if (confirm('¿Eliminar todos los bloques de esta página?')){ curPage().blocks = []; S.selId = null; hooks.commit?.(); renderInspector(); } };
  box.appendChild(clr);

  const help = document.createElement('button'); help.className='btn-s'; help.style.marginTop='6px';
  help.textContent = 'Ver atajos de teclado'; help.onclick = () => hooks.openHelp?.();
  box.appendChild(help);
}