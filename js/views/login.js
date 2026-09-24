import { SAAS, LOGO } from '../config.js';
import { $ } from '../utils.js';

export default {
  title: 'Entrar — Forja',
  route: 'home',
  render: () => `
  <header class="site"><div class="wrap"><nav class="top">
    <a class="logo" href="#/">${LOGO}Forja</a><div class="spacer"></div>
    <a class="btn ghost" href="#/">← Volver</a>
  </nav></div></header>
  <div class="auth"><form class="acard" id="f">
    <h1>Bienvenido de nuevo 👋</h1>
    <div class="sub">Entra para acceder a tus proyectos guardados en la nube.</div>
    <div class="fld"><label>Email</label><input name="email" type="email" required placeholder="tu@email.com"></div>
    <div class="fld"><label>Contraseña</label><input name="password" type="password" required placeholder="Tu contraseña"></div>
    <button class="btn-form" id="go" type="submit">Continuar</button>
    <div class="msg" id="msg"></div>
    <div class="alt">¿No tienes cuenta? <a href="#/registro">Regístrate gratis</a></div>
  </form></div>`,
  mount(){
    const msg = $('#msg');
    const say = (t, ok) => { msg.textContent = t; msg.style.color = ok ? 'var(--acc2)' : 'var(--danger)'; };
    $('#f').addEventListener('submit', async e => {
      e.preventDefault();
      if (!SAAS.supabaseUrl || !SAAS.supabaseKey){ say('⚠ Configura SAAS en js/config.js'); return; }
      const b = $('#go'); b.disabled = true; say('Entrando…', true);
      try{
        const sb = window.supabase.createClient(SAAS.supabaseUrl, SAAS.supabaseKey);
        const { error } = await sb.auth.signInWithPassword({ email:e.target.email.value, password:e.target.password.value });
        if (error){ say('Error: ' + error.message); b.disabled = false; return; }
        say('✔ Sesión iniciada…', true);
        setTimeout(() => location.hash = '#/app', 500);
      }catch(err){ say('Error de conexión.'); b.disabled = false; }
    });
  },
};