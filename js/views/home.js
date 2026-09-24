import { LOGO } from '../config.js';

const nav = `
<header class="site"><div class="wrap"><nav class="top">
  <a class="logo" href="#/">${LOGO}Forja</a>
  <div class="links"><a href="#/">Producto</a><a href="#/apoya">Apoyar ❤</a></div>
  <div class="spacer"></div>
  <a class="btn ghost" href="#/login">Entrar</a>
  <a class="btn pri" href="#/app">Abrir editor</a>
</nav></div></header>`;

const footer = `
<footer><div class="wrap">
  <a class="logo" href="#/" style="font-size:15px">${LOGO}Forja</a>
  <a href="#/apoya">Apoyar</a><a href="#/login">Entrar</a><a href="#/registro">Registro</a>
  <span class="spacer"></span><span>© 2026 · Hecho con ❤️ en Ecuador</span>
</div></footer>`;

export default {
  title: 'Forja — Crea tu web jugando con bloques',
  route: 'home',
  render: () => nav + `
  <section class="hero wrap">
    <span class="badge">✦ EDITOR VISUAL · EXPORTA HTML REAL</span>
    <h1>Crea tu web <em>jugando con bloques</em>.<br>Publícala en minutos.</h1>
    <p class="sub">Forja es un editor de páginas con interfaz gráfica. Arrastra bloques, edita valores, navega entre páginas y exporta tu sitio completo. Sin código, sin suscripciones.</p>
    <div class="ctas">
      <a class="btn pri big" href="#/app">Abrir el editor →</a>
      <a class="btn ghost big" href="#/registro">Crear cuenta (opcional)</a>
    </div>
    <div class="note">100% gratis · Sin tarjeta · <a href="#/apoya" style="color:var(--acc)">Apoya con un cafecito ❤</a></div>
    <div class="mockwrap">
      <span class="ftag a">✔ Exportación ZIP</span><span class="ftag b">✦ 100% visual</span>
      <div class="mock">
        <div class="mbar"><i></i><i></i><i></i><span class="murl">forja.app/editor</span><em>Exportar</em></div>
        <div class="mbody">
          <div class="mside"><b>Titular</b><b>Texto</b><b>Botón</b><b>Imagen</b><b>Sección</b><b>Columnas</b></div>
          <div class="mcanvas"><div class="b1"></div><div class="b2"></div><div class="b3"></div><div class="pill"></div>
            <div class="brow"><div class="bc"></div><div class="bc"></div></div><div class="bdash"></div></div>
          <div class="minsp"><i></i><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
  </section>
  <section class="block wrap">
    <h2 class="sec">Un editor completo, de verdad</h2>
    <p class="secsub">Todo lo que necesitas para diseñar y publicar.</p>
    <div class="grid">
      <div class="card"><div class="ico">🧱</div><h3>Editor por bloques</h3><p>Titulares, textos, botones, imágenes, vídeos, secciones y columnas.</p></div>
      <div class="card"><div class="ico">📄</div><h3>Multipágina</h3><p>Crea todas las páginas que quieras y enlázalas entre sí.</p></div>
      <div class="card"><div class="ico">📦</div><h3>Exportación ZIP</h3><p>Descarga tu sitio completo como HTML limpio.</p></div>
      <div class="card"><div class="ico">📱</div><h3>Responsivo</h3><p>Previsualiza en escritorio, tableta y móvil.</p></div>
      <div class="card"><div class="ico">☁️</div><h3>Guardado en la nube</h3><p>Crea una cuenta y tus proyectos se sincronizan.</p></div>
      <div class="card"><div class="ico">↩️</div><h3>Historial</h3><p>Deshaz y rehaz sin miedo. Autoguardado incluido.</p></div>
    </div>
  </section>
  <div class="wrap"><div class="banner">
    <h2>Empieza a diseñar hoy</h2>
    <p>Forja es gratis para todos. Si te sirve, apóyalo con un cafecito ☕</p>
    <div class="ctas" style="margin-top:18px">
      <a class="btn pri big" href="#/app">Abrir editor →</a>
      <a class="btn ghost big" href="#/apoya">☕ Apoyar</a>
    </div>
  </div></div>` + footer,
};