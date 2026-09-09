import { BlogArticle, Language } from '../types';
import { X, Calendar, Clock, BookOpen, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface BlogModalProps {
  article: BlogArticle;
  currentLanguage: Language;
  onClose: () => void;
  onActionClick?: () => void;
}

export default function BlogModal({
  article,
  currentLanguage,
  onClose,
  onActionClick,
}: BlogModalProps) {
  const isFR = currentLanguage === 'FR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/90 backdrop-blur-md">
      {/* Click outside to close container */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full border border-[#8C7A53]/20 shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-[#FAF9F5] shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#8C7A53]" />
            <span className="text-[10px] uppercase font-bold tracking-widest font-mono text-[#8C7A53]">
              {isFR ? 'Insight & Prestige' : 'Exclusive Reading'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-primary hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-outline font-sans">
            <span className="bg-[#8C7A53]/15 text-[#8C7A53] px-2.5 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-widest">
              {article.category[currentLanguage]}
            </span>
            <div className="flex items-center space-x-1 font-mono">
              <Calendar className="w-3 h-3 text-[#8C7A53]/60" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center space-x-1 font-mono">
              <Clock className="w-3 h-3 text-[#8C7A53]/60" />
              <span>{article.readTime} {isFR ? 'de lecture' : 'read'}</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary leading-tight">
            {article.title[currentLanguage]}
          </h2>

          {/* Article Image */}
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden border border-gray-300 shadow-xs shrink-0">
            <img
              src={article.image}
              alt={article.title[currentLanguage]}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Summary Callout */}
          <div className="bg-[#FAF9F5] border-l-4 border-[#8C7A53] rounded-r-xl p-4 italic text-sm text-[#8C7A53] font-serif leading-relaxed">
            "{article.summary[currentLanguage]}"
          </div>

          {/* Article Content */}
          <div className="font-sans text-sm text-on-surface-variant leading-relaxed text-justify space-y-4 font-light text-primary/90">
            <p>{article.content[currentLanguage]}</p>
            <p>
              {isFR
                ? 'Nos équipes d\'experts restent à votre entière disposition pour vous guider à chaque étape de votre projet foncier et d\'acquisition cadastrale sous les auspices de nos notaires partenaires certifiés de l\'État.'
                : 'Our experts are fully available to assist and guide you at every stage of your plot acquisition and cadastral integration, facilitated safely through our partner State Notaries.'}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-[#FAF9F5] border-t border-gray-200 shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <span className="text-[10px] text-outline uppercase font-bold tracking-widest font-mono text-center sm:text-left leading-tight">
            {isFR ? 'PROJET SÉCURISÉ MELROSE PLACE' : 'MELROSE PLACE CERTIFIED PLOT LIVING'}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-outline-variant/30 text-primary hover:bg-black/5 text-xs font-semibold rounded-xl cursor-pointer transition-all text-center"
            >
              {isFR ? 'Fermer la lecture' : 'Close Article'}
            </button>
            <button
              onClick={() => {
                onClose();
                onActionClick?.();
              }}
              className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold px-5  py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{isFR ? 'Discuter sur WhatsApp' : 'Inquire on WhatsApp'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
