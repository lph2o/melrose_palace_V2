-- =====================================================================
-- Senegal Investment Consulting — Schéma Supabase
-- À exécuter UNE FOIS dans le Dashboard Supabase → SQL Editor.
--
-- Après exécution, créez les comptes administrateurs :
--   Dashboard → Authentication → Users → "Add user" →
--   email : thiamabda@gmail.com  +  mot de passe de votre choix
--   email : boukarykonte81@gmail.com  +  mot de passe de votre choix
--   (seuls ces comptes ont accès à l'Espace Gérant, page /admin du site)
--
-- Toute modification de `ADMIN_EMAILS` (src/lib/adminAuth.ts) doit être
-- répercutée dans `public.is_admin()` ci-dessous, et inversement.
--
-- À faire aussi dans le Dashboard : Authentication → Sign In / Providers →
-- décocher « Allow new users to sign up ». Sans cela, n'importe qui peut créer
-- un compte, donc devenir « authenticated » (voir la note de la section 4).
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
-- 1bis. Pages de l'éditeur visuel Puck (une ligne par page et par langue)
--   id  : « home-fr » ou « home-en »
--   data: la composition Puck complète ({ root, content, zones })
--   AUCUNE ligne n'est nécessaire au premier déploiement : le site retombe
--   sur son contenu par défaut tant que l'admin n'a rien publié.
-- ---------------------------------------------------------------------
create table if not exists public.puck_pages (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 1ter. Administrateurs de l'Espace Gérant
--    `public.is_admin()` = l'email du jeton correspond à un compte listé.
--    Même liste que ADMIN_EMAILS dans `src/lib/adminAuth.ts` : les deux
--    doivent rester alignées (ajouter un admin = les deux endroits).
--
--    POURQUOI PAS « to authenticated using (true) » : l'inscription e-mail
--    étant ouverte par défaut côté Supabase, n'importe qui pouvait créer un
--    compte, obtenir un jeton « authenticated », puis lire les demandes de
--    contact (nom, téléphone, email) et réécrire les données du site. Les
--    politiques ci-dessous nomment donc les administrateurs.
--
--    Déclarée AVANT les politiques qui l'appellent : PostgreSQL exige que la
--    fonction existe au moment du `create policy`.
--
--    Les appels ne sont pas enveloppés dans un `(select …)`, que le linter
--    Supabase suggère par principe de performance : ces tables font quelques
--    lignes et la fonction est STABLE.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') in ('thiamabda@gmail.com', 'boukarykonte81@gmail.com'),
    false
  );
$$;

alter table public.puck_pages enable row level security;

drop policy if exists "puck_pages public read" on public.puck_pages;
create policy "puck_pages public read"
  on public.puck_pages for select
  using (true);

drop policy if exists "puck_pages authenticated write" on public.puck_pages;
drop policy if exists "puck_pages admin write" on public.puck_pages;
create policy "puck_pages admin write"
  on public.puck_pages for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

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
  using (public.is_admin());

drop policy if exists "leads admin update" on public.leads;
create policy "leads admin update"
  on public.leads for update
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "leads admin delete" on public.leads;
create policy "leads admin delete"
  on public.leads for delete
  to authenticated
  using (public.is_admin());

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

do $$
begin
  alter publication supabase_realtime add table public.puck_pages;
exception when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------------
-- 4. Row Level Security (site_settings & parcels)
--    - Lecture : publique (tout visiteur voit les données à jour)
--    - Écriture : réservée aux administrateurs (voir 1ter)
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
drop policy if exists "site_settings admin write" on public.site_settings;
create policy "site_settings admin write"
  on public.site_settings for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "parcels authenticated write" on public.parcels;
drop policy if exists "parcels admin write" on public.parcels;
create policy "parcels admin write"
  on public.parcels for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Supabase Storage — bucket public "site-media"
--    Héberge les images, vidéos et PDF téléversés depuis l'Espace Gérant.
--    - Lecture publique : les visiteurs voient les médias (URLs publiques)
--    - Écriture : réservée aux administrateurs (voir 1ter)
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
drop policy if exists "site-media admin insert" on storage.objects;
create policy "site-media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site-media authenticated update" on storage.objects;
drop policy if exists "site-media admin update" on storage.objects;
create policy "site-media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "site-media authenticated delete" on storage.objects;
drop policy if exists "site-media admin delete" on storage.objects;
create policy "site-media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-media' and public.is_admin());