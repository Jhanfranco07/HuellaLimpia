import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { incidentStatuses } from '@/lib/validation';
import { criticalZones } from '@/lib/geo';
import { GeoMap } from '@/components/geo-map';

const labels:Record<string,string>={pendiente:'Pendientes',en_revision:'En revisión',en_atencion:'En atención',resuelto:'Resueltos',rechazado:'Rechazados'};
export default async function Dashboard(){
  const {db,profile,user}=await requireUser();
  const municipal=profile.role==='municipal';
  const incidents=db.from('incidents').select('id,status,district,address,latitude,longitude');
  const {data:reports,error}=await (municipal?incidents.eq('district',profile.district):incidents.eq('reporter_id',user.id));
  const {data:districtMetrics,error:metricsError}=municipal?await db.from('district_metrics').select('district,total,pendiente,en_revision,en_atencion,resuelto,rechazado').order('district'):{data:null,error:null};
  const {count:pets,error:petError}=municipal?{count:null,error:null}:await db.from('pets').select('*',{count:'exact',head:true}).eq('owner_id',user.id);
  const counts=Object.fromEntries(incidentStatuses.map(status=>[status,(reports??[]).filter(r=>r.status===status).length]));
  const total=reports?.length??0;
  const zones=criticalZones((reports??[]).map(r=>({address:r.address,latitude:r.latitude,longitude:r.longitude}))).slice(0,5);
  const mappedZones=zones.filter(z=>z.latitude!==null&&z.longitude!==null).map(z=>({latitude:z.latitude!,longitude:z.longitude!,label:z.label,count:z.count}));
  return <>
    <p className="breadcrumb">Panel / Resumen</p><h1>Hola, {profile.full_name}</h1>
    <p className="muted">{municipal?`Indicadores de ${profile.district}. Tu cuenta solo puede consultar este distrito.`:'Tu espacio para cuidar a tu mascota y tu barrio.'}</p>
    {(error||petError||metricsError)&&<p className="alert error" role="alert">No se pudieron cargar todos los indicadores.</p>}
    {!error&&total===0&&<p className="alert">Aún no hay reportes para mostrar indicadores.</p>}
    <div className="grid" style={{marginTop:'2rem'}}>
      <div className="card"><p>Reportes</p><p className="stat">{error?'—':total}</p></div>
      <div className="card"><p>Pendientes</p><p className="stat">{error?'—':counts.pendiente}</p></div>
      <div className="card"><p>{municipal?'Resueltos':'Mascotas'}</p><p className="stat">{municipal?(error?'—':counts.resuelto):(petError?'—':pets??0)}</p></div>
    </div>
    {municipal&&!error&&<><section className="card" style={{marginTop:'1.5rem'}} aria-labelledby="estado-heading">
      <h2 id="estado-heading">Reportes por estado</h2>
      {incidentStatuses.map(status=><div className="indicator-row" key={status}>
        <span>{labels[status]}</span><div className="indicator-track" role="img" aria-label={`${labels[status]}: ${counts[status]} de ${total}`}>
          <span style={{width:`${total?counts[status]/total*100:0}%`}}/></div><strong>{counts[status]}</strong>
      </div>)}
    </section>{!metricsError&&<section className="card" style={{marginTop:'1.5rem'}}><h2>Comparación entre distritos</h2><p className="muted">Cifras agregadas de los cuatro distritos. Los reportes individuales de otros distritos permanecen privados.</p><div className="tablewrap"><table className="table"><thead><tr><th>Distrito</th><th>Total</th><th>Pendientes</th><th>En atención</th><th>Resueltos</th></tr></thead><tbody>{districtMetrics?.map(row=><tr key={row.district}><th scope="row">{row.district}</th><td>{row.total}</td><td>{row.pendiente}</td><td>{row.en_atencion}</td><td>{row.resuelto}</td></tr>)}</tbody></table></div></section>}<section className="card" style={{marginTop:'1.5rem'}}><h2>Zonas críticas de {profile.district}</h2><p className="muted">Los puntos cercanos se agrupan en celdas de 0,001°. Los reportes sin coordenadas se agrupan por dirección.</p><GeoMap title={`Zonas críticas de ${profile.district}`} points={mappedZones}/>
      {zones.length===0?<p className="muted">Todavía no hay datos de zonas.</p>:<ol>{zones.map(zone=><li key={zone.label}>{zone.label}: {zone.count} {zone.count===1?'reporte':'reportes'}{zone.latitude===null?' · sin coordenadas':''}</li>)}</ol>}
    </section></>}
    {!municipal&&!error&&<section className="card" style={{marginTop:'1.5rem'}}><h2>Mis reportes en el mapa</h2><GeoMap title="Mis reportes" points={(reports??[]).filter(r=>r.latitude!==null&&r.longitude!==null).map(r=>({latitude:r.latitude!,longitude:r.longitude!,label:r.address}))}/></section>}
    <p style={{marginTop:'2rem'}}><Link className="button" href={municipal?'/panel/gestion':'/panel/reportes'}>{municipal?'Gestionar reportes':'Ver mis reportes'}</Link></p>
  </>;
}
