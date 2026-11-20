'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { allowedNextStatuses,incidentSchema,petSchema,statusSchema } from '@/lib/validation';
import { z } from 'zod';
const val=(f:FormData,k:string)=>String(f.get(k)??'');
export async function signIn(form:FormData){const db=await supabase();const {error}=await db.auth.signInWithPassword({email:val(form,'email'),password:val(form,'password')});if(error)redirect(error.code==='email_not_confirmed'?'/acceso?error=confirmacion':'/acceso?error=credenciales');redirect('/panel');}
export async function signUp(form:FormData){const parsed=z.object({fullName:z.string().trim().min(3).max(120),email:z.email(),password:z.string().min(8).max(72)}).safeParse({fullName:val(form,'full_name'),email:val(form,'email'),password:val(form,'password')});if(!parsed.success)redirect('/acceso?modo=registro&error=validacion');const db=await supabase();const {data,error}=await db.auth.signUp({email:parsed.data.email,password:parsed.data.password,options:{data:{full_name:parsed.data.fullName}}});if(error){if(error.message.toLowerCase().includes('already registered'))redirect('/acceso?modo=registro&error=duplicado');redirect('/acceso?modo=registro&error=registro')}if(data.session)redirect('/panel');redirect('/acceso?mensaje=verifica');}
export async function signOut(){const db=await supabase();await db.auth.signOut({scope:'local'});redirect('/');}
export async function updateProfile(form: FormData) {
  const { db, user } = await requireUser();
  const parsed = z.string().trim().min(3).max(120).safeParse(val(form, 'full_name'));
  if (!parsed.success) redirect('/panel/perfil?error=validacion');
  const { data, error } = await db.from('profiles').update({ full_name: parsed.data }).eq('id', user.id).select('id').single();
  if (error || !data) redirect('/panel/perfil?error=guardar');
  revalidatePath('/panel');
  revalidatePath('/panel/perfil');
  redirect('/panel/perfil?mensaje=guardado');
}
export async function savePet(form:FormData){const {db,user,profile}=await requireUser();if(profile.role!=='citizen')throw new Error('Acceso denegado');const parsed=petSchema.safeParse({name:val(form,'name'),species:val(form,'species'),breed:val(form,'breed'),age:val(form,'age')});if(!parsed.success)redirect('/panel/mascotas?error=validacion');const id=val(form,'id');const query=id?db.from('pets').update(parsed.data).eq('id',id).eq('owner_id',user.id):db.from('pets').insert({...parsed.data,owner_id:user.id});const {data,error}=await query.select('id').single();if(error||!data)redirect('/panel/mascotas?error=guardar');revalidatePath('/panel/mascotas');redirect('/panel/mascotas?mensaje=guardado');}
async function photoExtension(file:File){
  const types:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};
  const extension=types[file.type];
  if(!extension||file.size>5*1024*1024||file.size===0)return null;
  const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
  const valid=extension==='jpg' ? header[0]===0xff&&header[1]===0xd8&&header[2]===0xff
    : extension==='png' ? [137,80,78,71,13,10,26,10].every((byte,i)=>header[i]===byte)
    : String.fromCharCode(...header.slice(0,4))==='RIFF'&&String.fromCharCode(...header.slice(8,12))==='WEBP';
  return valid?extension:null;
}
async function storePhoto(db:Awaited<ReturnType<typeof supabase>>,file:File,extension:string,userId:string,incidentId:string){
  const path=`${userId}/${incidentId}/${crypto.randomUUID()}.${extension}`;
  const uploaded=await db.storage.from('incident-photos').upload(path,Buffer.from(await file.arrayBuffer()),{contentType:file.type,upsert:false});
  if(uploaded.error)return false;
  const saved=await db.from('incident_photos').insert({incident_id:incidentId,uploader_id:userId,storage_path:path});
  if(saved.error){await db.storage.from('incident-photos').remove([path]);return false;}
  return true;
}
export async function createIncident(form:FormData){
  const {db,user,profile}=await requireUser();
  if(profile.role!=='citizen')throw new Error('Acceso denegado');
  const parsed=incidentSchema.safeParse({district:val(form,'district'),address:val(form,'address'),description:val(form,'description'),latitude:val(form,'latitude'),longitude:val(form,'longitude')});
  if(!parsed.success)redirect('/panel/reportes?error=validacion');
  const photo=form.get('photo');
  const file=photo instanceof File && photo.size>0 ? photo : null;
  const extension=file?await photoExtension(file):null;
  if(file&&!extension)redirect('/panel/reportes?error=foto');
  const {data:incident,error}=await db.from('incidents').insert({...parsed.data,reporter_id:user.id}).select('id').single();
  if(error||!incident)redirect('/panel/reportes?error=guardar');
  if(file&&extension&&!await storePhoto(db,file,extension,user.id,incident.id))redirect('/panel/reportes?mensaje=sin-foto');
  revalidatePath('/panel/reportes');
  redirect('/panel/reportes?mensaje=guardado');
}
export async function attachIncidentPhoto(form:FormData){
  const {db,user,profile}=await requireUser();
  if(profile.role!=='citizen')throw new Error('Acceso denegado');
  const id=val(form,'id');
  const file=form.get('photo');
  if(!(file instanceof File))redirect('/panel/reportes?error=foto');
  const extension=await photoExtension(file);
  if(!extension)redirect('/panel/reportes?error=foto');
  const {data:report}=await db.from('incidents').select('id,incident_photos(id)').eq('id',id).eq('reporter_id',user.id).single();
  if(!report||report.incident_photos?.length)redirect('/panel/reportes?error=adjuntar');
  if(!await storePhoto(db,file,extension,user.id,id))redirect('/panel/reportes?error=subida');
  revalidatePath('/panel/reportes');
  redirect('/panel/reportes?mensaje=foto-guardada');
}
export async function updateIncident(form:FormData){
  const {db,profile}=await requireUser();
  if(profile.role!=='municipal')throw new Error('Acceso denegado');
  const parsed=statusSchema.safeParse({status:val(form,'status'),observation:val(form,'observation')});
  if(!parsed.success)redirect('/panel/gestion?error=validacion');
  const id=val(form,'id');
  const {data:current}=await db.from('incidents').select('status').eq('id',id).eq('district',profile.district).single();
  if(!current||!allowedNextStatuses(current.status).includes(parsed.data.status))redirect('/panel/gestion?error=transicion');
  const {data,error}=await db.from('incidents').update(parsed.data).eq('id',id).eq('district',profile.district).eq('status',current.status).select('id').single();
  if(error||!data)redirect(error?.code==='23514'?'/panel/gestion?error=transicion':'/panel/gestion?error=guardar');
  revalidatePath('/panel/gestion');
  redirect('/panel/gestion?mensaje=guardado');
}
export async function addInternalNote(form:FormData){
  const {db,user,profile}=await requireUser();
  if(profile.role!=='municipal')throw new Error('Acceso denegado');
  const body=z.string().trim().min(3).max(1000).safeParse(val(form,'internal_note'));
  if(!body.success)redirect('/panel/gestion?error=nota');
  const id=val(form,'id');
  const {data:incident}=await db.from('incidents').select('id').eq('id',id).eq('district',profile.district).single();
  if(!incident)redirect('/panel/gestion?error=nota');
  const {error}=await db.from('incident_internal_notes').insert({incident_id:id,author_id:user.id,body:body.data});
  if(error)redirect('/panel/gestion?error=nota');
  revalidatePath('/panel/gestion');
  redirect('/panel/gestion?mensaje=nota');
}
