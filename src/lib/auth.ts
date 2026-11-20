import { redirect } from 'next/navigation';
import { supabase } from './supabase';
export async function requireUser(){const db=await supabase();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/acceso');const {data:profile}=await db.from('profiles').select('id,full_name,role,district').eq('id',user.id).single();if(!profile)throw new Error('No se encontró el perfil.');return {db,user,profile};}
