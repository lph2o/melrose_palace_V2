import VideoShowcase from '../components/VideoShowcase';
import { Language, SiteSettings } from '../types';
import { VIDEO_ITEMS } from '../data';
import { useSite } from '../site/SiteContext';

/**
 * Bloc Puck « Vidéos ».
 *
 * Contrairement aux autres blocs, il porte aussi ses **items** (src, poster,
 * badge, titre, description) : c'est l'équivalent vidéo du champ `imageField`
 * demandé par le chantier (upload de médias depuis l'éditeur). Les textes sont
 * résolus par langue (un JSON par langue), comme tous les autres blocs.
 *
 * Repli : tant qu'aucune édition n'a été publiée (ou champ vidé), les valeurs
 * viennent de `settings.content.videos` (Espace Gérant → Contenu → Vidéos).
 */

export interface VideoItemContent {
  src: string;
  poster: string;
  badgeLeft: string;
  title: string;
  desc: string;
}

export interface VideosContent {
  sectionTag: string;
  title: string;
  description: string;
  videos: VideoItemContent[];
}

export function defaultVideosContent(lang: Language, settings: SiteSettings): VideosContent {
  const items = settings.content?.videos ?? VIDEO_ITEMS;
  return {
    sectionTag: lang === 'FR' ? 'EN VIDÉO' : 'ON VIDEO',
    title: lang === 'FR' ? 'Découvrez le Domaine en Vidéo' : 'Discover the Estate on Video',
    description:
      lang === 'FR'
        ? 'Deux films courts pour visualiser le domaine de Sébikhotane avant votre visite : vue aérienne complète et état réel du terrain.'
        : 'Two short films to preview the Sébikhotane estate before your visit: a full aerial overview and the actual state of the land.',
    videos: items.map((v) => ({
      src: v.src,
      poster: v.poster,
      badgeLeft: v.badgeLeft[lang],
      title: v.title[lang],
      desc: v.desc[lang],
    })),
  };
}

export function VideoSection({ content }: { content?: Partial<VideosContent> }) {
  const { language, settings } = useSite();
  const base = defaultVideosContent(language, settings);
  const c: VideosContent = {
    ...base,
    ...content,
    // Même convention que les autres listes : un tableau vidé retombe sur le défaut.
    videos: content?.videos?.length ? content.videos : base.videos,
  };

  return (
    <VideoShowcase
      header={{
        sectionTag: c.sectionTag,
        title: c.title,
        description: c.description,
      }}
      items={c.videos}
    />
  );
}