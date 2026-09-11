/**
 * Module ÉDITEUR UNIQUEMENT — ne jamais l'importer depuis le site public.
 *
 * Définit le champ `richtext` enrichi (TipTap) : gras/italique/listes/liens
 * natifs de Puck + COULEURS, POLICES, TAILLES et SURlIGNAGE via des extensions
 * TipTap supplémentaires. `withRichText()` transforme `puckConfig` en une
 * copie où les champs titres/descriptions deviennent des éditeurs WYSIWYG.
 *
 * Le site public continue d'utiliser `puckConfig` (champs simples) : il rend
 * les valeurs richtext comme du HTML via `<RichText />` (voir
 * `src/components/RichText.tsx`) sans embarquer TipTap dans le bundle public.
 */
import { Extension } from '@tiptap/core';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { RichTextMenu } from '@puckeditor/core';
import type { Config, Field } from '@puckeditor/core';
import { Highlighter, Link as LinkIcon } from 'lucide-react';
// Styles de la barre d'outils (contrôles police/taille/couleur/surlignage).
// Chargés uniquement avec le chunk lazy de l'éditeur — jamais sur le site public.
import './richText.css';

/* ------------------------------------------------------------------ */
/* Extension Taille de police (pas d'extension officielle @tiptap —    */
/* le package npm est déprécié ; on étend TextStyle, comme la doc      */
/* officielle le recommande)                                           */
/* ------------------------------------------------------------------ */

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: Record<string, unknown>) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

/* ------------------------------------------------------------------ */
/* Presets de la barre d'outils                                        */
/* ------------------------------------------------------------------ */

const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: 'Sans-serif (défaut)', value: 'inherit' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier', value: '"Courier New", Courier, monospace' },
];

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '36', '48'];

const TEXT_COLORS = [
  '#111111',
  '#475569',
  '#b91c1c',
  '#c2410c',
  '#d97706',
  '#FED65B',
  '#16a34a',
  '#0369a1',
  '#1d4ed8',
  '#6d28d9',
];

const HIGHLIGHT_COLORS = ['#FEF08A', '#FED65B', '#BBF7D0', '#BFDBFE', '#FBCFE8'];

/** État exposé à la barre d'outils via `tiptap.selector`. */
interface RichTextUiState {
  fontFamily: string | undefined;
  fontSize: string | undefined;
  color: string | undefined;
  isHighlight: boolean;
  canHighlight: boolean;
  isLink: boolean;
}

// Le type déclaré par Puck est `Partial<Record<string, boolean>>`, mais il
// accepte n'importe quelle valeur au runtime (voir `EditorState`). On caste
// pour transporter les chaînes (police, taille, couleur).
const selector = ((ctx: any, readOnlyParam?: boolean) => {
  const editor = ctx?.editor as any;
  // readOnly peut arriver en 2ᵉ argument ou dans le snapshot selon la version.
  const readOnly = readOnlyParam ?? ctx?.readOnly;
  return {
    fontFamily: editor?.getAttributes('textStyle').fontFamily as string | undefined,
    fontSize: editor?.getAttributes('textStyle').fontSize as string | undefined,
    color: editor?.getAttributes('textStyle').color as string | undefined,
    isHighlight: editor?.isActive('highlight') ?? false,
    canHighlight: !readOnly && Boolean(editor?.can().chain().toggleHighlight().run()),
    isLink: editor?.isActive('link') ?? false,
  };
}) as any;

/* ------------------------------------------------------------------ */
/* Fabrique de champ                                                   */
/* ------------------------------------------------------------------ */

/**
 * Champ `richtext` enrichi. À utiliser dans `withRichText()` pour les
 * champs titres/descriptions ; le panneau de props affiche un éditeur
 * WYSIWYG avec gras, italique, souligné, listes, liens, alignement,
 * titres (Puck natif) + police, taille, couleur, surlignage (TipTap).
 */
export function richText(label: string): Field {
  return {
    type: 'richtext',
    label,
    // Canevas en lecture seule : l'édition se fait dans le panneau WYSIWYG.
    // (Passer à `true` activerait l'édition inline directement sur la page.)
    contentEditable: false,
    initialHeight: 140,
    tiptap: {
      selector,
      extensions: [
        TextStyle,
        Color,
        FontFamily,
        FontSize,
        Highlight.configure({ multicolor: true }),
      ],
    },
    renderMenu: ({ children, editor, editorState }) => {
      const ui = editorState as unknown as RichTextUiState | null;
      return (
        <RichTextMenu>
          {/* Contrôles natifs Puck : gras, italique, titres, listes, alignement… */}
          {children}
          <RichTextMenu.Group>
            {/* Police */}
            <select
              className="puck-rt-select"
              value={ui?.fontFamily === 'inherit' ? '' : ui?.fontFamily ?? ''}
              title="Police"
              onChange={(e) => {
                const v = e.target.value;
                if (!v) editor?.chain().focus().unsetFontFamily().run();
                else editor?.chain().focus().setFontFamily(v).run();
              }}
            >
              <option value="">Police</option>
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            {/* Taille */}
            <select
              className="puck-rt-select"
              value={ui?.fontSize ?? ''}
              title="Taille de police"
              onChange={(e) => {
                const v = e.target.value;
                if (!v) editor?.chain().focus().unsetFontSize().run();
                else editor?.chain().focus().setFontSize(`${v}px`).run();
              }}
            >
              <option value="">Taille</option>
              {FONT_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </RichTextMenu.Group>
          <RichTextMenu.Group>
            {/* Couleur du texte (nuancier + personnalisée) */}
            <span className="puck-rt-swatches" title="Couleur du texte">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`puck-rt-swatch${ui?.color === c ? ' is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => editor?.chain().focus().setColor(c).run()}
                  aria-label={`Couleur ${c}`}
                />
              ))}
              <input
                type="color"
                className="puck-rt-color-input"
                value={ui?.color ?? '#111111'}
                title="Couleur personnalisée"
                onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
              />
            </span>
            {/* Surlignage */}
            <span className="puck-rt-swatches" title="Surlignage">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="puck-rt-swatch"
                  style={{ background: c }}
                  onClick={() => editor?.chain().focus().toggleHighlight({ color: c }).run()}
                  aria-label={`Surligner ${c}`}
                />
              ))}
            </span>
            <RichTextMenu.Control
              icon={<Highlighter size={14} />}
              title="Surligner / retirer le surlignage"
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              active={ui?.isHighlight}
              disabled={!ui?.canHighlight}
            />
            {/* Lien */}
            <RichTextMenu.Control
              icon={<LinkIcon size={14} />}
              title="Insérer un lien"
              onClick={() => {
                const current =
                  typeof window !== 'undefined' && ui?.isLink
                    ? window.getSelection()?.toString() || ''
                    : '';
                const url = window.prompt('URL du lien :', 'https://');
                if (url === null) return;
                if (!url.trim()) {
                  editor?.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor
                  ?.chain()
                  .focus()
                  .extendMarkRange('link')
                  .setLink({ href: url.trim(), target: '_blank', rel: 'noopener noreferrer' })
                  .run();
              }}
              active={ui?.isLink}
            />
          </RichTextMenu.Group>
        </RichTextMenu>
      );
    },
  };
}

/* ------------------------------------------------------------------ */
/* Transformation de la config (éditeur uniquement)                    */
/* ------------------------------------------------------------------ */

/**
 * Chemins (dans `content.objectFields`) des champs titres/descriptions à
 * transformer en éditeurs richtext, par bloc. Les libellés courts (badges,
 * boutons, unités, alt…) restent des champs simples.
 */
const RICH_TEXT_PATHS: Record<string, string[]> = {
  Hero: ['title', 'titleHighlight', 'subMessage', 'description', 'bullet1', 'bullet2', 'bullet3'],
  Garanties: [
    'title',
    'description',
    'commitmentTitle',
    'commitmentDesc',
    'points.*.title',
    'points.*.desc',
  ],
  Vision: ['title', 'description', 'pillars.*.title', 'pillars.*.desc'],
  Videos: ['title', 'description', 'videos.*.title', 'videos.*.desc'],
  Localisation: [
    'title',
    'description',
    'triangleDesc',
    'aibdTitle',
    'aibdSub',
    'terTitle',
    'terSub',
    'diamniadioTitle',
    'diamniadioSub',
    'ndayaneTitle',
    'ndayaneSub',
  ],
  Simulateur: ['title', 'description'],
  Packs: ['title', 'description'],
  Banque: ['title', 'description'],
  Temoignages: ['title', 'description'],
  Articles: ['title', 'description'],
  FAQ: ['title', 'description'],
  Contact: ['title', 'description'],
};

/** Applique `richText` à un champ, en réutilisant son libellé. */
function toRichTextField(field: Field): Field {
  const label = (field as { label?: string }).label ?? 'Texte';
  return richText(label);
}

/**
 * Remplace, dans une copie profonde de `puckConfig`, les champs listés dans
 * `RICH_TEXT_PATHS` par des champs `richtext`. Les `*` désignent les items
 * d'un tableau (`arrayFields`), les autres chemins sont des clés de
 * `objectFields`.
 */
/** Clone profond préservant les fonctions (render, helpers…). */
function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  if (typeof value === 'function') return value;
  if (Array.isArray(value)) return value.map((v) => deepClone(v)) as unknown as T;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    out[key] = deepClone((value as Record<string, unknown>)[key]);
  }
  return out as T;
}

/**
 * Remplace, dans une copie profonde de `puckConfig`, les champs listés dans
 * `RICH_TEXT_PATHS` par des champs `richtext`. Les `*` désignent les items
 * d'un tableau (`arrayFields`), les autres chemins sont des clés de
 * `objectFields`.
 */
export function withRichText(config: Config): Config {
  const clone = deepClone(config);
  for (const [componentName, paths] of Object.entries(RICH_TEXT_PATHS)) {
    const component = (clone.components as Record<string, any>)[componentName];
    if (!component?.fields?.content?.objectFields) continue;
    for (const path of paths) {
      const parts = path.split('.');
      let current = component.fields.content.objectFields;
      let fieldName: string | undefined;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part === '*') {
          current = current?.[fieldName as string]?.arrayFields;
          fieldName = undefined;
          continue;
        }
        fieldName = part;
      }
      if (fieldName && current?.[fieldName]) {
        current[fieldName] = toRichTextField(current[fieldName]);
      }
    }
  }
  return clone;
}