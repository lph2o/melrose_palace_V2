import React, { useState } from 'react';
import { X, Save, RotateCcw, ShieldCheck, Check, Settings, AlertCircle } from 'lucide-react';
import { SiteSettings, Parcel, Language } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  onSaveSettings: (newSettings: SiteSettings) => void;
  parcels: Parcel[];
  onUpdateParcelStatus: (id: number, status: 'Available' | 'Reserved' | 'Sold') => void;
  onResetDefaults: () => void;
  currentLanguage: Language;
}

export default function AdminModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  parcels,
  onUpdateParcelStatus,
  onResetDefaults,
  currentLanguage,
}: AdminModalProps) {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'tarifs' | 'parcelles' | 'contact'>('tarifs');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-300 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-primary text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-secondary-fixed text-primary font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white">
                Espace Gérant • Sénégal Immobilier Consulting
              </h3>
              <p className="text-xs text-white/70">
                Gestion des tarifs, parcelles, promotions et coordonnées WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-surface-container-low px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('tarifs')}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'tarifs'
                ? 'border-secondary text-primary font-bold'
                : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            Tarifs & Échéancier
          </button>
          <button
            onClick={() => setActiveTab('parcelles')}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'parcelles'
                ? 'border-secondary text-primary font-bold'
                : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            Statut des 20 Parcelles
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-secondary text-primary font-bold'
                : 'border-transparent text-outline hover:text-primary'
            }`}
          >
            WhatsApp & Promotions
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Modifications enregistrées avec succès et appliquées immédiatement au site !</span>
            </div>
          )}

          {activeTab === 'tarifs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Prix de référence échelonné (€)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                  />
                  <span className="text-[11px] text-outline">Actuel : 15 000 € (3 000 € + 40 × 300 €)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Prix paiement comptant (€)
                  </label>
                  <input
                    type="number"
                    value={formData.cashPrice}
                    onChange={(e) => setFormData({ ...formData, cashPrice: Number(e.target.value) })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                  />
                  <span className="text-[11px] text-outline">Actuel : 13 500 € (économie de 1 500 €)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Montant de l'acompte par défaut (€)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultDeposit}
                    onChange={(e) => setFormData({ ...formData, defaultDeposit: Number(e.target.value) })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                  />
                  <span className="text-[11px] text-outline">Actuel : 3 000 €</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Mensualité par défaut (€/mois)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultMonthly}
                    onChange={(e) => setFormData({ ...formData, defaultMonthly: Number(e.target.value) })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                  />
                  <span className="text-[11px] text-outline">Actuel : 300 €/mois</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Durée d'échelonnement par défaut (mois)
                  </label>
                  <input
                    type="number"
                    value={formData.defaultDurationMonths}
                    onChange={(e) => setFormData({ ...formData, defaultDurationMonths: Number(e.target.value) })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm focus:ring-2 focus:ring-secondary/30 focus:border-secondary"
                  />
                  <span className="text-[11px] text-outline">Actuel : 40 mois</span>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-xl border border-gray-300 text-xs space-y-1">
                <span className="font-bold text-primary">Rappel de la stratégie commerciale :</span>
                <p className="text-on-surface-variant">
                  • 20 parcelles financées à 15 000 € → 60 000 € d'acomptes + 6 000 €/mois × 40 mois = 300 000 €.<br/>
                  • 20 parcelles comptant à 13 500 € → 270 000 € immédiatement.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'parcelles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-bold text-primary">Gestion des 20 parcelles commercialisées</span>
                <span className="text-[11px] text-outline">Modifier le statut en 1 clic</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {parcels.map((parcel) => (
                  <div
                    key={parcel.id}
                    className="p-3 border border-gray-300 rounded-xl flex items-center justify-between bg-white shadow-2xs"
                  >
                    <div>
                      <span className="font-serif font-bold text-sm text-primary">
                        Parcelle #{parcel.id}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-outline mt-0.5">
                        <span>150 m²</span>
                        {parcel.isPromo && (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded text-[9px] font-bold">
                            Promo
                          </span>
                        )}
                      </div>
                    </div>

                    <select
                      value={parcel.status}
                      onChange={(e) => onUpdateParcelStatus(parcel.id, e.target.value as any)}
                      className={`text-xs font-bold px-2 py-1.5 rounded-lg border cursor-pointer ${
                        parcel.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : parcel.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Available">🟢 Disponible</option>
                      <option value="Reserved">🟠 Réservée</option>
                      <option value="Sold">🔴 Vendue</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Numéro WhatsApp (affichage)
                </label>
                <input
                  type="text"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm"
                  placeholder="+33 7 61 23 55 09"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Numéro WhatsApp international (sans espaces ni +, pour les liens direct wa.me)
                </label>
                <input
                  type="text"
                  value={formData.whatsappCleanNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappCleanNumber: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm font-mono"
                  placeholder="33761235509"
                />
                <span className="text-[11px] text-outline">Exemple : 33761235509 (indicatif pays sans le +, suivi du numéro)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm"
                    placeholder="globalequalite@gmail.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Adresse / Bureau au Sénégal
                  </label>
                  <input
                    type="text"
                    value={formData.contactAddress || ''}
                    onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                    className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm"
                    placeholder="Dakar, Rufisque — Keury Kao"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Titre de la promotion (10 premières parcelles)
                </label>
                <input
                  type="text"
                  value={formData.promoTitle}
                  onChange={(e) => setFormData({ ...formData, promoTitle: e.target.value })}
                  className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">
                  Détail de l'offre promotionnelle
                </label>
                <textarea
                  rows={2}
                  value={formData.promoDesc}
                  onChange={(e) => setFormData({ ...formData, promoDesc: e.target.value })}
                  className="w-full p-2.5 border border-outline-variant/30 rounded-lg text-sm"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="promoActive"
                  checked={formData.promoActive}
                  onChange={(e) => setFormData({ ...formData, promoActive: e.target.checked })}
                  className="w-4 h-4 text-secondary rounded cursor-pointer"
                />
                <label htmlFor="promoActive" className="text-xs font-bold text-primary cursor-pointer">
                  Activer la bannière promotionnelle des 10 premiers acquéreurs sur le site
                </label>
              </div>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={onResetDefaults}
              className="text-xs text-outline hover:text-rose-600 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rétablir les valeurs par défaut</span>
            </button>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-outline hover:text-primary rounded-lg border border-outline-variant/30"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-secondary text-on-secondary hover:bg-secondary/90 rounded-lg flex items-center space-x-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
