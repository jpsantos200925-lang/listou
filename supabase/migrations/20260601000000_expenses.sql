create table if not exists expenses (
  id          uuid          primary key default gen_random_uuid(),
  list_id     uuid          not null references lists(id) on delete cascade,
  month       text          not null,
  description text,
  amount      numeric(12,2) not null check (amount > 0),
  created_at  timestamptz   not null default now()
);

create index if not exists expenses_list_month_idx on expenses(list_id, month);

alter table expenses enable row level security;

create policy "Autenticado tem acesso total a expenses"
  on expenses for all to authenticated
  using (true) with check (true);

alter publication supabase_realtime add table expenses;
