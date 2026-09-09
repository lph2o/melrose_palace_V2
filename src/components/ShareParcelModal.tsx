import React, { useState } from 'react';
import { 
  X, Copy, Check, Share2, Mail, ExternalLink, 
  Sparkles, ShieldCheck, Award, MapPin, Compass, QrCode, MessageCircle
} from 'lucide-react';
import { Parcel, Language } from '../types';
import { motion } from 'motion/react';

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
    `Bonjour, je souhaite avoir des informations concernant la parcelle n° ${parcel.id} de 150 m² à Sébikhotane.`
  );
  const directWhatsAppUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappInquiryMessage}`;

  const shareWhatsAppUrl = `https://wa.me/?text=${encodeURIComponent(`${shareTitle}\n\n${shareDesc}\n\nLien direct: ${shareUrl}`)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDesc}\n\nConsulter la fiche détaillée : ${shareUrl}`)}`;

  return (
    <div 
      id="share-parcel-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/85 backdrop-blur-sm font-sans"
    >
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-[#8C7A53]/25 rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative z-10 flex flex-col"
      >
        {/* Header Block */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-secondary-fixed/20 text-[#004D40]">
              <Share2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary leading-tight">
                {isFR ? 'Partager la Parcelle' : 'Share Plot Passport'}
              </h3>
              <p className="text-xs text-outline mt-0.5 font-light">
                {isFR ? `Parcelle n°${parcel.id} • 150 m² • Sébikhotane` : `Plot #${parcel.id} • 150 sqm • Sebikhotane`}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-primary"
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
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">

          {/* TAB 1: CARD PREVIEW */}
          {activeTab === 'card' && (
            <div className="space-y-4">
              {/* Luxury Digital Passport Card */}
              <div className="bg-[#002B1D] text-white p-5 rounded-2xl border border-secondary-fixed/30 relative overflow-hidden shadow-md flex flex-col justify-between space-y-4">
                
                {/* Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-fixed font-bold block">
                      Sénégal Immobilier Consulting
                    </span>
                    <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                      {isFR ? 'Domaine de Sébikhotane' : 'Sebikhotane Estate'}
                    </h4>
                    <span className="text-[9px] text-white/60 font-sans block">
                      Axe Diamniadio - AIBD • 54 Parcelles
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {parcel.status === 'Available' ? (isFR ? 'Disponible' : 'Available') : parcel.status}
                    </span>
                    {promoBadge && (
                      <span className="text-[8px] bg-secondary-fixed text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Offre 10 Premiers
                      </span>
                    )}
                  </div>
                </div>

                {/* Plot info */}
                <div className="grid grid-cols-3 gap-3 items-center">
                  <div className="col-span-2 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-secondary-fixed font-bold">
                      FICHE PARCELLE
                    </span>
                    <h5 className="font-serif text-2xl font-bold text-white">
                      Lot #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                    </h5>
                    <div className="text-xs text-white/80 space-y-0.5">
                      <p>📐 Surface : <strong className="text-white">150 m²</strong></p>
                      <p>📜 Statut : <strong className="text-white">Délibération + NICAD</strong></p>
                      <p>📍 Zone : <strong className="text-white">Sébikhotane</strong></p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2.5 bg-white rounded-xl shadow-xs">
                    <QrCode className="w-10 h-10 text-primary" />
                    <span className="text-[7px] font-mono text-primary font-bold mt-1">LOT-{parcel.id}</span>
                  </div>
                </div>

                {/* Financial conditions */}
                <div className="border-t border-white/10 pt-3 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] font-mono text-white/60 uppercase block">Conditions d'Acquisition</span>
                    <div className="text-xs font-bold text-white">
                      3 000 € d'acompte + 300 €/mois
                    </div>
                    <span className="text-[10px] text-secondary-fixed block">
                      ou 13 500 € au comptant
                    </span>
                  </div>
                  <div className="text-right text-[9px] text-white/60 font-mono">
                    Garantie Remboursement<br />100% Contractuelle
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Demander sur WhatsApp</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-opacity-95 text-white py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-sm"
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
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-outline font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-primary hover:bg-opacity-90 text-white px-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all shrink-0"
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
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span className="text-xs font-bold">Partager sur WhatsApp (Contact / Groupe)</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-secondary-fixed text-primary p-3.5 rounded-xl flex items-center justify-between transition-all font-bold"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-primary fill-primary" />
                  <span className="text-xs">Échanger avec un conseiller (WhatsApp Officiel)</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={mailUrl}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-primary p-3.5 rounded-xl flex items-center justify-between transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#004D40]" />
                  <span className="text-xs font-bold">Envoyer par Email</span>
                </div>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
