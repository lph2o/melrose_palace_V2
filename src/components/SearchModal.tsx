import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Calendar, Landmark, HelpCircle, FileText, ArrowRight } from 'lucide-react';
import { Parcel, BlogArticle, FAQItem, Language } from '../types';
import { PARCELS, BLOG_ARTICLES, FAQ_ITEMS } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface SearchModalProps {
  onClose: () => void;
  currentLanguage: Language;
  onSelectParcel: (id: number) => void;
  onSelectArticle: (article: BlogArticle) => void;
  onSelectFaq: (id: string) => void;
  parcels?: Parcel[];
}

export default function SearchModal({
  onClose,
  currentLanguage,
  onSelectParcel,
  onSelectArticle,
  onSelectFaq,
  parcels = PARCELS,
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isFR = currentLanguage === 'FR';

  useEffect(() => {
    // Focus search input on mount
    inputRef.current?.focus();

    // Escape listener to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Search logic
  const normalizedQuery = query.trim().toLowerCase();

  const getFilteredResults = () => {
    if (!normalizedQuery) return { parcels: [], articles: [], faqs: [] };

    // 1. Filter Parcels
    const filteredParcels = parcels.filter((p) => {
      // Search by ID (direct number match or string hash match e.g. "plot 12", "08")
      const matchesId = p.id.toString() === normalizedQuery || 
                        `#${p.id}`.includes(normalizedQuery) ||
                        `0${p.id}`.includes(normalizedQuery) ||
                        (normalizedQuery.startsWith('plot') && normalizedQuery.includes(p.id.toString())) ||
                        (normalizedQuery.startsWith('parcelle') && normalizedQuery.includes(p.id.toString()));

      if (matchesId) return true;

      // Search by status translation
      const statusFR = p.status === 'Available' ? 'disponible' : p.status === 'Reserved' ? 'réserve' : 'vendu';
      const statusEN = p.status === 'Available' ? 'available' : p.status === 'Reserved' ? 'reserved' : 'sold';
      const matchesStatus = statusFR.includes(normalizedQuery) || statusEN.includes(normalizedQuery);

      // Search by area size (e.g. "150 m2", "150")
      const matchesArea = p.area.toString().includes(normalizedQuery) ||
                          `${p.area}m`.includes(normalizedQuery);

      // Search by perks (features)
      const perksAll = [...p.perks.FR, ...p.perks.EN].map(perk => perk.toLowerCase());
      const matchesPerk = perksAll.some(perk => perk.includes(normalizedQuery));

      // Search by orientation
      const orientationAll = `${p.orientation.FR} ${p.orientation.EN}`.toLowerCase();
      const matchesOrientation = orientationAll.includes(normalizedQuery);

      return matchesStatus || matchesArea || matchesPerk || matchesOrientation;
    });

    // 2. Filter Blog Articles
    const filteredArticles = BLOG_ARTICLES.filter((art) => {
      const titles = `${art.title.FR} ${art.title.EN}`.toLowerCase();
      const summaries = `${art.summary.FR} ${art.summary.EN}`.toLowerCase();
      const contents = `${art.content.FR} ${art.content.EN}`.toLowerCase();
      const categories = `${art.category.FR} ${art.category.EN}`.toLowerCase();

      return titles.includes(normalizedQuery) ||
             summaries.includes(normalizedQuery) ||
             contents.includes(normalizedQuery) ||
             categories.includes(normalizedQuery);
    });

    // 3. Filter FAQS
    const filteredFaqs = FAQ_ITEMS.filter((faq) => {
      const questions = `${faq.question.FR} ${faq.question.EN}`.toLowerCase();
      const answers = `${faq.answer.FR} ${faq.answer.EN}`.toLowerCase();

      return questions.includes(normalizedQuery) || answers.includes(normalizedQuery);
    });

    return {
      parcels: filteredParcels.slice(0, 6),
      articles: filteredArticles.slice(0, 4),
      faqs: filteredFaqs.slice(0, 4),
    };
  };

  const results = getFilteredResults();
  const hasResults = results.parcels.length > 0 || results.articles.length > 0 || results.faqs.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 md:p-12 bg-primary/95 backdrop-blur-md overflow-y-auto">
      {/* Click outside backdrop close */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-[#FAF9F5] border border-[#8C7A53]/35 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden mt-6"
      >
        {/* Search Input Bar Holder */}
        <div className="p-5 md:p-6 border-b border-gray-200 flex items-center bg-white space-x-4">
          <Search className="w-5 h-5 text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              isFR 
                ? "Rechercher parcelles (ex: 28, disponible), guides, ou FAQs..." 
                : "Search parcels (e.g. 12, available), insights, or FAQs..."
            }
            className="w-full bg-transparent border-none outline-none font-sans text-base md:text-lg text-primary placeholder-outline focus:ring-0"
          />
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer text-primary"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {!normalizedQuery ? (
            /* Blank state helpful tips */
            <div className="text-center py-8 space-y-3">
              <span className="inline-block p-3 rounded-full bg-[#8C7A53]/10 text-[#8C7A53]">
                <Search className="w-6 h-6 animate-pulse" />
              </span>
              <h3 className="font-serif text-base font-bold text-primary">
                {isFR ? 'Pôle de Recherche Global' : 'Global Discovery Center'}
              </h3>
              <p className="font-sans text-xs text-outline max-w-sm mx-auto leading-relaxed">
                {isFR
                  ? 'Saisissez vos mots-clés pour naviguer instantanément à travers les parcelles géolocalisées, nos guides d\'experts diaspora, ou nos cadres de conformité légale.'
                  : 'Enter keywords to immediately look up geolocalized plots, expert diaspora investor reports, or state-registered compliance policies.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-[10px] font-mono font-bold text-[#8C7A53] uppercase">{isFR ? 'suggestions :' : 'suggestions:'}</span>
                {['#24', 'disponible', 'notaire', 'diaspora', 'tax'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="text-[10px] font-mono tracking-wide bg-white border border-gray-300 hover:border-primary text-primary px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-2xs"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : !hasResults ? (
            /* No results feedback state */
            <div className="text-center py-10 space-y-2">
              <p className="text-lg font-bold font-serif text-primary">
                {isFR ? 'Aucun résultat trouvé' : 'No matches found'}
              </p>
              <p className="text-xs text-outline font-sans max-w-md mx-auto leading-relaxed">
                {isFR
                  ? `Nous n'avons trouvé aucun élément correspondant à "${query}". Veuillez reformuler votre terme (ex: essayez un numéro de parcelle, "notaire" ou "vendu").`
                  : `We couldn't find any results matching "${query}". Please verify your term or check other criteria (e.g. try a plot number, "notary" or "avail").`}
              </p>
            </div>
          ) : (
            /* Display actual categorized search results */
            <div className="space-y-6">
              {/* Category 1: Parcels */}
              {results.parcels.length > 0 && (
                <div id="search-cat-parcels" className="space-y-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C7A53] flex items-center space-x-1.5">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>{isFR ? 'PARCELLES ET EMBLACEMENTS' : 'LAND PARCELS & PLOTS'}</span>
                    <span className="text-outline-variant/55 font-normal">({results.parcels.length})</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.parcels.map((parcel) => {
                      const isAvailable = parcel.status === 'Available';
                      const isReserved = parcel.status === 'Reserved';
                      const statusColor = isAvailable 
                        ? 'bg-[#0F6B4F]/10 text-[#0F6B4F]' 
                        : isReserved 
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37]' 
                          : 'bg-outline/10 text-outline';
                      const statusLabel = isFR 
                        ? (isAvailable ? 'Disponible' : isReserved ? 'Réservé' : 'Vendu') 
                        : parcel.status;

                      return (
                        <div
                          key={parcel.id}
                          onClick={() => onSelectParcel(parcel.id)}
                          className="bg-white border border-gray-300 p-3.5 rounded-xl hover:border-primary hover:shadow-xs transition-all duration-300 cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-serif text-sm font-black text-primary group-hover:text-[#8C7A53] transition-colors">
                                #{parcel.id < 10 ? `0${parcel.id}` : parcel.id}
                              </span>
                              <span className="font-mono text-[10px] font-medium text-outline">
                                {parcel.area} m²
                              </span>
                            </div>
                            <p className="text-[11px] font-sans text-outline leading-tight mt-0.5 max-w-[180px] truncate">
                              📍 {parcel.orientation[currentLanguage]}
                            </p>
                          </div>

                          <div className="text-right flex flex-col items-end space-y-1.5">
                            <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-sm uppercase ${statusColor}`}>
                              {statusLabel}
                            </span>
                            <span className="font-mono text-xs font-bold text-primary">
                              15 000 € <span className="text-[10px] text-[#0F6B4F] font-semibold">(300 €/m)</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category 2: Blog Insights */}
              {results.articles.length > 0 && (
                <div id="search-cat-blogs" className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C7A53] flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isFR ? 'GUIDES ET INVESTISSEMENTS' : 'DIASPORA INSIGHT & GUIDES'}</span>
                    <span className="text-outline-variant/55 font-normal">( {results.articles.length} )</span>
                  </span>

                  <div className="space-y-2.5">
                    {results.articles.map((article) => (
                      <div
                        key={article.id}
                        onClick={() => onSelectArticle(article)}
                        className="bg-white border border-gray-300 p-4 rounded-xl hover:border-primary hover:shadow-xs transition-all duration-300 cursor-pointer flex items-start space-x-4 group"
                      >
                        <img
                          src={article.image}
                          alt={article.title[currentLanguage]}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-200 shrink-0"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center space-x-2 text-[9px] font-mono font-bold text-[#8C7A53] uppercase tracking-wide">
                            <span>{article.category[currentLanguage]}</span>
                            <span>•</span>
                            <span className="flex items-center space-x-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{article.date}</span>
                            </span>
                          </div>
                          <h4 className="font-serif text-sm font-bold text-primary group-hover:text-[#8C7A53] transition-colors leading-snug truncate">
                            {article.title[currentLanguage]}
                          </h4>
                          <p className="text-[11px] font-sans text-outline leading-tight font-light truncate">
                            {article.summary[currentLanguage]}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-outline/40 group-hover:text-[#8C7A53] group-hover:translate-x-1 transition-all shrink-0 align-self-center mt-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category 3: FAQ Topics */}
              {results.faqs.length > 0 && (
                <div id="search-cat-faqs" className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C7A53] flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isFR ? 'QUESTIONS JURIDIQUES & NOTAIRES' : 'LEGAL & NOTARY FAQS'}</span>
                    <span className="text-outline-variant/55 font-normal">( {results.faqs.length} )</span>
                  </span>

                  <div className="space-y-2.5">
                    {results.faqs.map((faq) => (
                      <div
                        key={faq.id}
                        onClick={() => onSelectFaq(faq.id)}
                        className="bg-white border border-gray-300 p-4 rounded-xl hover:border-primary hover:shadow-xs transition-all duration-300 cursor-pointer flex items-start justify-between group"
                      >
                        <div className="space-y-1 flex-1 pr-4">
                          <h4 className="font-serif text-sm font-bold text-primary group-hover:text-[#8C7A53] transition-colors leading-snug">
                            {faq.question[currentLanguage]}
                          </h4>
                          <p className="text-[11px] font-sans text-outline leading-relaxed font-light line-clamp-2">
                            {faq.answer[currentLanguage]}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-outline/40 group-hover:text-[#8C7A53] group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer helper */}
        <div className="p-4 bg-white border-t border-gray-200 text-center font-mono text-[9px] text-outline uppercase shrink-0 flex justify-between items-center px-6">
          <span>{isFR ? 'melrose place recherche' : 'melrose place finder'}</span>
          <span>ESC {isFR ? 'pour fermer' : 'to close'}</span>
        </div>
      </motion.div>
    </div>
  );
}
