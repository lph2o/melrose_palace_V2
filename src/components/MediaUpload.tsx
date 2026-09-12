import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, FileImage, FileVideo, FileText } from 'lucide-react';
import { uploadSiteMedia, MediaFolder, deleteSiteMedia } from '../lib/supabase';

/**
 * Téléversement de médias vers Supabase Storage depuis l'Espace Gérant.
 *
 * - Sélecteur de fichier élégant (zone cliquable, accept selon le type)
 * - États : inactif → téléversement (spinner) → succès (URL injectée) / erreur
 * - Injection automatique de l'URL publique dans le champ parent via onUrl
 * - Suppression de l'ancien objet du bucket quand on remplace un média hébergé
 */

const ACCEPT_BY_TYPE: Record<MediaFolder, string> = {
  images: 'image/*',
  videos: 'video/*',
  pdf: 'application/pdf',
};

const ICON_BY_TYPE: Record<MediaFolder, React.ReactNode> = {
  images: <FileImage className="w-3.5 h-3.5" strokeWidth={1.5} />,
  videos: <FileVideo className="w-3.5 h-3.5" strokeWidth={1.5} />,
  pdf: <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />,
};

const LABEL_BY_TYPE: Record<MediaFolder, string> = {
  images: 'Image',
  videos: 'Vidéo',
  pdf: 'PDF',
};

const MAX_MB_BY_TYPE: Record<MediaFolder, number> = {
  images: 8,
  videos: 200,
  pdf: 25,
};

export default function MediaUpload({
  folder,
  currentUrl,
  onUrl,
  label,
}: {
  folder: MediaFolder;
  /** URL actuellement enregistrée (affichée sous le bouton, servie au remplacement). */
  currentUrl?: string;
  /** Reçoit l'URL publique du fichier téléversé. */
  onUrl: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);

  const maxMB = MAX_MB_BY_TYPE[folder];
  const isCloudUrl = currentUrl?.startsWith('https://') && currentUrl.includes('/object/public/');

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setJustUploaded(false);

    if (file.size > maxMB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxMB} Mo).`);
      return;
    }

    setUploading(true);
    // L'ancien média hébergé dans le bucket est remplacé → suppression propre
    if (isCloudUrl && currentUrl) {
      await deleteSiteMedia(currentUrl);
    }
    const res = await uploadSiteMedia(file, folder);
    setUploading(false);

    if (res.ok && res.url) {
      onUrl(res.url);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2500);
    } else {
      setError(res.error ?? 'Échec du téléversement.');
    }
  };

  return (
    <div className="min-w-0">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_BY_TYPE[folder]}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = ''; // permet de re-sélectionner le même fichier
        }}
      />

      {/* Zone cliquable — téléversement */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-inner text-sm transition-all duration-400 ease-spring cursor-pointer border border-dashed ${
          error
            ? 'border-[#fb7185]/60 bg-[#fb7185]/5 text-[#fb7185]'
            : justUploaded
              ? 'border-(--admin-green)/60 bg-(--admin-green)/5 text-(--admin-green)'
              : 'border-(--admin-ring) bg-(--admin-input) text-(--admin-muted) hover:border-(--admin-accent)/50 hover:text-(--admin-accent)'
        } ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" strokeWidth={1.5} />
          ) : justUploaded ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          ) : error ? (
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          ) : (
            <span className="text-(--admin-accent) shrink-0">{ICON_BY_TYPE[folder]}</span>
          )}
          <span className="truncate text-xs font-medium">
            {uploading
              ? 'Téléversement en cours…'
              : justUploaded
                ? 'Téléversé ✓ — URL injectée'
                : error
                  ? 'Échec — réessayer'
                  : `Téléverser ${label ?? LABEL_BY_TYPE[folder].toLowerCase()} (max ${maxMB} Mo)`}
          </span>
        </span>
        {!uploading && !justUploaded && !error && <UploadCloud className="w-4 h-4 shrink-0 opacity-60" strokeWidth={1.5} />}
      </button>

      {/* Erreur */}
      {error && <p className="mt-1.5 text-micro text-[#fb7185] font-mono leading-relaxed">{error}</p>}

      {/* Fichier actuel */}
      {currentUrl && !justUploaded && (
        <div className="mt-1.5 flex items-center gap-2 min-w-0">
          <span className="text-micro font-mono text-(--admin-muted-2) truncate flex-1" title={currentUrl}>
            {currentUrl}
          </span>
          {isCloudUrl && (
            <button
              type="button"
              onClick={async () => {
                setError(null);
                await deleteSiteMedia(currentUrl);
                onUrl('');
              }}
              className="shrink-0 flex items-center gap-1 text-micro font-mono uppercase tracking-wider text-[#fb7185] hover:text-[#fda4af] transition-colors cursor-pointer"
              title="Supprimer ce média du stockage"
            >
              <X className="w-3 h-3" strokeWidth={2} />
              retirer
            </button>
          )}
        </div>
      )}
    </div>
  );
}