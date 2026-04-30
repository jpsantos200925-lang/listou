-- Tabela principal de itens da lista
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  month text not null,          -- formato: "2026-04"
  name text not null,
  quantity text not null default '1',
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

-- Índice para buscar itens por mês rapidamente
create index if not exists items_month_idx on items(month);

-- Habilitar Row Level Security
alter table items enable row level security;

-- Política: qualquer usuário autenticado pode ler e escrever
-- (ajustar se quiser separar por usuário no futuro)
create policy "Usuários autenticados têm acesso total"
  on items for all
  to authenticated
  using (true)
  with check (true);

-- Habilitar real-time para a tabela items
alter publication supabase_realtime add table items;
