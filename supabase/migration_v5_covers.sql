-- Incremental: portadas de texto + política de insert que faltaba en texts.
-- Correr en el SQL Editor del proyecto ya provisionado (init.sql ya corrió ahí antes).
-- Ya está incluido en init.sql para instalaciones nuevas desde cero.

alter table texts add column if not exists cover_url text;

create policy "Users can insert own texts" on texts for insert with check (auth.uid() = owner_id);

insert into storage.buckets (id, name, public) values ('text-covers', 'text-covers', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload text covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'text-covers');
create policy "Authenticated users can update text covers" on storage.objects
  for update to authenticated using (bucket_id = 'text-covers');
