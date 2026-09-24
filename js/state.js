import { hooks } from './hooks.js';
export const S = {
  doc:null, device:'desktop', zoom:1, pageIdx:0, selId:null, previewing:false,
  editing:null, dragData:null, hist:[], hp:-1,
  user:{logged:false,email:'',id:null}, cloudId:null, cloudProjects:[],
};
export const curPage = () => S.doc.pages[S.pageIdx] || S.doc.pages[0];
export const snapshot = () => JSON.stringify(S.doc);
export function pushHistory(){
  const s=snapshot(); if(S.hist[S.hp]===s) return;
  S.hist=S.hist.slice(0,S.hp+1); S.hist.push(s);
  if(S.hist.length>60) S.hist.shift();
  S.hp=S.hist.length-1;
  hooks.updHistBtns?.(); hooks.save?.();
}
export function undo(){ if(S.hp>0){ S.hp--; applySnap(S.hist[S.hp]); } }
export function redo(){ if(S.hp<S.hist.length-1){ S.hp++; applySnap(S.hist[S.hp]); } }
function applySnap(s){
  S.doc=JSON.parse(s);
  if(S.pageIdx>=S.doc.pages.length) S.pageIdx=S.doc.pages.length-1;
  hooks.updHistBtns?.(); hooks.afterApplySnap?.();
}