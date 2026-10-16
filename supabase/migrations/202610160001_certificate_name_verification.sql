begin;

create or replace function public.platform_certificate_candidates(p_limit integer default 50)
returns table(registration_id text)
language sql stable security invoker set search_path = ''
as $$
  select r.id
  from public.platform_records r
  join public.platform_records e on e.collection = 'events' and e.data->>'slug' = r.data->>'eventSlug'
  where r.collection = 'registrations' and r.data->>'payment' = 'paid'
    and e.published and e.data->>'certificateEnabled' = 'true' and coalesce(e.data->>'certificateTemplate','') <> ''
    and (e.data->>'endAt')::timestamptz <= now()
    and r.data->'progress'->>'attendance' = 'true' and r.data->'progress'->>'feedback' = 'true'
    and (e.data->'preTest'->>'enabled' <> 'true' or r.data->'progress'->>'pre-test' = 'true')
    and (e.data->'postTest'->>'enabled' <> 'true' or r.data->'progress'->>'post-test' = 'true')
    and length(btrim(r.data->'certificateName'->>'name')) between 2 and 160
    and coalesce(r.data->'certificateName'->>'verifiedAt','') <> ''
    and (r.data->'certificate' is null or (
      r.data->'certificate'->>'status' = 'valid' and r.data->'certificate'->>'emailSentAt' is null
      and coalesce((r.data->'certificate'->>'emailClaimUntil')::timestamptz,'-infinity'::timestamptz) <= now()
    ))
  order by r.updated_at, r.id
  limit least(50, greatest(1,p_limit));
$$;
revoke all on function public.platform_certificate_candidates(integer) from public, anon, authenticated;
grant execute on function public.platform_certificate_candidates(integer) to service_role;

commit;
