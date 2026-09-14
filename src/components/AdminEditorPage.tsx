import { useCallback, useEffect, useMemo, useState } from 'react';
import { Puck } from '@puckeditor/core';
import type { Data as PuckData } from '@puckeditor/core';
// Feuille de style de l'éditeur (chargée uniquement avec ce chunk lazy : le
// site public n'en a pas besoin — son rendu passe par `@puckeditor/core/rsc`).
import '@puckeditor/core/puck.css';
// Thème sombre premium de l'éditeur (tokens --puck-*) — chargé avec ce chunk
// lazy uniquement, jamais sur le site public.
import '../puck/editorTheme.css';
import {
  ArrowLeft,
  Cloud,
  Compass,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { Language, Parcel, SiteSettings } from '../types';
import { ADMIN_EMAIL } from '../lib/adminAuth';
import {
  clearPuckPage,
  fetchPuckPage,
  getAdminSession,
  getSessionEmail,
  isSupabaseConfigured,
  onAdminAuthChange,
  signInAdmin,
  signOutAdmin,
  upsertPuckPage,
  SyncFailureReason,
} from '../lib/supabase';
import { buildDefaultPage, ensureItemIds, puckConfig, puckPageId } from '../puck/config';
import { withRichText } from '../puck/richText';
import { DrawerCard } from '../puck/drawerCards';
import { EditorComponentOverlay, EditorFieldLabel } from '../puck/uiOverrides';
import { SiteProvider } from '../site/SiteContext';
import { hiddenSectionCount } from '../site/sectionsCatalog';

interface AdminEditorPageProps {
  settings: SiteSettings;
  parcels: Parcel[];
  onBack: () => void;
}

const SYNC_FAILURE_MESSAGES: Partial<Record<SyncFailureReason, string>> = {
  'tables-missing':
    "Table « puck_pages » introuvable — exécutez supabase/schema.sql dans le SQL Editor du dashboard Supabase.",
  'session-expired': 'Session expirée — reconnectez-vous.',
  unauthorized: 'Accès refusé par les politiques RLS — reconnectez-vous avec le compte administrateur.',
  offline: 'Hors-ligne — la composition n’a pas été publiée.',
  unknown: 'Publication impossible — vérifiez la configuration Supabase.',
};

type SaveState = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved' } | { kind: 'error'; reason: string };

/**
 * Éditeur visuel `/admin/editor`.
 *
 * Une page = une langue : on édite et on publie `home-fr` ou `home-en`
 * séparément (voir `.agents/skills/puck-editor-parcelles/SKILL.md`).
 *
 * Le canevas reçoit exactement le même `SiteProvider` que le site public, avec
 * des gestionnaires neutralisés : cliquer sur « Explorer le plan » dans
 * l'éditeur ne doit pas faire naviguer l'admin hors du canevas.
 */
export default function AdminEditorPage({ settings, parcels, onBack }: AdminEditorPageProps) {
  const [language, setLanguage] = useState<Language>('FR');
  const [pageData, setPageData] = useState<PuckData | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready'>('loading');
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });

  // Config de l'éditeur : puckConfig + champs richtext enrichis (TipTap).
  // Calculée une fois : `withRichText` clone la config en préservant les
  // fonctions `render` (voir src/puck/richText.tsx).
  const editorConfig = useMemo(() => withRichText(puckConfig), []);

  // --- Authentification (même contrat que l'Espace Gérant) -------------
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const verify = async (): Promise<boolean> => {
      if (!(await getAdminSession())) return false;
      const sessionEmail = await getSessionEmail();
      if (sessionEmail === ADMIN_EMAIL) return true;
      await signOutAdmin();
      if (mounted) setAuthError("Accès refusé : cet espace est réservé à l'administrateur.");
      return false;
    };

    verify().then((ok) => {
      if (mounted) setAuthState(ok ? 'signedIn' : 'signedOut');
    });

    const unsubscribe = onAdminAuthChange(async (isAuth) => {
      if (!mounted) return;
      if (!isAuth) {
        setAuthState('signedOut');
        return;
      }
      setAuthState((await verify()) ? 'signedIn' : 'signedOut');
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    const res = await signInAdmin(email.trim(), password);
    setAuthSubmitting(false);
    if (!res.ok) {
      setAuthError(res.error ?? 'Connexion impossible.');
      return;
    }
    const sessionEmail = await getSessionEmail();
    if (sessionEmail !== ADMIN_EMAIL) {
      await signOutAdmin();
      setAuthState('signedOut');
      setAuthError("Accès refusé : cet espace est réservé à l'administrateur.");
      return;
    }
    setAuthState('signedIn');
  };

  // --- Chargement de la composition à éditer ---------------------------
  const defaultData = useMemo(() => buildDefaultPage(language, settings), [language, settings]);

  useEffect(() => {
    if (authState !== 'signedIn') return;
    let cancelled = false;
    setLoadState('loading');
    setPageData(null);
    fetchPuckPage(puckPageId(language)).then((stored) => {
      if (cancelled) return;
      // `ensureItemIds` : une composition publiée sans `props.id` ferait planter
      // `<Puck />` (index interne) — on complète les ids manquants à la lecture.
      setPageData(stored ? ensureItemIds(stored) : defaultData);
      setLoadState('ready');
    });
    return () => {
      cancelled = true;
    };
    // `defaultData` est volontairement absent : il change à chaque frappe dans
    // l'Espace Gérant et ne doit pas réinitialiser le canevas en cours d'édition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, language]);

  const handlePublish = useCallback(
    async (next: PuckData) => {
      setSave({ kind: 'saving' });
      const result = await upsertPuckPage(puckPageId(language), next);
      if (result.ok) {
        setSave({ kind: 'saved' });
        setTimeout(() => setSave({ kind: 'idle' }), 5000);
      } else {
        setSave({
          kind: 'error',
          reason: SYNC_FAILURE_MESSAGES[result.reason ?? 'unknown'] ?? 'Publication impossible.',
        });
      }
    },
    [language]
  );

  const handleResetToDefaults = useCallback(async () => {
    const confirmed = window.confirm(
      `Remplacer la composition publiée (${puckPageId(language)}) par le contenu par défaut du site ?`
    );
    if (!confirmed) return;
    setSave({ kind: 'saving' });
    // Suppression de la ligne : le site public retombe immédiatement sur le défaut.
    const cleared = await clearPuckPage(puckPageId(language));
    if (cleared) {
      setPageData(buildDefaultPage(language, settings));
      setSave({ kind: 'saved' });
      setTimeout(() => setSave({ kind: 'idle' }), 5000);
    } else {
      setSave({ kind: 'error', reason: SYNC_FAILURE_MESSAGES.unknown ?? 'Réinitialisation impossible.' });
    }
  }, [language, settings]);

  // Gestionnaires neutralisés dans le canevas (pas de navigation hors éditeur).
  const editorContext = useMemo(
    () => ({
      language,
      settings,
      parcels,
      setActiveTab: () => {},
      scrollToSection: () => {},
      onOpenBrochure: () => {},
      onSelectArticle: () => {},
      openFaqId: null,
      onClearOpenFaqId: () => {},
    }),
    [language, settings, parcels]
  );

  // --- Rendu ------------------------------------------------------------

  if (authState !== 'signedIn') {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center px-4 overflow-hidden">
        {/* Halo doré diffus en arrière-plan */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-[#fed65b]/[0.07] blur-[120px] -top-40 -right-32 pointer-events-none" />
        <div className="absolute w-[420px] h-[420px] rounded-full bg-[#0a5c3d]/20 blur-[100px] -bottom-40 -left-32 pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Monogramme + titre */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-card bg-gradient-to-br from-[#fed65b] to-[#FED65B] flex items-center justify-center text-[#241a00] shadow-[0_8px_30px_rgba(254,214,91,0.25)] mb-4">
              <Compass className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <p className="font-mono text-caption uppercase tracking-[0.35em] text-secondary-fixed/70 mb-2">
              Senegal Investment Consulting
            </p>
            <h1 className="font-serif text-2xl font-bold tracking-tight">Éditeur visuel</h1>
            <p className="text-xs text-white/60 mt-2 max-w-xs">
              Modifiez les sections de la page d'accueil et publiez en un clic.
            </p>
          </div>

          <div className="rounded-card bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-xl p-8">
            {authState === 'loading' ? (
              <div className="flex items-center justify-center gap-3 text-white/70 text-xs py-6">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                Vérification…
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block font-mono text-caption uppercase tracking-[0.25em] text-white/60 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-inner bg-white/[0.06] ring-1 ring-white/10 text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-300/60 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block font-mono text-caption uppercase tracking-[0.25em] text-white/60 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 rounded-inner bg-white/[0.06] ring-1 ring-white/10 text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-300/60 transition-shadow"
                  />
                </div>

                {authError && (
                  <p className="p-3 rounded-inner bg-rose-500/10 ring-1 ring-rose-400/30 text-rose-200 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    {authError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 rounded-full bg-gradient-to-br from-[#fed65b] to-[#FED65B] text-[#241a00] text-xs font-bold uppercase tracking-widest disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-[0.98] shadow-[0_8px_24px_rgba(254,214,91,0.2)]"
                >
                  {authSubmitting ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <Lock className="w-3.5 h-3.5" strokeWidth={2} />}
                  {authSubmitting ? 'Connexion…' : 'Se connecter'}
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full text-center text-caption text-white/60 hover:text-white/70 cursor-pointer transition-colors"
                >
                  Retour au site
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="puck-editor-shell min-h-screen bg-[#0d0f11] text-white">
      {/* Barre d'outils : langue éditée, état de publication, retour */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 bg-[#0d0f11]/92 backdrop-blur border-b border-white/[0.07]">
        {/* Identité */}
        <div className="hidden sm:flex items-center gap-3 mr-2">
          <div className="w-8 h-8 rounded-inner bg-gradient-to-br from-[#fed65b] to-[#FED65B] flex items-center justify-center text-[#241a00] shadow-[0_4px_14px_rgba(254,214,91,0.25)]">
            <Compass className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <div className="leading-tight">
            <p className="text-caption font-semibold tracking-tight">Éditeur visuel</p>
            <p className="font-mono text-micro uppercase tracking-[0.25em] text-white/60">
              page : {puckPageId(language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Sections masquées dans l'Espace Gérant : elles restent visibles et
              éditables ici, mais ne sont pas affichées sur le site public. */}
          {hiddenSectionCount(settings) > 0 && (
            <span
              title="Ces sections restent dans la composition et sont modifiables ici, mais l'Espace Gérant les masque sur le site public (onglet « Sections »)."
              className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] ring-1 ring-white/10 text-white/60"
            >
              <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} />
              {hiddenSectionCount(settings)} section(s) masquée(s) sur le site
            </span>
          )}

          {/* État de publication */}
          {!isSupabaseConfigured && (
            <span className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 ring-1 ring-amber-400/30 text-amber-200">
              <Cloud className="w-3.5 h-3.5" strokeWidth={1.5} />
              Supabase non configuré
            </span>
          )}
          {save.kind === 'saving' && (
            <span className="inline-flex items-center gap-2 text-sky-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
              Publication…
            </span>
          )}
          {save.kind === 'saved' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 ring-1 ring-emerald-400/25 text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Publié
            </span>
          )}
          {save.kind === 'error' && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 ring-1 ring-rose-400/30 text-rose-300">
              <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
              Échec de publication
            </span>
          )}
          {save.kind === 'idle' && isSupabaseConfigured && (
            <span className="hidden xl:inline-flex items-center gap-2 text-white/60">
              <Cloud className="w-3.5 h-3.5" strokeWidth={1.5} />
              Non publié
            </span>
          )}

          {/* Sélecteur de langue */}
          <div className="flex items-center rounded-full bg-white/[0.05] ring-1 ring-white/10 p-0.5">
            <Globe className="w-3.5 h-3.5 text-white/60 mx-1.5 hidden sm:block" strokeWidth={1.5} />
            {(['FR', 'EN'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1.5 rounded-full text-caption font-bold uppercase tracking-widest cursor-pointer transition-all duration-200 ${
                  language === lang
                    ? 'bg-amber-300 text-[#241a00] shadow-[0_2px_10px_rgba(254,214,91,0.35)]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={handleResetToDefaults}
            title="Remplacer la composition publiée par le contenu par défaut"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.05] ring-1 ring-white/10 text-caption text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
            Contenu par défaut
          </button>

          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.05] ring-1 ring-white/10 text-caption text-white/70 hover:text-white hover:bg-white/10 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden md:inline">Espace Gérant</span>
            <span className="md:hidden">Retour</span>
          </button>
        </div>
      </div>

      {/* Détail de l'erreur de publication (si besoin) */}
      {save.kind === 'error' && (
        <div className="px-4 py-2 flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-card bg-rose-500/10 ring-1 ring-rose-400/30 text-rose-200 text-caption max-w-2xl">
            <XCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
            {save.reason}
          </span>
        </div>
      )}

      {loadState === 'loading' ? (
        <div className="min-h-[60dvh] flex items-center justify-center gap-3 text-white/60 text-xs">
          <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          Chargement de la composition…
        </div>
      ) : (
        <SiteProvider value={editorContext}>
          {/* `key` force la réinitialisation du canevas au changement de langue. */}
          <Puck
            key={language}
            config={editorConfig}
            data={pageData ?? defaultData}
            onPublish={handlePublish}
            headerTitle="Page d'accueil"
            headerPath={`/admin/editor • ${puckPageId(language)}`}
            overrides={{
              drawerItem: DrawerCard,
              fieldLabel: EditorFieldLabel,
              componentOverlay: EditorComponentOverlay,
            }}
          />
        </SiteProvider>
      )}
    </div>
  );
}
