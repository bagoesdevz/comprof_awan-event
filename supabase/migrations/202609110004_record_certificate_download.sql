create or replace function public.record_certificate_download(
  p_verification_token uuid,
  p_downloaded_at timestamptz default now()
)
returns table (
  certificate_id uuid,
  file_url text,
  download_count integer,
  last_download_at timestamptz
)
language sql
volatile
set search_path = ''
as $$
  update public.certificates
  set
    download_count = certificates.download_count + 1,
    last_download_at = p_downloaded_at
  where certificates.verification_token = p_verification_token
    and certificates.status = 'valid'
    and certificates.file_url is not null
  returning
    certificates.id,
    certificates.file_url,
    certificates.download_count,
    certificates.last_download_at;
$$;

comment on function public.record_certificate_download(uuid, timestamptz) is
  'Mencatat satu unduhan sertifikat valid secara atomik dan mengembalikan lokasi filenya.';

revoke all on function public.record_certificate_download(uuid, timestamptz)
  from public, anon, authenticated;
grant execute on function public.record_certificate_download(uuid, timestamptz)
  to service_role;
