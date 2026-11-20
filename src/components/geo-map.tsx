'use client';

import { useState } from 'react';

type MapPoint={latitude:number;longitude:number;label:string;count?:number};
const overview='https://www.openstreetmap.org/export/embed.html?bbox=-77.25%2C-12.15%2C-76.85%2C-11.75&layer=mapnik';

function pointUrl(point:MapPoint){
  const lat=point.latitude.toFixed(6);
  const lon=point.longitude.toFixed(6);
  const bbox=[point.longitude-.012,point.latitude-.008,point.longitude+.012,point.latitude+.008]
    .map(value=>value.toFixed(6)).join(',');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${lat},${lon}`)}`;
}

export function GeoMap({points,title}:{points:MapPoint[];title:string}){
  const [selected,setSelected]=useState<number|null>(null);
  const point=selected===null?null:points[selected];
  return <div className="geo-map">
    <iframe title={`${title} en OpenStreetMap`} src={point?pointUrl(point):overview} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"/>
    <p className="map-attribution">Mapa: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© colaboradores de OpenStreetMap</a>.</p>
    {points.length===0?<p className="muted">Los reportes actuales no tienen coordenadas. Se muestran en la lista de zonas.</p>
      :<div className="map-locations" aria-label={`Ubicaciones de ${title}`}><p className="muted">Selecciona una ubicación para verla en el mapa.</p><ul>{points.map((location,index)=><li key={`${location.label}-${index}`}><button type="button" className={selected===index?'selected':''} aria-pressed={selected===index} onClick={()=>setSelected(index)}>{location.label}{location.count&&location.count>1?` · ${location.count} reportes`:''}</button></li>)}</ul></div>}
  </div>;
}
