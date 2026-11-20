type MapPoint={latitude:number;longitude:number;label:string;count?:number};
const bounds={west:-77.25,east:-76.85,north:-11.75,south:-12.15};

export function GeoMap({points,title}:{points:MapPoint[];title:string}){
  const width=760,height=400,padding=46;
  const position=(latitude:number,longitude:number)=>({
    x:padding+(longitude-bounds.west)/(bounds.east-bounds.west)*(width-2*padding),
    y:padding+(bounds.north-latitude)/(bounds.north-bounds.south)*(height-2*padding)
  });
  return <div className="geo-map">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}. Mapa esquemático de Lima Norte con ${points.length} ubicaciones.`}>
      <rect x="0" y="0" width={width} height={height} rx="18" fill="#e5f3eb"/>
      {[1,2,3].map(i=><g key={i} stroke="#bdd9c8" strokeWidth="1"><line x1={padding+i*(width-2*padding)/4} y1={padding} x2={padding+i*(width-2*padding)/4} y2={height-padding}/><line x1={padding} y1={padding+i*(height-2*padding)/4} x2={width-padding} y2={padding+i*(height-2*padding)/4}/></g>)}
      <text x={padding} y="28" fill="#365f50" fontSize="14">Norte ↑</text>
      <text x={width-padding} y={height-14} textAnchor="end" fill="#365f50" fontSize="13">Coordenadas aproximadas · Lima Norte</text>
      {points.map((point,index)=>{const {x,y}=position(point.latitude,point.longitude);return <g key={`${point.label}-${index}`}><circle cx={x} cy={y} r={Math.min(25,9+(point.count??1)*3)} fill="#17624d" fillOpacity=".85" stroke="white" strokeWidth="3"/><text x={x} y={y+5} textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">{point.count??1}</text><title>{point.label}: {point.count??1} {point.count===1?'reporte':'reportes'}</title></g>})}
    </svg>
    {points.length===0&&<p className="muted">Los reportes actuales no tienen coordenadas. Se muestran en la lista de zonas.</p>}
  </div>;
}
