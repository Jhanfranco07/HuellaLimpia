REVOKE ALL PRIVILEGES ON TABLE public.profiles, public.pets, public.incidents, public.incident_status_history FROM PUBLIC, anon, authenticated;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pets TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.incidents TO authenticated;
GRANT SELECT ON TABLE public.incident_status_history TO authenticated;
GRANT USAGE ON TYPE public.app_role, public.incident_status TO authenticated;
REVOKE ALL ON FUNCTION public.new_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.record_incident_status() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_municipal_for(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_municipal_for(text) TO authenticated;

-- Algunas instalaciones no incluyen esta función auxiliar.
DO $$ BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
