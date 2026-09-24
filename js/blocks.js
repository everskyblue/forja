import { uid, slug } from './utils.js';
import { S, curPage } from './state.js';
export const DEFS = {
  heading:{name:'Titular',def:()=>({text:'Nuevo titular',tag:'h2',size:34,weight:700,color:'#1c1b22',align:'left',family:'sistema',padY:10,padX:0,boxBg:''})},
  text:{name:'Texto',def:()=>({text:'Haz doble clic para editar este texto.',size:16,color:'#4b4a52',align:'left',family:'sistema',weight:400,padY:8,padX:0,boxBg:''})},
  button:{name:'Botón',def:()=>({label:'Haz clic aquí',href:'https://ejemplo.com',target:'_blank',size:15,bg:'#ff5a2f',color:'#ffffff',radius:10,align:'left',family:'sistema',padY:12,padX:0,boxBg:''})},
  link:{name:'Enlace',def:()=>({text:'Texto del enlace',href:'#',target:'_self',size:16,color:'#ff5a2f',weight:600,align:'left',family:'sistema',padY:8,padX:0,boxBg:''})},
  list:{name:'Lista',def:()=>({items:'Primer punto\nSegundo punto\nTercer punto',marker:'•',size:16,color:'#3c3b42',spacing:8,family:'sistema',padY:10,padX:0,boxBg:''})},
  quote:{name:'Cita',def:()=>({text:'Las buenas ideas se construyen bloque a bloque.',author:'Anónimo',size:21,color:'#2a2930',accent:'#ff5a2f',family:'sistema',padY:14,padX:0,boxBg:''})},
  image:{name:'Imagen',def:()=>({src:`https://picsum.photos/seed/${uid()}/900/560`,alt:'Imagen',width:100,radius:12,align:'center',padY:10,padX:0,boxBg:''})},
  video:{name:'Vídeo',def:()=>({url:'',radius:12,padY:10,padX:0,boxBg:''})},
  section:{name:'Sección',def:()=>({bg:'#f2efe9',padY:34,padX:28,radius:16,children:[]})},
  columns:{name:'Columnas',def:()=>({ratio:'1:1',gap:22,padY:8,padX:0,boxBg:'',cells:[[],[]]})},
  divider:{name:'Divisor',def:()=>({color:'#d8d5cf',thickness:2,style:'solid',width:100,padY:16,padX:0,boxBg:''})},
  spacer:{name:'Espacio',def:()=>({height:48,padY:0,padX:0,boxBg:''})},
  html:{name:'HTML',def:()=>({code:'<div style="padding:16px;border:1px dashed #999;border-radius:8px;font-family:monospace">HTML personalizado ✨</div>',padY:8,padX:0,boxBg:''})},
};
export const B = (t,p={}) => ({ id:uid(), type:t, props:Object.assign({},DEFS[t].def(),p) });
export const GROUPS = [
  ['Básicos',['heading','text','button','link','list','quote']],
  ['Multimedia',['image','video']],
  ['Estructura',['section','columns','divider','spacer']],
  ['Avanzado',['html']],
];
export const defSettings = () => ({title:'Mi página',bg:'#ffffff',color:'#1c1c1e',font:'sistema',maxWidth:960});
export function findBlock(id,arr=curPage().blocks){
  for(let i=0;i<arr.length;i++){ const b=arr[i];
    if(b.id===id) return {block:b,arr,i};
    if(b.type==='section'){ const r=findBlock(id,b.props.children); if(r) return r; }
    if(b.type==='columns'){ for(const c of b.props.cells){ const r=findBlock(id,c); if(r) return r; } }
  } return null;
}
export const typeOf = id => findBlock(id)?.block.type ?? null;
export function countBlocks(arr=curPage().blocks){ let n=0; for(const b of arr){ n++; if(b.type==='section') n+=countBlocks(b.props.children); if(b.type==='columns') b.props.cells.forEach(c=>n+=countBlocks(c)); } return n; }
export function reId(b){ b.id=uid(); (b.props.children||[]).forEach(reId); (b.props.cells||[]).forEach(c=>c.forEach(reId)); return b; }
export function resolvePath(path){
  if(path==='root') return {arr:curPage().blocks};
  const p=path.split(':');
  if(p[0]==='sec'){ const f=findBlock(p[1]); return f?{arr:f.block.props.children}:null; }
  if(p[0]==='col'){ const f=findBlock(p[1]); return f?{arr:f.block.props.cells[+p[2]]}:null; }
  return null;
}
export const abW = () => S.device==='desktop' ? +S.doc.settings.maxWidth : (S.device==='tablet'?768:390);
export const devName = () => ({desktop:'Escritorio',tablet:'Tableta',phone:'Móvil'})[S.device]||'Escritorio';
export function pageFile(pg){
  const idx=S.doc.pages.indexOf(pg); if(idx===0) return 'index.html';
  const used=S.doc.pages.filter((p,j)=>j!==0&&j!==idx).map(p=>slug(p.name)||'pagina');
  let base=slug(pg.name)||'pagina', f=base, n=2;
  while(used.includes(f)) f=base+'-'+(n++);
  return f+'.html';
}
export const hrefToPage = pid => { const pg=S.doc.pages.find(p=>p.id===pid); return pg?pageFile(pg):'#'; };
export const resolveHref = h => (typeof h==='string'&&h.startsWith('page:')) ? hrefToPage(h.slice(5)) : (h||'#');
export const tplBlank = () => ({name:'Proyecto sin título',settings:defSettings(),pages:[{id:uid(),name:'Inicio',blocks:[]}]});
export function tplNebula(){ return {name:'Lanzamiento · Nébula',settings:{title:'Nébula',bg:'#f6f4ef',color:'#22212a',font:'grotesca',maxWidth:960},
  pages:[{id:uid(),name:'Inicio',blocks:[
    B('spacer',{height:16}),
    B('heading',{text:'Nébula',tag:'h1',size:66,weight:800,color:'#191821',align:'center',family:'grotesca',padY:4}),
    B('text',{text:'La plataforma donde tus ideas se convierten en proyectos reales.',size:19,color:'#5c5a66',align:'center',family:'grotesca',padY:6}),
    B('button',{label:'Reservar una demo',href:'https://ejemplo.com',bg:'#ff5a2f',color:'#fff7f2',radius:10,size:16,align:'center',family:'grotesca',padY:12}),
    B('spacer',{height:26}),
    B('image',{src:'https://picsum.photos/seed/nebula-app/1000/520',width:100,radius:16,padY:0}),
    B('spacer',{height:8}),
    B('text',{text:'Hecho con Forja · constructor visual',size:12,color:'#9a97a3',align:'center',padY:10}),
  ]}]}; }
export const TPLS = [
  {key:'blank',name:'En blanco',desc:'Lienzo vacío',bg:'#ffffff',acc:'#c9c9cf',make:tplBlank},
  {key:'nebula',name:'Lanzamiento',desc:'Producto con hero',bg:'#f6f4ef',acc:'#ff5a2f',make:tplNebula},
];