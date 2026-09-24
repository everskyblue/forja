import { esc } from './utils.js';
import { ui } from './icons.js';
import { S, pushHistory } from './state.js';
import { B, pageFile } from './blocks.js';
import { hooks } from './hooks.js';
export function renderPageTabs(){
  const box=document.getElementById('page-tabs'); if(!box) return; box.innerHTML='';
  S.doc.pages.forEach((pg,i)=>{ const t=document.createElement('div'); t.className='ptab'+(i===S.pageIdx?' on':'');
    t.title=(i===0?'Página de inicio · ':'')+pageFile(pg);
    t.innerHTML=`<span class="ph">${i===0?'INICIO':'P'+(i+1)}</span><span class="pn">${esc(pg.name)}</span><button class="px">${ui('x',11)}</button>`;
    t.addEventListener('click',()=>switchPage(i));
    t.addEventListener('dblclick',()=>startTabRename(t,pg));
    t.querySelector('.px').addEventListener('click',e=>{ e.stopPropagation(); deletePage(pg.id); });
    box.appendChild(t); });
}
function startTabRename(t,pg){
  const pn=t.querySelector('.pn'); if(!pn) return;
  const inp=document.createElement('input'); inp.value=pg.name; inp.maxLength=40;
  pn.replaceWith(inp); inp.focus(); inp.select();
  let cancelled=false;
  inp.addEventListener('keydown',e=>{ e.stopPropagation(); if(e.key==='Enter') inp.blur(); if(e.key==='Escape'){cancelled=true;inp.blur();} });
  inp.addEventListener('click',e=>e.stopPropagation());
  inp.addEventListener('blur',()=>{ if(!cancelled) pg.name=inp.value.trim()||'Página'; renderPageTabs(); hooks.applySettings?.(); hooks.save?.(); pushHistory(); });
}
export function switchPage(i){ if(i===S.pageIdx||i<0||i>=S.doc.pages.length) return; S.pageIdx=i; S.selId=null; S.editing=null; renderPageTabs(); hooks.render?.(); hooks.renderInspector?.(); }
export const switchToPageById = pid => switchPage(S.doc.pages.findIndex(p=>p.id===pid));
export function addPage(){
  const pg={id:'b'+Math.random().toString(36).slice(2,9),name:'Página '+(S.doc.pages.length+1),blocks:[B('heading',{text:'Nueva página',tag:'h1',size:44,weight:800}),B('text',{text:'Esta es una página nueva.'})]};
  S.doc.pages.push(pg); S.pageIdx=S.doc.pages.length-1; S.selId=null;
  pushHistory(); renderPageTabs(); hooks.render?.(); hooks.renderInspector?.();
}
export function deletePage(pid){
  if(S.doc.pages.length<=1) return;
  const i=S.doc.pages.findIndex(p=>p.id===pid); if(i<0) return;
  if(!confirm(`¿Eliminar la página «${S.doc.pages[i].name}»?`)) return;
  S.doc.pages.splice(i,1); if(S.pageIdx>=S.doc.pages.length) S.pageIdx=S.doc.pages.length-1;
  S.selId=null; pushHistory(); renderPageTabs(); hooks.render?.(); hooks.renderInspector?.();
}