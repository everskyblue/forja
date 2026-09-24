import { $, $$, openModal, closeModal, toast, download, slug } from './utils.js';
import { ui } from './icons.js';
import { S, snapshot, undo, redo } from './state.js';
import { TPLS, pageFile } from './blocks.js';
import { hooks } from './hooks.js';
import { LOGO, ZOOMS } from './config.js';
import * as canvas    from './canvas.js';
import * as inspector from './inspector.js';
import * as palette   from './palette.js';
import * as pages     from './pages.js';
import * as storage   from './storage.js';
import * as exporter  from './exporter.js';
/* ---------- composición ---------- */
function setupHooks(){
  hooks.render              = canvas.render;
  hooks.renderInspector     = inspector.renderInspector;
  hooks.renderLayers        = palette.renderLayers;
  hooks.renderPageTabs      = pages.renderPageTabs;
  hooks.renderProjectSelector = storage.renderProjectSelector;
  hooks.applySettings       = canvas.applySettings;
  hooks.save                = storage.save;
  hooks.addBlock            = canvas.addBlockAtEnd;
  hooks.dupSel              = canvas.dupSel;
  hooks.delSel              = canvas.delSel;
  hooks.moveSel             = canvas.moveSel;
  hooks.navPage             = pages.switchToPageById;
  hooks.onBlockClick        = canvas.select;
  hooks.onBlockEdit         = canvas.startEdit;
  hooks.undo                = undo;
  hooks.redo                = redo;
  hooks.commit              = canvas.commit;
  hooks.openNewModal        = openNewModal;
  hooks.openHelp            = openHelp;
  hooks.closeModal          = closeModal;
  hooks.togglePreview       = togglePreview;
  hooks.updHistBtns         = updHistBtns;
  hooks.afterApplySnap      = renderAll;
}

function renderAll(){
  pages.renderPageTabs();
  canvas.applySettings();
  canvas.render();
  inspector.renderInspector();
  canvas.updateCounts();
}

export function updHistBtns(){
  const u = $('#btn-undo'), r = $('#btn-redo');
  if (u) u.disabled = S.hp <= 0;
  if (r) r.disabled = S.hp >= S.hist.length - 1;
}

function togglePreview(){
  S.previewing = !S.previewing;
  document.body.classList.toggle('preview', S.previewing);
  if (S.previewing) canvas.select(null);
  setPrevIcon(); canvas.applyZoom();
}
function setPrevIcon(){
  const b = $('#btn-preview'); if (!b) return;
  b.innerHTML = S.previewing ? ui('edit',15)+' Editar' : ui('eye',15)+' Vista previa';
}

function openNewModal(){
  let cards = '';
  TPLS.forEach(t => { cards += `<div class="tpl" data-k="${t.key}">
    <div class="thumb" style="background:${t.bg}">
      <div style="height:10px;width:60%;border-radius:3px;background:${t.acc}"></div>
      <div style="height:6px;width:85%;border-radius:3px;background:${t.acc};opacity:.35"></div>
      <div style="height:14px;width:34%;border-radius:7px;background:${t.acc};margin-top:10px"></div>
    </div><div class="tinfo"><b>${t.name}</b><span>${t.desc}</span></div></div>`; });
  openModal(`<div class="mhead"><h2>Nuevo proyecto</h2><button class="ib" onclick="document.getElementById('overlay').classList.add('hidden')">${ui('x',16)}</button></div>
    <p class="msub">Elige una plantilla para empezar.</p><div class="tpls">${cards}</div>`);
  $$('#modal .tpl').forEach(el => el.addEventListener('click', () => {
    const t = TPLS.find(x => x.key === el.dataset.k);
    if (S.doc.pages.some(p => p.blocks.length) && !confirm('Se descartarán los cambios actuales. ¿Continuar?')) return;
    S.doc = t.make(); resetAll(); closeModal();
  }));
}

function openHelp(){
  openModal(`<div class="mhead"><h2>Atajos</h2><button class="ib" onclick="document.getElementById('overlay').classList.add('hidden')">${ui('x',16)}</button></div>
    <div class="keys">
      <div>Deshacer<kbd>Ctrl + Z</kbd></div><div>Rehacer<kbd>Ctrl + Shift + Z</kbd></div>
      <div>Duplicar<kbd>Ctrl + D</kbd></div><div>Eliminar<kbd>Supr</kbd></div>
      <div>Editar texto<kbd>doble clic</kbd></div><div>Deseleccionar<kbd>Esc</kbd></div>
    </div>`);
}

function resetAll(){
  S.pageIdx = 0; S.selId = null; S.hist = [snapshot()]; S.hp = 0;
  updHistBtns(); const pn = $('#pname'); if (pn) pn.value = S.doc.name;
  renderAll(); storage.save();
}

/* ---------- bindUI ---------- */
function bindUI(){
  $('#btn-new').innerHTML = ui('plus'); $('#btn-open').innerHTML = ui('open'); $('#btn-save').innerHTML = ui('save');
  $('#btn-undo').innerHTML = ui('undo'); $('#btn-redo').innerHTML = ui('redo');
  $('#bt-up').innerHTML = ui('up',14); $('#bt-down').innerHTML = ui('down',14);
  $('#bt-dup').innerHTML = ui('copy',14); $('#bt-del').innerHTML = ui('trash',14);
  $('#add-page').innerHTML = ui('plus',13) + ' Página';
  $('#btn-export').innerHTML = ui('download',15) + ' Exportar ' + ui('caret',13);
  $('#btn-left').innerHTML = ui('panelL',16); $('#btn-right').innerHTML = ui('panelR',16);

  const syncTgl = () => { $('#btn-left').classList.toggle('on', !document.body.classList.contains('no-left'));
    $('#btn-right').classList.toggle('on', !document.body.classList.contains('no-right')); };
  syncTgl();
  $('#btn-left').addEventListener('click', () => { document.body.classList.toggle('no-left'); syncTgl(); canvas.applyZoom(); storage.save(); });
  $('#btn-right').addEventListener('click', () => { document.body.classList.toggle('no-right'); syncTgl(); canvas.applyZoom(); storage.save(); });
  setPrevIcon();

  $$('.devseg button').forEach(b => { const dv = b.dataset.dev;
    b.innerHTML = ui({desktop:'monitor',tablet:'tablet',phone:'phone'}[dv],15);
    b.classList.toggle('on', dv === S.device);
    b.addEventListener('click', () => { S.device = dv;
      $$('.devseg button').forEach(x => x.classList.toggle('on', x === b));
      canvas.applyZoom(); canvas.updateCounts(); storage.save(); }); });

  const pn = $('#pname'); pn.value = S.doc.name;
  pn.addEventListener('input', e => { S.doc.name = e.target.value; canvas.applySettings(); storage.save(); });

  $('#add-page').addEventListener('click', () => pages.addPage());
  $('#btn-new').onclick = openNewModal;
  $('#btn-save').onclick = () => download((slug(S.doc.name)||'proyecto')+'.json', JSON.stringify({app:'forja',v:2,doc:S.doc},null,2), 'application/json');
  $('#btn-open').onclick = () => $('#file-json').click();
  $('#file-json').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => { try{ const d = storage.normalizeDoc(JSON.parse(r.result));
      if (!d) throw 0;
      if (S.doc.pages.some(p => p.blocks.length) && !confirm('Se reemplazará el proyecto actual. ¿Abrir?')) return;
      S.doc = d; resetAll(); }catch(err){ toast('Archivo no válido'); } };
    r.readAsText(f); e.target.value = ''; });

  $('#btn-undo').onclick = () => undo();
  $('#btn-redo').onclick = () => redo();
  $('#btn-preview').onclick = togglePreview;
  $('#exit-preview').onclick = togglePreview;   // ← añadir esta línea
  
  $('#project-sel')?.addEventListener('change', storage.onProjectChange);

  $('#btn-export').addEventListener('click', e => { e.stopPropagation(); $('#expmenu').classList.toggle('hidden'); });
  document.addEventListener('click', e => { if (!e.target.closest('.expwrap')) $('#expmenu').classList.add('hidden'); });
  $$('#expmenu button').forEach(b => b.addEventListener('click', () => {
    $('#expmenu').classList.add('hidden');
    const a = b.dataset.a, n = slug(S.doc.name) || 'mi-proyecto';
    if (a === 'zip'){ const enc = new TextEncoder();
      const files = S.doc.pages.map(pg => ({ name:pageFile(pg), data:enc.encode(exporter.exportPageHTML(pg)) }));
      download(n + '.zip', exporter.makeZip(files)); }
    if (a === 'html') download(slug(S.doc.pages[S.pageIdx].name || 'pagina') + '.html', exporter.exportPageHTML(S.doc.pages[S.pageIdx]), 'text/html');
    if (a === 'copy'){ const h = exporter.exportPageHTML(S.doc.pages[S.pageIdx]);
      navigator.clipboard?.writeText(h).then(() => toast('HTML copiado')).catch(() => toast('No se pudo copiar')); }
    if (a === 'json') download(n + '.json', JSON.stringify({app:'forja',v:2,doc:S.doc},null,2), 'application/json');
    if (a === 'import') $('#btn-open').click();
  }));

  $('#bt-up').onclick = () => canvas.moveSel(-1);
  $('#bt-down').onclick = () => canvas.moveSel(1);
  $('#bt-dup').onclick = () => canvas.dupSel();
  $('#bt-del').onclick = () => canvas.delSel();

  $$('.tabs button').forEach(b => b.addEventListener('click', () => {
    $$('.tabs button').forEach(x => x.classList.toggle('on', x === b));
    $('#tab-els').classList.toggle('hidden', b.dataset.t !== 'els');
    $('#tab-layers').classList.toggle('hidden', b.dataset.t !== 'layers'); }));

  $('#page-el').addEventListener('click', e => { if (!e.target.closest('.blk')) canvas.select(null); });
  $('#canvas-scroll').addEventListener('wheel', e => { if (e.ctrlKey){ e.preventDefault(); zoomWheel(e.deltaY < 0 ? 1 : -1); } }, { passive:false });
  $('#z-in').onclick = () => zoomWheel(1);
  $('#z-out').onclick = () => zoomWheel(-1);
  $('#z-fit').onclick = () => { const cw = $('#canvas-scroll').clientWidth - 90;
    S.zoom = [1.5,1.25,1.1,1,.9,.8,.65,.5].find(z => z <= 1 && (S.doc.settings.maxWidth * z) <= cw) || .5;
    canvas.applyZoom(); storage.save(); };
  $('#btn-help').onclick = openHelp;
}
function zoomWheel(dir){
  const i = ZOOMS.indexOf(S.zoom);
  const ni = Math.min(ZOOMS.length-1, Math.max(0, (i<0?4:i) + dir));
  S.zoom = ZOOMS[ni]; canvas.applyZoom(); storage.save();
}

/* ---------- plantilla HTML del editor ---------- */
const EDITOR_HTML = `
<div class="editor-root">
  <header id="top">
    <div class="brand">${LOGO}<div class="bt"><b>FORJA</b><span>editor visual</span></div></div>
    <input id="pname" title="Nombre del proyecto" spellcheck="false">
    <select id="project-sel" title="Tus proyectos"></select>
    <div class="tools">
      <button class="ib" id="btn-new" title="Nuevo"></button>
      <button class="ib" id="btn-open" title="Abrir (.json)"></button>
      <button class="ib" id="btn-save" title="Guardar (.json)"></button>
      <span class="vsep"></span>
      <button class="ib" id="btn-undo" title="Deshacer"></button>
      <button class="ib" id="btn-redo" title="Rehacer"></button>
      <span class="vsep"></span>
      <div class="devseg">
        <button data-dev="desktop" title="Escritorio"></button>
        <button data-dev="tablet" title="Tableta"></button>
        <button data-dev="phone" title="Móvil"></button>
      </div>
    </div>
    <div class="right">
      <button class="ib tgl on" id="btn-left" title="Panel elementos"></button>
      <button class="ib tgl on" id="btn-right" title="Inspector"></button>
      <span class="vsep"></span>
      <button class="ghost" id="btn-preview"></button>
      <div class="expwrap">
        <button id="btn-export" class="primary"></button>
        <div id="expmenu" class="hidden">
          <button data-a="zip">Descargar sitio (.zip)</button>
          <button data-a="html">Descargar página (.html)</button>
          <button data-a="copy">Copiar HTML</button>
          <div class="msep"></div>
          <button data-a="json">Guardar proyecto (.json)</button>
          <button data-a="import">Importar proyecto…</button>
        </div>
      </div>
    </div>
  </header>
  <div id="pagesbar">
    <div id="page-tabs" style="display:flex;gap:8px"></div>
    <button id="add-page"></button>
    <span class="hint">doble clic para renombrar</span>
  </div>
  <div id="main">
    <aside id="left">
      <div class="tabs"><button class="on" data-t="els">Elementos</button><button data-t="layers">Capas</button></div>
      <div id="tab-els"></div>
      <div id="tab-layers" class="hidden"><div id="layers" style="padding:10px 0 20px"></div></div>
    </aside>
    <section id="center">
      <div id="canvas-scroll">
        <div id="frame"><div id="artboard">
          <div class="bbar"><span class="d" style="background:#ff5f57"></span><span class="d" style="background:#febc2e"></span><span class="d" style="background:#28c840"></span><span class="url" id="bbar-url"></span></div>
          <div id="page-el"><div id="ab-body" class="dropzone" data-path="root">
            <div id="ab-empty"><b>Lienzo vacío</b><span>Arrastra bloques desde la izquierda.</span></div>
          </div></div>
        </div></div>
        <div id="btools"><button id="bt-up"></button><button id="bt-down"></button><button id="bt-dup"></button><button id="bt-del" class="dngr"></button></div>
      </div>
    </section>
    <aside id="right">
      <div class="rhead"><span id="insp-icon"></span><b id="insp-title">Página</b><span class="tid" id="insp-tid"></span></div>
      <div id="insp"></div>
    </aside>
  </div>
  <footer id="status">
    <div class="sl"><span class="dot" id="save-dot"></span><span id="st-msg">Listo</span><span style="opacity:.4">·</span><span id="st-count"></span></div>
    <div class="sc">Doble clic para editar</div>
    <div class="sr"><button id="z-out">−</button><span id="zoom-val" style="min-width:42px;text-align:center">100%</span><button id="z-in">+</button><button id="z-fit">ajustar</button><span class="vsep"></span><button id="btn-help">?</button></div>
  </footer>
  <input type="file" id="file-json" accept=".json,application/json" class="hidden">
  <button id="exit-preview" class="exit-preview" title="Salir de vista previa (Esc)">${ui('edit',15)} Editar</button>
</div>`;

/* ---------- vista exportada ---------- */
export default {
  title: 'Forja — Editor',
  route: 'app',
  persistent: true,
  render: () => EDITOR_HTML,
  mount(){
    setupHooks();
    storage.loadLocal();
    palette.buildPalette();
    bindUI();
    canvas.bindCanvas();
    S.hist = [snapshot()]; S.hp = 0; updHistBtns();
    renderAll();
    storage.initSession();
  },
  remount(){ requestAnimationFrame(() => { canvas.applyZoom(); canvas.positionToolbar(); }); },
  onLeave(){ storage.save(); },
};