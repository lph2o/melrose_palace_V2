/**
 * Apparition au scroll, globale et unique.
 *
 * Un seul `IntersectionObserver` pour tout le site : les éléments portant la
 * classe `.reveal` (définie dans `src/index.css`) passent en `is-in` quand ils
 * entrent dans le viewport, puis sont oubliés (aucun travail en continu).
 *
 * Un `MutationObserver` reprend les éléments ajoutés après coup — c'est
 * indispensable ici, le corps de page étant rendu par Puck et remplacé à
 * chaque changement de langue ou de composition.
 *
 * On n'utilise **pas** `window.addEventListener('scroll')` : il déclenche un
 * reflow continu et fait chuter les performances sur mobile.
 */
export function initScrollReveal(): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );

  let raf = 0;
  const scan = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => observer.observe(el));
    });
  };

  // Les éléments ne deviennent masqués qu'à partir d'ici : sans JavaScript
  // (ou si ce module ne s'exécute pas), le contenu reste lisible.
  document.documentElement.classList.add('reveal-ready');

  scan();
  const mutations = new MutationObserver(scan);
  mutations.observe(document.body, { childList: true, subtree: true });

  return () => {
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    mutations.disconnect();
  };
}
