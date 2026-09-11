import { Language, Parcel, SiteSettings } from '../types';
import { PdfDocument, savePdf } from './pdf';

/**
 * Fiche cadastrale d'une parcelle, générée côté client.
 *
 * Le bouton « Télécharger Fiche Cadastrale PDF » de `MasterPlanPage` promettait
 * un fichier mais n'affichait qu'un toast : ce module produit le vrai document.
 * Aucune donnée n'est envoyée à un serveur, donc la fiche reste disponible même
 * si Supabase est injoignable (mode hors-ligne / première visite).
 */

interface Copy {
  title: string;
  subtitle: string;
  lotLabel: string;
  statusLine: string;
  identification: string;
  legal: string;
  finance: string;
  installment: string;
  installmentDetail: string;
  cash: string;
  cashDetail: string;
  disclaimer: string;
  generatedOn: string;
  contact: string;
  status: Record<Parcel['status'], string>;
  fields: {
    reference: string;
    area: string;
    dimensions: string;
    zone: string;
    status: string;
    orientation: string;
  };
}

const COPY: Record<Language, Copy> = {
  FR: {
    title: 'FICHE TECHNIQUE CADASTRALE',
    subtitle: 'Plan Cadastral Officiel • Domaine de Sébikhotane',
    lotLabel: 'LOT / PARCELLE',
    statusLine: 'Bornage certifié B1 à B17 • Voirie 12 m • Attribution municipale',
    identification: 'IDENTIFICATION DE LA PARCELLE',
    legal: 'SÉCURISATION JURIDIQUE',
    finance: 'MODALITÉS DE FINANCEMENT',
    installment: 'Option échelonnée',
    installmentDetail: 'Sans intérêts bancaires — accompagnement jusqu\u2019à la mutation',
    cash: 'Paiement comptant',
    cashDetail: 'Remise immédiate pour un règlement en une fois',
    disclaimer:
      'Document informatif généré automatiquement à partir du plan cadastral du géomètre '
      + 'expert. Il ne tient pas lieu de titre de propriété : seule la délibération municipale '
      + 'et l\u2019attribution du NICAD (Numéro d\u2019Identification Cadastral) valent preuve d\u2019affectation.',
    generatedOn: 'Édité le',
    contact: 'Contact',
    status: {
      Available: 'Disponible',
      Reserved: 'Réservé',
      Sold: 'Vendu',
    },
    fields: {
      reference: 'Référence cadastrale',
      area: 'Surface totale',
      dimensions: 'Dimensions exactes',
      zone: 'Zone / Tranche',
      status: 'Statut commercial',
      orientation: 'Orientation',
    },
  },
  EN: {
    title: 'CADASTRAL TECHNICAL SHEET',
    subtitle: 'Official Cadastral Plan • Sebikhotane Estate',
    lotLabel: 'LOT / PARCEL',
    statusLine: 'Certified boundary stones B1\u2013B17 • 12 m roadway • Municipal allocation',
    identification: 'PARCEL IDENTIFICATION',
    legal: 'LEGAL SECURITY',
    finance: 'PAYMENT OPTIONS',
    installment: 'Instalment plan',
    installmentDetail: 'No bank interest — assistance up to final transfer',
    cash: 'Cash payment',
    cashDetail: 'Immediate discount for a single payment',
    disclaimer:
      'Informational document generated from the licensed surveyor cadastral plan. It is not a '
      + 'title deed: only the municipal deliberation and the state NICAD (National Cadastral '
      + 'Identification Number) certify the land allocation.',
    generatedOn: 'Generated on',
    contact: 'Contact',
    status: {
      Available: 'Available',
      Reserved: 'Reserved',
      Sold: 'Sold',
    },
    fields: {
      reference: 'Cadastral reference',
      area: 'Total area',
      dimensions: 'Exact dimensions',
      zone: 'Zone / Phase',
      status: 'Sales status',
      orientation: 'Orientation',
    },
  },
};

const INK = '#1B1B18';
const MUTED = '#7C776C';
const RULE = '#DDD6C9';
const BRAND = '#00352A';
const BRAND_LIGHT = '#0F6B4F';
const GOLD = '#C9A227';

export interface ParcelSheetOptions {
  language?: Language;
  settings?: SiteSettings;
  generatedAt?: Date;
}

function zoneLabel(parcel: Parcel, language: Language): string {
  const name = parcel.zoneName?.[language];
  const tranche = parcel.id <= 20 ? (language === 'FR' ? 'Tranche 1' : 'Phase 1') : (language === 'FR' ? 'Tranche 2' : 'Phase 2');
  if (!name) return tranche;
  return `${name} • ${tranche}`;
}

function statusLabel(parcel: Parcel, language: Language): string {
  return COPY[language].status[parcel.status] ?? COPY[language].status.Available;
}

function euros(amount: number, language: Language): string {
  const formatted = new Intl.NumberFormat(language === 'FR' ? 'fr-FR' : 'en-GB', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} €`;
}

/** Installe une police d'écriture « section » : titre gris + filet de séparation. */
function section(doc: PdfDocument, title: string, y: number, margin: number, contentWidth: number): number {
  doc.text(margin, y, title, { size: 8, bold: true, color: MUTED });
  doc.strokeLine(margin, y - 6, margin + contentWidth, y - 6, RULE, 0.6);
  return y - 24;
}

/** Construit le document PDF de la fiche cadastrale. */
export function buildParcelSheet(parcel: Parcel, options: ParcelSheetOptions = {}): PdfDocument {
  const language: Language = options.language ?? 'FR';
  const copy = COPY[language];
  const settings = options.settings;
  const generatedAt = options.generatedAt ?? new Date();

  const doc = new PdfDocument();
  const margin = 46;
  const contentWidth = doc.width - margin * 2;
  const { height } = doc;

  // ---------------------------------------------------------------- En-tête
  doc.fillRect(0, height - 116, doc.width, 116, BRAND);
  doc.fillRect(0, height - 122, doc.width, 6, GOLD);

  doc.text(margin, height - 52, copy.title, { size: 18, bold: true, color: '#FFFFFF' });
  doc.text(margin, height - 72, copy.subtitle, { size: 9.5, color: '#8FD5C1' });
  doc.text(margin, height - 92, settings?.companyName || 'Sénégal Immobilier Consulting', {
    size: 9,
    color: '#FFFFFF',
  });

  const reference = String(parcel.id).padStart(3, '0');
  doc.text(doc.width - margin, height - 40, copy.lotLabel, { size: 7.5, bold: true, color: GOLD, align: 'right' });
  doc.text(doc.width - margin, height - 68, `N° ${reference}`, { size: 26, bold: true, color: '#FFFFFF', align: 'right' });
  doc.text(doc.width - margin, height - 86, copy.statusLine.split(' • ')[0], {
    size: 8.5,
    color: '#8FD5C1',
    align: 'right',
    maxWidth: contentWidth * 0.55,
  });

  // Bandeau de statut
  let cursor = height - 156;
  doc.fillRect(margin, cursor - 6, contentWidth, 26, '#F1EFE7');
  doc.text(margin + 12, cursor + 3, `${copy.status[parcel.status]} • ${zoneLabel(parcel, language)}`, {
    size: 10,
    bold: true,
    color: BRAND_LIGHT,
    maxWidth: contentWidth - 24,
  });
  doc.text(margin + contentWidth - 12, cursor + 3, copy.statusLine, {
    size: 8,
    color: MUTED,
    align: 'right',
    maxWidth: contentWidth * 0.5,
  });

  // --------------------------------------------------------- Identification
  cursor -= 44;
  cursor = section(doc, copy.identification, cursor, margin, contentWidth);

  const fields: Array<[string, string]> = [
    [copy.fields.reference, `N° ${reference} • ${parcel.id <= 20 ? (language === 'FR' ? 'Tranche 1' : 'Phase 1') : (language === 'FR' ? 'Tranche 2' : 'Phase 2')}`],
    [copy.fields.area, `${parcel.area} m²`],
    [copy.fields.dimensions, parcel.dimensions || '15.00 m × 10.00 m'],
    [copy.fields.zone, zoneLabel(parcel, language)],
    [copy.fields.status, statusLabel(parcel, language)],
    [copy.fields.orientation, parcel.orientation?.[language] || '—'],
  ];

  const columnWidth = contentWidth / 2;
  fields.forEach(([label, value], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * columnWidth;
    const y = cursor - row * 46;
    doc.text(x, y, label.toUpperCase(), { size: 7.5, bold: true, color: MUTED, maxWidth: columnWidth - 14 });
    doc.text(x, y - 15, value, { size: 10.5, bold: true, color: INK, maxWidth: columnWidth - 14 });
  });

  // ------------------------------------------------------- Sécurisation
  cursor -= Math.ceil(fields.length / 2) * 46 + 12;
  cursor = section(doc, copy.legal, cursor, margin, contentWidth);

  const perks = parcel.perks?.[language]?.length ? parcel.perks[language] : parcel.perks?.FR ?? [];
  const bullets = perks.filter(Boolean).slice(0, 6);
  bullets.forEach((perk) => {
    doc.fillRect(margin + 1.5, cursor + 3.5, 3.5, 3.5, BRAND_LIGHT);
    cursor = doc.paragraph(margin + 14, cursor, contentWidth - 14, perk, { size: 9.5, color: INK, lineHeight: 13 }) - 4;
  });

  // -------------------------------------------------------- Financement
  cursor -= 10;
  cursor = section(doc, copy.finance, cursor, margin, contentWidth);

  const deposit = Math.round(parcel.price / 5);
  const months = 40;
  const monthly = Math.round((parcel.price - deposit) / months / 10) * 10;
  const boxWidth = (contentWidth - 12) / 2;
  const boxHeight = 74;

  doc.fillRect(margin, cursor - boxHeight + 22, boxWidth, boxHeight, BRAND);
  doc.text(margin + 14, cursor, copy.installment.toUpperCase(), { size: 7.5, bold: true, color: '#8FD5C1', maxWidth: boxWidth - 28 });
  doc.text(margin + 14, cursor - 20, `${euros(deposit, language)} + ${euros(monthly, language)}/${language === 'FR' ? 'mois' : 'month'}`, {
    size: 13,
    bold: true,
    color: '#FFFFFF',
    maxWidth: boxWidth - 28,
  });
  doc.paragraph(margin + 14, cursor - 38, boxWidth - 28, `${months} ${language === 'FR' ? 'mensualités — coût total' : 'instalments — total cost'} ${euros(parcel.price, language)}`, {
    size: 8,
    color: '#B9D6CC',
    lineHeight: 11,
  });

  const cashX = margin + boxWidth + 12;
  doc.fillRect(cashX, cursor - boxHeight + 22, boxWidth, boxHeight, '#F1EFE7');
  doc.text(cashX + 14, cursor, copy.cash.toUpperCase(), { size: 7.5, bold: true, color: MUTED, maxWidth: boxWidth - 28 });
  doc.text(cashX + 14, cursor - 20, euros(parcel.cashPrice, language), {
    size: 13,
    bold: true,
    color: BRAND_LIGHT,
    maxWidth: boxWidth - 28,
  });
  doc.paragraph(cashX + 14, cursor - 38, boxWidth - 28, copy.cashDetail, { size: 8, color: MUTED, lineHeight: 11 });

  cursor -= boxHeight + 12;

  // ------------------------------------------------------------ Avertissement
  doc.paragraph(margin, cursor, contentWidth, copy.disclaimer, { size: 7.5, color: MUTED, lineHeight: 11 });

  // ---------------------------------------------------------------- Pied
  const dateLabel = generatedAt.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  doc.strokeLine(margin, 78, doc.width - margin, 78, RULE, 0.6);
  const contactBits = [
    settings?.whatsappNumber,
    settings?.contactEmail,
    settings?.contactAddress,
  ].filter(Boolean) as string[];
  doc.text(margin, 62, `${copy.contact} : ${contactBits.join(' • ') || 'globalequalite@gmail.com'}`, {
    size: 8.5,
    color: INK,
    maxWidth: contentWidth - 150,
  });
  doc.text(doc.width - margin, 62, `${copy.generatedOn} ${dateLabel}`, { size: 8.5, color: MUTED, align: 'right' });
  doc.text(margin, 48, 'Sénégal Immobilier Consulting • Sébikhotane, Région de Dakar (Sénégal)', {
    size: 7.5,
    color: MUTED,
    maxWidth: contentWidth,
  });

  return doc;
}

/** Construit puis télécharge la fiche cadastrale d'une parcelle. */
export function downloadParcelSheet(parcel: Parcel, options: ParcelSheetOptions = {}): string {
  const doc = buildParcelSheet(parcel, options);
  const filename = `fiche-cadastrale-lot-${String(parcel.id).padStart(3, '0')}-sebikhotane.pdf`;
  savePdf(doc, filename);
  return filename;
}
