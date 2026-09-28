-- Pegá este script en Supabase → SQL Editor → Run.
-- Crea la tabla de mensajes del formulario. El sitio solo puede INSERTAR;
-- nadie desde afuera puede leer, editar ni borrar. Vos leés desde el panel de Supabase.

create table if not exists public.contact_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) between 5 and 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  company     text check (company is null or char_length(company) <= 160),
  message     text not null check (char_length(message) between 10 and 2000),
  source      text check (source is null or char_length(source) <= 80)
);

alter table public.contact_requests enable row level security;

drop policy if exists "public can insert contact requests" on public.contact_requests;
create policy "public can insert contact requests"
  on public.contact_requests
  for insert
  to anon
  with check (true);

-- Solo permiso de insertar para el rol público. Sin select/update/delete.
revoke all on public.contact_requests from anon, authenticated;
grant insert on public.contact_requests to anon;
