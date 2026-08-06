-- Migración v3 — correr en el SQL Editor, después de migration_v2.sql.
-- Crea automáticamente una fila en profiles cuando alguien se registra (auth.users),
-- para que Onboarding (US1.2) tenga dónde guardar native_language / learning_languages / active_lang.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
