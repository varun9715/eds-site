// eslint-disable-next-line import/no-cycle
import buildBackToTopLink from '../components/build-back-to-top.js';
import { createElementWithClasses } from '../utils/dom.js';

export default async function buildAnchorSection(main) {
  const sections = main.querySelectorAll('.section[data-anchor-section-url]');
  const backToTopLinkTemplate = await buildBackToTopLink();

  sections.forEach((section) => {
    const showBackToLink = section.getAttribute('data-show-back-to-link');
    const existingBackToTop = section.querySelector('.back-to-top-link');

    if (showBackToLink === 'true' && !existingBackToTop && backToTopLinkTemplate) {
      const backToTop = backToTopLinkTemplate.cloneNode(true);

      const anchorWrapper = createElementWithClasses('div', 'anchor-wrapper');
      anchorWrapper.appendChild(backToTop);
      section.appendChild(anchorWrapper);
    }
  });
}
