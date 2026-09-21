create or replace function public.get_certificate_generation_candidates(
  p_now timestamptz default now(),
  p_limit integer default 50
)
returns table (registration_id uuid)
language sql
stable
set search_path = ''
as $$
  select registrations.id
  from public.registrations
  join public.webinars
    on webinars.id = registrations.webinar_id
  left join public.certificates
    on certificates.registration_id = registrations.id
  where registrations.status = 'lunas'
    and webinars.end_date <= p_now
    and (
      certificates.id is null
      or (certificates.email_sent_at is null and certificates.status = 'valid')
    )
  order by webinars.end_date, registrations.created_at
  limit least(greatest(p_limit, 1), 100);
$$;

comment on function public.get_certificate_generation_candidates(timestamptz, integer) is
  'Memilih pendaftaran lunas untuk webinar selesai yang belum memiliki sertifikat atau masih menunggu email.';

revoke all on function public.get_certificate_generation_candidates(timestamptz, integer)
  from public, anon, authenticated;
grant execute on function public.get_certificate_generation_candidates(timestamptz, integer)
  to service_role;
