import { FONTS } from './config.js';
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];
export const uid = () => 'b' + Math.random().toString(36).slice(2,9);
export const clone = o => JSON.parse(JSON.stringify(o));
export const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
export const wait = ms => new Promise(r=>setTimeout(r,ms));
export const famCSS = f => (f && f!=='sistema') ? `font-family:${FONTS[f].css};` : '';
export const alignM = a => a==='left'?'margin:0 auto 0 0;':a==='right'?'margin:0 0 0 auto;':'margin:0 auto;';
export const embedURL = u => { if(!u) return ''; const m=u.match(/youtu\.be\/([\w-]{6,})/)||u.match(/[?&]v=([\w-]{6,})/); return m?`https://www.youtube.com/embed/${m[1]}`:u; };
export const isContainer = t => t==='section'||t==='columns';
export function toast(msg){ const t=$('#toast'); if(!t) return; t.innerHTML=msg; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),3400); }
export function openModal(html){ $('#modal').innerHTML=html; $('#overlay').classList.remove('hidden'); }
export function closeModal(){ $('#overlay').classList.add('hidden'); }
export function download(name,content,mime){ const a=document.createElement('a'); a.href=URL.createObjectURL(content instanceof Blob?content:new Blob([content],{type:mime||'text/plain'})); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),3000); }