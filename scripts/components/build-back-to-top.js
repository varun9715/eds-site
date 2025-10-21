// eslint-disable-next-line import/no-cycle
import { fetchLanguagePlaceholders } from '../scripts.js';
import { createElementWithClasses } from '../utils/dom.js';
import { getMainContentId } from '../utils/common-utils.js';
import { EVENT_NAME, triggerBackToTopClickEvent } from '../martech/datalayer.js';

export default async function buildBackToTopLink() {
  const placeholder = await fetchLanguagePlaceholders();
  if (!placeholder || Object.keys(placeholder).length === 0) return null;
  const { globalBackToTop } = placeholder;

  const anchorElement = createElementWithClasses('a', 'back-to-top-link');
  const mainContentId = getMainContentId();
  anchorElement.href = `#${mainContentId}`;
  anchorElement.classList.add('body-02');
  anchorElement.textContent = globalBackToTop;

  anchorElement.setAttribute('data-wae-event', EVENT_NAME.BACK_TO_TOP_CLICK);
  anchorElement.addEventListener('click', triggerBackToTopClickEvent);
  return anchorElement;
}
