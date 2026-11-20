import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createIncident } from '@/app/actions';
import { districts } from '@/lib/validation';
import { SubmitButton } from '@/components/submit-button';

export default async function Reports({searchParams}:{searchParams:Promise<{error?:string;mensaje?:string}>}){
  const {db,user,profile}=await requireUser();
  if(profile.role!=='citizen')redirect('/panel');
  const p=await searchParams;
  const {data:reports,error}=await db.from('incidents')
    .select('id,district,address,description,status,observation,created_at,incident_photos(id,storage_path)')
    .eq('reporter_id',user.id).order('created_at',{ascending:false});
  const photos=await Promise.all((reports??[]).map(async report=>{
    const first=report.incident_photos?.[0];
    if(!first)return [report.id,null] as const;
    const {data}=await db.storage.from('incident-photos').createSignedUrl(first.storage_path,300);
    return [report.id,data?.signedUrl??null] as const;
  }));
  const photoUrls=new Map(photos);
  const messages:Record<string,string>={
    guardado:'Reporte enviado.',
    'sin-foto':'El reporte se guardó, pero la fotografía no se pudo adjuntar. Contacta al equipo para completar el registro.'
  };
  return <>
    <p className="breadcrumb">Panel / Mis reportes</p><h1>Mis reportes</h1>
    <p className="muted">Ayúdanos a identificar problemas de salubridad en Lima Norte.</p>
    {p.error&&<p className="alert error" role="alert">{p.error==='foto'?'Usa una imagen JPG, PNG o WebP válida de hasta 5 MB.':'Revisa los datos del reporte e intenta otra vez.'}</p>}
    {p.mensaje&&<p className="alert" role="status">{messages[p.mensaje]??messages.guardado}</p>}
    {error&&<p className="alert error" role="alert">No se pudieron cargar los reportes.</p>}
    <section className="card form"><h2>Nuevo reporte</h2>
      <form action={createIncident} encType="multipart/form-data">
        <label htmlFor="district">Distrito</label><select id="district" name="district">{districts.map(d=><option key={d}>{d}</option>)}</select>
        <label htmlFor="address">Dirección o referencia</label><input id="address" name="address" required minLength={5} maxLength={180}/>
        <label htmlFor="description">Describe el problema</label><textarea id="description" name="description" required minLength={15} maxLength={2000} rows={4}/>
        <label htmlFor="photo">Fotografía (opcional)</label><input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help"/>
        <p id="photo-help" className="muted">JPG, PNG o WebP, hasta 5 MB.</p>
        <SubmitButton label="Enviar reporte" pendingLabel="Enviando reporte..." />
      </form>
    </section>
    <h2 style={{marginTop:'3rem'}}>Historial</h2>
    {reports?.length===0&&<p className="alert">Todavía no tienes reportes. Crea uno con el formulario.</p>}
    <div className="stack">{reports?.map(r=><article className="card" key={r.id}>
      <strong>{r.district} · {r.address}</strong><p>{r.description}</p>
      <p className="muted">Estado: {r.status.replaceAll('_',' ')} · {new Date(r.created_at).toLocaleDateString('es-PE')}</p>
      {r.observation&&<p>Observación municipal: {r.observation}</p>}
      {photoUrls.get(r.id)&&<a href={photoUrls.get(r.id)!} target="_blank" rel="noopener noreferrer">Ver fotografía adjunta</a>}
    </article>)}</div>
  </>;
}
