-- Jalankan di Supabase SQL Editor
create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Seed default vote price
insert into public.app_settings (key, value)
values ('vote_price', '10000')
on conflict (key) do nothing;

-- Optional trigger agar updated_at otomatis berubah saat update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- RLS policies (sesuaikan dengan role admin di project Anda)
alter table public.app_settings enable row level security;

-- Semua user bisa baca agar harga vote bisa ditampilkan di halaman publik
drop policy if exists "Public can read app settings" on public.app_settings;
create policy "Public can read app settings"
on public.app_settings
for select
using (true);

-- Hanya user login yang boleh ubah (silakan perketat sesuai kebutuhan)
drop policy if exists "Authenticated can upsert app settings" on public.app_settings;
create policy "Authenticated can upsert app settings"
on public.app_settings
for all
to authenticated
using (true)
with check (true);
