import { useRef, useState } from 'react';
import { CheckCircle2, FileVideo, Image as ImageIcon, Loader2, UploadCloud, X } from 'lucide-react';
import { MediaFolder, uploadSiteMedia } from '../lib/supabase';

/**
 * Champ média pour l'éditeur Puck (`type: 'custom'`).
 *
 * Répond à l'exigence « upload de médias depuis l'éditeur » du chantier :
 * l'admin peut téléverser une image ou une vidéo vers Supabase Storage
 * (bucket `site-media`, mêmes dossiers que l'Espace Gérant) ou coller une URL
 * externe.
 *
 * Deux constructeurs :
 *   - `imageField(label)` → images (max 8 Mo, aperçu <img>)
 *   - `videoField(label)` → vidéos (max 200 Mo, aperçu <video>)
 *
 * - Aperçu du média courant (si c'est une URL de média) ;
 * - bouton de téléversement avec états spinner / succès / erreur ;
 * - champ texte pour saisir ou corriger une URL à la main ;
 * - bouton « retirer » pour vider le champ.
 *
 * Styles : variables `--puck-color-*` fournies par la feuille de style de
 * Puck, pour s'intégrer au panneau de props quel que soit le thème.
 */

type MediaKind = 'image' | 'video';

const KIND_CONFIG: Record<MediaKind, { folder: MediaFolder; accept: string; maxMB: number; label: string }> = {
  image: { folder: 'images', accept: 'image/*', maxMB: 8, label: 'image' },
  video: { folder: 'videos', accept: 'video/*', maxMB: 200, label: 'vidéo' },
};

export default function MediaField({
  value,
  onChange,
  kind,
}: {
  value?: string;
  onChange: (url: string) => void;
  kind: MediaKind;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const cfg = KIND_CONFIG[kind];
  const url = value ?? '';

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setJustUploaded(false);

    if (file.size > cfg.maxMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${cfg.maxMB} Mo).`);
      return;
    }

    setUploading(true);
    const res = await uploadSiteMedia(file, cfg.folder);
    setUploading(false);

    if (res.ok && res.url) {
      onChange(res.url);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2500);
    } else {
      setError(res.error ?? 'Échec du téléversement.');
    }
  };

  const border = 'var(--puck-color-border)';
  const borderHover = 'var(--puck-color-border-hover)';
  const surface = 'var(--puck-color-surface)';
  const text = 'var(--puck-color-text)';
  const textSecondary = 'var(--puck-color-text-secondary)';

  // L'étiquette du champ est affichée par Puck (AutoField → FieldLabel) :
  // on ne la répète pas ici pour éviter un doublon dans le panneau de props.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Aperçu */}
      {url && (
        <div
          style={{
            position: 'relative',
            borderRadius: 8,
            overflow: 'hidden',
            border: `1px solid ${border}`,
            background: surface,
            lineHeight: 0,
          }}
        >
          {kind === 'image' ? (
            <img
              src={url}
              alt="Aperçu"
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <video
              src={url}
              preload="metadata"
              muted
              controls
              style={{ width: '100%', maxHeight: 140, objectFit: 'cover' }}
              onError={(e) => {
                (e.currentTarget as HTMLVideoElement).style.display = 'none';
              }}
            />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            title={kind === 'image' ? 'Retirer cette image' : 'Retirer cette vidéo'}
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 24,
              height: 24,
              borderRadius: 999,
              border: 'none',
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={12} strokeWidth={2} />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={cfg.accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* Téléversement */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px dashed ${error ? '#fb7185' : border}`,
          background: surface,
          color: error ? '#fb7185' : justUploaded ? '#34d399' : textSecondary,
          fontSize: 12,
          cursor: 'pointer',
          opacity: uploading ? 0.6 : 1,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {uploading ? (
            <Loader2 size={14} style={{ animation: 'puck-spin 1s linear infinite' }} />
          ) : justUploaded ? (
            <CheckCircle2 size={14} />
          ) : kind === 'image' ? (
            <ImageIcon size={14} />
          ) : (
            <FileVideo size={14} />
          )}
          {uploading
            ? 'Téléversement…'
            : justUploaded
              ? 'Téléversé ✓'
              : `Téléverser ${cfg.label === 'vidéo' ? 'une vidéo' : 'une image'} (max ${cfg.maxMB} Mo)`}
        </span>
        {!uploading && !justUploaded && <UploadCloud size={14} />}
      </button>

      {error && (
        <span style={{ fontSize: 11, color: '#fb7185' }}>{error}</span>
      )}

      {/* Saisie manuelle d'URL */}
      <input
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        placeholder={kind === 'image' ? '…ou collez une URL d’image' : '…ou collez une URL de vidéo (mp4)'}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${border}`,
          background: surface,
          color: text,
          fontSize: 12,
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => (e.target.style.borderColor = borderHover)}
        onBlur={(e) => (e.target.style.borderColor = border)}
      />
    </div>
  );
}

/**
 * Champ Puck réutilisable pour une URL d'image avec upload.
 * À déclarer dans `puckConfig.components` (voir `src/puck/config.tsx`).
 */
export const imageField = (label: string) => mediaField(label, 'image');

/** Champ Puck réutilisable pour une URL de vidéo avec upload (mp4). */
export const videoField = (label: string) => mediaField(label, 'video');

function mediaField(label: string, kind: MediaKind) {
  return {
    type: 'custom' as const,
    label,
    render: ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
      <MediaField value={value} onChange={onChange} kind={kind} />
    ),
  };
}

// La rotation du spinner (clé `puck-spin`) est définie dans src/index.css.
// Évite de dépendre des utilitaires Tailwind dans le panneau de props de Puck.