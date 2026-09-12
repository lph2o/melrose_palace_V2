import { useState } from 'react';
import { MessageCircle, X, Check, Phone, ArrowUpRight } from 'lucide-react';
import { SiteSettings, Language } from '../types';

interface WhatsAppFloatingButtonProps {
  settings: SiteSettings;
  currentLanguage: Language;
}

export default function WhatsAppFloatingButton({ settings, currentLanguage }: WhatsAppFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const quickMessages = currentLanguage === 'FR' ? [
    {
      label: '📄 Recevoir le dossier complet',
      text: 'Bonjour ' + (settings?.companyName || 'Sénégal Immobilier Consulting') + ', je souhaite recevoir le dossier complet du projet de Sébikhotane (54 parcelles).',
    },
    {
      label: '🟢 Vérifier une parcelle disponible',
      text: 'Bonjour, je souhaite vérifier les parcelles de 150 m² actuellement disponibles à Sébikhotane.',
    },
    {
      label: '💰 Étudier mon financement',
      text: 'Bonjour, je souhaite étudier mon plan de financement personnalisé (apport 3 000 € puis 300 €/mois) pour Sébikhotane.',
    },
    {
      label: '📞 Parler à un conseiller',
      text: 'Bonjour, je vis à l\'étranger (diaspora) et je souhaiterais échanger par téléphone ou WhatsApp avec un conseiller.',
    },
  ] : [
    {
      label: '📄 Request full documentation',
      text: 'Hello ' + (settings?.companyName || 'Sénégal Immobilier Consulting') + ', I would like to receive the full documentation for the Sebikotane project.',
    },
    {
      label: '🟢 Check available plots',
      text: 'Hello, I would like to check which 150 sqm plots are currently available in Sebikotane.',
    },
    {
      label: '💰 Review financing plan',
      text: 'Hello, I want to review the custom installment plan (€3,000 down + €300/mo) for Sebikotane.',
    },
    {
      label: '📞 Speak with an advisor',
      text: 'Hello, I am a diaspora buyer and would like to speak directly with an investment advisor.',
    },
  ];

  const handleOpenWhatsApp = (customText?: string) => {
    const defaultText = currentLanguage === 'FR'
      ? 'Bonjour ' + (settings?.companyName || 'Sénégal Immobilier Consulting') + ', je souhaite avoir des informations concernant les parcelles de 150 m² à Sébikhotane.'
      : 'Hello ' + (settings?.companyName || 'Sénégal Immobilier Consulting') + ', I would like information regarding the 150 sqm plots in Sebikotane.';
    
    const message = customText || defaultText;
    const url = `https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fab-safe fixed bottom-5 right-5 z-40 font-sans">
      {/* Popover Mini Chat Menu */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-card shadow-elev-3 border border-emerald-500/20 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-400">
          <div className="bg-[#075E54] text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-[#075E54] font-bold shadow-elev-2">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight text-white">
                  Sénégal Immobilier Consulting
                </h4>
                <p className="text-caption text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentLanguage === 'FR' ? 'Conseiller en ligne' : 'Advisor online'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/85 hover:text-white p-1 rounded-micro hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-[#ECE5DD]/20 space-y-3">
            <div className="bg-white p-3 rounded-inner rounded-tl-none shadow-elev-1 border border-gray-100 text-xs text-gray-800 space-y-1">
              <p className="font-medium">
                {currentLanguage === 'FR'
                  ? '👋 Bonjour ! Comment pouvons-nous vous accompagner dans votre projet à Sébikhotane ?'
                  : '👋 Hello! How can we assist you with your land project in Sebikotane?'}
              </p>
              <p className="text-caption text-gray-500">
                {currentLanguage === 'FR'
                  ? 'Réponse rapide garantie par notre équipe dédiée diaspora.'
                  : 'Fast response guaranteed by our dedicated team.'}
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-micro font-bold uppercase tracking-wider text-gray-500 block px-1">
                {currentLanguage === 'FR' ? 'Accès direct rapide :' : 'Quick actions:'}
              </span>
              {quickMessages.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenWhatsApp(item.text)}
                  className="w-full text-left p-2.5 rounded-inner bg-white hover:bg-emerald-50 border border-gray-200/80 hover:border-emerald-300 text-xs font-medium text-gray-800 transition-all flex items-center justify-between group shadow-elev-1 cursor-pointer"
                >
                  <span className="truncate">{item.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>

            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full mt-2 py-2.5 bg-whatsapp hover:bg-[#128c4a] text-white font-bold text-xs rounded-inner shadow-elev-2 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{currentLanguage === 'FR' ? 'Écrire un message libre' : 'Write custom message'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 bg-whatsapp hover:bg-[#128c4a] text-white px-3 py-3 sm:px-4 rounded-full shadow-elev-3 hover:shadow-emerald-500/40 transition-all duration-400 ease-spring transform hover:scale-105 active:scale-[0.98] cursor-pointer group select-none border-2 border-white"
        aria-label="Contacter sur WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white shrink-0" />
        <span className="text-xs font-bold font-sans tracking-wide pr-1 hidden lg:inline">
          {currentLanguage === 'FR' ? 'WhatsApp Direct' : 'WhatsApp Us'}
        </span>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-ping pointer-events-none" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full pointer-events-none" />
      </button>
    </div>
  );
}
