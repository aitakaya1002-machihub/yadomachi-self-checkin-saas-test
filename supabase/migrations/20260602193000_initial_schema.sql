create extension if not exists "pgcrypto";

do $$
begin
  create type public.reservation_status as enum (
    'registered',
    'pin_set',
    'mail_sent',
    'ready_for_checkin',
    'checked_in',
    'checked_out'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.mail_send_status as enum (
    'pending',
    'sent',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  checkin_date date not null,
  checkout_date date not null,
  guest_count integer not null default 1,
  property_name text not null,
  reservation_code text not null,
  pin_code text,
  checkin_time_note text,
  emergency_contact text,
  notes text,
  status public.reservation_status not null default 'registered',
  guest_access_token text not null default encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservations_guest_email_format_chk
    check (guest_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint reservations_guest_count_chk
    check (guest_count > 0),
  constraint reservations_date_order_chk
    check (checkout_date > checkin_date),
  constraint reservations_reservation_code_key
    unique (reservation_code),
  constraint reservations_guest_access_token_key
    unique (guest_access_token)
);

create table if not exists public.mail_logs (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  subject text not null,
  body text not null,
  sent_at timestamptz,
  send_status public.mail_send_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mail_logs_sent_at_required_chk
    check (send_status <> 'sent' or sent_at is not null)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  property_name text not null,
  address text not null,
  emergency_contact text not null,
  sender_name text not null,
  email_subject_template text not null default '【{{property_name}}】チェックインのご案内',
  email_body_template text not null default '{{guest_name}} 様\n\nこの度は {{property_name}} をご予約いただきありがとうございます。\n\nチェックイン日: {{checkin_date}}\nチェックアウト日: {{checkout_date}}\n入室用暗証番号: {{pin_code}}\n緊急連絡先: {{emergency_contact}}\n\n以下のURLから入室情報をご確認ください。\n{{guest_page_url}}',
  checkin_guide_text text not null default '',
  caution_text text not null default '',
  checkout_guide_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reservations_checkin_date_idx
  on public.reservations (checkin_date);

create index if not exists reservations_checkout_date_idx
  on public.reservations (checkout_date);

create index if not exists reservations_status_idx
  on public.reservations (status);

create index if not exists reservations_guest_email_idx
  on public.reservations (guest_email);

create index if not exists reservations_property_name_idx
  on public.reservations (property_name);

create index if not exists mail_logs_reservation_id_idx
  on public.mail_logs (reservation_id);

create index if not exists mail_logs_send_status_idx
  on public.mail_logs (send_status);

create index if not exists mail_logs_sent_at_idx
  on public.mail_logs (sent_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservations_set_updated_at on public.reservations;
create trigger reservations_set_updated_at
before update on public.reservations
for each row
execute function public.set_updated_at();

drop trigger if exists mail_logs_set_updated_at on public.mail_logs;
create trigger mail_logs_set_updated_at
before update on public.mail_logs
for each row
execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();
