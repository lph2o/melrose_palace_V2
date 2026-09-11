import { useEffect, useMemo, useState } from 'react';
import type { Data as PuckData } from '@puckeditor/core';
import { Language, SiteSettings } from '../types';
import { fetchPuckPage, isSupabaseConfigured, subscribeToTableChanges } from '../lib/supabase';
import { buildDefaultPage, puckPageId } from './config';

export interface PuckPageState {
  /** Composition à rendre : version publiée si elle existe, sinon contenu par défaut. */
  data: PuckData;
  /** Vrai tant que la version stockée n'a pas répondu (évite un flash de contenu par défaut). */
  loading: boolean;
  /** Vrai si aucune édition n'a été publiée : le site affiche son contenu par défaut. */
  isDefault: boolean;
}

/**
 * Charge la composition Puck publiée pour une langue et la tient à jour.
 *
 * Contrat de repli (exigence n°4 du chantier) : tant qu'aucune ligne
 * `puck_pages` n'existe — et *a fortiori* si Supabase n'est pas configuré ou
 * si la table n'a pas encore été créée — on renvoie `buildDefaultPage()`, qui
 * reproduit le contenu actuel du site. Le premier déploiement ne casse donc
 * rien, et supprimer la ligne en base suffit à revenir à l'état initial.
 */
export function usePuckPage(language: Language, settings: SiteSettings): PuckPageState {
  const fallback = useMemo(() => buildDefaultPage(language, settings), [language, settings]);
  const [stored, setStored] = useState<PuckData | null>(null);
  const [loading, setLoading] = useState(true);

  const id = puckPageId(language);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStored(null);
    fetchPuckPage(id).then((page) => {
      if (cancelled) return;
      setStored(page);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Temps réel : une publication depuis l'éditeur apparaît sans rechargement.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    return subscribeToTableChanges('puck_pages', () => {
      fetchPuckPage(id).then(setStored);
    });
  }, [id]);

  return { data: stored ?? fallback, loading, isDefault: !stored };
}
