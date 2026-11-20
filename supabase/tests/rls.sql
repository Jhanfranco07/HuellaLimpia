begin;
insert into auth.users(id,instance_id,aud,role,email,encrypted_password,created_at,updated_at)
values
('11111111-1111-4111-8111-111111111111','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ciudadano1@example.invalid','x',now(),now()),
('22222222-2222-4222-8222-222222222222','00000000-0000-0000-0000-000000000000','authenticated','authenticated','ciudadano2@example.invalid','x',now(),now()),
('33333333-3333-4333-8333-333333333333','00000000-0000-0000-0000-000000000000','authenticated','authenticated','municipal@example.invalid','x',now(),now());
update public.profiles set role='municipal', district='Comas' where id='33333333-3333-4333-8333-333333333333';
insert into public.pets(owner_id,name,species,age) values ('11111111-1111-4111-8111-111111111111','Luna','Perro',3),('22222222-2222-4222-8222-222222222222','Michi','Gato',2);
insert into public.incidents(reporter_id,district,address,description) values
('11111111-1111-4111-8111-111111111111','Comas','Parque central 123','Hay desechos acumulados en el parque.'),
('22222222-2222-4222-8222-222222222222','Los Olivos','Avenida norte 456','Hay desechos acumulados en la vereda.');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.pets) <> 1 then raise exception 'RLS pets citizen failed'; end if;
  if (select count(*) from public.incidents) <> 1 then raise exception 'RLS incidents citizen failed'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'RLS profiles citizen failed'; end if;
  if public.is_municipal_for('Comas') then raise exception 'Citizen municipal lookup unexpectedly succeeded'; end if;
  update public.incidents set status='resuelto' where reporter_id=auth.uid() and district='Comas';
  if found then raise exception 'Citizen municipal update unexpectedly succeeded'; end if;
  if (select count(*) from public.incidents where status='pendiente') <> 1 then raise exception 'Citizen update changed an incident'; end if;
  begin
    insert into public.pets(owner_id,name,species,age) values ('22222222-2222-4222-8222-222222222222','Intruso','Perro',2);
    raise exception 'Cross-owner pet insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set role='municipal',district='Comas' where id='11111111-1111-4111-8111-111111111111';
    raise exception 'Citizen role escalation unexpectedly succeeded';
  exception when others then
    if sqlerrm='Citizen role escalation unexpectedly succeeded' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
  if not public.is_municipal_for('Comas') then raise exception 'Municipal lookup failed'; end if;
  if public.is_municipal_for('Los Olivos') then raise exception 'Out-of-district municipal lookup succeeded'; end if;
  if (select count(*) from public.incidents) <> 1 then raise exception 'RLS municipal district failed'; end if;
  if (select count(*) from public.pets) <> 0 then raise exception 'RLS municipal pets failed'; end if;
  update public.incidents set status='resuelto' where district='Los Olivos';
  if found then raise exception 'Out-of-district update unexpectedly succeeded'; end if;
end $$;
rollback;
