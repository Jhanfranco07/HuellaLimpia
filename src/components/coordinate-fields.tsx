'use client';
import { useState } from 'react';

export function CoordinateFields(){
  const [coords,setCoords]=useState<{latitude:string;longitude:string}>({latitude:'',longitude:''});
  const [message,setMessage]=useState('');
  function useLocation(){
    if(!navigator.geolocation){setMessage('Tu navegador no permite obtener la ubicación. Puedes escribir las coordenadas.');return;}
    navigator.geolocation.getCurrentPosition(({coords:position})=>{
      setCoords({latitude:position.latitude.toFixed(6),longitude:position.longitude.toFixed(6)});
      setMessage('Ubicación añadida. Verifica que corresponde al punto del reporte.');
    },()=>setMessage('No se pudo obtener la ubicación. Puedes escribir las coordenadas.'),{enableHighAccuracy:false,timeout:10000});
  }
  return <fieldset className="coordinate-fields"><legend>Ubicación en el mapa (opcional)</legend>
    <p className="muted">Indica el punto del incidente. Las coordenadas se muestran solo a ti y al municipio autorizado.</p>
    <div className="coordinate-grid"><div><label htmlFor="latitude">Latitud</label><input id="latitude" name="latitude" type="number" step="any" min="-12.15" max="-11.75" value={coords.latitude} onChange={event=>setCoords({...coords,latitude:event.target.value})} placeholder="-11.950000" /></div><div><label htmlFor="longitude">Longitud</label><input id="longitude" name="longitude" type="number" step="any" min="-77.25" max="-76.85" value={coords.longitude} onChange={event=>setCoords({...coords,longitude:event.target.value})} placeholder="-77.050000" /></div></div>
    <button type="button" className="secondary" onClick={useLocation}>Usar mi ubicación</button>
    {message&&<p role="status">{message}</p>}
  </fieldset>;
}
