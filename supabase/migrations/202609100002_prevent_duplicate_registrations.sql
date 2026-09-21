alter table public.registrations
  add constraint registrations_webinar_email_key unique (webinar_id, email);

comment on constraint registrations_webinar_email_key on public.registrations is
  'Mencegah satu alamat email mendaftar lebih dari sekali pada webinar yang sama.';
