-- La política consulta únicamente el perfil visible para el usuario autenticado.
-- SECURITY INVOKER evita que la función eluda RLS al ejecutarse desde la API.
create or replace function public.is_municipal_for(d text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'municipal'
      and district = d
  );
$$;

revoke execute on function public.is_municipal_for(text) from public, anon;
grant execute on function public.is_municipal_for(text) to authenticated;
