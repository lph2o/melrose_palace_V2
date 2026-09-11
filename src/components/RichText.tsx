import { CSSProperties, ReactNode, useMemo } from 'react';
import DOMPurify from 'dompurify';

type RichTextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'li' | 'figcaption';

interface RichTextProps {
  /** Valeur à afficher : HTML (champ richtext publié) ou texte brut (repli TRANSLATIONS). */
  html?: string;
  /** Élément HTML hôte. Défaut : `span`. */
  as?: RichTextTag;
  className?: string;
  style?: CSSProperties;
}

/**
 * Rendu d'une valeur potentiellement HTML (champ `richtext` de Puck).
 *
 * Deux modes :
 * - **Site public** : la valeur est une string (HTML publié ou texte brut des
 *   replis `TRANSLATIONS`). Le HTML est assaini par DOMPurify (XSS) — balises/
 *   attributs autorisés limités à ce que produit TipTap — et le texte brut est
 *   rendu tel quel, retours à la ligne préservés (`<br/>`).
 * - **Canevas de l'éditeur Puck** : la valeur est remplacée par un composant
 *   React (rendu read-only `RichTextRender` de Puck, ou éditeur inline si
 *   `contentEditable` est activé). On le rend tel quel.
 */
export function RichText({ html, as = 'span', className, style }: RichTextProps) {
  const Tag = as as 'span';
  const isString = typeof html === 'string';

  const clean = useMemo(() => {
    if (!isString) return '';
    const raw = html.trim();
    if (!raw) return '';
    const withBreaks = /<[a-z][^>]*>/i.test(raw) ? raw : raw.replace(/\n/g, '<br/>');
    return DOMPurify.sanitize(withBreaks, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'a',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'code',
        'pre',
        'span',
      ],
      // Les styles inline (couleur, taille, police du richtext) sont assainis
      // par DOMPurify (valeurs CSS validées, url()/javascript: bloqués).
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
      ALLOWED_URI_REGEXP: /^(https?:|mailto:|tel:|#|\/)/i,
    });
  }, [html, isString]);

  if (!isString) {
    // Canevas de l'éditeur : la valeur est un composant Puck (rendu read-only).
    return <>{html as ReactNode}</>;
  }
  if (!clean) return null;
  return <Tag className={className} style={style} dangerouslySetInnerHTML={{ __html: clean }} />;
}