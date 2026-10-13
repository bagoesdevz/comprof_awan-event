begin;

drop index if exists public.platform_registration_event_owner_key;
create unique index platform_registration_event_owner_key
on public.platform_records ((data->>'eventSlug'), owner_email)
where collection = 'registrations'
and (data->>'payment') not in ('cancelled', 'expired', 'refunded');

create unique index if not exists platform_waitlist_event_owner_key
on public.platform_records ((data->>'eventSlug'), owner_email)
where collection = 'waitlist' and data->>'status' in ('waiting', 'notified');

create or replace function public.platform_participant_counts()
returns table(event_slug text, participants bigint)
language sql stable security invoker set search_path = ''
as $$
  select data->>'eventSlug', sum(greatest(1, coalesce((data->>'quantity')::integer, 1)))
  from public.platform_records
  where collection = 'registrations' and data->>'payment' = 'paid' and data->>'orderId' is null
  group by data->>'eventSlug';
$$;
revoke all on function public.platform_participant_counts() from public, anon, authenticated;
grant execute on function public.platform_participant_counts() to service_role;

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
    and (r.data->'certificate' is null or (
      r.data->'certificate'->>'status' = 'valid' and r.data->'certificate'->>'emailSentAt' is null
      and coalesce((r.data->'certificate'->>'emailClaimUntil')::timestamptz,'-infinity'::timestamptz) <= now()
    ))
  order by r.updated_at, r.id
  limit least(50, greatest(1,p_limit));
$$;
revoke all on function public.platform_certificate_candidates(integer) from public, anon, authenticated;
grant execute on function public.platform_certificate_candidates(integer) to service_role;

create index if not exists platform_registration_order_idx
on public.platform_records ((data->>'orderId')) where collection = 'registrations';

alter table public.platform_records add column if not exists payment_checked_at timestamptz;

create or replace function public.platform_mark_payment_checked(p_id text)
returns void language sql security invoker set search_path = ''
as $$
 update public.platform_records set payment_checked_at=now()
 where collection='registrations' and id=p_id;
$$;
revoke all on function public.platform_mark_payment_checked(text) from public,anon,authenticated;
grant execute on function public.platform_mark_payment_checked(text) to service_role;

create or replace function public.platform_pending_payments(p_limit integer default 25)
returns table(registration_id text)
language sql stable security invoker set search_path = ''
as $$
 select r.id from public.platform_records r
 where r.collection='registrations' and r.data->>'payment' in ('pending','failed')
 and r.data->>'orderId' is null
 and (r.data->>'createdAt')::timestamptz < now()-interval '24 hours'
 order by r.payment_checked_at nulls first,r.updated_at,r.id limit least(25,greatest(1,p_limit));
$$;
revoke all on function public.platform_pending_payments(integer) from public,anon,authenticated;
grant execute on function public.platform_pending_payments(integer) to service_role;

commit;
