/**
 * Échéancier d'un paiement échelonné.
 *
 * L'invariant tenu ici : `deposit + fullMonths * monthly + lastPayment === price`,
 * exactement et sans arrondi. Un simple `Math.ceil(reste / mensualité)` ne le
 * garantissait pas : le simulateur affichait « reste 11 000 € · 300 €/mois ·
 * 37 mois », dont le produit (11 100 €) dépassait le reste à payer, et deux des
 * quatre paliers contredisaient le « coût total 15 000 € » annoncé.
 *
 * La dernière mensualité est donc plus petite quand la division ne tombe pas
 * juste, et on l'expose au lieu de la dissimuler. Les montants sont des euros
 * entiers : la division est exacte, aucun arrondi n'est nécessaire.
 */
export interface PaymentSchedule {
  /** Acompte initial. */
  deposit: number;
  /** Reste à régler après l'acompte. */
  remaining: number;
  /** Mensualité pleine. */
  monthly: number;
  /** Nombre de versements au montant plein. */
  fullMonths: number;
  /** Dernier versement, plus petit que la mensualité (0 si la division tombe juste). */
  lastPayment: number;
  /** Nombre total de versements, dernier solde inclus. */
  duration: number;
  /** Vrai si le dernier versement est plus petit que la mensualité. */
  hasFinalBalance: boolean;
  /** Total réellement payé : acompte + versements. Égale le prix de référence. */
  total: number;
}

export const buildPaymentSchedule = (
  price: number,
  deposit: number,
  monthly: number
): PaymentSchedule => {
  const safeDeposit = Math.max(0, deposit);
  const remaining = Math.max(0, price - safeDeposit);
  const safeMonthly = monthly > 0 ? monthly : 0;

  // Acompte couvrant déjà le prix, ou mensualité inexploitable : rien à
  // échelonner. `duration` vaut alors 0, que l'appelant affiche « — » : mieux
  // vaut dire qu'il n'y a pas d'échéancier que d'annoncer « 0 mois » face à une
  // mensualité.
  if (remaining === 0 || safeMonthly === 0) {
    return {
      deposit: safeDeposit,
      remaining,
      monthly: safeMonthly,
      fullMonths: 0,
      lastPayment: 0,
      duration: 0,
      hasFinalBalance: false,
      total: safeDeposit + remaining,
    };
  }

  const fullMonths = Math.floor(remaining / safeMonthly);
  const remainder = remaining - fullMonths * safeMonthly;
  const hasFinalBalance = remainder > 0;

  return {
    deposit: safeDeposit,
    remaining,
    monthly: safeMonthly,
    fullMonths,
    lastPayment: hasFinalBalance ? remainder : 0,
    duration: hasFinalBalance ? fullMonths + 1 : fullMonths,
    hasFinalBalance,
    total: safeDeposit + fullMonths * safeMonthly + (hasFinalBalance ? remainder : 0),
  };
};

/**
 * Échéancier d'un **lot** : son prix est la seule entrée qui le distingue du lot
 * type, l'acompte et la mensualité restant ceux du site. Un acompte plus élevé
 * que le prix est ramené à ce prix : la fiche ne doit pas proposer de verser
 * plus cher que la parcelle elle-même.
 *
 * Écrit une seule fois : la fiche du lot, l'infobulle du plan cadastral, la
 * fiche PDF et l'Espace Gérant l'appellent, sinon quatre échéanciers différents
 * décriraient le même lot.
 */
export const buildParcelSchedule = (
  price: number,
  settings: { defaultDeposit: number; defaultMonthly: number }
): PaymentSchedule =>
  buildPaymentSchedule(
    price,
    Math.min(settings.defaultDeposit, price),
    settings.defaultMonthly
  );

/**
 * Verdict d'une paire de prix saisie dans l'Espace Gérant.
 *
 * Même forme que `SyncResult` (`{ ok, raison }`) plutôt qu'une union
 * discriminée : le `tsconfig` du projet n'active pas `strictNullChecks`, et la
 * réduction de type sur un discriminant booléen n'y fonctionne pas — `if
 * (!verdict.ok)` laisserait `verdict.error` inaccessible.
 */
export interface PriceValidation {
  ok: boolean;
  /** Message affichable sous les champs quand `ok` est faux. */
  error?: string;
}

/**
 * Valide le prix échelonné et le prix comptant d'un lot.
 *
 * Le comptant doit rester **sous** le prix échelonné : au-dessus, la remise
 * (« prix échelonné − comptant ») devient négative et la fiche annoncerait une
 * pénalité déguisée en remise. On exige aussi des euros entiers : les montants
 * du site sont affichés sans centimes, un prix à 15 000,50 € ne se lirait
 * nulle part tel qu'il a été saisi.
 */
export const validateParcelPrices = (price: number, cashPrice: number): PriceValidation => {
  const euros = (value: number) => `${value.toLocaleString('fr-FR')} €`;

  if (!Number.isInteger(price) || price <= 0) {
    return { ok: false, error: 'Prix échelonné invalide : un montant entier en euros est attendu.' };
  }
  if (!Number.isInteger(cashPrice) || cashPrice <= 0) {
    return { ok: false, error: 'Prix comptant invalide : un montant entier en euros est attendu.' };
  }
  if (cashPrice > price) {
    return {
      ok: false,
      error:
        `Prix comptant (${euros(cashPrice)}) supérieur au prix échelonné (${euros(price)}) : ` +
        'la remise affichée deviendrait négative.',
    };
  }
  return { ok: true };
};

/**
 * Formule vérifiable de l'échéancier, ex. « 36 × 300 € + 200 € = 11 000 € ».
 * Affichée à côté du plan de paiement : le lecteur peut poser l'opération.
 */
export const scheduleFormula = (schedule: PaymentSchedule): string => {
  const euros = (value: number) => `${value.toLocaleString()} €`;
  if (schedule.remaining === 0 || schedule.monthly === 0) return '';
  return schedule.hasFinalBalance
    ? `${schedule.fullMonths} × ${euros(schedule.monthly)} + ${euros(schedule.lastPayment)} = ${euros(schedule.remaining)}`
    : `${schedule.duration} × ${euros(schedule.monthly)} = ${euros(schedule.remaining)}`;
};
