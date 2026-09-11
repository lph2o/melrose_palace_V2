/**
 * Comptes autorisés sur les espaces d'administration.
 *
 * Le contrôle réel est fait par Supabase Auth (email + mot de passe) ; cette
 * constante n'est qu'un garde-fou côté client : une session valide pour un
 * autre compte est refusée et immédiatement déconnectée. Ne jamais s'y fier
 * comme unique protection — les politiques RLS de `supabase/schema.sql` sont
 * la vraie barrière.
 */
export const ADMIN_EMAIL = 'thiamabda@gmail.com';
