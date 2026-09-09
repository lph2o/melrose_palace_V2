import { useState, useRef, useEffect, MouseEvent } from 'react';
import {
  ChevronRight,
  Info,
  CheckCircle,
  FileText,
  MessageCircle,
  Compass,
  Maximize,
  Sparkles,
  Map,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  Award,
  Scale,
  Search,
  Plane,
  Train,
  Building,
  Share2,
  ShieldCheck,
  Tag,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { Language, Parcel, SiteSettings } from '../types';
import { TRANSLATIONS, PARCELS, PAYMENT_SCHEDULE_TIERS, DEFAULT_SITE_SETTINGS } from '../data';
import {
  CADASTRAL_BORNES,
  CADASTRAL_PERIMETER_MEASUREMENTS,
  CADASTRAL_ROAD_NETWORK,
  CADASTRAL_PARCELS_GEO,
  CADASTRAL_ANNOTATIONS
} from '../cadastreGeometry';
import { motion, AnimatePresence } from 'motion/react';
import VirtualTourModal from './VirtualTourModal';
import ShareParcelModal from './ShareParcelModal';

interface MasterPlanPageProps {
  currentLanguage: Language;
  setActiveTab: (tab: 'home' | 'masterplan') => void;
  globalSelectedParcelId?: number | null;
  onClearGlobalSelectParcel?: () => void;
  settings?: SiteSettings;
  parcels?: Parcel[];
}

export default function MasterPlanPage({
  currentLanguage,
  setActiveTab,
  globalSelectedParcelId,
  onClearGlobalSelectParcel,
  settings = DEFAULT_SITE_SETTINGS,
  parcels = PARCELS
}: MasterPlanPageProps) {
  const t = TRANSLATIONS[currentLanguage];
  // Parcelles live : mises à jour de l'Espace Gérant (cloud/localStorage) visibles ici
  const allParcels = parcels;

  // Selection state
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(allParcels[0]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Phase1' | 'Promo' | 'Green' | 'Yellow' | 'Red' | 'Salmon'>('Phase1');
  // Filtre par statut commercial (Disponibles / Réservées / Vendues)
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Reserved' | 'Sold'>('All');
  const [cadastreViewMode, setCadastreViewMode] = useState<'official' | 'status' | 'blueprint'>('official');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tourParcel, setTourParcel] = useState<Parcel | null>(null);
  const [shareParcel, setShareParcel] = useState<Parcel | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Comparison state
  const [comparedParcelIds, setComparedParcelIds] = useState<number[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Map Zoom & Pan states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapViewportRef = useRef<HTMLDivElement>(null);

  // Simulator Tier inside Parcel Card
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(0);

  // Bottom table tab
  const [gridTab, setGridTab] = useState<'phase1' | 'all'>('phase1');

  // Listen for query parameters like ?plot=12 on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plotIdParam = params.get('plot') || params.get('parcel');
    if (plotIdParam) {
      const parsedId = parseInt(plotIdParam, 10);
      const matched = allParcels.find(p => p.id === parsedId);
      if (matched) {
        setSelectedParcel(matched);
      }
    }
  }, [allParcels]);

  // Listen for global selected parcel changes (from global Search palette)
  useEffect(() => {
    if (globalSelectedParcelId) {
      const matchParcel = allParcels.find(p => p.id === globalSelectedParcelId);
      if (matchParcel) {
        setSelectedParcel(matchParcel);
      }
      onClearGlobalSelectParcel?.();
    }
  }, [globalSelectedParcelId, onClearGlobalSelectParcel, allParcels]);

  // Official parcel coordinates and geometry from surveyor cadastre (54 parcels)
  const getParcelGeometry = (id: number) => {
    return CADASTRAL_PARCELS_GEO[id] || {
      id,
      points: "0,0 50,0 50,50 0,50",
      cx: 25,
      cy: 25,
      zone: 'green' as const,
      zoneNameFR: 'Zone Ouest',
      dimensions: '15.00 m × 10.00 m',
      widthM: 15,
      depthM: 10
    };
  };

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Handle Dragging
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Filtre par zone (Tranche / Promo / zones cadastrales) puis par statut commercial
  const zoneFilteredParcels = allParcels.filter(p => {
    if (activeFilter === 'Phase1' && p.id > 20) return false;
    if (activeFilter === 'Promo' && !(p.isPromo || p.id <= 10)) return false;
    if (activeFilter === 'Green' && p.zone !== 'green') return false;
    if (activeFilter === 'Yellow' && p.zone !== 'yellow') return false;
    if (activeFilter === 'Red' && p.zone !== 'red') return false;
    if (activeFilter === 'Salmon' && p.zone !== 'salmon') return false;
    return true;
  });

  // Compteurs de statut dans la sélection de zone courante (cohérents avec la carte)
  const statusCounts = {
    All: zoneFilteredParcels.length,
    Available: zoneFilteredParcels.filter(p => p.status === 'Available').length,
    Reserved: zoneFilteredParcels.filter(p => p.status === 'Reserved').length,
    Sold: zoneFilteredParcels.filter(p => p.status === 'Sold').length,
  };

  const visibleParcels = zoneFilteredParcels.filter(p => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase().replace('#', '').replace('parcelle', '').replace('lot', '').trim();
      return p.id.toString().includes(q);
    }
    return true;
  });

  const toggleCompare = (parcelId: number) => {
    setComparedParcelIds(prev => {
      if (prev.includes(parcelId)) {
        return prev.filter(id => id !== parcelId);
      } else {
        if (prev.length >= 3) {
          setToastMessage('Vous pouvez comparer jusqu\'à 3 parcelles au maximum.');
          setTimeout(() => setToastMessage(null), 3000);
          return prev;
        }
        return [...prev, parcelId];
      }
    });
  };

  const triggerDownload = (parcelId: number) => {
    setDownloadingId(parcelId);
    setTimeout(() => {
      setDownloadingId(null);
      setToastMessage(`Fiche technique certifiée de la parcelle n°${parcelId} téléchargée avec succès.`);
      setTimeout(() => setToastMessage(null), 4000);
    }, 1200);
  };

  const whatsappClean = settings?.whatsappCleanNumber || '33761235509';

  return (
    <div className="bg-[#FBF9F4] text-primary min-h-screen pt-24 pb-20 px-4 md:px-10 lg:px-14">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-outline-variant text-[11px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('home')}
            className="hover:text-primary transition-colors cursor-pointer py-1.5 px-1 -ml-1"
          >
            Accueil
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-outline-variant" />
          <span className="text-secondary-fixed-dim">Plan Cadastral & Disponibilités</span>
        </nav>

        {/* Header */}
        <header className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#004D40]/10 border border-[#004D40]/20 px-3 py-1 rounded-full text-[#004D40] text-[11px] font-bold tracking-widest uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Domaine de Sébikhotane • Tranche 1 (20 Parcelles)</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary leading-tight">
            Plan Directeur & Choix de Parcelle
          </h1>
          <p className="font-sans text-sm md:text-base text-outline leading-relaxed font-light">
            Découvrez nos 20 parcelles viabilisées de 150 m² chacune. Bénéficiez de la formule échelonnée à 300 €/mois ou d'un tarif préférentiel au comptant.
          </p>
        </header>

        {/* Key Indicators Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-300 shadow-xs">
          <div className="border-r border-gray-200 last:border-0 pr-3">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Domaine Sébikhotane</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-primary">54</span>
              <span className="text-xs text-outline font-sans">lots certifiés (150 m²)</span>
            </div>
          </div>

          <div className="border-r border-gray-200 last:border-0 px-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Tranche 1 Active</span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-[#0F6B4F]">20</span>
              <span className="text-xs text-outline font-sans">lots en commercialisation</span>
            </div>
          </div>

          <div className="border-r border-gray-200 last:border-0 px-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed" />
              <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Offre 10 Premiers</span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-[#8C7A53]">Lots 1 à 10</span>
              <span className="text-xs text-outline font-sans">frais de notaire offerts</span>
            </div>
          </div>

          <div className="pl-3">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider block">Financement</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-primary">300 €</span>
              <span className="text-xs text-outline font-sans">/ mois (40 mois)</span>
            </div>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-300 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-outline mr-1">Filtrer :</span>
            <button
              onClick={() => setActiveFilter('Phase1')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'Phase1' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              Tranche 1 (20 lots)
            </button>
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'All' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              Tous (54 lots)
            </button>
            <button
              onClick={() => setActiveFilter('Promo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'Promo' ? 'bg-secondary-fixed text-primary shadow-xs' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              Offre 10 Premiers ⭐
            </button>
            <button
              onClick={() => setActiveFilter('Green')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Green' ? 'bg-[#7BA877] text-white shadow-xs' : 'bg-emerald-50 text-[#2B5A27] hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#7BA877]" />
              <span>Zone Ouest (14)</span>
            </button>
            <button
              onClick={() => setActiveFilter('Yellow')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Yellow' ? 'bg-[#D8B826] text-white shadow-xs' : 'bg-amber-50 text-[#8C6D05] hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FDE792] border border-amber-400" />
              <span>Zone Centrale (18)</span>
            </button>
            <button
              onClick={() => setActiveFilter('Red')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Red' ? 'bg-[#EE7558] text-white shadow-xs' : 'bg-rose-50 text-[#B53F24] hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EE7558]" />
              <span>Zone Centre-Est (15)</span>
            </button>
            <button
              onClick={() => setActiveFilter('Salmon')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Salmon' ? 'bg-[#FA9D7A] text-white shadow-xs' : 'bg-orange-50 text-[#C0613C] hover:bg-orange-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FA9D7A]" />
              <span>Zone Est (6)</span>
            </button>
          </div>

          {/* Filtres par statut commercial (Disponibles / Réservées / Vendues) */}
          <div className="flex flex-wrap items-center gap-2 w-full pt-3 mt-1 border-t border-gray-100">
            <span className="text-xs font-bold uppercase text-outline mr-1">Statut :</span>
            {(['All', 'Available', 'Reserved', 'Sold'] as const).map((s) => {
              const count = statusCounts[s];
              const label =
                s === 'All'
                  ? t.masterPlan.filterAll
                  : s === 'Available'
                  ? t.masterPlan.filterAvailable
                  : s === 'Reserved'
                  ? t.masterPlan.filterReserved
                  : t.masterPlan.filterSold;
              // Les libellés i18n portent un compteur codé en dur (ex. « Disponibles (20) ») :
              // on y substitue le vrai nombre de la sélection de zone courante.
              const display = label.replace(/\d+/, String(count));
              const isActive = statusFilter === s;
              const pillCls =
                s === 'Available'
                  ? isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : s === 'Reserved'
                  ? isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : s === 'Sold'
                  ? isActive
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  : isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-gray-100 text-outline hover:text-primary';
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${pillCls}`}
                >
                  {s !== 'All' && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        s === 'Available'
                          ? 'bg-emerald-500'
                          : s === 'Reserved'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                  )}
                  <span>{display}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Rechercher lot (ex: 4 ou 25)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-sans"
            />
          </div>
        </div>

        {/* TOAST MESSAGE */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 right-6 z-50 bg-primary text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center space-x-2 border border-secondary-fixed/40"
            >
              <CheckCircle className="w-4 h-4 text-secondary-fixed" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CADASTRE VIEWPORT & DETAIL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SVG CADASTRE MAP (8 COLS) */}
          <div className="lg:col-span-8 bg-white border border-gray-300 rounded-3xl overflow-hidden shadow-sm relative">
            
            {/* Map Top Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-[#004D40]" />
                <div>
                  <span className="text-xs font-serif font-bold text-primary block">
                    Plan Cadastral Officiel Géomètre • Sébikhotane
                  </span>
                  <span className="text-[10px] text-outline font-mono">
                    54 Lots • Bornage certifié B1 à B17 • Voirie 12m
                  </span>
                </div>
              </div>

              {/* View Mode Switcher + Zoom controls */}
              <div className="flex items-center space-x-2">
                {/* View Mode Switcher */}
                <div className="hidden sm:flex items-center bg-gray-200/70 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    onClick={() => setCadastreViewMode('official')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      cadastreViewMode === 'official' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
                    }`}
                  >
                    Plan Officiel
                  </button>
                  <button
                    onClick={() => setCadastreViewMode('status')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      cadastreViewMode === 'status' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
                    }`}
                  >
                    Disponibilités
                  </button>
                  <button
                    onClick={() => setCadastreViewMode('blueprint')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      cadastreViewMode === 'blueprint' ? 'bg-white text-primary shadow-xs' : 'text-outline hover:text-primary'
                    }`}
                  >
                    Plan CAD
                  </button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={zoomIn}
                    className="p-2.5 hover:bg-gray-100 rounded-lg text-primary transition-colors cursor-pointer"
                    title="Zoomer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={zoomOut}
                    className="p-2.5 hover:bg-gray-100 rounded-lg text-primary transition-colors cursor-pointer"
                    title="Dézoomer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="p-2.5 hover:bg-gray-100 rounded-lg text-primary transition-colors cursor-pointer"
                    title="Réinitialiser"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Viewport Canvas */}
            <div
              ref={mapViewportRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`relative h-[530px] ${
                cadastreViewMode === 'blueprint' ? 'bg-[#06182E]' : 'bg-[#EFECE6]'
              } overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '500px 340px',
                  transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  width: '1000px',
                  height: '680px'
                }}
                className="relative"
              >
                <svg
                  viewBox="0 0 1000 680"
                  className="w-[1000px] h-[680px] absolute inset-0"
                >
                  <defs>
                    <pattern id="land-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 20 0 L 0 0 0 20"
                        fill="none"
                        stroke={cadastreViewMode === 'blueprint' ? '#0F3460' : '#DDD6C9'}
                        strokeWidth="0.5"
                      />
                    </pattern>
                    <filter id="parcel-glow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
                    </filter>
                    <filter id="selected-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#004D40" floodOpacity="0.8" />
                    </filter>
                  </defs>

                  {/* Canvas Background */}
                  <rect
                    width="1000"
                    height="680"
                    fill={cadastreViewMode === 'blueprint' ? '#071A2F' : '#EFECE6'}
                  />
                  <rect width="1000" height="680" fill="url(#land-grid)" />

                  {/* Outer Domain Boundary Polygon (Connecting B1 to B17) */}
                  <polygon
                    points="60,200 60,600 230,600 230,620 490,620 490,600 780,600 780,510 930,510 930,370 870,370 870,220 780,220 780,200 490,200 490,140 230,140"
                    fill={cadastreViewMode === 'blueprint' ? '#0B223D' : '#F5F2EA'}
                    stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#A39274'}
                    strokeWidth="3"
                    strokeDasharray="6,4"
                  />

                  {/* Road Network (Voirie 12m) */}
                  {/* Northern Access Road */}
                  <polygon
                    points={CADASTRAL_ROAD_NETWORK.northRoad}
                    fill={cadastreViewMode === 'blueprint' ? '#133357' : '#D1D5DB'}
                    stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#9CA3AF'}
                    strokeWidth="1"
                  />
                  <line
                    x1="230"
                    y1="170"
                    x2="490"
                    y2="170"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />
                  <text
                    x="360"
                    y="174"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={cadastreViewMode === 'blueprint' ? '#93C5FD' : '#4B5563'}
                    letterSpacing="1"
                  >
                    VOIE D'ACCÈS NORD
                  </text>

                  {/* West Road (between Green & Yellow zones) */}
                  <polygon
                    points={CADASTRAL_ROAD_NETWORK.westRoad}
                    fill={cadastreViewMode === 'blueprint' ? '#133357' : '#D1D5DB'}
                    stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#9CA3AF'}
                    strokeWidth="1"
                  />
                  <line
                    x1="245"
                    y1="140"
                    x2="245"
                    y2="620"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />

                  {/* Central Road (between Yellow & Red zones) */}
                  <polygon
                    points={CADASTRAL_ROAD_NETWORK.centralRoad}
                    fill={cadastreViewMode === 'blueprint' ? '#133357' : '#D1D5DB'}
                    stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#9CA3AF'}
                    strokeWidth="1"
                  />
                  <line
                    x1="505"
                    y1="140"
                    x2="505"
                    y2="620"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />
                  <text
                    x="505"
                    y="390"
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="bold"
                    fill={cadastreViewMode === 'blueprint' ? '#93C5FD' : '#4B5563'}
                    letterSpacing="1"
                    transform="rotate(-90 505 390)"
                  >
                    AVENUE CENTRALE AMÉNAGÉE (VOIRIE 12M)
                  </text>

                  {/* East Road (leading to Salmon zone) */}
                  <polygon
                    points={CADASTRAL_ROAD_NETWORK.eastRoad}
                    fill={cadastreViewMode === 'blueprint' ? '#133357' : '#D1D5DB'}
                    stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#9CA3AF'}
                    strokeWidth="1"
                  />
                  <line
                    x1="765"
                    y1="200"
                    x2="765"
                    y2="600"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeDasharray="8,8"
                    opacity="0.8"
                  />

                  {/* Parcels (All 54) */}
                  {allParcels.map((parcel) => {
                    const geo = getParcelGeometry(parcel.id);
                    const isSelected = selectedParcel?.id === parcel.id;
                    const isPromo = parcel.isPromo || parcel.id <= 10;
                    const isPhase1 = parcel.id <= 20;
                    const isVisible = visibleParcels.some(p => p.id === parcel.id);

                    // Colors based on cadastreViewMode
                    let fillColor = '#FFFFFF';
                    let strokeColor = '#94A3B8';
                    let textColor = '#0F172A';

                    if (cadastreViewMode === 'official') {
                      if (geo.zone === 'green') {
                        fillColor = isSelected ? '#548750' : '#7BA877';
                        strokeColor = isSelected ? '#1E3F1B' : '#4E734A';
                        textColor = isSelected ? '#FFFFFF' : '#143011';
                      } else if (geo.zone === 'yellow') {
                        fillColor = isSelected ? '#F0D45E' : '#FDE792';
                        strokeColor = isSelected ? '#9A7709' : '#C4A825';
                        textColor = '#3A2E05';
                      } else if (geo.zone === 'red') {
                        fillColor = isSelected ? '#DB5838' : '#EE7558';
                        strokeColor = isSelected ? '#7A1C06' : '#B8452A';
                        textColor = '#FFFFFF';
                      } else {
                        // salmon
                        fillColor = isSelected ? '#EB7E56' : '#FA9D7A';
                        strokeColor = isSelected ? '#8F3514' : '#C2633E';
                        textColor = '#FFFFFF';
                      }
                    } else if (cadastreViewMode === 'status') {
                      // Vrai statut commercial (mis à jour depuis l'Espace Gérant) :
                      // Disponible = vert, Réservée = ambre, Vendue = rouge
                      if (isSelected) {
                        fillColor = '#004D40';
                        strokeColor = '#002B1D';
                        textColor = '#FFFFFF';
                      } else if (parcel.status === 'Sold') {
                        fillColor = '#FEE2E2';
                        strokeColor = '#DC2626';
                        textColor = '#7F1D1D';
                      } else if (parcel.status === 'Reserved') {
                        fillColor = '#FEF3C7';
                        strokeColor = '#F59E0B';
                        textColor = '#78350F';
                      } else if (isPromo) {
                        fillColor = '#D1FAE5';
                        strokeColor = '#059669';
                        textColor = '#064E3B';
                      } else {
                        fillColor = '#ECFDF5';
                        strokeColor = '#10B981';
                        textColor = '#064E3B';
                      }
                    } else {
                      // Blueprint
                      fillColor = isSelected ? '#0077B6' : '#0B2545';
                      strokeColor = isSelected ? '#90E0EF' : '#48CAE4';
                      textColor = '#CAF0F8';
                    }

                    const strokeWidth = isSelected ? 3.5 : 1.5;

                    return (
                      <g
                        key={parcel.id}
                        onClick={() => setSelectedParcel(parcel)}
                        className="cursor-pointer transition-all duration-150"
                        opacity={isVisible ? 1 : 0.2}
                        filter={isSelected ? 'url(#selected-glow)' : 'none'}
                      >
                        {/* Parcel polygon */}
                        <polygon
                          points={geo.points}
                          fill={fillColor}
                          stroke={isSelected ? (cadastreViewMode === 'blueprint' ? '#90E0EF' : '#002B1D') : strokeColor}
                          strokeWidth={strokeWidth}
                        />

                        {/* Top Promo Tag for Lots 1-10 */}
                        {isPromo && (
                          <circle
                            cx={geo.cx - 24}
                            cy={geo.cy - 12}
                            r="5"
                            fill="#F59E0B"
                          />
                        )}

                        {/* Parcel Number */}
                        <text
                          x={geo.cx}
                          y={geo.cy - 1}
                          textAnchor="middle"
                          fontSize={isSelected ? '14' : '12'}
                          fontWeight="bold"
                          fill={isSelected ? '#FFFFFF' : textColor}
                          fontFamily="serif"
                        >
                          #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                        </text>

                        {/* Surface / Dimensions */}
                        <text
                          x={geo.cx}
                          y={geo.cy + 13}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill={isSelected ? '#FFFFFF' : (cadastreViewMode === 'official' ? textColor : '#64748B')}
                          opacity={isSelected ? 0.95 : 0.75}
                        >
                          150 m²
                        </text>

                        {/* Tranche 1 indicator badge — vrai statut commercial */}
                        {isPhase1 && (
                          <rect
                            x={geo.cx - 16}
                            y={geo.cy + 18}
                            width="32"
                            height="9"
                            rx="2"
                            fill={parcel.status === 'Sold' ? '#DC2626' : parcel.status === 'Reserved' ? '#D97706' : '#004D40'}
                            opacity={0.9}
                          />
                        )}
                        {isPhase1 && (
                          <text
                            x={geo.cx}
                            y={geo.cy + 25}
                            textAnchor="middle"
                            fontSize="6.5"
                            fontWeight="bold"
                            fill="#FFFFFF"
                          >
                            {parcel.status === 'Sold'
                              ? 'T1 VENDUE'
                              : parcel.status === 'Reserved'
                              ? 'T1 RÉSERVÉE'
                              : 'T1 DISPO'}
                          </text>
                        )}

                        <title>
                          {`Parcelle #${parcel.id} (${geo.dimensions})\nZone : ${geo.zoneNameFR}\nSurface : ${parcel.area} m²\nFinancement : 3 000 € acompte + 300 €/mois (40 mois)\nComptant : 13 500 €`}
                        </title>
                      </g>
                    );
                  })}

                  {/* Surveyor Perimeter Dimension Labels */}
                  {CADASTRAL_PERIMETER_MEASUREMENTS.map((meas, idx) => (
                    <g key={idx}>
                      <text
                        x={meas.textX}
                        y={meas.textY}
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="bold"
                        fill={cadastreViewMode === 'blueprint' ? '#93C5FD' : '#8C7A53'}
                        transform={meas.rotate ? `rotate(${meas.rotate} ${meas.textX} ${meas.textY})` : undefined}
                      >
                        {meas.dimension} m
                      </text>
                    </g>
                  ))}

                  {/* Cadastral Interior Annotations (15.00, 10.00 dimensions) */}
                  {CADASTRAL_ANNOTATIONS.map((anno, idx) => (
                    <text
                      key={idx}
                      x={anno.x}
                      y={anno.y}
                      textAnchor="middle"
                      fontSize={anno.fontSize || 7}
                      fill={anno.color || (cadastreViewMode === 'blueprint' ? '#60A5FA' : '#718096')}
                      opacity="0.65"
                      transform={anno.rotate ? `rotate(${anno.rotate} ${anno.x} ${anno.y})` : undefined}
                    >
                      {anno.text}
                    </text>
                  ))}

                  {/* Surveyor Bornes B1 to B17 */}
                  {CADASTRAL_BORNES.map((borne) => {
                    const isNearSelected = selectedParcel && Math.abs(borne.x - (getParcelGeometry(selectedParcel.id).cx)) < 90 && Math.abs(borne.y - (getParcelGeometry(selectedParcel.id).cy)) < 90;
                    return (
                      <g key={borne.id} className="pointer-events-none">
                        {/* Borne Outer Ring */}
                        <circle
                          cx={borne.x}
                          cy={borne.y}
                          r={isNearSelected ? "7" : "5.5"}
                          fill={cadastreViewMode === 'blueprint' ? '#00B4D8' : '#1F2937'}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        {/* Borne Inner Dot */}
                        <circle
                          cx={borne.x}
                          cy={borne.y}
                          r="1.8"
                          fill="#FFFFFF"
                        />
                        {/* Borne Label Tag */}
                        <rect
                          x={borne.labelX - 11}
                          y={borne.labelY - 7}
                          width="22"
                          height="14"
                          rx="3"
                          fill={cadastreViewMode === 'blueprint' ? '#0A2540' : '#FFFFFF'}
                          stroke={cadastreViewMode === 'blueprint' ? '#00B4D8' : '#374151'}
                          strokeWidth="0.8"
                          opacity="0.95"
                        />
                        <text
                          x={borne.labelX}
                          y={borne.labelY + 3.5}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill={cadastreViewMode === 'blueprint' ? '#90E0EF' : '#111827'}
                        >
                          {borne.id}
                        </text>
                      </g>
                    );
                  })}

                  {/* Surveyor Compass Rose (North Arrow) */}
                  <g transform="translate(895, 95)" className="pointer-events-none">
                    <circle
                      r="32"
                      fill={cadastreViewMode === 'blueprint' ? '#0B223D' : '#FFFFFF'}
                      stroke={cadastreViewMode === 'blueprint' ? '#48CAE4' : '#8C7A53'}
                      strokeWidth="1.5"
                      opacity="0.95"
                    />
                    <circle
                      r="28"
                      fill="none"
                      stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#D1CABF'}
                      strokeWidth="0.5"
                    />
                    {/* Cardinal letters */}
                    <text x="0" y="-18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B91C1C">N</text>
                    <text x="19" y="3" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748B">E</text>
                    <text x="0" y="22" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748B">S</text>
                    <text x="-19" y="3" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#64748B">O</text>
                    {/* North pointer needle */}
                    <polygon points="0,-25 4,-2 0,0" fill="#B91C1C" />
                    <polygon points="0,-25 -4,-2 0,0" fill="#DC2626" />
                    {/* South pointer needle */}
                    <polygon points="0,25 3,2 0,0" fill="#94A3B8" />
                    <polygon points="0,25 -3,2 0,0" fill="#CBD5E1" />
                    <circle r="2.5" fill="#1E293B" />
                  </g>

                  {/* Cadastre Title Badge Inside SVG */}
                  <g transform="translate(70, 75)" className="pointer-events-none">
                    <rect
                      width="230"
                      height="50"
                      rx="6"
                      fill={cadastreViewMode === 'blueprint' ? '#0B223D' : '#FFFFFF'}
                      stroke={cadastreViewMode === 'blueprint' ? '#1E4976' : '#C8BFB0'}
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x="12"
                      y="20"
                      fontSize="9.5"
                      fontWeight="bold"
                      fill={cadastreViewMode === 'blueprint' ? '#90E0EF' : '#002B1D'}
                      fontFamily="serif"
                    >
                      DOMAINE DE SÉBIKHOTANE
                    </text>
                    <text
                      x="12"
                      y="33"
                      fontSize="7.5"
                      fill={cadastreViewMode === 'blueprint' ? '#64748B' : '#64748B'}
                    >
                      54 Parcelles de 150 m² • Tranche 1 (Lots 1-20)
                    </text>
                    <text
                      x="12"
                      y="44"
                      fontSize="7"
                      fill={cadastreViewMode === 'blueprint' ? '#00B4D8' : '#0F6B4F'}
                      fontWeight="bold"
                    >
                      ✓ Bornage B1 à B17 • Délibération & NICAD
                    </text>
                  </g>
                </svg>
              </div>

              {/* Map floating helper */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-gray-200 text-[10px] text-primary flex items-center space-x-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cliquez sur l'un des 54 lots pour consulter ses dimensions et le réserver</span>
              </div>
            </div>

            {/* Cadastre Legend Bar */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#7BA877] border border-[#4E734A]" />
                  <span className="font-bold text-primary">Zone Ouest (Lots 1-14)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#FDE792] border border-[#C4A825]" />
                  <span className="font-bold text-primary">Zone Centrale (Lots 15-32)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#EE7558] border border-[#B8452A]" />
                  <span className="font-bold text-primary">Zone Centre-Est (Lots 33-47)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[#FA9D7A] border border-[#C2633E]" />
                  <span className="font-bold text-primary">Zone Est (Lots 48-54)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-black border border-white" />
                  <span className="font-bold text-primary">Bornes B1-B17</span>
                </div>
              </div>
              <span className="text-[10px] text-outline font-mono">
                Conforme au plan officiel de lotissement
              </span>
            </div>
          </div>

          {/* PARCEL DETAIL CARD (4 COLS) */}
          <div className="lg:col-span-4 bg-white border border-gray-300 rounded-3xl p-6 space-y-5 shadow-sm">
            {selectedParcel ? (
              <div className="space-y-5">
                
                {/* Header of Card */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-mono font-bold text-secondary-fixed-dim tracking-wider">
                        Sébikhotane • {selectedParcel.zoneName?.FR || 'Zone Cadastrale'}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-primary mt-1">
                      Lot #{selectedParcel.id < 10 ? `0${selectedParcel.id}` : selectedParcel.id}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {selectedParcel.status === 'Sold' ? (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedParcel.id <= 20 ? 'Tranche 1 • Vendue' : 'Vendue'}
                      </span>
                    ) : selectedParcel.status === 'Reserved' ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedParcel.id <= 20 ? 'Tranche 1 • Réservée' : 'Réservée'}
                      </span>
                    ) : selectedParcel.id <= 20 ? (
                      <span className="bg-[#25D366]/15 text-[#0F6B4F] border border-[#25D366]/30 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Tranche 1 • Disponible
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Tranche 2 • Réservable
                      </span>
                    )}
                    {(selectedParcel.isPromo || selectedParcel.id <= 10) && (
                      <span className="bg-secondary-fixed text-primary text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Promo 10 Premiers ⭐
                      </span>
                    )}
                  </div>
                </div>

                {/* Surface and Dimensions */}
                <div className="grid grid-cols-2 gap-3 bg-[#FBF9F4] p-3.5 rounded-2xl border border-gray-200">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-outline tracking-wider block">Surface Totale</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Maximize className="w-3.5 h-3.5 text-secondary-fixed-dim" />
                      <span className="font-serif text-lg font-bold text-primary">{selectedParcel.area} m²</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold text-outline tracking-wider block">Dimensions Exactes</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="font-sans text-xs font-bold text-primary">{selectedParcel.dimensions || '15.00 m × 10.00 m'}</span>
                    </div>
                  </div>
                </div>

                {/* Cadastral Security */}
                <div className="bg-emerald-50/60 border border-emerald-200/60 p-3 rounded-xl flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#0F6B4F] shrink-0" />
                  <div className="text-xs text-[#064E3B]">
                    <strong className="block font-bold">Délibération Communale + NICAD</strong>
                    <span>Bornage officiel géomètre B1 à B17 avec PV de bornage</span>
                  </div>
                </div>

                {/* Financial Offer Tabs */}
                <div className="bg-[#002B1D] text-white p-4.5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-secondary-fixed font-bold block">
                    Modalités de Financement
                  </span>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-white/80">Option Échelonnée :</span>
                      <strong className="text-sm font-bold text-secondary-fixed">
                        3 000 € + 300 € / mois
                      </strong>
                    </div>
                    <div className="text-[11px] text-white/60">
                      Sur 40 mois (coût total : 15 000 € sans intérêts bancaires)
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                      <span className="text-xs text-white/80">Option Paiement Comptant :</span>
                      <strong className="text-sm font-bold text-white">
                        13 500 €
                      </strong>
                    </div>
                    <div className="text-[10px] text-secondary-fixed font-mono">
                      Remise immédiate de 1 500 € pour paiement comptant
                    </div>
                  </div>
                </div>

                {/* Badges of trust */}
                <div className="space-y-1.5 text-xs text-on-surface-variant font-light">
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>Propriété directe garantie avec mutation accompagnée</span>
                  </div>
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>Remboursement intégral si engagements non respectés</span>
                  </div>
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>Clôture et viabilisation incluses</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2 border-t border-gray-200">
                  {/* WhatsApp Direct */}
                  <a
                    href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(`Bonjour ${settings.companyName || 'Sénégal Immobilier Consulting'}, je souhaite réserver ou recevoir des informations détaillées concernant le Lot n° ${selectedParcel.id} (${selectedParcel.dimensions || '150 m²'} - ${selectedParcel.zoneName?.FR || 'Sébikhotane'}).`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Réserver ce Lot sur WhatsApp</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    {/* 3D Virtual Tour Button */}
                    <button
                      onClick={() => setTourParcel(selectedParcel)}
                      className="w-full bg-[#004D40]/10 hover:bg-[#004D40]/20 text-[#004D40] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visite 3D</span>
                    </button>

                    {/* Share Parcel Button */}
                    <button
                      onClick={() => setShareParcel(selectedParcel)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Partager</span>
                    </button>
                  </div>

                  {/* Download Spec Sheet */}
                  <button
                    onClick={() => triggerDownload(selectedParcel.id)}
                    disabled={downloadingId !== null}
                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-primary py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {downloadingId === selectedParcel.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-secondary-fixed-dim" />
                    )}
                    <span>Télécharger Fiche Cadastrale PDF</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-outline">
                Sélectionnez une parcelle sur le plan.
              </div>
            )}
          </div>

        </div>

        {/* FINANCIAL SIMULATOR INTERACTIVE TABLE */}
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-300 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#004D40]">
                <Calculator className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                  Échéancier Officiel Sébikhotane
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                Simulateur de Paiement Échelonné (150 m²)
              </h3>
              <p className="text-xs text-outline font-light">
                Choisissez votre apport initial pour adapter la durée de vos mensualités à 300 €/mois.
              </p>
            </div>

            <span className="text-xs bg-secondary-fixed/20 text-[#002B1D] font-bold px-3 py-1.5 rounded-xl self-start md:self-auto">
              Sans Frais de Dossier Bancaire
            </span>
          </div>

          {/* Interactive Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(settings.content?.paymentTiers ?? PAYMENT_SCHEDULE_TIERS).map((tier, idx) => {
              const isSelected = selectedTierIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTierIdx(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-3 ${
                    isSelected
                      ? 'bg-[#002B1D] text-white border-[#002B1D] shadow-md'
                      : 'bg-[#FBF9F4] text-primary border-gray-300 hover:border-primary/60 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isSelected ? 'text-secondary-fixed' : 'text-outline'}`}>
                      Option {idx + 1}
                    </span>
                    {idx === 0 && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${isSelected ? 'bg-secondary-fixed text-primary' : 'bg-primary text-white'}`}>
                        Populaire
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-bold opacity-70 block">Acompte Initial</span>
                    <span className="font-serif text-2xl font-bold">{tier.deposit.toLocaleString()} €</span>
                  </div>

                  <div className="border-t border-current/10 pt-2.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-80">Reste à payer :</span>
                      <strong>{tier.remaining.toLocaleString()} €</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Mensualité :</span>
                      <strong className={isSelected ? 'text-secondary-fixed' : 'text-[#0F6B4F]'}>
                        {tier.monthly} € / mois
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Durée :</span>
                      <strong>{tier.duration} mois</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PARCEL DIRECTORY: TRANCHE 1 & ALL 54 LOTS */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-primary">
                Répertoire Cadastral des Parcelles (150 m²)
              </h3>
              <p className="text-xs text-outline font-light">
                Sélectionnez une parcelle pour la situer sur le plan cadastral et lancer votre demande.
              </p>
            </div>

            {/* Toggle between Tranche 1 and All 54 */}
            <div className="flex items-center bg-gray-200/80 p-1 rounded-2xl text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => {
                  setGridTab('phase1');
                  setActiveFilter('Phase1');
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  gridTab === 'phase1'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-outline hover:text-primary'
                }`}
              >
                Tranche 1 (Lots 1 à 20)
              </button>
              <button
                onClick={() => {
                  setGridTab('all');
                  setActiveFilter('All');
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  gridTab === 'all'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-outline hover:text-primary'
                }`}
              >
                Tous les 54 Lots
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {(gridTab === 'phase1' ? allParcels.filter(p => p.id <= 20) : visibleParcels).map((parcel) => {
              const isSelected = selectedParcel?.id === parcel.id;
              const isPromo = parcel.isPromo || parcel.id <= 10;
              const isPhase1 = parcel.id <= 20;

              // Zone color badge
              const zoneBadgeClass = parcel.zone === 'green'
                ? 'bg-emerald-100 text-emerald-800'
                : parcel.zone === 'yellow'
                  ? 'bg-amber-100 text-amber-900'
                  : parcel.zone === 'red'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-orange-100 text-orange-800';

              return (
                <div
                  key={parcel.id}
                  onClick={() => {
                    setSelectedParcel(parcel);
                    window.scrollTo({ top: 320, behavior: 'smooth' });
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#002B1D] text-white border-[#002B1D] shadow-md ring-2 ring-secondary-fixed'
                      : 'bg-white text-primary border-gray-300 hover:border-primary hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base">
                      Lot #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isPhase1 ? 'bg-[#25D366]' : 'bg-amber-400'}`} />
                  </div>

                  {/* Zone and Dimensions */}
                  <div className="space-y-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      isSelected ? 'bg-white/20 text-white' : zoneBadgeClass
                    }`}>
                      {parcel.zoneName?.FR || 'Zone'}
                    </span>
                    <div className="text-[11px] flex justify-between opacity-80 font-mono">
                      <span>{parcel.dimensions || '15 × 10 m'}</span>
                      <span>{parcel.area} m²</span>
                    </div>
                  </div>

                  {/* Pricing / Promo */}
                  <div className="border-t border-current/10 pt-2 flex justify-between items-center text-xs">
                    <span className="font-bold">300 €/m</span>
                    {parcel.status === 'Sold' ? (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-rose-100 text-rose-800">
                        Vendue
                      </span>
                    ) : parcel.status === 'Reserved' ? (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-amber-100 text-amber-800">
                        Réservée
                      </span>
                    ) : isPromo ? (
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                        isSelected ? 'bg-secondary-fixed text-primary' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        ⭐ Promo
                      </span>
                    ) : (
                      <span className="text-[9px] opacity-70">
                        {isPhase1 ? 'T1 Disponible' : 'T2'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      {/* VIRTUAL TOUR MODAL */}
      <AnimatePresence>
        {tourParcel && (
          <VirtualTourModal
            parcel={tourParcel}
            currentLanguage={currentLanguage}
            onClose={() => setTourParcel(null)}
          />
        )}
      </AnimatePresence>

      {/* SHARE PARCEL MODAL */}
      <AnimatePresence>
        {shareParcel && (
          <ShareParcelModal
            parcel={shareParcel}
            currentLanguage={currentLanguage}
            whatsappNumber={settings?.whatsappNumber}
            onClose={() => setShareParcel(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
