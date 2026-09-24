import { $, wait } from './utils.js';

const cache = new Map();
const resolve = name => ({ home:'home', apoya:'apoya', login:'login', registro:'registro', app:'app' }[name] || 'home');

async function load(name){
  const file = resolve(name);
  if (!cache.has(file)){
    const mod = await import(`./views/${file}.js`); // se descarga UNA sola vez y queda cacheado
    cache.set(file, mod.default);
  }
  return cache.get(file);
}

let current = null, currentName = '';
export const currentRoute = () => currentName;
export const navigate = name => { location.hash = '#/' + (name === 'home' ? '' : name); };

function parseHash(){
  const h = (location.hash || '#/').replace(/^#\/?/, '');
  const name = h.split('?')[0] || 'home';
  return ({ home:1, apoya:1, login:1, registro:1, app:1 }[name]) ? name : 'home';
}

async function render(){
  const name = parseHash();
  const box = $('#view');

  if (current){
    current.onLeave?.();
    box.classList.remove('enter'); box.classList.add('leave');
    await wait(220);
  }

  const view = await load(name);
  document.body.className = 'route-' + (view.route || name);
  document.title = view.title || 'Forja';

  const firstTime = !(view.persistent && view._node);
  box.innerHTML = '';
  if (view.persistent && view._node){
    box.appendChild(view._node);
  } else {
    box.innerHTML = view.render();
    if (view.persistent) view._node = box.firstElementChild;
  }
  window.scrollTo(0, 0);
  box.classList.remove('leave'); void box.offsetWidth; box.classList.add('enter');

  if (firstTime) view.mount?.(box);
  else view.remount?.(box);

  current = view; currentName = name;
}

export function initRouter(){
  window.addEventListener('hashchange', render);
  render();
}