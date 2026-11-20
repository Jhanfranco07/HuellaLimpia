-- Fotografías privadas de incidencias. El nombre del objeto es
-- <usuario>/<incidencia>/<identificador>.<extensión>.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('incident-photos', 'incident-photos', false, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'incident-photos' AND public = false
      AND file_size_limit = 5242880
      AND allowed_mime_types @> ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
  ) THEN
    RAISE EXCEPTION 'El bucket incident-photos existente no cumple la configuración privada requerida';
  END IF;
END $$;

CREATE TABLE public.incident_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT incident_photo_path CHECK (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
  )
);
CREATE INDEX incident_photos_incident_idx ON public.incident_photos (incident_id, created_at);
ALTER TABLE public.incident_photos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.incident_photos FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.incident_photos TO authenticated;

CREATE POLICY incident_photos_select ON public.incident_photos
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.incidents i WHERE i.id = incident_id)
);
CREATE POLICY incident_photos_insert ON public.incident_photos
FOR INSERT TO authenticated WITH CHECK (
  uploader_id = auth.uid()
  AND split_part(storage_path, '/', 1) = auth.uid()::text
  AND split_part(storage_path, '/', 2) = incident_id::text
  AND EXISTS (SELECT 1 FROM public.incidents i
              WHERE i.id = incident_id AND i.reporter_id = auth.uid())
  AND EXISTS (SELECT 1 FROM storage.objects o
              WHERE o.bucket_id = 'incident-photos' AND o.name = storage_path)
);

CREATE POLICY incident_photo_objects_insert ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'incident-photos'
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (SELECT 1 FROM public.incidents i
    WHERE i.id::text = split_part(name, '/', 2)
      AND i.reporter_id = auth.uid())
);
CREATE POLICY incident_photo_objects_select ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'incident-photos'
  AND EXISTS (SELECT 1 FROM public.incidents i
    WHERE i.id::text = split_part(name, '/', 2))
);
CREATE POLICY incident_photo_objects_delete ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'incident-photos'
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (SELECT 1 FROM public.incidents i
    WHERE i.id::text = split_part(name, '/', 2)
      AND i.reporter_id = auth.uid())
);
