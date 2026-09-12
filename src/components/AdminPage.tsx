import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save,
  RotateCcw,
  Check,
  Lock,
  LogOut,
  Cloud,
  CloudOff,
  Loader2,
  ArrowLeft,
  XCircle,
  ShieldCheck,
  Calculator,
  MapPin,
  MessageCircle,
  LayoutGrid,
  Inbox,
  Circle,
  Trash2,
  ChevronLeft,
  Sun,
  Moon,
  FileText,
  Eye,
} from 'lucide-react';
import { Lead, SiteSettings, Parcel } from '../types';
import { ADMIN_EMAIL } from '../lib/adminAuth';
import AdminContentTab from './AdminContentTab';
import AdminSectionsTab from './AdminSectionsTab';
import {
  signInAdmin,
  signOutAdmin,
  getAdminSession,
  getSessionEmail,
  onAdminAuthChange,
  isSupabaseConfigured,
  fetchLeads,
  setLeadRead,
  markAllLeadsRead,
  deleteLead,
  subscribeToTableChanges,
  SyncResult,
  SyncFailureReason,
} from '../lib/supabase';

/** Signature de mouvement du site : mass / spring, jamais linear. */
const EASE = [0.32, 0.72, 0, 1] as const;

const inputCls =
  'w-full px-4 py-3 rounded-inner bg-(--admin-input) ring-1 ring-(--admin-ring) text-sm text-(--admin-text) ' +
  'placeholder:text-(--admin-muted-2) focus:outline-none focus:ring-2 focus:ring-(--admin-accent)/60 ' +
  'transition-all duration-400 ease-spring';

const labelCls = 'block font-mono text-caption uppercase tracking-[0.25em] text-(--admin-muted) mb-2';

const primaryBtnCls =
  'group inline-flex items-center gap-2.5 px-6 py-3 rounded-full ' +
  'bg-gradient-to-br from-(--admin-accent) to-(--admin-accent-strong) text-(--admin-accent-text) text-xs font-bold uppercase tracking-widest ' +
  'shadow-[0_8px_30px_rgba(254,214,91,0.15)] hover:shadow-[0_8px_40px_rgba(254,214,91,0.28)] ' +
  'active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer';

/** Raison précise d'un échec de synchronisation, affichée dans le bandeau. */
const SYNC_FAILURE_MESSAGES: Record<SyncFailureReason, string> = {
  'tables-missing':
    'Tables Supabase introuvables — le schéma supabase/schema.sql n\'a pas été exécuté dans le SQL Editor du dashboard.',
  'session-expired':
    'Session expirée — reconnectez-vous dans l\'Espace Gérant pour synchroniser ce changement.',
  unauthorized:
    'Accès refusé par la base (politiques RLS) — reconnectez-vous avec le compte administrateur.',
  offline:
    'Hors-ligne — rétablissez la connexion puis réessayez. Le changement reste enregistré localement.',
  unknown: 'Échec de synchronisation inconnu — vérifiez la configuration Supabase puis réessayez.',
};

/** Enveloppe concentrique pour l'icône des boutons "button-in-button". */
function IslandIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="w-7 h-7 rounded-full bg-(--admin-accent-text)/10 flex items-center justify-center transition-transform duration-400 ease-spring group-hover:translate-x-0.5 group-hover:scale-105">
      {children}
    </span>
  );
}

interface AdminPageProps {
  settings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => Promise<SyncResult>;
  parcels: Parcel[];
  onUpdateParcelStatus: (id: number, status: 'Available' | 'Reserved' | 'Sold') => Promise<SyncResult>;
  onResetDefaults: () => Promise<void>;
  onBack: () => void;
  /** Ouvre l'éditeur visuel Puck (/admin/editor). Absent = bouton masqué. */
  onOpenEditor?: () => void;
  /** Vrai tant que la première synchronisation cloud n'est pas terminée (skeletons KPI). */
  loading?: boolean;
}

type TabId = 'tarifs' | 'parcelles' | 'contact' | 'leads' | 'sections' | 'content';

const TABS: { id: TabId; label: string; short: string; icon: React.ReactNode }[] = [
  { id: 'tarifs', label: 'Tarifs & Échéancier', short: 'Tarifs', icon: <Calculator className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'parcelles', label: 'Statut des Parcelles', short: 'Parcelles', icon: <MapPin className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'contact', label: 'WhatsApp & Promotions', short: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'leads', label: 'Demandes de contact', short: 'Demandes', icon: <Inbox className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'sections', label: 'Sections du site', short: 'Sections', icon: <Eye className="w-4 h-4" strokeWidth={1.5} /> },
  { id: 'content', label: 'Contenu du site', short: 'Contenu', icon: <FileText className="w-4 h-4" strokeWidth={1.5} /> },
];

function KpiCard({
  label,
  value,
  sub,
  accent,
  delay,
  loading,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
  delay: number;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className="h-full p-1.5 rounded-card bg-(--admin-shell) ring-1 ring-(--admin-ring) hover:bg-(--admin-shell-strong) transition-colors duration-400"
    >
      <div className="h-full rounded-inner bg-(--admin-card) p-6 shadow-[var(--admin-inset)]">
        <p className="font-mono text-caption uppercase tracking-[0.25em] text-(--admin-muted)">{label}</p>
        {loading ? (
          /* Squelette : valeur + sous-texte + barre en pulse, sans chiffres prématurés */
          <>
            <div className="mt-4 h-9 w-16 rounded-inner bg-(--admin-shell-strong) animate-pulse" />
            <div className="mt-3 h-2.5 w-2/3 rounded-full bg-(--admin-shell-strong) animate-pulse" />
            {children && <div className="mt-4 h-1 rounded-full bg-(--admin-shell-strong) animate-pulse" />}
          </>
        ) : (
          <>
            <p className={`font-mono text-4xl font-bold mt-3 ${accent}`}>{value}</p>
            <p className="text-caption text-(--admin-muted) mt-2">{sub}</p>
            {children}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function AdminPage({
  settings,
  onSaveSettings,
  parcels,
  onUpdateParcelStatus,
  onResetDefaults,
  onBack,
  onOpenEditor,
  loading = false,
}: AdminPageProps) {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<TabId>('tarifs');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [syncState, setSyncState] = useState<'idle' | 'saving' | 'cloud' | 'local'>('idle');
  const [syncReason, setSyncReason] = useState<SyncFailureReason | null>(null);
  // Filtre par statut dans l'onglet « Statut des Parcelles »
  const [parcelFilter, setParcelFilter] = useState<'All' | Parcel['status']>('All');

  // --- Sauvegarde automatique (débounce) ----------------------------------
  // Toute modification du formulaire est persistée dans Supabase puis
  // répercutée sur le site (état partagé + temps réel), sans clic sur
  // « Enregistrer ». lastSavedRef contient le JSON des dernières valeurs
  // persistées : il évite les boucles (realtime, resynchronisation externe).
  const lastSavedRef = useRef<string>(JSON.stringify(settings));
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Vrai pendant l'appel à onSaveSettings — distingue « notre » setSettings d'un changement externe. */
  const ownSaveRef = useRef(false);
  /** Dernier état réellement persisté avec succès — référence de l'état « propre ». */
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(() => ({ ...settings }));
  /** Horodatage de la dernière persistance cloud réussie. */
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // Demandes de contact (table leads) — null tant que non chargées
  const [leads, setLeads] = useState<Lead[] | null>(null);

  // Sidebar desktop repliable (préférence persistée)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sic_admin_sidebar_collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sic_admin_sidebar_collapsed', next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Thème clair/sombre (préférence persistée, sombre par défaut)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return localStorage.getItem('sic_admin_theme') === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('sic_admin_theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Supabase Auth — accès réservé à l'administrateur
  const [authState, setAuthState] = useState<'loading' | 'signedOut' | 'signedIn'>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Garde le formulaire synchronisé avec les données (fetch cloud au montage, reset,
  // changements temps réel venant d'un autre appareil…). La mise à jour de
  // lastSavedRef évite de ré-enregistrer ce que l'on vient de recevoir.
  useEffect(() => {
    setFormData({ ...settings });
    lastSavedRef.current = JSON.stringify(settings);
    // Changement externe (fetch initial, temps réel d'un autre appareil, reset) :
    // il devient la nouvelle référence « propre ». Si le changement vient de
    // notre propre sauvegarde en cours, on attend le résultat (succès →
    // setSavedSettings(snapshot) ; échec → les badges « Non sauvegardé » restent).
    if (!ownSaveRef.current) setSavedSettings({ ...settings });
  }, [settings]);

  // Sauvegarde automatique débouncée : 900 ms après la dernière frappe, on
  // persiste le formulaire dans le cloud. Le timer survit aux re-rendus
  // (pas de cleanup qui l'annule) ; il n'est réarmé que par une nouvelle
  // modification ou démonté avec le composant.
  useEffect(() => {
    const current = JSON.stringify(formData);
    if (current === lastSavedRef.current) return;
    lastSavedRef.current = current;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const snapshot = formData;
    saveTimerRef.current = setTimeout(async () => {
      saveTimerRef.current = null;
      setSyncState('saving');
      setSyncReason(null);
      ownSaveRef.current = true;
      const result = await onSaveSettings(snapshot);
      ownSaveRef.current = false;
      setSyncState(result.ok ? 'cloud' : 'local');
      setSyncReason(result.ok ? null : (result.reason ?? 'unknown'));
      if (result.ok) {
        setLastSyncedAt(Date.now());
        setSavedSettings(snapshot);
      }
      setTimeout(() => {
        setSyncState('idle');
        setSyncReason(null);
      }, 6000);
    }, 900);
  }, [formData, onSaveSettings]);

  // Nettoyage du timer au démontage de la page admin
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    getAdminSession().then(async (ok) => {
      if (!mounted) return;
      if (!ok) {
        setAuthState('signedOut');
        return;
      }
      // Session existante : vérifier que c'est bien l'administrateur
      const sessionEmail = await getSessionEmail();
      if (sessionEmail !== ADMIN_EMAIL) {
        await signOutAdmin();
        if (mounted) {
          setAuthState('signedOut');
          setAuthError("Accès refusé : cet espace est réservé à l'administrateur.");
        }
        return;
      }
      if (mounted) setAuthState('signedIn');
    });
    const unsubscribe = onAdminAuthChange(async (isAuth) => {
      if (!mounted) return;
      if (isAuth) {
        const sessionEmail = await getSessionEmail();
        if (sessionEmail !== ADMIN_EMAIL) {
          await signOutAdmin();
          if (mounted) {
            setAuthState('signedOut');
            setAuthError("Accès refusé : cet espace est réservé à l'administrateur.");
          }
          return;
        }
        setAuthState('signedIn');
      } else {
        setAuthState('signedOut');
      }
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Charge les demandes de contact + abonnement temps réel (réservé à l'admin)
  useEffect(() => {
    if (authState !== 'signedIn') return;
    let mounted = true;
    const refresh = () => {
      fetchLeads().then((data) => {
        if (!mounted) return;
        // data null = erreur (table absente ou hors-ligne) → on affiche l'état vide
        setLeads(data ?? []);
      });
    };
    refresh();
    const unsubscribe = subscribeToTableChanges('leads', refresh);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authState]);

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
    // Vérifier que l'email correspond bien à l'administrateur
    const sessionEmail = await getSessionEmail();
    if (sessionEmail !== ADMIN_EMAIL) {
      await signOutAdmin();
      setAuthState('signedOut');
      setAuthError("Accès refusé : cet espace est réservé à l'administrateur.");
      return;
    }
    setAuthState('signedIn');
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setPassword('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncState('saving');
    setSyncReason(null);
    ownSaveRef.current = true;
    const result = await onSaveSettings(formData);
    ownSaveRef.current = false;
    setSyncState(result.ok ? 'cloud' : 'local');
    setSyncReason(result.ok ? null : (result.reason ?? 'unknown'));
    if (result.ok) {
      setLastSyncedAt(Date.now());
      setSavedSettings(formData);
    }
    setSavedSuccess(result.ok);
    setTimeout(() => {
      setSavedSuccess(false);
      setSyncState('idle');
      setSyncReason(null);
    }, 6000);
  };

  const handleStatusChange = async (id: number, status: 'Available' | 'Reserved' | 'Sold') => {
    setSyncState('saving');
    setSyncReason(null);
    const result = await onUpdateParcelStatus(id, status);
    setSyncState(result.ok ? 'cloud' : 'local');
    setSyncReason(result.ok ? null : (result.reason ?? 'unknown'));
    setTimeout(() => {
      setSyncState('idle');
      setSyncReason(null);
    }, 6000);
  };

  const handleReset = async () => {
    setSyncState('saving');
    await onResetDefaults();
    setSyncState('idle');
  };

  const unreadCount = leads ? leads.filter((l) => !l.is_read).length : 0;

  const handleMarkLeadRead = async (id: number, isRead: boolean) => {
    await setLeadRead(id, isRead);
    setLeads((prev) => (prev ? prev.map((l) => (l.id === id ? { ...l, is_read: isRead } : l)) : prev));
  };

  const handleMarkAllRead = async () => {
    await markAllLeadsRead();
    setLeads((prev) => (prev ? prev.map((l) => ({ ...l, is_read: true })) : prev));
  };

  const handleDeleteLead = async (id: number) => {
    await deleteLead(id);
    setLeads((prev) => (prev ? prev.filter((l) => l.id !== id) : prev));
  };

  // KPIs du bento
  const available = parcels.filter((p) => p.status === 'Available').length;
  const reserved = parcels.filter((p) => p.status === 'Reserved').length;
  const sold = parcels.filter((p) => p.status === 'Sold').length;
  const promoAvailable = parcels.filter((p) => p.isPromo && p.status === 'Available').length;
  const pctAvailable = Math.round((available / Math.max(parcels.length, 1)) * 100);

  // Liste affichée dans l'onglet Parcelles (filtrée par statut)
  const filteredParcels = parcels.filter((p) => parcelFilter === 'All' || p.status === parcelFilter);

  const statusSelectCls = (status: Parcel['status']) =>
    `appearance-none text-xs font-bold px-3 py-2 rounded-inner border cursor-pointer transition-all duration-400 ease-spring focus:outline-none ${
      status === 'Available'
        ? 'bg-(--admin-green)/10 text-(--admin-green) border-(--admin-green)/30 hover:border-(--admin-green)/60'
        : status === 'Reserved'
        ? 'bg-(--admin-amber)/10 text-(--admin-amber) border-(--admin-amber)/30 hover:border-(--admin-amber)/60'
        : 'bg-(--admin-rose)/10 text-(--admin-rose) border-(--admin-rose)/30 hover:border-(--admin-rose)/60'
    }`;

  return (
    <div
      className={`admin-theme ${theme === 'light' ? 'admin-theme-light' : ''} min-h-screen bg-(--admin-bg) text-(--admin-text) font-sans overflow-x-clip`}
    >
      {/* Texture de fond : halos émeraude/or (palette marque) + grain subtil */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.13),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(254,214,91,0.07),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Header — îlot de verre flottant (masqué sur desktop une fois connecté : la sidebar prend le relais) */}
      <header className={`${authState === 'signedIn' ? 'lg:hidden' : ''} sticky top-0 z-40 px-4 pt-4 sm:pt-6`}>
        <div className="max-w-6xl mx-auto rounded-full bg-(--admin-glass) backdrop-blur-2xl ring-1 ring-(--admin-ring) px-3 sm:px-5 py-3 flex items-center justify-between gap-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#fed65b] to-[#FED65B] flex items-center justify-center text-[#241a00] font-serif font-bold text-sm shadow-[0_0_20px_rgba(254,214,91,0.35)]">
              SIC
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-base sm:text-lg font-bold text-(--admin-text) leading-tight truncate">
                Espace Gérant
              </h1>
              <p className="font-mono text-micro sm:text-caption uppercase tracking-[0.25em] text-(--admin-muted) truncate">
                Sénégal Immobilier Consulting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {authState === 'signedIn' && (
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-(--admin-green)/10 ring-1 ring-(--admin-green)/20 text-caption font-mono uppercase tracking-widest text-(--admin-green)">
                <span className="w-1.5 h-1.5 rounded-full bg-(--admin-green) animate-pulse" />
                Connecté
              </span>
            )}
            {onOpenEditor && authState === 'signedIn' && (
              <button
                onClick={onOpenEditor}
                title="Ouvrir l'éditeur visuel"
                className="p-2.5 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.95] transition-all duration-400 ease-spring cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={onBack}
              className="group inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-xs font-bold uppercase tracking-widest text-(--admin-text) hover:bg-(--admin-shell-hover) active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer"
            >
              <IslandIcon>
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
              </IslandIcon>
              <span className="hidden sm:inline">Retour au site</span>
            </button>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
              className="p-2.5 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.95] transition-all duration-400 ease-spring cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <Moon className="w-4 h-4" strokeWidth={1.5} />
              )}
            </button>
            {authState === 'signedIn' && (
              <button
                onClick={handleLogout}
                title="Se déconnecter"
                className="p-2.5 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-(--admin-text-2) hover:text-(--admin-rose) hover:bg-(--admin-rose)/10 hover:ring-rose-400/30 active:scale-[0.95] transition-all duration-400 ease-spring cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar (desktop) — navigation principale, îlot de verre flottant */}
      {authState === 'signedIn' && (
        <aside
          className={`hidden lg:flex fixed top-4 bottom-4 left-4 flex-col rounded-card bg-(--admin-glass) backdrop-blur-2xl ring-1 ring-(--admin-ring) shadow-[0_12px_40px_rgba(0,0,0,0.45)] p-5 z-40 transition-[width] duration-400 ease-spring ${
            sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Bouton de repli — flottant sur l'arête droite de la sidebar */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Déplier la sidebar' : 'Replier la sidebar'}
            className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-(--admin-toggle) ring-1 ring-white/15 text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/50 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)] active:scale-95 transition-all duration-400 ease-spring cursor-pointer"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform duration-400 ease-spring ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`}
              strokeWidth={1.5}
            />
          </button>

          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#fed65b] to-[#FED65B] flex items-center justify-center text-[#241a00] font-serif font-bold text-sm shadow-[0_0_20px_rgba(254,214,91,0.35)]">
              SIC
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="font-serif text-base font-bold text-(--admin-text) leading-tight truncate">Espace Gérant</p>
                <p className="font-mono text-micro uppercase tracking-[0.25em] text-(--admin-muted) truncate">
                  Sénégal Immobilier Consulting
                </p>
              </div>
            )}
          </div>

          <nav className={`mt-8 space-y-1 flex-1 ${sidebarCollapsed ? 'space-y-2' : ''}`}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-card text-xs font-bold uppercase tracking-widest transition-all duration-400 ease-spring cursor-pointer ${
                    sidebarCollapsed ? 'justify-center px-0' : ''
                  } ${
                    active
                      ? 'bg-(--admin-shell-strong) ring-1 ring-(--admin-accent)/40 text-(--admin-accent) shadow-[0_0_24px_rgba(254,214,91,0.08)]'
                      : 'text-(--admin-muted) hover:text-(--admin-text) hover:bg-(--admin-shell-strong)'
                  }`}
                >
                  {tab.icon}
                  {!sidebarCollapsed && <span>{tab.label}</span>}
                  {tab.id === 'leads' && unreadCount > 0 && (
                    <span
                      className={`w-5 h-5 rounded-full bg-rose-500 text-white text-micro font-bold flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.5)] ${
                        sidebarCollapsed ? '' : 'ml-auto'
                      }`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="space-y-2.5 pt-5 border-t border-(--admin-hairline)">
            <div
              className={`flex items-center gap-2 px-2 text-caption font-mono uppercase tracking-widest ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
              title={isSupabaseConfigured ? 'Cloud • temps réel' : 'Mode local'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSupabaseConfigured ? 'bg-(--admin-green) animate-pulse' : 'bg-(--admin-muted-2)'
                }`}
              />
              {!sidebarCollapsed && (
                <span className={isSupabaseConfigured ? 'text-(--admin-green)' : 'text-(--admin-muted)'}>
                  {isSupabaseConfigured ? 'Cloud • temps réel' : 'Mode local'}
                </span>
              )}
            </div>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
              className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full text-caption font-mono uppercase tracking-widest text-(--admin-muted) hover:text-(--admin-accent) hover:bg-(--admin-shell-strong) transition-all duration-400 ease-spring cursor-pointer ${
                sidebarCollapsed ? 'px-0' : ''
              }`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              ) : (
                <Moon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              )}
              {!sidebarCollapsed && <span>Thème {theme === 'dark' ? 'clair' : 'sombre'}</span>}
            </button>
            {onOpenEditor && (
              <button
                onClick={onOpenEditor}
                title="Éditeur visuel"
                className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-accent)/40 text-caption font-mono uppercase tracking-widest text-(--admin-accent) hover:bg-(--admin-shell-hover) active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer ${
                  sidebarCollapsed ? 'px-0' : ''
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                {!sidebarCollapsed && <span>Éditeur visuel</span>}
              </button>
            )}
            <button
              onClick={onBack}
              title="Retour au site"
              className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-caption font-mono uppercase tracking-widest text-(--admin-text) hover:bg-(--admin-shell-hover) active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer ${
                sidebarCollapsed ? 'px-0' : ''
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              {!sidebarCollapsed && <span>Retour au site</span>}
            </button>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full text-caption font-mono uppercase tracking-widest text-(--admin-muted) hover:text-(--admin-rose) hover:bg-(--admin-rose)/10 transition-all duration-400 ease-spring cursor-pointer ${
                sidebarCollapsed ? 'px-0' : ''
              }`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
              {!sidebarCollapsed && <span>Se déconnecter</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Chargement */}
      {authState === 'loading' && (
        <main className="min-h-[80dvh] flex flex-col items-center justify-center gap-4 text-(--admin-muted)">
          <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
          <span className="font-mono text-caption uppercase tracking-[0.25em]">Vérification…</span>
        </main>
      )}

      {/* Non connecté — carte de connexion premium (aucun détail admin révélé) */}
      {authState === 'signedOut' && (
        <main className="min-h-[calc(100dvh-96px)] flex items-center justify-center px-4 py-section">
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: EASE }}
            className="w-full max-w-md p-1.5 rounded-card bg-(--admin-shell) ring-1 ring-(--admin-ring)"
          >
            <div className="rounded-inner bg-(--admin-card) shadow-[var(--admin-inset)] p-8 sm:p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-card bg-gradient-to-br from-[#fed65b] to-[#FED65B] flex items-center justify-center text-[#241a00] shadow-[0_0_24px_rgba(254,214,91,0.3)]">
                  <Lock className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/80">
                    Accès restreint
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-(--admin-text)">Espace Gérant</h2>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className={labelCls}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    placeholder="votre@email.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className={labelCls}>Mot de passe</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>

                <AnimatePresence>
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="p-3.5 rounded-inner bg-(--admin-rose)/10 ring-1 ring-(--admin-rose)/30 text-(--admin-rose) text-xs flex items-center space-x-2.5"
                    >
                      <XCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <span>{authError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className={`${primaryBtnCls} w-full justify-center disabled:opacity-60`}
                >
                  {authSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>{authSubmitting ? 'Connexion…' : 'Se connecter'}</span>
                </button>
              </form>
            </div>
          </motion.div>
        </main>
      )}

      {/* Connecté — tableau de bord premium */}
      {authState === 'signedIn' && (
        <main
          className={`px-4 sm:px-6 pt-6 sm:pt-10 pb-32 lg:pb-20 transition-[padding] duration-400 ease-spring ${
            sidebarCollapsed ? 'lg:pl-32' : 'lg:pl-80'
          }`}
        >
          <div className="max-w-6xl mx-auto space-y-8">
          {/* Bento KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <div className="sm:col-span-2 lg:col-span-5">
              <KpiCard
                label="Disponibles"
                value={`${available}`}
                sub={`/ ${parcels.length} parcelles du plan cadastral`}
                accent="text-(--admin-green)"
                delay={0}
                loading={loading}
              >
                <div className="mt-4 h-1 rounded-full bg-(--admin-shell-strong) overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: pctAvailable / 100 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: EASE }}
                    className="h-full origin-left rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                  />
                </div>
              </KpiCard>
            </div>
            <div className="lg:col-span-3">
              <KpiCard
                label="Réservées"
                value={`${reserved}`}
                sub="Apport versé, dossier en cours"
                accent="text-(--admin-amber)"
                delay={0.08}
                loading={loading}
              />
            </div>
            <div className="lg:col-span-4">
              <KpiCard
                label="Vendues"
                value={`${sold}`}
                sub="Mutation finalisée"
                accent="text-(--admin-rose)"
                delay={0.16}
                loading={loading}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <KpiCard
                label="Offre lancement"
                value={`${promoAvailable}`}
                sub="sur 10 parcelles en promotion"
                accent="text-(--admin-accent)"
                delay={0.24}
                loading={loading}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-7">
              <KpiCard
                label="Synchronisation"
                value={isSupabaseConfigured ? 'Cloud' : 'Local'}
                sub={
                  isSupabaseConfigured
                    ? 'Temps réel actif — les changements apparaissent sur le site sans rechargement'
                    : 'Variables Supabase absentes — sauvegarde locale uniquement'
                }
                accent={isSupabaseConfigured ? 'text-(--admin-green)' : 'text-(--admin-text-2)'}
                delay={0.32}
                loading={loading}
              >
                <div className="mt-4 flex items-center gap-2 text-caption font-mono uppercase tracking-widest">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseConfigured ? 'bg-(--admin-green) animate-pulse' : 'bg-(--admin-muted-2)'
                    }`}
                  />
                  <span className={isSupabaseConfigured ? 'text-(--admin-green)' : 'text-(--admin-muted)'}>
                    {isSupabaseConfigured ? 'postgres_changes abonné' : 'hors ligne'}
                  </span>
                </div>
              </KpiCard>
            </div>
          </div>

          {/* Workspace — double-bezel */}
          <motion.div
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="p-1.5 sm:p-2 rounded-card bg-(--admin-shell) ring-1 ring-(--admin-ring)"
          >
            <div className="rounded-inner bg-(--admin-card) shadow-[var(--admin-inset)] overflow-hidden">
              <div>
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="px-5 sm:px-8 py-8 sm:py-10">
                    {/* Feedback de synchronisation */}
                    <AnimatePresence>
                      {syncState !== 'idle' && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className={`mb-6 p-3.5 rounded-card ring-1 flex items-center gap-3 text-xs ${
                            syncState === 'saving'
                              ? 'bg-(--admin-sky)/10 ring-(--admin-sky)/30 text-(--admin-sky)'
                              : syncState === 'cloud'
                              ? 'bg-(--admin-green)/10 ring-(--admin-green)/30 text-(--admin-green)'
                              : 'bg-(--admin-amber)/10 ring-(--admin-amber)/30 text-(--admin-amber)'
                          }`}
                        >
                          {syncState === 'saving' ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} />
                          ) : syncState === 'cloud' ? (
                            <Cloud className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                          ) : (
                            <CloudOff className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold">
                              {syncState === 'saving'
                                ? 'Synchronisation avec le cloud…'
                                : syncState === 'cloud'
                                ? 'Synchronisé — visible par tous les visiteurs, en temps réel.'
                                : 'Enregistré en local uniquement — les visiteurs ne verront pas ce changement.'}
                            </span>
                            {syncState === 'local' && (
                              <span className="block mt-1 text-caption font-normal opacity-85">
                                {SYNC_FAILURE_MESSAGES[syncReason ?? 'unknown']}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {savedSuccess && (
                      <div className="mb-6 p-3.5 rounded-card bg-(--admin-green)/10 ring-1 ring-(--admin-green)/30 text-(--admin-green) text-xs flex items-center gap-3">
                        <Check className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span className="font-semibold">
                          Modifications appliquées au site immédiatement.
                        </span>
                      </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.4, ease: EASE }}
                        >
                          {activeTab === 'tarifs' && (
                            <div className="space-y-8">
                              <div>
                                <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70 mb-6">
                                  Grille de financement
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  {(
                                    [
                                      ['basePrice', 'Prix de référence échelonné (€)', '15 000 € (3 000 € + 40 × 300 €)'],
                                      ['cashPrice', 'Prix paiement comptant (€)', '13 500 € (économie de 1 500 €)'],
                                      ['defaultDeposit', "Montant de l'acompte par défaut (€)", '3 000 €'],
                                      ['defaultMonthly', 'Mensualité par défaut (€/mois)', '300 €/mois'],
                                      ['defaultDurationMonths', "Durée d'échelonnement par défaut (mois)", '40 mois'],
                                    ] as [keyof SiteSettings, string, string][]
                                  ).map(([field, label, hint]) => (
                                    <div key={field}>
                                      <label className={labelCls}>{label}</label>
                                      <input
                                        type="number"
                                        value={formData[field] as number}
                                        onChange={(e) =>
                                          setFormData({ ...formData, [field]: Number(e.target.value) })
                                        }
                                        className={`${inputCls} font-mono`}
                                      />
                                      <p className="text-caption text-(--admin-muted-2) mt-1.5">{hint}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="p-5 rounded-card bg-(--admin-shell-soft) ring-1 ring-(--admin-ring-soft) border-l-2 border-l-(--admin-accent)/60">
                                <p className="font-mono text-caption uppercase tracking-[0.25em] text-(--admin-accent)/80 mb-2">
                                  Rappel — stratégie commerciale
                                </p>
                                <p className="text-xs text-(--admin-text-2) leading-relaxed">
                                  • 20 parcelles financées à 15 000 € → 60 000 € d'acomptes + 6 000 €/mois × 40 mois = 300 000 €.
                                  <br />
                                  • 20 parcelles comptant à 13 500 € → 270 000 € immédiatement.
                                </p>
                              </div>
                            </div>
                          )}

                          {activeTab === 'parcelles' && (
                            <div className="space-y-5">
                              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-(--admin-hairline)">
                                <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
                                  Statuts en 1 clic
                                </p>
                                <span className="font-mono text-caption uppercase tracking-widest text-(--admin-muted)">
                                  {filteredParcels.length} / {parcels.length} parcelles
                                </span>
                              </div>
                              {/* Filtres par statut */}
                              <div className="flex flex-wrap items-center gap-2">
                                {(['All', 'Available', 'Reserved', 'Sold'] as const).map((s) => {
                                  const count =
                                    s === 'All' ? parcels.length : parcels.filter((p) => p.status === s).length;
                                  const isActive = parcelFilter === s;
                                  const label =
                                    s === 'All'
                                      ? 'Toutes'
                                      : s === 'Available'
                                      ? 'Disponibles'
                                      : s === 'Reserved'
                                      ? 'Réservées'
                                      : 'Vendues';
                                  const pillCls = isActive
                                    ? s === 'Available'
                                      ? 'bg-(--admin-green)/15 text-(--admin-green) ring-(--admin-green)/50'
                                      : s === 'Reserved'
                                      ? 'bg-(--admin-amber)/15 text-(--admin-amber) ring-(--admin-amber)/50'
                                      : s === 'Sold'
                                      ? 'bg-(--admin-rose)/15 text-(--admin-rose) ring-(--admin-rose)/50'
                                      : 'bg-(--admin-shell-strong) text-(--admin-text) ring-(--admin-ring)'
                                    : 'text-(--admin-muted) hover:text-(--admin-text-2) ring-(--admin-ring-soft) hover:bg-(--admin-shell)';
                                  return (
                                    <button
                                      key={s}
                                      onClick={() => setParcelFilter(s)}
                                      className={`px-3 py-1.5 rounded-full text-caption font-mono uppercase tracking-wider ring-1 transition-all duration-400 ease-spring cursor-pointer flex items-center gap-1.5 ${pillCls}`}
                                    >
                                      {s !== 'All' && (
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            s === 'Available'
                                              ? 'bg-(--admin-green)'
                                              : s === 'Reserved'
                                              ? 'bg-(--admin-amber)'
                                              : 'bg-(--admin-rose)'
                                          }`}
                                        />
                                      )}
                                      {label} ({count})
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60dvh] overflow-y-auto pr-1">
                                {filteredParcels.map((parcel) => (
                                  <div
                                    key={parcel.id}
                                    className="p-4 rounded-card bg-(--admin-shell-soft) ring-1 ring-(--admin-ring-soft) flex items-center justify-between gap-3 hover:bg-(--admin-shell) transition-colors duration-400"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-micro bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) flex items-center justify-center font-mono text-caption text-(--admin-text-2)">
                                          <LayoutGrid className="w-3 h-3" strokeWidth={1.5} />
                                        </span>
                                        <span className="font-serif font-bold text-sm text-(--admin-text)">
                                          Parcelle #{parcel.id}
                                        </span>
                                        {parcel.isPromo && (
                                          <span className="px-2 py-0.5 rounded-full bg-(--admin-accent)/10 ring-1 ring-(--admin-accent)/40 text-(--admin-accent) text-micro font-mono uppercase tracking-widest">
                                            Promo
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-caption text-(--admin-muted) mt-1 font-mono">150 m²</p>
                                    </div>

                                    <select
                                      value={parcel.status}
                                      onChange={(e) =>
                                        handleStatusChange(parcel.id, e.target.value as Parcel['status'])
                                      }
                                      className={statusSelectCls(parcel.status)}
                                    >
                                      <option value="Available" className="bg-(--admin-card) text-(--admin-green)">
                                        🟢 Disponible
                                      </option>
                                      <option value="Reserved" className="bg-(--admin-card) text-(--admin-amber)">
                                        🟠 Réservée
                                      </option>
                                      <option value="Sold" className="bg-(--admin-card) text-(--admin-rose)">
                                        🔴 Vendue
                                      </option>
                                    </select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeTab === 'contact' && (
                            <div className="space-y-8">
                              <div>
                                <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70 mb-6">
                                  Coordonnées & canaux
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <label className={labelCls}>Numéro WhatsApp (affichage)</label>
                                    <input
                                      type="text"
                                      value={formData.whatsappNumber}
                                      onChange={(e) =>
                                        setFormData({ ...formData, whatsappNumber: e.target.value })
                                      }
                                      className={inputCls}
                                      placeholder="+33 7 61 23 55 09"
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>
                                      Numéro international wa.me (sans espaces ni +)
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.whatsappCleanNumber}
                                      onChange={(e) =>
                                        setFormData({
                                          ...formData,
                                          whatsappCleanNumber: e.target.value.replace(/\D/g, ''),
                                        })
                                      }
                                      className={`${inputCls} font-mono`}
                                      placeholder="33761235509"
                                    />
                                    <p className="text-caption text-(--admin-muted-2) mt-1.5">
                                      Exemple : 33761235509 (indicatif sans le +, suivi du numéro)
                                    </p>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Email de contact</label>
                                    <input
                                      type="email"
                                      value={formData.contactEmail}
                                      onChange={(e) =>
                                        setFormData({ ...formData, contactEmail: e.target.value })
                                      }
                                      className={inputCls}
                                      placeholder="globalequalite@gmail.com"
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>Adresse / Bureau au Sénégal</label>
                                    <input
                                      type="text"
                                      value={formData.contactAddress || ''}
                                      onChange={(e) =>
                                        setFormData({ ...formData, contactAddress: e.target.value })
                                      }
                                      className={inputCls}
                                      placeholder="Dakar, Rufisque — Keury Kao"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70 mb-6">
                                  Promotion lancement
                                </p>
                                <div className="space-y-5">
                                  <div>
                                    <label className={labelCls}>
                                      Titre de la promotion (10 premières parcelles)
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.promoTitle}
                                      onChange={(e) =>
                                        setFormData({ ...formData, promoTitle: e.target.value })
                                      }
                                      className={inputCls}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>
                                      Titre de la promotion — anglais
                                    </label>
                                    <input
                                      type="text"
                                      value={formData.promoTitleEn || ''}
                                      onChange={(e) =>
                                        setFormData({ ...formData, promoTitleEn: e.target.value })
                                      }
                                      className={inputCls}
                                      placeholder="Diaspora Launch Offer: First 10 Plots"
                                    />
                                    <p className="text-caption text-(--admin-muted-2) mt-1.5">
                                      Affiché aux visiteurs anglophones. Laissé vide : le texte anglais
                                      par défaut du site est utilisé.
                                    </p>
                                  </div>
                                  <div>
                                    <label className={labelCls}>Détail de l'offre promotionnelle</label>
                                    <textarea
                                      rows={2}
                                      value={formData.promoDesc}
                                      onChange={(e) =>
                                        setFormData({ ...formData, promoDesc: e.target.value })
                                      }
                                      className={`${inputCls} resize-none`}
                                    />
                                  </div>
                                  <div>
                                    <label className={labelCls}>
                                      Détail de l'offre — anglais
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={formData.promoDescEn || ''}
                                      onChange={(e) =>
                                        setFormData({ ...formData, promoDescEn: e.target.value })
                                      }
                                      className={`${inputCls} resize-none`}
                                      placeholder="Exclusive benefit reserved for the first 10 buyers…"
                                    />
                                  </div>
                                  <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      id="promoActive"
                                      checked={formData.promoActive}
                                      onChange={(e) =>
                                        setFormData({ ...formData, promoActive: e.target.checked })
                                      }
                                      className="w-4 h-4 accent-[#fed65b] cursor-pointer"
                                    />
                                    <span className="text-xs text-(--admin-text-2) group-hover:text-(--admin-text) transition-colors duration-400">
                                      Activer la bannière promotionnelle des 10 premiers acquéreurs
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === 'sections' && (
                            <AdminSectionsTab
                              settings={formData}
                              onChange={(patch) => setFormData({ ...formData, ...patch })}
                              onOpenEditor={onOpenEditor}
                            />
                          )}

                          {activeTab === 'content' && (
                            <div className="space-y-5">
                              <div className="pb-2 border-b border-(--admin-hairline)">
                                <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
                                  Contenu du site
                                </p>
                                <p className="text-caption text-(--admin-muted) mt-1">
                                  Identité, vidéos, échéancier, connectivité, packs, témoignages, FAQ, blog — sauvegarde automatique et diffusion en temps réel sur le site.
                                </p>
                              </div>
                              <AdminContentTab
                                settings={formData}
                                onChange={(patch) => setFormData({ ...formData, ...patch })}
                                savedContent={savedSettings.content ?? null}
                                lastSyncedAt={lastSyncedAt}
                                isSyncing={syncState === 'saving'}
                              />
                            </div>
                          )}

                          {activeTab === 'leads' && (
                            <div className="space-y-5">
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-(--admin-hairline)">
                                <div>
                                  <p className="font-mono text-caption uppercase tracking-[0.3em] text-(--admin-accent)/70">
                                    Demandes de contact
                                  </p>
                                  <p className="text-caption text-(--admin-muted) mt-1">
                                    {leads
                                      ? `${leads.length} demande(s) — ${unreadCount} non lue(s)`
                                      : 'Chargement…'}
                                  </p>
                                </div>
                                {leads && unreadCount > 0 && (
                                  <button
                                    onClick={handleMarkAllRead}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-caption font-mono uppercase tracking-widest text-(--admin-text-2) hover:text-(--admin-accent) hover:ring-(--admin-accent)/40 active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" strokeWidth={1.5} />
                                    Tout marquer lu
                                  </button>
                                )}
                              </div>

                              {leads === null ? (
                                <div className="py-section flex flex-col items-center gap-3 text-(--admin-muted)">
                                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                                  <span className="font-mono text-caption uppercase tracking-widest">
                                    Chargement des demandes…
                                  </span>
                                </div>
                              ) : leads.length === 0 ? (
                                <div className="py-section flex flex-col items-center gap-3 text-(--admin-muted-2)">
                                  <Inbox className="w-8 h-8" strokeWidth={1.5} />
                                  <span className="font-mono text-caption uppercase tracking-widest">
                                    Aucune demande pour le moment
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-3 max-h-[60dvh] overflow-y-auto pr-1">
                                  {leads.map((lead) => (
                                    <div
                                      key={lead.id}
                                      className={`p-4 rounded-card ring-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors duration-400 ${
                                        lead.is_read
                                          ? 'bg-(--admin-shell-soft) ring-(--admin-ring-soft)'
                                          : 'bg-(--admin-accent)/5 ring-(--admin-accent)/25'
                                      }`}
                                    >
                                      <div className="min-w-0 space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="font-serif font-bold text-sm text-(--admin-text)">
                                            {lead.name}
                                          </span>
                                          {!lead.is_read && (
                                            <span className="px-2 py-0.5 rounded-full bg-(--admin-rose)/15 ring-1 ring-(--admin-rose)/40 text-(--admin-rose) text-micro font-mono uppercase tracking-widest">
                                              Nouvelle
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-caption font-mono text-(--admin-text-2)">
                                          {lead.phone && <span>{lead.phone}</span>}
                                          {lead.email && <span>{lead.email}</span>}
                                          {lead.interest && (
                                            <span className="text-(--admin-accent)/80">{lead.interest}</span>
                                          )}
                                        </div>
                                        {lead.message && (
                                          <p className="text-xs text-(--admin-text-2) leading-relaxed">
                                            {lead.message}
                                          </p>
                                        )}
                                        <p className="text-caption text-(--admin-muted-2) font-mono">
                                          {new Date(lead.created_at).toLocaleString('fr-FR', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {lead.phone && (
                                          <a
                                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                              'Bonjour, je vous contacte depuis Sénégal Immobilier Consulting.'
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Répondre sur WhatsApp"
                                            className="p-2 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-(--admin-green) hover:bg-(--admin-green)/10 hover:ring-(--admin-green)/40 transition-all duration-400 cursor-pointer"
                                          >
                                            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                          </a>
                                        )}
                                        <button
                                          onClick={() => handleMarkLeadRead(lead.id, !lead.is_read)}
                                          title={lead.is_read ? 'Marquer comme non lue' : 'Marquer comme lue'}
                                          className={`p-2 rounded-full ring-1 transition-all duration-400 cursor-pointer ${
                                            lead.is_read
                                              ? 'bg-(--admin-shell-strong) ring-(--admin-ring) text-(--admin-muted) hover:text-(--admin-accent)'
                                              : 'bg-(--admin-accent)/10 ring-(--admin-accent)/40 text-(--admin-accent)'
                                          }`}
                                        >
                                          {lead.is_read ? (
                                            <Circle className="w-3.5 h-3.5" strokeWidth={1.5} />
                                          ) : (
                                            <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLead(lead.id)}
                                          title="Supprimer"
                                          className="p-2 rounded-full bg-(--admin-shell-strong) ring-1 ring-(--admin-ring) text-(--admin-muted) hover:text-(--admin-rose) hover:bg-(--admin-rose)/10 hover:ring-(--admin-rose)/40 transition-all duration-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Pied du workspace */}
                      <div className="pt-6 border-t border-(--admin-hairline) flex flex-col sm:flex-row justify-between items-center gap-4">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="inline-flex items-center gap-2 text-caption font-mono uppercase tracking-widest text-(--admin-muted) hover:text-(--admin-rose) transition-colors duration-400 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                          Rétablir les valeurs par défaut
                        </button>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={onBack}
                            className="px-5 py-2.5 rounded-full bg-(--admin-shell) ring-1 ring-(--admin-ring) text-caption font-mono uppercase tracking-widest text-(--admin-text-2) hover:text-(--admin-text) hover:bg-(--admin-shell-hover) active:scale-[0.98] transition-all duration-400 ease-spring cursor-pointer"
                          >
                            Retour
                          </button>
                          <button type="submit" className={primaryBtnCls}>
                            <span>Enregistrer</span>
                            <IslandIcon>
                              <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </IslandIcon>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

            <p className="text-center font-mono text-caption uppercase tracking-[0.3em] text-(--admin-muted-2) flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
              Espace réservé — modifications synchronisées en temps réel
            </p>
          </div>

          {/* Bottom nav (mobile) — îlot de verre flottant */}
          <nav className="lg:hidden fixed bottom-4 inset-x-0 z-40 flex justify-center px-4">
            <div className="flex items-center gap-1 p-1.5 rounded-full bg-(--admin-glass-strong) backdrop-blur-2xl ring-1 ring-(--admin-ring) shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-caption font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-400 ease-spring cursor-pointer ${
                      active
                      ? 'bg-gradient-to-br from-(--admin-accent) to-(--admin-accent-strong) text-(--admin-accent-text) shadow-[0_4px_20px_rgba(254,214,91,0.35)]'
                      : 'text-(--admin-muted) hover:text-(--admin-text)'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.short}</span>
                    {tab.id === 'leads' && unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-micro font-bold flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </main>
      )}
    </div>
  );
}