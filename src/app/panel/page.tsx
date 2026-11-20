import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { incidentStatuses } from '@/lib/validation';

const labels:Record<string,string>={pendiente:'Pendientes',en_revision:'En revisión',en_atencion:'En atención',resuelto:'Resueltos',rechazado:'Rechazados'};
export default async function Dashboard(){
  const {db,profile,user}=await requireUser();
  const municipal=profile.role==='municipal';
  const incidents=db.from('incidents').select('id,status,district,address');
  const {data:reports,error}=await (municipal?incidents.eq('district',profile.district):incidents.eq('reporter_id',user.id));
  const {count:pets,error:petError}=municipal?{count:null,error:null}:await db.from('pets').select('*',{count:'exact',head:true}).eq('owner_id',user.id);
  const counts=Object.fromEntries(incidentStatuses.map(status=>[status,(reports??[]).filter(r=>r.status===status).length]));
  const total=reports?.length??0;
  const zones=municipal?Object.entries((reports??[]).reduce<Record<string,number>>((all,r)=>{
    const address=r.address.trim();all[address]=(all[address]??0)+1;return all;
  },{})).sort((a,b)=>b[1]-a[1]).slice(0,5):[];
  return <>
    <p className="breadcrumb">Panel / Resumen</p><h1>Hola, {profile.full_name}</h1>
    <p className="muted">{municipal?`Indicadores de ${profile.district}. Tu cuenta solo puede consultar este distrito.`:'Tu espacio para cuidar a tu mascota y tu barrio.'}</p>
    {(error||petError)&&<p className="alert error" role="alert">No se pudieron cargar todos los indicadores.</p>}
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
    </section><section className="card" style={{marginTop:'1.5rem'}}><h2>Direcciones con más reportes</h2>
      {zones.length===0?<p className="muted">Todavía no hay datos de zonas.</p>:<ol>{zones.map(([address,count])=><li key={address}>{address}: {count} {count===1?'reporte':'reportes'}</li>)}</ol>}
    </section></>}
    <p style={{marginTop:'2rem'}}><Link className="button" href={municipal?'/panel/gestion':'/panel/reportes'}>{municipal?'Gestionar reportes':'Ver mis reportes'}</Link></p>
  </>;
}
