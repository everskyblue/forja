import { $, $$, clone, slug, isContainer, esc } from './utils.js';
import { S, curPage, pushHistory } from './state.js';
import { B, findBlock, typeOf, resolvePath, abW, devName, pageFile, countBlocks, reId } from './blocks.js';
import { blockNode } from './blockRender.js';
import { FONTS } from './config.js';
import { hooks } from './hooks.js';
export const ind = document.createElement('div'); ind.className='drop-ind';
export function render(){
  const body=$('#ab-body'); if(!body) return;
  [...body.querySelectorAll('.blk,.drop-ind')].forEach(n=>n.remove());
  curPage().blocks.forEach(b=>body.appendChild(blockNode(b)));
  const emp=$('#ab-empty'); if(emp) emp.style.display=curPage().blocks.length?'none':'flex';
  if(S.selId){ const n=body.querySelector(`[data-id="${S.selId}"]`); n?.classList.add('sel'); }
  hooks.renderLayers?.(); updateCounts(); applyZoom(); positionToolbar();
}
export function commit(){ pushHistory(); render(); }
export function select(id){
  S.selId=id;
  $$('.blk').forEach(n=>n.classList.toggle('sel',n.dataset.id===id));
  $$('.lyr').forEach(n=>n.classList.toggle('on',n.dataset.id===id));
  hooks.renderInspector?.(); positionToolbar();
}
export function startEdit(b,w){
  let el=null,key=null;
  if(b.type==='heading'||b.type==='text'){ el=w.querySelector('h1,h2,h3,p'); key='text'; }
  else if(b.type==='button'||b.type==='link'){ el=w.querySelector('a'); key=b.type==='button'?'label':'text'; }
  else if(b.type==='quote'){ el=w.querySelector('blockquote p'); key='text'; }
  if(!el) return;
  S.editing=b.id; w.draggable=false;
  el.contentEditable='true'; el.classList.add('editing'); el.focus();
  try{ document.getSelection().selectAllChildren(el); }catch(e){}
  const done=()=>{ el.contentEditable='false'; el.classList.remove('editing'); w.draggable=true; S.editing=null;
    const v=el.innerText.replace(/\u00a0/g,' ').trim(); b.props[key]=v||'…';
    if(b.type==='text') el.innerHTML=esc(b.props.text).replace(/\n/g,'<br>'); else el.textContent=b.props[key];
    pushHistory(); hooks.renderLayers?.(); };
  el.addEventListener('blur',done,{once:true});
  el.addEventListener('keydown',ev=>{ ev.stopPropagation(); if(ev.key==='Escape'){ev.preventDefault();el.blur();} if(ev.key==='Enter'&&b.type!=='text'){ev.preventDefault();el.blur();} });
}
export function moveSel(dir){ if(!S.selId) return; const f=findBlock(S.selId); if(!f) return; const i=f.i+dir; if(i<0||i>=f.arr.length) return; const [b]=f.arr.splice(f.i,1); f.arr.splice(i,0,b); commit(); }
export function dupSel(){ if(!S.selId) return; const f=findBlock(S.selId); if(!f) return; const c=reId(clone(f.block)); f.arr.splice(f.i+1,0,c); commit(); select(c.id); }
export function delSel(){ if(!S.selId) return; const f=findBlock(S.selId); if(!f) return; f.arr.splice(f.i,1); S.selId=null; commit(); hooks.renderInspector?.(); }
export function addBlockAtEnd(t){ const nb=B(t); curPage().blocks.push(nb); commit(); select(nb.id); const n=document.querySelector(`.blk[data-id="${nb.id}"]`); n?.scrollIntoView({behavior:'smooth',block:'center'}); }
export function positionToolbar(){
  const tb=$('#btools'); if(!tb) return;
  if(!S.selId||S.previewing){ tb.style.display='none'; return; }
  const node=document.querySelector(`.blk[data-id="${S.selId}"]`); if(!node){ tb.style.display='none'; return; }
  const sc=$('#canvas-scroll'), nr=node.getBoundingClientRect(), sr=sc.getBoundingClientRect();
  tb.style.display='flex';
  tb.style.top=Math.max(4,nr.top-sr.top+sc.scrollTop-38)+'px';
  tb.style.left=Math.max(4,Math.min(nr.right-sr.left+sc.scrollLeft-tb.offsetWidth,sc.scrollWidth-tb.offsetWidth-4))+'px';
}
export function applyZoom(){
  const ab=$('#artboard'), f=$('#frame'); if(!ab||!f) return;
  ab.style.width=abW()+'px'; ab.style.transform=`scale(${S.zoom})`;
  f.style.width=(abW()*S.zoom)+'px';
  requestAnimationFrame(()=>{ f.style.height=(ab.offsetHeight*S.zoom)+'px'; positionToolbar(); });
  const zv=$('#zoom-val'); if(zv) zv.textContent=Math.round(S.zoom*100)+'%';
}
export function applySettings(){
  const s=S.doc.settings, pg=$('#page-el'); if(!pg) return;
  pg.style.background=s.bg; pg.style.color=s.color; pg.style.fontFamily=FONTS[s.font].css;
  const url=$('#bbar-url'); if(url) url.textContent=(slug(S.doc.name)||'mi-sitio')+'.forja.app/'+(S.pageIdx===0?'':pageFile(curPage()));
  applyZoom();
}
export function updateCounts(){ const el=$('#st-count'); if(!el) return; el.textContent=`${countBlocks()} bloques · ${S.doc.pages.length} página${S.doc.pages.length!==1?'s':''} · ${devName()} ${abW()}px`; }
let bound=false;
export function bindCanvas(){
  if(bound) return; bound=true;
  document.addEventListener('dragover',e=>{
    if(!S.dragData) return;
    const zone=e.target.closest('.dropzone'); if(!zone){ ind.remove(); return; }
    const cont=(S.dragData.kind==='new')?isContainer(S.dragData.type):isContainer(typeOf(S.dragData.id));
    if(cont&&zone.dataset.path!=='root'){ e.dataTransfer.dropEffect='none'; return; }
    e.preventDefault(); e.dataTransfer.dropEffect=S.dragData.kind==='move'?'move':'copy';
    const {idx,kids}=dropIndex(zone,e.clientY,S.dragData.kind==='move'?S.dragData.id:null);
    const ref=kids[idx]||null;
    if(ind.parentNode!==zone||ind.nextElementSibling!==ref) zone.insertBefore(ind,ref);
  });
  document.addEventListener('drop',e=>{
    if(!S.dragData) return;
    const zone=e.target.closest('.dropzone'); if(!zone){ clearDrop(); return; }
    e.preventDefault();
    const path=zone.dataset.path;
    const cont=(S.dragData.kind==='new')?isContainer(S.dragData.type):isContainer(typeOf(S.dragData.id));
    if(cont&&path!=='root'){ clearDrop(); return; }
    const res=resolvePath(path); if(!res){ clearDrop(); return; }
    const exId=S.dragData.kind==='move'?S.dragData.id:null;
    const {idx}=dropIndex(zone,e.clientY,exId);
    if(S.dragData.kind==='new'){ const nb=B(S.dragData.type); res.arr.splice(idx,0,nb); commit(); select(nb.id); }
    else { const f=findBlock(S.dragData.id); if(f){ f.arr.splice(f.i,1); res.arr.splice(idx,0,f.block); commit(); select(f.block.id); } }
    clearDrop();
  });
  document.addEventListener('dragend',clearDrop);
  document.addEventListener('keydown',e=>{
    if(!document.body.classList.contains('route-app')) return;
    const a=document.activeElement;
    if(a&&(/INPUT|TEXTAREA|SELECT/.test(a.tagName)||a.isContentEditable)) return;
    if(e.key==='Escape'){ hooks.closeModal?.(); if(S.previewing) hooks.togglePreview?.(); else select(null); return; }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){ e.preventDefault(); e.shiftKey?hooks.redo?.():hooks.undo?.(); return; }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){ e.preventDefault(); hooks.redo?.(); return; }
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){ e.preventDefault(); dupSel(); return; }
    if((e.key==='Delete'||e.key==='Backspace')&&S.selId){ e.preventDefault(); delSel(); }
  });
  window.addEventListener('resize',()=>applyZoom());
}
function dropIndex(zone,y,excludeId){
  const kids=[...zone.querySelectorAll(':scope > .blk')].filter(k=>k.dataset.id!==excludeId);
  let i=0; for(const k of kids){ const r=k.getBoundingClientRect(); if(y>r.top+r.height/2) i++; else break; }
  return {idx:i,kids};
}
function clearDrop(){ ind.remove(); S.dragData=null; }