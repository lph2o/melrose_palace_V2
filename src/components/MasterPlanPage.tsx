import { useState, useRef, useEffect, MouseEvent, TouchEvent } from 'react';
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
import { TRANSLATIONS, PARCELS, PAYMENT_SCHEDULE_TIERS, DEFAULT_SITE_SETTINGS, ESTATE_AREA_RANGE } from '../data';
import { buildPaymentSchedule, buildParcelSchedule } from '../lib/payment';
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
import { downloadParcelSheet } from '../lib/parcelSheet';

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
  const isFR = currentLanguage === 'FR';
  // Surface réelle des lots du domaine (tous ne font pas 150 m²).
  const surfaceRange = isFR ? ESTATE_AREA_RANGE.FR : ESTATE_AREA_RANGE.EN;
  // Échéancier du « lot type » : il ne sert plus qu'aux repères de la page (KPI
  // de financement). Chaque lot calcule le sien sur SON prix via `scheduleFor` :
  // une fiche de lot ne doit pas annoncer les conditions d'un autre lot.
  const referenceSchedule = buildPaymentSchedule(
    settings.basePrice,
    settings.defaultDeposit,
    settings.defaultMonthly
  );
  /**
   * Échéancier propre à un lot : son prix pilote la durée et le dernier
   * versement, l'acompte et la mensualité restant ceux du Gérant. La règle vit
   * dans `buildParcelSchedule` pour que la fiche, le plan, le PDF et l'Espace
   * Gérant ne puissent pas en diverger.
   */
  const scheduleFor = (parcel: Parcel) => buildParcelSchedule(parcel.price, settings);
  // Libellés de la page. Elle est très dense en texte statique (plan SVG,
  // cartes, répertoire) : un dictionnaire local évite d'éparpiller des
  // ternaires FR/EN dans 1 500 lignes de JSX.
  const L = isFR
    ? {
        home: 'Accueil',
        breadcrumb: 'Plan Cadastral & Disponibilités',
        headerBadge: 'Domaine de Sébikhotane • Tranche 1 (20 Parcelles)',
        headerTitle: 'Plan Directeur & Choix de Parcelle',
        headerIntro: `Découvrez nos parcelles viabilisées ${surfaceRange}. Bénéficiez de la formule échelonnée à 300 €/mois ou d'un tarif préférentiel au comptant.`,
        kpiDomain: 'Domaine Sébikhotane',
        kpiLots: `lots certifiés (${surfaceRange})`,
        kpiPhase: 'Tranche 1 Active',
        kpiPhaseSub: 'lots en commercialisation',
        kpiPromo: 'Offre 10 Premiers',
        kpiPromoLots: 'Lots 1 à 10',
        kpiPromoSub: 'frais de notaire offerts',
        kpiFinancing: 'Financement',
        kpiFinancingSub: (months: number) => (months > 0 ? `/ mois (${months} mois)` : '/ mois'),
        filterLabel: 'Filtrer :',
        fPhase1: 'Tranche 1 (20 lots)',
        fAll: 'Tous (54 lots)',
        fPromo: 'Offre 10 Premiers ⭐',
        fGreen: 'Zone Ouest (14)',
        fYellow: 'Zone Centrale (18)',
        fRed: 'Zone Centre-Est (15)',
        fSalmon: 'Zone Est (6)',
        statusLabel: 'Statut :',
        searchPlaceholder: 'Rechercher lot (ex: 4 ou 25)...',
        mapTitle: 'Plan Cadastral Officiel Géomètre • Sébikhotane',
        mapSub: '54 Lots • Bornage certifié B1 à B17 • Voirie 12m',
        viewOfficial: 'Plan Officiel',
        viewStatus: 'Disponibilités',
        viewBlueprint: 'Plan CAD',
        zoomIn: 'Zoomer',
        zoomOut: 'Dézoomer',
        reset: 'Réinitialiser',
        svgNorthRoad: "VOIE D'ACCÈS NORD",
        svgCentralAvenue: 'AVENUE CENTRALE AMÉNAGÉE (VOIRIE 12M)',
        t1Sold: 'T1 VENDUE',
        t1Reserved: 'T1 RÉSERVÉE',
        t1Available: 'T1 DISPO',
        svgTitleBadge: 'DOMAINE DE SÉBIKHOTANE',
        svgTitleSub: `54 Parcelles ${surfaceRange} • Tranche 1 (Lots 1-20)`,
        svgTitleLine3: '✓ Bornage B1 à B17 • Délibération & NICAD',
        mapHelper:
          "Cliquez sur l'un des 54 lots pour consulter ses dimensions et le réserver",
        legendWest: 'Zone Ouest (Lots 1-14)',
        legendCentral: 'Zone Centrale (Lots 15-32)',
        legendCenterEast: 'Zone Centre-Est (Lots 33-47)',
        legendEast: 'Zone Est (Lots 48-54)',
        legendMarkers: 'Bornes B1-B17',
        legendNote: 'Conforme au plan officiel de lotissement',
        zoneFallback: 'Zone Cadastrale',
        statusSoldT1: 'Tranche 1 • Vendue',
        statusSold: 'Vendue',
        statusReservedT1: 'Tranche 1 • Réservée',
        statusReserved: 'Réservée',
        statusAvailT1: 'Tranche 1 • Disponible',
        statusReservable2: 'Tranche 2 • Réservable',
        promoBadge: 'Promo 10 Premiers ⭐',
        surfaceTotal: 'Surface Totale',
        dimensionsExact: 'Dimensions Exactes',
        securityTitle: 'Délibération Communale + NICAD',
        securitySub: 'Bornage officiel géomètre B1 à B17 avec PV de bornage',
        finTitle: 'Modalités de Financement',
        finScheduleFor: (id: number, area: number, price: number) =>
          `Lot #${String(id).padStart(2, '0')} • ${area} m² • ${price.toLocaleString()} €`,
        finInstallments: 'Option Échelonnée :',
        finOverMonths: (months: number, total: number) =>
          months > 0
            ? `Sur ${months} mois (coût total : ${total.toLocaleString()} € sans intérêts bancaires)`
            : `Coût total : ${total.toLocaleString()} € sans intérêts bancaires`,
        finFinalBalance: (amount: number) => `Dont un dernier versement de ${amount.toLocaleString()} €`,
        finCash: 'Option Paiement Comptant :',
        finCashNote: (saving: number) => `Remise immédiate de ${saving.toLocaleString()} € pour paiement comptant`,
        trust1: 'Propriété directe garantie avec mutation accompagnée',
        trust2: 'Remboursement intégral si engagements non respectés',
        trust3: 'Clôture et viabilisation incluses',
        waReserve: 'Réserver ce Lot sur WhatsApp',
        tour3d: 'Visite 3D',
        share: 'Partager',
        downloadSheet: 'Télécharger Fiche Cadastrale PDF',
        selectParcel: 'Sélectionnez une parcelle sur le plan.',
        simTag: 'Échéancier Officiel Sébikhotane',
        simTitle: `Simulateur de Paiement Échelonné (${surfaceRange})`,
        simDesc: `Choisissez votre apport initial pour adapter la durée de vos mensualités à ${settings.defaultMonthly} €/mois.`,
        simScope: (id: number, area: number) =>
          `Lot sélectionné : #${String(id).padStart(2, '0')} • ${area} m²`,
        simNoFees: 'Sans Frais de Dossier Bancaire',
        simOption: 'Option',
        simPopular: 'Populaire',
        simDeposit: 'Acompte Initial',
        simRemaining: 'Reste à payer :',
        simMonthly: 'Mensualité :',
        simDuration: 'Durée :',
        simFinalBalance: 'Dernier versement',
        perMonth: '€ / mois',
        months: 'mois',
        dirTitle: `Répertoire Cadastral des Parcelles (${surfaceRange})`,
        dirDesc:
          'Sélectionnez une parcelle pour la situer sur le plan cadastral et lancer votre demande.',
        dirPhase1: 'Tranche 1 (Lots 1 à 20)',
        dirAll: 'Tous les 54 Lots',
        sold: 'Vendue',
        reserved: 'Réservée',
        t1Avail: 'T1 Disponible',
        t2: 'T2',
        toastMaxCompare: "Vous pouvez comparer jusqu'à 3 parcelles au maximum.",
        toastDownloaded: (id: number) => `Fiche cadastrale du lot n°${id} téléchargée (PDF).`,
        toastError:
          'Génération de la fiche impossible. Réessayez ou écrivez-nous sur WhatsApp.',
        waReserveMessage: (id: number, area: number, dims: string, zone: string) =>
          `Bonjour ${settings.companyName || 'Senegal Investment Consulting'}, je souhaite réserver ou recevoir des informations détaillées concernant le Lot n° ${id} (${area} m² - ${dims} - ${zone}).`,
      }
    : {
        home: 'Home',
        breadcrumb: 'Cadastral Plan & Availability',
        headerBadge: 'Sébikhotane Estate • Phase 1 (20 Plots)',
        headerTitle: 'Master Plan & Plot Selection',
        headerIntro: `Discover our serviced plots, ${surfaceRange}. Choose the installment plan at €300/month or the preferential cash price.`,
        kpiDomain: 'Sébikhotane Estate',
        kpiLots: `certified plots (${surfaceRange})`,
        kpiPhase: 'Phase 1 Active',
        kpiPhaseSub: 'plots on sale',
        kpiPromo: 'First 10 Offer',
        kpiPromoLots: 'Plots 1 to 10',
        kpiPromoSub: 'notary fees included',
        kpiFinancing: 'Financing',
        kpiFinancingSub: (months: number) => (months > 0 ? `/ month (${months} months)` : '/ month'),
        filterLabel: 'Filter:',
        fPhase1: 'Phase 1 (20 plots)',
        fAll: 'All (54 plots)',
        fPromo: 'First 10 Offer ⭐',
        fGreen: 'West Zone (14)',
        fYellow: 'Central Zone (18)',
        fRed: 'Center-East Zone (15)',
        fSalmon: 'East Zone (6)',
        statusLabel: 'Status:',
        searchPlaceholder: 'Search plot (e.g. 4 or 25)...',
        mapTitle: 'Official Surveyor Cadastral Plan • Sébikhotane',
        mapSub: '54 Plots • Certified markers B1 to B17 • 12m Roads',
        viewOfficial: 'Official Plan',
        viewStatus: 'Availability',
        viewBlueprint: 'CAD Plan',
        zoomIn: 'Zoom in',
        zoomOut: 'Zoom out',
        reset: 'Reset',
        svgNorthRoad: 'NORTH ACCESS ROAD',
        svgCentralAvenue: 'CENTRAL SERVICED AVENUE (12M ROAD)',
        t1Sold: 'P1 SOLD',
        t1Reserved: 'P1 RESERVED',
        t1Available: 'P1 AVAILABLE',
        svgTitleBadge: 'SÉBIKHOTANE ESTATE',
        svgTitleSub: `54 Plots ${surfaceRange} • Phase 1 (Plots 1-20)`,
        svgTitleLine3: '✓ Boundary markers B1 to B17 • Deliberation & NICAD',
        mapHelper: 'Click any of the 54 plots to view its dimensions and reserve it',
        legendWest: 'West Zone (Plots 1-14)',
        legendCentral: 'Central Zone (Plots 15-32)',
        legendCenterEast: 'Center-East Zone (Plots 33-47)',
        legendEast: 'East Zone (Plots 48-54)',
        legendMarkers: 'Markers B1-B17',
        legendNote: 'Compliant with the official subdivision plan',
        zoneFallback: 'Cadastral Zone',
        statusSoldT1: 'Phase 1 • Sold',
        statusSold: 'Sold',
        statusReservedT1: 'Phase 1 • Reserved',
        statusReserved: 'Reserved',
        statusAvailT1: 'Phase 1 • Available',
        statusReservable2: 'Phase 2 • Available soon',
        promoBadge: 'First 10 Promo ⭐',
        surfaceTotal: 'Total Area',
        dimensionsExact: 'Exact Dimensions',
        securityTitle: 'Municipal Deliberation + NICAD',
        securitySub: 'Official surveyor boundary markers B1 to B17 with survey report',
        finTitle: 'Financing Terms',
        finScheduleFor: (id: number, area: number, price: number) =>
          `Plot #${String(id).padStart(2, '0')} • ${area} sqm • €${price.toLocaleString()}`,
        finInstallments: 'Installment plan:',
        finOverMonths: (months: number, total: number) =>
          months > 0
            ? `Over ${months} months (total cost: €${total.toLocaleString()} with no bank interest)`
            : `Total cost: €${total.toLocaleString()} with no bank interest`,
        finFinalBalance: (amount: number) => `Including a final installment of €${amount.toLocaleString()}`,
        finCash: 'Cash payment option:',
        finCashNote: (saving: number) => `€${saving.toLocaleString()} immediate discount for cash payment`,
        trust1: 'Direct ownership guaranteed with guided title transfer',
        trust2: 'Full refund if commitments are not met',
        trust3: 'Fencing and site servicing included',
        waReserve: 'Reserve this Plot on WhatsApp',
        tour3d: '3D Tour',
        share: 'Share',
        downloadSheet: 'Download Cadastral Sheet (PDF)',
        selectParcel: 'Select a plot on the plan.',
        simTag: 'Official Sébikhotane Payment Schedule',
        simTitle: `Installment Payment Simulator (${surfaceRange})`,
        simDesc: `Choose your down payment to adjust how long your €${settings.defaultMonthly}/month installments run.`,
        simScope: (id: number, area: number) =>
          `Selected plot: #${String(id).padStart(2, '0')} • ${area} sqm`,
        simNoFees: 'No Bank Application Fees',
        simOption: 'Option',
        simPopular: 'Popular',
        simDeposit: 'Initial Deposit',
        simRemaining: 'Remaining:',
        simMonthly: 'Monthly:',
        simDuration: 'Term:',
        simFinalBalance: 'Final installment',
        perMonth: '€ / month',
        months: 'months',
        dirTitle: `Plot Cadastral Directory (${surfaceRange})`,
        dirDesc: 'Select a plot to locate it on the cadastral plan and start your request.',
        dirPhase1: 'Phase 1 (Plots 1 to 20)',
        dirAll: 'All 54 Plots',
        sold: 'Sold',
        reserved: 'Reserved',
        t1Avail: 'P1 Available',
        t2: 'P2',
        toastMaxCompare: 'You can compare up to 3 plots at most.',
        toastDownloaded: (id: number) => `Cadastral sheet for plot #${id} downloaded (PDF).`,
        toastError: 'Could not generate the sheet. Try again or message us on WhatsApp.',
        waReserveMessage: (id: number, area: number, dims: string, zone: string) =>
          `Hello ${settings.companyName || 'Senegal Investment Consulting'}, I would like to reserve or receive detailed information about Plot #${id} (${area} sqm - ${dims} - ${zone}).`,
      };

  /* Les libellés de zone (nombre de lots et plages) étaient écrits à la main dans
     `L` et avaient dérivé du plan qu'ils décrivent : la légende annonçait une
     zone centrale de 18 lots là où le plan en dessine 19, les filtres totalisaient
     53 lots à côté d'un bouton « Tous (54 lots) », et chaque plage était décalée.
     Un plan juste à côté d'un libellé faux ne vaut pas mieux qu'un libellé absent :
     ces huit chaînes se recalculent donc depuis `CADASTRAL_PARCELS_GEO`, seule
     source de vérité de ce qui est réellement dessiné. */
  const zoneLots = (zone: 'green' | 'yellow' | 'red' | 'salmon') =>
    Object.values(CADASTRAL_PARCELS_GEO)
      .filter((p) => p.zone === zone)
      .map((p) => p.id)
      .sort((a, b) => a - b);

  /** « 1-13, 53 » — les suites de plus de deux lots sont abrégées, sinon la
   *  légende devient un mur de chiffres. */
  const lotRanges = (ids: number[]) => {
    const parts: string[] = [];
    let start = ids[0];
    let prev = ids[0];
    for (let i = 1; i <= ids.length; i++) {
      const id = ids[i];
      if (id === prev + 1) {
        prev = id;
        continue;
      }
      parts.push(start === prev ? `${start}` : `${start}-${prev}`);
      start = id;
      prev = id;
    }
    return parts.join(', ');
  };

  const zoneNames = isFR
    ? { green: 'Zone Ouest', yellow: 'Zone Centrale', red: 'Zone Centre-Est', salmon: 'Zone Est' }
    : { green: 'West Zone', yellow: 'Central Zone', red: 'Center-East Zone', salmon: 'East Zone' };

  const zoneChip = (z: 'green' | 'yellow' | 'red' | 'salmon') =>
    `${zoneNames[z]} (${zoneLots(z).length})`;
  const zoneLegend = (z: 'green' | 'yellow' | 'red' | 'salmon') =>
    `${zoneNames[z]} (${isFR ? 'Lots' : 'Plots'} ${lotRanges(zoneLots(z))})`;
  const totalLots = Object.keys(CADASTRAL_PARCELS_GEO).length;

  L.fGreen = zoneChip('green');
  L.fYellow = zoneChip('yellow');
  L.fRed = zoneChip('red');
  L.fSalmon = zoneChip('salmon');
  L.legendWest = zoneLegend('green');
  L.legendCentral = zoneLegend('yellow');
  L.legendCenterEast = zoneLegend('red');
  L.legendEast = zoneLegend('salmon');
  L.fAll = isFR ? `Tous (${totalLots} lots)` : `All (${totalLots} plots)`;

  // `cadastreGeometry` ne porte que le libellé français de zone ; l'anglais est
  // dérivé de la clé de zone (les parcelles, elles, ont déjà `zoneName.EN`).
  const zoneLabelEn: Record<string, string> = {
    green: 'West Zone (Green)',
    yellow: 'Central Zone (Yellow)',
    red: 'Center-East Zone (Red)',
    salmon: 'East Zone (Salmon)',
  };
  const zoneLabel = (zone: string, frLabel: string) =>
    isFR ? frLabel : zoneLabelEn[zone] || frLabel;

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

  // Prix du lot sélectionné — et non le prix de référence du « lot type » — :
  // il pilote l'échéancier de la fiche ET la grille des paliers, qui décrivent
  // tous les deux le lot affiché à côté d'elles.
  const selectedPrice = selectedParcel?.price ?? settings.basePrice;
  const selectedSchedule = buildParcelSchedule(selectedPrice, settings);

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

  // La fiche du lot garde un instantané de sa parcelle : sans cette
  // resynchronisation, une édition de l'Espace Gérant (prix, prix comptant,
  // statut) ne se verrait qu'après avoir resélectionné le lot à la main. React
  // ignore le `return current` : aucun rendu superflu.
  useEffect(() => {
    setSelectedParcel((current) => {
      if (!current) return current;
      const live = allParcels.find((p) => p.id === current.id);
      return live && live !== current ? live : current;
    });
  }, [allParcels]);

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

  // Bornage du déplacement : le plan (1000 × 680 px) ne peut plus être tiré
  // entièrement hors du cadre, ce qui laissait un canevas vide. Le repère est le
  // centre du plan, identique au `transformOrigin` du conteneur transformé.
  const clampPan = (next: { x: number; y: number }, scale: number) => {
    const viewport = mapViewportRef.current;
    if (!viewport) return next;
    const clampAxis = (value: number, center: number, half: number, viewportSize: number) => {
      const size = half * 2 * scale;
      if (size >= viewportSize) {
        const min = viewportSize - center - half * scale;
        const max = center * (scale - 1);
        return Math.min(Math.max(value, min), max);
      }
      return viewportSize / 2 - center;
    };
    return {
      x: clampAxis(next.x, 500, 500, viewport.clientWidth || 1000),
      y: clampAxis(next.y, 340, 340, viewport.clientHeight || 530),
    };
  };

  // Zoom controls — forme fonctionnelle obligatoire : deux clics rapides doivent
  // s'additionner (une valeur de `zoom` capturée resterait bloquée).
  const zoomBy = (delta: number) => {
    setZoom(prev => Math.min(Math.max(prev + delta, 0.75), 2.5));
  };
  const zoomIn = () => zoomBy(0.25);
  const zoomOut = () => zoomBy(-0.25);
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Chaque changement de zoom re-borne le déplacement : un plan zoomé ne doit
  // jamais pouvoir être tiré hors du cadre.
  useEffect(() => {
    setPan(prev => {
      const next = clampPan(prev, zoom);
      return next.x === prev.x && next.y === prev.y ? prev : next;
    });
  }, [zoom]);

  // Handle Dragging (souris)
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan(clampPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }, zoom));
  };

  const handleMouseUp = () => setIsDragging(false);

  // Pan tactile : sur mobile, aucun geste ne permettait d'explorer un plan de
  // 1000 px de large. Un glissé horizontal déplace la carte ; un glissé vertical
  // fait défiler la page tant que le plan n'est pas zoomé (voir `touchAction`).
  const touchDragRef = useRef<{
    id: number;
    startX: number;
    startY: number;
    startPan: { x: number; y: number };
    mode: 'pending' | 'pan' | 'scroll';
  } | null>(null);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) {
      touchDragRef.current = null;
      setIsDragging(false);
      return;
    }
    const touch = e.touches[0];
    touchDragRef.current = {
      id: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      startPan: pan,
      mode: 'pending',
    };
    if (zoom !== 1) setIsDragging(true);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const drag = touchDragRef.current;
    if (!drag) return;
    const touch = Array.from(e.touches).find(t => t.identifier === drag.id);
    if (!touch) return;
    const dx = touch.clientX - drag.startX;
    const dy = touch.clientY - drag.startY;

    if (drag.mode === 'pending') {
      // Laisse la direction du geste décider : vertical = défilement de la page.
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (zoom === 1 && Math.abs(dy) > Math.abs(dx)) {
        drag.mode = 'scroll';
        setIsDragging(false);
        return;
      }
      drag.mode = 'pan';
      setIsDragging(true);
    }
    if (drag.mode !== 'pan') return;
    setPan(clampPan({ x: drag.startPan.x + dx, y: drag.startPan.y + dy }, zoom));
  };

  const handleTouchEnd = () => {
    touchDragRef.current = null;
    setIsDragging(false);
  };

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
          setToastMessage(L.toastMaxCompare);
          setTimeout(() => setToastMessage(null), 3000);
          return prev;
        }
        return [...prev, parcelId];
      }
    });
  };

  /**
   * Génère puis télécharge la vraie fiche cadastrale (src/lib/parcelSheet.ts).
   * On passe la parcelle complète : si la sélection change pendant la
   * génération, le fichier reste celui affiché au moment du clic.
   */
  const triggerDownload = (parcel: Parcel) => {
    setDownloadingId(parcel.id);
    window.setTimeout(async () => {
      try {
        // Asynchrone : la fiche embarque la marque, qui se charge d'abord.
        await downloadParcelSheet(parcel, { language: currentLanguage, settings });
        setToastMessage(L.toastDownloaded(parcel.id));
      } catch (error) {
        console.error('[fiche-cadastrale] génération impossible', error);
        setToastMessage(L.toastError);
      } finally {
        setDownloadingId(null);
        window.setTimeout(() => setToastMessage(null), 4000);
      }
    }, 150);
  };

  const whatsappClean = settings?.whatsappCleanNumber || '33761235509';

  return (
    <div className="bg-[#FAF9F5] text-primary min-h-screen pt-24 pb-20 px-4 md:px-10 lg:px-14">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-ink-3 text-micro font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('home')}
            className="hover:text-primary transition-colors cursor-pointer py-1.5 px-1 -ml-1 min-h-[44px] inline-flex items-center"
          >
            {L.home}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-ink-3" />
          <span className="text-gold-ink">{L.breadcrumb}</span>
        </nav>

        {/* Header */}
        <header className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-[#004D40]/10 border border-[#004D40]/20 px-3 py-1 rounded-full text-[#004D40] text-micro font-bold tracking-widest uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>{L.headerBadge}</span>
          </div>
          <h1 className="font-serif text-h1 font-bold tracking-tight text-primary">
            {L.headerTitle}
          </h1>
          <p className="font-sans text-sm md:text-base text-outline leading-relaxed font-light">
            {L.headerIntro}
          </p>
        </header>

        {/* Key Indicators Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 sm:p-5 rounded-card border border-gray-300 shadow-elev-1">
          <div className="border-r border-gray-200 last:border-0 pr-3">
            <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.kpiDomain}</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-primary">54</span>
              <span className="text-xs text-outline font-sans">{L.kpiLots}</span>
            </div>
          </div>

          <div className="border-r border-gray-200 last:border-0 px-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-whatsapp" />
              <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.kpiPhase}</span>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-[#0F6B4F]">20</span>
              <span className="text-xs text-outline font-sans">{L.kpiPhaseSub}</span>
            </div>
          </div>

          <div className="border-r border-gray-200 last:border-0 px-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed" />
              <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.kpiPromo}</span>
            </div>
            {/* `flex-wrap` : la valeur reste sur une ligne, le complément passe
                dessous si la colonne est étroite (libellé long en français). */}
            <div className="flex flex-wrap items-baseline gap-x-1.5 mt-0.5">
              <span className="font-serif text-xl font-bold text-gold-ink">
                {L.kpiPromoLots}
              </span>
              <span className="text-caption text-ink-3 font-sans">{L.kpiPromoSub}</span>
            </div>
          </div>

          <div className="pl-3">
            <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.kpiFinancing}</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="font-serif text-2xl font-bold text-primary">300 €</span>
              <span className="text-xs text-outline font-sans">{L.kpiFinancingSub(referenceSchedule.duration)}</span>
            </div>
          </div>
        </div>

        {/* Filter and Search controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-card border border-gray-300 shadow-elev-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase text-outline mr-1">{L.filterLabel}</span>
            <button
              onClick={() => setActiveFilter('Phase1')}
              className={`px-3.5 min-h-[44px] inline-flex items-center rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer ${
                activeFilter === 'Phase1' ? 'bg-primary text-white shadow-elev-1' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              {L.fPhase1}
            </button>
            <button
              onClick={() => setActiveFilter('All')}
              className={`px-3.5 min-h-[44px] inline-flex items-center rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer ${
                activeFilter === 'All' ? 'bg-primary text-white shadow-elev-1' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              {L.fAll}
            </button>
            <button
              onClick={() => setActiveFilter('Promo')}
              className={`px-3.5 min-h-[44px] inline-flex items-center rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer ${
                activeFilter === 'Promo' ? 'bg-secondary-fixed text-primary shadow-elev-1' : 'bg-gray-100 text-outline hover:text-primary'
              }`}
            >
              {L.fPromo}
            </button>
            <button
              onClick={() => setActiveFilter('Green')}
              className={`px-3 min-h-[44px] rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Green' ? 'bg-[#7BA877] text-white shadow-elev-1' : 'bg-emerald-50 text-[#2B5A27] hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#7BA877]" />
              <span>{L.fGreen}</span>
            </button>
            <button
              onClick={() => setActiveFilter('Yellow')}
              className={`px-3 min-h-[44px] rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Yellow' ? 'bg-[#D8B826] text-white shadow-elev-1' : 'bg-amber-50 text-[#8C6D05] hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FDE792] border border-amber-400" />
              <span>{L.fYellow}</span>
            </button>
            <button
              onClick={() => setActiveFilter('Red')}
              className={`px-3 min-h-[44px] rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Red' ? 'bg-[#EE7558] text-white shadow-elev-1' : 'bg-rose-50 text-[#B53F24] hover:bg-rose-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#EE7558]" />
              <span>{L.fRed}</span>
            </button>
            <button
              onClick={() => setActiveFilter('Salmon')}
              className={`px-3 min-h-[44px] rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer flex items-center space-x-1 ${
                activeFilter === 'Salmon' ? 'bg-[#FA9D7A] text-white shadow-elev-1' : 'bg-orange-50 text-[#C0613C] hover:bg-orange-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FA9D7A]" />
              <span>{L.fSalmon}</span>
            </button>
          </div>

          {/* Filtres par statut commercial (Disponibles / Réservées / Vendues) */}
          <div className="flex flex-wrap items-center gap-2 w-full pt-3 mt-1 border-t border-gray-100">
            <span className="text-xs font-bold uppercase text-outline mr-1">{L.statusLabel}</span>
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
                    ? 'bg-emerald-600 text-white shadow-elev-1'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  : s === 'Reserved'
                  ? isActive
                    ? 'bg-amber-500 text-white shadow-elev-1'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : s === 'Sold'
                  ? isActive
                    ? 'bg-rose-600 text-white shadow-elev-1'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  : isActive
                  ? 'bg-primary text-white shadow-elev-1'
                  : 'bg-gray-100 text-outline hover:text-primary';
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 min-h-[44px] rounded-full text-caption font-bold transition-all duration-400 ease-spring cursor-pointer flex items-center space-x-1.5 ${pillCls}`}
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
              placeholder={L.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-9 pr-3 py-1.5 rounded-inner border border-line text-caption focus:outline-none focus:ring-1 focus:ring-primary font-sans"
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
              className="toast-safe fixed top-24 right-6 z-[var(--z-toast)] bg-primary text-white px-5 py-3 rounded-inner shadow-elev-3 text-xs font-bold flex items-center space-x-2 border border-secondary-fixed/40"
            >
              <CheckCircle className="w-4 h-4 text-secondary-fixed" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CADASTRE VIEWPORT & DETAIL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SVG CADASTRE MAP (8 COLS) */}
          <div className="lg:col-span-8 bg-white border border-gray-300 rounded-card overflow-hidden shadow-elev-1 relative">
            
            {/* Map Top Bar */}
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70">
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-[#004D40]" />
                <div>
                  <span className="text-xs font-serif font-bold text-primary block">
                    {L.mapTitle}
                  </span>
                  <span className="text-caption text-outline font-mono">
                    {L.mapSub}
                  </span>
                </div>
              </div>

              {/* View Mode Switcher + Zoom controls */}
              <div className="flex items-center space-x-2">
                {/* View Mode Switcher */}
                <div className="hidden sm:flex items-center bg-gray-200/70 p-0.5 rounded-inner text-caption font-bold">
                  <button
                    onClick={() => setCadastreViewMode('official')}
                    className={`px-3 min-h-[44px] rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                      cadastreViewMode === 'official' ? 'bg-white text-primary shadow-elev-1' : 'text-outline hover:text-primary'
                    }`}
                  >
                    {L.viewOfficial}
                  </button>
                  <button
                    onClick={() => setCadastreViewMode('status')}
                    className={`px-3 min-h-[44px] rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                      cadastreViewMode === 'status' ? 'bg-white text-primary shadow-elev-1' : 'text-outline hover:text-primary'
                    }`}
                  >
                    {L.viewStatus}
                  </button>
                  <button
                    onClick={() => setCadastreViewMode('blueprint')}
                    className={`px-3 min-h-[44px] rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                      cadastreViewMode === 'blueprint' ? 'bg-white text-primary shadow-elev-1' : 'text-outline hover:text-primary'
                    }`}
                  >
                    {L.viewBlueprint}
                  </button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center space-x-1.5 bg-white border border-gray-200 rounded-inner p-1">
                  <button
                    onClick={zoomIn}
                    className="tap-44 p-2.5 hover:bg-gray-100 rounded-micro text-primary transition-colors duration-400 cursor-pointer"
                    title={L.zoomIn}
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={zoomOut}
                    className="tap-44 p-2.5 hover:bg-gray-100 rounded-micro text-primary transition-colors duration-400 cursor-pointer"
                    title={L.zoomOut}
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="tap-44 p-2.5 hover:bg-gray-100 rounded-micro text-primary transition-colors duration-400 cursor-pointer"
                    title={L.reset}
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
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              style={{ touchAction: zoom === 1 ? 'pan-y pinch-zoom' : 'none' }}
              className={`relative h-[530px] ${
                cadastreViewMode === 'blueprint' ? 'bg-[#06182E]' : 'bg-[#EFECE6]'
              } overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '500px 340px',
                  transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
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
                    fontSize="10.5"
                    fontWeight="bold"
                    fill={cadastreViewMode === 'blueprint' ? '#93C5FD' : '#4B5563'}
                    letterSpacing="1"
                  >
                    {L.svgNorthRoad}
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
                    fontSize="10.5"
                    fontWeight="bold"
                    fill={cadastreViewMode === 'blueprint' ? '#93C5FD' : '#4B5563'}
                    letterSpacing="1"
                    transform="rotate(-90 505 390)"
                  >
                    {L.svgCentralAvenue}
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
                    // Échéancier de CE lot : chaque rectangle du plan porte son
                    // propre prix, jamais celui du lot type.
                    const parcelSchedule = scheduleFor(parcel);
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
                        strokeColor = '#0f3d2e';
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
                        className="cursor-pointer transition-all duration-200"
                        opacity={isVisible ? 1 : 0.2}
                        filter={isSelected ? 'url(#selected-glow)' : 'none'}
                      >
                        {/* Parcel polygon */}
                        <polygon
                          points={geo.points}
                          fill={fillColor}
                          stroke={isSelected ? (cadastreViewMode === 'blueprint' ? '#90E0EF' : '#0f3d2e') : strokeColor}
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
                          fontSize="10"
                          fontWeight="bold"
                          fill={isSelected ? '#FFFFFF' : (cadastreViewMode === 'official' ? textColor : '#64748B')}
                          opacity={isSelected ? 0.95 : 0.75}
                        >
                          {parcel.area} m²
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
                            fontSize="10.5"
                            fontWeight="bold"
                            fill="#FFFFFF"
                          >
                            {parcel.status === 'Sold'
                              ? L.t1Sold
                              : parcel.status === 'Reserved'
                              ? L.t1Reserved
                              : L.t1Available}
                          </text>
                        )}

                        <title>
                          {isFR
                            ? `Parcelle #${parcel.id} (${parcel.dimensions || geo.dimensions})\nZone : ${geo.zoneNameFR}\nSurface : ${parcel.area} m²\nPrix : ${parcel.price.toLocaleString()} €\nFinancement : ${parcelSchedule.deposit.toLocaleString()} € acompte + ${parcelSchedule.monthly} €/mois (${parcelSchedule.duration} mois${parcelSchedule.hasFinalBalance ? ` + solde de ${parcelSchedule.lastPayment.toLocaleString()} €` : ''})\nComptant : ${parcel.cashPrice.toLocaleString()} €`
                            : `Plot #${parcel.id} (${parcel.dimensions || geo.dimensions})\nZone: ${zoneLabel(geo.zone, geo.zoneNameFR)}\nArea: ${parcel.area} sqm\nPrice: €${parcel.price.toLocaleString()}\nFinancing: €${parcelSchedule.deposit.toLocaleString()} down + €${parcelSchedule.monthly}/month (${parcelSchedule.duration} months${parcelSchedule.hasFinalBalance ? ` + €${parcelSchedule.lastPayment.toLocaleString()} balance` : ''})\nCash: €${parcel.cashPrice.toLocaleString()}`}
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
                        fontSize="10"
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
                      fontSize={anno.fontSize || 9}
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
                          fontSize="10"
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
                    <text x="0" y="-18" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#B91C1C">N</text>
                    <text x="19" y="3" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#64748B">E</text>
                    <text x="0" y="22" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#64748B">S</text>
                    <text x="-19" y="3" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#64748B">O</text>
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
                      fontSize="11"
                      fontWeight="bold"
                      fill={cadastreViewMode === 'blueprint' ? '#90E0EF' : '#0f3d2e'}
                      fontFamily="serif"
                    >
                      {L.svgTitleBadge}
                    </text>
                    <text
                      x="12"
                      y="33"
                      fontSize="11"
                      fill={cadastreViewMode === 'blueprint' ? '#64748B' : '#64748B'}
                    >
                      {L.svgTitleSub}
                    </text>
                    <text
                      x="12"
                      y="44"
                      fontSize="10.5"
                      fill={cadastreViewMode === 'blueprint' ? '#00B4D8' : '#0F6B4F'}
                      fontWeight="bold"
                    >
                      {L.svgTitleLine3}
                    </text>
                  </g>
                </svg>
              </div>

              {/* Map floating helper */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-inner border border-gray-200 text-caption text-primary flex items-center space-x-2 shadow-elev-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{L.mapHelper}</span>
              </div>
            </div>

            {/* Cadastre Legend Bar */}
            <div className="p-3.5 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-caption">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-micro bg-[#7BA877] border border-[#4E734A]" />
                  <span className="font-bold text-primary">{L.legendWest}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-micro bg-[#FDE792] border border-[#C4A825]" />
                  <span className="font-bold text-primary">{L.legendCentral}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-micro bg-[#EE7558] border border-[#B8452A]" />
                  <span className="font-bold text-primary">{L.legendCenterEast}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-micro bg-[#FA9D7A] border border-[#C2633E]" />
                  <span className="font-bold text-primary">{L.legendEast}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-black border border-white" />
                  <span className="font-bold text-primary">{L.legendMarkers}</span>
                </div>
              </div>
              <span className="text-caption text-outline font-mono">
                {L.legendNote}
              </span>
            </div>
          </div>

          {/* PARCEL DETAIL CARD (4 COLS) */}
          <div className="lg:col-span-4 bg-white border border-gray-300 rounded-card p-6 space-y-5 shadow-elev-1">
            {selectedParcel ? (
              <div className="space-y-5">
                
                {/* Header of Card */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-micro uppercase font-mono font-bold text-gold-ink tracking-wider">
                        Sébikhotane • {selectedParcel.zoneName?.[currentLanguage] || L.zoneFallback}
                      </span>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-primary mt-1">
                      Lot #{selectedParcel.id < 10 ? `0${selectedParcel.id}` : selectedParcel.id}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {selectedParcel.status === 'Sold' ? (
                      <span className="bg-rose-100 text-rose-800 border border-rose-300 text-micro font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedParcel.id <= 20 ? L.statusSoldT1 : L.statusSold}
                      </span>
                    ) : selectedParcel.status === 'Reserved' ? (
                      <span className="bg-amber-100 text-amber-800 border border-amber-300 text-micro font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedParcel.id <= 20 ? L.statusReservedT1 : L.statusReserved}
                      </span>
                    ) : selectedParcel.id <= 20 ? (
                      <span className="bg-whatsapp/15 text-[#0F6B4F] border border-whatsapp/30 text-micro font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {L.statusAvailT1}
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-micro font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {L.statusReservable2}
                      </span>
                    )}
                    {(selectedParcel.isPromo || selectedParcel.id <= 10) && (
                      <span className="bg-secondary-fixed text-primary text-micro font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {L.promoBadge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Surface and Dimensions */}
                <div className="grid grid-cols-2 gap-3 bg-[#FAF9F5] p-3.5 rounded-card border border-gray-200">
                  <div>
                    <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.surfaceTotal}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Maximize className="w-3.5 h-3.5 text-gold-ink" />
                      <span className="font-serif text-lg font-bold text-primary">{selectedParcel.area} m²</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-micro uppercase font-bold text-outline tracking-wider block">{L.dimensionsExact}</span>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-primary" />
                      <span className="font-sans text-xs font-bold text-primary">{selectedParcel.dimensions || '15.00 m × 10.00 m'}</span>
                    </div>
                  </div>
                </div>

                {/* Cadastral Security */}
                <div className="bg-emerald-50/60 border border-emerald-200/60 p-3 rounded-inner flex items-center space-x-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#0F6B4F] shrink-0" />
                  <div className="text-xs text-[#064E3B]">
                    <strong className="block font-bold">{L.securityTitle}</strong>
                    <span>{L.securitySub}</span>
                  </div>
                </div>

                {/* Financial Offer Tabs */}
                <div className="bg-[#0f3d2e] text-white p-4.5 rounded-card space-y-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-micro font-mono uppercase tracking-wider text-secondary-fixed font-bold block">
                      {L.finTitle}
                    </span>
                    {/* Le lot, sa surface et son prix : l'échéancier ci-dessous
                        les décrit, il ne décrit pas un « lot type ». */}
                    <span className="text-caption text-white/70 font-mono">
                      {L.finScheduleFor(selectedParcel.id, selectedParcel.area, selectedParcel.price)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-white/85">{L.finInstallments}</span>
                      <strong className="text-sm font-bold text-secondary-fixed">
                        {selectedSchedule.deposit.toLocaleString()} € + {selectedSchedule.monthly} €{' '}
                        {isFR ? '/ mois' : '/ month'}
                      </strong>
                    </div>
                    <div className="text-caption text-white/70">
                      {L.finOverMonths(selectedSchedule.duration, selectedSchedule.total)}
                      {selectedSchedule.hasFinalBalance && (
                        <span className="block text-secondary-fixed">
                          {L.finFinalBalance(selectedSchedule.lastPayment)}
                        </span>
                      )}
                    </div>

                    <div className="border-t border-white/10 pt-2 flex justify-between items-baseline">
                      <span className="text-xs text-white/85">{L.finCash}</span>
                      <strong className="text-sm font-bold text-white">
                        {selectedParcel.cashPrice.toLocaleString()} €
                      </strong>
                    </div>
                    <div className="text-caption text-secondary-fixed font-mono">
                      {L.finCashNote(selectedParcel.price - selectedParcel.cashPrice)}
                    </div>
                  </div>
                </div>

                {/* Badges of trust */}
                <div className="space-y-1.5 text-xs text-on-surface-variant font-light">
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>{L.trust1}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>{L.trust2}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-primary font-medium">
                    <CheckCircle className="w-4 h-4 text-[#0F6B4F] shrink-0" />
                    <span>{L.trust3}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2 border-t border-gray-200">
                  {/* WhatsApp Direct */}
                  <a
                    href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(
                      L.waReserveMessage(
                        selectedParcel.id,
                        selectedParcel.area,
                        selectedParcel.dimensions || '—',
                        selectedParcel.zoneName?.[currentLanguage] || 'Sébikhotane'
                      )
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-whatsapp hover:bg-[#128c4a] text-white py-3.5 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-elev-1"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>{L.waReserve}</span>
                  </a>

                  <div className="grid grid-cols-2 gap-2">
                    {/* 3D Virtual Tour Button */}
                    <button
                      onClick={() => setTourParcel(selectedParcel)}
                      className="w-full bg-[#004D40]/10 hover:bg-[#004D40]/20 text-[#004D40] py-3 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{L.tour3d}</span>
                    </button>

                    {/* Share Parcel Button */}
                    <button
                      onClick={() => setShareParcel(selectedParcel)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-primary py-3 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{L.share}</span>
                    </button>
                  </div>

                  {/* Download Spec Sheet */}
                  <button
                    onClick={() => triggerDownload(selectedParcel)}
                    disabled={downloadingId !== null}
                    className="w-full min-h-[44px] bg-white border border-gray-200 hover:bg-gray-50 text-primary py-2.5 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {downloadingId === selectedParcel.id ? (
                      <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-gold-ink" />
                    )}
                    <span>{L.downloadSheet}</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="py-section text-center text-outline">
                {L.selectParcel}
              </div>
            )}
          </div>

        </div>

        {/* FINANCIAL SIMULATOR INTERACTIVE TABLE */}
        <section className="bg-white p-6 md:p-8 rounded-card border border-gray-300 shadow-elev-1 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-[#004D40]">
                <Calculator className="w-4 h-4" />
                <span className="text-micro uppercase font-bold tracking-wider font-mono">
                  {L.simTag}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-primary">
                {L.simTitle}
              </h3>
              <p className="text-xs text-outline font-light">
                {L.simDesc}
              </p>
              {selectedParcel && (
                <p className="text-micro font-mono font-bold uppercase tracking-wider text-gold-ink">
                  {L.simScope(selectedParcel.id, selectedParcel.area)}
                </p>
              )}
            </div>

            <span className="text-xs bg-secondary-fixed/20 text-[#0f3d2e] font-bold px-3 py-1.5 rounded-inner self-start md:self-auto">
              {L.simNoFees}
            </span>
          </div>

          {/* Interactive Tier Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(settings.content?.paymentTiers ?? PAYMENT_SCHEDULE_TIERS).map((tier, idx) => {
              const isSelected = selectedTierIdx === idx;
              // Reste, durée et dernier versement sont dérivés : seuls l'acompte
              // et la mensualité saisis font foi.
              // Le prix du lot sélectionné pilote la grille : afficher les
              // montants du lot type à côté d'un lot qui en diffère serait la
              // même incohérence que l'on vient de retirer de la fiche.
              const row = buildPaymentSchedule(
                selectedPrice,
                Math.min(tier.deposit, selectedPrice),
                tier.monthly > 0 ? tier.monthly : settings.defaultMonthly
              );
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTierIdx(idx)}
                  className={`p-5 rounded-card border transition-all cursor-pointer select-none space-y-3 ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-elev-2'
                      : 'bg-[#FAF9F5] text-primary border-gray-300 hover:border-primary/60 shadow-elev-1'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-micro font-mono font-bold uppercase tracking-wider ${isSelected ? 'text-secondary-fixed' : 'text-outline'}`}>
                      {L.simOption} {idx + 1}
                    </span>
                    {idx === 0 && (
                      <span className={`text-micro px-2 py-0.5 rounded-full font-bold uppercase ${isSelected ? 'bg-secondary-fixed text-primary' : 'bg-primary text-white'}`}>
                        {L.simPopular}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-micro uppercase font-bold opacity-70 block">{L.simDeposit}</span>
                    <span className="font-serif text-2xl font-bold">{row.deposit.toLocaleString()} €</span>
                  </div>

                  <div className="border-t border-current/10 pt-2.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-80">{L.simRemaining}</span>
                      <strong>{row.remaining.toLocaleString()} €</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">{L.simMonthly}</span>
                      <strong className={isSelected ? 'text-secondary-fixed' : 'text-[#0F6B4F]'}>
                        {row.monthly} {L.perMonth}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">{L.simDuration}</span>
                      <strong>{row.duration > 0 ? `${row.duration} ${L.months}` : '—'}</strong>
                    </div>
                    {row.hasFinalBalance && (
                      <div className="flex justify-between">
                        <span className="opacity-80">{L.simFinalBalance}</span>
                        <strong className={isSelected ? 'text-secondary-fixed' : 'text-[#0F6B4F]'}>
                          {row.lastPayment.toLocaleString()} €
                        </strong>
                      </div>
                    )}
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
              <h3 className="font-serif text-h3 font-bold text-primary">
                {L.dirTitle}
              </h3>
              <p className="text-xs text-outline font-light">
                {L.dirDesc}
              </p>
            </div>

            {/* Toggle between Tranche 1 and All 54 */}
            <div className="flex items-center bg-gray-200/80 p-1 rounded-card text-xs font-bold self-start sm:self-auto">
              <button
                onClick={() => {
                  setGridTab('phase1');
                  setActiveFilter('Phase1');
                }}
                className={`px-4 min-h-[44px] inline-flex items-center rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                  gridTab === 'phase1'
                    ? 'bg-primary text-white shadow-elev-1'
                    : 'text-outline hover:text-primary'
                }`}
              >
                {L.dirPhase1}
              </button>
              <button
                onClick={() => {
                  setGridTab('all');
                  setActiveFilter('All');
                }}
                className={`px-4 min-h-[44px] inline-flex items-center rounded-full transition-all duration-400 ease-spring cursor-pointer ${
                  gridTab === 'all'
                    ? 'bg-primary text-white shadow-elev-1'
                    : 'text-outline hover:text-primary'
                }`}
              >
                {L.dirAll}
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
                  className={`p-3.5 rounded-card border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-[#0f3d2e] text-white border-[#0f3d2e] shadow-elev-2 ring-2 ring-secondary-fixed'
                      : 'bg-white text-primary border-gray-300 hover:border-primary hover:shadow-elev-1'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-serif font-bold text-base">
                      Lot #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${isPhase1 ? 'bg-whatsapp' : 'bg-amber-400'}`} />
                  </div>

                  {/* Zone and Dimensions */}
                  <div className="space-y-1">
                    <span className={`text-micro font-bold px-2 py-0.5 rounded-full inline-block ${
                      isSelected ? 'bg-white/20 text-white' : zoneBadgeClass
                    }`}>
                      {parcel.zoneName?.[currentLanguage] || L.zoneFallback}
                    </span>
                    <div className="text-caption flex justify-between opacity-80 font-mono">
                      <span>{parcel.dimensions || '15 × 10 m'}</span>
                      <span>{parcel.area} m²</span>
                    </div>
                  </div>

                  {/* Pricing / Promo */}
                  <div className="border-t border-current/10 pt-2 flex justify-between items-center text-xs">
                    <span className="font-bold">300 €/m</span>
                    {parcel.status === 'Sold' ? (
                      <span className="text-micro font-bold px-1.5 py-0.5 rounded-micro uppercase tracking-wider bg-rose-100 text-rose-800">
                        {L.sold}
                      </span>
                    ) : parcel.status === 'Reserved' ? (
                      <span className="text-micro font-bold px-1.5 py-0.5 rounded-micro uppercase tracking-wider bg-amber-100 text-amber-800">
                        {L.reserved}
                      </span>
                    ) : isPromo ? (
                      <span className={`text-micro font-bold px-1.5 py-0.5 rounded-micro uppercase tracking-wider ${
                        isSelected ? 'bg-secondary-fixed text-primary' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        ⭐ Promo
                      </span>
                    ) : (
                      <span className="text-micro opacity-70">
                        {isPhase1 ? L.t1Avail : L.t2}
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
