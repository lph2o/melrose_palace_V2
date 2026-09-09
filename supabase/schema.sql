-- =====================================================================
-- Sénégal Immobilier Consulting — Schéma Supabase
-- À exécuter UNE FOIS dans le Dashboard Supabase → SQL Editor.
--
-- Après exécution, créez le compte administrateur :
--   Dashboard → Authentication → Users → "Add user" →
--   email : thiamabda@gmail.com  +  mot de passe de votre choix
--   (seul ce compte a accès à l'Espace Gérant, page /admin du site)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- Paramètres du site (une seule ligne, id = 1)
create table if not exists public.site_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- Parcelles (une ligne par parcelle, id = numéro de la parcelle)
create table if not exists public.parcels (
  id         int primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Demandes de contact (formulaire du site → Espace Gérant)
-- ---------------------------------------------------------------------
create table if not exists public.leads (
  id         bigint generated always as identity primary key,
  name       text not null,
  phone      text,
  email      text,
  interest   text,
  message    text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Insertion publique : le formulaire de contact des visiteurs crée une demande
-- Lecture / modification / suppression : réservées à l'administrateur connecté
alter table public.leads enable row level security;

drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert"
  on public.leads for insert
  to anon, authenticated
  with check (true);

drop policy if exists "leads admin read" on public.leads;
create policy "leads admin read"
  on public.leads for select
  to authenticated
  using (true);

drop policy if exists "leads admin update" on public.leads;
create policy "leads admin update"
  on public.leads for update
  to authenticated
  using (true) with check (true);

drop policy if exists "leads admin delete" on public.leads;
create policy "leads admin delete"
  on public.leads for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3. Temps réel : les changements de l'Espace Gérant apparaissent
--    instantanément sur le site public, sans rechargement.
--    (PostgreSQL ne supporte pas IF NOT EXISTS sur ALTER PUBLICATION :
--    on ignore l'erreur "déjà membre" via un bloc DO.)
-- ---------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.site_settings;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.parcels;
exception when duplicate_object then null;
end
$$;

do $$
begin
  alter publication supabase_realtime add table public.leads;
exception when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security (site_settings & parcels)
--    - Lecture : publique (tout visiteur voit les données à jour)
--    - Écriture : réservée aux utilisateurs connectés (Espace Gérant)
-- ---------------------------------------------------------------------

alter table public.site_settings enable row level security;
alter table public.parcels enable row level security;

drop policy if exists "site_settings public read" on public.site_settings;
create policy "site_settings public read"
  on public.site_settings for select
  using (true);

drop policy if exists "parcels public read" on public.parcels;
create policy "parcels public read"
  on public.parcels for select
  using (true);

drop policy if exists "site_settings authenticated write" on public.site_settings;
create policy "site_settings authenticated write"
  on public.site_settings for all
  to authenticated
  using (true) with check (true);

drop policy if exists "parcels authenticated write" on public.parcels;
create policy "parcels authenticated write"
  on public.parcels for all
  to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------
-- 5. Supabase Storage — bucket public "site-media"
--    Héberge les images, vidéos et PDF téléversés depuis l'Espace Gérant.
--    - Lecture publique : les visiteurs voient les médias (URLs publiques)
--    - Écriture : réservée à l'administrateur connecté (Espace Gérant)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

drop policy if exists "site-media public read" on storage.objects;
create policy "site-media public read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-media');

drop policy if exists "site-media authenticated insert" on storage.objects;
create policy "site-media authenticated insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media');

drop policy if exists "site-media authenticated update" on storage.objects;
create policy "site-media authenticated update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media');

drop policy if exists "site-media authenticated delete" on storage.objects;
create policy "site-media authenticated delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media');