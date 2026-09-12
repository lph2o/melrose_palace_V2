import { motion } from 'motion/react';
import { VideoItemContent } from '../sections/VideoSection';
import PremiumVideoPlayer from './PremiumVideoPlayer';
import { RichText } from './RichText';

// Cubic-bezier shared with the rest of the site's motion choreography.
const EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * Vitrine vidéo du site (bloc Puck « Vidéos »).
 *
 * Reçoit des items **déjà résolus par langue** (la résolution FR/EN se fait
 * dans `VideoSection`/`defaultVideosContent`, comme pour les autres blocs) et
 * un en-tête éditable. Repli : `header`/`items` vides ou absents retombent sur
 * les valeurs par défaut du site.
 */
export default function VideoShowcase({
  header,
  items,
}: {
  header?: { sectionTag?: string; title?: string; description?: string };
  items?: VideoItemContent[];
}) {
  const sectionTag = header?.sectionTag || 'EN VIDÉO';
  const title = header?.title || 'Découvrez le Domaine en Vidéo';
  const description =
    header?.description ||
    'Deux films courts pour visualiser le domaine de Sébikhotane avant votre visite : vue aérienne complète et état réel du terrain.';

  return (
    <section
      id="videos"
      className="relative bg-[#0B0B0C] py-24 px-5 md:px-12 scroll-mt-20 overflow-x-clip"
    >
      {/* Subtle gold ambient glow, purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-[#FED65B]/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto space-y-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="inline-flex items-center rounded-full px-3 py-1 text-micro uppercase tracking-[0.2em] font-medium bg-white/5 text-[#FED65B] ring-1 ring-[#FED65B]/35">
            {sectionTag}
          </span>
          <h2 className="reveal font-serif text-h2 font-bold text-white">
            <RichText as="span" html={title} />
          </h2>
          <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
            <RichText as="span" html={description} />
          </p>
        </motion.div>

        {/* Video cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {(items ?? []).map((video, idx) => (
            <motion.article
              key={video.src || idx}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.8, ease: EASE, delay: idx * 0.12 }}
              className="group"
            >
              {/* Gold hairline shell — machined plate look */}
              <div className="rounded-card bg-white/[0.03] p-1.5 ring-1 ring-[#FED65B]/25 shadow-elev-3">
                <PremiumVideoPlayer
                  src={video.src}
                  poster={video.poster}
                  badgeLeft={video.badgeLeft}
                  ariaLabel={typeof video.title === 'string' ? video.title.replace(/<[^>]*>/g, '') : undefined}
                  className="aspect-video"
                />
                {/* Caption block */}
                <div className="px-3 pt-4 pb-3 space-y-1.5">
                  <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-snug">
                    <RichText as="span" html={video.title} />
                  </h3>
                  <p className="text-xs text-white/70 font-light leading-relaxed">
                    <RichText as="span" html={video.desc} />
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}