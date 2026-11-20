ALTER FUNCTION public.guard_profile() SET search_path = '';
ALTER FUNCTION public.guard_incident() SET search_path = '';
REVOKE EXECUTE ON FUNCTION public.guard_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.guard_incident() FROM PUBLIC, anon, authenticated;
