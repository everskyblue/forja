import { SAAS, LOGO } from '../config.js';
import { $ } from '../utils.js';

export default {
  title: 'Crear cuenta — Forja',
  route: 'home',
  render: () => `
  <header class="site"><div class="wrap"><nav class="top">
    <a class="logo" href="#/">${LOGO}Forja</a><div class="spacer"></div>
    <a class="btn ghost" href="#/">← Volver</a>
  </nav></div></header>
  <div class="auth"><form class="acard" id="f">
    <h1>Crea tu cuenta ✦</h1>
    <div class="sub">Guarda tus proyectos en la nube. Gratis para siempre.</div>
    <div class="fld"><label>Email</label><input name="email" type="email" required placeholder="tu@email.com"></div>
    <div class="fld"><label>Contraseña (mín. 6)</label><input name="password" type="password" required minlength="6" placeholder="Elige una contraseña"></div>
    <button class="btn-form" id="go" type="submit">Crear cuenta gratis</button>
    <div class="msg" id="msg"></div>
    <div class="alt">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></div>
  </form></div>`,
  mount(){
    const msg = $('#msg');
    const say = (t, ok) => { msg.textContent = t; msg.style.color = ok ? 'var(--acc2)' : 'var(--danger)'; };
    $('#f').addEventListener('submit', async e => {
      e.preventDefault();
      if (!SAAS.supabaseUrl || !SAAS.supabaseKey){ say('⚠ Configura SAAS en js/config.js'); return; }
      const b = $('#go'); b.disabled = true; say('Creando cuenta…', true);
      try{
        const sb = window.supabase.createClient(SAAS.supabaseUrl, SAAS.supabaseKey);
        const { data, error } = await sb.auth.signUp({ email:e.target.email.value, password:e.target.password.value });
        if (error){ say('Error: ' + error.message); b.disabled = false; return; }
        if (data.session){ say('✔ Cuenta creada…', true); setTimeout(() => location.hash = '#/app', 600); }
        else { say('✔ Cuenta creada. Revisa tu correo y luego inicia sesión.', true); b.disabled = false; }
      }catch(err){ say('Error de conexión.'); b.disabled = false; }
    });
  },
};