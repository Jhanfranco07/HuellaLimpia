export type LocatedReport={latitude:number|null;longitude:number|null;address:string};
export type CriticalZone={label:string;latitude:number|null;longitude:number|null;count:number};

// Una celda de 0,001° agrupa puntos cercanos sin publicar coordenadas exactas.
export function criticalZones(reports:LocatedReport[]):CriticalZone[]{
  const groups=new Map<string,CriticalZone>();
  for(const report of reports){
    const located=report.latitude!==null&&report.longitude!==null;
    const latitude=located?Math.round(report.latitude!*1000)/1000:null;
    const longitude=located?Math.round(report.longitude!*1000)/1000:null;
    const label=located?`Zona ${latitude!.toFixed(3)}, ${longitude!.toFixed(3)}`:report.address.trim();
    const key=located?`${latitude},${longitude}`:`sin:${label.toLocaleLowerCase('es-PE')}`;
    const group=groups.get(key);
    if(group)group.count++;
    else groups.set(key,{label,latitude,longitude,count:1});
  }
  return [...groups.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label,'es-PE'));
}
