import { createElementWithClasses } from '../../scripts/utils/dom.js';
import buildNavList from './build-inpage-navlinks.js';
import { fetchLanguagePlaceholders, moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return;

  const { inPageNavHeading, globalShowLess, globalShowMore } = placeholder;

  // Replace the current block with a real <nav> element
  const nav = createElementWithClasses('nav', 'in-page-nav');
  nav.setAttribute('id', 'in-page-nav');
  nav.setAttribute('aria-labelledby', 'page-nav-heading');

  // Heading
  const heading = createElementWithClasses('h2', 'nav-heading', 'title-01');
  heading.setAttribute('id', 'page-nav-heading');
  heading.textContent = inPageNavHeading;
  nav.appendChild(heading);

  // Nav list wrapper
  const navLinksWrapper = createElementWithClasses('div', 'nav-links-wrapper');
  const navList = createElementWithClasses('ul', 'nav-list');
  navList.classList.add('nav-list');
  navLinksWrapper.appendChild(navList);
  nav.appendChild(navLinksWrapper);

  // Toggle Button
  const toggleButton = createElementWithClasses('button', 'show-more-button');
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-label', globalShowMore);
  const labelSpan = createElementWithClasses('span', 'label', 'body-01');
  labelSpan.textContent = globalShowMore;
  toggleButton.dataset.showMore = globalShowMore;
  toggleButton.dataset.showLess = globalShowLess;

  const chevronSpan = createElementWithClasses('span', 'chevron', 'chevron-down', 'icon');
  chevronSpan.setAttribute('aria-hidden', 'true');

  toggleButton.appendChild(labelSpan);
  toggleButton.appendChild(chevronSpan);
  nav.appendChild(toggleButton);

  // Pick attributes from block ele and assign to nav
  moveInstrumentation(block, nav);

  // Replace the original block with the new <nav> element
  block.replaceWith(nav);

  // Build the nav list
  buildNavList(nav.closest('main') || document);
}
