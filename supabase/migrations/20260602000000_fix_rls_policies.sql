-- Corrige RLS em items, expenses e price_results
-- Antes: using (true) — qualquer autenticado via todos os dados
-- Depois: acesso restrito ao dono da lista

-- ============================================================
-- items
-- ============================================================
drop policy if exists "Usuários autenticados têm acesso total" on items;

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

-- ============================================================
-- expenses
-- ============================================================
drop policy if exists "Autenticado tem acesso total a expenses" on expenses;

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

-- ============================================================
-- price_results
-- ============================================================
drop policy if exists "Autenticado tem acesso total a price_results" on price_results;

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
