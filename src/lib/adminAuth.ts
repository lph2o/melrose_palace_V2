/**
 * Comptes autorisés sur les espaces d'administration.
 *
 * Le contrôle réel est fait par Supabase Auth (email + mot de passe) ; cette
 * liste n'est qu'un garde-fou côté client : une session valide pour un autre
 * compte est refusée et immédiatement déconnectée. Ne jamais s'y fier comme
 * unique protection — les politiques RLS de `supabase/schema.sql` sont la
 * vraie barrière.
 *
 * Ajouter un administrateur demande DEUX gestes, dans cet ordre :
 *   1. créer le compte dans Supabase Auth (dashboard, ou API admin) ;
 *   2. ajouter son email ci-dessous, puis redéployer.
 * Le contrôle de la base (`public.is_admin()` dans `supabase/schema.sql`) porte
 * la même liste : la mettre à jour aussi, sinon le nouvel admin sera refusé à
 * l'écriture des données, pas à la connexion.
 *
 * Un email est comparé en minuscules : Supabase normalise les adresses.
 */
export const ADMIN_EMAILS = [
  'thiamabda@gmail.com',
  'boukarykonte81@gmail.com',
] as const;

/** Administrateur historique (signature d'URL, scripts). */
export const ADMIN_EMAIL = ADMIN_EMAILS[0];

/** Vrai si l'email correspond à un compte d'administration. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((admin) => admin === normalized);
}
