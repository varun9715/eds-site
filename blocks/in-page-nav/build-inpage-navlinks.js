import { createElementWithClasses } from '../../scripts/utils/dom.js';

function setupShowMoreCollapse(nav, showButton) {
  const showMoreText = showButton.dataset.showMore;
  const showLessText = showButton.dataset.showLess;

  showButton.onclick = () => {
    const expanded = nav.classList.toggle('expanded');
    const label = showButton.querySelector('.label');
    const nextText = expanded ? showLessText : showMoreText;

    if (label) label.textContent = nextText;
    showButton.setAttribute('aria-label', `${nextText} button`);
    showButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  };
}

const MAX_VISIBLE_ITEMS = 5;

export default function buildNavList(main = document) {
  const sections = main.querySelectorAll('.section[data-anchor-section-url]');
  const nav = main.querySelector('.in-page-nav');
  const list = nav?.querySelector('.nav-list');
  const showButton = nav?.querySelector('.show-more-button');

  if (!nav || !list || !showButton) return;

  list.innerHTML = '';

  sections.forEach((section) => {
    const isExcluded = section.dataset?.excludeFromAnchorLink;
    const navId = section.getAttribute('data-anchor-section-url')?.trim();
    let label = section.getAttribute('data-anchor-link-text')?.trim();

    if (!navId || !section.id || isExcluded === 'true') return;

    if (!label) {
      const heading = section.querySelector('.default-content-wrapper > h2');
      label = heading?.textContent?.trim() || '';
    }

    if (!label) return;

    const li = createElementWithClasses('li');
    const link = createElementWithClasses('a', 'nav-link', 'body-01');
    link.href = `#${section.id}`;
    link.textContent = label;
    li.appendChild(link);
    list.appendChild(li);
  });
  const updateToggleVisibility = () => {
    const isMobile = window.matchMedia('(max-width: 35.4375rem)').matches;
    const visibleItems = list.querySelectorAll('li').length;
    const shouldShow = isMobile && visibleItems > MAX_VISIBLE_ITEMS;

    showButton.style.display = shouldShow ? 'inline-flex' : 'none';
  };

  const onHeadingFocusOut = (event) => {
    const heading = event.target;
    heading.removeAttribute('tabindex');
    heading.removeEventListener('blur', onHeadingFocusOut);
  };

  setupShowMoreCollapse(nav, showButton);
  updateToggleVisibility();
  window.addEventListener('resize', updateToggleVisibility);
  // Add accessibility focus behavior
  document.querySelectorAll('.in-page-nav a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function handleAnchorClick() {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const targetId = this.getAttribute('href').substring(1);
      const section = document.getElementById(targetId);

      if (section) {
        section.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        const heading = section.querySelector('h2, h3, h4, h5, h6');
        if (heading) {
          setTimeout(() => {
            heading.setAttribute('tabindex', '-1');
            heading.focus();
            heading.addEventListener('blur', onHeadingFocusOut);
          }, 0);
        }
      }
    });
  });
}
