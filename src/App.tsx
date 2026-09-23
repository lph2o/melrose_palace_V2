import { lazy, Suspense, useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MasterPlanPage from './components/MasterPlanPage';
import LegalNoticePage from './components/LegalNoticePage';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import BlogModal from './components/BlogModal';
import AdminPage from './components/AdminPage';
import { SiteProvider } from './site/SiteContext';
import BrochureModal from './components/BrochureModal';
import ShareSiteModal from './components/ShareSiteModal';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import { Language, BlogArticle, SiteSettings, Parcel, SiteView } from './types';
import { DEFAULT_SITE_SETTINGS, PARCELS, reconcileParcelArea } from './data';
import { applySeo, detectLanguageFromPath, detectViewFromPath, langViewPath } from './lib/seo';
import {
  fetchRemoteSettings,
  fetchRemoteParcels,
  upsertRemoteSettings,
  upsertRemoteParcel,
  clearRemoteSettings,
  clearRemoteParcels,
  subscribeToTableChanges,
  isSupabaseConfigured,
  SyncResult,
} from './lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { initScrollReveal } from './lib/reveal';

// L'éditeur Puck n'est chargé que sur /admin/editor : le site public ne paie
// pas son poids (ni ses feuilles de style) au premier chargement.
const AdminEditorPage = lazy(() => import('./components/AdminEditorPage'));

export default function App() {
  // Langue et vue initialisées depuis l'URL : /fr, /en, /fr/plan, /en/plan,
  // /fr/mentions-legales, /en/legal-notice — et '/' par défaut (FR). URLs
  // distinctes = SEO multilingue.
  const [language, setLanguageState] = useState<Language>(() =>
    detectLanguageFromPath(window.location.pathname)
  );
  const [activeTab, setActiveTabState] = useState<SiteView>(() =>
    detectViewFromPath(window.location.pathname)
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [globalSelectedParcelId, setGlobalSelectedParcelId] = useState<number | null>(null);
  const [globalActiveArticle, setGlobalActiveArticle] = useState<BlogArticle | null>(null);
  const [globalActiveFaqId, setGlobalActiveFaqId] = useState<string | null>(null);

  // Dynamic Site Settings with localStorage persistence
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('sic_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure email and address match official brochure
        if (!parsed.contactEmail || parsed.contactEmail.includes('senegal-immobilier-consulting.com')) {
          parsed.contactEmail = 'globalequalite@gmail.com';
          parsed.contactAddress = 'Dakar, Rufisque — Keury Kao';
        }
        if (!parsed.whatsappNumber || parsed.whatsappNumber.includes('77 345 67 89')) {
          parsed.whatsappNumber = '+33 7 61 23 55 09';
          parsed.whatsappCleanNumber = '33761235509';
          parsed.contactPhone = '+33 7 61 23 55 09';
        }
        localStorage.setItem('sic_site_settings', JSON.stringify(parsed));
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Dynamic Parcels state (20 parcels initialized)
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    try {
      const saved = localStorage.getItem('sic_parcels');
      if (saved) {
        // Ce cache peut dater d'avant la réconciliation des surfaces : on le
        // repasse par la même règle qu'à la lecture cloud, sinon un ancien
        // enregistrement incohérent ressurgirait au premier rendu.
        return (JSON.parse(saved) as Parcel[]).map(reconcileParcelArea);
      }
    } catch {
      // ignore
    }
    return PARCELS;
  });

  // Indique si la première synchronisation cloud est terminée (skeletons KPI de l'admin)
  const [initialSyncDone, setInitialSyncDone] = useState(false);

  // Apparition au scroll pour tout le site : un seul IntersectionObserver, qui
  // reprend aussi les blocs ajoutés après coup (rendu Puck, changement de langue).
  useEffect(() => initScrollReveal(), []);

  // Synchronisation initiale avec Supabase (source de vérité cloud)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [remoteSettings, remoteParcels] = await Promise.all([
          fetchRemoteSettings(),
          fetchRemoteParcels(),
        ]);
        if (cancelled) return;
        if (remoteSettings) {
          setSettings(remoteSettings);
          try {
            localStorage.setItem('sic_site_settings', JSON.stringify(remoteSettings));
          } catch {
            // ignore
          }
        }
        if (remoteParcels) {
          setParcels(remoteParcels);
          try {
            localStorage.setItem('sic_parcels', JSON.stringify(remoteParcels));
          } catch {
            // ignore
          }
        }
      } catch {
        // Hors-ligne ou tables absentes : on garde localStorage puis les valeurs par défaut
      } finally {
        if (!cancelled) setInitialSyncDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Temps réel : les changements faits dans l'Espace Gérant (autre appareil,
  // autre onglet) apparaissent ici automatiquement, sans rechargement.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const refreshParcels = () => {
      fetchRemoteParcels().then((remote) => {
        if (!remote) return;
        setParcels(remote);
        try {
          localStorage.setItem('sic_parcels', JSON.stringify(remote));
        } catch {
          // ignore
        }
      });
    };
    const refreshSettings = () => {
      fetchRemoteSettings().then((remote) => {
        if (!remote) return;
        setSettings(remote);
        try {
          localStorage.setItem('sic_site_settings', JSON.stringify(remote));
        } catch {
          // ignore
        }
      });
    };
    const unsubParcels = subscribeToTableChanges('parcels', refreshParcels);
    const unsubSettings = subscribeToTableChanges('site_settings', refreshSettings);
    return () => {
      unsubParcels();
      unsubSettings();
    };
  }, []);

  // Retourne le résultat de la synchronisation cloud (ok + raison d'un échec)
  const handleSaveSettings = async (newSettings: SiteSettings): Promise<SyncResult> => {
    setSettings(newSettings);
    try {
      localStorage.setItem('sic_site_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
    return upsertRemoteSettings(newSettings);
  };

  /**
   * Édition d'une parcelle (statut commercial, prix, prix comptant…) depuis
   * l'Espace Gérant. `setParcels` est ce qui rend l'édition visible partout : la
   * fiche du lot, la grille des paliers et le PDF lisent tous ce tableau, donc
   * un prix corrigé se répercute sans rechargement.
   *
   * `upsertRemoteParcel` réconcilie la surface avant l'écriture : une édition de
   * cotes ne peut pas laisser en base une surface qui les contredit.
   *
   * Retourne le résultat de la synchronisation cloud (ok + raison d'un échec).
   */
  const handleUpdateParcel = async (id: number, patch: Partial<Parcel>): Promise<SyncResult> => {
    const updated = parcels.map((p) => (p.id === id ? { ...p, ...patch } : p));
    const changed = updated.find((p) => p.id === id);
    setParcels(updated);
    try {
      localStorage.setItem('sic_parcels', JSON.stringify(updated));
    } catch {
      // ignore
    }
    return changed ? upsertRemoteParcel(changed) : { ok: false, reason: 'unknown' };
  };

  const handleUpdateParcelStatus = (
    id: number,
    status: 'Available' | 'Reserved' | 'Sold'
  ): Promise<SyncResult> => handleUpdateParcel(id, { status });

  const handleResetDefaults = async (): Promise<void> => {
    setSettings(DEFAULT_SITE_SETTINGS);
    setParcels(PARCELS);
    try {
      localStorage.removeItem('sic_site_settings');
      localStorage.removeItem('sic_parcels');
    } catch {
      // ignore
    }
    // Retour au cloud : suppression des lignes pour que les visiteurs voient les valeurs par défaut
    await Promise.all([clearRemoteSettings(), clearRemoteParcels()]);
  };

  // Langue / vue → URL (History API, sans rechargement)
  // En admin/éditeur, on ne réécrit pas l'URL publique (elle appartient à la
  // route d'administration) : seul le state React est mis à jour.
  const onAdminRoute = () => isAdminPath() || isEditorPath();

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (!onAdminRoute()) {
      window.history.pushState({}, '', langViewPath(lang, activeTab));
    }
  };

  const setActiveTab = (tab: SiteView) => {
    setActiveTabState(tab);
    if (!onAdminRoute()) {
      window.history.pushState({}, '', langViewPath(language, tab));
    }
  };

  // ------------------------------------------------------------------
  // Routes d'administration : /admin (Espace Gérant) et /admin/editor
  // (éditeur visuel Puck). Accessibles via le chemin ou le hash, absentes
  // de la navigation publique, en noindex et hors sitemap.
  // ------------------------------------------------------------------
  const isAdminPath = () =>
    window.location.hash === '#/admin' ||
    window.location.pathname.endsWith('/admin') ||
    window.location.pathname.endsWith('/admin/');

  const isEditorPath = () =>
    window.location.hash === '#/admin/editor' ||
    /\/admin\/editor\/?$/.test(window.location.pathname);

  type AppRoute = 'site' | 'admin' | 'editor';

  const detectRoute = (): AppRoute => (isEditorPath() ? 'editor' : isAdminPath() ? 'admin' : 'site');

  const [route, setRoute] = useState<AppRoute>(detectRoute);

  useEffect(() => {
    const sync = () => {
      const nextRoute = detectRoute();
      setRoute(nextRoute);
      if (nextRoute === 'site') {
        // Retour / navigation avant-arrière : on resynchronise langue et vue
        setLanguageState(detectLanguageFromPath(window.location.pathname));
        setActiveTabState(detectViewFromPath(window.location.pathname));
      }
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  // SEO : titre, description, OG, canonical, hreflang et JSON-LD à jour
  // selon la langue, la vue et le contenu (packs/FAQ pilotés par l'admin).
  useEffect(() => {
    applySeo({
      settings,
      language,
      view: route === 'site' ? activeTab : 'admin',
    });
  }, [settings, language, activeTab, route]);

  const navigateToEditor = () => {
    window.location.hash = '/admin/editor';
  };

  const navigateAwayFromAdmin = () => {
    if (window.location.pathname.endsWith('/admin') || /\/admin\/editor\/?$/.test(window.location.pathname)) {
      window.history.pushState({}, '', langViewPath(language, activeTab));
    }
    window.location.hash = '';
    setRoute('site');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectParcel = (id: number) => {
    setIsSearchOpen(false);
    setGlobalSelectedParcelId(id);
    setActiveTab('masterplan');
  };

  const handleSelectArticle = (article: BlogArticle) => {
    setIsSearchOpen(false);
    setGlobalActiveArticle(article);
  };

  const handleSelectFaq = (id: string) => {
    setIsSearchOpen(false);
    setActiveTab('home');
    setGlobalActiveFaqId(id);
  };

  // Éditeur visuel dédié : remplace toute l'interface publique
  if (route === 'editor') {
    return (
      <Suspense
        fallback={
          <div className="admin-theme min-h-screen bg-[#0B0B0C] text-white/70 flex items-center justify-center text-micro font-mono uppercase tracking-[0.25em]">
            Chargement de l’éditeur…
          </div>
        }
      >
        <AdminEditorPage
          settings={settings}
          parcels={parcels}
          onBack={() => {
            window.location.hash = '/admin';
          }}
        />
      </Suspense>
    );
  }

  // Page admin dédiée : remplace toute l'interface publique
  if (route === 'admin') {
    return (
      <AdminPage
        settings={settings}
        parcels={parcels}
        onSaveSettings={handleSaveSettings}
        onUpdateParcelStatus={handleUpdateParcelStatus}
        onUpdateParcel={handleUpdateParcel}
        onResetDefaults={handleResetDefaults}
        onBack={navigateAwayFromAdmin}
        onOpenEditor={navigateToEditor}
        loading={!initialSyncDone}
      />
    );
  }

  return (
    <SiteProvider
      value={{
        language,
        settings,
        parcels,
        setActiveTab,
        scrollToSection,
        onOpenBrochure: () => setIsBrochureOpen(true),
        onSelectArticle: (article) => setGlobalActiveArticle(article),
        openFaqId: globalActiveFaqId,
        onClearOpenFaqId: () => setGlobalActiveFaqId(null),
      }}
    >
    <div className="bg-[#FAF9F5] text-primary min-h-screen flex flex-col justify-between selection:bg-secondary-fixed/50 selection:text-primary overflow-x-clip">
      
      {/* Dynamic Floating Navbar */}
      <Navbar
        currentLanguage={language}
        setLanguage={setLanguage}
        // La barre ne connaît que « accueil » et « plan » : les mentions
        // légales sont une page de service, aucun onglet n'y mène.
        activeTab={activeTab === 'legal' ? 'home' : activeTab}
        setActiveTab={setActiveTab}
        scrollToSection={scrollToSection}
        onSearchTrigger={() => setIsSearchOpen(true)}
        onOpenBrochure={() => setIsBrochureOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        settings={settings}
      />

      {/* Main Core Screen Contents Layer */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage />
            </motion.div>
          )}
          {activeTab === 'masterplan' && (
            <motion.div
              key="masterplan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MasterPlanPage
                currentLanguage={language}
                setActiveTab={setActiveTab}
                globalSelectedParcelId={globalSelectedParcelId}
                onClearGlobalSelectParcel={() => setGlobalSelectedParcelId(null)}
                settings={settings}
                parcels={parcels}
              />
            </motion.div>
          )}
          {activeTab === 'legal' && (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LegalNoticePage setActiveTab={setActiveTab} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        currentLanguage={language}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenBrochure={() => setIsBrochureOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* WhatsApp Floating Contact Widget */}
      <WhatsAppFloatingButton
        settings={settings}
        currentLanguage={language}
      />

      {/* Global Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            onClose={() => setIsSearchOpen(false)}
            currentLanguage={language}
            onSelectParcel={handleSelectParcel}
            onSelectArticle={handleSelectArticle}
            onSelectFaq={handleSelectFaq}
            parcels={parcels}
          />
        )}
      </AnimatePresence>

      {/* Global Blog Article Modal */}
      <AnimatePresence>
        {globalActiveArticle && (
          <BlogModal
            article={globalActiveArticle}
            currentLanguage={language}
            onClose={() => setGlobalActiveArticle(null)}
            onActionClick={() => scrollToSection('contact')}
          />
        )}
      </AnimatePresence>

      {/* Official Dun Tni Brochure PDF Modal */}
      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        settings={settings}
        currentLanguage={language}
      />

      {/* Social Sharing Modal (WhatsApp, Facebook, X, LinkedIn, Telegram, e-mail) */}
      <AnimatePresence>
        {isShareOpen && (
          <ShareSiteModal
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
            currentLanguage={language}
            settings={settings}
          />
        )}
      </AnimatePresence>

    </div>
    </SiteProvider>
  );
}
