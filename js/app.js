/* ============ zoom / settings ============ */
function applySettings(){
  const s = doc.settings, pg = $('#page-el');
  pg.style.background = s.bg; pg.style.color = s.color; pg.style.fontFamily = FONTS[s.font].css;
  $('#bbar-url').textContent = (slug(doc.name)||'mi-sitio')+'.forja.app/'+(pageIdx===0?'':pageFile(curPage()));
  applyZoom();
}
function applyZoom(){
  const ab = $('#artboard'), f = $('#frame');
  ab.style.width = abW()+'px'; ab.style.transform = `scale(${zoom})`;
  f.style.width = (abW()*zoom)+'px';
  requestAnimationFrame(()=>{ f.style.height = (ab.offsetHeight*zoom)+'px'; positionToolbar(); });
  $('#zoom-val').textContent = Math.round(zoom*100)+'%';
}
function zoomStep(dir){
  const i = ZOOMS.indexOf(zoom);
  const ni = Math.min(ZOOMS.length-1, Math.max(0, (i<0?4:i)+dir));
  zoom = ZOOMS[ni]; applyZoom(); save();
}
function zoomFit(){
  const cw = $('#canvas-scroll').clientWidth - 90;
  zoom = [...ZOOMS].reverse().find(z=>abW()*z<=cw) || .5;
  if(zoom>1) zoom = 1;
  applyZoom(); save();
}
function updateCounts(){
  $('#st-count').textContent = `${countBlocks()} bloques · ${doc.pages.length} página${doc.pages.length!==1?'s':''} · ${devName()} ${abW()}px`;
}

/* ============ modales ============ */
function openNewModal(){
  let cards = '';
  TPLS.forEach(t=>{ cards += `<div class="tpl" data-k="${t.key}">
    <div class="thumb" style="background:${t.bg}">
      <div style="height:10px;width:60%;border-radius:3px;background:${t.acc}"></div>
      <div style="height:6px;width:85%;border-radius:3px;background:${t.acc};opacity:.35"></div>
      <div style="height:6px;width:70%;border-radius:3px;background:${t.acc};opacity:.25"></div>
      <div style="height:14px;width:34%;border-radius:7px;background:${t.acc};margin-top:6px"></div>
    </div>
    <div class="tinfo"><b>${t.name}</b><span>${t.desc}</span></div></div>`; });
  openModal(`<div class="mhead"><h2>Nuevo proyecto</h2><button class="ib" onclick="closeModal()">${ui('x',16)}</button></div>
  <p class="msub">Elige una plantilla para empezar.</p>
  <div class="tpls">${cards}</div>`);
  $$('#modal .tpl').forEach(el=>el.addEventListener('click', ()=>{
    const t = TPLS.find(x=>x.key===el.dataset.k);
    if(doc.pages.some(p=>p.blocks.length) && !confirm('Se descartarán los cambios actuales. ¿Continuar?')) return;
    doc = t.make(); resetAll(); closeModal(); toast('Proyecto creado: '+t.name);
  }));
}
function openHelp(){
  openModal(`<div class="mhead"><h2>Atajos</h2><button class="ib" onclick="closeModal()">${ui('x',16)}</button></div>
  <div class="keys">
    <div>Deshacer<kbd>Ctrl + Z</kbd></div><div>Rehacer<kbd>Ctrl + Shift + Z</kbd></div>
    <div>Duplicar<kbd>Ctrl + D</kbd></div><div>Eliminar<kbd>Supr</kbd></div>
    <div>Editar texto<kbd>doble clic</kbd></div><div>Zoom<kbd>Ctrl + rueda</kbd></div>
    <div>Reordenar<kbd>arrastrar</kbd></div><div>Deseleccionar<kbd>Esc</kbd></div>
  </div>`);
}
function resetAll(){
  pageIdx = 0; selId = null; hist = [snapshot()]; hp = 0; updHistBtns();
  $('#pname').value = doc.name; renderPageTabs(); applySettings(); render(); renderInspector(); save();
}

/* ============ bind UI ============ */
function bindUI(){
  $('#btn-new').innerHTML = ui('plus'); $('#btn-open').innerHTML = ui('open'); $('#btn-save').innerHTML = ui('save');
  $('#btn-undo').innerHTML = ui('undo'); $('#btn-redo').innerHTML = ui('redo');
  $('#bt-up').innerHTML = ui('up',14); $('#bt-down').innerHTML = ui('down',14);
  $('#bt-dup').innerHTML = ui('copy',14); $('#bt-del').innerHTML = ui('trash',14);
  $('#add-page').innerHTML = ui('plus',13) + ' Página';
  $('#btn-export').innerHTML = ui('download',15) + ' Exportar ' + ui('caret',13);
  $('#btn-left').innerHTML = ui('panelL',16); $('#btn-right').innerHTML = ui('panelR',16);

  const syncTgl = () => {
    $('#btn-left').classList.toggle('on', !document.body.classList.contains('no-left'));
    $('#btn-right').classList.toggle('on', !document.body.classList.contains('no-right'));
  }; syncTgl();
  $('#btn-left').addEventListener('click', ()=>{ document.body.classList.toggle('no-left'); syncTgl(); applyZoom(); save(); });
  $('#btn-right').addEventListener('click', ()=>{ document.body.classList.toggle('no-right'); syncTgl(); applyZoom(); save(); });

  const setPrevIcon = () => $('#btn-preview').innerHTML = previewing ? ui('edit',15)+' Editar' : ui('eye',15)+' Vista previa';
  setPrevIcon();

  $$('.devseg button').forEach(b=>{ const dv = b.dataset.dev;
    b.innerHTML = ui({desktop:'monitor',tablet:'tablet',phone:'phone'}[dv], 15);
    b.classList.toggle('on', dv===device);
    b.addEventListener('click', ()=>{ device = dv;
      $$('.devseg button').forEach(x=>x.classList.toggle('on', x===b)); applyZoom(); updateCounts(); save(); });
  });

  $('#pname').value = doc.name;
  $('#pname').addEventListener('input', e=>{ doc.name = e.target.value; applySettings(); save(); });
  $('#pname').addEventListener('change', pushHistory);
  $('#add-page').addEventListener('click', addPage);

  // ⭐ selector de proyectos
  const psel = $('#project-sel');
  if(psel) psel.addEventListener('change', onProjectChange);

  $('#btn-new').onclick = openNewModal;
  $('#btn-save').onclick = () => { download((slug(doc.name)||'proyecto')+'.json', JSON.stringify({app:'forja',v:2,doc},null,2), 'application/json'); toast('Proyecto guardado (.json)'); };
  $('#btn-open').onclick = () => $('#file-json').click();
  $('#file-json').addEventListener('change', e=>{ const f = e.target.files[0]; if(!f) return;
    const r = new FileReader(); r.onload = () => { try{ const d = normalizeDoc(JSON.parse(r.result));
      if(!d) throw 0;
      if(doc.pages.some(p=>p.blocks.length) && !confirm('Se reemplazará el proyecto actual. ¿Abrir?')) return;
      doc = d; resetAll(); toast('Proyecto abierto'); }catch(err){ toast('Archivo no válido'); } };
    r.readAsText(f); e.target.value = ''; });

  $('#btn-undo').onclick = undo; $('#btn-redo').onclick = redo;
  $('#btn-preview').onclick = () => { previewing = !previewing; document.body.classList.toggle('preview', previewing);
    if(previewing) select(null); setPrevIcon(); applyZoom(); };

  $('#btn-export').addEventListener('click', e=>{ e.stopPropagation(); $('#expmenu').classList.toggle('hidden'); });
  document.addEventListener('click', e=>{ if(!e.target.closest('.expwrap')) $('#expmenu').classList.add('hidden'); });
  $$('#expmenu button').forEach(b=>b.addEventListener('click', ()=>{
    $('#expmenu').classList.add('hidden');
    const a = b.dataset.a, n = slug(doc.name)||'mi-proyecto';
    if(a==='zip'){
      const enc = new TextEncoder();
      const files = doc.pages.map(pg=>({name:pageFile(pg), data:enc.encode(exportPageHTML(pg))}));
      download(n+'.zip', makeZip(files));
      toast(`Sitio exportado: ${files.length} página(s)`);
    }
    if(a==='html') download(slug(curPage().name||'pagina')+'.html', exportPageHTML(curPage()), 'text/html');
    if(a==='copy'){ const h = exportPageHTML(curPage());
      (navigator.clipboard?navigator.clipboard.writeText(h):Promise.reject()).then(()=>toast('HTML copiado'))
      .catch(()=>{ const t = document.createElement('textarea'); t.value = h; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); toast('HTML copiado'); }); }
    if(a==='json') download(n+'.json', JSON.stringify({app:'forja',v:2,doc},null,2), 'application/json');
    if(a==='import') $('#btn-open').click();
  }));

  $('#bt-up').onclick = ()=>moveSel(-1); $('#bt-down').onclick = ()=>moveSel(1);
  $('#bt-dup').onclick = dupSel; $('#bt-del').onclick = delSel;

  $$('.tabs button').forEach(b=>b.addEventListener('click', ()=>{
    $$('.tabs button').forEach(x=>x.classList.toggle('on', x===b));
    $('#tab-els').classList.toggle('hidden', b.dataset.t!=='els');
    $('#tab-layers').classList.toggle('hidden', b.dataset.t!=='layers');
  }));

  $('#page-el').addEventListener('click', e=>{ if(!e.target.closest('.blk')) select(null); });
  $('#canvas-scroll').addEventListener('scroll', positionToolbar);
  $('#canvas-scroll').addEventListener('wheel', e=>{ if(e.ctrlKey){ e.preventDefault(); zoomStep(e.deltaY<0?1:-1); } }, {passive:false});
  $('#z-in').onclick = ()=>zoomStep(1); $('#z-out').onclick = ()=>zoomStep(-1); $('#z-fit').onclick = zoomFit;
  $('#btn-help').onclick = openHelp;
  window.addEventListener('resize', ()=>{ applyZoom(); });

  $('#overlay').addEventListener('click', e=>{ if(e.target.id==='overlay') closeModal(); });

  document.addEventListener('keydown', e=>{
    const a = document.activeElement;
    if(a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable)) return;
    if(e.key==='Escape'){ if(!$('#overlay').classList.contains('hidden')) closeModal();
      else if(previewing) $('#btn-preview').click(); else select(null); return; }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z'){ e.preventDefault(); e.shiftKey?redo():undo(); return; }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='y'){ e.preventDefault(); redo(); return; }
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='d'){ e.preventDefault(); dupSel(); return; }
    if((e.key==='Delete'||e.key==='Backspace') && selId){ e.preventDefault(); delSel(); }
  });
}

/* ============ arranque ============ */
window.addEventListener('DOMContentLoaded', () => {
  loadLocal();
  buildPalette(); bindUI();
  hist = [snapshot()]; hp = 0; updHistBtns();
  renderPageTabs(); applySettings(); render(); renderInspector(); updateCounts();

  // puerta de sesión + carga de proyectos
  const reveal = () => document.body.classList.add('ok');
  const safety = setTimeout(reveal, 3500);
  const ok = () => { clearTimeout(safety); reveal(); };

  if(!SAAS.supabaseUrl || !SAAS.supabaseKey){ ok(); return; }
  if(!window.supabase){ ok(); return; }

  try{
    const sb = window.supabase.createClient(SAAS.supabaseUrl, SAAS.supabaseKey);
    window._sb = sb;
    sb.auth.getSession().then(async r=>{
      const s = r && r.data ? r.data.session : null;
      clearTimeout(safety); reveal();
      if(!s){
        const pill = document.createElement('div'); pill.id = 'userpill';
        pill.innerHTML = '<span class="em" style="color:var(--mut)">Modo local · <a href="registro.html" style="color:var(--acc);text-decoration:none;font-weight:600">Crear cuenta para guardar</a></span>';
        document.body.appendChild(pill);
        return;
      }
      window._forja = {logged:true, email:s.user.email||'', userId:s.user.id};
      const pill = document.createElement('div'); pill.id = 'userpill';
      const em = document.createElement('span'); em.className='em'; em.textContent = s.user.email||'usuario';
      const pl = document.createElement('span'); pl.className='pl free'; pl.textContent = 'FREE';
      const ap = document.createElement('a'); ap.href='apoya.html'; ap.textContent='☕ Apoyar'; ap.target='_blank';
      const out = document.createElement('a'); out.href='#'; out.textContent='Salir';
      out.addEventListener('click', e=>{ e.preventDefault(); sb.auth.signOut().then(()=>location.href='index.html'); });
      pill.append(em, pl, ap, out); document.body.appendChild(pill);

      // ⭐ cargar proyecto más reciente de la nube
      await loadInitialProject();
    }).catch(ok);
  }catch(e){ ok(); }
});