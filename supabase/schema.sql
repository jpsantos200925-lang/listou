-- ============================================================
-- Schema atual — gerado a partir das migrations em ordem
-- Última atualização: 2026-06-02
-- Fonte de verdade: supabase/migrations/
-- ============================================================

-- ============================================================
-- lists
-- ============================================================
create table if not exists lists (
  id              uuid          primary key default gen_random_uuid(),
  user_id         uuid          not null default auth.uid() references auth.users(id) on delete cascade,
  name            text          not null,
  slug            text          not null unique,
  primary_color   text          not null default '#22c55e',
  secondary_color text          not null default '#16a34a',
  bg_color        text          not null default '#0f0f0f',
  font_color      text          not null default '#f0f0f0',
  title_color     text          not null default '#f5f5f5',
  label_color     text          not null default '#888888',
  item_bg_color   text          not null default '#1e1e1e',
  logo_url        text,
  created_at      timestamptz   not null default now()
);

create index if not exists lists_user_id_idx on lists(user_id);
create index if not exists lists_slug_idx    on lists(slug);

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

-- ============================================================
-- items
-- ============================================================
create table if not exists items (
  id                  uuid        primary key default gen_random_uuid(),
  list_id             uuid        not null references lists(id) on delete cascade,
  month               text        not null check (month ~ '^\d{4}-\d{2}$'),
  name                text        not null,
  quantity            text        not null default '1',
  checked             boolean     not null default false,
  is_online_purchase  boolean     not null default false,
  created_at          timestamptz not null default now()
);

create index if not exists items_list_id_idx  on items(list_id);
create index if not exists items_month_idx    on items(month);

alter table items enable row level security;
alter table items replica identity full;

create policy "Usuário acessa apenas itens das suas listas"
  on items for all to authenticated
  using (
    exists (
      select 1 from lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from lists
      where lists.id = items.list_id
        and lists.user_id = auth.uid()
    )
  );

alter publication supabase_realtime add table items;

-- ============================================================
-- expenses
-- ============================================================
create table if not exists expenses (
  id          uuid          primary key default gen_random_uuid(),
  list_id     uuid          not null references lists(id) on delete cascade,
  month       text          not null check (month ~ '^\d{4}-\d{2}$'),
  description text,
  amount      numeric(12,2) not null check (amount > 0),
  created_at  timestamptz   not null default now()
);

create index if not exists expenses_list_month_idx on expenses(list_id, month);

alter table expenses enable row level security;

create policy "Usuário acessa apenas gastos das suas listas"
  on expenses for all to authenticated
  using (
    exists (
      select 1 from lists
      where lists.id = expenses.list_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from lists
      where lists.id = expenses.list_id
        and lists.user_id = auth.uid()
    )
  );

alter publication supabase_realtime add table expenses;

-- ============================================================
-- price_results
-- ============================================================
create table if not exists price_results (
  id           uuid          primary key default gen_random_uuid(),
  item_id      uuid          not null references items(id) on delete cascade,
  product_name text          not null,
  price        numeric(12,2) not null,
  image_url    text,
  product_url  text,
  found_at     timestamptz   not null default now()
);

create index if not exists price_results_item_id_idx on price_results(item_id);

alter table price_results enable row level security;

create policy "Usuário acessa apenas preços dos seus itens"
  on price_results for all to authenticated
  using (
    exists (
      select 1 from items
      join lists on lists.id = items.list_id
      where items.id = price_results.item_id
        and lists.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from items
      join lists on lists.id = items.list_id
      where items.id = price_results.item_id
        and lists.user_id = auth.uid()
    )
  );

-- ============================================================
-- Storage: bucket para logos de listas
-- ============================================================
-- Bucket criado via migration 20260602000003_storage_list_logos.sql
-- Bucket: list-logos (público)
