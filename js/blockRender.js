import { esc, famCSS, embedURL } from './utils.js';
import { S } from './state.js';
import { resolveHref, findBlock } from './blocks.js';
import { hooks } from './hooks.js';
export function boxStyle(w,p){ w.style.padding=(p.padY||0)+'px '+(p.padX||0)+'px'; if(p.boxBg) w.style.background=p.boxBg; }
export function anchorHandlers(a,p){
  a.addEventListener('click',e=>{
    if(!S.previewing){ e.preventDefault(); e.stopPropagation(); return; }
    if(typeof p.href==='string'&&p.href.startsWith('page:')){ e.preventDefault(); hooks.navPage?.(p.href.slice(5)); }
    else if(p.target!=='_blank'){ e.preventDefault(); window.open(a.href,'_blank','noopener'); }
  });
}
export function innerNode(b){
  const p=b.props;
  if(b.type==='heading'){ const h=document.createElement(p.tag); h.textContent=p.text; h.style.cssText=`margin:0;font-size:${p.size}px;font-weight:${p.weight};color:${p.color};text-align:${p.align};${famCSS(p.family)}`; return h; }
  if(b.type==='text'){ const el=document.createElement('p'); el.innerHTML=esc(p.text).replace(/\n/g,'<br>'); el.style.cssText=`margin:0;font-size:${p.size}px;line-height:1.6;color:${p.color};text-align:${p.align};font-weight:${p.weight||400};${famCSS(p.family)}`; return el; }
  if(b.type==='button'){ const wr=document.createElement('div'); wr.style.textAlign=p.align; const a=document.createElement('a'); a.href=resolveHref(p.href); if(p.target==='_blank')a.target='_blank'; a.rel='noopener'; a.style.cssText=`display:inline-block;padding:${Math.round(p.size*.7)}px ${Math.round(p.size*1.6)}px;background:${p.bg};color:${p.color};border-radius:${p.radius}px;font-size:${p.size}px;font-weight:600;text-decoration:none;${famCSS(p.family)}`; a.textContent=p.label; anchorHandlers(a,p); wr.appendChild(a); return wr; }
  if(b.type==='link'){ const wr=document.createElement('div'); wr.style.textAlign=p.align; const a=document.createElement('a'); a.href=resolveHref(p.href); if(p.target==='_blank')a.target='_blank'; a.rel='noopener'; a.style.cssText=`font-size:${p.size}px;font-weight:${p.weight};color:${p.color};text-decoration:underline;text-underline-offset:3px;${famCSS(p.family)}`; a.textContent=p.text; anchorHandlers(a,p); wr.appendChild(a); return wr; }
  if(b.type==='image'){ const wr=document.createElement('div'); wr.style.textAlign=p.align; const img=document.createElement('img'); img.src=p.src; img.alt=p.alt; img.draggable=false; img.style.cssText=`width:${p.width}%;max-width:100%;height:auto;border-radius:${p.radius}px`; wr.appendChild(img); return wr; }
  if(b.type==='video'){ const wr=document.createElement('div'); wr.className='vid'; wr.style.cssText=`position:relative;padding-top:56.25%;background:#0c0c10;border-radius:${p.radius}px;overflow:hidden`; const src=embedURL(p.url); if(src){ const f=document.createElement('iframe'); f.src=src; f.allowFullscreen=true; f.loading='lazy'; f.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:0'; wr.appendChild(f); } else { const ph=document.createElement('div'); ph.className='vplaceholder'; ph.textContent='Pega una URL de YouTube →'; wr.appendChild(ph); } return wr; }
  if(b.type==='divider'){ const hr=document.createElement('hr'); hr.style.cssText=`border:0;border-top:${p.thickness}px ${p.style} ${p.color};width:${p.width}%;margin:0 auto`; return hr; }
  if(b.type==='spacer'){ const d=document.createElement('div'); d.className='sp'; d.style.height=p.height+'px'; return d; }
  if(b.type==='quote'){ const q=document.createElement('blockquote'); q.style.cssText=`margin:0;border-left:4px solid ${p.accent};padding:6px 0 6px 22px`; const t=document.createElement('p'); t.textContent=p.text; t.style.cssText=`margin:0;font-size:${p.size}px;line-height:1.5;color:${p.color};${famCSS(p.family)}`; const c=document.createElement('cite'); c.textContent='— '+p.author; c.style.cssText=`display:block;margin-top:10px;font-size:${Math.max(12,Math.round(p.size*.62))}px;color:${p.color};opacity:.65;font-style:normal`; q.append(t,c); return q; }
  if(b.type==='list'){ const ul=document.createElement('ul'); ul.style.cssText=`list-style:none;margin:0;padding:0;font-size:${p.size}px;color:${p.color};${famCSS(p.family)}`; p.items.split('\n').filter(s=>s.trim()).forEach(t=>{ const li=document.createElement('li'); li.style.cssText=`display:flex;gap:12px;padding:${p.spacing/2}px 0`; const m=document.createElement('span'); m.textContent=p.marker; m.style.flex='none'; const s=document.createElement('span'); s.textContent=t; li.append(m,s); ul.appendChild(li); }); return ul; }
  if(b.type==='html'){ const d=document.createElement('div'); d.className='htmlblk'; d.innerHTML=p.code; const tag=document.createElement('span'); tag.className='ht'; tag.textContent='HTML'; d.appendChild(tag); return d; }
  if(b.type==='section'){ const s=document.createElement('div'); s.style.cssText=`background:${p.bg};border-radius:${p.radius}px;padding:${p.padY}px ${p.padX}px`; const body=document.createElement('div'); body.className='dropzone'; body.dataset.path='sec:'+b.id; p.children.forEach(c=>body.appendChild(blockNode(c))); s.appendChild(body); return s; }
  if(b.type==='columns'){ const c=document.createElement('div'); c.style.cssText=`display:flex;gap:${p.gap}px;align-items:flex-start`; const rs={'1:1':[1,1],'1:2':[1,2],'2:1':[2,1]}[p.ratio]||[1,1]; p.cells.forEach((cell,i)=>{ const cd=document.createElement('div'); cd.className='dropzone'; cd.dataset.path=`col:${b.id}:${i}`; cd.style.cssText=`flex:${rs[i]} 1 0%;min-width:0`; cell.forEach(ch=>cd.appendChild(blockNode(ch))); c.appendChild(cd); }); return c; }
  return document.createElement('div');
}
export function blockNode(b){
  const w=document.createElement('div'); w.className='blk'; w.dataset.id=b.id; w.draggable=true;
  if(b.type!=='section') boxStyle(w,b.props);
  w.appendChild(innerNode(b));
  w.addEventListener('dragstart',e=>{ if(S.editing){e.preventDefault();return;} e.stopPropagation(); S.dragData={kind:'move',id:b.id}; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',b.id); });
  w.addEventListener('dragend',()=>{ S.dragData=null; });
  w.addEventListener('click',e=>{ if(S.previewing) return; e.stopPropagation(); hooks.onBlockClick?.(b.id); });
  w.addEventListener('dblclick',e=>{ if(S.previewing) return; e.stopPropagation(); hooks.onBlockEdit?.(b,w); });
  return w;
}
export function refreshBlock(id){
  const f=findBlock(id); if(!f) return;
  const old=document.querySelector(`.blk[data-id="${id}"]`); if(!old) return;
  const nn=blockNode(f.block); if(S.selId===id) nn.classList.add('sel');
  old.replaceWith(nn);
}