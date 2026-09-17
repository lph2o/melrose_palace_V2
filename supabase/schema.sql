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

-- ---------------------------------------------------------------------
-- 6. Référentiel cadastral — garde-fou de la table `parcels`
--
-- POURQUOI : `parcels` n'est qu'un magasin de SURCHARGES (le statut vendue /
-- réservée / disponible) par-dessus les données par défaut de `src/data.ts`.
-- Rien n'empêchait d'y écrire `{ "area": 999 }` sur un lot de 120 m² : le site
-- affichait alors une surface contredisant les cotes imprimées juste à côté,
-- et c'est exactement par là qu'est passée l'incohérence du lot 46.
--
-- CE QUI EST CONTRÔLÉ : un déclencheur refuse toute ligne dont `data.area`
-- diffère de la surface du référentiel, ou dont `data.dimensions` diffère des
-- cotes du référentiel. Les deux sont donc verrouillés ensemble.
--
-- POURQUOI UN RÉFÉRENTIEL ET PAS LE CALCUL EN SQL : la règle de dérivation
-- (rectangle, trapèze, exception de forme du lot 54) vit dans `src/data.ts`.
-- La réécrire en PL/pgSQL créerait une seconde vérité qui finirait par
-- diverger — le problème même qu'on supprime. Le bloc `values` ci-dessous est
-- donc la copie conforme de `PARCELS` : le build le vérifie
-- (`scripts/check-parcels.cjs`) et échoue s'il prend du retard.
--
-- Pour changer une cote ou une surface : modifiez `src/data.ts`, lancez
-- `npm run build` (ou `npm run verify:parcels`), puis reportez ici les lignes
-- signalées. Le référentiel n'est jamais édité « à la main » sans la source.
-- ---------------------------------------------------------------------

create table if not exists public.parcel_cadastre (
  id         int primary key,
  dimensions text not null,
  area       numeric not null check (area > 0),
  updated_at timestamptz not null default now()
);

-- Aucune politique : la table est illisible et inmodifiable via l'API publique
-- (clé anon comprise). Seul le déclencheur ci-dessous, SECURITY DEFINER, la lit.
alter table public.parcel_cadastre enable row level security;

drop policy if exists "parcel_cadastre public read" on public.parcel_cadastre;

drop policy if exists "parcel_cadastre admin write" on public.parcel_cadastre;
create policy "parcel_cadastre admin write"
  on public.parcel_cadastre for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.parcel_cadastre (id, dimensions, area) values
  ( 1, '12.00 m × 12.00 m', 144),
  ( 2, '10.00 m × 12.00 m', 120),
  ( 3, '10.00 m × 12.00 m', 120),
  ( 4, '10.00 m / 18.00 m × 12.00 m', 168),
  ( 5, '15.00 m × 10.00 m', 150),
  ( 6, '15.00 m × 10.00 m', 150),
  ( 7, '15.00 m × 10.00 m', 150),
  ( 8, '15.00 m × 10.00 m', 150),
  ( 9, '15.00 m × 10.00 m', 150),
  (10, '15.00 m × 10.00 m', 150),
  (11, '15.00 m × 8.00 / 12.00 m', 150),
  (12, '15.00 m × 10.00 m', 150),
  (13, '15.00 m × 18.20 m', 273),
  (14, '15.00 m × 10.00 m', 150),
  (15, '15.00 m × 10.00 m', 150),
  (16, '15.00 m × 10.00 m', 150),
  (17, '15.00 m × 10.00 m', 150),
  (18, '15.00 m × 10.00 m', 150),
  (19, '15.00 m × 12.00 m', 180),
  (20, '15.00 m × 10.00 m', 150),
  (21, '15.00 m × 10.00 m', 150),
  (22, '15.00 m × 10.00 m', 150),
  (23, '15.00 m × 10.00 m', 150),
  (24, '15.00 m × 10.00 m', 150),
  (25, '15.00 m × 10.00 m', 150),
  (26, '15.00 m × 10.00 m', 150),
  (27, '15.00 m × 10.00 m', 150),
  (28, '15.00 m × 10.00 / 4.77 m', 111),
  (29, '15.00 m × 10.00 m', 150),
  (30, '15.00 m × 7.00 / 9.00 m', 120),
  (31, '9.00 m × 15.17 m', 137),
  (32, '10.00 m × 15.00 m', 150),
  (33, '15.00 m × 10.00 m', 150),
  (34, '15.00 m × 14.00 m', 210),
  (35, '15.00 m × 10.00 m', 150),
  (36, '15.00 m × 10.00 m', 150),
  (37, '15.00 m × 10.00 m', 150),
  (38, '15.00 m × 10.00 m', 150),
  (39, '15.00 m × 10.00 m', 150),
  (40, '15.00 m × 10.00 m', 150),
  (41, '15.00 m × 10.00 m', 150),
  (42, '15.00 m × 10.00 m', 150),
  (43, '15.00 m × 10.00 m', 150),
  (44, '15.00 m × 10.00 m', 150),
  (45, '15.00 m × 10.00 m', 150),
  (46, '21.00 m × 31.52 m', 662),
  (47, '9.00 m × 15.00 m', 135),
  (48, '9.00 m × 15.00 m', 135),
  (49, '12.00 m × 15.00 m', 180),
  (50, '15.00 m × 15.00 / 22.13 m', 278),
  (51, '15.00 m × 10.00 m', 150),
  (52, '15.00 m × 10.00 m', 150),
  (53, '14.32 m × 19.78 m', 283),
  (54, '30.00 m × 15.00 m (Façade Nord B1)', 225)
on conflict (id) do update
  set dimensions = excluded.dimensions,
      area       = excluded.area,
      updated_at = now();

create or replace function public.parcels_enforce_cadastre()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ref_dimensions text;
  ref_area       numeric;
begin
  -- Une surcharge qui ne porte pas de surface (statut seul) reste autorisée :
  -- elle ne peut rien contredire, le site complète avec les données du lot.
  if new.data->>'area' is null then
    return new;
  end if;

  if new.data->>'dimensions' is null then
    raise exception
      'Parcelle % : surface déclarée sans cotes — impossible de vérifier (voir supabase/schema.sql, section 6).',
      new.id;
  end if;

  select c.dimensions, c.area into ref_dimensions, ref_area
  from public.parcel_cadastre c
  where c.id = new.id;

  if ref_dimensions is null then
    raise exception
      'Parcelle % inconnue du référentiel cadastral : ajoutez-la d''abord (supabase/schema.sql, section 6).',
      new.id;
  end if;

  if new.data->>'dimensions' is distinct from ref_dimensions then
    raise exception
      'Parcelle % : cotes « % » refusées, le référentiel cadastral porte « % ». Corrigez les cotes dans src/data.ts puis reportez-les ici.',
      new.id, new.data->>'dimensions', ref_dimensions;
  end if;

  if (new.data->>'area')::numeric is distinct from ref_area then
    raise exception
      'Parcelle % : surface % m² refusée, % m² sont déduits des cotes « % ». La surface ne se saisit pas : elle découle des cotes.',
      new.id, new.data->>'area', ref_area, ref_dimensions;
  end if;

  return new;
end;
$$;

drop trigger if exists parcels_enforce_cadastre on public.parcels;
create trigger parcels_enforce_cadastre
  before insert or update on public.parcels
  for each row execute function public.parcels_enforce_cadastre();

-- REMISE À NIVEAU DES LIGNES DÉJÀ EN BASE (facultatif, à lancer sciemment).
-- Le déclencheur ne juge que les écritures futures : les surcharges enregistrées
-- avant sa création peuvent encore contredire le référentiel. Pour les lister :
--
--   select p.id, p.data->>'dimensions' as cotes_base, c.dimensions as cotes_ref,
--          p.data->>'area' as surface_base, c.area as surface_ref
--   from public.parcels p
--   join public.parcel_cadastre c on c.id = p.id
--   where p.data->>'dimensions' is distinct from c.dimensions
--      or (p.data->>'area')::numeric is distinct from c.area;
--
-- Supprimer une ligne non conforme suffit : le site retombe alors sur les
-- données par défaut de `src/data.ts` (le statut commercial, lui, est à
-- repointer à la main si besoin).
--
--   delete from public.parcels p
--   using public.parcel_cadastre c
--   where c.id = p.id
--     and (p.data->>'dimensions' is distinct from c.dimensions
--          or (p.data->>'area')::numeric is distinct from c.area);