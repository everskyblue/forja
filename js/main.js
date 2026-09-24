import { $ } from './utils.js';
import { initRouter } from './router.js';

$('#overlay').addEventListener('click', e => { if (e.target.id === 'overlay') $('#overlay').classList.add('hidden'); });

initRouter();