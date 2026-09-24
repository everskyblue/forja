import { LOGO, DONATIONS } from '../config.js';

export default {
  title: 'Apoya el proyecto — Forja',
  route: 'home',
  render: () => `
  <header class="site"><div class="wrap"><nav class="top">
    <a class="logo" href="#/">${LOGO}Forja</a>
    <div class="links"><a href="#/">Producto</a><a class="on" href="#/apoya">Apoyar ❤</a></div>
    <div class="spacer"></div><a class="btn pri" href="#/app">Abrir editor</a>
  </nav></div></header>
  <section class="hero wrap">
    <div class="heart">❤️</div>
    <h1>Forja es <em>gratis para todos</em></h1>
    <p class="sub">Sin planes de pago ni suscripciones. Si te sirve y quieres apoyar el desarrollo, puedes hacerlo con un cafecito ☕</p>
  </section>
  <section class="wrap">
    <div class="plats">
      <a class="plat" href="${DONATIONS.buymeacoffee}" target="_blank" rel="noopener">
        <div class="logo-plat">☕</div><h3>Buy Me a Coffee</h3>
        <div class="desc">La opción más usada. Un cafecito, un saludo y listo.</div>
        <div class="go">buymeacoffee.com/hicodx →</div></a>
      <a class="plat" href="${DONATIONS.kofi}" target="_blank" rel="noopener">
        <div class="logo-plat">🫶</div><h3>Ko-fi</h3>
        <div class="desc">0% de comisión para el creador.</div>
        <div class="go">ko-fi.com/hicodx →</div></a>
      <a class="plat" href="${DONATIONS.paypal}" target="_blank" rel="noopener">
        <div class="logo-plat">💳</div><h3>PayPal.me</h3>
        <div class="desc">Directo a PayPal, tu cuenta habitual.</div>
        <div class="go">paypal.me/hicodx →</div></a>
    </div>
    <div class="free">
      <h2>¿Qué incluye Forja gratis?</h2><p>Todo. Sin trucos.</p>
      <div class="features">
        <div>Editor por bloques</div><div>Páginas ilimitadas</div><div>Todas las plantillas</div>
        <div>Exportación ZIP</div><div>Historial</div><div>Autoguardado local</div>
        <div>Nube (con cuenta)</div><div>Uso comercial</div>
      </div>
      <div class="ctas" style="margin-top:18px"><a class="btn pri big" href="#/app">Abrir editor →</a></div>
    </div>
  </section>`,
};