import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, PawPrint, ShieldCheck } from 'lucide-react';
import { districts } from '../lib/validation';

export default function Home() {
  return <>
    <a className="skip-link" href="#contenido">Saltar al contenido</a>
    <header className="container nav">
      <Link className="brand" href="/" aria-label="HuellaLimpia, inicio"><PawPrint aria-hidden="true" /> HuellaLimpia</Link>
      <nav className="navlinks" aria-label="Navegación principal">
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#educacion">Consejos</a>
        <a href="#preguntas">Preguntas</a>
        <Link className="button" href="/acceso">Ingresar</Link>
      </nav>
    </header>
    <main id="contenido">
      <section className="container hero" aria-labelledby="hero-title">
        <div>
          <span className="eyebrow">Lima Norte se cuida entre todos</span>
          <h1 id="hero-title">Calles limpias. Mascotas queridas.</h1>
          <p>Registra a tu compañero y ayuda a cuidar los espacios que compartimos. Reporta puntos críticos y sigue la atención desde un solo lugar.</p>
          <div className="actions">
            <Link className="button" href="/acceso?modo=registro">Crear cuenta <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link className="button secondary" href="/acceso">Reportar incidencia</Link>
          </div>
        </div>
        <Image src="/hero-perro.jpg" alt="Perro al aire libre" width={1000} height={1100} priority sizes="(max-width: 760px) 100vw, 45vw" />
      </section>
      <section className="service-area" aria-labelledby="area-title">
        <div className="container service-area-inner">
          <div><h2 id="area-title">Disponible en cuatro distritos de Lima Norte</h2><p>Comienza reportando lo que ocurre cerca de ti.</p></div>
          <ul aria-label="Distritos disponibles">{districts.map(district => <li key={district}>{district}</li>)}</ul>
        </div>
      </section>
      <section className="section" style={{ background: 'var(--mint)' }}>
        <div className="container">
          <h2>Un barrio más sano empieza con una acción</h2>
          <p className="muted">Los desechos en la vía pública afectan la salud y la convivencia. HuellaLimpia conecta a vecinos y personal municipal para dar seguimiento a cada reporte.</p>
          <div className="grid">
            <article className="card"><PawPrint aria-hidden="true" /><h3>Registra a tu mascota</h3><p>Ten sus datos básicos organizados en tu cuenta.</p></article>
            <article className="card"><MapPin aria-hidden="true" /><h3>Señala un punto crítico</h3><p>Indica el distrito, la ubicación y lo que ocurre.</p></article>
            <article className="card"><ShieldCheck aria-hidden="true" /><h3>Sigue la atención</h3><p>Consulta el estado de tus reportes cuando lo necesites.</p></article>
          </div>
        </div>
      </section>
      <section className="container section" id="como-funciona">
        <h2>Cómo funciona</h2><div className="grid">
          <div><h3>1. Crea tu cuenta</h3><p>Regístrate como ciudadano con tu correo.</p></div>
          <div><h3>2. Envía un reporte</h3><p>Describe el problema y ubícalo en tu distrito.</p></div>
          <div><h3>3. Consulta el avance</h3><p>Revisa el estado de atención en tu panel.</p></div>
        </div>
      </section>
      <section className="section" id="educacion" style={{ background: 'white' }}><div className="container"><h2>Convivencia responsable</h2><div className="grid">
        <div className="card"><h3>Lleva bolsas en cada paseo</h3><p>Recoge los desechos de tu mascota y deposítalos en un recipiente adecuado.</p></div>
        <div className="card"><h3>Cuida las áreas comunes</h3><p>Respeta jardines, veredas y espacios de juego.</p></div>
        <div className="card"><h3>Comparte buenos hábitos</h3><p>Una conversación cordial ayuda a cuidar el barrio entre vecinos.</p></div>
      </div></div></section>
      <section className="container section" id="preguntas"><h2>Preguntas frecuentes</h2>
        <details className="card"><summary>¿Tiene costo registrar una mascota?</summary><p>No. El registro en HuellaLimpia es gratuito.</p></details>
        <details className="card"><summary>¿Qué distritos están disponibles?</summary><p>Los Olivos, Comas, San Martín de Porres e Independencia.</p></details>
        <details className="card"><summary>¿Cómo sé si atendieron mi reporte?</summary><p>Consulta el estado y las observaciones en tu panel.</p></details>
        <p style={{ marginTop: '2rem' }}><Link className="button" href="/acceso?modo=registro">Empezar ahora</Link></p>
      </section>
    </main>
    <footer className="footer"><div className="container"><strong>HuellaLimpia</strong><p>Una iniciativa digital para una Lima Norte más limpia y amable.</p></div></footer>
  </>;
}
