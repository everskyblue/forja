import { esc, embedURL, famCSS } from './utils.js';
import { S } from './state.js';
import { resolveHref } from './blocks.js';
import { FONTS } from './config.js';
export function blockHTML(b){
  const p=b.props;
  const box=`padding:${p.padY||0}px ${p.padX||0}px;${p.boxBg?`background:${p.boxBg};`:''}`;
  const wrap=inner=>`<div style="${box}">${inner}</div>`;
  const targ=p.target==='_blank'?' target="_blank" rel="noopener"':'';
  switch(b.type){
    case 'heading': return wrap(`<${p.tag} style="margin:0;font-size:${p.size}px;font-weight:${p.weight};color:${p.color};text-align:${p.align};${famCSS(p.family)}">${esc(p.text)}</${p.tag}>`);
    case 'text': return wrap(`<p style="margin:0;font-size:${p.size}px;line-height:1.6;color:${p.color};text-align:${p.align};font-weight:${p.weight||400};${famCSS(p.family)}">${esc(p.text).replace(/\n/g,'<br>')}</p>`);
    case 'button': return wrap(`<div style="text-align:${p.align}"><a href="${esc(resolveHref(p.href))}"${targ} style="display:inline-block;padding:${Math.round(p.size*.7)}px ${Math.round(p.size*1.6)}px;background:${p.bg};color:${p.color};border-radius:${p.radius}px;font-size:${p.size}px;font-weight:600;text-decoration:none;${famCSS(p.family)}">${esc(p.label)}</a></div>`);
    case 'link': return wrap(`<div style="text-align:${p.align}"><a href="${esc(resolveHref(p.href))}"${targ} style="font-size:${p.size}px;font-weight:${p.weight};color:${p.color};text-decoration:underline;text-underline-offset:3px;${famCSS(p.family)}">${esc(p.text)}</a></div>`);
    case 'image': return wrap(`<div style="text-align:${p.align}"><img src="${esc(p.src)}" alt="${esc(p.alt)}" style="width:${p.width}%;max-width:100%;height:auto;border-radius:${p.radius}px"></div>`);
    case 'video':{ const src=embedURL(p.url); return src?wrap(`<div style="position:relative;padding-top:56.25%;border-radius:${p.radius}px;overflow:hidden;background:#000"><iframe src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`):''; }
    case 'divider': return wrap(`<hr style="border:0;border-top:${p.thickness}px ${p.style} ${p.color};width:${p.width}%;margin:0 auto">`);
    case 'spacer': return `<div style="height:${p.height}px"></div>`;
    case 'quote': return wrap(`<blockquote style="margin:0;border-left:4px solid ${p.accent};padding:6px 0 6px 22px"><p style="margin:0;font-size:${p.size}px;line-height:1.5;color:${p.color};${famCSS(p.family)}">${esc(p.text)}</p><cite style="display:block;margin-top:10px;font-size:${Math.max(12,Math.round(p.size*.62))}px;color:${p.color};opacity:.65;font-style:normal">— ${esc(p.author)}</cite></blockquote>`);
    case 'list':{ const its=p.items.split('\n').filter(s=>s.trim()); return wrap(`<ul style="list-style:none;margin:0;padding:0;font-size:${p.size}px;color:${p.color};${famCSS(p.family)}">${its.map(t=>`<li style="display:flex;gap:12px;padding:${p.spacing/2}px 0"><span>${p.marker}</span><span>${esc(t)}</span></li>`).join('')}</ul>`); }
    case 'html': return wrap(p.code);
    case 'section': return `<section style="background:${p.bg};border-radius:${p.radius}px;padding:${p.padY}px ${p.padX}px">${p.children.map(blockHTML).join('')}</section>`;
    case 'columns':{ const rs={'1:1':[1,1],'1:2':[1,2],'2:1':[2,1]}[p.ratio]||[1,1]; return wrap(`<div class="cols" style="display:flex;gap:${p.gap}px;align-items:flex-start">${p.cells.map((c,i)=>`<div style="flex:${rs[i]} 1 0%;min-width:0">${c.map(blockHTML).join('')}</div>`).join('')}</div>`); }
  }
  return '';
}
function collectFonts(){ const set=new Set(); const walk=arr=>arr.forEach(b=>{ if(b.props.family&&b.props.family!=='sistema') set.add(b.props.family); if(b.type==='section') walk(b.props.children); if(b.type==='columns') b.props.cells.forEach(walk); }); S.doc.pages.forEach(pg=>walk(pg.blocks)); return set; }
export function exportPageHTML(pg){
  const s=S.doc.settings, used=collectFonts();
  const links=[]; if(used.has('grotesca')) links.push('Space+Grotesk:wght@500;700'); if(used.has('redonda')) links.push('Poppins:wght@400;600;700'); if(used.has('mono')) links.push('IBM+Plex+Mono:wght@400;500');
  const fontLink=links.length?`<link href="https://fonts.googleapis.com/css2?family=${links.join('&family=')}&display=swap" rel="stylesheet">`:'';
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${esc(pg.name)} — ${esc(s.title)}</title>${fontLink}
<style>*{box-sizing:border-box}body{margin:0;background:${s.bg};color:${s.color};font-family:${FONTS[s.font].css};line-height:1.5}.page{max-width:${s.maxWidth}px;margin:0 auto;padding:56px 32px}img{max-width:100%}@media(max-width:700px){.cols{flex-direction:column!important;align-items:stretch!important}.page{padding:34px 18px}h1{font-size:min(9.5vw,42px)!important}h2{font-size:min(7.5vw,32px)!important}h3{font-size:min(6vw,24px)!important}}</style>
</head><body><main class="page">${pg.blocks.map(blockHTML).join('\n')}</main></body></html>`;
}
const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c;}return t;})();
const crc32=u8=>{let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC_TABLE[(c^u8[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;};
export function makeZip(files){
  const enc=new TextEncoder(),parts=[],central=[];let offset=0;
  const now=new Date();
  const dosTime=((now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1))&0xFFFF;
  const dosDate=(((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate())&0xFFFF;
  for(const f of files){
    const nameB=enc.encode(f.name),data=f.data,crc=crc32(data);
    const lh=new Uint8Array(30+nameB.length),dv=new DataView(lh.buffer);
    dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(8,0,true);dv.setUint16(10,dosTime,true);dv.setUint16(12,dosDate,true);
    dv.setUint32(14,crc,true);dv.setUint32(18,data.length,true);dv.setUint32(22,data.length,true);dv.setUint16(26,nameB.length,true);lh.set(nameB,30);
    parts.push(lh,data);
    const ch=new Uint8Array(46+nameB.length),cv=new DataView(ch.buffer);
    cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(10,0,true);cv.setUint16(12,dosTime,true);cv.setUint16(14,dosDate,true);
    cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,nameB.length,true);cv.setUint32(42,offset,true);ch.set(nameB,46);
    central.push(ch);offset+=lh.length+data.length;
  }
  const cdSize=central.reduce((a,c)=>a+c.length,0);
  const end=new Uint8Array(22),ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,cdSize,true);ev.setUint32(16,offset,true);
  return new Blob([...parts,...central,end],{type:'application/zip'});
}