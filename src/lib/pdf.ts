/**
 * Générateur PDF minimaliste, sans dépendance.
 *
 * Le site n'embarque volontairement aucune librairie PDF (jsPDF & co. pèsent
 * plusieurs centaines de ko). Les fiches produites ici sont des pages A4
 * simples : la norme PDF est écrite à la main, en texte non compressé avec
 * l'encodage WinAnsi (d'où la gestion explicite des accents français).
 *
 * Le document produit est **100 % ASCII** (les caractères hors ASCII sont
 * encodés en échappements octaux \ddd), donc `build()` peut être converti en
 * Blob directement : `new Blob([pdf.build()], { type: 'application/pdf' })`.
 */

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

/** Caractères WinAnsi dont le point de code Unicode diffère de l'octet visé. */
const WIN_ANSI_OVERRIDES: Record<string, number> = {
  '\u20ac': 0x80, // €
  '\u201a': 0x82,
  '\u0192': 0x83,
  '\u201e': 0x84,
  '\u2026': 0x85, // …
  '\u2020': 0x86,
  '\u2021': 0x87,
  '\u02c6': 0x88,
  '\u2030': 0x89,
  '\u0160': 0x8a,
  '\u2039': 0x8b,
  '\u0152': 0x8c, // Œ
  '\u2018': 0x91, // ‘
  '\u2019': 0x92, // ’
  '\u201c': 0x93, // “
  '\u201d': 0x94, // ”
  '\u2022': 0x95, // •
  '\u2013': 0x96, // –
  '\u2014': 0x97, // —
  '\u2122': 0x99,
  '\u0161': 0x9a,
  '\u203a': 0x9b,
  '\u0153': 0x9c, // œ
  '\u0178': 0x9f,
};

/** Largeurs Helvetica (unités /1000) pour l'ASCII imprimable. */
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];

const ASCII_START = 32;

/**
 * Espaces exotiques : WinAnsi n'en connaît qu'une, l'espace simple.
 * `Intl.NumberFormat` insère par exemple une espace fine insécable (U+202F)
 * dans « 3 000 € » — sans cette conversion, elle s'écrit « 3?000 € ».
 */
const SPACE_LIKE = /[\u00a0\u1680\u2000-\u200b\u202f\u205f\u3000]/;

/**
 * Nettoie un texte avant de le mesurer et de l'écrire.
 *
 * Deux corrections, apprises à l'usage : les espaces exotiques deviennent une
 * espace simple, et les pictogrammes (emoji des puces, flèches, symboles
 * techniques) sont **retirés** au lieu d'être remplacés par « ? ». Un « ? » en
 * tête de puce (« ? Offre 10 Premiers ») abîme la phrase ; la puce est de toute
 * façon dessinée à part. Les caractères typographiques de WinAnsi (€ – — ’ “ ”
 * • œ…) sont préservés, eux.
 */
function cleanForPdf(value: string): string {
  let out = '';
  for (const char of value) {
    if (SPACE_LIKE.test(char)) {
      out += ' ';
      continue;
    }
    const code = char.codePointAt(0) ?? 0;
    if (code >= 0x2190 && WIN_ANSI_OVERRIDES[char] === undefined) continue;
    out += char;
  }
  return out;
}

/** Largeur approximative d'un caractère, en points, pour une taille donnée. */
function charWidth(char: string, size: number, bold: boolean): number {
  const code = char.charCodeAt(0);
  let units: number;

  if (code >= ASCII_START && code < ASCII_START + HELVETICA_WIDTHS.length) {
    units = HELVETICA_WIDTHS[code - ASCII_START];
  } else {
    // Accents et ligatures : on retombe sur la largeur de la lettre de base.
    const base = char.normalize('NFD')[0];
    const baseCode = base.charCodeAt(0);
    units = baseCode >= ASCII_START && baseCode < ASCII_START + HELVETICA_WIDTHS.length
      ? HELVETICA_WIDTHS[baseCode - ASCII_START]
      : 556;
  }

  return (units / 1000) * size * (bold ? 1.06 : 1);
}

/**
 * Image JPEG embarquée dans le document.
 *
 * Le PDF ne sait pas lire un PNG : il embarque du JPEG (`/DCTDecode`), des
 * octets tels quels, sans recompression. Une marque à fond transparent doit
 * donc être **composée sur la couleur de son support** avant d'arriver ici —
 * voir `renderBrandLogoOn` dans `parcelSheet.ts`.
 */
export interface PdfImage {
  width: number;
  height: number;
  data: Uint8Array;
}

export interface PdfTextOptions {
  size?: number;
  bold?: boolean;
  color?: string;
  /** Largeur maximale : le texte est tronqué avec « … » si nécessaire. */
  maxWidth?: number;
  align?: 'left' | 'right';
}

export class PdfDocument {
  private ops: string[] = [];
  readonly width: number;
  readonly height: number;

  constructor(width: number = A4_WIDTH, height: number = A4_HEIGHT) {
    this.width = width;
    this.height = height;
  }

  get cursor(): string[] {
    return this.ops;
  }

  /* ---------------------------------------------------------------- Images */

  private images: PdfImage[] = [];

  /**
   * Pose une image JPEG. `x`/`y` sont le coin **bas-gauche**, en points.
   * Une image déjà posée n'est embarquée qu'une fois.
   */
  drawImage(x: number, y: number, w: number, h: number, image: PdfImage): this {
    let index = this.images.indexOf(image);
    if (index === -1) {
      this.images.push(image);
      index = this.images.length - 1;
    }
    this.ops.push(
      `q ${round(w)} 0 0 ${round(h)} ${round(x)} ${round(y)} cm /Im${index + 1} Do Q`
    );
    return this;
  }

  /** Largeur d'une image à une hauteur donnée, ratio préservé. */
  static imageWidth(image: PdfImage, height: number): number {
    return height * (image.width / image.height);
  }

  private static rgb(hex: string): string {
    const clean = hex.replace('#', '');
    const int = parseInt(clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean, 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;
    return `${round(r)} ${round(g)} ${round(b)}`;
  }

  /** Mesure la largeur d'un texte. */
  measure(value: string, size: number, bold = false): number {
    let total = 0;
    for (const char of cleanForPdf(value)) total += charWidth(char, size, bold);
    return total;
  }

  /** Tronque un texte pour qu'il tienne dans `maxWidth`. */
  truncate(value: string, maxWidth: number, size: number, bold = false): string {
    if (this.measure(value, size, bold) <= maxWidth) return value;
    let out = '';
    for (const char of value) {
      if (this.measure(`${out}${char}…`, size, bold) > maxWidth) break;
      out += char;
    }
    return `${out.trimEnd()}…`;
  }

  /** Découpe un texte en lignes qui tiennent dans `maxWidth`. */
  wrap(value: string, maxWidth: number, size: number, bold = false): string[] {
    const lines: string[] = [];
    let current = '';
    for (const word of value.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (this.measure(candidate, size, bold) <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  fillRect(x: number, y: number, w: number, h: number, color: string): this {
    this.ops.push(`${PdfDocument.rgb(color)} rg ${round(x)} ${round(y)} ${round(w)} ${round(h)} re f`);
    return this;
  }

  strokeLine(x1: number, y1: number, x2: number, y2: number, color: string, width = 0.75): this {
    this.ops.push(
      `${PdfDocument.rgb(color)} RG ${round(width)} w ${round(x1)} ${round(y1)} m ${round(x2)} ${round(y2)} l S`
    );
    return this;
  }

  /** Écrit une ligne de texte ; `y` est la ligne de base. */
  text(x: number, y: number, value: string, options: PdfTextOptions = {}): this {
    const { size = 10, bold = false, color = '#000000', maxWidth, align = 'left' } = options;
    const normalized = cleanForPdf(value);
    const content = maxWidth ? this.truncate(normalized, maxWidth, size, bold) : normalized;
    if (!content) return this;
    const left = align === 'right'
      ? x - this.measure(content, size, bold)
      : x;
    const font = bold ? '/F2' : '/F1';
    this.ops.push(
      `${PdfDocument.rgb(color)} rg BT ${font} ${round(size)} Tf ${round(left)} ${round(y)} Td (${pdfLiteral(content)}) Tj ET`
    );
    return this;
  }

  /** Écrit un paragraphe et renvoie l'ordonnée de la ligne suivante. */
  paragraph(
    x: number,
    y: number,
    maxWidth: number,
    value: string,
    options: PdfTextOptions & { lineHeight?: number } = {}
  ): number {
    const { size = 10, lineHeight = size * 1.45 } = options;
    let cursor = y;
    for (const line of this.wrap(cleanForPdf(value), maxWidth, size, options.bold)) {
      this.text(x, cursor, line, { ...options, maxWidth: undefined });
      cursor -= lineHeight;
    }
    return cursor;
  }

  /**
   * Sérialise le document en PDF (ASCII pur).
   *
   * À réserver aux documents sans image : un JPEG n'est pas du texte, donc
   * `buildParts()` (ou `savePdf()`) est alors la bonne porte de sortie.
   */
  build(): string {
    const parts = this.buildParts();
    if (parts.some((part) => typeof part !== 'string')) {
      throw new Error(
        'Ce document embarque une image : utiliser buildParts() ou savePdf(), le PDF n’est plus ASCII.'
      );
    }
    return parts.join('');
  }

  /**
   * Sérialise le document en morceaux prêts pour un `Blob`.
   *
   * Les images sont insérées comme octets bruts, pas comme texte : c'est la
   * seule façon d'embarquer un JPEG sans le réencoder en base 64. Les
   * décalages de la table `xref` sont comptés en OCTETS ; les morceaux texte
   * étant ASCII, `length` y vaut bien un nombre d'octets.
   */
  buildParts(): BlobPart[] {
    const parts: BlobPart[] = [];
    let offset = 0;
    const push = (chunk: string | Uint8Array): void => {
      parts.push(chunk as BlobPart);
      offset += typeof chunk === 'string' ? chunk.length : chunk.byteLength;
    };

    const stream = `${this.ops.join('\n')}\n`;

    // Ressources de la page : les polices, plus les images réellement posées.
    const xObjects = this.images
      .map((_, index) => `/Im${index + 1} ${7 + index} 0 R`)
      .join(' ');
    const xObjectDict = this.images.length ? ` /XObject << ${xObjects} >>` : '';

    const objects: Array<Array<string | Uint8Array>> = [
      ['<< /Type /Catalog /Pages 2 0 R >>'],
      ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>'],
      [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${round(this.width)} ${round(this.height)}] `
        + `/Resources << /Font << /F1 5 0 R /F2 6 0 R >>${xObjectDict} >> /Contents 4 0 R >>`],
      [`<< /Length ${stream.length} >>\nstream\n`, stream, 'endstream'],
      ['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'],
      ['<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'],
      ...this.images.map((image) => [
        `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} `
          + `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.data.byteLength} >>\nstream\n`,
        image.data,
        '\nendstream',
      ]),
    ];

    push('%PDF-1.4\n');
    const offsets: number[] = [];
    objects.forEach((chunks, index) => {
      offsets.push(offset);
      push(`${index + 1} 0 obj\n`);
      chunks.forEach(push);
      push('\nendobj\n');
    });

    const xrefStart = offset;
    push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
    offsets.forEach((objectOffset) => {
      push(`${String(objectOffset).padStart(10, '0')} 00000 n \n`);
    });
    push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);
    return parts;
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Échappe un texte pour un littéral PDF (octal `\ddd` hors ASCII). */
function pdfLiteral(value: string): string {
  let out = '';
  for (const char of value) {
    if (char === '(' || char === ')' || char === '\\') {
      out += `\\${char}`;
      continue;
    }
    const code = char.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      out += char;
      continue;
    }
    const override = WIN_ANSI_OVERRIDES[char];
    const byte = override ?? (code <= 0xff ? code : 0x3f);
    out += `\\${byte.toString(8).padStart(3, '0')}`;
  }
  return out;
}

/** Déclenche le téléchargement d'un document PDF dans le navigateur. */
export function savePdf(doc: PdfDocument, filename: string): void {
  const blob = new Blob(doc.buildParts(), { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Laisse au navigateur le temps de consommer l'URL avant révocation.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
