CREATE OR REPLACE FUNCTION public.public_site_settings()
 RETURNS TABLE(key text, value jsonb)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT s.key, s.value FROM public.platform_settings s WHERE s.key IN ('site.general', 'site.maintenance', 'site.flags', 'shop.layout')
$$;