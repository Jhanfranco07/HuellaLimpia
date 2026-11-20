import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export function configured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)}
export async function supabase(){
  const jar=await cookies();
  if(!configured()) throw new Error('Configura las variables públicas de Supabase.');
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{cookies:{getAll(){return jar.getAll()},setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{ /* Server Components cannot set cookies; mutation paths use actions. */ }}}});
}
