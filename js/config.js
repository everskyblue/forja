export const SAAS = { supabaseUrl: '', supabaseKey: '' };
export const FONTS = {
  sistema:{label:'Sistema',css:'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif'},
  grotesca:{label:'Grotesca',css:'"Space Grotesk",sans-serif'},
  redonda:{label:'Redonda',css:'"Poppins",sans-serif'},
  serif:{label:'Serifa',css:'Georgia,"Times New Roman",serif'},
  mono:{label:'Mono',css:'"IBM Plex Mono",monospace'},
};
export const FAM_OPTS = Object.entries(FONTS).map(([v,f])=>[v,f.label]);
export const ALIGNS = [['left','al'],['center','ac'],['right','ar']];
export const ZOOMS = [.5,.65,.8,.9,1,1.1,1.25,1.5];
export const DONATIONS = {
  buymeacoffee:'https://buymeacoffee.com/hicodx',
  kofi:'https://ko-fi.com/hicodx',
  paypal:'https://paypal.me/hicodx',
};
export const LOGO = `<svg width="26" height="26" viewBox="0 0 30 30"><rect x="3" y="9" width="16" height="16" rx="4" fill="#ff7a45"/><rect x="11" y="3" width="16" height="16" rx="4" fill="#3ecf9a" opacity=".92"/></svg>`;