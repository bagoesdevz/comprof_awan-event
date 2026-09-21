alter table public.certificates
  add column email_message_id text,
  add constraint certificates_email_delivery_check
    check (
      (email_sent_at is null and email_message_id is null)
      or (email_sent_at is not null and email_message_id is not null)
    );

comment on column public.certificates.email_message_id is
  'Identitas email sertifikat dari penyedia email transaksional.';
