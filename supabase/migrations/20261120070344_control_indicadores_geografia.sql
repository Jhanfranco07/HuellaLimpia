-- Coordenadas opcionales: ambos valores deben estar presentes y dentro de Lima Norte.
ALTER TABLE public.incidents
  ADD COLUMN latitude numeric(9,6),
  ADD COLUMN longitude numeric(9,6),
  ADD CONSTRAINT incident_coordinates_pair CHECK ((latitude IS NULL) = (longitude IS NULL)),
  ADD CONSTRAINT incident_coordinates_lima CHECK (
    latitude IS NULL OR (latitude BETWEEN -12.15 AND -11.75 AND longitude BETWEEN -77.25 AND -76.85)
  );

-- El control de transición vive en la base: una petición REST directa no puede saltarlo.
CREATE OR REPLACE FUNCTION public.guard_incident() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    IF new.reporter_id IS DISTINCT FROM old.reporter_id
       OR new.district IS DISTINCT FROM old.district
       OR new.address IS DISTINCT FROM old.address
       OR new.description IS DISTINCT FROM old.description
       OR new.latitude IS DISTINCT FROM old.latitude
       OR new.longitude IS DISTINCT FROM old.longitude THEN
      RAISE EXCEPTION 'Solo se permiten cambios de estado y observación' USING ERRCODE = '42501';
    END IF;
    IF NOT public.is_municipal_for(old.district) THEN
      RAISE EXCEPTION 'Ámbito municipal requerido' USING ERRCODE = '42501';
    END IF;
    IF new.status IS DISTINCT FROM old.status AND NOT (
      (old.status = 'pendiente' AND new.status IN ('en_revision','en_atencion','rechazado')) OR
      (old.status = 'en_revision' AND new.status IN ('en_atencion','rechazado')) OR
      (old.status = 'en_atencion' AND new.status = 'resuelto')
    ) THEN
      RAISE EXCEPTION 'Transición de estado no permitida' USING ERRCODE = '23514';
    END IF;
  END IF;
  new.updated_at = now();
  RETURN new;
END $$;

-- Las notas internas nunca se guardan en incidents ni en su historial público.
CREATE TABLE public.incident_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL CHECK (char_length(trim(body)) BETWEEN 3 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX incident_internal_notes_incident_idx ON public.incident_internal_notes (incident_id, created_at DESC);
ALTER TABLE public.incident_internal_notes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.incident_internal_notes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.incident_internal_notes TO authenticated;
CREATE POLICY internal_notes_select ON public.incident_internal_notes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.incidents i WHERE i.id = incident_id AND public.is_municipal_for(i.district)));
CREATE POLICY internal_notes_insert ON public.incident_internal_notes FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.incidents i WHERE i.id = incident_id AND public.is_municipal_for(i.district)
  ));

-- Solo datos agregados de los cuatro distritos; los reportes individuales siguen bajo RLS.
CREATE TABLE public.district_metrics (
  district text PRIMARY KEY CHECK (district IN ('Los Olivos','Comas','San Martín de Porres','Independencia')),
  total integer NOT NULL DEFAULT 0,
  pendiente integer NOT NULL DEFAULT 0,
  en_revision integer NOT NULL DEFAULT 0,
  en_atencion integer NOT NULL DEFAULT 0,
  resuelto integer NOT NULL DEFAULT 0,
  rechazado integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.district_metrics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.district_metrics FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.district_metrics TO authenticated;
CREATE POLICY district_metrics_municipal_select ON public.district_metrics FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'municipal'));

CREATE SCHEMA IF NOT EXISTS private;
CREATE FUNCTION private.refresh_district_metrics() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = '' AS $$
DECLARE target_district text; districts_to_refresh text[];
BEGIN
  IF tg_op = 'DELETE' THEN districts_to_refresh = ARRAY[old.district];
  ELSIF tg_op = 'UPDATE' THEN districts_to_refresh = ARRAY[new.district, old.district];
  ELSE districts_to_refresh = ARRAY[new.district]; END IF;
  FOR target_district IN SELECT DISTINCT unnest(districts_to_refresh) LOOP
    INSERT INTO public.district_metrics(district,total,pendiente,en_revision,en_atencion,resuelto,rechazado,updated_at)
    SELECT target_district, count(*)::int,
      count(*) FILTER (WHERE status='pendiente')::int,
      count(*) FILTER (WHERE status='en_revision')::int,
      count(*) FILTER (WHERE status='en_atencion')::int,
      count(*) FILTER (WHERE status='resuelto')::int,
      count(*) FILTER (WHERE status='rechazado')::int, now()
    FROM public.incidents WHERE district=target_district
    ON CONFLICT (district) DO UPDATE SET total=excluded.total, pendiente=excluded.pendiente,
      en_revision=excluded.en_revision, en_atencion=excluded.en_atencion,
      resuelto=excluded.resuelto, rechazado=excluded.rechazado, updated_at=excluded.updated_at;
  END LOOP;
  RETURN coalesce(new,old);
END $$;
REVOKE ALL ON FUNCTION private.refresh_district_metrics() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER refresh_district_metrics AFTER INSERT OR UPDATE OF status,district OR DELETE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION private.refresh_district_metrics();

INSERT INTO public.district_metrics(district,total,pendiente,en_revision,en_atencion,resuelto,rechazado)
SELECT d.district, count(i.id)::int,
  count(i.id) FILTER (WHERE i.status='pendiente')::int,
  count(i.id) FILTER (WHERE i.status='en_revision')::int,
  count(i.id) FILTER (WHERE i.status='en_atencion')::int,
  count(i.id) FILTER (WHERE i.status='resuelto')::int,
  count(i.id) FILTER (WHERE i.status='rechazado')::int
FROM (VALUES ('Los Olivos'),('Comas'),('San Martín de Porres'),('Independencia')) AS d(district)
LEFT JOIN public.incidents i ON i.district=d.district GROUP BY d.district;
