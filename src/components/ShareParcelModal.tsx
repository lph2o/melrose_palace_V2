import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, Mail, ExternalLink, 
  Sparkles, ShieldCheck, Award, MapPin, Compass, QrCode, MessageCircle,
  Facebook, Twitter, Linkedin, Send
} from 'lucide-react';
import { Parcel, Language } from '../types';
import { ModalShell, useModalClose } from '../ui';

interface ShareParcelModalProps {
  parcel: Parcel;
  currentLanguage: Language;
  onClose: () => void;
  whatsappNumber?: string;
}

export default function ShareParcelModal({ parcel, currentLanguage, onClose, whatsappNumber = '33761235509' }: ShareParcelModalProps) {
  const isFR = currentLanguage === 'FR';
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'card' | 'link' | 'social'>('card');

  // Deep link representing this specific parcel
  const shareUrl = `${window.location.origin}${window.location.pathname}?plot=${parcel.id}`;

  const promoBadge = parcel.isPromo || parcel.id <= 10;

  // Tailored share text
  const shareTitle = isFR 
    ? `Sénégal Immobilier Consulting - Parcelle n°${parcel.id} (150 m² à Sébikhotane)` 
    : `Senegal Real Estate Consulting - Plot #${parcel.id} (150 sqm in Sebikhotane)`;

  const shareDesc = isFR
    ? `Découvrez la parcelle n°${parcel.id} de 150 m² à Sébikhotane (proche AIBD & Diamniadio). Prix échelonné : 3 000 € d'acompte + 300 €/mois (ou 13 500 € comptant). Délibération municipale & NICAD.`
    : `Explore plot #${parcel.id} of 150 sqm in Sebikhotane (near AIBD & Diamniadio). Installments: 3,000 € down payment + 300 €/mo (or 13,500 € cash). Municipal decree & NICAD.`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const whatsappInquiryMessage = encodeURIComponent(
    isFR
      ? `Bonjour, je souhaite avoir des informations concernant la parcelle n° ${parcel.id} de 150 m² à Sébikhotane.`
      : `Hello, I would like information about plot #${parcel.id} (150 sqm) in Sebikotane.`
  );
  const directWhatsAppUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappInquiryMessage}`;

  const enc = encodeURIComponent;
  const shareWhatsAppUrl = `https://wa.me/?text=${enc(
    `${shareTitle}\n\n${shareDesc}\n\n${isFR ? 'Lien direct' : 'Direct link'}: ${shareUrl}`
  )}`;
  const mailUrl = `mailto:?subject=${enc(shareTitle)}&body=${enc(
    `${shareDesc}\n\n${isFR ? 'Consulter la fiche détaillée' : 'View the detailed sheet'}: ${shareUrl}`
  )}`;

  // Réseaux supplémentaires : même intention que sur le partage du site,
  // mais avec le lien profond de la parcelle (ouvre le plan sur ce lot).
  const socialLinks = [
    {
      key: 'facebook',
      label: 'Facebook',
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`,
      cls: 'bg-[#1877F2] hover:bg-[#1466d6] text-white',
    },
    {
      key: 'twitter',
      label: 'X (Twitter)',
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${enc(shareTitle)}&url=${enc(shareUrl)}`,
      cls: 'bg-[#111827] hover:bg-black text-white',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      Icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
      cls: 'bg-[#0A66C2] hover:bg-[#0956a5] text-white',
    },
    {
      key: 'telegram',
      label: 'Telegram',
      Icon: Send,
      href: `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(shareTitle)}`,
      cls: 'bg-[#229ED9] hover:bg-[#1c8bbe] text-white',
    },
  ];

  const { close, closeRef } = useModalClose();

  return (
    <ModalShell
      onClose={onClose}
      closeRef={closeRef}
      labelledBy="share-parcel-modal-title"
      wrapperClassName="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center overflow-hidden font-sans sm:items-center sm:p-4"
      panelClassName="max-w-lg bg-white border border-gold-line/25"
    >
      <>
        {/* Header Block */}
        <div className="p-5 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-inner bg-secondary-fixed/20 text-[#004D40]">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3
                id="share-parcel-modal-title"
                className="font-serif text-lg font-bold text-primary leading-tight"
              >
                {isFR ? 'Partager la Parcelle' : 'Share Plot Passport'}
              </h3>
              <p className="text-xs text-outline mt-0.5 font-light">
                {isFR ? `Parcelle n°${parcel.id} • 150 m² • Sébikhotane` : `Plot #${parcel.id} • 150 sqm • Sebikhotane`}
              </p>
            </div>
          </div>
          <button 
            onClick={close}
            className="p-2.5 tap-44 hover:bg-gray-100 rounded-full transition-colors duration-400 cursor-pointer text-primary"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pt-3 flex space-x-4 border-b border-gray-100 text-xs">
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-2.5 px-1 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'card' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            {isFR ? 'Fiche Digitale' : 'Digital Sheet'}
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-1 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'link' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            {isFR ? 'Lien Direct' : 'Direct Link'}
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`pb-2.5 px-1 font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'social' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            {isFR ? 'WhatsApp & Envoi' : 'WhatsApp & Share'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* TAB 1: CARD PREVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Luxury Digital Passport Card */}
              <div className="bg-[#0f3d2e] text-white p-5 rounded-card border border-secondary-fixed/30 relative overflow-hidden shadow-elev-2 flex flex-col justify-between space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-micro font-mono uppercase tracking-widest text-secondary-fixed font-bold block">
                      Sénégal Immobilier Consulting
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                      {isFR ? 'Domaine de Sébikhotane' : 'Sebikhotane Estate'}
                    </h4>
                    <span className="text-micro text-white/70 font-sans block">
                      {isFR
                        ? 'Axe Diamniadio - AIBD • 54 Parcelles'
                        : 'Diamniadio - AIBD Corridor • 54 Plots'}
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-micro bg-whatsapp/20 text-whatsapp border border-whatsapp/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {isFR
                        ? parcel.status === 'Available'
                          ? 'Disponible'
                          : parcel.status === 'Reserved'
                          ? 'Réservée'
                          : 'Vendue'
                        : parcel.status}
                    </span>
                    {promoBadge && (
                      <span className="text-micro bg-secondary-fixed text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        {isFR ? 'Offre 10 Premiers' : 'First 10 Offer'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plot info */}
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-2 space-y-1">
                    <span className="text-micro font-mono uppercase tracking-wider text-secondary-fixed font-bold">
                      {isFR ? 'FICHE PARCELLE' : 'PLOT SHEET'}
                    </span>
                    <h5 className="font-serif text-2xl font-bold text-white">
                      Lot #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                    </h5>
                    <div className="text-xs text-white/85 space-y-0.5">
                      <p>
                        📐 {isFR ? 'Surface' : 'Area'} :{' '}
                        <strong className="text-white">150 m²</strong>
                      </p>
                      <p>
                        📜 {isFR ? 'Statut' : 'Status'} :{' '}
                        <strong className="text-white">
                          {isFR ? 'Délibération + NICAD' : 'Deliberation + NICAD'}
                        </strong>
                      </p>
                      <p>
                        📍 {isFR ? 'Zone' : 'Zone'} :{' '}
                        <strong className="text-white">Sébikhotane</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-inner shadow-elev-1">
                    <QrCode className="w-10 h-10 text-primary" />
                    <span className="text-micro font-mono text-primary font-bold mt-1">LOT-{parcel.id}</span>
                  </div>
                </div>

                {/* Financial conditions */}
                <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                  <div>
                    <span className="text-micro font-mono text-white/70 uppercase block">
                      {isFR ? "Conditions d'Acquisition" : 'Purchase Terms'}
                    </span>
                    <div className="text-xs font-bold text-white">
                      {isFR
                        ? "3 000 € d'acompte + 300 €/mois"
                        : '€3,000 down + €300/month'}
                    </div>
                    <span className="text-caption text-secondary-fixed block">
                      {isFR ? 'ou 13 500 € au comptant' : 'or €13,500 cash'}
                    </span>
                  </div>
                  <div className="text-right text-micro text-white/70 font-mono">
                    {isFR ? 'Garantie Remboursement' : 'Contractual Refund'}
                    <br />
                    {isFR ? '100% Contractuelle' : 'Guarantee 100%'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-whatsapp hover:bg-[#128c4a] text-white py-3 px-4 rounded-inner font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-elev-1"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{isFR ? 'Demander sur WhatsApp' : 'Ask on WhatsApp'}</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-opacity-95 text-white py-3 px-4 rounded-inner font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-elev-1"
                >
                  {copied ? <Check className="w-4 h-4 text-secondary-fixed" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isFR ? 'Lien copié !' : 'Copied!') : (isFR ? 'Copier le lien' : 'Copy link')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <p className="text-xs text-outline leading-relaxed font-light">
                {isFR
                  ? "Ce lien ouvre directement le plan directeur en sélectionnant automatiquement la parcelle n°" + parcel.id + " avec sa fiche technique et son simulateur."
                  : "This link opens the master plan directly, targeting plot #" + parcel.id + " with its specs and simulator."}
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-inner px-3.5 py-2.5 text-xs text-outline font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-opacity-90 text-white px-5 rounded-inner text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-secondary-fixed" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isFR ? 'Copié' : 'Copied') : (isFR ? 'Copier' : 'Copy')}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SOCIAL */}
          {activeTab === 'social' && (
            <div className="space-y-3">
              <p className="text-xs text-outline font-light">
                {isFR ? 'Partagez directement les informations à vos associés ou à vos proches :' : 'Direct channels:'}
              </p>

              <a
                href={shareWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-whatsapp hover:bg-[#128c4a] text-white p-3.5 rounded-inner flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span className="text-xs font-bold">
                    {isFR ? 'Partager sur WhatsApp (Contact / Groupe)' : 'Share on WhatsApp (Contact / Group)'}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-secondary-fixed text-primary p-3.5 rounded-inner flex items-center justify-between transition-all font-bold"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-primary fill-primary" />
                  <span className="text-xs">
                    {isFR
                      ? 'Échanger avec un conseiller (WhatsApp Officiel)'
                      : 'Talk to an advisor (Official WhatsApp)'}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={mailUrl}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-primary p-3.5 rounded-inner flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#004D40]" />
                  <span className="text-xs font-bold">{isFR ? 'Envoyer par Email' : 'Send by Email'}</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Réseaux sociaux : 4 raccourcis directs (lien profond de la parcelle) */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {socialLinks.map(({ key, label, Icon, href, cls }) => (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                    aria-label={label}
                    className={`p-3 rounded-inner flex flex-col items-center justify-center space-y-1.5 transition-all text-caption font-bold ${cls}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      </>
    </ModalShell>
  );
}
