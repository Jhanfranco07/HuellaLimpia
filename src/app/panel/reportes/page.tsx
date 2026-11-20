import { requireUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { attachIncidentPhoto,createIncident } from '@/app/actions';
import { districts } from '@/lib/validation';
import { SubmitButton } from '@/components/submit-button';
import { ReportPhoto } from '@/components/report-photo';
import { CoordinateFields } from '@/components/coordinate-fields';
import { GeoMap } from '@/components/geo-map';

export default async function Reports({searchParams}:{searchParams:Promise<{error?:string;mensaje?:string}>}){
  const {db,user,profile}=await requireUser();
  if(profile.role!=='citizen')redirect('/panel');
  const p=await searchParams;
  const {data:reports,error}=await db.from('incidents')
    .select('id,district,address,description,status,observation,latitude,longitude,created_at,incident_photos(id,storage_path)')
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
    'sin-foto':'El reporte se guardó sin fotografía. Puedes volver a adjuntarla desde el historial.',
    'foto-guardada':'Fotografía adjuntada al reporte.'
  };
  return <>
    <p className="breadcrumb">Panel / Mis reportes</p><h1>Mis reportes</h1>
    <p className="muted">Ayúdanos a identificar problemas de salubridad en Lima Norte.</p>
    {p.error&&<p className="alert error" role="alert">{p.error==='foto'?'Usa una imagen JPG, PNG o WebP válida de hasta 5 MB.':p.error==='subida'?'No se pudo subir la fotografía. El reporte sigue guardado; intenta adjuntarla otra vez.':p.error==='adjuntar'?'No puedes adjuntar una fotografía a ese reporte.':'Revisa los datos del reporte e intenta otra vez.'}</p>}
    {p.mensaje&&<p className="alert" role="status">{messages[p.mensaje]??messages.guardado}</p>}
    {error&&<p className="alert error" role="alert">No se pudieron cargar los reportes.</p>}
    <section className="card form"><h2>Nuevo reporte</h2>
      <form action={createIncident} encType="multipart/form-data">
        <label htmlFor="district">Distrito</label><select id="district" name="district">{districts.map(d=><option key={d}>{d}</option>)}</select>
        <label htmlFor="address">Dirección o referencia</label><input id="address" name="address" required minLength={5} maxLength={180}/>
        <label htmlFor="description">Describe el problema</label><textarea id="description" name="description" required minLength={15} maxLength={2000} rows={4}/>
        <CoordinateFields />
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
      {r.latitude!==null&&r.longitude!==null&&<div className="report-map"><GeoMap title={`Ubicación del reporte en ${r.district}`} points={[{latitude:r.latitude,longitude:r.longitude,label:r.address}]}/></div>}
      {photoUrls.get(r.id)&&<ReportPhoto url={photoUrls.get(r.id)!} district={r.district} demo={r.address.startsWith('DEMO ACADÉMICA')} />}
      {r.incident_photos.length===0&&<form action={attachIncidentPhoto} encType="multipart/form-data" className="retry-photo"><input type="hidden" name="id" value={r.id}/><label htmlFor={`retry-photo-${r.id}`}>Adjuntar fotografía pendiente</label><input id={`retry-photo-${r.id}`} name="photo" type="file" accept="image/jpeg,image/png,image/webp" required/><SubmitButton label="Adjuntar fotografía" pendingLabel="Subiendo fotografía..." /></form>}
    </article>)}</div>
  </>;
}
