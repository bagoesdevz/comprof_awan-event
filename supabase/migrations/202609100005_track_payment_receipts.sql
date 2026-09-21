alter table public.payments
  add column receipt_sent_at timestamptz,
  add column receipt_message_id text,
  add constraint payments_receipt_delivery_check
    check (
      (receipt_sent_at is null and receipt_message_id is null)
      or (receipt_sent_at is not null and receipt_message_id is not null)
    );

comment on column public.payments.receipt_sent_at is
  'Waktu tanda terima pembayaran berhasil dikirim ke email peserta.';
comment on column public.payments.receipt_message_id is
  'Identitas email tanda terima dari penyedia email transaksional.';
