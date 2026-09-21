create sequence public.certificate_number_seq;

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on update cascade on delete restrict,
  certificate_number text not null default (
    'CERT-AWN-'
    || to_char(now(), 'YYYY')
    || '-'
    || lpad(nextval('public.certificate_number_seq')::text, 5, '0')
  ),
  verification_token uuid not null default gen_random_uuid(),
  file_url text,
  status text not null default 'valid',
  email_sent_at timestamptz,
  download_count integer not null default 0,
  last_download_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint certificates_registration_id_key unique (registration_id),
  constraint certificates_certificate_number_key unique (certificate_number),
  constraint certificates_verification_token_key unique (verification_token),
  constraint certificates_certificate_number_format_check
    check (certificate_number ~ '^CERT-AWN-[0-9]{4}-[0-9]{5,}$'),
  constraint certificates_file_url_not_blank_check
    check (length(btrim(file_url)) > 0),
  constraint certificates_status_check
    check (status in ('valid', 'revoked')),
  constraint certificates_download_count_non_negative_check
    check (download_count >= 0),
  constraint certificates_download_tracking_check
    check (
      (download_count = 0 and last_download_at is null)
      or (download_count > 0 and last_download_at is not null)
    )
);

comment on table public.certificates is
  'Sertifikat digital yang diterbitkan satu kali untuk setiap pendaftaran webinar.';
comment on column public.certificates.certificate_number is
  'Nomor sertifikat publik yang dibuat otomatis dan dapat digunakan untuk verifikasi.';
comment on column public.certificates.verification_token is
  'Token acak untuk membuka halaman verifikasi sertifikat tanpa mengekspos identitas pendaftaran.';
comment on column public.certificates.file_url is
  'Lokasi file sertifikat di Supabase Storage; diisi setelah berkas berhasil dibuat.';
comment on column public.certificates.status is
  'Status validitas sertifikat: valid atau revoked.';
comment on column public.certificates.email_sent_at is
  'Waktu email berisi tautan sertifikat berhasil dikirim kepada peserta.';

create index certificates_status_created_at_idx
  on public.certificates (status, created_at desc);

create index certificates_pending_email_idx
  on public.certificates (created_at)
  where email_sent_at is null and status = 'valid';

create trigger certificates_set_updated_at
before update on public.certificates
for each row
execute function public.set_updated_at();

alter table public.certificates enable row level security;

revoke all on table public.certificates from anon, authenticated;
revoke all on sequence public.certificate_number_seq from anon, authenticated;
grant all on table public.certificates to service_role;
grant usage, select on sequence public.certificate_number_seq to service_role;
