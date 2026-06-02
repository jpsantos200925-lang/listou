-- Adiciona default auth.uid() em lists.user_id
-- Remove a necessidade de buscar o usuário manualmente no cliente antes de inserir

alter table lists
  alter column user_id set default auth.uid();
