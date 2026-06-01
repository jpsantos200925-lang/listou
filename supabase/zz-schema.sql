-- Executado automaticamente na primeira inicialização do banco

\c postgres

-- Schema exigido pelo serviço Realtime antes de rodar suas próprias migrations
create schema if not exists _realtime;
grant all on schema _realtime to supabase_admin;

-- Tabela de listas personalizáveis
create table if not exists lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  slug text not null unique,
  primary_color text not null default '#22c55e',
  secondary_color text not null default '#16a34a',
  bg_color text not null default '#0f0f0f',
  font_color text not null default '#f0f0f0',
  title_color text not null default '#f5f5f5',
  label_color text not null default '#888888',
  item_bg_color text not null default '#1e1e1e',
  logo_url text,
  created_at timestamptz not null default now()
);

create index if not exists lists_user_id_idx on lists(user_id);
create index if not exists lists_slug_idx on lists(slug);

alter table lists enable row level security;

create policy "Usuário vê apenas suas listas"
  on lists for select to authenticated
  using (user_id = auth.uid());

create policy "Usuário cria suas listas"
  on lists for insert to authenticated
  with check (user_id = auth.uid());

create policy "Usuário edita suas listas"
  on lists for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Usuário deleta suas listas"
  on lists for delete to authenticated
  using (user_id = auth.uid());

-- Tabela de itens (com list_id)
create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references lists(id) on delete cascade,
  month text not null,
  name text not null,
  quantity text not null default '1',
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists items_month_idx on items(month);
create index if not exists items_list_id_idx on items(list_id);

alter table items enable row level security;

create policy "Usuários autenticados têm acesso total"
  on items for all
  to authenticated
  using (true)
  with check (true);

alter publication supabase_realtime add table items;
alter publication supabase_realtime add table lists;
