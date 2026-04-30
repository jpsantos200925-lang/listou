-- Executado automaticamente na primeira inicialização do banco
-- O conteúdo é o mesmo do schema.sql, adaptado para o entrypoint do Postgres

\c postgres

-- Schema exigido pelo serviço Realtime antes de rodar suas próprias migrations
create schema if not exists _realtime;
grant all on schema _realtime to supabase_admin;

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  name text not null,
  quantity text not null default '1',
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists items_month_idx on items(month);

alter table items enable row level security;

create policy "Usuários autenticados têm acesso total"
  on items for all
  to authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table items;
