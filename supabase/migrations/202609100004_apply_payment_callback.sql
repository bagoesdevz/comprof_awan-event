create or replace function public.apply_payment_callback(
  p_transaction_id text,
  p_status text,
  p_paid_at timestamptz default null
)
returns table (
  payment_id uuid,
  registration_id uuid,
  payment_status text,
  registration_status text
)
language plpgsql
set search_path = ''
as $$
declare
  payment_record public.payments%rowtype;
  current_registration_status text;
begin
  if p_status not in ('pending', 'paid', 'failed') then
    raise exception 'Status pembayaran tidak valid' using errcode = '22023';
  end if;

  select payments.*
  into payment_record
  from public.payments
  where payments.transaction_id = p_transaction_id
  for update;

  if not found then
    return;
  end if;

  -- Konfirmasi lunas bersifat final agar callback terlambat tidak menurunkan status.
  if payment_record.status <> 'paid' then
    update public.payments
    set
      status = p_status,
      paid_at = case
        when p_status = 'paid' then coalesce(p_paid_at, now())
        else null
      end
    where id = payment_record.id
    returning * into payment_record;
  end if;

  if payment_record.status = 'paid' then
    update public.registrations
    set status = 'lunas'
    where id = payment_record.registration_id
      and status <> 'lunas';
  end if;

  select registrations.status
  into current_registration_status
  from public.registrations
  where registrations.id = payment_record.registration_id;

  return query
  select
    payment_record.id,
    payment_record.registration_id,
    payment_record.status,
    current_registration_status;
end;
$$;

comment on function public.apply_payment_callback(text, text, timestamptz) is
  'Menerapkan callback payment gateway secara atomik dan menjaga status paid tetap final.';

revoke all on function public.apply_payment_callback(text, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.apply_payment_callback(text, text, timestamptz)
  to service_role;
