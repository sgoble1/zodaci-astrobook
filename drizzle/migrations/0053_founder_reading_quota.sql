CREATE OR REPLACE FUNCTION public.claim_topic_reading_job(p_owner_id uuid, p_page_key text, p_regenerate boolean DEFAULT false)
 RETURNS TABLE(job_id uuid, job_status text, claimed boolean, quota_exceeded boolean)
 LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE j public.topic_reading_jobs%ROWTYPE; n integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_id::text,0));
  SELECT * INTO j FROM public.topic_reading_jobs WHERE owner_id=p_owner_id AND page_key=p_page_key FOR UPDATE;
  IF FOUND AND j.status='running' AND j.updated_at>now()-interval '8 minutes' THEN RETURN QUERY SELECT j.claim_token,j.status,false,false; RETURN; END IF;
  IF FOUND AND j.status='succeeded' AND NOT p_regenerate AND EXISTS(SELECT 1 FROM public.generated_pages WHERE owner_id=p_owner_id AND page_key=p_page_key AND status IN ('ready','preview')) THEN RETURN QUERY SELECT j.claim_token,j.status,false,false; RETURN; END IF;
  SELECT count(*) INTO n FROM public.ai_usage WHERE user_id=p_owner_id AND feature='topic-reading' AND created_at>=now()-interval '24 hours';
  IF n >= (CASE WHEN public.is_shared_space_user_id(p_owner_id) THEN 200 ELSE 50 END) THEN RETURN QUERY SELECT NULL::uuid,NULL::text,false,true; RETURN; END IF;
  INSERT INTO public.ai_usage(user_id,feature) VALUES(p_owner_id,'topic-reading');
  INSERT INTO public.topic_reading_jobs(owner_id,page_key,status,claim_token) VALUES(p_owner_id,p_page_key,'running',gen_random_uuid())
    ON CONFLICT(owner_id,page_key) DO UPDATE SET status='running',claim_token=gen_random_uuid(),updated_at=now() RETURNING * INTO j;
  RETURN QUERY SELECT j.claim_token,j.status,true,false;
END
$$;