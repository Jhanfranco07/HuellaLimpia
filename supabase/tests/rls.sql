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
do $$ begin
  if (select sum(total) from public.district_metrics) <> 2 then raise exception 'District metrics backfill/trigger failed'; end if;
  if (select count(*) from public.district_metrics) <> 4 then raise exception 'Four district rows required'; end if;
end $$;
insert into storage.objects(bucket_id,name)
select 'incident-photos', reporter_id::text||'/'||id::text||'/'||gen_random_uuid()::text||'.png'
from public.incidents
where reporter_id in ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
insert into public.incident_photos(incident_id,uploader_id,storage_path)
select i.id,i.reporter_id,o.name from public.incidents i
join storage.objects o on split_part(o.name,'/',2)=i.id::text and o.bucket_id='incident-photos'
where i.reporter_id in ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222');
select set_config('test.other_incident', (select id::text from public.incidents where reporter_id='22222222-2222-4222-8222-222222222222'),true);
select set_config('test.other_photo', (select storage_path from public.incident_photos where uploader_id='22222222-2222-4222-8222-222222222222'),true);

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.pets) <> 1 then raise exception 'RLS pets citizen failed'; end if;
  if (select count(*) from public.incidents) <> 1 then raise exception 'RLS incidents citizen failed'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'RLS profiles citizen failed'; end if;
  if (select count(*) from public.incident_photos) <> 1 then raise exception 'RLS incident photos citizen failed'; end if;
  if (select count(*) from public.district_metrics) <> 0 then raise exception 'Citizen saw cross-district metrics'; end if;
  if (select count(*) from public.incident_internal_notes) <> 0 then raise exception 'Citizen saw internal notes'; end if;
  if (select count(*) from storage.objects where bucket_id='incident-photos') <> 1 then raise exception 'RLS storage objects citizen failed'; end if;
  if public.is_municipal_for('Comas') then raise exception 'Citizen municipal lookup unexpectedly succeeded'; end if;
  update public.incidents set status='resuelto' where reporter_id=auth.uid() and district='Comas';
  if found then raise exception 'Citizen municipal update unexpectedly succeeded'; end if;
  if (select count(*) from public.incidents where status='pendiente') <> 1 then raise exception 'Citizen update changed an incident'; end if;
  begin
    insert into public.pets(owner_id,name,species,age) values ('22222222-2222-4222-8222-222222222222','Intruso','Perro',2);
    raise exception 'Cross-owner pet insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  update public.pets set name='Intruso' where owner_id='22222222-2222-4222-8222-222222222222';
  if found then raise exception 'Cross-owner pet update unexpectedly succeeded'; end if;
  begin
    insert into public.incident_photos(incident_id,uploader_id,storage_path)
    values (current_setting('test.other_incident')::uuid,
      '11111111-1111-4111-8111-111111111111',current_setting('test.other_photo'));
    raise exception 'Cross-owner photo metadata insert unexpectedly succeeded';
  exception when others then
    if sqlerrm='Cross-owner photo metadata insert unexpectedly succeeded' then raise; end if;
  end;
  begin
    insert into storage.objects(bucket_id,name) values ('incident-photos',
      '11111111-1111-4111-8111-111111111111/'||current_setting('test.other_incident')||'/'||gen_random_uuid()||'.png');
    raise exception 'Cross-owner storage upload unexpectedly succeeded';
  exception when others then
    if sqlerrm='Cross-owner storage upload unexpectedly succeeded' then raise; end if;
  end;
  begin
    update public.profiles set role='municipal',district='Comas' where id='11111111-1111-4111-8111-111111111111';
    raise exception 'Citizen role escalation unexpectedly succeeded';
  exception when others then
    if sqlerrm='Citizen role escalation unexpectedly succeeded' then raise; end if;
  end;
  begin
    insert into public.incident_internal_notes(incident_id,author_id,body)
    values((select id from public.incidents limit 1),auth.uid(),'Nota privada ilegal');
    raise exception 'Citizen internal note insert unexpectedly succeeded';
  exception when others then
    if sqlerrm='Citizen internal note insert unexpectedly succeeded' then raise; end if;
  end;
end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$ begin
  if not public.is_municipal_for('Comas') then raise exception 'Municipal lookup failed'; end if;
  if public.is_municipal_for('Los Olivos') then raise exception 'Out-of-district municipal lookup succeeded'; end if;
  if (select count(*) from public.incidents where reporter_id in
    ('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222')) <> 1
    then raise exception 'RLS municipal district failed'; end if;
  if (select count(*) from public.pets) <> 0 then raise exception 'RLS municipal pets failed'; end if;
  if (select count(*) from public.incident_photos where uploader_id='11111111-1111-4111-8111-111111111111') <> 1
    then raise exception 'RLS municipal photo access failed'; end if;
  if (select count(*) from public.district_metrics) <> 4 then raise exception 'Municipal aggregate comparison failed'; end if;
  begin
    update public.incidents set status='resuelto' where district='Comas';
    raise exception 'Illegal status jump unexpectedly succeeded';
  exception when check_violation then null;
  end;
  update public.incidents set status='en_atencion', observation='La cuadrilla revisará el punto.' where district='Comas';
  update public.incidents set status='resuelto', observation='Se completó la limpieza.' where district='Comas';
  if (select resuelto from public.district_metrics where district='Comas') <> 1 then raise exception 'District status count not refreshed'; end if;
  insert into public.incident_internal_notes(incident_id,author_id,body)
    select id,auth.uid(),'Nota solo para personal municipal' from public.incidents where district='Comas';
  if (select count(*) from public.incident_internal_notes) <> 1 then raise exception 'Municipal note not saved'; end if;
  update public.incidents set status='resuelto' where district='Los Olivos';
  if found then raise exception 'Out-of-district update unexpectedly succeeded'; end if;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
do $$ begin
  if (select count(*) from public.incident_internal_notes) <> 0 then raise exception 'Internal note leaked to citizen'; end if;
  if (select observation from public.incidents where district='Comas' limit 1) <> 'Se completó la limpieza.' then raise exception 'Public note missing'; end if;
end $$;
rollback;
