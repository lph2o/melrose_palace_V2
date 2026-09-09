import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import MasterPlanPage from './components/MasterPlanPage';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import BlogModal from './components/BlogModal';
import AdminModal from './components/AdminModal';
import BrochureModal from './components/BrochureModal';
import WhatsAppFloatingButton from './components/WhatsAppFloatingButton';
import { Language, BlogArticle, SiteSettings, Parcel } from './types';
import { DEFAULT_SITE_SETTINGS, PARCELS } from './data';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [language, setLanguage] = useState<Language>('FR'); // French by default
  const [activeTab, setActiveTab] = useState<'home' | 'masterplan'>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [globalSelectedParcelId, setGlobalSelectedParcelId] = useState<number | null>(null);
  const [globalActiveArticle, setGlobalActiveArticle] = useState<BlogArticle | null>(null);
  const [globalActiveFaqId, setGlobalActiveFaqId] = useState<string | null>(null);

  // Dynamic Site Settings with localStorage persistence
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('sic_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure email and address match official brochure
        if (!parsed.contactEmail || parsed.contactEmail.includes('senegal-immobilier-consulting.com')) {
          parsed.contactEmail = 'globalequalite@gmail.com';
          parsed.contactAddress = 'Dakar, Rufisque — Keury Kao';
        }
        if (!parsed.whatsappNumber || parsed.whatsappNumber.includes('77 345 67 89')) {
          parsed.whatsappNumber = '+33 7 61 23 55 09';
          parsed.whatsappCleanNumber = '33761235509';
          parsed.contactPhone = '+33 7 61 23 55 09';
        }
        localStorage.setItem('sic_site_settings', JSON.stringify(parsed));
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Dynamic Parcels state (20 parcels initialized)
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    try {
      const saved = localStorage.getItem('sic_parcels');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return PARCELS;
  });

  const handleSaveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('sic_site_settings', JSON.stringify(newSettings));
    } catch {
      // ignore
    }
  };

  const handleUpdateParcelStatus = (id: number, status: 'Available' | 'Reserved' | 'Sold') => {
    setParcels((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, status } : p));
      try {
        localStorage.setItem('sic_parcels', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_SITE_SETTINGS);
    setParcels(PARCELS);
    try {
      localStorage.removeItem('sic_site_settings');
      localStorage.removeItem('sic_parcels');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectParcel = (id: number) => {
    setIsSearchOpen(false);
    setGlobalSelectedParcelId(id);
    setActiveTab('masterplan');
  };

  const handleSelectArticle = (article: BlogArticle) => {
    setIsSearchOpen(false);
    setGlobalActiveArticle(article);
  };

  const handleSelectFaq = (id: string) => {
    setIsSearchOpen(false);
    setActiveTab('home');
    setGlobalActiveFaqId(id);
  };

  return (
    <div className="bg-[#FAF9F5] text-primary min-h-screen flex flex-col justify-between selection:bg-secondary-fixed/50 selection:text-primary">
      
      {/* Dynamic Floating Navbar */}
      <Navbar
        currentLanguage={language}
        setLanguage={setLanguage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scrollToSection={scrollToSection}
        onSearchTrigger={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBrochure={() => setIsBrochureOpen(true)}
        settings={settings}
      />

      {/* Main Core Screen Contents Layer */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <LandingPage
                currentLanguage={language}
                setActiveTab={setActiveTab}
                scrollToSection={scrollToSection}
                globalActiveFaqId={globalActiveFaqId}
                onClearGlobalActiveFaqId={() => setGlobalActiveFaqId(null)}
                onSelectArticle={(article) => setGlobalActiveArticle(article)}
                onOpenBrochure={() => setIsBrochureOpen(true)}
                settings={settings}
                parcels={parcels}
                onSelectParcel={handleSelectParcel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="masterplan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <MasterPlanPage
                currentLanguage={language}
                setActiveTab={setActiveTab}
                globalSelectedParcelId={globalSelectedParcelId}
                onClearGlobalSelectParcel={() => setGlobalSelectedParcelId(null)}
                settings={settings}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        currentLanguage={language}
        setActiveTab={setActiveTab}
        settings={settings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBrochure={() => setIsBrochureOpen(true)}
      />

      {/* WhatsApp Floating Contact Widget */}
      <WhatsAppFloatingButton
        settings={settings}
        currentLanguage={language}
      />

      {/* Global Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <SearchModal
            onClose={() => setIsSearchOpen(false)}
            currentLanguage={language}
            onSelectParcel={handleSelectParcel}
            onSelectArticle={handleSelectArticle}
            onSelectFaq={handleSelectFaq}
          />
        )}
      </AnimatePresence>

      {/* Global Blog Article Modal */}
      <AnimatePresence>
        {globalActiveArticle && (
          <BlogModal
            article={globalActiveArticle}
            currentLanguage={language}
            onClose={() => setGlobalActiveArticle(null)}
            onActionClick={() => scrollToSection('contact')}
          />
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        parcels={parcels}
        onUpdateParcelStatus={handleUpdateParcelStatus}
        onResetDefaults={handleResetDefaults}
        currentLanguage={language}
      />

      {/* Official Dun Tni Brochure PDF Modal */}
      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        settings={settings}
        currentLanguage={language}
      />
      
    </div>
  );
}
