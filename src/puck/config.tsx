import type { Config, Data } from '@puckeditor/core';
import { Language, SiteSettings } from '../types';
import { SECTION_ICONS } from '../sections/icons';
import { HERO_IMAGE_FALLBACK, HeroSection, defaultHeroContent, HeroContent } from '../sections/HeroSection';
import {
  GuaranteesSection,
  defaultGuaranteesContent,
  GuaranteesContent,
} from '../sections/GuaranteesSection';
import { AERIAL_IMAGE_FALLBACK, VisionSection, defaultVisionContent, VisionContent } from '../sections/VisionSection';
import { VideoSection, VideosContent, defaultVideosContent } from '../sections/VideoSection';
import { LocationSection, defaultLocationContent, LocationContent } from '../sections/LocationSection';
import {
  SimulatorSection,
  defaultSimulatorContent,
  SimulatorContent,
} from '../sections/SimulatorSection';
import { PacksSection, defaultPacksContent, PacksContent } from '../sections/PacksSection';
import { BankingSection, defaultBankingContent, BankingContent } from '../sections/BankingSection';
import {
  TestimonialsSection,
  defaultTestimonialsContent,
  TestimonialsContent,
} from '../sections/TestimonialsSection';
import { InsightsSection, defaultInsightsContent, InsightsContent } from '../sections/InsightsSection';
import { FaqSection, defaultFaqContent, FaqContent } from '../sections/FaqSection';
import { ContactSection, defaultContactContent, ContactContent } from '../sections/ContactSection';
import { imageField, videoField } from './MediaField';

/* ------------------------------------------------------------------ */
/* Raccourcis de champs (le panneau de props est verbeux par nature)   */
/* ------------------------------------------------------------------ */

const t = (label: string) => ({ type: 'text' as const, label });
const ta = (label: string) => ({ type: 'textarea' as const, label });
const n = (label: string) => ({ type: 'number' as const, label });

/** Options du sélecteur d'icône, dérivées du registre `SECTION_ICONS`. */
const ICON_OPTIONS = Object.keys(SECTION_ICONS).map((name) => ({ label: name, value: name }));

/* ------------------------------------------------------------------ */
/* Blocs éditables                                                     */
/* ------------------------------------------------------------------ */

/**
 * Chaque bloc expose un unique champ objet `content` : la section le reçoit
 * via `<XSection content={content} />`. Deux conséquences voulues :
 *   - le canevas Puck affiche la *vraie* section (même composant que le site) ;
 *   - un champ absent ou vide fait retomber la section sur sa valeur de repli
 *     issue de `TRANSLATIONS` / `settings`.
 *
 * Les listes déjà pilotées par l'Espace Gérant (packs, FAQ, témoignages,
 * articles, tarifs, connectivité, vidéos) ne sont PAS dupliquées ici : voir
 * `.agents/skills/puck-editor-parcelles/SKILL.md`.
 */
export const puckConfig: Config = {
  components: {
    Hero: {
      label: 'Hero (bannière principale)',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            badge: t('Badge projet'),
            title: t('Titre (début)'),
            titleHighlight: t('Titre (partie mise en avant)'),
            subMessage: t('Accroche secondaire'),
            description: ta('Paragraphe de description'),
            bullet1: t('Puce 1'),
            bullet2: t('Puce 2'),
            bullet3: t('Puce 3'),
            exploreCta: t('Bouton « Explorer le plan »'),
            simulateCta: t('Bouton « Simuler »'),
            brochureCta: t('Bouton plaquette PDF'),
            image: imageField('Image de fond'),
            imageAlt: t('Texte alternatif de l’image (accessibilité)'),
            accentColor: t('Couleur d’accent (hex, ex. #FED65B — vide = doré)'),
            stats: {
              type: 'array',
              label: 'Cartes chiffres clés',
              arrayFields: {
                value: t('Valeur'),
                unit: t('Unité'),
                title: t('Libellé'),
                subtitle: t('Sous-titre'),
              },
              defaultItemProps: { value: '', unit: '', title: '', subtitle: '' },
              getItemSummary: (item: { title?: string }) => item?.title || 'Carte',
            },
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <HeroSection content={props.content as Partial<HeroContent>} />,
    },

    Garanties: {
      label: 'Garanties & sécurisation',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            commitmentTitle: t('Engagement — titre'),
            commitmentDesc: t('Engagement — description'),
            verifyCta: t('Bouton « Vérifier les documents »'),
            accentColor: t('Couleur d’accent (hex — vide = doré)'),
            points: {
              type: 'array',
              label: 'Points de garantie',
              arrayFields: { title: t('Titre'), desc: ta('Description') },
              defaultItemProps: { title: '', desc: '' },
              getItemSummary: (item: { title?: string }) => item?.title || 'Point',
            },
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <GuaranteesSection content={props.content as Partial<GuaranteesContent>} />,
    },

    Vision: {
      label: 'Vision & orthophoto',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            image: imageField('Vue aérienne'),
            imageAlt: t('Texte alternatif de l’image (accessibilité)'),
            overlayBadge: t('Carte — badge mode orthophoto'),
            planBadge: t('Carte — badge mode plan cadastral'),
            viewDroneLabel: t('Carte — libellé « Vue Drone »'),
            viewPlanLabel: t('Carte — libellé « Plan 2D »'),
            certifiedBadge: t('Carte — badge certifié'),
            domainName: t('Carte — nom du domaine'),
            dashedLegend: t('Carte — légende pointillés'),
            explorePlanCta: t('Carte — bouton « Explorer le Plan »'),
            pillars: {
              type: 'array',
              label: '4 piliers',
              arrayFields: {
                icon: { type: 'select', label: 'Icône', options: ICON_OPTIONS },
                title: t('Titre'),
                desc: ta('Description'),
              },
              defaultItemProps: { icon: 'CheckCircle', title: '', desc: '' },
              getItemSummary: (item: { title?: string }) => item?.title || 'Pilier',
            },
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <VisionSection content={props.content as Partial<VisionContent>} />,
    },

    Videos: {
      label: 'Vidéos du domaine',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            videos: {
              type: 'array',
              label: 'Vidéos',
              arrayFields: {
                src: videoField('Fichier vidéo (mp4)'),
                poster: imageField('Poster (image)'),
                badgeLeft: t('Badge sur la vidéo'),
                title: t('Titre de la carte'),
                desc: ta('Description de la carte'),
              },
              defaultItemProps: { src: '', poster: '', badgeLeft: '', title: '', desc: '' },
              getItemSummary: (item: { title?: string }) => item?.title || 'Vidéo',
            },
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <VideoSection content={props.content as Partial<VideosContent>} />,
    },

    Localisation: {
      label: 'Localisation stratégique',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            cardTag: t('Carte — sur-titre'),
            regionPill: t('Carte — pastille région'),
            triangleTitle: t('Carte — titre'),
            triangleDesc: ta('Carte — description (balises <strong> acceptées)'),
            distancesFootnote: t('Carte — note de bas'),
            requestPlanCta: t('Lien « Demander le plan »'),
            aibdTitle: t('Infra — Aéroport AIBD'),
            aibdSub: t('Infra — AIBD sous-titre'),
            terTitle: t('Infra — Gare TER'),
            terSub: t('Infra — TER sous-titre'),
            diamniadioTitle: t('Infra — Pôle Diamniadio'),
            diamniadioSub: t('Infra — Diamniadio sous-titre'),
            ndayaneTitle: t('Infra — Port de Ndayane'),
            ndayaneSub: t('Infra — Ndayane sous-titre'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <LocationSection content={props.content as Partial<LocationContent>} />,
    },

    Simulateur: {
      label: 'Simulateur de financement',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            transparencyTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            depositLabel: t('Libellé « apport »'),
            monthlyLabel: t('Libellé « mensualité »'),
            gridLabel: t('Libellé « grille de référence »'),
            resultTag: t('Résultat — sur-titre'),
            resultTitle: t('Résultat — titre'),
            resultSubtitle: t('Résultat — sous-titre'),
            refPriceLabel: t('Ligne « prix de référence »'),
            yourDepositLabel: t('Ligne « votre apport »'),
            remainingLabel: t('Ligne « reste à régler »'),
            monthlyRowLabel: t('Ligne « mensualité »'),
            durationRowLabel: t('Ligne « durée »'),
            cashTitle: t('Paiement comptant — titre'),
            cashDesc: ta('Paiement comptant — description ({cash}, {full}, {saving})'),
            studyCta: t('Bouton WhatsApp'),
            colDepositLabel: t('Tableau — colonne « Acompte »'),
            colRemainingLabel: t('Tableau — colonne « Reste à régler »'),
            colMonthlyLabel: t('Tableau — colonne « Mensualité »'),
            colDurationLabel: t('Tableau — colonne « Durée »'),
            depositBaseTag: t('Palier 1 — sous-titre (apport de base)'),
            depositFlexTag: t('Paliers 2-4 — sous-titre (option flexible)'),
            perMonthUnit: t('Unité « / mois »'),
            recommendedTag: t('Mention « (Recommandé) »'),
            monthsUnit: t('Unité « mois » (durée)'),
            depositShortcut1: n('Palier d’apport rapide 1 (€)'),
            depositShortcut2: n('Palier d’apport rapide 2 (€)'),
            depositShortcut3: n('Palier d’apport rapide 3 (€)'),
            depositShortcut4: n('Palier d’apport rapide 4 (€)'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <SimulatorSection content={props.content as Partial<SimulatorContent>} />,
    },

    Packs: {
      label: 'Packs complémentaires',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu de l’en-tête',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            includedLabel: t('Libellé « inclus »'),
            learnMoreCta: t('Bouton par pack'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <PacksSection content={props.content as Partial<PacksContent>} />,
    },

    Banque: {
      label: 'Financement bancaire',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            title: t('Titre'),
            description: ta('Description'),
            disclaimer: ta('Avertissement'),
            cta: t('Bouton'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <BankingSection content={props.content as Partial<BankingContent>} />,
    },

    Temoignages: {
      label: 'Témoignages',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu de l’en-tête',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <TestimonialsSection content={props.content as Partial<TestimonialsContent>} />,
    },

    Articles: {
      label: 'Articles & guides',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu de l’en-tête',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            readGuideCta: t('Libellé « lire le guide »'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <InsightsSection content={props.content as Partial<InsightsContent>} />,
    },

    FAQ: {
      label: 'FAQ',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu de l’en-tête',
          objectFields: {
            sectionTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <FaqSection content={props.content as Partial<FaqContent>} />,
    },

    Contact: {
      label: 'Contact & dossier',
      fields: {
        content: {
          type: 'object',
          label: 'Contenu',
          objectFields: {
            advisorTag: t('Sur-titre'),
            title: t('Titre'),
            description: ta('Description'),
            directLineLabel: t('Libellé téléphone'),
            whatsappLabel: t('Libellé WhatsApp'),
            whatsappDirectCta: t('Lien WhatsApp direct'),
            emailLabel: t('Libellé e-mail'),
            officeLabel: t('Libellé bureau'),
            brochureCta: t('Bouton plaquette'),
            formTitle: t('Formulaire — titre'),
            formDesc: t('Formulaire — description'),
            formName: t('Champ nom'),
            formPhone: t('Champ téléphone'),
            formEmail: t('Champ e-mail'),
            formInterest: t('Champ intérêt'),
            formMessage: t('Champ message'),
            formSubmit: t('Bouton d’envoi'),
            formSubmitLoading: t('Bouton d’envoi (chargement)'),
            formReset: t('Lien « nouvelle demande »'),
            placeholderName: t('Placeholder nom'),
            placeholderPhone: t('Placeholder téléphone'),
            placeholderEmail: t('Placeholder e-mail'),
            placeholderMessage: t('Placeholder message'),
            successTitle: t('Succès — titre'),
            successMessage: ta('Succès — message'),
            interestOptions: {
              type: 'array',
              label: 'Options du menu « intérêt »',
              arrayFields: { label: t('Libellé affiché'), value: t('Valeur enregistrée') },
              defaultItemProps: { label: '', value: '' },
              getItemSummary: (item: { label?: string }) => item?.label || 'Option',
            },
          },
        },
      },
      defaultProps: { content: {} },
      render: (props) => <ContactSection content={props.content as Partial<ContactContent>} />,
    },
  },

  root: {
    fields: {},
    defaultProps: {},
    render: (props) => <div>{props.children}</div>,
  },
};

/* ------------------------------------------------------------------ */
/* Données par défaut (contenu actuel du site) et identifiants          */
/* ------------------------------------------------------------------ */

/** Identifiant de la ligne `puck_pages` pour une langue (une page = une langue). */
export function puckPageId(lang: Language): string {
  return `home-${lang.toLowerCase()}`;
}

/**
 * Composition par défaut de la page d'accueil.
 *
 * Reproduit à l'identique l'ordre et le contenu actuels du site. C'est à la fois
 *   - le contenu servi tant qu'aucune édition n'a été enregistrée (repli), et
 *   - le point de départ du canevas `/admin/editor` avant la première publication.
 *
 * ⚠️ Chaque item DOIT porter un `props.id` (contrat Puck `WithId`) :
 *   - `<Puck />` s'en sert comme clé de son index interne — sans id, l'éditeur
 *     plante à l'ouverture (`Cannot read properties of null (reading 'position')`)
 *     dès que l'admin est connecté ;
 *   - `<Render />` s'en sert comme clé React (sinon avertissement de clé).
 * On utilise des ids déterministes dérivés du type de bloc : stables d'un rendu
 * à l'autre, lisibles, et sans collision avec les uuid générés par Puck quand
 * l'admin ajoute/duplique des blocs.
 */
export function buildDefaultPage(lang: Language, settings: SiteSettings): Data {
  const defaultId = (type: string) => `${type.toLowerCase()}-default`;

  return {
    root: { props: {} },
    content: [
      { type: 'Hero', props: { id: defaultId('Hero'), content: defaultHeroContent(lang, settings) } },
      { type: 'Garanties', props: { id: defaultId('Garanties'), content: defaultGuaranteesContent(lang, settings) } },
      { type: 'Vision', props: { id: defaultId('Vision'), content: defaultVisionContent(lang, settings) } },
      { type: 'Videos', props: { id: defaultId('Videos'), content: defaultVideosContent(lang, settings) } },
      { type: 'Localisation', props: { id: defaultId('Localisation'), content: defaultLocationContent(lang, settings) } },
      { type: 'Simulateur', props: { id: defaultId('Simulateur'), content: defaultSimulatorContent(lang, settings) } },
      { type: 'Packs', props: { id: defaultId('Packs'), content: defaultPacksContent(lang, settings) } },
      { type: 'Banque', props: { id: defaultId('Banque'), content: defaultBankingContent(lang, settings) } },
      { type: 'Temoignages', props: { id: defaultId('Temoignages'), content: defaultTestimonialsContent(lang, settings) } },
      { type: 'Articles', props: { id: defaultId('Articles'), content: defaultInsightsContent(lang, settings) } },
      { type: 'FAQ', props: { id: defaultId('FAQ'), content: defaultFaqContent(lang, settings) } },
      { type: 'Contact', props: { id: defaultId('Contact'), content: defaultContactContent(lang, settings) } },
    ],
  };
}

/**
 * Garantit que chaque item de composition porte un `props.id` (contrat Puck
 * `WithId`). Filet de sécurité pour les compositions publiées avant que les ids
 * par défaut n'existent : sans id, `<Puck />` plante à l'ouverture.
 */
export function ensureItemIds(data: Data): Data {
  const content = Array.isArray(data?.content) ? data.content : [];
  return {
    ...data,
    content: content.map((item, index) => {
      const props = (item?.props ?? {}) as Record<string, unknown>;
      if (typeof props.id === 'string' && props.id) return item;
      const type = typeof item?.type === 'string' ? item.type : 'block';
      return { ...item, props: { ...props, id: `${type.toLowerCase()}-${index}` } };
    }),
  };
}

/** Images de repli utilisées par le seed par défaut (exportées pour l'éditeur). */
export const DEFAULT_PUCK_IMAGES = { hero: HERO_IMAGE_FALLBACK, aerial: AERIAL_IMAGE_FALLBACK };

export type PuckConfig = typeof puckConfig;
