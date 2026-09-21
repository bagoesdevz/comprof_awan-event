create extension if not exists pgcrypto with schema extensions;

create table public.webinars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  category text not null,
  event_type text not null,
  topics jsonb not null default '[]'::jsonb,
  benefits jsonb not null default '[]'::jsonb,
  rundown jsonb not null default '[]'::jsonb,
  facilities jsonb not null default '[]'::jsonb,
  audience text not null default '',
  speakers jsonb not null default '[]'::jsonb,
  city text,
  venue text,
  venue_address text,
  price integer not null default 0,
  credits smallint not null default 0,
  registration_status text not null default 'COMING_SOON',
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint webinars_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint webinars_title_not_blank_check
    check (length(btrim(title)) > 0),
  constraint webinars_category_not_blank_check
    check (length(btrim(category)) > 0),
  constraint webinars_event_type_check
    check (event_type in ('ONLINE', 'ONSITE', 'HYBRID')),
  constraint webinars_registration_status_check
    check (registration_status in ('OPEN', 'COMING_SOON', 'SOLD_OUT', 'CLOSED')),
  constraint webinars_date_order_check
    check (end_date > start_date),
  constraint webinars_price_non_negative_check
    check (price >= 0),
  constraint webinars_credits_non_negative_check
    check (credits >= 0),
  constraint webinars_topics_array_check
    check (jsonb_typeof(topics) = 'array'),
  constraint webinars_benefits_array_check
    check (jsonb_typeof(benefits) = 'array'),
  constraint webinars_rundown_array_check
    check (jsonb_typeof(rundown) = 'array'),
  constraint webinars_facilities_array_check
    check (jsonb_typeof(facilities) = 'array'),
  constraint webinars_speakers_array_check
    check (jsonb_typeof(speakers) = 'array'),
  constraint webinars_published_at_check
    check (not is_published or published_at is not null)
);

comment on table public.webinars is
  'Informasi utama webinar yang ditampilkan pada landing page dan detail event.';
comment on column public.webinars.topics is
  'Array JSON berisi topik yang dibahas dalam webinar.';
comment on column public.webinars.benefits is
  'Array JSON berisi manfaat yang diperoleh peserta.';
comment on column public.webinars.rundown is
  'Array JSON berisi sesi acara, termasuk waktu, judul, dan catatan.';
comment on column public.webinars.facilities is
  'Array JSON berisi fasilitas yang termasuk dalam harga webinar.';
comment on column public.webinars.speakers is
  'Array JSON berisi profil pembicara yang tampil pada halaman detail.';

create index webinars_published_start_date_idx
  on public.webinars (start_date)
  where is_published = true;

create index webinars_registration_status_idx
  on public.webinars (registration_status);

create index webinars_category_idx
  on public.webinars (category);

create index webinars_topics_idx
  on public.webinars using gin (topics);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger webinars_set_updated_at
before update on public.webinars
for each row
execute function public.set_updated_at();

alter table public.webinars enable row level security;

revoke all on table public.webinars from anon, authenticated;
grant select on table public.webinars to anon, authenticated;
grant all on table public.webinars to service_role;

create policy "Published webinars are publicly readable"
on public.webinars
for select
to anon, authenticated
using (is_published = true);
