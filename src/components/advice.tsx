import Image from 'next/image';

export function Advice() {
  return <><div className="advice-grid">
    <article className="advice-card">
      <Image src="/recoger-residuos.jpg" alt="Persona recoge los desechos de su perro durante un paseo" width={1280} height={852} sizes="(max-width: 760px) 100vw, 34vw" />
      <div><span className="eyebrow">01 · Tenencia responsable</span><h3>Sal preparado a cada paseo</h3><p>Lleva bolsas, agua y correa. Recoge los desechos de tu mascota y deposítalos en un recipiente adecuado.</p></div>
    </article>
    <article className="advice-card">
      <Image src="/parque-los-olivos.jpg" alt="Parque público del distrito de Los Olivos" width={1280} height={960} sizes="(max-width: 760px) 100vw, 34vw" />
      <div><span className="eyebrow">02 · Espacios compartidos</span><h3>Cuida parques y veredas</h3><p>Respeta jardines, zonas de juego y a las demás personas. Deja cada espacio limpio para quien venga después.</p></div>
    </article>
    <article className="advice-card">
      <Image src="/lima-norte-aerea.jpg" alt="Vista aérea de distritos de Lima Norte" width={1280} height={720} sizes="(max-width: 760px) 100vw, 34vw" />
      <div><span className="eyebrow">03 · Comunidad</span><h3>Haz visible un punto crítico</h3><p>Si encuentras acumulación de desechos, indica la ubicación y describe el problema para facilitar su atención.</p></div>
    </article>
  </div><p className="photo-credit">Fotografías ilustrativas: <a href="https://commons.wikimedia.org/wiki/File:Dog_feces_remove.jpg" target="_blank" rel="noopener noreferrer">SunOfErat (dominio público)</a>, <a href="https://commons.wikimedia.org/wiki/File:Los_Olivos_-_Parque_de_la_Divina_Misericordia,_toma_2.jpg" target="_blank" rel="noopener noreferrer">Antonio Steven Fernando (CC BY-SA 4.0)</a> y <a href="https://commons.wikimedia.org/wiki/File:San_Mart%C3%ADn_de_Porres,_Los_Olivos_and_Independencia_districts,_Lima,_Peru.jpg" target="_blank" rel="noopener noreferrer">WMrapids (CC0)</a>. Imágenes redimensionadas; <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">licencia CC BY-SA 4.0</a>.</p></>;
}
