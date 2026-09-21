-- Application data is accessible only through authenticated Next.js handlers.
-- Existing webinar/payment/certificate tables are preserved for migration review.
create table if not exists public.platform_records (
 collection text not null check (collection in ('events','profiles','registrations','notices','leads','waitlist','templates','campaigns','cms','articles','payment_sessions')),
 id text not null check (length(id) between 1 and 254),
 data jsonb not null check (jsonb_typeof(data)='object'),
 owner_email text,
 published boolean not null default false,
 revision bigint not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (collection,id)
);
create index if not exists platform_records_owner_idx on public.platform_records(collection,owner_email);
create index if not exists platform_records_public_idx on public.platform_records(collection,published);
create unique index if not exists platform_events_slug_key on public.platform_records((data->>'slug')) where collection='events';
create unique index if not exists platform_registration_event_owner_key on public.platform_records((data->>'eventSlug'),owner_email) where collection='registrations' and (data->>'payment') not in ('cancelled','expired','refunded');
create unique index if not exists platform_certificate_token_key on public.platform_records((data->'certificate'->>'token')) where collection='registrations' and data->'certificate' is not null;
alter table public.platform_records enable row level security;
revoke all on public.platform_records from public,anon,authenticated;
grant all on public.platform_records to service_role;

-- One transaction for an order and its reserved inventory. Revision checks reject
-- lost updates; advisory locks also cover new records that cannot yet be row-locked.
create or replace function public.commit_platform_changes(p_changes jsonb)
returns void language plpgsql security invoker set search_path='' as $$
declare item jsonb; current_revision bigint;
begin
 if jsonb_typeof(p_changes)<>'array' or jsonb_array_length(p_changes)>200 then raise exception 'INVALID_CHANGES'; end if;
 for item in select value from jsonb_array_elements(p_changes) order by value->>'collection',value->>'id' loop
  perform pg_advisory_xact_lock(hashtextextended((item->>'collection')||':'||(item->>'id'),0));
  select revision into current_revision from public.platform_records where collection=item->>'collection' and id=item->>'id' for update;
  if coalesce(current_revision,0)<>(item->>'revision')::bigint then raise exception 'REVISION_CONFLICT' using errcode='40001'; end if;
  insert into public.platform_records(collection,id,data,owner_email,published)
  values(item->>'collection',item->>'id',item->'data',item->>'owner_email',coalesce((item->>'published')::boolean,false))
  on conflict(collection,id) do update set data=excluded.data,owner_email=excluded.owner_email,published=excluded.published,revision=public.platform_records.revision+1,updated_at=now();
 end loop;
end; $$;
revoke all on function public.commit_platform_changes(jsonb) from public,anon,authenticated;
grant execute on function public.commit_platform_changes(jsonb) to service_role;

create table if not exists public.api_rate_limits (
 key text primary key, window_start timestamptz not null, attempts integer not null default 1
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public,anon,authenticated;
grant all on public.api_rate_limits to service_role;
create or replace function public.consume_api_limit(p_key text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security invoker set search_path='' as $$
declare n integer;
begin
 insert into public.api_rate_limits(key,window_start,attempts) values(p_key,now(),1)
 on conflict(key) do update set
 attempts=case when public.api_rate_limits.window_start<now()-make_interval(secs=>p_seconds) then 1 else public.api_rate_limits.attempts+1 end,
 window_start=case when public.api_rate_limits.window_start<now()-make_interval(secs=>p_seconds) then now() else public.api_rate_limits.window_start end
 returning attempts into n;
 delete from public.api_rate_limits where window_start<now()-interval '2 days';
 return n<=p_limit;
end; $$;
revoke all on function public.consume_api_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_api_limit(text,integer,integer) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('event-assets','event-assets',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
-- No browser write policy: admin upload route verifies identity and validates bytes.
