import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Data as PuckData } from '@puckeditor/core';
import { Lead, Parcel, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS, DEFAULT_SITE_CONTENT, PARCELS, reconcileParcelArea } from '../data';

// Les variables NEXT_PUBLIC_* sont exposées au client via `define` dans vite.config.ts
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

/* ------------------------------------------------------------------ */
/* Settings (une seule ligne, id = 1)                                  */
/* ------------------------------------------------------------------ */

export async function fetchRemoteSettings(): Promise<SiteSettings | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('site_settings')
    .select('data')
    .eq('id', 1)
    .maybeSingle();
  if (error || !data?.data) return null;
  // Merge profond du contenu éditorial : défauts + surcharges cloud (section par section)
  const raw = data.data as Partial<SiteSettings>;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...raw,
    content: { ...DEFAULT_SITE_CONTENT, ...(raw.content ?? {}) },
  };
}

/* ------------------------------------------------------------------ */
/* Résultat de synchronisation cloud (pour le bandeau de l'Espace      */
/* Gérant : la raison précise d'un échec, au lieu d'un simple échec)   */
/* ------------------------------------------------------------------ */

export type SyncFailureReason =
  | 'tables-missing' // PGRST205 / 42P01 : le schéma supabase/schema.sql n'a pas été exécuté
  | 'session-expired' // 401 / JWT invalide ou expiré
  | 'unauthorized' // 42501 : RLS refuse l'écriture (compte non administrateur)
  | 'offline' // réseau indisponible
  | 'unknown';

export interface SyncResult {
  ok: boolean;
  reason?: SyncFailureReason;
}

function classifySyncError(error: unknown): SyncFailureReason {
  const code = String((error as { code?: unknown })?.code ?? '');
  const message = String((error as { message?: unknown })?.message ?? error ?? '').toLowerCase();

  if (code === 'PGRST205' || code === '42P01' || /could not find the table|relation .* does not exist/.test(message)) {
    return 'tables-missing';
  }
  if (code === '401' || /jwt|token expired|invalid api key|unauthorized/.test(message)) {
    return 'session-expired';
  }
  if (code === '42501' || /permission denied|row.level security|rls/.test(message)) {
    return 'unauthorized';
  }
  if (/failed to fetch|networkerror|load failed|timed out|timeout|abort/.test(message)) {
    return 'offline';
  }
  return 'unknown';
}

/** Exécute upsert et classe l'échec ; ne rejette jamais (retourne toujours un SyncResult). */
async function runUpsert(
  query: () => PromiseLike<{ error: { code?: string; message?: string } | null }>
): Promise<SyncResult> {
  if (!supabase) return { ok: false, reason: 'unknown' };
  try {
    const { error } = await query();
    if (!error) return { ok: true };
    return { ok: false, reason: classifySyncError(error) };
  } catch (e) {
    // Requête rejetée (réseau, CORS…) : supabase-js lève parfois au lieu de renvoyer une erreur.
    return { ok: false, reason: classifySyncError(e) };
  }
}

export async function upsertRemoteSettings(settings: SiteSettings): Promise<SyncResult> {
  return runUpsert(() =>
    supabase!.from('site_settings').upsert(
      { id: 1, data: settings, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  );
}

export async function clearRemoteSettings(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('site_settings').delete().eq('id', 1);
  return !error;
}

/* ------------------------------------------------------------------ */
/* Parcelles (une ligne par parcelle, data = objet Parcel complet)     */
/* ------------------------------------------------------------------ */

export async function fetchRemoteParcels(): Promise<Parcel[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('parcels').select('id, data');
  if (error || !data || data.length === 0) return null;

  const remote = new Map<number, Partial<Parcel>>();
  for (const row of data) {
    remote.set(row.id as number, (row.data as Partial<Parcel>) ?? {});
  }
  // Ordre et données par défaut de data.ts, surchargés par le cloud. La surface
  // est réconciliée : une édition Gérant ne peut pas la faire diverger des cotes
  // affichées à côté (même règle que le garde-fou de build).
  return PARCELS.map((p) => reconcileParcelArea({ ...p, ...(remote.get(p.id) ?? {}) }));
}

export async function upsertRemoteParcel(parcel: Parcel): Promise<SyncResult> {
  // On enregistre la version réconciliée : la base ne doit pas héberger une
  // surface que le site refuserait d'afficher au chargement suivant.
  const safe = reconcileParcelArea(parcel);
  return runUpsert(() =>
    supabase!.from('parcels').upsert(
      { id: safe.id, data: safe, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  );
}

export async function clearRemoteParcels(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('parcels').delete().gte('id', 0);
  return !error;
}

/* ------------------------------------------------------------------ */
/* Pages de l'éditeur visuel (table puck_pages, une ligne par page et  */
/* par langue : « home-fr », « home-en »)                              */
/* ------------------------------------------------------------------ */

/**
 * Lit la composition Puck d'une page. Retourne null si la table n'existe pas
 * encore, si aucune édition n'a été enregistrée, ou hors-ligne : l'appelant
 * doit alors retomber sur `buildDefaultPage()` (contenu actuel du site).
 */
export async function fetchPuckPage(id: string): Promise<PuckData | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('puck_pages').select('data').eq('id', id).maybeSingle();
  if (error || !data?.data) return null;
  const page = data.data as PuckData;
  if (!Array.isArray(page.content)) return null;
  return page;
}

/** Enregistre (ou remplace) la composition Puck d'une page. */
export async function upsertPuckPage(id: string, page: PuckData): Promise<SyncResult> {
  return runUpsert(() =>
    supabase!.from('puck_pages').upsert(
      { id, data: page, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
  );
}

/** Supprime la composition d'une page : le site repasse au contenu par défaut. */
export async function clearPuckPage(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('puck_pages').delete().eq('id', id);
  return !error;
}

/* ------------------------------------------------------------------ */
/* Demandes de contact (formulaire du site → Espace Gérant)            */
/* ------------------------------------------------------------------ */

export async function fetchLeads(): Promise<Lead[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return null;
  return (data ?? []) as Lead[];
}

export async function insertLead(lead: Omit<Lead, 'id' | 'is_read' | 'created_at'>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leads').insert(lead);
  return !error;
}

export async function setLeadRead(id: number, isRead: boolean): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leads').update({ is_read: isRead }).eq('id', id);
  return !error;
}

export async function markAllLeadsRead(): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leads').update({ is_read: true }).eq('is_read', false);
  return !error;
}

export async function deleteLead(id: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('leads').delete().eq('id', id);
  return !error;
}

/* ------------------------------------------------------------------ */
/* Temps réel : les modifications de l'Espace Gérant apparaissent      */
/* instantanément sur le site public, sans rechargement.               */
/* ------------------------------------------------------------------ */

/**
 * S'abonne aux changements (insert/update/delete) d'une table.
 * Retourne la fonction de nettoyage. Nécessite que la table soit dans
 * la publication supabase_realtime (voir supabase/schema.sql).
 */
export function subscribeToTableChanges(
  table: 'parcels' | 'site_settings' | 'leads' | 'puck_pages',
  onEvent: () => void
): () => void {
  if (!supabase) return () => {};
  const channel = supabase
    .channel(`realtime-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => onEvent())
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/* ------------------------------------------------------------------ */
/* Storage — upload des médias du site (images, vidéos, PDF)           */
/* ------------------------------------------------------------------ */

/** Bucket public créé par supabase/schema.sql (section 5). */
export const SITE_MEDIA_BUCKET = 'site-media';

/** Dossiers logiques dans le bucket, un par type de média. */
export type MediaFolder = 'images' | 'videos' | 'pdf';

/**
 * Téléverse un fichier vers Supabase Storage et retourne son URL publique.
 * Nécessite une session admin active (les politiques n'autorisent que
 * `authenticated` à écrire dans le bucket).
 */
export async function uploadSiteMedia(
  file: File,
  folder: MediaFolder
): Promise<{ ok: boolean; url?: string; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase n’est pas configuré (variables manquantes).' };

  // Nom unique : horodatage + nom d'origine assaini
  const ext = file.name.includes('.') ? file.name.split('.').pop() : '';
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  const path = `${folder}/${Date.now()}-${base}.${ext}`;

  try {
    const { error } = await supabase.storage.from(SITE_MEDIA_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      // Session expirée ou permissions insuffisantes
      const msg = String(error.message ?? '');
      const reason = /jwt|token|expired|unauthorized|permission/i.test(msg)
        ? 'Session expirée — reconnectez-vous dans l\'Espace Gérant.'
        : `Échec du téléversement : ${msg}`;
      return { ok: false, error: reason };
    }
    const { data } = supabase.storage.from(SITE_MEDIA_BUCKET).getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: String(e instanceof Error ? e.message : e) };
  }
}

/**
 * Supprime un objet du bucket (utilisé quand on remplace un média pour
 * ne pas laisser d'orphelins). Ne renvoie jamais d'erreur bloquante.
 */
export async function deleteSiteMedia(url: string): Promise<void> {
  if (!supabase || !url) return;
  try {
    // Extrait le chemin relatif depuis l'URL publique : .../object/public/site-media/<path>
    const marker = `/object/public/${SITE_MEDIA_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length).split('?')[0];
    if (!path) return;
    await supabase.storage.from(SITE_MEDIA_BUCKET).remove([path]);
  } catch {
    /* silencieux — la suppression est un nettoyage, pas une étape critique */
  }
}

/* ------------------------------------------------------------------ */
/* Auth (Espace Gérant — Supabase Auth, email + mot de passe)          */
/* ------------------------------------------------------------------ */

export async function signInAdmin(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase n’est pas configuré (variables manquantes).' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function signOutAdmin(): Promise<void> {
  await supabase?.auth.signOut();
}

export async function getAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

/** Email de l'utilisateur connecté, ou null si aucune session. */
export async function getSessionEmail(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email ?? null;
}

/** Abonnement aux changements de session ; retourne la fonction de nettoyage. */
export function onAdminAuthChange(cb: (isAuthenticated: boolean) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(Boolean(session));
  });
  return () => data.subscription.unsubscribe();
}