create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on update cascade on delete restrict,
  amount integer not null,
  payment_method text not null,
  status text not null default 'pending',
  transaction_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payments_registration_id_key unique (registration_id),
  constraint payments_transaction_id_key unique (transaction_id),
  constraint payments_amount_non_negative_check
    check (amount >= 0),
  constraint payments_payment_method_check
    check (payment_method in ('qris', 'virtual-account', 'card')),
  constraint payments_status_check
    check (status in ('pending', 'paid', 'failed')),
  constraint payments_paid_at_check
    check (
      (status = 'paid' and paid_at is not null)
      or (status <> 'paid' and paid_at is null)
    )
);

comment on table public.payments is
  'Transaksi pembayaran untuk satu pendaftaran webinar.';
comment on column public.payments.transaction_id is
  'Identitas transaksi unik yang diterbitkan payment gateway.';
comment on column public.payments.status is
  'Status transaksi: pending, paid, atau failed.';

create index payments_status_created_at_idx
  on public.payments (status, created_at desc);

create trigger payments_set_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

alter table public.payments enable row level security;

revoke all on table public.payments from anon, authenticated;
grant all on table public.payments to service_role;
