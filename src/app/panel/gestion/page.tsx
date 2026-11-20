import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { updateIncident } from '@/app/actions';
import { SubmitButton } from '@/components/submit-button';
import { incidentStatuses } from '@/lib/validation';

const statuses=incidentStatuses;
export default async function Management({searchParams}:{searchParams:Promise<{estado?:string;error?:string;mensaje?:string}>}){
  const {db,profile}=await requireUser();
  if(profile.role!=='municipal')redirect('/panel');
  const p=await searchParams;
  const selected=statuses.find(s=>s===p.estado);
  let query=db.from('incidents').select('id,district,address,description,status,observation,created_at,incident_photos(storage_path)')
    .eq('district',profile.district).order('created_at',{ascending:false});
  if(selected)query=query.eq('status',selected);
  const {data:reports,error}=await query;
  const ids=(reports??[]).map(r=>r.id);
  const {data:history,error:historyError}=ids.length
    ?await db.from('incident_status_history').select('incident_id,old_status,new_status,observation,changed_by,created_at').in('incident_id',ids).order('created_at',{ascending:true})
    :{data:[],error:null};
  const photos=await Promise.all((reports??[]).map(async r=>{
    const path=r.incident_photos?.[0]?.storage_path;
    if(!path)return [r.id,null] as const;
    const {data}=await db.storage.from('incident-photos').createSignedUrl(path,300);
    return [r.id,data?.signedUrl??null] as const;
  }));
  const photoUrls=new Map(photos);
  return <>
    <p className="breadcrumb">Panel / Gestión</p><h1>Reportes de {profile.district}</h1>
    <p className="muted">Revisa incidencias y registra cada cambio de atención. El distrito se limita a tu asignación municipal.</p>
    {p.error&&<p className="alert error" role="alert">Revisa el estado y la observación. Si rechazas un reporte, indica el motivo.</p>}
    {p.mensaje&&<p className="alert" role="status">Estado actualizado.</p>}
    {(error||historyError)&&<p className="alert error" role="alert">No se pudieron cargar todos los datos de gestión.</p>}
    <form method="get" className="form"><label htmlFor="estado">Filtrar por estado</label>
      <div className="actions"><select id="estado" name="estado" defaultValue={selected??''}><option value="">Todos</option>
        {statuses.map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
      </select><button type="submit">Filtrar</button></div>
    </form>
    {reports?.length===0&&<p className="alert">No hay reportes para este filtro.</p>}
    <div className="stack" style={{marginTop:'2rem'}}>{reports?.map(r=><article className="card" key={r.id}>
      <h2>{r.address}</h2><p>{r.description}</p>
      <p className="muted">{new Date(r.created_at).toLocaleDateString('es-PE')} · {r.status.replaceAll('_',' ')}</p>
      {photoUrls.get(r.id)&&<p><a href={photoUrls.get(r.id)!} target="_blank" rel="noopener noreferrer">Ver fotografía adjunta</a></p>}
      <form action={updateIncident}><input type="hidden" name="id" value={r.id}/>
        <label htmlFor={`status-${r.id}`}>Estado</label><select id={`status-${r.id}`} name="status" defaultValue={r.status}>
          {statuses.map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}
        </select><label htmlFor={`observation-${r.id}`}>Observación (obligatoria para rechazar)</label>
        <textarea id={`observation-${r.id}`} name="observation" rows={2} maxLength={1000} defaultValue={r.observation??''}/>
        <SubmitButton label="Guardar estado" pendingLabel="Guardando estado..." />
      </form>
      <details><summary>Historial de atención</summary><ol>
        {history?.filter(h=>h.incident_id===r.id).map((h,index)=><li key={`${h.created_at}-${index}`}>
          {new Date(h.created_at).toLocaleString('es-PE')}: {h.old_status?`${h.old_status.replaceAll('_',' ')} → `:''}{h.new_status.replaceAll('_',' ')}
          {h.observation&&` · ${h.observation}`}
          <span className="muted"> · Actor: {h.changed_by?.slice(0,8)??'sistema'}</span>
        </li>)}
      </ol></details>
    </article>)}</div>
  </>;
}
