import { SAAS } from './config.js';
import { $, toast } from './utils.js';
import { S } from './state.js';
import { defSettings, tplBlank } from './blocks.js';
import { hooks } from './hooks.js';
const uid0 = () => 'b'+Math.random().toString(36).slice(2,9);
export function normalizeDoc(d){
  if(!d||typeof d!=='object') return null;
  if(Array.isArray(d.pages)&&d.pages.length){
    d.pages=d.pages.filter(p=>p&&Array.isArray(p.blocks)).map(p=>({id:p.id||uid0(),name:p.name||'Página',blocks:p.blocks}));
    if(!d.pages.length) d.pages=[{id:uid0(),name:'Inicio',blocks:[]}];
    d.settings=Object.assign(defSettings(),d.settings||{}); d.name=d.name||'Mi sitio'; return d;
  }
  if(Array.isArray(d.blocks)) return {name:d.name||'Mi sitio',settings:Object.assign(defSettings(),d.settings||{}),pages:[{id:uid0(),name:'Inicio',blocks:d.blocks}]};
  return null;
}
export function loadLocal(){
  try{ const s=JSON.parse(localStorage.getItem('forja.doc'));
    if(s){ S.doc=normalizeDoc(s.doc); S.device=s.device||'desktop'; S.zoom=s.zoom||1;
      if(s.noLeft) document.body.classList.add('no-left');
      if(s.noRight) document.body.classList.add('no-right'); }
  }catch(e){}
  if(!S.doc) S.doc=tplBlank();
}
let saveT;
export function save(){
  clearTimeout(saveT);
  saveT=setTimeout(async()=>{
    try{ localStorage.setItem('forja.doc',JSON.stringify({doc:S.doc,device:S.device,zoom:S.zoom,noLeft:document.body.classList.contains('no-left'),noRight:document.body.classList.contains('no-right')})); }catch(e){}
    if(S.user.logged&&window._sb){
      try{ const payload={nombre:S.doc.name||'Mi proyecto',doc:S.doc,actualizado_en:new Date().toISOString()};
        if(S.cloudId){ await window._sb.from('proyectos').update(payload).eq('id',S.cloudId).eq('user_id',S.user.id); }
        else { const {data,error}=await window._sb.from('proyectos').insert(payload).select('id').single(); if(!error&&data){ S.cloudId=data.id; await refreshProjectList(); } }
      }catch(e){}
    }
    const m=$('#st-msg'); if(m) m.textContent='Guardado '+new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
    const d=$('#save-dot'); if(d){ d.classList.add('flash'); setTimeout(()=>d.classList.remove('flash'),500); }
  },500);
}
export async function initSession(){
  const finish=()=>{ renderPill(); renderProjectSelector(); };
  if(!SAAS.supabaseUrl||!SAAS.supabaseKey||!window.supabase){ finish(); return; }
  try{
    const sb=window.supabase.createClient(SAAS.supabaseUrl,SAAS.supabaseKey);
    window._sb=sb;
    const {data}=await sb.auth.getSession();
    const sess=data?.session;
    if(!sess){ S.user={logged:false,email:'',id:null}; finish(); return; }
    S.user={logged:true,email:sess.user.email||'',id:sess.user.id};
    renderPill(); await loadInitialProject(); renderProjectSelector();
  }catch(e){ finish(); }
}
function renderPill(){
  document.getElementById('userpill')?.remove();
  const pill=document.createElement('div'); pill.id='userpill';
  if(S.user.logged){
    pill.innerHTML=`<span class="em">${S.user.email}</span><span class="pl free">FREE</span><a href="#/apoya">☕ Apoyar</a><a href="#" id="pill-out">Salir</a>`;
    pill.querySelector('#pill-out').addEventListener('click',async e=>{ e.preventDefault(); await window._sb?.auth.signOut(); location.hash='#/'; location.reload(); });
  } else {
    pill.innerHTML=`<span class="em" style="color:var(--mut)">Modo local · <a href="#/registro">Crear cuenta para guardar</a></span>`;
  }
  document.body.appendChild(pill);
}
export async function refreshProjectList(){
  if(!S.user.logged||!window._sb) return;
  try{ const {data,error}=await window._sb.from('proyectos').select('id,nombre,actualizado_en').eq('user_id',S.user.id).order('actualizado_en',{ascending:false});
    if(error) return; S.cloudProjects=data||[]; renderProjectSelector();
  }catch(e){}
}
export function renderProjectSelector(){
  const sel=$('#project-sel');
  if(!sel){ requestAnimationFrame(renderProjectSelector); return; }
  sel.innerHTML='';
  const cur=document.createElement('option'); cur.value='__current__'; cur.textContent=S.doc?.name||'Proyecto actual'; sel.appendChild(cur);
  if(S.cloudProjects.length){
    const sep=document.createElement('option'); sep.disabled=true; sep.textContent='── En la nube ──'; sel.appendChild(sep);
    S.cloudProjects.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=(p.id===S.cloudId?'● ':'')+p.nombre; if(p.id===S.cloudId) o.selected=true; sel.appendChild(o); });
  }
  const sep2=document.createElement('option'); sep2.disabled=true; sep2.textContent='──────────'; sel.appendChild(sep2);
  const nw=document.createElement('option'); nw.value='__new__'; nw.textContent='+ Nuevo proyecto…'; sel.appendChild(nw);
}
export async function onProjectChange(e){
  const v=e.target.value;
  if(v==='__current__') return;
  if(v==='__new__'){ const nombre=prompt('Nombre del nuevo proyecto:','Mi proyecto '+(S.cloudProjects.length+1)); if(!nombre){ renderProjectSelector(); return; } await createNewProject(nombre); return; }
  if(v===S.cloudId) return;
  try{ const {data,error}=await window._sb.from('proyectos').select('*').eq('id',v).eq('user_id',S.user.id).single();
    if(error||!data){ toast('No se pudo cargar el proyecto'); return; }
    const loaded=normalizeDoc(data.doc); if(!loaded){ toast('Proyecto corrupto'); return; }
    S.doc=loaded; S.cloudId=data.id; S.pageIdx=0; S.selId=null;
    hooks.afterApplySnap?.(); renderProjectSelector(); toast('✔ Proyecto cargado: '+data.nombre);
  }catch(err){ toast('Error al cargar'); }
}
export async function createNewProject(nombre){
  S.doc={name:nombre,settings:defSettings(),pages:[{id:uid0(),name:'Inicio',blocks:[]}]};
  S.pageIdx=0; S.selId=null; S.cloudId=null;
  hooks.afterApplySnap?.(); save(); setTimeout(refreshProjectList,800);
  toast('✔ Proyecto creado: '+nombre);
}
export async function loadInitialProject(){
  if(!S.user.logged||!window._sb) return;
  try{ await refreshProjectList();
    const localEmpty=!S.doc||!S.doc.pages||S.doc.pages.every(p=>!p.blocks||!p.blocks.length);
    if(localEmpty&&S.cloudProjects.length){
      const latest=S.cloudProjects[0];
      const {data}=await window._sb.from('proyectos').select('*').eq('id',latest.id).single();
      if(data?.doc){ const loaded=normalizeDoc(data.doc); if(loaded){ S.doc=loaded; S.cloudId=data.id; S.pageIdx=0; hooks.afterApplySnap?.(); toast('☁ Último proyecto cargado'); } }
    }
    renderProjectSelector();
  }catch(e){}
}