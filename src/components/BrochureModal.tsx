import React, { useState } from 'react';
import { X, Download, Printer, ChevronLeft, ChevronRight, FileText, CheckCircle2, MapPin, Phone, Mail, Shield, Building, Compass, Sparkles } from 'lucide-react';
import { SiteSettings, Language } from '../types';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  currentLanguage: Language;
}

export default function BrochureModal({
  isOpen,
  onClose,
  settings,
  currentLanguage,
}: BrochureModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 7;

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#FAF9F5] text-primary rounded-2xl max-w-4xl w-full shadow-2xl border border-secondary-fixed/30 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Header toolbar */}
        <div className="bg-[#00261a] text-white px-5 py-3.5 flex justify-between items-center border-b border-white/10 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-primary flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-sm sm:text-base text-white">
                  Plaquette Officielle • Dun Tni Sébikhotane
                </span>
                <span className="bg-secondary-fixed/20 text-secondary-fixed text-[10px] font-mono px-2 py-0.5 rounded-full border border-secondary-fixed/30">
                  RÉF. LOT/2026
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Document officiel Sénégal Immobilier Consulting — 7 pages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer border border-white/15"
              title="Imprimer ou Sauvegarder en PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/15 text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page navigation bar */}
        <div className="bg-[#F0ECE1] px-4 py-2 flex justify-between items-center border-b border-gray-300 text-xs shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Page {currentPage} sur {totalPages} :</span>
            <span className="font-bold text-primary hidden sm:inline">
              {currentPage === 1 && 'Couverture & Présentation (Dun Tni)'}
              {currentPage === 2 && 'Le Lieu — Sébikhotane'}
              {currentPage === 3 && 'Le Territoire & Carte de Situation (AIBD, TER, Diamniadio)'}
              {currentPage === 4 && "L'Offre de Financement (300 €/mois dès 3 000 € d'apport)"}
              {currentPage === 5 && 'Nos 4 Garanties Juridiques (Propriété directe, Délibération & NICAD)'}
              {currentPage === 6 && 'Plan Officiel de Lotissement (54 parcelles B1 à B17)'}
              {currentPage === 7 && 'Contact & Réservation Dun Tni'}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex space-x-1 px-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-6 h-6 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#00261a] text-secondary-fixed shadow-xs'
                      : 'bg-white/70 text-gray-600 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Brochure Content Viewer */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-grow bg-[#FAF9F5]">
          
          {/* PAGE 1: COVER */}
          {currentPage === 1 && (
            <div className="max-w-xl mx-auto bg-[#1A1816] text-[#FAF9F5] rounded-xl p-8 sm:p-10 shadow-xl border border-amber-900/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-full bg-[#C59B27]/10 pointer-events-none" />
              
              <div className="flex justify-between items-start border-b border-white/15 pb-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white tracking-wide">Senegal Immobilier Consulting</h3>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-amber-300">BORN IN SENEGAL</p>
                </div>
                <div className="text-right text-xs font-mono text-amber-200">
                  <p>DKR ➔ SEBI</p>
                  <p className="text-[10px] text-white/60">Dakar ➔ Sébikhotane</p>
                </div>
              </div>

              <div className="my-8 text-center sm:text-left space-y-4">
                <div className="inline-block px-3 py-1 rounded bg-[#C59B27]/20 text-amber-300 font-mono text-xs tracking-widest uppercase border border-[#C59B27]/40">
                  ACCESSIBLE • TRANSPARENT • SÉCURISÉ
                </div>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white tracking-tight">
                  Dun Tni
                </h1>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-light max-w-md">
                  Votre terrain à Sébikhotane à partir de <strong className="text-amber-300 font-semibold">300 €/mois</strong> — 
                  parcelles à moins de 20 km de l'aéroport international Blaise Diagne et à 5 km du pôle urbain de Diamniadio.
                </p>
              </div>

              {/* Cover Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Parcelle Type</span>
                  <span className="text-xl font-bold font-serif text-white">150 m²</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Prix Dès</span>
                  <span className="text-xl font-bold font-serif text-amber-300">15 000 €</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Apport</span>
                  <span className="text-xl font-bold font-serif text-white">3 000 €</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-gray-400 block">Puis</span>
                  <span className="text-xl font-bold font-serif text-amber-300">300 €/m</span>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/15 flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span>AÉROPORT INTERNATIONAL BLAISE DIAGNE — &lt; 20 KM</span>
                <span>RÉF. LOT/2026</span>
              </div>
            </div>
          )}

          {/* PAGE 2: LE LIEU */}
          {currentPage === 2 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-gray-300 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase text-secondary tracking-widest">
                  LE LIEU 02 / DESTINATION
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Une ville qui respire, aux portes de Dakar
                </h2>
                <p className="text-sm italic text-gray-600 mt-1">
                  « Sébikhotane est une ville accueillante, dynamique et vivante. »
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-xs font-mono text-gray-500 uppercase block">Terrain</span>
                  <span className="font-serif font-bold text-lg text-primary">Plat</span>
                  <p className="text-xs text-gray-600 mt-1">Facile à bâtir, sans surcoût de terrassement majeur.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-xs font-mono text-gray-500 uppercase block">Cadre</span>
                  <span className="font-serif font-bold text-lg text-primary">Arboré</span>
                  <p className="text-xs text-gray-600 mt-1">Arbres naturels préservés et proximité forêt classée.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-xs font-mono text-gray-500 uppercase block">Accès</span>
                  <span className="font-serif font-bold text-lg text-primary">Stratégique</span>
                  <p className="text-xs text-gray-600 mt-1">Entre Dakar, Diamniadio et l'aéroport AIBD.</p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-2">
                <h4 className="font-serif font-bold text-base text-amber-950">Pourquoi ce site ?</h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  La surface des terrains est comprise entre <strong>120 et 200 m²</strong> (parcelles types de 150 m² bornées), offrant une large variété de choix en fonction de votre projet de résidence principale ou d'investissement locatif. Un secteur stratégique donnant accès à une multitude d'avantages : transports, écoles, commerces, infrastructures diverses.
                </p>
              </div>
            </div>
          )}

          {/* PAGE 3: LE TERRITOIRE */}
          {currentPage === 3 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-gray-300 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase text-secondary tracking-widest">
                  LE TERRITOIRE 03 / SITUATION
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Sébikhotane dans son territoire
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Rattachée au Département de Rufisque (Région de Dakar), la commune de Sébikhotane compte 42 839 habitants sur 20,1 km² (recensement ANSD 2023). Elle appartient au Pôle urbain de Diamniadio dans le cadre du Plan Sénégal Émergent.
                </p>
              </div>

              {/* Distance Benchmarks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Diamniadio</span>
                  <span className="font-serif font-bold text-xl text-primary">5 km</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Gare TER Sébikhotane</span>
                  <span className="font-serif font-bold text-xl text-secondary">≈ 4 km</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Aéroport AIBD</span>
                  <span className="font-serif font-bold text-xl text-primary">&lt; 20 km</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase block">Dakar Centre</span>
                  <span className="font-serif font-bold text-xl text-gray-700">≈ 40 km</span>
                </div>
              </div>

              {/* Highlights Box */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                <h4 className="font-serif font-bold text-sm text-primary flex items-center gap-2">
                  <Building className="w-4 h-4 text-secondary" />
                  Un territoire en pleine transformation
                </h4>
                <ul className="text-xs text-gray-700 space-y-2 list-disc pl-5">
                  <li><strong>Gare multimodale TER</strong> en construction à Sébikhotane (≈ 4 km) : 1,2 ha, bâtiment voyageurs, quais bus/cars, parvis planté de 165 arbres.</li>
                  <li><strong>Programme d'envergure</strong> de 20 milliards FCFA : centre commercial, bureaux, hôtel 3 étoiles et nouveau domaine industriel.</li>
                  <li><strong>Axe stratégique</strong> du futur port en eau profonde de Ndayane (70 km au sud de Dakar).</li>
                  <li><strong>Cadre naturel :</strong> bordé par la Forêt Classée de Sébikotane (3,5 km).</li>
                </ul>
              </div>
            </div>
          )}

          {/* PAGE 4: FINANCEMENT */}
          {currentPage === 4 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-gray-300 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase text-secondary tracking-widest">
                  L'OFFRE 04 / FINANCEMENT
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Un investissement accessible, étape par étape
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Devenez propriétaire à Sébikhotane sans attendre de réunir l'intégralité des fonds.
                </p>
              </div>

              <div className="bg-primary text-white p-6 rounded-2xl shadow-md text-center space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-secondary-fixed">
                  Tranche 1 — Offre de Lancement
                </span>
                <div className="font-serif text-4xl sm:text-5xl font-bold text-secondary-fixed">
                  300 € <span className="text-lg font-sans font-normal text-white">/ mois</span>
                </div>
                <p className="text-xs text-white/80">
                  Après <strong>3 000 € d'apport initial</strong> • Durée de 40 mois • Prix total : <strong>15 000 €</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
                  <h4 className="font-serif font-bold text-base text-primary">Paiement échelonné</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>3 000 € d'apport</strong>, puis <strong>300 €/mois pendant 40 mois</strong>. Un calendrier souple adapté au rythme d'épargne de la diaspora et des résidents.
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-2">
                  <h4 className="font-serif font-bold text-base text-primary">Paiement comptant & Bancaire</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Un tarif préférentiel au comptant est accordé. Partenariats également étudiés avec des banques sénégalaises pour des durées allongées.
                  </p>
                </div>
              </div>

              <div className="border border-gray-300 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-center">
                  <thead className="bg-[#00261a] text-white font-mono uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Apport</th>
                      <th className="p-3">Mensualité</th>
                      <th className="p-3">Durée</th>
                      <th className="p-3">Prix Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white font-bold text-primary">
                    <tr>
                      <td className="p-3 border-r border-gray-200">3 000 €</td>
                      <td className="p-3 border-r border-gray-200 text-secondary">300 €</td>
                      <td className="p-3 border-r border-gray-200">40 mois</td>
                      <td className="p-3 text-emerald-800">15 000 €</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 5: GARANTIES */}
          {currentPage === 5 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-gray-300 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase text-secondary tracking-widest">
                  NOS GARANTIES 05 / SÉCURITÉ
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Une acquisition en toute confiance
                </h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Le marché foncier sénégalais a parfois été marqué par des litiges. Nos parcelles sont issues de notre <strong>propre patrimoine</strong>, sans intermédiaire ni revente de tiers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                  <span className="font-mono text-xs font-bold text-secondary">01</span>
                  <h4 className="font-serif font-bold text-sm text-primary">Propriété directe</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Les parcelles commercialisées appartiennent directement à notre société. Zéro intermédiaire.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                  <span className="font-mono text-xs font-bold text-secondary">02</span>
                  <h4 className="font-serif font-bold text-sm text-primary">Transaction transparente</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Délibération communale, NICAD et cotes exactes sont communiqués et vérifiables avant toute signature.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                  <span className="font-mono text-xs font-bold text-secondary">03</span>
                  <h4 className="font-serif font-bold text-sm text-primary">Accompagnement mutation</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Suivi administratif complet. Finalisation de la mutation en moins de 2 mois dès dossier instruit, avec suivi à distance pour la diaspora.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-1.5">
                  <span className="font-mono text-xs font-bold text-secondary">04</span>
                  <h4 className="font-serif font-bold text-sm text-primary">Sécurisation & Construction</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Terrain borné par géomètre. Travaux sur demande : clôture complète, portail, gros œuvre ou clé en main.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-emerald-900">
                  ✓ Remboursement intégral si nos engagements contractuels ne sont pas respectés
                </p>
              </div>

              <p className="text-xs italic text-gray-500 text-center">
                « Notre ambition n'est pas simplement de vendre un terrain, mais de bâtir une relation de confiance durable avec chaque acquéreur. »
              </p>
            </div>
          )}

          {/* PAGE 6: PLAN DE LOTISSEMENT */}
          {currentPage === 6 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="border-b border-gray-300 pb-3">
                <span className="text-[11px] font-mono font-bold uppercase text-secondary tracking-widest">
                  LE PLAN 06 / PLAN OFFICIEL
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
                  Plan de lotissement officiel
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Cinquante-quatre (54) parcelles bornées de B1 à B17, réparties en trois secteurs desservis par un réseau de voies internes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase block">Secteur Ouest</span>
                  <span className="font-serif font-bold text-base text-emerald-950">14 terrains</span>
                  <span className="text-[10px] text-emerald-700 block">Lots 1 à 14, 53</span>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-amber-800 uppercase block">Secteur Central</span>
                  <span className="font-serif font-bold text-base text-amber-950">19 terrains</span>
                  <span className="text-[10px] text-amber-700 block">Lots 15 à 31, 54</span>
                </div>

                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl">
                  <span className="text-[11px] font-mono font-bold text-rose-800 uppercase block">Secteur Est</span>
                  <span className="font-serif font-bold text-base text-rose-950">21 terrains</span>
                  <span className="text-[10px] text-rose-700 block">Lots 32 à 52</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 text-center space-y-2">
                <span className="font-mono text-xs font-bold text-secondary block">
                  TRANCHE 1 : 20 PARCELLES COMMERCIALISÉES
                </span>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Consultez le <strong>Plan Cadastral Interactif</strong> dans l'application pour explorer les parcelles lot par lot avec leurs dimensions exactes, orientation solaire et état de disponibilité en temps réel.
                </p>
              </div>
            </div>
          )}

          {/* PAGE 7: CONTACT DUN TNI */}
          {currentPage === 7 && (
            <div className="max-w-xl mx-auto bg-[#00261a] text-white rounded-2xl p-8 shadow-xl border border-white/10 space-y-6 text-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-fixed">
                  POURQUOI DUN TNI 07 / CONTACT
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  Réservez votre parcelle à Dun Tni
                </h3>
                <p className="text-xs text-white/75 mt-1 font-light">
                  Sébikhotane — Sénégal • Un cadre naturel préservé, à l'échelle humaine d'un lotissement de 54 parcelles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <a
                  href={`https://wa.me/${settings.whatsappCleanNumber}?text=${encodeURIComponent('Bonjour Sénégal Immobilier Consulting, je souhaite réserver une parcelle du programme Dun Tni à Sébikhotane.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/15 p-4 rounded-xl border border-white/15 transition-all block group"
                >
                  <span className="text-[10px] font-mono uppercase text-secondary-fixed block">WhatsApp</span>
                  <span className="font-mono font-bold text-sm text-white group-hover:text-secondary-fixed transition-colors">
                    {settings.whatsappNumber}
                  </span>
                  <span className="text-[10px] text-white/60 block mt-1">Réponse rapide, 7j/7</span>
                </a>

                <div className="bg-white/10 p-4 rounded-xl border border-white/15">
                  <span className="text-[10px] font-mono uppercase text-secondary-fixed block">Email</span>
                  <span className="font-mono font-bold text-xs text-white break-all">
                    {settings.contactEmail}
                  </span>
                  <span className="text-[10px] text-white/60 block mt-1">Dossiers & contrats</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs text-white/80 space-y-1">
                <span className="text-[10px] font-mono uppercase text-secondary-fixed block">Bureau au Sénégal</span>
                <p className="font-medium text-white">Dakar, Rufisque — Keury Kao</p>
                <p className="text-[11px] text-white/60">Sénégal Immobilier Consulting • Born in Senegal</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-white px-5 py-3 border-t border-gray-300 flex justify-between items-center text-xs shrink-0">
          <span className="text-gray-500 font-mono text-[11px]">
            Dun Tni • Sébikhotane — Réf. LOT/2026
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-colors cursor-pointer"
            >
              Imprimer / Sauvegarder
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
