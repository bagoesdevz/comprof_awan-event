create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  webinar_id uuid not null references public.webinars (id) on update cascade on delete restrict,
  registration_reference text not null default (
    'AWN-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  ticket_id text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint registrations_reference_key unique (registration_reference),
  constraint registrations_reference_format_check
    check (registration_reference ~ '^AWN-[A-Z0-9]{10}$'),
  constraint registrations_ticket_id_not_blank_check
    check (length(btrim(ticket_id)) > 0),
  constraint registrations_full_name_not_blank_check
    check (length(btrim(full_name)) >= 3),
  constraint registrations_email_format_check
    check (
      email = lower(btrim(email))
      and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  constraint registrations_phone_format_check
    check (phone ~ '^(\+62|62|0)8[1-9][0-9]{6,11}$'),
  constraint registrations_status_check
    check (status in ('pending', 'lunas', 'batal'))
);

comment on table public.registrations is
  'Data peserta yang mendaftar ke webinar sebelum melanjutkan ke pembayaran.';
comment on column public.registrations.registration_reference is
  'Referensi publik pendaftaran yang aman dibagikan pada alur pembayaran.';
comment on column public.registrations.ticket_id is
  'Identitas pilihan tiket dari halaman detail webinar.';
comment on column public.registrations.status is
  'Status peserta: pending, lunas, atau batal.';

create index registrations_webinar_id_idx
  on public.registrations (webinar_id);

create index registrations_webinar_status_idx
  on public.registrations (webinar_id, status);

create index registrations_email_idx
  on public.registrations (email);

create trigger registrations_set_updated_at
before update on public.registrations
for each row
execute function public.set_updated_at();

alter table public.registrations enable row level security;

revoke all on table public.registrations from anon, authenticated;
grant all on table public.registrations to service_role;
