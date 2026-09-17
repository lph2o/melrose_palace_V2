import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Language, PaymentTier, SiteSettings, UITranslations } from '../types';
import { PAYMENT_SCHEDULE_TIERS, TRANSLATIONS } from '../data';
import { buildPaymentSchedule, scheduleFormula } from '../lib/payment';
import { useSite } from '../site/SiteContext';
import { openWhatsApp } from '../site/whatsapp';
import { RichText } from '../components/RichText';

export interface SimulatorContent {
  transparencyTag: string;
  title: string;
  description: string;
  depositLabel: string;
  monthlyLabel: string;
  gridLabel: string;
  resultTag: string;
  resultTitle: string;
  resultSubtitle: string;
  refPriceLabel: string;
  yourDepositLabel: string;
  remainingLabel: string;
  monthlyRowLabel: string;
  durationRowLabel: string;
  cashTitle: string;
  /** Peut contenir {cash}, {full} et {saving}, remplacés au rendu. */
  cashDesc: string;
  studyCta: string;
  /** En-têtes du tableau des paliers officiels. */
  colDepositLabel: string;
  colRemainingLabel: string;
  colMonthlyLabel: string;
  colDurationLabel: string;
  /** Sous-titres des boutons d'apport rapide (« Apport de base » / « Option flexible »). */
  depositBaseTag: string;
  depositFlexTag: string;
  /** Unités et mentions du curseur / du tableau. */
  perMonthUnit: string;
  recommendedTag: string;
  monthsUnit: string;
  /** Les 4 paliers d'apport rapides proposés au-dessus du curseur (€). */
  depositShortcut1: number;
  depositShortcut2: number;
  depositShortcut3: number;
  depositShortcut4: number;
}

export function defaultSimulatorContent(lang: Language, _settings: SiteSettings): SimulatorContent {
  const t = TRANSLATIONS[lang];
  const ui = t.ui as UITranslations;
  return {
    transparencyTag: ui.simulatorTransparencyTag,
    title: t.masterPlan.calculator.title,
    description: t.masterPlan.calculator.desc,
    depositLabel: ui.simulatorDepositLabel,
    monthlyLabel: ui.simulatorMonthlyLabel,
    gridLabel: ui.simulatorGridLabel,
    resultTag: ui.simulatorResultTag,
    resultTitle: ui.simulatorResultTitle,
    resultSubtitle: ui.simulatorResultSubtitle,
    refPriceLabel: ui.simulatorRefPrice,
    yourDepositLabel: ui.simulatorYourDeposit,
    remainingLabel: ui.simulatorRemaining,
    monthlyRowLabel: ui.simulatorMonthlyRow,
    durationRowLabel: ui.simulatorDurationRow,
    cashTitle: ui.simulatorCashTitle,
    cashDesc: ui.simulatorCashDesc,
    studyCta: t.masterPlan.calculator.btnStudy,
    colDepositLabel: ui.simulatorColDeposit,
    colRemainingLabel: ui.simulatorColRemaining,
    colMonthlyLabel: ui.simulatorColMonthly,
    colDurationLabel: ui.simulatorColDuration,
    depositBaseTag: ui.simulatorDepositBase,
    depositFlexTag: ui.simulatorDepositFlex,
    perMonthUnit: ui.simulatorPerMonth,
    recommendedTag: ui.simulatorRecommended,
    monthsUnit: ui.simulatorMonths,
    depositShortcut1: 3000,
    depositShortcut2: 4000,
    depositShortcut3: 5000,
    depositShortcut4: 6000,
  };
}

export function SimulatorSection({ content }: { content?: Partial<SimulatorContent> }) {
  const { language, settings } = useSite();
  const t = TRANSLATIONS[language];
  const ui = t.ui as UITranslations;
  const base = defaultSimulatorContent(language, settings);
  const c: SimulatorContent = { ...base, ...content };

  const [simulatorDeposit, setSimulatorDeposit] = useState<number>(settings.defaultDeposit || 3000);
  const [simulatorMonthly, setSimulatorMonthly] = useState<number>(settings.defaultMonthly || 300);

  // Échéancier cohérent par construction : mensualité pleine, dernier versement
  // plus petit s'il en faut un, et un total qui tombe juste sur le prix.
  const schedule = buildPaymentSchedule(settings.basePrice, simulatorDeposit, simulatorMonthly);
  const formula = scheduleFormula(schedule);

  // Paliers pilotés par l'Espace Gérant → onglet Contenu. Seuls l'acompte et la
  // mensualité saisis font foi : le reste, la durée et le dernier versement sont
  // recalculés, sinon la grille peut afficher des produits qui ne tombent pas
  // juste (cf. audit du simulateur).
  const tiers: PaymentTier[] = settings.content?.paymentTiers ?? PAYMENT_SCHEDULE_TIERS;
  const tierSchedule = (tier: PaymentTier) =>
    buildPaymentSchedule(
      settings.basePrice,
      tier.deposit,
      tier.monthly > 0 ? tier.monthly : settings.defaultMonthly
    );

  const openWhatsAppSimulator = () => {
    // Récapitulatif bilingue : les valeurs sont neutres, seuls les libellés
    // changent (un visiteur anglophone ne doit pas recevoir de français).
    const short =
      language === 'FR'
        ? { deposit: 'Apport', remaining: 'Reste', monthly: 'Mensualité', duration: 'Durée', final: 'Dernier versement' }
        : { deposit: 'Deposit', remaining: 'Remaining', monthly: 'Monthly', duration: 'Term', final: 'Final installment' };
    const finalLine = schedule.hasFinalBalance
      ? `\n- ${short.final} : ${schedule.lastPayment.toLocaleString()} €`
      : '';
    const msg = `${ui.simWaMsgPrefix}\n- ${short.deposit} : ${schedule.deposit.toLocaleString()} €\n- ${short.remaining} : ${schedule.remaining.toLocaleString()} €\n- ${short.monthly} : ${schedule.monthly} €${c.perMonthUnit}\n- ${short.duration} : ${schedule.duration} ${c.monthsUnit}.${finalLine}\n${ui.simWaMsgSuffix}`;
    openWhatsApp(settings, msg);
  };

  return (
    <section id="simulator-section" className="py-section px-5 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="bg-gradient-to-br from-primary to-[#003826] text-white rounded-card p-6 sm:p-10 md:p-12 shadow-elev-3 border border-secondary-fixed/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-fixed/5 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* Left Description & Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="font-mono text-micro font-bold uppercase tracking-widest text-secondary-fixed">
                {c.transparencyTag}
              </span>
              <h2 className="reveal font-serif text-h2 font-bold text-white">
                <RichText as="span" html={c.title} />
              </h2>
              <p className="text-xs sm:text-sm text-white/85 font-light leading-relaxed">
                <RichText as="span" html={c.description} />
              </p>
            </div>

            {/* Deposit Quick Tiers Buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary-fixed">
                {c.depositLabel}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  c.depositShortcut1 ?? base.depositShortcut1,
                  c.depositShortcut2 ?? base.depositShortcut2,
                  c.depositShortcut3 ?? base.depositShortcut3,
                  c.depositShortcut4 ?? base.depositShortcut4,
                ].map((amount, idx) => (
                  <button
                    key={amount}
                    onClick={() => setSimulatorDeposit(amount)}
                    className={`py-3 px-2 rounded-inner text-xs font-bold font-mono transition-all cursor-pointer text-center ${
                      simulatorDeposit === amount
                        ? 'bg-secondary-fixed text-primary shadow-elev-2 ring-2 ring-white/50'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {amount.toLocaleString()} €
                    <span className="block text-caption font-normal opacity-80 mt-0.5">
                      {idx === 0 ? c.depositBaseTag : c.depositFlexTag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Payment Choice */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold uppercase tracking-wider text-secondary-fixed">{c.monthlyLabel}</label>
                <span className="font-mono font-bold text-secondary-fixed bg-white/10 px-2.5 py-1 rounded-micro">
                  {simulatorMonthly} € {c.perMonthUnit}
                </span>
              </div>
              <input
                type="range"
                min="250"
                max="600"
                step="50"
                value={simulatorMonthly}
                onChange={(e) => setSimulatorMonthly(Number(e.target.value))}
                className="w-full tap-44 accent-secondary-fixed cursor-pointer h-2 bg-white/20 rounded-micro"
              />
              <div className="flex justify-between text-caption font-mono text-white/70">
                <span>250 € {c.perMonthUnit}</span>
                <span className="text-secondary-fixed font-bold">
                  300 € {c.perMonthUnit} {c.recommendedTag}
                </span>
                <span>600 € {c.perMonthUnit}</span>
              </div>
            </div>

            {/* Table of precalculated official options */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-caption text-white/70 block mb-2 font-mono">{c.gridLabel}</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/90">
                  <thead>
                    <tr className="border-b border-white/15 text-caption uppercase font-mono text-secondary-fixed">
                      <th className="pb-1.5">{c.colDepositLabel}</th>
                      <th className="pb-1.5">{c.colRemainingLabel}</th>
                      <th className="pb-1.5">{c.colMonthlyLabel}</th>
                      <th className="pb-1.5">{c.colDurationLabel}</th>
                      <th className="pb-1.5">{ui.simulatorColFinalBalance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-xs font-mono">
                    {tiers.map((tier, idx) => {
                      const row = tierSchedule(tier);
                      return (
                      /* Raccourci souris : la même sélection est déjà offerte au
                         clavier par les quatre boutons d'acompte ci-dessus. La
                         ligne ne prend donc pas `role="button"` (28px de haut,
                         sous le plancher tactile de 44px). */
                      <tr
                        key={idx}
                        onClick={() => setSimulatorDeposit(tier.deposit)}
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${
                          simulatorDeposit === tier.deposit ? 'bg-white/10 font-bold text-secondary-fixed' : ''
                        }`}
                      >
                        <td className="py-1.5">{row.deposit.toLocaleString()} €</td>
                        <td className="py-1.5">{row.remaining.toLocaleString()} €</td>
                        <td className="py-1.5">{row.monthly} €</td>
                        <td className="py-1.5 font-bold">
                          {row.duration} {c.monthsUnit}
                        </td>
                        <td className="py-1.5">
                          {row.hasFinalBalance ? `${row.lastPayment.toLocaleString()} €` : '—'}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Calculation Result Card */}
          <div className="lg:col-span-5 bg-white text-primary rounded-card p-6 sm:p-8 shadow-elev-3 border border-gray-200 space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <span className="text-micro font-mono font-bold uppercase tracking-wider text-secondary">
                {c.resultTag}
              </span>
              <h4 className="font-serif text-h3 font-bold text-primary mt-1">{c.resultTitle}</h4>
              <p className="text-xs text-on-surface-variant mt-0.5">{c.resultSubtitle}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                <span className="text-on-surface-variant">{c.refPriceLabel}</span>
                <span className="font-mono font-bold text-sm text-primary">
                  {settings.basePrice.toLocaleString()} €
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                <span className="text-on-surface-variant">{c.yourDepositLabel}</span>
                <span className="font-mono font-bold text-sm text-emerald-700">
                  {simulatorDeposit.toLocaleString()} €
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-gray-200">
                <span className="text-on-surface-variant">{c.remainingLabel}</span>
                <span className="font-mono font-bold text-sm text-primary">
                  {schedule.remaining.toLocaleString()} €
                </span>
              </div>

              <div className="flex justify-between items-center py-2 bg-surface-container-low px-3 rounded-micro">
                <span className="font-bold text-primary">{c.monthlyRowLabel}</span>
                <span className="font-mono font-bold text-base text-secondary">
                  {simulatorMonthly} € {c.perMonthUnit}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 bg-secondary/10 px-3 rounded-micro text-secondary">
                <span className="font-bold">{c.durationRowLabel}</span>
                <span className="font-mono font-bold text-base">
                  {schedule.duration > 0 ? `${schedule.duration} ${c.monthsUnit}` : '—'}
                </span>
              </div>

              {/* Le dernier versement est plus petit quand la division ne tombe
                  pas juste : l'afficher évite un produit mensualité × durée qui
                  dépasse le reste à payer. */}
              {schedule.hasFinalBalance && (
                <div className="flex justify-between items-center py-2 bg-surface-container-low px-3 rounded-micro">
                  <span className="font-bold text-primary">{ui.simulatorFinalBalance}</span>
                  <span className="font-mono font-bold text-base text-secondary">
                    {schedule.lastPayment.toLocaleString()} €
                  </span>
                </div>
              )}

              {formula && (
                <p className="text-caption font-mono text-on-surface-variant pt-1">
                  {ui.simulatorBreakdown} {formula}
                </p>
              )}
            </div>

            {/* Cash payment alternative pill */}
            <div className="p-3 rounded-inner bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <span className="font-bold block">{c.cashTitle}</span>
              <p
                className="text-caption text-amber-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: c.cashDesc
                    .replace('{cash}', `<strong>${settings.cashPrice.toLocaleString()} €</strong>`)
                    .replace('{full}', `${settings.basePrice.toLocaleString()} €`)
                    .replace('{saving}', `${(settings.basePrice - settings.cashPrice).toLocaleString()} €`),
                }}
              />
            </div>

            {/* Action Button: WhatsApp Study */}
            <button
              onClick={openWhatsAppSimulator}
              className="w-full py-4 bg-whatsapp hover:bg-[#128c4a] text-white font-bold text-xs sm:text-sm rounded-inner shadow-elev-2 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{c.studyCta}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
