import Image from 'next/image';

export function ReportPhoto({url, district, demo}:{url:string; district:string; demo:boolean}) {
  return <figure className="report-photo">
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir fotografía del reporte en ${district} en una pestaña nueva`}>
      <Image src={url} alt={`Fotografía adjunta al reporte en ${district}`} width={800} height={500} unoptimized />
    </a>
    <figcaption>{demo ? 'Imagen referencial de demostración; no documenta esta incidencia.' : 'Fotografía adjunta por el ciudadano.'} <a href={url} target="_blank" rel="noopener noreferrer">Abrir imagen</a></figcaption>
  </figure>;
}
