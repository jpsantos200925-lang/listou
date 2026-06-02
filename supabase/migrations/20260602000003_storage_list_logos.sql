-- Cria bucket público para logos de listas
-- Cria bucket para logos (sem coluna public nesta versão do Supabase storage)
insert into storage.buckets (id, name)
values ('list-logos', 'list-logos')
on conflict (id) do nothing;

-- Qualquer autenticado pode fazer upload no próprio prefixo
create policy "Autenticado pode fazer upload de logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'list-logos');

-- Autenticado pode atualizar/deletar apenas seus próprios uploads
create policy "Autenticado pode atualizar seus logos"
  on storage.objects for update to authenticated
  using (bucket_id = 'list-logos' and owner = auth.uid());

create policy "Autenticado pode deletar seus logos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'list-logos' and owner = auth.uid());

-- Bucket público: qualquer um pode ler (necessário para exibir imagens)
create policy "Público pode ler logos"
  on storage.objects for select
  using (bucket_id = 'list-logos');
