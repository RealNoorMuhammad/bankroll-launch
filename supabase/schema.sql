-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

create table if not exists public.phone_stats (
  id int primary key default 1 check (id = 1),
  ring_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.phone_stats (id, ring_count)
values (1, 0)
on conflict (id) do nothing;

alter table public.phone_stats enable row level security;

drop policy if exists "Anyone can read phone stats" on public.phone_stats;
create policy "Anyone can read phone stats"
  on public.phone_stats
  for select
  to anon, authenticated
  using (true);

create or replace function public.increment_phone_rings()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update public.phone_stats
  set ring_count = ring_count + 1,
      updated_at = now()
  where id = 1
  returning ring_count into new_count;

  return coalesce(new_count, 0);
end;
$$;

revoke all on function public.increment_phone_rings() from public;
grant execute on function public.increment_phone_rings() to anon, authenticated;

-- Enable realtime so every client sees live ring totals
do $$
begin
  alter publication supabase_realtime add table public.phone_stats;
exception
  when duplicate_object then null;
end $$;
