alter table public.mail_logs
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mail_logs_set_updated_at on public.mail_logs;
create trigger mail_logs_set_updated_at
before update on public.mail_logs
for each row
execute function public.set_updated_at();
