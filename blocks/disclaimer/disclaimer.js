import {
  promoteFirstChildIfExists,
  createElementWithClasses,
} from '../../scripts/utils/dom.js';
import decorateItem from './disclaimer-item.js';
import { isAuthorEditMode } from '../../scripts/utils/common-utils.js';

export default async function decorate(block) {
  const disclaimerChildren = [...block.children];
  const [disclaimerTitleEl, ...disclaimerItems] = disclaimerChildren;

  const wrapper = createElementWithClasses('div', 'disclaimer-wrapper');
  wrapper.setAttribute('data-nosnippet', '');

  const container = createElementWithClasses('div', 'disclaimer-container', 'caption');

  // Title
  if (disclaimerTitleEl) {
    const titleNode = promoteFirstChildIfExists(disclaimerTitleEl);
    if (titleNode.textContent && titleNode.textContent.trim()) {
      titleNode.classList.add('disclaimer-title');
      // Find the first heading tag (h1-h6) within titleNode and add classes
      const heading = titleNode.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) {
        heading.classList.add('disclaimer-heading', 'body-01');
      }
      wrapper.appendChild(titleNode);
    }
  }

  const disItems = await Promise.all(
    disclaimerItems.map(async (items, index) => decorateItem(items, index)),
  );

  container.append(...disItems);

  // Append container to wrapper
  wrapper.appendChild(container);

  // clear block HTML
  block.innerHTML = '';

  // hide disclaimers if not in author mode.
  if (!isAuthorEditMode()) {
    block.classList.add('disclaimer-hide');
  }

  // Append wrapper to block
  block.appendChild(wrapper);
}
