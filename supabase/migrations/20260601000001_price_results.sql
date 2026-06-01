alter table items
  add column if not exists is_online_purchase boolean not null default false;

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

create policy "Autenticado tem acesso total a price_results"
  on price_results for all to authenticated
  using (true) with check (true);
