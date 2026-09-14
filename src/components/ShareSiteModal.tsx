import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Mail,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
} from 'lucide-react';
import { Language, SiteSettings } from '../types';
import { ModalShell, useModalClose } from '../ui';

/**
 * Partage du projet sur les réseaux sociaux.
 *
 * Le lien partagé est l'URL réellement affichée (on retire seulement les
 * paramètres de suivi), donc partager depuis `/fr/plan` partage le plan — le
 * visiteur qui reçoit le message arrive exactement là où était l'expéditeur.
 *
 * WhatsApp et Facebook couvrent l'essentiel de l'audience diaspora ; X, LinkedIn
 * et Telegram sont ajoutés pour les partages professionnels. Sur mobile, le
 * bouton natif (`navigator.share`) ouvre la feuille de partage du système, qui
 * inclut les applications installées (Instagram, TikTok…).
 */

interface ShareSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  settings: SiteSettings;
}

export default function ShareSiteModal({
  isOpen,
  onClose,
  currentLanguage,
  settings,
}: ShareSiteModalProps) {
  const isFR = currentLanguage === 'FR';
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}${window.location.pathname}`;

  const company = settings.companyName || 'Senegal Investment Consulting';
  const shareTitle = isFR
    ? `${company} — Parcelles de 150 m² à Sébikhotane (54 lots, dés 300 €/mois)`
    : `${company} — 150 sqm plots in Sebikhotane (54 plots, from €300/month)`;
  const shareDesc = isFR
    ? "Terrain titré à Sébikhotane (délibération municipale & NICAD), à moins de 20 min de l'AIBD et de la gare TER. Apport 3 000 € puis 300 €/mois."
    : 'Titled land in Sebikotane (municipal deliberation & NICAD), under 20 min from AIBD airport and the TER station. €3,000 down then €300/month.';
  const fullText = `${shareTitle}\n\n${shareDesc}`;

  const enc = encodeURIComponent;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(`${fullText}\n\n${shareUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${enc(shareTitle)}&url=${enc(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareTitle)}`,
    mail: `mailto:?subject=${enc(shareTitle)}&body=${enc(`${shareDesc}\n\n${shareUrl}`)}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // Repli pour les navigateurs sans API Clipboard (http, anciens WebView).
      const area = document.createElement('textarea');
      area.value = shareUrl;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: shareTitle, text: shareDesc, url: shareUrl });
    } catch {
      /* partage annulé par l'utilisateur — rien à faire */
    }
  };

  const networks = [
    { key: 'whatsapp', href: links.whatsapp, label: 'WhatsApp', Icon: MessageCircle, cls: 'bg-whatsapp hover:bg-[#128c4a] text-white' },
    { key: 'facebook', href: links.facebook, label: 'Facebook', Icon: Facebook, cls: 'bg-[#1877F2] hover:bg-[#1466d6] text-white' },
    { key: 'twitter', href: links.twitter, label: 'X (Twitter)', Icon: Twitter, cls: 'bg-[#111827] hover:bg-black text-white' },
    { key: 'linkedin', href: links.linkedin, label: 'LinkedIn', Icon: Linkedin, cls: 'bg-[#0A66C2] hover:bg-[#0956a5] text-white' },
    { key: 'telegram', href: links.telegram, label: 'Telegram', Icon: Send, cls: 'bg-[#229ED9] hover:bg-[#1c8bbe] text-white' },
    { key: 'mail', href: links.mail, label: isFR ? 'E-mail' : 'Email', Icon: Mail, cls: 'bg-gray-100 hover:bg-gray-200 text-primary border border-gray-200' },
  ];

  const { close, closeRef } = useModalClose();

  return (
    <ModalShell
      onClose={onClose}
      closeRef={closeRef}
      labelledBy="share-site-modal-title"
      wrapperClassName="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center overflow-hidden font-sans sm:items-center sm:p-4"
      panelClassName="max-w-lg bg-white border border-gold-line/25"
    >
      <>
        {/* Header */}
        <div className="p-5 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-inner bg-secondary-fixed/20 text-[#004D40]">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3
                id="share-site-modal-title"
                className="font-serif text-lg font-bold text-primary leading-tight"
              >
                {isFR ? 'Partager le projet' : 'Share this project'}
              </h3>
              <p className="text-xs text-outline mt-0.5 font-light">
                {isFR
                  ? 'Sébikhotane • 54 parcelles de 150 m²'
                  : 'Sébikhotane • 54 plots of 150 sqm'}
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-2.5 tap-44 hover:bg-gray-100 rounded-full transition-colors duration-400 cursor-pointer text-primary"
            aria-label={isFR ? 'Fermer' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <p className="text-xs text-outline leading-relaxed font-light">
            {isFR
              ? "Choisissez un réseau : le lien s'ouvre avec un message prêt à envoyer (prix, délai de mutation et position du domaine)."
              : 'Pick a network: the link opens with a ready-to-send message (price, transfer timeline and estate location).'}
          </p>

          {/* Network grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {networks.map(({ key, href, label, Icon, cls }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={`p-3 rounded-inner flex flex-col items-center justify-center space-y-1.5 transition-all text-caption font-bold ${cls}`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </a>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-inner px-3.5 py-2.5 text-xs text-outline font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-primary hover:bg-opacity-90 text-white px-5 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-secondary-fixed" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? (isFR ? 'Copié' : 'Copied') : isFR ? 'Copier' : 'Copy'}</span>
            </button>
          </div>

          {/* Native share (mobile) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full bg-secondary-fixed text-primary p-3 rounded-inner flex items-center justify-center space-x-2 text-xs font-bold cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{isFR ? 'Autres applications…' : 'More apps…'}</span>
            </button>
          )}
        </div>
      </>
    </ModalShell>
  );
}
